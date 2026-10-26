const multer = require("multer");
const path = require("path");

const tiposPermitidos = [
  // Documentos y Hojas de cálculo / Texto
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/json",
  "text/csv",
  
  // Comprimidos y Archivos ejecuables/Java
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-rar",
  "application/octet-stream",
  "application/x-7z-compressed",
  "application/gzip",
  "application/java-archive", // 💡 Añadido para archivos .jar

  // Imágenes
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",

  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-msvideo",

  // Audios
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a"
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/var/www/uploads");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${originalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const extensionesPermitidas = [
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", 
    ".txt", ".json", ".csv", ".zip", ".rar", ".7z", ".gz", ".jar", // 💡 Añadido .jar
    ".png", ".jpeg", ".jpg", ".webp", ".gif",
    ".mp4", ".webm", ".ogg", ".avi",
    ".mp3", ".wav", ".m4a"
  ];

  if (tiposPermitidos.includes(file.mimetype) && extensionesPermitidas.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de archivo no permitido (${file.mimetype} / ${ext}). Solo se permiten documentos, hojas de cálculo, comprimidos, imágenes, videos o audios compatibles.`,
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024,
    fieldSize: 1024 * 1024 * 1024,
  },
});

module.exports = upload;