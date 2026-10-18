import SystemLayout from "../../layouts/SystemLayout";
import { useCasosTickets } from "./hooks/useCasosTickets";
import { TicketsFiltros } from "./components/TicketsFiltros";
import { TicketDetalleModal } from "./components/TicketDetalleModal";
import { DynamicIcon } from "../../../components/IconCatalog";
import formatearFechaHora from "../../../components/formatearFechaHora";

export default function Tickets() {
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
    categorias,
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
    fCategoria,
    setFCategoria,
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
    conteoKpi,
  } = useCasosTickets();

  const tarjetasEstatus = [
    {
      titulo: "Total Tickets",
      valor: ticketsFiltrados.length,
      icono: "HiTicket",
      color: "#3B82F6",
    },
    {
      titulo: "En Proceso",
      valor: conteoKpi["En Proceso"] || 0,
      icono: "FiClock",
      color: "#3B82F6",
    },
    {
      titulo: "En Aprobación",
      valor: conteoKpi["En Aprobación"] || 0,
      icono: "FiAlertCircle",
      color: "#EC4899",
    },
    {
      titulo: "Pendiente de Usuario",
      valor: conteoKpi["Pendiente de Usuario"] || 0,
      icono: "FiUser",
      color: "#F59E0B",
    },
    {
      titulo: "En Espera Proveedor",
      valor: conteoKpi["En Espera Proveedor"] || 0,
      icono: "FaUserClock",
      color: "#A855F7",
    },
    {
      titulo: "Vencidos",
      valor: conteoKpi["Vencido"] || 0,
      icono: "FiAlertTriangle",
      color: "#DC2626",
    },
    {
      titulo: "Cerrados",
      valor: conteoKpi["Cerrado"] || 0,
      icono: "FiArchive",
      color: "#059669",
    },
    {
      titulo: "Cancelados",
      valor: conteoKpi["Cancelado"] || 0,
      icono: "FiXCircle",
      color: "#0EA5E9",
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

  const handlePorPaginaChange = (e) => {
    const nuevoValor = Number(e.target.value);
    setPorPagina(nuevoValor);
    setPaginaActual(1);
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
        {/* TARJETAS KPI */}
        <div
          className="ma-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {tarjetasEstatus.map((item, index) => (
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
                    fontSize: 18,
                    color: item.color,
                    display: "inline-flex",
                  }}
                >
                  <DynamicIcon name={item.icono} fallback="FiFolder" />
                </span>
              </div>
              <div className="val">{item.valor}</div>
              <div className="lbl" style={{ marginTop: 2 }}>
                {item.titulo}
              </div>
            </div>
          ))}
        </div>

        <TicketsFiltros
          fTipoTicket={fTipoTicket}
          setFTipoTicket={setFTipoTicket}
          fEstado={fEstado}
          setFEstado={setFEstado}
          fDepartamento={fDepartamento}
          setFDepartamento={setFDepartamento}
          fCategoria={fCategoria}
          setFCategoria={setFCategoria}
          categorias={categorias}
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

        {/* TABLA DE CASOS */}
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

                    const nombreEstatus = t.estatus_nombre || "En Proceso";
                    const estName = nombreEstatus.toLowerCase();
                    const esCanceladoModal = estName.includes("cancelado");
                    const esRojo =
                      estName.includes("vencido") ||
                      estName.includes("crítico") ||
                      estName.includes("urgente");
                    const esEnProceso = estName.includes("en proceso");
                    const esEnEspera =
                      estName.includes("espera") ||
                      estName.includes("pendiente");

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
                        <td
                          style={{ textAlign: "center", whiteSpace: "nowrap" }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 12px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "rgba(245, 158, 11, 0.18)",
                              color: "#f59e0b",
                            }}
                          >
                            {t.int_sla ? `${t.int_sla} hrs` : "—"}
                          </span>
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
                            {nombreEstatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className="tag"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          >
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
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span>
                Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de{" "}
                <b>{ticketsFiltrados.length}</b> registros
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label htmlFor="porPaginaSelect">Mostrar:</label>
                <select
                  id="porPaginaSelect"
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
