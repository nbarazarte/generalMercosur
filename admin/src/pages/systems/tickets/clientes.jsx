import React from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { useClientes } from "./hooks/useClientes";
import { ClientesFiltro } from "./components/ClientesFiltro";
import { TicketDetalleModal } from "../tickets/components/TicketDetalleModal";
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
    expandidos,
    toggleExpandir,
    handleFiltroChange,
    limpiarFiltros,
    handlePorPaginaChange,
    exportarExcel,
    // Propiedades del modal extraídas del hook
    ticketSeleccionado,
    setTicketSeleccionado,
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
    listaDepartamentos,
    listaEstatus,
    prioridades,
    usuariosModalFiltrados,
    estatusModalDisponibles,
    esTicketBloqueado,
    abrirDetalle,
    handleGuardarCambiosTicket,
    copiarTextoClipboard,
    // <-- PROPIEDADES DE BLOCKNOTE AÑADIDAS AQUÍ:
    editorRespuesta,
    handleEditorRespuestaChange,
    isDarkMode,
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

  const obtenerEstilosEstatus = (nombreEstatus) => {
    const estName = (nombreEstatus || "").toLowerCase();
    const esCanceladoModal = estName.includes("cancelado");
    const esRojo =
      estName.includes("vencido") ||
      estName.includes("crítico") ||
      estName.includes("urgente");
    const esEnProceso = estName.includes("en proceso");
    const esEnEspera =
      estName.includes("espera") || estName.includes("pendiente");

    return {
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
    };
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Clientes">
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

        {/* TABLA DE CLIENTES */}
        <div
          className="ma-card"
          style={{ marginTop: 15, display: "flex", flexDirection: "column" }}
        >
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
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
                      colSpan="7"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
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
                  clientes.map((c) => {
                    const estaAbierto = !!expandidos[c.id];
                    const listaTicketsCliente = c.lista_tickets || [];

                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          style={{
                            fontSize: "12px",
                            borderBottom: estaAbierto ? "none" : undefined,
                          }}
                        >
                          <td style={{ textAlign: "center", paddingRight: 0 }}>
                            <button
                              className="btn-icon"
                              onClick={() => toggleExpandir(c.id)}
                              title={
                                estaAbierto
                                  ? "Ocultar detalles"
                                  : "Ver detalles"
                              }
                              style={{
                                transform: estaAbierto
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              <DynamicIcon name="FiArrowRight" />
                            </button>
                          </td>
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

                        {/* FILA EXPANDIBLE CON HISTORIAL DE TICKETS Y DETALLES */}
                        {estaAbierto && (
                          <tr
                            style={{
                              background:
                                "var(--merco-bg-subtle, rgba(255, 255, 255, 0.02))",
                            }}
                          >
                            <td
                              colSpan={7}
                              style={{ padding: "12px 20px 20px 48px" }}
                            >
                              <div
                                style={{
                                  padding: 16,
                                  borderRadius: 8,
                                  border: "1px solid var(--merco-border, #333)",
                                  background: "var(--merco-bg, #1a1a1a)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 12,
                                    color: "var(--merco-muted)",
                                  }}
                                >
                                  <DynamicIcon name="FiInfo" />
                                  <span>
                                    Historial de Tickets de{" "}
                                    {c.cliente || "Cliente"}:
                                  </span>
                                </div>

                                {listaTicketsCliente.length === 0 ? (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "var(--merco-muted)",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Este cliente no posee tickets registrados.
                                  </div>
                                ) : (
                                  <div style={{ overflowX: "auto" }}>
                                    <table
                                      className="ma-table"
                                      style={{
                                        fontSize: "11px",
                                        background: "var(--merco-surface)",
                                      }}
                                    >
                                      <thead>
                                        <tr>
                                          <th>TICKET</th>
                                          <th>ASUNTO</th>
                                          <th>CATEGORÍA</th>
                                          <th>PRIORIDAD</th>
                                          <th>ESTATUS</th>
                                          <th>ASIGNADO A</th>
                                          <th>CREACIÓN</th>
                                          <th>CIERRE</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {listaTicketsCliente
                                          .slice()
                                          .sort(
                                            (a, b) =>
                                              new Date(b.created_at) -
                                              new Date(a.created_at),
                                          )
                                          .map((t) => {
                                            const estilosEstatus =
                                              obtenerEstilosEstatus(
                                                t.estatus_nombre,
                                              );
                                            return (
                                              <tr
                                                key={t.id}
                                                onClick={() => abrirDetalle(t)}
                                                style={{
                                                  cursor: "pointer",
                                                }}
                                                title="Haz clic para ver el detalle completo"
                                              >
                                                <td>
                                                  <b
                                                    style={{
                                                      color:
                                                        "var(--merco-accent, #3b82f6)",
                                                    }}
                                                  >
                                                    {t.str_ticket}
                                                  </b>
                                                </td>
                                                <td>{t.str_asunto}</td>
                                                <td>
                                                  {t.categoria_nombre || "—"}
                                                </td>
                                                <td>
                                                  {t.prioridad_nombre || "—"}
                                                </td>
                                                <td>
                                                  <span
                                                    style={{
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      padding: "4px 10px",
                                                      borderRadius: 10,
                                                      fontSize: 11,
                                                      fontWeight: 600,
                                                      background:
                                                        estilosEstatus.background,
                                                      color:
                                                        estilosEstatus.color,
                                                    }}
                                                  >
                                                    {t.estatus_nombre ||
                                                      "En Proceso"}
                                                  </span>
                                                </td>
                                                <td>
                                                  {t.asignado_nombre
                                                    ? `${t.asignado_nombre} ${t.asignado_apellido || ""}`
                                                    : "Sin asignar"}
                                                </td>
                                                <td>
                                                  {formatearFechaHora(
                                                    t.created_at,
                                                  )}
                                                </td>
                                                <td>
                                                  {t.dmt_fecha_cierre ? (
                                                    formatearFechaHora(
                                                      t.dmt_fecha_cierre,
                                                    )
                                                  ) : (
                                                    <span
                                                      style={{
                                                        color:
                                                          "var(--merco-muted)",
                                                      }}
                                                    >
                                                      -
                                                    </span>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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

      {/* MODAL DE DETALLE DEL TICKET REUTILIZADO */}
      <TicketDetalleModal
        ticketSeleccionado={ticketSeleccionado}
        setTicketSeleccionado={setTicketSeleccionado}
        listaEstatus={listaEstatus}
        listaDepartamentos={listaDepartamentos}
        prioridades={prioridades}
        usuariosModalFiltrados={usuariosModalFiltrados}
        estatusModalDisponibles={estatusModalDisponibles}
        nuevoEstatusId={nuevoEstatusId}
        setNuevoEstatusId={setNuevoEstatusId}
        nuevoAsignadoId={nuevoAsignadoId}
        setNuevoAsignadoId={setNuevoAsignadoId}
        nuevoPrioridadId={nuevoPrioridadId}
        setNuevoPrioridadId={setNuevoPrioridadId}
        modalDepartamentoId={modalDepartamentoId}
        setModalDepartamentoId={setModalDepartamentoId}
        respuestaTexto={respuestaTexto}
        setRespuestaTexto={setRespuestaTexto}
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        bitacoraList={bitacoraList}
        errorModal={errorModal}
        setErrorModal={setErrorModal}
        esTicketBloqueado={esTicketBloqueado}
        handleGuardarCambiosTicket={handleGuardarCambiosTicket}
        copiarTextoClipboard={copiarTextoClipboard}
        filtroStyle={filtroStyle}
        /* PROPS DE BLOCKNOTE */
        editorRespuesta={editorRespuesta}
        handleEditorRespuestaChange={handleEditorRespuestaChange}
        isDarkMode={isDarkMode}
      />
    </SystemLayout>
  );
}
