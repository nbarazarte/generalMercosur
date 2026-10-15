import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingLines from "../../components/FloatingLines";

// Componentes y Hooks modularizados
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggleHome";

import LogoutButton from "../../components/LogoutButton";
import SessionWarningModal from "../../components/SessionWarningModal";
import { useSessionManager } from "../../hooks/useSessionManager";
import { useThemeObserver } from "../../hooks/useThemeObserver";

const HomeLayout = ({ asideContent, showLogout = false }) => {
  const location = useLocation();

  // ==========================================
  // 1. HOOKS DE TEMA Y GESTIÓN DE SESIÓN
  // ==========================================
  const theme = useThemeObserver();
  const { showWarning, timeLeft, handleExtendSession, handleForceLogout } =
    useSessionManager(location.pathname);

  // ==========================================
  // 2. ESTADOS LOCALES (useState)
  // ==========================================
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  // ==========================================
  // 3. EFECTOS (useEffect)
  // ==========================================
  // Sincroniza el cambio de tema en el documento HTML
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(currentTheme);
    document.documentElement.style.colorScheme = currentTheme;
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  // Actualiza el tema local si cambia externamente
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // ==========================================
  // 4. FUNCIONES AUXILIARES
  // ==========================================
  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ==========================================
  // 5. RENDERIZADO (JSX)
  // ==========================================
  return (
    <>
      {/* Modal flotante modularizado para la advertencia de sesión */}
      <SessionWarningModal
        showWarning={showWarning}
        timeLeft={timeLeft}
        onExtend={handleExtendSession}
        onLogout={handleForceLogout}
      />

      {/* Botón hamburguesa para dispositivos móviles */}
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
        {/* Fondo oscuro traslúcido para el menú móvil */}
        {isMobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Panel lateral (Aside) */}
        <aside
          className={`aside-panel ${isMobileMenuOpen ? "mobile-open" : ""}`}
        >
          <div className="overlay-top_" />
          <div className="overlay-bottom" />

          {asideContent}

          <div className="flex flex-col gap-4 mt-auto mb-6">
            <div className="flex flex-row gap-2.5 items-center justify-between">
              <ThemeToggle theme={currentTheme} onToggle={toggleTheme} />
              {showLogout && <LogoutButton />}
            </div>

            <p className="aside-footer">
              &copy; 2026 MERCOSUR Casa de Bolsa S.A.
              <br />
              GCIA. General de Tecnología de la Información
            </p>
          </div>
        </aside>

        {/* Panel derecho (Main) con animación de fondo */}
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
            {currentTheme === "dark" && (
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

          {/* Contenedor del contenido principal */}
          <div className="relative z-10 form-wrapper w-full">
            <div className="flex items-center justify-center mb-4">
              <Logo theme={currentTheme} size={"home"} />
            </div>
            <Outlet context={{ theme: currentTheme }} />
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeLayout;
