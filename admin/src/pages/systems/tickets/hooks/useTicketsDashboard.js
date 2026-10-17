import { useState, useEffect, useCallback, useMemo } from "react";
import axiosTickets from "../../../../api/axiosTickets";

export function useTicketsDashboard() {
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
    creacion_desde: "",
    creacion_hasta: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = useCallback(async (paramsFiltros = {}) => {
    try {
      setLoading(true);
      const paramsLimpios = Object.fromEntries(
        Object.entries(paramsFiltros).filter(([_, v]) => v !== "" && v != null),
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
  }, []);

  useEffect(() => {
    fetchDashboardData(filtros);
  }, [filtros, fetchDashboardData]);

  // Propiedad computada: filtra dinámicamente las categorías según el tipo seleccionado
  const categoriasFiltradas = useMemo(() => {
    if (!filtros.tipo_ticket_id) {
      // Si no hay tipo seleccionado, unimos ambas para mostrar todas
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

  const limpiarFiltros = () => {
    setFiltros({
      tipo_ticket_id: "",
      estatus_id: "",
      prioridad_id: "",
      canal_id: "",
      departamento_id: "",
      categoria_id: "",
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
    categorias: categoriasFiltradas, // Se expone la lista ya filtrada
    toast,
    recargarDatos: () => fetchDashboardData(filtros),
  };
}
