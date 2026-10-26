import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicIcon } from "./IconCatalog";

export default function NotificationPanel({ alertas, setAlertas, theme }) {
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setMostrarAlertas(!mostrarAlertas)}
        className="relative p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer"
        title="Notificaciones"
      >
        <DynamicIcon name="FiBell" fallback="FiBell" className="text-lg" />
        {alertas.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-linear-to-tr from-orange-600 via-orange-500 to-amber-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-orange-500/40 ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {alertas.length}
          </span>
        )}
      </button>

      {mostrarAlertas && (
        <div className="ma-alert-dropdown">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "12px",
              marginBottom: "12px",
              borderBottom: "1px solid var(--merco-border, #e2e8f0)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(249, 87, 0, 0.15)",
                  color: "var(--merco-accent, #f95700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DynamicIcon name="FiBell" style={{ fontSize: "16px" }} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    margin: 0,
                    color: "var(--merco-text)",
                  }}
                >
                  Notificaciones
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--merco-muted)",
                    margin: 0,
                  }}
                >
                  Eventos y avisos recientes
                </p>
              </div>
            </div>

            {alertas.length > 0 && (
              <button
                onClick={() => setAlertas([])}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "var(--merco-muted)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
                title="Borrar todo"
              >
                Limpiar
              </button>
            )}
          </div>

          {alertas.length === 0 ? (
            <div style={{ padding: "30px 10px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--merco-muted)",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                No hay notificaciones pendientes.
              </p>
            </div>
          ) : (
            <div className="ma-alert-list">
              {alertas.map((alerta) => {
                const ticketId =
                  alerta.caso_id || alerta.ticket_id || alerta.id;

                return (
                  <div
                    key={alerta.uniqueId}
                    className="ma-alert-card"
                    onClick={() => {
                      if (ticketId) {
                        navigate(
                          `/tickets/tickets?abrirTicket=${ticketId}`,
                        );
                        setMostrarAlertas(false);
                      }
                    }}
                    style={{
                      cursor: ticketId ? "pointer" : "default",
                      position: "relative",
                    }}
                    title={ticketId ? "Hacer clic para abrir este ticket" : ""}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, var(--merco-accent, #f97316), var(--merco-accent-dark, #c2410c))",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DynamicIcon
                        name="HiTicket"
                        fallback="FiInfo"
                        style={{ fontSize: "20px" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingRight: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: 1.5,
                          margin: 0,
                          wordBreak: "break-word",
                          color: "var(--merco-text)",
                        }}
                      >
                        {alerta.str_mensaje}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--merco-border, #e2e8f0)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--merco-muted)",
                          }}
                        >
                          {new Date(
                            alerta.created_at || Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlertas((prev) =>
                          prev.filter((a) => a.uniqueId !== alerta.uniqueId),
                        );
                      }}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "transparent",
                        border: "none",
                        color: "var(--merco-muted)",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "4px",
                      }}
                      title="Descartar"
                    >
                      <DynamicIcon name="FiX" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
