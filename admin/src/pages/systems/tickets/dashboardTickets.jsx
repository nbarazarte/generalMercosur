import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useTicketsDashboard } from "./hooks/useTicketsDashboard";
import { TicketDetalleModal } from "../../../pages/systems/tickets/components/TicketDetalleModal";
import axiosTickets from "../../../../src/api/axiosTickets";
import { useCreateBlockNote } from "@blocknote/react";
import { es } from "@blocknote/core/locales";

function obtenerColorEstatus(nombreEstatus) {
  const est = (nombreEstatus || "").toLowerCase();
  if (est.includes("en proceso")) return "#3B82F6";
  if (est.includes("pendiente de usuario")) return "#F59E0B";
  if (est.includes("en espera proveedor")) return "#A855F7";
  if (est.includes("en aprobación")) return "#EC4899";
  if (est.includes("vencido") || est.includes("crítico")) return "#DC2626";
  if (est.includes("cerrado")) return "#059669";
  if (est.includes("cancelado")) return "#0EA5E9";
  return "#64748B";
}

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
    recargarDatos,
  } = useTicketsDashboard();

  // Estados locales para el modal de detalle de ticket
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [nuevoEstatusId, setNuevoEstatusId] = useState("");
  const [nuevoAsignadoId, setNuevoAsignadoId] = useState("");
  const [nuevoPrioridadId, setNuevoPrioridadId] = useState("");
  const [modalDepartamentoId, setModalDepartamentoId] = useState("");
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [tabActiva, setTabActiva] = useState("descripcion");
  const [bitacoraList, setBitacoraList] = useState([]);
  const [errorModal, setErrorModal] = useState("");
  const [listaUsuariosModal, setListaUsuariosModal] = useState([]);

  // Configuración de BlockNote para la respuesta
  const uploadFileForReply = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const editorRespuesta = useCreateBlockNote(
    { uploadFile: uploadFileForReply, dictionary: es },
    [],
  );

  const handleEditorRespuestaChange = async () => {
    if (!editorRespuesta) return;
    try {
      const html = await editorRespuesta.blocksToHTMLLossy(
        editorRespuesta.document,
      );
      setRespuestaTexto(html);
      if (errorModal) setErrorModal("");
    } catch (err) {
      console.error("Error al convertir bloques de respuesta a HTML:", err);
    }
  };

  // Cargar usuarios para el modal al montar el dashboard
  useEffect(() => {
    const fetchUsuariosModal = async () => {
      try {
        const res = await axiosTickets.get("/departamentos-usuarios");
        if (res.data && res.data.success) {
          setListaUsuariosModal(res.data.usuarios || []);
        }
      } catch (err) {
        console.error("Error al cargar usuarios para el modal:", err);
      }
    };
    fetchUsuariosModal();
  }, []);

  const usuariosModalFiltrados = useMemo(() => {
    if (!modalDepartamentoId) return listaUsuariosModal;
    return listaUsuariosModal.filter(
      (u) => Number(u.departamento_id) === Number(modalDepartamentoId),
    );
  }, [modalDepartamentoId, listaUsuariosModal]);

  const estatusModalDisponibles = useMemo(() => {
    return listaEstatus.filter(
      (est) => !(est.str_nombre || "").toLowerCase().includes("vencido"),
    );
  }, [listaEstatus]);

  const esTicketBloqueado = useMemo(() => {
    if (!ticketSeleccionado) return false;
    const estatusStr = (ticketSeleccionado.estatus_nombre || "").toLowerCase();
    return (
      estatusStr.includes("cerrado") ||
      estatusStr.includes("cancelado") ||
      estatusStr.includes("vencido")
    );
  }, [ticketSeleccionado]);

  // Abrir detalle del ticket y cargar su bitácora
  const abrirDetalle = async (ticketMinimo) => {
    setTicketSeleccionado(ticketMinimo);
    setNuevoEstatusId(
      ticketMinimo.estatus_id ? String(ticketMinimo.estatus_id) : "",
    );
    setNuevoAsignadoId(
      ticketMinimo.usuario_asignado_id
        ? String(ticketMinimo.usuario_asignado_id)
        : "",
    );
    setNuevoPrioridadId(
      ticketMinimo.prioridad_id ? String(ticketMinimo.prioridad_id) : "",
    );
    setModalDepartamentoId(
      ticketMinimo.departamento_id ? String(ticketMinimo.departamento_id) : "",
    );
    setRespuestaTexto("");
    setErrorModal("");
    setTabActiva("descripcion");

    if (editorRespuesta) {
      try {
        await editorRespuesta.replaceBlocks(editorRespuesta.document, [
          { type: "paragraph", content: "" },
        ]);
      } catch (err) {
        console.error("Error al limpiar editor de respuesta:", err);
      }
    }

    try {
      const res = await axiosTickets.get("/listar");
      if (res.data && res.data.success) {
        const ticketCompleto = (res.data.tickets || []).find(
          (t) => Number(t.id) === Number(ticketMinimo.id),
        );
        if (ticketCompleto) {
          setTicketSeleccionado(ticketCompleto);
          setNuevoEstatusId(
            ticketCompleto.estatus_id ? String(ticketCompleto.estatus_id) : "",
          );
          setNuevoAsignadoId(
            ticketCompleto.usuario_asignado_id
              ? String(ticketCompleto.usuario_asignado_id)
              : "",
          );
          setNuevoPrioridadId(
            ticketCompleto.prioridad_id
              ? String(ticketCompleto.prioridad_id)
              : "",
          );
          setModalDepartamentoId(
            ticketCompleto.departamento_id
              ? String(ticketCompleto.departamento_id)
              : "",
          );
        }
      }
    } catch {
      // Mantiene el ticket mínimo si falla la consulta detallada
    }

    try {
      const resBit = await axiosTickets.get(`/bitacora/${ticketMinimo.id}`);
      if (resBit.data.success) setBitacoraList(resBit.data.bitacora || []);
    } catch {
      setBitacoraList([]);
    }
  };

  const handleGuardarCambiosTicket = async (e) => {
    e.preventDefault();
    if (!ticketSeleccionado) return;
    const estatusCambiado =
      Number(nuevoEstatusId) !== Number(ticketSeleccionado.estatus_id);

    const htmlRespuesta = editorRespuesta
      ? await editorRespuesta.blocksToHTMLLossy(editorRespuesta.document)
      : respuestaTexto;
    const textoPlanoRespuesta = htmlRespuesta.replace(/<[^>]*>/g, "").trim();

    if (
      estatusCambiado &&
      (!textoPlanoRespuesta || htmlRespuesta === "<p></p>")
    ) {
      setErrorModal(
        "Debe ingresar una respuesta o avance en la bitácora al cambiar el estatus.",
      );
      return;
    }

    setErrorModal("");
    try {
      const response = await axiosTickets.put(
        `/actualizar/${ticketSeleccionado.id}`,
        {
          estatus_id:
            nuevoEstatusId !== ""
              ? Number(nuevoEstatusId)
              : Number(ticketSeleccionado.estatus_id),
          usuario_asignado_id:
            nuevoAsignadoId !== "" && nuevoAsignadoId !== "null"
              ? Number(nuevoAsignadoId)
              : null,
          departamento_id:
            modalDepartamentoId !== ""
              ? Number(modalDepartamentoId)
              : Number(ticketSeleccionado.departamento_id),
          prioridad_id:
            nuevoPrioridadId !== ""
              ? Number(nuevoPrioridadId)
              : Number(ticketSeleccionado.prioridad_id),
          str_descripcion_respuesta: htmlRespuesta.trim(),
        },
      );

      if (response.data.success) {
        setTicketSeleccionado(null);
        setRespuestaTexto("");
        setErrorModal("");
        if (editorRespuesta) {
          await editorRespuesta.replaceBlocks(editorRespuesta.document, [
            { type: "paragraph", content: "" },
          ]);
        }
        recargarDatos();
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error al guardar los cambios.";
      setErrorModal(mensajeError);
    }
  };

  const copiarTextoClipboard = (e, texto) => {
    e.stopPropagation();
    navigator.clipboard.writeText(texto);
  };

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
        <div
          className="ma-card"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              flex: 1,
            }}
          >
            {/* Tipo de Ticket */}
            <select
              value={filtros.tipo_ticket_id}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  tipo_ticket_id: e.target.value,
                }))
              }
              style={filtroStyle}
            >
              <option value="">Todos los tipos</option>
              {tiposTicket.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.str_nombre}
                </option>
              ))}
            </select>

            {/* Categoría */}
            <select
              value={filtros.categoria_id}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  categoria_id: e.target.value,
                }))
              }
              style={filtroStyle}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.str_nombre}
                </option>
              ))}
            </select>

            {/* Estatus */}
            <select
              value={filtros.estatus_id}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, estatus_id: e.target.value }))
              }
              style={filtroStyle}
            >
              <option value="">Todos los estatus</option>
              {listaEstatus.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.str_nombre}
                </option>
              ))}
            </select>

            {/* Departamento */}
            <select
              value={filtros.departamento_id}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  departamento_id: e.target.value,
                }))
              }
              style={filtroStyle}
            >
              <option value="">Todos los departamentos</option>
              {listaDepartamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.str_nombre}
                </option>
              ))}
            </select>

            {/* Prioridad */}
            <select
              value={filtros.prioridad_id}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  prioridad_id: e.target.value,
                }))
              }
              style={filtroStyle}
            >
              <option value="">Todas las prioridades</option>
              {prioridades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.str_nombre}
                </option>
              ))}
            </select>

            {/* Canal */}
            <select
              value={filtros.canal_id}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, canal_id: e.target.value }))
              }
              style={filtroStyle}
            >
              <option value="">Todos los canales</option>
              {canales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.str_nombre}
                </option>
              ))}
            </select>

            {/* Fechas */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <small style={{ color: "var(--merco-muted)", fontSize: 11 }}>
                Desde:
              </small>
              <input
                type="date"
                value={filtros.creacion_desde}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    creacion_desde: e.target.value,
                  }))
                }
                style={filtroStyle}
              />
              <small style={{ color: "var(--merco-muted)", fontSize: 11 }}>
                Hasta:
              </small>
              <input
                type="date"
                value={filtros.creacion_hasta}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    creacion_hasta: e.target.value,
                  }))
                }
                style={filtroStyle}
              />
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={limpiarFiltros}
            style={{ whiteSpace: "nowrap" }}
          >
            Limpiar Filtros
          </button>
        </div>

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
            label="En Proceso"
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

        {/* FILA 2: Tickets recientes */}
        <div className="dashboard-grid-2col" style={{ marginTop: 16 }}>
          <div
            className="ma-card"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              maxHeight: "750px",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "var(--merco-text)",
                  }}
                >
                  Tickets recientes
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  últimos registros
                </small>
              </div>
            </div>

            <div
              className="ma-table-container"
              style={{ overflowY: "auto", flex: 1 }}
            >
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>TICKET / ASUNTO</th>
                    <th>ESTATUS</th>
                    <th>CLIENTE / SOLICITANTE</th>
                    <th>CREACIÓN</th>
                    <th>CIERRE</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Cargando registros...
                      </td>
                    </tr>
                  ) : ultimosTickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "var(--merco-muted)",
                        }}
                      >
                        No hay tickets recientes con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    ultimosTickets.slice(0, 8).map((t) => {
                      const colorBadge = obtenerColorEstatus(t.estado);
                      return (
                        <tr
                          key={t.id}
                          style={{ cursor: "pointer" }}
                          title="Ver detalle del ticket"
                          onClick={() => abrirDetalle(t)}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-text)",
                                  display: "block",
                                  fontSize: "13px",
                                }}
                              >
                                {t.codigo}
                              </b>
                              <small style={{ color: "var(--merco-muted)" }}>
                                {t.asunto}
                              </small>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 12,
                                fontSize: "11px",
                                fontWeight: 500,
                                background: `${colorBadge}15`,
                                color: colorBadge,
                              }}
                            >
                              ● {t.estado || "N/D"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "var(--merco-text)",
                              fontSize: "13px",
                            }}
                          >
                            {t.solicitante || "Cliente / Usuario"}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "var(--merco-muted)",
                              fontSize: "11px",
                            }}
                          >
                            {t.tiempo}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "var(--merco-muted)",
                              fontSize: "11px",
                            }}
                          >
                            {t.fecha_cierre ? t.fecha_cierre : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
        /* PROPS DE BLOCKNOTE */
        editorRespuesta={editorRespuesta}
        handleEditorRespuestaChange={handleEditorRespuestaChange}
        isDarkMode={isDark}
      />
    </SystemLayout>
  );
}

