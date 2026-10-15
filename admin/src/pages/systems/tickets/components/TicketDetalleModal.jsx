import React from "react";
import ReactDOM from "react-dom";
import { DynamicIcon } from "../../../../components/IconCatalog";

export function TicketDetalleModal({
  ticketSeleccionado,
  setTicketSeleccionado,
  listaEstatus,
  listaDepartamentos,
  prioridades,
  usuariosModalFiltrados,
  estatusModalDisponibles,
  nuevoEstatusId,
  setNuevoEstatusId,
  nuevoAsignadoId,
  setNuevoAsignadoId,
  nuevoPrioridadId,
  setNuevoPrioridadId,
  modalDepartamentoId,
  setModalDepartamentoId,
  respuestaTexto,
  setRespuestaTexto,
  tabActiva,
  setTabActiva,
  bitacoraList,
  errorModal,
  setErrorModal,
  esTicketBloqueado,
  handleGuardarCambiosTicket,
  copiarTextoClipboard,
  filtroStyle,
}) {
  if (!ticketSeleccionado) return null;

  const backendUrl = import.meta.env.VITE_URL_API_LOCAL_VER;

  const imagenes = ticketSeleccionado.str_ruta_imagen
    ? ticketSeleccionado.str_ruta_imagen.split(",")
    : [];
  const videos = ticketSeleccionado.str_ruta_video
    ? ticketSeleccionado.str_ruta_video.split(",")
    : [];
  const audios = ticketSeleccionado.str_ruta_audio
    ? ticketSeleccionado.str_ruta_audio.split(",")
    : [];
  const tieneMultimedia =
    imagenes.length > 0 || videos.length > 0 || audios.length > 0;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--merco-surface)",
          padding: 24,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Ticket: {ticketSeleccionado.str_ticket}
            </h3>
            <button
              className="btn-icon"
              onClick={(e) =>
                copiarTextoClipboard(
                  e,
                  ticketSeleccionado.str_ticket,
                  `Código ${ticketSeleccionado.str_ticket}`,
                )
              }
              title="Copiar código"
            >
              <DynamicIcon name="FiCopy" style={{ fontSize: 14 }} />
            </button>
          </div>
          <button
            className="btn-icon"
            onClick={() => setTicketSeleccionado(null)}
          >
            <DynamicIcon name="FiX" />
          </button>
        </div>

        {/* METADATOS DEL TICKET */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 13,
            marginBottom: 16,
            background: "var(--merco-bg-subtle)",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <div>
            <b>Creado por:</b>{" "}
            {`${ticketSeleccionado.creador_nombre || ""} ${ticketSeleccionado.creador_apellido || ""}`.trim()}
          </div>
          <div>
            <b>Correo:</b> {ticketSeleccionado.creador_correo || "—"}
          </div>
          <div>
            <b>Asunto:</b> {ticketSeleccionado.str_asunto}
          </div>
          <div>
            <b>Tipo:</b> {ticketSeleccionado.tipo_ticket}
          </div>
          <div>
            <b>Categoría:</b> {ticketSeleccionado.categoria_nombre}
          </div>
          <div>
            <b>Prioridad:</b> {ticketSeleccionado.prioridad_nombre}
          </div>
          <div>
            <b>Fecha Creación:</b>{" "}
            {ticketSeleccionado.created_at
              ? new Date(ticketSeleccionado.created_at).toLocaleString("es-VE")
              : "—"}
          </div>
          <div>
            <b>F. Vencimiento:</b>{" "}
            {ticketSeleccionado.dmt_fecha_vencimiento_sla
              ? new Date(
                  ticketSeleccionado.dmt_fecha_vencimiento_sla,
                ).toLocaleString("es-VE")
              : "—"}
          </div>
        </div>

        {/* DESCRIPCIÓN Y MULTIMEDIA */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Descripción y Archivos Adjuntos:
          </label>
          <div
            style={{
              padding: 10,
              border: "1px solid var(--merco-border)",
              borderRadius: 6,
              fontSize: 13,
              background: "var(--merco-bg-card)",
              minHeight: "80px",
            }}
          >
            <div
              className="ticket-html-content"
              dangerouslySetInnerHTML={{
                __html: ticketSeleccionado.str_descripcion,
              }}
            />
          </div>
        </div>

        {/* BITÁCORA */}
        <div
          style={{
            marginBottom: 16,
            borderTop: "1px solid var(--merco-border)",
            paddingTop: 12,
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
            }}
          >
            Bitácora del ticket / Respuestas ({bitacoraList.length}):
          </label>
          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {bitacoraList.length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--merco-muted)",
                  fontStyle: "italic",
                }}
              >
                No hay respuestas o avances registrados en la bitácora todavía.
              </div>
            ) : (
              bitacoraList.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    background: "var(--merco-bg-subtle)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                      color: "var(--merco-muted)",
                      fontSize: 11,
                    }}
                  >
                    <b>
                      {item.usuario_nombre} {item.usuario_apellido}
                    </b>
                    <span>
                      {new Date(item.created_at).toLocaleString("es-VE")}
                    </span>
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {item.str_comentario}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FORMULARIO DE EDICIÓN */}
        {!esTicketBloqueado ? (
          <form onSubmit={handleGuardarCambiosTicket}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Departamento
                </label>
                <select
                  value={modalDepartamentoId}
                  onChange={(e) => {
                    setModalDepartamentoId(e.target.value);
                    setNuevoAsignadoId("");
                  }}
                  style={{ ...filtroStyle, width: "100%", cursor: "pointer" }}
                >
                  <option value="">Seleccionar</option>
                  {listaDepartamentos.map((dep) => (
                    <option key={dep.id} value={String(dep.id)}>
                      {dep.str_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Asignar a:
                </label>
                <select
                  value={nuevoAsignadoId}
                  onChange={(e) => setNuevoAsignadoId(e.target.value)}
                  style={{ ...filtroStyle, width: "100%", cursor: "pointer" }}
                >
                  <option value="">Sin asignar</option>
                  {usuariosModalFiltrados.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.str_nombre} {u.str_apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Prioridad
                </label>
                <select
                  value={nuevoPrioridadId}
                  onChange={(e) => setNuevoPrioridadId(e.target.value)}
                  style={{ ...filtroStyle, width: "100%", cursor: "pointer" }}
                >
                  {prioridades.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.str_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Estatus
                </label>
                <select
                  value={nuevoEstatusId}
                  onChange={(e) => setNuevoEstatusId(e.target.value)}
                  style={{ ...filtroStyle, width: "100%", cursor: "pointer" }}
                >
                  {estatusModalDisponibles.map((est) => (
                    <option key={est.id} value={String(est.id)}>
                      {est.str_nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Responder / Agregar Nota
              </label>
              <textarea
                rows={3}
                value={respuestaTexto}
                onChange={(e) => {
                  setRespuestaTexto(e.target.value);
                  if (errorModal) setErrorModal("");
                }}
                placeholder="Escriba una respuesta o nota..."
                style={{
                  ...filtroStyle,
                  width: "100%",
                  resize: "vertical",
                  borderColor: errorModal ? "#ef4444" : "var(--merco-border)",
                }}
              />
              {errorModal && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#ef4444",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <DynamicIcon name="FiAlertCircle" style={{ fontSize: 13 }} />
                  {errorModal}
                </div>
              )}
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setTicketSeleccionado(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <DynamicIcon name="FiSave" /> Guardar Cambios
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setTicketSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
