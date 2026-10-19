export function TicketDashboardFiltros({
  filtros,
  setFiltros,
  limpiarFiltros,
  tiposTicket,
  categorias,
  listaEstatus,
  listaDepartamentos,
  prioridades,
  canales,
}) {
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
    <div
      className="ma-card"
      style={{
        padding: "12px 16px",
        marginBottom: "16px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          flex: 1,
        }}
      >
        {/* Tipo de Ticket */}
        <select
          value={filtros.tipo_ticket_id}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              tipo_ticket_id: e.target.value,
            }))
          }
          style={filtroStyle}
        >
          <option value="">Todos los tipos</option>
          {tiposTicket.map((t) => (
            <option key={t.id} value={t.id}>
              {t.str_nombre}
            </option>
          ))}
        </select>

        {/* Categoría */}
        <select
          value={filtros.categoria_id}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              categoria_id: e.target.value,
            }))
          }
          style={filtroStyle}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.str_nombre}
            </option>
          ))}
        </select>

        {/* Estatus */}
        <select
          value={filtros.estatus_id}
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, estatus_id: e.target.value }))
          }
          style={filtroStyle}
        >
          <option value="">Todos los estatus</option>
          {listaEstatus.map((est) => (
            <option key={est.id} value={est.id}>
              {est.str_nombre}
            </option>
          ))}
        </select>

        {/* Departamento */}
        <select
          value={filtros.departamento_id}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              departamento_id: e.target.value,
            }))
          }
          style={filtroStyle}
        >
          <option value="">Todos los departamentos</option>
          {listaDepartamentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.str_nombre}
            </option>
          ))}
        </select>

        {/* Prioridad */}
        <select
          value={filtros.prioridad_id}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              prioridad_id: e.target.value,
            }))
          }
          style={filtroStyle}
        >
          <option value="">Todas las prioridades</option>
          {prioridades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.str_nombre}
            </option>
          ))}
        </select>

        {/* Canal */}
        <select
          value={filtros.canal_id}
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, canal_id: e.target.value }))
          }
          style={filtroStyle}
        >
          <option value="">Todos los canales</option>
          {canales.map((c) => (
            <option key={c.id} value={c.id}>
              {c.str_nombre}
            </option>
          ))}
        </select>

        {/* Fechas */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <small style={{ color: "var(--merco-muted)", fontSize: 11 }}>
            Desde:
          </small>
          <input
            type="date"
            value={filtros.creacion_desde}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                creacion_desde: e.target.value,
              }))
            }
            style={filtroStyle}
          />
          <small style={{ color: "var(--merco-muted)", fontSize: 11 }}>
            Hasta:
          </small>
          <input
            type="date"
            value={filtros.creacion_hasta}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                creacion_hasta: e.target.value,
              }))
            }
            style={filtroStyle}
          />
        </div>
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={limpiarFiltros}
        style={{ whiteSpace: "nowrap" }}
      >
        Limpiar Filtros
      </button>
    </div>
  );
}
