import { useState, useEffect, useMemo } from "react";
import axiosAdmin from "../../../../api/axiosAdmin";

export function useDashboard() {
  const [sistemas, setSistemas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [kpis, setKpis] = useState({
    total_sistemas: 0,
    total_opciones: 0,
    total_usuarios: 0,
    total_usuarios_activos: 0,
    total_usuarios_inactivos: 0,
    total_roles: 0,
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [flag, setFlag] = useState(false);

  const [accessSearch, setAccessSearch] = useState("");
  const [accessPage, setAccessPage] = useState(1);
  const itemsPerPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSistemas, resUsuarios, resKpis] = await Promise.all([
          axiosAdmin.get("/fetchSistemas"),
          axiosAdmin.get("/fetchUsuarios"),
          axiosAdmin
            .get("/dashboard/kpis")
            .catch(() => ({ data: { data: {} } })),
        ]);

        const dataArray = Array.isArray(resSistemas.data)
          ? resSistemas.data
          : Array.isArray(resSistemas.data?.data)
            ? resSistemas.data.data
            : resSistemas.data?.sistemas || [];

        setSistemas(dataArray);
        setUsuarios(resUsuarios.data || []);
        if (resKpis.data?.data) {
          setKpis(resKpis.data.data);
        } else if (resKpis.data) {
          setKpis(resKpis.data);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        showToast("Error al obtener los datos del sistema.", "error");
      }
    };

    fetchData();
  }, [flag]);

  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas],
  );

  const totalUsuariosPendientes = useMemo(
    () => usuarios.filter((u) => u.estado === "pending").length,
    [usuarios],
  );

  const filteredAccessUsuarios = useMemo(() => {
    if (!accessSearch.trim()) return usuarios;
    const query = accessSearch.toLowerCase();
    return usuarios.filter(
      (u) =>
        (u.nombre && u.nombre.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)),
    );
  }, [usuarios, accessSearch]);

  const totalAccessPages =
    Math.ceil(filteredAccessUsuarios.length / itemsPerPage) || 1;

  const paginatedAccessUsuarios = useMemo(() => {
    const start = (accessPage - 1) * itemsPerPage;
    return filteredAccessUsuarios.slice(start, start + itemsPerPage);
  }, [filteredAccessUsuarios, accessPage]);

  const guardarOpcionSistema = async (sistemaId, opcionData) => {
    try {
      const response = await axiosAdmin.post("/guardarOpcion", {
        sistemaId,
        ...opcionData,
      });
      showToast(
        response.data?.message || "Ruta guardada correctamente.",
        "success",
      );
      setFlag(!flag);
      setModal(null);
    } catch (err) {
      console.error("Error al guardar opción:", err);
      const msg = err.response?.data?.error || err.message;
      showToast(`Error al guardar opción: ${msg}`, "error");
    }
  };

  return {
    sistemas,
    usuarios,
    kpis,
    modal,
    setModal,
    toast,
    accessSearch,
    setAccessSearch,
    accessPage,
    setAccessPage,
    totalOpciones,
    totalUsuariosPendientes,
    filteredAccessUsuarios,
    totalAccessPages,
    paginatedAccessUsuarios,
    guardarOpcionSistema,
  };
}
