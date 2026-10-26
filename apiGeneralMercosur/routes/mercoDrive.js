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
const jwt = require("jsonwebtoken");
const archiver = require("archiver");

// Endpoint para crear enlace de Drive, almacenar archivos/auditoría y retornar el link con JWT (Requiere autenticación)
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

      const queryEnlace = `
        INSERT INTO drive.tbl_enlaces (str_nombre_enlace, fecha_expiracion, usuario_id, str_nombre_usuario, created_at)
        VALUES ($1, $2::date, $3::integer, $4, CURRENT_TIMESTAMP)
        RETURNING id;
      `;
      const enlaceRes = await client.query(queryEnlace, [
        str_nombre_enlace.trim(),
        fecha_expiracion,
        Number(usuario_id),
        str_nombre_usuario.trim(),
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

      const fechaActual = new Date();
      const fechaVencimientoObj = new Date(fecha_expiracion + "T23:59:59");
      const diferenciaSegundos = Math.floor(
        (fechaVencimientoObj - fechaActual) / 1000,
      );
      const tiempoExpiracionJwt =
        diferenciaSegundos > 0 ? diferenciaSegundos : 86400;

      const tokenEnlace = jwt.sign(
        { enlace_id: enlaceId },
        process.env.JWT_SECRET,
        { expiresIn: `${tiempoExpiracionJwt}s` },
      );

      const baseURL =
        process.env.URL_BACKEND_PUBLICO || "http://localhost:3000";
      const linkDescarga = `${baseURL}/drive/descargar?token=${tokenEnlace}`;

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

// ==========================================
// RUTA PÚBLICA DE DESCARGA (SIN MIDDLEWARES DE SESIÓN)
// ==========================================
router.get("/descargar", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .send("Token de descarga no proporcionado o inválido.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { enlace_id } = decoded;

    const queryArchivos = `
      SELECT ea.str_nombre_archivo, ea.str_ruta_archivo 
      FROM drive.tbl_enlaces_archivos ea
      WHERE ea.enlace_id = $1;
    `;
    const resultado = await pool.query(queryArchivos, [enlace_id]);

    if (resultado.rows.length === 0) {
      return res
        .status(404)
        .send("El enlace no contiene archivos o ha expirado.");
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
      const queryEnlaceNombre = `SELECT str_nombre_enlace FROM drive.tbl_enlaces WHERE id = $1 LIMIT 1;`;
      const resEnlace = await pool.query(queryEnlaceNombre, [enlace_id]);

      let nombreZip = `archivos-drive-${enlace_id}`;
      if (resEnlace.rows.length > 0 && resEnlace.rows[0].str_nombre_enlace) {
        nombreZip = resEnlace.rows[0].str_nombre_enlace
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
    console.error("Error al procesar la descarga pública:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Este enlace de descarga ha expirado.");
    }
    return res.status(400).send("Enlace de descarga inválido o corrupto.");
  }
});

// Obtener la lista de enlaces creados junto con sus archivos asociados y su link de descarga
router.get(
  "/enlaces",
  verificarClienteFrontend,
  verificarSesion,
  async (req, res) => {
    try {
      const { usuario_id } = req.query;

      let queryEnlace = `
      SELECT id, str_nombre_enlace, fecha_expiracion, usuario_id, str_nombre_usuario, created_at 
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
      const baseURL =
        process.env.URL_BACKEND_PUBLICO || "http://localhost:3000";

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
          const fechaVencimientoObj = new Date(fechaStr + "T23:59:59");
          const diferenciaSegundos = Math.floor(
            (fechaVencimientoObj - fechaActual) / 1000,
          );
          const tiempoExpiracionJwt =
            diferenciaSegundos > 0 ? diferenciaSegundos : 1;

          let tokenEnlace = "";
          if (diferenciaSegundos > 0) {
            tokenEnlace = jwt.sign(
              { enlace_id: enlace.id },
              process.env.JWT_SECRET,
              { expiresIn: `${tiempoExpiracionJwt}s` },
            );
          }

          const linkDescarga =
            diferenciaSegundos > 0
              ? `${baseURL}/drive/descargar?token=${tokenEnlace}`
              : "Enlace Expirado";

          return {
            ...enlace,
            fecha_expiracion: fechaStr,
            linkDescarga,
            estaExpirado: diferenciaSegundos <= 0,
            pesoTotalMb: Number(pesoTotalMb),
            archivos: archivosConPeso,
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

// Extender el tiempo del link
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
router.get("/descargar-local/:id", verificarClienteFrontend, verificarSesion, async (req, res) => {
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
      return res.status(404).send("El enlace no contiene archivos asociados.");
    }

    const archivos = resultado.rows;

    // Si es un solo archivo, se descarga exactamente con su nombre original
    if (archivos.length === 1) {
      const archivo = archivos[0];
      const rutaFisica = archivo.str_ruta_archivo.startsWith("/")
        ? archivo.str_ruta_archivo
        : path.join("/", archivo.str_ruta_archivo);

      if (!fs.existsSync(rutaFisica)) {
        return res.status(404).send("El archivo físico ya no se encuentra disponible en el servidor.");
      }

      return res.download(rutaFisica, archivo.str_nombre_archivo);
    } 
    
    // Si son múltiples archivos, se comprimen en un ZIP usando rigurosamente el nombre del enlace
    else {
      let nombreZip = `Enlace_${id}`;
      if (enlaceInfo.str_nombre_enlace && enlaceInfo.str_nombre_enlace.trim() !== "") {
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
});

module.exports = router;