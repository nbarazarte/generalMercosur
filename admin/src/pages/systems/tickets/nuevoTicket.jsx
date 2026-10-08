import React, { useState, useEffect } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";
import { useSelector } from "react-redux";
import axios from "axios"; // Axios plano para peticiones externas independientes (como Ollama)
import axiosTickets from "../../utils/axiosTickets"; // axiosTickets para las peticiones seguras al backend de Mercosur

// Importaciones de BlockNote corregidas
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { es } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

/* ====== CONSTANTES DE CONFIGURACIÓN Y VALORES ====== */
const CANALES = [
  "Wasapi",
  "Tickets",
  "Presencial",
  "Telefónico",
  "Correo electrónico",
  "Telegram",
  "Instagram",
];

const CATEGORIAS = [
  { id: 1, nombre: "Firma Electrónica" },
  { id: 2, nombre: "Web App" },
  { id: 3, nombre: "Mercado de Valores" },
  { id: 4, nombre: "Generar Certificado" },
  { id: 5, nombre: "Caja Venezolana de Valores" },
  { id: 6, nombre: "Otros" },
];

const PRIORIDADES_LIST = [
  { id: 1, nombre: "Baja" },
  { id: 2, nombre: "Media" },
  { id: 3, nombre: "Alta" },
];

