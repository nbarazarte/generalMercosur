const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const verificarClienteFrontend = require("../middlewares/autenticarToken");
const verificarSesion = require("../middlewares/verificarSesion");
const upload = require("../middlewares/multerConfig");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

router.use(verificarClienteFrontend);
router.use(verificarSesion);

function comprimirVideoConFFmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-crf 28", "-preset ultrafast", "-vf scale=-2:720"])
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err))
      .run();
  });
}

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

        fs.writeFileSync(rutaNueva, bufferTransformado);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        rutasImagenes.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      } catch (sharpErr) {
        if (fs.existsSync(file.path)) fs.renameSync(file.path, rutaNueva);
        rutasImagenes.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      }
    } else if (tipoMime.startsWith("video/")) {
      nuevoNombreArchivo = `${prefijoTicket}-vid-${contadorVideo}${extension}`;
      contadorVideo++;
      const rutaAntigua = file.path;
      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);

      try {
        await comprimirVideoConFFmpeg(rutaAntigua, rutaNueva);
        if (fs.existsSync(rutaAntigua)) fs.unlinkSync(rutaAntigua);
        rutasVideos.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      } catch (ffmpegErr) {
        if (fs.existsSync(rutaAntigua)) fs.renameSync(rutaAntigua, rutaNueva);
        rutasVideos.push(`/var/www/uploads/${nuevoNombreArchivo}`);
      }
    } else {
      nuevoNombreArchivo = `${prefijoTicket}-file-${contadorImagen}${extension}`;
      contadorImagen++;
      const rutaAntigua = file.path;
      const rutaNueva = path.join("/var/www/uploads", nuevoNombreArchivo);
      if (fs.existsSync(rutaAntigua)) fs.renameSync(rutaAntigua, rutaNueva);
      const rutaCompletaBD = `/var/www/uploads/${nuevoNombreArchivo}`;
      if (tipoMime.startsWith("audio/")) rutasAudios.push(rutaCompletaBD);
    }
  }

  return {
    str_ruta_imagen: rutasImagenes.length > 0 ? rutasImagenes.join(",") : null,
    str_ruta_video: rutasVideos.length > 0 ? rutasVideos.join(",") : null,
    str_ruta_audio: rutasAudios.length > 0 ? rutasAudios.join(",") : null,
  };
}

function construirFiltrosDashboard(req, aliasTabla = "t") {
  const {
    tipo_ticket_id,
    estatus_id,
    prioridad_id,
    canal_id,
    departamento_id,
    categoria_id,
    tipo_persona,
    creacion_desde,
    creacion_hasta,
    rol,
  } = req.query;

  const usuarioId = req.user?.id;
  let whereClause = `WHERE 1=1`;
  //let whereClause2 = `WHERE 1=1`;
  const params = [];
  let paramIndex = 1;
  const rolUsuario = (rol || "").toLowerCase();

  if (rolUsuario.includes("gerente_atc")) {
    whereClause += ` AND (${aliasTabla}.tipo_ticket_id = 25 OR (${aliasTabla}.tipo_ticket_id = 24 AND (${aliasTabla}.usuario_asignado_id = $${paramIndex} OR ${aliasTabla}.creador_agente_id = $${paramIndex})))`;
    //whereClause2 += ` AND (${aliasTabla}.tipo_ticket_id = 25 OR (${aliasTabla}.tipo_ticket_id = 24 AND (${aliasTabla}.creador_agente_id = $${paramIndex})))`;

    params.push(Number(usuarioId));
    paramIndex++;
  } else if (rolUsuario.includes("operador_atc")) {
    whereClause += ` AND (${aliasTabla}.usuario_asignado_id = $${paramIndex} OR ${aliasTabla}.creador_agente_id = $${paramIndex})`;
    //whereClause2 += ` AND (${aliasTabla}.creador_agente_id = $${paramIndex})`;
    params.push(Number(usuarioId));
    paramIndex++;
  }

  if (tipo_ticket_id) {
    whereClause += ` AND ${aliasTabla}.tipo_ticket_id = $${paramIndex++}`;
    params.push(Number(tipo_ticket_id));
  }
  if (estatus_id) {
    whereClause += ` AND ${aliasTabla}.estatus_id = $${paramIndex++}`;
    params.push(Number(estatus_id));
  }
  if (prioridad_id) {
    whereClause += ` AND ${aliasTabla}.prioridad_id = $${paramIndex++}`;
    params.push(Number(prioridad_id));
  }
  if (canal_id) {
    whereClause += ` AND ${aliasTabla}.canal_id = $${paramIndex++}`;
    params.push(Number(canal_id));
  }
  if (departamento_id) {
    whereClause += ` AND ${aliasTabla}.departamento_id = $${paramIndex++}`;
    params.push(Number(departamento_id));
  }
  if (categoria_id) {
    whereClause += ` AND ${aliasTabla}.categoria_id = $${paramIndex++}`;
    params.push(Number(categoria_id));
  }
  if (tipo_persona === "natural") {
    whereClause += ` AND ${aliasTabla}.cliente_id IS NOT NULL`;
  } else if (tipo_persona === "juridico") {
    whereClause += ` AND ${aliasTabla}.cliente_juridico_id IS NOT NULL`;
  }
  if (creacion_desde) {
    whereClause += ` AND ${aliasTabla}.created_at >= $${paramIndex++}::timestamp`;
    params.push(creacion_desde);
  }
  if (creacion_hasta) {
    whereClause += ` AND ${aliasTabla}.created_at <= ($${paramIndex++}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`;
    params.push(creacion_hasta);
  }

  //console.log(whereClause);
  //console.log(usuarioId);

  //return { whereClause, whereClause2, params };
  return { whereClause, params };
}

