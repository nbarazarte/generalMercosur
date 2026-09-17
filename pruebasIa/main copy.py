import os

os.environ["HF_HUB_OFFLINE"] = "1"  # Carga local sin consultar Hugging Face

from contextlib import asynccontextmanager
import json
from fastapi import FastAPI, HTTPException
import psycopg2
import requests
from sentence_transformers import SentenceTransformer

# Configuraciones
DB_CONFIG = "dbname=db_general_mercosur user=postgres password=1123581321 host=localhost port=5432"
OLLAMA_URL = "http://localhost:11434/api/generate"

# Diccionario global para mantener los modelos cargados en memoria RAM
recursos_globales = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
  # --- ESTO SE EJECUTA UNA SOLA VEZ AL INICIAR EL SERVIDOR ---
  print(" Cargando modelo de embeddings en memoria RAM...")
  recursos_globales["model_embed"] = SentenceTransformer(
      "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
  )
  print(" Modelo de embeddings cargado y listo para recibir peticiones.")
  yield
  # --- ESTO SE EJECUTA AL APAGAR EL SERVIDOR ---
  recursos_globales.clear()


app = FastAPI(
    title="API de Clasificación KCS",
    description="Servicio en ejecución permanente con modelo de embeddings cargado en memoria",
    lifespan=lifespan,
)


#@app.post("/procesar-ticket/{ticket_id}")
# Acepta solicitudes GET (navegador) y POST (código/curl)
@app.api_route(
    "/procesar-ticket/{ticket_id}", methods=["GET", "POST"]
)
def procesar_ticket(ticket_id: int):
  model_embed = recursos_globales["model_embed"]

  conn = psycopg2.connect(DB_CONFIG)
  cur = conn.cursor()

  try:
    # 1. Actualizar embeddings pendientes en KCS
    cur.execute(
        "SELECT id, str_titulo, str_contenido FROM kcs.tbl_kcs_articulos"
        " WHERE embedding IS NULL;"
    )
    articulos = cur.fetchall()

    for art_id, titulo, contenido in articulos:
      vector = model_embed.encode(f"{titulo}. {contenido}").tolist()
      cur.execute(
          "UPDATE kcs.tbl_kcs_articulos SET embedding = %s::vector WHERE id"
          " = %s;",
          (vector, art_id),
      )
    conn.commit()

    # 2. Consultar el Ticket solicitado
    cur.execute(
        "SELECT id, str_asunto, str_descripcion FROM tickets.tbl_tickets"
        " WHERE id = %s;",
        (ticket_id,),
    )
    ticket = cur.fetchone()

    if not ticket:
      raise HTTPException(
          status_code=404, detail=f"Ticket con ID {ticket_id} no encontrado"
      )

    t_id, asunto, descripcion = ticket

    # 3. Búsqueda Semántica con pgvector
    vector_ticket = model_embed.encode(f"{asunto}. {descripcion}").tolist()
    query_vectorial = """
        SELECT id, str_titulo, str_contenido 
        FROM kcs.tbl_kcs_articulos
        WHERE bol_activo = TRUE
        ORDER BY embedding <=> %s::vector ASC
        LIMIT 3;
    """
    cur.execute(query_vectorial, (vector_ticket,))
    candidatos = cur.fetchall()

    contexto_kcs = ""
    for c in candidatos:
      contexto_kcs += f"\n- [ID: {c[0]}] {c[1]}\n  Detalle: {c[2]}\n"

    # 4. Consultar Ollama
    prompt = f"""
    Eres un analista de soporte técnico. Analiza el ticket y selecciona el artículo KCS ideal.

    TICKET:
    - Asunto: {asunto}
    - Descripción: {descripcion}

    ARTÍCULOS KCS CANDIDATOS:
    {contexto_kcs}

    Responde ESTRICTAMENTE en JSON:
    {{
        "articulo_id_recomendado": ID_NUMERICO,
        "justificacion": "Breve explicación"
    }}
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "qwen2.5:7b-instruct",
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"num_predict": 150, "temperature": 0.1},
        },
    )

    resultado_ia = json.loads(response.json()["response"])
    articulo_elegido = resultado_ia.get("articulo_id_recomendado")

    # 5. Guardar relación
    if articulo_elegido:
      cur.execute(
          """
            INSERT INTO tickets.tbl_tickets_kcs_articulos (ticket_id, articulo_id, usuario_id)
            VALUES (%s, %s, 1)
            ON CONFLICT (ticket_id, articulo_id) DO NOTHING;
        """,
          (t_id, articulo_elegido),
      )
      conn.commit()

    return {
        "status": "exito",
        "ticket_id": t_id,
        "asunto": asunto,
        "recomendacion_ia": resultado_ia,
    }

  finally:
    cur.close()
    conn.close()
