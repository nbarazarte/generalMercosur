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

import { persistor } from "../../../store/store"; // Ajusta la ruta a tu archivo store

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

const DireccionDomicilio = ({ expandir }) => {
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
  const userEmail = useSelector((state) => state.plantilla.userEmail);
  const plantilla = useSelector((state) => state.plantilla);
  const modo = useSelector((state) => state.plantilla.muiMode);

  const [email, setEmail] = useState(plantilla?.email || "");
  const [pais_id, setPais_id] = useState(plantilla?.paisId || "");

  const [estado_id, setEstado_id] = useState(plantilla?.estadoId || "");

  const [municipio_id, setMunicipio_id] = useState(
    plantilla?.municipioId || "",
  );
  const [parroquia_id, setParroquia_id] = useState(
    plantilla?.parroquiaId || "",
  );
  const [str_ciudad, setStrCiudad] = useState(plantilla?.ciudad || "");
  const [str_codigo_postal, setStr_codigo_postal] = useState(
    plantilla?.codigoPostal || "",
  );
  const [str_direccion_residencia, setStr_direccion_residencia] = useState(
    plantilla?.direccionResidencia || "",
  );

  const [str_telefono, setStrtelefono] = useState(plantilla?.telefono || "");
  const [str_celular, setStrCelular] = useState(plantilla?.celular || "");

  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [listaPaises, setListaPaises] = useState([]);
  const [listaEstados, setListaEstados] = useState([]);
  const [mensajesError, setMensajesError] = useState([]);
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [listaParroquias, setListaParroquias] = useState([]);

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

  // 1. CARGA INICIAL DE PAÍSES (El que ya tienes, mantenlo)
  useEffect(() => {
    const fetchDatosMaestro = async () => {
      try {
        const paises = await axios.get(`${url}paises`, { headers });
        setListaPaises(paises.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDatosMaestro();
  }, []);

  useEffect(() => {
    if (pais_id) {
      axios
        .get(`${url}estadosPais`, {
          headers,
          params: { pais_id },
        })
        .then((res) => setListaEstados(res.data))
        .catch((err) => console.log(err));
    }
  }, [pais_id]);

  useEffect(() => {
    if (estado_id) {
      axios
        .get(`${url}municipiosEstados`, {
          headers,
          params: { id_estado: estado_id },
        })
        .then((res) => setListaMunicipios(res.data))
        .catch((err) => console.log(err));
    }
  }, [estado_id]);

  useEffect(() => {
    if (municipio_id) {
      axios
        .get(`${url}parroquiasMunicipios`, {
          headers,
          params: { id_municipio: municipio_id },
        })
        .then((res) => setListaParroquias(res.data))
        .catch((err) => console.log(err));
    }
  }, [municipio_id]);

  const handleChangePais_id = async (event) => {
    setPais_id(event.target.value);

    const estados = await axios.get(`${url}estadosPais`, {
      headers,
      params: {
        pais_id: event.target.value,
      },
    });

    setEstado_id("");
    setMunicipio_id("");
    setParroquia_id("");

    setListaEstados(estados.data);
    setListaMunicipios([]);
    setListaParroquias([]);
  };

  const handleChangeEstado_id = async (event) => {
    setEstado_id(event.target.value);

    const municipios = await axios.get(`${url}municipiosEstados`, {
      headers,
      params: {
        id_estado: event.target.value,
      },
    });

    setMunicipio_id("");
    setParroquia_id("");
    setListaMunicipios(municipios.data);
    setListaParroquias([]);
  };

  const handleChangeMunicipio_id = async (event) => {
    setMunicipio_id(event.target.value);

    const parroquias = await axios.get(`${url}parroquiasMunicipios`, {
      headers,
      params: {
        id_municipio: event.target.value,
      },
    });

    setParroquia_id("");
    setListaParroquias(parroquias.data);
  };

  const handleChangeParroquia_id = (event) => {
    setParroquia_id(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    const seleccionPais = listaPaises.find((item) => item.id === pais_id);
    const seleccionEstado = listaEstados.find(
      (item) => item.id_estado === estado_id,
    );

    if (!pais_id) {
      nuevosErrores.push("País.");
      isValid = false;
      setOpen(true);
    }

    if (seleccionPais) {
      if (seleccionPais.str_nombre == "Venezuela") {
        if (!estado_id) {
          nuevosErrores.push("Estado.");
          isValid = false;
          setOpen(true);
        }

        if (seleccionEstado) {
          if (seleccionEstado.estado !== "Dependencias Federales") {
            if (!municipio_id) {
              nuevosErrores.push("Municipio.");
              isValid = false;
              setOpen(true);
            }

            if (!parroquia_id) {
              nuevosErrores.push("Parroquia.");
              isValid = false;
              setOpen(true);
            }
          }
        }
      }
    }

    if (!str_ciudad) {
      nuevosErrores.push("Ciudad.");
      isValid = false;
      setOpen(true);
    }

    if (!str_codigo_postal) {
      nuevosErrores.push("Código postal.");
      isValid = false;
      setOpen(true);
    }

    /* if (!str_telefono) {
      nuevosErrores.push("Teléfono domicilio.");
      isValid = false;
      setOpen(true);
    } */

    if (!str_celular) {
      nuevosErrores.push("Teléfono celular.");
      isValid = false;
      setOpen(true);
    }

    /* if (str_telefono && !isValidPhoneNumber(str_telefono)) {
      nuevosErrores.push("Formato de teléfono de domicilio inválido.");
      isValid = false;
      setOpen(true);
    } */

    if (str_celular && !isValidPhoneNumber(str_celular)) {
      nuevosErrores.push("Formato de teléfono celular inválido.");
      isValid = false;
      setOpen(true);
    }

    // Validar email
    /*     if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);

      nuevosErrores.push("Correo electrónico.");
      setEmailErrorMessage(
        "Formato de correo inválido (Ej: usuario@correo.com)",
      );
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    } */

    if (!str_direccion_residencia) {
      nuevosErrores.push("Dirección.");
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
        pais_id,
        estado_id,
        municipio_id,
        parroquia_id,
        str_ciudad,
        str_codigo_postal,
        str_direccion_residencia,
        //str_telefono,
        str_celular,
        //email,
        bol_seccion_2: true,
        usuario_id: usuarioId,
      };

      //console.table(datosContacto);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/direccionDomicilio`, datosContacto, {
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
                  <InputLabel id="tipo-label">País</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="pais_id"
                    name="pais_id"
                    value={listaPaises.length > 0 ? pais_id : ""}
                    onChange={handleChangePais_id}
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
                  <InputLabel id="tipo-label">Estado</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="estado_id"
                    name="estado_id"
                    value={listaEstados.length > 0 ? estado_id : ""}
                    onChange={handleChangeEstado_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaEstados.map((option) => (
                      <MenuItem key={option.id_estado} value={option.id_estado}>
                        {option.estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Municipio</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="municipio_id"
                    name="municipio_id"
                    value={listaMunicipios.length > 0 ? municipio_id : ""}
                    onChange={handleChangeMunicipio_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaMunicipios.map((option) => (
                      <MenuItem
                        key={option.id_municipio}
                        value={option.id_municipio}
                      >
                        {option.municipio}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Parroquia</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="parroquia_id"
                    name="parroquia_id"
                    value={listaParroquias.length > 0 ? parroquia_id : ""}
                    onChange={handleChangeParroquia_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaParroquias.map((option) => (
                      <MenuItem
                        key={option.id_parroquia}
                        value={option.id_parroquia}
                      >
                        {option.parroquia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_ciudad"
                    name="str_ciudad"
                    label="Ciudad"
                    placeholder="Ciudad"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_ciudad}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrCiudad(value);
                      }
                    }}
                  />
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_codigo_postal"
                    name="str_codigo_postal"
                    label="Código postal"
                    placeholder="Código postal"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={str_codigo_postal}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 5, // Evita que se escriba más de 5 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validamos: que sean solo números Y que el largo sea máximo 5
                      if (/^\d*$/.test(value) && value.length <= 5) {
                        setStr_codigo_postal(value);
                      }
                    }}
                  />
                </FormControl>

                {/* <FormControl
                  variant="outlined"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <PhoneInput
                    international
                    defaultCountry="VE"
                    value={str_telefono || ""}
                    onChange={setStrtelefono}
                    inputComponent={MUIInput}
                    label="Telefono de domicilio"
                    placeholder="Ingrese su teléfono de domicilio"
                    numberInputProps={{
                      maxLength: 17,
                    }}
                    // Ponemos el campo en rojo si hay algo escrito y no es válido
                    error={
                      str_telefono ? !isValidPhoneNumber(str_telefono) : false
                    }
                    // Mostramos el mensaje solo si hay un error de validación
                    helperText={
                      str_telefono && !isValidPhoneNumber(str_telefono)
                        ? "Formato de número inválido (Ej: +58 212 1234567)"
                        : ""
                    }
                  />
                </FormControl> */}

                <FormControl
                  variant="outlined"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <PhoneInput
                    international
                    defaultCountry="VE"
                    value={str_celular || ""}
                    onChange={setStrCelular}
                    inputComponent={MUIInput}
                    label="Teléfono celular"
                    placeholder="Ingrese su teléfono celular"
                    numberInputProps={{
                      maxLength: 17,
                    }}
                    // Ponemos el campo en rojo si hay algo escrito y no es válido
                    error={
                      str_celular ? !isValidPhoneNumber(str_celular) : false
                    }
                    // Mostramos el mensaje solo si hay un error de validación
                    helperText={
                      str_celular && !isValidPhoneNumber(str_celular)
                        ? "Formato de número inválido (Ej: +58 412 1234567)"
                        : ""
                    }
                  />
                </FormControl>

                {/* <FormControl>
                  <TextField
                    error={emailError}
                    helperText={emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="USUARIO@CORREO.COM"
                    autoComplete="email"
                    required
                    fullWidth
                    variant="outlined"
                    value={email || userEmail || ""}
                    onChange={(e) => {
                      // 1. Transformamos a mayúsculas y guardamos en una constante
                      const upperValue = e.target.value.toUpperCase();
                      // 2. Pasamos la constante transformada al estado
                      setEmail(upperValue);
                    }}
                    // 3. Forzamos visualmente las mayúsculas en el input
                    inputProps={{
                      style: { textTransform: "uppercase" },
                    }}
                  />
                </FormControl> */}

                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    id="str_direccion_residencia"
                    name="str_direccion_residencia"
                    minRows={3}
                    maxRows={6}
                    value={str_direccion_residencia}
                    label="Dirección"
                    placeholder="DIRECCIÓN (AVENIDA, CALLE, EDIFICIO/CASA, NRO. PISO, APTO.)"
                    // Mantenemos maxLength por buena práctica y accesibilidad
                    maxLength={98}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-transparent transition-colors"
                    style={{
                      marginTop: "8px",
                      fontFamily: "inherit",
                      borderColor:
                        "var(--mui-palette-Divider, rgba(145, 158, 171, 0.24))",
                      borderWidth: "1px",
                      color: "inherit",
                      textTransform: "uppercase",
                    }}
                    onChange={(e) => {
                      // ESTA ES LA CLAVE: No permitir que el estado pase de 98
                      if (e.target.value.length <= 98) {
                        setStr_direccion_residencia(
                          e.target.value.toUpperCase(),
                        );
                      }
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
                  <span>{str_direccion_residencia.length} / 98</span>
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
                    GUARDAR DIRECCIÓN DOMICILIO
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
                      GUARDAR DIRECCIÓN DOMICILIO
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
                      GUARDAR DIRECCIÓN DOMICILIO
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

export default DireccionDomicilio;
