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
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/var/www/uploads");
  },
  //Esto pone nombres Ramdon a los archivos al subirlos
  /* filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }, */

  //Esto pone una marca de tiempo a los nombres de los archivos al subirlos
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_"); // opcional: limpia espacios
    cb(null, `${timestamp}-${originalName}`);

    //Esto dejaria el nombre tal cual como fue subido pero si dos usuarios suben un archivo con el mismo nombre sera sobreescrito
    //cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  /*   if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  } */

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
    ].includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo .pdf, .png, .jpeg, .jpg, .json, .csv, .xls o .xlsx",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
