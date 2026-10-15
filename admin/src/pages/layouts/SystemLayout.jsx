import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingLines from "../layouts/FloatingLines";

import { useSelector } from "react-redux";
import { useSocket } from "../../useSocket";

// Hooks y Componentes Modularizados
import { useSessionManager } from "../../hooks/useSessionManager";
import { useAudioNotification } from "../../hooks/useAudioNotification";
import { useThemeObserver } from "../../hooks/useThemeObserver";
import Sidebar from "../../components/Sidebar";
import SystemHeader from "../../components/SystemHeader";
import SessionWarningModal from "../../components/SessionWarningModal";

// Archivo de audio local para notificaciones
import notificationSound from "../../assets/sounds/501212__andrewharn__simple-synth-jingle.mp3";

export default function SystemLayout({ children, identificacion, opcionMenu }) {
  // =================================================================
  // 1. HOOKS DE ENRUTAMIENTO, TEMA, AUDIO Y SESIÓN
  // =================================================================
  const location = useLocation();
  const theme = useThemeObserver();
  const { desbloquearAudio, reproducirSonidoAlerta } =
    useAudioNotification(notificationSound);
  const { showWarning, timeLeft, handleExtendSession, handleForceLogout } =
    useSessionManager(location.pathname);

  // =================================================================
  // 2. ESTADOS LOCALES (useState)
  // =================================================================
  // Estado para controlar si el sidebar está abierto o colapsado (recuperado de localStorage)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Estado para almacenar las alertas y notificaciones en tiempo real
  const [alertas, setAlertas] = useState([]);

  // =================================================================
  // 3. SELECTORES DE REDUX Y CONEXIÓN WEBSOCKET (Socket.io)
  // =================================================================
  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);

  const backendUrl = import.meta.env.VITE_URL_API_LOCAL_VER;
  const { socket } = useSocket(backendUrl);

  // =================================================================
  // 4. EFECTOS (useEffect)
  // =================================================================

  // Efecto: Sincroniza y persiste el estado del sidebar en el almacenamiento local
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Efecto: Cierra automáticamente el sidebar en pantallas pequeñas al cambiar de ruta
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Efecto: Gestiona la conexión del Socket.io, salas de usuario y eventos de nuevas alertas
  useEffect(() => {
    if (!socket || !userId) return;

    const handleConnect = () => {
      socket.emit("join_user_room", Number(userId));
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.off("nueva_alerta");

    socket.on("nueva_alerta", (nuevaAlerta) => {
      // Validar que la alerta pertenezca estrictamente al usuario actual
      if (Number(nuevaAlerta.usuario_id) !== Number(userId)) return;

      // Ignorar alertas con antigüedad mayor a 3 segundos
      const fechaAlerta = new Date(
        nuevaAlerta.created_at || Date.now(),
      ).getTime();
      if (Date.now() - fechaAlerta > 3000) return;

      const alertaConId = {
        ...nuevaAlerta,
        uniqueId: nuevaAlerta.id || Date.now() + Math.random(),
      };

      setAlertas((prev) => [alertaConId, ...prev]);
      reproducirSonidoAlerta();
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("nueva_alerta");
    };
  }, [socket, userId]);

  // =================================================================
  // 5. FUNCIONES AUXILIARES Y LÓGICA DE NEGOCIO
  // =================================================================

  // Función para extraer y formatear los permisos y opciones del sistema actual
  const getInfoSistema = (listaSistemas, nombreSistema) => {
    const sistemaEncontrado = listaSistemas?.find(
      (s) => s.sistema === nombreSistema,
    );
    const nav =
      sistemaEncontrado?.opciones
        ?.filter((opcion) => opcion.tiene_permiso)
        .map((item) => ({
          to: item.ruta_opcion,
          label: item.opcion,
          icon:
            item.ic || item.str_icono || item.opcion_icono || "FiCheckSquare",
        })) || [];

    return {
      sistemaNombre: sistemaEncontrado?.sistema || "",
      sistemaDescripcion: sistemaEncontrado?.descripcion || "",
      rol: sistemaEncontrado?.rol || "",
      nav: nav,
    };
  };

  const { rol, nav, sistemaNombre, sistemaDescripcion } = getInfoSistema(
    sistemas,
    identificacion,
  );

  // Genera las iniciales del usuario a partir de su nombre y apellido
  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  // Alterna el estado de apertura/cierre del menú lateral
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // =================================================================
  // 6. RENDERIZADO DEL COMPONENTE (JSX)
  // =================================================================
  return (
    <div
      className={`ma-shell ${!sidebarOpen ? "sidebar-collapsed" : ""}`}
      onClick={desbloquearAudio}
    >
      {/* Overlay oscuro para dispositivos móviles cuando el menú está abierto */}
      <div
        className={`ma-side-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Modal flotante de advertencia por expiración de sesión */}
      <SessionWarningModal
        showWarning={showWarning}
        timeLeft={timeLeft}
        onExtend={handleExtendSession}
        onLogout={handleForceLogout}
      />

      {/* Barra de navegación lateral (Sidebar modular) */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        nav={nav}
        iniciales={iniciales}
        nombre={nombre}
        apellido={apellido}
        rol={rol}
      />

      {/* Contenedor principal de la interfaz */}
      <div
        className="ma-main"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Cabecera superior (Topbar modular) */}
        <SystemHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          sistemaNombre={sistemaNombre}
          sistemaDescripcion={sistemaDescripcion}
          opcionMenu={opcionMenu}
          theme={theme}
          alertas={alertas}
          setAlertas={setAlertas}
        />

        {/* Contenido dinámico principal de las vistas */}
        <main
          className="ma-content relative overflow-hidden"
          style={{ flex: "1 0 auto", position: "relative" }}
        >
          {/* Fondo animado condicional para el modo oscuro */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          >
            {theme === "dark" && (
              <FloatingLines
                key="dark-lines"
                enabledWaves={["top", "middle", "bottom"]}
                lineCount={8}
                lineDistance={8}
                bendRadius={8}
                bendStrength={-2}
                interactive
                parallax={true}
                animationSpeed={1}
                linesGradient={[
                  "#F97316",
                  "#C2410C",
                  "#6f6f6f",
                  "#3a3a3a",
                  "#0a1628",
                ]}
              />
            )}
          </div>

          {/* Renderizado de componentes hijos o rutas anidadas */}
          <div className="relative z-10 w-full h-full">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
