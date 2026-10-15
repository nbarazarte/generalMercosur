import { useState, useEffect, useCallback } from "react";
import axiosAdmin from "../../../../api/axiosAdmin";

export function usePermisosData(token) {
  const [usuarios, setUsuarios] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [catRoles, setCatRoles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [flag, setFlag] = useState(false);

  const recargar = useCallback(() => setFlag((prev) => !prev), []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [resSistemas, resRoles, resCatRoles, resUsuarios, resDeptos] =
          await Promise.all([
            axiosAdmin.get("/fetchSistemas"),
            axiosAdmin.get("/fetchRolesSistemasOpciones"),
            axiosAdmin.get("/fetchCatRoles"),
            axiosAdmin.get("/fetchUsuarios"),
            axiosAdmin.get("/fetchDepartamentos"),
          ]);

        const dataArray = Array.isArray(resSistemas.data)
          ? resSistemas.data
          : Array.isArray(resSistemas.data?.data)
            ? resSistemas.data.data
            : resSistemas.data?.sistemas || [];

        const sistemasMapeados = dataArray.map((row) => ({
          id: row.id,
          nombre: row.nombre,
          ic: row.ic || "FiGrid",
          color: row.color || "#2f6fed",
          opciones: row.opciones || [],
        }));
        setSistemas(sistemasMapeados);

        const rolesMapeados = resRoles.data.map((row) => ({
          id: row.id || row.rol_sistema_id,
          rol_id: row.rol_id,
          sistema_id: row.sistema_id,
          nombre: row.nombre || row.rol,
          desc: row.desc || row.str_descripcion,
          ic: row.ic || row.str_icono || "FiShield",
          color: row.color || row.str_color || "#2f6fed",
          bg:
            row.bg ||
            (row.color || row.str_color
              ? `${row.color || row.str_color}22`
              : "rgba(47,111,237,.12)"),
          sistemas: Array.isArray(row.sistemas)
            ? row.sistemas
            : typeof row.sistemas === "string" && row.sistemas !== "all"
              ? [row.sistemas]
              : row.sistemas || "all",
          permisos: Array.isArray(row.permisos)
            ? row.permisos
            : typeof row.permisos === "string" && row.permisos.trim() !== ""
              ? row.permisos.split(",").map((p) => p.trim())
              : [],
          opcion_ids: Array.isArray(row.opcion_ids)
            ? row.opcion_ids.map(Number)
            : [],
        }));
        setRoles(rolesMapeados);
        setCatRoles(resCatRoles.data);
        setUsuarios(resUsuarios.data);
        setDepartamentos(resDeptos.data);
      } catch (err) {
        console.error("Error obteniendo datos:", err);
      }
    };

    fetchData();
  }, [flag, token]);

  return {
    usuarios,
    setUsuarios,
    sistemas,
    roles,
    catRoles,
    departamentos,
    recargar,
  };
}
