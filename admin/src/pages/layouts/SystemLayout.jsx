import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import { useSelector } from "react-redux";
import "../../../src/systems.css";

export default function SystemLayout({ children, identificacion }) {
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
          icon: "",
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
          <Link
            to="/home"
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            <Logo />
          </Link>
        </div>

        <nav className="ma-nav">
          {nav.map((item, idx) => (
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
            <small>{rol}</small>
          </div>
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT ORIGEN ----------------- */}
      <div className="ma-main">
        <header
          className="ma-topbar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            {sistemaNombre && (
              <h2 style={{ wordBreak: "break-word" }}>{sistemaNombre}</h2>
            )}
            {sistemaDescripcion && <p>{sistemaDescripcion}</p>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <main className="ma-content">{children ? children : <Outlet />}</main>
      </div>
    </div>
  );
}
