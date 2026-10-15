import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import copy from "copy-to-clipboard";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosTickets from "../../../api/axiosTickets";

export default function CasosTickets() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [fTipoFecha, setFTipoFecha] = useState("");
  const [fFechaCalendario, setFFechaCalendario] = useState("");
  const [fHora, setFHora] = useState("");
  const [fMinuto, setFMinuto] = useState("");

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(5);

  // Estado para el Modal de Detalle / Respuesta
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [nuevoEstatusId, setNuevoEstatusId] = useState("");
  const [nuevoAsignadoId, setNuevoAsignadoId] = useState("");
  const [nuevoPrioridadId, setNuevoPrioridadId] = useState("");
  const [modalDepartamentoId, setModalDepartamentoId] = useState("");
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [tabActiva, setTabActiva] = useState("descripcion");
  const [bitacoraList, setBitacoraList] = useState([]);
  const [errorModal, setErrorModal] = useState("");
  const [toast, setToast] = useState(null);

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

  const copiarTextoClipboard = (e, texto, etiqueta = "Texto") => {
    e.stopPropagation();
    copy(texto);
    showToast(`¡${etiqueta} copiado al portapapeles!`, "success");
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
        return resTickets.data.tickets || [];
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast("Error al cargar los casos de tickets.", "error");
    } finally {
      setLoading(false);
    }
    return [];
  };

  // Efecto que refresca la lista y abre el modal automáticamente al recibir el 'abrirTicket'
  useEffect(() => {
    const ticketIdParam = searchParams.get("abrirTicket");
    if (!ticketIdParam) return;

    const idBuscado = Number(ticketIdParam);

    // Limpiamos la URL inmediatamente para evitar reejecuciones indeseadas
    searchParams.delete("abrirTicket");
    setSearchParams(searchParams, { replace: true });

    // 1. Refrescamos primero la tabla para traer la información más reciente
    fetchCatalogosYTickets().then((listaActualizada) => {
      // 2. Buscamos el ticket en la lista recién obtenida del servidor
      const ticketEncontrado = listaActualizada.find(
        (t) => Number(t.id) === idBuscado,
      );

      if (ticketEncontrado) {
        abrirDetalle(ticketEncontrado);
      } else {
        showToast(
          "No se encontró el ticket o no tienes permisos para verlo.",
          "error",
        );
      }
    });
  }, [searchParams]);

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

  const usuariosModalFiltrados = useMemo(() => {
    if (!modalDepartamentoId) return listaUsuarios;
    return listaUsuarios.filter(
      (u) => Number(u.departamento_id) === Number(modalDepartamentoId),
    );
  }, [modalDepartamentoId, listaUsuarios]);

  const estatusModalDisponibles = useMemo(() => {
    return listaEstatus.filter(
      (est) => !(est.str_nombre || "").toLowerCase().includes("vencido"),
    );
  }, [listaEstatus]);

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

  useEffect(() => {
    setPaginaActual(1);
  }, [
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
  ]);

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

  const exportarExcel = () => {
    if (ticketsFiltrados.length === 0) {
      showToast(
        "No hay registros para exportar con los filtros actuales.",
        "error",
      );
      return;
    }

    const cabeceras = [
      "Ticket",
      "Tipo",
      "Canal",
      "Creado por (Agente)",
      "Cliente / Afectado",
      "Teléfono",
      "Asunto",
      "Departamento",
      "Prioridad",
      "Asignado A",
      "Creación",
      "Vencimiento",
      "Cierre",
      "SLA",
      "Minutos Pausa",
      "Estado",
      "Duración",
    ];

    const filas = ticketsFiltrados.map((t) => {
      const creador =
        `${t.creador_nombre || ""} ${t.creador_apellido || ""}`.trim();
      const cliente = t.cliente_nombre
        ? `${t.cliente_nombre} ${t.cliente_apellido || ""}`.trim()
        : "N/A";
      const asignado = t.asignado_nombre
        ? `${t.asignado_nombre} ${t.asignado_apellido || ""}`.trim()
        : "Sin asignar";

      const formatearFechaPlana = (fechaStr) => {
        if (!fechaStr) return "";
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return "";
        const fecha = d.toLocaleDateString("es-VE");
        const hora = d.toLocaleTimeString("es-VE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return `${fecha} ${hora}`;
      };

      return [
        `"${t.str_ticket || ""}"`,
        `"${t.tipo_ticket || ""}"`,
        `"${t.canal_nombre || ""}"`,
        `"${creador.replace(/"/g, '""')}"`,
        `"${cliente.replace(/"/g, '""')}"`,
        `"${t.cliente_telefono || ""}"`,
        `"${(t.str_asunto || "").replace(/"/g, '""')}"`,
        `"${t.departamento_nombre || ""}"`,
        `"${t.prioridad_nombre || ""}"`,
        `"${asignado.replace(/"/g, '""')}"`,
        `"${formatearFechaPlana(t.created_at)}"`,
        `"${formatearFechaPlana(t.dmt_fecha_vencimiento_sla)}"`,
        `"${formatearFechaPlana(t.dmt_fecha_cierre)}"`,
        `"${t.int_sla ? t.int_sla + " hrs" : ""}"`,
        `"${t.int_minutos_pausa || 0}"`,
        `"${t.estatus_nombre || "En Proceso"}"`,
        `"${t.tiempo_resolucion || "En curso"}"`,
      ];
    });

    const contenidoCSV =
      "\ufeff" +
      [cabeceras.join(";"), ...filas.map((f) => f.join(";"))].join("\n");

    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Reporte_Tickets_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Se han exportado ${ticketsFiltrados.length} registros exitosamente.`,
      "success",
    );
  };

  const handleGuardarCambiosTicket = async (e) => {
    e.preventDefault();
    if (!ticketSeleccionado) return;

    const estatusCambiado =
      Number(nuevoEstatusId) !== Number(ticketSeleccionado.estatus_id);

    if (estatusCambiado && (!respuestaTexto || respuestaTexto.trim() === "")) {
      setErrorModal(
        "Debe ingresar una respuesta o avance en la bitácora al cambiar el estatus del ticket.",
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
          str_descripcion_respuesta: respuestaTexto.trim(),
        },
      );

      if (response.data.success) {
        showToast(
          "Ticket actualizado y bitácora guardada exitosamente.",
          "success",
        );
        setTicketSeleccionado(null);
        setRespuestaTexto("");
        setErrorModal("");
        fetchCatalogosYTickets();
      }
    } catch (error) {
      console.error("Error al actualizar ticket:", error);
      const mensajeError =
        error.response?.data?.error ||
        "Error al guardar los cambios del ticket.";
      setErrorModal(mensajeError);
      showToast(mensajeError, "error");
    }
  };

  const abrirDetalle = async (ticket) => {
    setTicketSeleccionado(ticket);
    setNuevoEstatusId(ticket.estatus_id ? String(ticket.estatus_id) : "");
    setNuevoAsignadoId(
      ticket.usuario_asignado_id ? String(ticket.usuario_asignado_id) : "",
    );
    setNuevoPrioridadId(ticket.prioridad_id ? String(ticket.prioridad_id) : "");
    setModalDepartamentoId(
      ticket.departamento_id ? String(ticket.departamento_id) : "",
    );
    setRespuestaTexto("");
    setErrorModal("");
    setTabActiva("descripcion");

    try {
      const res = await axiosTickets.get(`/bitacora/${ticket.id}`);
      if (res.data.success) {
        setBitacoraList(res.data.bitacora || []);
      }
    } catch (err) {
      console.error("Error al cargar la bitácora:", err);
      setBitacoraList([]);
    }
  };

  const esTicketBloqueado = useMemo(() => {
    if (!ticketSeleccionado) return false;
    const estatusStr = (ticketSeleccionado.estatus_nombre || "").toLowerCase();
    return (
      estatusStr.includes("cerrado") ||
      estatusStr.includes("cancelado") ||
      estatusStr.includes("vencido")
    );
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
          `${t.str_ticket} ${t.creador_nombre || ""} ${t.creador_apellido || ""} ${t.cliente_nombre || ""} ${t.cliente_apellido || ""} ${t.cliente_cedula || ""} ${t.str_asunto} ${t.str_descripcion}`.toLowerCase();
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

  const totalPaginas = Math.ceil(ticketsFiltrados.length / porPagina) || 1;
  const ticketsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return ticketsFiltrados.slice(inicio, inicio + porPagina);
  }, [ticketsFiltrados, paginaActual, porPagina]);

  const registroInicio =
    ticketsFiltrados.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const registroFin = Math.min(
    paginaActual * porPagina,
    ticketsFiltrados.length,
  );

  const formatearFechaHora = (fechaStr) => {
    if (!fechaStr) return "—";
    const fechaObj = new Date(fechaStr);
    const fechaFormateada = fechaObj.toLocaleDateString("es-VE");
    const horaFormateada = fechaObj.toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return (
      <div>
        <div>{fechaFormateada}</div>
        <div style={{ color: "var(--merco-muted)", fontSize: "10px" }}>
          {horaFormateada}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "1px solid var(--merco-border)",
              paddingTop: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
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
                placeholder="Buscar por N° Ticket, creador, cédula, nombre o asunto"
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  ...filtroStyle,
                  width: "100%",
                  paddingLeft: "36px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={limpiarFiltros}
                style={{ whiteSpace: "nowrap" }}
              >
                Limpiar Filtros
              </button>

              <button
                className="btn-icon"
                onClick={exportarExcel}
                title="Exportar a Excel"
                style={{
                  color: "#10b981",
                  padding: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <DynamicIcon name="RiFileExcel2Line" style={{ fontSize: 22 }} />
              </button>
            </div>
          </div>
        </div>

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
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#3b82f6",
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
                    } else if (estatusLower.includes("en espera proveedor")) {
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
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                      };
                    } else if (estatusLower.includes("vencido")) {
                      estiloEstatus = {
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                      };
                    } else if (estatusLower.includes("cancelado")) {
                      estiloEstatus = {
                        background: "rgba(14, 165, 233, 0.1)",
                        color: "#0ea5e9",
                      };
                    }

                    const tiempoResolucionStr = (
                      t.tiempo_resolucion || ""
                    ).toLowerCase();
                    let excedeSLA =
                      tiempoResolucionStr.includes("fuera") ||
                      tiempoResolucionStr.includes("vencido") ||
                      estatusLower.includes("vencido");

                    if (!excedeSLA && t.int_sla && t.created_at) {
                      const fechaInicio = new Date(t.created_at);
                      const fechaFin = t.dmt_fecha_cierre
                        ? new Date(t.dmt_fecha_cierre)
                        : new Date();
                      const diferenciaHoras =
                        (fechaFin - fechaInicio) / (1000 * 60 * 60);
                      if (diferenciaHoras > Number(t.int_sla)) {
                        excedeSLA = true;
                      }
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

                    const primerNombreCreador =
                      (t.creador_nombre || "").trim().split(" ")[0] || "";
                    const primerApellidoCreador =
                      (t.creador_apellido || "").trim().split(" ")[0] || "";
                    const nombreCreadorCorto =
                      `${primerNombreCreador} ${primerApellidoCreador}`.trim() ||
                      "—";

                    const nombreAsignadoCorto = obtenerPrimerNombreApellido(
                      t.asignado_nombre,
                      t.asignado_apellido,
                    );

                    const esCancelado = estatusLower.includes("cancelado");

                    // Validaciones de estatus en pausa y cálculo de minutos actuales o históricos
                    const estaEnPausaActual =
                      estatusLower.includes("espera") ||
                      estatusLower.includes("pendiente") ||
                      estatusLower.includes("pausa");

                    let minutosPausaActual = 0;
                    if (estaEnPausaActual && t.updated_at) {
                      const msPausa = new Date() - new Date(t.updated_at);
                      minutosPausaActual = Math.floor(msPausa / (1000 * 60));
                    }

                    const totalMinutosPausa =
                      Number(t.int_minutos_pausa || 0) + minutosPausaActual;
                    const tieneHistorialPausa = totalMinutosPausa > 0;

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
                              title="Copiar código de ticket"
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
                          <span className="tag" style={{ fontSize: 11 }}>
                            {t.canal_nombre || "—"}
                          </span>
                        </td>
                        <td>
                          <div>
                            <b style={{ color: "var(--merco-text)" }}>
                              {nombreCreadorCorto}
                            </b>
                            <small
                              style={{
                                display: "block",
                                color: "var(--merco-muted)",
                                fontSize: "11px",
                              }}
                            >
                              {t.creador_correo || "—"}
                            </small>
                          </div>
                        </td>
                        <td>
                          {esExterno ? (
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-accent, #f95700)",
                                }}
                              >
                                {t.cliente_nombre && t.cliente_apellido
                                  ? `${t.cliente_nombre} ${t.cliente_apellido}`
                                  : "Cliente Externo"}
                              </b>
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--merco-muted)",
                                  fontSize: "11px",
                                }}
                              >
                                Cédula: {t.cliente_cedula || "—"} | Tel:{" "}
                                {t.cliente_telefono || "—"}
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: "var(--merco-muted)" }}>
                              N/A (Ticket Interno)
                            </span>
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
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.created_at)}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.dmt_fecha_vencimiento_sla)}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {formatearFechaHora(t.dmt_fecha_cierre)}
                        </td>

                        {/* CELDA SLA CON BADGE FLOTANTE */}
                        <td
                          style={{ whiteSpace: "nowrap", textAlign: "center" }}
                        >
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
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

                            {/* Badge Flotante - Pausa Activa */}
                            {estaEnPausaActual && (
                              <span
                                title={`Ticket actualmente en espera (${totalMinutosPausa} minutos añadidos)`}
                                style={{
                                  position: "absolute",
                                  top: "-6px",
                                  right: "-8px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  padding: "1px 5px",
                                  borderRadius: "10px",
                                  fontSize: "9px",
                                  fontWeight: "normal",
                                  background: "#a855f7",
                                  color: "#ffffff",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                  lineHeight: 1,
                                }}
                              >
                                +{totalMinutosPausa}m
                              </span>
                            )}

                            {/* Badge Flotante - Historial de Pausa */}
                            {!estaEnPausaActual && tieneHistorialPausa && (
                              <span
                                title={`Este ticket añadió ${Math.round(t.int_minutos_pausa)} minutos al SLA por estar en espera`}
                                style={{
                                  position: "absolute",
                                  top: "-6px",
                                  right: "-8px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  padding: "1px 5px",
                                  borderRadius: "10px",
                                  fontSize: "9px",
                                  fontWeight: "normal",
                                  background: "#f59e0b",
                                  color: "#18181b",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                  lineHeight: 1,
                                }}
                              >
                                +{Math.round(t.int_minutos_pausa)}m
                              </span>
                            )}
                          </div>
                        </td>

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
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            className="tag"
                            style={{
                              fontSize: 11,
                              background: esCancelado
                                ? "rgba(14, 165, 233, 0.1)"
                                : excedeSLA
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : t.dmt_fecha_cierre
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "rgba(59, 130, 246, 0.1)",
                              color: esCancelado
                                ? "#0ea5e9"
                                : excedeSLA
                                  ? "#ef4444"
                                  : t.dmt_fecha_cierre
                                    ? "#10b981"
                                    : "#3b82f6",
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderTop:
                "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 13,
              color: "var(--merco-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span>
                Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de{" "}
                <b>{ticketsFiltrados.length}</b> registros
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: 8,
                }}
              >
                <span>Filas por página:</span>
                <select
                  value={porPagina}
                  onChange={(e) => {
                    setPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--merco-border, #444)",
                    background:
                      "var(--merco-bg-subtle, rgba(255,255,255,0.05))",
                    color: "inherit",
                    fontSize: 12,
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-ghost"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  opacity: paginaActual === 1 ? 0.5 : 1,
                  cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                }}
              >
                Anterior
              </button>

              <span style={{ padding: "0 6px", fontWeight: 500 }}>
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                className="btn btn-ghost"
                disabled={paginaActual >= totalPaginas}
                onClick={() =>
                  setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                }
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  opacity: paginaActual >= totalPaginas ? 0.5 : 1,
                  cursor:
                    paginaActual >= totalPaginas ? "not-allowed" : "pointer",
                }}
              >
                Siguiente
              </button>
            </div>
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
                        Number(est.id) ===
                        Number(ticketSeleccionado.estatus_id),
                    );
                    const nombreEstatus =
                      estatusObj?.str_nombre ||
                      ticketSeleccionado.estatus_nombre ||
                      "En Proceso";
                    const descEstatus = estatusObj?.str_descripcion;

                    const estName = nombreEstatus.toLowerCase();
                    const esCanceladoModal = estName.includes("cancelado");
                    const esRojo = estName.includes("vencido");
                    const esEnProceso = estName.includes("en proceso");
                    const esEnEspera = estName.includes("en espera");

                    return (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          background: esEnEspera
                            ? "rgba(236, 72, 153, 0.1)"
                            : esCanceladoModal
                              ? "rgba(14, 165, 233, 0.1)"
                              : esRojo
                                ? "rgba(239, 68, 68, 0.1)"
                                : esEnProceso
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(16, 185, 129, 0.1)",
                          color: esEnEspera
                            ? "#ec4899"
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
                  const correoCreadorModal =
                    ticketSeleccionado.creador_correo || "";

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
                            <DynamicIcon
                              name="FiCopy"
                              style={{ fontSize: 13 }}
                            />
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
                            <DynamicIcon
                              name="FiCopy"
                              style={{ fontSize: 13 }}
                            />
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

                {(ticketSeleccionado.tipo_ticket
                  ?.toLowerCase()
                  .includes("externo") ||
                  ticketSeleccionado.tipo_ticket
                    ?.toLowerCase()
                    .includes("app")) && (
                  <div>
                    <b>Canal:</b> {ticketSeleccionado.canal_nombre || "N/A"}
                  </div>
                )}

                {ticketSeleccionado.tipo_ticket
                  ?.toLowerCase()
                  .includes("externo") ||
                ticketSeleccionado.tipo_ticket
                  ?.toLowerCase()
                  .includes("app") ? (
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
                    </div>
                  </>
                ) : null}

                <div>
                  <b>Prioridad Actual:</b> {ticketSeleccionado.prioridad_nombre}
                </div>

                <div>
                  <b>Fecha de Creación:</b>{" "}
                  {ticketSeleccionado.created_at
                    ? new Date(ticketSeleccionado.created_at).toLocaleString(
                        "es-VE",
                      )
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
                    ? new Date(
                        ticketSeleccionado.dmt_fecha_cierre,
                      ).toLocaleString("es-VE")
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
              {(() => {
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

                const backendUrl = import.meta.env.VITE_URL_API_LOCAL_VER;

                return (
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
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
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
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "15px",
                          }}
                        >
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
                                  Tu navegador no soporta la reproducción de
                                  video.
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
                                <div
                                  style={{
                                    fontSize: "11px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {nombreArchivo}
                                </div>
                                <audio controls style={{ width: "100%" }}>
                                  <source src={urlArchivo} />
                                  Tu navegador no soporta la reproducción de
                                  audio.
                                </audio>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

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
                      No hay respuestas o avances registrados en la bitácora
                      todavía.
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
                        style={{
                          ...filtroStyle,
                          width: "100%",
                          cursor: "pointer",
                        }}
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
                        style={{
                          ...filtroStyle,
                          width: "100%",
                          cursor: "pointer",
                        }}
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
                        style={{
                          ...filtroStyle,
                          width: "100%",
                          cursor: "pointer",
                        }}
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
                        style={{
                          ...filtroStyle,
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        {estatusModalDisponibles.map((est) => (
                          <option key={est.id} value={String(est.id)}>
                            {est.str_nombre}{" "}
                            {est.str_descripcion
                              ? `- ${est.str_descripcion}`
                              : ""}
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
                      placeholder={
                        Number(nuevoEstatusId) !==
                        Number(ticketSeleccionado?.estatus_id)
                          ? "Escriba obligatoriamente la respuesta o motivo del cambio de estatus..."
                          : "Escriba una nota opcional para la bitácora..."
                      }
                      style={{
                        ...filtroStyle,
                        width: "100%",
                        resize: "vertical",
                        borderColor: errorModal
                          ? "#ef4444"
                          : "var(--merco-border)",
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
                        <DynamicIcon
                          name="FiAlertCircle"
                          style={{ fontSize: 13 }}
                        />
                        {errorModal}
                      </div>
                    )}
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
        )}
    </SystemLayout>
  );
}
