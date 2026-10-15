import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import copy from "copy-to-clipboard";
import axiosTickets from "../../../../api/axiosTickets"; // Ajusta la ruta según la profundidad de tu carpeta

export function useCasosTickets() {
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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copiarTextoClipboard = (e, texto, etiqueta = "Texto") => {
    e.stopPropagation();
    copy(texto);
    showToast(`¡${etiqueta} copiado al portapapeles!`, "success");
  };

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

  useEffect(() => {
    fetchCatalogosYTickets();
  }, []);

  // Manejo de parámetro URL para abrir un ticket específico automáticamente
  useEffect(() => {
    const ticketIdParam = searchParams.get("abrirTicket");
    if (!ticketIdParam) return;

    const idBuscado = Number(ticketIdParam);
    searchParams.delete("abrirTicket");
    setSearchParams(searchParams, { replace: true });

    fetchCatalogosYTickets().then((listaActualizada) => {
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

        if (fHora !== "" && dTicket.getHours() !== Number(fHora)) return false;
        if (fMinuto !== "" && dTicket.getMinutes() !== Number(fMinuto))
          return false;
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
        return `${d.toLocaleDateString("es-VE")} ${d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
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

  return {
    loading,
    ticketsFiltrados,
    ticketsPaginados,
    listaDepartamentos,
    listaUsuarios,
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
  };
}
