import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

// Componentes
import Logo from "../components/Logo";
import LogoMobile from "../components/LogoMobile";
import ThemeToggle from "../components/ThemeToggleHome";
import LogoutButton from "../components/LogoutButton";

const HomeLayout = ({ asideContent, showLogout = false }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  // Estado para controlar la apertura del menú hamburguesa en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        {/* OVERLAY PARA OSCURECER EL FONDO EN MÓVILES CUANDO EL MENÚ ESTÁ ABIERTO */}
        {isMobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* PANEL IZQUIERDO COMPARTIDO (CON TEMA Y SALIR INTEGRADOS) */}
        <aside
          className={`aside-panel ${isMobileMenuOpen ? "mobile-open" : ""}`}
        >
          <div className="overlay-top" />
          <div className="overlay-bottom" />

          {/* BOTÓN DE CIERRE (SOLO VISIBLE EN MÓVIL CUANDO ESTÁ ABIERTO) */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="aside-logo">
            <Logo />
          </div>

          {/* Renderiza el Aside según la vista activa */}
          {asideContent}

          {/* CONTENEDOR INFERIOR: Botones de Tema y Salir + Footer */}
          <div>
            <div>
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

        {/* PANEL DERECHO DINÁMICO */}
        <main className="main-panel">
          <div className="form-wrapper">
            <div className="mobile-logo">
              <LogoMobile theme={theme} />
            </div>

            {/* Renderiza el contenido de Login o Main */}
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeLayout;
