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
    """Crea las tablas y asegura las restricciones únicas (con columnas TIMESTAMP WITHOUT TIME ZONE)."""
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
            dmt_actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla para clientes jurídicos
        CREATE TABLE IF NOT EXISTS tickets.tbl_clientes_juridicos (
            id SERIAL PRIMARY KEY,
            str_rif VARCHAR(50) UNIQUE,
            str_razon_social TEXT,
            str_telefono VARCHAR(50),
            str_email VARCHAR(255),
            fuentes JSONB,
            dmt_actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """
    )
    logging.info("Tablas verificadas correctamente.")


def obtener_clientes_existentes(cursor):
    """Carga los registros actuales de la BD en memoria para hacer comparaciones rápidas."""
    cursor.execute(
        "SELECT str_cedula, str_nombre, str_apellido, str_telefono, str_email, fuentes FROM tickets.tbl_clientes_naturales"
    )
    naturales_db = {}
    for row in cursor.fetchall():
        cedula = row[0]
        naturales_db[cedula] = {
            "str_nombre": row[1],
            "str_apellido": row[2],
            "str_telefono": row[3],
            "str_email": row[4],
            "fuentes": row[5],
        }

    cursor.execute(
        "SELECT str_rif, str_razon_social, str_telefono, str_email, fuentes FROM tickets.tbl_clientes_juridicos"
    )
    juridicos_db = {}
    for row in cursor.fetchall():
        rif = row[0]
        juridicos_db[rif] = {
            "str_razon_social": row[1],
            "str_telefono": row[2],
            "str_email": row[3],
            "fuentes": row[4],
        }

    return naturales_db, juridicos_db


def sincronizar_clientes_incremental():
    inicio_tiempo = time.time()
    token = obtener_token()
    headers = {"Authorization": f"Bearer {token}"}

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. Verificar y crear estructura si no existe
        verificar_estructura_db(cursor)
        conn.commit()

        # 2. Cargar estado actual de la BD
        naturales_db, juridicos_db = obtener_clientes_existentes(cursor)

        # 3. Consultar la API
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

        nuevos_naturales = []
        actualizar_naturales = []

        nuevos_juridicos = []
        actualizar_juridicos = []

        for reg in registros:
            tipo = limpiar_texto(reg.get("tipo"))

            if tipo == "natural":
                cedula = limpiar_texto(reg.get("cedula"))
                nombre = limpiar_texto(reg.get("nombres"))
                apellido = limpiar_texto(reg.get("apellidos"))
                telefono = limpiar_texto(reg.get("telefono"))
                correo = limpiar_texto(reg.get("correo"))
                fuentes_json = json.dumps(reg.get("fuentes", []))
                fuentes_dict = reg.get("fuentes", [])

                if not cedula:
                    continue

                if cedula not in naturales_db:
                    # Registro nuevo
                    nuevos_naturales.append(
                        (
                            cedula,
                            nombre,
                            apellido,
                            telefono,
                            correo,
                            fuentes_json,
                        )
                    )
                else:
                    # Registro existente -> Validar cambios
                    db_reg = naturales_db[cedula]
                    if (
                        db_reg["str_nombre"] != nombre
                        or db_reg["str_apellido"] != apellido
                        or db_reg["str_telefono"] != telefono
                        or db_reg["str_email"] != correo
                        or db_reg["fuentes"] != fuentes_dict
                    ):
                        actualizar_naturales.append(
                            (
                                nombre,
                                apellido,
                                telefono,
                                correo,
                                fuentes_json,
                                cedula,
                            )
                        )

            elif tipo == "juridico":
                rif = limpiar_texto(reg.get("rif"))
                razon_social = limpiar_texto(reg.get("razon_social"))
                telefono = limpiar_texto(reg.get("telefono"))
                correo = limpiar_texto(reg.get("correo"))
                fuentes_json = json.dumps(reg.get("fuentes", []))
                fuentes_dict = reg.get("fuentes", [])

                if not rif:
                    continue

                if rif not in juridicos_db:
                    # Registro nuevo
                    nuevos_juridicos.append(
                        (rif, razon_social, telefono, correo, fuentes_json)
                    )
                else:
                    # Registro existente -> Validar cambios
                    db_reg = juridicos_db[rif]
                    if (
                        db_reg["str_razon_social"] != razon_social
                        or db_reg["str_telefono"] != telefono
                        or db_reg["str_email"] != correo
                        or db_reg["fuentes"] != fuentes_dict
                    ):
                        actualizar_juridicos.append(
                            (
                                razon_social,
                                telefono,
                                correo,
                                fuentes_json,
                                rif,
                            )
                        )

        # 4. Insertar Nuevos (No inflará la secuencia SERIAL de forma masiva)
        if nuevos_naturales:
            query_ins_nat = """
                INSERT INTO tickets.tbl_clientes_naturales
                (str_cedula, str_nombre, str_apellido, str_telefono, str_email, fuentes, created_at, updated_at, dmt_actualizado_en)
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            """
            cursor.executemany(query_ins_nat, nuevos_naturales)
            logging.info(
                f"Insertados {len(nuevos_naturales)} nuevos clientes naturales."
            )

        if nuevos_juridicos:
            query_ins_jur = """
                INSERT INTO tickets.tbl_clientes_juridicos
                (str_rif, str_razon_social, str_telefono, str_email, fuentes, created_at, updated_at, dmt_actualizado_en)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            """
            cursor.executemany(query_ins_jur, nuevos_juridicos)
            logging.info(
                f"Insertados {len(nuevos_juridicos)} nuevos clientes jurídicos."
            )

        # 5. Actualizar Existentes con Cambios
        if actualizar_naturales:
            query_upd_nat = """
                UPDATE tickets.tbl_clientes_naturales
                SET str_nombre = %s,
                    str_apellido = %s,
                    str_telefono = %s,
                    str_email = %s,
                    fuentes = %s,
                    updated_at = CURRENT_TIMESTAMP,
                    dmt_actualizado_en = CURRENT_TIMESTAMP
                WHERE str_cedula = %s;
            """
            cursor.executemany(query_upd_nat, actualizar_naturales)
            logging.info(
                f"Actualizados {len(actualizar_naturales)} clientes naturales existentes."
            )

        if actualizar_juridicos:
            query_upd_jur = """
                UPDATE tickets.tbl_clientes_juridicos
                SET str_razon_social = %s,
                    str_telefono = %s,
                    str_email = %s,
                    fuentes = %s,
                    updated_at = CURRENT_TIMESTAMP,
                    dmt_actualizado_en = CURRENT_TIMESTAMP
                WHERE str_rif = %s;
            """
            cursor.executemany(query_upd_jur, actualizar_juridicos)
            logging.info(
                f"Actualizados {len(actualizar_juridicos)} clientes jurídicos existentes."
            )

        conn.commit()

        duracion_segundos = time.time() - inicio_tiempo
        minutos, segundos = divmod(duracion_segundos, 60)
        logging.info("¡Sincronización completada exitosamente!")
        logging.info(
            f"Tiempo total: {int(minutos)}m {segundos:.2f}s ({duracion_segundos:.2f} segundos)."
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
