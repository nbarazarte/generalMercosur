import React, {
  useState,
  useEffect,
  useRef,
  Fragment,
  forwardRef,
} from "react";
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
  CircularProgress,
  Tooltip,
  Badge,
  LinearProgress,
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
//Iconos
import SupportIcon from "@mui/icons-material/Support";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SummarizeIcon from "@mui/icons-material/Summarize";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import MessageIcon from "@mui/icons-material/Message";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FormatoFicha from "./FormatoFicha";
import Chip from "@mui/material/Chip";
import { setSeccionesMasivo } from "../../store/plantillaSlice";
import Lottie from "lottie-react";
import Cargando from "../../assets/LottieFiles/loading.json";
import TuneIcon from "@mui/icons-material/Tune";
import FeedIcon from "@mui/icons-material/Feed";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import DownloadIcon from "@mui/icons-material/Download";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import CrearFicha from "../businessLogic/CrearFicha";
dayjs.locale("es"); // Establece español como idioma por defecto

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const MUIInput = forwardRef((props, ref) => (
  <TextField {...props} inputRef={ref} variant="outlined" fullWidth />
));

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

const FichasFirmadas = () => {
  const dispatch = useDispatch();

  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElAcciones, setAnchorElAcciones] = useState(null);
  const open2 = Boolean(anchorEl);
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

  // Función para manejar el arrastre (puedes ponerla dentro del componente)
  const handleMouseDown = (e, ref) => {
    const container = ref.current;
    if (!container) return;

    container.isDragging = true;
    container.startX = e.pageX - container.offsetLeft;
    container.startY = e.pageY - container.offsetTop;
    container.scrollLeftStart = container.scrollLeft;
    container.scrollTopStart = container.scrollTop;

    container.style.cursor = "grabbing";
    container.style.userSelect = "none"; // Evita seleccionar texto/imagen al arrastrar
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

  //const opcionAsistir = useSelector((state) => state.plantilla.opcionAsistir);

  const [opcionAsistir, setOpcionAsistir] = useState(false);

  useEffect(() => {
    const fetchOpcionesMenu = async () => {
      try {
        const response = await axios.get(`${url}opcionesMenu`, {
          headers,
          params: {
            usuarioBoId: usuarioBoId,
          },
        });

        const puedeAsistir = response.data.some(
          (opcion) => opcion.str_nombre === "Asistir ficha",
        );

        setOpcionAsistir(puedeAsistir);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOpcionesMenu();
  }, []);

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
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [openAsistir, setOpenAsistir] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openPreRegistro, setOpenPreRegistro] = useState(false);
  const [textoLog, setTextoLog] = useState("");
  const [eventSource, setEventSource] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [adultoMenorFilter, setAdultoMenorFilter] = useState("");
  const [agileCheckFilter, setAgileCheckFilter] = useState("");
  // ESTADOS PARA EL EXPEDIENTE, ZOOM Y ROTACIÓN
  const [modalData, setModalData] = useState(null);
  const [modalData2, setModalData2] = useState(null);
  const [rotation, setRotation] = useState({ cedula: 0, rif: 0 });
  const [zoom, setZoom] = useState({ cedula: 1, rif: 1 });
  const logEndRef = useRef(null); // Para auto-scroll
  const [urlDescarga, setUrlDescarga] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cedulasFallidas, setCedulasFallidas] = useState([]);
  const [procesoTerminado, setProcesoTerminado] = useState(false);
  const [cargando, setCargando] = useState(false); // Para deshabilitar el botón mientras procesa
  const [linkZip, setLinkZip] = useState(null);
  const [openModalObservaciones, setOpenModalObservaciones] = useState(false);
  const handleOpenModalObservaciones = (valor) => {
    setOpenModalObservaciones(true);
    setObservacionesModal(valor || "");
  };

  const [anchorElReportes, setAnchorElReportes] = useState(null);
  const open3 = Boolean(anchorElReportes);

  const [openModalMatrizRiesgo, setOpenModalMatrizRiesgo] = useState(false);

  const handleCloseModalObservaciones = () => setOpenModalObservaciones(false);
  const [observacionesModal, setObservacionesModal] = useState("");

  const [openModalCargarArchivoFirmadas, setOpenModalCargarArchivoFirmadas] =
    useState(false);

  const [
    openModalCargarArchivoListasFirmadas,
    setOpenModalCargarArchivoListasFirmadas,
  ] = useState(false);

  const [contando, setContando] = useState(0);
  const [matrizCreada, setMatrizCreada] = useState(0);

  const handleOpenModalCargarArchivoFirmadas = (valor) => {
    setMensajeError("");
    setArchivo(null);
    setNombreArchivo("");
    setOpenModalCargarArchivoFirmadas(true);
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

  const handleCargarListasCedulasFirmadas = async (event) => {
    if (event) event.preventDefault();

    // Reset de estados
    setMensajeError("");
    setCedulasFallidas([]);
    setProcesoTerminado(false);
    setCargando(true);
    setLinkZip(null);

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      const direccion = import.meta.env.REACT_APP_URL_API_LOCAL;
      const response = await fetch(`${direccion}fichas/descargarCedulas`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${import.meta.env.REACT_APP_TOKEN}` },
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let partes = buffer.split("\n\n");
        buffer = partes.pop();

        for (const mensaje of partes) {
          const linea = mensaje.trim();
          if (linea.startsWith("data: ")) {
            const dataJson = JSON.parse(linea.replace("data: ", ""));

            // Si el servidor envía el nombre del ZIP
            if (dataJson.linkDescarga) {
              const urlFinal = `${direccion}descargar-archivo/${dataJson.linkDescarga}`;
              setLinkZip(urlFinal);

              // Descarga automática
              const a = document.createElement("a");
              a.href = urlFinal;
              a.download = dataJson.linkDescarga;
              a.click();
            }

            if (dataJson.fallidas) setCedulasFallidas(dataJson.fallidas);
            if (dataJson.status === "completado") setProcesoTerminado(true);
            if (dataJson.status === "error") setMensajeError(dataJson.message);
          }
        }
      }
    } catch (error) {
      setMensajeError("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const descargarCsvFallidas = () => {
    if (cedulasFallidas.length === 0) return;

    // Generamos el contenido: encabezado + las cédulas que fallaron
    const contenido = "cedula\n" + cedulasFallidas.join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `cedulas_no_procesadas_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  const handleCargarFichasFirmadas = async (event) => {
    if (event) event.preventDefault();
    setMensajeError("");
    setCedulasFallidas([]);
    setProcesoTerminado(false);
    setCargando(true);
    setSuccess(false);

    if (!archivo) {
      setMensajeError("Adjunte el archivo con las cédulas.");
      setCargando(false);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("usuarioBoId", usuarioBoId);

    let fallidasTemp = [];

    try {
      const direccion = import.meta.env.REACT_APP_URL_API_LOCAL;
      const tokenApi = import.meta.env.REACT_APP_TOKEN;

      const response = await fetch(`${direccion}fichas/firmadas/stream`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenApi}` },
        body: formData,
      });

      // Validar si el backend respondió con un error Http antes de procesar el stream
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error en el servidor");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            const jsonString = line.replace("data: ", "").trim();
            if (!jsonString) continue;

            try {
              const data = JSON.parse(jsonString);

              // AGREGADO: Si el backend envía un error controlado en medio del stream
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.progreso) {
                if (!data.fueActualizado) {
                  fallidasTemp.push(data.cedulaActual);
                  setCedulasFallidas((prev) => [...prev, data.cedulaActual]);
                }

                const estado = data.fueActualizado
                  ? "Actualizada"
                  : "No actualizada";
                setMensajeError(
                  `Procesando: ${data.progreso}/${data.total} | Cédula: ${data.cedulaActual} - ${estado}`,
                );
              }

              if (data.finalizado) {
                setProcesoTerminado(true);
                setCargando(false);
                setSuccess(true);

                setMensajeError(
                  `¡Proceso finalizado! ${data.actualizados} fichas actualizadas`,
                );
              }
            } catch (jsonError) {
              console.error("Error al parsear:", jsonError);
            }
          }
        }
      }
    } catch (error) {
      setMensajeError("Error en la carga: " + error.message);
      setCargando(false);
    }
  };

  const handleCloseModalCargarArchivoFirmadas = () =>
    setOpenModalCargarArchivoFirmadas(false);

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

  ///////////////////////////////////// NUEVO CÓDIGOOOOOOO PARA OBSERVACIONESSSSSS
  const [openObservaciones, setOpenObservaciones] = React.useState(false);
  const [idFichaObservaciones, setIdFichaObservaciones] = React.useState(null);

  const handleClickOpenObservaciones = (id_ficha) => {
    setIdFichaObservaciones(id_ficha);
    setOpenObservaciones(true);
  };

  const handleCloseObservaciones = () => {
    setOpenObservaciones(false);
  };

  const handleSubmitObservaciones = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const observaciones = formJson.observaciones;
    const usuario = localStorage.getItem("bo_userName");
    //console.log(observaciones);

    const observaciones_completas = `Usuario: ${usuario}\nFecha: ${dayjs().format("DD/MM/YYYY HH:mm:ss")}\nObservaciones: ${observaciones}\n`;

    handleCloseObservaciones();
    handleDevolver(idFichaObservaciones, observaciones_completas);
  };

  const handleOpenModalCargarListaCedulasFirmadas = (valor) => {
    setMensajeError("");
    setArchivo(null);
    setNombreArchivo("");
    setOpenModalCargarArchivoListasFirmadas(true);
  };

  const handleOpenModalMatrizRiesgo = (valor) => {
    //return alert("Funcionalidad en desarrollo.");
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea crear la matriz de riesgo para todas las fichas?"
        : "¿Confirma que desea crear la matriz de riesgo solo para las fichas seleccionadas?",
    );

    if (respuestaUsuario) {
      setMensajeError("");
      setOpenModalMatrizRiesgo(true);
      handleCrearMatrizRiesgo();
    }
  };

  const handleCloseModalMatrizRiesgo = () => setOpenModalMatrizRiesgo(false);

  const handleCloseModalCargarArchivoListasFirmadas = () =>
    setOpenModalCargarArchivoListasFirmadas(false);

  const handleDevolver = async (ficha_id, observaciones) => {
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
  };

  const handleClickAcciones = (event) => {
    setAnchorElAcciones(event.currentTarget);
  };

  const handleCloseAcciones = () => {
    setAnchorElAcciones(null);
  };

  const handleOpenExpediente = (row) => {
    setModalData(row);
    setRotation({ cedula: 0, rif: 0 });
    setZoom({ cedula: 1, rif: 1 });
  };

  const handleCloseExpediente = () => setModalData(null);

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

  const handleClickReportes = (event) => {
    setAnchorElReportes(event.currentTarget);
  };

  const handleCloseReportes = () => {
    setAnchorElReportes(null);
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
          response = await axios.get(`${url}fichasFirmadasExcel`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
              adultoMenor: adultoMenorFilter,
              agileCheck: agileCheckFilter,
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
        `FichasFirmadas_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCrearMatrizRiesgo = async () => {
    setMatrizCreada(0);
    setContando(0);
    try {
      let filas = [];

      if (clientesSeleccionados.length === 0) {
        const response = await axios.get(`${url}fichasFirmadasExcel`, {
          headers,
          params: {
            page,
            limit: rowsPerPage,
            search: searchTerm,
            searchfecha,
            searchfecha2,
            agileCheck: agileCheckFilter,
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

      // Funciones auxiliares reutilizables (optimizadas fuera del map)
      const convertirFecha = (fecha) => {
        if (!fecha) return "";
        const [dia, mes, año] = fecha.split("-");
        return `${año}-${mes}-${dia}`;
      };

      const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      // Diccionarios optimizados para búsquedas rápidas O(1)
      const mapaEstadoCivil = {
        soltero: 1,
        casado: 2,
        viudo: 3,
        divorciado: 4,
      };

      const mapaCondicionVivienda = {
        adjudicada: 1,
        alquilada: 2,
        "de familiares": 3,
        hipotecada: 4,
        propia: 5,
      };

      const codigosTodosLosPaises = {
        // Zona 1: Norteamérica y Caribe (NANP)
        estados_unidos: "1",
        canada: "1",
        jamaica: "1876",
        bahamas: "1242",
        barbados: "1246",
        anguila: "1264",
        antigua_y_barbuda: "1268",
        islas_caiman: "1345",
        bermudas: "1441",
        granada: "1473",
        islas_turcas_y_caicos: "1649",
        montserrat: "1664",
        santa_lucia: "1758",
        dominica: "1767",
        san_vicente_y_las_granadinas: "1784",
        puerto_rico: "1787",
        republica_dominicana: "1809",
        trinidad_y_tobago: "1868",
        san_cristobal_y_nieves: "1869",
        islas_virgenes_americanas: "1340",
        islas_virgenes_britanicas: "1284",
        guam: "1671",
        samoa_americana: "1684",
        islas_marianas_del_norte: "1670",

        // Zona 2: África y algunas islas
        egipto: "20",
        marruecos: "212",
        argelia: "213",
        tunez: "216",
        libia: "218",
        gambia: "220",
        senegal: "221",
        mauritania: "222",
        mali: "223",
        guinea: "224",
        costa_de_marfil: "225",
        burkina_faso: "226",
        niger: "227",
        togo: "228",
        benin: "229",
        mauricio: "230",
        liberia: "231",
        sierra_leona: "232",
        ghana: "233",
        nigeria: "234",
        chad: "235",
        rca: "236",
        camerun: "237",
        guinea_ecuatorial: "240",
        gabon: "241",
        republica_del_congo: "242",
        rd_congo: "243",
        angola: "244",
        guinea_bissau: "245",
        diego_garcia: "246",
        seichelles: "248",
        sudan: "249",
        ruanda: "250",
        etiopia: "251",
        somalia: "252",
        yibuti: "253",
        kenia: "254",
        tanzania: "255",
        uganda: "256",
        burundi: "257",
        mozambique: "258",
        zambia: "260",
        madagascar: "261",
        reunion: "262",
        zimbabue: "263",
        namibia: "264",
        malaui: "265",
        lesoto: "266",
        botsuana: "267",
        suazilandia: "268",
        sudafrica: "27",
        santa_elena: "290",
        eritrea: "291",
        aruba: "297",
        islas_feroe: "298",
        groenlandia: "299",

        // Zona 3 y 4: Europa
        grecia: "30",
        países_bajos: "31",
        belgica: "32",
        francia: "33",
        espana: "34",
        gibraltar: "350",
        portugal: "351",
        luxemburgo: "352",
        irlanda: "353",
        islandia: "354",
        albania: "355",
        malta: "356",
        chipre: "357",
        finlandia: "358",
        bulgaria: "359",
        lituania: "370",
        letonia: "371",
        estonia: "372",
        moldavia: "373",
        armenia: "374",
        bielorrusia: "375",
        andorra: "376",
        monaco: "377",
        san_marino: "378",
        vaticano: "379",
        ucrania: "380",
        serbia: "381",
        montenegro: "382",
        kosovo: "383",
        croacia: "385",
        eslovenia: "386",
        bosnia: "387",
        macedonia: "389",
        italia: "39",
        reino_unido: "44",
        dinamarca: "45",
        suecia: "46",
        noruega: "47",
        polonia: "48",
        alemania: "49",
        gibraltar_alt: "350",
        austria: "43",
        rumania: "40",
        suiza: "41",
        chequia: "420",
        eslovaquia: "421",
        liechtenstein: "423",

        // Zona 5: América Central y del Sur
        islas_falkland: "500",
        belice: "501",
        guatemala: "502",
        el_salvador: "503",
        honduras: "504",
        nicaragua: "505",
        costa_rica: "506",
        panama: "507",
        san_pedro_y_miquelon: "508",
        haiti: "509",
        peru: "51",
        mexico: "52",
        cuba: "53",
        argentina: "54",
        brasil: "55",
        chile: "56",
        colombia: "57",
        venezuela: "58",
        guayana_francesa: "594",
        surinam: "597",
        ecuador: "593",
        guyana: "592",
        bolivia: "591",
        paraguay: "595",
        antillas_neerlandesas: "599",
        uruguay: "598",

        // Zona 6: Oceanía y Sudeste Asiático
        malasia: "60",
        australia: "61",
        indonesia: "62",
        filipinas: "63",
        singapur: "65",
        tailandia: "66",
        islas_marshall: "692",
        micronesia: "691",
        palaos: "680",
        estados_federados_micronesia: "691",
        nueva_zelanda: "64",
        islas_cook: "682",
        niue: "683",
        samoa: "685",
        kiribati: "686",
        tuvalu: "688",
        tokelau: "690",
        tonga: "676",
        islas_salomon: "677",
        vanuatu: "678",
        fiyi: "679",
        wallis_y_futuna: "681",
        nueva_caledonia: "687",
        papua_nueva_guinea: "675",
        antartida: "672",

        // Zona 7: Rusia y Kazajistán
        rusia: "7",
        kazajistan: "7",

        // Zona 8: Asia Oriental y Servicios Especiales
        japon: "81",
        corea_del_sur: "82",
        vietnam: "84",
        china: "86",
        inmarsat: "870",
        hong_kong: "852",
        macao: "853",
        camboya: "855",
        laos: "856",
        bangladesh: "880",
        taiwan: "886",
        maldivas: "960",
        libano: "961",
        jordania: "962",
        siria: "963",
        iraq: "964",
        kuwait: "965",
        arabia_saudita: "966",
        yemen: "967",
        oman: "968",
        palestina: "970",
        emiratos_arabes: "971",
        israel: "972",
        barein: "973",
        qatar: "974",
        butan: "975",
        mongolia: "976",
        nepal: "977",
        tayikistan: "992",
        turkmenistan: "993",
        azerbaiyan: "994",
        georgia: "995",
        kirguistan: "996",
        uzbekistan: "998",

        // Zona 9: Asia del Sur y Oriente Medio
        turquia: "90",
        india: "91",
        pakistan: "92",
        afganistan: "93",
        sri_lanka: "94",
        myanmar: "95",
        iran: "98",
      };

      const mapaProfesiones = {
        auditor: 3346,
        floricultor: 3351,
        abogada: 1,
        abogado: 1005,
        "abogado sujetos obligados": 3316,
        "abogado tributario": 3050,
        abogados: 3988,
        "academico (a)": 3989,
        accionista: 1024,
        acrobata: 3480,
        "actor / actriz": 3481,
        "actor o actriz": 3990,
        "actor, artista": 3065,
        actuario: 3482,
        acuicultura: 3360,
        acupunturista: 4100,
        "adm. de empresas": 1003,
        "adm. maquillador": 3359,
        "admin. empresas aseguradoras": 3333,
        administracion: 31,
        "administracion tributario": 3049,
        administrador: 3066,
        "administrador (a)": 3991,
        "administrador agencia de empleos": 3343,
        "administrador de agencia de seguridad": 3483,
        "administrador de empresas": 3358,
        "administrador de redes": 3386,
        administradora: 3387,
        "administradora de obra": 3388,
        "administradores(as) de fondos/ inversiones": 4283,
        "administrativo (a)": 3992,
        aduanero: 3484,
        "aeromozo (a)": 3993,
        "agencia de envio": 3873,
        agente: 3868,
        "agente aduanero": 3994,
        "agente de aduana": 3485,
        "agente de bienes raices": 3344,
        "agente de embarque": 3361,
        "agente de rampa": 4284,
        "agente de seguridad vigilante escolta": 3067,
        "agente de servicio al cliente": 3389,
        "agente de viajes": 3495,
        "agente inmobiliario": 3329,
        "agente viajero": 3068,
        "agentes de seguros": 3334,
        agricultor: 3496,
        "agricultor cultivador ganadero avicultor silvicultor": 3069,
        agrimensor: 3497,
        agronomo: 3498,
        "alba?il": 3070,
        albanil: 3499,
        alcalde: 3500,
        "alergologo (a)": 3995,
        alfarero: 3501,
        alguacil: 3071,
        almacen: 3875,
        "almacen suplidor": 3876,
        almacenista: 3390,
        "alquiler de guagua y camion": 3877,
        "alquiler de madera": 3878,
        "alquiler de viviendas": 3973,
        "alquiler habitacion": 3880,
        "alquileres articulos para eventos": 3879,
        "alquileres varios": 3881,
        "ama de casa": 15,
        "ama de llaves": 3502,
        "ama de llaves / mayordomo / domestica": 3362,
        "ama de llaves mayordomo domestica": 3072,
        ambulante: 3972,
        analista: 3503,
        "analista administrativo i": 3391,
        "analista comercial": 3392,
        "analista de cobranzas y facturacion": 3393,
        "analista de cuentas por pagar": 4285,
        "analista de datos": 4101,
        "analista de inventario": 4286,
        "analista de inversion": 1019,
        "analista de monitoreo": 4287,
        "analista de oficina": 3073,
        "analista de riesgo operativo": 4288,
        "analista de sistemas": 3345,
        "analista estadistico": 3504,
        "analista evaluador de credito": 3505,
        "analista financiero": 3506,
        "analista financiero i": 3394,
        "anestesiologo (a)": 3996,
        anestesista: 3507,
        animador: 3074,
        anticuario: 4102,
        "anticuario coleccionista": 3075,
        "antropologia, sociologia y trabajo social": 3076,
        antropologo: 3508,
        "antropologo (a)": 3997,
        arbitro: 3509,
        "arbitro deportivo": 3077,
        arboricultor: 4103,
        archivador: 3510,
        "archiviero (a)": 3998,
        archivista: 3078,
        "archivista digital": 4104,
        "archivologia y bibliotecologia": 3079,
        arqueologo: 3511,
        "arqueologo (a)": 3999,
        arquitecto: 27,
        "arquitecto (a)": 4000,
        "arquitecto naval": 3363,
        "arquitectura aeronautica y ciencias naoticas": 3080,
        "arquitectura y urbanismo": 3081,
        "artes y musica": 3082,
        "artes, letras y similares": 3083,
        artesano: 3084,
        "artesano (a)": 4001,
        artista: 3085,
        "artista de circo": 3086,
        ascensorista: 3087,
        aseador: 3088,
        "aseador o trabajador manual": 3512,
        "asegurador marino": 3364,
        aserrador: 3089,
        asesor: 1026,
        "asesor comercial": 4289,
        "asesor consultor": 3090,
        "asesor de inversiones": 3335,
        "asesor financiero": 3042,
        "asesor inmobiliario": 3513,
        "asesor legal": 3514,
        "asesor tecnico de servicios": 3395,
        "asesora de vivienda": 4290,
        asistente: 1004,
        "asistente administrativa": 3396,
        "asistente administrativa i": 3397,
        "asistente administrativo": 3398,
        "asistente contable": 3399,
        "asistente de arquitectura": 3400,
        "asistente de auditoria": 3401,
        "asistente de back office": 4291,
        "asistente de cabina": 3053,
        "asistente de cocina": 4292,
        "asistente de contabilidad": 3402,
        "asistente de estadisticas y captacion": 3403,
        "asistente de farmacia": 4293,
        "asistente de gerencia": 3404,
        "asistente de informacion y relaciones publicas": 3405,
        "asistente de mantenimiento": 4294,
        "asistente de maquinaria": 4295,
        "asistente de mercadeo": 4296,
        "asistente de negocios": 4297,
        "asistente de operaciones": 4298,
        "asistente de prevencion": 4299,
        "asistente de producción": 4300,
        "asistente de rrhh": 4301,
        "asistente de venta": 4302,
        "asistente del director de proyecto": 4303,
        "asistente ejecutivo": 3406,
        "asistente general": 3407,
        "asistente legal": 3314,
        "asistente medico": 4304,
        "asistente odontologia": 3315,
        astrofisico: 4002,
        astrologo: 3515,
        "astrologo (a)": 4003,
        astronomo: 3516,
        "astronomo (a)": 4004,
        "atencion al cliente": 3063,
        atleta: 3517,
        audiologo: 3332,
        "auditor financiero": 4180,
        "auditor junior": 3408,
        "auxilar de compras": 4305,
        auxiliar: 3904,
        "auxiliar administrativo de bodega": 4306,
        "auxiliar computos": 3906,
        "auxiliar contabilidad": 3905,
        "auxiliar costos": 3907,
        "auxiliar de arqueo": 4307,
        "auxiliar de bodega": 3409,
        "auxiliar de credito y cobro": 4308,
        "auxiliar de embutidos": 3410,
        "auxiliar de enfermeria": 3518,
        "auxiliar de farmacia": 4309,
        "auxiliar de lacteos": 4310,
        "auxiliar de logistica": 4311,
        "auxiliar de prevencion y perdidas": 4312,
        "auxiliar de supermercados": 4313,
        "auxiliar en recursos humanos": 3411,
        avicultor: 3519,
        "ayuda familiares": 3909,
        "ayudante agrimensura": 3412,
        "ayudante de albanil": 3413,
        "ayudante de bus colegial": 3520,
        "ayudante electrico": 3414,
        "ayudante general": 36,
        "ayudante general - dirigente": 3415,
        "ayudante general de bodega": 3416,
        "ayudante general en comercio": 3521,
        "ayudante general en restaurante": 3522,
        azafata: 4005,
        "azafata asistente de abordo": 3091,
        "azafata promotora": 3523,
        bacteriologo: 3524,
        "bacteriologo (a)": 4006,
        bailarin: 3525,
        "bailarin(a)": 4105,
        "banca de apuestas": 3910,
        banquero: 21,
        "banquero privado": 4181,
        "banqueros (y sus lugaros de negocios)": 4278,
        barbero: 3093,
        barillero: 3911,
        barista: 4106,
        barman: 3094,
        "barrendero (a)": 4007,
        bartender: 3417,
        becada: 3912,
        "bedel (a) conserje": 4008,
        beisbolista: 3526,
        beneficiario: 3054,
        "bibliotecario (a)": 4009,
        bibliotecarios: 3095,
        "bienes raices": 1040,
        billetera: 1018,
        bioanalisis: 3096,
        "biofisico (a)": 4010,
        "biografo (a)": 4011,
        biologia: 3097,
        "biologia marina y ciencias aplicadas al mar": 3098,
        biologo: 3527,
        "biologo (a)": 4012,
        "biologo marino": 4107,
        biomedico: 3418,
        biotecnologo: 4108,
        "bloguero / influencer": 4109,
        bombero: 3099,
        botanico: 3528,
        botellero: 3913,
        "botones (maletero de hotel)": 3529,
        boxeador: 3530,
        "brillador de vehiculos": 3914,
        "broker (corredor de bolsa)": 4110,
        "broker de seguros": 4182,
        buhonero: 3532,
        buzo: 3100,
        "caddie (asistente de golf)": 4111,
        caddy: 3101,
        cafeteria: 3882,
        cajero: 3102,
        "cajero (a)": 4013,
        "cajero automatico (tecnico)": 4112,
        "cajero de almacen": 3533,
        "cajero de banco": 3534,
        "cajero en comercio": 3535,
        caletero: 3103,
        "camar?grafo": 3105,
        camarero: 3104,
        "camarero (a)": 4014,
        camarografo: 3365,
        "camarografo de television": 3536,
        cambista: 3106,
        camillero: 3107,
        "camionero de transporte de valores": 4183,
        cantante: 3108,
        cantinero: 3109,
        capacitador: 4314,
        capataz: 3419,
        "capataz de la construccion": 3537,
        capitan: 4315,
        "capitan de aviacion": 3538,
        "capitan de barco": 3539,
        "captador de datos": 3420,
        cardiologo: 3540,
        "cardiologo (a)": 4015,
        caricaturista: 3541,
        carnicero: 3883,
        carpintero: 3110,
        "carpintero (a)": 4016,
        "carpintero (construccion y mantenimiento)": 3542,
        carretillero: 3543,
        cartero: 3111,
        "cartero (a)": 4017,
        cartografo: 3112,
        "cartografo (a)": 4018,
        "cartonero (reciclador)": 4113,
        catador: 3113,
        cauchero: 3114,
        cazador: 3115,
        celador: 3544,
        "centro de unas": 3884,
        ceramista: 4114,
        cerrajero: 3116,
        "cerrajero (a)": 4019,
        chapistero: 3545,
        chef: 3546,
        "chef pastelero": 4115,
        "chefs/cocina": 3048,
        chequeador: 4316,
        chiripero: 3885,
        chofer: 3886,
        "ciencias administrativas gerenciales": 3117,
        "ciencias administrativas y financieras fiscales y rentas": 3118,
        "ciencias basicas": 3119,
        "ciencias de la salud": 3120,
        "ciencias del agro y del mar, recursos naturales": 3121,
        "ciencias fiscales y financieras": 3122,
        "ciencias mecanicas, electrica y electronicas": 3123,
        "ciencias navales": 3124,
        "ciences policiales": 3125,
        "ciencias politicas": 4317,
        "ciencias sociales y similares": 3126,
        "ciencias y artes militares": 3127,
        cirujano: 3887,
        "cirujano en general": 3547,
        citologo: 3548,
        climatologo: 3549,
        "coach de vida": 4116,
        cobrador: 18,
        "cobrador (a)": 4020,
        cocinero: 3550,
        "cocinero chef": 3128,
        colmado: 3890,
        comerciante: 12,
        "comerciante de arte": 4185,
        "comerciante de bienes raices": 4184,
        "comerciante de chatarra y metales": 3129,
        "comerciante de metales preciosos": 4186,
        "comerciante de vehiculos de lujo": 4187,
        "comerciante independiente (buhonero, comisionista, vendedor ambulante, comerciante)": 3130,
        "community manager": 4117,
        compositor: 3131,
        "compositor musical": 3551,
        comprador: 3552,
        "computista programador": 3132,
        "comunicacion social": 3133,
        "comunicador social": 3045,
        conductor: 3421,
        "conductor (a)": 4021,
        "conductor (chofer, taxista, gandolero)": 3134,
        "conductor de taxi": 3553,
        "conductor de vehiculo i": 3422,
        conserje: 3135,
        "construccion y diseno de obras civiles": 3136,
        constructor: 3137,
        "constructor obrero": 4022,
        consul: 3554,
        consultor: 33,
        "consultor ambiental": 3555,
        "consultor de negocios": 3556,
        "consultor fiscal": 4188,
        "consultor legal": 3557,
        "consultor marino": 3366,
        contable: 3138,
        contador: 2,
        "contador (a)": 4023,
        "contador privado": 3311,
        "contador publico": 3310,
        "contador p?blico": 4191,
        "contador sujetos obligados": 3317,
        "contador tributario": 3052,
        contaduria: 3139,
        contralor: 3889,
        "contralor general de la republica": 3558,
        "contralora|": 2043,
        contratista: 3140,
        "contratista constructor": 4024,
        "contratista de construccion": 3559,
        "contratista de obras publicas": 4192,
        "control de inventario": 4318,
        "controlador aereo": 4118,
        coordinador: 3560,
        "coordinador de abasto": 4319,
        "coordinador de canales y comercio exterior": 1017,
        "coordinador de fondos de inversion": 4193,
        "coordinador de mantenimiento de flota": 4320,
        "coordinador de piso": 4321,
        "coordinador de salud": 4322,
        "coordinador logistico": 4280,
        "coordinadora administrativa": 4323,
        "coordinadora de asusntos regulatorios y biomedica": 4324,
        coreagrafo: 3141,
        coreografo: 3561,
        corredor: 1012,
        "corredor de aduana": 3562,
        "corredor de bienes raices": 3336,
        "corredor de bienes raices de lujo": 4190,
        "corredor de bolsa": 4189,
        "corredor de bolsa de valores": 3563,
        "corredor de reasegurados": 3337,
        "corredor de seguros": 1043,
        corregidor: 3564,
        "cosechador de cafe": 3565,
        "cosechador de fruta": 3566,
        cosmetologo: 3567,
        costurero: 3143,
        cotizador: 3568,
        creativo: 3144,
        "crianza de animales": 3974,
        criminologia: 3309,
        criminologo: 3569,
        "criptomonedas trader": 4194,
        cristalero: 3145,
        "cuidador de enfermos en hogar particular": 3570,
        "cuidador de ninos en guarderia": 3571,
        "cuidador nia?ero": 3146,
        "cuidador ninero": 3367,
        "custodio de valores": 3572,
        decorador: 3147,
        "decorador(a) de interiores": 4119,
        "defensor publico": 3423,
        delivery: 3890,
        dentista: 3892,
        "deportista (atleta)": 3148,
        "deportista profesional": 3573,
        derecho: 3149,
        dermatologo: 3574,
        "dermatologo (a)": 4025,
        desabollador: 3891,
        "desarrollador de software": 4120,
        "desarrollador web y multimedia": 3575,
        desempleado: 3150,
        "desempleado y/o sin profesion": 4026,
        "desvenador de tabaco": 3576,
        detective: 3577,
        "detective investigador": 3151,
        dibujante: 3152,
        "dibujante cartografo i": 3424,
        "dibujante tecnico": 4121,
        dietista: 4122,
        digitator: 3893,
        diplomatico: 3347,
        diputado: 3867,
        "diputado o legislador": 3578,
        director: 1032,
        "director - presidente": 1031,
        "director (a)": 4027,
        "director de empresas": 41,
        "director de servicios": 30,
        "director financiero": 9,
        "director general": 8,
        "director regional": 3977,
        "dise?ador": 3153,
        disenador: 40,
        "disenador de interiores": 3579,
        "disenador de moda": 4123,
        "disenador grafico": 3580,
        "disenador industrial": 4124,
        diskjockey: 3154,
        docente: 4028,
        "docente (profesor maestro)": 3155,
        "docente de ingles": 3425,
        doctor: 4029,
        "doctor(a)": 3320,
        "drafting specialist": 3426,
        "dueno de casas de cambio": 4196,
        "dueno de casas de empeno": 4197,
        "dueno de casinos": 4195,
        "dueno de clubes nocturnos": 4198,
        "dueno de empresas offshore": 4203,
        "dueno de galerias de arte": 4199,
        "dueno de joyerias": 4200,
        "dueno de negocios de importacion/exportacion": 4201,
        "dueno de restaurantes exclusivos": 4202,
        "dueno de talleres mecanicos con alto flujo de efectivo": 4204,
        ebanista: 3156,
        ecologo: 4030,
        economia: 3157,
        economista: 4031,
        "economista tributario": 3051,
        "editor de video": 4125,
        "editor(a) de videos": 3319,
        "editor, cronista": 3581,
        "educacion agropecuaria": 3158,
        "educacion en castellano y literatura, idiomas y lenguas extranjeras": 3159,
        "educacion en ciencias basicas": 3160,
        "educacion en ciencias sociales": 3161,
        "educacion especial": 3162,
        "educacion fisica": 3163,
        "educacion pedagogica y preescolar": 3164,
        "educacion tecnica industrial y comercial": 3165,
        "educacion y pedagogia": 3166,
        "educador (a)": 4032,
        educadora: 2041,
        "ejec. de telemercadeo": 1002,
        "ejecutiva de negocios": 4325,
        "ejecutiva de servicio al cliente b2c customer car.": 3427,
        ejecutivo: 6,
        "ejecutivo bancario de alto nivel": 4205,
        "ejecutivo de centro regional de servicios": 3428,
        "ejecutivo de cuenta": 3870,
        "ejecutivo de fondos mutuos": 4206,
        "ejecutivo de ventas": 4326,
        "ejecutivo de ventas de seguros": 3338,
        electricista: 3167,
        "electricista industrial": 4126,
        electromecanico: 3582,
        "ematologo (a)": 4033,
        embajador: 3583,
        "embajador(a)": 4127,
        "empleada domestica": 3348,
        "empleado de oficina o negocio": 3168,
        "empleado privado": 3902,
        "empleado publico": 3903,
        emprendedor: 3894,
        "emprendedor de fintech": 4207,
        empresario: 7,
        encargado: 3429,
        encuestador: 3169,
        endocrinologo: 3584,
        "endocrinologo (a)": 4034,
        endodoncista: 3585,
        enfermeria: 3170,
        enfermero: 3061,
        "enfermero (a)": 4035,
        "entrenador deportivo": 3171,
        "epatologo (a)": 4036,
        "epidemiologo (a)": 4037,
        escenografo: 3172,
        escritor: 3173,
        escultor: 3586,
        "escultor tallador": 3174,
        "esoterico brujo vidente astrologo espiritista": 3175,
        "especialista de implementacion": 3430,
        "especialista en comercio exterior": 4128,
        "especialista en compliance": 4208,
        "especialista en evasion fiscal": 4209,
        "especialista en fraude financiero": 4210,
        "especialista en lavado de dinero": 4211,
        "especialista en mercados de capitales": 4212,
        "especialista en recursos humanos": 4129,
        "especialista funcional": 4327,
        estadista: 4038,
        "estadistica y ciencias actuariales": 3176,
        estetica: 3895,
        estibador: 3587,
        estilista: 3177,
        "estilista y manicurista": 3588,
        estudiante: 1035,
        "estudiante universitario": 3350,
        "estudios internacionales": 3178,
        "estudios politicos": 3179,
        "evaluador de proyectos i": 3478,
        "exploracion y explotacion de minas, petroleo e hidrocarburos": 3180,
        explosivista: 3181,
        exportador: 3901,
        farmaceutico: 3182,
        "farmaceutico (a)": 4039,
        farmacia: 3368,
        "filosofia y teologia": 3369,
        filosofo: 3183,
        "filosofo (a)": 4040,
        financista: 39,
        fiscal: 3589,
        "fiscal de transito": 3184,
        fisica: 3185,
        fisico: 3590,
        fisiologo: 3591,
        fisioterapeuta: 4041,
        fisioterapista: 3896,
        floristero: 3186,
        fonoaudiologia: 3327,
        forense: 4042,
        fotografo: 3593,
        "fotografo de moda": 4130,
        frutero: 4043,
        fumigador: 3188,
        "fumigador y controlador de plagas y malezas": 3594,
        "funcionario extranjero (embajada, consulado)": 3189,
        "funcionario publico": 3190,
        "funcionario publico de eleccion popular": 3191,
        futbolista: 3595,
        gallero: 3918,
        ganadero: 3487,
        gastroenterologo: 3596,
        geografia: 3370,
        geografo: 3192,
        geologo: 3352,
        "geologo (a)": 4044,
        geoquimico: 4045,
        gerente: 13,
        "gerente administrativo": 3597,
        "gerente de banco privado": 4213,
        "gerente de casa de cambio": 4214,
        "gerente de credito": 17,
        "gerente de finanzas": 14,
        "gerente de operaciones financieras": 4215,
        "gerente de plataforma de pagos digitales": 4216,
        "gerente de recursos humanos": 4328,
        "gerente de riesgo financiero": 4217,
        "gerente de sucursal": 4329,
        "gerente de venta": 1030,
        "gerente general": 11,
        "gerente recurso": 1008,
        "gerente region": 26,
        geriatra: 4046,
        gestor: 3193,
        "gestor (a) de clientes o que actua en nombre de estos": 4279,
        "gestor cultural": 4131,
        "gestor de cobro por telefono": 3598,
        "gestor de fondos de inversion": 4218,
        "gestor de patrimonio": 4219,
        ginecologo: 3599,
        gomero: 3917,
        granitero: 3194,
        groupier: 3916,
        guardabosques: 4132,
        "guardaparques guardabosques": 3195,
        guardavias: 4330,
        guardia: 3479,
        "guardia de seguridad": 3600,
        "guia de turismo": 3601,
        "guia turistico": 4133,
        hacendado: 3919,
        "hacker etico": 4134,
        heladeria: 3920,
        heladero: 3602,
        hematologo: 3603,
        herrero: 3197,
        "herrero, forjador": 3198,
        "hidrografo (a)": 4047,
        higienista: 4048,
        historia: 3371,
        historiador: 3199,
        "historiador (a)": 4049,
        "historiador del arte": 4135,
        hojalatero: 3604,
        hostess: 3431,
        "idiomas modernos": 3200,
        "ilustrador(a)": 4136,
        imprenta: 3926,
        independientes: 1021,
        "informatica, sistemas y computacion": 3201,
        informatico: 3605,
        "ing. comercial": 35,
        "ingeneria agronomica, agricola, agroindustrial y de produccion": 3202,
        "ingenieria civil y similares": 3203,
        "ingenieria de alimentos": 3204,
        "ingenieria de barcazas": 3372,
        "ingenieria de carga": 3373,
        "ingenieria de construccion naval": 3374,
        "ingenieria de sistemas, computacion e informatica": 3205,
        "ingenieria en recursos naturales renovables y forestal": 3206,
        "ingenieria geologica, geofisica e hidrometereologica": 3207,
        "ingenieria industrial": 3326,
        "ingenieria marina": 3375,
        "ingenieria maritima": 3980,
        "ingenieria mecanica, electrica y electronica": 3208,
        "ingenieria petrolera, minas e hidrocarburos": 3209,
        "ingenieria quimica e industriales": 3210,
        ingeniero: 3,
        "ingeniero (a)": 4050,
        "ingeniero ambiental": 4137,
        "ingeniero civil": 4,
        "ingeniero de estructuras": 3921,
        "ingeniero electrico": 3041,
        "ingeniero electromecanico": 2044,
        "ingeniero electronico": 4138,
        "ingeniero en sistemas": 4139,
        "ingeniero mecanico": 4140,
        "ingeniero quimico": 4141,
        "ingeniero telecomunicaciones": 3923,
        "ingeniero telematico": 3924,
        inspector: 3925,
        "inspector de aduanas": 3606,
        "inspector de aduanas ii": 3432,
        "inspector de averias": 3339,
        "inspector de obra gris": 3433,
        "inspector de seguridad": 3434,
        "inspector de siniestro": 3211,
        "inspector docente": 3435,
        "inspector i": 3436,
        inspectora: 3437,
        "instalador calificado": 4331,
        "instalador de alarma (carros, casas)": 3607,
        "instalador de cables": 4332,
        "instalador de productos": 4333,
        instructor: 3608,
        "instructor (de manejo, de algun oficio)": 3212,
        "intermediario profesional": 4334,
        internacionalista: 4281,
        interprete: 3609,
        inversionista: 22,
        "inversionista en bienes raices": 4220,
        "inversionista en criptomonedas": 4221,
        inversionistas: 3983,
        investigador: 4051,
        "investigador cientifico": 4142,
        "investigador de fraudes financieros": 4222,
        "investigador privado": 3610,
        "jardin de ninos": 3928,
        jardinero: 3214,
        "jardinero en casa de familia": 3611,
        "jefa de compras": 4335,
        "jera de recursos humanos": 1013,
        jefe: 3215,
        "jefe de administracion": 3612,
        "jefe de asesoria legal": 1014,
        "jefe de bodega": 4336,
        "jefe de cocina": 4143,
        "jefe de logistica": 1027,
        "jefe de recursos humanos": 3438,
        "jefe de tesoreria": 1016,
        jinete: 3216,
        jockey: 3613,
        joyero: 3614,
        "joyero orfebre": 3217,
        jubilada: 5,
        jubilado: 1036,
        "jubilado (a)": 4052,
        "jubilado pensionado": 3218,
        "juegos de azar": 3927,
        juez: 3615,
        "juez (a)": 4053,
        "juez en casos de lavado de dinero": 4223,
        kinesiologo: 4144,
        "laboratorista (tecnico)": 3219,
        "laboratorista clinico": 3616,
        "lam manager": 24,
        "lavadero limpieza de carros": 3933,
        "lavador profesional": 4224,
        "lavandero (a)": 4054,
        "lavandero limpiador planchador": 3220,
        lavaplatos: 3617,
        "legal advisor en fintech": 4225,
        lenador: 3376,
        letras: 3222,
        "lic. admon.": 2045,
        "licencia nutricion": 2042,
        "licenciada en ciencia y cultura de la alimentacion": 3979,
        "licenciado (a)": 4055,
        "licenciado en ciencia y cultura de la alimentacion": 3978,
        "licenciado en negocios/empresariales": 3340,
        "licenciatura en contabilidad": 3929,
        "licenciatura en economia": 3932,
        "licenciatura en finanzas": 3931,
        "licenciatura en quimica": 3934,
        "licenciatura en sistema": 3930,
        "licorero bodeguero lunchero": 3223,
        limosnero: 3224,
        limpiabotas: 3225,
        linguista: 4056,
        "liquidador de fondos": 4226,
        litografia: 3935,
        "llantero reparador de neumatico de vehiculo": 3618,
        locutor: 3619,
        "locutor (a)": 4057,
        "locutor de radio , tv": 3226,
        logistico: 4145,
        loquero: 3227,
        lotero: 3228,
        maestro: 3871,
        "maestro (a)": 4058,
        "maestro constructor": 3872,
        "maestro de ceremonia": 3620,
        "maestro de educacion parvularia": 3621,
        "maestro de ensenanza primaria": 3622,
        "maestro de obra": 3623,
        magister: 1007,
        magistrado: 3624,
        mago: 3625,
        maletero: 3229,
        "manager de casinos": 4227,
        manicurista: 3230,
        "manicurista y pedicuro": 3626,
        "manipulador de alimentos": 4337,
        mantenimiento: 4338,
        maquillador: 3627,
        maquinista: 4146,
        "maquinista de avion de navegacion": 3231,
        marinero: 3312,
        "marinero de cubierta": 3628,
        "market cs manager": 3439,
        masajista: 3232,
        "masajista de belleza": 3629,
        "masajista terapeuta": 3630,
        matematica: 3233,
        matematico: 3631,
        "matematico (a)": 4059,
        mayordomo: 3234,
        "mayordomo domestico": 3632,
        "mc limpio": 3440,
        mecanico: 3441,
        "mecanico general": 3633,
        "mecanico latonero pintor de vehiculo": 3235,
        mecanografo: 3634,
        "mecanografo escribiente transcriptor": 3236,
        "mediador(a)": 4147,
        "medicina veterinaria": 3377,
        "medicina y psiquiatria": 3378,
        medico: 38,
        "medico forense": 3635,
        "medico general": 3636,
        "medico radiologo": 3637,
        mensajero: 3239,
        "mensajero (a)": 4060,
        mercadeo: 1011,
        "mercader de oro y piedras preciosas": 4228,
        mercaderista: 3638,
        mercadologo: 3357,
        "mercadotecnia, publicidad y turismo": 3240,
        mesero: 3639,
        "mesero (a)": 4061,
        mesonero: 3241,
        meteorologo: 3640,
        microbiologo: 3641,
        microfilmador: 3642,
        "miembro erd": 3936,
        "miembro fard": 3938,
        "miembro p.n": 3937,
        militar: 3242,
        minero: 3243,
        "minero cantero": 3244,
        "ministro evangelico": 3897,
        "ministro o canciller": 3643,
        misionero: 3644,
        "modelador 3d": 4148,
        modelo: 3245,
        modista: 3645,
        morfologo: 3646,
        mosaiquero: 3647,
        "moto concho": 3939,
        motociclista: 3648,
        motorizado: 3246,
        musico: 3649,
        musiquero: 3442,
        "narrador, comentarista": 3650,
        nefrologo: 3651,
        neumologo: 3652,
        neurocirujano: 3653,
        "neurocirujano (a)": 4062,
        neurologo: 3654,
        "neurologo (a)": 4063,
        ninera: 3655,
        "no aplica": 3940,
        notaria: 1042,
        notario: 1041,
        "notario publico": 3656,
        "notificador judicial": 3657,
        "nutricion y dietetica": 3248,
        "nutricionista deportivo": 4149,
        "nutricionista-dietista": 3658,
        "nutrologo (a)": 4064,
        obrero: 3249,
        observador: 3659,
        oceanografo: 3660,
        "oceanografo (a)": 4065,
        "oceanografo especializado": 4150,
        "ocupacion no listada": 4066,
        odontologia: 3379,
        odontologo: 3661,
        "odontologo u dentista": 4067,
        "office manager": 23,
        oficial: 34,
        "oficial de canales digitales": 4339,
        "oficial de cubierta": 3662,
        "oficial de cumplimiento": 29,
        "oficial de institucion financiera": 4340,
        "oficial de maquina": 3663,
        "oficial de planilla": 4354,
        "oficial de policia": 3664,
        "oficial de prestamos": 3665,
        "oficial de sala de tribunales": 3666,
        "oficial de tramite": 4341,
        "oficial mayor": 3667,
        "oficial mecanico de vuelo": 3668,
        "oficial navegante": 3669,
        oficinista: 3251,
        "oficinista i": 3444,
        "oficinista ii": 3443,
        oftalmologo: 3670,
        "oftalmologo (a)": 4068,
        oncologo: 3671,
        operador: 3672,
        "operador cambiario fronterizo": 3982,
        "operador cctv": 4342,
        "operador de casas de cambio": 4229,
        "operador de computadora i": 3445,
        "operador de equipo": 3673,
        "operador de equipo liviano": 3446,
        "operador de equipo pesado": 3447,
        "operador de equipos y maquinas": 3252,
        "operador de fondos de cobertura": 4230,
        "operador de maquina": 45,
        "operador de maquinaria pesada": 4151,
        "operador de metro": 4343,
        "operador de metrobus": 4344,
        "operador de montacarga": 44,
        "operador de servicios mvts (money value transfer services)": 4240,
        "operador de servicios tecnicos": 3448,
        "operador de sistema de alarma de seguridad": 3674,
        "operador de sistemas de pago": 4237,
        "operador de transferencias internacionales": 4238,
        "operador en bolsa": 4232,
        "operador en cambio de divisas": 4246,
        "operador en cuentas numeradas": 4247,
        "operador en mercados otc": 4233,
        "operador en plataformas de crowdfunding": 4248,
        "operador en plataformas p2p": 4249,
        "operador en transacciones de alto valor": 4250,
        "operador en transacciones internacionales": 4234,
        "operador financiero en banca privada": 4239,
        "operador financiero en criptomonedas": 4235,
        "operador financiero en fideicomisos": 4252,
        "operador financiero en fondos fiduciarios": 4251,
        "operador financiero en gestion de activos": 4254,
        "operador financiero en inversiones alternativas": 4253,
        "operador financiero en manejo de fondos extranjeros": 4255,
        "operador financiero en paraisos fiscales": 4231,
        "operador financiero para clientes de alto patrimonio": 4256,
        "operador financiero para clientes no residentes": 4257,
        "operador financiero para empresas pantalla": 4258,
        "operador financiero para empresas shell": 4259,
        "operador financiero para estructuras complejas": 4260,
        "operador financiero para lavado de dinero internacional": 4273,
        "operador financiero para manejo de activos digitales": 4274,
        "operador financiero para mercados emergentes": 4275,
        "operador financiero para movimientos transfronterizos": 4262,
        "operador financiero para pagos internacionales": 4263,
        "operador financiero para sectores de alto riesgo": 4276,
        "operador financiero para servicios de banca corresponsal": 4277,
        "operador financiero para servicios de custodia": 4264,
        "operador financiero para servicios de escrow": 4267,
        "operador financiero para servicios fiduciarios": 4268,
        "operador financiero para servicios offshore": 4269,
        "operador financiero para trading de activos": 4270,
        "operador financiero para transacciones con criptomonedas": 4271,
        "operador financiero para transacciones ilicitas": 4272,
        "operador financiero para transferencias electronicas": 4265,
        "operador financiero para trusts": 4261,
        "operador financiero para vehiculos de inversion": 4266,
        "operador inmobiliario": 4243,
        "operador logistico de dinero en efectivo": 4236,
        "operador mayorista de vehiculos de lujo": 4244,
        "operador minorista de metales preciosos": 4245,
        "operador offshore": 4241,
        "operador para lavado de activos": 4242,
        operario: 3675,
        optometrista: 4069,
        "optometrista clinico": 4152,
        ordenador: 3676,
        orfebre: 3677,
        organizador: 3678,
        "organizador de eventos": 3941,
        "organizador de eventos culturales": 3679,
        "orientador (a)": 4070,
        ortodoncista: 3680,
        ortopeda: 3681,
        ortopedista: 4071,
        otorrinolaringologo: 3682,
        otorrinonaringologo: 4072,
        otros: 3057,
        paleontologo: 4153,
        paletera: 3947,
        panadero: 3683,
        "panadero (a)": 4073,
        "panadero pastelero carnicero quesero": 3253,
        paquetero: 3684,
        paramedico: 4074,
        "paramedico de ambulancia": 3685,
        "paramedico de emergencia": 4154,
        parasitologo: 3686,
        parquero: 3255,
        "partero(a)": 4155,
        "pasabarco (pasacable)": 3687,
        pasante: 3256,
        "pastelero (a)": 4075,
        "pastelero y repostero": 3688,
        pastero: 3449,
        pastor: 3942,
        "pastor (lider religioso)": 4156,
        patologo: 3689,
        payaso: 3690,
        pedagogo: 4076,
        pediatra: 3691,
        pedicurista: 3257,
        pelotero: 3943,
        peluquero: 3258,
        "peluquero - barbero": 3692,
        "peluquero (a)": 4077,
        "peluquero de animales": 3693,
        pensionado: 3531,
        peon: 3981,
        "perforador de petroleo": 3380,
        perfumista: 4157,
        periodista: 3321,
        perito: 4078,
        "perito comercial": 4345,
        "perito contador": 3322,
        "perito valuador": 3259,
        "personal de mantenimiento cooperativistas": 4282,
        pescador: 3260,
        "pica pollo": 3949,
        piloto: 3058,
        "piloto de aeronave": 3694,
        "piloto de avion navegacion vehiculo": 3261,
        "piloto de drones": 4158,
        pintor: 3262,
        "pintor de brocha gorda": 4079,
        "pintor i": 3450,
        "pintor, artista en pintura": 3695,
        planchador: 3696,
        "planificador economico y social": 3697,
        plomero: 3263,
        "plomero (fontanero)": 3698,
        podologo: 4080,
        "podologo deportivo": 4159,
        policia: 3353,
        "policia de transito": 3699,
        politico: 3264,
        politologo: 4081,
        pollera: 3948,
        poretero: 4082,
        portero: 3265,
        "porteros (dentro de oficinas)": 3975,
        prensador: 3700,
        preparador: 3701,
        "preparador de papel": 3266,
        presidente: 16,
        "presidente (empresa, club, organizacion)": 3267,
        prestamista: 3268,
        "principiante de pintor": 3451,
        "principiante electrico": 3452,
        "principiante refuerzo": 3453,
        proctologo: 4083,
        procurador: 3702,
        productor: 1029,
        "productor (teatro, cine, radio o tv)": 3269,
        "productor agropecuario": 3703,
        profesor: 42,
        "profesor (a)": 4084,
        "profesor de agricultura": 3704,
        "profesor de alfabetizacion de adultos": 3705,
        "profesor de anatomia": 3706,
        "profesor de antropologia": 3707,
        "profesor de arqueologia": 3708,
        "profesor de arquitectura": 3709,
        "profesor de arte grafica": 3710,
        "profesor de artes graficas y encuadernacion": 3711,
        "profesor de artes industriales": 3712,
        "profesor de artistica y dibujo": 3713,
        "profesor de astronomia": 3714,
        "profesor de bacteriologia": 3715,
        "profesor de baile y danza a particulares": 3716,
        "profesor de bellas artes": 3717,
        "profesor de belleza": 3718,
        "profesor de bibliotecologia": 3719,
        "profesor de biologia": 3720,
        "profesor de bioquimica": 3721,
        "profesor de botanica": 3722,
        "profesor de ciencias agropecuarias, forestales y pesqueras": 3723,
        "profesor de ciencias de la salud, nutricion y biomedicas": 3724,
        "profesor de ciencias forenses": 3725,
        "profesor de ciencias medicas": 3726,
        "profesor de ciencias militares": 3727,
        "profesor de ciencias naturales": 3728,
        "profesor de ciencias politicas": 3729,
        "profesor de ciencias sociales": 3730,
        "profesor de ciencias tecnicas": 3731,
        "profesor de civica": 3732,
        "profesor de clases de espanol a particulares": 3733,
        "profesor de clases de frances a particulares": 3734,
        "profesor de clases de ingles a particulares": 3735,
        "profesor de clases de instrumentos musicales a particulares": 3736,
        "profesor de clases de musica y canto a particulares": 3737,
        "profesor de comercio": 3738,
        "profesor de comunicacion": 3739,
        "profesor de construccion": 3740,
        "profesor de contabilidad": 3741,
        "profesor de corte y confeccion": 3742,
        "profesor de derecho y ciencias politicas": 3743,
        "profesor de desarrollo comunitario": 3744,
        "profesor de desarrollo forestal": 3745,
        "profesor de dibujo industrial": 3746,
        "profesor de dibujo tecnico": 3747,
        "profesor de dietetica": 3748,
        "profesor de disciplinas artisticas": 3749,
        "profesor de ebanisteria y tapiceria": 3750,
        "profesor de ecologia y ciencias del mar": 3751,
        "profesor de economia": 3752,
        "profesor de economia domestica": 3753,
        "profesor de educacion especial": 3754,
        "profesor de educacion fisica": 3755,
        "profesor de deucacion para el hogar y familiar": 3756,
        "profesor de educacion y pedagogia": 3757,
        "profesor de electricidad": 3758,
        "profesor de electronica": 3759,
        "profesor de enfermeria": 3760,
        "profesor de espanol": 3761,
        "profesor de estadistica": 3762,
        "profesor de estudio sociales": 3763,
        "profesor de farmacia": 3764,
        "profesor de filosofia": 3765,
        "profesor de fisica": 3766,
        "profesor de frances": 3767,
        "profesor de geografia": 3768,
        "profesor de historia": 3769,
        "profesor de idioma y linguistica": 3770,
        "profesor de informatica": 3771,
        "profesor de ingenieria civil": 3772,
        "profesor de ingles": 3773,
        "profesor de manualidades": 3774,
        "profesor de matematicas": 3775,
        "profesor de mecanica automotriz": 3776,
        "profesor de mecanografia": 3777,
        "profesor de medicina veterinaria": 3778,
        "profesor de musica": 3779,
        "profesor de navegacion aerea": 3780,
        "profesor de navegacion maritima": 3781,
        "profesor de obstetricia": 3782,
        "profesor de odontologia": 3783,
        "profesor de optometria": 3784,
        "profesor de orientacion": 3785,
        "profesor de patologia": 3786,
        "profesor de periodismo": 3787,
        "profesor de pintura y dibujo a particulares": 3788,
        "profesor de plomeria (fontaneria)": 3789,
        "profesor de programacion": 3790,
        "profesor de psicologia": 3791,
        "profesor de publicidad": 3792,
        "profesor de quimica": 3793,
        "profesor de radiologia": 3794,
        "profesor de refrigeracion": 3795,
        "profesor de relaciones internacionales": 3796,
        "profesor de relaciones publicas": 3797,
        "profesor de religion": 3798,
        "profesor de reparacion de computadoras": 3799,
        "profesor de salud publica": 3800,
        "profesor de secundaria": 3801,
        "profesor de sociologia": 3802,
        "profesor de soldadura y chapisteria": 3803,
        "profesor de tecnologia": 3804,
        "profesor de teologia": 3805,
        "profesor de trabajo social": 3806,
        "profesor de turismo": 3807,
        "profesor de universidad": 3808,
        "profesor de urbanismo, diseño industrial y grafico": 3809,
        "profesor de zoologia": 3810,
        programador: 3811,
        "programador (a)": 4085,
        "programador web": 4160,
        "project planning & control specialist": 3866,
        promotor: 3812,
        "promotor artistico": 3946,
        "promotor comunal": 3454,
        "promotor comunitario": 3455,
        "promotor de ventas": 3456,
        propietaria: 1022,
        psicologia: 3381,
        psicologo: 3270,
        "psicologo (a)": 4086,
        "psicologo i": 3457,
        psicopedagogo: 3813,
        "psicopedagogo (a)": 4087,
        "psicopedagogo escolar": 4161,
        psicoterapeuta: 3814,
        psiquiatra: 3238,
        publicista: 1020,
        "publicitaria o de mercadeo": 4088,
        pulidor: 3815,
        "que haceres del hogar": 3950,
        quesero: 3816,
        quimica: 3271,
        quimico: 3046,
        quiropractico: 4089,
        "quiropractico especializado": 4162,
        rabino: 3324,
        radiologo: 4090,
        recaudador: 4346,
        recepcion: 3458,
        recepcionista: 3272,
        reciclaje: 4091,
        "recolector de basura": 3817,
        recreador: 3273,
        "rector de universidad": 3818,
        "rector vicerector decano": 3274,
        "redactor de prensa": 3819,
        "redactor(a) de contenido": 4163,
        reforzador: 3459,
        regidor: 3951,
        "relaciones industriales": 3275,
        "relaciones publicas": 4164,
        "relacionista publico": 3820,
        relojero: 3276,
        remesas: 3955,
        "reparacion de equipos varios": 3956,
        "reparador de electrodomesticos": 4165,
        repartidor: 4092,
        "reportero marino": 3382,
        "reportero, corresponsal": 3821,
        repostera: 3952,
        "representante de corregimiento o consejal": 3822,
        "representante de ventas": 3823,
        "representante juridico": 3331,
        "representante legal": 28,
        "representante legal y beneficiario": 3056,
        repujador: 3824,
        "responsable de calidad": 4166,
        "responsable del hogar": 4093,
        "restaurador de objetos de arte y pintura": 3825,
        restaurante: 3957,
        retirado: 3953,
        rotulador: 4347,
        "rotulista de carteles, anuncios y letreros": 3826,
        rrhh: 1039,
        sacerdote: 4094,
        "sacerdote (budista, cura, parroco, capellan)": 3827,
        "sacerdote religioso monja pastor": 3277,
        salonero: 3313,
        "salonero de bar": 3828,
        "salvavidas rescatista": 3278,
        sastre: 3279,
        secretaria: 3280,
        "secretaria bilingue": 3829,
        "secretaria ejecutiva": 3830,
        "secretaria i": 3460,
        "secretaria legal": 3461,
        "secretaria recepcionista": 3831,
        secretario: 10,
        "secretario general": 3832,
        "secretario i": 3462,
        "secretario judicial": 3833,
        seguridad: 3463,
        senador: 3959,
        sereno: 3961,
        serigrafista: 3834,
        "servicios profesionales": 3464,
        "sexologo (a)": 4095,
        "sin actividad registrada": 3960,
        sindicalista: 3281,
        sismologo: 3835,
        socio: 3341,
        sociologo: 3836,
        soldador: 3282,
        sommelier: 4167,
        "soporte de redes": 4348,
        "soporte tecnico": 3837,
        "sub gerente": 37,
        "sub jefa del dep. de acciones a nivel nacional": 3465,
        "subastador tasador": 3284,
        "superintendente de buques": 3383,
        supervisor: 1010,
        "supervisor coordinador": 3284,
        "supervisor de turnos": 3466,
        "supervisora comercial": 3467,
        suplidor: 4349,
        "surtidor ayudante": 3468,
        "tabaquero cigarrero": 3285,
        talador: 3838,
        tallador: 3286,
        "tallador de madera": 3839,
        taller: 3966,
        tapicero: 3287,
        "tapicero de muebles": 3840,
        "taquigrafo mecanografo": 3288,
        tatuador: 3965,
        taxista: 3963,
        "tec. en rep. de equipo de comunicaciones": 3469,
        tecnica: 1009,
        tecnico: 3470,
        "tecnico aeronautico": 3841,
        "tecnico agronomo": 3842,
        "tecnico agropecuario": 3843,
        "tecnico aviacion": 3962,
        "tecnico biomedico": 4350,
        "tecnico de equipos electricos electronicos computacion mecanico": 3289,
        "tecnico de galerias de arte": 3844,
        "tecnico de las ciencias medicas": 3290,
        "tecnico de minas": 3291,
        "tecnico de rayos x": 3845,
        "tecnico de refrigeracion": 3471,
        "tecnico de seguridad de trafico aereo": 3846,
        "tecnico electronico en biomedica": 3847,
        "tecnico en agrimensura": 3848,
        "tecnico en ciencias biologicas y agronomicas": 3293,
        "tecnico en ciencias fisicas y quimicas": 3294,
        "tecnico en electricidad": 4168,
        "tecnico en electronica": 4169,
        "tecnico en farmacia": 3976,
        "tecnico en hojalateria": 4351,
        "tecnico en limpieza": 4352,
        "tecnico en procesos": 3472,
        "tecnico en radiologia": 4353,
        "tecnico en seguridad industrial": 4170,
        "tecnico en sistemas computacionales": 4171,
        "tecnico en telecomunicaciones": 4173,
        "tecnico mecanico metalurgico": 3295,
        "tecnico zootecnia": 1037,
        "tenologo medico": 3047,
        telefonista: 3296,
        telegrafista: 3297,
        teologo: 3849,
        terapeuta: 4096,
        tesorero: 20,
        "tesorero municipal": 3850,
        tienda: 3968,
        tintorero: 3298,
        tipografo: 3851,
        topografo: 3852,
        topologo: 3354,
        tornero: 3853,
        toxicologo: 3854,
        "trabajador agropecuario": 3855,
        "trabajador de empresas financieras": 3355,
        "trabajador independiente": 3486,
        "trabajador manual": 3473,
        "trabajador sexual": 3301,
        "trabajador social": 3856,
        "trabajador(a) social": 3318,
        "trabajadora manual i": 3474,
        "trading de monedas virtuales y derivados": 3325,
        traductor: 4174,
        "tramitador de documentos": 3857,
        "transporte y acarreo": 3869,
        transportista: 3060,
        traumatologo: 4097,
        "tripulante de cabina para pasajeros": 3858,
        troquelador: 3964,
        turismo: 3303,
        tutor: 3967,
        "tutor de ensenanza": 3859,
        urologo: 3860,
        "ux/ui designer": 4175,
        vaquero: 3861,
        vendedor: 1038,
        "vendedor - dependiente de articulos": 3862,
        "vendedor - dependiente en almacen por departamento": 3863,
        "vendedor a domicilio": 3864,
        "vendedor ambulante": 3865,
        "vendedor callejero": 3494,
        "vendedor de artesanias": 3493,
        "vendedor de autos": 3356,
        "vendedor de bienes raices": 3492,
        "vendedor por telefono": 3491,
        "vendedor promotor": 3304,
        vendedora: 3475,
        ventorrillo: 3971,
        veterinario: 3237,
        "veterinario (a)": 4098,
        "veterinario especializado en fauna silvestre": 4176,
        vicealcaldeza: 3970,
        vicepresidente: 3055,
        "vicepresidente de credito": 1015,
        "vicepresidente ejecutivo": 1034,
        vigilante: 3476,
        "vip ejecutivo": 3043,
        "visitador medico": 3490,
        "voluntario social": 4177,
        "vp operaciones": 1025,
        "vp pmc": 25,
        webmaster: 4178,
        "workforce analyst": 3477,
        youtuber: 3899,
        zapatero: 3307,
        zoologo: 3489,
        "zoologo marino": 4179,
        zootecnia: 3385,
        zootecnico: 3488,
        zootecnista: 3308,
      };

      const mapaPaises = {
        AFGANISTÁN: 1,
        ALBANIA: 2,
        ALEMANIA: 3,
        ANDORRA: 4,
        ANGOLA: 5,
        ANGUILA: 6,
        ANTÁRTIDA: 7,
        "ANTIGUA Y BARBUDA": 8,
        "ANTILLAS HOLANDESAS": 9,
        "ARABIA SAUDÍ": 10,
        ARGELIA: 11,
        ARGENTINA: 12,
        ARMENIA: 13,
        ARUBA: 14,
        "ARY MACEDONIA": 15,
        AUSTRALIA: 16,
        AUSTRIA: 17,
        AZERBAIYÁN: 18,
        BAHAMAS: 19,
        BAHRÉIN: 20,
        BANGLADESH: 21,
        BARBADOS: 22,
        BÉLGICA: 23,
        BELICE: 24,
        BENIN: 25,
        BERMUDAS: 26,
        BHUTÁN: 27,
        BIELORRUSIA: 28,
        BOLIVIA: 29,
        "BOSNIA Y HERZEGOVINA": 30,
        BOTSUANA: 31,
        BRASIL: 32,
        BRUNÉI: 33,
        BULGARIA: 34,
        "BURKINA FASO": 35,
        BURUNDI: 36,
        "CABO VERDE": 37,
        CAMBOYA: 38,
        CAMERÚN: 39,
        CANADÁ: 40,
        CHAD: 41,
        CHILE: 42,
        CHINA: 43,
        CHIPRE: 44,
        "CIUDAD DEL VATICANO": 45,
        COLOMBIA: 46,
        COMORAS: 47,
        CONGO: 48,
        "COREA DEL NORTE": 49,
        "COREA DEL SUR": 50,
        "COSTA DE MARFIL": 51,
        "COSTA RICA": 52,
        CROACIA: 53,
        CUBA: 54,
        CURAZAO: 55,
        DINAMARCA: 56,
        DOMINICA: 57,
        ECUADOR: 58,
        EGIPTO: 59,
        "EL SALVADOR": 60,
        "EMIRATOS ÁRABES UNIDOS": 61,
        ERITREA: 62,
        ESLOVAQUIA: 63,
        ESLOVENIA: 64,
        ESPAÑA: 65,
        "ESTADOS UNIDOS DE AMERICA": 66,
        ESTONIA: 67,
        ETIOPÍA: 68,
        FIYI: 69,
        FILIPINAS: 70,
        FINLANDIA: 71,
        FRANCIA: 72,
        GABÓN: 73,
        GAMBIA: 74,
        GEORGIA: 75,
        GHANA: 76,
        GIBRALTAR: 77,
        GRANADA: 78,
        GRECIA: 79,
        GROENLANDIA: 80,
        GUADALUPE: 81,
        GUAM: 82,
        GUATEMALA: 83,
        "GUAYANA FRANCESA": 84,
        GUERNSEY: 85,
        GUINEA: 86,
        "GUINEA ECUATORIAL": 87,
        "GUINEA-BISSAU": 88,
        GUYANA: 89,
        HAITÍ: 90,
        HOLANDA: 91,
        HONDURAS: 92,
        "HONG KONG": 93,
        HUNGRÍA: 94,
        INDIA: 95,
        INDONESIA: 96,
        IRÁN: 97,
        IRAQ: 98,
        IRLANDA: 99,
        "ISLA BOUVET": 100,
        "ISLA DE NAVIDAD": 101,
        "ISLA MAN": 102,
        "ISLA NORFOLK": 103,
        ISLANDIA: 104,
        "ISLAS CAIMÁN": 105,
        "ISLAS COCOS": 106,
        "ISLAS COOK": 107,
        "ISLAS FEROE": 108,
        "ISLAS GEORGIAS DEL SUR Y SANDWICH DEL SUR": 109,
        "ISLAS GLAND": 110,
        "ISLAS HEARD Y MCDONALD": 111,
        "ISLAS MALVINAS": 112,
        "ISLAS MARIANAS DEL NORTE": 113,
        "ISLAS MARSHALL": 114,
        "ISLAS PITCAIRN": 115,
        "ISLAS SALOMÓN": 116,
        "ISLAS TURCAS Y CAICOS": 117,
        "ISLAS ULTRAMARINAS DE ESTADOS UNIDOS": 118,
        "ISLAS VÍRGENES BRITÁNICAS": 119,
        "ISLAS VÍRGENES DE LOS ESTADOS UNIDOS": 120,
        ISRAEL: 121,
        ITALIA: 122,
        JAMAICA: 123,
        JAPÓN: 124,
        JERSEY: 125,
        JORDANIA: 126,
        KAZAJISTÁN: 127,
        KENIA: 128,
        KIRGUISTÁN: 129,
        KIRIBATI: 130,
        KUWAIT: 131,
        LAOS: 132,
        LETONIA: 135,
        LESOTHO: 134,
        LÍBANO: 136,
        LIBERIA: 137,
        LIBIA: 138,
        LIECHTENSTEIN: 139,
        LITUANIA: 140,
        LUXEMBURGO: 141,
        MACAO: 142,
        MACEDONIA: 144,
        MADAGASCAR: 145,
        MALASIA: 146,
        MALAWI: 147,
        MALDIVAS: 148,
        MALÍ: 149,
        MALTA: 150,
        MARRUECOS: 151,
        MARTINICA: 152,
        MAURICIO: 153,
        MAURITANIA: 154,
        MAYOTTE: 155,
        MÉXICO: 156,
        MICRONESIA: 157,
        MOLDAVIA: 158,
        MÓNACO: 159,
        MONGOLIA: 160,
        MONTSERRAT: 161,
        MOZAMBIQUE: 162,
        MYANMAR: 163,
        NAMIBIA: 164,
        NAURU: 165,
        NEPAL: 166,
        NICARAGUA: 167,
        NÍGER: 168,
        NIGERIA: 169,
        NIUE: 170,
        NORUEGA: 171,
        "NUEVA CALEDONIA": 172,
        "NUEVA ZELANDA": 173,
        OMÁN: 174,
        "PAÍSES BAJOS": 175,
        PAKISTÁN: 176,
        PALAU: 177,
        PALESTINA: 178,
        PANAMÁ: 179,
        "PAPÚA NUEVA GUINEA": 180,
        PARAGUAY: 181,
        PERÚ: 182,
        "POLINESIA FRANCESA": 183,
        POLONIA: 184,
        PORTUGAL: 185,
        "PUERTO RICO": 186,
        QATAR: 187,
        "REINO UNIDO": 188,
        "REPÚBLICA CENTROAFRICANA": 189,
        "REPÚBLICA CHECA": 190,
        "REPÚBLICA DEMOCRÁTICA DEL CONGO": 191,
        "REPÚBLICA DOMINICANA": 192,
        REUNIÓN: 193,
        RUANDA: 194,
        RUMANIA: 195,
        RUSIA: 196,
        "SAHARA OCCIDENTAL": 197,
        SAMOA: 198,
        "SAMOA AMERICANA": 199,
        "SAN CRISTÓBAL Y NEVIS": 200,
        "SAN MARINO": 201,
        "SAN MARTIN": 202,
        "SAN PEDRO Y MIQUELÓN": 203,
        "SAN VICENTE Y LAS GRANADINAS": 204,
        "SANTA HELENA": 205,
        "SANTA LUCÍA": 206,
        "SANTO TOMÉ Y PRÍNCIPE": 207,
        SENEGAL: 208,
        "SERBIA Y MONTENEGRO": 209,
        SEYCHELLES: 210,
        "SIERRA LEONA": 211,
        SINGAPUR: 212,
        SIRIA: 213,
        SOMALIA: 214,
        "SRI LANKA": 215,
        SUAZILANDIA: 216,
        SUDÁFRICA: 217,
        SUDÁN: 218,
        SUECIA: 219,
        SUIZA: 220,
        SURINAM: 221,
        "SVALBARD Y JAN MAYEN": 222,
        TAILANDIA: 223,
        TAIWÁN: 224,
        TANZANIA: 225,
        TAYIKISTÁN: 226,
        "TERRITORIO BRITÁNICO DEL OCÉANO ÍNDICO": 227,
        "TERRITORIOS AUSTRALES FRANCESES": 228,
        TIBET: 229,
        "TIMOR ORIENTAL": 230,
        TOGO: 231,
        TOKELAU: 232,
        TONGA: 233,
        "TRINIDAD Y TOBAGO": 234,
        TÚNEZ: 235,
        TURKMENISTÁN: 236,
        TURQUÍA: 237,
        TUVALU: 238,
        UCRANIA: 239,
        UGANDA: 240,
        URUGUAY: 241,
        UZBEKISTÁN: 242,
        VANUATU: 243,
        VENEZUELA: 244,
        VIETNAM: 245,
        "WALLIS Y FUTUNA": 246,
        YEMEN: 247,
        YIBUTI: 248,
        YUGOSLAVIA: 249,
        ZAMBIA: 250,
        ZIMBABUE: 251,
        "SUDÁN DEL SUR": 252,
      };

      const mapaEstados = {
        "DISTRITO CAPITAL": 1,
        AMAZONAS: 2,
        ANZOÁTEGUI: 3,
        APURE: 4,
        ARAGUA: 5,
        BARINAS: 6,
        BOLÍVAR: 7,
        CARABOBO: 8,
        COJEDES: 9,
        "DELTA AMACURO": 10,
        FALCÓN: 11,
        GUÁRICO: 12,
        LARA: 13,
        MÉRIDA: 14,
        MIRANDA: 15,
        MONAGAS: 16,
        "NUEVA ESPARTA": 17,
        PORTUGUESA: 18,
        SUCRE: 19,
        TÁCHIRA: 20,
        TRUJILLO: 21,
        YARACUY: 22,
        ZULIA: 23,
        VARGAS: 24,
        "DEPENDENCIAS FEDERALES": 25,
        "N/A": 26,
      };

      const quitarCualquierCodigoPais = (telefonoRaw) => {
        if (!telefonoRaw) return "";

        // 1. Limpiamos caracteres extraños dejando solo números (y el "+" por si acaso)
        const telfLimpio = telefonoRaw.trim().replace(/[^\d+]/g, "");

        // 2. Extraemos los códigos y los ordenamos de más largos a más cortos
        const listaCodigos = Object.values(codigosTodosLosPaises).sort(
          (a, b) => b.length - a.length,
        );

        // 3. Generamos el Regex dinámico. Ejemplo: /^\+?(1809|1242|593|58|34|1)\s*/
        const patronString = `^\\+?(${listaCodigos.join("|")})\\s*`;
        const regex = new RegExp(patronString);

        // 4. Ejecutamos el replace del código internacional
        return telfLimpio.replace(regex, "").replace(/\D/g, "");
      };

      const obtenerProfesionId = (valor) => {
        //console.log(valor);

        if (!valor) return null;

        // Pasamos a minúsculas y normalizamos quitando tildes/acentos de forma nativa
        const busqueda = valor
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remueve tildes electrónicamente

        // 1. Intenta buscar la coincidencia directa en el mapa ya limpio
        if (mapaProfesiones[busqueda] !== undefined) {
          return mapaProfesiones[busqueda];
        }

        // 2. Fallback de contingencia: Busca si alguna clave contiene o es contenida por la búsqueda
        const claveEncontrada = Object.keys(mapaProfesiones).find((clave) => {
          const claveLimpia = clave
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return (
            claveLimpia.includes(busqueda) || busqueda.includes(claveLimpia)
          );
        });

        return claveEncontrada ? mapaProfesiones[claveEncontrada] : null;
      };

      const obtenerEstadoCivilId = (valor) => {
        if (!valor) return null;
        return mapaEstadoCivil[valor.toLowerCase()] ?? null;
      };

      const obtenerCondicionViviendaId = (valor) => {
        if (!valor) return null;
        return mapaCondicionVivienda[valor.toLowerCase()] ?? null;
      };

      function obtenerPaisId(nombrePais) {
        if (!nombrePais) return null;

        const normalizar = (str) =>
          str
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const busqueda = normalizar(nombrePais);

        // Buscamos la llave original que coincida tras normalizar ambas
        const llaveEncontrada = Object.keys(mapaPaises).find(
          (key) => normalizar(key) === busqueda,
        );

        return llaveEncontrada ? mapaPaises[llaveEncontrada] : null;
      }

      function obtenerEstadoId(nombreEstado) {
        if (!nombreEstado) return null;

        const normalizar = (str) =>
          str
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const busqueda = normalizar(nombreEstado);

        // Buscamos la llave original que coincida tras normalizar ambas
        const llaveEncontrada = Object.keys(mapaEstados).find(
          (key) => normalizar(key) === busqueda,
        );

        return llaveEncontrada ? mapaEstados[llaveEncontrada] : null;
      }

      function obtenerFechaActualFormateada() {
        return new Date().toISOString();
      }

      const obtenerOrigenFondos = (row) => {
        const origenFondos = [];

        if (row.relacion_dependencia === "Si") {
          origenFondos.push({
            TipoOrigenDeFondos1: { id: 3, descricpcion: "Salario" },
            tipoOrigenDeFondos: 3,
          });
        }

        if (row.negocio_propio === "Si") {
          origenFondos.push({
            TipoOrigenDeFondos1: { id: 59, descricpcion: "Negocio Propio" },
            tipoOrigenDeFondos: 59,
          });
        }

        if (row.otras_fuente_ingresos === "Si") {
          origenFondos.push({
            TipoOrigenDeFondos1: { id: 61, descricpcion: "Otros Ingresos" },
            tipoOrigenDeFondos: 61,
          });
        }
        return origenFondos;
      };

      const obtenerRangoIngresos = (row) => {
        console.log(row.ingreso_mensual_dependencia);
        console.log(row.ingreso_mensual_negocio);
        console.log(row.ingreso_mensual_dependencia);

        return {
          id: 513,
          desde: 6001,
          hasta: 20001,
          empresa: 347,
          Empresa: null,
        };
      };

      //console.log(filas);

      // Comienzo a crear el json de la matriz para AgileCheck
      const matrizClientes = filas.map((row) => {
        return {
          numeroDeId: row.cedula ? row.cedula.substring(1) : "",
          numeroIdTributario: row.str_rif ? row.str_rif : null,
          PersonaNatural: [
            {
              apellidos: row.apellidos,
              nombres: row.nombres,
              fechaNacimiento: convertirFecha(row.nacimiento),
              genero:
                row.sexo === "Masculino"
                  ? 1
                  : row.sexo === "Femenino"
                    ? 2
                    : null,
              estadoCivil: obtenerEstadoCivilId(
                row.estado_civil
                  ? row.estado_civil.replace("/a", "").trim()
                  : "",
              ),
              paisEmpresa: obtenerPaisId(row.pais_empresa_dependencia),
              paisNacimiento: obtenerPaisId(row.pais),
              provinciaNacimiento: null,
              telefonoMovil: quitarCualquierCodigoPais(row.telefono),
              empresa: row.empresa_dependencia,
              direccionEmpresa: row.direccion_empresa_dependencia,
              numeroExternoEmpresa: null,
              numeroInternoEmpresa: null,
              PEP: null,
              corregimientoEmpresa: null,
              ciudadanoUSA: false,
              statusLaboral: row.relacion_dependencia === "Si" ? 4 : 1, // 4 = Empleado, 1 = Independiente
              educacion: null,
              // telefonoEmpresa: row.telefono_empresa_dependencia.replace(
              //   /^\+?58\s*/,
              //   "",
              // ),
              telefonoEmpresa: quitarCualquierCodigoPais(
                row.telefono_empresa_dependencia,
              ),
              CondicionVivienda: obtenerCondicionViviendaId(
                row.tipo_vivienda ? row.tipo_vivienda.trim() : "",
              ),
              CargaFamiliar: 0,
              ocupacionActual: obtenerProfesionId(
                row.profesion ? row.profesion.trim() : "",
              ),
              paisDondeOpera: obtenerPaisId(row.pais),
              Conyuge:
                row.apellidos_conyugue || row.nombres_conyugue
                  ? [
                      {
                        apellidos: row.apellidos_conyugue,
                        nombres: row.nombres_conyugue,
                      },
                    ]
                  : [],
            },
          ],
          ProcedenciaDelDinero: [
            {
              OrigenDeFondosCliente1: obtenerOrigenFondos(row),

              /* RangoIngresoMensualCliente: {
                id: 513,
                desde: 6001,
                hasta: 20001,
                empresa: 347,
                Empresa: null,
              }, */

              RangoIngresoMensualCliente: obtenerRangoIngresos(row),

              origenDeFondo: null,
              principaloSecundario: 0,
              nacionaloIntenacional: 0,
              observaciones: "sin observaciones",
              fijoVariable: 1,
              frecuenciaIngresos: 1,
              rangoIngresos: 513,
              SectorId: 1027,
              paisOrigen: 244,
              paisDestino: 244,
            },
          ],

          ProductoTomadoCliente: [
            {
              id: 0,
              cliente: 0,
              productoTomado: 2640,
              ProductoOfrecidoPorEmpresa: {
                id: 2640,
                empresa: 347,
                productoOfrecido: 2640,
                esProveedor: false,
                TipoProductoOfrecido: {
                  id: 0,
                  descripcion: "RENTA VARIABLE",
                },
              },
              ProductoTomadoClienteFisico: [
                {
                  id: 0,
                  tipoProductoTomadoCliente: 0,
                  numero: "1",
                  proposito: "INVERSION",
                  inicio: null,
                  fin: null,
                  status: null,
                  CuentaDeInversion: [],
                  PerfilTransaccionalPorProducto: [
                    {
                      FormaDeHacerTransaccionCliente: [
                        {
                          tipoFormaDePago: 3,
                        },
                        {
                          tipoFormaDePago: 13,
                        },
                      ],
                      cantidadDepositos: row.cantidad_operaciones,
                      montoDepositos: null,
                      montoRetiros: null,
                      cantidadRetiros: row.cantidad_operaciones,
                      montoInicio: row.monto_promedio_mensual,
                      frecuenciaDepositos: 1,
                      frecuenciaRetiros: 1,
                    },
                  ],
                },
              ],
            },
            {
              id: 0,
              cliente: 0,
              productoTomado: 2639,
              ProductoOfrecidoPorEmpresa: {
                id: 2639,
                empresa: 347,
                productoOfrecido: 2639,
                esProveedor: false,
                TipoProductoOfrecido: {
                  id: 0,
                  descripcion: "RENTA FIJA",
                },
              },
              ProductoTomadoClienteFisico: [
                {
                  id: 0,
                  tipoProductoTomadoCliente: 0,
                  numero: "2",
                  proposito: "INVERSION",
                  inicio: null,
                  fin: null,
                  status: null,
                  CuentaDeInversion: [],
                  PerfilTransaccionalPorProducto: [
                    {
                      FormaDeHacerTransaccionCliente: [
                        {
                          tipoFormaDePago: 3,
                        },
                        {
                          tipoFormaDePago: 13,
                        },
                      ],

                      cantidadDepositos: row.cantidad_operaciones,
                      montoDepositos: null,
                      montoRetiros: null,
                      cantidadRetiros: row.cantidad_operaciones,
                      montoInicio: row.monto_promedio_mensual,
                      frecuenciaDepositos: 1,
                      frecuenciaRetiros: 1,
                    },
                  ],
                },
              ],
            },
          ],

          DocumentoEntregadoCliente: [
            {
              documentoEntregado: 1,
            },
            {
              documentoEntregado: 25,
            },
            {
              documentoEntregado: 27,
            },
          ],

          ReferenciaCliente: [
            {
              nombre: row.nombres_referencia_personal,
              telefono: quitarCualquierCodigoPais(
                row.celular_referencia_personal,
              ),
              documento: false,
              tipo: 1,
            },
            {
              nombre: row.banco,
              relacion: "CLIENTE",
              documento: false,
              tipo: 2,
            },
          ],

          Corregimiento1: null,
          numeroExternoResidencia: null,
          numeroInternoResidencia: null,
          codigoPostal: row.codigo_postal,
          telefonoResidencia: null,
          email: row.correo,
          rangoRetiros: null,
          empresa: 347,
          riesgo: 0,
          riesgoNivel: null,
          status: 1,
          canalVinculacion: 23,
          DetalleCanalVinculacion: [
            {
              detalle: "navegando en la web",
            },
          ],
          excluirDeBusqueda: null,
          canalOperacionDistribucion: 15,
          CanalOperacionDistribucion1: {
            nombre: "oficina principal",
          },
          sucursal: 317,
          fechaVinculacionEmpresa: obtenerFechaActualFormateada(), //"2026-05-25T00:00:00",
          fechaCreacionEnEmpresa: obtenerFechaActualFormateada(), //"2026-05-13T00:00:00",
          statusFatca: null,
          numeroReporte: null,
          numeroReporteComercial: null,
          tipoDeId: 1,
          fechaExpDeId: null,
          ultimaVezCalculado: obtenerFechaActualFormateada(),
          visibleEnEstadisticas: true,
          esProveedor: false,
          verificadoEnListas: false,
          numero: row.cedula ? row.cedula.substring(1) : "",
          paisResidencia: obtenerPaisId(row.pais),
          idEstado: obtenerEstadoId(row.estado),
          corregimiento: null, //5023,
          direccionResidencia: row.direccion,
          paisResidenciaFiscal: obtenerPaisId(row.pais),
          fechaInicioRelaciones: null,
          fechaCreacion: obtenerFechaActualFormateada(),
          empleadoAsesor: null,
          empleadoAprobador: null,
          empresaDelgrupo: null,
          vencimientoIdFiscal: null,
          apnfd: null,
          TipoPersonaCliente: [
            {
              idTipoPersonaEmpresa: 56,
            },
          ],
        };
      });

      console.log(matrizClientes);

      const urlObtenerToken = import.meta.env.REACT_APP_URL_AGILECHECK_TOKEN;
      const urlPostCliente = import.meta.env
        .REACT_APP_URL_AGILECHECK_POST_CLIENTE;

      const params = new URLSearchParams();
      params.append(
        "username",
        import.meta.env.REACT_APP_URL_AGILECHECK_USERNAME,
      );
      params.append(
        "password",
        import.meta.env.REACT_APP_URL_AGILECHECK_PASSWORD,
      );
      params.append(
        "grant_type",
        import.meta.env.REACT_APP_URL_AGILECHECK_GRANT_TYPE,
      );

      const respuestaToken = await axios.post(urlObtenerToken, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = respuestaToken.data?.access_token;
      const totalClientes = matrizClientes.length;
      let contador = 0;
      let creados = 0;
      const idsParaActualizar = [];
      /*for (const clienteIndividual of matrizClientes) {
        try {
          const enviarCliente = await axios.post(
            urlPostCliente,
            clienteIndividual,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          idsParaActualizar.push(clienteIndividual.numeroDeId);
          creados++;
          setMatrizCreada(creados);
        } catch (apiError) {
          // Captura el objeto de respuesta estructurado enviado por AgileCheck
          const respuestaApi = apiError.response?.data;
          const mensajeError =
            respuestaApi?.Message || respuestaApi || apiError.message;

          console.warn(
            `Cédula ${clienteIndividual?.numeroDeId} saltada de la cola. Motivo:`,
            mensajeError,
          );
        } finally {
          contador++;
          setContando(contador);
        }
      }*/

      handleActualizarEstatusAgileCheck(idsParaActualizar);
    } catch (error) {
      const errorMsg = error.response ? error.response.data : error.message;
      console.error("Error en el proceso general:", errorMsg);
    }
  };

  const handleActualizarEstatusAgileCheck = async (cedulas) => {
    if (cedulas.length === 0) return;

    try {
      await axios.post(
        `${url}actualizarestatusagilecheck`,
        {
          usuario_creo_matriz_id: usuarioBoId,
          cedulas,
        },
        { headers },
      );
      setActualizando((prev) => !prev);

      if (modalData) handleCloseExpediente();
    } catch (error) {
      console.error(error);
    }
  };

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
        const creadoAgileCheck = params.row.bol_agilecheck;
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

            {creadoAgileCheck && (
              <Tooltip title="Cliente en AgileCheck">
                <VerifiedUserIcon
                  sx={{
                    color: "#2196f3 !important", // Un azul estándar de Material-UI
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
    { field: "edad", headerName: "Edad", width: 120 },
    { field: "nombres", headerName: "Nombres", width: 180 },
    { field: "apellidos", headerName: "Apellidos", width: 180 },
    { field: "tipo_producto", headerName: "Tipo Producto", width: 180 },
    {
      field: "usuario_activo_cumplimiento",
      headerName: "Actualizó carpeta",
      width: 180,
    },
    {
      field: "usuario_verificacion_cumplimiento",
      headerName: "Aprobó",
      width: 180,
    },
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
      "correo",
      /*"usuario_verificacion_cumplimiento_id",
      "usuario_preparado_cumplimiento_id",
      "usuario_revisado_cumplimiento_id",
      "usuario_asiste", */
    ].some((field) =>
      String(doc[field] ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}fichasFirmadas`, {
          headers,
          params: {
            page,
            limit: rowsPerPage,
            search: searchTerm,
            searchfecha,
            searchfecha2,
            adultoMenor: adultoMenorFilter,
            agileCheck: agileCheckFilter,
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
    refreshTrigger,
    searchfecha,
    searchfecha2,
    adultoMenorFilter,
    success,
    agileCheckFilter,
  ]);

  const exportToCVV = async () => {
    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? "¿Confirma que desea descargar el formato de todas las fichas para hacer la carga masiva en la CVV?"
        : "¿Confirma que desea descargar el formato de las fichas seleccionadas para hacer la carga masiva en la CVV?",
    );

    let response = [];

    try {
      let todosLosDatos = [];

      if (respuestaUsuario) {
        if (clientesSeleccionados.length === 0) {
          response = await axios.get(`${url}fichasParaLaCVV`, {
            headers,
            params: {
              page,
              limit: rowsPerPage,
              search: searchTerm,
              searchfecha,
              searchfecha2,
              adultoMenor: adultoMenorFilter,
              agileCheck: agileCheckFilter,
            },
          });
          todosLosDatos = response.data.rows;
        } else {
          const idsClientes = clientesSeleccionados.map(
            (cliente) => cliente.id,
          );

          // Llamada al endpoint pasando los IDs seleccionados
          response = await axios.get(`${url}fichasParaLaCVV`, {
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
        `FormatoCargaMasivaParaLaCVV_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

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
            Fichas Firmadas
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
        {/* Contenedor de filtros: ahora en fila siempre */}
        <div className="flex flex-row items-end gap-4">
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 ml-1">
              Matrices de AgileCheck
            </label>
            <TextField
              select
              size="small"
              value={agileCheckFilter}
              onChange={(e) => {
                setAgileCheckFilter(e.target.value);
                setPage(0);
              }}
              sx={{ width: 160 }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="con-matriz">Con matriz</MenuItem>
              <MenuItem value="sin-matriz">Sin matriz</MenuItem>
            </TextField>
          </div>

          <Tooltip title="Fecha que el cliente inició la ficha">
            {/* Sección de Fecha de creación */}
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
            {/* Sección de Fecha de actualización */}
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

        {/* Botones de exportación */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Acciones masivas como actualizar carpeta, descargar cédulas o crear cliente en AgileCheck">
            <Button
              id="demo-customized-button"
              aria-controls={open4 ? "demo-customized-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open4 ? "true" : undefined}
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
                          textTransform: "uppercase", // Convierte todo el texto a mayúsculas
                          // Usamos alpha para que el color sea sutil y funcione en modo oscuro
                          backgroundColor: row.bol_confirmado_pep
                            ? (theme) => alpha(theme.palette.error.main, 0.15)
                            : "inherit",
                          // Opcional: un borde izquierdo para resaltar más la fila PEP
                          borderLeft:
                            row.bol_confirmado_pep &&
                            col.field === columns[0].field
                              ? "4px solid #eab308"
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
            handleOpenModalCargarArchivoFirmadas();
            handleCloseAcciones();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <CloudSyncIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Actualizar Carpeta</span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenModalCargarListaCedulasFirmadas();
            handleCloseAcciones();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <CloudDownloadIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Descargar Cédulas</span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenModalMatrizRiesgo();
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
          <span>Crear en AgileCheck</span>
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
            exportToCVV();
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
          <span>Formato para la CVV</span>
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
            handleOpenModalObservaciones(selectedRow?.str_observaciones);
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

        {opcionAsistir && (
          <MenuItem
            onClick={() => {
              handleAsistirFicha(selectedRow?.usuario_id, selectedRow);
              handleClose();
            }}
          >
            <SupportAgentIcon /> Asistir ficha
          </MenuItem>
        )}

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
      </StyledMenu>

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

      {/* MODAL EXPEDIENTE MAESTRO ACTUALIZADO */}
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
            <Box display="flex" gap={1} alignItems="center">
              <IconButton onClick={handleCloseExpediente}>
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

      {/* Modal Asistir */}
      <Modal open={openAsistir} onClose={handleCloseAsistir}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            width: "95%",
            maxWidth: "1200px",
            height: "90vh",
            overflow: "auto",
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
                ? modalData2.nombres
                  ? `${modalData2.nombres} ${modalData2.apellidos} (${modalData2.cedula})`
                  : modalData2.correo
                : "Cargando..."}
            </Typography>
            <IconButton onClick={handleCloseAsistir}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedFichaId && (
            <CrearFicha
              idRegistro={selectedFichaId}
              onClose={handleCloseAsistir}
            />
          )}
        </Box>
      </Modal>

      {/* Observaciones*/}
      <Fragment>
        <Dialog open={openObservaciones} onClose={handleCloseObservaciones}>
          <DialogTitle>Ficha {idFichaObservaciones}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ingrese las observaciones para devolverla.
            </DialogContentText>
            <form onSubmit={handleSubmitObservaciones} id="subscription-form">
              <TextField
                autoFocus
                required
                margin="dense"
                id="observaciones"
                name="observaciones"
                label="Observaciones"
                type="text"
                fullWidth
                variant="standard"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseObservaciones}>Cancelar</Button>
            <Button type="submit" form="subscription-form">
              Guardar
            </Button>
          </DialogActions>
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
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Bitácora de Observaciones
          </Typography>
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

      {/* Modal de Cargar Firmadas*/}
      <Modal
        open={openModalCargarArchivoFirmadas}
        onClose={handleCloseModalCargarArchivoFirmadas}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...styleModalBase, width: 500 }}>
          {" "}
          {/* Asegúrate de que tenga un ancho definido */}
          <Typography
            id="modal-modal-title"
            variant="h7"
            component="h3"
            sx={{
              mb: 2,
              textAlign: "center", // <--- Esto centra el texto
              fontWeight: "bold", // Opcional: le da un aspecto más de título
            }}
          >
            Por favor, adjunte el archivo con las cédulas de los clientes que
            han firmado sus fichas
          </Typography>
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
            <div className="flex flex-col gap-3">
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Adjuntar archivo .xlsx
                <VisuallyHiddenInput
                  required
                  id="archivo"
                  name="archivo"
                  type="file"
                  // 1. Cambiamos los tipos permitidos a extensiones de Excel
                  accept=".xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // 2. Actualizamos los MIME types permitidos para Excel
                    const tiposPermitidos = [
                      "application/vnd.ms-excel",
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ];

                    if (!tiposPermitidos.includes(file.type)) {
                      // 3. Corregimos el mensaje de error
                      alert(
                        "Tipo de archivo no permitido. Solo se aceptan archivos de Excel (.xls, .xlsx).",
                      );
                      e.target.value = "";
                      return;
                    }

                    setNombreArchivo(file.name);
                    setArchivo(file);
                    setMensajeError("");
                  }}
                  multiple
                />
              </Button>

              {nombreArchivo && (
                <Chip
                  label={nombreArchivo}
                  onDelete={() => {
                    setNombreArchivo("");
                    setArchivo("");
                    setMensajeError("");
                  }}
                  style={{ marginTop: "10px" }}
                />
              )}

              {mensajeError !== "" && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: 1,
                    textAlign: "center", // <--- Esto centra el texto horizontalmente
                    display: "flex", // Opcional: Para centrar verticalmente si el Box crece
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">{mensajeError}</Typography>
                </Box>
              )}

              <Button
                variant="contained"
                color="secondary"
                onClick={handleCargarFichasFirmadas}
                //disabled={cargando}
                disabled={cargando || !archivo}
              >
                {cargando ? (
                  "Procesando..."
                ) : (
                  <div className="flex gap-1 items-center justify-center">
                    <SettingsSuggestIcon /> Procesar Archivo
                  </div>
                )}
              </Button>

              {/* Botón de descarga condicional */}
              {/* {procesoTerminado && cedulasFallidas.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={descargarCsvFallidas}
                  sx={{ mt: 2 }}
                >
                  Archivo con {cedulasFallidas.length} cédula(s) de cliente(s)
                  que no han firmado.
                </Button>
              )} */}
            </div>
          </Typography>
        </Box>
      </Modal>

      {/* Modal de Cargar Lista cedulas Firmadas*/}
      <Modal
        open={openModalCargarArchivoListasFirmadas}
        onClose={handleCloseModalCargarArchivoListasFirmadas}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...styleModalBase, width: 500 }}>
          <Typography
            id="modal-modal-title"
            variant="h7"
            component="h3"
            sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
          >
            Por favor, adjunte el archivo con los números de las cédulas para
            descargar las imágenes correspondientes.
          </Typography>

          <div className="flex flex-col gap-3">
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={cargando}
            >
              Adjuntar archivo .xlsx
              <VisuallyHiddenInput
                id="archivo"
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setNombreArchivo(file.name);
                  setArchivo(file);
                  setMensajeError("");
                }}
              />
            </Button>

            {nombreArchivo && (
              <Chip
                label={nombreArchivo}
                onDelete={
                  !cargando
                    ? () => {
                        setNombreArchivo("");
                        setArchivo(null);
                      }
                    : null
                }
                sx={{ mt: 1 }}
              />
            )}

            {/* BOTÓN PRINCIPAL DE PROCESO */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCargarListasCedulasFirmadas}
              disabled={cargando || !archivo}
              sx={{ mt: 1 }}
            >
              {cargando ? (
                "Procesando..."
              ) : (
                <>
                  <SettingsSuggestIcon sx={{ mr: 1 }} /> Procesar Archivo
                </>
              )}
            </Button>

            {/* RESULTADO: BOTÓN DE DESCARGA DEL ZIP */}
            {procesoTerminado && linkZip && (
              <Button
                variant="contained"
                color="success"
                href={linkZip}
                download
                startIcon={<CloudUploadIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  animate: "bounce 1s infinite",
                }}
              >
                ¡Descargar Archivo ZIP!
              </Button>
            )}

            {/* ALERTAS DE ERROR */}
            {mensajeError && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2">{mensajeError}</Typography>
              </Box>
            )}

            {/* SECCIÓN DE CÉDULAS FALLIDAS */}
            {procesoTerminado && cedulasFallidas.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #ffcdd2",
                  borderRadius: 1,
                  bgcolor: "#fff9f9",
                }}
              >
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ fontWeight: "bold", display: "block", mb: 1 }}
                >
                  ⚠️ {cedulasFallidas.length} cédulas no encontradas en el
                  sistema:
                </Typography>
                <div
                  style={{
                    maxHeight: "100px",
                    overflowY: "auto",
                    fontSize: "0.75rem",
                    color: "#555",
                  }}
                >
                  {cedulasFallidas.join(", ")}
                </div>
              </Box>
            )}
          </div>
        </Box>
      </Modal>

      {/* Modal de Matriz de Riesgo */}
      <Modal
        open={openModalMatrizRiesgo}
        onClose={handleCloseModalMatrizRiesgo}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...styleModalBase, width: 500, p: 4, borderRadius: 2 }}>
          {/* TÍTULO PRINCIPAL */}
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{
              mb: 1,
              textAlign: "center",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {clientesSeleccionados.length <= 1
              ? "Generación de Matriz de Riesgo"
              : "Generación de Matrices de Riesgo"}
          </Typography>

          {/* SUBTÍTULO / INSTRUCCIÓN */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Conectando con AgileCheck. Por favor, no cierre esta ventana
            mientras se procesa la información de los clientes seleccionados.
          </Typography>

          {/* SECCIÓN DE PROGRESO */}
          <Box sx={{ width: "100%", my: 3, px: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: "medium", color: "text.secondary" }}
              >
                {contando === clientesSeleccionados.length
                  ? "Proceso completado, clientes creados en AgileCheck:"
                  : contando === 0
                    ? "Iniciando proceso..."
                    : matrizCreada < contando
                      ? `Obteniendo información de clientes...`
                      : `Creando matriz de riesgo para cliente ${matrizCreada}...`}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "primary.main", ml: "auto" }}
              >
                {matrizCreada} / {clientesSeleccionados.length}
              </Typography>
            </Box>

            {/* Barra de progreso visual basada en tus variables */}
            <LinearProgress
              variant="determinate"
              value={
                clientesSeleccionados.length > 0
                  ? (contando / clientesSeleccionados.length) * 100
                  : 0
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* CONTENEDOR DE MENSAJES / ERRORES */}
          <Typography
            id="modal-modal-description"
            component="div"
            sx={{
              mt: 2,
              whiteSpace: "pre-line",
              maxHeight: "200px",
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "5px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "4px",
              },
            }}
          >
            <div className="flex flex-col gap-3">
              {mensajeError !== "" && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#fdeded", // Tono rojo sutil de Material UI para alertas
                    color: "#5f2120",
                    border: "1px solid #edf2f7",
                    borderRadius: 1.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, textAlign: "center" }}
                  >
                    {mensajeError}
                  </Typography>
                </Box>
              )}
            </div>
          </Typography>

          {/* BOTÓN DE CERRAR TEXTO */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseModalMatrizRiesgo}
              sx={{ textTransform: "none", borderRadius: 1.5 }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FichasFirmadas;
