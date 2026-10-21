import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingLines from "../../components/FloatingLines";

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
  const location = useLocation();
  const theme = useThemeObserver();
  const { desbloquearAudio, reproducirSonidoAlerta } =
    useAudioNotification(notificationSound);
  const { showWarning, timeLeft, handleExtendSession, handleForceLogout } =
    useSessionManager(location.pathname);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [alertas, setAlertas] = useState([]);

  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);

  // Toma la URL base del backend desde tu variable de entorno o usa el host actual
  const backendUrl =
    import.meta.env.VITE_URL_API_LOCAL_VER ||
    `http://${window.location.hostname}:3001`;
  const { socket } = useSocket(backendUrl);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

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
      if (Number(nuevaAlerta.usuario_id) !== Number(userId)) return;

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

  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div
      className={`ma-shell ${!sidebarOpen ? "sidebar-collapsed" : ""}`}
      onClick={desbloquearAudio}
      style={{
        display: "flex",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
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

      {/* Contenedor principal de la interfaz con scroll vertical propio */}
      <div
        className="ma-main"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100vh",
          overflowY: "auto", // El scroll ocurre aquí y nunca afecta al sidebar
        }}
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
          className="ma-content relative"
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
              pointerEvents: "none",
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
