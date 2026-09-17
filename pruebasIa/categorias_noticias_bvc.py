import json
import requests

CATEGORIES_URL = "https://www.bolsadecaracas.com/wp-json/wp/v2/categories"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

all_categories = []
page = 1

print("Obteniendo categorías de la Bolsa de Valores de Caracas...\n")

while True:
    params = {
        "per_page": 100,  # Obtener hasta 100 categorías por página
        "page": page
    }
    
    response = requests.get(CATEGORIES_URL, headers=HEADERS, params=params)
    
    if response.status_code != 200:
        break
        
    categories = response.json()
    if not categories:
        break

    for cat in categories:
        all_categories.append({
            "id": cat.get("id"),
            "nombre": cat.get("name"),
            "slug": cat.get("slug"),
            "total_posts": cat.get("count"),
            "parent_id": cat.get("parent")
        })

    page += 1

# Imprimir las categorías en consola
print(f"{'ID':<8} | {'Noticias':<10} | {'Nombre de la Categoría'}")
print("-" * 50)

for cat in sorted(all_categories, key=lambda x: x["id"]):
    print(f"{cat['id']:<8} | {cat['total_posts']:<10} | {cat['nombre']}")

# Guardar en archivo JSON por si necesitas revisarlo después
with open("categorias_bvc.json", "w", encoding="utf-8") as f:
    json.dump(all_categories, f, ensure_ascii=False, indent=4)

print(f"\nTotal de categorías encontradas: {len(all_categories)}")
print("Guardado en 'categorias_bvc.json'.")
