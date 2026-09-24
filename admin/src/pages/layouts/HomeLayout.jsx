import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

// Componentes
import Logo from "../components/Logo";
import LogoMobile from "../components/LogoMobile";
import ThemeToggle from "../components/ThemeToggle";
import LogoutButton from "../components/LogoutButton";

const HomeLayout = ({ asideContent, showLogout = false }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

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
      {/* BOTÓN DE TEMA - ARRIBA A LA DERECHA */}
      <div className="top-theme-wrapper">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="page-grid">
        {/* PANEL IZQUIERDO COMPARTIDO */}
        <aside className="aside-panel">
          <div className="overlay-top" />
          <div className="overlay-bottom" />

          <div className="aside-logo">
            <Logo />
          </div>

          {/* Renderiza el Aside según la vista activa */}
          {asideContent}

          <p className="aside-footer">
            &copy; 2026 MERCOSUR Casa de Bolsa S.A.
            <br />
            GCIA. General de Tecnología de la Información
          </p>
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

      {/* BOTÓN DE SALIR - ABAJO A LA DERECHA */}
      {showLogout && (
        <div className="bottom-logout-wrapper">
          <LogoutButton />
        </div>
      )}
    </>
  );
};

export default HomeLayout;
