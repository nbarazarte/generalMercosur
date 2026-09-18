const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const autenticarToken = require("../middlewares/autenticarToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../mailer");

// --- MIDDLEWARE DE MANTENIMIENTO ---
const verificarMantenimiento = (req, res, next) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";
  // Excluimos la ruta de chequeo para evitar bucles infinitos
  if (isMaintenance && req.path !== "/config/mantenimiento") {
    return res.status(503).json({
      mantenimiento: true,
      message: "El sistema está en mantenimiento.",
    });
  }
  next();
};

// Aplicar el bloqueo globalmente a este router
router.use(verificarMantenimiento);

// Endpoint público para que el Frontend consulte el estado
router.get("/config/mantenimiento", (req, res) => {
  res.status(200).json({
    mantenimiento: process.env.MAINTENANCE_MODE === "true",
  });
});

// --- RUTAS PRIVADAS USUARIOS MERCOSUR---

// Nuevo endpoint para iniciar el registro
router.post("/request-register-bo", async (req, res) => {
  let { email } = req.body;

  // 1. Limpieza (Trimming y Normalización)
  if (!email) return res.status(400).json({ error: "Email requerido" });

  // Quitamos espacios en blanco y convertimos a MAYÚSCULAS
  const normalizedEmail = email.trim().toUpperCase();

  try {
    // 2. Verificación insensible a mayúsculas/minúsculas
    // Usamos UPPER() en la consulta por si acaso hay datos viejos mezclados
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios_bo WHERE UPPER(email) = $1",
      [normalizedEmail],
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está registrado en el sistema.",
      });
    }

    // 3. Generar token usando el email normalizado
    const registrationToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET || "123456",
      {
        expiresIn: "15m",
      },
    );

    const verificationLink = `${process.env.URL}/bo-completar-registro?token=${registrationToken}`;
    const currentYear = new Date().getFullYear();

    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: email,
      subject:
        "Confirmación de correo electrónico - Back Office Onboarding Mercosur",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff6600; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
        </div>
        
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
          <h3 style="color: #ff6600;">Bienvenido(a) a nuestro Back Office Onboarding Mercosur</h3>
          <p>Estimado colaborador,</p>
          <p>Se ha iniciado el proceso de creacion de usuario. Para completar tu registro al Back Office de Mercosur, es necesario que establezcas tu contraseña de acceso haciendo clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="padding: 12px 25px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Completar Creación de usuario
            </a>
          </div>
          
          <p style="font-size: 0.9rem; color: #666666;">
            Nota: Este enlace tiene una validez de <b>15 minutos</b> por motivos de seguridad.
          </p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 0.8rem; color: #999999; text-align: center;">
            Este es un correo automático, por favor no responda a esta dirección.<br>
            © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
          </p>
        </div>
      </div>
      `,
    });

    res.status(200).json({
      message: "Correo de invitación enviado. Revisa tu bandeja de entrada.",
    });
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

router.post("/register-bo", async (req, res) => {
  // 1. Recibimos el token del correo y la contraseña que el usuario definió
  const { token, password, username } = req.body;

  try {
    // 2. Verificamos el token de invitación
    // Asegúrate de que "tu_clave_secreta_temporal" sea la misma que usaste en /request-register
    const decoded = jwt.verify(token, "123456");
    const emailFromToken = decoded.email;

    const client = await pool.connect();

    try {
      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query("BEGIN");

      // 3. Insertar el usuario usando el email que venía en el TOKEN
      const nuevoUsuarioRes = await client.query(
        "INSERT INTO usuarios_bo (password, email, username) VALUES ($1, $2, $3) RETURNING id, email",
        [hashedPassword, emailFromToken, username],
      );
      const user = nuevoUsuarioRes.rows[0];

      // 4. Generar el Token de Sesión Real (JWT de acceso)
      // Nota: Cambié el nombre a 'accessToken' para no confundirlo con el 'token' del body
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        "secret", // Tu clave secreta de producción
        { expiresIn: "1h" },
      );

      // 5. Guardar el token en la base de datos
      await client.query(
        "INSERT INTO auth_tokens_bo (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, accessToken, new Date(Date.now() + 3600000)],
      );

      await client.query("COMMIT");

      res.status(201).json({
        id: user.id,
        email: user.email,
        username: user.username,
        token: accessToken,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error en la transacción de registro:", err);
      res.status(500).send("Error al procesar los datos del formulario.");
    } finally {
      client.release();
    }
  } catch (err) {
    // Este bloque atrapa errores de jwt.verify (token expirado o alterado)
    return res
      .status(401)
      .json({ error: "El enlace es inválido o ha expirado." });
  }
});

// Recuperar contraseña
router.post("/forgot-password-bo", async (req, res) => {
  const { email } = req.body;

  // Validación básica de entrada
  if (!email) return res.status(400).send("Email requerido");

  try {
    const normalizedEmail = email.trim().toUpperCase();

    // 1. Verificar si el usuario existe usando UPPER
    const userRes = await pool.query(
      "SELECT id, email, username FROM usuarios_bo WHERE UPPER(email) = $1",
      [normalizedEmail],
    );

    // Respuesta genérica por seguridad (evita enumeración de usuarios)
    const genericResponse = {
      message: "Si el correo está registrado, recibirás un enlace.",
    };

    if (userRes.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    // Extraemos el usuario encontrado
    const user = userRes.rows[0];

    // 2. Generar token de recuperación
    // IMPORTANTE: Usa el mismo secreto que en /login. Si allá usas "secret", aquí también.
    const resetToken = jwt.sign(
      { email: user.email, id: user.id, type: "reset" },
      "123456", // Cambia esto por process.env.JWT_SECRET
      { expiresIn: "15m" },
    );

    // 3. Configurar enlace (Verifica que process.env.URL esté definido en tu .env)
    const baseUrl = process.env.URL || "http://localhost:3000"; // Fallback por seguridad
    const resetLink = `${baseUrl}/bo-reset-password?token=${resetToken}`;

    // 4. Enviar Correo
    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: user.email, // Es mejor usar el email que viene de la base de datos
      subject: "Recuperación de Contraseña - Back Office Onboarding Mercosur",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ff6600; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa</h2>
          </div>
          <div style="padding: 30px; color: #333333;">
            <h3>Solicitud de cambio de contraseña</h3>
            <p>Hola, <strong>${user.email}</strong>.</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="padding: 12px 25px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 0.8rem; color: #666666;">Este enlace expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    // Si el error es de Nodemailer, se verá aquí en la consola
    console.error("Error en forgot-password:", error);
    res.status(500).send("Error en el servidor al procesar la solicitud.");
  }
});

// Endpoint para guardar la nueva contraseña
router.post("/reset-password-bo", async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, "123456");
    const email = decoded.email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE usuarios_bo SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(401).json({ error: "El enlace es inválido o ha expirado." });
  }
});

// Login de usuario
router.post("/login-bo", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toUpperCase();

    //const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    const result = await pool.query(
      "SELECT * FROM usuarios_bo WHERE UPPER(email) = $1",
      [normalizedEmail],
    );
    if (result.rows.length === 0)
      return res.status(404).send("Usuario no encontrado");

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send("Contraseña incorrecta");

    const token = jwt.sign({ id: user.id, username: user.username }, "secret", {
      expiresIn: "1h",
    });
    await pool.query(
      "INSERT INTO auth_tokens_bo (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, new Date(Date.now() + 3600000)],
    );
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});

// --- RUTAS PÚBLICAS CLIENTES---

// Nuevo endpoint para iniciar el registro
router.post("/request-register", async (req, res) => {
  let { email } = req.body;

  // 1. Limpieza (Trimming y Normalización)
  if (!email) return res.status(400).json({ error: "Email requerido" });

  // Quitamos espacios en blanco y convertimos a MAYÚSCULAS
  const normalizedEmail = email.trim().toUpperCase();

  try {
    // 2. Verificación insensible a mayúsculas/minúsculas
    // Usamos UPPER() en la consulta por si acaso hay datos viejos mezclados
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE UPPER(email) = $1",
      [normalizedEmail],
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está registrado en el sistema.",
      });
    }

    // 3. Generar token usando el email normalizado
    const registrationToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET || "123456",
      {
        expiresIn: "15m",
      },
    );

    const verificationLink = `${process.env.URL}/completar-registro?token=${registrationToken}`;
    const currentYear = new Date().getFullYear();

    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: email,
      subject:
        "Confirmación de correo electrónico - Plataforma de Registro de Nuevo Cliente",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff6600; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa, S.A.</h2>
        </div>
        
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
          <h3 style="color: #ff6600;">Bienvenido(a) a nuestra Plataforma de Registro Nuevo Cliente</h3>
          <p>Estimado cliente,</p>
          <p>Se ha iniciado el proceso de apertura de cuenta. Para completar tu registro y crear tu ficha de cliente, es necesario que establezcas tu contraseña de acceso haciendo clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="padding: 12px 25px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Completar Registro de Ficha
            </a>
          </div>
          
          <p style="font-size: 0.9rem; color: #666666;">
            Nota: Este enlace tiene una validez de <b>15 minutos</b> por motivos de seguridad.
          </p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 0.8rem; color: #999999; text-align: center;">
            Este es un correo automático, por favor no responda a esta dirección.<br>
            © ${currentYear} Mercosur Casa de Bolsa, S.A. RIF: J-30455414-1.
          </p>
        </div>
      </div>
      `,
    });

    res.status(200).json({
      message: "Correo de invitación enviado. Revisa tu bandeja de entrada.",
    });
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

