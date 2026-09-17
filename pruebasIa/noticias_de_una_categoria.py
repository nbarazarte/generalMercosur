import calendar
import json
import requests

API_URL = "https://www.bolsadecaracas.com/wp-json/wp/v2/posts"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# =========================================================
# PARÁMETROS DE CONFIGURACIÓN
# =========================================================
CATEGORIA_ID = 7   # Coloca aquí el ID de la categoría deseada
ANIO = 2026        # Año deseado (YYYY)
MES = 9            # Mes deseado (1 para Enero, 9 para Septiembre, etc.)
# =========================================================

# Calcular el último día del mes automáticamente
ultimo_dia = calendar.monthrange(ANIO, MES)[1]

# Definir rango de fechas en formato ISO 8601 correcto (YYYY-MM-DDTHH:MM:SS)
fecha_inicio = f"{ANIO:04d}-{MES:02d}-01T00:00:00"
fecha_fin = f"{ANIO:04d}-{MES:02d}-{ultimo_dia:02d}T23:59:59"

all_posts = []
page = 1

print(f"Descargando noticias...")
print(f"• Categoría ID: {CATEGORIA_ID}")
print(f"• Periodo: {MES:02d}/{ANIO}")
print(f"• Rango ISO: {fecha_inicio} a {fecha_fin}\n")

while True:
    params = {
        "categories": CATEGORIA_ID,
        "after": fecha_inicio,
        "before": fecha_fin,
        "per_page": 100,  # Máximo por página
        "page": page
    }
    
    response = requests.get(API_URL, headers=HEADERS, params=params)
    
    if response.status_code != 200:
        break
        
    posts = response.json()
    if not posts:
        break

    for item in posts:
        all_posts.append({
            "id": item.get("id"),
            "fecha": item.get("date"),
            "titulo": item.get("title", {}).get("rendered"),
            "enlace": item.get("link"),
            "contenido_html": item.get("content", {}).get("rendered"),
            "categoria_ids": item.get("categories")
        })

    print(f"✓ Página {page} obtenida ({len(posts)} entradas)")
    page += 1

# Definir nombre del archivo
nombre_archivo = f"noticias_cat{CATEGORIA_ID}_{ANIO}_{MES:02d}.json"

with open(nombre_archivo, "w", encoding="utf-8") as f:
    json.dump(all_posts, f, ensure_ascii=False, indent=4)

print(f"\nProceso finalizado. Se encontraron {len(all_posts)} noticias.")
print(f"Guardado en '{nombre_archivo}'.")
