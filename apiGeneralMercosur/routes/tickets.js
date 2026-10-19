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
const sharp = require("sharp"); // 📌 Procesamiento y compresión de imágenes

// 🔒 Doble capa de seguridad global
router.use(verificarClienteFrontend);
router.use(verificarSesion);

// ==========================================
// FUNCIÓN AUXILIAR PARA PROCESAR Y COMPRIMIR ARCHIVOS (MÁX. 500 KB)
// ==========================================
async function procesarArchivosConSharp(archivos, prefijoTicket) {
  const rutasImagenes = [];
  const rutasVideos = [];
  const rutasAudios = [];

  let contadorImagen = 1;
  let contadorVideo = 1;

  for (const file of archivos) {
    const tipoMime = file.mimetype;
    const extension = path.extname(file.originalname);
    let nuevoNombreArchivo = "";

    if (tipoMime.startsWith("image/")) {
      nuevoNombreArchivo = `${prefijoTicket}-${contadorImagen}${extension}`;
      contadorImagen++;

      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);

      try {
        let calidad = 80;
        let bufferTransformado = await sharp(file.path)
          .resize({
            width: 1920,
            height: 1080,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: calidad })
          .toBuffer();

        // Disminuir calidad iterativamente si excede los 500 KB (512,000 bytes)
        while (bufferTransformado.length > 500 * 1024 && calidad > 10) {
          calidad -= 10;
          bufferTransformado = await sharp(file.path)
            .resize({
              width: 1920,
              height: 1080,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: calidad })
            .toBuffer();
        }

        // Guardar la imagen comprimida directamente en disco
        fs.writeFileSync(rutaNueva, bufferTransformado);

        // Limpiar el archivo temporal subido originalmente por Multer
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        rutasImagenes.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      } catch (sharpErr) {
        console.error(
          "Error al comprimir la imagen con sharp:",
          sharpErr.message,
        );
        // Fallback: Mover archivo original si falla la compresión
        if (fs.existsSync(file.path)) {
          fs.renameSync(file.path, rutaNueva);
        }
        rutasImagenes.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      }
    } else {
      // Manejo de videos y audios (sin compresión de imágenes)
      if (tipoMime.startsWith("video/")) {
        nuevoNombreArchivo = `${prefijoTicket}-vid-${contadorVideo}${extension}`;
        contadorVideo++;
      } else {
        nuevoNombreArchivo = `${prefijoTicket}-file-${contadorImagen}${extension}`;
        contadorImagen++;
      }

      const rutaAntigua = file.path;
      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);

      try {
        if (fs.existsSync(rutaAntigua)) {
          fs.renameSync(rutaAntigua, rutaNueva);
        }
      } catch (renameErr) {
        console.error(
          "Error al renombrar el archivo físico:",
          renameErr.message,
        );
      }

      const rutaCompletaBD = `/var/www/uploads/${nuevoNombreArchivo}`;
      if (tipoMime.startsWith("video/")) rutasVideos.push(rutaCompletaBD);
      else if (tipoMime.startsWith("audio/")) rutasAudios.push(rutaCompletaBD);
    }
  }

  return {
    str_ruta_imagen: rutasImagenes.length > 0 ? rutasImagenes.join(",") : null,
    str_ruta_video: rutasVideos.length > 0 ? rutasVideos.join(",") : null,
    str_ruta_audio: rutasAudios.length > 0 ? rutasAudios.join(",") : null,
  };
}

