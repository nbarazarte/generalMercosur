import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";
import { useNavigate } from "react-router-dom";
import axiosTickets from "../../utils/axiosTickets";

export default function CasosTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Catálogos y filtros
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  const [canales, setCanales] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposTicket, setTiposTicket] = useState([]);
  const [listaEstatus, setListaEstatus] = useState([]);

  // Estados de Filtros de la UI
  const [fBuscar, setFBuscar] = useState("");
  const [fTipoTicket, setFTipoTicket] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrioridad, setFPrioridad] = useState("");
  const [fCanal, setFCanal] = useState("");
  const [fDepartamento, setFDepartamento] = useState("");
  const [fAgente, setFAgente] = useState("");

  // Filtro unificado de fecha, hora y minutos
  const [fTipoFecha, setFTipoFecha] = useState(""); // "creacion", "vencimiento", "cierre"
  const [fFechaCalendario, setFFechaCalendario] = useState(""); // "YYYY-MM-DD"
  const [fHora, setFHora] = useState(""); // "HH"
  const [fMinuto, setFMinuto] = useState(""); // "mm"

  // Estado para el Modal de Detalle / Respuesta
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [nuevoEstatusId, setNuevoEstatusId] = useState("");
  const [nuevoAsignadoId, setNuevoAsignadoId] = useState("");
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [toast, setToast] = useState(null);

  // Estilo unificado para todos los controles e inputs
  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchCatalogosYTickets();
  }, []);

  const fetchCatalogosYTickets = async () => {
    try {
      setLoading(true);
      const [resMaestros, resDeptUsers, resTickets] = await Promise.all([
        axiosTickets.get("/datos-maestros"),
        axiosTickets.get("/departamentos-usuarios"),
        axiosTickets.get("/listar"),
      ]);

      if (resMaestros.data.success) {
        setCanales(resMaestros.data.canales || []);
        setPrioridades(resMaestros.data.prioridades || []);
        setTiposTicket(resMaestros.data.tipoTicket || []);
        setListaEstatus(resMaestros.data.estatus || []);
      }

      if (resDeptUsers.data.success) {
        setListaDepartamentos(resDeptUsers.data.departamentos || []);
        setListaUsuarios(resDeptUsers.data.usuarios || []);
      }

      if (resTickets.data.success) {
        setTickets(resTickets.data.tickets || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast("Error al cargar los casos de tickets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fDepartamento) {
      const filtrados = listaUsuarios.filter(
        (u) => Number(u.departamento_id) === Number(fDepartamento),
      );
      setEmpleadosFiltrados(filtrados);
    } else {
      setEmpleadosFiltrados(listaUsuarios);
    }
    setFAgente("");
  }, [fDepartamento, listaUsuarios]);

  const esFiltroInterno = useMemo(() => {
    if (!fTipoTicket) return false;
    const seleccionado = tiposTicket.find(
      (t) => Number(t.id) === Number(fTipoTicket),
    );
    return seleccionado
      ? seleccionado.str_nombre.toLowerCase().includes("interno")
      : false;
  }, [fTipoTicket, tiposTicket]);

  useEffect(() => {
    if (esFiltroInterno) {
      setFCanal("");
    }
  }, [esFiltroInterno]);

  const limpiarFiltros = () => {
    setFBuscar("");
    setFTipoTicket("");
    setFEstado("");
    setFPrioridad("");
    setFCanal("");
    setFDepartamento("");
    setFAgente("");
    setFTipoFecha("");
    setFFechaCalendario("");
    setFHora("");
    setFMinuto("");
  };

  const handleGuardarCambiosTicket = async (e) => {
    e.preventDefault();
    if (!ticketSeleccionado) return;

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
          str_descripcion_respuesta: respuestaTexto,
        },
      );

      if (response.data.success) {
        showToast("Ticket actualizado exitosamente.", "success");
        setTicketSeleccionado(null);
        setRespuestaTexto("");
        fetchCatalogosYTickets();
      }
    } catch (error) {
      console.error("Error al actualizar ticket:", error);
      showToast("Error al guardar los cambios del ticket.", "error");
    }
  };

  const abrirDetalle = (ticket) => {
    setTicketSeleccionado(ticket);
    setNuevoEstatusId(ticket.estatus_id ? String(ticket.estatus_id) : "");
    setNuevoAsignadoId(
      ticket.usuario_asignado_id ? String(ticket.usuario_asignado_id) : "",
    );
    setRespuestaTexto("");
  };

  const esTicketDetalleInterno = useMemo(() => {
    if (!ticketSeleccionado) return false;
    return ticketSeleccionado.tipo_ticket?.toLowerCase().includes("interno");
  }, [ticketSeleccionado]);

  // Validar si el ticket seleccionado está cerrado
  const esTicketCerrado = useMemo(() => {
    if (!ticketSeleccionado) return false;
    const estatusStr = (ticketSeleccionado.estatus_nombre || "").toLowerCase();
    return estatusStr.includes("cerrado");
  }, [ticketSeleccionado]);

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (fTipoTicket && Number(t.tipo_ticket_id) !== Number(fTipoTicket))
        return false;
      if (fEstado && Number(t.estatus_id) !== Number(fEstado)) return false;
      if (fPrioridad && Number(t.prioridad_id) !== Number(fPrioridad))
        return false;
      if (!esFiltroInterno && fCanal && Number(t.canal_id) !== Number(fCanal))
        return false;
      if (fDepartamento && Number(t.departamento_id) !== Number(fDepartamento))
        return false;
      if (fAgente && Number(t.usuario_asignado_id) !== Number(fAgente))
        return false;

      // Filtro unificado de fecha, hora y minutos
      if (fTipoFecha && fFechaCalendario) {
        let fechaTarget = null;
        if (fTipoFecha === "creacion") fechaTarget = t.created_at;
        if (fTipoFecha === "vencimiento")
          fechaTarget = t.dmt_fecha_vencimiento_sla;
        if (fTipoFecha === "cierre") fechaTarget = t.dmt_fecha_cierre;

        if (!fechaTarget) return false;

        const dTicket = new Date(fechaTarget);
        const [anio, mes, dia] = fFechaCalendario.split("-").map(Number);

        if (
          dTicket.getFullYear() !== anio ||
          dTicket.getMonth() + 1 !== mes ||
          dTicket.getDate() !== dia
        ) {
          return false;
        }

        if (fHora !== "") {
          if (dTicket.getHours() !== Number(fHora)) return false;
        }

        if (fMinuto !== "") {
          if (dTicket.getMinutes() !== Number(fMinuto)) return false;
        }
      }

      if (fBuscar) {
        const q = fBuscar.toLowerCase().trim();
        const texto =
          `${t.str_ticket} ${t.cliente_nombre || ""} ${t.cliente_cedula || ""} ${t.str_cedula_cliente || ""} ${t.str_correo_cliente || ""} ${t.creador_nombre || ""} ${t.str_asunto} ${t.str_descripcion}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [
    tickets,
    fBuscar,
    fTipoTicket,
    fEstado,
    fPrioridad,
    fCanal,
    fDepartamento,
    fAgente,
    fTipoFecha,
    fFechaCalendario,
    fHora,
    fMinuto,
    esFiltroInterno,
  ]);

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
        {/* BARRA DE FILTROS */}
        <div
          className="ma-toolbar"
          style={{
            marginTop: 0,
            flexDirection: "column",
            alignItems: "stretch",
            gap: "12px",
          }}
        >
          {/* FILA 1: Selects y Filtros de Fecha Unificados */}
          <div
            className="ma-filters"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <select
              value={fTipoTicket}
              onChange={(e) => setFTipoTicket(e.target.value)}
              style={filtroStyle}
            >
              <option value="">Todos los tickets</option>
              {tiposTicket.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.str_nombre}
                </option>
              ))}
            </select>

            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value)}
              style={filtroStyle}
            >
              <option value="">Todos los estatus</option>
              {listaEstatus.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.str_nombre}
                </option>
              ))}
            </select>

            <select
              value={fDepartamento}
              onChange={(e) => setFDepartamento(e.target.value)}
              style={filtroStyle}
            >
              <option value="">Todos los departamentos</option>
              {listaDepartamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.str_nombre}
                </option>
              ))}
            </select>

            <select
              value={fAgente}
              onChange={(e) => setFAgente(e.target.value)}
              style={filtroStyle}
            >
              <option value="">Asignado a</option>
              {empleadosFiltrados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.str_nombre} {emp.str_apellido}
                </option>
              ))}
            </select>

            <select
              value={fPrioridad}
              onChange={(e) => setFPrioridad(e.target.value)}
              style={filtroStyle}
            >
              <option value="">Todas las prioridades</option>
              {prioridades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.str_nombre}
                </option>
              ))}
            </select>

            {!esFiltroInterno && (
              <select
                value={fCanal}
                onChange={(e) => setFCanal(e.target.value)}
                style={filtroStyle}
              >
                <option value="">Todos los canales</option>
                {canales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.str_nombre}
                  </option>
                ))}
              </select>
            )}

            {/* SECCIÓN DE FECHA, HORA Y MINUTOS UNIFICADA */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <select
                value={fTipoFecha}
                onChange={(e) => {
                  setFTipoFecha(e.target.value);
                  if (!e.target.value) {
                    setFFechaCalendario("");
                    setFHora("");
                    setFMinuto("");
                  }
                }}
                style={filtroStyle}
              >
                <option value="">Filtrar por</option>
                <option value="creacion">Fecha de creación</option>
                <option value="vencimiento">Fecha de vencimiento</option>
                <option value="cierre">Fecha de cierre</option>
              </select>

              <input
                type="date"
                value={fFechaCalendario}
                disabled={!fTipoFecha}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setFFechaCalendario(e.target.value);
                  if (!e.target.value) {
                    setFHora("");
                    setFMinuto("");
                  }
                }}
                style={{
                  ...filtroStyle,
                  opacity: fTipoFecha ? 1 : 0.6,
                }}
              />

              <select
                value={fHora}
                disabled={!fFechaCalendario}
                onChange={(e) => {
                  setFHora(e.target.value);
                  if (!e.target.value) setFMinuto("");
                }}
                style={{
                  ...filtroStyle,
                  opacity: fFechaCalendario ? 1 : 0.6,
                }}
              >
                <option value="">Hora</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}h
                  </option>
                ))}
              </select>

              <span>:</span>

              <select
                value={fMinuto}
                disabled={!fFechaCalendario || fHora === ""}
                onChange={(e) => setFMinuto(e.target.value)}
                style={{
                  ...filtroStyle,
                  opacity: fFechaCalendario && fHora !== "" ? 1 : 0.6,
                }}
              >
                <option value="">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}m
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FILA 2: Input de Búsqueda y Botón Limpiar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "1px solid var(--merco-border)",
              paddingTop: "10px",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <DynamicIcon
                name="FiSearch"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.6,
                }}
              />
              <input
                type="text"
                placeholder="Buscar por N° Ticket, cédula, correo, solicitante o asunto"
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  ...filtroStyle,
                  width: "100%",
                  paddingLeft: "36px",
                }}
              />
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={limpiarFiltros}
              style={{ whiteSpace: "nowrap" }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* TABLA DE CASOS / TICKETS */}
        <div className="ma-card" style={{ marginTop: 15 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>TICKET</th>
                  <th>TIPO</th>
                  <th>CANAL</th>
                  <th>CLIENTE / SOLICITANTE</th>
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
                      colSpan="14"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Cargando tickets...
                    </td>
                  </tr>
                ) : ticketsFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="14"
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
                  ticketsFiltrados.map((t) => {
                    const tipoLower = (t.tipo_ticket || "").toLowerCase();
                    const esExterno =
                      tipoLower.includes("externo") ||
                      tipoLower.includes("app");

                    let estiloTipo = {
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#3b82f6",
                    };
                    if (tipoLower.includes("interno")) {
                      estiloTipo = {
                        background: "rgba(147, 51, 234, 0.1)",
                        color: "#9333ea",
                      };
                    }

                    const prioridadLower = (
                      t.prioridad_nombre || ""
                    ).toLowerCase();
                    let estiloPrioridad = {
                      background: "rgba(108, 117, 125, 0.1)",
                      color: "#6c757d",
                    };

                    if (
                      prioridadLower.includes("alta") ||
                      prioridadLower.includes("urgente") ||
                      prioridadLower.includes("crítica")
                    ) {
                      estiloPrioridad = {
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                      };
                    } else if (prioridadLower.includes("media")) {
                      estiloPrioridad = {
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#f59e0b",
                      };
                    } else if (prioridadLower.includes("baja")) {
                      estiloPrioridad = {
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                      };
                    }

                    const estatusLower = (t.estatus_nombre || "").toLowerCase();
                    let estiloEstatus = {
                      background: "rgba(47, 111, 237, 0.1)",
                      color: "var(--merco-blue)",
                    };

                    if (estatusLower.includes("en proceso")) {
                      estiloEstatus = {
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#3b82f6",
                      };
                    } else if (estatusLower.includes("pendiente de usuario")) {
                      estiloEstatus = {
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#f59e0b",
                      };
                    } else if (estatusLower.includes("pendiente de terceros")) {
                      estiloEstatus = {
                        background: "rgba(168, 85, 247, 0.1)",
                        color: "#a855f7",
                      };
                    } else if (estatusLower.includes("en aprobación")) {
                      estiloEstatus = {
                        background: "rgba(236, 72, 153, 0.1)",
                        color: "#ec4899",
                      };
                    } else if (estatusLower.includes("resuelto")) {
                      estiloEstatus = {
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                      };
                    } else if (estatusLower.includes("cerrado")) {
                      estiloEstatus = {
                        background: "rgba(107, 114, 128, 0.1)",
                        color: "#6b7280",
                      };
                    } else if (estatusLower.includes("cancelado")) {
                      estiloEstatus = {
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                      };
                    }

                    const obtenerPrimerNombreApellido = (
                      nombreCompleto,
                      apellidoCompleto,
                    ) => {
                      const primerNombre =
                        (nombreCompleto || "").trim().split(" ")[0] || "";
                      const primerApellido =
                        (apellidoCompleto || "").trim().split(" ")[0] || "";
                      const resultado =
                        `${primerNombre} ${primerApellido}`.trim();
                      return resultado || "—";
                    };

                    const solicitanteNombre = t.cliente_nombre
                      ? t.cliente_nombre
                      : t.creador_nombre;
                    const solicitanteApellido = t.cliente_apellido
                      ? t.cliente_apellido
                      : t.creador_apellido;
                    const nombreClienteCorto = obtenerPrimerNombreApellido(
                      solicitanteNombre,
                      solicitanteApellido,
                    );

                    const nombreCreadorCorto = obtenerPrimerNombreApellido(
                      t.creador_nombre,
                      t.creador_apellido,
                    );

                    const nombreAsignadoCorto = obtenerPrimerNombreApellido(
                      t.asignado_nombre,
                      t.asignado_apellido,
                    );

                    return (
                      <tr
                        key={t.id}
                        onClick={() => abrirDetalle(t)}
                        style={{ fontSize: "12px", cursor: "pointer" }}
                        title="Haz clic para ver detalles"
                      >
                        <td>
                          <b>{t.str_ticket}</b>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                              ...estiloTipo,
                            }}
                          >
                            {t.tipo_ticket || "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="tag"
                            style={{
                              fontSize: 11,
                              background: "rgba(14, 165, 233, 0.1)",
                              color: "#0ea5e9",
                            }}
                          >
                            {t.canal_nombre || "—"}
                          </span>
                        </td>
                        <td>
                          {esExterno ? (
                            <div>
                              <div>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--merco-muted)",
                                  }}
                                >
                                  Cliente:
                                </span>{" "}
                                <b
                                  style={{
                                    color: "var(--merco-accent, #f95700)",
                                  }}
                                >
                                  {t.str_cedula_cliente || "—"}
                                </b>
                                <small
                                  style={{
                                    display: "block",
                                    color: "var(--merco-muted)",
                                    fontSize: "11px",
                                  }}
                                >
                                  {t.str_correo_cliente || "—"}
                                </small>
                              </div>
                              <div
                                style={{
                                  marginTop: "4px",
                                  paddingTop: "4px",
                                  borderTop: "1px dashed var(--merco-border)",
                                  fontSize: "11px",
                                  color: "var(--merco-muted)",
                                }}
                              >
                                <span>
                                  Solicitante: <b>{nombreCreadorCorto}</b>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <b>{nombreClienteCorto}</b>
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--merco-muted)",
                                  fontSize: "11px",
                                }}
                              >
                                {t.cliente_cedula || "Interno"}
                              </small>
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: 180 }}>
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              width: "100%",
                            }}
                            title={t.str_asunto}
                          >
                            {t.str_asunto}
                          </div>
                        </td>

                        <td>{t.departamento_nombre || "—"}</td>
                        <td>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                              ...estiloPrioridad,
                            }}
                          >
                            {t.prioridad_nombre || "—"}
                          </span>
                        </td>
                        <td>
                          {nombreAsignadoCorto === "—"
                            ? "Sin asignar"
                            : nombreAsignadoCorto}
                        </td>
                        {/* Creación */}
                        <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                          {new Date(t.created_at).toLocaleString("es-VE")}
                        </td>
                        {/* Vencimiento */}
                        <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                          {t.dmt_fecha_vencimiento_sla
                            ? new Date(
                                t.dmt_fecha_vencimiento_sla,
                              ).toLocaleString("es-VE")
                            : "—"}
                        </td>
                        {/* Cierre */}
                        <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                          {t.dmt_fecha_cierre
                            ? new Date(t.dmt_fecha_cierre).toLocaleString(
                                "es-VE",
                              )
                            : "—"}
                        </td>
                        {/* SLA */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            className="tag"
                            style={{
                              fontSize: 11,
                              background: "rgba(245, 158, 11, 0.1)",
                              color: "#f59e0b",
                              fontWeight: 600,
                            }}
                          >
                            {t.int_sla ? `${t.int_sla} hrs` : "—"}
                          </span>
                        </td>
                        {/* Estado antes de Duración */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                              ...estiloEstatus,
                            }}
                          >
                            {t.estatus_nombre || "En Proceso"}
                          </span>
                        </td>
                        {/* Duración */}
                        <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                          <span
                            className="tag"
                            style={{
                              fontSize: 11,
                              background: t.dmt_fecha_cierre
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                              color: t.dmt_fecha_cierre ? "#10b981" : "#6b7280",
                              fontWeight: 600,
                            }}
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
        </div>
      </div>

      {/* MODAL DE DETALLE, RESPUESTA Y CAMBIO DE ESTATUS */}
      {ticketSeleccionado &&
        ReactDOM.createPortal(
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
                maxWidth: 850,
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
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <h3 style={{ margin: 0 }}>
                    Ticket: {ticketSeleccionado.str_ticket}
                  </h3>
                  {esTicketCerrado && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(107, 114, 128, 0.1)",
                        color: "#6b7280",
                      }}
                    >
                      Cerrado (Solo lectura)
                    </span>
                  )}
                </div>
                <button
                  className="btn-icon"
                  onClick={() => setTicketSeleccionado(null)}
                >
                  <DynamicIcon name="FiX" />
                </button>
              </div>

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
                  <b>Asunto:</b> {ticketSeleccionado.str_asunto}
                </div>
                <div>
                  <b>Tipo:</b> {ticketSeleccionado.tipo_ticket}
                </div>
                <div>
                  <b>Departamento:</b> {ticketSeleccionado.departamento_nombre}
                </div>
                <div>
                  <b>Categoría:</b> {ticketSeleccionado.categoria_nombre}
                </div>

                {/* Validación para mostrar Cédula y Correo del Cliente si es Externo */}
                {ticketSeleccionado.tipo_ticket
                  ?.toLowerCase()
                  .includes("externo") ||
                ticketSeleccionado.tipo_ticket
                  ?.toLowerCase()
                  .includes("app") ? (
                  <>
                    <div>
                      <b style={{ color: "var(--merco-accent, #f95700)" }}>
                        Cédula del Cliente:
                      </b>{" "}
                      {ticketSeleccionado.str_cedula_cliente || "—"}
                    </div>
                    <div>
                      <b style={{ color: "var(--merco-accent, #f95700)" }}>
                        Correo del Cliente:
                      </b>{" "}
                      {ticketSeleccionado.str_correo_cliente || "—"}
                    </div>
                  </>
                ) : null}

                <div>
                  <b>Prioridad:</b> {ticketSeleccionado.prioridad_nombre}
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
                  <b>F. Vencimiento:</b>{" "}
                  {ticketSeleccionado.dmt_fecha_vencimiento_sla
                    ? new Date(
                        ticketSeleccionado.dmt_fecha_vencimiento_sla,
                      ).toLocaleString("es-VE")
                    : "—"}
                </div>

                {!esTicketDetalleInterno && (
                  <div>
                    <b>Canal:</b> {ticketSeleccionado.canal_nombre || "N/A"}
                  </div>
                )}
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
                  Descripción:
                </label>
                <div
                  style={{
                    padding: 10,
                    border: "1px solid var(--merco-border)",
                    borderRadius: 6,
                    fontSize: 13,
                    background: "var(--merco-bg-card)",
                  }}
                >
                  {ticketSeleccionado.str_descripcion}
                </div>
              </div>

              <form onSubmit={handleGuardarCambiosTicket}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Cambiar Estatus
                    </label>
                    <select
                      value={nuevoEstatusId}
                      disabled={esTicketCerrado}
                      onChange={(e) => setNuevoEstatusId(e.target.value)}
                      style={{
                        ...filtroStyle,
                        width: "100%",
                        opacity: esTicketCerrado ? 0.7 : 1,
                        cursor: esTicketCerrado ? "not-allowed" : "pointer",
                      }}
                    >
                      {listaEstatus.map((est) => (
                        <option key={est.id} value={String(est.id)}>
                          {est.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Asignar a:
                    </label>
                    <select
                      key={`select-asignado-${ticketSeleccionado?.id || "modal"}`}
                      defaultValue={
                        ticketSeleccionado?.usuario_asignado_id
                          ? String(ticketSeleccionado.usuario_asignado_id)
                          : ""
                      }
                      disabled={esTicketCerrado}
                      onChange={(e) => {
                        setNuevoAsignadoId(e.target.value);
                      }}
                      style={{
                        ...filtroStyle,
                        width: "100%",
                        opacity: esTicketCerrado ? 0.7 : 1,
                        cursor: esTicketCerrado ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="">Sin asignar</option>
                      {listaUsuarios.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.str_nombre} {u.str_apellido}
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
                    Responder
                  </label>
                  <textarea
                    rows={3}
                    value={respuestaTexto}
                    disabled={esTicketCerrado}
                    onChange={(e) => setRespuestaTexto(e.target.value)}
                    placeholder={
                      esTicketCerrado
                        ? "Este ticket está cerrado y no admite respuestas."
                        : "Escriba una respuesta o avance para este ticket..."
                    }
                    style={{
                      ...filtroStyle,
                      width: "100%",
                      resize: "vertical",
                      opacity: esTicketCerrado ? 0.7 : 1,
                      cursor: esTicketCerrado ? "not-allowed" : "text",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setTicketSeleccionado(null)}
                  >
                    {esTicketCerrado ? "Cerrar" : "Cancelar"}
                  </button>
                  {!esTicketCerrado && (
                    <button type="submit" className="btn btn-primary">
                      <DynamicIcon name="FiSave" /> Guardar Cambios
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </SystemLayout>
  );
}
