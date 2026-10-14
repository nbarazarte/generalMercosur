import { useState, useEffect, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import { DynamicIcon } from "../components/IconCatalog";
import Footer from "../components/Footer";
import FloatingLines from "../layouts/FloatingLines";

import { useSelector, useDispatch } from "react-redux";
import { updateAccessToken, logout } from "../../store/authSlice";
import axiosSeguridad from "../utils/axiosSeguridad";

// Importamos nuestro hook personalizado desde src/useSocket.js
import { useSocket } from "../../useSocket";

// Importas tu archivo local
import notificationSound from "../../assets/sounds/501212__andrewharn__simple-synth-jingle.mp3";

export default function SystemLayout({ children, identificacion, opcionMenu }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados para notificaciones en tiempo real con Socket.io
  const [alertas, setAlertas] = useState([]);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);
  const refreshToken = useSelector((state) => state.auth?.refreshToken);

  const backendUrl = import.meta.env.VITE_URL_API_LOCAL_VER;
  const { socket, isConnected } = useSocket(backendUrl);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleConnect = () => {
      socket.emit("join_user_room", userId);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    socket.on("nueva_alerta", (nuevaAlerta) => {
      const alertaConId = {
        ...nuevaAlerta,
        uniqueId: nuevaAlerta.id || Date.now() + Math.random(),
      };

      console.log(alertaConId);

      setAlertas((prev) => [alertaConId, ...prev]);

      // 🔊 Instanciamos y reproducimos el audio de manera limpia en cada evento para evitar bloqueos
      try {
        const sound = new Audio(notificationSound);
        sound.currentTime = 0;
        sound.play().catch((err) => {
          console.log("No se pudo reproducir el sonido automáticamente:", err);
        });
      } catch (e) {
        console.error("Error al reproducir audio:", e);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("nueva_alerta");
    };
  }, [socket, userId]);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "light";
      setTheme(currentTheme);
    };

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("storage", handleStorageChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const warningTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const startSessionTimer = () => {
    clearSessionTimers();
    setShowWarning(false);

    const tokenLifetimeMs = 60 * 60 * 1000;
    const warningTimeMs = tokenLifetimeMs - 60 * 1000;

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningTimeMs);
  };

  const startCountdown = () => {
    let seconds = 60;
    setTimeLeft(seconds);

    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);

    intervalTimerRef.current = setInterval(() => {
      seconds -= 1;
      setTimeLeft(seconds);
      if (seconds <= 0) {
        clearInterval(intervalTimerRef.current);
        handleForceLogout();
      }
    }, 1000);
  };

  useEffect(() => {
    const initSessionCheck = async () => {
      if (refreshToken) {
        try {
          const response = await axiosSeguridad.post("/refresh-token", {
            refreshToken,
          });
          const nuevoToken = response.data.token || response.data.accessToken;
          dispatch(updateAccessToken(nuevoToken));
          startSessionTimer();
        } catch (err) {
          console.error(
            "El Refresh Token ha expirado al recargar la página:",
            err,
          );
          handleForceLogout();
        }
      } else {
        handleForceLogout();
      }
    };

    initSessionCheck();
    return () => clearSessionTimers();
  }, [location.pathname]);

  const handleExtendSession = async () => {
    try {
      if (!refreshToken) {
        throw new Error("No hay Refresh Token disponible.");
      }
      const response = await axiosSeguridad.post("/refresh-token", {
        refreshToken,
      });
      const nuevoToken = response.data.token || response.data.accessToken;
      dispatch(updateAccessToken(nuevoToken));
      startSessionTimer();
    } catch (err) {
      console.error("Error al extender la sesión:", err);
      handleForceLogout();
    }
  };

  const handleForceLogout = async () => {
    clearSessionTimers();
    try {
      if (userId) {
        await axiosSeguridad.post("/logout", { userId });
      }
    } catch (err) {
      console.error("No se pudo notificar el cierre de sesión:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

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

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`ma-shell ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>
      <div
        className={`ma-side-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              background: "var(--merco-bg, #ffffff)",
              color: "var(--merco-text, #333)",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              border: "1px solid var(--merco-border, #e2e8f0)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: "1.2rem",
                color: "var(--merco-warning, #d8992a)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <DynamicIcon name="FiAlertTriangle" />
              <span>Tu sesión está por expirar</span>
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              Por motivos de seguridad, tu sesión caducará en{" "}
              <b>{timeLeft} segundos</b> por inactividad. ¿Deseas mantenerla
              activa?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={handleExtendSession}
                className="btn btn-primary"
                style={{
                  padding: "8px 16px",
                  background: "#10b981",
                  border: "none",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sí, extender sesión
              </button>
              <button
                onClick={handleForceLogout}
                className="btn btn-ghost"
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menú lateral (Sidebar) */}
      <aside className={`ma-side ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="flex flex-row justify-between items-start">
          <nav className="flex flex-col gap-2.5 w-full ma-nav">
            <NavLink
              key="home"
              to="/home"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="flex flex-row items-center gap-2">
                <span className="ma-icon-wrapper ic">
                  <DynamicIcon name="FiHome" fallback="FiGrid" />
                </span>
                <span className="nav-text">Inicio</span>
              </div>
            </NavLink>

            {nav.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <div className="flex flex-row items-center gap-2">
                  <span className="ma-icon-wrapper ic">
                    <DynamicIcon name={item.icon} fallback="FiGrid" />
                  </span>
                  <span className="nav-text">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col flex-1 justify-end pb-2">
          <div className="flex flex-col gap-2.5 px-1 mt-auto">
            <div className="h-px bg-white/10 my-2 w-full" />
            <div className="flex items-center gap-3 w-full px-2 py-1.5 ma-user-profile">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-sm shrink-0 shadow-inner">
                {iniciales(`${nombre} ${apellido}`)}
              </div>
              <div className="min-w-0 flex-1 ma-user-info">
                <b className="block text-xs font-semibold text-slate-100 truncate">
                  {nombre} {apellido}
                </b>
                <small className="block text-[11px] text-slate-400 truncate">
                  {rol}
                </small>
              </div>
              <div className="flex flex-row gap-8">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <div
        className="ma-main"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <header
          className="ma-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
            boxSizing: "border-box",
            paddingTop: "10px",
            paddingBottom: "8px",
            paddingRight: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <button
              className="ma-burger-btn"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
              title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            >
              <DynamicIcon name="FiMenu" fallback="FiMenu" />
            </button>

            <div style={{ minWidth: 0 }}>
              {sistemaNombre && (
                <div className="flex flex-row items-center justify-center gap-2.5">
                  <Logo theme={theme} />
                  <div className="flex flex-col">
                    <h2
                      style={{
                        wordBreak: "break-word",
                        margin: 0,
                        lineHeight: 1.2,
                        fontSize: "1.15rem",
                      }}
                    >
                      {sistemaNombre} / {opcionMenu}
                    </h2>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        lineHeight: 1.2,
                        fontSize: "0.825rem",
                      }}
                    >
                      {sistemaDescripcion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🔔 BOTÓN DE NOTIFICACIONES */}
          <div className="relative">
            <button
              onClick={() => setMostrarAlertas(!mostrarAlertas)}
              className="relative p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-xs"
              title="Notificaciones"
            >
              <DynamicIcon
                name="FiBell"
                fallback="FiBell"
                className="text-lg"
              />
              {alertas.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-orange-500/40 ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {alertas.length}
                </span>
              )}
            </button>

            {/* Panel desplegable protegido por reglas exclusivas de CSS */}
            {mostrarAlertas && (
              <div className="ma-alert-dropdown">
                {/* Cabecera del Panel */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    marginBottom: "12px",
                    borderBottom:
                      theme === "dark"
                        ? "1px solid #334155"
                        : "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(249, 115, 22, 0.15)",
                        color: "#f97316",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DynamicIcon name="FiBell" style={{ fontSize: "16px" }} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        Notificaciones
                      </h3>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          margin: 0,
                        }}
                      >
                        Eventos y avisos recientes
                      </p>
                    </div>
                  </div>

                  {alertas.length > 0 && (
                    <button
                      onClick={() => setAlertas([])}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#64748b",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "8px",
                      }}
                      title="Borrar todo"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Lista de Alertas */}
                {alertas.length === 0 ? (
                  <div style={{ padding: "30px 10px", textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: "500",
                        margin: 0,
                      }}
                    >
                      No hay notificaciones pendientes.
                    </p>
                  </div>
                ) : (
                  <div className="ma-alert-list">
                    {alertas.map((alerta) => {
                      const ticketId =
                        alerta.caso_id || alerta.ticket_id || alerta.id;

                      return (
                        <div
                          key={alerta.uniqueId}
                          className="ma-alert-card"
                          onClick={() => {
                            if (ticketId) {
                              navigate(
                                `/tickets/casos-tickets?abrirTicket=${ticketId}`,
                              );
                              setMostrarAlertas(false);
                            }
                          }}
                          style={{
                            cursor: ticketId ? "pointer" : "default",
                            position: "relative",
                          }}
                          title={
                            ticketId ? "Hacer clic para abrir este ticket" : ""
                          }
                        >
                          {/* Icono de Alerta */}
                          <div
                            style={{
                              flexShrink: 0,
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background:
                                "linear-gradient(135deg, #f97316, #c2410c)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <DynamicIcon
                              name="FiZap"
                              fallback="FiInfo"
                              style={{ fontSize: "14px" }}
                            />
                          </div>

                          {/* Contenido de la Alerta */}
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              paddingRight: "16px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                lineHeight: 1.5,
                                margin: 0,
                                wordBreak: "break-word",
                              }}
                            >
                              {alerta.str_mensaje}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTop:
                                  theme === "dark"
                                    ? "1px solid rgba(255,255,255,0.06)"
                                    : "1px solid #e2e8f0",
                              }}
                            >
                              <span
                                style={{ fontSize: "10px", color: "#64748b" }}
                              >
                                {new Date(
                                  alerta.created_at || Date.now(),
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Botón para descartar alerta individual */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlertas((prev) =>
                                prev.filter(
                                  (a) => a.uniqueId !== alerta.uniqueId,
                                ),
                              );
                            }}
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "transparent",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              fontSize: "12px",
                              padding: "4px",
                            }}
                            title="Descartar"
                          >
                            <DynamicIcon name="FiX" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main con fondo FloatingLines adaptativo al tema */}
        <main
          className="ma-content relative overflow-hidden"
          style={{ flex: "1 0 auto", position: "relative" }}
        >
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

          <div className="relative z-10 w-full h-full">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
