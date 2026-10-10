import React, { useState, useEffect } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";
import { useSelector } from "react-redux";
import axios from "axios";
import axiosTickets from "../../utils/axiosTickets";

// Importaciones de BlockNote corregidas
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { es } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function NuevoTicket() {
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridadId, setPrioridadId] = useState("");
  const [canalId, setCanalId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuarioId, setUsuarioId] = useState(""); // Empleado asignado opcional

  // Estados para catálogos dinámicos desde la BD
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  const [listaCanales, setListaCanales] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaPrioridades, setListaPrioridades] = useState([]);

  const [strAsunto, setStrAsunto] = useState("");
  const [strDescripcion, setStrDescripcion] = useState("");
  const [intSla, setIntSla] = useState(24);

  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const user = useSelector((state) => state.auth?.user);
  const nombre = user?.nombre || "Analista";
  const apellido = user?.apellido || "";

  // Detector de tema en tiempo real idéntico al de MiFicha
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

  // Cargar departamentos, usuarios y datos maestros desde el backend al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDeptUsers = await axiosTickets.get("/departamentos-usuarios");
        if (resDeptUsers.data.success) {
          setListaDepartamentos(resDeptUsers.data.departamentos);
          setListaUsuarios(resDeptUsers.data.usuarios);
        }

        const resMaestros = await axiosTickets.get("/datos-maestros");
        if (resMaestros.data.success) {
          setListaCanales(resMaestros.data.canales);
          setListaCategorias(resMaestros.data.categorias);
          setListaPrioridades(resMaestros.data.prioridades);
        }
      } catch (error) {
        console.error("Error al cargar los catálogos del sistema:", error);
      }
    };

    fetchData();
  }, []);

  // Filtrar empleados cada vez que cambie el departamento seleccionado
  useEffect(() => {
    if (departamentoId) {
      const filtrados = listaUsuarios.filter(
        (u) => Number(u.departamento_id) === Number(departamentoId),
      );
      setEmpleadosFiltrados(filtrados);
    } else {
      setEmpleadosFiltrados([]);
    }
    setUsuarioId("");
  }, [departamentoId, listaUsuarios]);

  const obtenerIconoPorTipo = (tipoMime, nombreArchivo) => {
    if (!tipoMime) {
      const ext = nombreArchivo?.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
        return "FiImage";
      if (["pdf"].includes(ext)) return "FiFileText";
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "FiArchive";
      return "FiFile";
    }

    if (tipoMime.startsWith("image/")) return "FiImage";
    if (tipoMime.startsWith("video/")) return "FiVideo";
    if (tipoMime.startsWith("audio/")) return "FiMusic";
    if (tipoMime.includes("pdf")) return "FiFileText";
    if (
      tipoMime.includes("sheet") ||
      tipoMime.includes("excel") ||
      tipoMime.includes("csv")
    )
      return "FiFileSpreadsheet";
    if (tipoMime.includes("word") || tipoMime.includes("document"))
      return "FiFileText";
    if (
      tipoMime.includes("zip") ||
      tipoMime.includes("compressed") ||
      tipoMime.includes("tar")
    )
      return "FiArchive";

    return "FiFile";
  };

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

  const editor = useCreateBlockNote(
    {
      uploadFile,
      dictionary: es,
    },
    [],
  );

  const handleEditorChange = async () => {
    if (!editor) return;
    const blocks = editor.document;
    const textContent = blocks
      .map((block) =>
        block.content ? block.content.map((c) => c.text).join("") : "",
      )
      .join("\n");
    setStrDescripcion(textContent);
  };

  const handleLimpiarTodo = async () => {
    setStrAsunto("");
    setCanalId("");
    setCategoriaId("");
    setPrioridadId("");
    setDepartamentoId("");
    setUsuarioId("");
    setIntSla(24);
    setArchivosAdjuntos([]);
    setStrDescripcion("");

    if (editor) {
      try {
        await editor.replaceBlocks(editor.document, [
          {
            type: "paragraph",
            content: "",
          },
        ]);
      } catch (err) {
        console.error("Error al limpiar los bloques del editor:", err);
      }
    }
  };

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

        **Pruebas Realizadas:**

        1. **[Paso 1 - Título Corto]:** [Descripción clara y accionable].
        2. **[Paso 2 - Título Corto]:** [Descripción clara de la siguiente acción].
        3. **[Paso 3 - Título Corto]:** [Descripción de la solución alternativa].
        4. **[Paso 4 - Título Corto]:** [Instrucciones para la nueva validación].`,
        stream: false,
      });

      const textoGenerado =
        response.data.response || "No se pudo generar el texto.";
      setIsGeneratingAI(false);

      if (editor && editor.document.length > 0) {
        await editor.updateBlock(editor.document[0], {
          type: "paragraph",
          content: "",
        });

        if (editor.document.length > 1) {
          const extraBlocks = editor.document.slice(1);
          await editor.removeBlocks(extraBlocks);
        }
      }

      let textoActual = "";
      for (let i = 0; i < textoGenerado.length; i++) {
        textoActual += textoGenerado[i];
        if (editor && editor.document.length > 0) {
          await editor.updateBlock(editor.document[0], {
            type: "paragraph",
            content: textoActual,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    } catch (error) {
      console.error("Error de conexión con Ollama:", error);
      alert(
        "No se pudo conectar con Ollama. Verifique que el servicio y la red estén activos.",
      );
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmado = window.confirm(
      `¿${nombre}, confirmas que realizaste las acciones descritas y estás de acuerdo con la redacción final para crear este ticket?`,
    );

    if (!confirmado) return;

    const descripcionContent = editor ? editor.document : [];
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
    formData.append("departamento_id", Number(departamentoId));

    if (usuarioId) {
      formData.append("usuario_asignado_id", Number(usuarioId));
    }

    formData.append("int_sla", Number(intSla));
    formData.append("estatus_id", 1);

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
        await handleLimpiarTodo();
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
      <style>{`

      `}</style>

      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            <div
              className="ticket-grid-container"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.6fr",
                gap: "24px",
                alignItems: "start",
              }}
            >
              {/* Columna Izquierda */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                  border: "1px solid var(--merco-border, #ccc)",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <div className="field">
                  <label>De (Remitente)</label>
                  <input
                    className="inp"
                    value={`${nombre} ${apellido} <${user?.email || "analista@mercosur.com"}>`}
                    readOnly
                    disabled
                  />
                </div>

                <div className="field">
                  <label>Para (Departamento)</label>
                  <select
                    className="inp"
                    value={departamentoId}
                    onChange={(e) => setDepartamentoId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione departamento...</option>
                    {listaDepartamentos.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.str_nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Empleado Asignado (Opcional)</label>
                  <select
                    className="inp"
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    disabled={!departamentoId}
                  >
                    <option value="">
                      {departamentoId
                        ? "Sin empleado específico (Opcional)"
                        : "Primero seleccione un departamento..."}
                    </option>
                    {empleadosFiltrados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.str_nombre} {emp.str_apellido} ({emp.str_email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
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

                <div className="field">
                  <label>SLA (Horas)</label>
                  <input
                    type="number"
                    className="inp"
                    value={intSla}
                    onChange={(e) => setIntSla(e.target.value)}
                  />
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--merco-border, #ccc)",
                    margin: "4px 0",
                  }}
                />

                {/* --- CANAL DE RECEPCIÓN (Responsive Automático) --- */}
                <div className="field">
                  <label style={{ marginBottom: "8px", display: "block" }}>
                    Canal de Recepción
                  </label>

                  {/* Versión Escritorio (Radios) */}
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "6px" }}
                  >
                    {listaCanales.map((c) => {
                      const isSelected = Number(canalId) === c.id;
                      return (
                        <label
                          key={c.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${
                              isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "var(--merco-border, #ccc)"
                            }`,
                            fontWeight: isSelected ? "600" : "400",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="canal_id_desk"
                            value={c.id}
                            checked={isSelected}
                            onChange={(e) => setCanalId(e.target.value)}
                            required
                            style={{
                              appearance: "none",
                              WebkitAppearance: "none",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              border: `2px solid ${
                                isSelected
                                  ? "var(--merco-accent, #f95700)"
                                  : "var(--merco-border, #999)"
                              }`,
                              outline: "none",
                              backgroundColor: isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "transparent",
                              boxShadow: isSelected
                                ? isDarkMode
                                  ? "inset 0 0 0 2px #1e1e1e"
                                  : "inset 0 0 0 2px #fff"
                                : "none",
                              cursor: "pointer",
                              margin: 0,
                              display: "grid",
                              placeContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          />
                          {c.str_nombre}
                        </label>
                      );
                    })}
                  </div>

                  {/* Versión Móvil (Select) */}
                  <div className="mobile-selector">
                    <select
                      className="inp"
                      value={canalId}
                      onChange={(e) => setCanalId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione canal...</option>
                      {listaCanales.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* --- CATEGORÍA DEL REQUERIMIENTO (Responsive Automático) --- */}
                <div className="field">
                  <label style={{ marginBottom: "8px", display: "block" }}>
                    Categoría del Requerimiento
                  </label>

                  {/* Versión Escritorio (Radios) */}
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "6px" }}
                  >
                    {listaCategorias.map((cat) => {
                      const isSelected = Number(categoriaId) === cat.id;
                      return (
                        <label
                          key={cat.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${
                              isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "var(--merco-border, #ccc)"
                            }`,
                            fontWeight: isSelected ? "600" : "400",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="categoria_id_desk"
                            value={cat.id}
                            checked={isSelected}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                            style={{
                              appearance: "none",
                              WebkitAppearance: "none",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              border: `2px solid ${
                                isSelected
                                  ? "var(--merco-accent, #f95700)"
                                  : "var(--merco-border, #999)"
                              }`,
                              outline: "none",
                              backgroundColor: isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "transparent",
                              boxShadow: isSelected
                                ? isDarkMode
                                  ? "inset 0 0 0 2px #1e1e1e"
                                  : "inset 0 0 0 2px #fff"
                                : "none",
                              cursor: "pointer",
                              margin: 0,
                              display: "grid",
                              placeContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          />
                          {cat.str_nombre}
                        </label>
                      );
                    })}
                  </div>

                  {/* Versión Móvil (Select) */}
                  <div className="mobile-selector">
                    <select
                      className="inp"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione categoría...</option>
                      {listaCategorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* --- NIVEL DE PRIORIDAD (Responsive Automático) --- */}
                <div className="field">
                  <label style={{ marginBottom: "8px", display: "block" }}>
                    Nivel de Prioridad
                  </label>

                  {/* Versión Escritorio (Radios) */}
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "6px" }}
                  >
                    {listaPrioridades.map((p) => {
                      const isSelected = Number(prioridadId) === p.id;
                      return (
                        <label
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${
                              isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "var(--merco-border, #ccc)"
                            }`,
                            fontWeight: isSelected ? "600" : "400",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="prioridad_id_desk"
                            value={p.id}
                            checked={isSelected}
                            onChange={(e) => setPrioridadId(e.target.value)}
                            required
                            style={{
                              appearance: "none",
                              WebkitAppearance: "none",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              border: `2px solid ${
                                isSelected
                                  ? "var(--merco-accent, #f95700)"
                                  : "var(--merco-border, #999)"
                              }`,
                              outline: "none",
                              backgroundColor: isSelected
                                ? "var(--merco-accent, #f95700)"
                                : "transparent",
                              boxShadow: isSelected
                                ? isDarkMode
                                  ? "inset 0 0 0 2px #1e1e1e"
                                  : "inset 0 0 0 2px #fff"
                                : "none",
                              cursor: "pointer",
                              margin: 0,
                              display: "grid",
                              placeContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          />
                          {p.str_nombre}
                        </label>
                      );
                    })}
                  </div>

                  {/* Versión Móvil (Select) */}
                  <div className="mobile-selector">
                    <select
                      className="inp"
                      value={prioridadId}
                      onChange={(e) => setPrioridadId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione prioridad...</option>
                      {listaPrioridades.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: BlockNote y Multimedia */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div>
                  <div
                    className="field"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <label style={{ margin: 0, lineHeight: "1" }}>
                      Descripción
                    </label>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleGenerarConIA}
                      style={{
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--merco-border, #ccc)",
                        borderRadius: "6px",
                      }}
                      disabled={isGeneratingAI}
                      title={
                        isGeneratingAI
                          ? "Redactando nueva descripción..."
                          : "Mejorar redacción del ticket con IA"
                      }
                    >
                      <DynamicIcon
                        name="FaRobot"
                        style={{ fontSize: "15px", color: "#eab308" }}
                      />
                    </button>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      border: "1px solid var(--merco-border, #ccc)",
                      borderRadius: 6,
                      padding: "4px",
                      minHeight: "500px",
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
                            ? "rgba(0, 0, 0, 0.35)"
                            : "rgba(255, 255, 255, 0.35)",
                          zIndex: 10,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(4px)",
                          borderRadius: "inherit",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontFamily: "monospace",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            padding: "14px 20px",
                            borderRadius: "8px",
                            border: `1px solid ${isDarkMode ? "#334155" : "#cbd5e1"}`,
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
                            }}
                          />
                          Generando formato al ticket...
                        </div>
                      </div>
                    )}

                    <div style={{ width: "100%", height: "100%" }}>
                      {editor && (
                        <BlockNoteView
                          editor={editor}
                          theme={isDarkMode ? "dark" : "light"}
                          onChange={handleEditorChange}
                        />
                      )}
                    </div>
                  </div>

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
                      <b
                        style={{
                          display: "block",
                          marginBottom: 6,
                          color: "var(--merco-text)",
                        }}
                      >
                        Archivos multimedia adjuntos ({archivosAdjuntos.length}
                        ):
                      </b>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {archivosAdjuntos.map((file, index) => {
                          const nombreIcono = obtenerIconoPorTipo(
                            file.type,
                            file.name,
                          );

                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: isDarkMode
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "var(--merco-bg-card, #fff)",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                border: "1px solid var(--merco-border, #ccc)",
                                color: "var(--merco-text)",
                              }}
                            >
                              <DynamicIcon
                                name={nombreIcono}
                                style={{
                                  fontSize: "16px",
                                  color: "var(--merco-accent, #f95700)",
                                }}
                              />

                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "200px",
                                  color: "var(--merco-text)",
                                }}
                                title={file.name}
                              >
                                {file.name} ({Math.round(file.size / 1024)} KB)
                              </span>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{
                                  fontSize: "11px",
                                  color: "var(--merco-danger, #d1435b)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  setArchivosAdjuntos(
                                    archivosAdjuntos.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones inferiores */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--merco-border, #ccc)",
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
                <DynamicIcon name="FiSave" /> Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}
