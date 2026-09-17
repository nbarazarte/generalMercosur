import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { pdf, PDFViewer } from "@react-pdf/renderer";
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
  Badge,
} from "@mui/material";

import { styled, alpha } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import FormatoFicha from "./FormatoFicha";
// Iconos
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

const EstatusGeneral = () => {
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
  };

  const scrollRefCedula = useRef(null);
  const scrollRefRif = useRef(null);

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
  const opcionAsistir = useSelector((state) => state.plantilla.opcionAsistir);

  const url = import.meta.env.REACT_APP_URL_API_LOCAL;
  const urlVer = import.meta.env.REACT_APP_URL_API_LOCAL_VER;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };
  const [documentos, setDocumentos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [adultoMenorFilter, setAdultoMenorFilter] = useState("");
  const [searchfecha, setSearchFecha] = useState("");
  const [searchfecha2, setSearchFecha2] = useState("");
  const [range, setRange] = useState([null, null]);
  const [range2, setRange2] = useState([null, null]);
  const [openExpediente, setOpenExpediente] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [rotation, setRotation] = useState({ cedula: 0, rif: 0 });
  const [zoom, setZoom] = useState({ cedula: 1, rif: 1 });
  const [inputValue, setInputValue] = useState("");
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [modalData2, setModalData2] = useState(null);
  const [openAsistir, setOpenAsistir] = useState(false);

  const ESTADO_COLORS = {
    "Fichas Nuevas": "#06b6d4",
    "Fichas En Pausa": "#3fcc0b",
    "Fichas Por Revisión": "#f97316",
    "Fichas En Revisión": "#6366f1",
    "Fichas PEP": "#eab308",
    "Fichas Noticias Crimen": "#ef4444",
    "Fichas Aprobadas": "#10b981",
    "Fichas Activas": "#475569",
    "Fichas Firmadas": "#2563eb",
    "Fichas Devueltas": "#d946ef",
    "Fichas Rechazadas": "#475549",
  };

  useEffect(() => {
    // Definimos la función de carga
    const fetchDocumentos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}estatusGeneral`, {
          headers,
          params: {
            page,
            limit: rowsPerPage,
            search: searchTerm, // El valor del input con retraso
            estatus: statusFilter,
            searchfecha,
            searchfecha2,
            adultoMenor: adultoMenorFilter,
          },
        });

        // Ahora recibimos los datos limpios sin el full_count en cada fila
        setDocumentos(response.data.rows || []);
        setTotalCount(response.data.totalCount || 0);
      } catch (error) {
        console.error("Error fetch:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, [
    page,
    rowsPerPage,
    searchTerm, // Al cambiar esto, se reinicia el temporizador
    statusFilter,
    refreshTrigger,
    searchfecha,
    searchfecha2,
    url,
    adultoMenorFilter,
  ]);

  const handleOpenExpediente = (row) => {
    setModalData(row);
    setRotation({ cedula: 0, rif: 0 });
    setZoom({ cedula: 1, rif: 1 });
    setOpenExpediente(true);
  };

  const handleCloseExpediente = () => {
    setOpenExpediente(false);
    setModalData(null);
  };

  const exportToExcelTodo = async () => {
    try {
      const response = await axios.get(`${url}estatusGeneralExcel`, {
        headers,
        params: {
          page,
          limit: rowsPerPage,
          search: searchTerm,
          estatus: statusFilter,
          searchfecha,
          searchfecha2,
          adultoMenor: adultoMenorFilter,
        },
      });
      const todosLosDatos = response.data.rows;
      if (!todosLosDatos || todosLosDatos.length === 0)
        return alert("No hay datos");
      const worksheet = XLSX.utils.json_to_sheet(todosLosDatos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");
      XLSX.writeFile(workbook, `EstatusGeneral_${Date.now()}.xlsx`);
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

    const zoomPercent = zoom[key] * 100;

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
          overflow: "auto",
          bgcolor: "#f0f0f0",
          cursor: "grab",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#bcbcbc",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": { bgcolor: "#f1f1f1" },
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

            {/* NUEVO BOTÓN DE DESCARGA */}
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                descargarArchivo(
                  urlArchivo,
                  `${key}_${modalData?.cedula || "archivo"}`,
                )
              }
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            width: `${zoomPercent}%`,
            height: `${zoomPercent}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            minHeight: "100%",
            transition: "width 0.3s ease, height 0.3s ease",
            pointerEvents: "none",
          }}
        >
          <img
            src={urlArchivo}
            alt={key}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              transform: `rotate(${rotation[key]}deg)`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    );
  };
  const columns = [
    { field: "id", headerName: "ID" },
    { field: "estado_actual", headerName: "Estatus Actual" },
    { field: "correo", headerName: "Correo" },
    { field: "cedula", headerName: "Cédula" },
    { field: "edad", headerName: "Edad" },
    { field: "nombres", headerName: "Nombres" },
    { field: "apellidos", headerName: "Apellidos" },
    { field: "secciones_pendientes", headerName: "Secciones faltantes" },
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
  const styleModalExpediente = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    height: "85vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
    display: "flex",
    flexDirection: "column",
    borderRadius: 2,
    outline: "none",
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
            Estatus General
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
              Filtrar por Estatus
            </label>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ width: 270 }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Todos los estatus</MenuItem>
              {Object.keys(ESTADO_COLORS).map((estado) => (
                <MenuItem key={estado} value={estado}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: ESTADO_COLORS[estado],
                      }}
                    />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {{
                        "Fichas Por Revisión": "Fichas en Cumplimiento",
                        "Fichas En Revisión":
                          "Fichas LC/FT – Listas y Noticias",
                        "Fichas Noticias Crimen": "Fichas Notitia Criminis",
                      }[estado] || estado}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
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
              Fecha de creación
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
                        "& .MuiInputBase-input": { fontSize: "0.75rem" },
                        "& .MuiInputBase-root": { width: "140px" },
                      },
                    },
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
              Última actualización
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
                        "& .MuiInputBase-input": { fontSize: "0.75rem" },
                        "& .MuiInputBase-root": { width: "140px" },
                      },
                    },
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
                  padding: 0,
                  borderColor: "#ccc",
                }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </div>
          </div>
        </div>

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
                          textTransform: "uppercase", // Convierte todo el texto a mayúsculas
                          backgroundColor: alpha(
                            ESTADO_COLORS[row.estado_actual] || "#fff",
                            0.15,
                          ),
                          borderLeft:
                            col.field === columns[0].field
                              ? `4px solid ${ESTADO_COLORS[row.estado_actual]}`
                              : "none",
                          color: ESTADO_COLORS[row.estado_actual] || "inherit",
                        }}
                      >
                        {col.renderCell
                          ? col.renderCell({ row })
                          : {
                              "Fichas Por Revisión": "Fichas en Cumplimiento",
                              "Fichas En Revisión":
                                "Fichas LC/FT – Listas y Noticias",
                              "Fichas Noticias Crimen":
                                "Fichas Notitia Criminis",
                            }[row[col.field]] || row[col.field]}
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

      <StyledMenu anchorEl={anchorEl} open={open2} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleOpenExpediente(selectedRow);
            handleClose();
          }}
        >
          <DescriptionIcon />{" "}
          {selectedRow?.estado_actual === "Fichas Nuevas"
            ? "Ver documentos"
            : "Ver expediente"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const numeroLimpio = String(selectedRow?.telefono || "").replace(
              /\D/g,
              "",
            );
            if (numeroLimpio)
              window.open(`https://wa.me/${numeroLimpio}`, "_blank");
            else alert("Sin teléfono");
            handleClose();
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: "#25D366" }} /> Contactar
        </MenuItem>

        {selectedRow && (
          <MenuItem
            onClick={() => {
              handleAsistirFicha(selectedRow?.usuario_id, selectedRow);
              handleClose();
            }}
            /* Se deshabilita SOLO si el estado es 'Fichas Firmadas' Y el usuario NO tiene el permiso */
            disabled={
              selectedRow?.estado_actual === "Fichas Firmadas" && !opcionAsistir
            }
          >
            <SupportAgentIcon /> Asistir ficha
          </MenuItem>
        )}
      </StyledMenu>

      {modalData &&
        (modalData.estado_actual === "Fichas Nuevas" ? (
          <Modal open={openExpediente} onClose={handleCloseExpediente}>
            <Box sx={styleModalExpediente}>
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
                  {modalData.nombres || modalData.apellidos
                    ? `${modalData.nombres || ""} ${modalData.apellidos || ""} (${modalData.cedula || ""})`
                    : modalData.correo}
                </Typography>
                <IconButton onClick={handleCloseExpediente}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  gap: 2,
                  overflow: "hidden",
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "column",
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
                    CÉDULA CLIENTE
                  </Typography>
                  {renderVisualizador("cedula", modalData?.ruta_cedula)}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "column",
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
                    RIF CLIENTE
                  </Typography>
                  {renderVisualizador("rif", modalData?.ruta_rif)}
                </Box>
              </Box>
            </Box>
          </Modal>
        ) : (
          <Modal open={openExpediente} onClose={handleCloseExpediente}>
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
                  {modalData.nombres && modalData.apellidos && modalData.cedula
                    ? `${modalData.nombres} ${modalData.apellidos} (${modalData.cedula})`
                    : modalData.correo}
                </Typography>
                <IconButton onClick={handleCloseExpediente}>
                  <CloseIcon />
                </IconButton>
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
                    {
                      label: "RIF CLIENTE",
                      id: "rif",
                      ruta: modalData?.ruta_rif,
                    },
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
                            "& > *": {
                              flex: 1,
                              overflow: "visible !important",
                            },
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
        ))}

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
    </Box>
  );
};

export default EstatusGeneral;
