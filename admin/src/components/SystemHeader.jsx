import Logo from "./Logo";
import { DynamicIcon } from "./IconCatalog";
import NotificationPanel from "./NotificationPanel";

export default function SystemHeader({
  sidebarOpen,
  toggleSidebar,
  sistemaNombre,
  sistemaDescripcion,
  opcionMenu,
  theme,
  alertas,
  setAlertas,
}) {
  return (
    <header
      className="ma-topbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        width: "100%",
        boxSizing: "border-box",
        paddingTop: "10px",
        paddingBottom: "8px",
        paddingRight: "20px",
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
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          <DynamicIcon name="FiMenu" fallback="FiMenu" />
        </button>

        <div style={{ minWidth: 0 }}>
          {sistemaNombre && (
            <div className="flex flex-row items-center justify-center gap-2.5">
              <Logo theme={theme} size={"header"} />
              <div className="flex flex-col">
                <h2
                  style={{
                    wordBreak: "break-word",
                    margin: 0,
                    lineHeight: 1.2,
                    fontSize: "1.15rem",
                  }}
                >
                  {sistemaNombre} / {opcionMenu}
                </h2>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    lineHeight: 1.2,
                    fontSize: "0.825rem",
                  }}
                >
                  {sistemaDescripcion}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotificationPanel
        alertas={alertas}
        setAlertas={setAlertas}
        theme={theme}
      />
    </header>
  );
}
