import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosDrive from "../../../../api/axiosDrive";

export function useListarEnlaces() {
  const user = useSelector((state) => state.auth?.user);
  const usuarioId = user?.id || null;

  const [enlaces, setEnlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  // Estados de Búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Estado para controlar las filas expandidas de la tabla
  const [expandidos, setExpandidos] = useState({});

  // Estados para extender vigencia y copiar
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [copiadoId, setCopiadoId] = useState(null);

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const obtenerEnlaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosDrive.get(`/enlaces${usuarioId ? `?usuario_id=${usuarioId}` : ""}`);
      if (response.data && response.data.success) {
        setEnlaces(response.data.enlaces || []);
      }
    } catch (err) {
      console.error("Error al cargar los enlaces:", err);
      showToast("Error al cargar los enlaces de Drive.", "error");
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    obtenerEnlaces();
  }, [obtenerEnlaces]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const handleCopiar = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopiadoId(id);
    showToast("¡Enlace copiado al portapapeles!", "success");
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleExtenderVigencia = async (id) => {
    if (!nuevaFecha) {
      showToast("Por favor seleccione una fecha válida.", "error");
      return;
    }
    try {
      const response = await axiosDrive.put(`/enlaces/extender/${id}`, {
        nueva_fecha_expiracion: nuevaFecha,
      });
      if (response.data?.success) {
        showToast("Vigencia del enlace extendida exitosamente.", "success");
        setEditandoId(null);
        setNuevaFecha("");
        obtenerEnlaces();
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Error al extender la vigencia.", "error");
    }
  };

  // Filtrado local en tiempo real
  const enlacesFiltrados = useMemo(() => {
    return enlaces.filter((e) => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase().trim();
      const texto = `${e.str_nombre_enlace || ""} ${e.str_nombre_usuario || ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [enlaces, busqueda]);

  // Cálculos de Paginación
  const totalPaginas = Math.ceil(enlacesFiltrados.length / porPagina) || 1;

  const enlacesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return enlacesFiltrados.slice(inicio, inicio + porPagina);
  }, [enlacesFiltrados, paginaActual, porPagina]);

  const registroInicio = enlacesFiltrados.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const registroFin = Math.min(paginaActual * porPagina, enlacesFiltrados.length);

  const handlePorPaginaChange = (e) => {
    setPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  // KPIs
  const totalEnlaces = enlacesFiltrados.length;
  const enlacesActivos = enlacesFiltrados.filter((e) => !e.estaExpirado).length;
  const enlacesExpirados = totalEnlaces - enlacesActivos;

  const tarjetasKpi = [
    { titulo: "Total Enlaces", valor: totalEnlaces, icono: "FiLink", color: "#3B82F6" },
    { titulo: "Enlaces Activos", valor: enlacesActivos, icono: "FiCheckCircle", color: "#10B981" },
    { titulo: "Enlaces Expirados", valor: enlacesExpirados, icono: "FiAlertTriangle", color: "#EF4444" },
  ];

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  return {
    enlaces: enlacesPaginados,
    enlacesFiltrados,
    loading,
    toast,
    busqueda,
    setBusqueda,
    paginaActual,
    setPaginaActual,
    porPagina,
    totalPaginas,
    registroInicio,
    registroFin,
    expandidos,
    toggleExpandir,
    editandoId,
    setEditandoId,
    nuevaFecha,
    setNuevaFecha,
    copiadoId,
    handleCopiar,
    handleExtenderVigencia,
    handlePorPaginaChange,
    tarjetasKpi,
    filtroStyle,
    recargarEnlaces: obtenerEnlaces,
  };
}