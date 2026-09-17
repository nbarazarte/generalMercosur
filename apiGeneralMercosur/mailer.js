// mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false, // Ayuda con problemas de certificado en algunos entornos
  },
});

/*const transporter_gmail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para puerto 465, false para otros puertos como 587
  auth: {
    user: process.env.SENDER_EMAIL_GMAIL,
    pass: process.env.PASSWORD_EMAIL_GMAIL, // Recuerda que aquí va la "Contraseña de aplicación" de Google, no tu clave normal.
  },
  tls: {
    // Eliminamos SSLv3. Dejamos esto solo si tienes problemas estrictos con certificados locales.
    ciphers: "TLSv1.2:TLSv1.3", // Forzamos protocolos modernos exigidos por Google para envíos estables
    rejectUnauthorized: false,
  },
});*/

const transporter_gmail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS en 587
  pool: true, // 👈 Mantiene la conexión abierta y la reutiliza
  maxConnections: 3, // 👈 Límite de conexiones simultáneas hacia Gmail
  maxMessages: 100, // 👈 Cantidad de mensajes por conexión antes de renovarla
  auth: {
    user: process.env.SENDER_EMAIL_GMAIL,
    pass: process.env.PASSWORD_EMAIL_GMAIL,
  },
  tls: {
    ciphers: "TLSv1.2:TLSv1.3",
    rejectUnauthorized: false,
  },
});

module.exports = { transporter, transporter_gmail };
