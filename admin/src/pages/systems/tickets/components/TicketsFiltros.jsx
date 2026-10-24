import React from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

export function TicketsFiltros({
  fTipoTicket,
  setFTipoTicket,
  fEstado,
  setFEstado,
  fDepartamento,
  setFDepartamento,
  fCategoria,
  setFCategoria,
  categorias,
  fAgente,
  setFAgente,
  fPrioridad,
  setFPrioridad,
  fCanal,
  setFCanal,
  fTipoFecha,
  setFTipoFecha,
  fFechaCalendario,
  setFFechaCalendario,
  fHora,
  setFHora,
  fMinuto,
  setFMinuto,
  fBuscar,
  setFBuscar,
  fTipoPersona,
  setFTipoPersona,
  tiposTicket,
  listaEstatus,
  listaDepartamentos,
  empleadosFiltrados,
  prioridades,
  canales,
  esFiltroInterno,
  limpiarFiltros,
  exportarExcel,
  filtroStyle,
}) {
  const tipoTicketSeleccionadoObj = tiposTicket.find(
    (t) => String(t.id) === String(fTipoTicket),
  );
  const nombreTipoTicket = tipoTicketSeleccionadoObj?.str_nombre || "";
  const esExternoSeleccionado = nombreTipoTicket
    .toLowerCase()
    .includes("externo");

  return (
    <div
      className="ma-toolbar"
      style={{
        marginTop: 0,
        flexDirection: "column",
        alignItems: "stretch",
        gap: "12px",
      }}
    >
      <div
        className="ma-filters"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <select
          value={fTipoTicket}
          onChange={(e) => {
            setFTipoTicket(e.target.value);
            const selectedObj = tiposTicket.find(
              (t) => String(t.id) === String(e.target.value),
            );
            if (!selectedObj?.str_nombre.toLowerCase().includes("externo")) {
              setFTipoPersona("");
            }
          }}
          style={filtroStyle}
        >
          <option value="">Todos los tickets</option>
          {tiposTicket.map((t) => (
            <option key={t.id} value={t.id}>
              {t.str_nombre}
            </option>
          ))}
        </select>

        {/* SELECT DE TIPO DE PERSONA (USANDO EL ESTILO ESTÁNDAR SIN BORDE NARANJA) */}
        {esExternoSeleccionado && (
          <select
            value={fTipoPersona}
            onChange={(e) => setFTipoPersona(e.target.value)}
            style={filtroStyle}
          >
            <option value="">Todos los tipos de persona</option>
            <option value="natural">Persona Natural</option>
            <option value="juridico">Persona Jurídica</option>
          </select>
        )}

        {/* SELECT DE CATEGORÍA DINÁMICA */}
        <select
          value={fCategoria}
          onChange={(e) => setFCategoria(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.str_nombre}
            </option>
          ))}
        </select>

        <select
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los estatus</option>
          {listaEstatus.map((est) => (
            <option key={est.id} value={est.id}>
              {est.str_nombre}
            </option>
          ))}
        </select>

        <select
          value={fDepartamento}
          onChange={(e) => setFDepartamento(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los departamentos</option>
          {listaDepartamentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.str_nombre}
            </option>
          ))}
        </select>

        <select
          value={fAgente}
          onChange={(e) => setFAgente(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Asignado a</option>
          {empleadosFiltrados.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.str_nombre} {emp.str_apellido}
            </option>
          ))}
        </select>

        <select
          value={fPrioridad}
          onChange={(e) => setFPrioridad(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todas las prioridades</option>
          {prioridades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.str_nombre}
            </option>
          ))}
        </select>

        {!esFiltroInterno && (
          <select
            value={fCanal}
            onChange={(e) => setFCanal(e.target.value)}
            style={filtroStyle}
          >
            <option value="">Todos los canales</option>
            {canales.map((c) => (
              <option key={c.id} value={c.id}>
                {c.str_nombre}
              </option>
            ))}
          </select>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <select
            value={fTipoFecha}
            onChange={(e) => {
              setFTipoFecha(e.target.value);
              if (!e.target.value) {
                setFFechaCalendario("");
                setFHora("");
                setFMinuto("");
              }
            }}
            style={filtroStyle}
          >
            <option value="">Filtrar por Fecha de</option>
            <option value="creacion">creación</option>
            <option value="vencimiento">vencimiento</option>
            <option value="cierre">cierre</option>
          </select>

          <input
            type="date"
            value={fFechaCalendario}
            disabled={!fTipoFecha}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setFFechaCalendario(e.target.value);
              if (!e.target.value) {
                setFHora("");
                setFMinuto("");
              }
            }}
            style={{ ...filtroStyle, opacity: fTipoFecha ? 1 : 0.6 }}
          />

          <select
            value={fHora}
            disabled={!fFechaCalendario}
            onChange={(e) => {
              setFHora(e.target.value);
              if (!e.target.value) setFMinuto("");
            }}
            style={{ ...filtroStyle, opacity: fFechaCalendario ? 1 : 0.6 }}
          >
            <option value="">Hora</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}h
              </option>
            ))}
          </select>

          <span>:</span>

          <select
            value={fMinuto}
            disabled={!fFechaCalendario || fHora === ""}
            onChange={(e) => setFMinuto(e.target.value)}
            style={{
              ...filtroStyle,
              opacity: fFechaCalendario && fHora !== "" ? 1 : 0.6,
            }}
          >
            <option value="">Min</option>
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}m
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderTop: "1px solid var(--merco-border)",
          paddingTop: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <DynamicIcon
            name="FiSearch"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.6,
            }}
          />
          <input
            type="text"
            placeholder="Buscar por N° Ticket, creador, cédula, RIF, nombre o asunto"
            value={fBuscar}
            onChange={(e) => setFBuscar(e.target.value)}
            style={{ ...filtroStyle, width: "100%", paddingLeft: "36px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={limpiarFiltros}
            style={{ whiteSpace: "nowrap" }}
          >
            Limpiar Filtros
          </button>
          <button
            className="btn-icon"
            onClick={exportarExcel}
            title="Exportar a Excel"
            style={{
              color: "#10b981",
              padding: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <DynamicIcon name="RiFileExcel2Line" style={{ fontSize: 22 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
