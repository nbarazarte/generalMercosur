import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosAdmin from "../../../../api/axiosAdmin";
import axiosSeguridad from "../../../../api/axiosSeguridad";
import { setSistemasOpciones } from "../../../../store/authSlice";

export function useSistemas() {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sistemas, setSistemas] = useState([]);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchSistemasGlobales = async () => {
    try {
      if (!token) throw new Error("Falta el token de sesión.");
      const response = await axiosAdmin.get(`/fetchSistemas`);
      setSistemas(response.data.sistemas || []);
    } catch (error) {
      const isNetworkError =
        error.message === "Network Error" || !error.response;
      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al cargar sistemas:", errorMessage);
      showToast(`Error al cargar los sistemas: ${errorMessage}`, "error");
    }
  };

  const fetchSistemasUsuario = async () => {
    if (!user?.id || !token) return;
    try {
      const response = await axiosSeguridad.get(
        `/sistemas-opciones/${user.id}`,
      );
      if (response.data) {
        const datosActualesJSON = JSON.stringify(user?.sistemasOpciones || []);
        const datosNuevosJSON = JSON.stringify(response.data);
        if (datosActualesJSON !== datosNuevosJSON) {
          dispatch(setSistemasOpciones(response.data));
        }
      }
    } catch (err) {
      console.error("Error obteniendo sistemas y opciones del usuario:", err);
    }
  };

  useEffect(() => {
    if (token) fetchSistemasGlobales();
  }, [token]);

  useEffect(() => {
    if (token) fetchSistemasUsuario();
  }, [user?.id, token]);

  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas],
  );

  const handleGuardarSistema = async (sistemaData) => {
    try {
      if (!token) throw new Error("Falta el token de sesión.");

      setSistemas((prevSistemas) => {
        if (sistemaData.id) {
          return prevSistemas.map((sys) =>
            sys.id === sistemaData.id ? { ...sys, ...sistemaData } : sys,
          );
        }
        return prevSistemas;
      });
      setModal(null);

      const response = await axiosAdmin.post(`/guardarSistema`, sistemaData);
      const { sistema: sistemaProcesado, esEdicion, message } = response.data;

      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      const mensajeExito =
        message ||
        (esEdicion
          ? "Sistema actualizado exitosamente."
          : "Sistema creado exitosamente.");

      showToast(mensajeExito, "success");
      return { success: true, data: sistemaProcesado, message: mensajeExito };
    } catch (error) {
      await fetchSistemasGlobales();
      const isNetworkError =
        error.message === "Network Error" || !error.response;
      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al guardar sistema:", errorMessage);
      showToast(`Error: ${errorMessage}`, "error");
      return { success: false, error: errorMessage };
    }
  };

  const eliminarSistema = async (id) => {
    try {
      if (!token) throw new Error("Falta el token de sesión.");

      setSistemas((prev) => prev.filter((s) => s.id !== id));
      setModal(null);

      await axiosAdmin.delete(`/eliminarSistema/${id}`);
      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast("Sistema eliminado correctamente.", "success");
    } catch (error) {
      await fetchSistemasGlobales();
      showToast("Error al eliminar el sistema", "error");
    }
  };

  const guardarOpcionSistema = async (sistemaId, opcionData) => {
    try {
      if (!token) throw new Error("Falta el token de sesión.");

      setSistemas((prevSistemas) =>
        prevSistemas.map((sys) => {
          if (sys.id !== sistemaId) return sys;
          const opcionesActuales = sys.opciones || [];
          const existe = opcionesActuales.some((o) => o.id === opcionData.id);
          const nuevasOpciones = existe
            ? opcionesActuales.map((o) =>
                o.id === opcionData.id ? { ...o, ...opcionData } : o,
              )
            : [...opcionesActuales, opcionData];
          return { ...sys, opciones: nuevasOpciones };
        }),
      );
      setModal(null);

      const payload = {
        id: opcionData.id,
        sistemaId: sistemaId,
        opcion: opcionData.opcion,
        ruta_opcion: opcionData.ruta_opcion,
        ic: opcionData.ic,
        orden: opcionData.orden,
      };

      const response = await axiosAdmin.post(`/guardarOpcion`, payload);
      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast(
        response.data.message || "Opción guardada correctamente.",
        "success",
      );
    } catch (error) {
      await fetchSistemasGlobales();
      showToast("Error al guardar la opción", "error");
    }
  };

  const eliminarOpcionSistema = async (sistemaId, opcionId) => {
    try {
      if (!token) throw new Error("Falta el token de sesión.");

      setSistemas((prevSistemas) =>
        prevSistemas.map((sys) => {
          if (sys.id !== sistemaId) return sys;
          return {
            ...sys,
            opciones: (sys.opciones || []).filter((o) => o.id !== opcionId),
          };
        }),
      );

      const response = await axiosAdmin.delete(`/eliminarOpcion/${opcionId}`);
      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast(
        response.data.message || "Opción eliminada correctamente.",
        "success",
      );
    } catch (error) {
      await fetchSistemasGlobales();
      showToast("Error al eliminar la opción", "error");
    }
  };

  return {
    sistemas,
    modal,
    setModal,
    toast,
    totalOpciones,
    handleGuardarSistema,
    eliminarSistema,
    guardarOpcionSistema,
    eliminarOpcionSistema,
  };
}
