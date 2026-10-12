import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";
import { useSelector } from "react-redux";
import axios from "axios";
import axiosTickets from "../../utils/axiosTickets";

// Importaciones de BlockNote
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { es } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function NuevoTicket() {
  const [tipoTicketId, setTipoTicketId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridadId, setPrioridadId] = useState("");
  const [canalId, setCanalId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");

  // Estados para cédula y correo del cliente externo
  const [strCedulaCliente, setStrCedulaCliente] = useState("");
  const [strCorreoCliente, setStrCorreoCliente] = useState("");
  const [correoInvalido, setCorreoInvalido] = useState(false);

  const correoInputRef = useRef(null);

  // Estados para catálogos dinámicos
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  const [listaCanales, setListaCanales] = useState([]);
  const [listaCategoriasExternas, setListaCategoriasExternas] = useState([]);
  const [listaCategoriasInternas, setListaCategoriasInternas] = useState([]);
  const [listaPrioridades, setListaPrioridades] = useState([]);
  const [listaTipoTicket, setListaTipoTicket] = useState([]);

  const [strAsunto, setStrAsunto] = useState("");
  const [strDescripcion, setStrDescripcion] = useState("");

  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [toast, setToast] = useState(null);

  const user = useSelector((state) => state.auth?.user);
  const nombre = user?.nombre || "Analista";
  const apellido = user?.apellido || "";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Detector de tema en tiempo real
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

  // Cargar catálogos
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
          setListaCategoriasExternas(resMaestros.data.categoria_externa || []);
          setListaCategoriasInternas(resMaestros.data.categoria_interna || []);
          setListaPrioridades(resMaestros.data.prioridades);
          setListaTipoTicket(resMaestros.data.tipoTicket);

          if (
            resMaestros.data.tipoTicket &&
            resMaestros.data.tipoTicket.length > 0
          ) {
            const externoDefault = resMaestros.data.tipoTicket.find(
              (t) =>
                t.str_nombre.toLowerCase().includes("externo") ||
                t.str_nombre.toLowerCase().includes("app"),
            );
            setTipoTicketId(
              externoDefault
                ? String(externoDefault.id)
                : String(resMaestros.data.tipoTicket[0].id),
            );
          }
        }
      } catch (error) {
        console.error("Error al cargar los catálogos del sistema:", error);
        showToast("Error al cargar los catálogos del sistema.", "error");
      }
    };

    fetchData();
  }, []);

  // Filtrar empleados por departamento
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

  const handleTipoTicketChange = (idSeleccionado) => {
    setTipoTicketId(idSeleccionado);
    setCategoriaId("");
    setCorreoInvalido(false);

    const seleccionadoObj = listaTipoTicket.find(
      (t) => Number(t.id) === Number(idSeleccionado),
    );
    if (
      seleccionadoObj &&
      seleccionadoObj.str_nombre.toLowerCase().includes("interno")
    ) {
      setCanalId("");
    }
  };

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
    if (listaTipoTicket.length > 0) {
      setTipoTicketId(String(listaTipoTicket[0].id));
    } else {
      setTipoTicketId("");
    }
    setStrAsunto("");
    setCanalId("");
    setCategoriaId("");
    setPrioridadId("");
    setDepartamentoId("");
    setUsuarioId("");
    setStrCedulaCliente("");
    setStrCorreoCliente("");
    setCorreoInvalido(false);
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
      showToast(
        "Por favor escriba algo en el editor de Descripción primero para que la IA pueda redactarlo.",
        "error",
      );
      return;
    }
    setIsGeneratingAI(true);

    const urlIA = import.meta.env.VITE_URL_API_OLLAMA;
    const modelo = import.meta.env.VITE_URL_MODELO_OLLAMA;

    const promptExterno = `Actúa como un analista de atencion al cliente de la app de la casa de bolsa Mercosur Casa de Bolsa S.A y redacta una descripción detallada y profesional para un ticket de soporte basándote en la siguiente nota o borrador del analista: "${strDescripcion}". 

                          Utiliza estrictamente la siguiente estructura de salida:

                          **Ticket de Soporte: [Insertar un breve Resumen del Asunto en Mayúsculas Iniciales]**

                          **Descripción del Problema:**
                          [Redacta una breve descripción técnica y formal del problema basado en el texto proporcionado, destacando su impacto o criticidad].

                          **Pruebas Realizadas: [Redactalas en pasado y no repitas pasos ya realizados (no redundes)]**

                          1. **[Paso 1 - Título Corto]:** [Descripción clara y accionable de la primera acción técnica o de verificación].
                          2. **[Paso 2 - Título Corto]:** [Descripción clara de la siguiente acción de diagnóstico o revisión de servicios].
                          3. **[Paso 3 - Título Corto]:** [Descripción de la solución alternativa o aplicación del procedimiento secundario].
                          4. **[Paso 4 - Título Corto]:** [Instrucciones para la nueva validación junto con el usuario].`;

    const promptInterno = `Actúa como un asistente que ayuda a los usuarios de Mercosur Casa de Bolsa a redactar sus tickets de soporte/requerimiento.

                          Tu tarea es tomar la siguiente nota o borrador escrito por el usuario y reescribirlo para que sea claro, conciso, educado y bien estructurado.

                          Organiza la redacción utilizando únicamente la siguiente estructura limpia:

                          **Resumen de la Solicitud:**
                          [Una o dos oraciones breves explicando qué requiere o qué problema presenta el usuario].

                          **Detalle del Requerimiento o Falla:**
                          [Explicación clara del contexto, los pasos o la situación actual según lo proporcionado por el usuario].

                          **Resultado Esperado:**
                          [Qué necesita o qué espera que el equipo de soporte / desarrollo resuelva o habilite].

                          Reglas strictly:
                          - Mantén la intención original del usuario sin inventar información adicional.
                          - Devuelve únicamente la estructura redactada, sin saludos ni comentarios iniciales o finales.

                          Texto del usuario:
                          "${strDescripcion}"`;

    const tipoObj = listaTipoTicket.find(
      (t) => Number(t.id) === Number(tipoTicketId),
    );
    const esInterno = tipoObj
      ? tipoObj.str_nombre.toLowerCase().includes("interno")
      : false;

    const promptSeleccionado = esInterno ? promptInterno : promptExterno;

    try {
      const response = await axios.post(urlIA, {
        model: modelo,
        prompt: promptSeleccionado,
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
        if (i % 3 === 0 || i === textoGenerado.length - 1) {
          if (editor && editor.document.length > 0) {
            await editor.updateBlock(editor.document[0], {
              type: "paragraph",
              content: textoActual,
            });
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    } catch (error) {
      console.error("Error de conexión con Ollama:", error);
      showToast(
        "No se pudo conectar con Ollama. Verifique que el servicio y la red estén activos.",
        "error",
      );
      setIsGeneratingAI(false);
    }
  };

  const esTipoExterno = () => {
    const seleccionado = listaTipoTicket.find(
      (t) => Number(t.id) === Number(tipoTicketId),
    );
    return seleccionado
      ? seleccionado.str_nombre.toLowerCase().includes("externo") ||
          seleccionado.str_nombre.toLowerCase().includes("app")
      : false;
  };

  const obtenerCategoriasActuales = () => {
    const seleccionado = listaTipoTicket.find(
      (t) => Number(t.id) === Number(tipoTicketId),
    );
    if (!seleccionado) return listaCategoriasExternas;

    const esInterno = seleccionado.str_nombre.toLowerCase().includes("interno");
    return esInterno ? listaCategoriasInternas : listaCategoriasExternas;
  };

  // Expresión regular que exige usuario, @, servidor, punto y extensión válida (ej. .com, .com.ve, .net)
  const validarCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo.trim());
  };

  // Validación ejecutada al perder el foco en el campo de correo
  const handleCorreoBlur = () => {
    if (!esTipoExterno()) return;

    const valor = strCorreoCliente.trim();
    if (!valor || !validarCorreo(valor)) {
      setCorreoInvalido(true);
      showToast(
        "Debe ingresar un correo electrónico válido (ejemplo: usuario@dominio.com) para continuar.",
        "error",
      );
      setTimeout(() => {
        if (correoInputRef.current) {
          correoInputRef.current.focus();
        }
      }, 50);
    } else {
      setCorreoInvalido(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoTicketId) {
      showToast("Por favor seleccione el Tipo de Ticket.", "error");
      return;
    }

    if (esTipoExterno() && !strCedulaCliente.trim()) {
      showToast(
        "Por favor ingrese la cédula del cliente para tickets externos.",
        "error",
      );
      return;
    }

    if (esTipoExterno()) {
      if (!strCorreoCliente.trim()) {
        showToast(
          "Por favor ingrese el correo del cliente para tickets externos.",
          "error",
        );
        if (correoInputRef.current) correoInputRef.current.focus();
        return;
      }

      if (!validarCorreo(strCorreoCliente)) {
        showToast(
          "El correo electrónico debe incluir un dominio válido completo (ej. cliente@correo.com).",
          "error",
        );
        setCorreoInvalido(true);
        if (correoInputRef.current) correoInputRef.current.focus();
        return;
      }
    }

    if (esTipoExterno() && !canalId) {
      showToast(
        "Por favor seleccione un Canal de Recepción para tickets externos.",
        "error",
      );
      return;
    }

    if (!categoriaId) {
      showToast("Por favor seleccione una Categoría.", "error");
      return;
    }

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
    formData.append("tipo_ticket_id", Number(tipoTicketId));
    formData.append("str_asunto", strAsunto);
    formData.append("str_descripcion", textoPlano);

    if (esTipoExterno()) {
      if (canalId) formData.append("canal_id", Number(canalId));
      formData.append("str_cedula_cliente", strCedulaCliente.trim());
      formData.append("str_correo_cliente", strCorreoCliente.trim());
    }

    formData.append("categoria_id", Number(categoriaId));
    formData.append("prioridad_id", Number(prioridadId));
    formData.append("departamento_id", Number(departamentoId));

    if (usuarioId) {
      formData.append("usuario_asignado_id", Number(usuarioId));
    }

    //formData.append("estatus_id", 1);

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
        showToast("Ticket creado con éxito.", "success");
        await handleLimpiarTodo();
      }
    } catch (error) {
      console.error("Error al enviar el ticket:", error);
      showToast(
        error.response?.data?.error ||
          "Ocurrió un error al procesar la solicitud del ticket.",
        "error",
      );
    }
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

  const categoriasActuales = obtenerCategoriasActuales();

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Nuevo Ticket">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: 14,
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <DynamicIcon
            name={
              toast.type === "success" ? "FiCheckCircle" : "FiAlertTriangle"
            }
          />
          <span>{toast.message}</span>
        </div>
      )}

      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "4px 0",
        }}
      >
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
            <div
              className="ticket-grid-container"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                alignItems: "start",
              }}
            >
              {/* Columna Izquierda: Parámetros del Ticket */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                  border: "1px solid var(--merco-border, #ccc)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                {/* Remitente y Departamento */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div className="field">
                    <label style={labelStyle}>De (Remitente)</label>
                    <input
                      className="field input"
                      value={`${nombre} ${apellido}`}
                      readOnly
                      disabled
                      title={`${nombre} ${apellido} <${user?.email || "analista@mercosur.com"}>`}
                      style={inputStyle}
                    />
                  </div>

                  <div className="field">
                    <label style={labelStyle}>Para (Departamento)</label>
                    <select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleccione...</option>
                      {listaDepartamentos.map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label style={labelStyle}>Empleado Asignado (Opcional)</label>
                  <select
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    disabled={!departamentoId}
                    style={inputStyle}
                  >
                    <option value="">
                      {departamentoId
                        ? "Sin asignación directa"
                        : "Seleccione departamento primero..."}
                    </option>
                    {empleadosFiltrados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.str_nombre} {emp.str_apellido} ({emp.str_email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asunto */}
                <div className="field">
                  <label style={labelStyle}>Asunto</label>
                  <input
                    value={strAsunto}
                    onChange={(e) => setStrAsunto(e.target.value)}
                    placeholder="Resumen del requerimiento..."
                    maxLength={100}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Tipo de Ticket */}
                <div className="field">
                  <label style={labelStyle}>Tipo de Ticket</label>
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "4px" }}
                  >
                    {listaTipoTicket.map((t) => {
                      const isSelected = Number(tipoTicketId) === t.id;
                      return (
                        <label
                          key={t.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            cursor: "pointer",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${isSelected ? "var(--merco-accent, #f95700)" : "var(--merco-border, #ccc)"}`,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          <input
                            type="radio"
                            name="tipo_ticket_id_desk"
                            value={t.id}
                            checked={isSelected}
                            onChange={() => handleTipoTicketChange(t.id)}
                            required
                            style={{ margin: 0, width: "11px", height: "11px" }}
                          />
                          {t.str_nombre}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mobile-selector">
                    <select
                      value={tipoTicketId}
                      onChange={(e) => handleTipoTicketChange(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleccione tipo de ticket...</option>
                      {listaTipoTicket.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--merco-border, #ccc)",
                    margin: "2px 0",
                  }}
                />

                {/* DATOS DEL CLIENTE EXTERNO */}
                {esTipoExterno() && (
                  <div>
                    <div className="flex flex-row gap-2.5">
                      <div className="field">
                        <label style={labelStyle}>Cédula del Cliente</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          value={strCedulaCliente}
                          onChange={(e) => {
                            const valorLimpio = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 8);
                            setStrCedulaCliente(valorLimpio);
                          }}
                          placeholder="Ej. 12345678"
                          required={esTipoExterno()}
                          style={inputStyle}
                        />
                      </div>

                      <div className="field" style={{ flex: 1 }}>
                        <label style={labelStyle}>Correo del Cliente</label>
                        <input
                          ref={correoInputRef}
                          type="text"
                          value={strCorreoCliente}
                          onChange={(e) => {
                            setStrCorreoCliente(e.target.value);
                            if (
                              correoInvalido &&
                              validarCorreo(e.target.value)
                            ) {
                              setCorreoInvalido(false);
                            }
                          }}
                          onBlur={handleCorreoBlur}
                          placeholder="cliente@correo.com"
                          required={esTipoExterno()}
                          style={{
                            ...inputStyle,
                            border: correoInvalido
                              ? "1px solid #ef4444"
                              : inputStyle.border,
                            boxShadow: correoInvalido
                              ? "0 0 0 1px #ef4444"
                              : "none",
                          }}
                        />
                        {correoInvalido && (
                          <span
                            style={{
                              color: "#ef4444",
                              fontSize: "11px",
                              marginTop: "3px",
                              display: "block",
                            }}
                          >
                            Correo no válido (ej. usuario@dominio.com)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Canal de Recepción */}
                {esTipoExterno() && (
                  <div className="field">
                    <label style={labelStyle}>Canal de Recepción</label>
                    <div
                      className="desktop-selector"
                      style={{ flexWrap: "wrap", gap: "4px" }}
                    >
                      {listaCanales.map((c) => {
                        const isSelected = Number(canalId) === c.id;
                        return (
                          <label
                            key={c.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "11px",
                              cursor: "pointer",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              color: "var(--merco-text)",
                              backgroundColor: isSelected
                                ? isDarkMode
                                  ? "rgba(249, 87, 0, 0.25)"
                                  : "rgba(249, 87, 0, 0.12)"
                                : isDarkMode
                                  ? "rgba(255, 255, 255, 0.03)"
                                  : "var(--merco-bg-card, #fff)",
                              border: `1px solid ${isSelected ? "var(--merco-accent, #f95700)" : "var(--merco-border, #ccc)"}`,
                              fontWeight: isSelected ? "600" : "400",
                            }}
                          >
                            <input
                              type="radio"
                              name="canal_id_desk"
                              value={c.id}
                              checked={isSelected}
                              onChange={(e) => setCanalId(e.target.value)}
                              required={esTipoExterno()}
                              style={{
                                margin: 0,
                                width: "11px",
                                height: "11px",
                              }}
                            />
                            {c.str_nombre}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mobile-selector">
                      <select
                        value={canalId}
                        onChange={(e) => setCanalId(e.target.value)}
                        required={esTipoExterno()}
                        style={inputStyle}
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
                )}

                {/* Categoría */}
                <div className="field">
                  <label style={labelStyle}>Categoría</label>
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "4px" }}
                  >
                    {categoriasActuales.map((cat) => {
                      const isSelected = Number(categoriaId) === cat.id;
                      return (
                        <label
                          key={cat.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            cursor: "pointer",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${isSelected ? "var(--merco-accent, #f95700)" : "var(--merco-border, #ccc)"}`,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          <input
                            type="radio"
                            name="categoria_id_desk"
                            value={cat.id}
                            checked={isSelected}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                            style={{ margin: 0, width: "11px", height: "11px" }}
                          />
                          {cat.str_nombre}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mobile-selector">
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleccione categoría...</option>
                      {categoriasActuales.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.str_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prioridad */}
                <div className="field">
                  <label style={labelStyle}>Prioridad</label>
                  <div
                    className="desktop-selector"
                    style={{ flexWrap: "wrap", gap: "4px" }}
                  >
                    {listaPrioridades.map((p) => {
                      const isSelected = Number(prioridadId) === p.id;
                      return (
                        <label
                          key={p.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            cursor: "pointer",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            color: "var(--merco-text)",
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? "rgba(249, 87, 0, 0.25)"
                                : "rgba(249, 87, 0, 0.12)"
                              : isDarkMode
                                ? "rgba(255, 255, 255, 0.03)"
                                : "var(--merco-bg-card, #fff)",
                            border: `1px solid ${isSelected ? "var(--merco-accent, #f95700)" : "var(--merco-border, #ccc)"}`,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          <input
                            type="radio"
                            name="prioridad_id_desk"
                            value={p.id}
                            checked={isSelected}
                            onChange={(e) => setPrioridadId(e.target.value)}
                            required
                            style={{ margin: 0, width: "11px", height: "11px" }}
                          />
                          {p.str_nombre}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mobile-selector">
                    <select
                      value={prioridadId}
                      onChange={(e) => setPrioridadId(e.target.value)}
                      required
                      style={inputStyle}
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

              {/* Columna Derecha: BlockNote y Botones */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <label style={{ ...labelStyle, margin: 0 }}>
                      Descripción del Ticket
                    </label>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleGenerarConIA()}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: "1px solid var(--merco-border, #ccc)",
                        borderRadius: "5px",
                      }}
                      disabled={isGeneratingAI}
                      title="Redactar/Mejorar con IA"
                    >
                      <DynamicIcon
                        name="FaRobot"
                        style={{ fontSize: "13px", color: "#eab308" }}
                      />
                      <span style={{ fontSize: "11px" }}>Formatear IA</span>
                    </button>
                  </div>

                  {/* Contenedor Editor */}
                  <div
                    style={{
                      position: "relative",
                      border: "1px solid var(--merco-border, #ccc)",
                      borderRadius: 6,
                      padding: "2px",
                      minHeight: "320px",
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
                            ? "rgba(0, 0, 0, 0.45)"
                            : "rgba(255, 255, 255, 0.45)",
                          zIndex: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(3px)",
                          borderRadius: "inherit",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "monospace",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            border: `1px solid ${isDarkMode ? "#334155" : "#cbd5e1"}`,
                            background: isDarkMode ? "#0f172a" : "#ffffff",
                            fontSize: "13px",
                            fontWeight: "bold",
                          }}
                        >
                          <DynamicIcon
                            name="FaRobot"
                            style={{ color: "#eab308", fontSize: "16px" }}
                          />
                          Analizando descripción del ticket...
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

                  {/* Archivos adjuntos */}
                  {archivosAdjuntos.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "6px 10px",
                        background: "var(--merco-bg-subtle, rgba(0,0,0,0.03))",
                        borderRadius: 6,
                        fontSize: "11px",
                        border: "1px solid var(--merco-border, #ccc)",
                      }}
                    >
                      <b
                        style={{
                          display: "block",
                          marginBottom: 4,
                          color: "var(--merco-text)",
                        }}
                      >
                        Archivos adjuntos ({archivosAdjuntos.length}):
                      </b>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
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
                                gap: "6px",
                                background: isDarkMode
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "var(--merco-bg-card, #fff)",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--merco-border, #ccc)",
                                color: "var(--merco-text)",
                              }}
                            >
                              <DynamicIcon
                                name={nombreIcono}
                                style={{
                                  fontSize: "13px",
                                  color: "var(--merco-accent, #f95700)",
                                }}
                              />
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "160px",
                                }}
                                title={file.name}
                              >
                                {file.name} ({Math.round(file.size / 1024)} KB)
                              </span>
                              <button
                                type="button"
                                style={{
                                  fontSize: "10px",
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

                  {/* Acciones del Formulario */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: "1px solid var(--merco-border, #ccc)",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleLimpiarTodo}
                      disabled={isGeneratingAI}
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isGeneratingAI || correoInvalido}
                      style={{ padding: "6px 14px", fontSize: "13px" }}
                    >
                      <DynamicIcon name="FiSave" /> Crear Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}