// ==========================================
// FUNCIÓN AUXILIAR DE FILTROS DINÁMICOS PARA DASHBOARD
// ==========================================
function construirFiltrosDashboard(req) {
  const {
    tipo_ticket_id,
    estatus_id,
    prioridad_id,
    canal_id,
    departamento_id,
    categoria_id,
    creacion_desde,
    creacion_hasta,
    rol,
  } = req.query;

  const usuarioId = req.user?.id;
  let whereClause = `WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  const rolUsuario = (rol || "").toLowerCase();

  if (rolUsuario.includes("gerente atc")) {
    whereClause += ` AND (t.tipo_ticket_id = 25 OR (t.tipo_ticket_id = 24 AND (t.usuario_asignado_id = $${paramIndex} OR t.creador_agente_id = $${paramIndex})))`;
    params.push(Number(usuarioId));
    paramIndex++;
  } else if (rolUsuario.includes("operador atc")) {
    whereClause += ` AND (t.usuario_asignado_id = $${paramIndex} OR t.creador_agente_id = $${paramIndex})`;
    params.push(Number(usuarioId));
    paramIndex++;
  }

  if (tipo_ticket_id) {
    whereClause += ` AND t.tipo_ticket_id = $${paramIndex++}`;
    params.push(Number(tipo_ticket_id));
  }
  if (estatus_id) {
    whereClause += ` AND t.estatus_id = $${paramIndex++}`;
    params.push(Number(estatus_id));
  }
  if (prioridad_id) {
    whereClause += ` AND t.prioridad_id = $${paramIndex++}`;
    params.push(Number(prioridad_id));
  }
  if (canal_id) {
    whereClause += ` AND t.canal_id = $${paramIndex++}`;
    params.push(Number(canal_id));
  }
  if (departamento_id) {
    whereClause += ` AND t.departamento_id = $${paramIndex++}`;
    params.push(Number(departamento_id));
  }
  if (categoria_id) {
    whereClause += ` AND t.categoria_id = $${paramIndex++}`;
    params.push(Number(categoria_id));
  }
  if (creacion_desde) {
    whereClause += ` AND t.created_at >= $${paramIndex++}::timestamp`;
    params.push(creacion_desde);
  }
  if (creacion_hasta) {
    whereClause += ` AND t.created_at <= ($${paramIndex++}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`;
    params.push(creacion_hasta);
  }

  return { whereClause, params };
}

// ==========================================
// ENDPOINTS DEL DASHBOARD DE TICKETS
// ==========================================

router.get("/dashboard/kpis", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const queryKpis = `
      SELECT
        (SELECT count(*) FROM tickets.tbl_tickets t ${whereClause}) AS total_tickets,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'En Proceso') AS en_proceso,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'En Aprobación') AS en_aprobacion,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'Pendiente de Usuario') AS pendiente_usuario,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'En Espera Proveedor') AS espera_proveedor,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'Vencido') AS vencido,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'Cancelado') AS cancelado,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'Cerrado') AS cerrado
    `;
    const result = await pool.query(queryKpis, params);
    res.status(200).json({ success: true, kpis: result.rows });
  } catch (err) {
    console.error(
      "Error al obtener KPIs del dashboard de tickets:",
      err.message,
    );
    res
      .status(500)
      .json({ success: false, error: "Error interno al consultar los KPIs." });
  }
});

router.get("/dashboard/tickets-por-categoria", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const query = `
      SELECT
        COALESCE(cat.str_nombre, 'Sin Categoría') AS nombre_categoria,
        COUNT(t.id) AS total_tickets
      FROM tickets.tbl_tickets t
      LEFT JOIN public.cat_datos_maestros cat ON t.categoria_id = cat.id
      ${whereClause}
      GROUP BY cat.str_nombre
      ORDER BY total_tickets DESC;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener tickets por categoría:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al consultar el volumen por categoría.",
      });
  }
});

