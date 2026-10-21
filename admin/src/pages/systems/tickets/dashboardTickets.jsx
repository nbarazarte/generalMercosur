import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SystemLayout from "../../layouts/SystemLayout";
import { useDashboardTickets } from "./hooks/useDashboardTickets";
import { TicketDashboardFiltros } from "./components/TicketDashboardFiltros";
import { KPICard } from "./components/charts/KPICard";
import { UltimosTicketsTable } from "./components/charts/UltimosTicketsTable";
import { ChartDoughnutEstado } from "./components/charts/ChartDoughnutEstado";
import { ChartBarCategoria } from "./components/charts/ChartBarCategoria";
import { ChartBarAnalistaCreador } from "./components/charts/ChartBarAnalistaCreador";
import { ChartBarCasosCerradosAnalista } from "./components/charts/ChartBarCasosCerradosAnalista";
import { TicketDetalleModal } from "../../../pages/systems/tickets/components/TicketDetalleModal";

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark",
      );
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function DashboardTickets() {
  const navigate = useNavigate();
  const isDark = useIsDarkMode();
  const {
    loading,
    kpis,
    ticketsPorCategoria,
    distribucionEstados,
    ultimosTickets,
    casosPorAnalista,
    casosCerradosPorAnalista,
    filtros,
    setFiltros,
    limpiarFiltros,
    canales,
    prioridades,
    tiposTicket,
    listaEstatus,
    listaDepartamentos,
    categorias,
    toast,
    currentUserId,
    currentUserRole,

    // Métodos y estados expuestos desde el hook para el Modal
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
    usuariosModalFiltrados,
    estatusModalDisponibles,
    esTicketBloqueado,
    editorRespuesta,
    handleEditorRespuestaChange,
    abrirDetalle,
    handleGuardarCambiosTicket,
    copiarTextoClipboard,
  } = useDashboardTickets();

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Dashboard">
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

      <div className="ma-content" style={{ padding: "10px 0" }}>
        {/* BARRA DE FILTROS SUPERIOR */}
        <TicketDashboardFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          limpiarFiltros={limpiarFiltros}
          tiposTicket={tiposTicket}
          categorias={categorias}
          listaEstatus={listaEstatus}
          listaDepartamentos={listaDepartamentos}
          prioridades={prioridades}
          canales={canales}
        />

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
          <KPICard
            icon="HiTicket"
            val={loading ? "..." : kpis.total_tickets || 0}
            label="Total Tickets"
            iconColor="#3B82F6"
          />
          <KPICard
            icon="FiClock"
            val={loading ? "..." : kpis.en_proceso || 0}
            label="En Progreso"
            iconColor="#3B82F6"
          />
          <KPICard
            icon="FiAlertCircle"
            val={loading ? "..." : kpis.en_aprobacion || 0}
            label="En Aprobación"
            iconColor="#EC4899"
          />
          <KPICard
            icon="FiUser"
            val={loading ? "..." : kpis.pendiente_usuario || 0}
            label="Pendiente de Usuario"
            iconColor="#F59E0B"
          />
          <KPICard
            icon="FaUserClock"
            val={loading ? "..." : kpis.espera_proveedor || 0}
            label="En Espera Proveedor"
            iconColor="#A855F7"
          />
          <KPICard
            icon="FiAlertTriangle"
            val={loading ? "..." : kpis.vencido || 0}
            label="Vencidos"
            iconColor="#DC2626"
          />
          <KPICard
            icon="FiArchive"
            val={loading ? "..." : kpis.cerrado || 0}
            label="Cerrados"
            iconColor="#059669"
          />
          <KPICard
            icon="FiXCircle"
            val={loading ? "..." : kpis.cancelado || 0}
            label="Cancelados"
            iconColor="#0EA5E9"
          />
        </div>

        {/* FILA 1 DE GRÁFICOS */}
        <div className="dashboard-grid-2col">
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Volumen de Casos por Categoría
              </span>
            </div>
            <ChartBarCategoria
              data={ticketsPorCategoria}
              isDark={isDark}
              loading={loading}
            />
          </div>

          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Estatus de Tickets
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                distribución actual
              </small>
            </div>
            <ChartDoughnutEstado
              data={distribucionEstados}
              isDark={isDark}
              loading={loading}
            />
          </div>
        </div>

        {/* FILA 2: Tickets recientes y gráficos de analistas */}
        <div className="dashboard-grid-2col" style={{ marginTop: 16 }}>
          <UltimosTicketsTable
            loading={loading}
            ultimosTickets={ultimosTickets}
            abrirDetalle={abrirDetalle}
          />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div className="ma-card" style={{ padding: 18 }}>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "var(--merco-text)",
                  }}
                >
                  Casos creados por analista
                </span>
              </div>
              <ChartBarAnalistaCreador
                data={casosPorAnalista}
                isDark={isDark}
                loading={loading}
              />
            </div>

            <div className="ma-card" style={{ padding: 18 }}>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "var(--merco-text)",
                  }}
                >
                  Casos cerrados por analista
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  rendimiento de cierre
                </small>
              </div>
              <ChartBarCasosCerradosAnalista
                data={casosCerradosPorAnalista}
                isDark={isDark}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DEL MODAL DE DETALLE CON BLOCKNOTE */}
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
        editorRespuesta={editorRespuesta}
        handleEditorRespuestaChange={handleEditorRespuestaChange}
        isDarkMode={isDark}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </SystemLayout>
  );
}
