import json
import logging
import requests
import psycopg2
from psycopg2.extras import execute_values

# Configuración de logging para monitorear el progreso
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Configuración de Credenciales y Endpoints de la API
LOGIN_URL = "https://cm.mercosur.com.ve/auth/login"
CLIENTES_URL = "https://cm.mercosur.com.ve/consulta_clientes"
CREDENTIALS = {"email": "neel@mercosur.com.ve", "password": "987654321"}

# Configuración de la Base de Datos Local PostgreSQL
DB_CONFIG = {
    "dbname": "db_general_mercosur",
    "user": "postgres",
    "password": "1123581321",
    "host": "localhost",
    "port": 5432,
}


def obtener_token():
  """Autentica y obtiene el token Bearer."""
  logging.info("Autenticándose en el sistema...")
  try:
    response = requests.post(LOGIN_URL, json=CREDENTIALS, timeout=30)
    response.raise_for_status()
    data = response.json()
    token = data.get("access_token") or data.get("token")
    if not token:
      raise ValueError("No se encontró el token en la respuesta del login.")
    logging.info("Autenticación exitosa. Token obtenido.")
    return token
  except Exception as e:
    logging.error(f"Error en la autenticación: {e}")
    raise


def crear_tabla_si_no_existe(cursor):
  """Crea el esquema y la tabla tickets.tbl_clientes_admin si no existen."""
  cursor.execute(
      """
        CREATE SCHEMA IF NOT EXISTS tickets;

        CREATE TABLE IF NOT EXISTS tickets.tbl_clientes_admin (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50),
            rif VARCHAR(50) UNIQUE,
            razon_social TEXT,
            telefono VARCHAR(50),
            correo VARCHAR(255),
            fuentes JSONB,
            actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
  )
  logging.info("Esquema 'tickets' y tabla 'tbl_clientes_admin' verificados.")


def sincronizar_clientes():
  token = obtener_token()
  headers = {"Authorization": f"Bearer {token}"}

  try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Crear tabla y esquema si no existen
    crear_tabla_si_no_existe(cursor)
    conn.commit()

    por_pagina = 100  # Tamaño de lote configurado

    # --- LÓGICA DE REANUDACIÓN AUTOMÁTICA ---
    cursor.execute("SELECT COUNT(*) FROM tickets.tbl_clientes_admin;")
    total_guardados = cursor.fetchone()[0]

    if total_guardados > 0:
      # Retrocedemos una página por seguridad para asegurar que la última página se complete si quedó a medias
      pagina = max(1, (total_guardados // por_pagina))
      total_registros_procesados = (pagina - 1) * por_pagina
      logging.info(
          f"Se encontraron {total_guardados} registros previos en la base de"
          f" datos. Reanudando desde la página {pagina}..."
      )
    else:
      pagina = 1
      total_registros_procesados = 0
      logging.info("No se encontraron registros previos. Iniciando desde 0.")
    # ----------------------------------------

    while True:
      params = {"pagina": pagina, "por_pagina": por_pagina}
      logging.info(f"Consultando página {pagina}...")

      response = requests.get(
          CLIENTES_URL, headers=headers, params=params, timeout=60
      )
      response.raise_for_status()
      resultado = response.json()

      registros = resultado.get("registros", [])
      if not registros:
        break

      # Preparar datos para inserción masiva (Upsert basado en el RIF)
      tuplas = []
      for reg in registros:
        tuplas.append((
            reg.get("tipo"),
            reg.get("rif"),
            reg.get("razon_social"),
            reg.get("telefono"),
            reg.get("correo"),
            json.dumps(reg.get("fuentes", [])),
        ))

      query = """
                INSERT INTO tickets.tbl_clientes_admin (tipo, rif, razon_social, telefono, correo, fuentes)
                VALUES %s
                ON CONFLICT (rif) DO UPDATE SET
                    tipo = EXCLUDED.tipo,
                    razon_social = EXCLUDED.razon_social,
                    telefono = EXCLUDED.telefono,
                    correo = EXCLUDED.correo,
                    fuentes = EXCLUDED.fuentes,
                    actualizado_en = CURRENT_TIMESTAMP;
            """

      execute_values(cursor, query, tuplas)
      conn.commit()

      total_registros_procesados += len(registros)
      logging.info(
          f"Insertados/Actualizados acumulados ~{total_registros_procesados}"
          f" de {resultado.get('total_registros', 'N/A')} registros."
      )

      # Verificar si hay más páginas
      if not resultado.get("has_next", False):
        break

      pagina += 1

    logging.info("¡Sincronización de clientes completada exitosamente!")

  except Exception as e:
    if "conn" in locals() and conn:
      conn.rollback()
    logging.error(f"Ocurrió un error durante la sincronización: {e}")
  finally:
    if "cursor" in locals() and cursor:
      cursor.close()
    if "conn" in locals() and conn:
      conn.close()


if __name__ == "__main__":
  sincronizar_clientes()