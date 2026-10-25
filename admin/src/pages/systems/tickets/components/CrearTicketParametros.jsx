export function CrearTicketParametros({
  tipoTicketId,
  handleTipoTicketChange,
  listaTipoTicket,
  nombre,
  apellido,
  user,
  departamentoId,
  setDepartamentoId,
  departamentosActuales,
  usuarioId,
  setUsuarioId,
  empleadosFiltrados,
  strAsunto,
  setStrAsunto,
  inputStyle,
  labelStyle,
  debeBloquearEmpleado,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Fila 1: Tipo de Ticket, Remitente y Asunto */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <div className="field">
          <label style={labelStyle}>Tipo de Ticket</label>
          <select
            value={tipoTicketId}
            onChange={(e) => handleTipoTicketChange(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Seleccione tipo...</option>
            {listaTipoTicket.map((t) => (
              <option key={t.id} value={t.id}>
                {t.str_nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label style={labelStyle}>De (Remitente)</label>
          <input
            className="field input"
            value={`${nombre} ${apellido}`}
            readOnly
            disabled
            title={`${nombre} ${apellido} <${user?.email || "analista@mercosur.com"}>`}
            style={inputStyle}
          />
        </div>

        <div className="field">
          <label style={labelStyle}>Asunto</label>
          <input
            value={strAsunto}
            onChange={(e) => setStrAsunto(e.target.value)}
            placeholder="Resumen del requerimiento..."
            maxLength={100}
            required
            style={inputStyle}
          />
        </div>
      </div>

      {/* Fila 2: Departamento (Obligatorio) y Empleado Asignado (Opcional) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        <div className="field">
          <label style={labelStyle}>Para (Departamento)</label>
          <select
            value={departamentoId}
            onChange={(e) => {
              setDepartamentoId(e.target.value);
              setUsuarioId("");
            }}
            required
            style={inputStyle}
          >
            <option value="">Seleccione departamento...</option>
            {departamentosActuales.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.str_nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label style={labelStyle}>Empleado Asignado</label>
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            disabled={!departamentoId || debeBloquearEmpleado}
            style={{
              ...inputStyle,
              backgroundColor: debeBloquearEmpleado
                ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                : inputStyle.background,
              opacity: debeBloquearEmpleado ? 0.7 : 1,
            }}

            required={debeBloquearEmpleado ? false : true}
          >
            <option value="">
              {!departamentoId
                ? "Seleccione departamento primero..."
                : debeBloquearEmpleado
                  ? "Asignación automática por sistema (Tecnología)"
                  : "Sin asignación directa (Opcional)"}
            </option>
            {!debeBloquearEmpleado &&
              empleadosFiltrados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.str_nombre} {emp.str_apellido} ({emp.str_email})
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
