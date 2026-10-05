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

import { useSelector, useDispatch } from "react-redux";
import { updateAccessToken, logout } from "../../store/authSlice";
import axiosSeguridad from "../utils/axiosSeguridad";
import "../../../src/systems.css";

export default function SystemLayout({ children, identificacion }) {
  // CAMBIO PRINCIPAL: Por defecto el menú estará colapsado (false)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);
  const refreshToken = useSelector((state) => state.auth?.refreshToken);

  // --- ESTADOS Y REFERENCIAS PARA EL CONTROL DE SESIÓN ---
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
        throw new Error(
          "No hay Refresh Token disponible en el estado de Redux.",
        );
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
      console.error(
        "No se pudo notificar el cierre de sesión al servidor:",
        err,
      );
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
      {/* Overlay opcional para dispositivos móviles cuando el menú se superpone */}
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
            gap: "12px",
            width: "100%",
            boxSizing: "border-box",
            paddingTop: "10px",
            paddingBottom: "8px",
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
            {/* Botón para Ocultar / Mostrar Menú */}
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
                <h2
                  style={{
                    wordBreak: "break-word",
                    margin: 0,
                    lineHeight: 1.2,
                    fontSize: "1.15rem",
                  }}
                >
                  {sistemaNombre}
                </h2>
              )}
              {sistemaDescripcion && (
                <p
                  style={{
                    margin: "2px 0 0 0",
                    lineHeight: 1.2,
                    fontSize: "0.825rem",
                  }}
                >
                  {sistemaDescripcion}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="ma-content" style={{ flex: "1 0 auto" }}>
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}
