import React from "react";

export function ClienteExternoFields({
  strCedulaCliente,
  setStrCedulaCliente,
  clienteBloqueado,
  setClienteBloqueado,
  setClienteId,
  handleCedulaBlur,
  strTelefonoCliente,
  setStrTelefonoCliente,
  strNombreCliente,
  setStrNombreCliente,
  strApellidoCliente,
  setStrApellidoCliente,
  strCorreoCliente,
  setStrCorreoCliente,
  correoInvalido,
  setCorreoInvalido,
  validarCorreo,
  handleCorreoBlur,
  correoInputRef,
  canalId,
  setCanalId,
  listaCanales,
  inputStyle,
  labelStyle,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--merco-border, #ccc)",
          margin: "2px 0",
        }}
      />

      {/* Fila 1: Cédula, Nombre y Apellido */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <div className="field">
          <label style={labelStyle}>Cédula del Cliente</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={strCedulaCliente}
            onChange={(e) => {
              const valorLimpio = e.target.value.replace(/\D/g, "").slice(0, 8);
              setStrCedulaCliente(valorLimpio);
              if (clienteBloqueado) {
                setClienteBloqueado(false);
                setClienteId(null);
              }
            }}
            onBlur={handleCedulaBlur}
            placeholder="Ej. 12345678"
            required
            style={inputStyle}
          />
        </div>

        <div className="field">
          <label style={labelStyle}>Nombre del Cliente</label>
          <input
            type="text"
            value={strNombreCliente}
            onChange={(e) => setStrNombreCliente(e.target.value)}
            readOnly={clienteBloqueado}
            placeholder="Nombre"
            required
            style={{
              ...inputStyle,
              backgroundColor: clienteBloqueado
                ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                : inputStyle.background,
            }}
          />
        </div>

        <div className="field">
          <label style={labelStyle}>Apellido del Cliente</label>
          <input
            type="text"
            value={strApellidoCliente}
            onChange={(e) => setStrApellidoCliente(e.target.value)}
            readOnly={clienteBloqueado}
            placeholder="Apellido"
            required
            style={{
              ...inputStyle,
              backgroundColor: clienteBloqueado
                ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                : inputStyle.background,
            }}
          />
        </div>
      </div>

      {/* Fila 2: Teléfono y Correo */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <div className="field">
          <label style={labelStyle}>Teléfono</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            value={strTelefonoCliente}
            onChange={(e) => {
              const valorLimpio = e.target.value
                .replace(/\D/g, "")
                .slice(0, 11);
              setStrTelefonoCliente(valorLimpio);
            }}
            readOnly={clienteBloqueado}
            placeholder="04142102040"
            required
            style={{
              ...inputStyle,
              backgroundColor: clienteBloqueado
                ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                : inputStyle.background,
            }}
          />
        </div>

        <div className="field">
          <label style={labelStyle}>Correo del Cliente</label>
          <input
            ref={correoInputRef}
            type="text"
            value={strCorreoCliente}
            onChange={(e) => {
              const valor = e.target.value;
              setStrCorreoCliente(valor);
              // Si el usuario escribe y el correo pasa la validación, quitamos el error al instante
              if (validarCorreo(valor) || valor.trim() === "") {
                setCorreoInvalido(false);
              }
            }}
            onBlur={handleCorreoBlur}
            readOnly={clienteBloqueado}
            placeholder="cliente@correo.com"
            required
            style={{
              ...inputStyle,
              backgroundColor: clienteBloqueado
                ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                : inputStyle.background,
              border: correoInvalido ? "1px solid #ef4444" : inputStyle.border,
            }}
          />
          {correoInvalido && (
            <span
              style={{
                color: "#ef4444",
                fontSize: "11px",
                marginTop: "3px",
                display: "block",
              }}
            >
              Correo no válido (ej. usuario@dominio.com)
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label style={labelStyle}>Canal de Recepción</label>
        <select
          value={canalId}
          onChange={(e) => setCanalId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Seleccione canal...</option>
          {listaCanales.map((c) => (
            <option key={c.id} value={c.id}>
              {c.str_nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
