import React, { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
  Badge,
} from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled, alpha } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import JSZip from "jszip";
// Iconos
import SupportIcon from "@mui/icons-material/Support";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import SummarizeIcon from "@mui/icons-material/Summarize";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import MessageIcon from "@mui/icons-material/Message";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import DescriptionIcon from "@mui/icons-material/Description";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { setSeccionesMasivo } from "../../store/plantillaSlice";
import FeedIcon from "@mui/icons-material/Feed";
import CancelIcon from "@mui/icons-material/Cancel";
import TuneIcon from "@mui/icons-material/Tune";
import FormatoFicha from "./FormatoFicha";
import Lottie from "lottie-react";
import Cargando from "../../assets/LottieFiles/loading.json";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import DownloadIcon from "@mui/icons-material/Download";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import enviandoCorreo from "../../assets/LottieFiles/Sending animation.json";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import CrearFicha from "../businessLogic/CrearFicha";
dayjs.locale("es"); // Establece español como idioma por defecto

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles("dark", {
          color: "inherit",
        }),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

const FichasAprobadas = () => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElReportes, setAnchorElReportes] = useState(null);
  const [anchorElAcciones, setAnchorElAcciones] = useState(null);
  const open2 = Boolean(anchorEl);
  const open3 = Boolean(anchorElReportes);
  const open4 = Boolean(anchorElAcciones);

  const handleClickChecked = (event, row) => {
    const isChecked = event.target.checked;

    setClientesSeleccionados((prev) => {
      let nuevosSeleccionados;

      if (isChecked) {
        nuevosSeleccionados = [...prev, row];
      } else {
        nuevosSeleccionados = prev.filter((item) => item.id !== row.id);
      }

      // El log aquí mostrará la cantidad correcta (3 si seleccionaste el tercero)
      //console.log("Seleccionados actualizados:", nuevosSeleccionados);

      return nuevosSeleccionados;
    });
  };

  const handleClickReportes = (event) => {
    setAnchorElReportes(event.currentTarget);
  };

  const handleCloseReportes = () => {
    setAnchorElReportes(null);
  };

  const handleClickAcciones = (event) => {
    setAnchorElAcciones(event.currentTarget);
  };

  const handleCloseAcciones = () => {
    setAnchorElAcciones(null);
  };

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const scrollRefCedula = useRef(null);
  const scrollRefRif = useRef(null);
  const abortControllerRef = useRef(null);

  const handleMouseDown = (e, ref) => {
    const container = ref.current;
    if (!container) return;

    container.isDragging = true;
    container.startX = e.pageX - container.offsetLeft;
    container.startY = e.pageY - container.offsetTop;
    container.scrollLeftStart = container.scrollLeft;
    container.scrollTopStart = container.scrollTop;

    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseMove = (e, ref) => {
    const container = ref.current;
    if (!container || !container.isDragging) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;

    const walkX = x - container.startX;
    const walkY = y - container.startY;

    container.scrollLeft = container.scrollLeftStart - walkX;
    container.scrollTop = container.scrollTopStart - walkY;
  };

  const handleMouseUpOrLeave = (ref) => {
    const container = ref.current;
    if (!container) return;
    container.isDragging = false;
    container.style.cursor = "grab";
  };

  const usuarioBoId = useSelector((state) => state.plantilla.usuarioBoId);
  const url = import.meta.env.REACT_APP_URL_API_LOCAL;
  const urlVer = import.meta.env.REACT_APP_URL_API_LOCAL_VER;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };

  const [documentos, setDocumentos] = useState([]);
  const [actualizando, setActualizando] = useState(false);
  const [descargandoTodoPdf, setDescargandoTodoPdf] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchfecha, setSearchFecha] = useState([null, null]);
  const [searchfecha2, setSearchFecha2] = useState([null, null]);
  const [range, setRange] = useState([null, null]);
  const [range2, setRange2] = useState([null, null]);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [editar, setEditar] = useState(false);
  const [openAsistir, setOpenAsistir] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalData, setModalData] = useState(null);
  const [modalData2, setModalData2] = useState(null);
  const [rotation, setRotation] = useState({ cedula: 0, rif: 0 });
  const [zoom, setZoom] = useState({ cedula: 1, rif: 1 });
  const [openPreRegistro, setOpenPreRegistro] = useState(false);
  const [respuestaPreregistro, setRespuestaPreregistro] = useState([]);
  const [urlDescarga, setUrlDescarga] = useState(null);
  const [textoLog, setTextoLog] = useState("");
  const [eventSource, setEventSource] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const logEndRef = useRef(null); // Para auto-scroll
  const [adultoMenorFilter, setAdultoMenorFilter] = useState("");
  const [openModalObservaciones, setOpenModalObservaciones] = useState(false);
  const handleOpenModalObservaciones = (valor, ficha_id) => {
    setOpenModalObservaciones(true);
    setObservacionesModal(valor || "");
    setSelectedFichaId(ficha_id);
  };
  const handleCloseModalObservaciones = () => setOpenModalObservaciones(false);
  const [observacionesModal, setObservacionesModal] = useState("");

  const handleEditarObservaciones = () => {
    setEditar(true);

    /* console.log(
      `Editando observaciones para el documento con ID: ${selectedFichaId}  `,
    ); */

    setOpenObservaciones(true);
    handleCloseModalObservaciones();
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    height: "80%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
    overflow: "auto",
  };

  const styleModalMaster = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "96vw",
    height: "92vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
    display: "flex",
    flexDirection: "column",
    borderRadius: 2,
    outline: "none",
  };

  const styleModalBase = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    overflow: "auto",
  };

  const handleAsistirFicha = async (ficha_usuario_id, row) => {
    try {
      const response = await axios.get(`${url}buscar_ficha`, {
        headers,
        params: { usuario_id: ficha_usuario_id },
      });

      dispatch(setSeccionesMasivo(response.data));
      setSelectedFichaId(ficha_usuario_id);
      setModalData2(row);
      setOpenAsistir(true);
    } catch (error) {
      console.error("Error al cargar ficha:", error);
    }
  };

  const handleCloseAsistir = () => {
    setOpenAsistir(false);
    setSelectedFichaId(null);
    setModalData2(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClosePreregistro = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setOpenPreRegistro(false);
  };

  const handleOpenExpediente = (row) => {
    setModalData(row);
    setRotation({ cedula: 0, rif: 0 });
    setZoom({ cedula: 1, rif: 1 });
  };

  const handleCloseExpediente = () => setModalData(null);

  const handleCancelarDescarga = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setDescargandoTodoPdf(false);
      setProgreso({ actual: 0, total: 0 });
      //alert("Descarga cancelada por el usuario.");
    }
  };

  const handleDescargarTodoPdf = async () => {
    // Inicializar controlador para permitir cancelación
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea descargar todas las fichas?"
        : "¿Confirma que desea descargar solo las fichas seleccionadas?",
    );

    let response = [];

    try {
      setDescargandoTodoPdf(true);
      let todosLosDatos = [];

      if (respuestaUsuario) {
        if (clientesSeleccionados.length === 0) {
          response = await axios.get(`${url}fichasAprobadasExcel`, {
            headers,
            signal,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
            },
          });
          todosLosDatos = response.data.rows;
        } else {
          todosLosDatos = clientesSeleccionados;
        }
      }

      //console.log(todosLosDatos);

      if (!todosLosDatos || todosLosDatos.length === 0) {
        setDescargandoTodoPdf(false);
        return; //alert("No hay registros.");
      }

      const zip = new JSZip();
      const folder = zip.folder("Fichas_PDF_Mercosur");
      setProgreso({ actual: 0, total: todosLosDatos.length });

      for (let i = 0; i < todosLosDatos.length; i++) {
        // Verificar si se ha solicitado la cancelación
        if (signal.aborted) throw new Error("AbortError");

        const registro = todosLosDatos[i];
        const doc = <FormatoFicha datos={registro} />;
        const asPdf = pdf([]);
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, "0");
        const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
        const anio = fecha.getFullYear();

        const fechaFormateada = `${dia}${mes}${anio}`;

        folder.file(`FI_${registro.cedula}_${fechaFormateada}.pdf`, blob);
        setProgreso((prev) => ({ ...prev, actual: i + 1 }));
      }

      const fecha = new Date();
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
      const anio = fecha.getFullYear();

      const fechaFormateada = `${dia}${mes}${anio}`;

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Fichas_PDF_Mercosur_${fechaFormateada}.zip`);
    } catch (error) {
      if (error.name === "AbortError" || error.message === "AbortError") {
        console.log("Generación de ZIP cancelada.");
      } else {
        console.error(error);
        alert("Ocurrió un error al generar los archivos.");
      }
    } finally {
      setDescargandoTodoPdf(false);
      setProgreso({ actual: 0, total: 0 });
      abortControllerRef.current = null;
    }
  };

  const handleAprobacionDatos = async (ficha_id) => {
    const respuestaUsuario = window.confirm(
      "¿Confirma que desea enviarla a Fichas activas?",
    );

    if (respuestaUsuario) {
      try {
        await axios.post(
          `${url}fichas/enviaraaprobados`,
          {
            bol_verificacion_aprobada: true,
            usuario_verificacion_cumplimiento: usuarioBoId,
            ficha_id,
          },
          { headers },
        );
        setActualizando((prev) => !prev);
        if (modalData) handleCloseExpediente();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAprobacionDatosTodos = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea enviar todas a fichas activas?"
        : "¿Confirma que desea enviar a fichas activas solo los registros seleccionados?",
    );

    if (respuestaUsuario) {
      try {
        let filas = [];

        // 1. DETERMINAR ORIGEN DE DATOS
        if (clientesSeleccionados.length === 0) {
          await axios.post(
            `${url}fichas/enviaraaprobadostodas`,
            {
              bol_verificacion_aprobada: true,
              usuario_verificacion_cumplimiento: usuarioBoId,
            },
            { headers },
          );
        } else {
          // Si hay seleccionados, usamos esos directamente
          filas = clientesSeleccionados;

          const idsArray = filas.map((f) => parseInt(f.id));
          //console.log(idsArray);

          await axios.post(
            `${url}fichas/enviaraaprobadostodasseleccionadas`,
            {
              bol_verificacion_aprobada: true,
              usuario_verificacion_cumplimiento: usuarioBoId,
              ids: idsArray,
            },
            { headers },
          );
        }

        setActualizando((prev) => !prev);
        if (modalData) handleCloseExpediente();
      } catch (error) {
        console.error(error);
      }
    }
  };

  ///////////////////////////////////// NUEVO CÓDIGOOOOOOO PARA OBSERVACIONESSSSSS
  const [openObservaciones, setOpenObservaciones] = React.useState(false);
  const [idFichaObservaciones, setIdFichaObservaciones] = React.useState(null);
  const [correoObservaciones, setCorreoObservaciones] = React.useState(null);

  const handleClickOpenObservaciones = (id_ficha, correo) => {
    setIdFichaObservaciones(id_ficha);
    setCorreoObservaciones(correo);
    setOpenObservaciones(true);
  };

  const handleCloseObservaciones = () => {
    setOpenObservaciones(false);
  };

  const handleSubmitObservaciones = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const observaciones = formJson.observaciones;
    const usuario = localStorage.getItem("bo_userName");

    const observaciones_completas = `Usuario: ${usuario}\nFecha: ${dayjs().format("DD/MM/YYYY HH:mm:ss")}\nObservaciones: ${observaciones}\n`;

    setLoading(true);

    //console.log(editar);

    //console.log(correoObservaciones);

    // --- NUEVA LÓGICA DE ENVÍO DE CORREO ---
    try {
      if (!editar) {
        const response = await axios.post(
          `${url}notificar-cliente`,
          { email: correoObservaciones, mensaje: observaciones },
          { headers },
        );

        if (response) {
          //console.log("Notificación enviada con éxito");
        } else {
          //console.error("Error al enviar el correo");
        }

        handleDevolver(idFichaObservaciones, observaciones_completas);
      } else {
        //console.log(observaciones, usuarioBoId, selectedFichaId);

        const response = await axios.post(
          `${url}/fichas/editar-observaciones`,
          {
            observaciones: observaciones,
            usuario: usuarioBoId,
            ficha_id: selectedFichaId,
          },
          { headers },
        );

        if (response.status === 200 || response.status === 201) {
          //console.log("Editada con éxito");
          setObservacionesModal(""); // Limpia el modal después de enviar
        }
      }
    } catch (err) {
      console.error("Error de red:", err);
    }
    // ---------------------------------------
    handleCloseObservaciones();
    setRefreshTrigger((prev) => prev + 1);
    setLoading(false);
  };

  const handleDevolver = async (ficha_id, observaciones) => {
    /* const respuestaUsuario = window.confirm(
      "¿Confirma que revisó la ficha y desea enviarla a fichas devueltas?",
    ); */

    /*  if (respuestaUsuario) { */
    try {
      await axios.post(
        `${url}fichas/fichasDevueltas`,
        {
          bol_devuelta: true,
          usuario_preparado_cumplimiento_id: usuarioBoId,
          ficha_id,
          observaciones,
        },
        { headers },
      );
      setActualizando((prev) => !prev);
      if (modalData) handleCloseExpediente();
    } catch (error) {
      console.error(error);
    }
    /*  } else {
      return;
    } */
  };

  const descargarArchivo = async (url, nombreArchivo) => {
    try {
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  const renderVisualizador = (key, ruta) => {
    if (!ruta)
      return (
        <Box
          sx={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          N/A
        </Box>
      );

    const urlArchivo = `${urlVer}uploads/${ruta.split("/").pop()}`;
    const esPDF = urlArchivo.toLowerCase().endsWith(".pdf");
    const currentRef = key === "cedula" ? scrollRefCedula : scrollRefRif;

    if (esPDF) {
      return (
        <iframe
          src={urlArchivo}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title={key}
        />
      );
    }

    // Usamos el valor de zoom directamente (ej: 1, 1.2, 1.4...)
    const currentZoom = zoom[key] || 1;

    return (
      <Box
        ref={currentRef}
        onMouseDown={(e) => handleMouseDown(e, currentRef)}
        onMouseMove={(e) => handleMouseMove(e, currentRef)}
        onMouseUp={() => handleMouseUpOrLeave(currentRef)}
        onMouseLeave={() => handleMouseUpOrLeave(currentRef)}
        sx={{
          position: "relative",
          flex: 1,
          overflow: "auto", // Importante para que aparezcan barras de scroll
          bgcolor: "#f0f0f0",
          cursor: "grab",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#bcbcbc",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": { bgcolor: "#f1f1f1" },
          display: "block",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 5,
            right: 5,
            zIndex: 10,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              bgcolor: "rgba(255,255,255,0.9)",
              borderRadius: 1,
              p: 0.2,
              boxShadow: 2,
              pointerEvents: "auto",
            }}
          >
            <IconButton
              size="small"
              onClick={() => setZoom((v) => ({ ...v, [key]: v[key] + 0.2 }))}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                setZoom((v) => ({ ...v, [key]: Math.max(0.2, v[key] - 0.2) }))
              }
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setRotation((v) => ({ ...v, [key]: v[key] + 90 }))}
            >
              <RotateRightIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                const cedulaRaw = modalData?.cedula || "";
                const letra = cedulaRaw.charAt(0);
                const numeros = cedulaRaw.slice(1);
                const cedulaFormateada = letra + numeros.padStart(16, "0");
                descargarArchivo(
                  urlArchivo,
                  `${cedulaFormateada || "archivo"}`,
                );
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Contenedor de la imagen que crece con el zoom */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            minHeight: "100%",
            p: 2,
            boxSizing: "border-box",
          }}
        >
          <img
            src={urlArchivo}
            alt={key}
            style={{
              // Multiplicamos un tamaño base por el zoom
              width: `${currentZoom * 100}%`,
              height: "auto",
              transform: `rotate(${rotation[key]}deg)`,
              transition: "transform 0.3s ease, width 0.3s ease",
              userSelect: "none",
              pointerEvents: "none",
              display: "block",
            }}
          />
        </Box>
      </Box>
    );
  };

  const handlePreRegistrar = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea realizar el pre registro de todos los registros?"
        : "¿Confirma que desea realizar el pre registro solo de los registros seleccionados?",
    );

    if (respuestaUsuario) {
      try {
        let filas = [];

        // 1. DETERMINAR ORIGEN DE DATOS
        if (clientesSeleccionados.length === 0) {
          const response = await axios.get(`${url}fichasAprobadasExcel`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
            },
          });

          filas = response.data?.rows ?? [];
          if (!filas.length) {
            alert("No hay datos disponibles para procesar.");
            return;
          }
        } else {
          filas = clientesSeleccionados;
        }

        const preRegistro = filas.map((row) => {
          // --- LIMPIEZA DE TELÉFONO (+58) ---
          const tlfProcesado = (row.telefono || "")
            .toString()
            .trim()
            .replace(/^\+58/, "");

          // --- LIMPIEZA DE DIRECCIÓN ---
          const direccionLimpia = (row.direccion || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, " ")
            .toUpperCase()
            .substring(0, 98);

          const convertirFecha = (fecha) => {
            if (!fecha) return "";
            const [dia, mes, año] = fecha.split("-");
            return `${año}-${mes}-${dia}`;
          };

          return {
            rifEmpresa: row.cedula,
            tipoCertificado: 7,
            idEmpresa: "0008",
            grupoUsuario: 1,
            usuariosSolicitud: [
              {
                esJuridico: false,
                idUsuario: `MER${row.cedula.substring(1)}`,
                groupId: 1,
                primerNombre: row.nombre1,
                segundoNombre: row.nombre2,
                primerApellido: row.apellido1,
                segundoApellido: row.apellido2,
                cedulaBase64: "!!!REEMPLAZAR_CON_BASE64_DE_LA_CEDULA!!!",
                paisResidencia: row.paisresidencia,
                localidadResidencia: (row.pais || "").toUpperCase(),
                correousuario: row.correo,
                direccion: direccionLimpia,
                ciudad: row.ciudad,
                estado: row.estado,
                codigoPostal: row.codigo_postal,
                nacionalidad: (row.nacionalidad ?? "")
                  .toLowerCase()
                  .split("/a")
                  .join("")
                  .split("/o")
                  .join("")
                  .trim(),
                fechaNacimiento: convertirFecha(row.nacimiento),
                codId: row.cedula.charAt(0),
                nroCedula: row.cedula.substring(1),
                telefonoCelular: tlfProcesado,
                telefonoCasa: tlfProcesado,
                genero: row.sexo === "Masculino" ? "M" : "F",
                nroRif: row.cedula.substring(1),
                pais: row.pais,
                documentoAnexo: [
                  {
                    idUsuario: `MER${row.cedula.substring(1)}`,
                    tipoDocumento: "1",
                    documentoString: "!!!REEMPLAZAR_CON_BASE64_DEL_RIF!!!",
                  },
                ],
              },
            ],
          };
        });

        setTextoLog("");
        if (typeof setUrlDescarga === "function") setUrlDescarga(null);
        setOpenPreRegistro(true);

        const startResp = await axios.post(
          `${url}documentos/send-json/start`,
          { data: preRegistro },
          { headers: { ...headers, "Content-Type": "application/json" } },
        );

        const jobId = startResp.data?.jobId;
        if (!jobId) throw new Error("No se recibió jobId del servidor");

        const tokenSolo = headers.Authorization.replace("Bearer ", "");
        const es = new EventSource(
          `${url}documentos/send-json/stream?jobId=${encodeURIComponent(
            jobId,
          )}&token=${encodeURIComponent(tokenSolo)}`,
        );

        let nombreArchivoLog = null; // Para capturar parsed.summary.logFile

        es.onmessage = async (e) => {
          if (!e.data) return;

          // --- FINALIZACIÓN DEL STREAM ---
          if (e.data === "[[END]]") {
            es.close();
            setEventSource(null);

            // Si obtuvimos un nombre de archivo, descargamos su contenido para guardarlo
            if (nombreArchivoLog) {
              try {
                const resLog = await axios.get(
                  `${url}descargar/${nombreArchivoLog}`,
                  { headers },
                );
                const contenidoDelArchivoLog = resLog.data;

                // Guardamos en nuestra tabla onboarding.preregistro CON el contenido del log
                await axios.post(
                  `${url}guardar-preregistro`,
                  {
                    datos: preRegistro,
                    usuario_id: usuarioBoId,
                    logs: contenidoDelArchivoLog, // Aquí guardamos el contenido leído del archivo
                  },
                  {
                    headers: { ...headers, "Content-Type": "application/json" },
                  },
                );
                console.log(
                  "Preregistro y contenido de logs guardados exitosamente.",
                );
              } catch (errorLog) {
                console.error(
                  "Error al obtener el contenido del log o guardar:",
                  errorLog,
                );
              }
            }
            return;
          }

          try {
            const parsed = JSON.parse(e.data);
            if (parsed?.type === "summary") {
              // Guardamos el nombre del archivo para la descarga posterior
              nombreArchivoLog = parsed.summary.logFile;

              if (typeof setUrlDescarga === "function") {
                // Seteamos la URL para el botón de descarga de la UI (usando CSV si prefieres)
                setUrlDescarga(
                  `${url}descargar/${parsed.summary.logFileCsv || parsed.summary.logFile}`,
                );
              }

              setTextoLog(
                (prev) =>
                  prev +
                  `\n\n RESULTADOS:\n` +
                  JSON.stringify(parsed.summary, null, 2) +
                  "\n",
              );
            }
          } catch {
            setTextoLog((prev) => prev + e.data);
          }
        };

        es.onerror = () => {
          es.close();
          setEventSource(null);
        };

        setEventSource(es);
      } catch (error) {
        console.error(error);
        setOpenPreRegistro(true);
        setTextoLog(`❌ Error: ${error?.message || "desconocido"}`);
      }
    }
  };

  const exportToExcelTodo = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea descargar el reporte de todas las fichas?"
        : "¿Confirma que desea descargar el reporte solo de las fichas seleccionadas?",
    );

    let response = [];

    try {
      let todosLosDatos = [];

      if (respuestaUsuario) {
        if (clientesSeleccionados.length === 0) {
          response = await axios.get(`${url}fichasAprobadasExcel`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
              adultoMenor: adultoMenorFilter,
            },
          });
          todosLosDatos = response.data.rows;
        } else {
          todosLosDatos = clientesSeleccionados;
        }
      }

      if (!todosLosDatos || todosLosDatos.length === 0) {
        return; //alert("No hay registros.");
      }

      const headersExcel = Object.keys(todosLosDatos[0]);
      const dataExport = [
        headersExcel,
        ...todosLosDatos.map((row) =>
          headersExcel.map((key) => row[key] ?? ""),
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
          type: "application/octet-stream",
        }),
        `FichasAprobadasPendientesPorFirmar_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const exportToAdmin = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea descargar el formato de todas las fichas para hacer la carga masiva en el admin?"
        : "¿Confirma que desea descargar el formato de las fichas seleccionadas para hacer la carga masiva en el admin?",
    );

    let response = [];

    try {
      let todosLosDatos = [];

      if (respuestaUsuario) {
        if (clientesSeleccionados.length === 0) {
          response = await axios.get(`${url}fichasParaElAdmin`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
              adultoMenor: adultoMenorFilter,
            },
          });
          todosLosDatos = response.data.rows;
        } else {
          const idsClientes = clientesSeleccionados.map(
            (cliente) => cliente.id,
          );

          // Llamada al endpoint pasando los IDs seleccionados
          response = await axios.get(`${url}fichasParaElAdmin`, {
            headers,
            params: {
              ids: idsClientes.join(","), // Convertimos [1,2] en "1,2"
              search: searchTerm,
              adultoMenor: adultoMenorFilter,
            },
          });
          todosLosDatos = response.data.rows;
        }
      }

      if (!todosLosDatos || todosLosDatos.length === 0) {
        return; //alert("No hay registros.");
      }

      const headersExcel = Object.keys(todosLosDatos[0]);
      const dataExport = [
        headersExcel,
        ...todosLosDatos.map((row) =>
          headersExcel.map((key) => row[key] ?? ""),
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
          type: "application/octet-stream",
        }),
        `FormatoCargaMasivaParaElAdmin_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const exportToLA = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea descargar el formato de todas las fichas para hacer la carga masiva en LA?"
        : "¿Confirma que desea descargar el formato de las fichas seleccionadas para hacer la carga masiva en LA?",
    );

    let response = [];

    try {
      let todosLosDatos = [];

      if (respuestaUsuario) {
        if (clientesSeleccionados.length === 0) {
          response = await axios.get(`${url}fichasparaLA`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
              adultoMenor: adultoMenorFilter,
            },
          });
          todosLosDatos = response.data.rows;
        } else {
          const idsClientes = clientesSeleccionados.map(
            (cliente) => cliente.id,
          );

          // Llamada al endpoint pasando los IDs seleccionados
          response = await axios.get(`${url}fichasparaLA`, {
            headers,
            params: {
              ids: idsClientes.join(","), // Convertimos [1,2] en "1,2"
              search: searchTerm,
            },
          });
          todosLosDatos = response.data.rows;
        }
      }

      if (!todosLosDatos || todosLosDatos.length === 0) {
        return; //alert("No hay registros.");
      }

      const headersExcel = Object.keys(todosLosDatos[0]);
      const dataExport = [
        headersExcel,
        ...todosLosDatos.map((row) =>
          headersExcel.map((key) => row[key] ?? ""),
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
          type: "application/octet-stream",
        }),
        `FormatoCargaMasivaParaLA_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}fichasAprobadas`, {
          headers,
          params: {
            page,
            limit: rowsPerPage,
            search: searchTerm,
            searchfecha,
            searchfecha2,
            adultoMenor: adultoMenorFilter,
          },
        });
        setDocumentos(response.data.rows || []);
        setTotalCount(response.data.totalCount || 0);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    // const delay = setTimeout(fetchDocumentos, 500);
    // return () => clearTimeout(delay);

    fetchDocumentos();
  }, [
    actualizando,
    page,
    rowsPerPage,
    searchTerm,
    searchfecha,
    refreshTrigger,
    searchfecha2,
    adultoMenorFilter,
  ]);

  const columns = [
    {
      field: "selection",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            cursor: "pointer", // Cursor pointer en el contenedor
          }}
        >
          <input
            type="checkbox"
            style={{ cursor: "pointer" }} // Cursor pointer directo en el checkbox
            // Determinamos si está marcado buscando el ID en la lista de seleccionados
            checked={clientesSeleccionados.some((c) => c.id === params.row.id)}
            onChange={(e) => handleClickChecked(e, params.row)}
          />
        </div>
      ),
      sortable: false,
      filterable: false,
    },

    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => {
        // Extraemos el ID directamente de la fila por seguridad
        const idValue = params.row.id;
        const tieneObservaciones = params.row.str_observaciones;
        const vieneDeAkeela = params.row.bol_akeela;
        const rescatada = params.row.usuario_pausa_cumplimiento_id;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              height: "100%",
              gap: "8px",
            }}
          >
            {/* Usamos un span con color heredado para asegurar visibilidad */}
            <span style={{ color: "inherit", fontWeight: "bold" }}>
              {idValue}
            </span>

            {tieneObservaciones && (
              <MessageIcon
                sx={{
                  color: "#4caf50 !important",
                  fontSize: "1.1rem",
                }}
              />
            )}

            {vieneDeAkeela && (
              <Tooltip title="Akeela">
                <EmojiObjectsIcon
                  sx={{
                    color: "#FFD700 !important",
                    fontSize: "1.1rem",
                  }}
                />
              </Tooltip>
            )}

            {rescatada && (
              <Tooltip title="Rescatada">
                <SupportIcon
                  sx={{
                    color: "#fa8500 !important",
                    fontSize: "1.1rem",
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },

    { field: "es_pep_texto", headerName: "PEP", width: 80 },
    { field: "correo", headerName: "Correo", width: 80 },
    { field: "cedula", headerName: "Cédula", width: 120 },
    { field: "edad", headerName: "Edad", width: 80 },
    { field: "nombres", headerName: "Nombres", width: 180 },
    { field: "apellidos", headerName: "Apellidos", width: 180 },
    { field: "tipo_producto", headerName: "Tipo Producto", width: 180 },
    {
      field: "usuario_preparado_cumplimiento",
      headerName: "Verificó",
      width: 180,
    },
    {
      field: "usuario_revisado_cumplimiento",
      headerName: "Revisó",
      width: 180,
    },
    { field: "usuario_asiste", headerName: "Asistió" },
    { field: "fechacreacion", headerName: "Creación" },
    { field: "fechaactualizacion", headerName: "Actualización" },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <div className="flex flex-row gap-1">
          <Tooltip title="Ver más">
            <Button
              id="demo-customized-button"
              aria-controls={open2 ? "demo-customized-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open2 ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={(e) => handleClick(e, params.row)}
              endIcon={<KeyboardArrowDownIcon />}
              color="error"
              size="small"
            >
              <TuneIcon />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const filteredDocumentos = documentos.filter((doc) =>
    [
      "id",
      "es_pep_texto",
      "cedula",
      "nombres",
      "apellidos",
      "tipo_producto",
      "telefono",
      "usuario_preparado_cumplimiento",
      "correo",
      "usuario_revisado_cumplimiento",
      "usuario_asiste",
    ].some((field) =>
      String(doc[field] ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
        <Badge
          badgeContent={totalCount}
          color="primary"
          max={9999999}
          slotProps={{
            badge: {
              sx: {
                // Ajusta estos valores para mover el número
                right: -20,
                top: 5,
              },
            },
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box component="span" sx={{ ml: 4 }}>
            Fichas Aprobadas
          </Box>
        </Badge>
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center", // Alinea verticalmente los buscadores con los botones
          gap: 2,
        }}
      >
        <div className="flex flex-row items-end gap-4">
          {" "}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 ml-1">
              Filtrar por correo, cédula, nombres, apellidos o nivel
            </label>

            <div className="flex items-center gap-2">
              <TextField
                placeholder="Buscar..."
                size="small"
                // Usamos un estado temporal para que el input sea controlado
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />

              <Button
                variant="contained"
                onClick={() => {
                  setSearchTerm(inputValue);
                  setPage(0);
                }}
                size="small"
              >
                Buscar
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => {
                  setRange([null, null]);
                  setInputValue("");
                  setSearchTerm("");
                }}
                sx={{
                  height: "40px",
                  minWidth: "40px",
                  padding: 0,
                  borderColor: "#ccc",
                }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 ml-1">
              Adultos/Menores de edad
            </label>
            <TextField
              select
              size="small"
              value={adultoMenorFilter}
              onChange={(e) => {
                setAdultoMenorFilter(e.target.value);
                setPage(0);
              }}
              sx={{ width: 160 }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="adulto">Adultos</MenuItem>
              <MenuItem value="menor">Menores de edad</MenuItem>
            </TextField>
          </div>
          <Tooltip title="Fecha que el cliente inició la ficha">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 ml-1">
                Filtrar por fecha de creación
              </label>
              <div className="flex flex-row items-center gap-2">
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DateRangePicker
                    value={range}
                    format="DD/MM/YY"
                    localeText={{ start: "Desde", end: "Hasta" }}
                    onChange={(newValue) => {
                      setRange(newValue);
                      const start = newValue[0]
                        ? newValue[0].format("YYYY-MM-DD")
                        : null;
                      const end = newValue[1]
                        ? newValue[1].format("YYYY-MM-DD")
                        : null;
                      setSearchFecha(start && end ? `${start},${end}` : "");
                      setPage(0);
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          "& .MuiInputBase-input": {
                            fontSize: "0.75rem !important",
                            "& *": { fontSize: "0.75rem !important" },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                          "& .MuiInputBase-root": {
                            paddingRight: "4px",
                            width: "140px",
                          },
                          "& .MuiInputAdornment-root": {
                            marginLeft: 0,
                            marginRight: -1.1,
                          },
                          "& .MuiIconButton-root": { marginRight: "-4px" },
                        },
                      },
                      openPickerButton: {
                        size: "small",
                        sx: {
                          "& .MuiSvgIcon-root": { fontSize: "1.1rem" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                <Button
                  variant="outlined" // Añadido para que se vea más como un botón de acción
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setRange([null, null]);
                    setSearchFecha("");
                  }}
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    padding: 0,
                    borderColor: "#ccc",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </div>
            </div>
          </Tooltip>
          <Tooltip title="Fecha de la última actualización en la ficha">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 ml-1">
                Filtrar por fecha de actualización
              </label>
              <div className="flex flex-row items-center gap-2">
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DateRangePicker
                    value={range2}
                    format="DD/MM/YY"
                    localeText={{ start: "Desde", end: "Hasta" }}
                    onChange={(newValue) => {
                      setRange2(newValue);
                      const start = newValue[0]
                        ? newValue[0].format("YYYY-MM-DD")
                        : null;
                      const end = newValue[1]
                        ? newValue[1].format("YYYY-MM-DD")
                        : null;
                      setSearchFecha2(start && end ? `${start},${end}` : "");
                      setPage(0);
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          "& .MuiInputBase-input": {
                            fontSize: "0.75rem !important",
                            "& *": { fontSize: "0.75rem !important" },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                          "& .MuiInputBase-root": {
                            paddingRight: "4px",
                            width: "140px",
                          },
                          "& .MuiInputAdornment-root": {
                            marginLeft: 0,
                            marginRight: -1.1,
                          },
                          "& .MuiIconButton-root": { marginRight: "-4px" },
                        },
                      },
                      openPickerButton: {
                        size: "small",
                        sx: {
                          "& .MuiSvgIcon-root": { fontSize: "1.1rem" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                <Button
                  variant="outlined" // Añadido para que se vea más como un botón de acción
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setRange2([null, null]);
                    setSearchFecha2("");
                  }}
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    padding: 0,
                    borderColor: "#ccc",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </div>
            </div>
          </Tooltip>
        </div>

        <Box sx={{ display: "flex", gap: 1 }}>
          {!descargandoTodoPdf ? (
            <Tooltip
              title="Descarga masiva de las fichas en PDF"
              className="gap-1"
            >
              <Button
                variant="contained"
                color="success"
                onClick={handleDescargarTodoPdf}
                sx={{ whiteSpace: "nowrap" }}
                //startIcon={<PictureAsPdfIcon />}
              >
                <CloudDownloadIcon />
                Descargar Fichas
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Cancela la descarga masiva de las fichas en PDF">
              <Button
                variant="contained"
                color="warning"
                onClick={handleCancelarDescarga}
                startIcon={<CancelIcon />}
              >
                Cancelar ({progreso.actual}/{progreso.total})
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Pre Registrar y Aprobar Fichas">
            <Button
              id="demo-customized-button"
              aria-controls={open3 ? "demo-customized-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open3 ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={(e) => handleClickAcciones(e)}
              endIcon={<KeyboardArrowDownIcon />}
              color="error"
              size="normal"
            >
              Acciones
            </Button>
          </Tooltip>

          <Tooltip title="Tipos de Reportes">
            <Button
              id="demo-customized-button"
              aria-controls={open3 ? "demo-customized-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open3 ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={(e) => handleClickReportes(e)}
              endIcon={<KeyboardArrowDownIcon />}
              //color="error"
              size="normal"
            >
              Reportes
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <div className="flex items-center justify-center">
          <Lottie
            animationData={Cargando}
            style={{ width: "100%", maxWidth: "460px" }}
          />
        </div>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.field}
                      sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                      align="center"
                    >
                      {col.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocumentos.map((row) => (
                  <TableRow key={row.id} hover>
                    {columns.map((col) => (
                      <TableCell
                        key={col.field}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          // Usamos alpha para que el color sea sutil y funcione en modo oscuro
                          backgroundColor: row.bol_confirmado_pep
                            ? (theme) => alpha(theme.palette.error.main, 0.15)
                            : "inherit",
                          // Opcional: un borde izquierdo para resaltar más la fila PEP
                          borderLeft:
                            row.bol_confirmado_pep &&
                            col.field === columns[0].field
                              ? "4px solid #d32f2f"
                              : "none",
                        }}
                      >
                        {col.renderCell ? (
                          col.renderCell({ row })
                        ) : (
                          <>{row[col.field]}</>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[50, 100, 200]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}

      {/* Acciones */}
      <StyledMenu
        anchorEl={anchorElAcciones}
        open={open4}
        onClose={handleCloseAcciones}
      >
        <MenuItem
          onClick={() => {
            handlePreRegistrar();
            handleCloseAcciones();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <SummarizeIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Pre Registrar</span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleAprobacionDatosTodos();
            handleCloseAcciones();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <SummarizeIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Aprobar</span>
        </MenuItem>
      </StyledMenu>

      {/* Reportes */}
      <StyledMenu
        anchorEl={anchorElReportes}
        open={open3}
        onClose={handleCloseReportes}
      >
        <MenuItem
          onClick={() => {
            exportToAdmin();
            handleCloseReportes();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <SummarizeIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Formato para Admin</span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            exportToLA();
            handleCloseReportes();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <SummarizeIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Formato para LA</span>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            exportToExcelTodo();
            handleCloseReportes();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <SummarizeIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Exportar a Excel</span>
        </MenuItem>
      </StyledMenu>

      <StyledMenu anchorEl={anchorEl} open={open2} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleOpenModalObservaciones(
              selectedRow?.str_observaciones,
              selectedRow?.id,
            );
            handleClose();
          }}
          // El color del texto cambia solo si hay observaciones
          sx={{
            color: selectedRow?.str_observaciones
              ? "#4caf50 !important"
              : "inherit",
          }}
        >
          <MessageIcon
            sx={{
              // El color del icono cambia solo si hay observaciones
              color: selectedRow?.str_observaciones
                ? "#4caf50 !important"
                : "inherit",
              mr: 1,
            }}
          />
          <span>
            {selectedRow?.str_observaciones
              ? "Ver observaciones"
              : "Sin observaciones"}
          </span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenExpediente(selectedRow);
            handleClose();
          }}
        >
          <DescriptionIcon /> Ver expediente
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleAsistirFicha(selectedRow?.usuario_id, selectedRow);
            handleClose();
          }}
        >
          <SupportAgentIcon /> Asistir ficha
        </MenuItem>

        <MenuItem
          onClick={() => {
            const telefono = selectedRow?.telefono;
            if (!telefono)
              return <Typography variant="caption">N/A</Typography>;
            const numeroLimpio = String(telefono).replace(/\D/g, "");
            // Abre WhatsApp en una pestaña nueva (recomendado para no sacar al usuario de tu app)
            window.open(
              `https://wa.me/${numeroLimpio}`,
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: "#25D366" }} /> Contactar
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            handleAprobacionDatos(selectedRow?.id);
            handleClose();
          }}
        >
          <CheckIcon />
          Enviar a fichas activas
        </MenuItem>

        <MenuItem
          onClick={() => {
            //handleDevolver(selectedRow?.id);
            handleClickOpenObservaciones(selectedRow?.id, selectedRow?.correo);
            handleClose();
          }}
        >
          <SentimentVeryDissatisfiedIcon /> Enviar a Fichas devueltas
        </MenuItem>
      </StyledMenu>

      {/* MODAL ASISTIR */}
      <Modal open={openAsistir} onClose={handleCloseAsistir}>
        <Box
          sx={{
            ...styleModalBase,
            width: "95%",
            maxWidth: "1200px",
            height: "90vh",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="h6" fontWeight="bold">
              {modalData2
                ? modalData2.nombres &&
                  modalData2.apellidos &&
                  modalData2.cedula
                  ? `${modalData2.nombres} ${modalData2.apellidos} (${modalData2.cedula})`
                  : modalData2.correo
                : "Cargando..."}
            </Typography>
            <IconButton onClick={handleCloseAsistir}>
              <CloseIcon />
            </IconButton>
          </Box>
          <hr style={{ marginBottom: "20px" }} />
          {selectedFichaId && (
            <CrearFicha
              idRegistro={selectedFichaId}
              onClose={handleCloseAsistir}
            />
          )}
        </Box>
      </Modal>

      {/* MODAL PREREGISTRO */}
      <Modal open={openPreRegistro} onClose={() => setOpenPreRegistro(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "#1e1e1e", // Fondo oscuro tipo terminal
            color: "#d4d4d4", // Texto gris claro
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
            Procesando Pre-Registro...
          </Typography>

          {/* Contenedor del Log */}
          <Box
            sx={{
              height: 400,
              overflowY: "auto",
              backgroundColor: "#000",
              p: 2,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap", // Mantiene los saltos de línea
              borderRadius: 1,
              border: "1px solid #333",
            }}
          >
            {textoLog}
            {/* Elemento invisible para forzar el scroll al final */}
            <div ref={logEndRef} />

            {urlDescarga && (
              <a
                href={urlDescarga}
                target="_blank"
                style={{
                  display: "block",
                  margin: "10px 0",
                  color: "#28a745",
                  fontWeight: "bold",
                }}
              >
                Descargar reporte detallado
              </a>
            )}
          </Box>

          <Button
            onClick={() => setOpenPreRegistro(false)}
            sx={{ mt: 2, color: "white", borderColor: "white" }}
            variant="outlined"
          >
            Cerrar
          </Button>
        </Box>
      </Modal>

      {/* --- MODAL DE EXPEDIENTE ACTUALIZADO --- */}
      <Modal open={Boolean(modalData)} onClose={handleCloseExpediente}>
        <Box sx={styleModalMaster}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
            pb={1}
            sx={{ borderBottom: "1px solid #eee" }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", textTransform: "uppercase" }}
            >
              {modalData
                ? modalData.nombres && modalData.apellidos && modalData.cedula
                  ? `${modalData.nombres} ${modalData.apellidos} (${modalData.cedula})`
                  : modalData.correo
                : "Cargando..."}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleVerificacionDatos(modalData?.id)}
              >
                Enviar a Fichas en Revisión
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDevolver(modalData?.id)}
              >
                Enviar a Fichas Devueltas
              </Button>
              <IconButton
                onClick={handleCloseExpediente}
                size="small"
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flex: 1,
              gap: 2,
              overflow: "hidden",
              height: "80vh",
            }}
          >
            {/* Columna Izquierda: Único lugar donde permitimos scroll */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "auto",
                paddingRight: 1,
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#ccc",
                  borderRadius: 2,
                },
              }}
            >
              {/* Filtramos los documentos que tienen ruta antes de mapear */}
              {[
                {
                  label: "CÉDULA CLIENTE",
                  id: "cedula",
                  ruta: modalData?.ruta_cedula,
                },
                { label: "RIF CLIENTE", id: "rif", ruta: modalData?.ruta_rif },
                {
                  label: "PASAPORTE CLIENTE",
                  id: "pasaporte",
                  ruta: modalData?.ruta_pasaporte,
                },
                {
                  label: "CÉDULA REPRESENTANTE",
                  id: "cedula_representante",
                  ruta: modalData?.ruta_cedula_representante,
                },
                {
                  label: "RIF REPRESENTANTE",
                  id: "rif_representante",
                  ruta: modalData?.ruta_rif_representante,
                },
                {
                  label: "REFERENCIA BANCARIA",
                  id: "ruta_referencia_bancaria",
                  ruta: modalData?.ruta_referencia_bancaria,
                },

                {
                  label: "CONSTANCIA DE TRABAJO",
                  id: "ruta_constancia_trabajo",
                  ruta: modalData?.ruta_constancia_trabajo,
                },

                {
                  label: "PARTIDA DE NACIMIENTO",
                  id: "ruta_partida_nacimiento",
                  ruta: modalData?.ruta_partida_nacimiento,
                },

                {
                  label: "REFERENCIA BANCARIA MENOR",
                  id: "ruta_referencia_bancaria_menor",
                  ruta: modalData?.ruta_referencia_bancaria_menor,
                },

                {
                  label: "CONSTANCIA DE TRABAJO REPRESENTANTE",
                  id: "ruta_constancia_trabajo_rep",
                  ruta: modalData?.ruta_constancia_trabajo_rep,
                },

                {
                  label: "CARTA DE AUTORIZACIÓN",
                  id: "ruta_carta_autorizacion",
                  ruta: modalData?.ruta_carta_autorizacion,
                },
              ]
                .filter((doc) => doc.ruta && doc.ruta.trim() !== "") // Solo documentos con ruta válida
                .map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      flexShrink: 0,
                      minHeight: "100%",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "visible",
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        bgcolor: "#333",
                        color: "#fff",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {doc.label}
                    </Typography>

                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        "& > *": { flex: 1, overflow: "visible !important" },
                      }}
                    >
                      {renderVisualizador(doc.id, doc.ruta)}
                    </Box>
                  </Box>
                ))}
            </Box>

            {/* Columna Derecha (Ficha) */}
            <Box
              sx={{
                flex: 1.2,
                border: "1px solid #ddd",
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  bgcolor: "#333",
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                FICHA DEL SISTEMA
              </Typography>
              <PDFViewer
                style={{ width: "100%", height: "100%", border: "none" }}
              >
                <FormatoFicha datos={modalData || {}} />
              </PDFViewer>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Observaciones*/}
      <Fragment>
        <Dialog
          open={openObservaciones}
          onClose={handleCloseObservaciones}
          fullWidth
          maxWidth="md"
          slotProps={{
            paper: {
              sx: {
                borderRadius: "16px",
                padding: "8px",
                backgroundImage: "none", // Limpieza para modo oscuro
                boxShadow: "0px 10px 40px rgba(0,0,0,0.12)", // Sombra suave moderna
              },
            },
          }}
        >
          <DialogTitle sx={{ fontSize: "1.8rem", fontWeight: 600 }}>
            Ficha {selectedFichaId}
          </DialogTitle>

          {loading && !editar ? (
            <div className="flex flex-col items-center">
              <Lottie
                animationData={enviandoCorreo}
                loop={true}
                style={{ width: "70%", height: "70%" }}
              />
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                Enviando correo notificando al cliente...
              </Typography>
            </div>
          ) : (
            <>
              <DialogContent>
                <DialogContentText sx={{ mb: 3, fontSize: "1.1rem" }}>
                  Escribe las razones para devolver esta ficha.
                </DialogContentText>

                <form
                  onSubmit={handleSubmitObservaciones}
                  id="subscription-form"
                >
                  <TextField
                    id="observaciones"
                    name="observaciones"
                    autoFocus
                    required
                    fullWidth
                    multiline
                    rows={12}
                    placeholder="Escriba aquí..."
                    value={observacionesModal}
                    onChange={(e) => setObservacionesModal(e.target.value)}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: "1.3rem",
                        lineHeight: 1.6,
                        padding: "20px",
                        borderRadius: "12px",
                        // Color de fondo adaptativo (sutil)
                        backgroundColor: "action.hover",
                        // Color de texto nativo del tema
                        color: "text.primary",
                      },
                    }}
                  />
                </form>
              </DialogContent>

              <DialogActions sx={{ p: 2, gap: 2 }}>
                <Button
                  onClick={handleCloseObservaciones}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    fontSize: "1.1rem",
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="subscription-form"
                  variant="contained"
                  disableElevation
                  sx={{
                    borderRadius: "10px",
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  Enviar observaciones
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Fragment>

      {/* Modal de Observaciones*/}
      <Modal
        open={openModalObservaciones}
        onClose={handleCloseModalObservaciones}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...styleModalBase, width: 500 }}>
          {" "}
          {/* Asegúrate de que tenga un ancho definido */}
          <div className="flex flex-row gap-1 justify-between items-center">
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              Bitácora de Observaciones
            </Typography>

            <Tooltip title="Editar observaciones">
              <IconButton
                onClick={() => {
                  handleEditarObservaciones();
                }}
              >
                <EditDocumentIcon />
              </IconButton>
            </Tooltip>
          </div>
          <Typography
            id="modal-modal-description"
            component="div" // Cambiamos a div para evitar errores de anidamiento de p
            sx={{
              mt: 2,
              whiteSpace: "pre-line",
              maxHeight: "400px", // Altura máxima antes de activar el scroll
              overflowY: "auto", // Activa el scroll vertical solo si es necesario
              pr: 2, // Padding derecho para que el scroll no tape el texto
              "&::-webkit-scrollbar": {
                width: "0.4em",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,.1)",
                borderRadius: "4px",
              },
            }}
          >
            {observacionesModal || "No hay observaciones registradas."}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default FichasAprobadas;
