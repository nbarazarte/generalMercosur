const dotenv = require("dotenv");

// Asegúrate de especificar la ruta correcta si tu archivo .env no está en el directorio raíz
dotenv.config({ path: "../.env" });
const express = require("express");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const router = express.Router();
const pool = require("../db");
const autenticarToken = require("../middlewares/autenticarToken"); // Asegúrate de que no use desestructuración
const upload = require("../middlewares/multerConfig");
const fs = require("fs");
const fsp = fs.promises;
const { EventEmitter } = require("events");
const path = require("path");
//const transporter = require("../mailer");
//const transporter_gmail = require("../mailer");
const { transporter, transporter_gmail } = require("../mailer");
const { log } = require("console");
const jwt = require("jsonwebtoken");
//########################## SISTEMA DE onboarding ##########################
// Ruta pública para descargar un archivo por nombre
router.get("/descargar/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  const ruta = path.join("/var/www/uploads", nombre);

  // Verifica que el archivo exista
  if (!fs.existsSync(ruta)) {
    return res.status(404).send("Archivo no encontrado");
  }

  res.download(ruta, nombre, (err) => {
    if (err) {
      console.error("Error al descargar:", err.message);
      res.status(500).send("Error al descargar el archivo");
    }
  });
});
/**
 * Endpoint para la descarga física de archivos
 * Sirve tanto para archivos individuales como para el ZIP generado
 */
