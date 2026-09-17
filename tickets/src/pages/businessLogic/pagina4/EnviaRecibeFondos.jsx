import { useEffect, useState, Fragment, forwardRef } from "react";

import "react-phone-number-input/style.css";

import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Lottie from "lottie-react";
import ErrorForm from "../../../assets/LottieFiles/Animation - 1751622035697.json";
import SuccessForm from "../../../assets/LottieFiles/Animation - 1751743150975.json";
import FileUploaded from "../../../assets/LottieFiles/Animation - 1751744696926.json";
import FileTransfer from "../../../assets/LottieFiles/Animation - 1751809722641.json";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormLabel from "@mui/material/FormLabel";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import { set } from "react-ga";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  resetPlantilla,
  setMuiMode,
  setSeccionesMasivo,
} from "../../../store/plantillaSlice";
import { persistor } from "../../../store/store";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

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

const EnviaRecibeFondos = ({ expandir }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const direccion = import.meta.env.REACT_APP_URL_API_LOCAL;
  const url = direccion;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };

  // Seleccionar estados desde Redux
  const usuarioBoId = useSelector((state) => state.plantilla.usuarioBoId);
  const usuarioId = useSelector((state) => state.plantilla.usuarioId);
  const plantilla = useSelector((state) => state.plantilla);
  const modo = useSelector((state) => state.plantilla.muiMode);

  //Nuevos campos
  const [formErrors, setFormErrors] = useState(false);
  const [mensajesError, setMensajesError] = useState([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [listaPaises, setListaPaises] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [listaMotivos, setListaMotivos] = useState([]);

  const [pais_id_envia_recibe_origen, setPais_id_envia_recibe_origen] =
    useState(plantilla?.pais_id_envia_recibe_origen || "");
  const [pais_id_envia_recibe_destino, setPais_id_envia_recibe_destino] =
    useState(plantilla?.pais_id_envia_recibe_destino || "");
  const [uso_modeda_virtual_id, setUso_modeda_virtual_id] = useState(
    plantilla?.uso_modeda_virtual_id || "",
  );
  const [motivos_id, setMotivo_id] = useState(plantilla?.motivos_id || "");
  const [str_origen_fondos, setStr_origen_fondos] = useState(
    plantilla?.str_origen_fondos || "",
  );
  const [str_destino_fondos, setStr_destino_fondos] = useState(
    plantilla?.str_destino_fondos || "",
  );

  useEffect(() => {
    const fetchDatosMaestro = async () => {
      try {
        // 1. Ejecutamos las peticiones en paralelo para ahorrar tiempo
        const [resPaises, resMaestros] = await Promise.all([
          axios.get(`${url}paises`, { headers }),
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              // Enviamos todos los tipos requeridos en una sola cadena
              str_tipo: "tipo_respuesta,tipo_motivos",
            },
          }),
        ]);

        // 2. Desestructuramos los datos que vienen agrupados desde el backend
        const { tipo_respuesta, tipo_motivos } = resMaestros.data;

        // 3. Seteamos los estados individuales
        setListaPaises(resPaises.data);

        // Usamos el operador || [] para evitar errores si el backend devuelve null
        setRespuestas(tipo_respuesta || []);
        setListaMotivos(tipo_motivos || []);
      } catch (error) {
        console.error("Error cargando datos maestros:", error);
      }
    };

    fetchDatosMaestro();
  }, []);

  const handleChangePais_idOrigen = async (event) => {
    setPais_id_envia_recibe_origen(event.target.value);
  };

  const handleChangePais_idDestino = async (event) => {
    setPais_id_envia_recibe_destino(event.target.value);
  };

  const handleChangeUso_moneda_virtual_id = async (event) => {
    setUso_modeda_virtual_id(event.target.value);
  };

  const handleChangeMotivos_id = async (event) => {
    setMotivo_id(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!pais_id_envia_recibe_origen) {
      nuevosErrores.push("País orígen.");
      isValid = false;
      setOpen(true);
    }

    if (!pais_id_envia_recibe_destino) {
      nuevosErrores.push("País destino.");
      isValid = false;
      setOpen(true);
    }

    if (!uso_modeda_virtual_id) {
      nuevosErrores.push("Uso moneda virtual.");
      isValid = false;
      setOpen(true);
    }

    if (!motivos_id) {
      nuevosErrores.push(
        "Producto y/o Motivo por lo que solicita el servicio.",
      );
      isValid = false;
      setOpen(true);
    }

    if (!str_origen_fondos) {
      nuevosErrores.push("Orígen de los fondos.");
      isValid = false;
      setOpen(true);
    }

    if (!str_destino_fondos) {
      nuevosErrores.push("Destino de los fondos.");
      isValid = false;
      setOpen(true);
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true);

      // Enviamos un objeto plano, NO FormData
      const datosContacto = {
        pais_id_envia_recibe_origen,
        pais_id_envia_recibe_destino,
        uso_modeda_virtual_id,
        motivos_id,
        str_origen_fondos,
        str_destino_fondos,
        bol_seccion_9: true,
        usuario_id: usuarioId,
      };

      //console.table(datosContacto);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/enviarecibir`, datosContacto, {
          headers: {
            Authorization: `Bearer ${tokenApi}`,
          },
        }),
        delay,
      ]);

      // BUSCAR
      const { data: datosActualizados } = await axios.get(
        `${url}buscar_ficha`,
        {
          headers: { Authorization: `Bearer ${tokenApi}` },
          params: {
            usuario_id: usuarioId,
            _t: Date.now(), // Rompe el caché del navegador
          },
        },
      );

      dispatch(resetPlantilla());
      dispatch(setSeccionesMasivo(datosActualizados));

      if (persistor) {
        await persistor.flush();
      }

      dispatch(setMuiMode(modo === "dark" ? "dark" : "light"));

      setFormSuccess(true);
      setFormSuccessMessage("¡Datos guardados con éxito!");
    } catch (error) {
      console.log("Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        //sx={{ "& .MuiTextField-root": {  width: "25ch" } }}
        sx={{ "& .MuiTextField-root": { width: "100%" } }}
        /* sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                gap: 2,
                                              }} */

        noValidate
        autoComplete="off"
        className="w-full flex justify-center items-center bg-transparent"
      >
        <div className="w-full max-w-4xl pt-6 pb-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center w-full px-4">
              <Lottie
                animationData={FileTransfer}
                loop={true}
                style={{ width: "100%", maxWidth: "460px" }}
              />
              <p className="text-2xl text-gray-500 mt-0 text-center">
                Guardando sus datos...
              </p>
            </div>
          )}

          {formSuccess && (
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="flex flex-row gap-2 justify-center">
                <Lottie
                  animationData={SuccessForm}
                  loop={true}
                  style={{ width: "30px", height: "30px" }}
                />
                <p className="text-2xl font-extralight text-green-500">
                  {formSuccessMessage}
                </p>
              </div>

              <Lottie
                animationData={FileUploaded}
                loop={true}
                style={{ width: "200px", height: "200px" }}
              />

              <Button
                type="button"
                variant="contained"
                //onClick={() => (window.location.href = `/${import.meta.env.REACT_APP_PREFIJO}/guardar`)}
                //onClick={() => (window.location.href = `/crear-ficha`)}
                onClick={() => {
                  setFormSuccess(false);
                  expandir(false);
                }}
                className="w-60"
              >
                Continuar
              </Button>
            </div>
          )}

          {!formSuccess && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">País origen</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="pais_id_envia_recibe_origen"
                    name="pais_id_envia_recibe_origen"
                    value={
                      listaPaises.length > 0 ? pais_id_envia_recibe_origen : ""
                    }
                    onChange={handleChangePais_idOrigen}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaPaises.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">País destino</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="pais_id_envia_recibe_destino"
                    name="pais_id_envia_recibe_destino"
                    value={
                      listaPaises.length > 0 ? pais_id_envia_recibe_destino : ""
                    }
                    onChange={handleChangePais_idDestino}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaPaises.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Uso moneda virtual</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="uso_modeda_virtual_id"
                    name="uso_modeda_virtual_id"
                    value={respuestas.length > 0 ? uso_modeda_virtual_id : ""}
                    onChange={handleChangeUso_moneda_virtual_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {respuestas.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Producto y/o Motivo por lo que solicita el servicio
                  </InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="motivos_id"
                    name="motivos_id"
                    value={listaMotivos.length > 0 ? motivos_id : ""}
                    onChange={handleChangeMotivos_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaMotivos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    id="str_origen_fondos"
                    name="str_origen_fondos"
                    minRows={3}
                    maxRows={6}
                    value={str_origen_fondos}
                    label="Orígen de los fondos"
                    placeholder="Orígen de los fondos"
                    maxLength={98}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-transparent transition-colors"
                    style={{
                      marginTop: "8px",
                      fontFamily: "inherit",
                      borderColor:
                        "var(--mui-palette-Divider, rgba(145, 158, 171, 0.24))",
                      borderWidth: "1px",
                      color: "inherit",
                      // 1. Forzamos visualmente las mayúsculas
                      textTransform: "uppercase",
                    }}
                    onChange={(e) => {
                      // 2. Convertimos el valor a mayúsculas antes de guardarlo en el estado
                      const valueUpper = e.target.value.toUpperCase();
                      setStr_origen_fondos(valueUpper);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--mui-palette-text-primary, currentColor)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--mui-palette-Divider, rgba(145, 158, 171, 0.24))";
                    }}
                  />
                </div>

                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    id="str_destino_fondos"
                    name="str_destino_fondos"
                    minRows={3}
                    maxRows={6}
                    value={str_destino_fondos}
                    label="Destino de los fondos"
                    placeholder="Destino de los fondos"
                    maxLength={98}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-transparent transition-colors"
                    style={{
                      marginTop: "8px",
                      fontFamily: "inherit",
                      borderColor:
                        "var(--mui-palette-Divider, rgba(145, 158, 171, 0.24))",
                      borderWidth: "1px",
                      color: "inherit",
                      // 1. Forzamos visualmente las mayúsculas
                      textTransform: "uppercase",
                    }}
                    onChange={(e) => {
                      // 2. Convertimos el valor a mayúsculas antes de guardarlo en el estado
                      const valueUpper = e.target.value.toUpperCase();
                      setStr_destino_fondos(valueUpper);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--mui-palette-text-primary, currentColor)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--mui-palette-Divider, rgba(145, 158, 171, 0.24))";
                    }}
                  />
                </div>
              </div>

              {/* ADMIN: Usamos !! para convertir el valor a booleano (si existe y no es 0) */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR FONDOS EXTERIOR
                  </Button>
                </Stack>
              )}

              {/* CLIENTE: Solo si NO hay usuarioBoId Y la sección no está completa */}
              {usuarioBoId == null &&
                plantilla?.bolDevuelta == true &&
                plantilla?.seccionCompletada == true && (
                  <Stack
                    spacing={2}
                    direction="row"
                    className="justify-center pt-6"
                  >
                    <Button type="submit" variant="contained" color="secondary">
                      GUARDAR FONDOS EXTERIOR
                    </Button>
                  </Stack>
                )}

              {usuarioBoId == null &&
                !plantilla?.bolDevuelta == true &&
                !plantilla?.seccionCompletada == true && (
                  <Stack
                    spacing={2}
                    direction="row"
                    className="justify-center pt-6"
                  >
                    <Button type="submit" variant="contained" color="secondary">
                      GUARDAR FONDOS EXTERIOR
                    </Button>
                  </Stack>
                )}
            </>
          )}
        </div>
      </Box>

      <Fragment>
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            <div className="flex flex-row gap-2">
              <Lottie
                animationData={ErrorForm}
                loop={true}
                style={{ width: "20px", height: "20px" }}
              />
              <p className="text-base font-extralight">Atención</p>
            </div>
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            {formErrors && (
              <>
                <div className="flex flex-row gap-2">
                  <p className="text-base font-extralight">
                    Faltan los siguientes datos:
                  </p>
                </div>

                <ul className="text-sm text-left mb-6 font-extralight">
                  {mensajesError.map((mensaje, index) => (
                    <li key={index}>{mensaje}</li>
                  ))}
                </ul>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose}>
              Cerrar
            </Button>
          </DialogActions>
        </BootstrapDialog>
      </Fragment>
    </>
  );
};

export default EnviaRecibeFondos;
