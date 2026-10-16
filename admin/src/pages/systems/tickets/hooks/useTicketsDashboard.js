import { useState, useEffect } from "react";
import axiosTickets from "../../../../api/axiosTickets";

export function useTicketsDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [ticketsPorCategoria, setTicketsPorCategoria] = useState([]);
  const [distribucionEstados, setDistribucionEstados] = useState([]);
  const [ultimosTickets, setUltimosTickets] = useState([]);
  const [casosPorAnalista, setCasosPorAnalista] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resKpis, resCat, resEst, resUlt, resAnalista] = await Promise.all([
        axiosTickets.get("/dashboard/kpis"),
        axiosTickets.get("/dashboard/tickets-por-categoria"),
        axiosTickets.get("/dashboard/distribucion-estados"),
        axiosTickets.get("/dashboard/ultimos-tickets"),
        axiosTickets.get("/dashboard/casos-por-analista"),
      ]);

      if (resKpis.data.success) setKpis(resKpis.data.kpis[0] || {});
      if (resCat.data.success) setTicketsPorCategoria(resCat.data.data || []);
      if (resEst.data.success) setDistribucionEstados(resEst.data.data || []);
      if (resUlt.data.success) setUltimosTickets(resUlt.data.data || []);
      if (resAnalista.data.success)
        setCasosPorAnalista(resAnalista.data.data || []);
    } catch (error) {
      console.error("Error al cargar datos del dashboard de tickets:", error);
      showToast("Error al sincronizar métricas de soporte.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    kpis,
    ticketsPorCategoria,
    distribucionEstados,
    ultimosTickets,
    casosPorAnalista,
    toast,
    recargarDatos: fetchDashboardData,
  };
}
