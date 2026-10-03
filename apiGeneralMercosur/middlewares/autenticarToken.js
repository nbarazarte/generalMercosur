// middlewares/autenticarToken.js
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const AUTHORIZATION_HEADER = process.env.AUTHORIZATION_HEADER;

function verificarClienteFrontend(req, res, next) {
    // Buscamos el UUID en el header personalizado de la aplicación
    const clientUuid = req.header('x-client-uuid');

    if (!clientUuid) {
        return res.status(401).json({ error: 'Acceso denegado. Falta el identificador de la aplicación.' });
    }

    if (clientUuid !== AUTHORIZATION_HEADER) {
        console.log("Error al verificar el UUID: UUID de aplicación inválido.");
        return res.status(403).json({ error: 'Aplicación no autorizada.' });
    }

    next();
}

module.exports = verificarClienteFrontend;