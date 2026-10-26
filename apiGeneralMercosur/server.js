require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { styleText } = require("node:util");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Validador único de CORS globalizado y optimizado
const corsValidator = (origin, callback) => {
  if (!origin) return callback(null, true);

  // 1. Cualquier subdominio, protocolo y puerto de mercosur.com.ve
  const isMercosurDomain =
    /^https?:\/\/([a-zA-Z0-9_-]+\.)*mercosur\.com\.ve(:\d+)?$/.test(origin);

  // 2. Cualquier IP 192.168.x.x con puerto opcional
  const isLocalNetwork = /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(
    origin,
  );

  // 3. Localhost o 127.0.0.1 con cualquier puerto (incluyendo http://127.0.0.1:3000, :5173, etc.)
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
    origin,
  );

  // 4. Túneles de desarrollo (Cloudflare / Localtunnel)
  const isTunnel =
    origin.endsWith(".trycloudflare.com") || origin.endsWith(".loca.lt");

  if (isMercosurDomain || isLocalNetwork || isLocalhost || isTunnel) {
    callback(null, true);
  } else {
    callback(new Error("Error de CORS: Este origen no está autorizado"));
  }
};

// Configuración de Socket.io reutilizando el validador
const io = new Server(server, {
  cors: {
    origin: corsValidator,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Hacer que 'io' esté disponible en las rutas a través de req.app.get('io')
app.set("io", io);

// Configuración de CORS para Express
app.use(
  cors({
    origin: corsValidator,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-client-uuid"],
  }),
);

// Middleware PNA (Private Network Access)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("/var/www/uploads"));

// 5. Definición de Rutas
app.use("/seguridad", require("./routes/seguridad.js"));
app.use("/admin", require("./routes/admin.js"));
app.use("/tickets", require("./routes/tickets.js"));
app.use("/rrhh", require("./routes/rrhh.js"));
app.use("/drive", require("./routes/mercoDrive.js"));

app.get("/", (req, res) => {
  res.send("API Mercosur Enterprise Portal!");
});

// Configuración de eventos de Socket.io
io.on("connection", (socket) => {
  //console.log(`Usuario conectado a WebSockets: ${socket.id}`);

  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    //console.log(`Usuario con ID ${userId} se unió a su sala privada`);
  });

  socket.on("disconnect", () => {
    //console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// Inicio del servidor HTTP
server.listen(port, "0.0.0.0", () => {
  console.log(
    styleText(
      "blue",
      styleText("bold", `🚀 Servidor corriendo en puerto ${port}`),
    ),
  );
});
