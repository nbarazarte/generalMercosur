import SystemLayout from "../../../pages/layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { BlockNoteView } from "@blocknote/mantine";
import { useCrearTicket } from "./hooks/useCrearTicket";
import { TicketParametros } from "./components/TicketParametros";
import { ClienteExternoFields } from "./components/ClienteExternoFields";
import CopiableCodigoPartes from "./components/CopiableCodigoPartes";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function CrearTicket() {
  const {
    tipoTicketId,
    categoriaId,
    setCategoriaId,
    prioridadId,
    setPrioridadId,
    canalId,
    setCanalId,
    departamentoId,
    setDepartamentoId,
    usuarioId,
    setUsuarioId,
    strCedulaCliente,
    setStrCedulaCliente,
    strNombreCliente,
    setStrNombreCliente,
    strApellidoCliente,
    setStrApellidoCliente,
    strTelefonoCliente,
    setStrTelefonoCliente,
    strCorreoCliente,
    setStrCorreoCliente,
    correoInvalido,
    setCorreoInvalido,
    setClienteId,
    clienteBloqueado,
    setClienteBloqueado,
    correoInputRef,
    listaDepartamentos,
    departamentosActuales,
    empleadosFiltrados,
    listaCanales,
    listaPrioridades,
    listaTipoTicket,
    strAsunto,
    setStrAsunto,
    archivosAdjuntos,
    setArchivosAdjuntos,
    isGeneratingAI,
    toast,
    handleCloseToast,
    isDarkMode,
    nombre,
    apellido,
    user,
    esTipoInterno,
    esTipoExterno,
    editor,
    handleEditorChange,
    handleTipoTicketChange,
    handleLimpiarTodo,
    handleGenerarConIA,
    handleCorreoBlur,
    handleCedulaBlur,
    handleSubmit,
    obtenerIconoPorTipo,
    validarCorreo,
    categoriasActuales,
  } = useCrearTicket();

  const inputStyle = {
    width: "100%",
    padding: "6px 10px",
    border: "1px solid var(--merco-border, #ccc)",
    borderRadius: "6px",
    fontFamily: "inherit",
    fontSize: "13px",
    background: "var(--input, var(--merco-surface))",
    color: "var(--merco-text)",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Nuevo Ticket">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <DynamicIcon
            name={
              toast.type === "success" ? "FiCheckCircle" : "FiAlertTriangle"
            }
            style={{ fontSize: "18px", flexShrink: 0 }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {(() => {
              const mensaje =
                typeof toast.message === "string" ? toast.message : "";
              const matchCodigo = mensaje.match(/(TCK\d{4}-\d{2}-\d{6})/);

              if (matchCodigo) {
                const codigo = matchCodigo[1];
                const partes = mensaje.split(codigo);
                return <CopiableCodigoPartes partes={partes} codigo={codigo} />;
              }
              return <span>{mensaje}</span>;
            })()}
          </div>

          <button
            type="button"
            onClick={handleCloseToast}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              padding: "2px 4px",
              marginLeft: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.8,
            }}
            title="Cerrar notificación"
          >
            <DynamicIcon name="FiX" />
          </button>
        </div>
      )}

      {/* Contenedor principal con el formulario */}
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          padding: "8px 12px",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
            {/* Banner Informativo */}
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "6px",
                background: isDarkMode
                  ? "rgba(249, 87, 0, 0.15)"
                  : "rgba(249, 87, 0, 0.08)",
                border: "1px solid var(--merco-accent, #f95700)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--merco-text)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <DynamicIcon
                name={esTipoInterno() ? "FiInfo" : "FiExternalLink"}
                style={{
                  color: "var(--merco-accent, #f95700)",
                  fontSize: "16px",
                }}
              />
              <span>
                {esTipoInterno()
                  ? "Para crear Tickets internos de Mercosur"
                  : "Para crear tickets referentes a la APP de Mercosur y sus clientes"}
              </span>
            </div>

            {/* Formulario unificado */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                border: "1px solid var(--merco-border, #ccc)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <TicketParametros
                tipoTicketId={tipoTicketId}
                handleTipoTicketChange={handleTipoTicketChange}
                listaTipoTicket={listaTipoTicket}
                nombre={nombre}
                apellido={apellido}
                user={user}
                esTipoInterno={esTipoInterno}
                esTipoExterno={esTipoExterno}
                departamentoId={departamentoId}
                setDepartamentoId={setDepartamentoId}
                listaDepartamentos={listaDepartamentos}
                departamentosActuales={departamentosActuales}
                usuarioId={usuarioId}
                setUsuarioId={setUsuarioId}
                empleadosFiltrados={empleadosFiltrados}
                strAsunto={strAsunto}
                setStrAsunto={setStrAsunto}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />

              {esTipoExterno() && (
                <ClienteExternoFields
                  strCedulaCliente={strCedulaCliente}
                  setStrCedulaCliente={setStrCedulaCliente}
                  clienteBloqueado={clienteBloqueado}
                  setClienteBloqueado={setClienteBloqueado}
                  setClienteId={setClienteId}
                  handleCedulaBlur={handleCedulaBlur}
                  strTelefonoCliente={strTelefonoCliente}
                  setStrTelefonoCliente={setStrTelefonoCliente}
                  strNombreCliente={strNombreCliente}
                  setStrNombreCliente={setStrNombreCliente}
                  strApellidoCliente={strApellidoCliente}
                  setStrApellidoCliente={setStrApellidoCliente}
                  strCorreoCliente={strCorreoCliente}
                  setStrCorreoCliente={setStrCorreoCliente}
                  correoInvalido={correoInvalido}
                  setCorreoInvalido={setCorreoInvalido}
                  validarCorreo={validarCorreo}
                  handleCorreoBlur={handleCorreoBlur}
                  correoInputRef={correoInputRef}
                  canalId={canalId}
                  setCanalId={setCanalId}
                  listaCanales={listaCanales}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div className="field">
                  <label style={labelStyle}>Categoría</label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccione categoría...</option>
                    {categoriasActuales.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.str_nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label style={labelStyle}>Prioridad</label>
                  <select
                    value={prioridadId}
                    onChange={(e) => setPrioridadId(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccione prioridad...</option>
                    {listaPrioridades.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.str_nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label style={{ ...labelStyle, margin: 0 }}>
                    Descripción del Ticket
                  </label>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleGenerarConIA}
                    style={{
                      cursor: "pointer",
                      padding: "2px 8px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      border: "1px solid var(--merco-border, #ccc)",
                      borderRadius: "5px",
                    }}
                    disabled={isGeneratingAI}
                    title="usa IA local (opcional)"
                  >
                    <DynamicIcon
                      name="FaRobot"
                      style={{ fontSize: "13px", color: "#eab308" }}
                    />
                    <span style={{ fontSize: "11px" }}>Mejorar redación</span>
                  </button>
                </div>

                <div
                  style={{
                    position: "relative",
                    border: "1px solid var(--merco-border, #ccc)",
                    borderRadius: 6,
                    padding: "2px",
                    minHeight: "auto",
                  }}
                >
                  {isGeneratingAI && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: isDarkMode
                          ? "rgba(0, 0, 0, 0.45)"
                          : "rgba(255, 255, 255, 0.45)",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(3px)",
                      }}
                    >
                      <span>Analizando descripción del ticket...</span>
                    </div>
                  )}
                  {editor && (
                    <BlockNoteView
                      editor={editor}
                      theme={isDarkMode ? "dark" : "light"}
                      onChange={handleEditorChange}
                    />
                  )}
                </div>

                {archivosAdjuntos.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      background: "var(--merco-bg-subtle, rgba(0,0,0,0.03))",
                      borderRadius: 6,
                      fontSize: "11px",
                      border: "1px solid var(--merco-border, #ccc)",
                    }}
                  >
                    <b>Archivos adjuntos ({archivosAdjuntos.length}):</b>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: 4,
                      }}
                    >
                      {archivosAdjuntos.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--merco-border, #ccc)",
                          }}
                        >
                          <DynamicIcon
                            name={obtenerIconoPorTipo(file.type, file.name)}
                            style={{
                              fontSize: "13px",
                              color: "var(--merco-accent, #f95700)",
                            }}
                          />
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setArchivosAdjuntos(
                                archivosAdjuntos.filter((_, i) => i !== index),
                              )
                            }
                            style={{
                              color: "var(--merco-danger, #d1435b)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                  paddingTop: 10,
                  borderTop: "1px solid var(--merco-border, #ccc)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLimpiarTodo}
                  disabled={isGeneratingAI}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isGeneratingAI || correoInvalido}
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  <DynamicIcon name="FiSave" /> Crear Ticket
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}
