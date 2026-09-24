import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

import { useSelector } from "react-redux";

export default function SystemLayout({
  navItems = [],
  title,
  subtitle,
  children,
}) {
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;

  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  return (
    <div className="ma-shell">
      {/* ----------------- SIDEBAR ORIGEN ----------------- */}
      <aside className="ma-side">
        <div className="flex flex-col items-center justify-items-center">
          <Logo />
        </div>

        <nav className="ma-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.icon && <span className="ic">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ma-side-foot">
          <div className="ma-avatar">{iniciales(`${nombre} ${apellido}`)}</div>
          <div>
            <b>
              {nombre} {apellido}
            </b>
            <small>dfgd</small>
          </div>
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT ORIGEN ----------------- */}
      <div className="ma-main">
        <header className="ma-topbar">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ThemeToggle />
          </div>
        </header>

        <main className="ma-content">{children ? children : <Outlet />}</main>
      </div>
    </div>
  );
}
