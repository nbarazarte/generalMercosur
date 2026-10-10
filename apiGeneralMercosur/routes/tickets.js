const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const verificarClienteFrontend = require("../middlewares/autenticarToken");
const verificarSesion = require("../middlewares/verificarSesion");
const upload = require("../middlewares/multerConfig"); // Middleware configurado en /var/www/uploads

// 🔒 Doble capa de seguridad global
router.use(verificarClienteFrontend);
router.use(verificarSesion);

// Endpoint para crear el ticket y subir archivos multimedia asociados
router.post(
  "/crear",
  upload.any(), // Acepta cualquier campo de archivo enviado desde el formulario multipart/form-data
  async (req, res) => {
    try {
      const {
        cliente_id,
        cierre_agente_id,
        departamento_id,
        categoria_id,
        prioridad_id,
        estatus_id,
        canal_id,
        str_asunto,
        str_descripcion,
        int_sla,
        usuario_asignado_id, // Capturamos el usuario_asignado_id opcional enviado desde el frontend
      } = req.body;

      /* console.table({
        cliente_id,
        cierre_agente_id,
        departamento_id,
        categoria_id,
        prioridad_id,
        estatus_id,
        canal_id,
        str_asunto,
        str_descripcion,
        int_sla,
        usuario_asignado_id,
      }); */

      const usuarioIdSesion = req.usuario?.id; // viene de la sesion activa y lo obtengo del middelware de verificacion

      // Generar código único para el ticket (ej: TCK-2026-0006)
      const ticketSeqResult = await pool.query(
        "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM tickets.tbl_tickets",
      );
      const nextId = ticketSeqResult.rows[0].next_id;
      const str_ticket = `TCK-${new Date().getFullYear()}-${String(nextId).padStart(4, "0")}`;

      // Clasificación de los archivos subidos por multer
      const archivos = req.files || [];
      const rutasImagenes = [];
      const rutasVideos = [];
      const rutasAudios = [];

      archivos.forEach((file) => {
        const rutaCompleta = `/var/www/uploads/${file.filename}`;
        const tipoMime = file.mimetype;

        if (tipoMime.startsWith("image/")) {
          rutasImagenes.push(rutaCompleta);
        } else if (tipoMime.startsWith("video/")) {
          rutasVideos.push(rutaCompleta);
        } else if (tipoMime.startsWith("audio/")) {
          rutasAudios.push(rutaCompleta);
        }
      });

      // Convertir arreglos a cadenas separadas por coma (si hay múltiples archivos del mismo tipo)
      const str_ruta_imagen =
        rutasImagenes.length > 0 ? rutasImagenes.join(",") : null;
      const str_ruta_video =
        rutasVideos.length > 0 ? rutasVideos.join(",") : null;
      const str_ruta_audio =
        rutasAudios.length > 0 ? rutasAudios.join(",") : null;

      // Inserción en la base de datos incluyendo usuario_asignado_id
      const queryInsert = `
        INSERT INTO tickets.tbl_tickets (
          str_ticket, cliente_id, creador_agente_id, cierre_agente_id, 
          departamento_id, categoria_id, prioridad_id, estatus_id, 
          canal_id, str_asunto, str_descripcion, int_sla, 
          str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const values = [
        str_ticket,
        cliente_id || null,
        usuarioIdSesion, // es el valor que se guarda en creador_agente_id de la tabla
        cierre_agente_id || null,
        departamento_id,
        categoria_id,
        prioridad_id,
        estatus_id,
        canal_id,
        str_asunto,
        str_descripcion,
        int_sla,
        str_ruta_imagen,
        str_ruta_video,
        str_ruta_audio,
        usuario_asignado_id ? Number(usuario_asignado_id) : null, // que pertenece a departamento_id
      ];

      const nuevoTicket = await pool.query(queryInsert, values);

      res.status(201).json({
        success: true,
        message: "Ticket creado y archivos multimedia guardados exitosamente.",
        ticket: nuevoTicket.rows[0],
      });
    } catch (err) {
      console.error("Error al crear el ticket con multimedia:", err.message);
      res.status(500).json({
        success: false,
        error: "Error interno al procesar la solicitud del ticket.",
      });
    }
  },
);

// Endpoint para obtener el listado de departamentos desde public.cat_departamentos
router.get("/departamentos", async (req, res) => {
  try {
    const query = `
      SELECT id, str_nombre, str_descripcion 
      FROM public.cat_departamentos 
      ORDER BY str_nombre ASC;
    `;
    const resultado = await pool.query(query);

    res.status(200).json({
      success: true,
      departamentos: resultado.rows,
    });
  } catch (err) {
    console.error("Error al obtener los departamentos:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener los departamentos.",
    });
  }
});

// Endpoint para obtener el listado de departamentos y usuarios asociados
router.get("/departamentos-usuarios", async (req, res) => {
  try {
    const queryDept = `
      SELECT id, str_nombre, str_descripcion 
      FROM public.cat_departamentos 
      ORDER BY str_nombre ASC;
    `;
    const queryUsers = `
      SELECT id, departamento_id, str_nombre, str_apellido, str_email, bol_activo 
      FROM public.tbl_usuarios 
      WHERE bol_activo = true 
      ORDER BY str_nombre ASC;
    `;

    const [resDept, resUsers] = await Promise.all([
      pool.query(queryDept),
      pool.query(queryUsers),
    ]);

    res.status(200).json({
      success: true,
      departamentos: resDept.rows,
      usuarios: resUsers.rows,
    });
  } catch (err) {
    console.error("Error al obtener departamentos y usuarios:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener catálogos.",
    });
  }
});

// Endpoint para obtener listas maestras desde public.cat_datos_maestros
router.get("/datos-maestros", async (req, res) => {
  try {
    const query = `
      SELECT id, str_tipo, str_nombre, str_descripcion, bol_activo 
      FROM public.cat_datos_maestros 
      WHERE bol_activo = true 
      ORDER BY str_tipo, id ASC;
    `;
    const resultado = await pool.query(query);

    const datos = resultado.rows;
    const canales = datos.filter((item) => item.str_tipo === "CANAL");
    const categorias = datos.filter((item) => item.str_tipo === "CATEGORIA");
    const prioridades = datos.filter((item) => item.str_tipo === "PRIORIDAD");

    res.status(200).json({
      success: true,
      canales,
      categorias,
      prioridades,
    });
  } catch (err) {
    console.error("Error al obtener los datos maestros:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener los datos maestros.",
    });
  }
});

module.exports = router;
