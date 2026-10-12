const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const verificarClienteFrontend = require("../middlewares/autenticarToken");
const verificarSesion = require("../middlewares/verificarSesion");
const upload = require("../middlewares/multerConfig"); // Middleware configurado en /var/www/uploads
const path = require("path");
const fs = require("fs");

// 🔒 Doble capa de seguridad global
router.use(verificarClienteFrontend);
router.use(verificarSesion);

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
    const categoria_externa = datos.filter(
      (item) => item.str_tipo === "CATEGORIA_EXTERNA",
    );
    const categoria_interna = datos.filter(
      (item) => item.str_tipo === "CATEGORIA_INTERNA",
    );
    const prioridades = datos.filter((item) => item.str_tipo === "PRIORIDAD");
    const tipoTicket = datos.filter((item) => item.str_tipo === "TIPO_TICKET");
    const estatus = datos.filter((item) => item.str_tipo === "ESTATUSTICKET");

    res.status(200).json({
      success: true,
      canales,
      categoria_externa,
      categoria_interna,
      prioridades,
      tipoTicket,
      estatus,
    });
  } catch (err) {
    console.error("Error al obtener los datos maestros:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener los datos maestros.",
    });
  }
});

// Endpoint para crear el ticket y subir archivos multimedia asociados
router.post("/crear", upload.any(), async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      tipo_ticket_id,
      cliente_id,
      cierre_agente_id,
      departamento_id,
      categoria_id,
      prioridad_id,
      canal_id,
      str_asunto,
      str_descripcion,
      usuario_asignado_id,
      str_cedula_cliente,
      str_correo_cliente,
    } = req.body;

    const usuarioIdSesion = req.user?.id;

    // Obtener año y mes actual para el correlativo
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, "0");

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
    const str_ticket = `TCK${year}-${monthStr}-${String(nextNumber).padStart(6, "0")}`;

    const slaQuery = `
        SELECT tiempo_maximo 
        FROM tickets.sla_configuracion 
        WHERE categoria_id = $1 AND prioridad_id = $2 AND activo = true;
      `;
    const slaRes = await client.query(slaQuery, [categoria_id, prioridad_id]);
    const horasSla = slaRes.rows.length > 0 ? slaRes.rows[0].tiempo_maximo : 24;

    const archivos = req.files || [];
    const rutasImagenes = [];
    const rutasVideos = [];
    const rutasAudios = [];

    // Contadores independientes para el sufijo numérico
    let contadorImagen = 1;
    let contadorVideo = 1;
    let contadorAudio = 1;

    archivos.forEach((file) => {
      const tipoMime = file.mimetype;
      const extension = path.extname(file.originalname); // Obtiene la extensión (.jpg, .png, etc.)

      let nuevoNombreArchivo = "";

      if (tipoMime.startsWith("image/")) {
        nuevoNombreArchivo = `${str_ticket}-${contadorImagen}${extension}`;
        contadorImagen++;
      } else if (tipoMime.startsWith("video/")) {
        nuevoNombreArchivo = `${str_ticket}-vid-${contadorVideo}${extension}`;
        contadorVideo++;
      } else if (tipoMime.startsWith("audio/")) {
        nuevoNombreArchivo = `${str_ticket}-aud-${contadorAudio}${extension}`;
        contadorAudio++;
      } else {
        nuevoNombreArchivo = `${str_ticket}-file-${contadorImagen}${extension}`;
        contadorImagen++;
      }

      const rutaAntigua = file.path; // Ruta temporal donde multer lo guardó
      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);

      // Renombrar y mover físicamente el archivo en el servidor
      try {
        fs.renameSync(rutaAntigua, rutaNueva);
      } catch (renameErr) {
        console.error(
          "Error al renombrar el archivo físico:",
          renameErr.message,
        );
      }

      const rutaCompletaBD = `/var/www/uploads/${nuevoNombreArchivo}`;

      if (tipoMime.startsWith("image/")) {
        rutasImagenes.push(rutaCompletaBD);
      } else if (tipoMime.startsWith("video/")) {
        rutasVideos.push(rutaCompletaBD);
      } else if (tipoMime.startsWith("audio/")) {
        rutasAudios.push(rutaCompletaBD);
      }
    });

    const str_ruta_imagen =
      rutasImagenes.length > 0 ? rutasImagenes.join(",") : null;
    const str_ruta_video =
      rutasVideos.length > 0 ? rutasVideos.join(",") : null;
    const str_ruta_audio =
      rutasAudios.length > 0 ? rutasAudios.join(",") : null;

    const queryInsert = `
        INSERT INTO tickets.tbl_tickets (
          str_ticket, tipo_ticket_id, cliente_id, creador_agente_id, cierre_agente_id, 
          departamento_id, categoria_id, prioridad_id, 
          canal_id, str_asunto, str_descripcion, int_sla, 
          str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id, 
          str_cedula_cliente, str_correo_cliente,
          dmt_fecha_vencimiento_sla, created_at, updated_at
        ) VALUES (
          $1, $2::integer, $3::integer, $4::integer, $5::integer, 
          $6::integer, $7::integer, $8::integer, $9::integer, 
          $10::varchar, $11::text, $12::integer, 
          $13::text, $14::text, $15::text, $16::integer, 
          $17::varchar, $18::varchar,
          CURRENT_TIMESTAMP + ($12::integer * INTERVAL '1 hour'), 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP
        )
        RETURNING *;
      `;

    const values = [
      str_ticket,
      tipo_ticket_id ? Number(tipo_ticket_id) : null,
      cliente_id ? Number(cliente_id) : null,
      usuarioIdSesion ? Number(usuarioIdSesion) : null,
      cierre_agente_id ? Number(cierre_agente_id) : null,
      departamento_id ? Number(departamento_id) : null,
      categoria_id ? Number(categoria_id) : null,
      prioridad_id ? Number(prioridad_id) : null,
      canal_id ? Number(canal_id) : null,
      str_asunto || "",
      str_descripcion || "",
      Number(horasSla),
      str_ruta_imagen,
      str_ruta_video,
      str_ruta_audio,
      usuario_asignado_id ? Number(usuario_asignado_id) : null,
      str_cedula_cliente || null,
      str_correo_cliente || null,
    ];

    const nuevoTicket = await client.query(queryInsert, values);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Ticket creado y archivos multimedia renombrados exitosamente.",
      ticket: nuevoTicket.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al crear el ticket con multimedia:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al procesar la solicitud del ticket.",
    });
  } finally {
    client.release();
  }
});

