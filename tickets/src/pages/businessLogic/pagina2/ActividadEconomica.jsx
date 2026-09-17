import { useEffect, useState, Fragment, forwardRef } from "react";
import Box from "@mui/material/Box";
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
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
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import { set } from "react-ga";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextareaAutosize from "@mui/material/TextareaAutosize";
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

const ActividadEconomica = ({ expandir }) => {
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
  const modo = useSelector((state) => state.plantilla.muiMode);

  const plantilla = useSelector((state) => state.plantilla);
  const [formErrors, setFormErrors] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [deshabilitaDependencia, setDeshabilitaDependencia] = useState(true);
  const [deshabilitaNegocio, setDeshabilitaNegocio] = useState(true);
  const [deshabilitaOtrasFuentes, setDeshabilitaOtrasFuentes] = useState(true);

  const [listaCategorias, setListaCategorias] = useState([]);
  const [negocioPropio, setNegocioPropio] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [mensajesError, setMensajesError] = useState([]);

  const [profesiones, setProfesiones] = useState([]);
  const [respuestasFuentes, setRespuestasFuentes] = useState([]);
  const [relacionDependencia, setRelacionDependencia] = useState([]);
  const [fuentesIngresos, setFuentesIngresos] = useState([]);

  const [listaPaises, setListaPaises] = useState([]);
  const [listaEstados, setListaEstados] = useState([]);
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [listaParroquias, setListaParroquias] = useState([]);

  const [listaPaisesNegocio, setListaPaisesNegocio] = useState([]);
  const [listaEstadosNegocio, setListaEstadosNegocio] = useState([]);
  const [listaMunicipiosNegocio, setListaMunicipiosNegocio] = useState([]);
  const [listaParroquiasNegocio, setListaParroquiasNegocio] = useState([]);

  //Campos
  const [tipoProfesion, setTipoProfesion] = useState(
    plantilla?.profesion_id || "",
  );

  const [actividad_economica_id, setActividad_economica_id] = useState(
    plantilla?.actividad_economica_id || "",
  );

  const [
    str_actividad_economica_descripcion,
    setStr_actividad_economica_descripcion,
  ] = useState(plantilla?.str_actividad_economica_descripcion || "");

  const [categoria_especial_id, setCategoria_especial_id] = useState(
    plantilla?.categoria_especial_id || "",
  );

  const [dependencia_id, setDependencia_id] = useState(
    plantilla?.dependencia_id || "",
  );

  const [fechaIngreso, setFechaIngreso] = useState(
    plantilla?.fecha_ingreso ? dayjs(plantilla.fecha_ingreso) : null,
  );
  const [nombreEmpresa, setNombreEmpresa] = useState(
    plantilla?.str_nombre_empresa || "",
  );

  const [rifEmpresa, setRifEmpresa] = useState(
    plantilla?.str_rif_empresa || "",
  );

  const [monto_ingreso_mensual, setMonto_ingreso_mensual] = useState(
    plantilla?.str_monto_ingreso_mensual || "",
  );

  const [strOtroMontoIngresoMensual, setstrOtroMontoIngresoMensual] = useState(
    plantilla?.strotromontoingresomensual || "",
  );

  const [cargo, setCargo] = useState(plantilla?.str_cargo || "");

  const [ramo, setRamo] = useState(plantilla?.str_ramo || "");

  const [pais_id, setPais_id] = useState(plantilla?.pais_id || "");

  const [estado_id, setEstado_id] = useState(plantilla?.estado_id || "");

  const [municipio_id, setMunicipio_id] = useState(
    plantilla?.municipio_id || "",
  );
  const [parroquia_id, setParroquia_id] = useState(
    plantilla?.parroquia_id || "",
  );
  const [strDireccion, setStrDireccion] = useState(
    plantilla?.str_direccion || "",
  );

  const [negocio_propio_id, setNegocio_propio_id] = useState(
    plantilla?.negocio_propio_id || "",
  );

  const [str_telefono, setStrTelefono] = useState(
    plantilla?.str_telefono || "",
  );

  const [fechaFundacion, setFechaFundacion] = useState(
    plantilla?.fecha_fundacion ? dayjs(plantilla.fecha_fundacion) : null,
  );
  const [nombreNegocio, setNombreNegocio] = useState(
    plantilla?.str_nombre_negocio || "",
  );
  const [rifNegocio, setRifNegocio] = useState(
    plantilla?.str_rif_negocio || "",
  );

  const [pais_idNegocio, setPais_idNegocio] = useState(
    plantilla?.pais_id_np || "",
  );
  const [estado_idNegocio, setEstado_idNegocio] = useState(
    plantilla?.estado_id_np || "",
  );
  const [municipio_idNegocio, setMunicipio_idNegocio] = useState(
    plantilla?.municipio_id_np || "",
  );
  const [parroquia_idNegocio, setParroquia_idNegocio] = useState(
    plantilla?.parroquia_id_np || "",
  );
  const [strDireccionNegocio, setStrDireccionNegocio] = useState(
    plantilla?.str_direccion_np || "",
  );
  const [str_telefonoNegocio, setStrTelefonoNegocio] = useState(
    plantilla?.str_telefono_np || "",
  );
  const [ramoNegocio, setRamoNegocio] = useState(plantilla?.str_ramo_np || "");
  const [monto_ingreso_mensualNegocio, setMonto_ingreso_mensualNegocio] =
    useState(plantilla?.str_monto_ingreso_mensual_np || "");
  const [str_nombre_registro, setStr_nombre_registro] = useState(
    plantilla?.str_nombre_registro_np || "",
  );
  const [str_numero_registro, setStr_numero_registro] = useState(
    plantilla?.str_numero_registro_np || "",
  );
  const [str_numero_folio, setStr_numero_folio] = useState(
    plantilla?.str_numero_folio_np || "",
  );
  const [str_numero_tomo, setStr_numero_tomo] = useState(
    plantilla?.str_numero_tomo_np || "",
  );
  const [str_proveedores, setStr_proveedores] = useState(
    plantilla?.str_proveedores_np || "",
  );
  const [str_clientes, setStr_clientes] = useState(
    plantilla?.str_clientes_np || "",
  );

  const [respuestaOtrasFuentes, setRespuestaOtrasFuentes] = useState(
    plantilla?.respuestaotrasfuentes || "",
  );

  const [tipoFuenteIngreso, setTipoFuenteIngreso] = useState(
    plantilla?.fuente_ingresos_id || "",
  );

  const rangoIngresos = [
    {
      id: 502,
      str_nombre: "Desde 0,00 - Hasta 2.000,00",
    },
    {
      id: 512,
      str_nombre: "Desde 2.001,00 - Hasta 6.000,00",
    },
    {
      id: 513,
      str_nombre: "Desde 6.001,00 - Hasta 20.000,00",
    },
    {
      id: 514,
      str_nombre: "Desde 20.001,00 - Hasta 150.000,00",
    },
    {
      id: 515,
      str_nombre: "Desde 150.001,00 - Hasta 1.000.000,00",
    },
    {
      id: 516,
      str_nombre: "Desde 30.001,00 - Hasta 100.000,00",
    },
  ];

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
        // 1. Ejecutamos solo dos peticiones en paralelo
        const [resPaises, resMaestrosNuevos] = await Promise.all([
          axios.get(`${url}paises`, { headers }),
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              // Agrupamos todos los tipos en una sola cadena separada por comas
              str_tipo:
                "profesion_oficio,actividad_economica,tipo_ingresos,tipo_respuesta,categoria_especial",
            },
          }),
        ]);

        // 2. Extraemos los datos del objeto agrupado que devuelve el backend
        const {
          profesion_oficio,
          actividad_economica,
          tipo_ingresos,
          tipo_respuesta,
          categoria_especial,
        } = resMaestrosNuevos.data;

        // 3. Seteamos estados de Países
        setListaPaises(resPaises.data || []);
        setListaPaisesNegocio(resPaises.data || []);

        // 4. Seteamos estados de Datos Maestros
        setProfesiones(profesion_oficio || []);
        setActividades(actividad_economica || []);
        setFuentesIngresos(tipo_ingresos || []);
        setListaCategorias(categoria_especial || []);

        // 5. Reutilización de respuestas (Si/No)
        setRelacionDependencia(tipo_respuesta || []);
        setNegocioPropio(tipo_respuesta || []);
        setRespuestasFuentes(tipo_respuesta || []);
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

  //Para negocio
  useEffect(() => {
    if (pais_idNegocio) {
      axios
        .get(`${url}estadosPais`, {
          headers,
          params: {
            pais_id: pais_idNegocio,
          },
        })
        .then((res) => setListaEstadosNegocio(res.data))
        .catch((err) => console.log(err));
    }
  }, [pais_idNegocio]);

  useEffect(() => {
    if (estado_idNegocio) {
      axios
        .get(`${url}municipiosEstados`, {
          headers,
          params: { id_estado: estado_idNegocio },
        })
        .then((res) => setListaMunicipiosNegocio(res.data))
        .catch((err) => console.log(err));
    }
  }, [estado_idNegocio]);

  useEffect(() => {
    if (municipio_idNegocio) {
      axios
        .get(`${url}parroquiasMunicipios`, {
          headers,
          params: { id_municipio: municipio_idNegocio },
        })
        .then((res) => setListaParroquiasNegocio(res.data))
        .catch((err) => console.log(err));
    }
  }, [municipio_idNegocio]);

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

  const handleChangeCategoriaEspecial = (event) => {
    setCategoria_especial_id(event.target.value);
  };

  const handleChangeNegocioPropio = (event, child) => {
    setNegocio_propio_id(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaNegocio(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaNegocio(true);
      setFechaFundacion("");
      setNombreNegocio("");
      setRifNegocio("");
      setPais_idNegocio("");
      setEstado_idNegocio("");
      setMunicipio_idNegocio("");
      setParroquia_idNegocio("");
      setStrDireccionNegocio("");
      setStrTelefonoNegocio("");
      setMonto_ingreso_mensualNegocio("");
      setRamoNegocio("");
      setStr_nombre_registro("");
      setStr_numero_registro("");
      setStr_numero_folio("");
      setStr_numero_tomo("");
      setStr_proveedores("");
      setStr_clientes("");
    }
  };

  const handleChangeTipoProfesion = (event) => {
    setTipoProfesion(event.target.value);
  };

  const handleChangeTipoIngresos = (event) => {
    setTipoFuenteIngreso(event.target.value);
  };

  const handleChangeActividadEconomica = (event) => {
    setActividad_economica_id(event.target.value);
  };

  const handleChangerespuestaOtrasFuentes = (event, child) => {
    setRespuestaOtrasFuentes(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaOtrasFuentes(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaOtrasFuentes(true);
      setTipoFuenteIngreso("");
      setstrOtroMontoIngresoMensual("");
    }
  };

  const handleChangeDependencia = (event, child) => {
    setDependencia_id(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaDependencia(false);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaDependencia(true);
      setFechaIngreso("");
      setNombreEmpresa("");
      setRifEmpresa("");
      setPais_id("");
      setEstado_id("");
      setMunicipio_id("");
      setParroquia_id("");
      setStrDireccion("");
      setStrTelefono("");
      setMonto_ingreso_mensual("");
      setCargo("");
      setRamo("");

      //console.log("deshabilito");
    }
  };

  const handleChangeRemuneracionDependencia = (event) => {
    setMonto_ingreso_mensual(event.target.value);
  };

  const handleChangeRemuneracionNegocio = (event) => {
    setMonto_ingreso_mensualNegocio(event.target.value);
  };

  const handleChangeRemuneracionOtrasFuentes = (event) => {
    setstrOtroMontoIngresoMensual(event.target.value);
  };

  const handleChangePais_idNegocio = async (event) => {
    setPais_idNegocio(event.target.value);

    const estados = await axios.get(`${url}estadosPais`, {
      headers,
      params: {
        pais_id: event.target.value,
      },
    });

    setEstado_idNegocio("");
    setMunicipio_idNegocio("");
    setParroquia_idNegocio("");

    setListaEstadosNegocio(estados.data);
    setListaMunicipiosNegocio([]);
    setListaParroquiasNegocio([]);
  };

  const handleChangeEstado_idNegocio = async (event) => {
    setEstado_idNegocio(event.target.value);

    const municipios = await axios.get(`${url}municipiosEstados`, {
      headers,
      params: {
        id_estado: event.target.value,
      },
    });

    setMunicipio_idNegocio("");
    setParroquia_idNegocio("");
    setListaMunicipiosNegocio(municipios.data);
    setListaParroquiasNegocio([]);
  };

  const handleChangeMunicipio_idNegocio = async (event) => {
    setMunicipio_idNegocio(event.target.value);

    const parroquias = await axios.get(`${url}parroquiasMunicipios`, {
      headers,
      params: {
        id_municipio: event.target.value,
      },
    });

    setParroquia_idNegocio("");
    setListaParroquiasNegocio(parroquias.data);
  };

  const handleChangeParroquia_idNegocio = (event) => {
    setParroquia_idNegocio(event.target.value);
  };

  const formatNumber = (value) => {
    if (!value) return "";
    // Eliminamos cualquier caracter que no sea número
    const number = value.replace(/\D/g, "");
    // Formateamos con separador de miles (punto en este ejemplo)
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatNumber = (value) => {
    // Elimina los separadores para guardar solo los números en el estado o enviar a la API
    return value.replace(/\./g, "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!tipoProfesion) {
      nuevosErrores.push("Profesion / Oficio.");
      isValid = false;
      setOpen(true);
    }

    /* if (!categoria_especial_id) {
      nuevosErrores.push("Categoría especial.");
      isValid = false;
      setOpen(true);
    } */

    if (!actividad_economica_id) {
      nuevosErrores.push("Actividad económica.");
      isValid = false;
      setOpen(true);
    }

    if (!str_actividad_economica_descripcion) {
      nuevosErrores.push("Actividad económica específica.");
      isValid = false;
      setOpen(true);
    }

    /*Para el relacion de dependencia*/
    if (!dependencia_id) {
      nuevosErrores.push("Relación dependencia.");
      isValid = false;
      setOpen(true);
    }

    const seleccionDependencia = relacionDependencia.find(
      (item) => item.id === dependencia_id,
    );

    const seleccionPais = listaPaises.find((item) => item.id === pais_id);

    const seleccionEstado = listaEstados.find(
      (item) => item.id_estado === estado_id,
    );

    if (seleccionDependencia) {
      if (seleccionDependencia.str_nombre == "SI") {
        if (!fechaIngreso) {
          nuevosErrores.push("Fecha ingreso.");
          isValid = false;
          setOpen(true);
        }

        if (!nombreEmpresa) {
          nuevosErrores.push("Nombre de la empresa.");
          isValid = false;
          setOpen(true);
        }

        /* if (!rifEmpresa) {
          nuevosErrores.push("RIF de la empresa.");
          isValid = false;
          setOpen(true);
        } */

        if (!pais_id) {
          nuevosErrores.push("País empresa.");
          isValid = false;
          setOpen(true);
        }

        if (seleccionPais) {
          if (seleccionPais.str_nombre == "Venezuela") {
            if (!estado_id) {
              nuevosErrores.push("Estado empresa.");
              isValid = false;
              setOpen(true);
            }

            if (seleccionEstado) {
              if (seleccionEstado.estado !== "Dependencias Federales") {
                if (!municipio_id) {
                  nuevosErrores.push("Municipio empresa.");
                  isValid = false;
                  setOpen(true);
                }

                if (!parroquia_id) {
                  nuevosErrores.push("Parroquia empresa.");
                  isValid = false;
                  setOpen(true);
                }
              }
            }
          }
        }

        if (!strDireccion) {
          nuevosErrores.push("Dirección de la Empresa.");
          isValid = false;
          setOpen(true);
        }

        if (str_telefono && !isValidPhoneNumber(str_telefono)) {
          nuevosErrores.push("Formato de teléfono de la empresa inválido.");
          isValid = false;
          setOpen(true);
        }

        /* if (!str_telefono) {
          nuevosErrores.push("Teléfono de la empresa.");
          isValid = false;
          setOpen(true);
        } */

        if (!monto_ingreso_mensual) {
          nuevosErrores.push("Remuneración de la empresa.");
          isValid = false;
          setOpen(true);
        }

        if (!cargo) {
          nuevosErrores.push("Cargo que ocupa.");
          isValid = false;
          setOpen(true);
        }

        if (!ramo) {
          nuevosErrores.push("Ramo de la empresa.");
          isValid = false;
          setOpen(true);
        }
      }
    }

    /*Para el negocio*/
    if (!negocio_propio_id) {
      nuevosErrores.push("Negocio propio.");
      isValid = false;
      setOpen(true);
    }

    const seleccionNegocioPropio = negocioPropio.find(
      (item) => item.id === negocio_propio_id,
    );

    const seleccionPaisNegocio = listaPaisesNegocio.find(
      (item) => item.id === pais_idNegocio,
    );

    const seleccionEstadoNegocio = listaEstadosNegocio.find(
      (item) => item.id_estado === estado_idNegocio,
    );

    if (seleccionNegocioPropio) {
      if (seleccionNegocioPropio.str_nombre == "SI") {
        if (!fechaFundacion) {
          nuevosErrores.push("Fecha constitución.");
          isValid = false;
          setOpen(true);
        }

        if (!nombreNegocio) {
          nuevosErrores.push("Nombre del negocio.");
          isValid = false;
          setOpen(true);
        }

        if (!rifNegocio) {
          nuevosErrores.push("RIF del negocio.");
          isValid = false;
          setOpen(true);
        }

        if (!pais_idNegocio) {
          nuevosErrores.push("País negocio.");
          isValid = false;
          setOpen(true);
        }

        if (seleccionPaisNegocio) {
          if (seleccionPaisNegocio.str_nombre == "Venezuela") {
            if (!estado_idNegocio) {
              nuevosErrores.push("Estado negocio.");
              isValid = false;
              setOpen(true);
            }

            if (seleccionEstadoNegocio) {
              if (seleccionEstadoNegocio.estado !== "Dependencias Federales") {
                if (!municipio_idNegocio) {
                  nuevosErrores.push("Municipio negocio.");
                  isValid = false;
                  setOpen(true);
                }

                if (!parroquia_idNegocio) {
                  nuevosErrores.push("Parroquia negocio.");
                  isValid = false;
                  setOpen(true);
                }
              }
            }
          }
        }

        if (!strDireccionNegocio) {
          nuevosErrores.push("Dirección del negocio.");
          isValid = false;
          setOpen(true);
        }

        if (str_telefonoNegocio && !isValidPhoneNumber(str_telefonoNegocio)) {
          nuevosErrores.push("Formato de teléfono del negocio inválido.");
          isValid = false;
          setOpen(true);
        }

        if (!str_telefonoNegocio) {
          nuevosErrores.push("Teléfono del negocio.");
          isValid = false;
          setOpen(true);
        }

        if (!monto_ingreso_mensualNegocio) {
          nuevosErrores.push("Remuneración del negocio.");
          isValid = false;
          setOpen(true);
        }

        if (!ramoNegocio) {
          nuevosErrores.push("Ramo del negocio.");
          isValid = false;
          setOpen(true);
        }
      }
    }

    /*Para otras fuentes de ingresos*/
    if (!respuestaOtrasFuentes) {
      nuevosErrores.push("Otras fuentes de ingresos.");
      isValid = false;
      setOpen(true);
    }

    const seleccionOtrasFuentes = respuestasFuentes.find(
      (item) => item.id === respuestaOtrasFuentes,
    );

    if (seleccionOtrasFuentes) {
      if (seleccionOtrasFuentes.str_nombre == "SI") {
        if (!tipoFuenteIngreso) {
          nuevosErrores.push("Actividad generadora de ingresos.");
          isValid = false;
          setOpen(true);
        }

        if (!strOtroMontoIngresoMensual) {
          nuevosErrores.push(
            "Ingreso mensual de actividad generadora de ingresos.",
          );
          isValid = false;
          setOpen(true);
        }
      }
    }

    if (
      dependencia_id == 22 &&
      negocio_propio_id == 22 &&
      respuestaOtrasFuentes == 22
    ) {
      nuevosErrores.push(
        "Debe seleccionar al menos una fuente de ingresos: Relación laboral, Negocio propio u Otras fuentes de ingresos.",
      );
      isValid = false;
      setOpen(true);
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setIsLoading(true); // Inicia el loading

      const datosContacto = {
        //ficha:
        tipoProfesion,
        actividad_economica_id,
        str_actividad_economica_descripcion,
        categoria_especial_id,
        tipoFuenteIngreso,
        //depedencia:
        fechaIngreso,
        nombreEmpresa,
        rifEmpresa,
        str_telefono,
        monto_ingreso_mensual,
        cargo,
        ramo,
        pais_id,
        estado_id,
        municipio_id,
        parroquia_id,
        strDireccion,
        //negocio:
        fechaFundacion,
        nombreNegocio,
        rifNegocio,
        str_telefonoNegocio,
        monto_ingreso_mensualNegocio,
        ramoNegocio,
        pais_idNegocio,
        estado_idNegocio,
        municipio_idNegocio,
        parroquia_idNegocio,
        strDireccionNegocio,
        str_nombre_registro,
        str_numero_registro,
        str_numero_folio,
        str_numero_tomo,
        str_proveedores,
        str_clientes,
        bol_seccion_6: true,
        dependencia_id,
        negocio_propio_id,
        respuestaOtrasFuentes,
        usuario_id: usuarioId,
        strOtroMontoIngresoMensual,
      };

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));
      // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
      const [respuesta] = await Promise.all([
        axios.post(`${url}fichas/actividadEconomica`, datosContacto, {
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
      console.log(
        "Error al guardar documento:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false); // Finaliza el loading
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Profesion / Oficio</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipoProfesion"
                    name="tipoProfesion"
                    value={profesiones.length > 0 ? tipoProfesion : ""}
                    onChange={handleChangeTipoProfesion}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {profesiones.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Actividad económica</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="actividad_economica_id"
                    name="actividad_economica_id"
                    value={actividades.length > 0 ? actividad_economica_id : ""}
                    onChange={handleChangeActividadEconomica}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {actividades.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_actividad_economica_descripcion"
                    name="str_actividad_economica_descripcion"
                    label="Actividad económica específica"
                    placeholder="Ej: trabajo independiente, empleado"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_actividad_economica_descripcion}
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
                        setStr_actividad_economica_descripcion(value);
                      }
                    }}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 items-center justify-center">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Categoría especial</InputLabel>
                  <Select
                    //disabled={deshabilitaDependencia}
                    labelId="tipo-label"
                    id="categoria_especial_id"
                    name="categoria_especial_id"
                    value={
                      listaCategorias.length > 0 ? categoria_especial_id : ""
                    }
                    onChange={handleChangeCategoriaEspecial}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaCategorias.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="p-4">Relación Laboral</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Relación laboral</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="dependencia_id"
                    name="dependencia_id"
                    value={relacionDependencia.length > 0 ? dependencia_id : ""}
                    onChange={handleChangeDependencia}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {relacionDependencia.map((option) => (
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
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    label="Fecha ingreso"
                    format="DD-MM-YYYY"
                    // Deshabilita cualquier fecha posterior a hoy
                    maxDate={dayjs()}
                    value={fechaIngreso ? dayjs(fechaIngreso) : null}
                    onChange={(newValue) => {
                      // Validamos adicionalmente antes de guardar (por si escriben manualmente)
                      if (
                        newValue &&
                        newValue.isValid() &&
                        !newValue.isAfter(dayjs(), "day")
                      ) {
                        setFechaIngreso(newValue.format("YYYY-MM-DD"));
                      } else if (!newValue) {
                        setFechaIngreso(null);
                      }
                    }}
                    slotProps={{
                      textField: {
                        id: "fechaIngreso",
                        name: "fechaIngreso",
                        required: true,
                        fullWidth: true,

                        // 1. Bloquea el teclado
                        readOnly: true,
                        // 2. Refuerza que no se pueda escribir en el input interno
                        inputProps: {
                          readOnly: true,
                        },
                        // 3. Evita que el usuario borre con la tecla 'Backspace' o 'Delete'
                        onKeyDown: (e) => {
                          e.preventDefault();
                        },
                        sx: {
                          "& .MuiInputBase-input": {
                            cursor: "pointer", // Indica que es clickable
                          },
                        },

                        // Opcional: muestra un mensaje de error si la fecha es inválida
                        //helperText: "No puede ser una fecha futura",
                      },
                    }}
                  />
                </LocalizationProvider>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    label="Nombre de la empresa"
                    placeholder="Nombre de la empresa"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={nombreEmpresa}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que no supere los 50 caracteres
                      if (value.length <= 50) {
                        setNombreEmpresa(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  sx={{ minWidth: 200 }}
                  fullWidth
                >
                  <TextField
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="rifEmpresa"
                    name="rifEmpresa"
                    label="RIF"
                    placeholder="Ej: J, G o V números"
                    //required
                    value={rifEmpresa}
                    //helperText="Ej: J, G o V seguido de números"
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();

                      // 1. Evitar que escriban si el primer caracter no es J, G o V
                      if (value.length === 1 && !/^[JGV]/.test(value)) {
                        return;
                      }

                      // 2. Limpiar caracteres no permitidos (solo letras iniciales y números)
                      // Removemos todo lo que no sea la letra inicial permitida o dígitos
                      const letra = value.charAt(0);
                      const numeros = value.slice(1).replace(/\D/g, ""); // Solo dígitos del resto

                      // 3. Construir la máscara: Letra - 8 dígitos - 1 dígito
                      let masked = "";
                      if (letra) masked += letra;
                      if (numeros.length > 0) {
                        masked += "-" + numeros.substring(0, 8);
                      }
                      if (numeros.length > 8) {
                        masked += "-" + numeros.substring(8, 9);
                      }

                      setRifEmpresa(masked);
                    }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <PhoneInput
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    international
                    defaultCountry="VE"
                    value={str_telefono || ""}
                    onChange={setStrTelefono}
                    inputComponent={MUIInput}
                    label="Telefono de la empresa"
                    placeholder="Ingrese el teléfono de la empresa"
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
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="monto_ingreso_mensual"
                    name="monto_ingreso_mensual"
                    label="Remuneración (En dólares)"
                    placeholder="Ej: 1000"
                    required
                    fullWidth
                    // Mostramos el valor formateado asegurando que sea string
                    value={formatNumber(
                      monto_ingreso_mensual?.toString() || "",
                    )}
                    inputProps={{
                      inputMode: "numeric", // Muestra teclado numérico en móviles
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      const cleanValue = value.replace(/\D/g, ""); // Solo números

                      // Limitamos a 9 dígitos (ej: 999.999.999) para que no rompa el diseño
                      if (cleanValue.length <= 8) {
                        setMonto_ingreso_mensual(cleanValue); // Guardamos solo los números
                      }
                    }}
                  />
                </FormControl>

                {/* <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Remuneración (En dólares)
                  </InputLabel>
                  <Select
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    labelId="tipo-label"
                    id="monto_ingreso_mensual"
                    name="monto_ingreso_mensual"
                    value={monto_ingreso_mensual}
                    onChange={handleChangeRemuneracionDependencia}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>

                    {rangoIngresos.map((option) => (
                      <MenuItem key={option.id} value={option.str_nombre}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="cargo"
                    name="cargo"
                    label="Cargo que ocupa"
                    placeholder="Cargo que ocupa"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={cargo}
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
                        setCargo(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="ramo"
                    name="ramo"
                    label="Ramo de la empresa"
                    placeholder="Ramo de la empresa"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={ramo}
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
                        setRamo(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">País</InputLabel>
                  <Select
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
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
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
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
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
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
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
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

                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    disabled={
                      dependencia_id == 21 ? false : deshabilitaDependencia
                    }
                    id="strDireccion"
                    name="strDireccion"
                    minRows={3}
                    maxRows={6}
                    value={strDireccion}
                    label="Dirección"
                    placeholder="Dirección (Avenida, Calle, Edificio/Casa, Nro. Piso, APTO.)"
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
                      setStrDireccion(valueUpper);
                    }}
                    // Ajuste dinámico de hover para ambos modos
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

              <div className="p-4">Negocio Propio</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Negocio propio</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="negocio_propio_id"
                    name="negocio_propio_id"
                    value={negocioPropio.length > 0 ? negocio_propio_id : ""}
                    onChange={handleChangeNegocioPropio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {negocioPropio.map((option) => (
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
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    label="Fecha constitución"
                    format="DD-MM-YYYY"
                    // Deshabilita cualquier fecha posterior a hoy
                    maxDate={dayjs()}
                    value={fechaFundacion ? dayjs(fechaFundacion) : null}
                    onChange={(newValue) => {
                      // Validamos adicionalmente antes de guardar (por si escriben manualmente)
                      if (
                        newValue &&
                        newValue.isValid() &&
                        !newValue.isAfter(dayjs(), "day")
                      ) {
                        setFechaFundacion(newValue.format("YYYY-MM-DD"));
                      } else if (!newValue) {
                        setFechaFundacion(null);
                      }
                    }}
                    slotProps={{
                      textField: {
                        id: "fechaFundacion",
                        name: "fechaFundacion",
                        required: true,
                        fullWidth: true,

                        // 1. Bloquea el teclado
                        readOnly: true,
                        // 2. Refuerza que no se pueda escribir en el input interno
                        inputProps: {
                          readOnly: true,
                        },
                        // 3. Evita que el usuario borre con la tecla 'Backspace' o 'Delete'
                        onKeyDown: (e) => {
                          e.preventDefault();
                        },
                        sx: {
                          "& .MuiInputBase-input": {
                            cursor: "pointer", // Indica que es clickable
                          },
                        },

                        // Opcional: muestra un mensaje de error si la fecha es inválida
                        //helperText: "No puede ser una fecha futura",
                      },
                    }}
                  />
                </LocalizationProvider>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="nombreNegocio"
                    name="nombreNegocio"
                    label="Nombre del negocio"
                    placeholder="Nombre del negocio"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={nombreNegocio}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();

                      // Eliminamos el Regex. Ahora solo validamos el largo.
                      if (value.length <= 50) {
                        setNombreNegocio(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  sx={{ minWidth: 200 }}
                  fullWidth
                >
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="rifNegocio"
                    name="rifNegocio"
                    label="RIF"
                    placeholder="Ej: J, G o V números"
                    required
                    value={rifNegocio}
                    //helperText="Ej: J, G o V seguido de números"
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();

                      // 1. Evitar que escriban si el primer caracter no es J, G o V
                      if (value.length === 1 && !/^[JGV]/.test(value)) {
                        return;
                      }

                      // 2. Limpiar caracteres no permitidos (solo letras iniciales y números)
                      // Removemos todo lo que no sea la letra inicial permitida o dígitos
                      const letra = value.charAt(0);
                      const numeros = value.slice(1).replace(/\D/g, ""); // Solo dígitos del resto

                      // 3. Construir la máscara: Letra - 8 dígitos - 1 dígito
                      let masked = "";
                      if (letra) masked += letra;
                      if (numeros.length > 0) {
                        masked += "-" + numeros.substring(0, 8);
                      }
                      if (numeros.length > 8) {
                        masked += "-" + numeros.substring(8, 9);
                      }

                      setRifNegocio(masked);
                    }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <PhoneInput
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    international
                    defaultCountry="VE"
                    value={str_telefonoNegocio || ""}
                    onChange={setStrTelefonoNegocio}
                    inputComponent={MUIInput}
                    label="Telefono del negocio"
                    placeholder="Teléfono del negocio"
                    numberInputProps={{
                      maxLength: 17,
                    }}
                    // Ponemos el campo en rojo si hay algo escrito y no es válido
                    error={
                      str_telefonoNegocio
                        ? !isValidPhoneNumber(str_telefonoNegocio)
                        : false
                    }
                    // Mostramos el mensaje solo si hay un error de validación
                    helperText={
                      str_telefonoNegocio &&
                        !isValidPhoneNumber(str_telefonoNegocio)
                        ? "Formato de número inválido (Ej: +58 212 1234567)"
                        : ""
                    }
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="monto_ingreso_mensualNegocio"
                    name="monto_ingreso_mensualNegocio"
                    label="Remuneración (En dólares)"
                    placeholder="Ej: 1000"
                    required
                    fullWidth
                    // Mostramos el valor formateado
                    value={formatNumber(monto_ingreso_mensualNegocio)}
                    inputProps={{
                      inputMode: "numeric", // Muestra teclado numérico en móviles
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      const cleanValue = value.replace(/\D/g, ""); // Solo números

                      // Limitamos a 9 dígitos (ej: 999.999.999) para que no rompa el diseño
                      if (cleanValue.length <= 8) {
                        setMonto_ingreso_mensualNegocio(cleanValue); // Guardamos solo los números
                      }
                    }}
                  />
                </FormControl>

                {/* <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Remuneración (En dólares)
                  </InputLabel>
                  <Select
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    labelId="tipo-label"
                    id="monto_ingreso_mensualNegocio"
                    name="monto_ingreso_mensualNegocio"
                    value={monto_ingreso_mensualNegocio}
                    onChange={handleChangeRemuneracionNegocio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>

                    {rangoIngresos.map((option) => (
                      <MenuItem key={option.id} value={option.str_nombre}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="ramoNegocio"
                    name="ramoNegocio"
                    label="Ramo del negocio"
                    placeholder="Ramo del negocio"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={ramoNegocio}
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
                        setRamoNegocio(value);
                      }
                    }}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center mt-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">País</InputLabel>
                  <Select
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    labelId="tipo-label"
                    id="pais_idNegocio"
                    name="pais_idNegocio"
                    value={listaPaisesNegocio.length > 0 ? pais_idNegocio : ""}
                    onChange={handleChangePais_idNegocio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaPaisesNegocio.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Estado</InputLabel>
                  <Select
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    labelId="tipo-label"
                    id="estado_idNegocio"
                    name="estado_idNegocio"
                    value={
                      listaEstadosNegocio.length > 0 ? estado_idNegocio : ""
                    }
                    onChange={handleChangeEstado_idNegocio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaEstadosNegocio.map((option) => (
                      <MenuItem key={option.id_estado} value={option.id_estado}>
                        {option.estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Municipio</InputLabel>
                  <Select
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    labelId="tipo-label"
                    id="municipio_idNegocio"
                    name="municipio_idNegocio"
                    value={
                      listaMunicipiosNegocio.length > 0
                        ? municipio_idNegocio
                        : ""
                    }
                    onChange={handleChangeMunicipio_idNegocio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaMunicipiosNegocio.map((option) => (
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
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    labelId="tipo-label"
                    id="parroquia_idNegocio"
                    name="parroquia_idNegocio"
                    value={
                      listaParroquiasNegocio.length > 0
                        ? parroquia_idNegocio
                        : ""
                    }
                    onChange={handleChangeParroquia_idNegocio}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {listaParroquiasNegocio.map((option) => (
                      <MenuItem
                        key={option.id_parroquia}
                        value={option.id_parroquia}
                      >
                        {option.parroquia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="strDireccionNegocio"
                    name="strDireccionNegocio"
                    minRows={3}
                    maxRows={6}
                    value={strDireccionNegocio}
                    label="Dirección"
                    placeholder="Dirección (Avenida, Calle, Edificio/Casa, Nro. Piso, APTO.)"
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
                      setStrDireccionNegocio(valueUpper);
                    }}
                    // Ajuste dinámico de hover para ambos modos
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center mt-4">
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_nombre_registro"
                    name="str_nombre_registro"
                    label="Nombre del registro"
                    placeholder="Nombre del registro"
                    required
                    fullWidth
                    value={str_nombre_registro}
                    inputProps={{
                      maxLength: 50,
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();

                      // Eliminamos el Regex. Ahora solo validamos el largo.
                      if (value.length <= 50) {
                        setStr_nombre_registro(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_numero_registro"
                    name="str_numero_registro"
                    label="Número del registro"
                    placeholder="Número del registro"
                    required
                    fullWidth
                    // Mostramos el valor formateado
                    //value={formatNumber(str_numero_registro)}
                    value={str_numero_registro}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 15, // Evita que se escriba más de 8 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Validamos: que sean solo números Y que el largo sea máximo 8
                      if (/^\d*$/.test(value) && value.length <= 15) {
                        setStr_numero_registro(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_numero_folio"
                    name="str_numero_folio"
                    label="Número del folio"
                    placeholder="Número de folio"
                    required
                    fullWidth
                    // Mostramos el valor formateado
                    //value={formatNumber(str_numero_registro)}
                    value={str_numero_folio}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 15, // Evita que se escriba más de 8 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Validamos: que sean solo números Y que el largo sea máximo 8
                      if (/^\d*$/.test(value) && value.length <= 15) {
                        setStr_numero_folio(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_numero_tomo"
                    name="str_numero_tomo"
                    label="Número del tomo"
                    placeholder="Número de tomo"
                    required
                    fullWidth
                    // Mostramos el valor formateado
                    //value={formatNumber(str_numero_registro)}
                    value={str_numero_tomo}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 15, // Evita que se escriba más de 8 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Validamos: que sean solo números Y que el largo sea máximo 8
                      if (/^\d*$/.test(value) && value.length <= 15) {
                        setStr_numero_tomo(value);
                      }
                    }}
                  />
                </FormControl>

                <div className="md:col-span-2 px-2">
                  <TextareaAutosize
                    required
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_proveedores"
                    name="str_proveedores"
                    minRows={3}
                    maxRows={6}
                    value={str_proveedores}
                    label="Principales proveedores"
                    placeholder="Principales proveedores"
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
                      setStr_proveedores(valueUpper);
                    }}
                    // Ajuste dinámico de hover para ambos modos
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
                    disabled={
                      negocio_propio_id == 21 ? false : deshabilitaNegocio
                    }
                    id="str_clientes"
                    name="str_clientes"
                    minRows={3}
                    maxRows={6}
                    value={str_clientes}
                    label="Principales clientes"
                    placeholder="Principales clientes"
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
                      setStr_clientes(valueUpper);
                    }}
                    // Ajuste dinámico de hover para ambos modos
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

              <div className="p-4">Otros Ingresos</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Otras fuentes de ingresos
                  </InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="respuestaOtrasFuentes"
                    name="respuestaOtrasFuentes"
                    value={
                      respuestasFuentes.length > 0 ? respuestaOtrasFuentes : ""
                    }
                    onChange={handleChangerespuestaOtrasFuentes}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {respuestasFuentes.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Actividad generadora de ingresos
                  </InputLabel>
                  <Select
                    disabled={
                      respuestaOtrasFuentes == 21
                        ? false
                        : deshabilitaOtrasFuentes
                    }
                    labelId="tipo-label"
                    id="fuente_ingresos_id"
                    name="fuente_ingresos_id"
                    value={fuentesIngresos.length > 0 ? tipoFuenteIngreso : ""}
                    onChange={handleChangeTipoIngresos}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {fuentesIngresos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    disabled={
                      respuestaOtrasFuentes == 21
                        ? false
                        : deshabilitaOtrasFuentes
                    }
                    id="otro_monto_ingreso_mensual"
                    name="otro_monto_ingreso_mensual"
                    label="Remuneración (En dólares)"
                    placeholder="Ej: 1000"
                    required
                    fullWidth
                    // Mostramos el valor formateado
                    value={formatNumber(strOtroMontoIngresoMensual)}
                    inputProps={{
                      inputMode: "numeric", // Muestra teclado numérico en móviles
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      const cleanValue = value.replace(/\D/g, ""); // Solo números

                      // Limitamos a 9 dígitos (ej: 999.999.999) para que no rompa el diseño
                      if (cleanValue.length <= 8) {
                        setstrOtroMontoIngresoMensual(cleanValue); // Guardamos solo los números
                      }
                    }}
                  />
                </FormControl>

                {/* <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Remuneración</InputLabel>
                  <Select
                    disabled={
                      respuestaOtrasFuentes == 21
                        ? false
                        : deshabilitaOtrasFuentes
                    }
                    labelId="tipo-label"
                    id="otro_monto_ingreso_mensual"
                    name="otro_monto_ingreso_mensual"
                    value={strOtroMontoIngresoMensual}
                    onChange={handleChangeRemuneracionOtrasFuentes}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>

                    {rangoIngresos.map((option) => (
                      <MenuItem key={option.id} value={option.str_nombre}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
              </div>

              {/* 1. CASO ADMIN: Si existe el ID, se muestra este y se ignora lo de abajo */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR ACT. ECONÓMICA
                  </Button>
                </Stack>
              )}

              {/* 2. CASO CLIENTE: Solo si NO es admin Y la sección no está completada */}
              {usuarioBoId == null &&
                plantilla?.bolDevuelta == true &&
                plantilla?.seccionCompletada == true && (
                  <Stack
                    spacing={2}
                    direction="row"
                    className="justify-center pt-6"
                  >
                    <Button type="submit" variant="contained" color="secondary">
                      GUARDAR ACT. ECONÓMICA
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
                      GUARDAR ACT. ECONÓMICA
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

export default ActividadEconomica;
