import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosDrive from "../../../../api/axiosDrive";

export function useCrearEnlace() {
  const [strNombreEnlace, setStrNombreEnlace] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split("T")[0];
  };

  const [fechaMinima] = useState(obtenerFechaMinima());

  const [archivosDrive, setArchivosDrive] = useState([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);

  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 💡 Nuevo estado para el porcentaje

  const user = useSelector((state) => state.auth?.user);
  const usuarioId = user?.id || null;
  const nombre = user?.nombre || "Usuario";
  const apellido = user?.apellido || "";
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkActive =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setIsDarkMode(darkActive);
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

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const response = await axiosDrive.get("/archivos");
        if (response.data && response.data.success) {
          setArchivosDrive(response.data.archivos || []);
        }
      } catch (err) {
        console.error("Error al obtener archivos de Drive:", err);
      }
    };
    fetchArchivos();
  }, []);

  const handleLimpiarTodo = () => {
    setStrNombreEnlace("");
    setFechaExpiracion("");
    setArchivosSeleccionados([]);
    setArchivosNuevos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strNombreEnlace.trim()) {
      showToast(
        "Por favor ingrese un nombre o título para el enlace.",
        "error",
      );
      return;
    }

    if (!fechaExpiracion) {
      showToast(
        "Por favor seleccione una fecha de vencimiento del enlace.",
        "error",
      );
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fechaExpiracion + "T00:00:00");

    if (fechaSeleccionada <= hoy) {
      showToast(
        "La fecha de vencimiento debe ser mayor al día actual.",
        "error",
      );
      return;
    }

    if (archivosSeleccionados.length === 0 && archivosNuevos.length === 0) {
      showToast(
        "Debe asociar al menos un archivo (existente de Drive o nuevo adjunto).",
        "error",
      );
      return;
    }

    if (
      !window.confirm(
        `¿${nombreCompleto}, confirmas que deseas generar este enlace en Drive?`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0); // Reiniciamos el progreso al empezar

    const formData = new FormData();
    formData.append("str_nombre_enlace", strNombreEnlace.trim());
    formData.append("fecha_expiracion", fechaExpiracion);
    formData.append("usuario_id", usuarioId);
    formData.append("str_nombre_usuario", nombreCompleto);

    formData.append("archivos_ids", JSON.stringify(archivosSeleccionados));

    archivosNuevos.forEach((fileObj, index) => {
      if (fileObj.rawFile) {
        formData.append(`archivos_nuevos_${index}`, fileObj.rawFile);
      }
    });

    try {
      const response = await axiosDrive.post("/crear-enlace", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // 💡 Capturamos el evento de progreso de Axios
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data?.success) {
        const { linkDescarga } = response.data;
        const mensajeToast = `Enlace: ${strNombreEnlace.trim()}|||${linkDescarga}`;
        showToast(mensajeToast, "success");
        handleLimpiarTodo();
      }
    } catch (error) {
      console.error("Error al crear enlace de Drive:", error);

      let mensajeError = "Error al procesar la creación del enlace.";
      if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
        if (
          mensajeError.includes("File too large") ||
          mensajeError.includes("LIMIT_FILE_SIZE")
        ) {
          mensajeError =
            "Uno de los archivos seleccionados supera el límite máximo permitido (1 GB).";
        }
      }

      showToast(mensajeError, "error");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const obtenerIconoPorTipo = (tipoMime, nombreArchivo) => {
    if (!tipoMime) {
      const ext = nombreArchivo?.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
        return "FiImage";
      if (["pdf"].includes(ext)) return "FiFileText";
      if (["zip", "rar", "7z"].includes(ext)) return "FiArchive";
      return "FiFile";
    }
    if (tipoMime.startsWith("image/")) return "FiImage";
    if (tipoMime.includes("pdf")) return "FiFileText";
    if (tipoMime.includes("zip") || tipoMime.includes("compressed"))
      return "FiArchive";
    return "FiFile";
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 10px",
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
    strNombreEnlace,
    setStrNombreEnlace,
    fechaExpiracion,
    setFechaExpiracion,
    fechaMinima,
    archivosDrive,
    archivosSeleccionados,
    setArchivosSeleccionados,
    archivosNuevos,
    setArchivosNuevos,
    toast,
    handleCloseToast,
    isDarkMode,
    isSubmitting,
    uploadProgress, // 💡 Exportamos el progreso
    nombreCompleto,
    handleLimpiarTodo,
    handleSubmit,
    obtenerIconoPorTipo,
    inputStyle,
    labelStyle,
  };
}
