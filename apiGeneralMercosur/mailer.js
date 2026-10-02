// mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
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

module.exports = transporter;