function obtenerColorEstatus(nombreEstatus) {
  const est = (nombreEstatus || "").toLowerCase();
  if (est.includes("en proceso")) return "#3B82F6";
  if (est.includes("pendiente de usuario")) return "#F59E0B";
  if (est.includes("en espera proveedor")) return "#A855F7";
  if (est.includes("en aprobación")) return "#EC4899";
  if (est.includes("vencido") || est.includes("crítico")) return "#DC2626";
  if (est.includes("cerrado")) return "#059669";
  if (est.includes("cancelado")) return "#0EA5E9";
  return "#64748B";
}

export function UltimosTicketsTable({ loading, ultimosTickets, abrirDetalle }) {
  return (
    <div
      className="ma-card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "750px",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <span
            style={{
              fontWeight: "bold",
              fontSize: 15,
              color: "var(--merco-text)",
            }}
          >
            Tickets recientes
          </span>{" "}
          <small style={{ color: "var(--merco-muted)" }}>
            últimos registros
          </small>
        </div>
      </div>

      <div
        className="ma-table-container"
        style={{ overflowY: "auto", flex: 1 }}
      >
        <table className="ma-table">
          <thead>
            <tr>
              <th>TICKET / ASUNTO</th>
              <th>ESTATUS</th>
              <th>CLIENTE / SOLICITANTE</th>
              <th>CREACIÓN</th>
              <th>CIERRE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Cargando registros...
                </td>
              </tr>
            ) : ultimosTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "var(--merco-muted)",
                  }}
                >
                  No hay tickets recientes con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              ultimosTickets.slice(0, 8).map((t) => {
                const colorBadge = obtenerColorEstatus(t.estado);
                return (
                  <tr
                    key={t.id}
                    style={{ cursor: "pointer" }}
                    title="Ver detalle del ticket"
                    onClick={() => abrirDetalle(t)}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div>
                        <b
                          style={{
                            color: "var(--merco-text)",
                            display: "block",
                            fontSize: "13px",
                          }}
                        >
                          {t.codigo}
                        </b>
                        <small style={{ color: "var(--merco-muted)" }}>
                          {t.asunto}
                        </small>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontSize: "11px",
                          fontWeight: 500,
                          background: `${colorBadge}15`,
                          color: colorBadge,
                        }}
                      >
                        ● {t.estado || "N/D"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--merco-text)",
                        fontSize: "13px",
                      }}
                    >
                      {t.solicitante || "Cliente / Usuario"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--merco-muted)",
                        fontSize: "11px",
                      }}
                    >
                      {t.tiempo}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--merco-muted)",
                        fontSize: "11px",
                      }}
                    >
                      {t.fecha_cierre ? t.fecha_cierre : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
