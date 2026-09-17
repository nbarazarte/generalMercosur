const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config({ path: '../env' });

const AUTHORIZATION_HEADER = process.env.AUTHORIZATION_HEADER;

function autenticarUUID(req, res, next) {
    // 1. Intentar obtener el token del Header 'Authorization'
    const authHeader = req.header('Authorization');
    let token = null;

    if (authHeader) {
        token = authHeader.replace('Bearer ', '');
    } else {
        // 2. Si no hay header, intentar obtenerlo de la URL (para EventSource/SSE)
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).send('Acceso denegado. Se requiere un UUID.');
    }

    // 3. Verificar que el token sea el correcto
    if (token !== AUTHORIZATION_HEADER) {
        console.log("Error al verificar el UUID: UUID inválido.");
        return res.status(400).send('UUID inválido.');
    }

    next();
}

module.exports = autenticarUUID;