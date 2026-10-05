const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const verificarClienteFrontend = require("../middlewares/autenticarToken");
const verificarSesion = require("../middlewares/verificarSesion");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../mailer");

// --- MIDDLEWARE DE MANTENIMIENTO ---
const verificarMantenimiento = (req, res, next) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";
  if (isMaintenance && req.path !== "/config/mantenimiento") {
    return res.status(503).json({
      mantenimiento: true,
      message: "El sistema está en mantenimiento.",
    });
  }
  next();
};

router.use(verificarMantenimiento);
router.use(verificarClienteFrontend);

router.get("/config/mantenimiento", (req, res) => {
  res.status(200).json({
    mantenimiento: process.env.MAINTENANCE_MODE === "true",
  });
});

// --- RUTAS PÚBLICAS CLIENTES ---

router.post("/request-register", async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });
  const normalizedEmail = email.trim().toUpperCase();

  try {
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE UPPER(email) = $1",
      [normalizedEmail],
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está registrado en el sistema.",
      });
    }

    const registrationToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const verificationLink = `${process.env.URL}/completar-registro?token=${registrationToken}`;
    const currentYear = new Date().getFullYear();

    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: email,
      subject:
        "Confirmación de correo electrónico - Plataforma de Registro de Nuevo Cliente",
      html: `...`,
    });

    res.status(200).json({
      message: "Correo de invitación enviado. Revisa tu bandeja de entrada.",
    });
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

async function obtenerSistemasYOpciones(userId) {
  const resultado = await pool.query(
    "SELECT * FROM public.view_usuarios_opciones_sistemas WHERE usuario_id = $1",
    [userId],
  );

  if (resultado.rows.length === 0) return null;

  return Object.values(
    resultado.rows.reduce((acc, row) => {
      const {
        sistema,
        icono,
        color,
        ruta_sistema,
        descripcion,
        opcion,
        ruta_opcion,
        tiene_permiso,
        rol,
        opcion_icono,
      } = row;

      if (!acc[sistema]) {
        acc[sistema] = {
          sistema: sistema,
          icono: icono,
          color: color,
          ruta_sistema: ruta_sistema,
          descripcion: descripcion,
          rol: rol,
          opciones: [],
        };
      }

      acc[sistema].opciones.push({
        opcion: opcion,
        ruta_opcion: ruta_opcion,
        tiene_permiso: tiene_permiso,
        opcion_icono: opcion_icono,
      });

      return acc;
    }, {}),
  );
}