router.get("/descargar-archivo/:nombre", (req, res) => {
  try {
    const nombreArchivo = req.params.nombre;

    // 1. Limpiamos el nombre por seguridad (evita que suban niveles de carpetas)
    const nombreLimpio = path.basename(nombreArchivo);

    // 2. Definimos la ruta absoluta donde residen tus archivos
    // IMPORTANTE: Asegúrate de que esta ruta coincida con la que usaste en el POST
    const carpetaUploads = "/var/www/uploads";
    const rutaAbsoluta = path.join(carpetaUploads, nombreLimpio);

    // 3. Verificamos si el archivo existe físicamente
    if (!fs.existsSync(rutaAbsoluta)) {
      console.error(`Archivo no encontrado: ${rutaAbsoluta}`);
      return res
        .status(404)
        .send("El archivo solicitado no existe en el servidor.");
    }

    // 4. Ejecutamos la descarga
    // res.download configura automáticamente los headers:
    // Content-Disposition: attachment; filename="..."
    res.download(rutaAbsoluta, nombreLimpio, (err) => {
      if (err) {
        console.error("Error durante la descarga:", err.message);

        // Si el cliente cancela la descarga o hay error de red, evitamos crashear
        if (!res.headersSent) {
          res.status(500).send("Error al procesar la descarga.");
        }
      }
    });
  } catch (error) {
    console.error("Error en endpoint descargar-archivo:", error);
    res.status(500).send("Error interno del servidor.");
  }
});
router.get("/clienteMercosur", async (req, res) => {
  try {
    const { search = "" } = req.query;

    if (!search) {
      return res
        .status(400)
        .json({ error: "El parámetro de búsqueda (RIF) es requerido" });
    }

    // 1. Consumo del endpoint externo
    // Se limpia el search por si trae espacios y se concatena al RIF

    //console.log(search.length);

    const cedula =
      search.trim().length === 8
        ? `V00000${search.trim()}`
        : `V000000${search.trim()}`;

    const externalUrl = `https://cm.mercosur.com.ve/data_cliente?rif=${cedula}`;

    const response = await axios.get(externalUrl);

    // 2. Retornar la data obtenida del servicio externo
    res.json(response.data);
  } catch (err) {
    // Manejo de errores específico para la petición externa
    if (err.response) {
      // El servidor externo respondió con un error (4xx, 5xx)
      console.error(
        "Error Mercosur API:",
        err.response.status,
        err.response.data,
      );
      return res.status(err.response.status).json({
        error: "Error del servicio externo de Mercosur",
        details: err.response.data,
      });
    }

    console.error("Error en clienteMercosur:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/clientesActivosOnboardingMercosur", async (req, res) => {
  try {
    const { search = "" } = req.query;

    // 1. Parámetros de filtrado (empezamos con el buscador)
    let queryParams = [`%${search}%`];

    const query = `
      SELECT id, usuario_id, correo, cedula, str_rif, telefono 
      FROM onboarding.view_reporte_detallado 
      WHERE bol_ficha_completa = true 
      and bol_verificacion_datos = true 
      AND bol_verificacion_agile_check = true
      AND bol_verificacion_pep = false
      AND bol_verificacion_noticrimen = false
      AND bol_devuelta = false
      and bol_rechazada = false
      and bol_verificacion_aprobada = true
      and bol_eliminado = false
      and bol_pausa = false
      AND (
          correo ILIKE $1 OR
          cedula::text ILIKE $1 OR
          str_rif ILIKE $1 OR 
          telefono ILIKE $1
        )
      ORDER BY id DESC`;

    const result = await pool.query(query, queryParams);

    const totalCount =
      result.rows.length > 0 ? parseInt(result.rows[0].full_count) : 0;

    res.json({
      rows: result.rows,
      totalCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Uso del middleware para proteger todas las rutas (A PARTIR DE AQUI SON PRIVADAS)
router.use(autenticarToken);

// Cambiamos a POST para recibir el array de cédulas en el body
router.post("/rutasCedulasLista", async (req, res) => {
  try {
    // Se espera un array: { "cedulas": ["V16782496", "V12345678"] }
    const { cedulas = [] } = req.body;

    if (!Array.isArray(cedulas) || cedulas.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar una lista de cédulas válida." });
    }

    const query = `
      SELECT id, usuario_id, correo, cedula, str_rif, telefono 
      FROM onboarding.view_reporte_detallado 
      WHERE bol_ficha_completa = true 
      AND bol_verificacion_datos = true 
      AND bol_verificacion_agile_check = true
      AND bol_verificacion_pep = false
      AND bol_verificacion_noticrimen = false
      AND bol_devuelta = false
      AND bol_rechazada = false
      AND bol_verificacion_aprobada = true
      AND bol_eliminado = false
      AND bol_firma = true
      AND bol_pausa = false
      AND cedula::text = ANY($1)
      ORDER BY id DESC`;

    // Pasamos el array directamente como único parámetro
    const result = await pool.query(query, [cedulas]);

    res.json({
      rows: result.rows,
      totalCount: result.rowCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
router.get("/clienteMercosur2", async (req, res) => {
  try {
    const { search = "" } = req.query;

    // 1. Parámetros de filtrado
    let queryParams = [`%${search}%`];

    const query = `
      SELECT *, COUNT(*) OVER() AS full_count 
      FROM onboarding.view_estatus_general 
      WHERE 
       (
        cedula::text ILIKE $1
      ) 
      ORDER BY id DESC`;

    const result = await pool.query(query, queryParams);
    const totalCount =
      result.rows.length > 0 ? parseInt(result.rows[0].full_count) : 0;

    res.json({ rows: result.rows, totalCount });
  } catch (err) {
    console.error("Error en estatus general:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Nuevas ##########################
router.get("/fichasnuevas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = false",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de sección
    if (seccion && seccion !== "" && seccion !== "null") {
      // Si llega como array [ '7', '8', '10' ], lo unimos con comas
      // Si llega como string "7,8,10", lo dejamos igual
      const valorExacto = Array.isArray(seccion)
        ? seccion.join(",")
        : String(seccion).replace(/[\[\]' ]/g, ""); // Limpia corchetes o espacios si vienen en el string

      if (valorExacto) {
        queryParams.push(valorExacto);
        filters.push(`secciones_pendientes = $${queryParams.length}`);
      } else {
        filters.push(`secciones_pendientes = ''`);
      }
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas nuevas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasnuevasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = false",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de sección
    if (seccion && seccion !== "" && seccion !== "null") {
      // Si llega como array [ '7', '8', '10' ], lo unimos con comas
      // Si llega como string "7,8,10", lo dejamos igual
      const valorExacto = Array.isArray(seccion)
        ? seccion.join(",")
        : String(seccion).replace(/[\[\]' ]/g, ""); // Limpia corchetes o espacios si vienen en el string

      if (valorExacto) {
        queryParams.push(valorExacto);
        filters.push(`secciones_pendientes = $${queryParams.length}`);
      } else {
        filters.push(`secciones_pendientes = ''`);
      }
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas nuevasExcel:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas En Pausa ##########################
router.get("/fichasenpausa", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = false",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = true",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de sección
    if (seccion && seccion !== "" && seccion !== "null") {
      // Si llega como array [ '7', '8', '10' ], lo unimos con comas
      // Si llega como string "7,8,10", lo dejamos igual
      const valorExacto = Array.isArray(seccion)
        ? seccion.join(",")
        : String(seccion).replace(/[\[\]' ]/g, ""); // Limpia corchetes o espacios si vienen en el string

      if (valorExacto) {
        queryParams.push(valorExacto);
        filters.push(`secciones_pendientes = $${queryParams.length}`);
      } else {
        filters.push(`secciones_pendientes = ''`);
      }
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas nuevas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasenpausaExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = false",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = true",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de sección
    if (seccion && seccion !== "" && seccion !== "null") {
      // Si llega como array [ '7', '8', '10' ], lo unimos con comas
      // Si llega como string "7,8,10", lo dejamos igual
      const valorExacto = Array.isArray(seccion)
        ? seccion.join(",")
        : String(seccion).replace(/[\[\]' ]/g, ""); // Limpia corchetes o espacios si vienen en el string

      if (valorExacto) {
        queryParams.push(valorExacto);
        filters.push(`secciones_pendientes = $${queryParams.length}`);
      } else {
        filters.push(`secciones_pendientes = ''`);
      }
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas nuevasExcel:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Por Revision ##########################
router.get("/fichasPorRevision", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas por revision:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasPorRevisionExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = false",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas por revisionExcel:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas En Revision ##########################
router.get("/fichasEnRevision", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas en revision:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasEnRevisionExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = false",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas en revisionExcel:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas PEP ##########################
router.get("/registrospep", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = true",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas pep:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/registrospepExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = true",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas pepExcel:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Noticias Crimen ##########################
router.get("/registrosnoticiascrimen", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = true",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/registrosnoticiascrimenExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = true",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error(
      "Error en filtro de fichas noticias crimen excel:",
      err.message,
    );
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Aprobadas ##########################
router.get("/fichasAprobadas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas en revision:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasAprobadasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas en revision:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Activas ##########################
router.get("/fichasActivas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = true",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasActivasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = true",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Firmadas ##########################
router.get("/fichasFirmadas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
      agileCheck = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = true",
      "bol_firma = true",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    if (agileCheck == "con-matriz") {
      filters.push(`bol_agilecheck = true`);
    }

    if (agileCheck == "sin-matriz") {
      filters.push(`bol_agilecheck = false`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasFirmadasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
      agileCheck = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = true",
      "bol_firma = true",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    if (agileCheck == "con-matriz") {
      filters.push(`bol_agilecheck = true`);
    }

    if (agileCheck == "sin-matriz") {
      filters.push(`bol_agilecheck = false`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Devueltas ##########################
router.get("/fichasDevueltas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = true",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasDevueltasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = true",
      "bol_rechazada = false",
      "bol_verificacion_aprobada = false",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Fichas Rechazadas ##########################
router.get("/fichasRechazadas", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = true",
      "bol_verificacion_aprobada = false",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/fichasRechazadasExcel", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      seccion = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];

    // Filtros base obligatorios
    let filters = [
      "bol_eliminado = false",
      "bol_ficha_completa = true",
      "bol_verificacion_datos = true",
      "bol_verificacion_agile_check = true",
      "bol_verificacion_pep = false",
      "bol_verificacion_noticrimen = false",
      "bol_devuelta = false",
      "bol_rechazada = true",
      "bol_verificacion_aprobada = false",
      "bol_firma = false",
      "bol_pausa = false",
    ];

    // 1. Filtro de búsqueda global
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR tipo_producto ILIKE $1 OR telefono ILIKE $1 OR correo ILIKE $1)`,
    );

    // 2. Filtro de adulto o menores
    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para fechas (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = String(raw).replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    // CONSULTA DE DATOS: Rápida gracias al LIMIT/OFFSET
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_reporte_detallado 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Ligera
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_reporte_detallado 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total || 0),
    });
  } catch (err) {
    console.error("Error en filtro de fichas noticias crimen:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//########################## Estatus General ##########################
router.get("/estatusGeneral", async (req, res) => {
  try {
    const {
      page = 0,
      limit = 50,
      search = "",
      estatus = "",
      searchfecha = "",
      searchfecha2 = "",
      adultoMenor = "",
    } = req.query;

    const offset = page * limit;
    let queryParams = [`%${search}%`];
    let filters = [];

    // 1. Filtro de búsqueda global (ILIKE)
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR correo ILIKE $1 OR estado_actual ILIKE $1)`,
    );

    // 2. Filtro de estatus
    if (estatus && estatus !== "" && estatus !== "null") {
      queryParams.push(estatus);
      filters.push(`estado_actual = $${queryParams.length}`);
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para evitar el cast ::date (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = raw.replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // CONSULTA DE DATOS: Al no tener COUNT OVER, el LIMIT detiene el escaneo apenas encuentra los 50
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_estatus_general 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    // CONSULTA DE CONTEO: Mucho más ligera que procesar toda la vista con columnas pesadas
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_estatus_general 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams, limit, offset]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total),
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/estatusGeneralExcel", async (req, res) => {
  try {
    const {
      search = "",
      estatus = "",
      searchfecha = "",
      searchfecha2 = "",
      adultoMenor = "",
    } = req.query;

    let queryParams = [`%${search}%`];
    let filters = [];

    // 1. Filtro de búsqueda global (ILIKE)
    filters.push(
      `(cedula::text ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1 OR correo ILIKE $1 OR estado_actual ILIKE $1)`,
    );

    // 2. Filtro de estatus
    if (estatus && estatus !== "" && estatus !== "null") {
      queryParams.push(estatus);
      filters.push(`estado_actual = $${queryParams.length}`);
    }

    if (adultoMenor == "adulto") {
      filters.push(`edad >= 18`);
    }

    if (adultoMenor == "menor") {
      filters.push(`edad < 18`);
    }

    // 3. Función auxiliar para evitar el cast ::date (Optimiza uso de índices)
    const addFechaFilter = (raw, columna) => {
      if (raw && raw !== "" && raw !== "null" && raw !== "null,null") {
        const partes = raw.replace(/%/g, "").trim().split(",");
        if (partes[0] && partes[0] !== "null") {
          const inicio = `${partes[0]} 00:00:00`;
          const fin = `${partes[1] && partes[1] !== "null" ? partes[1] : partes[0]} 23:59:59`;
          queryParams.push(inicio, fin);
          filters.push(
            `${columna} BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`,
          );
        }
      }
    };

    addFechaFilter(searchfecha, "fecha_creacion");
    addFechaFilter(searchfecha2, "fecha_actualizacion");

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // CONSULTA DE DATOS: Al no tener COUNT OVER, el LIMIT detiene el escaneo apenas encuentra los 50
    const dataQuery = `
      SELECT * 
      FROM onboarding.view_estatus_general 
      ${whereClause} 
      ORDER BY id DESC`;

    // CONSULTA DE CONTEO: Mucho más ligera que procesar toda la vista con columnas pesadas
    const countQuery = `
      SELECT COUNT(id) AS total 
      FROM onboarding.view_estatus_general 
      ${whereClause}`;

    // Ejecución en paralelo
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...queryParams]),
      pool.query(countQuery, queryParams),
    ]);

    res.json({
      rows: dataRes.rows,
      totalCount: parseInt(countRes.rows[0].total),
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//####################################################//####################################################
router.get("/fichasParaElAdmin", async (req, res) => {
  try {
    // Agregamos 'ids' a la desestructuración
    const {
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      ids = "",
    } = req.query;

    let queryParams = [`%${search}%`];
    let fechaFilter = "";
    let fechaFilter2 = "";
    let idsFilter = ""; // Nuevo filtro para IDs

    // --- Lógica de fechas (Se mantiene igual que tu código original) ---
    const rawFecha = String(searchfecha || "");
    if (
      rawFecha &&
      rawFecha !== "null" &&
      rawFecha !== "null,null" &&
      rawFecha.trim() !== ""
    ) {
      const cleanDates = rawFecha.replace(/%/g, "").trim();
      const partes = cleanDates.split(",");
      if (partes[0] && partes[0] !== "null") {
        queryParams.push(partes[0], partes[1] || partes[0]);
        fechaFilter = `AND fecha_creacion::date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
      }
    }
    // ... (repetir para searchfecha2 igual que lo tienes) ...
    // --- Fin lógica fechas ---

    // 3.5 Nuevo: Procesar Filtro de IDs seleccionados
    if (ids) {
      const arrayIds = ids.split(","); // Convertimos "1,2,3" a ["1", "2", "3"]
      queryParams.push(arrayIds);
      idsFilter = `AND id = ANY($${queryParams.length})`;
      // Nota: Asegúrate de que 'id' sea el nombre de la columna en tu vista
    }

    const query = `
      SELECT 
    CONCAT(UPPER(SUBSTRING(cedula FROM 1 FOR 1)), LPAD(SUBSTRING(cedula FROM 2), 13, '0')) AS rif,
    nombres AS nombre, 
    apellidos AS apellido, 
    correo AS email, 
    SUBSTRING(telefono FROM 4) AS tlf1, 
    SUBSTRING(telefono FROM 4) AS tlf2,
    CASE 
        WHEN sexo = 'Masculino' THEN 'M' 
        WHEN sexo = 'Femenino' THEN 'F' 
        ELSE NULL 
    END AS sexo, 
    REPLACE(REPLACE(UPPER(estado_civil), '/A', ''), '/O', '') AS edocivil,
    REPLACE(nacimiento, '-', '/') AS nacimiento,
    CASE 
        WHEN nacionalidad = 'Venezolana/o' THEN 'V' 
        ELSE 'E' 
    END AS nacionalidad, 
    'M' AS stat    
FROM onboarding.view_reporte_detallado 
WHERE bol_ficha_completa = true
    AND bol_verificacion_datos = true
    AND bol_verificacion_agile_check = true
    AND bol_verificacion_pep = false
    AND bol_verificacion_noticrimen = false
    AND bol_devuelta = false
    AND bol_rechazada = false
    AND bol_verificacion_aprobada = false
    AND bol_eliminado = false    
    AND bol_pausa = false
        ${fechaFilter} 
        ${fechaFilter2}
        ${idsFilter} 
        AND (
          cedula::text ILIKE $1 OR 
          nombres ILIKE $1 OR 
          apellidos ILIKE $1 OR 
          telefono ILIKE $1 OR
          correo ILIKE $1
        )
      ORDER BY id DESC`;

    const result = await pool.query(query, queryParams);

    res.json({
      rows: result.rows,
      totalCount: result.rowCount,
    });
  } catch (err) {
    console.error("Error en registrosparafirmarExcel:", err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});
router.get("/fichasparaLA", async (req, res) => {
  try {
    const {
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      ids = "",
    } = req.query;

    let queryParams = [`%${search}%`];
    let fechaFilter = "";
    let fechaFilter2 = "";
    let idsFilter = "";

    // --- Lógica de fecha 1 ---
    const rawFecha = String(searchfecha || "");
    if (
      rawFecha &&
      rawFecha !== "null" &&
      rawFecha !== "null,null" &&
      rawFecha.trim() !== ""
    ) {
      const cleanDates = rawFecha.replace(/%/g, "").trim();
      const partes = cleanDates.split(",");
      if (partes[0] && partes[0] !== "null") {
        queryParams.push(partes[0], partes[1] || partes[0]);
        fechaFilter = `AND fecha_creacion::date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
      }
    }

    // --- Lógica de fecha 2 ---
    const rawFecha2 = String(searchfecha2 || "");
    if (
      rawFecha2 &&
      rawFecha2 !== "null" &&
      rawFecha2 !== "null,null" &&
      rawFecha2.trim() !== ""
    ) {
      const cleanDates2 = rawFecha2.replace(/%/g, "").trim();
      const partes2 = cleanDates2.split(",");
      if (partes2[0] && partes2[0] !== "null") {
        queryParams.push(partes2[0], partes2[1] || partes2[0]);
        fechaFilter2 = `AND fecha_creacion::date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
      }
    }

    // --- Filtro de IDs seleccionados ---
    if (ids) {
      const arrayIds = ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      if (arrayIds.length > 0) {
        queryParams.push(arrayIds);
        idsFilter = `AND id = ANY($${queryParams.length}::integer[])`;
      }
    }

    // Consulta limpia apuntando a la nueva vista especializada
    const query = `
      SELECT * 
      FROM onboarding.view_reporte_la
      WHERE 1 = 1
        ${fechaFilter} 
        ${fechaFilter2}
        ${idsFilter} 
        AND (
          "1.RIF/CI"::text ILIKE $1 OR 
          "2.NOMBRES" ILIKE $1 OR 
          "3.APELLIDOS / RAZON SOCIAL" ILIKE $1 OR 
          "17.EMAIL" ILIKE $1
        )
      ORDER BY "1.RIF/CI" DESC`;

    const result = await pool.query(query, queryParams);

    res.json({
      rows: result.rows,
      totalCount: result.rowCount,
    });
  } catch (err) {
    console.error("Error en fichasparaLA:", err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});
router.get("/fichasParaLaCVV", async (req, res) => {
  try {
    const {
      search = "",
      searchfecha = "",
      searchfecha2 = "",
      ids = "",
    } = req.query;

    let queryParams = [`%${search}%`];
    let fechaFilter = "";
    let fechaFilter2 = "";
    let idsFilter = "";

    // --- Lógica de fecha 1 ---
    const rawFecha = String(searchfecha || "");
    if (
      rawFecha &&
      rawFecha !== "null" &&
      rawFecha !== "null,null" &&
      rawFecha.trim() !== ""
    ) {
      const cleanDates = rawFecha.replace(/%/g, "").trim();
      const partes = cleanDates.split(",");
      if (partes[0] && partes[0] !== "null") {
        queryParams.push(partes[0], partes[1] || partes[0]);
        fechaFilter = `AND fecha_creacion::date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
      }
    }

    // --- Lógica de fecha 2 ---
    const rawFecha2 = String(searchfecha2 || "");
    if (
      rawFecha2 &&
      rawFecha2 !== "null" &&
      rawFecha2 !== "null,null" &&
      rawFecha2.trim() !== ""
    ) {
      const cleanDates2 = rawFecha2.replace(/%/g, "").trim();
      const partes2 = cleanDates2.split(",");
      if (partes2[0] && partes2[0] !== "null") {
        queryParams.push(partes2[0], partes2[1] || partes2[0]);
        fechaFilter2 = `AND fecha_creacion::date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
      }
    }

    // --- Filtro de IDs seleccionados ---
    if (ids) {
      const arrayIds = ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      if (arrayIds.length > 0) {
        queryParams.push(arrayIds);
        idsFilter = `AND id = ANY($${queryParams.length}::integer[])`;
      }
    }

    const query = `
      SELECT * 
      FROM onboarding.view_reporte_cvv
      WHERE 1 = 1
        ${fechaFilter} 
        ${fechaFilter2}
        ${idsFilter} 
        AND (
          "CI/RIF"::text ILIKE $1 OR 
          "Nombres" ILIKE $1 OR 
          "Apellidos" ILIKE $1 OR 
          email ILIKE $1
        )
      ORDER BY "CI/RIF" DESC`;

    const result = await pool.query(query, queryParams);

    res.json({
      rows: result.rows,
      totalCount: result.rowCount,
    });
  } catch (err) {
    console.error("Error en fichasParaLaCVV:", err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});
//Guardar el estatus de documento verificado
router.post("/fichas/verificaciondocumentos", async (req, res) => {
  try {
    const {
      bol_verificacion_datos,
      usuario_revisado_cumplimiento_id, // Usuario de ATC o de Cumplimiento que verifica
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_datos,
      usuario_revisado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_datos = $1,
          usuario_revisado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//Reabrir ficha:
router.post("/fichas/reabrirficha", async (req, res) => {
  try {
    const { bol_ficha_completa, usuario_revisado_cumplimiento_id, ficha_id } =
      req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_ficha_completa,
      usuario_revisado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET
          bol_seccion_10 = false,
          bol_seccion_11 = false,
          bol_seccion_12 = false,
          bol_ficha_completa = $1,
          usuario_revisado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()          
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Reapertura de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Reapertura de la ficha:", err.message);
    res.status(500).json({
      error: "Error al guardar Reapertura de la ficha",
      message: err.message,
    });
  }
});
router.post("/notificar-cliente-rechazadas", async (req, res) => {
  let { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });

  // Convertimos a array si viene un solo string para procesar siempre una lista
  const emailList = Array.isArray(email) ? email : [email];

  try {
    const currentYear = new Date().getFullYear();

    // Mapeamos cada email para crear una promesa de envío individual
    const emailPromises = emailList.map((targetEmail) => {
      return transporter.sendMail({
        from: `"Mercosur Casa de Bolsa, S.A." <registrocliente@mercosur.com.ve>`,
        to: targetEmail,
        subject: "Sobre su solicitud de apertura de cuenta",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ff6600; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
            </div>
            
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
              <h3 style="color: #ff6600; margin-top: 0;">Estimado(a)</h3>
              <p>Reciba un cordial saludo.</p>
              
              <p>Agradecemos su interés en Mercosur Casa de Bolsa, S.A. Luego de realizar la evaluación correspondiente, le informamos que en esta oportunidad no ha sido posible aprobar su solicitud, conforme a nuestras políticas internas y en cumplimiento con la normativa vigente emitida por la SUNAVAL.</p>
              
              <p>Agradecemos su comprensión.</p>
              
              <p style="margin-top: 30px;">
                Atentamente,<br>
                <strong>Unidad de Cumplimiento</strong>
              </p>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
              <p style="font-size: 0.8rem; color: #999999; text-align: center;">
                Este es un correo automático, por favor no responda a esta dirección.<br>
                © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
              </p>
            </div>
          </div>
        `,
      });
    });

    // Esperamos a que se envíen todos los correos
    await Promise.all(emailPromises);

    res.status(200).json({
      message:
        "Correos de notificación enviados con éxito con el archivo adjunto.",
    });
  } catch (error) {
    console.error("Error en el proceso de notificación:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});
router.post("/fichas/rechazar", async (req, res) => {
  try {
    const { bol_rechazada, usuario_preparado_cumplimiento_id, ficha_id } =
      req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_rechazada,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_rechazada = $1,
          bol_devuelta = false,
          bol_verificacion_noticrimen = false,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/enviarafirma", async (req, res) => {
  try {
    const {
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          bol_devuelta = false,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/enviarafirmadesdepep", async (req, res) => {
  try {
    const {
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          bol_verificacion_pep = false,
          usuario_preparado_cumplimiento_id = $2,
          bol_confirmado_pep = true,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/fichasDevueltas", async (req, res) => {
  try {
    const {
      bol_devuelta,
      usuario_preparado_cumplimiento_id,
      ficha_id,
      observaciones,
    } = req.body;

    // 1. Consultar la observación actual antes de actualizar
    const queryConsulta =
      'SELECT str_observaciones FROM "onboarding".fichas WHERE id = $1';
    const resConsulta = await pool.query(queryConsulta, [ficha_id]);

    if (resConsulta.rows.length === 0) {
      return res.status(404).json({ error: "Ficha no encontrada" });
    }

    const obsPrevias = resConsulta.rows[0].str_observaciones || "";

    // 2. Preparar el nuevo texto (evita duplicar si ya hay contenido)
    const nuevaObservacion = obsPrevias
      ? `${obsPrevias}\n \n${observaciones}`
      : observaciones;

    const valoresFicha = [
      bol_devuelta,
      usuario_preparado_cumplimiento_id,
      ficha_id,
      nuevaObservacion, // Usamos el string concatenado
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_devuelta = $1, 
          bol_verificacion_datos = true,
          bol_verificacion_agile_check = true,        
          bol_verificacion_pep = false,
          bol_verificacion_noticrimen = false,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW(),
          str_observaciones = $4
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha exitosa (observaciones actualizadas)",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/editar-observaciones", async (req, res) => {
  try {
    const { observaciones, usuario, ficha_id } = req.body;

    // 1. Consultar la observación actual antes de actualizar
    const queryConsulta =
      'SELECT str_observaciones FROM "onboarding".fichas WHERE id = $1';
    const resConsulta = await pool.query(queryConsulta, [ficha_id]);

    if (resConsulta.rows.length === 0) {
      return res.status(404).json({ error: "Ficha no encontrada" });
    }

    const valoresFicha = [observaciones, usuario, ficha_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW(),
          str_observaciones = $1
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha exitosa (observaciones actualizadas)",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/enviarafirmadesdenoticiascrimen", async (req, res) => {
  try {
    const {
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_agile_check,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          bol_verificacion_noticrimen = false,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//Guardar el estatus de documento aprobado
router.post("/fichas/enviaraaprobados", async (req, res) => {
  try {
    const {
      bol_verificacion_aprobada,
      usuario_verificacion_cumplimiento,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_aprobada,
      usuario_verificacion_cumplimiento,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_aprobada = $1,
          usuario_verificacion_cumplimiento_id = $2,
          fecha_actualizacion = NOW(),
          bol_descargo = true
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//todas aprobadas:
router.post("/fichas/enviaraaprobadostodas", async (req, res) => {
  try {
    const { bol_verificacion_aprobada, usuario_verificacion_cumplimiento } =
      req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_aprobada,
      usuario_verificacion_cumplimiento,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_aprobada = $1,
          usuario_verificacion_cumplimiento_id = $2,
          fecha_actualizacion = NOW(),
          bol_descargo = true
        WHERE bol_ficha_completa = true
        AND bol_verificacion_datos = true
        AND bol_verificacion_agile_check = true
        and bol_verificacion_pep = false
        and bol_verificacion_noticrimen = false
        AND bol_verificacion_aprobada = false
        and bol_descargo = false
        and bol_devuelta = false
        and bol_rechazada = false
        AND bol_eliminado = false 
        AND bol_pausa = false
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
// los que se hayan seccionado:
router.post("/fichas/enviaraaprobadostodasseleccionadas", async (req, res) => {
  try {
    const {
      bol_verificacion_aprobada,
      usuario_verificacion_cumplimiento,
      ids,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_aprobada,
      usuario_verificacion_cumplimiento,
      ids,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_aprobada = $1,
          usuario_verificacion_cumplimiento_id = $2,
          fecha_actualizacion = NOW(),
          bol_descargo = true
        WHERE bol_ficha_completa = true
        AND bol_verificacion_datos = true
        AND bol_verificacion_agile_check = true
        and bol_verificacion_pep = false
        and bol_verificacion_noticrimen = false
        AND bol_verificacion_aprobada = false
        and bol_descargo = false
        and bol_devuelta = false
        and bol_rechazada = false
        AND bol_eliminado = false
        AND bol_pausa = false
        AND id = ANY($3)
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/enviaraporrevision", async (req, res) => {
  try {
    const {
      bol_verificacion_datos,
      usuario_verificacion_cumplimiento,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_datos,
      usuario_verificacion_cumplimiento,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_datos = $1,
          bol_verificacion_agile_check = false,
          bol_verificacion_pep= false,
          bol_confirmado_pep = false,
          bol_verificacion_noticrimen = false,
          bol_verificacion_aprobada = false,
          bol_descargo = false,
          bol_devuelta= false,
          bol_rechazada = false,
          bol_eliminado = false,
          AND bol_pausa = false,
          usuario_verificacion_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//#########################################################################################
// Obtener todos los registros incompletos
router.get("/todosregistrosincompletos", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const searchWildcard = `%${search}%`;

    // Consulta limpia: Sin LIMIT y sin OFFSET
    const query = `
      SELECT * FROM onboarding.view_reporte_detallado 
      WHERE bol_ficha_completa = false
        and bol_pausa = false
        AND bol_verificacion_datos = false
        AND (
          cedula::text ILIKE $1 OR 
          nombres ILIKE $1 OR 
          apellidos ILIKE $1 OR 
          telefono ILIKE $1 OR
          correo ILIKE $1 OR
          usuario_asiste ILIKE $1 OR
          usuario_verificacion_cumplimiento ILIKE $1
        )
      ORDER BY id DESC`;

    const result = await pool.query(query, [searchWildcard]);

    res.json({
      rows: result.rows, // Aquí vendrán miles si existen
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});
// Obtener los datos detallados de un usuario específico para el PDF
router.get("/registroscompletadosporusuario", async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: "Falta el usuario_id" });
    }

    const query = `
      SELECT * FROM onboarding.view_reporte_detallado 
      WHERE usuario_id = $1 
      LIMIT 1`;

    const result = await pool.query(query, [usuario_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado o ficha incompleta" });
    }

    // Devolvemos solo el primer registro (el objeto directo)
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor al obtener datos del usuario");
  }
});
// Obtener todos los archivos asociados a un documento
router.get("/fichas_documentos", async (req, res) => {
  try {
    const { documento_id } = req.query;

    let result = await pool.query(
      `SELECT * FROM onboarding.view_reporte_detallado where bol_ficha_completa = true and id = $1`,
      [documento_id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Busca si una cedula esta repetida
router.get("/buscar_cedula_ficha", async (req, res) => {
  try {
    const { cedula } = req.query;

    if (!cedula) {
      return res.status(400).json({ error: "cedula es requerido" });
    }

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.fichas WHERE str_cedula = $1`;

    const result = await pool.query(query, [cedula]);

    res.json(result.rows[0]);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en buscar la cedula:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// Obtener los tipos y estatus de los documentos
router.get("/buscar_ficha", async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: "usuario_id es requerido" });
    }

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.view_onboarding_nueva WHERE usuario_id = $1`;

    const result = await pool.query(query, [usuario_id]);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en buscar_ficha:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// Obtener los paises
router.get("/paises", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, str_nombre FROM public.paises order by str_nombre asc",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener los estados
router.get("/estados", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_estado, estado FROM public.estados order by estado asc",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener los estados filtrados por pais
router.get("/estadosPais", async (req, res) => {
  try {
    const { pais_id } = req.query;

    const result = await pool.query(
      "SELECT id_estado, estado FROM public.estados where pais_id = $1 order by estado asc",
      [pais_id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener los municipios
router.get("/municipios", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_municipio, municipio FROM public.municipios order by municipio asc",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener los municipios filtrados por estado
router.get("/municipiosEstados", async (req, res) => {
  try {
    const { id_estado } = req.query;

    const result = await pool.query(
      "SELECT id_municipio, municipio FROM public.municipios where id_estado = $1 order by municipio asc",
      [id_estado],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener las parroquias
router.get("/parroquias", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_parroquia, parroquia FROM public.parroquias order by parroquia asc",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener las parroquias filtradas por municipios
router.get("/parroquiasMunicipios", async (req, res) => {
  try {
    const { id_municipio } = req.query;

    const result = await pool.query(
      "SELECT id_parroquia, parroquia FROM public.parroquias where id_municipio = $1 order by parroquia asc",
      [id_municipio],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Obtener los tipos y estatus de los documentos
router.get("/nacionalidad", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, str_nacionalidad	FROM public.paises order by str_nacionalidad asc",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});
router.get("/datos_maestro", async (req, res) => {
  try {
    const { str_tipo } = req.query;

    // VALIDACIÓN: Si str_tipo es undefined o null, evitamos el crash
    if (!str_tipo) {
      return res.status(400).json({
        error: "Falta el parámetro str_tipo en la consulta",
      });
    }

    const tiposArray = str_tipo.split(",");

    const query = `
      SELECT id, UPPER(str_nombre) as str_nombre, str_tipo 
      FROM "onboarding".datos_maestro 
      WHERE str_tipo = ANY($1) and bol_eliminado = false
      ORDER BY str_nombre ASC
    `;

    const result = await pool.query(query, [tiposArray]);

    // Si solo es un tipo, devolvemos formato original (array de objetos)
    if (tiposArray.length === 1) {
      return res.json(result.rows);
    }

    // Si son varios, agrupamos (objeto de arrays)
    const agrupado = result.rows.reduce((acc, item) => {
      if (!acc[item.str_tipo]) {
        acc[item.str_tipo] = [];
      }
      acc[item.str_tipo].push({ id: item.id, str_nombre: item.str_nombre });
      return acc;
    }, {});

    res.json(agrupado);
  } catch (err) {
    console.error("Error en datos_maestro:", err.message);
    res.status(500).send("Error en el servidor");
  }
});
// Guardar Datos personales ficha con archivos
router.post(
  "/fichas/upload",
  upload.fields([
    { name: "archivo", maxCount: 1 },
    { name: "archivo2", maxCount: 1 },
    { name: "pasaporte", maxCount: 1 },
    { name: "archivoCedulaRepresentante", maxCount: 1 },
    { name: "archivo2RifRepresentante", maxCount: 1 },
    { name: "archivoConstanciaTrabajoRepresentante", maxCount: 1 },
    { name: "archivoCartaAutorizacion", maxCount: 1 },
    { name: "archivoPartidaNacimiento", maxCount: 1 },
    { name: "archivoReferenciaBancaria", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const archivo = req.files["archivo"] ? req.files["archivo"][0] : null;
      const archivo2 = req.files["archivo2"] ? req.files["archivo2"][0] : null;
      const pasaporte = req.files["pasaporte"]
        ? req.files["pasaporte"][0]
        : null;

      const archivoCedulaRepresentante = req.files["archivoCedulaRepresentante"]
        ? req.files["archivoCedulaRepresentante"][0]
        : null;

      const archivo2RifRepresentante = req.files["archivo2RifRepresentante"]
        ? req.files["archivo2RifRepresentante"][0]
        : null;

      const archivoConstanciaTrabajoRepresentante = req.files[
        "archivoConstanciaTrabajoRepresentante"
      ]
        ? req.files["archivoConstanciaTrabajoRepresentante"][0]
        : null;

      const archivoCartaAutorizacion = req.files["archivoCartaAutorizacion"]
        ? req.files["archivoCartaAutorizacion"][0]
        : null;

      const archivoPartidaNacimiento = req.files["archivoPartidaNacimiento"]
        ? req.files["archivoPartidaNacimiento"][0]
        : null;

      const archivoReferenciaBancaria = req.files["archivoReferenciaBancaria"]
        ? req.files["archivoReferenciaBancaria"][0]
        : null;

      // Log para verificar si Multer procesó los archivos

      /* console.log("Archivos detectados:", {
        archivo: archivo ? archivo.filename : "Faltante",
        archivo2: archivo2 ? archivo2.filename : "Faltante",
        archivoCedulaRepresentante: archivoCedulaRepresentante
          ? archivoCedulaRepresentante.filename
          : "Faltante",
        archivo2RifRepresentante: archivo2RifRepresentante
          ? archivo2RifRepresentante.filename
          : "Faltante",
        archivoConstanciaTrabajoRepresentante:
          archivoConstanciaTrabajoRepresentante
            ? archivoConstanciaTrabajoRepresentante.filename
            : "Faltante",
        archivoCartaAutorizacion: archivoCartaAutorizacion
          ? archivoCartaAutorizacion.filename
          : "Faltante",
        archivoPartidaNacimiento: archivoPartidaNacimiento
          ? archivoPartidaNacimiento.filename
          : "Faltante",
        archivoReferenciaBancaria: archivoReferenciaBancaria
          ? archivoReferenciaBancaria.filename
          : "Faltante",
      }); */

      const {
        str_cedula,
        str_primer_nombre,
        str_segundo_nombre,
        str_primer_apellido,
        str_segundo_apellido,
        fecha_nacimiento,
        tipoNacionalidad,
        tipoOtraNacionalidad,
        tipoGenero,
        tipoCondicionVivienda,
        tipoEstadoCivil,
        tipoCargaFamiliar,
        str_cedula_conyuge,
        str_primer_nombre_conyuge,
        str_segundo_nombre_conyuge,
        str_primer_apellido_conyuge,
        str_segundo_apellido_conyuge,
        fuente_ingresos_id,
        str_cedulaRepresentante,
        str_primer_nombreRepresentante,
        str_segundo_nombre_representante,
        str_primer_apellido_representante,
        str_segundo_apellido_representante,
        fecha_nacimiento_representante,
        str_celular_representante,
        str_telefono_representante,
        tipoNacionalidadRepresentante,
        tipoGeneroRepresentante,
        str_lugar,
        usuario_id,
        bol_seccion_1,
      } = req.body;

      //console.table(req.body);
      //console.table(fecha_nacimiento);

      if (!usuario_id) {
        return res
          .status(400)
          .json({ error: "El usuario_id es nulo o inválido" });
      }

      const valoresFicha = [
        usuario_id, // $1
        tipoNacionalidad, // $2
        str_cedula, // $3
        tipoGenero, // $4
        str_primer_nombre, // $5
        str_segundo_nombre, // $6
        str_primer_apellido, // $7
        str_segundo_apellido, // $8
        tipoEstadoCivil && tipoEstadoCivil !== ""
          ? parseInt(tipoEstadoCivil)
          : null, // $9
        fecha_nacimiento, // $10
        tipoCondicionVivienda && tipoCondicionVivienda !== ""
          ? parseInt(tipoCondicionVivienda)
          : null, // $11
        1,
        tipoCargaFamiliar && tipoCargaFamiliar !== ""
          ? parseInt(tipoCargaFamiliar)
          : null, // $12
        tipoOtraNacionalidad || null, //$13
        str_lugar, //$14
        bol_seccion_1,
      ];

      const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          pais_nacionalidad_id = $2, 
          str_cedula = $3, 
          sexo_id = $4, 
          str_primer_nombre = $5, 
          str_segundo_nombre = $6, 
          str_primer_apellido = $7, 
          str_segundo_apellido = $8, 
          estado_civil_id = $9, 
          fecha_nacimiento = $10, 
          tipo_vivienda_id = $11, 
          paso_ficha_id = $12, 
          carga_familiar_id = $13,
          pais_otra_nacionalidad_id = $14,
          str_lugar = $15,
          bol_seccion_1 = $16,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $1
        RETURNING *;
      `;

      //Para archivo: cedula
      if (archivo) {
        const valoresArchivosFicha = [
          archivo ? `/var/www/uploads/${archivo.filename}` : null,
          usuario_id,
        ];

        const sqlUpdateFicha_Archivos = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_cedula = $1, 
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos, valoresArchivosFicha);
      }

      //Para archivo2: rif
      if (archivo2) {
        const valoresArchivos2Ficha = [
          archivo2 ? `/var/www/uploads/${archivo2.filename}` : null,
          usuario_id,
        ];

        const sqlUpdateFicha_Archivos2 = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_rif = $1,
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos2, valoresArchivos2Ficha);
      }

      //Para partida de nacimiento
      if (archivoPartidaNacimiento) {
        const valoresArchivosPartidaNacimiento = [
          archivoPartidaNacimiento
            ? `/var/www/uploads/${archivoPartidaNacimiento.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdateFicha_partida_nacimiento = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_partida_nacimiento = $1,
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdateFicha_partida_nacimiento,
          valoresArchivosPartidaNacimiento,
        );
      }

      //Para referencia bancaria
      if (archivoReferenciaBancaria) {
        const valoresArchivosReferenciaBancaria = [
          archivoReferenciaBancaria
            ? `/var/www/uploads/${archivoReferenciaBancaria.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdateFicha_partida_nacimiento = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_referencia_bancaria_menor = $1,
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdateFicha_partida_nacimiento,
          valoresArchivosReferenciaBancaria,
        );
      }

      //Para archivo: pasaporte
      if (pasaporte) {
        const valoresArchivosFicha = [
          pasaporte ? `/var/www/uploads/${pasaporte.filename}` : null,
          usuario_id,
        ];

        const sqlUpdateFicha_Archivos = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_pasaporte = $1, 
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos, valoresArchivosFicha);
      }

      // Convertimos strings vacíos a null para que SQL los acepte correctamente
      const valoresConyuges = [
        str_cedula_conyuge || null,
        str_primer_nombre_conyuge || null,
        str_segundo_nombre_conyuge || null,
        str_primer_apellido_conyuge || null,
        str_segundo_apellido_conyuge || null,
        fuente_ingresos_id && fuente_ingresos_id !== ""
          ? parseInt(fuente_ingresos_id)
          : null,
        usuario_id,
      ];

      const sqlUpdateConyuges = `
        UPDATE "onboarding".conyuges
        SET 
          str_cedula = $1, 
          str_primer_nombre = $2, 
          str_segundo_nombre = $3, 
          str_primer_apellido = $4, 
          str_segundo_apellido = $5, 
          fuente_ingresos_id = $6
        WHERE usuario_id = $7
        RETURNING *;
      `;

      const valoresRepresentanteLegal = [
        str_cedulaRepresentante || null,
        str_primer_nombreRepresentante || null,
        str_segundo_nombre_representante || null,
        str_primer_apellido_representante || null,
        str_segundo_apellido_representante || null,
        fecha_nacimiento_representante || null,
        str_celular_representante || null,
        str_telefono_representante || null,
        tipoNacionalidadRepresentante || null,
        tipoGeneroRepresentante || null,
        usuario_id,
      ];

      const sqlUpdaterepresentanteLegal = `
          UPDATE "onboarding".representantes
          SET 
            str_cedula = $1, 
            str_primer_nombre= $2, 
            str_segundo_nombre = $3,
            str_primer_apellido = $4,
            str_segundo_apellido = $5, 
            fecha_nacimiento = $6, 
            str_celular = $7, 
            str_telefono = $8, 
            pais_id = $9,
            genero_id = $10
          WHERE usuario_id = $11
          RETURNING *;
        `;

      if (archivoCedulaRepresentante) {
        const valoresRepresentanteLegalCedula = [
          archivoCedulaRepresentante
            ? `/var/www/uploads/${archivoCedulaRepresentante.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdaterepresentanteLegal = `
          UPDATE "onboarding".representantes
          SET 
            str_ruta_cedula = $1
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdaterepresentanteLegal,
          valoresRepresentanteLegalCedula,
        );
      }

      if (archivo2RifRepresentante) {
        const valoresRepresentanteLegalRif = [
          archivo2RifRepresentante
            ? `/var/www/uploads/${archivo2RifRepresentante.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdaterepresentanteLegalRif = `
          UPDATE "onboarding".representantes
          SET 
            str_ruta_rif = $1
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdaterepresentanteLegalRif,
          valoresRepresentanteLegalRif,
        );
      }

      if (archivoConstanciaTrabajoRepresentante) {
        const valoresConstanciaTrabajo = [
          archivoConstanciaTrabajoRepresentante
            ? `/var/www/uploads/${archivoConstanciaTrabajoRepresentante.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdaterepresentanteLegalConstancia = `
          UPDATE "onboarding".representantes
          SET 
            str_ruta_constancia_trabajo = $1
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdaterepresentanteLegalConstancia,
          valoresConstanciaTrabajo,
        );
      }

      if (archivoCartaAutorizacion) {
        const valoresRepresentanteLegalCarta = [
          archivoCartaAutorizacion
            ? `/var/www/uploads/${archivoCartaAutorizacion.filename}`
            : null,
          usuario_id,
        ];

        const sqlUpdaterepresentanteLegalCarta = `
          UPDATE "onboarding".representantes
          SET 
            str_ruta_carta_autorizacion = $1
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(
          sqlUpdaterepresentanteLegalCarta,
          valoresRepresentanteLegalCarta,
        );
      }

      //console.log(`Ejecutando UPDATE en DB para usuario_id: ${usuario_id}...`);
      const result = await pool.query(sqlUpdateFicha, valoresFicha);
      await pool.query(sqlUpdateConyuges, valoresConyuges);
      await pool.query(sqlUpdaterepresentanteLegal, valoresRepresentanteLegal);

      //console.log("✅ Ficha actualizada con éxito:", result.rows[0]);

      res.status(201).json({
        message: "Ficha actualizada y archivos recibidos con éxito",
        data: result.rows[0],
      });
    } catch (err) {
      console.error("❌ Error al procesar la ficha:", err.message);
      res.status(500).json({
        error: "Error en el servidor al guardar la ficha y documentos",
        message: err.message,
      });
    }
  },
);
//Para guardar los datos preliminares que vienen del admin:
router.post(
  "/datosPersonalesFromAdmin",
  upload.fields([
    { name: "archivo", maxCount: 1 },
    { name: "archivo2", maxCount: 1 },
    { name: "pasaporte", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const archivo = req.files["archivo"] ? req.files["archivo"][0] : null;
      const archivo2 = req.files["archivo2"] ? req.files["archivo2"][0] : null;
      const pasaporte = req.files["pasaporte"]
        ? req.files["pasaporte"][0]
        : null;

      const {
        str_cedula,
        str_primer_nombre,
        str_segundo_nombre,
        str_primer_apellido,
        str_segundo_apellido,
        str_telefono,
        str_rif,
        fecha_nacimiento,
        pais_nacionalidad_id,
        sexo_id,
        estado_civil_id,
        str_direccion_residencia,
        str_ciudad,
        estado_id,
        email,
      } = req.body;

      const normalizedEmail = email.trim().toUpperCase();

      //const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE UPPER(email) = $1",
        [normalizedEmail],
      );
      if (resultado.rows.length === 0)
        return res.status(404).send("Usuario no encontrado");

      const user = resultado.rows[0];

      const valoresFicha = [
        str_cedula,
        str_primer_nombre,
        str_segundo_nombre,
        str_primer_apellido,
        str_segundo_apellido,
        str_telefono,
        str_rif,
        fecha_nacimiento,
        pais_nacionalidad_id && pais_nacionalidad_id !== ""
          ? parseInt(pais_nacionalidad_id)
          : null,
        sexo_id && sexo_id !== "" ? parseInt(sexo_id) : null,
        str_direccion_residencia,
        str_ciudad,
        estado_id && estado_id !== "" ? parseInt(estado_id) : null,
        user.id,
        estado_civil_id && estado_civil_id !== ""
          ? parseInt(estado_civil_id)
          : null,
      ];

      const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          str_cedula = $1, 
          str_primer_nombre = $2, 
          str_segundo_nombre = $3, 
          str_primer_apellido = $4, 
          str_segundo_apellido = $5, 
          str_celular = $6,
          str_rif = $7,
          fecha_nacimiento = $8,
          pais_nacionalidad_id = $9,
          sexo_id = $10,
          str_direccion_residencia = $11,
          str_ciudad = $12,
          estado_id = $13,
          usuario_id = $14,
          estado_civil_id = $15,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $14
        RETURNING *;
      `;

      //Para archivo: cedula
      if (archivo) {
        const valoresArchivosFicha = [
          archivo ? `/var/www/uploads/${archivo.filename}` : null,
          user.id,
        ];

        const sqlUpdateFicha_Archivos = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_cedula = $1, 
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos, valoresArchivosFicha);
      }

      //Para archivo2: rif
      if (archivo2) {
        const valoresArchivos2Ficha = [
          archivo2 ? `/var/www/uploads/${archivo2.filename}` : null,
          user.id,
        ];

        const sqlUpdateFicha_Archivos2 = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_rif = $1,
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos2, valoresArchivos2Ficha);
      }

      //Para archivo: pasaporte
      if (pasaporte) {
        const valoresArchivosFicha = [
          pasaporte ? `/var/www/uploads/${pasaporte.filename}` : null,
          user.id,
        ];

        const sqlUpdateFicha_Archivos = `
          UPDATE "onboarding".fichas
          SET 
            str_ruta_pasaporte = $1, 
            fecha_actualizacion = NOW()
          WHERE usuario_id = $2
          RETURNING *;
        `;
        await pool.query(sqlUpdateFicha_Archivos, valoresArchivosFicha);
      }

      const result = await pool.query(sqlUpdateFicha, valoresFicha);

      res.status(201).json({
        message: "Datos preliminares y archivos recibidos con éxito",
        data: result.rows[0],
      });
    } catch (err) {
      console.error(
        "Error al procesar datos preliminares y archivos:",
        err.message,
      );
      res.status(500).json({
        error: "Error al procesar datos preliminares y archivos",
        message: err.message,
      });
    }
  },
);
//Guardar dirección de domicilio
router.post("/fichas/direccionDomicilio", async (req, res) => {
  try {
    const {
      pais_id,
      estado_id,
      municipio_id,
      parroquia_id,
      str_ciudad,
      str_codigo_postal,
      str_direccion_residencia,
      //str_telefono,
      str_celular,
      //email,
      bol_seccion_2,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      pais_id && pais_id !== "" ? parseInt(pais_id) : null,

      estado_id && estado_id !== "" ? parseInt(estado_id) : null,

      municipio_id && municipio_id !== "" ? parseInt(municipio_id) : null,

      parroquia_id && parroquia_id !== "" ? parseInt(parroquia_id) : null,
      str_ciudad,
      str_codigo_postal,
      str_direccion_residencia,
      //str_telefono,
      str_celular,
      //email,
      bol_seccion_2,
      usuario_id,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          pais_id = $1, 
          estado_id = $2, 
          municipio_id = $3, 
          parroquia_id = $4,
          str_ciudad = $5,
          str_codigo_postal = $6,
          str_direccion_residencia = $7,
          str_celular = $8,
          bol_seccion_2 = $9,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $10
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Direccion de domicilio guardada con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Direccion de domicilio:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar direccion de domicilio",
      message: err.message,
    });
  }
});
//Guardar actividad económica
router.post("/fichas/actividadEconomica", async (req, res) => {
  try {
    const {
      //ficha:
      tipoProfesion,
      actividad_economica_id,
      str_actividad_economica_descripcion,
      categoria_especial_id,
      tipoFuenteIngreso,
      //depedencia:
      fechaIngreso,
      nombreEmpresa,
      rifEmpresa,
      str_telefono,
      monto_ingreso_mensual,
      cargo,
      ramo,
      pais_id,
      estado_id,
      municipio_id,
      parroquia_id,
      strDireccion,
      //negocio:
      fechaFundacion,
      nombreNegocio,
      rifNegocio,
      str_telefonoNegocio,
      monto_ingreso_mensualNegocio,
      ramoNegocio,
      pais_idNegocio,
      estado_idNegocio,
      municipio_idNegocio,
      parroquia_idNegocio,
      strDireccionNegocio,
      str_nombre_registro,
      str_numero_registro,
      str_numero_folio,
      str_numero_tomo,
      str_proveedores,
      str_clientes,
      bol_seccion_6,
      dependencia_id,
      negocio_propio_id,
      respuestaOtrasFuentes,
      usuario_id,
      strOtroMontoIngresoMensual,
    } = req.body;

    //console.table(req.body);

    //console.table(fechaIngreso);

    const valoresFicha = [
      tipoProfesion && tipoProfesion !== "" ? parseInt(tipoProfesion) : null,
      actividad_economica_id && actividad_economica_id !== ""
        ? parseInt(actividad_economica_id)
        : null,
      str_actividad_economica_descripcion || null,
      categoria_especial_id && categoria_especial_id !== ""
        ? parseInt(categoria_especial_id)
        : null,
      tipoFuenteIngreso && tipoFuenteIngreso !== ""
        ? parseInt(tipoFuenteIngreso)
        : null,
      bol_seccion_6,

      dependencia_id && dependencia_id !== "" ? parseInt(dependencia_id) : null,
      negocio_propio_id && negocio_propio_id !== ""
        ? parseInt(negocio_propio_id)
        : null,
      respuestaOtrasFuentes && respuestaOtrasFuentes !== ""
        ? parseInt(respuestaOtrasFuentes)
        : null,

      usuario_id,
      strOtroMontoIngresoMensual || null,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          profesion_id = $1, 
          actividad_economica_id = $2, 
          str_actividad_economica_descripcion = $3, 
          categoria_especial_id = $4,
          fuente_ingresos_id = $5,
          bol_seccion_6 = $6,
          dependencia_id = $7,
          negocio_propio_id = $8,
          respuestaotrasFuentes = $9,
          strOtroMontoIngresoMensual = $11,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $10
        RETURNING *;
      `;

    const valoresRelacionDependencia = [
      fechaIngreso && fechaIngreso !== "" ? fechaIngreso : null,
      nombreEmpresa,
      rifEmpresa,
      str_telefono,
      monto_ingreso_mensual,
      cargo,
      ramo,
      pais_id && pais_id !== "" ? parseInt(pais_id) : null,
      estado_id && estado_id !== "" ? parseInt(estado_id) : null,
      municipio_id && municipio_id !== "" ? parseInt(municipio_id) : null,
      parroquia_id && parroquia_id !== "" ? parseInt(parroquia_id) : null,
      strDireccion,
      usuario_id,
    ];

    const sqlUpdateRelacionDependencia = `
        UPDATE "onboarding".relaciondependencia
        SET 
          fecha_ingreso = $1, 
          str_nombre_empresa = $2, 
          str_rif_empresa = $3, 
          str_telefono = $4, 
          str_monto_ingreso_mensual = $5, 
          str_cargo = $6, 
          str_ramo = $7, 
          pais_id = $8, 
          estado_id = $9, 
          municipio_id = $10, 
          parroquia_id = $11, 
          str_direccion = $12,
          fecha_actualizacion = NOW() 
        WHERE usuario_id = $13
        RETURNING *;
      `;

    //negocio
    const valoresNegociopropio = [
      fechaFundacion && fechaFundacion !== "" ? fechaFundacion : null,
      nombreNegocio,
      rifNegocio,
      str_telefonoNegocio,
      monto_ingreso_mensualNegocio,
      ramoNegocio,
      pais_idNegocio && pais_idNegocio !== "" ? parseInt(pais_idNegocio) : null,
      estado_idNegocio && estado_idNegocio !== ""
        ? parseInt(estado_idNegocio)
        : null,
      municipio_idNegocio && municipio_idNegocio !== ""
        ? parseInt(municipio_idNegocio)
        : null,
      parroquia_idNegocio && parroquia_idNegocio !== ""
        ? parseInt(parroquia_idNegocio)
        : null,
      strDireccionNegocio,
      str_nombre_registro,
      str_numero_registro,
      str_numero_folio,
      str_numero_tomo,
      str_proveedores,
      str_clientes,
      usuario_id,
    ];

    //console.table(valoresNegociopropio);

    const sqlUpdateNegociopropio = `
        UPDATE "onboarding".negociopropio
        SET 
          fecha_fundacion = $1, 
          str_nombre_negocio = $2, 
          str_rif_negocio = $3, 
          str_telefono = $4, 
          str_monto_ingreso_mensual = $5, 
          str_ramo = $6, 
          pais_id = $7, 
          estado_id = $8, 
          municipio_id = $9, 
          parroquia_id = $10, 
          str_direccion = $11, 
          str_nombre_registro = $12, 
          str_numero_registro = $13, 
          str_numero_folio = $14, 
          str_numero_tomo = $15, 
          str_proveedores = $16, 
          str_clientes = $17,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $18
        RETURNING *;
      `;

    //console.log(sqlUpdateNegociopropio);

    const result = await pool.query(sqlUpdateFicha, valoresFicha);
    await pool.query(sqlUpdateRelacionDependencia, valoresRelacionDependencia);
    await pool.query(sqlUpdateNegociopropio, valoresNegociopropio);

    res.status(201).json({
      message: "Actividad economica guardada con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar actividad economica:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar actividad economica",
      message: err.message,
    });
  }
});
//Guardar persona expuesta políticamente
router.post("/fichas/personapep", async (req, res) => {
  try {
    const {
      //ficha:
      condicion_pep_id,
      str_nombre_organizacion_pep,
      str_cargo_pep,
      pais_pep_id,
      fechaIngresoPep,
      fechaEgresoPep,
      relacionadoPepId,
      primerNombreRelacionado,
      segundoNombreRelacionado,
      primerApellidoRelacionado,
      segundoApellidoRelacionado,
      nacionalidadPepRelacionadoId,
      tipoDocRelacionadoPepId,
      cedulaRelacionado,
      nombreOrganizacionRelacionado,
      cargoRelacionado,
      paisPepRelacionadoId,
      fechaIngresoRelacionado,
      fechaEgresoRelacionado,
      tipoRelacionRelacionadoId,
      vinculoPepId,
      primerNombreVinculo,
      segundoNombreVinculo,
      primerApellidoVinculo,
      segundoApellidoVinculo,
      nacionalidadPepVinculoId,
      tipoDocVinculoPepId,
      cedulaVinculo,
      nombreOrganizacionVinculo,
      cargoVinculo,
      paisPepVinculoId,
      fechaIngresoVinculo,
      fechaEgresoVinculo,
      tipoRelacionVinculoId,
      bol_seccion_3,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      condicion_pep_id && condicion_pep_id !== ""
        ? parseInt(condicion_pep_id)
        : null,
      str_nombre_organizacion_pep,
      str_cargo_pep,
      pais_pep_id && pais_pep_id !== "" ? parseInt(pais_pep_id) : null,
      // Validación para fechas
      fechaIngresoPep && fechaIngresoPep !== "" ? fechaIngresoPep : null,
      fechaEgresoPep && fechaEgresoPep !== "" ? fechaEgresoPep : null,
      //Parentesco:
      relacionadoPepId && relacionadoPepId !== ""
        ? parseInt(relacionadoPepId)
        : null,
      primerNombreRelacionado || null,
      segundoNombreRelacionado || null,
      primerApellidoRelacionado || null,
      segundoApellidoRelacionado || null,
      nacionalidadPepRelacionadoId && nacionalidadPepRelacionadoId !== ""
        ? parseInt(nacionalidadPepRelacionadoId)
        : null,
      tipoDocRelacionadoPepId && tipoDocRelacionadoPepId !== ""
        ? parseInt(tipoDocRelacionadoPepId)
        : null,
      cedulaRelacionado || null,
      nombreOrganizacionRelacionado || null,
      cargoRelacionado || null,
      paisPepRelacionadoId && paisPepRelacionadoId !== ""
        ? parseInt(paisPepRelacionadoId)
        : null,
      fechaIngresoRelacionado && fechaIngresoRelacionado !== ""
        ? fechaIngresoRelacionado
        : null,
      fechaEgresoRelacionado && fechaEgresoRelacionado !== ""
        ? fechaEgresoRelacionado
        : null,
      tipoRelacionRelacionadoId && tipoRelacionRelacionadoId !== ""
        ? parseInt(tipoRelacionRelacionadoId)
        : null,

      vinculoPepId && vinculoPepId !== "" ? parseInt(vinculoPepId) : null,
      primerNombreVinculo || null,
      segundoNombreVinculo || null,
      primerApellidoVinculo || null,
      segundoApellidoVinculo || null,
      nacionalidadPepVinculoId && nacionalidadPepVinculoId !== ""
        ? parseInt(nacionalidadPepVinculoId)
        : null,
      tipoDocVinculoPepId && tipoDocVinculoPepId !== ""
        ? parseInt(tipoDocVinculoPepId)
        : null,
      cedulaVinculo || null,
      nombreOrganizacionVinculo || null,
      cargoVinculo || null,
      paisPepVinculoId && paisPepVinculoId !== ""
        ? parseInt(paisPepVinculoId)
        : null,
      fechaIngresoVinculo && fechaIngresoVinculo !== ""
        ? fechaIngresoVinculo
        : null,
      fechaEgresoVinculo && fechaEgresoVinculo !== ""
        ? fechaEgresoVinculo
        : null,
      tipoRelacionVinculoId && tipoRelacionVinculoId !== ""
        ? parseInt(tipoRelacionVinculoId)
        : null,
      bol_seccion_3,
      usuario_id,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          condicion_pep_id = $1, 
          str_nombre_organizacion_pep = $2,
          str_cargo_pep = $3,
          pais_pep_id = $4,
          fecha_ingreso_pep = $5,
          fecha_egreso_pep = $6,
          relacionado_pep_id = $7,
          str_primer_nombre_pep_relacionado = $8,
          str_segundo_nombre_pep_relacionado = $9,
          str_primer_apellido_pep_relacionado = $10,
          str_segundo_apellido_pep_relacionado = $11,
          nacionalidadpeprelacionado_id = $12,
          tipodocrelacionadopep_id = $13,
          str_cedularelacionado = $14,
          str_nombre_organizacion_pep_relacionado = $15,
          str_cargo_pep_relacionado = $16,
          pais_pep_relacionado_id = $17,
          fecha_ingreso_relacionado_pep = $18,
          fecha_egreso_relacionado_pep = $19,
          tiporelacionrelacionado_id = $20,
          vinculopep_id   = $21,       
          str_primer_nombre_pep_vinculo = $22,
          str_segundo_nombre_pep_vinculo = $23,
          str_primer_apellido_pep_vinculo = $24,
          str_segundo_apellido_pep_vinculo = $25,
          nacionalidadpepvinculo_id = $26,
          tipodocvinculopep_id = $27,
          str_cedulavinculo = $28,
          str_nombre_organizacion_pep_vinculo = $29,
          str_cargo_pep_vinculo = $30,
          pais_pep_vinculo_id = $31,
          fecha_ingreso_vinculo_pep = $32,
          fecha_egreso_vinculo_pep = $33,
          tiporelacionvinculo_id = $34,
          bol_seccion_3 = $35,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $36
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Persona Pep guardada con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Persona Pep:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar Persona Pep",
      message: err.message,
    });
  }
});
//Guardar referencias bancarias
router.post("/fichas/referenciasbancarias", async (req, res) => {
  try {
    const {
      //referenciasbancarias:
      banco_id,
      str_nombre_prod_bancario,
      str_cuenta_bancaria,
      cifras_id,
      bol_seccion_4,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresReferenciasBancarias = [
      banco_id && banco_id !== "" ? parseInt(banco_id) : null,
      str_nombre_prod_bancario || null,
      str_cuenta_bancaria || null,
      cifras_id && cifras_id !== "" ? parseInt(cifras_id) : null,
      usuario_id,
    ];

    const sqlUpdateReferenciasBancarias = `
        UPDATE "onboarding".referenciasbancarias
        SET 
          banco_id = $1, 
          str_nombre_prod_bancario = $2,
          str_cuenta_bancaria  = $3,
          cifras_id = $4,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $5
        RETURNING *;
      `;

    const result = await pool.query(
      sqlUpdateReferenciasBancarias,
      valoresReferenciasBancarias,
    );

    const valoresFicha = [bol_seccion_4, usuario_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_seccion_4 = $1,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $2
        RETURNING *;
      `;

    await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Referencias bancarias guardada con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Referencias bancarias:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar Referencias bancarias",
      message: err.message,
    });
  }
});
//Guardar referencias personales
router.post("/fichas/referenciaspersonales", async (req, res) => {
  try {
    //referenciaspersonales:
    const {
      str_nombre_apellido,
      str_cedula,
      //str_telefono,
      str_celular,
      bol_seccion_5,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresReferenciasPersonales = [
      str_nombre_apellido || null,
      str_cedula || null,
      //str_telefono || null,
      str_celular || null,
      usuario_id,
    ];

    const sqlUpdateReferenciasPersonales = `
        UPDATE "onboarding".referenciaspersonales
        SET 
          str_nombre_apellido = $1, 
          str_cedula = $2,          
          str_celular = $3,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $4
        RETURNING *;
      `;

    const valoresFicha = [bol_seccion_5, usuario_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_seccion_5 = $1,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $2
        RETURNING *;
      `;

    await pool.query(sqlUpdateFichas, valoresFicha);

    const result = await pool.query(
      sqlUpdateReferenciasPersonales,
      valoresReferenciasPersonales,
    );

    res.status(201).json({
      message: "Referencias personales guardada con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Referencias personales:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar Referencias personales",
      message: err.message,
    });
  }
});
//Guardar informacion del producto o servicio
router.post(
  "/fichas/informacionproductoservicio",

  upload.fields([
    { name: "archivoReferenciaBancaria", maxCount: 1 },
    { name: "archivoConstanciaTrabajo", maxCount: 1 },
  ]),

  async (req, res) => {
    try {
      const archivoReferenciaBancaria = req.files["archivoReferenciaBancaria"]
        ? req.files["archivoReferenciaBancaria"][0]
        : null;
      const archivoConstanciaTrabajo = req.files["archivoConstanciaTrabajo"]
        ? req.files["archivoConstanciaTrabajo"][0]
        : null;

      const {
        //InformacionProductoServicio:
        tipo_producto_id,
        bol_seccion_7,
        usuario_id,
        producto_id,
      } = req.body;

      //console.table(req.body);

      const valoresInformacionProductoServicio = [
        tipo_producto_id && tipo_producto_id !== ""
          ? parseInt(tipo_producto_id)
          : null,
        usuario_id,

        producto_id && producto_id !== "" ? parseInt(producto_id) : null,
      ];

      const sqlUpdateInformacionProductoServicio = `
        UPDATE "onboarding".productoservicio
        SET 
          tipo_producto_id = $1,
          moneda_id = 227,
          fecha_actualizacion = NOW(),
          producto_id = $3
        WHERE usuario_id = $2
        RETURNING *;
      `;

      const result = await pool.query(
        sqlUpdateInformacionProductoServicio,
        valoresInformacionProductoServicio,
      );

      const valoresFicha = [
        bol_seccion_7,
        usuario_id,

        archivoReferenciaBancaria
          ? `/var/www/uploads/${archivoReferenciaBancaria.filename}`
          : null,

        archivoConstanciaTrabajo
          ? `/var/www/uploads/${archivoConstanciaTrabajo.filename}`
          : null,
      ];

      const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_seccion_7 = $1,
          fecha_actualizacion = NOW(),
          str_ruta_referencia_bancaria = $3,
          str_ruta_constancia_trabajo = $4
        WHERE usuario_id = $2
        RETURNING *;
      `;
      await pool.query(sqlUpdateFichas, valoresFicha);

      res.status(201).json({
        message: "Informacion producto o servicio guardado con éxito",
        data: result.rows[0],
      });
    } catch (err) {
      console.error(
        "❌ Error al guardar Informacion producto o servicio:",
        err.message,
      );
      res.status(500).json({
        error:
          "Error en el servidor al guardar Informacion producto o servicio",
        message: err.message,
      });
    }
  },
);
//Guardar informacion del producto o servicio
router.post("/fichas/informacionmovilizacionfondos", async (req, res) => {
  try {
    const {
      //ficha:
      str_monto_promedio_mensual,
      str_cantidad_operaciones,
      bol_seccion_8,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      str_monto_promedio_mensual || null,
      str_cantidad_operaciones || null,
      bol_seccion_8,
      usuario_id,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          str_monto_promedio_mensual = $1, 
          str_cantidad_operaciones  = $2,
          bol_seccion_8 = $3,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $4
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Informacion movilizacion de fondos guardado con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Informacion movilizacion de fondos:",
      err.message,
    );
    res.status(500).json({
      error:
        "Error en el servidor al guardar Informacion movilizacion de fondos",
      message: err.message,
    });
  }
});
//Guardar enviar o recibir del exterior
router.post("/fichas/enviarecibir", async (req, res) => {
  try {
    const {
      //ficha:
      pais_id_envia_recibe_origen,
      pais_id_envia_recibe_destino,
      uso_modeda_virtual_id,
      motivos_id,
      str_origen_fondos,
      str_destino_fondos,
      bol_seccion_9,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      pais_id_envia_recibe_origen && pais_id_envia_recibe_origen !== ""
        ? parseInt(pais_id_envia_recibe_origen)
        : null,
      pais_id_envia_recibe_destino && pais_id_envia_recibe_destino !== ""
        ? parseInt(pais_id_envia_recibe_destino)
        : null,
      uso_modeda_virtual_id && uso_modeda_virtual_id !== ""
        ? parseInt(uso_modeda_virtual_id)
        : null,
      motivos_id && motivos_id !== "" ? parseInt(motivos_id) : null,
      str_origen_fondos || null,
      str_destino_fondos || null,
      bol_seccion_9,
      usuario_id,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
        pais_id_envia_recibe_origen = $1,
        pais_id_envia_recibe_destino = $2,
        uso_modeda_virtual_id = $3,
        motivos_id = $4,
        str_origen_fondos = $5,
        str_destino_fondos = $6,
        bol_seccion_9 = $7,
        fecha_actualizacion = NOW()
        WHERE usuario_id = $8
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Envía y/o recibe del exterior guardado con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Envía y/o recibe del exterior:",
      err.message,
    );
    res.status(500).json({
      error: "Error en el servidor al guardar Envía y/o recibe del exterior",
      message: err.message,
    });
  }
});
//Guardar cuenta otros producto o servicio
router.post("/fichas/otrosservicios", async (req, res) => {
  try {
    const {
      //InformacionProductoServicio:
      producto_id,
      str_numero_producto,
      moneda_id,
      bol_seccion_9,
      bol_seccion_10,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresOtrosInformacionProductoServicio = [
      producto_id,
      str_numero_producto,
      moneda_id,
      usuario_id,
    ];

    const sqlUpdateOtrosInformacionProductoServicio = `
        UPDATE "onboarding".otros_productoservicio
        SET 
          producto_id = $1, 
          str_numero_producto  = $2,
          moneda_id = $3,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $4
        RETURNING *;
      `;

    const result = await pool.query(
      sqlUpdateOtrosInformacionProductoServicio,
      valoresOtrosInformacionProductoServicio,
    );

    const valoresFicha = [bol_seccion_9, bol_seccion_10, usuario_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_seccion_9 = $1,
          bol_seccion_10 = $2
        WHERE usuario_id = $3
        RETURNING *;
      `;
    await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Informacion otros producto o servicio guardado con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Informacion otros producto o servicio:",
      err.message,
    );
    res.status(500).json({
      error:
        "Error en el servidor al guardar Informacion otros producto o servicio",
      message: err.message,
    });
  }
});
//Guardar medios de contacto
router.post("/fichas/mediosContacto", async (req, res) => {
  try {
    const { tipoRrss, str_otros_medios, bol_seccion_9, usuario_id } = req.body;

    //console.table(req.body);

    const valoresRrss_fichas = [tipoRrss, str_otros_medios, usuario_id];

    const sqlUpdateRss_fichas = `
        UPDATE "onboarding".rrss_fichas
        SET 
          rrss_id = $1,
          str_otros_medios = $2,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateRss_fichas, valoresRrss_fichas);

    const valoresFicha = [bol_seccion_9, usuario_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
        bol_seccion_9 = $1,
        fecha_actualizacion = NOW()
        WHERE usuario_id = $2
        RETURNING *;
      `;
    await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Medios de contacto guardados con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar medios de contacto:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar medios de contacto",
      message: err.message,
    });
  }
});
//Guardar Perfil de inversion:
router.post("/fichas/perfilInversion", async (req, res) => {
  try {
    const {
      tipo_perfil_inversion_id,
      tiene_experiencia_id,
      objetivo_inversion_id,
      bol_seccion_10,
      usuario_id,
    } = req.body;

    //console.table(req.body);

    const valoresPerfilesinversion = [
      tipo_perfil_inversion_id,
      tiene_experiencia_id,
      objetivo_inversion_id,
      usuario_id,
    ];

    const sqlUpdatePerfilesinversion = `
        UPDATE "onboarding".perfilesinversion
        SET 
          tipo_perfil_inversion_id = $1,
          tiene_experiencia_id = $2,
          objetivo_inversion_id = $3,
          fecha_actualizacion = NOW()
        WHERE usuario_id = $4
        RETURNING *;
      `;

    const result = await pool.query(
      sqlUpdatePerfilesinversion,
      valoresPerfilesinversion,
    );

    const valoresFicha = [bol_seccion_10, usuario_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
        bol_seccion_10 = $1,
        fecha_actualizacion = NOW()
        WHERE usuario_id = $2
        RETURNING *;
      `;
    await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Medios de contacto guardados con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar medios de contacto:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar perfiles de inversion",
      message: err.message,
    });
  }
});
//Cerrar Ficha cliente:cuando son nuevas
router.post("/fichas/cerrar", async (req, res) => {
  try {
    const { bol_ficha_completa, usuario_id, usuario_asiste_id } = req.body;

    //onsole.table(req.body);

    const valoresFicha = [bol_ficha_completa, usuario_asiste_id, usuario_id];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          bol_ficha_completa = $1,
          usuario_asiste_id=$2,
          fecha_actualizacion = NOW(),
          bol_seccion_11= true,
          bol_seccion_12= true,
          bol_pausa = false
        WHERE usuario_id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Registro completado con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Registro completado:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar Registro completado",
      message: err.message,
    });
  }
});
//Cuando vienen de una devolucion:
router.post("/fichas/cerrar_devueltas", async (req, res) => {
  try {
    const {
      bol_ficha_completa,
      bol_seccion_10,
      bol_seccion_11,
      bol_seccion_12,
      usuario_id,
      usuario_asiste_id,
    } = req.body;

    //onsole.table(req.body);

    const valoresFicha = [
      bol_ficha_completa,
      bol_seccion_10,
      bol_seccion_11,
      bol_seccion_12,
      usuario_asiste_id,
      usuario_id,
    ];

    const sqlUpdateFicha = `
        UPDATE "onboarding".fichas
        SET 
          bol_ficha_completa = $1,
          bol_seccion_10 =$2,
          bol_seccion_11 =$3,
          bol_seccion_12 =$4,
          usuario_asiste_id=$5,
          fecha_actualizacion = NOW(),
          bol_verificacion_datos = false,
          bol_verificacion_agile_check = false,
          bol_devuelta = false
          bol_pausa = false
        WHERE usuario_id = $6
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFicha, valoresFicha);

    res.status(201).json({
      message: "Registro completado con éxito",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al guardar Registro completado:", err.message);
    res.status(500).json({
      error: "Error en el servidor al guardar Registro completado",
      message: err.message,
    });
  }
});
router.post("/fichas/enviarapep", async (req, res) => {
  try {
    const {
      bol_verificacion_pep,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_pep,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_pep = $1,
          bol_verificacion_agile_check = true,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
router.post("/fichas/enviaranoticrimen", async (req, res) => {
  try {
    const {
      bol_verificacion_noticrimen,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_noticrimen,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_noticrimen = $1,
          bol_verificacion_agile_check = true,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//Devuelve el estatus de documento verificado false
router.post("/fichas/devolvercompletados", async (req, res) => {
  try {
    const {
      bol_verificacion_datos,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    } = req.body;

    //console.table(req.body);

    const valoresFicha = [
      bol_verificacion_datos,
      usuario_preparado_cumplimiento_id,
      ficha_id,
    ];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_datos = $1,
          usuario_preparado_cumplimiento_id = $2,
          fecha_actualizacion = NOW()
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
//Devuelve el estatus de documento verificado false
router.post("/fichas/devolververificados", async (req, res) => {
  try {
    const { bol_verificacion_agile_check, usuario_id, ficha_id } = req.body;

    //console.table(req.body);

    const valoresFicha = [bol_verificacion_agile_check, usuario_id, ficha_id];

    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          usuario_revisado_cumplimiento_id = $2
        WHERE id = $3
        RETURNING *;
      `;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res.status(201).json({
      message: "Verificación de la ficha éxitosa",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Error al guardar Estatus de verificacion de documentos:",
      err.message,
    );
    res.status(500).json({
      error: "Error al guardar Estatus de verificacion de documentos",
      message: err.message,
    });
  }
});
// Aprobar múltiples fichas a la vez
router.post("/fichas/aprobacion-masiva-agile-check", async (req, res) => {
  try {
    const { ficha_ids, usuario_id, bol_verificacion_agile_check } = req.body;

    if (!Array.isArray(ficha_ids) || ficha_ids.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron IDs" });
    }

    const query = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          usuario_revisado_cumplimiento_id = $2
        WHERE id = ANY($3)
        RETURNING id;
      `;

    const result = await pool.query(query, [
      bol_verificacion_agile_check,
      usuario_id,
      ficha_ids,
    ]);

    res.status(200).json({
      message: `${result.rowCount} fichas aprobadas con éxito`,
      count: result.rowCount,
    });
  } catch (err) {
    console.error("❌ Error en aprobación masiva:", err.message);
    res.status(500).json({ error: "Error al procesar la aprobación masiva" });
  }
});
// Devolver múltiples fichas al estatus de verificados
router.post(
  "/fichas/devolucion-masiva-para-verificar-agile-check",
  async (req, res) => {
    try {
      const {
        ficha_ids,
        usuario_revisado_cumplimiento_id,
        bol_verificacion_agile_check,
      } = req.body;

      if (!Array.isArray(ficha_ids) || ficha_ids.length === 0) {
        return res.status(400).json({ error: "No se proporcionaron IDs" });
      }

      const query = `
        UPDATE "onboarding".fichas
        SET 
          bol_verificacion_agile_check = $1,
          usuario_revisado_cumplimiento_id = $2
        WHERE id = ANY($3)
        RETURNING id;
      `;

      // Pasamos bol_verificacion_agile_check como false para "devolver"
      const result = await pool.query(query, [
        bol_verificacion_agile_check, // false
        usuario_revisado_cumplimiento_id,
        ficha_ids,
      ]);

      res.status(200).json({
        message: `${result.rowCount} fichas devueltas con éxito`,
        count: result.rowCount,
      });
    } catch (err) {
      console.error("❌ Error en devolución masiva:", err.message);
      res.status(500).json({ error: "Error al procesar la devolución masiva" });
    }
  },
);
//######################### GRAFICOS #####################################
// Obtener cantidad de fichas llenas y por llenar
router.get("/reporte_estatus_fichas", async (req, res) => {
  try {
    //const { usuario_id } = req.query;

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.view_estatus_fichas`;

    const result = await pool.query(query, []);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en reporte_estatus_fichas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/reporte_sexo", async (req, res) => {
  try {
    //const { usuario_id } = req.query;

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.view_sexos`;

    const result = await pool.query(query, []);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(result.rows);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en reporte_sexo:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/reporte_paises", async (req, res) => {
  try {
    //const { usuario_id } = req.query;

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.view_paises`;

    const result = await pool.query(query, []);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(result.rows);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en reporte_paises:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/reporte_edades", async (req, res) => {
  try {
    //const { usuario_id } = req.query;

    // Eliminamos el "f." porque en la vista ya no existe ese alias de tabla
    const query = `SELECT * FROM onboarding.view_edades`;

    const result = await pool.query(query, []);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(result.rows);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en reporte_edades:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//##########################################################################################################################################################

const TOKEN_FILE = path.join(__dirname, "..", "api_token.json");
const CREDENTIALS_FILE = path.join(__dirname, "..", "credenciales");

const LOGIN_URL =
  "https://certapi.procert.net.ve/api/generador/v1/seguridad/authservicio";
const API_URL =
  "https://certapi.procert.net.ve/api/generador/v1/externo/solicitacertificadogestor";

const CHUNK_SIZE = 50;
const PER_RECORD_DELAY_MS = 200;
const BETWEEN_BATCH_DELAY_MS = 1000;

const jobs = new Map(); // jobId -> { emitter, status, logBuffer, summary, startedAt, endedAt }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const genJobId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---------- Token helpers ----------
async function loadSavedToken() {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const raw = await fsp.readFile(TOKEN_FILE, "utf-8");
    const tokenData = JSON.parse(raw);
    const expirationStr = tokenData?.expiracion;
    if (!expirationStr) {
      await fsp.unlink(TOKEN_FILE).catch(() => { });
      return null;
    }
    const expiration = new Date(expirationStr.replace("Z", "+00:00"));
    if (new Date() < expiration) return tokenData.token;
    await fsp.unlink(TOKEN_FILE).catch(() => { });
    return null;
  } catch {
    await fsp.unlink(TOKEN_FILE).catch(() => { });
    return null;
  }
}

async function saveToken(token, expiration) {
  const tokenData = {
    token,
    expiracion: expiration,
    created_at: new Date().toISOString(),
  };
  await fsp.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
}

async function loginAndGetToken(logger = console.log) {
  let userId = process.env.API_USER_ID;
  let password = process.env.API_PASSWORD;
  let apiId = process.env.API_ID;

  if (!(userId && password && apiId)) {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      try {
        const raw = await fsp.readFile(CREDENTIALS_FILE, "utf-8");
        const creds = JSON.parse(raw);
        userId = userId || creds.userId;
        password = password || creds.password;
        apiId = apiId || creds.apiId;
      } catch { }
    }
  }

  if (!(userId && password && apiId)) {
    throw new Error(
      "Credenciales no encontradas en entorno ni en archivo 'credenciales'.",
    );
  }

  const payload = { userId, password, apiId };
  const resp = await axios.post(LOGIN_URL, payload, { timeout: 30000 });

  if (resp.status !== 200 || !resp.data?.datosToken?.token) {
    throw new Error(
      `Login fallo o respuesta inválida (status: ${resp.status})`,
    );
  }

  const token = resp.data.datosToken.token;
  const expiration = resp.data.datosToken.expiracion;
  await saveToken(token, expiration);
  //logger("✅ Login successful");
  logger("");
  return token;
}

async function ensureToken(logger) {
  let token = await loadSavedToken();
  if (!token) token = await loginAndGetToken(logger);
  return token;
}

async function sendToExternalAPI(records, onLine, onChunk) {
  onLine(`${records.length} registro(s) cargado(s)`);

  let token = await ensureToken(onLine);
  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const total = records.length;
  const totalBatches = Math.ceil(total / CHUNK_SIZE);
  let successful = 0;
  let failed = 0;
  const start = Date.now();

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const batchNum = Math.floor(i / CHUNK_SIZE) + 1;

    onLine("");
    onLine(`Batch ${batchNum}/${totalBatches}`);
    let batch_success = 0;
    let batch_fail = 0;

    for (let j = 0; j < chunk.length; j++) {
      const record = chunk[j];
      const recordNum = i + j + 1; // Equivalente al record_num de Python

      try {
        const resp = await axios.post(API_URL, record, {
          headers,
          timeout: 60000,
        });

        // --- EQUIVALENTE AL BLOQUE DE PYTHON ---
        if (resp.status >= 200 && resp.status < 300) {
          batch_success += 1;
          onChunk("", {
            record: recordNum,
            status: "SUCCESS",
            code: resp.status,
            response:
              typeof resp.data === "string"
                ? resp.data
                : JSON.stringify(resp.data),
          });
        } else if (resp.status === 401) {
          onLine("\n🔐 Token expired - restarting auth flow");
          if (fs.existsSync(TOKEN_FILE))
            await fsp.unlink(TOKEN_FILE).catch(() => { });
          throw new Error("Token expirado, abortando.");
        } else {
          batch_fail += 1;
          onChunk("", {
            record: recordNum,
            status: "FAILED",
            code: resp.status,
            response:
              typeof resp.data === "string"
                ? resp.data
                : JSON.stringify(resp.data),
          });
        }
      } catch (e) {
        const status = e?.response?.status || "N/A";

        // Manejo específico del 401 en la excepción
        if (status === 401) {
          onLine("\n🔐 Token expired (exception) - restarting auth flow");
          if (fs.existsSync(TOKEN_FILE))
            await fsp.unlink(TOKEN_FILE).catch(() => { });
          throw new Error("Token expirado, abortando.");
        }

        batch_fail += 1;
        onChunk("", {
          record: recordNum,
          status: "ERROR",
          code: status,
          response: e.response?.data
            ? JSON.stringify(e.response.data)
            : e.message,
        });
      }
      await sleep(PER_RECORD_DELAY_MS);
    }

    successful += batch_success;
    failed += batch_fail;
    //onLine(` [${batch_success}✅ {batch_fail}❌]`);

    if (batchNum < totalBatches) await sleep(BETWEEN_BATCH_DELAY_MS);
  }

  const totalTimeSec = Math.round((Date.now() - start) / 1000);
  const successRate = total ? (successful / total) * 100 : 0;

  /* onLine("");
  onLine("📊 SUMMARY:");
  onLine(`⏱️  ${(totalTimeSec / 60).toFixed(1)}min (${totalTimeSec}s)`);
  onLine(`✅ Success: ${successful}/${total} (${successRate.toFixed(1)}%)`);
  onLine(`❌ Failed: ${failed}`); */

  return {
    total: total,
    exitosos: successful,
    fallidos: failed,
    tasaExito: Number(successRate.toFixed(1)) + "%",
    //duracionSegundos: totalTimeSec,
  };
}

// ---------- Job runner modificado ----------
async function runJob(jobId, payload) {
  const job = jobs.get(jobId);
  if (!job) return;

  const { emitter } = job;
  const detailedLogs = [];

  const pushLine = (line) => {
    job.logBuffer.push(line);
    emitter.emit("log", line + "\n");
  };

  const pushChunk = (chunk, detail = null) => {
    if (chunk) {
      if (job.logBuffer.length === 0) job.logBuffer.push(chunk);
      else job.logBuffer[job.logBuffer.length - 1] += chunk;
      emitter.emit("log", chunk);
    }
    if (detail) detailedLogs.push(detail);
  };

  try {
    job.status = "running";
    job.startedAt = new Date().toISOString();

    const summary = await sendToExternalAPI(payload, pushLine, pushChunk);

    // --- CONFIGURACIÓN DE RUTAS ---
    const logFileNameJson = `log_${jobId}.json`;
    const logFileNameCsv = `log_${jobId}.csv`;
    const logPathJson = path.join("/var/www/uploads", logFileNameJson);
    const logPathCsv = path.join("/var/www/uploads", logFileNameCsv);

    // 1. Guardar JSON original (mantiene toda la data por si acaso)
    await fsp.writeFile(
      logPathJson,
      JSON.stringify(detailedLogs, null, 2),
      "utf-8",
    );

    // 2. Generar CSV procesado
    if (detailedLogs.length > 0) {
      //const headers = ["record", "status", "code", "mensaje"]; // Cabeceras limpias
      const headers = ["mensaje"]; // Cabeceras limpias
      const csvHeader = headers.join(",");

      const csvRows = detailedLogs.map((log) => {
        let mensajeLimpio = "";

        try {
          // Intentamos parsear la respuesta si es un string JSON
          const resObj =
            typeof log.response === "string"
              ? JSON.parse(log.response)
              : log.response;

          // Prioridad: mensaje del error interno del usuario o mensaje general
          mensajeLimpio =
            resObj?.errorUsuarios?.[0]?.mensaje ||
            resObj?.mensaje ||
            log.response;
        } catch (e) {
          // Si no es JSON, usamos el texto tal cual
          mensajeLimpio = log.response;
        }

        // Creamos la fila para el CSV
        const row = [
          //log.record,
          //log.status,
          //log.code,
          `"${String(mensajeLimpio).replace(/"/g, '""')}"`, // Escapamos comillas
        ];
        return row.join(",");
      });

      const csvContent = [csvHeader, ...csvRows].join("\n");
      await fsp.writeFile(logPathCsv, csvContent, "utf-8");
    }

    summary.logFile = logFileNameJson;
    summary.logFileCsv = logFileNameCsv;
    job.summary = summary;
    job.status = "done";
    job.endedAt = new Date().toISOString();
    emitter.emit("end", summary);
  } catch (err) {
    job.status = "error";
    job.endedAt = new Date().toISOString();
    job.error = err?.message || String(err);
    emitter.emit("error", job.error);
  }
}

// 1) Inicia el job y devuelve jobId
router.post("/documentos/send-json/start", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : req.body?.data;
    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({
        message: "Body inválido: se espera arreglo o { data: [...] }.",
      });
    }

    const jobId = genJobId();
    const job = {
      emitter: new EventEmitter(),
      status: "queued",
      logBuffer: [],
      summary: null,
      startedAt: null,
      endedAt: null,
      error: null,
    };
    jobs.set(jobId, job);

    // corre asíncrono (no bloquear la respuesta)
    setImmediate(() => runJob(jobId, payload));

    return res.json({ jobId });
  } catch (e) {
    console.error("Error en /documentos/send-json/start:", e?.message || e);
    return res
      .status(500)
      .json({ message: "Error iniciando job", error: e?.message || String(e) });
  }
});

// 2) SSE: envía logs en vivo
router.get("/documentos/send-json/stream", async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId || !jobs.has(jobId)) {
      return res.status(404).send("jobId no encontrado");
    }

    // Headers SSE
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // CORS si tu front está en otro dominio/puerto
    res.setHeader("Access-Control-Allow-Origin", "*");

    const job = jobs.get(jobId);
    const send = (data) => res.write(`data: ${data}\n\n`);
    const sendJSON = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    // Si hay backlog, envíalo primero (para no perder nada si el stream se conecta tarde)
    if (job.logBuffer.length) {
      // Unimos por líneas y mandamos como un bloque inicial
      send(job.logBuffer.join("\n") + "\n");
    }

    // Suscribirse a eventos
    const onLog = (lineOrChunk) => send(lineOrChunk);
    const onEnd = (summary) => {
      sendJSON({ type: "summary", summary });
      send("[[END]]"); // bandera para el front
      res.end();
      cleanup();
    };
    const onError = (msg) => {
      sendJSON({ type: "error", message: msg });
      send("[[END]]");
      res.end();
      cleanup();
    };

    job.emitter.on("log", onLog);
    job.emitter.on("end", onEnd);
    job.emitter.on("error", onError);

    // Heartbeat para mantener la conexión viva en proxies
    const hb = setInterval(() => res.write(": ping\n\n"), 15000);

    const cleanup = () => {
      clearInterval(hb);
      job.emitter.off("log", onLog);
      job.emitter.off("end", onEnd);
      job.emitter.off("error", onError);
      // Opcional: limpiar job luego de X minutos
      setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000);
    };

    // Si el cliente cierra, limpiamos
    req.on("close", () => {
      cleanup();
    });
  } catch (e) {
    console.error("Error en /documentos/send-json/stream:", e?.message || e);
    if (!res.headersSent) res.status(500).end();
  }
});

router.post("/guardar-preregistro", async (req, res) => {
  try {
    // Recibimos el array de objetos y el usuario_id (por defecto 1 como pediste)
    const { datos, usuario_id, logs } = req.body;

    // Validamos que datos sea un array para evitar errores de tipo en la DB
    if (!Array.isArray(datos)) {
      return res.status(400).send("El formato de datos debe ser un array");
    }

    // Insertamos todo el JSON en una sola fila
    // Usamos JSON.stringify para asegurar que el objeto se envíe como cadena válida de JSON
    const query = `
      INSERT INTO onboarding.preregistro (usuario_id, datos, logs) 
      VALUES ($1, $2, $3) 
      RETURNING id, fechacreacion;
    `;

    const result = await pool.query(query, [
      usuario_id,
      JSON.stringify(datos),
      JSON.stringify(logs),
    ]);

    res.status(201).json({
      message: "Registro guardado exitosamente",
      id_generado: result.rows[0].id,
      fecha: result.rows[0].fechacreacion,
    });
  } catch (err) {
    console.error("Error al guardar preregistro:", err.message);
    res.status(500).send("Error en el servidor al procesar el insert");
  }
});

// --- CONSULTA PARA EL DATAGRID (DESGLOSAR JSON) ---
router.get("/obtener-preregistro/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const query = `
      SELECT 
        row_number() OVER () AS id_grid,
        elemento->>'rifEmpresa' AS rif_empresa,
        elemento->'usuariosSolicitud'->0->>'nroCedula' AS cedula,
        elemento->'usuariosSolicitud'->0->>'primerNombre' AS nombre,
        elemento->'usuariosSolicitud'->0->>'primerApellido' AS apellido,
        elemento->'usuariosSolicitud'->0->>'correousuario' AS correo,
        elemento->'usuariosSolicitud'->0->>'direccion' AS direccion,
        elemento->'usuariosSolicitud'->0->>'telefonoCelular' AS telefono
      FROM 
        onboarding.preregistro, 
        jsonb_array_elements(datos) AS elemento
      WHERE 
        usuario_id = $1
      ORDER BY id_grid DESC;
    `;
    const result = await pool.query(query, [usuarioId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener datos");
  }
});

router.post("/notificar-cliente", async (req, res) => {
  // Recibimos 'mensaje' además del email
  let { email, mensaje } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });
  if (!mensaje)
    mensaje = "Su ficha presenta observaciones que requieren su atención.";

  try {
    const currentYear = new Date().getFullYear();

    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: email,
      subject: "Observaciones - Plataforma de Registro de Nuevo Cliente",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ff6600; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
          </div>
          
          <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <h3 style="color: #ff6600;">Reciba usted un cordial saludo de Mercosur Casa de Bolsa, S.A.</h3>
            <p>Su ficha actualmente presenta las siguientes observaciones:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6600; margin: 20px 0; white-space: pre-line;">
              ${mensaje}
            </div>
                      
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #999999; text-align: center;">
              Este es un correo automático, por favor no responda a esta dirección.<br>
              © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Correo de notificación enviado." });
  } catch (error) {
    console.error("Error en el proceso de notificación:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

// Para actualizar las fichas firmadas
const XLSX = require("xlsx");
router.post(
  "/fichas/firmadas/stream",
  upload.fields([{ name: "archivo", maxCount: 1 }]),
  async (req, res) => {
    // 1. Mover la validación del archivo al principio antes de abrir los headers del stream
    if (!req.files?.archivo) {
      return res.status(400).json({ error: "No se recibió el archivo" });
    }

    // Ahora que Multer procesó los archivos con éxito, req.body está 100% garantizado
    const { usuarioBoId } = req.body;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let archivo;
    try {
      archivo = req.files["archivo"][0];
      const workbook = XLSX.readFile(archivo.path);
      const data = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      const sqlPermitidas = `SELECT regexp_replace(cedula::text, '[^0-9]', '', 'g') as cedula_limpia FROM onboarding.view_reporte_detallado WHERE bol_ficha_completa = true AND bol_verificacion_datos = true AND bol_verificacion_agile_check = true AND bol_verificacion_pep = false AND bol_verificacion_noticrimen = false AND bol_devuelta = false AND bol_rechazada = false AND bol_verificacion_aprobada = true AND bol_firma = false AND bol_eliminado = false`;
      const resultPermitidas = await pool.query(sqlPermitidas);
      const cedulasPermitidas = new Set(
        resultPermitidas.rows.map((r) => r.cedula_limpia),
      );

      let actualizados = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const cedulaLimpia = String(
          row.cedula || row.Cedula || row["cedula"] || "",
        )
          .replace(/[^0-9]/g, "")
          .trim();
        let fueActualizado = false;

        if (cedulasPermitidas.has(cedulaLimpia.trim())) {
          const updateResult = await pool.query(
            "UPDATE \"onboarding\".fichas SET bol_firma = true, fecha_actualizacion = NOW(), usuario_activo_cumplimiento_id = $2 WHERE regexp_replace(str_cedula, '[^0-9]', '', 'g') = $1",
            [cedulaLimpia, usuarioBoId],
          );
          if (updateResult.rowCount > 0) {
            actualizados++;
            fueActualizado = true;
          }
        }

        res.write(
          `data: ${JSON.stringify({ progreso: i + 1, total: data.length, actualizados, cedulaActual: cedulaLimpia, fueActualizado })}\n\n`,
        );
      }

      res.write(
        `data: ${JSON.stringify({ finalizado: true, actualizados })}\n\n`,
      );
      res.end();
    } catch (err) {
      // Modificación para que el frontend sepa que hubo un fallo catastrófico
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } finally {
      if (archivo?.path) fs.unlinkSync(archivo.path);
    }
  },
);

router.post("/moverFichasFirmadas", async (req, res) => {
  try {
    const { clientesSeleccionados, usuarioBoId } = req.body;

    // Usamos ANY($1) para que Postgres compare el ID contra cada elemento del array
    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET bol_firma = true, fecha_actualizacion = NOW(), usuario_activo_cumplimiento_id = $2
        WHERE id = ANY($1)
        RETURNING *;
      `;

    // Pasamos el array directamente como primer elemento del arreglo de valores
    const result = await pool.query(sqlUpdateFichas, [
      clientesSeleccionados,
      usuarioBoId,
    ]);

    res.status(200).json({
      message: "Clientes movidos a fichas firmadas exitosamente",
      count: result.rowCount, // Es mejor devolver la cantidad de filas afectadas
      data: result.rows,
    });
  } catch (err) {
    console.error("Error al mover clientes", err.message);
    res.status(500).json({
      error: "Error al mover clientes a fichas firmadas",
      message: err.message,
    });
  }
});

const archiver = require("archiver");

router.post(
  "/fichas/descargarCedulas",
  upload.fields([{ name: "archivo", maxCount: 1 }]),
  async (req, res) => {
    try {
      if (!req.files?.archivo) throw new Error("No se recibió el archivo");

      const archivoExcel = req.files["archivo"][0];
      const workbook = XLSX.readFile(archivoExcel.path);
      const data = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      const listaCedulas = data
        .map((f) => f.CEDULA || f.cedula)
        .filter(Boolean)
        .map((c) => c.toString().trim());

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // 1. Consultar rutas en la DB
      const query = `SELECT str_cedula, str_ruta_cedula FROM onboarding.fichas WHERE str_cedula IN (${listaCedulas.map((_, i) => `$${i + 1}`).join(",")})`;
      const result = await pool.query(query, listaCedulas);

      if (result.rows.length === 0) {
        res.write(
          `data: ${JSON.stringify({ message: "No se encontraron archivos", status: "error" })}\n\n`,
        );
        return res.end();
      }

      // 2. Crear el archivo ZIP temporal
      const nombreZip = `cedulas_${Date.now()}.zip`;
      const rutaZip = path.join("/var/www/uploads", nombreZip);
      const output = fs.createWriteStream(rutaZip);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);

      // 3. Agregar archivos al ZIP
      result.rows.forEach((ficha) => {
        const nombreLimpio = ficha.str_ruta_cedula.split("/").pop();
        const rutaAbsoluta = path.join("/var/www/uploads", nombreLimpio);

        if (fs.existsSync(rutaAbsoluta)) {
          archive.file(rutaAbsoluta, { name: nombreLimpio });
        }
      });

      await archive.finalize();

      // 4. Esperar a que el stream se cierre y enviar el LINK ÚNICO
      output.on("close", () => {
        const encontradas = new Set(
          result.rows.map((r) => r.str_cedula.toString()),
        );
        const fallidas = listaCedulas.filter((c) => !encontradas.has(c));

        res.write(
          `data: ${JSON.stringify({
            message: "ZIP generado con éxito",
            linkDescarga: nombreZip, // Enviamos el nombre del ZIP
            fallidas,
            status: "completado",
          })}\n\n`,
        );
        res.end();
      });
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({ message: err.message, status: "error" })}\n\n`,
      );
      res.end();
    }
  },
);

router.get("/opcionesMenu", async (req, res) => {
  try {
    const { usuarioBoId } = req.query;

    const query = `SELECT o.id, o.str_nombre
      FROM public.usuarios_bo u
      JOIN public.roles r ON u.rol_id = r.id
      JOIN public.roles_opciones ro ON r.id = ro.rol_id
      JOIN public.opciones o ON ro.opcion_id = o.id
      WHERE u.id = $1 
        AND r.bol_eliminado = false
        AND o.bol_eliminado = false`;

    const result = await pool.query(query, [usuarioBoId]);

    if (result.rows.length === 0) {
      // Es más informativo devolver null o un 404 si la ficha no existe
      return res.status(404).json({ message: "Opciones no encontradas" });
    }

    res.json(result.rows);
  } catch (err) {
    // Es buena práctica imprimir el error completo para debuguear
    console.error("Error en opcionesMenu:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/notificar-cliente-pep", async (req, res) => {
  let { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });

  // Convertimos a array si viene un solo string para procesar siempre una lista
  const emailList = Array.isArray(email) ? email : [email];

  try {
    const currentYear = new Date().getFullYear();

    // Mapeamos cada email para crear una promesa de envío individual
    const emailPromises = emailList.map((targetEmail) => {
      return transporter.sendMail({
        from: `"Mercosur Casa de Bolsa, S.A." <registrocliente@mercosur.com.ve>`,
        to: targetEmail,
        subject:
          "Declaración de Persona Expuesta Políticamente (PEP) y solicitud de recaudos adicionales",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ff6600; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
            </div>
            
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
              <h3 style="color: #ff6600; margin-top: 0;">Estimado(a)</h3>
              <p>Reciba un cordial saludo.</p>
              
              <p>En atención a la solicitud de apertura de Cuenta de Corretaje Bursátil, y como parte del proceso de Debida Diligencia, le informamos que su perfil ha sido identificado como Persona Expuesta Políticamente (PEP), de conformidad con la normativa legal y regulatoria vigente.</p>
              
              <p>En tal sentido, a fin de continuar con la evaluación de su solicitud, agradecemos completar la Declaración de Persona Expuesta Políticamente (PEP) que se anexa al presente correo, así como consignar los siguientes recaudos adicionales:</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6600; margin: 20px 0;">
                <strong style="color: #ff6600;">Recaudos requeridos:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  <li>Declaración de Persona Expuesta Políticamente (PEP), debidamente llenada y firmada (adjunta en el correo).</li>
                  <li>Constancia de trabajo o informe de atestiguamiento en caso de trabajar de manera independiente.</li>
                  <li>Referencia bancaria actualizada.</li>
                </ul>
              </div>
              
              <p>Al respecto, deberá remitir la documentación solicitada en formato digital, legible y vigente, a través de este mismo medio, indicando en el asunto su nombre completo y número de cédula.</p>
              <p>La información suministrada será tratada con estricta confidencialidad y utilizada exclusivamente para dar cumplimiento a nuestras políticas internas y a la aprobación y creación de su solicitud.</p>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
              <p style="font-size: 0.8rem; color: #999999; text-align: center;">
                Este es un correo automático, por favor no responda a esta dirección.<br>
                © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
              </p>
            </div>
          </div>
        `,

        /*
          <p>Si tienes alguna pregunta, nuestro equipo está listo para ayudarte:<br>
          <a href="https://wa.me/584149277412" target="_blank" style="color: #ff6600; text-decoration: none;"><strong>+584149277412</strong></a></p>
        */
        // Se añade la propiedad attachments para adjuntar el PDF
        attachments: [
          {
            filename: "Declaración PEP - Mercosur Casa de Bolsa S.A.pdf",
            path: path.join(
              __dirname,
              "../assets/Declaración PEP - Mercosur Casa de Bolsa S.A.pdf",
            ),
          },
        ],
      });
    });

    // Esperamos a que se envíen todos los correos
    await Promise.all(emailPromises);

    res.status(200).json({
      message:
        "Correos de notificación enviados con éxito con el archivo adjunto.",
    });
  } catch (error) {
    console.error("Error en el proceso de notificación:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

router.post("/actualizarestatusagilecheck", async (req, res) => {
  try {
    const { cedulas, usuarioBoId } = req.body;

    //console.log("Cedulas recibidas para actualización:", cedulas);

    // Usamos ANY($1) para que Postgres compare el ID contra cada elemento del array
    const sqlUpdateFichas = `
        UPDATE "onboarding".fichas
        SET bol_agilecheck = true, fecha_actualizacion = NOW(), usuario_creo_matriz_id = $2
        WHERE str_cedula = ANY($1)
        RETURNING *;
      `;

    // Pasamos el array directamente como primer elemento del arreglo de valores
    const result = await pool.query(sqlUpdateFichas, [cedulas, usuarioBoId]);

    res.status(200).json({
      message:
        "Clientes marcados con matriz de riesgo Agile Check exitosamente",
      count: result.rowCount, // Es mejor devolver la cantidad de filas afectadas
      data: result.rows,
    });
  } catch (err) {
    console.error(
      "Error al marcar clientes con matriz de riesgo Agile Check",
      err.message,
    );
    res.status(500).json({
      error: "Error al marcar clientes con matriz de riesgo Agile Check",
      message: err.message,
    });
  }
});

router.post("/crearCliente", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validar requerimiento antes de consultar a la BD
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "El correo electrónico es requerido.",
      });
    }

    const emailLimpio = email.trim().toLowerCase();

    // 2. Ejecutar el procedimiento almacenado en la BD
    const query = `CALL onboarding.sp_guardar_cascada($1, $2)`;
    await pool.query(query, [emailLimpio, "123456"]);

    // 3. Consultar el usuario recién creado
    const sqlConsulta = `
      SELECT id, email 
      FROM public.usuarios 
      WHERE lower(email) = lower($1);
    `;

    const result = await pool.query(sqlConsulta, [emailLimpio]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado tras la creación.",
      });
    }

    // 4. Generar Token JWT
    const jwtSecret = process.env.JWT_SECRET || "secret";
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "1h" },
    );

    // 5. Guardar el token en la tabla auth_tokens (expira en 1 hora)
    const expiresAt = new Date(Date.now() + 3600000);
    await pool.query(
      "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, accessToken, expiresAt],
    );

    // 6. Respuesta exitosa con el token generado
    return res.status(201).json({
      message: "Cliente creado exitosamente",
      accessToken,
    });
  } catch (err) {
    // Limpiamos los prefijos del error si existen
    let mensajeLimpio =
      err.message || "Error en el servidor al crear el cliente.";

    // Remueve "Error al crear cliente:", "Error en el guardado en cascada:" o combinaciones
    mensajeLimpio = mensajeLimpio
      .replace(/^Error al crear cliente:\s*/i, "")
      .replace(/^Error en el guardado en cascada:\s*/i, "");

    return res.status(400).json({
      message: mensajeLimpio,
    });
  }
});

router.post("/eliminarCliente", async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    // Validar que el correo no venga vacío
    if (!email) {
      // El bloque finally liberará el cliente adecuadamente al retornar
      return res.status(400).json({ message: "El correo es requerido." });
    }

    // Iniciar transacción
    await client.query("BEGIN");

    // 2. Consultar el estado actual
    const sqlConsulta = `
      SELECT estado_actual, id, correo 
      FROM onboarding.view_estatus_general 
      WHERE lower(correo) = lower($1);
    `;

    const result = await client.query(sqlConsulta, [email]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: `No se ha encontrado una ficha asociada al correo: ${email}`,
      });
    }

    const cliente = result.rows[0];

    // 3. Validar estado de la ficha
    if (cliente.estado_actual !== "Fichas Nuevas") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `No se puede eliminar debido a que la ficha se encuentra en ${cliente.estado_actual}`,
      });
    }

    // 4. Marcar como eliminado
    const sqlUpdateFichas = `
      UPDATE onboarding.fichas
      SET bol_eliminado = true
      WHERE usuario_id = (SELECT id FROM public.usuarios WHERE lower(email) = lower($1))
      RETURNING *;
    `;

    await client.query(sqlUpdateFichas, [email]);

    // 5. Ejecutar procedimiento almacenado
    const queryProcedure = `CALL onboarding.sp_eliminar_fichas_marcadas()`;
    await client.query(queryProcedure);

    // Confirmar cambios
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Ficha eliminada exitosamente",
    });
  } catch (err) {
    // Si algo falla en cualquier punto, revertimos la transacción
    await client.query("ROLLBACK");

    return res.status(500).json({
      message: `Error al eliminar cliente: ${err.message}`,
    });
  } finally {
    // Se libera la conexión del pool ÚNICAMENTE AQUÍ de forma segura
    client.release();
  }
});

/* router.post("/notificar-cliente-recordatorio", async (req, res) => {
  // Ahora esperamos que 'email' pueda ser un string o un array de strings
  let { email, mensaje, asunto, usuarioBoId, fichas_id } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });
  //if (!mensaje) mensaje = "Su ficha presenta secciones aun sin completar.";

  // Si viene un solo email como string, lo convertimos en array para unificar el proceso
  const emailsArray = Array.isArray(email) ? email : [email];

  try {
    const currentYear = new Date().getFullYear();

    //console.log(`Enviando mensajes a ${emailsArray.length} destinatarios:`, mensaje);

    // Iteramos sobre el arreglo de correos
    for (const destinatario of emailsArray) {
      await transporter_gmail.sendMail({
        from: `"Mercosur Casa de Bolsa, S.A." <serviciosautomaticos@mercosur.com.ve>`,
        to: destinatario, // Enviamos a cada uno
        subject: `KYC Clik App Mercosur Casa de Bolsa, S.A. - ${asunto}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #ff6600; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
              </div>
              
              <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h3 style="color: #ff6600;">Reciba usted un cordial saludo de Mercosur Casa de Bolsa, S.A.</h3>
                <p>Estimado cliente:</p>
                
                <!-- Bloque de observaciones que viene del TextField -->
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6600; margin: 20px 0; white-space: pre-line;">${mensaje ? mensaje.trim() : ""}</div>

                <!-- Botón de Acción con la URL -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://clientsapp.mercosur.com.ve/login" 
                    style="background-color: #ff6600; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 1rem;">
                    Ingresar al Portal de Clientes
                  </a>
                </div>
                          
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #999999; text-align: center;">
                  Este es un correo automático, por favor no responda a esta dirección.<br>
                  © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
                </p>
              </div>
            </div>
          `,
      });
    }

    //console.log(fichas_id);

    const valoresFicha = [fichas_id, usuarioBoId];

    const sqlUpdateFichas = `
      UPDATE "onboarding".fichas
      SET bol_pausa = true, usuario_pausa_cumplimiento_id = $2
      WHERE id IN (
        SELECT id
        FROM onboarding.view_reporte_detallado
        WHERE id = ANY($1)
      )
      RETURNING *;`;

    const result = await pool.query(sqlUpdateFichas, valoresFicha);

    res
      .status(200)
      .json({ message: "Correos de notificación enviados con éxito." });
  } catch (error) {
    console.error("Error en el proceso de notificación:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}); */

router.post("/notificar-cliente-recordatorio", async (req, res) => {
  let {
    email,
    mensaje = "",
    asunto = "Recordatorio",
    usuarioBoId,
    fichas_id,
  } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });
  if (!fichas_id)
    return res.status(400).json({ error: "Identificador de ficha requerido" });

  const emailsArray = Array.isArray(email) ? email : [email];
  const arrayFichas = Array.isArray(fichas_id) ? fichas_id : [fichas_id];

  try {
    const currentYear = new Date().getFullYear();

    // 1. Envío de correos
    for (const destinatario of emailsArray) {
      if (!destinatario) continue; // Salta elementos vacíos

      await transporter_gmail.sendMail({
        from: `"Mercosur Casa de Bolsa, S.A." <mercosurcasadebolsa@gmail.com>`,
        to: destinatario,
        subject: `KYC Clik App Mercosur Casa de Bolsa, S.A. - ${asunto}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #ff6600; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
              </div>
              
              <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h3 style="color: #ff6600;">Reciba usted un cordial saludo de Mercosur Casa de Bolsa, S.A.</h3>
                <p>Estimado cliente:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6600; margin: 20px 0; white-space: pre-line;">${mensaje ? mensaje.trim() : ""}</div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://clientsapp.mercosur.com.ve/login" 
                    style="background-color: #ff6600; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 1rem;">
                    Ingresar al Portal de Clientes
                  </a>
                </div>
                          
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #999999; text-align: center;">
                  Este es un correo automático, por favor no responda a esta dirección.<br>
                  © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
                </p>
              </div>
            </div>
          `,
      });
    }

    // 2. Actualización en Base de Datos
    const sqlUpdateFichas = `
      UPDATE "onboarding".fichas
      SET bol_pausa = true, usuario_pausa_cumplimiento_id = $2
      WHERE id IN (
        SELECT id
        FROM onboarding.view_reporte_detallado
        WHERE id = ANY($1::int[])
      )
      RETURNING *;`;

    const result = await pool.query(sqlUpdateFichas, [
      arrayFichas,
      usuarioBoId,
    ]);

    res.status(200).json({
      message: "Correos de notificación enviados con éxito.",
      fichasActualizadas: result.rows.length,
    });
  } catch (error) {
    // Imprime la traza completa en la consola del Backend para auditar la causa exacta
    console.error("Error detallado en /notificar-cliente-recordatorio:", error);
    res.status(500).json({ error: "Error interno al procesar la solicitud." });
  }
});

module.exports = router;
