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
    // Obtenemos un cliente del pool para manejar la transacción de forma segura
    const client = await pool.connect();

    try {
      // Iniciamos la transacción SQL
      await client.query("BEGIN");

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

      const usuarioIdSesion = req.user?.id;

      // Obtener año y mes actual para el correlativo
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 1 - 12
      const monthStr = String(month).padStart(2, "0");

      // 💡 Operación Atómica (UPSERT): Incrementa el correlativo del mes/año actual en 1
      // de forma segura frente a concurrencia masiva.
      const seqResult = await client.query(
        `
        INSERT INTO tickets.tbl_secuencias_tickets (int_anio, int_mes, int_ultimo_secuencial)
        VALUES ($1, $2, 1)
        ON CONFLICT (int_anio, int_mes)
        DO UPDATE SET int_ultimo_secuencial = tickets.tbl_secuencias_tickets.int_ultimo_secuencial + 1
        RETURNING int_ultimo_secuencial;
        `,
        [year, month],
      );

      const nextNumber = seqResult.rows[0].int_ultimo_secuencial;

      // Generar código único robusto (ej: TCK-2026-10-000001)
      const str_ticket = `TCK${year}-${monthStr}-${String(nextNumber).padStart(6, "0")}`; // O ajusta con el prefijo "TCK-" si lo deseas completo: `TCK-${year}-${monthStr}-${String(nextNumber).padStart(6, "0")}`

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

      // Inserción en la tabla de tickets usando el cliente de la transacción
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

      const nuevoTicket = await client.query(queryInsert, values);

      // Si todo sale bien, confirmamos los cambios en la base de datos
      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Ticket creado y archivos multimedia guardados exitosamente.",
        ticket: nuevoTicket.rows[0],
      });
    } catch (err) {
      // Si ocurre cualquier error, revertimos cualquier cambio realizado
      await client.query("ROLLBACK");
      console.error("Error al crear el ticket con multimedia:", err.message);
      res.status(500).json({
        success: false,
        error: "Error interno al procesar la solicitud del ticket.",
      });
    } finally {
      // Muy importante: Liberar el cliente de vuelta al pool de conexiones
      client.release();
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