router.get("/sistemas-opciones/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const sistemasOpciones = await obtenerSistemasYOpciones(usuario_id);
    if (!sistemasOpciones) {
      return res.status(404).send("Usuario sin sistemas asignados");
    }
    res.json(sistemasOpciones);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, device_id, device_name } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email y contraseña son requeridos");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      "SELECT * FROM tbl_usuarios WHERE str_email = $1",
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    const user = result.rows[0];

    if (user.bol_activo === false) {
      return res
        .status(403)
        .send("Su cuenta se encuentra inactiva. Contacte al administrador.");
    }

    const validPassword = await bcrypt.compare(password, user.str_password);
    if (!validPassword) {
      return res.status(401).send("Contraseña incorrecta");
    }

    const secretKey = process.env.JWT_SECRET;

    // Token de acceso de corta duración (1 hora)
    const token = jwt.sign(
      { id: user.id, username: user.str_usuario },
      secretKey,
      { expiresIn: "1h" },
    );

    // PRUEBA: RefreshToken de renovación (12 horas)
    const refreshToken = jwt.sign(
      { id: user.id, username: user.str_usuario, type: "refresh" },
      secretKey,
      { expiresIn: "12h" },
    );

    pool
      .query(
        "DELETE FROM tbl_auth_tokens WHERE user_id = $1 AND expires_at < NOW()",
        [user.id],
      )
      .catch((err) =>
        console.error("Error al limpiar tokens expirados:", err.message),
      );

    const deviceId = device_id || "default_device";
    const deviceName = device_name || "Dispositivo Desconocido";

    // PRUEBA: Expira en 1 hora en la BD
    await pool.query(
      `INSERT INTO tbl_auth_tokens (user_id, str_device_id, str_device_name, token, used, expires_at)
       VALUES ($1, $2, $3, $4, false, NOW() + INTERVAL '1 hour')
       ON CONFLICT (user_id, str_device_id) 
       DO UPDATE SET 
         token = EXCLUDED.token, 
         used = false,
         created_at = NOW(),
         expires_at = EXCLUDED.expires_at,
         str_device_name = EXCLUDED.str_device_name`,
      [user.id, deviceId, deviceName, token],
    );

    await pool.query(
      `UPDATE public.tbl_usuarios SET fec_ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id],
    );

    const sistemasOpciones = await obtenerSistemasYOpciones(user.id);
    if (!sistemasOpciones) {
      return res.status(404).send("Usuario sin sistemas asignados");
    }

    res.json({
      id: user.id,
      username: user.str_usuario,
      email: user.str_email,
      nombre: user.str_nombre,
      apellido: user.str_apellido,
      token: token,
      refreshToken: refreshToken,
      sistemasOpciones: sistemasOpciones,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/refresh-token", verificarClienteFrontend, async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ error: "No se proporcionó un Refresh Token." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const userResult = await pool.query(
      "SELECT bol_activo FROM tbl_usuarios WHERE id = $1",
      [decoded.id],
    );

    if (
      userResult.rows.length === 0 ||
      userResult.rows[0].bol_activo === false
    ) {
      return res
        .status(403)
        .json({ error: "Usuario inactivo o no encontrado." });
    }

    // PRUEBA: Nuevo token de acceso de 1 hora
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // PRUEBA: Actualizar token activo en BD por 1 hora
    await pool.query(
      `UPDATE tbl_auth_tokens 
       SET token = $1, expires_at = NOW() + INTERVAL '1 hour' 
       WHERE user_id = $2`,
      [newAccessToken, decoded.id],
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Error al refrescar el token:", err.message);
    return res
      .status(403)
      .json({ error: "Refresh Token inválido o expirado." });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Correo Electrónico requerido");

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const userRes = await pool.query(
      "SELECT id, str_email, str_usuario FROM tbl_usuarios WHERE LOWER(str_email) = LOWER($1)",
      [normalizedEmail],
    );

    const genericResponse = {
      message: "Si el correo está registrado, recibirás un enlace.",
    };
    if (userRes.rows.length === 0) return res.status(200).json(genericResponse);

    const user = userRes.rows[0];
    const resetToken = jwt.sign(
      { email: user.str_email, id: user.id, type: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const resetLink = `${process.env.URL}/resetear-contrasena?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: user.str_email,
      subject: "Recuperación de Contraseña - Mercosur Enterprise Portal",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #003366; text-align: center;">Mercosur Casa de Bolsa, S.A.</h2>
          <p>Estimado/a <strong>${user.str_usuario || "Usuario"}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el <strong>Mercosur Enterprise Portal</strong>.</p>
          <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #003366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p>Por seguridad, este enlace expirará en <strong>15 minutos</strong>.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura; tu contraseña seguirá siendo la misma.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">Este es un mensaje automático generado por el sistema, por favor no respondas a este correo.</p>
        </div>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).send("Error en el servidor al procesar la solicitud.");
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE tbl_usuarios SET str_password = $1 WHERE lower(str_email) = lower($2)",
      [hashedPassword, email],
    );

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(401).json({ error: "El enlace es inválido o ha expirado." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "ID de usuario no proporcionado." });
    }

    await pool.query("DELETE FROM tbl_auth_tokens WHERE user_id = $1", [
      userId,
    ]);
    res.status(200).send("Sesión cerrada correctamente");
  } catch (err) {
    console.error("Error al cerrar sesión:", err.message);
    res.status(500).send("Error al cerrar sesión");
  }
});

module.exports = router;
