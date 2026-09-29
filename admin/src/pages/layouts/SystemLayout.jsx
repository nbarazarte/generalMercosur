import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import { DynamicIcon } from "../components/IconCatalog";

import { useSelector } from "react-redux";
import "../../../src/systems.css";

export default function SystemLayout({ children, identificacion }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);

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
      {/* Overlay oscuro para móvil */}
      <div
        className={`ma-side-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

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

        {/* Menú de navegación solo con las rutas de páginas */}
        <nav className="ma-nav">
          {nav.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="ic">
                <DynamicIcon name={item.icon} fallback="FiGrid" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zona inferior: Botones de control + Información del usuario */}
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
          {/* Botones colocados inmediatamente arriba del usuario */}
          <div className="ma-nav" style={{ width: "100%", margin: 0 }}>
            <ThemeToggle />
            <LogoutButton />
          </div>

          <div className="ma-nav-divider" style={{ margin: "4px 0" }} />

          {/* Tarjeta del usuario */}
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
      <div className="ma-main">
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

        <main className="ma-content">{children ? children : <Outlet />}</main>
      </div>
    </div>
  );
}
