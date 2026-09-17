import { useEffect, useState, Fragment, forwardRef } from "react";
import CryptoJS from "crypto-js";
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
import { use } from "react";

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

const InformacionMovilizacionFondos = ({ expandir }) => {
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
  const [textoTipoProducto, setTextoTipoProducto] = useState("");
  const seccion7 = useSelector((state) => state.plantilla.seccion7);

  //Nuevos campos
  const [formErrors, setFormErrors] = useState(false);
  const [mensajesError, setMensajesError] = useState([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [listaProductos, setListaProductos] = useState([]);
  const [listaTipoProductos, setListaTipoProductos] = useState([]);
  const [str_monto_promedio_mensual, setStrMonto_promedio_mensual] = useState(
    plantilla?.str_monto_promedio_mensual || "",
  );
  const [str_cantidad_operaciones, setStrCantidad_operaciones] = useState(
    plantilla?.str_cantidad_operaciones || "",
  );

  const producto_id = useSelector((state) => state.plantilla.producto_id);

  const [tipo_producto_id, setTipoProducto_id] = useState(
    plantilla?.tipo_producto_id || "",
  );

  const [tasaBcv, setTasaBcv] = useState(null);
  const [fecha, setFecha] = useState(null);

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
    const fetchTasaBcv = async () => {
      try {
        const resMaestros = await axios.get(`${url}datos_maestro`, {
          headers,
          params: {
            str_tipo: "tasaBcv",
          },
        });

        const tasaBcv = resMaestros?.data[0]?.str_nombre;
        //console.log("Tasa encontrada:", tasaBcv);

        const tasaExtraida = tasaBcv ? Number(tasaBcv).toFixed(2) : "0.00";

        const hoy = new Date();
        const fechaValor = hoy.toISOString().split("T")[0];

        const [anio, mes, dia] = fechaValor.split("-");
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        setTasaBcv(tasaExtraida);
        setFecha(fechaFormateada);

        //console.log(seccion7);
      } catch (error) {
        console.error("Error al obtener la tasa del BCV:", error);
        setTasaBcv(null);
        setFecha("N/A");
      }
    };

    fetchTasaBcv();
  }, []);

  useEffect(() => {
    const fetchDatosMaestro = async () => {
      try {
        const [resMaestros] = await Promise.all([
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              str_tipo: "productos_mercosur,tipo_productos_mercosur",
            },
          }),
        ]);

        const { productos_mercosur, tipo_productos_mercosur } =
          resMaestros.data;

        setListaProductos(productos_mercosur || []);
        setListaTipoProductos(tipo_productos_mercosur || []);

        const objetoSeleccionado = tipo_productos_mercosur.find(
          (option) => option.id === tipo_producto_id,
        );

        if (objetoSeleccionado) {
          setTextoTipoProducto(objetoSeleccionado.str_nombre);
        }
      } catch (error) {
        console.error("Error cargando maestros de productos:", error);
      }
    };

    fetchDatosMaestro();
  }, [tipo_producto_id]);

  useEffect(() => {
    const fetchDatosMaestro = async () => {
      try {
        // 1. Ejecutamos las peticiones en paralelo (Paises + Todos los Maestros)
        const [resMaestros] = await Promise.all([
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              // Agrupamos los 3 tipos en un solo string
              str_tipo: "productos_mercosur,tipo_productos_mercosur",
            },
          }),
        ]);

        // 2. Desestructuramos el objeto que devuelve el endpoint agrupado
        const { productos_mercosur, tipo_productos_mercosur } =
          resMaestros.data;

        // 3. Actualizamos los estados
        setListaProductos(productos_mercosur || []);
        setListaTipoProductos(tipo_productos_mercosur || []);

        const objetoSeleccionado = tipo_productos_mercosur.find(
          (option) => option.id === producto_id,
        );

        if (objetoSeleccionado) {
          const textoDeLaOpcion = objetoSeleccionado.str_nombre;
          //console.log(textoDeLaOpcion);
          setTextoTipoProducto(textoDeLaOpcion);
        }
      } catch (error) {
        console.error("Error cargando maestros de productos:", error);
      }
    };

    fetchDatosMaestro();
  }, [producto_id]);

  const handleValidarMonto = (value) => {
    if (/^\d*$/.test(value) && value.length <= 6) {
      const monto = Number(value);

      setStrMonto_promedio_mensual(monto);
    }
  };

  const formatNumber = (value) => {
    if (!value) return "";
    // Eliminamos cualquier caracter que no sea número
    const number = value.replace(/\D/g, "");
    // Formateamos con separador de miles (punto en este ejemplo)
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!seccion7) {
      nuevosErrores.push("Complete la sección 7: Producto/Servicio");
      isValid = false;
      setOpen(true);
    }

    if (!str_monto_promedio_mensual) {
      nuevosErrores.push("Monto promedio mensual.");
      isValid = false;
      setOpen(true);
    }
    if (!str_cantidad_operaciones) {
      nuevosErrores.push("Cantidad de operaciones.");
      isValid = false;
      setOpen(true);
    }

    // 1. Extraer la tasa numérica del objeto de respuesta
    const tasaNumerica = parseFloat(tasaBcv);

    // 2. Convertir el monto promedio (asumiendo que viene en Bolívares) a USD para comparar con los límites
    // Si str_monto_promedio_mensual ya viene en USD, puedes saltar este paso.
    const montoEnUsd = parseFloat(str_monto_promedio_mensual) / tasaNumerica;

    //console.log(`Monto promedio mensual en USD: ${montoEnUsd.toFixed(2)} USD`);

    // 3. Validación de límites por Nivel
    if (textoTipoProducto === "NIVEL 1") {
      // Nivel 1: No puede ser mayor a 1000 USD
      if (montoEnUsd > 1000) {
        nuevosErrores.push(
          `El monto promedio mensual equivalente a (${montoEnUsd.toFixed(2)}€) no puede ser mayor a 1001€ para el Nivel 1 indicado en la sección 7 Producto/Servicio.`,
        );
        isValid = false;
        setOpen(true);
      }
    } else if (textoTipoProducto === "NIVEL 2") {
      // Nivel 2: No puede ser menor o igual a 1000 USD (o según la regla de negocio que aplique)
      if (montoEnUsd <= 1000) {
        nuevosErrores.push(
          `El monto promedio mensual equivalente a (${montoEnUsd.toFixed(2)}€) debe ser mayor a 1000€ para el Nivel 2 indicado en la sección 7 Producto/Servicio.`,
        );
        isValid = false;
        setOpen(true);
      }
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true);

      // Enviamos un objeto plano, NO FormData
      const datosContacto = {
        str_monto_promedio_mensual,
        str_cantidad_operaciones,
        bol_seccion_8: true,
        usuario_id: usuarioId,
      };

      //console.table(datosContacto);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(
          `${url}fichas/informacionmovilizacionfondos`,
          datosContacto,
          {
            headers: {
              Authorization: `Bearer ${tokenApi}`,
            },
          },
        ),
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

  const formatAsCurrency = (value) => {
    if (!value) return "0,00";

    // Aseguramos que tenga al menos 3 dígitos para poder poner la coma (ej: 005 -> 0,05)
    const paddedValue = value.padStart(3, "0");

    // Dividimos el string: todos los anteriores a los últimos 2 son la parte entera
    const integerPart = paddedValue.slice(0, -2);
    const decimalPart = paddedValue.slice(-2);

    // Quitamos ceros a la izquierda de la parte entera (pero dejamos uno si es 0)
    const cleanInteger = parseInt(integerPart, 10).toString();

    // Formateamos la parte entera con puntos de miles
    const formattedInteger = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedInteger},${decimalPart}`;
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Texto explicativo */}
                <div className="md:col-span-3 flex items-center p-2">
                  {/* Cambiamos el <p> exterior por un <div> para permitir <p> internos */}
                  <div className="text-sm leading-relaxed text-gray-400">
                    <p>
                      Tasa BCV: <strong>{tasaBcv} VES/EUR</strong> (actualizada
                      al dia de hoy <strong>{fecha}</strong>). El monto promedio
                      mensual se refiere al monto aproximado que planeas
                      movilizar mensualmente a través del producto o servicio
                      seleccionado. La cantidad de operaciones se refiere al
                      número aproximado de transacciones que esperas realizar
                      cada mes utilizando este producto o servicio.
                    </p>

                    {textoTipoProducto === "NIVEL 1" && (
                      <p className="mt-2">
                        Ha seleccionado el Nivel 1 en la <b>sección</b> 7:
                        Producto/Servicio. Por favor, indique un monto
                        aproximado (máximo mil euros (1000€) o su equivalente en
                        bolívares según el tipo de cambio oficial del BCV).
                      </p>
                    )}

                    {textoTipoProducto === "NIVEL 2" && (
                      <p className="mt-2">
                        Ha seleccionado el Nivel 2 en la <b>sección</b> 7:
                        Producto/Servicio. Por favor, indique un monto
                        aproximado (a partir de mil un euros (1001€) o su
                        equivalente en bolívares según el tipo de cambio oficial
                        del BCV).
                      </p>
                    )}
                  </div>
                </div>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_monto_promedio_mensual"
                    name="str_monto_promedio_mensual"
                    label="Monto promedio mensual (Bs.)"
                    placeholder="Monto promedio mensual"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={formatNumber(str_monto_promedio_mensual)}
                    inputProps={{
                      inputMode: "numeric",
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      const cleanValue = value.replace(/\D/g, ""); // Solo números

                      // Limitamos a 9 dígitos (ej: 999.999.999) para que no rompa el diseño
                      if (cleanValue.length <= 8) {
                        setStrMonto_promedio_mensual(cleanValue); // Guardamos solo los números
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_cantidad_operaciones"
                    name="str_cantidad_operaciones"
                    label="Cantidad de operaciones"
                    placeholder="Cantidad de operaciones"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={str_cantidad_operaciones}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 4, // Evita que se escriba más de 5 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validamos: que sean solo números Y que el largo sea máximo 5
                      if (/^\d*$/.test(value) && value.length <= 4) {
                        setStrCantidad_operaciones(value);
                      }
                    }}
                  />
                </FormControl>
              </div>

              {/* ADMIN: Usamos !! para convertir el valor a booleano (si existe y no es 0) */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR MOV. FONDOS
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
                      GUARDAR MOV. FONDOS
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
                      GUARDAR MOV. FONDOS
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

export default InformacionMovilizacionFondos;