function KPICard({ icon, val, label, iconColor }) {
  return (
    <div className="ma-stat">
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
            color: iconColor || "var(--merco-muted)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <DynamicIcon name={icon} fallback="FiActivity" />
        </span>
      </div>
      <div className="val">{val}</div>
      <div className="lbl" style={{ marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function ChartDoughnutEstado({ data, isDark, loading }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const labels = data.map((d) => d.estado);
    const values = data.map((d) => d.total);
    const backgroundColors = labels.map((nombre) =>
      obtenerColorEstatus(nombre),
    );

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: textColor } },
        },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : !data || data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 100,
            color: "var(--merco-muted)",
            fontSize: "13px",
          }}
        >
          Sin estatus de tickets con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

function ChartBarCategoria({ data, isDark, loading }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";
    const labels = data.map((d) => d.nombre_categoria);
    const values = data.map((d) => d.total_tickets);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { data: values, backgroundColor: "#c8a45c", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : !data || data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 100,
            color: "var(--merco-muted)",
            fontSize: "13px",
          }}
        >
          Sin volumen de casos por categoría con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

function ChartBarAnalistaCreador({ data, isDark, loading }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";
    const labels = data.map((d) => d.nombre_analista);
    const values = data.map((d) => d.total_tickets);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Casos Creados",
            data: values,
            backgroundColor: "#2f6fed",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : !data || data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 100,
            color: "var(--merco-muted)",
            fontSize: "13px",
          }}
        >
          Sin casos creados por analista con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

function ChartBarCasosCerradosAnalista({ data, isDark, loading }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";
    const labels = data.map((d) => d.nombre_analista);
    const values = data.map((d) => d.tickets_cerrados);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Casos Cerrados",
            data: values,
            backgroundColor: "#059669",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : !data || data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 100,
            color: "var(--merco-muted)",
            fontSize: "13px",
          }}
        >
          Sin casos cerrados con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}
