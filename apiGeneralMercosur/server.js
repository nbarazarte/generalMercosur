require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const { styleText } = require("node:util");

const app = express();

const onboardingEndpoints = require("./routes/onboarding.js");
const seguridadEndpoints = require("./routes/seguridad.js");
const port = process.env.PORT || 3000;

// 2. Configuración de orígenes permitidos (HTTPS incluido)
const allowedOrigins = [
  "https://registro.mercosur.com.ve",
  "http://registro.mercosur.com.ve:8035",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://192.168.12.35",
  "http://192.168.12.35:8035",
  "http://192.168.1.35:5173",
];

// 3. Configuración de CORS Dinámico (Corregido el Scope de 'origin')
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || 
        origin.startsWith("http://192.168.") || 
        origin.startsWith("https://192.168.")) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS: Este origen no está autorizado"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

// 4. Middleware PNA
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

//app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static("/var/www/uploads"));

// 6. Definición de Rutas
app.use("/seguridad", seguridadEndpoints);
app.use("/onboarding", onboardingEndpoints);

app.get("/", (req, res) => {
  res.send("API Onboarding activa y configurada con SSL!");
});

app.listen(port, "0.0.0.0", () => {
  console.log(styleText("blue", styleText("bold", `🚀 Servidor corriendo en puerto ${port}`)));
});