router.get("/dashboard/distribucion-estados", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const query = `
      SELECT
        COALESCE(e.str_nombre, 'Sin Estatus') AS estado,
        COUNT(t.id) AS total
      FROM tickets.tbl_tickets t
      LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id
      ${whereClause}
      GROUP BY e.str_nombre
      ORDER BY total DESC;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener distribución de estatus:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al consultar la distribución de estados.",
      });
  }
});

router.get("/clientes-con-tickets", async (req, res) => {
  try {
    const query = `
        SELECT
            c.id,
            c.str_cedula AS cedula,
            CONCAT(c.str_nombre, ' ', c.str_apellido) AS cliente,
            c.str_telefono AS telefono,
            c.str_email AS correo,
            COUNT(vt.id) AS tickets,
            MAX(vt.created_at) AS ultima_atencion,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', vt.id,
                        'str_ticket', vt.str_ticket,
                        'tipo_ticket_id', vt.tipo_ticket_id,
                        'tipo_ticket', vt.tipo_ticket,
                        'cliente_id', vt.cliente_id,
                        'cliente_nombre', vt.cliente_nombre,
                        'cliente_apellido', vt.cliente_apellido,
                        'cliente_cedula', vt.cliente_cedula,
                        'cliente_correo', vt.cliente_correo,
                        'cliente_telefono', vt.cliente_telefono,
                        'creador_agente_id', vt.creador_agente_id,
                        'creador_nombre', vt.creador_nombre,
                        'creador_apellido', vt.creador_apellido,
                        'creador_correo', vt.creador_correo,
                        'departamento_id', vt.departamento_id,
                        'departamento_nombre', vt.departamento_nombre,
                        'categoria_id', vt.categoria_id,
                        'categoria_nombre', vt.categoria_nombre,
                        'prioridad_id', vt.prioridad_id,
                        'prioridad_nombre', vt.prioridad_nombre,
                        'estatus_id', vt.estatus_id,
                        'estatus_nombre', vt.estatus_nombre,
                        'canal_id', vt.canal_id,
                        'canal_nombre', vt.canal_nombre,
                        'str_asunto', vt.str_asunto,
                        'str_descripcion', vt.str_descripcion,
                        'int_sla', vt.int_sla,
                        'dmt_fecha_vencimiento_sla', vt.dmt_fecha_vencimiento_sla,
                        'dmt_fecha_cierre', vt.dmt_fecha_cierre,
                        'bool_cumplio_sla', vt.bool_cumplio_sla,
                        'created_at', vt.created_at,
                        'updated_at', vt.updated_at,
                        'usuario_asignado_id', vt.usuario_asignado_id,
                        'asignado_nombre', vt.asignado_nombre,
                        'asignado_apellido', vt.asignado_apellido,
                        'asignado_correo', vt.asignado_correo,
                        'str_ruta_imagen', vt.str_ruta_imagen,
                        'str_ruta_video', vt.str_ruta_video,
                        'str_ruta_audio', vt.str_ruta_audio,
                        'int_minutos_pausa', vt.int_minutos_pausa,
                        'tiempo_resolucion', vt.tiempo_resolucion
                    )
                ) FILTER (WHERE vt.id IS NOT NULL),
                '[]'
            ) AS lista_tickets
        FROM
            tickets.tbl_clientes c
        LEFT JOIN
            tickets.view_listar_tickets vt ON c.id = vt.cliente_id
        GROUP BY
            c.id, c.str_cedula, c.str_nombre, c.str_apellido, c.str_telefono, c.str_email
        ORDER BY c.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return res
      .status(200)
      .json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    console.error("Error al listar clientes con tickets:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error interno del servidor al obtener los datos de clientes.",
      });
  }
});

router.get("/dashboard/ultimos-tickets", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const query = `
      SELECT
        t.id,
        t.str_ticket AS codigo,
        t.str_asunto AS asunto,
        e.str_nombre AS estado,
        COALESCE(c.str_nombre || ' ' || c.str_apellido, 'Cliente / Usuario') AS solicitante,
        TO_CHAR(t.created_at, 'DD/MM/YYYY HH24:MI') AS tiempo,
        TO_CHAR(t.dmt_fecha_cierre, 'DD/MM/YYYY HH24:MI') AS fecha_cierre,
        t.creador_agente_id,
        t.usuario_asignado_id
      FROM tickets.tbl_tickets t
      LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id
      LEFT JOIN tickets.tbl_clientes c ON t.cliente_id = c.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener últimos tickets:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al consultar los tickets recientes.",
      });
  }
});

router.get("/dashboard/casos-por-analista", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const query = `
      SELECT
        COALESCE(u.str_nombre || ' ' || u.str_apellido, 'Sin Asignar / Desconocido') AS nombre_analista,
        COUNT(t.id) AS total_tickets
      FROM tickets.tbl_tickets t
      LEFT JOIN public.tbl_usuarios u ON t.creador_agente_id = u.id
      ${whereClause}
      GROUP BY u.id, u.str_nombre, u.str_apellido
      ORDER BY total_tickets DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener casos por analista:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al consultar los casos por analista.",
      });
  }
});

