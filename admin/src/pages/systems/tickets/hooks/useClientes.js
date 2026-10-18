import { useState, useEffect, useMemo, useCallback } from "react";
import axiosTickets from "../../../../api/axiosTickets";

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  // Estados de Filtros unificados
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoFecha: "",
    fechaCalendario: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const obtenerClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosTickets.get("/clientes-con-tickets");
      if (response.data && response.data.success) {
        setClientes(response.data.data || []);
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

  useEffect(() => {
    obtenerClientes();
  }, [obtenerClientes]);

  // Reiniciar a la página 1 cuando cambie cualquier filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => {
      const nuevosFiltros = { ...prev, [name]: value };
      // Si se deselecciona el tipo de fecha, limpiamos la fecha calendario
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

  // Filtrado local instantáneo (incluyendo fecha de última atención y texto)
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      // Filtro por fecha de última atención
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

      // Filtro por texto general de búsqueda
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase().trim();
        const texto = `${c.cedula || ""} ${c.cliente || ""} ${c.telefono || ""} ${c.correo || ""}`.toLowerCase();
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
    if (clientesFiltrados.length === 0) {
      showToast("No hay registros para exportar con los filtros actuales.", "error");
      return;
    }
    
    // Lógica para exportar a CSV / Excel descargable
    const headers = ["Cedula", "Cliente", "Telefono", "Correo", "Tickets", "Ultima Atencion"];
    const rows = clientesFiltrados.map((c) => [
      `"${c.cedula || ""}"`,
      `"${c.cliente || ""}"`,
      `"${c.telefono || ""}"`,
      `"${c.correo || ""}"`,
      c.tickets || 0,
      `"${c.ultima_atencion || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_clientes_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("¡Reporte exportado exitosamente!", "success");
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
    handleFiltroChange,
    limpiarFiltros,
    handlePorPaginaChange,
    exportarExcel,
    recargarClientes: obtenerClientes,
  };
};