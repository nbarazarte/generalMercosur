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
  CircularProgress,
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
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import MessageIcon from "@mui/icons-material/Message";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import DescriptionIcon from "@mui/icons-material/Description";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FormatoFicha from "./FormatoFicha";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { setSeccionesMasivo } from "../../store/plantillaSlice";
import Lottie from "lottie-react";
import Cargando from "../../../../onboarding/src/assets/LottieFiles/loading.json";
import TuneIcon from "@mui/icons-material/Tune";
import FeedIcon from "@mui/icons-material/Feed";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import DownloadIcon from "@mui/icons-material/Download";
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

const FichasDevueltas = () => {
  const dispatch = useDispatch();

  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);

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
  const [openAsistir, setOpenAsistir] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adultoMenorFilter, setAdultoMenorFilter] = useState("");

  // ESTADOS PARA EL EXPEDIENTE, ZOOM Y ROTACIÓN
  const [modalData, setModalData] = useState(null);
  const [modalData2, setModalData2] = useState(null);
  const [rotation, setRotation] = useState({ cedula: 0, rif: 0 });
  const [zoom, setZoom] = useState({ cedula: 1, rif: 1 });
  const [inputValue, setInputValue] = useState("");
  const [openModalObservaciones, setOpenModalObservaciones] = useState(false);
  const handleOpenModalObservaciones = (valor, ficha_id) => {
    setOpenModalObservaciones(true);
    setObservacionesModal(valor || "");
    setSelectedFichaId(ficha_id);
  };
  const handleCloseModalObservaciones = () => setOpenModalObservaciones(false);
  const [observacionesModal, setObservacionesModal] = useState("");

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

    // En lugar de usar FormData que está dando undefined,
    // usa directamente el estado que ya tienes vinculado al TextField
    const observaciones = observacionesModal;
    const usuario = localStorage.getItem("bo_userName");

    if (!observaciones || observaciones.trim() === "") {
      console.error("Las observaciones están vacías");
      return;
    }
    //console.log(usuarioBoId);
    //console.log("Observaciones a enviar:", observaciones);
    //console.log(selectedFichaId);

    setLoading(true);

    try {
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
    } catch (err) {
      console.error("Error de red:", err);
    } finally {
      setLoading(false);
      handleCloseObservaciones();
    }
    setRefreshTrigger((prev) => prev + 1);
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

  const handlePorRevision = async (ficha_id) => {
    const respuestaUsuario = window.confirm(
      "¿Confirma que revisó esta ficha devuelta y desea enviarla a Fichas en Cumplimiento?",
    );

    if (respuestaUsuario) {
      try {
        await axios.post(
          `${url}fichas/enviaraporrevision`,
          {
            bol_verificacion_datos: false,
            usuario_preparado_cumplimiento_id: usuarioBoId,
            ficha_id,
          },
          { headers },
        );
        setActualizando((prev) => !prev);
        if (modalData) handleCloseExpediente();
      } catch (error) {
        console.error(error);
      }
    } else {
      return;
    }
  };

  const handleValidar = async (ficha_id) => {
    const respuestaUsuario = window.confirm(
      "¿Confirma que revisó esta ficha devuelta y desea enviarla a Fichas aprobadas?",
    );

    if (respuestaUsuario) {
      try {
        await axios.post(
          `${url}fichas/enviarafirma`,
          {
            bol_verificacion_agile_check: true,
            usuario_preparado_cumplimiento_id: usuarioBoId,
            ficha_id,
          },
          { headers },
        );
        setActualizando((prev) => !prev);
        if (modalData) handleCloseExpediente();
      } catch (error) {
        console.error(error);
      }
    } else {
      return;
    }
  };

  const handleRechazar = async (ficha_id) => {
    const respuestaUsuario = window.confirm(
      "¿Confirma que revisó esta ficha devuelta y desea enviarla a Fichas rechazadas?",
    );

    if (respuestaUsuario) {
      try {
        await axios.post(
          `${url}fichas/rechazar`,
          {
            bol_rechazada: true,
            usuario_preparado_cumplimiento_id: usuarioBoId,
            ficha_id,
          },
          { headers },
        );
        setActualizando((prev) => !prev);
        if (modalData) handleCloseExpediente();
      } catch (error) {
        console.error(error);
      }
    } else {
      return;
    }
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
    try {
      const response = await axios.get(`${url}fichasDevueltasExcel`, {
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
      const todosLosDatos = response.data.rows;
      if (!todosLosDatos?.length) return alert("No hay datos");
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
        `FichasDevueltas_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
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
    { field: "correo", headerName: "Correo", width: 80 },
    { field: "cedula", headerName: "Cédula", width: 120 },
    { field: "edad", headerName: "Edad", width: 80 },
    { field: "nombres", headerName: "Nombres", width: 180 },
    { field: "apellidos", headerName: "Apellidos", width: 180 },
    { field: "tipo_producto", headerName: "Tipo Producto", width: 180 },
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
      "cedula",
      "nombres",
      "apellidos",
      "tipo_producto",
      "telefono",
      "correo",
      "usuario_verificacion_cumplimiento_id",
      "usuario_preparado_cumplimiento_id",
      "usuario_revisado_cumplimiento_id",
      "usuario_asiste",
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
        const response = await axios.get(`${url}fichasDevueltas`, {
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

  const handleEditarObservaciones = () => {
    console.log(
      `Editando observaciones para el documento con ID: ${selectedFichaId}  `,
    );

    setOpenObservaciones(true);
    handleCloseModalObservaciones();
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
            Fichas Devueltas
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
          <Tooltip title="Exportar a Excel">
            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcelTodo}
              sx={{ whiteSpace: "nowrap" }}
            >
              Exportar a Excel
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
                        }}
                      >
                        {col.renderCell
                          ? col.renderCell({ row })
                          : row[col.field]}
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
            handlePorRevision(selectedRow?.id);
            handleClose();
          }}
        >
          <ContentPasteSearchIcon />
          Enviar a fichas en Cumplimiento
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            handleValidar(selectedRow?.id);
            handleClose();
          }}
        >
          <CheckIcon />
          Enviar a fichas aprobadas
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            handleRechazar(selectedRow?.id);
            handleClose();
          }}
        >
          <DeleteForeverIcon />
          Enviar a fichas rechazadas
        </MenuItem>
      </StyledMenu>

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
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleValidar(modalData.id)}
              >
                Enviar a Fichas Aprobadas
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                //onClick={() => handleDevolver(modalData.id)}
              >
                Enviar a Fichas Rechazadas
              </Button>
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

      {/* Observaciones*/}
      <Fragment>
        <Dialog
          open={openObservaciones}
          onClose={handleCloseObservaciones}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              padding: "12px",
              backgroundImage: "none", // Evita tonos extraños en modo oscuro
            },
          }}
        >
          <DialogTitle sx={{ fontSize: "1.8rem", fontWeight: 600 }}>
            Ficha {selectedFichaId}
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ mb: 3, fontSize: "1.1rem" }}>
              Escribe las razones para devolver esta ficha.
            </DialogContentText>

            <form onSubmit={handleSubmitObservaciones} id="subscription-form">
              <TextField
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

export default FichasDevueltas;