router.post("/register", async (req, res) => {
  // 1. Recibimos el token del correo y la contraseña que el usuario definió
  const { token, password } = req.body;

  try {
    // 2. Verificamos el token de invitación
    // Asegúrate de que "tu_clave_secreta_temporal" sea la misma que usaste en /request-register
    const decoded = jwt.verify(token, "123456");
    const emailFromToken = decoded.email.trim().toUpperCase();

    const client = await pool.connect();

    try {
      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query("BEGIN");

      // 3. Insertar el usuario usando el email que venía en el TOKEN
      const nuevoUsuarioRes = await client.query(
        "INSERT INTO usuarios (password, email) VALUES ($1, $2) RETURNING id, email",
        [hashedPassword, emailFromToken],
      );
      const user = nuevoUsuarioRes.rows[0];

      // 4. Crear la ficha principal
      const nuevaFichaRes = await client.query(
        "INSERT INTO onboarding.fichas (usuario_id) VALUES ($1) RETURNING id",
        [user.id],
      );
      const fichaId = nuevaFichaRes.rows[0].id;

      // 5. Inserciones masivas en las tablas relacionadas
      // Usamos un array de promesas para que sea más limpio si prefieres,
      // pero mantenerlo secuencial con await dentro de la transacción está bien para asegurar el orden.
      const tablas = [
        "conyuges",
        "representantes",
        "negociopropio",
        "relaciondependencia",
        "referenciasbancarias",
        "referenciaspersonales",
        "productoservicio",
        "otros_productoservicio",
        "rrss_fichas",
        "perfilesinversion",
      ];

      for (const tabla of tablas) {
        await client.query(
          `INSERT INTO onboarding.${tabla} (ficha_id, usuario_id) VALUES ($1, $2)`,
          [fichaId, user.id],
        );
      }

      // 6. Generar el Token de Sesión Real (JWT de acceso)
      // Nota: Cambié el nombre a 'accessToken' para no confundirlo con el 'token' del body
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        "secret", // Tu clave secreta de producción
        { expiresIn: "1h" },
      );

      // 7. Guardar el token en la base de datos
      await client.query(
        "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, accessToken, new Date(Date.now() + 3600000)],
      );

      await client.query("COMMIT");

      res.status(201).json({
        id: user.id,
        ficha_id: fichaId,
        email: user.email,
        token: accessToken,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error en la transacción de registro:", err);
      res.status(500).send("Error al procesar los datos del formulario.");
    } finally {
      client.release();
    }
  } catch (err) {
    // Este bloque atrapa errores de jwt.verify (token expirado o alterado)
    return res
      .status(401)
      .json({ error: "El enlace es inválido o ha expirado." });
  }
});

// router.post("/registerFromAdmin", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Validaciones básicas de entrada
//     if (!email || typeof email !== "string" || !email.trim()) {
//       return res.status(400).json({ message: "El correo es requerido." });
//     }

//     if (!password || typeof password !== "string" || !password.trim()) {
//       return res.status(400).json({ message: "La contraseña es requerida." });
//     }

//     // Opcional: Validar formato de email básico
//     const emailLimpio = email.trim().toLowerCase();

//     // 2. Encriptación
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 3. Ejecutar procedimiento almacenado
//     const querySP = `CALL onboarding.sp_guardar_cascada($1, $2)`;
//     await pool.query(querySP, [emailLimpio, hashedPassword]);

//     // 4. Obtener el usuario recien creado
//     const sqlConsulta = `
//       SELECT id, email 
//       FROM public.usuarios 
//       WHERE lower(email) = lower($1);
//     `;
//     const result = await pool.query(sqlConsulta, [emailLimpio]);
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(404).json({
//         message: "Usuario no encontrado tras la creación.",
//       });
//     }

//     // 6. Generar Token
//     const jwtSecret = process.env.JWT_SECRET || "secret";
//     const accessToken = jwt.sign(
//       { id: user.id, email: user.email },
//       jwtSecret,
//       { expiresIn: "1h" },
//     );

//     // 7. Guardar token en auth_tokens
//     const expiresAt = new Date(Date.now() + 3600000); // 1 hora
//     await pool.query(
//       "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
//       [user.id, accessToken, expiresAt],
//     );

//     // 8. Obtener el usuario recien creado
//     const sqlConsultaFicha = `
//       SELECT id 
//       FROM onboarding.fichas 
//       WHERE usuario_id = $1;
//     `;
//     const resultFicha = await pool.query(sqlConsultaFicha, [user.id]);
//     const ficha = resultFicha.rows[0];

//     // 9. Respuesta exitosa
//     return res.status(201).json({
//       message: "Usuario y ficha registrados exitosamente.",
//       ficha_id: ficha.id,
//       email: user.email,
//       token: accessToken,
//     });
//   } catch (err) {
//     // Limpiamos los prefijos del error si existen
//     let mensajeLimpio =
//       err.message || "Error en el servidor al crear el cliente.";

//     // Remueve "Error al crear cliente:", "Error en el guardado en cascada:" o combinaciones
//     mensajeLimpio = mensajeLimpio
//       .replace(/^Error al crear cliente:\s*/i, "")
//       .replace(/^Error en el guardado en cascada:\s*/i, "");

//     return res.status(400).json({
//       message: mensajeLimpio,
//     });
//   }
// });

// Login de usuario
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    //const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE UPPER(email) = $1",
      [normalizedEmail],
    );
    if (result.rows.length === 0)
      return res.status(404).send("Usuario no encontrado");

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send("Contraseña incorrecta");

    const token = jwt.sign({ id: user.id, username: user.username }, "secret", {
      expiresIn: "1h",
    });
    await pool.query(
      "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, new Date(Date.now() + 3600000)],
    );
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});