router.get("/dashboard/casos-cerrados-por-analista", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const query = `
      SELECT
        COALESCE(u.str_nombre || ' ' || u.str_apellido, 'Sin Asignar / Desconocido') AS nombre_analista,
        COUNT(t.id) AS tickets_cerrados
      FROM tickets.tbl_tickets t
      LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id
      LEFT JOIN public.tbl_usuarios u ON t.cierre_agente_id = u.id
      ${whereClause}
      AND e.str_tipo = 'ESTATUSTICKET'
      AND e.str_nombre ILIKE 'Cerrado'
      GROUP BY u.id, u.str_nombre, u.str_apellido
      ORDER BY tickets_cerrados DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener casos cerrados por analista:", err.message);
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

// ==========================================
// ENDPOINTS DE CATÁLOGOS Y GESTIÓN DE TICKETS
// ==========================================

router.get("/departamentos", async (req, res) => {
  try {
    const query = `SELECT id, str_nombre, str_descripcion FROM public.cat_departamentos ORDER BY str_nombre ASC;`;
    const resultado = await pool.query(query);
    res.status(200).json({ success: true, departamentos: resultado.rows });
  } catch (err) {
    console.error("Error al obtener los departamentos:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al obtener los departamentos.",
      });
  }
});

router.get("/departamentos-usuarios", async (req, res) => {
  try {
    const queryDept = `SELECT id, str_nombre, str_descripcion FROM public.cat_departamentos ORDER BY str_nombre ASC;`;
    const queryUsers = `SELECT id, departamento_id, str_nombre, str_apellido, str_email, bol_activo FROM public.tbl_usuarios WHERE bol_activo = true ORDER BY str_nombre ASC;`;

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
    res
      .status(500)
      .json({ success: false, error: "Error interno al obtener catálogos." });
  }
});

router.get("/datos-maestros", async (req, res) => {
  try {
    const query = `SELECT id, str_tipo, str_nombre, str_descripcion, bol_activo FROM public.cat_datos_maestros WHERE bol_activo = true ORDER BY str_tipo, id ASC;`;
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
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al obtener los datos maestros.",
      });
  }
});

router.get("/cliente/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    const query = `SELECT id, str_cedula, str_nombre, str_apellido, str_telefono, str_email FROM tickets.tbl_clientes WHERE str_cedula = $1 LIMIT 1;`;
    const resultado = await pool.query(query, [cedula]);

    if (resultado.rows.length > 0) {
      res
        .status(200)
        .json({ success: true, existe: true, cliente: resultado.rows[0] });
    } else {
      res.status(200).json({ success: true, existe: false });
    }
  } catch (err) {
    console.error("Error al buscar el cliente:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Error interno al buscar el cliente." });
  }
});

// ==========================================
// CREAR TICKET CON COMPRESIÓN DE IMÁGENES
// ==========================================
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
      str_nombre_cliente,
      str_apellido_cliente,
      str_correo_cliente,
      str_telefono_cliente,
    } = req.body;

    const usuarioIdSesion = req.user?.id;
    let valoresAsignado = usuario_asignado_id
      ? Number(usuario_asignado_id)
      : null;
    let clienteFinalId = cliente_id ? Number(cliente_id) : null;

    if (!valoresAsignado && departamento_id) {
      const deptoRes = await client.query(
        `SELECT str_nombre FROM public.cat_departamentos WHERE id = $1`,
        [Number(departamento_id)],
      );
      if (deptoRes.rows.length > 0) {
        const nombreDepto = deptoRes.rows[0].str_nombre.toLowerCase();
        if (
          nombreDepto.includes("tecnolog") ||
          nombreDepto.includes("sistema") ||
          nombreDepto.includes("ti")
        ) {
          const usuariosDeptoRes = await client.query(
            `SELECT id FROM public.tbl_usuarios WHERE departamento_id = $1 AND bol_activo = true`,
            [Number(departamento_id)],
          );
          if (usuariosDeptoRes.rows.length > 0) {
            const indexAleatorio = Math.floor(
              Math.random() * usuariosDeptoRes.rows.length,
            );
            valoresAsignado = usuariosDeptoRes.rows[indexAleatorio].id;
          }
        }
      }
    }

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
      const queryClienteCheck = `SELECT id FROM tickets.tbl_clientes WHERE str_cedula = $1 LIMIT 1;`;
      const clienteRes = await client.query(queryClienteCheck, [
        str_cedula_cliente,
      ]);

      if (clienteRes.rows.length > 0) {
        clienteFinalId = clienteRes.rows[0].id;
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

    const slaQuery = `SELECT tiempo_maximo FROM tickets.sla_configuracion WHERE categoria_id = $1 AND prioridad_id = $2 AND activo = true;`;
    const slaRes = await client.query(slaQuery, [categoria_id, prioridad_id]);
    const horasSla = slaRes.rows.length > 0 ? slaRes.rows[0].tiempo_maximo : 24;

    // 🛑 PROCESAMIENTO Y COMPRESIÓN DE ARCHIVOS CON SHARP (<500 KB)
    const archivos = req.files || [];
    const { str_ruta_imagen, str_ruta_video, str_ruta_audio } =
      await procesarArchivosConSharp(archivos, str_ticket);

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
        COALESCE(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) + ($12::integer * INTERVAL '1 hour'),
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
      valoresAsignado,
    ];

    const nuevoTicketRes = await client.query(queryInsert, values);
    const ticketCreado = nuevoTicketRes.rows[0];

    let nuevaAlerta = null;
    if (valoresAsignado) {
      const mensajeAlerta = `Se te ha asignado el ticket: [${str_ticket}] ${str_asunto || "Sin asunto"}`;
      const queryAlerta = `
        INSERT INTO tickets.tbl_alertas (caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING *;
      `;
      const alertaRes = await client.query(queryAlerta, [
        ticketCreado.id,
        valoresAsignado,
        "ASIGNACION",
        mensajeAlerta,
      ]);
      nuevaAlerta = alertaRes.rows[0];
    }

    await client.query("COMMIT");

    if (valoresAsignado && nuevaAlerta) {
      const io = req.app.get("io");
      if (io && Number(valoresAsignado) !== Number(usuarioIdSesion)) {
        io.to(`user_${valoresAsignado}`).emit("nueva_alerta", nuevaAlerta);
      }
    }

    res.status(201).json({
      success: true,
      message: "Ticket creado y archivos comprimidos exitosamente.",
      ticket: ticketCreado,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al crear el ticket con multimedia:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al procesar la solicitud del ticket.",
      });
  } finally {
    client.release();
  }
});

router.get("/listar", async (req, res) => {
  try {
    const {
      tipo_ticket_id,
      estatus_id,
      prioridad_id,
      canal_id,
      departamento_id,
      categoria_id,
      buscar,
      creacion_desde,
      creacion_hasta,
      cierre_desde,
      cierre_hasta,
      vencimiento_desde,
      vencimiento_hasta,
      rol,
    } = req.query;

    const usuarioIdSesion = req.user?.id;
    const rolUsuario = (rol || "").toLowerCase();

    let query = `SELECT * FROM tickets.view_listar_tickets t WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (rolUsuario.includes("gerente atc")) {
      query += ` AND (t.tipo_ticket_id = 25 OR (t.tipo_ticket_id = 24 AND (t.usuario_asignado_id = $${paramIndex} OR t.creador_agente_id = $${paramIndex})))`;
      params.push(Number(usuarioIdSesion));
      paramIndex++;
    } else if (rolUsuario.includes("operador atc")) {
      query += ` AND (t.usuario_asignado_id = $${paramIndex} OR t.creador_agente_id = $${paramIndex})`;
      params.push(Number(usuarioIdSesion));
      paramIndex++;
    }

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
    if (categoria_id) {
      query += ` AND t.categoria_id = $${paramIndex++}`;
      params.push(Number(categoria_id));
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
      query += ` AND (t.str_ticket ILIKE $${paramIndex} OR t.str_asunto ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC;`;
    const resultado = await pool.query(query, params);

    res.status(200).json({ success: true, tickets: resultado.rows });
  } catch (err) {
    console.error("Error al listar los tickets:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Error interno al obtener los tickets." });
  }
});

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
    res.status(200).json({ success: true, bitacora: resultado.rows });
  } catch (err) {
    console.error("Error al obtener la bitácora:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Error interno al obtener la bitácora." });
  }
});

