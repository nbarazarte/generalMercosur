import React from "react";

export function ClienteExternoFields({
  tipoPersonaCliente,
  setTipoPersonaCliente,
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
  strRifCliente,
  setStrRifCliente,
  clienteJuridicoBloqueado,
  setClienteJuridicoBloqueado,
  setClienteJuridicoId,
  handleRifBlur,
  strRazonSocialCliente,
  setStrRazonSocialCliente,
  strTelefonoJuridicoCliente,
  setStrTelefonoJuridicoCliente,
  strCorreoJuridicoCliente,
  setStrCorreoJuridicoCliente,
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
      {/* Selector de Tipo de Persona */}
      <div className="field">
        <label style={labelStyle}>Tipo de Solicitante / Cliente</label>
        <select
          value={tipoPersonaCliente}
          onChange={(e) => setTipoPersonaCliente(e.target.value)}
          style={inputStyle}
        >
          <option value="natural">Persona Natural</option>
          <option value="juridico">Persona Jurídica (Empresa)</option>
        </select>
      </div>

      {tipoPersonaCliente === "natural" ? (
        <>
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
                maxLength={9}
                value={strCedulaCliente}
                onChange={(e) => {
                  const inputRaw = e.target.value.toLowerCase();
                  if (!inputRaw.trim()) {
                    setStrCedulaCliente("");
                    if (clienteBloqueado) {
                      setClienteBloqueado(false);
                      setClienteId(null);
                    }
                    return;
                  }
                  let prefijo = "v";
                  if (inputRaw.startsWith("e")) {
                    prefijo = "e";
                  }
                  const numeros = inputRaw.replace(/\D/g, "").slice(0, 8);
                  const valorLimpio = `${prefijo}${numeros}`;
                  setStrCedulaCliente(valorLimpio);

                  if (clienteBloqueado) {
                    setClienteBloqueado(false);
                    setClienteId(null);
                  }
                }}
                onBlur={handleCedulaBlur}
                placeholder="Ej. v16000111 o e8123456"
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

          {/* Fila 2: Teléfono y Correo Natural */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
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
                  border: correoInvalido
                    ? "1px solid #ef4444"
                    : inputStyle.border,
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
        </>
      ) : (
        <>
          {/* Fila 1 Jurídico: RIF y Razón Social */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "10px",
            }}
          >
            <div className="field">
              <label style={labelStyle}>RIF de la Empresa</label>
              <input
                type="text"
                maxLength={12}
                value={strRifCliente}
                onChange={(e) => {
                  // Limpia guiones y espacios, convirtiendo todo a minúsculas
                  const valorLimpio = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");
                  setStrRifCliente(valorLimpio);

                  if (clienteJuridicoBloqueado) {
                    setClienteJuridicoBloqueado(false);
                    setClienteJuridicoId(null);
                  }
                }}
                onBlur={handleRifBlur}
                placeholder="Ej. j508396391"
                required
                style={inputStyle}
              />
            </div>

            <div className="field">
              <label style={labelStyle}>Razón Social</label>
              <input
                type="text"
                value={strRazonSocialCliente}
                onChange={(e) => setStrRazonSocialCliente(e.target.value)}
                readOnly={clienteJuridicoBloqueado}
                placeholder="Nombre de la Empresa C.A."
                required
                style={{
                  ...inputStyle,
                  backgroundColor: clienteJuridicoBloqueado
                    ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                    : inputStyle.background,
                }}
              />
            </div>
          </div>

          {/* Fila 2 Jurídico: Teléfono y Correo */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div className="field">
              <label style={labelStyle}>Teléfono Corporativo</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={strTelefonoJuridicoCliente}
                onChange={(e) => {
                  const valorLimpio = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 11);
                  setStrTelefonoJuridicoCliente(valorLimpio);
                }}
                readOnly={clienteJuridicoBloqueado}
                placeholder="02125555555"
                required
                style={{
                  ...inputStyle,
                  backgroundColor: clienteJuridicoBloqueado
                    ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                    : inputStyle.background,
                }}
              />
            </div>

            <div className="field">
              <label style={labelStyle}>Correo Corporativo</label>
              <input
                ref={correoInputRef}
                type="text"
                value={strCorreoJuridicoCliente}
                onChange={(e) => {
                  const valor = e.target.value;
                  setStrCorreoJuridicoCliente(valor);
                  if (validarCorreo(valor) || valor.trim() === "") {
                    setCorreoInvalido(false);
                  }
                }}
                onBlur={handleCorreoBlur}
                readOnly={clienteJuridicoBloqueado}
                placeholder="empresa@correo.com"
                required
                style={{
                  ...inputStyle,
                  backgroundColor: clienteJuridicoBloqueado
                    ? "var(--merco-bg-subtle, rgba(0,0,0,0.04))"
                    : inputStyle.background,
                  border: correoInvalido
                    ? "1px solid #ef4444"
                    : inputStyle.border,
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
        </>
      )}

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
