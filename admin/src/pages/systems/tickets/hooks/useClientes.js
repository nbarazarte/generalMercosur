import { useState, useEffect, useMemo, useCallback } from "react";
import axiosTickets from "../../../../api/axiosTickets";
import { useSelector } from "react-redux";
import copy from "copy-to-clipboard";
import { useCreateBlockNote } from "@blocknote/react";
import { es } from "@blocknote/core/locales";

export const useClientes = () => {
  const currentUserId = useSelector((state) => state.auth?.user?.id);
  const currentUserRole = useSelector(
    (state) => state.auth?.user?.sistemasOpciones[0]?.rol,
  );

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Estado para controlar las filas expandidas de la tabla
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  // Estados de Filtros unificados
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoFecha: "",
    fechaCalendario: "",
  });

  // Estados para el Modal de Detalle de Ticket
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [nuevoEstatusId, setNuevoEstatusId] = useState("");
  const [nuevoAsignadoId, setNuevoAsignadoId] = useState("");
  const [nuevoPrioridadId, setNuevoPrioridadId] = useState("");
  const [modalDepartamentoId, setModalDepartamentoId] = useState("");
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [tabActiva, setTabActiva] = useState("descripcion");
  const [bitacoraList, setBitacoraList] = useState([]);
  const [errorModal, setErrorModal] = useState("");

  // Catálogos para el modal
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaEstatus, setListaEstatus] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Detección de Modo Oscuro para BlockNote
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkActive =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setIsDarkMode(darkActive);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copiarTextoClipboard = (e, texto, etiqueta = "Texto") => {
    e.stopPropagation();
    copy(texto);
    showToast(`¡${etiqueta} copiado al portapapeles!`, "success");
  };

  const obtenerClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosTickets.get("/clientes-con-tickets");

      if (response.data && response.data.success) {
        setClientes(response.data.data || response.data.clientes || []);
      } else {
        setClientes([]);
      }
    } catch (err) {
      console.error("Error al obtener los clientes con tickets:", err);
      setError("No se pudo cargar el listado de clientes.");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes y catálogos al montar
  useEffect(() => {
    obtenerClientes();
    const cargarCatalogos = async () => {
      try {
        const [resDeptUsers, resMaestros] = await Promise.all([
          axiosTickets.get("/departamentos-usuarios"),
          axiosTickets.get("/datos-maestros"),
        ]);

        if (resDeptUsers.data && resDeptUsers.data.success) {
          setListaDepartamentos(resDeptUsers.data.departamentos || []);
          setListaUsuarios(resDeptUsers.data.usuarios || []);
        }

        if (resMaestros.data && resMaestros.data.success) {
          setListaEstatus(resMaestros.data.estatus || []);
          setPrioridades(resMaestros.data.prioridades || []);
        }
      } catch (err) {
        console.error("Error al cargar catálogos para el modal:", err);
      }
    };
    cargarCatalogos();
  }, [obtenerClientes]);

  // Reiniciar a la página 1 cuando cambie cualquier filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => {
      const nuevosFiltros = { ...prev, [name]: value };
      if (name === "tipoFecha" && !value) {
        nuevosFiltros.fechaCalendario = "";
      }
      return nuevosFiltros;
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipoFecha: "",
      fechaCalendario: "",
    });
  };

  // Abrir detalle de ticket en modal y enriquecerlo con datos del cliente contenedor
  const abrirDetalle = async (ticket) => {
    const clientePadre = clientes.find(
      (c) => c.lista_tickets && c.lista_tickets.some((t) => t.id === ticket.id),
    );

    const ticketEnriquecido = {
      ...ticket,
      cliente_nombre: ticket.cliente_nombre || clientePadre?.cliente || "",
      cliente_cedula: ticket.cliente_cedula || clientePadre?.cedula || "",
      cliente_telefono: ticket.cliente_telefono || clientePadre?.telefono || "",
      cliente_correo: ticket.cliente_correo || clientePadre?.correo || "",
    };

    setTicketSeleccionado(ticketEnriquecido);
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
      const res = await axiosTickets.get(`/bitacora/${ticket.id}`);
      if (res.data.success) setBitacoraList(res.data.bitacora || []);
    } catch (err) {
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
        showToast("Ticket actualizado exitosamente.", "success");
        setTicketSeleccionado(null);
        setRespuestaTexto("");
        setErrorModal("");
        if (editorRespuesta) {
          await editorRespuesta.replaceBlocks(editorRespuesta.document, [
            { type: "paragraph", content: "" },
          ]);
        }
        obtenerClientes();
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error al guardar los cambios.";
      setErrorModal(mensajeError);
      showToast(mensajeError, "error");
    }
  };

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

  const esTicketBloqueado = useMemo(() => {
    if (!ticketSeleccionado) return false;
    const estatusStr = (ticketSeleccionado.estatus_nombre || "").toLowerCase();
    return (
      estatusStr.includes("cerrado") ||
      estatusStr.includes("cancelado") ||
      estatusStr.includes("vencido")
    );
  }, [ticketSeleccionado]);

  // Filtrado local instantáneo
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      if (filtros.tipoFecha && filtros.fechaCalendario) {
        if (!c.ultima_atencion) return false;
        const dCliente = new Date(c.ultima_atencion);
        const [anio, mes, dia] = filtros.fechaCalendario.split("-").map(Number);
        if (
          dCliente.getFullYear() !== anio ||
          dCliente.getMonth() + 1 !== mes ||
          dCliente.getDate() !== dia
        ) {
          return false;
        }
      }

      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase().trim();
        const texto =
          `${c.cedula || ""} ${c.cliente || ""} ${c.telefono || ""} ${c.correo || ""}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }

      return true;
    });
  }, [clientes, filtros]);

  // Cálculos de paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / porPagina) || 1;

  const clientesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return clientesFiltrados.slice(inicio, inicio + porPagina);
  }, [clientesFiltrados, paginaActual, porPagina]);

  const registroInicio =
    clientesFiltrados.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;

  const registroFin = Math.min(
    paginaActual * porPagina,
    clientesFiltrados.length,
  );

  const handlePorPaginaChange = (e) => {
    const nuevoValor = Number(e.target.value);
    setPorPagina(nuevoValor);
    setPaginaActual(1);
  };

  const exportarExcel = () => {
    if (!clientesFiltrados || clientesFiltrados.length === 0) {
      showToast("No hay registros para exportar", "error");
      return;
    }

    const formatearTextoFecha = (fechaStr) => {
      if (!fechaStr) return "";
      try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return String(fechaStr);
        return fecha.toISOString().replace("T", " ").substring(0, 19);
      } catch {
        return String(fechaStr);
      }
    };

    const filasCsv = [];

    filasCsv.push([
      "Cédula",
      "Cliente",
      "Teléfono",
      "Correo",
      "Ticket",
      "Asunto",
      "Categoría",
      "Prioridad",
      "Estatus",
      "Asignado A",
      "Creación",
      "Cierre",
    ]);

    clientesFiltrados.forEach((c) => {
      const listaTickets = c.lista_tickets || [];

      if (listaTickets.length === 0) {
        filasCsv.push([
          c.cedula || "",
          c.cliente || "",
          c.telefono || "",
          c.correo || "",
          "—",
          "Sin tickets registrados",
          "—",
          "—",
          "—",
          "—",
          "—",
          "—",
        ]);
      } else {
        const ticketsOrdenados = listaTickets
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        ticketsOrdenados.forEach((t) => {
          const asignado = t.asignado_nombre
            ? `${t.asignado_nombre} ${t.asignado_apellido || ""}`.trim()
            : "Sin asignar";

          filasCsv.push([
            c.cedula || "",
            c.cliente || "",
            c.telefono || "",
            c.correo || "",
            t.str_ticket || "",
            t.str_asunto || "",
            t.categoria_nombre || "",
            t.prioridad_nombre || "",
            t.estatus_nombre || "",
            asignado,
            formatearTextoFecha(t.created_at),
            t.dmt_fecha_cierre ? formatearTextoFecha(t.dmt_fecha_cierre) : "-",
          ]);
        });
      }
    });

    const contenidoCsv = filasCsv
      .map((e) =>
        e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(";"),
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + contenidoCsv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fechaActual = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reporte_clientes_con_detalles_${fechaActual}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exportación exitosa", "success");
  };

  return {
    clientes: clientesPaginados,
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
    recargarClientes: obtenerClientes,
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
    listaUsuarios,
    listaEstatus,
    prioridades,
    usuariosModalFiltrados,
    estatusModalDisponibles,
    esTicketBloqueado,
    abrirDetalle,
    handleGuardarCambiosTicket,
    copiarTextoClipboard,
    editorRespuesta,
    handleEditorRespuestaChange,
    isDarkMode,
    currentUserId,
    currentUserRole,
  };
};
