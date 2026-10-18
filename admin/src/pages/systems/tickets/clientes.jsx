import SystemLayout from "../../layouts/SystemLayout";
import { useClientes } from "./hooks/useClientes";
import { ClientesFiltro } from "./components/ClientesFiltro";
import { DynamicIcon } from "../../../components/IconCatalog";
import formatearFechaHora from "../../../components/formatearFechaHora";

export default function ClientesTickets() {
  const {
    clientes,
    clientesFiltrados,
    loading,
    error,
    filtros,
    toast,
    paginaActual,
    setPaginaActual,
    porPagina,
    totalPaginas,
    registroInicio,
    registroFin,
    handleFiltroChange,
    limpiarFiltros,
    handlePorPaginaChange,
    exportarExcel,
  } = useClientes();

  const totalClientes = clientesFiltrados.length;
  const totalTicketsAtendidos = clientesFiltrados.reduce(
    (acc, curr) => acc + (Number(curr.tickets) || 0),
    0,
  );

  const tarjetasKpi = [
    {
      titulo: "Total Clientes",
      valor: totalClientes,
      icono: "FaPeopleRoof",
      color: "#3B82F6",
    },
    {
      titulo: "Total Tickets Atendidos",
      valor: totalTicketsAtendidos,
      icono: "HiTicket",
      color: "#059669",
    },
  ];

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Clientes">
      {/* TOAST DE NOTIFICACIONES */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 8,
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {toast.message}
        </div>
      )}

      <div
        style={{ fontFamily: "var(--font-sans, system-ui)", padding: "10px 0" }}
      >
        {/* TARJETAS KPI */}
        <div
          className="ma-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {tarjetasKpi.map((item, index) => (
            <div className="ma-stat" key={index}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    color: item.color,
                    display: "inline-flex",
                  }}
                >
                  <DynamicIcon name={item.icono} fallback="FiUser" />
                </span>
              </div>
              <div className="val">{item.valor}</div>
              <div className="lbl" style={{ marginTop: 2 }}>
                {item.titulo}
              </div>
            </div>
          ))}
        </div>

        {/* COMPONENTE DE FILTROS */}
        <ClientesFiltro
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          limpiarFiltros={limpiarFiltros}
          exportarExcel={exportarExcel}
          filtroStyle={filtroStyle}
        />

        {/* MENSAJE DE ERROR SI EXISTE */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "var(--merco-danger, #d1435b)",
              fontSize: "13px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {error}
          </div>
        )}

        {/* TABLA DE CLIENTES Y PAGINACIÓN */}
        <div
          className="ma-card"
          style={{ marginTop: 15, display: "flex", flexDirection: "column" }}
        >
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>CÉDULA</th>
                  <th>CLIENTE</th>
                  <th>TELÉFONO</th>
                  <th>CORREO</th>
                  <th style={{ textAlign: "center" }}>TICKETS</th>
                  <th>ÚLTIMA ATENCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      No se encontraron clientes con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.id} style={{ fontSize: "12px" }}>
                      <td>
                        <b>{c.cedula || "—"}</b>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {c.cliente || "—"}
                        </div>
                      </td>
                      <td>{c.telefono || "—"}</td>
                      <td>{c.correo || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "rgba(249, 115, 22, 0.15)",
                            color: "var(--merco-accent, #f97316)",
                          }}
                        >
                          {c.tickets || 0}
                        </span>
                      </td>
                      <td style={{ fontSize: 11 }}>
                        {c.ultima_atencion ? (
                          formatearFechaHora(c.ultima_atencion)
                        ) : (
                          <span style={{ color: "var(--merco-muted)" }}>
                            Sin atenciones
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* BARRA DE PAGINACIÓN */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderTop: "1px solid var(--merco-border)",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 13,
              color: "var(--merco-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span>
                Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de{" "}
                <b>{clientesFiltrados.length}</b> registros
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label htmlFor="porPaginaClientes">Mostrar:</label>
                <select
                  id="porPaginaClientes"
                  value={porPagina}
                  onChange={handlePorPaginaChange}
                  style={{
                    ...filtroStyle,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>registros</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-ghost"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              >
                Anterior
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                className="btn btn-ghost"
                disabled={paginaActual >= totalPaginas}
                onClick={() =>
                  setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}