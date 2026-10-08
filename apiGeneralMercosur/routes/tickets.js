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
        creador_agente_id,
        cierre_agente_id,
        departamento_id,
        categoria_id,
        prioridad_id,
        estatus_id,
        canal_id,
        str_asunto,
        str_descripcion,
        int_sla,
      } = req.body;

      const usuarioIdSesion = req.usuario?.id || creador_agente_id || 1;

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

      // Inserción en la base de datos
      const queryInsert = `
        INSERT INTO tickets.tbl_tickets (
          str_ticket, cliente_id, creador_agente_id, cierre_agente_id, 
          departamento_id, categoria_id, prioridad_id, estatus_id, 
          canal_id, str_asunto, str_descripcion, int_sla, 
          str_ruta_imagen, str_ruta_video, str_ruta_audio, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const values = [
        str_ticket,
        cliente_id || 1, // Valor por defecto o dinámico según tu lógica de clientes
        usuarioIdSesion,
        cierre_agente_id || null,
        departamento_id || 1,
        categoria_id,
        prioridad_id,
        estatus_id || 1, // Pendiente por defecto
        canal_id,
        str_asunto,
        str_descripcion,
        int_sla || 24,
        str_ruta_imagen,
        str_ruta_video,
        str_ruta_audio,
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

module.exports = router;
