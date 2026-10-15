import React from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { useCasosTickets } from "./hooks/useCasosTickets";
import { TicketsFiltros } from "./components/TicketsFiltros";
import { TicketDetalleModal } from "./components/TicketDetalleModal";
import { DynamicIcon } from "../../../components/IconCatalog";

export default function CasosTickets() {
  const {
    loading,
    ticketsFiltrados,
    ticketsPaginados,
    listaDepartamentos,
    empleadosFiltrados,
    canales,
    prioridades,
    tiposTicket,
    listaEstatus,
    fBuscar,
    setFBuscar,
    fTipoTicket,
    setFTipoTicket,
    fEstado,
    setFEstado,
    fPrioridad,
    setFPrioridad,
    fCanal,
    setFCanal,
    fDepartamento,
    setFDepartamento,
    fAgente,
    setFAgente,
    fTipoFecha,
    setFTipoFecha,
    fFechaCalendario,
    setFFechaCalendario,
    fHora,
    setFHora,
    fMinuto,
    setFMinuto,
    paginaActual,
    setPaginaActual,
    porPagina,
    setPorPagina,
    totalPaginas,
    registroInicio,
    registroFin,
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
    toast,
    esFiltroInterno,
    esTicketBloqueado,
    usuariosModalFiltrados,
    estatusModalDisponibles,
    limpiarFiltros,
    exportarExcel,
    abrirDetalle,
    handleGuardarCambiosTicket,
    copiarTextoClipboard,
  } = useCasosTickets();

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  const formatearFechaHora = (fechaStr) => {
    if (!fechaStr) return "—";
    const fechaObj = new Date(fechaStr);
    return (
      <div>
        <div>{fechaObj.toLocaleDateString("es-VE")}</div>
        <div style={{ color: "var(--merco-muted)", fontSize: "10px" }}>
          {fechaObj.toLocaleTimeString("es-VE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    );
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Casos Tickets">
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
        <TicketsFiltros
          fTipoTicket={fTipoTicket}
          setFTipoTicket={setFTipoTicket}
          fEstado={fEstado}
          setFEstado={setFEstado}
          fDepartamento={fDepartamento}
          setFDepartamento={setFDepartamento}
          fAgente={fAgente}
          setFAgente={setFAgente}
          fPrioridad={fPrioridad}
          setFPrioridad={setFPrioridad}
          fCanal={fCanal}
          setFCanal={setFCanal}
          fTipoFecha={fTipoFecha}
          setFTipoFecha={setFTipoFecha}
          fFechaCalendario={fFechaCalendario}
          setFFechaCalendario={setFFechaCalendario}
          fHora={fHora}
          setFHora={setFHora}
          fMinuto={fMinuto}
          setFMinuto={setFMinuto}
          fBuscar={fBuscar}
          setFBuscar={setFBuscar}
          tiposTicket={tiposTicket}
          listaEstatus={listaEstatus}
          listaDepartamentos={listaDepartamentos}
          empleadosFiltrados={empleadosFiltrados}
          prioridades={prioridades}
          canales={canales}
          esFiltroInterno={esFiltroInterno}
          limpiarFiltros={limpiarFiltros}
          exportarExcel={exportarExcel}
          filtroStyle={filtroStyle}
        />

        {/* TABLA DE CASOS / TICKETS */}
        <div
          className="ma-card"
          style={{ marginTop: 15, display: "flex", flexDirection: "column" }}
        >
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>TICKET</th>
                  <th>TIPO</th>
                  <th>CANAL</th>
                  <th>CREADO POR</th>
                  <th>CLIENTE / AFECTADO</th>
                  <th>ASUNTO</th>
                  <th>DEPARTAMENTO</th>
                  <th>PRIORIDAD</th>
                  <th>ASIGNADO A</th>
                  <th>CREACIÓN</th>
                  <th>VENCIMIENTO</th>
                  <th>CIERRE</th>
                  <th>SLA</th>
                  <th>ESTADO</th>
                  <th>DURACION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="15"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Cargando tickets...
                    </td>
                  </tr>
                ) : ticketsPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="15"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      No se encontraron tickets con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  ticketsPaginados.map((t) => {
                    const tipoLower = (t.tipo_ticket || "").toLowerCase();
                    const esExterno =
                      tipoLower.includes("externo") ||
                      tipoLower.includes("app");

                    return (
                      <tr
                        key={t.id}
                        onClick={() => abrirDetalle(t)}
                        style={{ fontSize: "12px", cursor: "pointer" }}
                        title="Haz clic para ver detalles"
                      >
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <b>{t.str_ticket}</b>
                            <button
                              className="btn-icon"
                              onClick={(e) =>
                                copiarTextoClipboard(
                                  e,
                                  t.str_ticket,
                                  `Código ${t.str_ticket}`,
                                )
                              }
                              title="Copiar código"
                              style={{ padding: "4px" }}
                            >
                              <DynamicIcon
                                name="FiCopy"
                                style={{ fontSize: 13 }}
                              />
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="tag" style={{ fontSize: 11 }}>
                            {t.tipo_ticket || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="tag" style={{ fontSize: 11 }}>
                            {t.canal_nombre || "—"}
                          </span>
                        </td>
                        <td>
                          <b>
                            {`${t.creador_nombre || ""} ${t.creador_apellido || ""}`.trim() ||
                              "—"}
                          </b>
                        </td>
                        <td>
                          {esExterno ? (
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-accent, #f95700)",
                                }}
                              >
                                {t.cliente_nombre
                                  ? `${t.cliente_nombre} ${t.cliente_apellido || ""}`
                                  : "Cliente Externo"}
                              </b>
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--merco-muted)",
                                  fontSize: "11px",
                                }}
                              >
                                Cédula: {t.cliente_cedula || "—"}
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: "var(--merco-muted)" }}>
                              N/A
                            </span>
                          )}
                        </td>
                        <td style={{ maxWidth: 180 }}>
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.str_asunto}
                          </div>
                        </td>
                        <td>{t.departamento_nombre || "—"}</td>
                        <td>{t.prioridad_nombre || "—"}</td>
                        <td>
                          {t.asignado_nombre
                            ? `${t.asignado_nombre} ${t.asignado_apellido || ""}`
                            : "Sin asignar"}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.created_at)}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.dmt_fecha_vencimiento_sla)}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.dmt_fecha_cierre)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {t.int_sla ? `${t.int_sla} hrs` : "—"}
                        </td>
                        <td>{t.estatus_nombre || "En Proceso"}</td>
                        <td>
                          <span className="tag" style={{ fontSize: 11 }}>
                            {t.tiempo_resolucion || "En curso"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
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
            <div>
              <span>
                Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de{" "}
                <b>{ticketsFiltrados.length}</b> registros
              </span>
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
        esTicketBloqueado={esTicketBloqueado}
        handleGuardarCambiosTicket={handleGuardarCambiosTicket}
        copiarTextoClipboard={copiarTextoClipboard}
        filtroStyle={filtroStyle}
      />
    </SystemLayout>
  );
}