// ==========================================
// ACTUALIZAR TICKET CON COMPRESIÓN DE ARCHIVOS
// ==========================================
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
    const usuarioId = req.user?.id;

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

    const ticketActualRes = await client.query(
      `SELECT categoria_id, prioridad_id, estatus_id, usuario_asignado_id, str_ticket, str_asunto, dmt_fecha_vencimiento_sla, updated_at, str_ruta_imagen, str_ruta_video, str_ruta_audio FROM tickets.tbl_tickets WHERE id = $1`,
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
    const asignadoAnterior = ticketActual.usuario_asignado_id;

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

    // 🛑 PROCESAR Y COMPRIMIR ARCHIVOS ADJUNTOS EN ACTUALIZACIÓN
    const archivos = req.files || [];
    let nuevasRutasImagenes = ticketActual.str_ruta_imagen;
    let nuevasRutasVideos = ticketActual.str_ruta_video;
    let nuevasRutasAudios = ticketActual.str_ruta_audio;

    if (archivos.length > 0) {
      const resultadoArchivos = await procesarArchivosConSharp(
        archivos,
        `${ticketActual.str_ticket}-upd`,
      );

      if (resultadoArchivos.str_ruta_imagen) {
        nuevasRutasImagenes = nuevasRutasImagenes
          ? `${nuevasRutasImagenes},${resultadoArchivos.str_ruta_imagen}`
          : resultadoArchivos.str_ruta_imagen;
      }
      if (resultadoArchivos.str_ruta_video) {
        nuevasRutasVideos = nuevasRutasVideos
          ? `${nuevasRutasVideos},${resultadoArchivos.str_ruta_video}`
          : resultadoArchivos.str_ruta_video;
      }
      if (resultadoArchivos.str_ruta_audio) {
        nuevasRutasAudios = nuevasRutasAudios
          ? `${nuevasRutasAudios},${resultadoArchivos.str_ruta_audio}`
          : resultadoArchivos.str_ruta_audio;
      }
    }

    let esEstatusActualPausa = false;
    let esEstatusNuevoPausa = false;
    let esEstatusCierre = false;

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
    const slaQuery = `SELECT tiempo_maximo FROM tickets.sla_configuracion WHERE categoria_id = $1 AND prioridad_id = $2 AND activo = true;`;
    const slaRes = await client.query(slaQuery, [
      categoriaId,
      prioridadAUtilizar,
    ]);
    const horasSla = slaRes.rows.length > 0 ? slaRes.rows[0].tiempo_maximo : 24;

    if (str_descripcion_respuesta && str_descripcion_respuesta.trim() !== "") {
      await client.query(
        `INSERT INTO tickets.tbl_tickets_bitacora (ticket_id, usuario_id, str_comentario, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [
          Number(id),
          usuarioIdSesion ? Number(usuarioIdSesion) : null,
          str_descripcion_respuesta.trim(),
        ],
      );
    }

    let queryUpdate = "";
    let updateParams = [];

    if (esEstatusCierre) {
      queryUpdate = `
        UPDATE tickets.tbl_tickets
        SET
          estatus_id = COALESCE($1, estatus_id),
          cierre_agente_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          str_ruta_imagen = $6,
          str_ruta_video = $7,
          str_ruta_audio = $8,
          int_minutos_pausa = CASE
            WHEN dmt_fecha_inicio_pausa IS NOT NULL THEN COALESCE(int_minutos_pausa, 0) + ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - dmt_fecha_inicio_pausa)) / 60::numeric, 2)
            ELSE COALESCE(int_minutos_pausa, 0)
          END,
          dmt_fecha_inicio_pausa = NULL,
          dmt_fecha_cierre = CASE
            WHEN $9::boolean AND dmt_fecha_cierre IS NULL THEN CURRENT_TIMESTAMP
            ELSE dmt_fecha_cierre
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        usuarioId,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        nuevasRutasImagenes,
        nuevasRutasVideos,
        nuevasRutasAudios,
        esEstatusCierre,
        Number(id),
      ];
    } else if (esEstatusNuevoPausa && !esEstatusActualPausa) {
      queryUpdate = `
        UPDATE tickets.tbl_tickets
        SET
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          str_ruta_imagen = $6,
          str_ruta_video = $7,
          str_ruta_audio = $8,
          dmt_fecha_inicio_pausa = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        usuarioId,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        nuevasRutasImagenes,
        nuevasRutasVideos,
        nuevasRutasAudios,
        Number(id),
      ];
    } else if (esEstatusActualPausa && !esEstatusNuevoPausa) {
      queryUpdate = `
        UPDATE tickets.tbl_tickets
        SET
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          str_ruta_imagen = $6,
          str_ruta_video = $7,
          str_ruta_audio = $8,
          dmt_fecha_vencimiento_sla = dmt_fecha_vencimiento_sla + (CURRENT_TIMESTAMP - COALESCE(dmt_fecha_inicio_pausa, updated_at)),
          int_minutos_pausa = COALESCE(int_minutos_pausa, 0) + ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(dmt_fecha_inicio_pausa, updated_at))) / 60::numeric, 2),
          dmt_fecha_inicio_pausa = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        usuarioId,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        nuevasRutasImagenes,
        nuevasRutasVideos,
        nuevasRutasAudios,
        Number(id),
      ];
    } else {
      queryUpdate = `
        UPDATE tickets.tbl_tickets
        SET
          estatus_id = COALESCE($1, estatus_id),
          usuario_asignado_id = CASE WHEN $2::integer IS NOT NULL OR $2 IS NULL THEN $2 ELSE usuario_asignado_id END,
          departamento_id = COALESCE($3, departamento_id),
          prioridad_id = COALESCE($4, prioridad_id),
          int_sla = $5::integer,
          str_ruta_imagen = $6,
          str_ruta_video = $7,
          str_ruta_audio = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      updateParams = [
        nuevoEstatus,
        usuarioId,
        nuevoDepartamento,
        nuevaPrioridad,
        Number(horasSla),
        nuevasRutasImagenes,
        nuevasRutasVideos,
        nuevasRutasAudios,
        Number(id),
      ];
    }

    const updateRes = await client.query(queryUpdate, updateParams);
    const ticketActualizado = updateRes.rows[0];

    let nuevaAlertaActualizacion = null;
    const nuevoResponsableId = ticketActualizado.usuario_asignado_id;

    if (nuevoResponsableId && nuevoResponsableId !== asignadoAnterior) {
      const mensajeAlerta = `Se te ha reasignado el ticket: [${ticketActual.str_ticket}] ${ticketActual.str_asunto || "Sin asunto"}`;
      const queryAlerta = `
        INSERT INTO tickets.tbl_alertas (caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING *;
      `;
      const alertaRes = await client.query(queryAlerta, [
        ticketActualizado.id,
        nuevoResponsableId,
        "ASIGNACION",
        mensajeAlerta,
      ]);
      nuevaAlertaActualizacion = alertaRes.rows[0];
    }

    await client.query("COMMIT");

    if (
      nuevoResponsableId &&
      nuevoResponsableId !== asignadoAnterior &&
      nuevaAlertaActualizacion
    ) {
      const io = req.app.get("io");
      if (io && Number(nuevoResponsableId) !== Number(usuarioIdSesion)) {
        io.to(`user_${nuevoResponsableId}`).emit(
          "nueva_alerta",
          nuevaAlertaActualizacion,
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Ticket actualizado, archivos procesados y respuesta guardada en la bitácora exitosamente.",
      ticket: ticketActualizado,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar el ticket:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al actualizar el ticket.",
      });
  } finally {
    client.release();
  }
});

module.exports = router;
