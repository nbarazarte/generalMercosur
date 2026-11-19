import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosDrive from "../../../../api/axiosDrive";

export function useListarUrlsCortas() {
  const [todasLasUrls, setTodasLasUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [expandidos, setExpandidos] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [copiadoId, setCopiadoId] = useState(null);

  const user = useSelector((state) => state.auth?.user);
  const usuarioId = user?.id || null;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosDrive.get("/urls-cortas", {
        params: usuarioId ? { usuario_id: usuarioId } : {},
      });
      if (response.data?.success) {
        setTodasLasUrls(response.data.urls || []);
      }
    } catch (err) {
      console.error("Error al obtener URLs cortas:", err);
      showToast("Error al cargar el listado de URLs acortadas.", "error");
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const urlsFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return todasLasUrls;
    return todasLasUrls.filter(
      (u) =>
        u.str_titulo?.toLowerCase().includes(termino) ||
        u.str_nombre_usuario?.toLowerCase().includes(termino) ||
        u.str_url_original?.toLowerCase().includes(termino) ||
        u.codigo_corto?.toLowerCase().includes(termino),
    );
  }, [todasLasUrls, busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, porPagina]);

  const totalPaginas = Math.max(1, Math.ceil(urlsFiltradas.length / porPagina));
  const registroInicio =
    urlsFiltradas.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const registroFin = Math.min(paginaActual * porPagina, urlsFiltradas.length);

  const urlsPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return urlsFiltradas.slice(inicio, inicio + porPagina);
  }, [urlsFiltradas, paginaActual, porPagina]);

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopiar = (id, texto) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    showToast("Enlace corto copiado al portapapeles.");
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleExtenderVigencia = async (id) => {
    if (!nuevaFecha) {
      showToast("Seleccione una nueva fecha de vencimiento.", "error");
      return;
    }
    try {
      const response = await axiosDrive.put(`/urls-cortas/extender/${id}`, {
        nueva_fecha_expiracion: nuevaFecha,
      });
      if (response.data?.success) {
        showToast("Vigencia actualizada correctamente.");
        setEditandoId(null);
        setNuevaFecha("");
        fetchUrls();
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "No se pudo actualizar la vigencia.",
        "error",
      );
    }
  };

  const handlePorPaginaChange = (e) => {
    setPorPagina(Number(e.target.value));
  };

  const tarjetasKpi = useMemo(() => {
    const total = todasLasUrls.length;
    const activas = todasLasUrls.filter((u) => !u.estaExpirado).length;
    const expiradas = total - activas;
    const totalClics = todasLasUrls.reduce(
      (acc, u) => acc + (u.totalClics || 0),
      0,
    );

    return [
      {
        titulo: "Total URLs Acortadas",
        valor: total,
        icono: "FiLink",
        color: "#f95700",
      },
      {
        titulo: "Enlaces Activos",
        valor: activas,
        icono: "FiCheckCircle",
        color: "#10b981",
      },
      {
        titulo: "Enlaces Expirados",
        valor: expiradas,
        icono: "FiClock",
        color: "#ef4444",
      },
      {
        titulo: "Total de Clics",
        valor: totalClics,
        icono: "FiMousePointer",
        color: "#2563eb",
      },
    ];
  }, [todasLasUrls]);

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid var(--merco-border, #ccc)",
    background: "var(--merco-surface)",
    color: "inherit",
    fontSize: "13px",
  };

  return {
    urls: urlsPaginadas,
    urlsFiltradas,
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
    recargarUrls: fetchUrls,
  };
}
