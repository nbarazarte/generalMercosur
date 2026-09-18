const { v4: uuidv4 } = require('uuid');
//const dotenv = require('dotenv');

// Asegúrate de especificar la ruta correcta si tu archivo .env no está en el directorio raíz
//dotenv.config({ path: './.env' });

function generarUUID() {
    const uuid = uuidv4();
    return uuid;
}

// Generar un nuevo UUID y almacenarlo en .env
const newUUID = generarUUID();
console.log("Nuevo UUID generado:", newUUID);
