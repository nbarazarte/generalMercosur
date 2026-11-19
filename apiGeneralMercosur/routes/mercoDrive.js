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
const crypto = require("crypto");
const archiver = require("archiver");

// Generador de código corto aleatorio URL-safe
function generarCodigoCorto(longitud = 8) {
  return crypto
    .randomBytes(Math.ceil((longitud * 3) / 4))
    .toString("base64url")
    .slice(0, longitud);
}

// Helper para obtener URL base sin barras finales (evita //drive/...)
function obtenerBaseUrlPublica() {
  return (process.env.URL_BACKEND_PUBLICO || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

// Helper para obtener IP real (Cloudflare / Proxy / Socket)
function obtenerIpOrigen(req) {
  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "N/A"
  );
}

// ==========================================
// MÓDULO ENLACES DE ARCHIVOS (DRIVE)
// ==========================================

// Endpoint para crear enlace de Drive, almacenar archivos/auditoría y retornar el link corto
router.post(
  "/crear-enlace",
  verificarClienteFrontend,
  verificarSesion,
  (req, res, next) => {
    upload.any()(req, res, function (err) {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  async (routerReq, routerRes) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const {
        str_nombre_enlace,
        fecha_expiracion,
        usuario_id,
        str_nombre_usuario,
      } = routerReq.body;

      const archivosNuevos = routerReq.files || [];

      if (
        !str_nombre_enlace ||
        !fecha_expiracion ||
        !usuario_id ||
        !str_nombre_usuario
      ) {
        return routerRes.status(400).json({
          success: false,
          error: "Faltan campos obligatorios en el formulario.",
        });
      }

      if (archivosNuevos.length === 0) {
        return routerRes.status(400).json({
          success: false,
          error: "Debe asociar al menos un archivo al enlace.",
        });
      }

      const nombreCarpetaSanitizado = str_nombre_usuario
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const carpetaUsuarioPath = path.join(
        "/var/www/uploads/drive",
        nombreCarpetaSanitizado,
      );
      if (!fs.existsSync(carpetaUsuarioPath)) {
        fs.mkdirSync(carpetaUsuarioPath, { recursive: true });
      }

      // Generar código corto garantizando que no exista colisión en BD
      let codigoCorto;
      let existe = true;
      while (existe) {
        codigoCorto = generarCodigoCorto(8);
        const check = await client.query(
          "SELECT 1 FROM drive.tbl_enlaces WHERE codigo_corto = $1",
          [codigoCorto],
        );
        existe = check.rows.length > 0;
      }

      const queryEnlace = `
        INSERT INTO drive.tbl_enlaces (str_nombre_enlace, fecha_expiracion, usuario_id, str_nombre_usuario, codigo_corto, created_at)
        VALUES ($1, $2::date, $3::integer, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id, codigo_corto;
      `;
      const enlaceRes = await client.query(queryEnlace, [
        str_nombre_enlace.trim(),
        fecha_expiracion,
        Number(usuario_id),
        str_nombre_usuario.trim(),
        codigoCorto,
      ]);
      const enlaceId = enlaceRes.rows[0].id;

      for (const file of archivosNuevos) {
        const extension = path.extname(file.originalname);
        const nombreUnico = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${extension}`;
        const rutaFisicaDestino = path.join(carpetaUsuarioPath, nombreUnico);

        if (fs.existsSync(file.path)) {
          fs.renameSync(file.path, rutaFisicaDestino);
        }

        const rutaRelativaBD = path.join(
          "/var/www/uploads/drive",
          nombreCarpetaSanitizado,
          nombreUnico,
        );

        await client.query(
          `INSERT INTO drive.tbl_enlaces_archivos (enlace_id, str_nombre_archivo, str_ruta_archivo, es_archivo_drive)
           VALUES ($1, $2, $3, false)`,
          [enlaceId, file.originalname, rutaRelativaBD],
        );
      }

      await client.query("COMMIT");

      const baseURL = obtenerBaseUrlPublica();
      const linkDescarga = `${baseURL}/drive/d/${codigoCorto}`;

      routerRes.status(201).json({
        success: true,
        message: "Enlace de Drive creado exitosamente.",
        linkDescarga: linkDescarga,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error al crear enlace en Drive:", err);
      routerRes.status(500).json({
        success: false,
        error: "Error interno al procesar la creación del enlace.",
      });
    } finally {
      client.release();
    }
  },
);

// RUTA PÚBLICA DE DESCARGA CORTA (SIN MIDDLEWARES DE SESIÓN)
router.get("/d/:codigo", async (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).send("Código de descarga no proporcionado.");
  }

  try {
    const queryEnlace = `
      SELECT id, str_nombre_enlace, fecha_expiracion
      FROM drive.tbl_enlaces
      WHERE codigo_corto = $1
      LIMIT 1;
    `;
    const resEnlace = await pool.query(queryEnlace, [codigo]);

    if (resEnlace.rows.length === 0) {
      return res
        .status(404)
        .send("El enlace de descarga no existe o es inválido.");
    }

    const enlace = resEnlace.rows[0];

    const fechaStr =
      enlace.fecha_expiracion instanceof Date
        ? enlace.fecha_expiracion.toISOString().split("T")[0]
        : String(enlace.fecha_expiracion).split("T")[0];

    const fechaVencimientoObj = new Date(`${fechaStr}T23:59:59-04:00`);
    if (new Date() > fechaVencimientoObj) {
      return res.status(401).send("Este enlace de descarga ha expirado.");
    }

    const enlace_id = enlace.id;

    const queryArchivos = `
      SELECT ea.str_nombre_archivo, ea.str_ruta_archivo
      FROM drive.tbl_enlaces_archivos ea
      WHERE ea.enlace_id = $1;
    `;
    const resultado = await pool.query(queryArchivos, [enlace_id]);

    if (resultado.rows.length === 0) {
      return res.status(404).send("El enlace no contiene archivos.");
    }

    const archivos = resultado.rows;

    const registrarDescarga = async () => {
      const userAgent = req.headers["user-agent"] || "Desconocido";
      const ipOrigen = obtenerIpOrigen(req);

      const esBotPreview =
        /WhatsApp|TelegramBot|Slackbot|Twitterbot|facebookexternalhit/i.test(
          userAgent,
        );

      if (!esBotPreview) {
        await pool.query(
          `INSERT INTO drive.tbl_enlaces_descargas (enlace_id, ip_origen, user_agent)
           VALUES ($1, $2, $3)`,
          [enlace_id, ipOrigen, userAgent],
        );
      }
    };

    if (archivos.length === 1) {
      const archivo = archivos[0];
      const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
        ? archivo.str_ruta_archivo
        : path.join("/", archivo.str_ruta_archivo);

      if (!fs.existsSync(rutaFisica)) {
        return res
          .status(404)
          .send(
            "El archivo físico ya no se encuentra disponible en el servidor.",
          );
      }

      await registrarDescarga();
      return res.download(rutaFisica, archivo.str_nombre_archivo);
    } else {
      let nombreZip = `archivos-drive-${enlace_id}`;
      if (enlace.str_nombre_enlace) {
        nombreZip = enlace.str_nombre_enlace
          .trim()
          .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, "_");
      }

      await registrarDescarga();

      res.attachment(`${nombreZip}.zip`);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(res);

      for (const archivo of archivos) {
        const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
          ? archivo.str_ruta_archivo
          : path.join("/", archivo.str_ruta_archivo);

        if (fs.existsSync(rutaFisica)) {
          archive.file(rutaFisica, { name: archivo.str_nombre_archivo });
        }
      }

      await archive.finalize();
    }
  } catch (err) {
    console.error("Error al procesar la descarga pública:", err);
    return res.status(500).send("Error interno al procesar la descarga.");
  }
});

// Obtener la lista de enlaces de Drive creados
router.get(
  "/enlaces",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    try {
      const { usuario_id } = req.query;

      let queryEnlace = `
      SELECT id, str_nombre_enlace, fecha_expiracion, usuario_id, str_nombre_usuario, codigo_corto, created_at
      FROM drive.tbl_enlaces
    `;
      const params = [];

      if (usuario_id) {
        queryEnlace += ` WHERE usuario_id = $1 `;
        params.push(Number(usuario_id));
      }

      queryEnlace += ` ORDER BY created_at DESC;`;

      const resultadoEnlaces = await pool.query(queryEnlace, params);
      const enlaces = resultadoEnlaces.rows;
      const baseURL = obtenerBaseUrlPublica();

      const enlacesConDetalles = await Promise.all(
        enlaces.map(async (enlace) => {
          const queryArchivos = `
          SELECT id, str_nombre_archivo, str_ruta_archivo, es_archivo_drive
          FROM drive.tbl_enlaces_archivos
          WHERE enlace_id = $1;
        `;
          const resArchivos = await pool.query(queryArchivos, [enlace.id]);
          const archivosDB = resArchivos.rows;

          let pesoTotalBytes = 0;
          const archivosConPeso = archivosDB.map((archivo) => {
            let tamanioBytes = 0;
            try {
              const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
                ? archivo.str_ruta_archivo
                : path.join("/", archivo.str_ruta_archivo);

              if (fs.existsSync(rutaFisica)) {
                const stats = fs.statSync(rutaFisica);
                tamanioBytes = stats.size;
              }
            } catch (e) {
              console.error("Error al obtener peso del archivo físico:", e);
            }

            pesoTotalBytes += tamanioBytes;
            const tamanioMb = (tamanioBytes / (1024 * 1024)).toFixed(2);

            return {
              ...archivo,
              tamanioMb: Number(tamanioMb),
            };
          });

          const pesoTotalMb = (pesoTotalBytes / (1024 * 1024)).toFixed(2);

          let fechaStr = "";
          if (enlace.fecha_expiracion) {
            if (enlace.fecha_expiracion instanceof Date) {
              fechaStr = enlace.fecha_expiracion.toISOString().split("T")[0];
            } else {
              fechaStr = String(enlace.fecha_expiracion).split("T")[0];
            }
          }

          const fechaActual = new Date();
          const fechaVencimientoObj = new Date(`${fechaStr}T23:59:59-04:00`);
          const estaExpirado = fechaActual > fechaVencimientoObj;

          const linkDescarga =
            !estaExpirado && enlace.codigo_corto
              ? `${baseURL}/drive/d/${enlace.codigo_corto}`
              : "Enlace Expirado";

          const queryDescargas = `
            SELECT id, ip_origen, user_agent, fecha_descarga
            FROM drive.tbl_enlaces_descargas
            WHERE enlace_id = $1
            ORDER BY fecha_descarga DESC;
          `;
          const resDescargas = await pool.query(queryDescargas, [enlace.id]);
          const historialDescargas = resDescargas.rows;

          return {
            ...enlace,
            fecha_expiracion: fechaStr,
            linkDescarga,
            estaExpirado,
            pesoTotalMb: Number(pesoTotalMb),
            archivos: archivosConPeso,
            totalDescargas: historialDescargas.length,
            ultimaDescarga: historialDescargas[0]?.fecha_descarga || null,
            historialDescargas,
          };
        }),
      );

      res.status(200).json({ success: true, enlaces: enlacesConDetalles });
    } catch (err) {
      console.error("Error al listar los enlaces de Drive:", err);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener los enlaces.",
      });
    }
  },
);

// Extender el tiempo del enlace de Drive
router.put(
  "/enlaces/extender/:id",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    const { id } = req.params;
    const { nueva_fecha_expiracion } = req.body;

    if (!nueva_fecha_expiracion) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar una nueva fecha de expiración.",
      });
    }

    try {
      const queryUpdate = `
      UPDATE drive.tbl_enlaces
      SET fecha_expiracion = $1::date, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, fecha_expiracion;
    `;
      const resultado = await pool.query(queryUpdate, [
        nueva_fecha_expiracion,
        Number(id),
      ]);

      if (resultado.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Enlace no encontrado." });
      }

      res.status(200).json({
        success: true,
        message: "Vigencia del enlace extendida exitosamente.",
        enlace: resultado.rows[0],
      });
    } catch (err) {
      console.error("Error al extender la vigencia del enlace:", err);
      res.status(500).json({
        success: false,
        error: "Error interno al actualizar la vigencia.",
      });
    }
  },
);

// Ruta protegida para descarga local directa desde el panel de Mis Enlaces
router.get(
  "/descargar-local/:id",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    const { id } = req.params;

    try {
      const queryEnlace = `
      SELECT id, str_nombre_enlace
      FROM drive.tbl_enlaces
      WHERE id = $1 LIMIT 1;
    `;
      const resEnlace = await pool.query(queryEnlace, [Number(id)]);

      if (resEnlace.rows.length === 0) {
        return res.status(404).send("El enlace no existe o fue eliminado.");
      }

      const enlaceInfo = resEnlace.rows[0];

      const queryArchivos = `
      SELECT ea.str_nombre_archivo, ea.str_ruta_archivo
      FROM drive.tbl_enlaces_archivos ea
      WHERE ea.enlace_id = $1;
    `;
      const resultado = await pool.query(queryArchivos, [Number(id)]);

      if (resultado.rows.length === 0) {
        return res
          .status(404)
          .send("El enlace no contiene archivos asociados.");
      }

      const archivos = resultado.rows;

      if (archivos.length === 1) {
        const archivo = archivos[0];
        const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
          ? archivo.str_ruta_archivo
          : path.join("/", archivo.str_ruta_archivo);

        if (!fs.existsSync(rutaFisica)) {
          return res
            .status(404)
            .send(
              "El archivo físico ya no se encuentra disponible en el servidor.",
            );
        }

        return res.download(rutaFisica, archivo.str_nombre_archivo);
      } else {
        let nombreZip = `Enlace_${id}`;
        if (
          enlaceInfo.str_nombre_enlace &&
          enlaceInfo.str_nombre_enlace.trim() !== ""
        ) {
          nombreZip = enlaceInfo.str_nombre_enlace
            .trim()
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, "_");
        }

        res.attachment(`${nombreZip}.zip`);
        const archive = archiver("zip", { zlib: { level: 9 } });

        archive.on("error", (err) => {
          throw err;
        });

        archive.pipe(res);

        for (const archivo of archivos) {
          const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
            ? archivo.str_ruta_archivo
            : path.join("/", archivo.str_ruta_archivo);

          if (fs.existsSync(rutaFisica)) {
            archive.file(rutaFisica, { name: archivo.str_nombre_archivo });
          }
        }

        await archive.finalize();
      }
    } catch (err) {
      console.error("Error al procesar la descarga local:", err);
      return res.status(500).send("Error interno al procesar la descarga.");
    }
  },
);

// ==========================================
// MÓDULO ACORTADOR DE URLs GENÉRICAS (OPCIÓN B)
// ==========================================

// 1. Crear URL corta (Protegida)
router.post(
  "/acortar-url",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    try {
      const {
        str_titulo,
        str_url_original,
        fecha_expiracion,
        usuario_id,
        str_nombre_usuario,
      } = req.body;

      if (
        !str_titulo ||
        !str_url_original ||
        !usuario_id ||
        !str_nombre_usuario
      ) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos obligatorios.",
        });
      }

      let urlValidada = str_url_original.trim();
      if (!/^https?:\/\//i.test(urlValidada)) {
        urlValidada = `https://${urlValidada}`;
      }

      try {
        new URL(urlValidada);
      } catch {
        return res.status(400).json({
          success: false,
          error: "La URL ingresada no tiene un formato válido.",
        });
      }

      let codigoCorto;
      let existe = true;
      while (existe) {
        codigoCorto = generarCodigoCorto(7);
        const check = await pool.query(
          "SELECT 1 FROM drive.tbl_urls_cortas WHERE codigo_corto = $1",
          [codigoCorto],
        );
        existe = check.rows.length > 0;
      }

      const queryInsert = `
        INSERT INTO drive.tbl_urls_cortas
          (str_titulo, str_url_original, codigo_corto, usuario_id, str_nombre_usuario, fecha_expiracion)
        VALUES ($1, $2, $3, $4::integer, $5, $6::date)
        RETURNING id, codigo_corto;
      `;

      await pool.query(queryInsert, [
        str_titulo.trim(),
        urlValidada,
        codigoCorto,
        Number(usuario_id),
        str_nombre_usuario.trim(),
        fecha_expiracion || null,
      ]);

      const baseURL = obtenerBaseUrlPublica();
      const linkCorto = `${baseURL}/drive/u/${codigoCorto}`;

      return res.status(201).json({
        success: true,
        message: "URL acortada exitosamente.",
        linkCorto,
      });
    } catch (err) {
      console.error("Error al acortar URL:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno al generar el enlace corto.",
      });
    }
  },
);

// 2. Redirección pública con registro en tbl_urls_cortas_clics (Sin sesión)
router.get("/u/:codigo", async (req, res) => {
  const { codigo } = req.params;

  try {
    const query = `
      SELECT id, str_url_original, fecha_expiracion
      FROM drive.tbl_urls_cortas
      WHERE codigo_corto = $1
      LIMIT 1;
    `;
    const resultado = await pool.query(query, [codigo]);

    if (resultado.rows.length === 0) {
      return res.status(404).send("El enlace corto no existe o fue eliminado.");
    }

    const registro = resultado.rows[0];

    if (registro.fecha_expiracion) {
      const fechaStr =
        registro.fecha_expiracion instanceof Date
          ? registro.fecha_expiracion.toISOString().split("T")[0]
          : String(registro.fecha_expiracion).split("T")[0];

      const fechaVencimientoObj = new Date(`${fechaStr}T23:59:59-04:00`);
      if (new Date() > fechaVencimientoObj) {
        return res.status(410).send("Este enlace ha expirado.");
      }
    }

    const userAgent = req.headers["user-agent"] || "Desconocido";
    const esBotPreview =
      /WhatsApp|TelegramBot|Slackbot|Twitterbot|facebookexternalhit/i.test(
        userAgent,
      );

    if (!esBotPreview) {
      const ipOrigen = obtenerIpOrigen(req);

      await pool.query(
        "UPDATE drive.tbl_urls_cortas SET total_clics = total_clics + 1 WHERE id = $1",
        [registro.id],
      );

      await pool.query(
        `INSERT INTO drive.tbl_urls_cortas_clics (url_corta_id, ip_origen, user_agent)
         VALUES ($1, $2, $3)`,
        [registro.id, ipOrigen, userAgent],
      );
    }

    return res.redirect(302, registro.str_url_original);
  } catch (err) {
    console.error("Error al redirigir URL corta:", err);
    return res.status(500).send("Error interno al procesar la redirección.");
  }
});

// 3. Listar URLs acortadas con estado e historial de clics (Protegida)
router.get(
  "/urls-cortas",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    try {
      const { usuario_id } = req.query;
      let query = `
        SELECT id, str_titulo, str_url_original, codigo_corto, usuario_id, str_nombre_usuario, fecha_expiracion, total_clics, created_at
        FROM drive.tbl_urls_cortas
      `;
      const params = [];

      if (usuario_id) {
        query += ` WHERE usuario_id = $1 `;
        params.push(Number(usuario_id));
      }

      query += ` ORDER BY created_at DESC;`;

      const resultado = await pool.query(query, params);
      const baseURL = obtenerBaseUrlPublica();

      const urlsConDetalles = await Promise.all(
        resultado.rows.map(async (item) => {
          let fechaStr = "";
          let estaExpirado = false;

          if (item.fecha_expiracion) {
            fechaStr =
              item.fecha_expiracion instanceof Date
                ? item.fecha_expiracion.toISOString().split("T")[0]
                : String(item.fecha_expiracion).split("T")[0];

            const fechaVencimientoObj = new Date(`${fechaStr}T23:59:59-04:00`);
            estaExpirado = new Date() > fechaVencimientoObj;
          }

          const resClics = await pool.query(
            `SELECT id, ip_origen, user_agent, fecha_clic
             FROM drive.tbl_urls_cortas_clics
             WHERE url_corta_id = $1
             ORDER BY fecha_clic DESC`,
            [item.id],
          );
          const historialClics = resClics.rows;

          const totalClics =
            historialClics.length > 0
              ? historialClics.length
              : item.total_clics || 0;

          return {
            ...item,
            fecha_expiracion: fechaStr || null,
            linkCorto: `${baseURL}/drive/u/${item.codigo_corto}`,
            estaExpirado,
            totalClics,
            ultimoClic: historialClics[0]?.fecha_clic || null,
            historialClics,
          };
        }),
      );

      return res.status(200).json({ success: true, urls: urlsConDetalles });
    } catch (err) {
      console.error("Error al listar URLs cortas:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno al obtener las URLs.",
      });
    }
  },
);

// 4. Extender vigencia de una URL corta (Protegida)
router.put(
  "/urls-cortas/extender/:id",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    const { id } = req.params;
    const { nueva_fecha_expiracion } = req.body;

    if (!nueva_fecha_expiracion) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar una nueva fecha de expiración.",
      });
    }

    try {
      const resultado = await pool.query(
        `UPDATE drive.tbl_urls_cortas
         SET fecha_expiracion = $1::date
         WHERE id = $2
         RETURNING id, fecha_expiracion`,
        [nueva_fecha_expiracion, Number(id)],
      );

      if (resultado.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Enlace no encontrado." });
      }

      return res.status(200).json({
        success: true,
        message: "Vigencia actualizada exitosamente.",
        enlace: resultado.rows[0],
      });
    } catch (err) {
      console.error("Error al extender vigencia de URL corta:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno al actualizar la vigencia.",
      });
    }
  },
);

module.exports = router;
