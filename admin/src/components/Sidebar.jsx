import { NavLink } from "react-router-dom";
import { DynamicIcon } from "./IconCatalog";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";

export default function Sidebar({
  sidebarOpen,
  nav,
  iniciales,
  nombre,
  apellido,
  rol,
}) {
  return (
    <aside
      className={`ma-side ${sidebarOpen ? "open" : "collapsed"}`}
      style={{
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Contenedor principal interno */}
      <div className="flex flex-col h-full w-full">
        {/* Zona superior y de navegación central (con scroll interno si es muy larga) */}
        <div
          className="flex flex-col justify-between items-start"
          style={{ flex: 1, overflowY: "auto", minHeight: 0, width: "100%" }}
        >
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

        {/* Zona inferior fija: Perfil de usuario y botón de Cerrar Sesión (Siempre abajo gracias a mt-auto) */}
        <div
          className="flex flex-col justify-end pb-2 shrink-0 w-full"
          style={{ marginTop: "auto" }}
        >
          <div className="flex flex-col gap-2.5 px-1">
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
      </div>
    </aside>
  );
}
