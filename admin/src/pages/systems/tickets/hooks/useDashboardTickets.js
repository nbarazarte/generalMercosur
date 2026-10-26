import { useState, useEffect, useCallback, useMemo } from "react";
import axiosTickets from "../../../../api/axiosTickets";
import { useSelector } from "react-redux";
import { useCreateBlockNote } from "@blocknote/react";
import { es } from "@blocknote/core/locales";

export function useDashboardTickets() {
  const currentUserId = useSelector((state) => state.auth?.user?.id);
  const currentUserRole = useSelector(
    (state) =>
      state.auth?.user?.sistemasOpciones?.find(
        (sys) => sys.sistema === "Tickets",
      )?.rol,
  );

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [ticketsPorCategoria, setTicketsPorCategoria] = useState([]);
  const [distribucionEstados, setDistribucionEstados] = useState([]);
  const [ultimosTickets, setUltimosTickets] = useState([]);
  const [casosPorAnalista, setCasosPorAnalista] = useState([]);
  const [casosCerradosPorAnalista, setCasosCerradosPorAnalista] = useState([]);

  // Catálogos
  const [canales, setCanales] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposTicket, setTiposTicket] = useState([]);
  const [listaEstatus, setListaEstatus] = useState([]);
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [categoriaExterna, setCategoriaExterna] = useState([]);
  const [categoriaInterna, setCategoriaInterna] = useState([]);

  const [toast, setToast] = useState(null);

  const [filtros, setFiltros] = useState({
    tipo_ticket_id: "",
    estatus_id: "",
    prioridad_id: "",
    canal_id: "",
    departamento_id: "",
    categoria_id: "",
    tipo_persona: "",
    creacion_desde: "",
    creacion_hasta: "",
  });

  // ==========================================
  // ESTADOS DEL MODAL DE DETALLE DE TICKET
  // ==========================================
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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = useCallback(
    async (paramsFiltros = {}) => {
      try {
        setLoading(true);

        // Enviamos el rol actual en los parámetros de la petición
        const paramsLimpios = Object.fromEntries(
          Object.entries({
            ...paramsFiltros,
            rol: currentUserRole,
          }).filter(([_, v]) => v !== "" && v != null),
        );

        const [
          resKpis,
          resCat,
          resEst,
          resUlt,
          resAnalista,
          resCerradosAnalista,
          resMaestros,
          resDept,
        ] = await Promise.all([
          axiosTickets.get("/dashboard/kpis", { params: paramsLimpios }),
          axiosTickets.get("/dashboard/tickets-por-categoria", {
            params: paramsLimpios,
          }),
          axiosTickets.get("/dashboard/distribucion-estados", {
            params: paramsLimpios,
          }),
          axiosTickets.get("/dashboard/ultimos-tickets", {
            params: paramsLimpios,
          }),
          axiosTickets.get("/dashboard/casos-por-analista", {
            params: paramsLimpios,
          }),
          axiosTickets.get("/dashboard/casos-cerrados-por-analista", {
            params: paramsLimpios,
          }),
          axiosTickets.get("/datos-maestros"),
          axiosTickets.get("/departamentos"),
        ]);

        if (resKpis.data.success) setKpis(resKpis.data.kpis[0] || {});
        if (resCat.data.success) setTicketsPorCategoria(resCat.data.data || []);
        if (resEst.data.success) setDistribucionEstados(resEst.data.data || []);
        if (resUlt.data.success) setUltimosTickets(resUlt.data.data || []);
        if (resAnalista.data.success)
          setCasosPorAnalista(resAnalista.data.data || []);
        if (resCerradosAnalista.data.success)
          setCasosCerradosPorAnalista(resCerradosAnalista.data.data || []);

        if (resMaestros.data.success) {
          setCanales(resMaestros.data.canales || []);
          setPrioridades(resMaestros.data.prioridades || []);
          setTiposTicket(resMaestros.data.tipoTicket || []);
          setListaEstatus(resMaestros.data.estatus || []);
          setCategoriaExterna(resMaestros.data.categoria_externa || []);
          setCategoriaInterna(resMaestros.data.categoria_interna || []);
        }

        if (resDept.data.success) {
          setListaDepartamentos(resDept.data.departamentos || []);
        }
      } catch (error) {
        showToast("Error al sincronizar métricas del dashboard.", "error");
      } finally {
        setLoading(false);
      }
    },
    [currentUserRole],
  );

  useEffect(() => {
    fetchDashboardData(filtros);
  }, [filtros, fetchDashboardData]);

  // Cargar lista de usuarios para el modal al cargar el hook
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

  // Categorías filtradas dinámicamente según el tipo seleccionado
  const categoriasFiltradas = useMemo(() => {
    if (!filtros.tipo_ticket_id) {
      return [...categoriaExterna, ...categoriaInterna];
    }
    const seleccionado = tiposTicket.find(
      (t) => Number(t.id) === Number(filtros.tipo_ticket_id),
    );
    if (!seleccionado) return [...categoriaExterna, ...categoriaInterna];

    const nombreTipo = seleccionado.str_nombre.toLowerCase();
    if (nombreTipo.includes("interno")) {
      return categoriaInterna;
    } else if (nombreTipo.includes("externo") || nombreTipo.includes("app")) {
      return categoriaExterna;
    }
    return [...categoriaExterna, ...categoriaInterna];
  }, [filtros.tipo_ticket_id, tiposTicket, categoriaExterna, categoriaInterna]);

  // Usuarios filtrados dinámicamente según el departamento del modal
  const usuariosModalFiltrados = useMemo(() => {
    if (!modalDepartamentoId) return listaUsuariosModal;
    return listaUsuariosModal.filter(
      (u) => Number(u.departamento_id) === Number(modalDepartamentoId),
    );
  }, [modalDepartamentoId, listaUsuariosModal]);

  // Estatus disponibles para el modal (excluyendo vencido)
  const estatusModalDisponibles = useMemo(() => {
    return listaEstatus.filter(
      (est) => !(est.str_nombre || "").toLowerCase().includes("vencido"),
    );
  }, [listaEstatus]);

  // Determina si el ticket seleccionado está en estado de solo lectura/bloqueado
  const esTicketBloqueado = useMemo(() => {
    if (!ticketSeleccionado) return false;
    const estatusStr = (ticketSeleccionado.estatus_nombre || "").toLowerCase();
    return (
      estatusStr.includes("cerrado") ||
      estatusStr.includes("cancelado") ||
      estatusStr.includes("vencido")
    );
  }, [ticketSeleccionado]);

  // Función para abrir el detalle del ticket y consultar su bitácora
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
      const res = await axiosTickets.get("/listar", {
        params: { rol: currentUserRole },
      });
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

  // Función para guardar los cambios aplicados en el modal del ticket
  const handleGuardarCambiosTicket = async (e) => {
    e?.preventDefault();
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
        fetchDashboardData(filtros);
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

  const limpiarFiltros = () => {
    setFiltros({
      tipo_ticket_id: "",
      estatus_id: "",
      prioridad_id: "",
      canal_id: "",
      departamento_id: "",
      categoria_id: "",
      tipo_persona: "",
      creacion_desde: "",
      creacion_hasta: "",
    });
  };

  return {
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
    categorias: categoriasFiltradas,
    toast,
    currentUserId,
    currentUserRole,
    recargarDatos: () => fetchDashboardData(filtros),

    // Retorno de estados y métodos para el Modal de Ticket
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
  };
}