// Recuperar contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Validación básica de entrada
  if (!email) return res.status(400).send("Email requerido");

  try {
    const normalizedEmail = email.trim().toUpperCase();

    // 1. Verificar si el usuario existe usando UPPER
    const userRes = await pool.query(
      "SELECT id, email, username FROM usuarios WHERE UPPER(email) = $1",
      [normalizedEmail],
    );

    // Respuesta genérica por seguridad (evita enumeración de usuarios)
    const genericResponse = {
      message: "Si el correo está registrado, recibirás un enlace.",
    };

    if (userRes.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    // Extraemos el usuario encontrado
    const user = userRes.rows[0];

    // 2. Generar token de recuperación
    // IMPORTANTE: Usa el mismo secreto que en /login. Si allá usas "secret", aquí también.
    const resetToken = jwt.sign(
      { email: user.email, id: user.id, type: "reset" },
      "123456", // Cambia esto por process.env.JWT_SECRET
      { expiresIn: "15m" },
    );

    // 3. Configurar enlace (Verifica que process.env.URL esté definido en tu .env)
    const baseUrl = process.env.URL || "http://localhost:3000"; // Fallback por seguridad
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // 4. Enviar Correo
    await transporter.sendMail({
      from: `"Mercosur Casa de Bolsa, S.A." <sistemasmcdb@mercosur.com.ve>`,
      to: user.email, // Es mejor usar el email que viene de la base de datos
      subject:
        "Recuperación de Contraseña - Plataforma de Registro de Nuevo Cliente",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ff6600; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Mercosur Casa de Bolsa</h2>
          </div>
          <div style="padding: 30px; color: #333333;">
            <h3>Solicitud de cambio de contraseña</h3>
            <p>Hola, <strong>${user.email}</strong>.</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="padding: 12px 25px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 0.8rem; color: #666666;">Este enlace expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    // Si el error es de Nodemailer, se verá aquí en la consola
    console.error("Error en forgot-password:", error);
    res.status(500).send("Error en el servidor al procesar la solicitud.");
  }
});

// Endpoint para guardar la nueva contraseña
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, "123456");
    const email = decoded.email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE usuarios SET password = $1 WHERE lower(email) = lower($2)",
      [hashedPassword, email],
    );

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(401).json({ error: "El enlace es inválido o ha expirado." });
  }
});

