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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Obtén el id del usuario desde el estado de Redux
  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);
  const refreshToken = useSelector((state) => state.auth?.refreshToken);

  // --- ESTADOS Y REFERENCIAS PARA EL CONTROL DE SESIÓN ---
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos

  // Referencias para limpiar los timers de forma segura
  const warningTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const startSessionTimer = () => {
    clearSessionTimers();
    setShowWarning(false);

    // El token dura 1 hora (3,600,000 ms).
    // Avisamos cuando falten 5 minutos para que expire (5 * 60 * 1000 = 300,000 ms).
    // Nota: Si quieres probarlo rápido mientras desarrollas, puedes cambiar esto temporalmente.
    const tokenLifetimeMs = 60 * 60 * 1000; // 1 hora total
    const warningTimeMs = tokenLifetimeMs - 5 * 60 * 1000; // Avisar a los 55 minutos (faltando 5 min)

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningTimeMs);
  };

  const startCountdown = () => {
    let seconds = 300; // 5 minutos de cuenta regresiva en el modal
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

  // Iniciar el temporizador global al cargar la ruta
  useEffect(() => {
    startSessionTimer();
    return () => clearSessionTimers();
  }, [location.pathname]);

  const handleExtendSession = async () => {
    try {
      if (!refreshToken) {
        throw new Error(
          "No hay Refresh Token disponible en el estado de Redux.",
        );
      }

      // Llamada al endpoint para renovar el token
      const response = await axiosSeguridad.post("/refresh-token", {
        refreshToken,
      });

      const nuevoToken = response.data.token || response.data.accessToken;
      dispatch(updateAccessToken(nuevoToken));

      // IMPORTANTE: Reiniciamos el ciclo de los timers para otros 30 segundos limpios
      startSessionTimer();
    } catch (err) {
      console.error("Error al extender la sesión:", err);
      handleForceLogout();
    }
  };

  // 2. Actualiza la función handleForceLogout
  const handleForceLogout = async () => {
    clearSessionTimers();
    try {
      if (userId) {
        // Llama a tu endpoint del backend para borrar los tokens de la BD
        await axiosSeguridad.post("/logout", { userId });
      }
    } catch (err) {
      console.error(
        "No se pudo notificar el cierre de sesión al servidor:",
        err,
      );
    } finally {
      // Siempre limpiamos Redux y redirigimos al login, pase lo que pase en la red
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
    setMobileOpen(false);
  }, [location.pathname]);

  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  return (
    <div className="ma-shell">
      <div
        className={`ma-side-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ----------------- MODAL DE ADVERTENCIA DE SESIÓN ----------------- */}
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

      {/* ----------------- SIDEBAR ----------------- */}
      <aside className={`ma-side ${mobileOpen ? "open" : ""}`}>
        <div className="ma-side-header-mobile">
          <Link
            to="/home"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <Logo />
          </Link>
          <button
            className="ma-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <DynamicIcon name="FiX" fallback="FiX" />
          </button>
        </div>

        <nav className="">
          {nav.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 14px",
                textDecoration: "none",
                color: "#ffffff",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "18px",
                  height: "18px",
                  flexShrink: 0,
                }}
              >
                <DynamicIcon name={item.icon} fallback="FiGrid" />
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="ma-side-foot"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "12px",
          }}
        >
          <div className="ma-nav" style={{ width: "100%", margin: 0 }}>
            <ThemeToggle />
            <LogoutButton />
          </div>

          <div className="ma-nav-divider" style={{ margin: "4px 0" }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <div className="ma-avatar">
              {iniciales(`${nombre} ${apellido}`)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b
                style={{
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {nombre} {apellido}
              </b>
              <small
                style={{
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {rol}
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT ----------------- */}
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
            <button
              className="ma-burger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
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
