import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// import Aurora from "../layouts/Aurora";
import FloatingLines from "../layouts/FloatingLines";

// Componentes
import Logo from "../components/Logo";
import LogoMobile from "../components/LogoMobile";
import ThemeToggle from "../components/ThemeToggleHome";
import LogoutButton from "../components/LogoutButton";
import { updateAccessToken, logout } from "../../store/authSlice";
import axiosSeguridad from "../utils/axiosSeguridad";
import { DynamicIcon } from "../../../src/pages/components/IconCatalog";

const HomeLayout = ({ asideContent, showLogout = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Obtén el id del usuario desde el estado de Redux
  const userId = useSelector((state) => state.auth?.user?.id);

  const refreshToken = useSelector((state) => state.auth?.refreshToken);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  // Estado para controlar la apertura del menú hamburguesa en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- ESTADOS Y REFERENCIAS PARA EL CONTROL DE SESIÓN ---
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos de cuenta regresiva en el modal

  const warningTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const startSessionTimer = () => {
    clearSessionTimers();
    setShowWarning(false);

    // Token dura 1 hora. Avisamos 1 minuto antes (faltando 60s).
    const tokenLifetimeMs = 60 * 60 * 1000; // 1 hora total
    const warningTimeMs = tokenLifetimeMs - 60 * 1000; // Avisar faltando 1 minuto

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningTimeMs);
  };

  const startCountdown = () => {
    let seconds = 60; // 60 segundos de cuenta regresiva en el modal
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

  // --- INICIO DE TEMPORIZADORES CONDICIONALES Y VALIDACIÓN AL MONTAR ---
  useEffect(() => {
    // Si estamos en la página de login, no ejecutamos ningún temporizador
    if (
      location.pathname === "/login" ||
      location.pathname === "/" ||
      location.pathname.startsWith("/resetear-contrasena")
    ) {
      clearSessionTimers();
      setShowWarning(false);
      return;
    }

    const initSessionCheck = async () => {
      if (refreshToken) {
        try {
          // Intentamos refrescar el token de inmediato al recargar o entrar
          const response = await axiosSeguridad.post("/refresh-token", {
            refreshToken,
          });
          const nuevoToken = response.data.token || response.data.accessToken;
          dispatch(updateAccessToken(nuevoToken));

          // Iniciamos el temporizador normal con un token limpio
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

      // Llamada al endpoint para renovar el token
      const response = await axiosSeguridad.post("/refresh-token", {
        refreshToken,
      });

      const nuevoToken = response.data.token || response.data.accessToken;
      dispatch(updateAccessToken(nuevoToken));

      // Reiniciamos el ciclo de los timers limpios
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

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
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

      {/* BOTÓN HAMBURGUESA - MÓVIL (IZQUIERDA) */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Abrir menú"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      <div className="page-grid">
        {isMobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`aside-panel ${isMobileMenuOpen ? "mobile-open" : ""}`}
        >
          <div className="overlay-top_" />
          <div className="overlay-bottom" />

          {asideContent}

          <div className="flex flex-col  gap-4 mt-auto mb-6">
            <div className="flex flex-row gap-2.5 items-center justify-between">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              {showLogout && <LogoutButton />}
            </div>

            <p className="aside-footer">
              &copy; 2026 MERCOSUR Casa de Bolsa S.A.
              <br />
              GCIA. General de Tecnología de la Información
            </p>
          </div>
        </aside>

        {/* Panel derecho (main) con FloatingLines */}
        <main className="main-panel relative overflow-hidden">
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

          {/* Contenido del main con z-index superior para flotar encima de la animación */}
          <div className="relative z-10 form-wrapper w-full">
            <div className="flex items-center justify-center mb-4">
              <LogoMobile theme={theme} />
            </div>
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeLayout;
