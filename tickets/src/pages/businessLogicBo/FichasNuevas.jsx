import React, { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
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
  MenuItem,
  Badge, // Añadido para el Select
} from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { styled, alpha } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
// Iconos
import EmailIcon from "@mui/icons-material/Email";
import enviandoCorreo from "../../assets/LottieFiles/Sending animation.json";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { setSeccionesMasivo } from "../../store/plantillaSlice";
import Lottie from "lottie-react";
import Cargando from "../../assets/LottieFiles/loading.json";
import CrearFicha from "../businessLogic/CrearFicha";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import DownloadIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

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

const FichasNuevas = () => {
  const dispatch = useDispatch();
  const usuarioBoId = useSelector((state) => state.plantilla.usuarioBoId);
  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);
  const [anchorElAcciones, setAnchorElAcciones] = useState(null);
  const open4 = Boolean(anchorElAcciones);
  const [openModalRedactarCorreo, setOpenModalRedactarCorreo] = useState(false);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [observacionesModal, setObservacionesModal] = useState("");
  const userEmail = localStorage.getItem("bo_userEmail");

  const [opcionCrearCampana, setOpcionCrearCampana] = useState(false);

  useEffect(() => {
    const fetchOpcionesMenu = async () => {
      try {
        const response = await axios.get(`${url}opcionesMenu`, {
          headers,
          params: {
            usuarioBoId: usuarioBoId,
          },
        });

        const puedeCrearCampana = response.data.some(
          (opcion) => opcion.str_nombre === "Crear Campaña Correo",
        );

        setOpcionCrearCampana(puedeCrearCampana);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOpcionesMenu();
  }, []);

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };
  const handleClickAcciones = (event) => {
    setAnchorElAcciones(event.currentTarget);
  };

  const handleCloseAcciones = () => {
    setAnchorElAcciones(null);
  };

  const handleCloseModalRedactarCorreo = () =>
    setOpenModalRedactarCorreo(false);

  const scrollRefCedula = useRef(null);
  const scrollRefRif = useRef(null);

  // --- CONFIGURACIÓN API ---
  const url = import.meta.env.REACT_APP_URL_API_LOCAL;
  const urlVer = import.meta.env.REACT_APP_URL_API_LOCAL_VER;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };

  // --- ESTADOS ---
  const [documentos, setDocumentos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchfecha, setSearchFecha] = useState([null, null]);
  const [searchfecha2, setSearchFecha2] = useState([null, null]);
  const [selecion, setSelecion] = useState([]); // <--- NUEVO ESTADO
  const [searchSeccion, setSearchSeccion] = useState([]); // <--- NUEVO ESTADO
  const [adultoMenorFilter, setAdultoMenorFilter] = useState("");
  const [range, setRange] = useState([null, null]);
  const [range2, setRange2] = useState([null, null]);
  const [openAsistir, setOpenAsistir] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [openExpediente, setOpenExpediente] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalData2, setModalData2] = useState(null);
  const [rotation, setRotation] = useState({ cedula: 0, rif: 0 });
  const [zoom, setZoom] = useState({ cedula: 1, rif: 1 });
  const [inputValue, setInputValue] = useState("");
  const [editar, setEditar] = useState(false);
  const [correoObservaciones, setCorreoObservaciones] = useState("");
  const [asunto, setAsunto] = useState("");

  const [copiado, setCopiado] = useState(false);

  // Formateamos la lista a string con saltos de línea
  const textoCorreos = Array.isArray(destinatarios)
    ? destinatarios.join("\n")
    : destinatarios || "";

  const handleCopiar = (e) => {
    e.stopPropagation(); // Evita interferencias con el Tooltip u otros eventos
    if (textoCorreos) {
      navigator.clipboard.writeText(textoCorreos);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000); // Vuelve al icono original a los 2s
    }
  };

  // Pasamos JSX directamente en la propiedad `title`
  const tooltipContent = (
    <Box sx={{ p: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          pb: 0.5,
          mb: 0.5,
          fontWeight: "bold",
        }}
      >
        <span>Destinatarios</span>
        <IconButton
          size="small"
          onClick={handleCopiar}
          sx={{ color: "white", ml: 1, p: 0.25 }}
          title="Copiar correos"
        >
          {copiado ? (
            <CheckIcon fontSize="small" color="success" />
          ) : (
            <ContentCopyIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Box
        sx={{ whiteSpace: "pre-line", maxHeight: "180px", overflowY: "auto" }}
      >
        {textoCorreos}
      </Box>
    </Box>
  );

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}fichasnuevas`, {
          headers,
          params: {
            page,
            limit: rowsPerPage,
            search: searchTerm,
            searchfecha,
            searchfecha2,
            seccion: searchSeccion,
            adultoMenor: adultoMenorFilter,
          },
        });

        //console.log(response.data.rows);

        setDocumentos(response.data.rows || []);
        setTotalCount(response.data.totalCount || 0);
      } catch (error) {
        console.error("Error fetch:", error.message);
      } finally {
        setLoading(false);
      }
    };
    //const delayDebounceFn = setTimeout(fetchDocumentos, 500);
    //return () => clearTimeout(delayDebounceFn);

    fetchDocumentos();
  }, [
    page,
    rowsPerPage,
    searchTerm,
    refreshTrigger,
    url,
    searchfecha,
    searchfecha2,
    searchSeccion,
    selecion,
    adultoMenorFilter,
  ]);

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
    setOpenExpediente(true);
  };

  const exportToExcelTodo = async () => {
    try {
      const response = await axios.get(`${url}fichasnuevasExcel`, {
        headers,
        params: {
          page,
          limit: rowsPerPage,
          search: searchTerm,
          searchfecha,
          searchfecha2,
          seccion: searchSeccion,
          adultoMenor: adultoMenorFilter,
        },
      });
      const todosLosDatos = response.data.rows;
      if (!todosLosDatos || todosLosDatos.length === 0)
        return alert("No hay datos");
      const worksheet = XLSX.utils.json_to_sheet(todosLosDatos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");
      XLSX.writeFile(workbook, `FichasNuevas_${Date.now()}.xlsx`);
    } catch (error) {
      console.error("Error exportando todo:", error);
    }
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

  const columns = [
    // 1. Inyección condicional de la columna de selección
    ...(opcionCrearCampana
      ? [
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
                  checked={clientesSeleccionados.some(
                    (c) => c.id === params.row.id,
                  )}
                  onChange={(e) => handleClickChecked(e, params.row)}
                />
              </div>
            ),
            sortable: false,
            filterable: false,
          },
        ]
      : []), // Si es falso, esparce un array vacío (no agrega nada)

    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => {
        // Extraemos el ID directamente de la fila por seguridad
        const idValue = params.row.id;
        const vieneDeAkeela = params.row.bol_akeela;

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
          </div>
        );
      },
    },

    { field: "correo", headerName: "Correo" },
    { field: "cedula", headerName: "Cédula" },
    { field: "edad", headerName: "Edad" },
    { field: "nombres", headerName: "Nombres" },
    { field: "apellidos", headerName: "Apellidos" },
    { field: "tipo_producto", headerName: "Tipo Producto", width: 180 },
    { field: "secciones_pendientes", headerName: "Secciones Faltantes" },
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

  const handleClickOpenRedactarCorreo = async () => {
    let datos = [];

    if (clientesSeleccionados.length === 0) {
      const response = await axios.get(`${url}fichasnuevasExcel`, {
        headers,
        params: {
          page,
          limit: rowsPerPage,
          search: searchTerm,
          searchfecha,
          searchfecha2,
          seccion: searchSeccion,
          adultoMenor: adultoMenorFilter,
        },
      });

      datos = response.data.rows;
    } else {
      datos = clientesSeleccionados;
    }

    //console.log(datos);
    if (!datos || datos.length === 0) return alert("No hay datos");

    setDestinatarios(
      datos
        .map((doc) => doc.correo)
        .filter(Boolean)
        .join("\n"),
    );
    setClientes(datos);

    const respuestaUsuario = window.confirm(
      clientesSeleccionados.length === 0
        ? `¿Confirma que desea crear un correo masivo para los ${totalCount} clientes de Fichas Nuevas?`
        : `¿Confirma que desea crear un correo masivo solo para los ${clientesSeleccionados.length} clientes seleccionados`,
    );

    if (respuestaUsuario) {
      setOpenModalRedactarCorreo(true);
    } else {
      setClientesSeleccionados([]);
      setAsunto("");
      setObservacionesModal("");
    }
  };

  const handleCloseObservaciones = () => {
    setOpenModalRedactarCorreo(false);
  };

  const handleSubmitObservaciones = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const asunto = formJson.asunto;
    const observaciones = formJson.observaciones;
    let correos = clientes.map((doc) => doc.correo).filter(Boolean);

    let fichas_id = clientes.map((doc) => doc.id).filter(Boolean);

    //let correos = ["ezebarazarte@gmail.com", "neelbarazarte@gmail.com"];

    correos.push(userEmail); // Agregamos el correo del usuario al array de correos para verificar que hayan salidos los correos

    setLoading(true);

    try {
      const response = await axios.post(
        `${url}notificar-cliente-recordatorio`,
        {
          email: correos,
          mensaje: observaciones,
          asunto: asunto,
          usuarioBoId,
          fichas_id,
        },
        { headers },
      );

      if (response) {
        //console.log("Notificación enviada con éxito");
        setClientesSeleccionados([]); // Limpiamos la selección después de enviar
        setAsunto("");
        setObservacionesModal("");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error de red:", err);
    }
    // ---------------------------------------
    handleCloseObservaciones();
    //setRefreshTrigger((prev) => prev + 1);
    setLoading(false);
  };

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
            Fichas Nuevas
          </Box>
        </Badge>
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
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

          {/* Fecha Creación */}
          <Tooltip title="Fecha de inicio">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 ml-1">
                Creación
              </label>
              <div className="flex flex-row items-center gap-2">
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DateRangePicker
                    value={range}
                    format="DD/MM/YY"
                    onChange={(newValue) => {
                      setRange(newValue);
                      const start = newValue[0]?.format("YYYY-MM-DD") || null;
                      const end = newValue[1]?.format("YYYY-MM-DD") || null;
                      setSearchFecha(start && end ? `${start},${end}` : "");
                      setPage(0);
                    }}
                    slotProps={{
                      textField: { size: "small", sx: { width: "140px" } },
                    }}
                  />
                </LocalizationProvider>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setRange([null, null]);
                    setSearchFecha("");
                  }}
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    p: 0,
                    borderColor: "#ccc",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </div>
            </div>
          </Tooltip>

          {/* Fecha Actualización */}
          <Tooltip title="Última actualización">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 ml-1">
                Actualización
              </label>
              <div className="flex flex-row items-center gap-2">
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DateRangePicker
                    value={range2}
                    format="DD/MM/YY"
                    onChange={(newValue) => {
                      setRange2(newValue);
                      const start = newValue[0]?.format("YYYY-MM-DD") || null;
                      const end = newValue[1]?.format("YYYY-MM-DD") || null;
                      setSearchFecha2(start && end ? `${start},${end}` : "");
                      setPage(0);
                    }}
                    slotProps={{
                      textField: { size: "small", sx: { width: "140px" } },
                    }}
                  />
                </LocalizationProvider>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setRange2([null, null]);
                    setSearchFecha2("");
                  }}
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    p: 0,
                    borderColor: "#ccc",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </div>
            </div>
          </Tooltip>

          {/* NUEVO FILTRO: SECCIONES PENDIENTES (MULTI-SELECCIÓN) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 ml-1">
              <Tooltip title="Seleccion Multiple: Puedes filtrar seleccionando: 'Todas', 'Ninguna' o una o varias secciones pendientes a la vez.">
                <Badge
                  //badgeContent="¡Funcionalidad mejorada!"
                  color="warning"
                  max={9999999}
                  slotProps={{
                    badge: {
                      sx: {
                        // Ajusta estos valores para mover el número
                        right: -80,
                        top: 5,
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  Secciones Faltantes
                </Badge>
              </Tooltip>
            </label>
            <div className="flex flex-row items-center gap-2">
              <TextField
                select
                size="small"
                value={selecion} // Asegúrate que sea un array: []
                onChange={(e) => {
                  const value = e.target.value;
                  const isTodas = ["1,2,3,4,5,6,7,8,9,10"];
                  const isNinguna = [""];

                  if (value == "Todas") {
                    setSelecion(["Todas"]);
                    setSearchSeccion(isTodas);
                  }

                  if (value == "Ninguna") {
                    setSelecion(["Ninguna"]);
                    setSearchSeccion(isNinguna);
                  }

                  if (!(value == "Todas") && !(value == "Ninguna")) {
                    const sortedValue = [...value].sort((a, b) => a - b);
                    setSelecion(sortedValue);
                    setSearchSeccion(sortedValue);
                  }

                  setPage(0);
                }}
                sx={{ width: 140 }}
                SelectProps={{
                  multiple: true,
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (selected.length === 0) {
                      return "Seleccione";
                    }
                    return selected.join(", ");
                  },
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "Todas", "Ninguna"].map(
                  (num) => {
                    let label;

                    if (num === "Todas") {
                      label = "Todas";
                    } else if (num === "Ninguna") {
                      label = "Ninguna";
                    } else {
                      label = `Sección ${num}`;
                    }

                    return (
                      <MenuItem key={num} value={num.toString()}>
                        {label}
                      </MenuItem>
                    );
                  },
                )}
              </TextField>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => {
                  setSelecion([]);
                  setSearchSeccion([]);
                }} // Resetear a array vacío
                sx={{
                  height: "40px",
                  minWidth: "40px",
                  p: 0,
                  borderColor: "#ccc",
                }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </div>
          </div>
        </div>

        {opcionCrearCampana && (
          <>
            {/* Botones de exportación */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Enviar correo electrónico a clientes.">
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
            </Box>
          </>
        )}

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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Lottie animationData={Cargando} loop style={{ width: 350 }} />
        </Box>
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
                {documentos.map((row) => (
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
            rowsPerPageOptions={[50, 100]}
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
            handleClickOpenRedactarCorreo();
            handleCloseAcciones();
          }}
          sx={{
            color: "inherit",
          }}
        >
          <ForwardToInboxIcon
            sx={{
              color: "inherit",
              mr: 1,
            }}
          />
          <span>Redactar Correo</span>
        </MenuItem>
      </StyledMenu>

      {/* Menú y Modales se mantienen igual */}
      <StyledMenu anchorEl={anchorEl} open={open2} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleOpenExpediente(selectedRow);
            handleClose();
          }}
        >
          <DescriptionIcon /> Ver documentos
        </MenuItem>
        <MenuItem
          onClick={() => {
            const telefono = selectedRow?.telefono;
            if (telefono)
              window.open(
                `https://wa.me/${String(telefono).replace(/\D/g, "")}`,
                "_blank",
              );
            handleClose();
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: "#25D366" }} /> Contactar
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            handleAsistirFicha(selectedRow?.usuario_id, selectedRow);
            handleClose();
          }}
        >
          <SupportAgentIcon /> Asistir ficha
        </MenuItem>
      </StyledMenu>

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

      {/* Modal Expediente */}
      <Modal open={openExpediente} onClose={() => setOpenExpediente(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            height: "85vh",
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
            pb={1}
            sx={{ borderBottom: "1px solid #eee" }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {modalData?.correo}
            </Typography>
            <IconButton onClick={() => setOpenExpediente(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Apila los documentos uno debajo del otro
              flex: 1,
              gap: 2,
              height: "80vh", // Altura fija para que el scroll funcione
              overflowY: "auto", // Scroll principal de la columna
              paddingRight: 1,
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#ccc",
                borderRadius: 2,
              },
            }}
          >
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
              // Filtra: solo muestra si la ruta existe y no es una cadena vacía
              .filter((doc) => doc.ruta && doc.ruta.trim() !== "")
              .map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    flexShrink: 0, // Evita que los documentos se compriman
                    minHeight: "100%", // Cada documento ocupa el alto visible del scroll
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "visible", // Elimina scrolls internos
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
        </Box>
      </Modal>

      {/* Observaciones*/}
      <Modal
        open={openModalRedactarCorreo}
        onClose={handleCloseModalRedactarCorreo}
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
              // onClick={() => {
              //   handleEditarObservaciones();
              // }}
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
          ></Typography>
        </Box>
      </Modal>

      {/* Redactar correo*/}
      <Fragment>
        <Dialog
          open={openModalRedactarCorreo}
          onClose={handleCloseModalRedactarCorreo}
          fullWidth
          maxWidth="md"
          slotProps={{
            paper: {
              sx: {
                borderRadius: "16px",
                padding: "8px",
                backgroundImage: "none", // Limpieza para modo oscuro
                boxShadow: "0px 10px 40px rgba(0,0,0,0.12)", // Sombra suave moderna
                overflow: "hidden",
              },
            },
          }}
        >
          {/* Encabezado estilo ventana de correo */}
          <DialogTitle
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              bgcolor: "action.hover",
              py: 1.5,
              px: 3,
              display: "flex",
              alignItems: "center",
              justify: "space-between",
            }}
          >
            <EmailIcon />
            LegacyMail
          </DialogTitle>

          {loading && !editar ? (
            <div className="flex flex-col items-center p-6">
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
              <DialogContent sx={{ p: 0 }}>
                <form
                  onSubmit={handleSubmitObservaciones}
                  id="subscription-form"
                >
                  {/* Campo: DE */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 3,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      sx={{
                        width: 80,
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: "0.95rem",
                      }}
                    >
                      De:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      Mercosur Casa de Bolsa, S.A.
                    </Typography>
                  </Box>

                  {/* Campo: PARA */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 3,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      sx={{
                        width: 80,
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: "0.95rem",
                      }}
                    >
                      Para:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "primary.50",
                          color: "primary.main",
                          px: 1.5,
                          py: 0.3,
                          borderRadius: "16px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          border: "1px solid",
                          borderColor: "primary.light",
                        }}
                      >
                        <Tooltip
                          title={tooltipContent}
                          slotProps={{
                            tooltip: {
                              sx: {
                                maxHeight: "250px",
                                pointerEvents: "auto", // ¡Clave! Permite hacer clic en el contenido del tooltip
                              },
                            },
                          }}
                        >
                          <span>
                            {clientesSeleccionados.length > 0
                              ? clientesSeleccionados.length
                              : totalCount}{" "}
                            destinatario(s)
                          </span>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        (Se enviará una confirmación a tu cuenta {userEmail})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Campo: ASUNTO */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 3,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      sx={{
                        width: 80,
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: "0.95rem",
                      }}
                    >
                      Asunto:
                    </Typography>
                    <TextField
                      id="asunto"
                      name="asunto"
                      required
                      placeholder="Falta poco para completar tu KYC"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      variant="standard"
                      fullWidth
                      InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: "0.95rem", fontWeight: 500 },
                      }}
                    />
                  </Box>

                  {/* Cuerpo del correo / Mensaje */}
                  <Box sx={{ px: 3, pt: 2, pb: 2 }}>
                    <TextField
                      id="observaciones"
                      name="observaciones"
                      autoFocus
                      required
                      fullWidth
                      multiline
                      rows={10}
                      placeholder="Escriba aquí..."
                      value={observacionesModal}
                      onChange={(e) => setObservacionesModal(e.target.value)}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: "1.1rem",
                          lineHeight: 1.6,
                          padding: "16px",
                          borderRadius: "12px",
                          // Color de fondo adaptativo (sutil)
                          backgroundColor: "action.hover",
                          // Color de texto nativo del tema
                          color: "text.primary",
                        },
                      }}
                    />
                  </Box>
                </form>
              </DialogContent>

              {/* Acciones del correo */}
              <DialogActions
                sx={{
                  p: 2,
                  gap: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  onClick={() => {
                    setOpenModalRedactarCorreo(false);
                    setClientesSeleccionados([]);
                    setAsunto("");
                    setObservacionesModal("");
                  }}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    fontSize: "1rem",
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
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Enviar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Fragment>
    </Box>
  );
};

export default FichasNuevas;
