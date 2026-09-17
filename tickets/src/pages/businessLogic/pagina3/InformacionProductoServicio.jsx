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
import Chip from "@mui/material/Chip";
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

import { setProductoId } from "../../../store/plantillaSlice";

import { persistor } from "../../../store/store";
import ButtonBase from "@mui/material/ButtonBase";

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

const InformacionProductoServicio = ({ expandir }) => {
  const [open, setOpen] = useState(false);
  const [str_celular, setStrCelular] = useState("");
  const [str_telefono, setStrtelefono] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

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
  const [listaProductos, setListaProductos] = useState([]);
  const [listaTipoProductos, setListaTipoProductos] = useState([]);
  const [listaMoneda, setListaMoneda] = useState([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [textoTipoProducto, setTextoTipoProducto] = useState("");
  const [producto_id, setProducto_id] = useState(plantilla?.producto_id || "");
  const [tipo_producto_id, setTipoProducto_id] = useState(
    plantilla?.tipo_producto_id || "",
  );
  const [str_numero_producto, setStr_numero_producto] = useState(
    plantilla?.str_numero_producto || "",
  );
  const [moneda_id, setMoneda_id] = useState(plantilla?.moneda_id || "");

  const [archivoPasaporte, setArchivoPasaporte] = useState(null);
  const [archivoReferenciaBancaria, setArchivoReferenciaBancaria] =
    useState(null);
  const [archivoConstanciaTrabajo, setArchivoConstanciaTrabajo] =
    useState(null);

  const [nombreArchivoPasaporte, setNombreArchivoPasaporte] = useState();

  /* const [nombreArchivoReferenciaBancaria, setNombreArchivoReferenciaBancaria] =
    useState(
      plantilla?.ruta_referencia_bancaria
        ? decodeURIComponent(escape(plantilla?.ruta_referencia_bancaria)).split(
            "/var/www/uploads/",
          )[1]
        : "",
    );
  const [nombreArchivoConstanciaTrabajo, setNombreArchivoConstanciaTrabajo] =
    useState(
      plantilla?.ruta_constancia_trabajo
        ? decodeURIComponent(escape(plantilla?.ruta_constancia_trabajo)).split(
            "/var/www/uploads/",
          )[1]
        : "",
    ); */

  const [nombreArchivoReferenciaBancaria, setNombreArchivoReferenciaBancaria] =
    useState(() => {
      const ruta = plantilla?.ruta_referencia_bancaria;
      if (!ruta) return "";
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";
      try {
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        return nombreExtraido;
      }
    });

  const [nombreArchivoConstanciaTrabajo, setNombreArchivoConstanciaTrabajo] =
    useState(() => {
      const ruta = plantilla?.ruta_constancia_trabajo;
      if (!ruta) return "";
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";
      try {
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        return nombreExtraido;
      }
    });

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
        const { productos_mercosur, tipo_productos_mercosur, monedas } =
          resMaestros.data;

        // 3. Actualizamos los estados
        setListaProductos(productos_mercosur || []);
        setListaTipoProductos(tipo_productos_mercosur || []);

        const objetoSeleccionado = tipo_productos_mercosur.find(
          (option) => option.id === tipo_producto_id,
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
  }, []);

  const handleChangeProducto_id = async (event) => {
    setProducto_id(event.target.value);
  };

  const handleChangeTipo_producto_id = async (event) => {
    const idSeleccionado = event.target.value;
    setTipoProducto_id(idSeleccionado);

    const objetoSeleccionado = listaTipoProductos.find(
      (option) => option.id === idSeleccionado,
    );

    if (objetoSeleccionado) {
      const textoDeLaOpcion = objetoSeleccionado.str_nombre;
      //console.log(textoDeLaOpcion);
      setTextoTipoProducto(textoDeLaOpcion);
    }

    dispatch(setProductoId(idSeleccionado));
  };

  const handleChangeMoneda_id = async (event) => {
    setMoneda_id(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!producto_id) {
      nuevosErrores.push("Nombre del producto.");
      isValid = false;
      setOpen(true);
    }

    if (!tipo_producto_id) {
      nuevosErrores.push("Tipo de producto.");
      isValid = false;
      setOpen(true);
    }

    if (textoTipoProducto === "NIVEL 2") {
      if (!archivoReferenciaBancaria) {
        nuevosErrores.push("Referencia Bancaria.");
        isValid = false;
      }

      if (!archivoConstanciaTrabajo) {
        nuevosErrores.push("Constancia de trabajo.");
        isValid = false;
      }

      if (!isValid) {
        setOpen(true);
      }
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("archivoReferenciaBancaria", archivoReferenciaBancaria);
      formData.append("archivoConstanciaTrabajo", archivoConstanciaTrabajo);
      formData.append("producto_id", producto_id);
      formData.append("tipo_producto_id", tipo_producto_id);
      formData.append("bol_seccion_7", true);
      formData.append("usuario_id", usuarioId);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/informacionproductoservicio`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
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
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Nombre del producto</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="producto_id"
                    name="producto_id"
                    value={listaProductos.length > 0 ? producto_id : ""}
                    onChange={handleChangeProducto_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaProductos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Tipo de producto</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipo_producto_id"
                    name="tipo_producto_id"
                    value={
                      listaTipoProductos.length > 0 ? tipo_producto_id : ""
                    }
                    onChange={handleChangeTipo_producto_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaTipoProductos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {textoTipoProducto == "NIVEL 2" && (
                  <div className="flex flex-row gap-4 items-center justify-center">
                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                      >
                        Referencia Bancaria (Imagen o PDF)
                        <VisuallyHiddenInput
                          required
                          id="referencia"
                          name="referencia"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          //accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return; // Validación por si el usuario cancela la selección

                            const tiposPermitidos = [
                              "application/pdf",
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                            ];

                            if (!tiposPermitidos.includes(file.type)) {
                              alert(
                                "Tipo de archivo no permitido. Solo PDF, JPG o PNG.",
                              );
                              e.target.value = ""; // Limpia el input solo si hay error
                              return;
                            }

                            // Guardamos el objeto file completo, no el FileList (e.target.files)
                            setNombreArchivoReferenciaBancaria(file.name);
                            setArchivoReferenciaBancaria(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoReferenciaBancaria && (
                        <Chip
                          label={nombreArchivoReferenciaBancaria}
                          onDelete={() => {
                            setNombreArchivoReferenciaBancaria("");
                            setArchivoReferenciaBancaria(null);
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                      >
                        Constancia de trabajo (Imagen o PDF)
                        <VisuallyHiddenInput
                          required
                          id="constancia"
                          name="constancia"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          //accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return; // Validación por si el usuario cancela la selección

                            const tiposPermitidos = [
                              "application/pdf",
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                            ];

                            if (!tiposPermitidos.includes(file.type)) {
                              alert(
                                "Tipo de archivo no permitido. Solo PDF, JPG o PNG.",
                              );
                              e.target.value = ""; // Limpia el input solo si hay error
                              return;
                            }

                            // Guardamos el objeto file completo, no el FileList (e.target.files)
                            setNombreArchivoConstanciaTrabajo(file.name);
                            setArchivoConstanciaTrabajo(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoConstanciaTrabajo && (
                        <Chip
                          label={nombreArchivoConstanciaTrabajo}
                          onDelete={() => {
                            setNombreArchivoConstanciaTrabajo("");
                            setArchivoConstanciaTrabajo(null);
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_numero_producto"
                    name="str_numero_producto"
                    label="Número de producto"
                    placeholder="Número de producto"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={str_numero_producto}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 5, // Evita que se escriba más de 5 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validamos: que sean solo números Y que el largo sea máximo 5
                      if (/^\d*$/.test(value) && value.length <= 5) {
                        setStr_numero_producto(value);
                      }
                    }}
                  />
                </FormControl> */}

                {/* <FormControl variant="filled" sx={{  minWidth: 120 }}>
                  <InputLabel id="tipo-label">Moneda</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="moneda_id"
                    name="moneda_id"
                    value={moneda_id}
                    onChange={handleChangeMoneda_id}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaMoneda.map((option) => (
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
                    GUARDAR PRODUCTO/SERVICIO
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
                      GUARDAR PRODUCTO/SERVICIO
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
                      GUARDAR PRODUCTO/SERVICIO
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

export default InformacionProductoServicio;