// Endpoint para obtener el listado de tickets con filtros avanzados de fecha y relaciones completas
router.get("/listar", async (req, res) => {
  try {
    const {
      tipo_ticket_id,
      estatus_id,
      prioridad_id,
      canal_id,
      departamento_id,
      buscar,
      creacion_desde,
      creacion_hasta,
      cierre_desde,
      cierre_hasta,
      vencimiento_desde,
      vencimiento_hasta,
    } = req.query;

    let query = `SELECT * FROM tickets.view_listar_tickets t WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    if (tipo_ticket_id) {
      query += ` AND t.tipo_ticket_id = $${paramIndex++}`;
      params.push(Number(tipo_ticket_id));
    }
    if (estatus_id) {
      query += ` AND t.estatus_id = $${paramIndex++}`;
      params.push(Number(estatus_id));
    }
    if (prioridad_id) {
      query += ` AND t.prioridad_id = $${paramIndex++}`;
      params.push(Number(prioridad_id));
    }
    if (canal_id) {
      query += ` AND t.canal_id = $${paramIndex++}`;
      params.push(Number(canal_id));
    }
    if (departamento_id) {
      query += ` AND t.departamento_id = $${paramIndex++}`;
      params.push(Number(departamento_id));
    }
    if (creacion_desde) {
      query += ` AND t.created_at >= $${paramIndex++}::timestamp`;
      params.push(creacion_desde);
    }
    if (creacion_hasta) {
      query += ` AND t.created_at <= ($${paramIndex++}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`;
      params.push(creacion_hasta);
    }
    if (cierre_desde) {
      query += ` AND t.dmt_fecha_cierre >= $${paramIndex++}::timestamp`;
      params.push(cierre_desde);
    }
    if (cierre_hasta) {
      query += ` AND t.dmt_fecha_cierre <= ($${paramIndex++}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`;
      params.push(cierre_hasta);
    }
    if (vencimiento_desde) {
      query += ` AND t.dmt_fecha_vencimiento_sla >= $${paramIndex++}::timestamp`;
      params.push(vencimiento_desde);
    }
    if (vencimiento_hasta) {
      query += ` AND t.dmt_fecha_vencimiento_sla <= ($${paramIndex++}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`;
      params.push(vencimiento_hasta);
    }
    if (buscar) {
      query += ` AND (t.str_ticket ILIKE $${paramIndex} OR t.str_asunto ILIKE $${paramIndex} OR c.str_cedula ILIKE $${paramIndex} OR c.str_nombre ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC;`;

    const resultado = await pool.query(query, params);

    res.status(200).json({
      success: true,
      tickets: resultado.rows,
    });
  } catch (err) {
    console.error("Error al listar los tickets:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener los tickets.",
    });
  }
});

// Endpoint para actualizar estatus, departamento, agente, prioridad, SLA y respuesta de un ticket
router.put("/actualizar/:id", upload.any(), async (req, res) => {
  const { id } = req.params;
  const {
    estatus_id,
    usuario_asignado_id,
    departamento_id,
    prioridad_id,
    str_descripcion_respuesta,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const nuevoEstatus =
      estatus_id !== undefined && estatus_id !== "" ? Number(estatus_id) : null;

    const nuevoDepartamento =
      departamento_id !== undefined && departamento_id !== ""
        ? Number(departamento_id)
        : null;

    const nuevaPrioridad =
      prioridad_id !== undefined && prioridad_id !== ""
        ? Number(prioridad_id)
        : null;

    let nuevoAsignado = undefined;
    if (usuario_asignado_id !== undefined) {
      if (
        usuario_asignado_id === "" ||
        usuario_asignado_id === "null" ||
        usuario_asignado_id === null
      ) {
        nuevoAsignado = null;
      } else {
        nuevoAsignado = Number(usuario_asignado_id);
      }
    }

    // 1. Obtener la categoría actual del ticket y la prioridad actual (si no se envía una nueva)
    const ticketActualRes = await client.query(
      `SELECT categoria_id, prioridad_id FROM tickets.tbl_tickets WHERE id = $1`,
      [Number(id)],
    );

    if (ticketActualRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado." });
    }

    const categoriaId = ticketActualRes.rows[0].categoria_id;
    const prioridadAUtilizar =
      nuevaPrioridad !== null
        ? nuevaPrioridad
        : ticketActualRes.rows[0].prioridad_id;

    // 2. Consultar el SLA configurado usando la categoría y la prioridad[cite: 11]
    const slaQuery = `
      SELECT tiempo_maximo 
      FROM tickets.sla_configuracion 
      WHERE categoria_id = $1 AND prioridad_id = $2 AND activo = true;
    `;
    const slaRes = await client.query(slaQuery, [
      categoriaId,
      prioridadAUtilizar,
    ]);
    const horasSla = slaRes.rows.length > 0 ? slaRes.rows[0].tiempo_maximo : 24;

    // 3. Actualizar el ticket recalculando fechas y SLA.
    // Si el estatus cambia a En Proceso (ej: id u otro estatus activo que no sea cerrado/cancelado),
    // recalculamos la fecha de vencimiento a partir de CURRENT_TIMESTAMP.
    // Actualizar el ticket recalculando el SLA, la fecha de vencimiento y reiniciando la fecha de creación si se reactiva
    let queryUpdate = `
      UPDATE tickets.tbl_tickets 
      SET 
        estatus_id = COALESCE($1, estatus_id),
        usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
        departamento_id = COALESCE($3, departamento_id),
        prioridad_id = COALESCE($4, prioridad_id),
        int_sla = $5::integer,
        -- Si se pasa a un estatus activo (distinto de Cerrado [22]), actualizamos la creación y el vencimiento desde ahora
        created_at = CASE 
          WHEN $1::integer IS NOT NULL AND $1::integer <> 22 THEN CURRENT_TIMESTAMP 
          ELSE created_at 
        END,
        dmt_fecha_vencimiento_sla = CASE 
          WHEN $1::integer IS NOT NULL AND $1::integer <> 22 THEN CURRENT_TIMESTAMP + ($5::integer * INTERVAL '1 hour')
          ELSE dmt_fecha_vencimiento_sla 
        END,
        dmt_fecha_cierre = CASE 
          WHEN $1::integer = 22 AND dmt_fecha_cierre IS NULL THEN CURRENT_TIMESTAMP 
          WHEN $1::integer IS NOT NULL AND $1::integer <> 22 THEN NULL 
          ELSE dmt_fecha_cierre 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;

    const updateRes = await client.query(queryUpdate, [
      nuevoEstatus,
      nuevoAsignado,
      nuevoDepartamento,
      nuevaPrioridad,
      Number(horasSla),
      Number(id),
    ]);

    await client.query("COMMIT");
    res.status(200).json({
      success: true,
      message: "Ticket actualizado, fechas y SLA recalculados exitosamente.",
      ticket: updateRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar el ticket:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al actualizar el ticket.",
    });
  } finally {
    client.release();
  }
});

module.exports = router;
