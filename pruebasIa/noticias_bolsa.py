import csv
import json
import requests
from bs4 import BeautifulSoup

#url = "https://www.bolsadecaracas.com/bolsa-de-valores-de-caracas-hecho-de-importancia-ajuste-precio-teorico-dividendo-en-efectivo-del-titulo-crm-a-2/"
url = "https://www.bolsadecaracas.com/banco-del-caribe-c-a-banco-universal-bancaribe-hecho-de-importancia-dividendos-4/"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Extraer título
    title_el = soup.find("h1")
    title = title_el.get_text(strip=True) if title_el else "Título no encontrado"

    # Extraer contenido
    content_div = soup.find("div", class_="entry-content") or soup.find("article")
    if content_div:
        paragraphs = [p.get_text(strip=True) for p in content_div.find_all("p") if p.get_text(strip=True)]
        contenido = "\n\n".join(paragraphs)
    else:
        contenido = "Contenido no encontrado"

    # Estructura de datos a guardar
    data = {
        "url": url,
        "titulo": title,
        "contenido": contenido
    }

    # ---------------------------------------------------------
    # 1. Guardar en JSON
    # ---------------------------------------------------------
    with open("noticia_bolsa.json", "w", encoding="utf-8") as f_json:
        json.dump(data, f_json, ensure_ascii=False, indent=4)
    print("Datos guardados exitosamente en 'noticia_bolsa.json'")

    # ---------------------------------------------------------
    # 2. Guardar en CSV
    # ---------------------------------------------------------
    with open("noticia_bolsa.csv", "w", newline="", encoding="utf-8") as f_csv:
        writer = csv.DictWriter(f_csv, fieldnames=["url", "titulo", "contenido"])
        writer.writeheader()
        writer.writerow(data)
    print("Datos guardados exitosamente en 'noticia_bolsa.csv'")

except requests.exceptions.RequestException as e:
    print(f"Error al realizar la petición HTTP: {e}")
