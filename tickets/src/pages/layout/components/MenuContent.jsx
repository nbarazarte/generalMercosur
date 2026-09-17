import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTour } from "@reactour/tour";

// MUI Components
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LensBlurIcon from "@mui/icons-material/LensBlur";
import SaveIcon from "@mui/icons-material/Save";
import FolderIcon from "@mui/icons-material/Folder";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import {
  setOpcionAsistir,
  setOpcionCrearCampana,
} from "../../../store/plantillaSlice";

export default function MenuContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsOpen } = useTour();

  const isBO = location.pathname.startsWith("/bo");

  // Estructura con colores definidos: Amarillo (#fbc02d), Púrpura (#9c27b0) y Rojo (#d32f2f)
  const url = import.meta.env.REACT_APP_URL_API_LOCAL;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };
  const usuarioBoId = useSelector((state) => state.plantilla.usuarioBoId);
  const [opcionesBd, setOpcionesBd] = useState([]);
  const [openModalCrearCliente, setOpenModalCrearCliente] = useState(false);
  const [openModalEliminarCliente, setOpenModalEliminarCliente] =
    useState(false);

  const [emailCliente, setEmailCliente] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  useEffect(() => {
    const fetchOpcionesMenu = async () => {
      try {
        const response = await axios.get(`${url}opcionesMenu`, {
          headers,
          params: {
            usuarioBoId: usuarioBoId,
          },
        });

        //console.log(response.data);

        setOpcionesBd(response.data);

        /* const puedeAsistir = response.data.some(
          (opcion) => opcion.str_nombre === "Asistir ficha",
        );

        const puedeCrearCampana = response.data.some(
          (opcion) => opcion.str_nombre === "Crear Campaña Correo",
        );

        //console.log(puedeCrearCampana);

        dispatch(setOpcionAsistir(puedeAsistir));
        dispatch(setOpcionCrearCampana(puedeCrearCampana)); */
      } catch (error) {
        console.error(error);
      }
    };

    fetchOpcionesMenu();
  }, []);

  const menuBO = [
    {
      id: "1",
      label: "Inicio",
      icon: HomeRoundedIcon,
      ruta: "/bo-inicio",
      color: "inherit",
    },

    {
      id: "2",
      label: "Estatus general",
      icon: FolderIcon,
      ruta: "/bo-estatus-general",
      color: "#fbc02d", // Amarillo
    },

    {
      id: "3",
      label: "Fichas nuevas",
      icon: FolderCopyIcon,
      ruta: "/bo-fichas-nuevas",
      color: "#fbc02d",

      children: [
        {
          id: "17",
          label: "Fichas en Pausa",
          icon: FolderIcon,
          ruta: "/bo-fichas-en-pausa",
          color: "#3fcc0b",
        },
      ],
    },
    {
      id: "4",
      label: "Fichas en Cumplimiento",
      icon: FolderIcon,
      ruta: "/bo-fichas-en-cumplimiento",
      color: "#fbc02d",
    },

    {
      id: "5",
      label: "Fichas LC/FT – Listas y Noticias",
      icon: FolderCopyIcon,
      ruta: "/bo-fichas-lcft-listas-y-noticias",
      color: "#fbc02d",
      children: [
        {
          id: "6",
          label: "Fichas de PEP",
          icon: FolderIcon,
          ruta: "/bo-fichas-de-pep",
          color: "#fbc02d",
        },
        {
          id: "7",
          label: "Fichas Notitia Criminis",
          icon: FolderIcon,
          ruta: "/bo-fichas-notitia-criminis",
          color: "#fbc02d",
        },
      ],
    },

    {
      id: "8",
      label: "Fichas aprobadas",
      icon: FolderIcon,
      ruta: "/bo-fichas-aprobadas",
      color: "#fbc02d",
    },

    {
      id: "9",
      label: "Fichas activas",
      icon: FolderIcon,
      ruta: "/bo-fichas-activas",
      color: "#fbc02d",
    },

    {
      id: "10",
      label: "Fichas firmadas",
      icon: FolderIcon,
      ruta: "/bo-fichas-firmadas",
      color: "#fbc02d",
    },

    {
      id: "11",
      label: "Fichas devueltas",
      icon: FolderIcon,
      ruta: "/bo-fichas-devueltas",
      color: "#9c27b0", // Púrpura
    },

    {
      id: "12",
      label: "Fichas rechazadas",
      icon: FolderIcon,
      ruta: "/bo-fichas-rechazadas",
      color: "#d32f2f", // Rojo
    },

    {
      id: "14",
      label: "Crear ficha",
      icon: PersonAddIcon,
      ruta: "#",
      color: "#2ECC71", // Verde
    },

    {
      id: "15",
      label: "Eliminar ficha",
      icon: PersonRemoveIcon,
      ruta: "#",
      color: "#d32f2f", // Rojo
    },
  ];

  // 1. Creamos el Set con los nombres válidos de la base de datos
  const nombresPermitidos = new Set(
    opcionesBd.map((opcion) => opcion.str_nombre),
  );

  // 2. Definimos la función de filtrado recursivo
  const filtrarMenu = (menu) => {
    return menu
      .filter((item) => nombresPermitidos.has(item.label))
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filtrarMenu(item.children),
          };
        }
        return item;
      });
  };

  const menuItems = isBO
    ? filtrarMenu(menuBO)
    : [
        {
          id: "1",
          label: "Inicio",
          icon: HomeRoundedIcon,
          ruta: "/inicio",
          color: "inherit",
        },
        {
          id: "2",
          label: "Iniciar registro",
          icon: SaveIcon,
          ruta: "/iniciar-registro",
          color: "#fbc02d",
        },
      ];

  const handleItemClick = (ruta) => {
    if (ruta) navigate(ruta);
  };

  const handleCreateClientClick = () => {
    setOpenModalCrearCliente(true);
  };

  const handleCloseModalCrearCliente = () => setOpenModalCrearCliente(false);

  const handleEliminarClientClick = () => {
    setOpenModalEliminarCliente(true);
  };

  const handleCloseModalEliminarCliente = () =>
    setOpenModalEliminarCliente(false);

  const handleCrearCliente = async () => {
    // 1. Limpiar únicamente el mensaje de error anterior
    setErrorEmail("");

    // 2. Validar formato de correo antes de hacer cualquier reseteo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailCliente)) {
      setErrorEmail(
        "Por favor, ingresa un correo electrónico con un dominio válido (ej: usuario@dominio.com).",
      );
      return;
    }

    // 3. Confirmación del usuario
    const confirmCrear = window.confirm("¿Usted desea crear esta ficha?");

    if (!confirmCrear) {
      setEmailCliente(""); // Limpiar el campo
      handleCloseModalCrearCliente(); // Cerrar el modal
      return;
    }

    try {
      const response = await axios.post(
        `${url}crearCliente`,
        { email: emailCliente },
        { headers },
      );

      // Axios solo llega aquí con estatus HTTP 2xx
      alert(response.data.message || "Cliente creado exitosamente.");
      setOpenModalCrearCliente(false);
      setEmailCliente(""); // Limpiar el campo tras el éxito
      setErrorEmail("");
      window.location.reload(); // Recargar la página
    } catch (error) {
      console.error(error);
      // Mensaje con fallback si falla la red o el servidor
      const msg =
        error.response?.data?.message ||
        "Ocurrió un error inesperado al crear el cliente.";
      alert(msg);
    }
  };

  const handleEliminarCliente = async () => {
    // Limpiar error previo de validación
    setErrorEmail("");

    // Regex para correo con cualquier extensión moderna de dominio (mínimo 2 letras)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailCliente)) {
      setErrorEmail(
        "Por favor, ingresa un correo electrónico con un dominio válido (ej: usuario@dominio.com).",
      );
      return;
    }

    const confirmDelete = window.confirm(
      "¿Usted desea eliminar esta ficha? Esta acción no se podrá deshacer.",
    );

    if (!confirmDelete) {
      setEmailCliente(""); // Limpiar el campo
      handleCloseModalEliminarCliente(); // Cerrar el modal
      return;
    }

    try {
      const response = await axios.post(
        `${url}eliminarCliente`,
        { email: emailCliente },
        { headers },
      );

      // Axios solo ejecuta estas líneas si la respuesta es exitosa (HTTP 2xx)
      alert(response.data.message);
      setOpenModalEliminarCliente(false);
      setEmailCliente("");
      setErrorEmail("");
      window.location.reload(); // Recargar para reflejar cambios
    } catch (error) {
      console.error(error);
      // Mensaje de respaldo en caso de fallo de red o error de servidor
      const msg =
        error.response?.data?.message ||
        "Ocurrió un error inesperado en el servidor.";
      alert(msg);
    }
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

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <Box sx={{ minHeight: 352, minWidth: 200 }}>
        <SimpleTreeView>
          {menuItems.map((item) => (
            <TreeItem
              key={item.id}
              itemId={item.id}
              // Lógica para renderizar Badge/Tooltip en ID 16 y Tooltip en ID 17
              label={
                item.id === "14" ? (
                  <Tooltip
                    title="Crea una nueva ficha a un cliente."
                    arrow
                    placement="right"
                  >
                    <Badge
                      //badgeContent="¡Nueva!"
                      color="warning"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      slotProps={{
                        badge: {
                          sx: {
                            right: -30, // Ajusta este valor según el ancho de tu sidebar
                            top: 10,
                            fontSize: "0.5rem",
                            whiteSpace: "nowrap",
                          },
                        },
                      }}
                    >
                      {item.label}
                    </Badge>
                  </Tooltip>
                ) : item.id === "15" ? (
                  <Tooltip
                    title="Elimina una ficha del sistema"
                    arrow
                    placement="right"
                  >
                    <span>{item.label}</span>
                  </Tooltip>
                ) : (
                  item.label
                )
              }
              slots={{ icon: item.icon }}
              slotProps={{
                icon: { sx: { color: item.color } },
              }}
              onClick={() => {
                if (item.id == 14) {
                  handleCreateClientClick();
                } else if (item.id == 15) {
                  handleEliminarClientClick();
                } else {
                  handleItemClick(item.ruta);
                }
              }}
            >
              {item.children?.map((child) => (
                <TreeItem
                  key={child.id}
                  itemId={child.id}
                  label={child.label}
                  slots={{ icon: child.icon }}
                  slotProps={{
                    icon: { sx: { color: child.color } },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(child.ruta);
                  }}
                />
              ))}
            </TreeItem>
          ))}
        </SimpleTreeView>

        {/* Modal de Crear Cliente*/}
        <Modal
          open={openModalCrearCliente}
          onClose={handleCloseModalCrearCliente}
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
              Crear Ficha
            </Typography>

            <TextField
              fullWidth
              label="Correo electrónico"
              type="text" // Cambiado a text para evitar conflictos de validación nativa con las mayúsculas
              variant="outlined"
              margin="normal"
              value={emailCliente}
              onChange={(e) => setEmailCliente(e.target.value.toUpperCase())} // Convierte a mayúsculas automáticamente
              error={!!errorEmail}
              helperText={errorEmail}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleCrearCliente}
              sx={{ mt: 2 }}
            >
              Crear
            </Button>
          </Box>
        </Modal>

        {/* Modal de Eliminar Cliente*/}
        <Modal
          open={openModalEliminarCliente}
          onClose={handleCloseModalEliminarCliente}
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
              Eliminar Ficha
            </Typography>

            <Typography
              id="modal-modal-title"
              variant="h7"
              component="h3"
              sx={{ mb: 2, textAlign: "left", fontWeight: "bold" }}
            >
              Nota: Solo se eliminará la ficha si está en estatus "Nueva", si se
              requiere eliminar una ficha con otro estatus diferente a "Nueva"
              consultarlo al área de Cumplimiento y comunicarse con el
              administrador de la base de datos.
            </Typography>

            <TextField
              fullWidth
              label="Correo electrónico"
              type="text" // Cambiado a text para evitar conflictos de validación nativa con las mayúsculas
              variant="outlined"
              margin="normal"
              value={emailCliente}
              onChange={(e) => setEmailCliente(e.target.value.toUpperCase())} // Convierte a mayúsculas automáticamente
              error={!!errorEmail}
              helperText={errorEmail}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleEliminarCliente}
              sx={{ mt: 2 }}
            >
              Eliminar
            </Button>
          </Box>
        </Modal>
      </Box>
    </Stack>
  );
}
