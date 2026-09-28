const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const router = express.Router();
const pool = require("../db");
const autenticarToken = require("../middlewares/autenticarToken");
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

  // Verifica que el archivo exista
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
/**
 * Endpoint para la descarga física de archivos
 * Sirve tanto para archivos individuales como para el ZIP generado
 */
router.get("/descargar-archivo/:nombre", (req, res) => {
  try {
    const nombreArchivo = req.params.nombre;

    // 1. Limpiamos el nombre por seguridad (evita que suban niveles de carpetas)
    const nombreLimpio = path.basename(nombreArchivo);

    // 2. Definimos la ruta absoluta donde residen tus archivos
    // IMPORTANTE: Asegúrate de que esta ruta coincida con la que usaste en el POST
    const carpetaUploads = "/var/www/uploads";
    const rutaAbsoluta = path.join(carpetaUploads, nombreLimpio);

    // 3. Verificamos si el archivo existe físicamente
    if (!fs.existsSync(rutaAbsoluta)) {
      console.error(`Archivo no encontrado: ${rutaAbsoluta}`);
      return res
        .status(404)
        .send("El archivo solicitado no existe en el servidor.");
    }

    // 4. Ejecutamos la descarga
    // res.download configura automáticamente los headers:
    // Content-Disposition: attachment; filename="..."
    res.download(rutaAbsoluta, nombreLimpio, (err) => {
      if (err) {
        console.error("Error durante la descarga:", err.message);

        // Si el cliente cancela la descarga o hay error de red, evitamos crashear
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

// Uso del middleware para proteger todas las rutas (A PARTIR DE AQUI SON PRIVADAS)
router.use(autenticarToken);

router.get("/fetchSistemas", async (req, res) => {
  try {
    const query = `SELECT * FROM public.view_sistemas_opciones`;

    const result = await pool.query(query);

    // Agrupamos los datos planos por sistema
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
          acc[row.sistema_id].opciones.push({
            id: row.opcion_id,
            opcion: row.opcion_nombre,
            ruta_opcion: row.str_ruta_opcion,
            ic: "FiCheckSquare",
          });
        }

        return acc;
      }, {}),
    );

    //console.log(JSON.stringify(sistemasEstructurados, null, 2));

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

    // Determinar el usuario al que se le asignará la relación
    const targetUserId = 1;

    await client.query("BEGIN");

    // ------------------------------------------
    // MODO EDICIÓN (Existe `id`)
    // ------------------------------------------
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

      // Si se cuenta con usuario, aseguramos la vinculación y que bol_activo sea true
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

        // Se inserta o se fuerza bol_activo = true si ya existía
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

    // ------------------------------------------
    // MODO CREACIÓN (No existe `id`)
    // ------------------------------------------

    // 1. Insertar el nuevo sistema en cat_sistemas
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

    // 2. Crear el rol de administración para este sistema (rol_id = 1) garantizando bol_activo = true
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

    // 3. Vincular al usuario obligando bol_activo = true
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

    // 4. Insertar la opción inicial ("Dashboard")
    const queryOpcion = `
      INSERT INTO public.cat_opciones (
        str_nombre, 
        str_ruta_opcion, 
        bol_eliminado
      ) 
      VALUES ($1, $2, false) 
      RETURNING id, str_nombre, str_ruta_opcion;
    `;
    const resOpcion = await client.query(queryOpcion, [
      "Dashboard",
      `${ruta}/dashboard`,
    ]);
    const nuevaOpcion = resOpcion.rows[0];

    // 5. Vincular la opción al rol del sistema en tbl_roles_sistemas_opciones
    const queryRolSistemaOpcion = `
      INSERT INTO public.tbl_roles_sistemas_opciones (
        roles_sistemas_id, 
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
    // 1. Verificar si el sistema existe
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

    // Validación de seguridad para evitar eliminar la Administración General
    if (sistema.str_sistema === "Administración General") {
      client.release();
      return res.status(403).json({
        error: "No se permite eliminar el sistema de Administración General.",
      });
    }

    await client.query("BEGIN");

    // 2. Obtener las IDs de las opciones (cat_opciones) vinculadas a los roles de este sistema
    const opcionesResult = await client.query(
      `SELECT DISTINCT opcion_id 
       FROM public.tbl_roles_sistemas_opciones 
       WHERE roles_sistemas_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    const opcionIds = opcionesResult.rows.map((row) => row.opcion_id);

    // 3. Eliminar las asignaciones de usuarios vinculadas a los roles del sistema (tbl_usuarios_roles_sistemas)
    await client.query(
      `DELETE FROM public.tbl_usuarios_roles_sistemas
       WHERE rol_sistema_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    // 4. Eliminar las relaciones de opciones con los roles del sistema (tbl_roles_sistemas_opciones)
    await client.query(
      `DELETE FROM public.tbl_roles_sistemas_opciones
       WHERE roles_sistemas_id IN (
         SELECT id FROM public.tbl_roles_sistemas WHERE sistema_id = $1
       )`,
      [id],
    );

    // 5. Eliminar las opciones asociadas de la tabla catálogo cat_opciones
    if (opcionIds.length > 0) {
      await client.query(
        `DELETE FROM public.cat_opciones WHERE id = ANY($1::int[])`,
        [opcionIds],
      );
    }

    // 6. Eliminar los roles asignados al sistema (tbl_roles_sistemas)
    await client.query(
      "DELETE FROM public.tbl_roles_sistemas WHERE sistema_id = $1",
      [id],
    );

    // 7. Eliminar el registro principal del sistema (cat_sistemas)
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

module.exports = router;
