import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import axiosTickets from "../../../../api/axiosTickets";
import { useCreateBlockNote } from "@blocknote/react";
import { es } from "@blocknote/core/locales";

export function useCrearTicket() {
  const [tipoTicketId, setTipoTicketId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridadId, setPrioridadId] = useState("");
  const [canalId, setCanalId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");

  // Selector de tipo de persona para tickets externos
  const [tipoPersonaCliente, setTipoPersonaCliente] = useState("natural");

  // Campos Persona Natural
  const [strCedulaCliente, setStrCedulaCliente] = useState("");
  const [strNombreCliente, setStrNombreCliente] = useState("");
  const [strApellidoCliente, setStrApellidoCliente] = useState("");
  const [strTelefonoCliente, setStrTelefonoCliente] = useState("");
  const [strCorreoCliente, setStrCorreoCliente] = useState("");
  const [clienteId, setClienteId] = useState(null);
  const [clienteBloqueado, setClienteBloqueado] = useState(false);

  // Campos Persona Jurídica
  const [strRifCliente, setStrRifCliente] = useState("");
  const [strRazonSocialCliente, setStrRazonSocialCliente] = useState("");
  const [strTelefonoJuridicoCliente, setStrTelefonoJuridicoCliente] =
    useState("");
  const [strCorreoJuridicoCliente, setStrCorreoJuridicoCliente] = useState("");
  const [clienteJuridicoId, setClienteJuridicoId] = useState(null);
  const [clienteJuridicoBloqueado, setClienteJuridicoBloqueado] =
    useState(false);

  const [correoInvalido, setCorreoInvalido] = useState(false);
  const correoInputRef = useRef(null);

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
    const fetchData = async () => {
      try {
        try {
          const resDeptUsers = await axiosTickets.get(
            "/departamentos-usuarios",
          );
          if (resDeptUsers.data && resDeptUsers.data.success) {
            setListaDepartamentos(resDeptUsers.data.departamentos || []);
            setListaUsuarios(resDeptUsers.data.usuarios || []);
          }
        } catch (err) {
          console.error("Error al cargar /departamentos-usuarios:", err);
        }

        try {
          const resMaestros = await axiosTickets.get("/datos-maestros");
          if (resMaestros.data && resMaestros.data.success) {
            setListaCanales(resMaestros.data.canales || []);
            setListaCategoriasExternas(
              resMaestros.data.categoria_externa || [],
            );
            setListaCategoriasInternas(
              resMaestros.data.categoria_interna || [],
            );
            setListaPrioridades(resMaestros.data.prioridades || []);
            setListaTipoTicket(resMaestros.data.tipoTicket || []);

            if (resMaestros.data.tipoTicket?.length > 0) {
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
        } catch (err) {
          console.error("Error al cargar /datos-maestros:", err);
          showToast("Error al cargar los catálogos del sistema.", "error");
        }
      } catch (error) {
        console.error("Error general al inicializar catálogos:", error);
      }
    };
    fetchData();
  }, []);

  const esTipoInterno = () => {
    const seleccionado = listaTipoTicket.find(
      (t) => Number(t.id) === Number(tipoTicketId),
    );
    return seleccionado
      ? seleccionado.str_nombre.toLowerCase().includes("interno")
      : false;
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
      seleccionadoObj.str_nombre.toLowerCase().includes("externo")
    ) {
      setUsuarioId("");
    }
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

  const editor = useCreateBlockNote({ uploadFile, dictionary: es }, []);

  const obtenerContenidoHTML = async () => {
    if (!editor) return "";
    try {
      return await editor.blocksToHTMLLossy(editor.document);
    } catch (err) {
      console.error("Error al convertir bloques a HTML:", err);
      return "";
    }
  };

  const handleEditorChange = async () => {
    if (!editor) return;
    setStrDescripcion(await obtenerContenidoHTML());

    const bloquesActuales = editor.document;
    const urlsEnEditor = new Set();

    bloquesActuales.forEach((bloque) => {
      if (bloque.type === "image" && bloque.props?.url) {
        urlsEnEditor.add(bloque.props.url);
      }
      if (bloque.props?.url) {
        urlsEnEditor.add(bloque.props.url);
      }
    });

    setArchivosAdjuntos((prev) =>
      prev.filter((archivo) => {
        return (
          urlsEnEditor.has(archivo.data) ||
          Array.from(urlsEnEditor).some((url) => url.includes(archivo.name))
        );
      }),
    );
  };

  const handleLimpiarTodo = async () => {
    setTipoTicketId(
      listaTipoTicket.length > 0 ? String(listaTipoTicket[0].id) : "",
    );
    setStrAsunto("");
    setCanalId("");
    setCategoriaId("");
    setPrioridadId("");
    setDepartamentoId("");
    setUsuarioId("");
    setTipoPersonaCliente("natural");

    // Limpiar Naturales
    setStrCedulaCliente("");
    setStrNombreCliente("");
    setStrApellidoCliente("");
    setStrTelefonoCliente("");
    setStrCorreoCliente("");
    setClienteId(null);
    setClienteBloqueado(false);

    // Limpiar Jurídicos
    setStrRifCliente("");
    setStrRazonSocialCliente("");
    setStrTelefonoJuridicoCliente("");
    setStrCorreoJuridicoCliente("");
    setClienteJuridicoId(null);
    setClienteJuridicoBloqueado(false);

    setCorreoInvalido(false);
    setArchivosAdjuntos([]);
    setStrDescripcion("");

    if (editor) {
      try {
        await editor.replaceBlocks(editor.document, [
          { type: "paragraph", content: "" },
        ]);
      } catch (err) {
        console.error("Error al limpiar los bloques del editor:", err);
      }
    }
  };

  const validarCorreo = (correo) => {
    if (!correo) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
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

    const infoCliente =
      tipoPersonaCliente === "juridico"
        ? `Cliente Jurídico: ${strRazonSocialCliente}, RIF: ${strRifCliente}, Teléfono: ${strTelefonoJuridicoCliente}, Correo: ${strCorreoJuridicoCliente}`
        : `Cliente Natural: ${strNombreCliente} ${strApellidoCliente}, Cédula: ${strCedulaCliente}, Teléfono: ${strTelefonoCliente}, Correo: ${strCorreoCliente}`;

    const nombresArchivos = archivosAdjuntos.map((f) => f.name).join(", ");
    const infoArchivos = nombresArchivos
      ? `Archivos adjuntos de soporte: [${nombresArchivos}].`
      : "No hay archivos adjuntos.";

    const promptExterno = `Eres un asistente de redacción para analistas de soporte en Mercosur Casa de Bolsa S.A.
Tu ÚNICA tarea es reescribir y pulir el siguiente texto escrito por el analista para darle un tono más profesional, claro y técnico, manteniendo exactamente el mismo significado.

Texto original del analista a mejorar: "${strDescripcion}"
Datos del cliente asociados al ticket: [${infoCliente}].
${infoArchivos}

REGLAS ABSOLUTAS:
1. NO inventes ningún detalle, problema, fecha, hora, código de error ni situación que no esté explícitamente en el texto original del analista o en los nombres de los archivos adjuntos.
2. Si se mencionan archivos adjuntos, puedes referenciar su existencia de manera natural en la redacción sin asumir contenido que no veas.
3. No incluyas saludos, despedidas, introducciones ("Aquí tienes...") ni bloques de metadatos (como Asunto, Fecha, Estado o Prioridad).
4. Sé directo, breve y conciso.`;

    const promptInterno = `Actúa como un asistente que ayuda a los usuarios de Mercosur Casa de Bolsa a redactar sus tickets. Toma la siguiente nota: "${strDescripcion}"`;

    const promptSeleccionado = esTipoInterno() ? promptInterno : promptExterno;

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
          await editor.removeBlocks(editor.document.slice(1));
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
      showToast("No se pudo conectar con Ollama.", "error");
      setIsGeneratingAI(false);
    }
  };

  const handleCorreoBlur = () => {
    if (!esTipoExterno()) return;
    const correoEvaluar =
      tipoPersonaCliente === "juridico"
        ? strCorreoJuridicoCliente
        : strCorreoCliente;
    const valor = (correoEvaluar || "").trim();
    if (valor && !validarCorreo(valor)) {
      setCorreoInvalido(true);
    } else {
      setCorreoInvalido(false);
    }
  };

  const handleCedulaBlur = async () => {
    const cedula = strCedulaCliente.trim();
    if (!cedula || cedula.length < 6) {
      setClienteId(null);
      setClienteBloqueado(false);
      setStrNombreCliente("");
      setStrApellidoCliente("");
      setStrTelefonoCliente("");
      setStrCorreoCliente("");
      return;
    }

    try {
      const response = await axiosTickets.get(`/cliente/${cedula}`);
      if (response.data.success && response.data.existe) {
        const cli = response.data.cliente;
        setClienteId(cli.id);
        setStrNombreCliente(cli.str_nombre || "");
        setStrApellidoCliente(cli.str_apellido || "");
        setStrTelefonoCliente(cli.str_telefono || "");
        setStrCorreoCliente(cli.str_email || "");
        setClienteBloqueado(true);
        if (validarCorreo(cli.str_email || "")) {
          setCorreoInvalido(false);
        }
        showToast(
          "¡Cliente encontrado! Datos cargados en modo solo lectura.",
          "success",
        );
      } else {
        setClienteId(null);
        setClienteBloqueado(false);
        setStrNombreCliente("");
        setStrApellidoCliente("");
        setStrTelefonoCliente("");
        setStrCorreoCliente("");
      }
    } catch (error) {
      console.error("Error al verificar el cliente:", error);
      setClienteId(null);
      setClienteBloqueado(false);
    }
  };

  const handleRifBlur = async () => {
    const rif = strRifCliente.trim();
    if (!rif || rif.length < 6) {
      setClienteJuridicoId(null);
      setClienteJuridicoBloqueado(false);
      setStrRazonSocialCliente("");
      setStrTelefonoJuridicoCliente("");
      setStrCorreoJuridicoCliente("");
      return;
    }

    try {
      const response = await axiosTickets.get(`/cliente-juridico/${rif}`);
      if (response.data.success && response.data.existe) {
        const cli = response.data.cliente;
        setClienteJuridicoId(cli.id);
        setStrRazonSocialCliente(cli.str_razon_social || "");
        setStrTelefonoJuridicoCliente(cli.str_telefono || "");
        setStrCorreoJuridicoCliente(cli.str_email || "");
        setClienteJuridicoBloqueado(true);
        if (validarCorreo(cli.str_email || "")) {
          setCorreoInvalido(false);
        }
        showToast(
          "¡Cliente jurídico encontrado! Datos cargados en modo solo lectura.",
          "success",
        );
      } else {
        setClienteJuridicoId(null);
        setClienteJuridicoBloqueado(false);
        setStrRazonSocialCliente("");
        setStrTelefonoJuridicoCliente("");
        setStrCorreoJuridicoCliente("");
      }
    } catch (error) {
      console.error("Error al verificar el cliente jurídico:", error);
      setClienteJuridicoId(null);
      setClienteJuridicoBloqueado(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipoTicketId) {
      showToast("Por favor seleccione el Tipo de Ticket.", "error");
      return;
    }

    const descripcionHTML = await obtenerContenidoHTML();
    const textoPlanoEditor = strDescripcion.replace(/<[^>]*>/g, "").trim();

    if (
      !descripcionHTML.trim() ||
      descripcionHTML === "<p></p>" ||
      !textoPlanoEditor
    ) {
      showToast(
        "Por favor ingrese la descripción del ticket, es obligatoria.",
        "error",
      );
      return;
    }

    if (esTipoExterno()) {
      if (tipoPersonaCliente === "natural") {
        if (
          !strCedulaCliente.trim() ||
          !strNombreCliente.trim() ||
          !strApellidoCliente.trim() ||
          !strTelefonoCliente.trim() ||
          !strCorreoCliente.trim()
        ) {
          showToast(
            "Por favor complete todos los datos del cliente natural.",
            "error",
          );
          return;
        }
        if (!validarCorreo(strCorreoCliente)) {
          showToast(
            "El correo electrónico no tiene un formato válido.",
            "error",
          );
          setCorreoInvalido(true);
          correoInputRef.current?.focus();
          return;
        }
      } else {
        if (
          !strRifCliente.trim() ||
          !strRazonSocialCliente.trim() ||
          !strTelefonoJuridicoCliente.trim() ||
          !strCorreoJuridicoCliente.trim()
        ) {
          showToast(
            "Por favor complete todos los datos de la empresa (jurídico).",
            "error",
          );
          return;
        }
        if (!validarCorreo(strCorreoJuridicoCliente)) {
          showToast(
            "El correo electrónico corporativo no tiene un formato válido.",
            "error",
          );
          setCorreoInvalido(true);
          correoInputRef.current?.focus();
          return;
        }
      }

      if (!canalId) {
        showToast("Por favor seleccione un Canal de Recepción.", "error");
        return;
      }
    }

    if (!categoriaId) {
      showToast("Por favor seleccione una Categoría.", "error");
      return;
    }

    if (!prioridadId) {
      showToast("Por favor seleccione la Prioridad.", "error");
      return;
    }

    if (!window.confirm(`¿${nombre}, confirmas que deseas crear este ticket?`))
      return;

    const formData = new FormData();
    formData.append("tipo_ticket_id", Number(tipoTicketId));
    formData.append("str_asunto", strAsunto);
    formData.append("str_descripcion", descripcionHTML);

    if (esTipoExterno()) {
      if (canalId) formData.append("canal_id", Number(canalId));
      if (tipoPersonaCliente === "natural") {
        formData.append("tipo_solicitante_ext", "natural"); // <-- Opcional pero recomendado para simetría
        if (clienteId) formData.append("cliente_id", Number(clienteId));
        formData.append("str_cedula_cliente", strCedulaCliente.trim());
        formData.append("str_nombre_cliente", strNombreCliente.trim());
        formData.append("str_apellido_cliente", strApellidoCliente.trim());
        formData.append("str_telefono_cliente", strTelefonoCliente.trim());
        formData.append("str_correo_cliente", strCorreoCliente.trim());
      } else {
        formData.append("tipo_solicitante_ext", "juridico"); // <--- ¡Esta línea faltaba!
        if (clienteJuridicoId)
          formData.append("cliente_juridico_id", Number(clienteJuridicoId));
        formData.append("str_rif_cliente", strRifCliente.trim());
        formData.append(
          "str_razon_social_cliente",
          strRazonSocialCliente.trim(),
        );
        formData.append(
          "str_telefono_juridico_cliente",
          strTelefonoJuridicoCliente.trim(),
        );
        formData.append(
          "str_correo_juridico_cliente",
          strCorreoJuridicoCliente.trim(),
        );
      }
    }

    formData.append("categoria_id", Number(categoriaId));
    formData.append("prioridad_id", Number(prioridadId));
    formData.append("departamento_id", Number(departamentoId));
    if (usuarioId) formData.append("usuario_asignado_id", Number(usuarioId));

    archivosAdjuntos.forEach((fileObj, index) => {
      if (fileObj.rawFile)
        formData.append(`multimedia_${index}`, fileObj.rawFile);
    });

    try {
      const response = await axiosTickets.post("/crear", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const codigoTicket = response.data.ticket?.str_ticket || "";
        showToast(
          `Ticket creado con éxito. Código: ${codigoTicket}`,
          "success",
        );
        await handleLimpiarTodo();
      }
    } catch (error) {
      console.error("Error al enviar el ticket:", error);
      showToast(
        error.response?.data?.error ||
          "Ocurrió un error al procesar la solicitud.",
        "error",
      );
    }
  };

  const obtenerIconoPorTipo = (tipoMime, nombreArchivo) => {
    if (!tipoMime) {
      const ext = nombreArchivo?.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
        return "FiImage";
      if (["pdf"].includes(ext)) return "FiFileText";
      return "FiFile";
    }
    if (tipoMime.startsWith("image/")) return "FiImage";
    if (tipoMime.includes("pdf")) return "FiFileText";
    return "FiFile";
  };

  const departamentosActuales = useMemo(() => {
    if (esTipoExterno()) {
      return listaDepartamentos.filter((dep) => {
        const nombreDepto = (dep.str_nombre || "").toLowerCase();
        return (
          nombreDepto.includes("tecnología") ||
          nombreDepto.includes("tecnologia") ||
          nombreDepto.includes("atención al cliente") ||
          nombreDepto.includes("atencion al cliente")
        );
      });
    }
    return listaDepartamentos;
  }, [listaDepartamentos, tipoTicketId]);

  const categoriasActuales = (() => {
    if (esTipoInterno()) return listaCategoriasInternas;
    if (esTipoExterno()) return listaCategoriasExternas;
    return [...listaCategoriasInternas, ...listaCategoriasExternas];
  })();

  const esDepartamentoTecnologia = () => {
    if (!departamentoId) return false;
    const deptoObj = listaDepartamentos.find(
      (dep) => Number(dep.id) === Number(departamentoId),
    );
    if (!deptoObj) return false;
    const nombreDepto = deptoObj.str_nombre.toLowerCase();
    return (
      nombreDepto.includes("tecnología") || nombreDepto.includes("tecnologia")
    );
  };

  const esTecnologia = esDepartamentoTecnologia();
  const debeBloquearEmpleado = esTecnologia && !esTipoInterno();

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
    tipoTicketId,
    setTipoTicketId,
    categoriaId,
    setCategoriaId,
    prioridadId,
    setPrioridadId,
    canalId,
    setCanalId,
    departamentoId,
    setDepartamentoId,
    usuarioId,
    setUsuarioId,
    tipoPersonaCliente,
    setTipoPersonaCliente,
    strCedulaCliente,
    setStrCedulaCliente,
    strNombreCliente,
    setStrNombreCliente,
    strApellidoCliente,
    setStrApellidoCliente,
    strTelefonoCliente,
    setStrTelefonoCliente,
    strCorreoCliente,
    setStrCorreoCliente,
    strRifCliente,
    setStrRifCliente,
    strRazonSocialCliente,
    setStrRazonSocialCliente,
    strTelefonoJuridicoCliente,
    setStrTelefonoJuridicoCliente,
    strCorreoJuridicoCliente,
    setStrCorreoJuridicoCliente,
    correoInvalido,
    setCorreoInvalido,
    clienteBloqueado,
    setClienteBloqueado,
    setClienteId,
    clienteJuridicoBloqueado,
    setClienteJuridicoBloqueado,
    setClienteJuridicoId,
    correoInputRef,
    listaDepartamentos,
    empleadosFiltrados,
    listaCanales,
    listaPrioridades,
    listaTipoTicket,
    strAsunto,
    setStrAsunto,
    archivosAdjuntos,
    setArchivosAdjuntos,
    isGeneratingAI,
    toast,
    handleCloseToast,
    isDarkMode,
    nombre,
    apellido,
    user,
    esTipoInterno,
    esTipoExterno,
    editor,
    handleEditorChange,
    handleTipoTicketChange,
    handleLimpiarTodo,
    handleGenerarConIA,
    handleCorreoBlur,
    handleCedulaBlur,
    handleRifBlur,
    handleSubmit,
    obtenerIconoPorTipo,
    validarCorreo,
    categoriasActuales,
    departamentosActuales,
    debeBloquearEmpleado,
    inputStyle,
    labelStyle,
  };
}
