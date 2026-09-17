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

const PersonaPep = ({ expandir }) => {
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
  const [respuestas, setRespuestas] = useState([]);
  const [listaPaises, setListaPaises] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [parentesco, setTipoParentesco] = useState([]);

  const [deshabilitaPep, setDeshabilitaPep] = useState(
    plantilla?.condicionPepId === 21 ? false : true,
  );

  const [deshabilitaRelacionado, setDeshabilitaRelacionado] = useState(
    plantilla?.relacionadoPepId === 21 ? false : true,
  );

  const [deshabilitaVinculo, setDeshabilitaVinculo] = useState(
    plantilla?.vinculoPepId === 21 ? false : true,
  );

  const [condicion_pep_id, setCondicion_pep_id] = useState(
    plantilla?.condicionPepId || "",
  );

  const [str_nombre_organizacion_pep, setStr_nombre_organizacion_pep] =
    useState(plantilla?.strNombreOrganizacionPep || "");
  const [pais_pep_id, setPais_pep_id] = useState(plantilla?.paisPepId || "");

  const [fechaIngresoPep, setFechaIngresoPep] = useState(
    plantilla?.fechaIngresoPep ? dayjs(plantilla.fechaIngresoPep) : null,
  );
  const [fechaEgresoPep, setFechaEgresoPep] = useState(
    plantilla?.fechaEgresoPep ? dayjs(plantilla.fechaEgresoPep) : null,
  );

  const [str_cargo_pep, setStr_cargo_pep] = useState(
    plantilla?.strCargoPep || "",
  );
  const [relacionadoPepId, setRelacionadoPepId] = useState(
    plantilla?.relacionadoPepId || "",
  );
  const [primerNombreRelacionado, setPrimerNombreRelacionado] = useState(
    plantilla?.strPrimerNombrePepRelacionado || "",
  );
  const [segundoNombreRelacionado, setSegundoNombreRelacionado] = useState(
    plantilla?.strSegundoNombrePepRelacionado || "",
  );
  const [primerApellidoRelacionado, setPrimerApellidoRelacionado] = useState(
    plantilla?.strPrimerApellidoPepRelacionado || "",
  );
  const [segundoApellidoRelacionado, setSegundoApellidoRelacionado] = useState(
    plantilla?.strSegundoApellidoPepRelacionado || "",
  );
  const [nacionalidadPepRelacionadoId, setNacionalidadPepRelacionadoId] =
    useState(plantilla?.nacionalidadPepRelacionadoId || "");

  const [tipoDocRelacionadoPepId, setTipoDocRelacionadoPepId] = useState(
    plantilla?.tipodocRelacionadoPepId || "",
  );
  const [cedulaRelacionado, setCedulaRelacionado] = useState(
    plantilla?.strCedulaRelacionado || "",
  );
  const [nombreOrganizacionRelacionado, setNombreOrganizacionRelacionado] =
    useState(plantilla?.strNombreOrganizacionPepRelacionado || "");
  const [cargoRelacionado, setCargoRelacionado] = useState(
    plantilla?.strCargoPepRelacionado || "",
  );
  const [paisPepRelacionadoId, setPaisPepRelacionadoId] = useState(
    plantilla?.paisPepRelacionadoId || "",
  );

  const [fechaIngresoRelacionado, setFechaIngresoRelacionado] = useState(
    plantilla?.fechaIngresoRelacionadoPep
      ? dayjs(plantilla.fechaIngresoRelacionadoPep)
      : null,
  );
  const [fechaEgresoRelacionado, setFechaEgresoRelacionado] = useState(
    plantilla?.fechaEgresoRelacionadoPep
      ? dayjs(plantilla.fechaEgresoRelacionadoPep)
      : null,
  );

  const [tipoRelacionRelacionadoId, setTipoRelacionRelacionadoId] = useState(
    plantilla?.tipoRelacionRelacionadoId || "",
  );
  const [vinculoPepId, setVinculoPepId] = useState(
    plantilla?.vinculoPepId || "",
  );
  const [primerNombreVinculo, setPrimerNombreVinculo] = useState(
    plantilla?.strPrimerNombrePepVinculo || "",
  );
  const [segundoNombreVinculo, setSegundoNombreVinculo] = useState(
    plantilla?.strSegundoNombrePepVinculo || "",
  );
  const [primerApellidoVinculo, setPrimerApellidoVinculo] = useState(
    plantilla?.strPrimerApellidoPepVinculo || "",
  );
  const [segundoApellidoVinculo, setSegundoApellidoVinculo] = useState(
    plantilla?.strSegundoApellidoPepVinculo || "",
  );
  const [nacionalidadPepVinculoId, setNacionalidadPepVinculoId] = useState(
    plantilla?.nacionalidadPepVinculoId || "",
  );
  const [tipoDocVinculoPepId, setTipoDocVinculoPepId] = useState(
    plantilla?.tipodocVinculoPepId || "",
  );
  const [cedulaVinculo, setCedulaVinculo] = useState(
    plantilla?.strCedulaVinculo || "",
  );
  const [nombreOrganizacionVinculo, setNombreOrganizacionVinculo] = useState(
    plantilla?.strNombreOrganizacionPepVinculo || "",
  );
  const [cargoVinculo, setCargoVinculo] = useState(
    plantilla?.strCargoPepVinculo || "",
  );
  const [paisPepVinculoId, setPaisPepVinculoId] = useState(
    plantilla?.paisPepVinculoId || "",
  );

  const [fechaIngresoVinculo, setFechaIngresoVinculo] = useState(
    plantilla?.fechaIngresoVinculoPep
      ? dayjs(plantilla.fechaIngresoVinculoPep)
      : null,
  );
  const [fechaEgresoVinculo, setFechaEgresoVinculo] = useState(
    plantilla?.fechaEgresoVinculoPep
      ? dayjs(plantilla.fechaEgresoVinculoPep)
      : null,
  );

  const [tipoRelacionVinculoId, setTipoRelacionVinculoId] = useState(
    plantilla?.tipoRelacionVinculoId || "",
  );

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
        // 1. Ejecutamos las peticiones en paralelo para ahorrar tiempo
        const [resPaises, resNacionalidad, resMaestros] = await Promise.all([
          axios.get(`${url}paises`, { headers }),
          axios.get(`${url}nacionalidad`, { headers }),
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              // Enviamos todos los tipos requeridos en una sola cadena
              str_tipo: "tipo_respuesta,tipo_documento_identidad,parentesco",
            },
          }),
        ]);

        // 2. Desestructuramos los datos que vienen agrupados desde el backend
        const { tipo_respuesta, tipo_documento_identidad, parentesco } =
          resMaestros.data;

        // 3. Seteamos los estados individuales
        setListaPaises(resPaises.data);
        setNacionalidades(resNacionalidad.data);

        // Usamos el operador || [] para evitar errores si el backend devuelve null
        setRespuestas(tipo_respuesta || []);
        setTipoDocumentos(tipo_documento_identidad || []);
        setTipoParentesco(parentesco || []);
      } catch (error) {
        console.error("Error cargando datos maestros:", error);
      }
    };

    fetchDatosMaestro();
  }, []);

  const handleChangePep = async (event, child) => {
    setCondicion_pep_id(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaPep(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaPep(true);
      setStr_nombre_organizacion_pep("");
      setStr_cargo_pep("");
      setPais_pep_id("");
      setFechaIngresoPep("");
      setFechaEgresoPep("");
    }
  };

  const handleChangeRelacionadoPep = async (event, child) => {
    setRelacionadoPepId(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaRelacionado(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaRelacionado(true);

      setPrimerNombreRelacionado("");

      setSegundoNombreRelacionado("");
      setPrimerApellidoRelacionado("");
      setSegundoApellidoRelacionado("");
      setNacionalidadPepRelacionadoId("");
      setTipoDocRelacionadoPepId("");
      setCedulaRelacionado("");
      setNombreOrganizacionRelacionado("");
      setCargoRelacionado("");
      setPaisPepRelacionadoId("");
      setFechaIngresoRelacionado("");
      setFechaEgresoRelacionado("");
      setTipoRelacionRelacionadoId("");
    }
  };

  const handleChangeVinculoPep = async (event, child) => {
    setVinculoPepId(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaVinculo(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaVinculo(true);
      setPrimerNombreVinculo("");
      setSegundoNombreVinculo("");
      setPrimerApellidoVinculo("");
      setSegundoApellidoVinculo("");
      setNacionalidadPepVinculoId("");
      setTipoDocVinculoPepId("");
      setCedulaVinculo("");
      setNombreOrganizacionVinculo("");
      setCargoVinculo("");
      setPaisPepVinculoId("");
      setFechaIngresoVinculo("");
      setFechaEgresoVinculo("");
      setTipoRelacionVinculoId("");
    }
  };

  const handleChangepais_pep_id = async (event) => {
    setPais_pep_id(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!condicion_pep_id) {
      nuevosErrores.push("¿Usted es PEP?.");
      isValid = false;
      setOpen(true);
    }

    const seleccionRespuesta = respuestas.find(
      (item) => item.id === condicion_pep_id,
    );

    if (seleccionRespuesta) {
      if (seleccionRespuesta.str_nombre == "Si") {
        if (!str_nombre_organizacion_pep) {
          nuevosErrores.push("Ente de adscripción.");
          isValid = false;
          setOpen(true);
        }

        if (!str_cargo_pep) {
          nuevosErrores.push("Cargo que desempeña.");
          isValid = false;
          setOpen(true);
        }

        if (!pais_pep_id) {
          nuevosErrores.push("País.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaIngresoPep) {
          nuevosErrores.push("Fecha de ingreso.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaEgresoPep) {
          nuevosErrores.push("Fecha de egreso.");
          isValid = false;
          setOpen(true);
        }
      }
    }

    if (!relacionadoPepId) {
      nuevosErrores.push("¿Tiene parentesco PEP?");
      isValid = false;
      setOpen(true);
    }

    const seleccionRelacionado = respuestas.find(
      (item) => item.id === relacionadoPepId,
    );

    if (seleccionRelacionado) {
      if (seleccionRelacionado.str_nombre == "Si") {
        if (!primerNombreRelacionado) {
          nuevosErrores.push("Primer nombre parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!segundoNombreRelacionado) {
          nuevosErrores.push("Segundo nombre parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!primerApellidoRelacionado) {
          nuevosErrores.push("Primer apellido parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!segundoApellidoRelacionado) {
          nuevosErrores.push("Segundo apellido parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!nacionalidadPepRelacionadoId) {
          nuevosErrores.push("Nacionalidad del parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoDocRelacionadoPepId) {
          nuevosErrores.push("Tipo documento parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!cedulaRelacionado) {
          nuevosErrores.push("Cédula vinculo parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!nombreOrganizacionRelacionado) {
          nuevosErrores.push("Ente de adscripción parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!cargoRelacionado) {
          nuevosErrores.push("Cargo que desempeña parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!paisPepRelacionadoId) {
          nuevosErrores.push("País parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaIngresoRelacionado) {
          nuevosErrores.push("Fecha de ingreso parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaEgresoRelacionado) {
          nuevosErrores.push("Fecha de egreso parentesco.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoRelacionRelacionadoId) {
          nuevosErrores.push("Tipo Relación parentesco.");
          isValid = false;
          setOpen(true);
        }
      }
    }

    if (!vinculoPepId) {
      nuevosErrores.push("¿Tiene vínculo PEP?");
      isValid = false;
      setOpen(true);
    }

    const seleccionVinculo = respuestas.find(
      (item) => item.id === vinculoPepId,
    );

    if (seleccionVinculo) {
      if (seleccionVinculo.str_nombre == "Si") {
        if (!primerNombreVinculo) {
          nuevosErrores.push("Primer nombre vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!segundoNombreVinculo) {
          nuevosErrores.push("Segundo nombre vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!primerApellidoVinculo) {
          nuevosErrores.push("Primer apellido vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!segundoApellidoVinculo) {
          nuevosErrores.push("Segundo apellido vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!nacionalidadPepVinculoId) {
          nuevosErrores.push("Nacionalidad del vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoDocVinculoPepId) {
          nuevosErrores.push("Tipo documento vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!cedulaVinculo) {
          nuevosErrores.push("Cédula vinculo vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!nombreOrganizacionVinculo) {
          nuevosErrores.push("Ente de adscripción vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!cargoVinculo) {
          nuevosErrores.push("Cargo que desempeña vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!paisPepVinculoId) {
          nuevosErrores.push("País vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaIngresoVinculo) {
          nuevosErrores.push("Fecha de ingreso vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!fechaEgresoVinculo) {
          nuevosErrores.push("Fecha de egreso vinculo.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoRelacionVinculoId) {
          nuevosErrores.push("Tipo Relación vinculo.");
          isValid = false;
          setOpen(true);
        }
      }
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true);

      // Enviamos un objeto plano, NO FormData
      const datosContacto = {
        condicion_pep_id,
        str_nombre_organizacion_pep,
        str_cargo_pep,
        pais_pep_id,
        fechaIngresoPep,
        fechaEgresoPep,
        relacionadoPepId,
        primerNombreRelacionado,
        segundoNombreRelacionado,
        primerApellidoRelacionado,
        segundoApellidoRelacionado,
        nacionalidadPepRelacionadoId,
        tipoDocRelacionadoPepId,
        cedulaRelacionado,
        nombreOrganizacionRelacionado,
        cargoRelacionado,
        paisPepRelacionadoId,
        fechaIngresoRelacionado,
        fechaEgresoRelacionado,
        tipoRelacionRelacionadoId,
        vinculoPepId,
        primerNombreVinculo,
        segundoNombreVinculo,
        primerApellidoVinculo,
        segundoApellidoVinculo,
        nacionalidadPepVinculoId,
        tipoDocVinculoPepId,
        cedulaVinculo,
        nombreOrganizacionVinculo,
        cargoVinculo,
        paisPepVinculoId,
        fechaIngresoVinculo,
        fechaEgresoVinculo,
        tipoRelacionVinculoId,
        bol_seccion_3: true,
        usuario_id: usuarioId,
      };

      //console.table(datosContacto);

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/personapep`, datosContacto, {
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
                  <InputLabel id="tipo-label">¿Usted es PEP?</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="condicion_pep_id"
                    name="condicion_pep_id"
                    value={respuestas.length > 0 ? condicion_pep_id : ""}
                    onChange={handleChangePep}
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

                {/* Texto explicativo */}
                <div className="md:col-span-3 flex items-center p-2">
                  <p className="text-sm leading-relaxed text-gray-400">
                    <strong>
                      ¿Qué es una Persona Políticamente Expuesta (PEP)?
                    </strong>{" "}
                    Es aquel individuo que cumple o ha cumplido funciones
                    públicas destacadas (como jefes de estado, políticos de alto
                    rango, funcionarios judiciales o militares de alta
                    jerarquía) o tiene vínculos cercanos con ellos.
                  </p>
                </div>
              </div>

              {!deshabilitaPep && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={deshabilitaPep}
                        id="str_nombre_organizacion_pep"
                        name="str_nombre_organizacion_pep"
                        label="Ente de adscripción"
                        placeholder="Ente de adscripción"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_nombre_organizacion_pep}
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
                            setStr_nombre_organizacion_pep(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={deshabilitaPep}
                        id="str_cargo_pep"
                        name="str_cargo_pep"
                        label="Cargo que desempeña"
                        placeholder="Cargo que desempeña"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_cargo_pep}
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
                            setStr_cargo_pep(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}>
                      <InputLabel id="tipo-label">País</InputLabel>
                      <Select
                        disabled={deshabilitaPep}
                        labelId="tipo-label"
                        id="pais_pep_id"
                        name="pais_pep_id"
                        value={listaPaises.length > 0 ? pais_pep_id : ""}
                        onChange={handleChangepais_pep_id}
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

                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="es"
                    >
                      <DatePicker
                        disabled={deshabilitaPep}
                        label="Fecha de ingreso"
                        format="DD-MM-YYYY"
                        // El ingreso no puede ser después de hoy ni después de la fecha de egreso
                        maxDate={
                          fechaEgresoPep ? dayjs(fechaEgresoPep) : dayjs()
                        }
                        minDate={dayjs().subtract(100, "year")}
                        value={fechaIngresoPep ? dayjs(fechaIngresoPep) : null}
                        onChange={(newValue) => {
                          if (newValue && newValue.isValid()) {
                            // Validación extra: no permitir ingreso después de egreso (si existe egreso)
                            const esValida =
                              !fechaEgresoPep ||
                              newValue.isBefore(dayjs(fechaEgresoPep)) ||
                              newValue.isSame(dayjs(fechaEgresoPep));

                            if (esValida && !newValue.isAfter(dayjs(), "day")) {
                              setFechaIngresoPep(newValue.format("YYYY-MM-DD"));
                            }
                          } else if (!newValue) {
                            setFechaIngresoPep(null);
                          }
                        }}
                        slotProps={{
                          textField: {
                            id: "fechaIngresoPep",
                            required: true,
                            fullWidth: true,
                            readOnly: true,
                            inputProps: { readOnly: true },
                            onKeyDown: (e) => e.preventDefault(),
                            sx: {
                              "& .MuiInputBase-input": { cursor: "pointer" },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="es"
                    >
                      <DatePicker
                        disabled={deshabilitaPep}
                        label="Fecha de egreso"
                        format="DD-MM-YYYY"
                        maxDate={dayjs()}
                        // El egreso no puede ser antes de la fecha de ingreso
                        minDate={
                          fechaIngresoPep
                            ? dayjs(fechaIngresoPep)
                            : dayjs().subtract(100, "year")
                        }
                        value={fechaEgresoPep ? dayjs(fechaEgresoPep) : null}
                        onChange={(newValue) => {
                          if (newValue && newValue.isValid()) {
                            // Validación extra: no permitir egreso antes de ingreso
                            const esValida =
                              !fechaIngresoPep ||
                              newValue.isAfter(dayjs(fechaIngresoPep)) ||
                              newValue.isSame(dayjs(fechaIngresoPep));

                            if (esValida && !newValue.isAfter(dayjs(), "day")) {
                              setFechaEgresoPep(newValue.format("YYYY-MM-DD"));
                            }
                          } else if (!newValue) {
                            setFechaEgresoPep(null);
                          }
                        }}
                        slotProps={{
                          textField: {
                            id: "fechaEgresoPep",
                            required: true,
                            fullWidth: true,
                            readOnly: true,
                            inputProps: { readOnly: true },
                            onKeyDown: (e) => e.preventDefault(),
                            sx: {
                              "& .MuiInputBase-input": { cursor: "pointer" },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    ¿Tiene parentesco PEP?
                  </InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="relacionadoPepId"
                    name="relacionadoPepId"
                    value={respuestas.length > 0 ? relacionadoPepId : ""}
                    onChange={handleChangeRelacionadoPep}
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

                {/* Texto explicativo */}
                <div className="md:col-span-3 flex items-center p-2">
                  <p className="text-sm leading-relaxed text-gray-400">
                    <strong>Nota sobre Parentesco PEP:</strong> Se considera PEP
                    no solo al funcionario, sino también a sus{" "}
                    <strong>familiares directos</strong> (cónyuge, concubino,
                    padres, hijos, hermanos) y{" "}
                    <strong>allegados cercanos</strong> (socios comerciales,
                    apoderados o personas con relaciones jurídicas notorias).
                  </p>
                </div>
              </div>

              {!deshabilitaRelacionado && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center mb-4">
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="primerNombreRelacionado"
                      name="primerNombreRelacionado"
                      label="Primer nombre"
                      required
                      fullWidth
                      value={primerNombreRelacionado}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setPrimerNombreRelacionado(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="segundoNombreRelacionado"
                      name="segundoNombreRelacionado"
                      label="Segundo nombre"
                      fullWidth
                      value={segundoNombreRelacionado}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setSegundoNombreRelacionado(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="primerApellidoRelacionado"
                      name="primerApellidoRelacionado"
                      label="Primer apellido"
                      required
                      fullWidth
                      value={primerApellidoRelacionado}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setPrimerApellidoRelacionado(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="segundoApellidoRelacionado"
                      name="segundoApellidoRelacionado"
                      label="Segundo apellido"
                      fullWidth
                      value={segundoApellidoRelacionado}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setSegundoApellidoRelacionado(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="nacionalidad-label">
                      Nacionalidad
                    </InputLabel>
                    <Select
                      disabled={deshabilitaRelacionado}
                      labelId="nacionalidad-label"
                      id="nacionalidadPepRelacionadoId"
                      name="nacionalidadPepRelacionadoId"
                      value={
                        nacionalidades.length > 0
                          ? nacionalidadPepRelacionadoId
                          : ""
                      }
                      onChange={(e) =>
                        setNacionalidadPepRelacionadoId(e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {nacionalidades.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nacionalidad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="nacionalidad-label">
                      Tipo documento
                    </InputLabel>
                    <Select
                      disabled={deshabilitaRelacionado}
                      labelId="nacionalidad-label"
                      id="tipoDocRelacionadoPepId"
                      name="tipoDocRelacionadoPepId"
                      value={
                        tipoDocumentos.length > 0 ? tipoDocRelacionadoPepId : ""
                      }
                      onChange={(e) =>
                        setTipoDocRelacionadoPepId(e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {tipoDocumentos.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Cédula */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="cedulaRelacionado"
                      name="cedulaRelacionado"
                      label="Cédula"
                      required
                      fullWidth
                      value={cedulaRelacionado}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 8,
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 8) {
                          setCedulaRelacionado(value);
                        }
                      }}
                    />
                  </FormControl>

                  {/* Ente de adscripción */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="nombreOrganizacionRelacionado"
                      name="nombreOrganizacionRelacionado"
                      label="Ente de adscripción"
                      required
                      fullWidth
                      value={nombreOrganizacionRelacionado}
                      onChange={(e) =>
                        setNombreOrganizacionRelacionado(
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </FormControl>

                  {/* Cargo */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaRelacionado}
                      id="cargoRelacionado"
                      name="cargoRelacionado"
                      label="Cargo que desempeña"
                      required
                      fullWidth
                      value={cargoRelacionado}
                      onChange={(e) =>
                        setCargoRelacionado(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>

                  {/* País */}
                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="pais-label">País</InputLabel>
                    <Select
                      disabled={deshabilitaRelacionado}
                      labelId="pais-label"
                      id="paisPepRelacionadoId"
                      name="paisPepRelacionadoId"
                      value={listaPaises.length > 0 ? paisPepRelacionadoId : ""}
                      onChange={(e) => setPaisPepRelacionadoId(e.target.value)}
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

                  {/* Fecha Ingreso */}
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                  >
                    <DatePicker
                      disabled={deshabilitaRelacionado}
                      label="Fecha de ingreso"
                      value={
                        fechaIngresoRelacionado
                          ? dayjs(fechaIngresoRelacionado)
                          : null
                      }
                      maxDate={
                        fechaEgresoRelacionado
                          ? dayjs(fechaEgresoRelacionado)
                          : dayjs()
                      }
                      onChange={(newValue) =>
                        setFechaIngresoRelacionado(
                          newValue ? newValue.format("YYYY-MM-DD") : null,
                        )
                      }
                      slotProps={{
                        textField: {
                          id: "fechaIngresoRelacionado",
                          name: "fechaIngresoRelacionado",
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Fecha Egreso */}
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                  >
                    <DatePicker
                      disabled={deshabilitaRelacionado}
                      label="Fecha de egreso"
                      value={
                        fechaEgresoRelacionado
                          ? dayjs(fechaEgresoRelacionado)
                          : null
                      }
                      minDate={
                        fechaIngresoRelacionado
                          ? dayjs(fechaIngresoRelacionado)
                          : null
                      }
                      maxDate={dayjs()}
                      onChange={(newValue) =>
                        setFechaEgresoRelacionado(
                          newValue ? newValue.format("YYYY-MM-DD") : null,
                        )
                      }
                      slotProps={{
                        textField: {
                          id: "fechaEgresoRelacionado",
                          name: "fechaEgresoRelacionado",
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Tipo Relación */}
                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="relacion-label">Tipo Relación</InputLabel>
                    <Select
                      disabled={deshabilitaRelacionado}
                      labelId="relacion-label"
                      id="tipoRelacionRelacionadoId"
                      name="tipoRelacionRelacionadoId"
                      value={
                        parentesco.length > 0 ? tipoRelacionRelacionadoId : ""
                      }
                      onChange={(e) =>
                        setTipoRelacionRelacionadoId(e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {parentesco.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">¿Tiene vínculo PEP?</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="vinculoPepId"
                    name="vinculoPepId"
                    value={respuestas.length > 0 ? vinculoPepId : ""}
                    onChange={handleChangeVinculoPep}
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

                {/* Texto explicativo */}
                <div className="md:col-span-3 flex items-center p-2">
                  <p className="text-sm leading-relaxed text-gray-400">
                    También se considera vinculada a una PEP cualquier persona
                    que tenga{" "}
                    <strong>relaciones jurídicas o de negocios</strong>{" "}
                    conocidas. Esto incluye:
                    <strong>Socios comerciales:</strong> Copropietarios de
                    empresas o negocios con la PEP.
                    <strong>Poderes legales:</strong> Personas que tienen
                    facultades para firmar o administrar bienes en nombre de la
                    PEP.
                    <strong>Relaciones de confianza:</strong> Personas que, sin
                    ser familiares, mantienen un vínculo estrecho y público (ej.
                    asesores directos o testaferros conocidos).
                    <strong>Beneficiarios finales:</strong> Personas que poseen
                    o controlan una entidad jurídica junto con una PEP.
                  </p>
                </div>
              </div>

              {!deshabilitaVinculo && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="primerNombreVinculo"
                      name="primerNombreVinculo"
                      label="Primer nombre"
                      required
                      fullWidth
                      value={primerNombreVinculo}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setPrimerNombreVinculo(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="segundoNombreVinculo"
                      name="segundoNombreVinculo"
                      label="Segundo nombre"
                      fullWidth
                      value={segundoNombreVinculo}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setSegundoNombreVinculo(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="primerApellidoVinculo"
                      name="primerApellidoVinculo"
                      label="Primer apellido"
                      required
                      fullWidth
                      value={primerApellidoVinculo}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setPrimerApellidoVinculo(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="segundoApellidoVinculo"
                      name="segundoApellidoVinculo"
                      label="Segundo apellido"
                      fullWidth
                      value={segundoApellidoVinculo}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (
                          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                          value.length <= 50
                        ) {
                          setSegundoApellidoVinculo(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="nacionalidad-label">
                      Nacionalidad
                    </InputLabel>
                    <Select
                      disabled={deshabilitaVinculo}
                      labelId="nacionalidad-label"
                      id="nacionalidadPepVinculoId"
                      name="nacionalidadPepVinculoId"
                      value={
                        nacionalidades.length > 0
                          ? nacionalidadPepVinculoId
                          : ""
                      }
                      onChange={(e) =>
                        setNacionalidadPepVinculoId(e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {nacionalidades.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nacionalidad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="nacionalidad-label">
                      Tipo documento
                    </InputLabel>
                    <Select
                      disabled={deshabilitaVinculo}
                      labelId="nacionalidad-label"
                      id="tipoDocVinculoPepId"
                      name="tipoDocVinculoPepId"
                      value={
                        tipoDocumentos.length > 0 ? tipoDocVinculoPepId : ""
                      }
                      onChange={(e) => setTipoDocVinculoPepId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {tipoDocumentos.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Cédula */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="cedulaVinculo"
                      name="cedulaVinculo"
                      label="Cédula"
                      required
                      fullWidth
                      value={cedulaVinculo}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 8,
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 8) {
                          setCedulaVinculo(value);
                        }
                      }}
                    />
                  </FormControl>

                  {/* Ente de adscripción */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="nombreOrganizacionVinculo"
                      name="nombreOrganizacionVinculo"
                      label="Ente de adscripción"
                      required
                      fullWidth
                      value={nombreOrganizacionVinculo}
                      onChange={(e) =>
                        setNombreOrganizacionVinculo(
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </FormControl>

                  {/* Cargo */}
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <TextField
                      disabled={deshabilitaVinculo}
                      id="cargoVinculo"
                      name="cargoVinculo"
                      label="Cargo que desempeña"
                      required
                      fullWidth
                      value={cargoVinculo}
                      onChange={(e) =>
                        setCargoVinculo(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>

                  {/* País */}
                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="pais-label">País</InputLabel>
                    <Select
                      disabled={deshabilitaVinculo}
                      labelId="pais-label"
                      id="paisPepVinculoId"
                      name="paisPepVinculoId"
                      value={listaPaises.length > 0 ? paisPepVinculoId : ""}
                      onChange={(e) => setPaisPepVinculoId(e.target.value)}
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

                  {/* Fecha Ingreso */}
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                  >
                    <DatePicker
                      disabled={deshabilitaVinculo}
                      label="Fecha de ingreso"
                      value={
                        fechaIngresoVinculo ? dayjs(fechaIngresoVinculo) : null
                      }
                      maxDate={
                        fechaEgresoVinculo ? dayjs(fechaEgresoVinculo) : dayjs()
                      }
                      onChange={(newValue) =>
                        setFechaIngresoVinculo(
                          newValue ? newValue.format("YYYY-MM-DD") : null,
                        )
                      }
                      slotProps={{
                        textField: {
                          id: "fechaIngresoVinculo",
                          name: "fechaIngresoVinculo",
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Fecha Egreso */}
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                  >
                    <DatePicker
                      disabled={deshabilitaVinculo}
                      label="Fecha de egreso"
                      value={
                        fechaEgresoVinculo ? dayjs(fechaEgresoVinculo) : null
                      }
                      minDate={
                        fechaIngresoVinculo ? dayjs(fechaIngresoVinculo) : null
                      }
                      maxDate={dayjs()}
                      onChange={(newValue) =>
                        setFechaEgresoVinculo(
                          newValue ? newValue.format("YYYY-MM-DD") : null,
                        )
                      }
                      slotProps={{
                        textField: {
                          id: "fechaEgresoVinculo",
                          name: "fechaEgresoVinculo",
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel id="relacion-label">Tipo Relación</InputLabel>
                    <Select
                      disabled={deshabilitaVinculo}
                      labelId="relacion-label"
                      id="tipoRelacionVinculoId"
                      name="tipoRelacionVinculoId"
                      value={parentesco.length > 0 ? tipoRelacionVinculoId : ""}
                      onChange={(e) => setTipoRelacionVinculoId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>

                      {parentesco.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.str_nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}

              {/* ADMIN: Usamos !! para convertir el valor a booleano (si existe y no es 0) */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR PERSONA PEP
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
                      GUARDAR PERSONA PEP
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
                      GUARDAR PERSONA PEP
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

export default PersonaPep;
