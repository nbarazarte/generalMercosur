import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosDrive from "../../../../api/axiosDrive";

export function useAcortadorUrl() {
  const [strTitulo, setStrTitulo] = useState("");
  const [strUrlOriginal, setStrUrlOriginal] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [urlsRecientes, setUrlsRecientes] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector((state) => state.auth?.user);
  const usuarioId = user?.id || null;
  const nombreCompleto =
    `${user?.nombre || "Usuario"} ${user?.apellido || ""}`.trim();

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split("T")[0];
  };
  const [fechaMinima] = useState(obtenerFechaMinima());

  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark"),
      );
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

  const showToast = (message, type = "success") => setToast({ message, type });
  const handleCloseToast = () => setToast(null);

  const cargarUrlsRecientes = useCallback(async () => {
    setLoadingLista(true);
    try {
      const response = await axiosDrive.get("/urls-cortas", {
        params: usuarioId ? { usuario_id: usuarioId } : {},
      });
      if (response.data?.success) {
        setUrlsRecientes(response.data.urls || []);
      }
    } catch (err) {
      console.error("Error al cargar historial de URLs:", err);
    } finally {
      setLoadingLista(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarUrlsRecientes();
  }, [cargarUrlsRecientes]);

  const handleLimpiar = () => {
    setStrTitulo("");
    setStrUrlOriginal("");
    setFechaExpiracion("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strTitulo.trim()) {
      showToast(
        "Ingrese un título o referencia para identificar el enlace.",
        "error",
      );
      return;
    }

    if (!strUrlOriginal.trim()) {
      showToast("Pegue la URL larga que desea acortar.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosDrive.post("/acortar-url", {
        str_titulo: strTitulo.trim(),
        str_url_original: strUrlOriginal.trim(),
        fecha_expiracion: fechaExpiracion || null,
        usuario_id: usuarioId,
        str_nombre_usuario: nombreCompleto,
      });

      if (response.data?.success) {
        const { linkCorto } = response.data;
        showToast(`${strTitulo.trim()}|||${linkCorto}`, "success");
        handleLimpiar();
        cargarUrlsRecientes();
      }
    } catch (error) {
      const msg = error.response?.data?.error || "No se pudo acortar la URL.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "7px 10px",
    border: "1px solid var(--merco-border, #ccc)",
    borderRadius: "6px",
    fontFamily: "inherit",
    fontSize: "13px",
    background: "var(--input, var(--merco-surface))",
    color: "var(--merco-text)",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "4px",
    display: "block",
  };

  return {
    strTitulo,
    setStrTitulo,
    strUrlOriginal,
    setStrUrlOriginal,
    fechaExpiracion,
    setFechaExpiracion,
    fechaMinima,
    urlsRecientes,
    loadingLista,
    toast,
    handleCloseToast,
    isDarkMode,
    isSubmitting,
    handleLimpiar,
    handleSubmit,
    inputStyle,
    labelStyle,
  };
}
