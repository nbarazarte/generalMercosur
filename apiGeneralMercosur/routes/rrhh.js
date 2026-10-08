const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const verificarClienteFrontend = require("../middlewares/autenticarToken");
const verificarSesion = require("../middlewares/verificarSesion");
const upload = require("../middlewares/multerConfig"); // Importamos multerConfig para la subida de archivos

// 🔒 Doble capa de seguridad global
router.use(verificarClienteFrontend);
router.use(verificarSesion);

// Endpoint de prueba básico (GET)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Endpoint de prueba del módulo de RRHH funcionando correctamente.",
  });
});

// Endpoint de prueba con soporte para subida interna de archivos (POST)
router.post(
  "/test-upload",
  upload.fields([
    { name: "constancia", maxCount: 1 },
    { name: "cedula", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const constancia = req.files && req.files["constancia"] ? req.files["constancia"][0] : null;
      const cedula = req.files && req.files["cedula"] ? req.files["cedula"][0] : null;
      const { nombre, cargo } = req.body;

      res.status(200).json({
        success: true,
        message: "Archivos y datos de RRHH recibidos con éxito (prueba interna).",
        data: {
          nombre: nombre || "Sin nombre",
          cargo: cargo || "Sin cargo",
          archivos: {
            constancia: constancia ? `/var/www/uploads/${constancia.filename}` : null,
            cedula: cedula ? `/var/www/uploads/${cedula.filename}` : null,
          },
        },
      });
    } catch (err) {
      console.error("Error en test-upload de rrhh:", err.message);
      res.status(500).json({ error: "Error interno al procesar los archivos." });
    }
  }
);

module.exports = router;