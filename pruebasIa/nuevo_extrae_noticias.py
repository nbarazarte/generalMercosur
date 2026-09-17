import csv
import json
import requests

# Endpoint oficial REST API de WordPress para la Bolsa de Caracas
API_URL = "https://www.bolsadecaracas.com/wp-json/wp/v2/posts"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

all_posts = []
page = 1
max_pages = 5  # Cambia esto al número de páginas que quieras extraer (o usa un loop continuo)

print("Iniciando descarga a través de la API REST de WordPress...")

while page <= max_pages:
    params = {
        "per_page": 100,  # Cantidad de noticias por página (máximo permitido por WP es 100)
        "page": page
    }
    
    response = requests.get(API_URL, headers=HEADERS, params=params)
    
    if response.status_code != 200:
        print(f"Fin de los datos o error en página {page} (Status: {response.status_code})")
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
            "categoria_ids": item.get("categories")
        })

    print(f"✓ Página {page} descargada ({len(posts)} noticias)")
    page += 1

# ---------------------------------------------------------
# Guardar en JSON
# ---------------------------------------------------------
with open("noticias_bvc_api.json", "w", encoding="utf-8") as f_json:
    json.dump(all_posts, f_json, ensure_ascii=False, indent=4)

# ---------------------------------------------------------
# Guardar en CSV
# ---------------------------------------------------------
#if all_posts:
#    with open("noticias_bvc_api.csv", "w", newline="", encoding="utf-8") as f_csv:
#        writer = csv.DictWriter(f_csv, fieldnames=["id", "fecha", "titulo", "enlace", "categoria_ids"])
#        writer.writeheader()
#        writer.writerows(all_posts)

print(f"\n¡Éxito! Se obtuvieron {len(all_posts)} noticias en total.")