// Endpoint para guardar la nueva contraseña desde admin
// router.post("/cambioClaveAdminALegacy", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     await pool.query(
//       "UPDATE usuarios SET password = $1 WHERE lower(email) = lower($2)",
//       [hashedPassword, email],
//     );

//     res.status(200).json({ message: "Contraseña actualizada correctamente." });
//   } catch (err) {
//     res.status(401).json({ error: err.message });
//   }
// });

// Consultar Estatus
router.post("/consultarEstatusLegacy", async (req, res) => {
  try {
    const { email } = req.query;

    //const normalizedEmail = email.trim().toUpperCase();
    // Agrega los comodines '%' a la variable antes de enviarla a la consulta
    const normalizedEmail = `%${email.trim().toUpperCase()}%`;
    //console.log("Buscando con patrón:", normalizedEmail);
    const result = await pool.query(
      `SELECT * FROM onboarding.view_estatus_legacy WHERE correo ILIKE $1`,
      [normalizedEmail], // Aquí ya pasas el string con los % incluidos
    );

    const traking = result.rows[0];

    if (result.rows.length === 0)
      //return res.status(404).send("Usuario no encontrado");

      return res.json({
        estado_actual: "Sin información disponible",
        respuesta: "No se encontró información para el correo proporcionado.",
        correo: email,
      });

    res.json({
      estado_actual: traking.estado_actual,
      respuesta: traking.respuesta,
      correo: traking.correo,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
});

// Consultar Estatus General
router.post("/consultarEstatusGeneralLegacy", async (req, res) => {
  try {
    // Realizamos la consulta sin filtro para obtener todas las filas
    const result = await pool.query(
      `SELECT * FROM onboarding.view_estatus_legacy`,
    );

    const trackingData = result.rows;

    // Si la tabla está vacía
    if (trackingData.length === 0) {
      return res.json({
        mensaje: "No hay registros disponibles en este momento.",
      });
    }

    // Devolvemos el arreglo completo directamente
    // Esto enviará un JSON tipo: [ {...}, {...}, {...} ]
    res.json(trackingData);
  } catch (err) {
    console.error("Error al consultar el estatus general:", err.message);
    res.status(500).send("Error en el servidor");
  }
});

// Uso del middleware para proteger todas las rutas (A PARTIR DE AQUI SON PRIVADAS)
router.use(autenticarToken);

// Logout de cliente
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query("DELETE FROM auth_tokens WHERE user_id = $1", [userId]);

    res.send("Sesión cerrada correctamente");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al cerrar sesión");
  }
});

// Logout de usuario
router.post("/logout-bo", async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query("DELETE FROM auth_tokens_bo WHERE user_id = $1", [userId]);

    res.send("Sesión cerrada correctamente");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al cerrar sesión");
  }
});

module.exports = router;