router.get("/dashboard/kpis", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req);
    const queryKpis = `
      SELECT
        (SELECT count(*) FROM tickets.tbl_tickets t ${whereClause}) AS total_tickets,
        (SELECT count(*) FROM tickets.tbl_tickets t LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'En Progreso') AS en_progreso,
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
    res
      .status(500)
      .json({ success: false, error: "Error interno al consultar los KPIs." });
  }
});

router.get("/dashboard/tickets-por-categoria", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req, "t");

    const query = `
      SELECT nombre_categoria, COUNT(ticket_id) AS total_tickets
      FROM tickets.view_tickets_por_categoria t
      ${whereClause}
      GROUP BY nombre_categoria
      ORDER BY total_tickets DESC;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/dashboard/distribucion-estados", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req, "t");
    const query = `
      SELECT estado, COUNT(ticket_id) AS total
      FROM tickets.view_distribucion_estados t
      ${whereClause}
      GROUP BY estado
      ORDER BY total DESC;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/dashboard/casos-por-analista", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req, "t");
    //${whereClause}
    const query = `
      SELECT
        COALESCE(u.str_nombre || ' ' || u.str_apellido, 'Sin Asignar') AS nombre_analista,
        COUNT(t.id) AS total_tickets
      FROM tickets.tbl_tickets t
      LEFT JOIN public.tbl_usuarios u ON t.creador_agente_id = u.id
      ${whereClause}
      GROUP BY u.id, u.str_nombre, u.str_apellido
      ORDER BY total_tickets DESC
      LIMIT 10;
    `;

    //console.log(query);

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/dashboard/casos-cerrados-por-analista", async (req, res) => {
  try {
    const { whereClause, params } = construirFiltrosDashboard(req, "t");
    const query = `
      SELECT
        COALESCE(u.str_nombre || ' ' || u.str_apellido, 'Sin Asignar') AS nombre_analista,
        COUNT(t.id) AS tickets_cerrados
      FROM tickets.tbl_tickets t
      LEFT JOIN public.tbl_usuarios u ON COALESCE(t.cierre_agente_id, t.usuario_asignado_id) = u.id
      LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id
      ${whereClause} AND e.str_tipo = 'ESTATUSTICKET' AND e.str_nombre = 'Cerrado'
      GROUP BY u.id, u.str_nombre, u.str_apellido
      ORDER BY tickets_cerrados DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/clientes-con-tickets", async (req, res) => {
  try {
    const query = `SELECT * FROM tickets.view_clientes_con_tickets ORDER BY created_at DESC;`;
    const { rows } = await pool.query(query);
    return res
      .status(200)
      .json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno." });
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
        COALESCE(c_nat.str_nombre || ' ' || c_nat.str_apellido, c_jur.str_razon_social, 'Cliente / Usuario') AS solicitante,
        TO_CHAR(t.created_at, 'DD/MM/YYYY HH24:MI') AS tiempo,
        TO_CHAR(t.dmt_fecha_cierre, 'DD/MM/YYYY HH24:MI') AS fecha_cierre
      FROM tickets.tbl_tickets t
      LEFT JOIN public.cat_datos_maestros e ON t.estatus_id = e.id
      LEFT JOIN tickets.tbl_clientes_naturales c_nat ON t.cliente_id = c_nat.id
      LEFT JOIN tickets.tbl_clientes_juridicos c_jur ON t.cliente_juridico_id = c_jur.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/departamentos", async (req, res) => {
  try {
    const query = `SELECT id, str_nombre, str_descripcion FROM public.cat_departamentos ORDER BY str_nombre ASC;`;
    const resultado = await pool.query(query);
    res.status(200).json({ success: true, departamentos: resultado.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
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
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/datos-maestros", async (req, res) => {
  try {
    const query = `SELECT id, str_tipo, str_nombre, str_descripcion, bol_activo FROM public.cat_datos_maestros WHERE bol_activo = true ORDER BY str_tipo, id ASC;`;
    const resultado = await pool.query(query);
    const datos = resultado.rows;
    res.status(200).json({
      success: true,
      canales: datos.filter((item) => item.str_tipo === "CANAL"),
      categoria_externa: datos.filter(
        (item) => item.str_tipo === "CATEGORIA_EXTERNA",
      ),
      categoria_interna: datos.filter(
        (item) => item.str_tipo === "CATEGORIA_INTERNA",
      ),
      prioridades: datos.filter((item) => item.str_tipo === "PRIORIDAD"),
      tipoTicket: datos.filter((item) => item.str_tipo === "TIPO_TICKET"),
      estatus: datos.filter((item) => item.str_tipo === "ESTATUSTICKET"),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/cliente/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    const query = `SELECT id, str_cedula, str_nombre, str_apellido, str_telefono, str_email FROM tickets.tbl_clientes_naturales WHERE str_cedula = $1 LIMIT 1;`;
    const resultado = await pool.query(query, [cedula]);
    res.status(200).json({
      success: true,
      existe: resultado.rows.length > 0,
      cliente: resultado.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/cliente-juridico/:rif", async (req, res) => {
  const { rif } = req.params;
  try {
    const query = `SELECT id, str_rif, str_razon_social, str_telefono, str_email FROM tickets.tbl_clientes_juridicos WHERE str_rif = $1 LIMIT 1;`;
    const resultado = await pool.query(query, [rif]);
    res.status(200).json({
      success: true,
      existe: resultado.rows.length > 0,
      cliente: resultado.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.post("/crear", upload.any(), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      tipo_ticket_id,
      cliente_id,
      cliente_juridico_id,
      cierre_agente_id,
      departamento_id,
      categoria_id,
      prioridad_id,
      canal_id,
      str_asunto,
      str_descripcion,
      usuario_asignado_id,
      tipo_solicitante_ext,
      str_cedula_cliente,
      str_nombre_cliente,
      str_apellido_cliente,
      str_correo_cliente,
      str_telefono_cliente,
      str_rif_cliente,
      str_razon_social_cliente,
      str_correo_juridico_cliente,
      str_telefono_juridico_cliente,
    } = req.body;

    const usuarioIdSesion = req.user?.id;
    let valoresAsignado = usuario_asignado_id
      ? Number(usuario_asignado_id)
      : null;
    let clienteFinalId = null;
    let clienteJuridicoFinalId = null;

    if (!valoresAsignado && departamento_id) {
      const deptRes = await client.query(
        `SELECT str_nombre FROM public.cat_departamentos WHERE id = $1 LIMIT 1;`,
        [Number(departamento_id)],
      );
      if (deptRes.rows.length > 0) {
        const nombreDept = deptRes.rows[0].str_nombre.toLowerCase();
        if (
          nombreDept.includes("tecnolog") ||
          nombreDept.includes("tecnologia")
        ) {
          const userRandRes = await client.query(
            `SELECT id FROM public.tbl_usuarios WHERE departamento_id = $1 AND bol_activo = true ORDER BY RANDOM() LIMIT 1;`,
            [Number(departamento_id)],
          );
          if (userRandRes.rows.length > 0) {
            valoresAsignado = userRandRes.rows[0].id;
          }
        }
      }
    }

    if (tipo_solicitante_ext === "juridico") {
      const rifTrim = str_rif_cliente
        ? str_rif_cliente.trim().toLowerCase()
        : null;
      const razonSocial = str_razon_social_cliente
        ? str_razon_social_cliente.trim()
        : null;
      const correoJuri = str_correo_juridico_cliente
        ? str_correo_juridico_cliente.trim().toLowerCase()
        : null;

      if (rifTrim) {
        const checkRes = await client.query(
          `SELECT id FROM tickets.tbl_clientes_juridicos WHERE str_rif = $1 LIMIT 1;`,
          [rifTrim],
        );
        if (checkRes.rows.length > 0) {
          clienteJuridicoFinalId = checkRes.rows[0].id;
          await client.query(
            `UPDATE tickets.tbl_clientes_juridicos SET str_razon_social = $1, str_email = $2, str_telefono = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4;`,
            [
              razonSocial,
              correoJuri,
              str_telefono_juridico_cliente || null,
              clienteJuridicoFinalId,
            ],
          );
        } else {
          const insRes = await client.query(
            `INSERT INTO tickets.tbl_clientes_juridicos (str_rif, str_razon_social, str_email, str_telefono, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id;`,
            [
              rifTrim,
              razonSocial,
              correoJuri,
              str_telefono_juridico_cliente || null,
            ],
          );
          clienteJuridicoFinalId = insRes.rows[0].id;
        }
      }
    } else {
      const cedula = str_cedula_cliente ? str_cedula_cliente.trim() : null;
      const nombre = str_nombre_cliente ? str_nombre_cliente.trim() : null;
      const apellido = str_apellido_cliente
        ? str_apellido_cliente.trim()
        : null;
      const correo = str_correo_cliente
        ? str_correo_cliente.trim().toLowerCase()
        : null;

      if (cedula) {
        const checkRes = await client.query(
          `SELECT id FROM tickets.tbl_clientes_naturales WHERE str_cedula = $1 LIMIT 1;`,
          [cedula],
        );
        if (checkRes.rows.length > 0) {
          clienteFinalId = checkRes.rows[0].id;
          await client.query(
            `UPDATE tickets.tbl_clientes_naturales SET str_nombre = $1, str_apellido = $2, str_email = $3, str_telefono = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5;`,
            [
              nombre,
              apellido,
              correo,
              str_telefono_cliente || null,
              clienteFinalId,
            ],
          );
        } else {
          const insRes = await client.query(
            `INSERT INTO tickets.tbl_clientes_naturales (str_cedula, str_nombre, str_apellido, str_email, str_telefono, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id;`,
            [cedula, nombre, apellido, correo, str_telefono_cliente || null],
          );
          clienteFinalId = insRes.rows[0].id;
        }
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const seqResult = await client.query(
      `
        INSERT INTO tickets.tbl_secuencias_tickets (int_anio, int_mes, int_dia, int_ultimo_secuencial)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (int_anio, int_mes, int_dia)
        DO UPDATE SET int_ultimo_secuencial = tickets.tbl_secuencias_tickets.int_ultimo_secuencial + 1
        RETURNING int_ultimo_secuencial;
      `,
      [year, month, day],
    );

    const nextNumber = seqResult.rows[0].int_ultimo_secuencial;
    const str_ticket = `MEPTK-${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}-${String(nextNumber).padStart(3, "0")}`;

    const slaRes = await client.query(
      `SELECT tiempo_maximo FROM tickets.cat_sla_configuracion WHERE prioridad_id = $1 AND activo = TRUE LIMIT 1;`,
      [prioridad_id ? Number(prioridad_id) : null],
    );
    const horasSla =
      slaRes.rows.length > 0 ? Number(slaRes.rows[0].tiempo_maximo) : 24;
    const fechaVencimientoSla = new Date(
      Date.now() + horasSla * 60 * 60 * 1000,
    );

    const archivos = req.files || [];
    const { str_ruta_imagen, str_ruta_video, str_ruta_audio } =
      await procesarArchivosConSharp(archivos, str_ticket);

    const queryInsert = `
      INSERT INTO tickets.tbl_tickets (
        str_ticket, tipo_ticket_id, cliente_id, cliente_juridico_id, creador_agente_id, cierre_agente_id,
        departamento_id, categoria_id, prioridad_id,
        canal_id, str_asunto, str_descripcion, int_sla,
        str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id,
        dmt_fecha_vencimiento_sla, created_at, updated_at
      ) VALUES (
        $1, $2::integer, $3::integer, $4::integer, $5::integer, $6::integer,
        $7::integer, $8::integer, $9::integer, $10::integer,
        $11::varchar, $12::text, $13::integer,
        $14::text, $15::text, $16::text, $17::integer,
        $18::timestamp, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    const values = [
      str_ticket,
      tipo_ticket_id ? Number(tipo_ticket_id) : null,
      clienteFinalId,
      clienteJuridicoFinalId,
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
      fechaVencimientoSla,
    ];

    const nuevoTicketRes = await client.query(queryInsert, values);
    const ticketCreado = nuevoTicketRes.rows[0];

    // 🔔 INSERTAR ALERTA EN BD SI HAY USUARIO ASIGNADO
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

    // 🔔 EMITIR SOCKET.IO
    if (valoresAsignado && nuevaAlerta) {
      const io = req.app.get("io");
      if (io && Number(valoresAsignado) !== Number(usuarioIdSesion)) {
        io.to(`user_${valoresAsignado}`).emit("nueva_alerta", nuevaAlerta);
      }
    }

    res.status(201).json({
      success: true,
      message: "Ticket creado exitosamente.",
      ticket: ticketCreado,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res
      .status(500)
      .json({ success: false, error: "Error interno al procesar el ticket." });
  } finally {
    client.release();
  }
});

router.get("/listar", async (req, res) => {
  try {
    const { buscar } = req.query;

    // 1. Obtenemos el WHERE y los parámetros ya armados por la función global
    const { whereClause, params } = construirFiltrosDashboard(req, "t");

    // 2. Iniciamos la consulta usando la vista 'tickets.view_listar_tickets'
    let query = `SELECT * FROM tickets.view_listar_tickets t ${whereClause}`;

    // 3. Determinamos el índice del siguiente parámetro basado en los que ya usó construirFiltrosDashboard
    let paramIndex = params.length + 1;

    // 4. Añadimos el filtro exclusivo de búsqueda por texto si viene en la query
    if (buscar) {
      query += ` AND (t.str_ticket ILIKE $${paramIndex} OR t.str_asunto ILIKE $${paramIndex} OR t.solicitante_nombre ILIKE $${paramIndex} OR t.solicitante_documento ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC;`;

    const resultado = await pool.query(query, params);
    res.status(200).json({ success: true, tickets: resultado.rows });
  } catch (err) {
    console.error("Error al listar tickets:", err);
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

router.get("/bitacora/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params;
  try {
    const query = `
      SELECT b.id, b.ticket_id, b.str_comentario, b.created_at, u.id AS usuario_id, u.str_nombre AS usuario_nombre, u.str_apellido AS usuario_apellido
      FROM tickets.tbl_tickets_bitacora b
      LEFT JOIN public.tbl_usuarios u ON b.usuario_id = u.id
      WHERE b.ticket_id = $1
      ORDER BY b.created_at ASC;
    `;
    const resultado = await pool.query(query, [Number(ticket_id)]);
    res.status(200).json({ success: true, bitacora: resultado.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error interno." });
  }
});

/* router.put("/actualizar/:id", upload.any(), async (req, res) => {
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

    // 1. Consultar estado anterior del ticket
    const ticketAnteriorRes = await client.query(
      `SELECT usuario_asignado_id, str_ticket, str_asunto FROM tickets.tbl_tickets WHERE id = $1`,
      [Number(id)],
    );
    const asignadoAnterior = ticketAnteriorRes.rows[0]?.usuario_asignado_id;

    // 2. Verificar si el nuevo estatus_id pertenece a un cierre (ID 22 o catálogo maestro)
    let esCierre = false;
    let nuevoEstatusIdNum = estatus_id ? Number(estatus_id) : null;

    if (nuevoEstatusIdNum) {
      const estatusCatRes = await client.query(
        `SELECT id, str_nombre FROM public.cat_datos_maestros WHERE id = $1 AND str_tipo = 'ESTATUSTICKET'`,
        [nuevoEstatusIdNum],
      );

      if (estatusCatRes.rows.length > 0) {
        const nombreEstatus = (
          estatusCatRes.rows[0].str_nombre || ""
        ).toLowerCase();
        if (
          nuevoEstatusIdNum === 22 ||
          nombreEstatus.includes("cerrado") ||
          nombreEstatus.includes("cancelado")
        ) {
          esCierre = true;
        }
      }
    }

    // 3. Registrar respuesta en bitácora si existe
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

    // 4. Ejecutar el UPDATE calculando la duración exacta (dmt_fecha_cierre - created_at)
    const updateRes = await client.query(
      `UPDATE tickets.tbl_tickets
       SET estatus_id = COALESCE($1, estatus_id),
           usuario_asignado_id = COALESCE($2, usuario_asignado_id),
           departamento_id = COALESCE($3, departamento_id),
           prioridad_id = COALESCE($4, prioridad_id),
           dmt_fecha_cierre = CASE
               WHEN $5 = TRUE THEN COALESCE(dmt_fecha_cierre, CURRENT_TIMESTAMP)
               ELSE dmt_fecha_cierre
           END,
           cierre_agente_id = CASE
               WHEN $5 = TRUE THEN COALESCE(cierre_agente_id, $6)
               ELSE cierre_agente_id
           END,
           tiempo_resolucion = CASE
               WHEN $5 = TRUE THEN
                   TRIM(
                       COALESCE(NULLIF(EXTRACT(DAY FROM (COALESCE(dmt_fecha_cierre, CURRENT_TIMESTAMP) - created_at)) || 'd ', '0d '), '') ||
                       COALESCE(NULLIF(EXTRACT(HOUR FROM (COALESCE(dmt_fecha_cierre, CURRENT_TIMESTAMP) - created_at)) || 'h ', '0h '), '') ||
                       COALESCE(EXTRACT(MINUTE FROM (COALESCE(dmt_fecha_cierre, CURRENT_TIMESTAMP) - created_at)) || 'm', '0m')
                   )
               ELSE tiempo_resolucion
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *;`,
      [
        nuevoEstatusIdNum,
        usuario_asignado_id !== undefined && usuario_asignado_id !== ""
          ? Number(usuario_asignado_id)
          : null,
        departamento_id ? Number(departamento_id) : null,
        prioridad_id ? Number(prioridad_id) : null,
        esCierre, // $5: Booleano de cierre
        usuarioIdSesion ? Number(usuarioIdSesion) : null, // $6: ID del agente que cierra
        Number(id), // $7
      ],
    );
    const ticketActualizado = updateRes.rows[0];

    // 5. INSERTAR ALERTA EN BD SI CAMBIÓ EL RESPONSABLE / ASIGNADO
    let nuevaAlertaActualizacion = null;
    const nuevoResponsableId = ticketActualizado.usuario_asignado_id;

    if (nuevoResponsableId && nuevoResponsableId !== asignadoAnterior) {
      const mensajeAlerta = `Se te ha reasignado el ticket: [${ticketActualizado.str_ticket}] ${ticketActualizado.str_asunto || "Sin asunto"}`;
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

    // 6. EMITIR SOCKET.IO AL ACTUALIZAR / REASIGNAR
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
      message: "Actualizado exitosamente.",
      ticket: ticketActualizado,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar ticket:", err);
    res
      .status(500)
      .json({ success: false, error: "Error interno al actualizar." });
  } finally {
    client.release();
  }
});
 */

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

    // 1. Consultar estado anterior del ticket
    const ticketAnteriorRes = await client.query(
      `SELECT usuario_asignado_id, estatus_id, dmt_fecha_inicio_pausa, int_minutos_pausa, created_at, dmt_fecha_cierre, str_ticket, str_asunto FROM tickets.tbl_tickets WHERE id = $1`,
      [Number(id)],
    );
    const ticketAnt = ticketAnteriorRes.rows[0];
    const asignadoAnterior = ticketAnt?.usuario_asignado_id;
    const estatusAnteriorId = ticketAnt?.estatus_id ? Number(ticketAnt.estatus_id) : null;
    const fechaInicioPausaAnt = ticketAnt?.dmt_fecha_inicio_pausa;
    let minutosPausaAcumulados = parseFloat(ticketAnt?.int_minutos_pausa) || 0;
    const fechaCreacionTicket = ticketAnt?.created_at;

    // 2. Definir estatus de pausa (IDs 18 y 19)
    let nuevoEstatusIdNum = estatus_id ? Number(estatus_id) : null;
    
    const esPausa = (estId) => estId === 18 || estId === 19;
    const eraPausa = esPausa(estatusAnteriorId);
    const seraPausa = nuevoEstatusIdNum ? esPausa(nuevoEstatusIdNum) : eraPausa;

    // 3. Lógica en JS para pausa y fechas de inicio/fin
    let nuevaFechaInicioPausa = fechaInicioPausaAnt;

    if (!eraPausa && seraPausa) {
      nuevaFechaInicioPausa = new Date();
    } else if (eraPausa && !seraPausa) {
      if (fechaInicioPausaAnt) {
        const inicio = new Date(fechaInicioPausaAnt);
        const ahora = new Date();
        const diffMs = ahora - inicio;
        if (diffMs > 0) {
          minutosPausaAcumulados += diffMs / (1000 * 60);
        }
      }
      nuevaFechaInicioPausa = null;
    }

    const totalMinutosPausaStr = minutosPausaAcumulados.toFixed(2);

    // 4. Verificar si el nuevo estatus es Cierre (ID 22 o catálogo maestro)
    let esCierre = false;
    if (nuevoEstatusIdNum) {
      const estatusCatRes = await client.query(
        `SELECT id, str_nombre FROM public.cat_datos_maestros WHERE id = $1 AND str_tipo = 'ESTATUSTICKET'`,
        [nuevoEstatusIdNum],
      );

      if (estatusCatRes.rows.length > 0) {
        const nombreEstatus = (
          estatusCatRes.rows[0].str_nombre || ""
        ).toLowerCase();
        if (
          nuevoEstatusIdNum === 22 ||
          nombreEstatus.includes("cerrado") ||
          nombreEstatus.includes("cancelado")
        ) {
          esCierre = true;
        }
      }
    }

    // 5. Calcular tiempo de resolución en Node.js si se va a cerrar
    let tiempoResolucionCalculado = null;
    let fechaCierreFinal = null;

    if (esCierre) {
      fechaCierreFinal = ticketAnt?.dmt_fecha_cierre || new Date();
      if (fechaCreacionTicket) {
        const inicio = new Date(fechaCreacionTicket);
        const fin = new Date(fechaCierreFinal);
        const diffMs = fin - inicio;
        if (diffMs > 0) {
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          let resText = "";
          if (diffDays > 0) resText += `${diffDays}d `;
          if (diffHrs > 0 || diffDays > 0) resText += `${diffHrs}h `;
          resText += `${diffMins}m`;
          tiempoResolucionCalculado = resText.trim();
        }
      }
    }

    // 6. Registrar respuesta en bitácora si existe
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

    // 7. Ejecutar el UPDATE de forma limpia y directa (sin CASE complejos conflictivos)
    const updateRes = await client.query(
      `UPDATE tickets.tbl_tickets
       SET estatus_id = COALESCE($1, estatus_id),
           usuario_asignado_id = COALESCE($2, usuario_asignado_id),
           departamento_id = COALESCE($3, departamento_id),
           prioridad_id = COALESCE($4, prioridad_id),
           dmt_fecha_cierre = COALESCE($5, dmt_fecha_cierre),
           cierre_agente_id = COALESCE($6, cierre_agente_id),
           dmt_fecha_inicio_pausa = $7,
           int_minutos_pausa = $8,
           tiempo_resolucion = COALESCE($9, tiempo_resolucion),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *;`,
      [
        nuevoEstatusIdNum,
        usuario_asignado_id !== undefined && usuario_asignado_id !== "" ? Number(usuario_asignado_id) : null,
        departamento_id ? Number(departamento_id) : null,
        prioridad_id ? Number(prioridad_id) : null,
        esCierre ? (ticketAnt?.dmt_fecha_cierre || new Date()) : null, // $5
        esCierre ? (usuarioIdSesion ? Number(usuarioIdSesion) : null) : null, // $6
        nuevaFechaInicioPausa,       // $7
        totalMinutosPausaStr,        // $8
        tiempoResolucionCalculado,   // $9
        Number(id),                  // $10
      ],
    );
    const ticketActualizado = updateRes.rows[0];

    // 8. Alerta de reasignación
    let nuevaAlertaActualizacion = null;
    const nuevoResponsableId = ticketActualizado.usuario_asignado_id;

    if (nuevoResponsableId && nuevoResponsableId !== asignadoAnterior) {
      const mensajeAlerta = `Se te ha reasignado el ticket: [${ticketActualizado.str_ticket}] ${ticketActualizado.str_asunto || "Sin asunto"}`;
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

    // 9. Socket.io
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
      message: "Actualizado exitosamente.",
      ticket: ticketActualizado,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar ticket:", err);
    res
      .status(500)
      .json({ success: false, error: "Error interno al actualizar." });
  } finally {
    client.release();
  }
});

module.exports = router;
