require("dotenv").config();
const express = require("express");
const http = require("http"); // <-- 1. Importar http nativo
const { Server } = require("socket.io"); // <-- 2. Importar Server de socket.io
const cors = require("cors");
const { styleText } = require("node:util");

const app = express();
const server = http.createServer(app); // <-- 3. Crear el servidor HTTP

// 4. Configurar Socket.io integrando tus reglas de CORS existentes
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        [
          "https://registro.mercosur.com.ve",
          "http://registro.mercosur.com.ve:8035",
          "http://localhost:5173",
          "http://localhost:3000",
          "http://127.0.0.1:5173",
          "http://192.168.12.35",
          "http://192.168.12.35:8035",
          "http://192.168.1.35:5173",
        ].includes(origin) ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("https://192.168.") ||
        origin.endsWith(".trycloudflare.com") ||
        origin.endsWith(".loca.lt")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Error de CORS: Este origen no está autorizado"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Hacer que 'io' esté disponible en tus rutas a través de req.app.get('io')
app.set("io", io);

const adminEndpoints = require("./routes/admin.js");
const seguridadEndpoints = require("./routes/seguridad.js");
const ticketsEndpoints = require("./routes/tickets.js");
const rrhhEndpoints = require("./routes/rrhh.js");

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

// 3. Configuración de CORS Dinámico (Soporte para Cloudflare Tunnels)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("https://192.168.") ||
        origin.endsWith(".trycloudflare.com") ||
        origin.endsWith(".loca.lt")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Error de CORS: Este origen no está autorizado"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "x-client-uuid"],
  }),
);

// 4. Middleware PNA
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("/var/www/uploads"));

// 6. Definición de Rutas
app.use("/seguridad", seguridadEndpoints);
app.use("/admin", adminEndpoints);
app.use("/tickets", ticketsEndpoints);
app.use("/rrhh", rrhhEndpoints);

app.get("/", (req, res) => {
  res.send("API Mercosur Enterprise Portal!");
});

// Configuración de eventos de Socket.io
io.on("connection", (socket) => {
  console.log(`🔌 Usuario conectado a WebSockets: ${socket.id}`);

  // Canal privado para unir al usuario según su ID de base de datos
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Usuario con ID ${userId} se unió a su sala privada`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
  });
});

// ⚠️ IMPORTANTE: Usar server.listen en lugar de app.listen para incluir WebSockets
server.listen(port, "0.0.0.0", () => {
  console.log(
    styleText(
      "blue",
      styleText("bold", `🚀 Servidor corriendo en puerto ${port}`),
    ),
  );
});