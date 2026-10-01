const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const router = express.Router();
const pool = require("../db");
const autenticarToken = require("../middlewares/autenticarToken");
const bcrypt = require("bcryptjs");
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

router.get("/descargar-archivo/:nombre", (req, res) => {
  try {
    const nombreArchivo = req.params.nombre;
    const nombreLimpio = path.basename(nombreArchivo);
    const carpetaUploads = "/var/www/uploads";
    const rutaAbsoluta = path.join(carpetaUploads, nombreLimpio);

    if (!fs.existsSync(rutaAbsoluta)) {
      console.error(`Archivo no encontrado: ${rutaAbsoluta}`);
      return res
        .status(404)
        .send("El archivo solicitado no existe en el servidor.");
    }

    res.download(rutaAbsoluta, nombreLimpio, (err) => {
      if (err) {
        console.error("Error durante la descarga:", err.message);
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

router.use(autenticarToken);

// ==========================================
// 0. ENDPOINT: OBTIENE LA LISTA DE SISTEMAS
// ==========================================
router.get("/fetchSistemas", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_sistemas_opciones`;
    const result = await pool.query(query);

    const sistemasEstructurados = Object.values(
      result.rows.reduce((acc, row) => {
        if (!acc[row.sistema_id]) {
          acc[row.sistema_id] = {
            id: row.sistema_id,
            nombre: row.str_sistema,
            ic: row.str_icono,
            color: row.str_color,
            desc: row.str_descripcion,
            ruta: row.str_ruta_sistema,
            opciones: [],
          };
        }

        if (row.opcion_id) {
          const opcionesSistema = acc[row.sistema_id].opciones;
          const existeOpcion = opcionesSistema.some(
            (op) => op.id === row.opcion_id,
          );
          if (!existeOpcion) {
            opcionesSistema.push({
              id: row.opcion_id,
              opcion: row.opcion_nombre,
              ruta_opcion: row.str_ruta_opcion,
              ic: row.opcion_icono || "FiCheckSquare",
            });
          }
        }

        return acc;
      }, {}),
    );

    res.json({ sistemas: sistemasEstructurados });
  } catch (err) {
    console.error("Error al obtener sistemas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// 1. ENDPOINT: GUARDAR SISTEMA (CREAR / EDITAR)
// ==========================================
router.post("/guardarSistema", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id, nombre, desc, ruta, ic, color } = req.body;

    if (!nombre || !ruta) {
      return res.status(400).json({
        error: "Los campos 'nombre' y 'ruta' son obligatorios.",
      });
    }

    const targetUserId = 1;

    await client.query("BEGIN");

    if (id) {
      const updateQuery = `
        UPDATE public.cat_sistemas 
        SET 
          str_sistema = $1, 
          str_descripcion = $2, 
          str_ruta_sistema = $3, 
          str_icono = $4, 
          str_color = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING id, str_sistema, str_descripcion, str_ruta_sistema, str_icono, str_color;
      `;

      const resUpdate = await client.query(updateQuery, [
        nombre,
        desc || null,
        ruta,
        ic || null,
        color || "#d8992a",
        id,
      ]);

      if (resUpdate.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "El sistema no existe." });
      }

      const sistemaEditado = resUpdate.rows[0];

      if (targetUserId) {
        let resRolSys = await client.query(
          "SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1 AND rol_id = 1 LIMIT 1",
          [id],
        );

        let rolSistemaId;
        if (resRolSys.rowCount === 0) {
          const insRolSys = await client.query(
            `INSERT INTO public.tbl_roles_sistemas (rol_id, sistema_id, created_at, updated_at, bol_activo)
             VALUES (1, $1, NOW(), NOW(), true) RETURNING id;`,
            [id],
          );
          rolSistemaId = insRolSys.rows[0].id;
        } else {
          rolSistemaId = resRolSys.rows[0].id;
        }

        await client.query(
          `INSERT INTO public.tbl_usuarios_roles_sistemas (usuario_id, rol_sistema_id, bol_activo, created_at, updated_at)
           VALUES ($1, $2, true, CURRENT_DATE, CURRENT_DATE)
           ON CONFLICT (usuario_id, rol_sistema_id) 
           DO UPDATE SET bol_activo = true, updated_at = CURRENT_DATE;`,
          [targetUserId, rolSistemaId],
        );
      }

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Sistema actualizado exitosamente.",
        esEdicion: true,
        sistema: {
          id: sistemaEditado.id,
          nombre: sistemaEditado.str_sistema,
          ic: sistemaEditado.str_icono,
          color: sistemaEditado.str_color,
          desc: sistemaEditado.str_descripcion,
          ruta_sistema: sistemaEditado.str_ruta_sistema,
        },
      });
    }

    const querySistema = `
      INSERT INTO public.cat_sistemas (
        str_sistema, 
        str_descripcion, 
        str_ruta_sistema, 
        str_icono, 
        str_color,
        bol_activo
      ) 
      VALUES ($1, $2, $3, $4, $5, true) 
      RETURNING id, str_sistema, str_descripcion, str_ruta_sistema, str_icono, str_color;
    `;
    const resSistema = await client.query(querySistema, [
      nombre,
      desc || null,
      ruta,
      ic || null,
      color || "#d8992a",
    ]);
    const nuevoSistema = resSistema.rows[0];

    const queryRolSistema = `
      INSERT INTO public.tbl_roles_sistemas (
        rol_id, 
        sistema_id, 
        created_at, 
        updated_at, 
        bol_activo
      ) 
      VALUES ($1, $2, NOW(), NOW(), true) 
      RETURNING id;
    `;
    const resRolSistema = await client.query(queryRolSistema, [
      1,
      nuevoSistema.id,
    ]);
    const nuevoRolSistemaId = resRolSistema.rows[0].id;

    if (targetUserId) {
      const queryUsuarioRolSistema = `
        INSERT INTO public.tbl_usuarios_roles_sistemas (
          usuario_id, 
          rol_sistema_id, 
          bol_activo,
          created_at,
          updated_at
        ) 
        VALUES ($1, $2, true, CURRENT_DATE, CURRENT_DATE);
      `;
      await client.query(queryUsuarioRolSistema, [
        targetUserId,
        nuevoRolSistemaId,
      ]);
    }

    const queryOpcion = `
      INSERT INTO public.cat_opciones (
        str_nombre, 
        str_ruta_opcion, 
        str_icono,
        bol_eliminado
      ) 
      VALUES ($1, $2, $3, false) 
      RETURNING id, str_nombre, str_ruta_opcion, str_icono;
    `;
    const resOpcion = await client.query(queryOpcion, [
      "Dashboard",
      `${ruta}/dashboard`,
      "FiCheckSquare",
    ]);

    const nuevaOpcion = resOpcion.rows[0];

    const queryRolSistemaOpcion = `
      INSERT INTO public.tbl_roles_sistemas_opciones (
        rol_sistema_id, 
        opcion_id
      ) 
      VALUES ($1, $2);
    `;
    await client.query(queryRolSistemaOpcion, [
      nuevoRolSistemaId,
      nuevaOpcion.id,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Sistema creado exitosamente.",
      esEdicion: false,
      sistema: {
        id: nuevoSistema.id,
        nombre: nuevoSistema.str_sistema,
        ic: nuevoSistema.str_icono,
        color: nuevoSistema.str_color,
        desc: nuevoSistema.str_descripcion,
        ruta_sistema: nuevoSistema.str_ruta_sistema,
        opciones: [
          {
            id: nuevaOpcion.id,
            opcion: nuevaOpcion.str_nombre,
            ruta_opcion: nuevaOpcion.str_ruta_opcion,
            ic: "FiCheckSquare",
          },
        ],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al procesar el sistema:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ELIMINAR SISTEMA Y SUS OPCIONES
// ==========================================
router.delete("/eliminarSistema/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "El ID del sistema es requerido.",
    });
  }

  const client = await pool.connect();

  try {
    const sistemaResult = await client.query(
      "SELECT id, str_sistema FROM public.cat_sistemas WHERE id = $1",
      [id],
    );

    if (sistemaResult.rowCount === 0) {
      client.release();
      return res.status(404).json({
        error: "El sistema especificado no existe.",
      });
    }

    const sistema = sistemaResult.rows[0];

    if (sistema.str_sistema === "Administración General") {
      client.release();
      return res.status(403).json({
        error: "No se permite eliminar el sistema de Administración General.",
      });
    }

    await client.query("BEGIN");

    const opcionesResult = await client.query(
      `SELECT DISTINCT opcion_id 
       FROM public.tbl_roles_sistemas_opciones 
       WHERE rol_sistema_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    const opcionIds = opcionesResult.rows.map((row) => row.opcion_id);

    await client.query(
      `DELETE FROM public.tbl_usuarios_roles_sistemas
       WHERE rol_sistema_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    await client.query(
      `DELETE FROM public.tbl_roles_sistemas_opciones
       WHERE rol_sistema_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    if (opcionIds.length > 0) {
      await client.query(
        `DELETE FROM public.cat_opciones WHERE id = ANY($1::int[])`,
        [opcionIds],
      );
    }

    await client.query(
      "DELETE FROM public.tbl_roles_sistemas WHERE sistema_id = $1",
      [id],
    );

    await client.query("DELETE FROM public.cat_sistemas WHERE id = $1", [id]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: `El sistema "${sistema.str_sistema}", sus opciones y todas sus configuraciones fueron eliminados exitosamente.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar el sistema:", error);
    return res.status(500).json({
      error: "Ocurrió un error en el servidor al intentar eliminar el sistema.",
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: GUARDAR OPCIÓN (CREAR / EDITAR)
// ==========================================
router.post("/guardarOpcion", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id, sistemaId, opcion, ruta_opcion, ic } = req.body;

    if (!sistemaId || !opcion || !ruta_opcion) {
      return res.status(400).json({
        error:
          "El ID del sistema, el nombre de la opción y la ruta son obligatorios.",
      });
    }

    await client.query("BEGIN");

    if (id) {
      const updateQuery = `
        UPDATE public.cat_opciones
        SET 
          str_nombre = $1,
          str_ruta_opcion = $2,
          str_icono = $3
        WHERE id = $4
        RETURNING id, str_nombre, str_ruta_opcion, str_icono;
      `;

      const resUpdate = await client.query(updateQuery, [
        opcion,
        ruta_opcion,
        ic || "FiCheckSquare",
        id,
      ]);

      if (resUpdate.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "La opción no existe." });
      }

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Opción actualizada exitosamente.",
        esEdicion: true,
        opcion: {
          id: resUpdate.rows[0].id,
          opcion: resUpdate.rows[0].str_nombre,
          ruta_opcion: resUpdate.rows[0].str_ruta_opcion,
          ic: resUpdate.rows[0].str_icono || "FiCheckSquare",
        },
      });
    }

    const rolSysRes = await client.query(
      `SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1 AND rol_id = 1 LIMIT 1`,
      [sistemaId],
    );

    let rolesSistemasId;
    if (rolSysRes.rowCount === 0) {
      const insRolSys = await client.query(
        `INSERT INTO public.tbl_roles_sistemas (rol_id, sistema_id, created_at, updated_at, bol_activo)
         VALUES (1, $1, NOW(), NOW(), true) RETURNING id;`,
        [sistemaId],
      );
      rolesSistemasId = insRolSys.rows[0].id;
    } else {
      rolesSistemasId = rolSysRes.rows[0].id;
    }

    const insertOpcionQuery = `
      INSERT INTO public.cat_opciones (str_nombre, str_ruta_opcion, str_icono, bol_eliminado)
      VALUES ($1, $2, $3, false)
      RETURNING id, str_nombre, str_ruta_opcion, str_icono;
    `;
    const resOpcion = await client.query(insertOpcionQuery, [
      opcion,
      ruta_opcion,
      ic || "FiCheckSquare",
    ]);
    const nuevaOpcion = resOpcion.rows[0];

    const insertRelacionQuery = `
      INSERT INTO public.tbl_roles_sistemas_opciones (rol_sistema_id, opcion_id)
      VALUES ($1, $2);
    `;
    await client.query(insertRelacionQuery, [rolesSistemasId, nuevaOpcion.id]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Opción agregada exitosamente.",
      esEdicion: false,
      opcion: {
        id: nuevaOpcion.id,
        opcion: nuevaOpcion.str_nombre,
        ruta_opcion: nuevaOpcion.str_ruta_opcion,
        ic: nuevaOpcion.str_icono || "FiCheckSquare",
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al guardar opción:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ELIMINAR OPCIÓN DE UN SISTEMA
// ==========================================
router.delete("/eliminarOpcion/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "El ID de la opción es requerido." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM public.tbl_roles_sistemas_opciones WHERE opcion_id = $1",
      [id],
    );

    const resOpcion = await client.query(
      "DELETE FROM public.cat_opciones WHERE id = $1 RETURNING str_nombre",
      [id],
    );

    if (resOpcion.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "La opción especificada no existe." });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `La opción "${resOpcion.rows[0].str_nombre}" fue eliminada correctamente.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar opción:", error);
    return res.status(500).json({
      error: "Ocurrió un error al intentar eliminar la opción.",
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: OBTIENE LA LISTA DE ROLES SISTEMAS Y OPCIONES
// ==========================================
router.get("/fetchRolesSistemasOpciones", async (req, res) => {
  try {
    const query = `
      SELECT 
        rs.id AS rol_sistema_id,
        rs.rol_id,
        s.id AS sistema_id,
        s.str_sistema,
        s.str_icono,
        s.str_color,
        s.str_descripcion,
        r.str_nombre AS rol,
        string_agg(DISTINCT o.str_nombre, ', ') AS opciones_asignadas,
        array_agg(DISTINCT o.id) FILTER (WHERE o.id IS NOT NULL) AS opcion_ids
      FROM public.tbl_roles_sistemas rs
      JOIN public.cat_sistemas s ON rs.sistema_id = s.id
      JOIN public.cat_roles r ON rs.rol_id = r.id
      LEFT JOIN public.tbl_roles_sistemas_opciones rso ON rs.id = rso.rol_sistema_id
      LEFT JOIN public.cat_opciones o ON rso.opcion_id = o.id
      GROUP BY rs.id, rs.rol_id, s.id, r.str_nombre;
    `;
    const result = await pool.query(query);

    const hexToRgba = (hex, alpha = 0.12) => {
      if (!hex || !hex.startsWith("#")) return hex;
      let cleanHex = hex.replace("#", "");
      if (cleanHex.length === 3) {
        cleanHex = cleanHex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const roles = result.rows.map((row) => ({
      id: row.rol_sistema_id,
      rol_id: row.rol_id,
      sistema_id: row.sistema_id,
      nombre: row.rol,
      desc: row.str_descripcion,
      ic: row.str_icono,
      color: row.str_color,
      bg: hexToRgba(row.str_color, 0.12),
      sistemas: row.str_sistema,
      permisos: row.opciones_asignadas
        ? row.opciones_asignadas.split(",").map((p) => p.trim())
        : [],
      opcion_ids: row.opcion_ids ? row.opcion_ids.map(Number) : [],
    }));

    res.json(roles);
  } catch (err) {
    console.error("Error al obtener roles sistemas opciones:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// ENDPOINT: ACTUALIZAR OPCIONES DE UN ROL EN UN SISTEMA
// ==========================================
router.post("/actualizarRolSistemaOpciones", async (req, res) => {
  const client = await pool.connect();

  try {
    const { rolSistemaId, opcionIds } = req.body;

    if (!rolSistemaId) {
      return res.status(400).json({
        error: "El ID del rol del sistema es obligatorio.",
      });
    }

    await client.query("BEGIN");

    await client.query(
      `DELETE FROM public.tbl_roles_sistemas_opciones WHERE rol_sistema_id = $1;`,
      [rolSistemaId],
    );

    if (Array.isArray(opcionIds) && opcionIds.length > 0) {
      const insertQuery = `
        INSERT INTO public.tbl_roles_sistemas_opciones (rol_sistema_id, opcion_id)
        SELECT $1, UNNEST($2::integer[]);
      `;
      await client.query(insertQuery, [rolSistemaId, opcionIds]);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Permisos y opciones del rol actualizados exitosamente.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar opciones del rol:", err.message);
    res.status(500).json({
      error: `Error en base de datos: ${err.message}`,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: OBTIENE EL CATÁLOGO DE ROLES (CAT_ROLES)
// ==========================================
router.get("/fetchCatRoles", async (req, res) => {
  try {
    const query = `SELECT id, str_nombre AS nombre FROM public.cat_roles ORDER BY id ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener catálogo de roles:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// ENDPOINT: GUARDAR ROL (CREAR / EDITAR EN CAT_ROLES)
// ==========================================
router.post("/guardarRol", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id, nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El nombre del rol es obligatorio.",
      });
    }

    await client.query("BEGIN");

    if (id) {
      const updateRol = await client.query(
        `UPDATE public.cat_roles 
         SET str_nombre = LOWER(TRIM($1)), updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, str_nombre;`,
        [nombre, id],
      );

      if (updateRol.rowCount === 0) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ error: "El rol no existe en el catálogo." });
      }

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Rol actualizado exitosamente en el catálogo.",
        rol: updateRol.rows[0],
      });
    } else {
      const nuevoRol = await client.query(
        `INSERT INTO public.cat_roles (str_nombre, created_at, updated_at) 
         VALUES (LOWER(TRIM($1)), NOW(), NOW()) 
         RETURNING id, str_nombre;`,
        [nombre],
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Rol creado exitosamente en el catálogo.",
        rol: nuevoRol.rows[0],
      });
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al guardar rol:", err.message);
    return res
      .status(500)
      .json({ error: `Error en base de datos: ${err.message}` });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ELIMINAR ROL (DE TBL_ROLES_SISTEMAS)
// ==========================================
router.post("/eliminarRol/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "El ID del rol es obligatorio.",
    });
  }

  try {
    await client.query("BEGIN");

    // Validar si tiene opciones asociadas antes de eliminar
    const checkOpciones = await client.query(
      `SELECT id FROM public.tbl_roles_sistemas_opciones WHERE rol_sistema_id = $1 LIMIT 1;`,
      [id],
    );

    if (checkOpciones.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error:
          "No se puede eliminar el rol del sistema porque tiene opciones asociadas.",
      });
    }

    await client.query(
      `DELETE FROM public.tbl_roles_sistemas_opciones WHERE rol_sistema_id = $1;`,
      [id],
    );

    await client.query(`DELETE FROM public.tbl_roles_sistemas WHERE id = $1;`, [
      id,
    ]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Rol eliminado exitosamente del sistema.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar rol:", err.message);
    return res
      .status(500)
      .json({ error: `Error en base de datos: ${err.message}` });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ASIGNAR ROL A SISTEMA
// ==========================================
router.post("/asignarRol", async (req, res) => {
  const client = await pool.connect();

  try {
    const { rolId, sistemaId } = req.body;

    if (!rolId || !sistemaId) {
      return res.status(400).json({
        error: "El ID del rol y el sistema son obligatorios.",
      });
    }

    await client.query("BEGIN");

    const checkExist = await client.query(
      `SELECT id FROM public.tbl_roles_sistemas WHERE rol_id = $1 AND sistema_id = $2 LIMIT 1;`,
      [rolId, sistemaId],
    );

    if (checkExist.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Este rol ya se encuentra asignado a este sistema.",
      });
    }

    const queryRolSistema = `
      INSERT INTO public.tbl_roles_sistemas (rol_id, sistema_id, created_at, updated_at, bol_activo)
      VALUES ($1, $2, NOW(), NOW(), true)
      RETURNING id;
    `;
    const resRolSistema = await client.query(queryRolSistema, [
      rolId,
      sistemaId,
    ]);

    const nuevoRolSistemaId = resRolSistema.rows[0].id;

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Rol asignado y opciones vinculadas exitosamente.",
      rolesSistemasId: nuevoRolSistemaId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al asignar rol y opciones:", err.message);
    return res.status(500).json({
      error: `Error en base de datos: ${err.message}`,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ELIMINAR ROL DEL CATÁLOGO (CAT_ROLES)
// ==========================================
router.post("/eliminarRolCat/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "El ID del rol es obligatorio." });
  }

  try {
    await client.query("BEGIN");

    const checkVinculo = await client.query(
      `SELECT id FROM public.tbl_roles_sistemas WHERE rol_id = $1 LIMIT 1;`,
      [id],
    );

    if (checkVinculo.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error:
          "No se puede eliminar el rol porque se encuentra vinculado a uno o más sistemas.",
      });
    }

    const deleteRol = await client.query(
      `DELETE FROM public.cat_roles WHERE id = $1 RETURNING str_nombre;`,
      [id],
    );

    if (deleteRol.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "El rol no existe en el catálogo." });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `El rol "${deleteRol.rows[0].str_nombre}" fue eliminado del catálogo exitosamente.`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar rol del catálogo:", err.message);
    return res
      .status(500)
      .json({ error: `Error en base de datos: ${err.message}` });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: OBTIENE LA LISTA DE USUARIOS CON SUS ACCESOS
// ==========================================
router.get("/fetchUsuarios", async (req, res) => {
  try {
    const usuariosQuery = `
      SELECT 
        u.id,
        u.str_nombre,
        u.str_apellido,
        u.str_email,
        u.str_usuario,
        u.str_cedula,
        u.bol_activo,
        u.departamento_id,
        d.str_nombre AS departamento,
        (
          SELECT MAX(t.created_at) 
          FROM public.tbl_auth_tokens t 
          WHERE t.user_id = u.id
        ) AS ultimo_acceso
      FROM public.tbl_usuarios u
      LEFT JOIN public.cat_departamentos d ON u.departamento_id = d.id
      ORDER BY u.id ASC;
    `;
    const usuariosRes = await pool.query(usuariosQuery);

    const rolesQuery = `
      SELECT 
        urs.usuario_id,
        s.id AS sistema_id,
        r.str_nombre AS rol_nombre
      FROM public.tbl_usuarios_roles_sistemas urs
      JOIN public.tbl_roles_sistemas rs ON urs.rol_sistema_id = rs.id
      JOIN public.cat_sistemas s ON rs.sistema_id = s.id
      JOIN public.cat_roles r ON rs.rol_id = r.id
      WHERE urs.bol_activo = true AND rs.bol_activo = true;
    `;
    const rolesRes = await pool.query(rolesQuery);

    const accesosPorUsuario = {};
    rolesRes.rows.forEach((row) => {
      if (!accesosPorUsuario[row.usuario_id]) {
        accesosPorUsuario[row.usuario_id] = {};
      }
      accesosPorUsuario[row.usuario_id][row.sistema_id] = row.rol_nombre;
    });

    // Función auxiliar para formatear la fecha del último acceso
    const formatUltimoAcceso = (fecha) => {
      if (!fecha) return "—";
      const d = new Date(fecha);
      const hoy = new Date();

      const esHoy =
        d.getDate() === hoy.getDate() &&
        d.getMonth() === hoy.getMonth() &&
        d.getFullYear() === hoy.getFullYear();

      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      const esAyer =
        d.getDate() === ayer.getDate() &&
        d.getMonth() === ayer.getMonth() &&
        d.getFullYear() === ayer.getFullYear();

      const horaMin = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (esHoy) return `Hoy, ${horaMin}`;
      if (esAyer) return `Ayer, ${horaMin}`;

      const dia = String(d.getDate()).padStart(2, "0");
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const anio = d.getFullYear();
      return `${dia}/${mes}/${anio} ${horaMin}`;
    };

    const usuariosMapeados = usuariosRes.rows.map((u) => ({
      id: u.id,
      nombre: `${u.str_nombre} ${u.str_apellido}`,
      nombres: u.str_nombre,
      apellidos: u.str_apellido,
      email: u.str_email,
      usuario: u.str_usuario,
      cedula: u.str_cedula,
      departamento_id: u.departamento_id,
      departamento: u.departamento,
      estado: u.bol_activo ? "active" : "inactive",
      ultimo: formatUltimoAcceso(u.ultimo_acceso),
      accesos: accesosPorUsuario[u.id] || {},
    }));

    res.json(usuariosMapeados);
  } catch (err) {
    console.error("Error al obtener usuarios:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// ENDPOINT: OBTIENE EL CATÁLOGO DE DEPARTAMENTOS
// ==========================================
router.get("/fetchDepartamentos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, str_nombre FROM public.cat_departamentos ORDER BY id ASC;",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener departamentos:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// ENDPOINT: GUARDAR USUARIO (CREAR / EDITAR)
// ==========================================
router.post("/guardarUsuario", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      id,
      cedula,
      nombre,
      apellido,
      email,
      usuario,
      password,
      departamento_id,
      estado,
    } = req.body;

    if (!cedula || !nombre || !apellido || !email || !departamento_id) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios para el usuario." });
    }

    const bol_activo = estado === "active";

    await client.query("BEGIN");

    if (id) {
      let query = `
        UPDATE public.tbl_usuarios 
        SET str_cedula = $1, str_nombre = $2, str_apellido = $3, str_email = $4, 
            str_usuario = $5, departamento_id = $6, bol_activo = $7, updated_at = NOW()
      `;
      let params = [
        cedula,
        nombre,
        apellido,
        email,
        usuario || null,
        departamento_id,
        bol_activo,
      ];

      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        query += `, str_password = $8 WHERE id = $9 RETURNING id;`;
        params.push(hashedPassword, id);
      } else {
        query += ` WHERE id = $8 RETURNING id;`;
        params.push(id);
      }

      const updateRes = await client.query(query, params);
      if (updateRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "El usuario no existe." });
      }

      await client.query("COMMIT");
      return res
        .status(200)
        .json({ message: "Usuario actualizado exitosamente." });
    } else {
      if (!password) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "La contraseña es obligatoria para nuevos usuarios.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertQuery = `
        INSERT INTO public.tbl_usuarios 
        (departamento_id, str_cedula, str_nombre, str_apellido, str_email, str_password, str_usuario, bol_activo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id;
      `;
      await client.query(insertQuery, [
        departamento_id,
        cedula,
        nombre,
        apellido,
        email,
        hashedPassword,
        usuario || null,
        bol_activo,
      ]);

      await client.query("COMMIT");
      return res.status(201).json({ message: "Usuario creado exitosamente." });
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al guardar usuario:", err.message);
    res.status(500).json({ error: `Error en base de datos: ${err.message}` });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINT: ELIMINAR USUARIO
// ==========================================
router.delete("/eliminarUsuario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM public.tbl_usuarios WHERE id = $1 RETURNING id;",
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (err) {
    console.error("Error al eliminar usuario:", err.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ==========================================
// ENDPOINT: ASIGNAR / ACTUALIZAR ROL DE USUARIO EN UN SISTEMA
// ==========================================
router.post("/actualizarAccesoUsuario", async (req, res) => {
  const client = await pool.connect();
  try {
    const { usuarioId, sistemaId, rolNombre } = req.body;

    if (!usuarioId || !sistemaId) {
      return res
        .status(400)
        .json({ error: "El usuario y el sistema son obligatorios." });
    }

    await client.query("BEGIN");

    // 1. Limpiar el rol previo que tuviera este usuario en este sistema específico
    await client.query(
      `DELETE FROM public.tbl_usuarios_roles_sistemas 
       WHERE usuario_id = $1 
       AND rol_sistema_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $2
       )`,
      [usuarioId, sistemaId],
    );

    // 2. Si se seleccionó un rol (si no viene vacío), buscamos su ID correspondiente en tbl_roles_sistemas
    if (rolNombre && rolNombre.trim() !== "") {
      const rolSysRes = await client.query(
        `SELECT rs.id 
         FROM public.tbl_roles_sistemas rs
         JOIN public.cat_roles r ON rs.rol_id = r.id
         WHERE rs.sistema_id = $1 AND r.str_nombre = $2 AND rs.bol_activo = true
         LIMIT 1`,
        [sistemaId, rolNombre],
      );

      if (rolSysRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          error: `El rol "${rolNombre}" no está asignado a este sistema. Debes asignarlo primero en la pestaña "Roles y Sistemas".`,
        });
      }

      const rolSistemaId = rolSysRes.rows[0].id;

      // 3. Insertar la relación definitiva en tbl_usuarios_roles_sistemas
      await client.query(
        `INSERT INTO public.tbl_usuarios_roles_sistemas (usuario_id, rol_sistema_id, bol_activo, created_at, updated_at)
         VALUES ($1, $2, true, CURRENT_DATE, CURRENT_DATE)
         ON CONFLICT (usuario_id, rol_sistema_id) 
         DO UPDATE SET bol_activo = true, updated_at = CURRENT_DATE`,
        [usuarioId, rolSistemaId],
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message:
        "Acceso del usuario actualizado correctamente en la base de datos.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar acceso de usuario:", err.message);
    res.status(500).json({ error: `Error en base de datos: ${err.message}` });
  } finally {
    client.release();
  }
});

// ==========================================
// ENDPOINTS PARA EL DASHBOARD Y GRÁFICOS
// ==========================================

// 1. Obtener KPIs generales
router.get("/dashboard/kpis", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_dashboard_kpis;`;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows[0] || {} });
  } catch (err) {
    console.error("Error al obtener KPIs del dashboard:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. Obtener Usuarios por Sistema (Gráfico de Barras)
router.get("/usuarios-por-sistema", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_dashboard_usuarios_por_sistema;`;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener usuarios por sistema:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 3. Obtener Distribución de Roles (Gráfico de Dona)
router.get("/distribucion-roles", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_dashboard_distribucion_roles;`;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener distribución de roles:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// ENDPOINT: ALERTAS DE ACCESOS Y SEGURIDAD
// ==========================================
router.get("/dashboard/alertas", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_dashboard_alertas_seguridad LIMIT 10;`;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener alertas de seguridad:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ==========================================
// ENDPOINT: ÚLTIMOS ACCESOS DE USUARIOS
// ==========================================
router.get("/dashboard/ultimos-accesos", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_dashboard_ultimos_accesos;`;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener últimos accesos:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;
