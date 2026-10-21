import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import copy from "copy-to-clipboard";
import axiosTickets from "../../../../api/axiosTickets";
import { useSelector } from "react-redux";
//import formatearFechaHora from "../../../../components/formatearFechaHora";
import { useCreateBlockNote } from "@blocknote/react";
import { es } from "@blocknote/core/locales";

export function useTickets() {
  const currentUserId = useSelector((state) => state.auth?.user?.id);
  const currentUserRole = useSelector(
    (state) => state.auth?.user?.sistemasOpciones[0]?.rol,
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  const [canales, setCanales] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposTicket, setTiposTicket] = useState([]);
  const [listaEstatus, setListaEstatus] = useState([]);
  const [categoriaExterna, setCategoriaExterna] = useState([]);
  const [categoriaInterna, setCategoriaInterna] = useState([]);

  // Estados de Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fTipoTicket, setFTipoTicket] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrioridad, setFPrioridad] = useState("");
  const [fCanal, setFCanal] = useState("");
  const [fDepartamento, setFDepartamento] = useState("");
  const [fCategoria, setFCategoria] = useState("");
  const [fAgente, setFAgente] = useState("");

  const [fTipoFecha, setFTipoFecha] = useState("");
  const [fFechaCalendario, setFFechaCalendario] = useState("");
  const [fHora, setFHora] = useState("");
  const [fMinuto, setFMinuto] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(5);

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

  const fetchCatalogosYTickets = async () => {
    try {
      setLoading(true);

      let listaTickets = [];
      let deptosTemp = [];
      let usuariosTemp = [];

      // 1. Cargar Tickets
      try {
        //const resTickets = await axiosTickets.get("/listar");
        const resTickets = await axiosTickets.get("/listar", {
          params: { rol: currentUserRole },
        });

        if (resTickets.data && resTickets.data.success) {
          listaTickets = resTickets.data.tickets || [];
          setTickets(listaTickets);
        }
      } catch (err) {
        console.error("Error al cargar /listar:", err);
      }

      // 2. Cargar Datos Maestros
      try {
        const resMaestros = await axiosTickets.get("/datos-maestros");
        if (resMaestros.data && resMaestros.data.success) {
          setCanales(resMaestros.data.canales || []);
          setPrioridades(resMaestros.data.prioridades || []);
          setTiposTicket(resMaestros.data.tipoTicket || []);
          setListaEstatus(resMaestros.data.estatus || []);
          setCategoriaExterna(
            resMaestros.data.categoria_externa ||
              resMaestros.data.categorias_externas ||
              [],
          );
          setCategoriaInterna(
            resMaestros.data.categoria_interna ||
              resMaestros.data.categorias_internas ||
              [],
          );
        }
      } catch (err) {
        console.error("Error al cargar /datos-maestros:", err);
      }

      // 3. Cargar Departamentos y Usuarios
      try {
        const resDeptUsers = await axiosTickets.get("/departamentos-usuarios");
        if (resDeptUsers.data && resDeptUsers.data.success) {
          deptosTemp =
            resDeptUsers.data.departamentos || resDeptUsers.data.data || [];
          usuariosTemp =
            resDeptUsers.data.usuarios || resDeptUsers.data.users || [];
        }
      } catch (err) {
        console.warn(
          "Endpoint /departamentos-usuarios falló, extrayendo de catálogos o respaldo...",
          err,
        );
      }

      if (deptosTemp.length === 0 && listaTickets.length > 0) {
        const mapDeptos = new Map();
        listaTickets.forEach((t) => {
          if (t.departamento_id && t.departamento_nombre) {
            mapDeptos.set(t.departamento_id, {
              id: t.departamento_id,
              str_nombre: t.departamento_nombre,
            });
          }
        });
        deptosTemp = Array.from(mapDeptos.values());
      }

      if (usuariosTemp.length === 0 && listaTickets.length > 0) {
        const mapUsers = new Map();
        listaTickets.forEach((t) => {
          if (t.usuario_asignado_id && t.asignado_nombre) {
            mapUsers.set(t.usuario_asignado_id, {
              id: t.usuario_asignado_id,
              str_nombre: t.asignado_nombre,
              str_apellido: t.asignado_apellido || "",
              departamento_id: t.departamento_id,
            });
          }
        });
        usuariosTemp = Array.from(mapUsers.values());
      }

      setListaDepartamentos(deptosTemp);
      setListaUsuarios(usuariosTemp);

      return listaTickets;
    } catch (error) {
      console.error("Error general en fetchCatalogosYTickets:", error);
      showToast("Error al cargar los casos de tickets.", "error");
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchCatalogosYTickets();
  }, []);

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
      if (ticketEncontrado) abrirDetalle(ticketEncontrado);
    });
  }, [searchParams]);

  useEffect(() => {
    if (fDepartamento) {
      setEmpleadosFiltrados(
        listaUsuarios.filter(
          (u) => Number(u.departamento_id) === Number(fDepartamento),
        ),
      );
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

  const categoriasFiltradas = useMemo(() => {
    const todas = [...categoriaExterna, ...categoriaInterna];
    if (!fTipoTicket || fTipoTicket === "") return todas;

    const seleccionado = tiposTicket.find(
      (t) => Number(t.id) === Number(fTipoTicket),
    );
    if (!seleccionado) return todas;

    const nombreTipo = (seleccionado.str_nombre || "").toLowerCase();
    if (nombreTipo.includes("interno"))
      return categoriaInterna.length > 0 ? categoriaInterna : todas;
    if (nombreTipo.includes("externo") || nombreTipo.includes("app"))
      return categoriaExterna.length > 0 ? categoriaExterna : todas;

    return todas;
  }, [fTipoTicket, tiposTicket, categoriaExterna, categoriaInterna]);

  useEffect(() => {
    if (fCategoria && categoriasFiltradas.length > 0) {
      const existe = categoriasFiltradas.some(
        (c) => Number(c.id) === Number(fCategoria),
      );
      if (!existe) setFCategoria("");
    }
  }, [fTipoTicket, categoriasFiltradas]);

  useEffect(() => {
    if (esFiltroInterno) setFCanal("");
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
    fCategoria,
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
    setFCategoria("");
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
        fetchCatalogosYTickets();
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error al guardar los cambios.";
      setErrorModal(mensajeError);
      showToast(mensajeError, "error");
    }
  };

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (fTipoTicket && Number(t.tipo_ticket_id) !== Number(fTipoTicket))
        return false;
      if (
        fCategoria &&
        fCategoria !== "" &&
        Number(t.categoria_id) !== Number(fCategoria)
      )
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
        )
          return false;
        if (fHora !== "" && dTicket.getHours() !== Number(fHora)) return false;
        if (fMinuto !== "" && dTicket.getMinutes() !== Number(fMinuto))
          return false;
      }

      if (fBuscar) {
        const q = fBuscar.toLowerCase().trim();
        const texto =
          `${t.str_ticket || ""} ${t.creador_nombre || ""} ${t.creador_apellido || ""} ${t.cliente_nombre || ""} ${t.cliente_cedula || ""} ${t.str_asunto || ""}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [
    tickets,
    fBuscar,
    fTipoTicket,
    fCategoria,
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
      "Código Ticket",
      "Tipo",
      "Canal",
      "Creado Por",
      "Cliente / Afectado",
      "Cédula Cliente",
      "Asunto",
      "Departamento",
      "Prioridad",
      "Asignado A",
      "Creación",
      "Vencimiento SLA",
      "Cierre",
      "SLA (hrs)",
      "Estado",
      "Duración",
    ]);

    ticketsFiltrados.forEach((t) => {
      const tipoLower = (t.tipo_ticket || "").toLowerCase();
      const esExterno =
        tipoLower.includes("externo") || tipoLower.includes("app");
      const clienteNombre =
        esExterno && t.cliente_nombre
          ? `${t.cliente_nombre} ${t.cliente_apellido || ""}`.trim()
          : esExterno
            ? "Cliente Externo"
            : "N/A";
      const clienteCedula = esExterno ? t.cliente_cedula || "—" : "N/A";
      const asignado = t.asignado_nombre
        ? `${t.asignado_nombre} ${t.asignado_apellido || ""}`.trim()
        : "Sin asignar";

      filasCsv.push([
        t.str_ticket || "",
        t.tipo_ticket || "",
        t.canal_nombre || "",
        `${t.creador_nombre || ""} ${t.creador_apellido || ""}`.trim() || "",
        clienteNombre,
        clienteCedula,
        t.str_asunto || "",
        t.departamento_nombre || "",
        t.prioridad_nombre || "",
        asignado,
        formatearTextoFecha(t.created_at),
        t.dmt_fecha_vencimiento_sla
          ? formatearTextoFecha(t.dmt_fecha_vencimiento_sla)
          : "",
        t.dmt_fecha_cierre ? formatearTextoFecha(t.dmt_fecha_cierre) : "-",
        t.int_sla ? `${t.int_sla} hrs` : "",
        t.estatus_nombre || "",
        t.tiempo_resolucion || "En curso",
      ]);
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
    link.setAttribute("download", `reporte_tickets_${fechaActual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exportación de tickets exitosa.", "success");
  };

  const conteoKpi = useMemo(() => {
    const contadores = {
      "En Aprobación": 0,
      Vencido: 0,
      Resuelto: 0,
      "En Progreso": 0,
      Cerrado: 0,
      Cancelado: 0,
      "Pendiente de Usuario": 0,
      "En Espera Proveedor": 0,
      porVencer: 0,
    };
    const ahora = new Date();
    ticketsFiltrados.forEach((t) => {
      const estatusNombre = t.estatus_nombre;
      if (estatusNombre && contadores[estatusNombre] !== undefined)
        contadores[estatusNombre]++;
      const estatusLower = (estatusNombre || "").toLowerCase();
      const estaFinalizado =
        estatusLower.includes("cerrado") ||
        estatusLower.includes("resuelto") ||
        estatusLower.includes("cancelado");
      if (!estaFinalizado && t.dmt_fecha_vencimiento_sla) {
        const diferenciaHoras =
          (new Date(t.dmt_fecha_vencimiento_sla) - ahora) / (1000 * 60 * 60);
        if (diferenciaHoras > 0 && diferenciaHoras <= 2)
          contadores["porVencer"]++;
      }
    });
    return contadores;
  }, [ticketsFiltrados]);

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
    categorias: categoriasFiltradas,
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
    editorRespuesta,
    handleEditorRespuestaChange,
    isDarkMode,
    currentUserId,
    currentUserRole,
  };
}
