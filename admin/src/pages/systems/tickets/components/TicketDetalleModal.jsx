import ReactDOM from "react-dom";
import { DynamicIcon } from "../../../../components/IconCatalog";
import { BlockNoteView } from "@blocknote/mantine";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

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
  editorRespuesta,
  handleEditorRespuestaChange,
  isDarkMode,
  currentUserId,
  currentUserRole
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

            {(() => {
              const estatusObj = listaEstatus.find(
                (est) =>
                  Number(est.id) === Number(ticketSeleccionado.estatus_id),
              );
              const nombreEstatus =
                estatusObj?.str_nombre ||
                ticketSeleccionado.estatus_nombre ||
                "En Progreso";
              const descEstatus = estatusObj?.str_descripcion;

              const estName = nombreEstatus.toLowerCase();
              const esCanceladoModal = estName.includes("cancelado");
              const esRojo =
                estName.includes("vencido") ||
                estName.includes("crítico") ||
                estName.includes("urgente");
              const esEnProceso = estName.includes("en progreso");
              const esEnEspera =
                estName.includes("espera") || estName.includes("pendiente");

              return (
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    background: esEnEspera
                      ? "rgba(168, 85, 247, 0.1)"
                      : esCanceladoModal
                        ? "rgba(14, 165, 233, 0.1)"
                        : esRojo
                          ? "rgba(239, 68, 68, 0.1)"
                          : esEnProceso
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(16, 185, 129, 0.1)",
                    color: esEnEspera
                      ? "#a855f7"
                      : esCanceladoModal
                        ? "#0ea5e9"
                        : esRojo
                          ? "#ef4444"
                          : esEnProceso
                            ? "#3b82f6"
                            : "#10b981",
                  }}
                >
                  <b>{nombreEstatus}</b>
                  {descEstatus ? ` - ${descEstatus}` : ""}
                  {esTicketBloqueado ? " (Solo lectura)" : ""}
                </span>
              );
            })()}
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
          {(() => {
            const nombreCreadorModal = `${
              ticketSeleccionado.creador_nombre || ""
            } ${ticketSeleccionado.creador_apellido || ""}`.trim();
            const correoCreadorModal = ticketSeleccionado.creador_correo || "";

            const creador_id = ticketSeleccionado.creador_agente_id || "";
            const asignado_id = ticketSeleccionado.usuario_asignado_id || "";

            return (
              <>
                {nombreCreadorModal && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div>
                      <b>Creado por:</b> {nombreCreadorModal}
                    </div>
                    <button
                      className="btn-icon"
                      onClick={(e) =>
                        copiarTextoClipboard(
                          e,
                          nombreCreadorModal,
                          "Creador del ticket",
                        )
                      }
                      title="Copiar nombre del creador"
                      style={{ padding: "4px" }}
                    >
                      <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                    </button>
                  </div>
                )}

                {correoCreadorModal && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div>
                      <b>Correo:</b> {correoCreadorModal}
                    </div>
                    <button
                      className="btn-icon"
                      onClick={(e) =>
                        copiarTextoClipboard(
                          e,
                          correoCreadorModal,
                          "Correo del creador",
                        )
                      }
                      title="Copiar correo del creador"
                      style={{ padding: "4px" }}
                    >
                      <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          <div>
            <b>Asunto:</b> {ticketSeleccionado.str_asunto}
          </div>
          <div>
            <b>Tipo:</b> {ticketSeleccionado.tipo_ticket}
          </div>
          <div>
            <b>Categoría:</b> {ticketSeleccionado.categoria_nombre}
          </div>

          {(ticketSeleccionado.tipo_ticket?.toLowerCase().includes("externo") ||
            ticketSeleccionado.tipo_ticket?.toLowerCase().includes("app")) && (
            <div>
              <b>Canal:</b> {ticketSeleccionado.canal_nombre || "N/A"}
            </div>
          )}

          {ticketSeleccionado.tipo_ticket?.toLowerCase().includes("externo") ||
          ticketSeleccionado.tipo_ticket?.toLowerCase().includes("app") ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div>
                  <b style={{ color: "var(--merco-accent, #f95700)" }}>
                    Cédula del Cliente:
                  </b>{" "}
                  {ticketSeleccionado.cliente_cedula || "—"}
                </div>
                {ticketSeleccionado.cliente_cedula && (
                  <button
                    className="btn-icon"
                    onClick={(e) =>
                      copiarTextoClipboard(
                        e,
                        ticketSeleccionado.cliente_cedula,
                        "Cédula del cliente",
                      )
                    }
                    title="Copiar cédula"
                    style={{ padding: "4px" }}
                  >
                    <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div>
                  <b style={{ color: "var(--merco-accent, #f95700)" }}>
                    Nombre y Apellido Cliente:
                  </b>{" "}
                  {ticketSeleccionado.cliente_nombre || "—"}{" "}
                  {ticketSeleccionado.cliente_apellido || ""}
                </div>
                {ticketSeleccionado.cliente_nombre && (
                  <button
                    className="btn-icon"
                    onClick={(e) =>
                      copiarTextoClipboard(
                        e,
                        `${ticketSeleccionado.cliente_nombre || ""} ${ticketSeleccionado.cliente_apellido || ""}`.trim(),
                        "Nombre del cliente",
                      )
                    }
                    title="Copiar nombre y apellido"
                    style={{ padding: "4px" }}
                  >
                    <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div>
                  <b style={{ color: "var(--merco-accent, #f95700)" }}>
                    Teléfono del Cliente:
                  </b>{" "}
                  {ticketSeleccionado.cliente_telefono || "—"}
                </div>
                {ticketSeleccionado.cliente_telefono && (
                  <button
                    className="btn-icon"
                    onClick={(e) =>
                      copiarTextoClipboard(
                        e,
                        ticketSeleccionado.cliente_telefono,
                        "Teléfono del cliente",
                      )
                    }
                    title="Copiar teléfono"
                    style={{ padding: "4px" }}
                  >
                    <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div>
                  <b style={{ color: "var(--merco-accent, #f95700)" }}>
                    Correo del Cliente:
                  </b>{" "}
                  {ticketSeleccionado.cliente_correo || "—"}
                </div>
                {ticketSeleccionado.cliente_correo && (
                  <button
                    className="btn-icon"
                    onClick={(e) =>
                      copiarTextoClipboard(
                        e,
                        ticketSeleccionado.cliente_correo,
                        "Correo del cliente",
                      )
                    }
                    title="Copiar correo"
                    style={{ padding: "4px" }}
                  >
                    <DynamicIcon name="FiCopy" style={{ fontSize: 13 }} />
                  </button>
                )}
              </div>
            </>
          ) : null}

          <div>
            <b>Prioridad Actual:</b> {ticketSeleccionado.prioridad_nombre}
          </div>

          <div>
            <b>Fecha de Creación:</b>{" "}
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
          <div>
            <b>SLA:</b>{" "}
            <span style={{ color: "#f59e0b", fontWeight: 600 }}>
              {ticketSeleccionado.int_sla
                ? `${ticketSeleccionado.int_sla} horas`
                : "—"}
            </span>
          </div>
          <div>
            <b>Fecha de Cierre:</b>{" "}
            {ticketSeleccionado.dmt_fecha_cierre
              ? new Date(ticketSeleccionado.dmt_fecha_cierre).toLocaleString(
                  "es-VE",
                )
              : "—"}
          </div>
          <div>
            <b>Duración:</b>{" "}
            <span
              style={{
                color: "var(--merco-accent, #3b82f6)",
                fontWeight: 600,
              }}
            >
              {ticketSeleccionado.tiempo_resolucion || "En curso"}
            </span>
          </div>
        </div>

        {/* SECCIÓN DE DESCRIPCIÓN CON PESTAÑAS MULTIMEDIA */}
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

          {tieneMultimedia && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                borderBottom: "1px solid var(--merco-border)",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setTabActiva("descripcion")}
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    tabActiva === "descripcion"
                      ? "var(--merco-surface)"
                      : "transparent",
                  color:
                    tabActiva === "descripcion"
                      ? "var(--merco-accent, #f95700)"
                      : "inherit",
                  border: "none",
                  borderBottom:
                    tabActiva === "descripcion"
                      ? "2px solid var(--merco-accent, #f95700)"
                      : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                Descripción
              </button>

              {imagenes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTabActiva("imagenes")}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      tabActiva === "imagenes"
                        ? "var(--merco-surface)"
                        : "transparent",
                    color:
                      tabActiva === "imagenes"
                        ? "var(--merco-accent, #f95700)"
                        : "inherit",
                    border: "none",
                    borderBottom:
                      tabActiva === "imagenes"
                        ? "2px solid var(--merco-accent, #f95700)"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  Imágenes ({imagenes.length})
                </button>
              )}

              {videos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTabActiva("videos")}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      tabActiva === "videos"
                        ? "var(--merco-surface)"
                        : "transparent",
                    color:
                      tabActiva === "videos"
                        ? "var(--merco-accent, #f95700)"
                        : "inherit",
                    border: "none",
                    borderBottom:
                      tabActiva === "videos"
                        ? "2px solid var(--merco-accent, #f95700)"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  Videos ({videos.length})
                </button>
              )}

              {audios.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTabActiva("audios")}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      tabActiva === "audios"
                        ? "var(--merco-surface)"
                        : "transparent",
                    color:
                      tabActiva === "audios"
                        ? "var(--merco-accent, #f95700)"
                        : "inherit",
                    border: "none",
                    borderBottom:
                      tabActiva === "audios"
                        ? "2px solid var(--merco-accent, #f95700)"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  Audios ({audios.length})
                </button>
              )}
            </div>
          )}

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
            {(!tieneMultimedia || tabActiva === "descripcion") && (
              <div
                className="ticket-html-content"
                dangerouslySetInnerHTML={{
                  __html: ticketSeleccionado.str_descripcion,
                }}
              />
            )}

            {tabActiva === "imagenes" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {imagenes.map((img, idx) => {
                  const nombreArchivo = img.trim().split("/").pop();
                  const urlArchivo = `${backendUrl}/uploads/${nombreArchivo}`;
                  return (
                    <div key={idx} style={{ textAlign: "center" }}>
                      <a
                        href={urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={urlArchivo}
                          alt={`Evidencia ${idx + 1}`}
                          style={{
                            maxWidth: "150px",
                            maxHeight: "150px",
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid var(--merco-border)",
                          }}
                        />
                      </a>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--merco-muted)",
                          marginTop: "4px",
                        }}
                      >
                        {nombreArchivo}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tabActiva === "videos" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {videos.map((vid, idx) => {
                  const nombreArchivo = vid.trim().split("/").pop();
                  const urlArchivo = `${backendUrl}/uploads/${nombreArchivo}`;
                  return (
                    <div key={idx}>
                      <video
                        controls
                        style={{
                          maxWidth: "280px",
                          maxHeight: "180px",
                          borderRadius: 4,
                        }}
                      >
                        <source src={urlArchivo} />
                        Tu navegador no soporta la reproducción de video.
                      </video>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--merco-muted)",
                          marginTop: "4px",
                        }}
                      >
                        {nombreArchivo}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tabActiva === "audios" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {audios.map((aud, idx) => {
                  const nombreArchivo = aud.trim().split("/").pop();
                  const urlArchivo = `${backendUrl}/uploads/${nombreArchivo}`;
                  return (
                    <div key={idx}>
                      <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                        {nombreArchivo}
                      </div>
                      <audio controls style={{ width: "100%" }}>
                        <source src={urlArchivo} />
                        Tu navegador no soporta la reproducción de audio.
                      </audio>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN DE HISTORIAL DE BITÁCORA */}
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
                  <div
                    className="ticket-html-content"
                    dangerouslySetInnerHTML={{ __html: item.str_comentario }}
                  />
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
                      {est.str_nombre}{" "}
                      {est.str_descripcion ? `- ${est.str_descripcion}` : ""}
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

              <div
                style={{
                  position: "relative",
                  border: errorModal
                    ? "1px solid #ef4444"
                    : "1px solid var(--merco-border, #ccc)",
                  borderRadius: 6,
                  padding: "2px",
                  minHeight: "auto",
                }}
              >
                {editorRespuesta && (
                  <BlockNoteView
                    editor={editorRespuesta}
                    theme={isDarkMode ? "dark" : "light"}
                    onChange={handleEditorRespuestaChange}
                  />
                )}
              </div>

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

              {(() => {
                const creadorId = Number(ticketSeleccionado.creador_agente_id);
                const asignadoId = Number(
                  ticketSeleccionado.usuario_asignado_id,
                );
                const userId = Number(currentUserId);
                const rolLower = (currentUserRole || "").toLowerCase();

                // ¿Es administrador o gerente ATC? (Tienen privilegios globales o de supervisión)
                const esAdminOGerente =
                  rolLower.includes("administrador") ||
                  rolLower.includes("admin") ||
                  rolLower.includes("gerente atc");

                // ¿Es participante directo del ticket? (Creador o asignado)
                const esParticipanteDirecto =
                  (userId && userId === creadorId) ||
                  (userId && userId === asignadoId);

                const puedeGuardar = esAdminOGerente || esParticipanteDirecto;

                return (
                  <>
                    {puedeGuardar ? (
                      <button type="submit" className="btn btn-primary">
                        <DynamicIcon name="FiSave" /> Guardar Cambios
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={true}
                        title="Debe ser administrador, gerente, el creador del ticket o habérsele asignado para guardar cambios"
                      >
                        <DynamicIcon name="FiSave" /> Sin permisos para
                        modificar
                      </button>
                    )}
                  </>
                );
              })()}

              {/* <button type="submit" className="btn btn-primary">
                <DynamicIcon name="FiSave" /> Guardar Cambios
              </button> */}
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
