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
import Chip from "@mui/material/Chip";

import { persistor } from "../../../store/store"; // Ajusta la ruta a tu archivo store

import {
  resetPlantilla,
  setMuiMode,
  setSeccionesMasivo,
} from "../../../store/plantillaSlice";
//import { setUsuarioId } from "../../../store/plantillaSlice";

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

const DatosPersonalesCliente = ({ expandir }) => {
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
  const [deshabilitaConyuge, setDeshabilitaConyuge] = useState(true);
  const [deshabilitaFileRif, setDeshabilitaFileRif] = useState(false);
  const [deshabilitaRepresentante, setDeshabilitaRepresentante] =
    useState(true);

  const [muestraRepresentante, setMuestraRepresentante] = useState(false);

  const [respuestaConyuge, setRespuestaConyuge] = useState(
    plantilla?.cedula === null
      ? ""
      : plantilla?.cedula !== null && plantilla?.cedulaconyugue === null
        ? 22
        : plantilla?.cedula !== null && plantilla?.cedulaconyugue !== null
          ? 21
          : 22,
  );

  const [muestraConyugue, setMuestraConyugue] = useState(false);

  // Efecto para sincronizar los estados
  useEffect(() => {
    if (respuestaConyuge === 21) {
      setMuestraConyugue(true);
    } else {
      setMuestraConyugue(false);
    }
  }, [respuestaConyuge]); // Se ejecuta cada vez que cambia respuestaConyuge

  const [duplicada, setDuplicada] = useState(false);

  // Datos del cliente:
  const [archivo, setArchivo] = useState(null); //Cedula
  const [archivo2, setArchivo2] = useState(null); //RIF
  const [pasaporte, setPasaporte] = useState(null); //Pasaporte
  const [partidaNacimiento, setPartidaNacimiento] = useState(null); //Partida de Nacimiento
  const [referenciaBancaria, setReferenciaBancaria] = useState(null); //Referencia Bancaria
  const [constanciaTrabajoRep, setConstanciaTrabajoRep] = useState(null); //Constancia de Trabajo del Representante
  const [cartaAutorizacion, setCartaAutorizacion] = useState(null); //Carta de Autorización

  /* const [nombreArchivoCedula, setNombreArchivoCedula] = useState(
    plantilla?.ruta_cedula
      ? decodeURIComponent(escape(plantilla?.ruta_cedula)).split(
          "/var/www/uploads/",
        )[1]
      : "",
  ); */

  const [nombreArchivoCedula, setNombreArchivoCedula] = useState(() => {
    const ruta = plantilla?.ruta_cedula;
    if (!ruta) return "";

    // Extraemos el nombre del archivo después de la ruta base
    const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

    try {
      // Intentamos decodificar de forma segura
      return decodeURIComponent(nombreExtraido);
    } catch (e) {
      // Si la decodificación falla (URI malformed), devolvemos el nombre sin procesar
      return nombreExtraido;
    }
  });

  /* const [nombreArchivoRif, setNombreArchivoRif] = useState(
    plantilla?.ruta_rif
      ? decodeURIComponent(escape(plantilla?.ruta_rif)).split(
          "/var/www/uploads/",
        )[1]
      : "",
  ); */

  const [nombreArchivoRif, setNombreArchivoRif] = useState(() => {
    const ruta = plantilla?.ruta_rif;
    if (!ruta) return "";

    const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

    try {
      // Si la ruta viene codificada, decodifícala, si no, retorna el string original
      return decodeURIComponent(nombreExtraido);
    } catch (e) {
      // Si falla (como es tu caso actual), devuelve el nombre tal cual sin decodificar
      return nombreExtraido;
    }
  });

  /* const [nombreArchivoPasaporte, setNombreArchivoPasaporte] = useState(
    plantilla?.ruta_pasaporte
      ? decodeURIComponent(escape(plantilla?.ruta_pasaporte)).split(
          "/var/www/uploads/",
        )[1]
      : "",
  ); */

  const [nombreArchivoPasaporte, setNombreArchivoPasaporte] = useState(() => {
    const ruta = plantilla?.ruta_pasaporte;
    if (!ruta) return "";

    // Extraemos el nombre del archivo después de la ruta base
    const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

    try {
      // Intentamos decodificar por si el nombre contiene caracteres codificados
      return decodeURIComponent(nombreExtraido);
    } catch (e) {
      // Si falla (por caracteres malformados), retornamos el nombre original sin decodificar
      return nombreExtraido;
    }
  });

  const [nombreArchivoPartidaNacimiento, setNombreArchivoPartidaNacimiento] =
    useState(() => {
      const ruta = plantilla?.ruta_partida_nacimiento;
      if (!ruta) return "";

      // Extraemos el nombre del archivo después de la ruta base
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

      try {
        // Intentamos decodificar por si el nombre contiene caracteres codificados
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        // Si falla (por caracteres malformados), retornamos el nombre original sin decodificar
        return nombreExtraido;
      }
    });

  const [nombreArchivoReferenciaBancaria, setNombreArchivoReferenciaBancaria] =
    useState(() => {
      const ruta = plantilla?.ruta_referencia_bancaria;
      if (!ruta) return "";

      // Extraemos el nombre del archivo después de la ruta base
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

      try {
        // Intentamos decodificar por si el nombre contiene caracteres codificados
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        // Si falla (por caracteres malformados), retornamos el nombre original sin decodificar
        return nombreExtraido;
      }
    });

  const [
    nombreArchivoConstanciaTrabajoRepresentante,
    setNombreArchivoConstanciaTrabajoRepresentante,
  ] = useState(() => {
    const ruta = plantilla?.ruta_constancia_trabajo_representante;
    if (!ruta) return "";

    // Extraemos el nombre del archivo después de la ruta base
    const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

    try {
      // Intentamos decodificar por si el nombre contiene caracteres codificados
      return decodeURIComponent(nombreExtraido);
    } catch (e) {
      // Si falla (por caracteres malformados), retornamos el nombre original sin decodificar
      return nombreExtraido;
    }
  });

  const [nombreArchivoCartaAutorizacion, setNombreArchivoCartaAutorizacion] =
    useState(() => {
      const ruta = plantilla?.ruta_carta_autorizacion;
      if (!ruta) return "";

      // Extraemos el nombre del archivo después de la ruta base
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";

      try {
        // Intentamos decodificar por si el nombre contiene caracteres codificados
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        // Si falla (por caracteres malformados), retornamos el nombre original sin decodificar
        return nombreExtraido;
      }
    });

  const [str_cedula, setStrCedula] = useState(plantilla?.cedula || "");
  const [fecha_nacimiento, setFechaNacimiento] = useState(
    plantilla?.fechaNacimiento ? dayjs(plantilla.fechaNacimiento) : null,
  );
  const [str_primer_nombre, setStrPrimerNombre] = useState(
    plantilla?.primerNombre || "",
  );
  const [str_segundo_nombre, setStrSegundoNombre] = useState(
    plantilla?.segundoNombre || "",
  );
  const [str_primer_apellido, setStrPrimerApellido] = useState(
    plantilla?.primerApellido || "",
  );
  const [str_segundo_apellido, setStrSegundoApellido] = useState(
    plantilla?.segundoApellido || "",
  );
  const [tipoNacionalidad, setTipoNacionalidad] = useState(
    plantilla?.paisNacionalidadId || "",
  );
  const [tipoOtraNacionalidad, setTipoOtraNacionalidad] = useState(
    plantilla?.paisOtraNacionalidadId || "",
  );
  const [tipoGenero, setTipoGenero] = useState(plantilla?.sexoId || "");
  const [tipoCondicionVivienda, setTipoCondicionVivienda] = useState(
    plantilla?.tipoViviendaId || "",
  );
  const [tipoEstadoCivil, setTipoEstadoCivil] = useState(
    plantilla?.estadoCivilId || "",
  );
  const [tipoCargaFamiliar, setTipoCargaFamiliar] = useState(
    plantilla?.cargaFamiliarId || "",
  );
  const [str_lugar, setStrLugar] = useState(plantilla?.lugar || "");

  //Conyuge:
  const [str_cedula_conyuge, setStrCedulaConyuge] = useState(
    plantilla?.cedulaconyugue || "",
  );
  const [str_primer_nombre_conyuge, setStrPrimerNombreConyuge] = useState(
    plantilla?.nombreconyugue || "",
  );
  const [str_segundo_nombre_conyuge, setStrSegundoNombreConyuge] = useState(
    plantilla?.nombre2conyugue || "",
  );
  const [str_primer_apellido_conyuge, setStrPrimerApellidoConyuge] = useState(
    plantilla?.apellidoconyugue || "",
  );
  const [str_segundo_apellido_conyuge, setStrSegundoApellidoConyuge] = useState(
    plantilla?.apellido2conyugue || "",
  );
  const [tipoFuenteIngreso, setTipoFuenteIngreso] = useState(
    plantilla?.ingresosconyugue || "",
  );

  //Representante:

  const [archivoCedulaRepresentante, setArchivoCedulaRepresentante] =
    useState(null); //Cedula representante
  const [archivo2RifRepresentante, setArchivo2RifRepresentante] =
    useState(null); //RIF

  const [
    archivoConstanciaTrabajoRepresentante,
    setArchivoConstanciaTrabajoRepresentante,
  ] = useState(null); //Constancia de trabajo representante

  const [archivoCartaAutorizacion, setArchivoCartaAutorizacion] =
    useState(null); //Carta de autorización representante

  const [archivoPartidaNacimiento, setArchivoPartidaNacimiento] =
    useState(null); //Partida de nacimiento representante

  const [archivoReferenciaBancaria, setArchivoReferenciaBancaria] =
    useState(null); //Referencia bancaria representante

  const [
    nombreArchivoCedulaRepresentante,
    setNombreArchivoCedulaRepresentante,
  ] = useState(() => {
    const ruta = plantilla?.ruta_cedula_representante;
    if (!ruta) return "";
    const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";
    try {
      return decodeURIComponent(nombreExtraido);
    } catch (e) {
      return nombreExtraido;
    }
  });

  const [nombreArchivoRifRepresentante, setNombreArchivoRifRepresentante] =
    useState(() => {
      const ruta = plantilla?.ruta_rif_representante;
      if (!ruta) return "";
      const nombreExtraido = ruta.split("/var/www/uploads/")[1] || "";
      try {
        return decodeURIComponent(nombreExtraido);
      } catch (e) {
        return nombreExtraido;
      }
    });

  const [str_cedulaRepresentante, setStrCedulaRepresentante] = useState(
    plantilla?.cedularepresentante || "",
  );
  const [str_primer_nombreRepresentante, setStrPrimerNombreRepresentante] =
    useState(plantilla?.nombrerepresentante || "");
  const [str_segundo_nombre_representante, setStrSegundoNombreRepresentante] =
    useState(plantilla?.nombre2representante || "");

  const [str_primer_apellido_representante, setStrPrimerApellidoRepresentante] =
    useState(plantilla?.apellidorepresentante || "");

  const [
    str_segundo_apellido_representante,
    setStrSegundoApellidoRepresentante,
  ] = useState(plantilla?.apellido2representante || "");

  const [fecha_nacimiento_representante, setFechaNacimientoRepresentante] =
    useState(
      plantilla?.fechanacimientoresentante
        ? dayjs(plantilla.fechanacimientoresentante)
        : null,
    );

  const [tipoNacionalidadRepresentante, setTipoNacionalidadRepresentante] =
    useState(plantilla?.nacionalidadrepresentante || "");

  const [tipoGeneroRepresentante, setTipoGeneroRepresentante] = useState(
    plantilla?.genero_id || "",
  );

  const [str_celular_representante, setStrCelularRepresentante] = useState(
    plantilla?.celularresentante || "",
  );

  const [str_telefono_representante, setStrTelefonoRepresentante] = useState(
    plantilla?.telefonoresentante || "",
  );

  const [nacionalidades, setNacionalidades] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [condicionVivienda, setCondicionVivienda] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [cargasFamiliares, setCargasFamiliares] = useState([]);
  const [fuentesIngresos, setFuentesIngresos] = useState([]);
  const [generosRepresentante, setGenerosRepresentante] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [formErrors, setFormErrors] = useState(false);
  const [mensajesError, setMensajesError] = useState([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

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
        // 1. Solo dos peticiones en paralelo
        const [resNacionalidad, resMaestros] = await Promise.all([
          axios.get(`${url}nacionalidad`, { headers }),
          axios.get(`${url}datos_maestro`, {
            headers,
            params: {
              str_tipo:
                "tipo_genero,tipo_vivienda,tipo_estado_civil,tipo_respuesta,tipo_ingresos",
            },
          }),
        ]);

        // 2. Extraemos los datos del objeto agrupado que armamos en el backend
        const {
          tipo_genero,
          tipo_vivienda,
          tipo_estado_civil,
          tipo_respuesta,
          tipo_ingresos,
        } = resMaestros.data;

        // 3. Seteamos estados (Nota: resNacionalidad.data sigue siendo un array normal)
        setNacionalidades(resNacionalidad.data);
        setGeneros(tipo_genero || []);
        setCondicionVivienda(tipo_vivienda || []);
        setEstadosCiviles(tipo_estado_civil || []);
        setRespuestas(tipo_respuesta || []);
        setFuentesIngresos(tipo_ingresos || []);

        // Reutilización
        setCargasFamiliares(tipo_respuesta || []);
        setGenerosRepresentante(tipo_genero || []);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };

    fetchDatosMaestro();

    //Para desplegar el formulario del representante en caso de ser menor de edad:
    //console.log(dayjs(fecha_nacimiento) );

    const fechaISO = fecha_nacimiento; //"1962-06-19T04:30:00.000Z";

    // 1. Formatear a YYYY-MM-DD
    const fechaFormateada = new Date(fechaISO).toISOString().split("T")[0];

    // 2. Lógica para saber si es mayor de edad
    const esMayorDeEdad = (fechaNacimiento) => {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();

      // Ajuste si aún no ha cumplido años este año
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }

      return edad >= 18;
    };

    const resultadoEdad = esMayorDeEdad(fechaISO);

    //console.log(resultadoEdad);

    if (resultadoEdad == false) {
      setMuestraRepresentante(true);
    } else {
      setMuestraRepresentante(false);
    }
  }, []);

  const handleChangeTipoNacionalidad = (event) => {
    setTipoNacionalidad(event.target.value);
  };

  const handleChangeTipoOtraNacionalidad = (event) => {
    setTipoOtraNacionalidad(event.target.value);
  };

  const handleChangeTipoGenero = (event) => {
    setTipoGenero(event.target.value);
  };

  const handleChangeTipoVivienda = (event) => {
    setTipoCondicionVivienda(event.target.value);
  };

  const handleChangeTipoEstadoCivil = (event) => {
    setTipoEstadoCivil(event.target.value);
  };

  const handleChangeTipoCargaFamiliar = (event) => {
    setTipoCargaFamiliar(event.target.value);
  };

  const handleChangeTipoIngresos = (event) => {
    setTipoFuenteIngreso(event.target.value);
  };

  const handleChangetipoNacionalidadRepresentante = (event) => {
    setTipoNacionalidadRepresentante(event.target.value);
  };

  const handleChangetipoGeneroRepresentante = (event) => {
    setTipoGeneroRepresentante(event.target.value);
  };

  const handleChangerespuestaConyuge = (event, child) => {
    setRespuestaConyuge(event.target.value);

    const textoSeleccionado = child.props.children;

    if (textoSeleccionado == "SI") {
      setDeshabilitaConyuge(false);
      setMuestraConyugue(true);
    }

    if (textoSeleccionado == "NO") {
      setDeshabilitaConyuge(true);
      setMuestraConyugue(false);
      setStrCedulaConyuge("");
      setStrPrimerNombreConyuge("");
      setStrSegundoNombreConyuge("");
      setStrPrimerApellidoConyuge("");
      setStrSegundoApellidoConyuge("");
      setTipoFuenteIngreso("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const nuevosErrores = [];

    if (!str_cedula) {
      nuevosErrores.push("Cédula.");
      isValid = false;
      setOpen(true);
    }

    if (nombreArchivoCedula == "") {
      nuevosErrores.push("Adjunte su cédula.");
      isValid = false;
      setOpen(true);
    }

    if (!str_primer_nombre) {
      nuevosErrores.push("Primer nombre.");
      isValid = false;
      setOpen(true);
    }

    if (!str_primer_apellido) {
      nuevosErrores.push("Primer apellido.");
      isValid = false;
      setOpen(true);
    }

    // Validación de fecha de nacimiento (Cliente)
    const fechaNac = dayjs(fecha_nacimiento);
    const fechaActual = dayjs();

    if (!fecha_nacimiento || !fechaNac.isValid()) {
      nuevosErrores.push("Fecha de nacimiento.");
      isValid = false;
      setOpen(true);
    } else if (fechaNac.isAfter(fechaActual, "day")) {
      nuevosErrores.push(
        "La fecha de nacimiento no puede ser mayor a la fecha actual.",
      );
      isValid = false;
      setOpen(true);
    } else {
      // Cálculo de edad preciso
      const edad = fechaActual.diff(fechaNac, "year");

      if (edad < 18) {
        setDeshabilitaRepresentante(false);

        /************* Para el representante ******************/
        if (!str_cedulaRepresentante) {
          nuevosErrores.push("Cédula Representante.");
          isValid = false;
          setOpen(true);
        }

        if (!str_primer_nombreRepresentante) {
          nuevosErrores.push("Primer nombre representante.");
          isValid = false;
          setOpen(true);
        }

        if (!str_primer_apellido_representante) {
          nuevosErrores.push("Primer apellido representante.");
          isValid = false;
          setOpen(true);
        }

        const fechaNacRep = dayjs(fecha_nacimiento_representante);
        if (!fecha_nacimiento_representante || !fechaNacRep.isValid()) {
          nuevosErrores.push("Fecha de nacimiento representante.");
          isValid = false;
          setOpen(true);
        } else if (fechaNacRep.isAfter(fechaActual, "day")) {
          nuevosErrores.push(
            "La fecha de nacimiento del representante no puede ser futura.",
          );
          isValid = false;
          setOpen(true);
        } else {
          const edadRepresentante = fechaActual.diff(fechaNacRep, "year");
          if (edadRepresentante < 18) {
            nuevosErrores.push(
              "El representante legal debe ser mayor de 18 años.",
            );
            isValid = false;
            setOpen(true);
          }
        }

        if (!tipoNacionalidadRepresentante) {
          nuevosErrores.push("Nacionalidad representante.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoGeneroRepresentante) {
          nuevosErrores.push("Género representante.");
          isValid = false;
          setOpen(true);
        }

        if (!str_celular_representante) {
          nuevosErrores.push("Celular representante.");
          isValid = false;
          setOpen(true);
        }

        if (!str_telefono_representante) {
          nuevosErrores.push("Teléfono representante.");
          isValid = false;
          setOpen(true);
        }

        if (nombreArchivoCedulaRepresentante == "") {
          if (!archivoCedulaRepresentante) {
            nuevosErrores.push("Adjunte cédula representante.");
            isValid = false;
            setOpen(true);
          }
        }

        if (nombreArchivoRifRepresentante == "") {
          if (!archivo2RifRepresentante) {
            nuevosErrores.push("Adjunte RIF representante.");
            isValid = false;
            setOpen(true);
          }
        }

        if (nombreArchivoConstanciaTrabajoRepresentante == "") {
          if (!archivoConstanciaTrabajoRepresentante) {
            nuevosErrores.push("Adjunte constancia de trabajo representante.");
            isValid = false;
            setOpen(true);
          }
        }

        if (nombreArchivoCartaAutorizacion == "") {
          if (!archivoCartaAutorizacion) {
            nuevosErrores.push("Adjunte carta de autorización representante.");
            isValid = false;
            setOpen(true);
          }
        }

        if (nombreArchivoPartidaNacimiento == "") {
          if (!archivoPartidaNacimiento) {
            nuevosErrores.push("Adjunte partida de nacimiento.");
            isValid = false;
            setOpen(true);
          }
        }

        if (nombreArchivoReferenciaBancaria == "") {
          if (!archivoReferenciaBancaria) {
            nuevosErrores.push("Adjunte referencia bancaria.");
            isValid = false;
            setOpen(true);
          }
        }
      } else {
        // --- CASO: MAYOR DE EDAD ---

        if (nombreArchivoRif == "") {
          if (!archivo2) {
            nuevosErrores.push("Adjunte su RIF.");
            isValid = false;
            setOpen(true);
          }
        }

        if (!tipoCondicionVivienda) {
          nuevosErrores.push("Condición de la vivienda.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoEstadoCivil) {
          nuevosErrores.push("Estado civil.");
          isValid = false;
          setOpen(true);
        }

        if (!tipoCargaFamiliar) {
          nuevosErrores.push("Carga familiar.");
          isValid = false;
          setOpen(true);
        }

        if (!respuestaConyuge) {
          nuevosErrores.push("¿Tiene cónyuge?.");
          isValid = false;
          setOpen(true);
        }

        const seleccionConyuge = respuestas.find(
          (item) => item.id === respuestaConyuge,
        );

        if (seleccionConyuge?.str_nombre === "SI") {
          if (!str_cedula_conyuge) {
            nuevosErrores.push("Cédula del cónyuge.");
            isValid = false;
            setOpen(true);
          }

          if (!str_primer_nombre_conyuge) {
            nuevosErrores.push("Primer nombre del cónyuge.");
            isValid = false;
            setOpen(true);
          }

          if (!str_primer_apellido_conyuge) {
            nuevosErrores.push("Primer apellido del cónyuge.");
            isValid = false;
            setOpen(true);
          }

          if (!tipoFuenteIngreso) {
            nuevosErrores.push("Fuente de ingreso del cónyuge.");
            isValid = false;
            setOpen(true);
          }
        }
      }
    }

    if (!tipoNacionalidad) {
      nuevosErrores.push("Nacionalidad.");
      isValid = false;
      setOpen(true);
    }

    if (!tipoGenero) {
      nuevosErrores.push("Género.");
      isValid = false;
      setOpen(true);
    }

    if (!str_lugar) {
      nuevosErrores.push("Lugar de nacimiento.");
      isValid = false;
      setOpen(true);
    }

    setMensajesError(nuevosErrores);
    setFormErrors(!isValid);

    if (!isValid) return;

    try {
      setDuplicada(false);
      setIsLoading(true); // Inicia el estado de carga

      const formData = new FormData();
      // --- 1. ADJUNCIÓN DE ARCHIVOS ---
      if (archivo) {
        formData.append("archivo", archivo);
      }
      if (archivo2) {
        formData.append("archivo2", archivo2);
      }

      if (pasaporte) {
        formData.append("pasaporte", pasaporte);
      }

      if (archivoCedulaRepresentante) {
        formData.append(
          "archivoCedulaRepresentante",
          archivoCedulaRepresentante,
        );
      }

      if (archivo2RifRepresentante) {
        formData.append("archivo2RifRepresentante", archivo2RifRepresentante);
      }

      if (archivoCartaAutorizacion) {
        formData.append("archivoCartaAutorizacion", archivoCartaAutorizacion);
      }

      if (archivoConstanciaTrabajoRepresentante) {
        formData.append(
          "archivoConstanciaTrabajoRepresentante",
          archivoConstanciaTrabajoRepresentante,
        );
      }

      if (archivoPartidaNacimiento) {
        formData.append("archivoPartidaNacimiento", archivoPartidaNacimiento);
      }

      if (archivoReferenciaBancaria) {
        formData.append("archivoReferenciaBancaria", archivoReferenciaBancaria);
      }

      // --- 2. DATOS PERSONALES ---
      formData.append("str_cedula", str_cedula);
      formData.append("str_primer_nombre", str_primer_nombre);
      formData.append("str_segundo_nombre", str_segundo_nombre);
      formData.append("str_primer_apellido", str_primer_apellido);
      formData.append("str_segundo_apellido", str_segundo_apellido);

      // Formateo de fecha de nacimiento del cliente
      const fechaCliente =
        fecha_nacimiento && dayjs(fecha_nacimiento).isValid()
          ? dayjs(fecha_nacimiento).format("YYYY-MM-DD")
          : "";
      formData.append("fecha_nacimiento", fechaCliente);

      // --- 3. NACIONALIDAD Y VIVIENDA ---
      formData.append("tipoNacionalidad", tipoNacionalidad);
      formData.append("tipoOtraNacionalidad", tipoOtraNacionalidad);
      formData.append("tipoGenero", tipoGenero);
      formData.append("tipoCondicionVivienda", tipoCondicionVivienda);
      formData.append("tipoEstadoCivil", tipoEstadoCivil);
      formData.append("tipoCargaFamiliar", tipoCargaFamiliar);
      formData.append("str_lugar", str_lugar);

      // --- 4. DATOS DEL CÓNYUGE ---
      formData.append("str_cedula_conyuge", str_cedula_conyuge);
      formData.append("str_primer_nombre_conyuge", str_primer_nombre_conyuge);
      formData.append("str_segundo_nombre_conyuge", str_segundo_nombre_conyuge);
      formData.append(
        "str_primer_apellido_conyuge",
        str_primer_apellido_conyuge,
      );
      formData.append(
        "str_segundo_apellido_conyuge",
        str_segundo_apellido_conyuge,
      );
      formData.append("fuente_ingresos_id", tipoFuenteIngreso);

      // --- 5. DATOS DEL REPRESENTANTE ---
      formData.append("str_cedulaRepresentante", str_cedulaRepresentante);
      formData.append(
        "str_primer_nombreRepresentante",
        str_primer_nombreRepresentante,
      );
      formData.append(
        "str_segundo_nombre_representante",
        str_segundo_nombre_representante,
      );
      formData.append(
        "str_primer_apellido_representante",
        str_primer_apellido_representante,
      );
      formData.append(
        "str_segundo_apellido_representante",
        str_segundo_apellido_representante,
      );

      // Formateo de fecha del representante
      const fechaRep =
        fecha_nacimiento_representante &&
        dayjs(fecha_nacimiento_representante).isValid()
          ? dayjs(fecha_nacimiento_representante).format("YYYY-MM-DD")
          : "";
      formData.append("fecha_nacimiento_representante", fechaRep);

      formData.append("str_celular_representante", str_celular_representante);
      formData.append("str_telefono_representante", str_telefono_representante);
      formData.append(
        "tipoNacionalidadRepresentante",
        tipoNacionalidadRepresentante,
      );
      formData.append("tipoGeneroRepresentante", tipoGeneroRepresentante);
      formData.append("usuario_id", usuarioId);
      formData.append("bol_seccion_1", true);

      // Busco la cedula:
      const resultado = await axios.get(`${url}buscar_cedula_ficha`, {
        headers: { Authorization: `Bearer ${tokenApi}` },
        params: {
          cedula: str_cedula,
          _t: Date.now(), // Rompe el caché del navegador
        },
      });

      const bd_str_cedula = resultado.data.str_cedula;
      const bd_usuario_id = resultado.data.usuario_id;

      if (bd_usuario_id != usuarioId && bd_str_cedula == str_cedula) {
        setFormSuccess(true);
        setFormSuccessMessage("El número de pertenece al otro usuario");
        setDuplicada(true);
      } else {
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));
        const [respuesta] = await Promise.all([
          axios.post(`${url}fichas/upload`, formData, {
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
      }
    } catch (error) {
      console.error(
        "Error al guardar documento:",
        error.response?.data || error.message,
      );

      console.log(error);
      setFormSuccess(true);
      setFormSuccessMessage(error.response.data.error);
      setDuplicada(true);

      // Opcional: podrías poner un setFormError(true) aquí
    } finally {
      setIsLoading(false); // Apaga el spinner o loading
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
                {duplicada == false && (
                  <Lottie
                    animationData={SuccessForm}
                    loop={true}
                    style={{ width: "30px", height: "30px" }}
                  />
                )}

                <p
                  className={`text-2xl font-extralight ${duplicada ? "text-red-500" : "text-green-500"}`}
                >
                  {formSuccessMessage}
                </p>
              </div>

              <Lottie
                animationData={duplicada == true ? ErrorForm : FileUploaded}
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
              <div className="p-2">Datos del Cliente</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center mb-4">
                <div className="flex flex-col gap-1">
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Cédula
                    <VisuallyHiddenInput
                      required
                      id="archivo"
                      name="archivo"
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
                        setNombreArchivoCedula(file.name);
                        setArchivo(file); // <-- Cambiado de e.target.files a file

                        // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                      }}
                      multiple
                    />
                  </Button>

                  {nombreArchivoCedula && (
                    <Chip
                      label={nombreArchivoCedula}
                      onDelete={() => {
                        setNombreArchivoCedula("");
                        setArchivo("");
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
                    RIF
                    <VisuallyHiddenInput
                      required
                      disabled={deshabilitaFileRif}
                      id="archivo2"
                      name="archivo2"
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
                        setNombreArchivoRif(file.name);
                        setArchivo2(file); // <-- Cambiado de e.target.files a file

                        // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                      }}
                      multiple
                    />
                  </Button>

                  {nombreArchivoRif && (
                    <Chip
                      label={nombreArchivoRif}
                      onDelete={() => {
                        setNombreArchivoRif("");
                        setArchivo2("");
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
                    Pasaporte
                    <VisuallyHiddenInput
                      required
                      id="pasaporte"
                      name="pasaporte"
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
                        setNombreArchivoPasaporte(file.name);
                        setPasaporte(file); // <-- Cambiado de e.target.files a file

                        // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                      }}
                      multiple
                    />
                  </Button>

                  {nombreArchivoPasaporte && (
                    <Chip
                      label={nombreArchivoPasaporte}
                      onDelete={() => {
                        setNombreArchivoPasaporte("");
                        setPasaporte("");
                      }}
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </div>

                {muestraRepresentante && (
                  <>
                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Partida de nacimiento
                        <VisuallyHiddenInput
                          required
                          id="partida_nacimiento"
                          name="partida_nacimiento"
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
                            setNombreArchivoPartidaNacimiento(file.name);
                            setArchivoPartidaNacimiento(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoPartidaNacimiento && (
                        <Chip
                          label={nombreArchivoPartidaNacimiento}
                          onDelete={() => {
                            setNombreArchivoPartidaNacimiento("");
                            setArchivoPartidaNacimiento("");
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
                        Referencia bancaria
                        <VisuallyHiddenInput
                          required
                          id="referencia_bancaria"
                          name="referencia_bancaria"
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
                            setArchivoReferenciaBancaria("");
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_cedula"
                    name="str_cedula"
                    label="Cédula"
                    placeholder="Cédula"
                    required
                    fullWidth
                    // value es necesario para que sea un componente controlado y respete el filtrado
                    value={str_cedula}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 8, // Evita que se escriba más de 8 caracteres a nivel navegador
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Validamos: que sean solo números Y que el largo sea máximo 8
                      if (/^\d*$/.test(value) && value.length <= 8) {
                        setStrCedula(value);
                      }
                    }}
                  />
                </FormControl>

                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DatePicker
                    label="Fecha de nacimiento"
                    format="DD-MM-YYYY"
                    // 1. Bloquea visualmente cualquier fecha futura
                    maxDate={dayjs()}
                    // 2. Opcional: Bloquea fechas incoherentes (ej. más de 100 años atrás)
                    minDate={dayjs().subtract(100, "year")}
                    value={fecha_nacimiento ? dayjs(fecha_nacimiento) : null}
                    onChange={(newValue) => {
                      // Solo actualiza el estado si la fecha es válida y no es futura
                      if (
                        newValue &&
                        newValue.isValid() &&
                        !newValue.isAfter(dayjs(), "day")
                      ) {
                        setFechaNacimiento(newValue.format("YYYY-MM-DD"));

                        const edad = dayjs().diff(newValue, "year");

                        if (edad < 18) {
                          //console.log("Es menor de 18 años");
                          setMuestraRepresentante(true);
                          setDeshabilitaRepresentante(false);
                          setDeshabilitaConyuge(true);
                          setMuestraConyugue(false);
                          setDeshabilitaFileRif(true);
                          setArchivo2(false);
                          setNombreArchivoRif("");
                          setTipoCargaFamiliar("");
                          setTipoEstadoCivil("");
                          setTipoCondicionVivienda("");
                          setRespuestaConyuge("");
                          setStrCedulaConyuge("");
                          setStrPrimerNombreConyuge("");
                          setStrSegundoNombreConyuge("");
                          setStrPrimerApellidoConyuge("");
                          setStrSegundoApellidoConyuge("");
                          setTipoFuenteIngreso("");
                        } else {
                          //console.log("Es mayor de 18 años");
                          setDeshabilitaConyuge(false);
                          setMuestraConyugue(false); //se vuel a habilitar cuando responde la persona
                          setDeshabilitaFileRif(false);
                          setMuestraRepresentante(false);
                          setDeshabilitaRepresentante(true);
                          setStrCedulaRepresentante("");
                          setStrPrimerNombreRepresentante("");
                          setStrSegundoNombreRepresentante("");
                          setStrPrimerApellidoRepresentante("");
                          setStrSegundoApellidoRepresentante("");
                          setTipoNacionalidadRepresentante("");
                          setTipoGeneroRepresentante("");
                          setStrCelularRepresentante("");
                          setStrTelefonoRepresentante("");
                          setFechaNacimientoRepresentante("");
                          setNombreArchivoCedulaRepresentante("");
                          setNombreArchivoRifRepresentante("");
                          setRespuestaConyuge("");
                        }
                      } else if (!newValue) {
                        setFechaNacimiento(null);
                      }
                    }}
                    slotProps={{
                      textField: {
                        id: "fecha_nacimiento",
                        name: "fecha_nacimiento",
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

                        // MUI mostrará error automáticamente si se escribe una fecha mayor a maxDate
                        //helperText: "Formato: DD-MM-YYYY",
                      },
                    }}
                  />
                </LocalizationProvider>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_primer_nombre"
                    name="str_primer_nombre"
                    label="Primer nombre"
                    placeholder="Primer nombre"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_primer_nombre}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrPrimerNombre(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_segundo_nombre"
                    name="str_segundo_nombre"
                    label="Segundo nombre"
                    placeholder="Segundo nombre"
                    //required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_segundo_nombre}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrSegundoNombre(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_primer_apellido"
                    name="str_primer_apellido"
                    label="Primer apellido"
                    placeholder="Primer apellido"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_primer_apellido}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrPrimerApellido(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_segundo_apellido"
                    name="str_segundo_apellido"
                    label="Segundo apellido"
                    placeholder="Segundo apellido"
                    //required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_segundo_apellido}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrSegundoApellido(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Nacionalidad</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipoNacionalidad"
                    name="tipoNacionalidad"
                    value={nacionalidades.length > 0 ? tipoNacionalidad : ""}
                    onChange={handleChangeTipoNacionalidad}
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
                  <InputLabel id="tipo-label">Otra nacionalidad</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipoOtraNacionalidad"
                    name="tipoOtraNacionalidad"
                    // Forzamos que si la lista no ha cargado, el valor sea "" para evitar el error visual
                    value={
                      nacionalidades.length > 0 ? tipoOtraNacionalidad : ""
                    }
                    onChange={handleChangeTipoOtraNacionalidad}
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
                  <InputLabel id="tipo-label">Género</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipoGenero"
                    name="tipoGenero"
                    value={generos.length > 0 ? tipoGenero : ""}
                    onChange={handleChangeTipoGenero}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {generos.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">
                    Condicion de la vivienda
                  </InputLabel>
                  <Select
                    disabled={deshabilitaFileRif}
                    labelId="tipo-label"
                    id="tipoCondicionVivienda"
                    name="tipoCondicionVivienda"
                    value={
                      condicionVivienda.length > 0 ? tipoCondicionVivienda : ""
                    }
                    onChange={handleChangeTipoVivienda}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {condicionVivienda.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Estado civil</InputLabel>
                  <Select
                    disabled={deshabilitaFileRif}
                    labelId="tipo-label"
                    id="tipoEstadoCivil"
                    name="tipoEstadoCivil"
                    value={estadosCiviles.length > 0 ? tipoEstadoCivil : ""}
                    onChange={handleChangeTipoEstadoCivil}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {estadosCiviles.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">Carga familiar</InputLabel>
                  <Select
                    disabled={deshabilitaFileRif}
                    labelId="tipo-label"
                    id="tipoCargaFamiliar"
                    name="tipoCargaFamiliar"
                    value={cargasFamiliares.length > 0 ? tipoCargaFamiliar : ""}
                    onChange={handleChangeTipoCargaFamiliar}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {cargasFamiliares.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.str_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <TextField
                    id="str_lugar"
                    name="str_lugar"
                    label="Lugar de nacimiento"
                    placeholder="Lugar de nacimiento"
                    required
                    fullWidth
                    // Sincronizamos con el estado
                    value={str_lugar}
                    inputProps={{
                      maxLength: 50, // Límite físico en el input
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // 1. Validamos que solo sean letras/espacios
                      // 2. Validamos que no supere los 50 caracteres
                      if (
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                        value.length <= 50
                      ) {
                        setStrLugar(value);
                      }
                    }}
                  />
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id="tipo-label">¿Tiene cónyuge?</InputLabel>
                  <Select
                    //disabled={deshabilitaFileRif}
                    disabled={
                      str_cedulaRepresentante
                        ? true
                        : str_cedula_conyuge
                          ? false
                          : deshabilitaFileRif
                    }
                    labelId="tipo-label"
                    id="respuestaConyuge"
                    name="respuestaConyuge"
                    value={respuestas.length > 0 ? respuestaConyuge : ""}
                    onChange={handleChangerespuestaConyuge}
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
              </div>

              {muestraConyugue && (
                <>
                  <div className="p-2">Datos del Cónyuge</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        id="str_cedula_conyuge"
                        name="str_cedula_conyuge"
                        label="Cédula"
                        placeholder="Cédula"
                        required
                        fullWidth
                        // Importante: Usar el estado para controlar el valor visible
                        value={str_cedula_conyuge}
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                          maxLength: 8,
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // Solo actualiza si son números y el largo es menor o igual a 8
                          if (/^\d*$/.test(value) && value.length <= 8) {
                            setStrCedulaConyuge(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        id="str_primer_nombre_conyuge"
                        name="str_primer_nombre_conyuge"
                        label="Primer nombre"
                        placeholder="Primer nombre"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_primer_nombre_conyuge}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrPrimerNombreConyuge(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        id="str_segundo_nombre_conyuge"
                        name="str_segundo_nombre_conyuge"
                        label="Segundo nombre"
                        placeholder="Segundo nombre"
                        //required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_segundo_nombre_conyuge}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrSegundoNombreConyuge(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        id="str_primer_apellido_conyuge"
                        name="str_primer_apellido_conyuge"
                        label="Primer apellido"
                        placeholder="Primer apellido"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_primer_apellido_conyuge}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrPrimerApellidoConyuge(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        id="str_segundo_apellido_conyuge"
                        name="str_segundo_apellido_conyuge"
                        label="Segundo apellido"
                        placeholder="Segundo apellido"
                        //required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_segundo_apellido_conyuge}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrSegundoApellidoConyuge(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}>
                      <InputLabel id="tipo-label">
                        Fuente de ingresos
                      </InputLabel>
                      <Select
                        disabled={
                          str_cedula_conyuge ? false : deshabilitaConyuge
                        }
                        labelId="tipo-label"
                        id="fuente_ingresos_id"
                        name="fuente_ingresos_id"
                        value={
                          fuentesIngresos.length > 0 ? tipoFuenteIngreso : ""
                        }
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
                  </div>
                </>
              )}

              {muestraRepresentante && (
                <>
                  <div className="p-2">
                    En Caso de Actuación de Representante Legal, Apoderado y/o
                    Autorizado
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center">
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        id="str_cedulaRepresentante"
                        name="str_cedulaRepresentante"
                        label="Cédula"
                        placeholder="Cédula"
                        required
                        fullWidth
                        // value es necesario para que sea un componente controlado y respete el filtrado
                        value={str_cedulaRepresentante}
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                          maxLength: 8, // Evita que se escriba más de 8 caracteres a nivel navegador
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // Validamos: que sean solo números Y que el largo sea máximo 8
                          if (/^\d*$/.test(value) && value.length <= 8) {
                            setStrCedulaRepresentante(value);
                          }
                        }}
                      />
                    </FormControl>

                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="es"
                    >
                      <DatePicker
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        label="Fecha de nacimiento"
                        format="DD-MM-YYYY"
                        // 1. Bloquea visualmente cualquier fecha futura
                        maxDate={dayjs()}
                        // 2. Opcional: Bloquea fechas incoherentes (ej. más de 100 años atrás)
                        minDate={dayjs().subtract(100, "year")}
                        value={
                          fecha_nacimiento_representante
                            ? dayjs(fecha_nacimiento_representante)
                            : null
                        }
                        onChange={(newValue) => {
                          // Solo actualiza el estado si la fecha es válida y no es futura
                          if (
                            newValue &&
                            newValue.isValid() &&
                            !newValue.isAfter(dayjs(), "day")
                          ) {
                            setFechaNacimientoRepresentante(
                              newValue.format("YYYY-MM-DD"),
                            );

                            const edad = dayjs().diff(newValue, "year");

                            /* if (edad < 18) {
                          console.log("Es menor de 18 años");
                          
                        } else {
                          console.log("Es mayor de 18 años");
                          
                        } */
                          } else if (!newValue) {
                            setFechaNacimientoRepresentante(null);
                          }
                        }}
                        slotProps={{
                          textField: {
                            id: "fecha_nacimiento_representante",
                            name: "fecha_nacimiento_representante",
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

                            // MUI mostrará error automáticamente si se escribe una fecha mayor a maxDate
                            //helperText: "Formato: DD-MM-YYYY",
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                      >
                        Cédula
                        <VisuallyHiddenInput
                          required
                          disabled={
                            str_cedulaRepresentante
                              ? false
                              : deshabilitaRepresentante
                          }
                          id="archiarchivoCedulaRepresentantevo"
                          name="archivoCedulaRepresentante"
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
                            setNombreArchivoCedulaRepresentante(file.name);
                            setArchivoCedulaRepresentante(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoCedulaRepresentante && (
                        <Chip
                          label={nombreArchivoCedulaRepresentante}
                          onDelete={() => {
                            setNombreArchivoCedulaRepresentante("");
                            setArchivoCedulaRepresentante("");
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
                        RIF
                        <VisuallyHiddenInput
                          required
                          disabled={
                            str_cedulaRepresentante
                              ? false
                              : deshabilitaRepresentante
                          }
                          id="archivo2RifRepresentante"
                          name="archivo2RifRepresentante"
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
                            setNombreArchivoRifRepresentante(file.name);
                            setArchivo2RifRepresentante(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoRifRepresentante && (
                        <Chip
                          label={nombreArchivoRifRepresentante}
                          onDelete={() => {
                            setNombreArchivoRifRepresentante("");
                            setArchivo2RifRepresentante("");
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>

                    {/*constancia trabajo*/}
                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Constancia de trabajo
                        <VisuallyHiddenInput
                          required
                          id="constancia_trabajo"
                          name="constancia_trabajo"
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
                            setNombreArchivoConstanciaTrabajoRepresentante(
                              file.name,
                            );
                            setArchivoConstanciaTrabajoRepresentante(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoConstanciaTrabajoRepresentante && (
                        <Chip
                          label={nombreArchivoConstanciaTrabajoRepresentante}
                          onDelete={() => {
                            setNombreArchivoConstanciaTrabajoRepresentante("");
                            setArchivoConstanciaTrabajoRepresentante("");
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>

                    {/*carta de autorizacion*/}
                    <div className="flex flex-col gap-1">
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Carta de autorización
                        <VisuallyHiddenInput
                          required
                          id="carta_autorizacion"
                          name="carta_autorizacion"
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
                            setNombreArchivoCartaAutorizacion(file.name);
                            setArchivoCartaAutorizacion(file); // <-- Cambiado de e.target.files a file

                            // No limpies e.target.value aquí, déjalo para que el DOM mantenga la referencia
                          }}
                          multiple
                        />
                      </Button>

                      {nombreArchivoCartaAutorizacion && (
                        <Chip
                          label={nombreArchivoCartaAutorizacion}
                          onDelete={() => {
                            setNombreArchivoCartaAutorizacion("");
                            setArchivoCartaAutorizacion("");
                          }}
                          style={{ marginTop: "10px" }}
                        />
                      )}
                    </div>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        id="str_primer_nombreRepresentante"
                        name="str_primer_nombreRepresentante"
                        label="Primer nombre"
                        placeholder="Primer nombre"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_primer_nombreRepresentante}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrPrimerNombreRepresentante(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        id="str_segundo_nombre_representante"
                        name="str_segundo_nombre_representante"
                        label="Segundo nombre"
                        placeholder="Segundo nombre"
                        //required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_segundo_nombre_representante}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrSegundoNombreRepresentante(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        id="str_primer_apellido_representante"
                        name="str_primer_apellido_representante"
                        label="Primer apellido"
                        placeholder="Primer apellido"
                        required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_primer_apellido_representante}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrPrimerApellidoRepresentante(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <TextField
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        id="str_segundo_apellido_representante"
                        name="str_segundo_apellido_representante"
                        label="Segundo apellido"
                        placeholder="Segundo apellido"
                        //required
                        fullWidth
                        // Sincronizamos con el estado
                        value={str_segundo_apellido_representante}
                        inputProps={{
                          maxLength: 50, // Límite físico en el input
                          style: { textTransform: "uppercase" },
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          // 1. Validamos que solo sean letras/espacios
                          // 2. Validamos que no supere los 50 caracteres
                          if (
                            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) &&
                            value.length <= 50
                          ) {
                            setStrSegundoApellidoRepresentante(value);
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}>
                      <InputLabel id="tipo-label">Nacionalidad</InputLabel>
                      <Select
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        labelId="tipo-label"
                        id="tipoNacionalidadRepresentante"
                        name="tipoNacionalidadRepresentante"
                        value={
                          nacionalidades.length > 0
                            ? tipoNacionalidadRepresentante
                            : ""
                        }
                        onChange={handleChangetipoNacionalidadRepresentante}
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
                      <InputLabel id="tipo-label">Género</InputLabel>
                      <Select
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        labelId="tipo-label"
                        id="tipoGeneroRepresentante"
                        name="tipoGeneroRepresentante"
                        value={
                          generosRepresentante.length > 0
                            ? tipoGeneroRepresentante
                            : ""
                        }
                        onChange={handleChangetipoGeneroRepresentante}
                      >
                        <MenuItem value="">
                          <em>Seleccione</em>
                        </MenuItem>
                        {generosRepresentante.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.str_nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: 120, width: "100%" }}
                    >
                      <PhoneInput
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        international
                        defaultCountry="VE"
                        value={str_celular_representante || ""}
                        onChange={setStrCelularRepresentante}
                        inputComponent={MUIInput}
                        label="Celular del representante"
                        placeholder="Celular del representante"
                        numberInputProps={{
                          maxLength: 17,
                        }}
                        // Ponemos el campo en rojo si hay algo escrito y no es válido
                        error={
                          str_celular_representante
                            ? !isValidPhoneNumber(str_celular_representante)
                            : false
                        }
                        // Mostramos el mensaje solo si hay un error de validación
                        helperText={
                          str_celular_representante &&
                          !isValidPhoneNumber(str_celular_representante)
                            ? "Formato de número inválido (Ej: +58 412 1234567)"
                            : ""
                        }
                      />
                    </FormControl>

                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: 120, width: "100%" }}
                    >
                      <PhoneInput
                        disabled={
                          str_cedulaRepresentante
                            ? false
                            : deshabilitaRepresentante
                        }
                        international
                        defaultCountry="VE"
                        value={str_telefono_representante || ""}
                        onChange={setStrTelefonoRepresentante}
                        inputComponent={MUIInput}
                        label="Telefono del representante"
                        placeholder="Teléfono del representante"
                        numberInputProps={{
                          maxLength: 17,
                        }}
                        // Ponemos el campo en rojo si hay algo escrito y no es válido
                        error={
                          str_telefono_representante
                            ? !isValidPhoneNumber(str_telefono_representante)
                            : false
                        }
                        // Mostramos el mensaje solo si hay un error de validación
                        helperText={
                          str_telefono_representante &&
                          !isValidPhoneNumber(str_telefono_representante)
                            ? "Formato de número inválido (Ej: +58 212 1234567)"
                            : ""
                        }
                      />
                    </FormControl>
                  </div>
                </>
              )}

              {/* ADMIN: Usamos !! para convertir el valor a booleano (si existe y no es 0) */}
              {!!usuarioBoId && (
                <Stack
                  spacing={2}
                  direction="row"
                  className="justify-center pt-6"
                >
                  <Button type="submit" variant="contained" color="primary">
                    GUARDAR DATOS PERSONALES
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
                      GUARDAR DATOS PERSONALES
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
                      GUARDAR DATOS PERSONALES
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

export default DatosPersonalesCliente;
