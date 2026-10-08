const multer = require("multer");
const path = require("path");

const tiposPermitidos = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/json", // .json
  "text/csv", // .csv
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // 💡 Nuevos tipos permitidos para multimedia (Videos y Audios)
  "video/mp4",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
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

  if (
    tiposPermitidos.includes(file.mimetype) &&
    [
      ".pdf",
      ".png",
      ".jpeg",
      ".jpg",
      ".json",
      ".csv",
      ".xls",
      ".xlsx",
      // 💡 Nuevas extensiones permitidas
      ".mp4",
      ".webm",
      ".ogg",
      ".mp3",
      ".wav",
    ].includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se permiten documentos, hojas de cálculo, imágenes, videos o audios compatibles.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

module.exports = upload;