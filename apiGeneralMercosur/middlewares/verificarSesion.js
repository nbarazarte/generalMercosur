// middlewares/verificarSesion.js
const jwt = require('jsonwebtoken');
const pool = require('../db');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function verificarSesion(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó token de sesión.' });
    }

    try {
        // 1. Validar la firma y expiración matemática del JWT del usuario
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Inyectamos los datos del usuario en la petición

        // 2. Comprobar que el token siga activo y no haya sido revocado en la base de datos
        const tokenQuery = await pool.query(
            "SELECT * FROM tbl_auth_tokens WHERE user_id = $1 AND token = $2 AND used = false AND expires_at > NOW()",
            [decoded.id, token]
        );

        if (tokenQuery.rows.length === 0) {
            return res.status(401).json({ error: 'La sesión ha expirado o fue cerrada en otro dispositivo.' });
        }

        next();
    } catch (err) {
        console.error("Error al validar sesión:", err.message);
        return res.status(403).json({ error: 'Sesión inválida o expirada.' });
    }
}

module.exports = verificarSesion;