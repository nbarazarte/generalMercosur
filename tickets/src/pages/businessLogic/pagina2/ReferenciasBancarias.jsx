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

const ReferenciasBancarias = ({ expandir }) => {
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

  const [formErrors, setFormErrors] = useState(false);
  const [mensajesError, setMensajesError] = useState([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [listaBancos, setListaBancos] = useState([]);
  const [listaCifras, setListaCifras] = useState([]);

  // plantilla?.strSegundoNombrePepRelacionado || ""

  const [banco_id, setBanco_id] = useState(plantilla?.banco_id || "");
  const [str_nombre_prod_bancario, setStr_nombre_prod_bancario] = useState(
    plantilla?.str_nombre_prod_bancario || "",
  );
  const [str_cuenta_bancaria, setStr_cuenta_bancaria] = useState(
    plantilla?.str_cuenta_bancaria || "",
  );
  const [cifras_id, setCifras_id] = useState(plantilla?.cifras_id || "");

  useEffect(() => {
    const fetchDatosMaestro = async () => {
      const timer = new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const headers = { Authorization: `Bearer ${tokenApi}` };
        const [datosFicha] = await Promise.all([
          axios.get(`${url}buscar_ficha`, {
            headers,
            params: { usuario_id: plantilla.usuarioId },
          }),
          timer,
        ]);

        dispatch(setSeccionesMasivo(datosFicha.data));
      } catch (error) {
        console.error("Error al obtener la ficha:", error);
      }
    };

    fetchDatosMaestro();
  }, [plantilla.usuarioId, url, dispatch, tokenApi]);

  useEffect(() => {
    const fetchDatosMaestro = async () => {
      try {
        // 1. Usamos Promise.all para mantener la estructura de "peticiones en paralelo"
        // Aunque sea una sola, se desestructura como el primer elemento de un array [resMaestros]
        const [resMaestros] = await Promise.all([
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              str_tipo: "bancos_venezuela,tipo_cifras",
            },
          }),
        ]);

        // 2. Extraemos los datos de la propiedad .data de la respuesta
        const { bancos_venezuela, tipo_cifras } = resMaestros.data;

        // 3. Seteamos estados
        setListaBancos(bancos_venezuela || []);
        setListaCifras(tipo_cifras || []);
      } catch (error) {
        console.error("Error cargando datos maestros:", error);
      }
    };

    fetchDatosMaestro();
  }, []);

  const handleChangeBanco = async (event) => {
    setBanco_id(event.target.value);
  };

  const handleChangeCifras = async (event) => {
    setCifras_id(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!banco_id) {
      nuevosErrores.push("Institución bancaria.");
      isValid = false;
      setOpen(true);
    }

    if (!str_nombre_prod_bancario) {
      nuevosErrores.push("Tipo de cuenta.");
      isValid = false;
      setOpen(true);
    }

    if (!str_cuenta_bancaria) {
      nuevosErrores.push("El número de cuenta bancaria es obligatorio.");
      isValid = false;
    } else if (str_cuenta_bancaria.length !== 20) {
      nuevosErrores.push(
        "El número de cuenta bancaria debe tener exactamente 20 dígitos.",
      );
      isValid = false;
    }

    /* if (!cifras_id) {
      nuevosErrores.push("Cifras promedio.");
      isValid = false;
      setOpen(true);
    } */

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true);

      // Enviamos un objeto plano, NO FormData
      const datosContacto = {
        banco_id,
        str_nombre_prod_bancario,
        str_cuenta_bancaria,
        cifras_id,
        bol_seccion_4: true,
        usuario_id: usuarioId,
      };

      //console.table(datosContacto);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/referenciasbancarias`, datosContacto, {
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
              <div className="md:col-span-3 flex items-center p-2">
                <p className="text-sm leading-relaxed text-gray-400">
                  <strong>¿Qué son las cifras promedio?</strong> Es el monto
                  aproximado que sueles mantener en tus cuentas bancarias mes a
                  mes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Institución bancaria</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="banco_id"
                    name="banco_id"
                    value={listaBancos.length > 0 ? banco_id : ""}
                    onChange={handleChangeBanco}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaBancos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_nombre_prod_bancario"
                    name="str_nombre_prod_bancario"
                    label="Tipo de cuenta"
                    placeholder="Tipo de cuenta"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_nombre_prod_bancario}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (value.length <= 50) {
                        setStr_nombre_prod_bancario(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_cuenta_bancaria"
                    name="str_cuenta_bancaria"
                    label="Número de cuenta bancaria"
                    placeholder="Número de cuenta bancaria"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={str_cuenta_bancaria}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 20, // Evita que se escriba más de 20 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Validamos: que sean solo números Y que el largo sea máximo 20
                      if (/^\d*$/.test(value) && value.length <= 20) {
                        setStr_cuenta_bancaria(value);
                      }
                    }}
                    error={
                      str_cuenta_bancaria.length > 0 &&
                      str_cuenta_bancaria.length < 20
                    }
                    helperText={
                      str_cuenta_bancaria.length > 0 &&
                      str_cuenta_bancaria.length < 20
                        ? "Por favor, completar los 20 caracteres."
                        : ""
                    }
                  />
                </FormControl>

                {/* <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Cifras promedio</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="cifras_id"
                    name="cifras_id"
                    value={listaCifras.length > 0 ? cifras_id : ""}
                    onChange={handleChangeCifras}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaCifras.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
              </div>

              {/* ADMIN: Usamos !! para convertir el valor a booleano (si existe y no es 0) */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR REF. BANCARIAS
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
                      GUARDAR REF. BANCARIAS
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
                      GUARDAR REF. BANCARIAS
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

export default ReferenciasBancarias;
