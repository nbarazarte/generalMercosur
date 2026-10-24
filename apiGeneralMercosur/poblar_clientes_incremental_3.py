import json
import logging
import time

import psycopg2
import requests

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


def limpiar_texto(valor):
    """Convierte a minúsculas y elimina espacios al principio y al final."""
    if valor is None:
        return None
    valor_str = str(valor).strip().lower()
    return valor_str if valor_str else None


def verificar_estructura_db(cursor):
    """Crea las dos tablas independientes y asegura las restricciones únicas para evitar duplicados."""
    logging.info("Verificando la estructura de las tablas en la base de datos...")
    cursor.execute(
        """
        CREATE SCHEMA IF NOT EXISTS tickets;

        -- Tabla para clientes naturales
        CREATE TABLE IF NOT EXISTS tickets.tbl_clientes_naturales (
            id SERIAL PRIMARY KEY,
            str_cedula VARCHAR(50) UNIQUE,
            str_nombre TEXT,
            str_apellido TEXT,
            str_telefono VARCHAR(50),
            str_email VARCHAR(255),
            fuentes JSONB,
            dmt_actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla para clientes jurídicos
        CREATE TABLE IF NOT EXISTS tickets.tbl_clientes_juridicos (
            id SERIAL PRIMARY KEY,
            str_rif VARCHAR(50) UNIQUE,
            str_razon_social TEXT,
            str_telefono VARCHAR(50),
            str_email VARCHAR(255),
            fuentes JSONB,
            dmt_actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
    )
    logging.info(
        "Tablas 'tbl_clientes_naturales' y 'tbl_clientes_juridicos' verificadas correctamente."
    )


def sincronizar_clientes_incremental():
    inicio_tiempo = time.time()
    token = obtener_token()
    headers = {"Authorization": f"Bearer {token}"}

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Verificar y crear estructura de tablas
        verificar_estructura_db(cursor)
        conn.commit()

        # Usamos por_pagina=todos para traer la data completa en una sola petición
        params = {"por_pagina": "todos"}
        logging.info("Consultando todos los registros desde la API...")

        response = requests.get(
            CLIENTES_URL, headers=headers, params=params, timeout=120
        )
        response.raise_for_status()
        resultado = response.json()

        registros = resultado.get("registros", [])
        if not registros:
            logging.warning("No se encontraron registros en la respuesta.")
            return

        tuplas_naturales = []
        tuplas_juridicas = []

        for reg in registros:
            tipo = limpiar_texto(reg.get("tipo"))

            if tipo == "natural":
                tuplas_naturales.append(
                    (
                        limpiar_texto(reg.get("cedula")),
                        limpiar_texto(reg.get("nombres")),
                        limpiar_texto(reg.get("apellidos")),
                        limpiar_texto(reg.get("telefono")),
                        limpiar_texto(reg.get("correo")),
                        json.dumps(reg.get("fuentes", [])),
                    )
                )
            elif tipo == "juridico":
                tuplas_juridicas.append(
                    (
                        limpiar_texto(reg.get("rif")),
                        limpiar_texto(reg.get("razon_social")),
                        limpiar_texto(reg.get("telefono")),
                        limpiar_texto(reg.get("correo")),
                        json.dumps(reg.get("fuentes", [])),
                    )
                )

        # Inserción masiva con UPSERT para Naturales (Evita duplicados y actualiza cambios)
        if tuplas_naturales:
            query_naturales = """
                INSERT INTO tickets.tbl_clientes_naturales
                (str_cedula, str_nombre, str_apellido, str_telefono, str_email, fuentes)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (str_cedula)
                DO UPDATE SET
                    str_nombre = EXCLUDED.str_nombre,
                    str_apellido = EXCLUDED.str_apellido,
                    str_telefono = EXCLUDED.str_telefono,
                    str_email = EXCLUDED.str_email,
                    fuentes = EXCLUDED.fuentes,
                    updated_at = CURRENT_TIMESTAMP;
            """
            cursor.executemany(query_naturales, tuplas_naturales)
            logging.info(
                f"Sincronizados {len(tuplas_naturales)} registros en tbl_clientes_naturales."
            )

        # Inserción masiva con UPSERT para Jurídicos (Evita duplicados y actualiza cambios)
        if tuplas_juridicas:
            query_juridicos = """
                INSERT INTO tickets.tbl_clientes_juridicos
                (str_rif, str_razon_social, str_telefono, str_email, fuentes)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (str_rif)
                DO UPDATE SET
                    str_razon_social = EXCLUDED.str_razon_social,
                    str_telefono = EXCLUDED.str_telefono,
                    str_email = EXCLUDED.str_email,
                    fuentes = EXCLUDED.fuentes,
                    dmt_actualizado_en = CURRENT_TIMESTAMP;
            """
            cursor.executemany(query_juridicos, tuplas_juridicas)
            logging.info(
                f"Sincronizados {len(tuplas_juridicas)} registros en tbl_clientes_juridicos."
            )

        conn.commit()

        duracion_segundos = time.time() - inicio_tiempo
        minutos, segundos = divmod(duracion_segundos, 60)
        logging.info("¡Sincronización completada exitosamente!")
        logging.info(
            f"Tiempo total: {int(minutos)}m {segundos:.2f}s ({duracion_segundos:.2f}"
            " segundos)."
        )

    except Exception as e:
        if "conn" in locals() and conn:
            conn.rollback()
        logging.error(f"Error en la sincronización: {e}")
    finally:
        if "cursor" in locals() and cursor:
            cursor.close()
        if "conn" in locals() and conn:
            conn.close()


if __name__ == "__main__":
    sincronizar_clientes_incremental()
