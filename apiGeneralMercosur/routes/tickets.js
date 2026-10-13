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

// Endpoint para consultar si un cliente ya existe por su cédula
router.get("/cliente/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    const query = `
      SELECT id, str_cedula, str_nombre, str_apellido, str_telefono, str_email 
      FROM tickets.tbl_clientes 
      WHERE str_cedula = $1 
      LIMIT 1;
    `;
    const resultado = await pool.query(query, [cedula]);

    if (resultado.rows.length > 0) {
      res.status(200).json({
        success: true,
        existe: true,
        cliente: resultado.rows[0],
      });
    } else {
      res.status(200).json({
        success: true,
        existe: false,
      });
    }
  } catch (err) {
    console.error("Error al buscar el cliente:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al buscar el cliente.",
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
      // Variables del cliente externo (sin condicion_cliente_id)
      str_cedula_cliente,
      str_nombre_cliente,
      str_apellido_cliente,
      str_correo_cliente,
      str_telefono_cliente,
    } = req.body;

    const usuarioIdSesion = req.user?.id;

    // --- LÓGICA PARA GESTIONAR LA TABLA tbl_clientes ---
    let clienteFinalId = cliente_id ? Number(cliente_id) : null;
    const correoMinuscula = str_correo_cliente
      ? str_correo_cliente.trim().toLowerCase()
      : null;
    const nombreMinuscula = str_nombre_cliente
      ? str_nombre_cliente.trim().toLowerCase()
      : null;
    const apellidoMinuscula = str_apellido_cliente
      ? str_apellido_cliente.trim().toLowerCase()
      : null;

    if (!clienteFinalId && str_cedula_cliente) {
      // 1. Verificar si el cliente ya existe por su cédula
      const queryClienteCheck = `SELECT id FROM tickets.tbl_clientes WHERE str_cedula = $1 LIMIT 1;`;
      const clienteRes = await client.query(queryClienteCheck, [
        str_cedula_cliente,
      ]);

      if (clienteRes.rows.length > 0) {
        clienteFinalId = clienteRes.rows[0].id;
        // Actualizar datos si hubo cambios (nombre, apellido y correo en minúsculas)
        const queryUpdateCliente = `
          UPDATE tickets.tbl_clientes 
          SET str_nombre = $1, str_apellido = $2, str_email = $3, str_telefono = $4, updated_at = CURRENT_TIMESTAMP
          WHERE id = $5;
        `;
        await client.query(queryUpdateCliente, [
          nombreMinuscula,
          apellidoMinuscula,
          correoMinuscula,
          str_telefono_cliente || null,
          clienteFinalId,
        ]);
      } else {
        // 2. Si no existe, crearlo en tbl_clientes guardando nombre, apellido y correo en minúsculas
        const queryInsertCliente = `
          INSERT INTO tickets.tbl_clientes (str_cedula, str_nombre, str_apellido, str_email, str_telefono, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id;
        `;
        const nuevoClienteRes = await client.query(queryInsertCliente, [
          str_cedula_cliente,
          nombreMinuscula,
          apellidoMinuscula,
          correoMinuscula,
          str_telefono_cliente || null,
        ]);
        clienteFinalId = nuevoClienteRes.rows[0].id;
      }
    }
    // ----------------------------------------------------

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

    let contadorImagen = 1;
    let contadorVideo = 1;
    let contadorAudio = 1;

    archivos.forEach((file) => {
      const tipoMime = file.mimetype;
      const extension = path.extname(file.originalname);

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

      const rutaAntigua = file.path;
      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);

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
          dmt_fecha_vencimiento_sla, created_at, updated_at
        ) VALUES (
          $1, $2::integer, $3::integer, $4::integer, $5::integer, 
          $6::integer, $7::integer, $8::integer, $9::integer, 
          $10::varchar, $11::text, $12::integer, 
          $13::text, $14::text, $15::text, $16::integer, 
          CURRENT_TIMESTAMP + ($12::integer * INTERVAL '1 hour'), 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP
        )
        RETURNING *;
      `;

    const values = [
      str_ticket,
      tipo_ticket_id ? Number(tipo_ticket_id) : null,
      clienteFinalId,
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

// Endpoint para obtener la bitácora de un ticket
router.get("/bitacora/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params;
  try {
    const query = `
      SELECT 
        b.id,
        b.ticket_id,
        b.str_comentario,
        b.created_at,
        u.id AS usuario_id,
        u.str_nombre AS usuario_nombre,
        u.str_apellido AS usuario_apellido
      FROM tickets.tbl_tickets_bitacora b
      LEFT JOIN public.tbl_usuarios u ON b.usuario_id = u.id
      WHERE b.ticket_id = $1
      ORDER BY b.created_at ASC;
    `;
    const resultado = await pool.query(query, [Number(ticket_id)]);
    res.status(200).json({
      success: true,
      bitacora: resultado.rows,
    });
  } catch (err) {
    console.error("Error al obtener la bitácora:", err.message);
    res.status(500).json({
      success: false,
      error: "Error interno al obtener la bitácora.",
    });
  }
});

// Endpoint para actualizar estatus, departamento, agente, prioridad, SLA y registrar respuesta en la bitácora
router.put("/actualizar/:id", upload.any(), async (req, res) => {
  const { id } = req.params;
  const {
    estatus_id,
    usuario_asignado_id,
    departamento_id,
    prioridad_id,
    str_descripcion_respuesta,
  } = req.body;

  const usuarioIdSesion = req.user?.id;
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

    // 1. Obtener datos actuales del ticket
    const ticketActualRes = await client.query(
      `SELECT categoria_id, prioridad_id, estatus_id, dmt_fecha_vencimiento_sla, updated_at FROM tickets.tbl_tickets WHERE id = $1`,
      [Number(id)],
    );

    if (ticketActualRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado." });
    }

    const ticketActual = ticketActualRes.rows[0];
    const categoriaId = ticketActual.categoria_id;
    const estatusActual = Number(ticketActual.estatus_id);

    // Validación: Si el estatus cambió, exigir comentario en la bitácora
    const cambioEstatus =
      nuevoEstatus !== null && nuevoEstatus !== estatusActual;
    if (
      cambioEstatus &&
      (!str_descripcion_respuesta || str_descripcion_respuesta.trim() === "")
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error:
          "Debe ingresar un comentario o respuesta en la bitácora al cambiar el estatus del ticket.",
      });
    }

    // 2. Verificar dinámicamente si el estatus ACTUAL y el NUEVO son de PAUSA o CIERRE
    let esEstatusActualPausa = false;
    let esEstatusNuevoPausa = false;
    let esEstatusCierre = false;

    // Consultar nombre del estatus actual
    const estActualInfoRes = await client.query(
      `SELECT str_nombre FROM public.cat_datos_maestros WHERE id = $1`,
      [estatusActual],
    );
    if (estActualInfoRes.rows.length > 0) {
      const nombreActual = estActualInfoRes.rows[0].str_nombre.toLowerCase();
      if (
        nombreActual.includes("espera") ||
        nombreActual.includes("pendiente") ||
        nombreActual.includes("pausa")
      ) {
        esEstatusActualPausa = true;
      }
    }

    // Consultar nombre del nuevo estatus
    if (nuevoEstatus !== null) {
      const estNuevoInfoRes = await client.query(
        `SELECT str_nombre FROM public.cat_datos_maestros WHERE id = $1`,
        [nuevoEstatus],
      );
      if (estNuevoInfoRes.rows.length > 0) {
        const nombreNuevo = estNuevoInfoRes.rows[0].str_nombre.toLowerCase();
        if (
          nombreNuevo.includes("espera") ||
          nombreNuevo.includes("pendiente") ||
          nombreNuevo.includes("pausa")
        ) {
          esEstatusNuevoPausa = true;
        }
        if (
          nombreNuevo.includes("cerrado") ||
          nombreNuevo.includes("cancelado") ||
          nuevoEstatus === 22
        ) {
          esEstatusCierre = true;
        }
      }
    }

    const prioridadAUtilizar =
      nuevaPrioridad !== null ? nuevaPrioridad : ticketActual.prioridad_id;

    // 3. Consultar el SLA configurado
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

    // 4. Registrar respuesta en la bitácora si existe
    if (str_descripcion_respuesta && str_descripcion_respuesta.trim() !== "") {
      await client.query(
        `INSERT INTO tickets.tbl_tickets_bitacora (ticket_id, usuario_id, str_comentario, created_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [
          Number(id),
          usuarioIdSesion ? Number(usuarioIdSesion) : null,
          str_descripcion_respuesta.trim(),
        ],
      );
    }

    // 5. Determinar la lógica de la fecha de vencimiento del SLA:
    // - Si se mantiene o entra en pausa/cierre: se congela.
    // - Si SALE de pausa (estaba en pausa y ahora pasa a proceso/otro activo): se extiende la fecha sumándole el tiempo exacto que duró la pausa.
    // - Si es un ticket nuevo o cambio común sin pausa previa: aplica el cálculo normal.

    let queryUpdate = "";
    let updateParams = [];

    if (esEstatusNuevoPausa || esEstatusCierre) {
      // Congelar SLA
      queryUpdate = `
        UPDATE tickets.tbl_tickets 
        SET 
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          dmt_fecha_cierre = CASE 
            WHEN $6::boolean AND dmt_fecha_cierre IS NULL THEN CURRENT_TIMESTAMP 
            ELSE dmt_fecha_cierre 
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        nuevoAsignado,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        esEstatusCierre,
        Number(id),
      ];
    } else if (esEstatusActualPausa && !esEstatusNuevoPausa) {
      // SALIÓ DE PAUSA: Extender el vencimiento sumando el tiempo transcurrido durante la pausa
      queryUpdate = `
        UPDATE tickets.tbl_tickets 
        SET 
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          dmt_fecha_vencimiento_sla = dmt_fecha_vencimiento_sla + (CURRENT_TIMESTAMP - updated_at),
          dmt_fecha_cierre = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        nuevoAsignado,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        Number(id),
      ];
    } else {
      // Flujo estándar para otros cambios
      queryUpdate = `
        UPDATE tickets.tbl_tickets 
        SET 
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        nuevoAsignado,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        Number(id),
      ];
    }

    const updateRes = await client.query(queryUpdate, updateParams);

    await client.query("COMMIT");
    res.status(200).json({
      success: true,
      message:
        "Ticket actualizado y respuesta guardada en la bitácora exitosamente.",
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
