const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const router = express.Router();
const pool = require("../db");
const autenticarToken = require("../middlewares/autenticarToken");
const upload = require("../middlewares/multerConfig");
const fs = require("fs");
const fsp = fs.promises;
const { EventEmitter } = require("events");
const path = require("path");
const { transporter, transporter_gmail } = require("../mailer");
const jwt = require("jsonwebtoken");

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

// Uso del middleware para proteger todas las rutas (A PARTIR DE AQUI SON PRIVADAS)
router.use(autenticarToken);

router.get("/fetchSistemas", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_sistemas_opciones`;

    const result = await pool.query(query);

    // Agrupamos los datos planos por sistema
    const sistemasEstructurados = Object.values(
      result.rows.reduce((acc, row) => {
        if (!acc[row.sistema_id]) {
          acc[row.sistema_id] = {
            id: row.sistema_id,
            nombre: row.str_sistema,
            ic: row.str_icono,
            color: "#d8992a",
            desc: row.str_descripcion,
            ruta_sistema: row.str_ruta_sistema,
            opciones: [],
          };
        }

        if (row.opcion_id) {
          acc[row.sistema_id].opciones.push({
            id: row.opcion_id,
            opcion: row.opcion_nombre,
            ruta_opcion: row.str_ruta_opcion,
            ic: "FiCheckSquare",
          });
        }

        return acc;
      }, {}),
    );

    //console.log(JSON.stringify(sistemasEstructurados, null, 2));

    res.json({ sistemas: sistemasEstructurados });
  } catch (err) {
    console.error("Error al obtener sistemas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* router.post("/rolOpciones", async (req, res) => {
  try {
    // 1. Obtener los parámetros enviados desde el cuerpo de la petición (POST)
    const { usuario_id, sistema } = req.body;

    // 2. Definir los valores de los parámetros en orden ($1, $2)
    const queryParams = [usuario_id, sistema];

    // 3. Consulta parametrizada sin comillas en los marcadores de posición
    const query = `
      SELECT usuario_id, rol, sistema, ruta_sistema, opcion, ruta_opcion, tiene_permiso
      FROM public.view_usuarios_opciones_sistemas 
      WHERE usuario_id = $1
        AND sistema = $2
        AND tiene_permiso = true;
    `;

    const result = await pool.query(query, queryParams);

    res.json({ rows: result.rows });
  } catch (err) {
    console.error("Error en admin:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}); */

module.exports = router;