export default function NuevoTicket() {
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridadId, setPrioridadId] = useState("");
  const [canalId, setCanalId] = useState("");
  const [strAsunto, setStrAsunto] = useState("");
  const [strDescripcion, setStrDescripcion] = useState("");
  const [intSla, setIntSla] = useState(24);

  // Estado para almacenar los archivos multimedia adjuntos en el editor
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);

  // Estado para la IA
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const user = useSelector((state) => state.auth?.user);
  const nombre = user?.nombre;
  const apellido = user?.apellido;

  // Estado reactivo para el tema basado en la clase del documento
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"),
  );

  // Observer para detectar cambios en tiempo real cuando haces clic en cambiar tema
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

  // Función para manejar la subida local de archivos multimedia por arrastre y guardarlos en el estado
  const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result;

        setArchivosAdjuntos((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            rawFile: file,
          },
        ]);

        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Inicialización del editor recreándose cada vez que cambia isDarkMode
  const editor = useCreateBlockNote(
    {
      uploadFile,
      dictionary: es,
    },
    [isDarkMode],
  );

  // Captura el contenido del editor en texto plano cada vez que cambie
  const handleEditorChange = async () => {
    const blocks = editor.document;
    const textContent = blocks
      .map((block) =>
        block.content ? block.content.map((c) => c.text).join("") : "",
      )
      .join("\n");
    setStrDescripcion(textContent);
  };

  // Función centralizada para limpiar todo el formulario y dejar el editor completamente vacío sin líneas residuales
  const handleLimpiarTodo = async () => {
    setStrAsunto("");
    setCanalId("");
    setCategoriaId("");
    setPrioridadId("");
    setIntSla(24);
    setArchivosAdjuntos([]);
    setStrDescripcion("");

    if (editor) {
      // Reemplaza todo el documento por un único bloque completamente vacío
      await editor.replaceBlocks(editor.document, [
        {
          type: "paragraph",
          content: "",
        },
      ]);
    }
  };

  // Función conectada a Ollama local usando Axios plano
  const handleGenerarConIA = async () => {
    if (!strDescripcion.trim()) {
      alert(
        "Por favor escriba algo en el editor de Descripción primero para que la IA pueda redactarlo.",
      );
      return;
    }
    setIsGeneratingAI(true);

    const urlIA = import.meta.env.VITE_URL_API_OLLAMA;
    const modelo = import.meta.env.VITE_URL_MODELO_OLLAMA;

    try {
      const response = await axios.post(urlIA, {
        model: modelo,
        prompt: `Actúa como un analista de atencion al cliente de la app de la casa de bolsa Mercosur Casa de Bolsa S.A y redacta una descripción detallada y profesional para un ticket de soporte basándote en la siguiente nota o borrador del analista: "${strDescripcion}". 

        Utiliza estrictamente la siguiente estructura de salida:

        **Ticket de Soporte: [Insertar un breve Resumen del Asunto en Mayúsculas Iniciales]**

        **Descripción del Problema:**
        [Redacta una breve descripción técnica y formal del problema basado en el texto proporcionado, destacando su impacto o criticidad].

        **Pruebas Realizadas: [Redactalas en pasado y no repitas pasos ya realizados (no redundes)]**

        1. **[Paso 1 - Título Corto]:** [Descripción clara y accionable de la primera acción técnica o de verificación].
        2. **[Paso 2 - Título Corto]:** [Descripción clara de la siguiente acción de diagnóstico o revisión de servicios].
        3. **[Paso 3 - Título Corto]:** [Descripción de la solución alternativa o aplicación del procedimiento secundario].
        4. **[Paso 4 - Título Corto]:** [Instrucciones para la nueva validación junto con el usuario].`,
        stream: false,
      });

      const textoGenerado =
        response.data.response || "No se pudo generar el texto.";

      if (editor.document.length > 0) {
        await editor.updateBlock(editor.document[0], {
          type: "paragraph",
          content: textoGenerado,
        });

        if (editor.document.length > 1) {
          const extraBlocks = editor.document.slice(1);
          await editor.removeBlocks(extraBlocks);
        }
      } else {
        await editor.insertBlocks(
          [
            {
              type: "paragraph",
              content: textoGenerado,
            },
          ],
          editor.document[0],
          "after",
        );
      }
    } catch (error) {
      console.error("Error de conexión con Ollama:", error);
      alert(
        "No se pudo conectar con Ollama. Verifique que el servicio y la red estén activos.",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmado = window.confirm(
      `¿${nombre ?? "Estimado"}, confirmas que realizaste las acciones descritas antes de crear este ticket?`,
    );

    if (!confirmado) return;

    const descripcionContent = editor.document;

    const extraerTextoDeDescripcion = (descripcionArray) => {
      if (!Array.isArray(descripcionArray)) return "";

      return descripcionArray
        .map((block) => {
          if (!block.content || !Array.isArray(block.content)) return "";
          return block.content.map((c) => c.text || "").join("");
        })
        .join("\n");
    };

    const textoPlano = extraerTextoDeDescripcion(descripcionContent);

    const formData = new FormData();
    formData.append("str_asunto", strAsunto);
    formData.append("str_descripcion", textoPlano);
    formData.append("canal_id", Number(canalId));
    formData.append("categoria_id", Number(categoriaId));
    formData.append("prioridad_id", Number(prioridadId));
    formData.append("int_sla", Number(intSla));
    formData.append("estatus_id", 1); // Pendiente
    formData.append("departamento_id", 1);

    archivosAdjuntos.forEach((fileObj, index) => {
      if (fileObj.rawFile) {
        formData.append(`multimedia_${index}`, fileObj.rawFile);
      }
    });

    try {
      const response = await axiosTickets.post("/crear", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Ticket creado y archivos multimedia guardados con éxito.");
        await handleLimpiarTodo(); // Limpia campos y deja el editor limpio sin líneas de más
      }
    } catch (error) {
      console.error("Error al enviar el ticket:", error);
      alert(
        error.response?.data?.error ||
          "Ocurrió un error al procesar la solicitud del ticket.",
      );
    }
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Nuevo Ticket">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <div className="ma-card" style={{ padding: "28px" }}>
          <form onSubmit={handleSubmit}>
            {/* SECCIÓN 1: PARÁMETROS GENERALES */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "var(--merco-text)",
                }}
              >
                1. Parámetros Generales
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div className="field">
                  <label>Canal</label>
                  <select
                    className="inp"
                    value={canalId}
                    onChange={(e) => setCanalId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione canal...</option>
                    {CANALES.map((c, idx) => (
                      <option key={idx} value={idx + 1}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Categoría</label>
                  <select
                    className="inp"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione categoría...</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Prioridad</label>
                  <select
                    className="inp"
                    value={prioridadId}
                    onChange={(e) => setPrioridadId(e.target.value)}
                    required
                  >
                    <option value="">Prioridad...</option>
                    {PRIORIDADES_LIST.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>SLA en Horas</label>
                  <input
                    type="number"
                    className="inp"
                    value={intSla}
                    onChange={(e) => setIntSla(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ASUNTO EN UNA SOLA FILA */}
            <div style={{ marginBottom: "20px" }}>
              <div className="field" style={{ width: "100%" }}>
                <label>Asunto</label>
                <input
                  className="inp"
                  value={strAsunto}
                  onChange={(e) => setStrAsunto(e.target.value)}
                  placeholder="Resumen breve del requerimiento..."
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* SECCIÓN 3: DESCRIPCIÓN Y MULTIMEDIA */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    margin: 0,
                    color: "var(--merco-text)",
                  }}
                >
                  2. Descripción Detallada y Multimedia
                </h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerarConIA}
                  disabled={isGeneratingAI}
                  title="Generar formato"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <DynamicIcon
                    name="FaRobot"
                    style={{ fontSize: "15px", color: "#eab308" }}
                  />
                  {isGeneratingAI
                    ? "Comenzando..."
                    : "Mejorar redacción del ticket con IA"}
                </button>
              </div>

              {/* Contenedor principal del editor con position relative para loader */}
              <div
                style={{
                  position: "relative",
                  border: "1px solid var(--merco-border, #ccc)",
                  borderRadius: 6,
                  padding: "4px",
                  minHeight: "420px",
                }}
              >
                {isGeneratingAI && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: isDarkMode
                        ? "rgba(15, 23, 42, 0.35)"
                        : "rgba(255, 255, 255, 0.35)",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      borderRadius: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontFamily: "monospace",
                        backgroundColor: isDarkMode
                          ? "rgba(15, 23, 42, 0.85)"
                          : "rgba(255, 255, 255, 0.85)",
                        color: isDarkMode ? "#ffffff" : "#000000",
                        padding: "14px 20px",
                        borderRadius: "8px",
                        border: `1px solid ${isDarkMode ? "#1e293b" : "#cbd5e1"}`,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      <DynamicIcon
                        name="FaRobot"
                        style={{
                          color: "#eab308",
                          fontSize: "20px",
                          animation: "spin 2s linear infinite",
                        }}
                      />
                      Generando redacción...
                    </div>
                  </div>
                )}

                <div
                  key={isDarkMode ? "editor-dark" : "editor-light"}
                  style={{ width: "100%", height: "100%" }}
                >
                  <BlockNoteView
                    editor={editor}
                    theme={isDarkMode ? "dark" : "light"}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>

              {/* LISTADO DE ARCHIVOS MULTIMEDIA ADJUNTOS */}
              {archivosAdjuntos.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "var(--merco-bg-subtle, rgba(0,0,0,0.03))",
                    borderRadius: 6,
                    fontSize: 12.5,
                    border: "1px solid var(--merco-border, #ccc)",
                  }}
                >
                  <b style={{ display: "block", marginBottom: 6 }}>
                    Archivos multimedia adjuntos ({archivosAdjuntos.length}):
                  </b>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {archivosAdjuntos.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: isDarkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          border: "1px solid var(--merco-border, #ddd)",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}
                          title={file.name}
                        >
                          📎 {file.name} ({Math.round(file.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{
                            fontSize: "11px",
                            padding: "1px 5px",
                            color: "var(--merco-danger, #d1435b)",
                          }}
                          onClick={() =>
                            setArchivosAdjuntos(
                              archivosAdjuntos.filter((_, i) => i !== index),
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
                borderTop: "1px solid var(--merco-border, #eee)",
                paddingTop: "18px",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLimpiarTodo}
                disabled={isGeneratingAI}
              >
                Limpiar Formulario
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGeneratingAI}
              >
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}
