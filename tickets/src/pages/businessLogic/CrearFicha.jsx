import { useState, Fragment, useEffect } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/es";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

import DatosPersonalesCliente from "./pagina1/DatosPersonalesCliente";
import DireccionDomicilio from "./pagina1/DireccionDomicilio";
import PersonaPep from "./pagina1/PersonaPep";
import ActividadEconomica from "./pagina2/ActividadEconomica";
import ReferenciasBancarias from "./pagina2/ReferenciasBancarias";
import ReferenciasPersonales from "./pagina2/ReferenciasPersonales";
import InformacionProductoServicio from "./pagina3/InformacionProductoServicio";
import InformacionMovilizacionFondos from "./pagina3/InformacionMovilizacionFondos";
import EnviaRecibeFondos from "./pagina4/EnviaRecibeFondos.jsx";
import CuentasUOtrosProductos from "./pagina4/CuentasUOtrosProductos.jsx";
import MediosContacto from "./pagina3/MediosContacto.jsx";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PerfilInversion from "./pagina4/PerfilInversion.jsx";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import useMediaQuery from "@mui/material/useMediaQuery"; // Importante para detectar móvil
import axios from "axios";
import Alert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";

import Lottie from "lottie-react";
import Fin from "../../../src/assets/LottieFiles/Reward celebration  win animation.json";

import {
  resetPlantilla,
  setMuiMode,
  setSeccion1,
  setSeccionCompleta,
  setSeccionesMasivo,
} from "../../../../onboarding/src/store/plantillaSlice";

import { persistor } from "../../../../onboarding/src/store/store"; // Ajusta la ruta a tu archivo store
import FormatoFicha from "../businessLogicBo/FormatoFicha.jsx";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": { borderBottom: 0 },
  "&::before": { display: "none" },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.8rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  padding: theme.spacing(1), // Más compacto en móvil
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
    // Evita que el texto largo se desborde
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1.5), // Reducido para móviles
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const steps = ["P1", "P2", "P3", "P4"]; // Nombres cortos para el stepper móvil

const CrearFicha = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    seccion1,
    seccion2,
    seccion3,
    seccion4,
    seccion5,
    seccion6,
    seccion7,
    seccion8,
    seccion9,
    seccion10,
    seccion11,
    seccion12,
    seccionCompletada,
  } = useSelector((state) => state.plantilla);

  const direccion_seguridad = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const direccion = import.meta.env.REACT_APP_URL_API_LOCAL;
  const url = direccion;
  const url_seguridad = direccion_seguridad;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };

  // Seleccionar estados desde Redux

  // usuario cuando esta llenando su ficha:
  const usuarioId = useSelector((state) => state.plantilla.usuarioId);

  // Usuario de Back Office y el de la ficha que se esta asistiendo:
  const fichaUsuarioId = useSelector((state) => state.plantilla.fichaUsuarioId);
  const usuarioBoId = useSelector((state) => state.plantilla.usuarioBoId);

  const modo = useSelector((state) => state.plantilla.muiMode);
  const plantilla = useSelector((state) => state.plantilla);
  //const [expanded, setExpanded] = useState("panel1");
  const [expanded, setExpanded] = useState(false);
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [estatusLegacy, setEstatusLegacy] = useState(null);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  // Añade este estado al inicio de tu componente CrearFicha
  const [datosFicha, setDatosFicha] = useState(null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  useEffect(() => {
    const obtenerDatos = async () => {
      if (!usuarioId) return;

      try {
        // 1. Obtener el primer conjunto de datos
        const respuestaGet = await axios.get(
          `${url}registroscompletadosporusuario`,
          {
            headers,
            params: { usuario_id: usuarioId },
          },
        );

        const correoUsuario = respuestaGet?.data?.correo;

        if (!correoUsuario) {
          console.warn("Correo no disponible para consultar estatus legacy.");
          setDatosFicha(respuestaGet.data);
          return;
        }

        // 2. Modificación: Enviar el email en 'params' para que el backend lo reciba en req.query
        const estatusLegacy = await axios.post(
          `${url_seguridad}consultarEstatusLegacy`,
          {}, // El body está vacío, ya que el servidor no usa req.body
          {
            headers,
            params: { email: correoUsuario }, // Esto convierte la URL en .../consultarEstatusLegacy?email=...
          },
        );

        //console.log("Estatus Legacy:", estatusLegacy.data.respuesta);

        let mensaje = "";

        const respuesta = estatusLegacy?.data.respuesta;

        if (respuesta === "KYC en revisión" || respuesta === null) {
          mensaje = `Tu solicitud ya está en nuestro sistema y ha
                                entrado en la lista de espera para revisión. En
                                este momento estamos recibiendo una alta demanda
                                de solicitudes, y cada apertura debe pasar por
                                los controles regulatorios obligatorios, lo cual
                                puede tomar un poco más de tiempo de lo
                                habitual. Nuestro equipo está trabajando para
                                validar tu perfil lo antes posible. Gracias por
                                tu paciencia y confianza en Mercosur Casa de
                                Bolsa.`;
        }

        if (
          respuesta === "Su KYC ha sido devuelto, revise su correo electrónico"
        ) {
          mensaje = respuesta;
        }

        if (respuesta === "KYC aprobado") {
          mensaje = `Tu KYC ha sido aprobado. Revise su bandeja de correo a la espera de cocumentos por firmar.`;
        }

        if (respuesta === "Cliente listo para operar al 100%") {
          mensaje = `Tu KYC esta actualizado y aprobado, tu perfil es apto para operar al 100% con nosotros. ¡Gracias por confiar en Mercosur Casa de Bolsa!`;
        }

        setEstatusLegacy(mensaje);

        // 3. Actualizar estado
        setDatosFicha({
          ...respuestaGet.data,
          estatusLegacy: estatusLegacy.data,
        });
      } catch (error) {
        console.error("Error inicializando datos:", error);
      }
    };

    obtenerDatos();
  }, [usuarioId]); // Asegúrate de que 'url', 'url_seguridad' y 'headers' también estén en las dependencias si cambian

  useEffect(() => {
    const usuario = localStorage.getItem("bo_userId");
    if (usuario) dispatch(setSeccionCompleta(false));

    if (location.state?.openPanel) {
      const panelId = location.state.openPanel;

      // 1. Definimos la relación Panel -> Página (Step)
      const panelToStep = {
        panel1: 0,
        panel2: 0,
        panel3: 0, // Página 1
        panel4: 1,
        panel5: 1,
        panel6: 1, // Página 2
        panel7: 2,
        panel8: 2,
        panel9: 2, // Página 3
        panel10: 3,
        //panel11: 3,
        //panel12: 3, // Página 4
        panel11: 4, // Pantalla final (PDF)
      };

      const step = panelToStep[panelId];

      if (step !== undefined) {
        // 2. Cambiamos a la página correcta (esto renderiza los acordeones de esa página)
        setActiveStep(step);

        // 3. Si NO es el panel 12, abrimos el acordeón correspondiente
        // El panel 12 no usa 'expanded' porque es una vista completa del activeStep 4
        if (panelId !== "panel11") {
          setTimeout(() => {
            setExpanded(panelId);

            // 4. Scroll suave hacia el acordeón abierto
            const element = document.getElementById(panelId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 150); // Un delay ligeramente mayor asegura que el DOM esté listo
        } else {
          // Si es el panel 12, nos aseguramos de cerrar cualquier acordeón previo
          setExpanded(false);
        }
      }
    }
  }, [location.state]);

  const handleCrear = async () => {
    const { data: datosActualizados } = await axios.get(`${url}buscar_ficha`, {
      headers: { Authorization: `Bearer ${tokenApi}` },
      params: {
        usuario_id: usuarioId,
        _t: Date.now(),
      },
    });

    const seccionesInteres = Array.from(
      { length: 10 },
      (_, i) => `bol_seccion_${i + 1}`,
    );

    // 1. Identificamos cuáles secciones son false
    const seccionesFaltantes = seccionesInteres.filter(
      (key) => datosActualizados[key] !== true,
    );

    // 2. Verificamos si el array de faltantes está vacío
    const todasSonTrue = seccionesFaltantes.length === 0;

    if (!todasSonTrue) {
      // 3. Formateamos los nombres para el mensaje (ej: "Sección 1, Sección 5")
      const nombresSecciones = seccionesFaltantes
        .map((s) => s.replace("bol_seccion_", "Sección "))
        .join(", ");

      alert(
        `Faltan por completar las siguientes secciones: ${nombresSecciones}`,
      );
      return;
    }

    /* const respuestaUsuario = window.confirm(
      "¿Confirma que revisó y está conforme con todos los datos suministrados?",
    ); */

    //if (respuestaUsuario) {
    console.log("Datos listos para PDF...");
    // Guardamos los datos recibidos de buscar_ficha en el estado

    //Si la cierra el usuario
    try {
      // Enviamos un objeto plano, NO FormData
      const datosContacto = {
        bol_ficha_completa: true,
        usuario_id: usuarioId,
        usuario_asiste_id: usuarioBoId,
      };

      // alert(`Usuario BO: ${usuarioBoId}`);
      // alert(`Usuario de la ficha: ${usuarioId}`);
      //console.table(datosContacto);

      //console.log(datosFicha.bol_devuelta);

      if (datosFicha.bol_devuelta === false) {
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));

        // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
        const [respuesta] = await Promise.all([
          axios.post(`${url}fichas/cerrar`, datosContacto, {
            headers: {
              Authorization: `Bearer ${tokenApi}`,
            },
          }),
          delay,
        ]);
      }

      setDatosFicha(null);

      if (datosFicha.bol_devuelta === true) {
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));

        // Al enviar un objeto plano, Axios pone "Content-Type: application/json" por defecto
        const [respuesta] = await Promise.all([
          axios.post(`${url}fichas/cerrar_devueltas`, datosContacto, {
            headers: {
              Authorization: `Bearer ${tokenApi}`,
            },
          }),
          delay,
        ]);
      }

      // BUSCAR
      const { data: datosActualizados } = await axios.get(
        `${url}registroscompletadosporusuario`,
        {
          headers: { Authorization: `Bearer ${tokenApi}` },
          params: {
            usuario_id: usuarioId,
            _t: Date.now(), // Rompe el caché del navegador
          },
        },
      );

      //console.log(datosActualizados);

      dispatch(resetPlantilla());
      dispatch(setSeccionesMasivo(datosActualizados));

      if (persistor) {
        await persistor.flush();
      }

      dispatch(setMuiMode(modo === "dark" ? "dark" : "light"));
    } catch (error) {
      console.log("Error:", error.response?.data || error.message);
    }

    setDatosFicha(datosActualizados);
    // }
  };

  // Helper para el título del Accordion con Icono
  const renderTitle = (numero, texto, completado) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        pr: 1,
      }}
    >
      <Typography
        variant={isMobile ? "caption" : "body2"}
        sx={{ fontWeight: 600, fontSize: isMobile ? "0.75rem" : "0.875rem" }}
      >
        {numero}. {texto}
      </Typography>
      {completado ? (
        <CheckIcon color="success" sx={{ fontSize: 18, ml: 1 }} />
      ) : (
        <ErrorIcon color="warning" sx={{ fontSize: 18, ml: 1 }} />
      )}
    </Box>
  );

  return (
    <Box className="w-full md:w-10/12 flex flex-col items-center justify-center mx-auto px-2 md:px-4">
      <div className="w-full pt-4 pb-6">
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            mb: 3,
            fontWeight: "bold",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Ficha de Inversionista
        </Typography>

        <Box sx={{ width: "100%", mb: 4 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={isMobile} // Label abajo en móvil
            sx={{ "& .MuiStepLabel-label": { fontSize: "0.7rem" } }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Fragment>
              <Box sx={{ mt: 3 }}>
                {/* Cambiamos el Accordion para que sea estático y siempre abierto */}
                <Accordion
                  expanded={true} // Forzamos que siempre esté abierto
                  sx={{
                    pointerEvents: "none", // Opcional: evita que el usuario intente cerrarlo
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      display: "none",
                    }, // Escondemos la flecha
                  }}
                >
                  <AccordionSummary>
                    <Typography
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      RESUMEN DE VALIDACIÓN Y ENVÍO
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pointerEvents: "auto" }}>
                    {" "}
                    <Box
                      className="flex flex-col items-center justify-center"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      {(!datosFicha?.bol_ficha_completa &&
                        !seccionCompletada) ||
                      (datosFicha?.bol_verificacion_datos === true &&
                        datosFicha?.bol_verificacion_agile_check === true &&
                        datosFicha?.bol_devuelta === true) ? (
                        <>
                          <Alert
                            icon={false}
                            severity="warning"
                            className="mb-4 text-left"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0 }}
                            >
                              Nota: Cuando presione el botón{" "}
                              <strong className="text-red-500">
                                ENVIAR SOLICITUD
                              </strong>{" "}
                              usted <strong>NO</strong> podrá editar nuevamente
                              sus datos y deberá comunicarse con{" "}
                              <strong>Atención al Cliente</strong> en caso de
                              requerirlo. Si su ficha es devuelta por revisión,
                              se le notificará a través de su correo electrónico
                              registrado, indicando las secciones que necesitan
                              ser corregidas o completadas. Por favor, revise
                              cuidadosamente toda la información antes de
                              proceder.
                            </Typography>
                          </Alert>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                          >
                            Si esta conforme con todos los datos sumistrados y
                            todas las secciones anteriores tienen el icono de
                            verificación (
                            <CheckIcon
                              sx={{ fontSize: 14, verticalAlign: "middle" }}
                              color="success"
                            />
                            ) usted puede proceder a ENVIAR SOLICITUD.
                          </Typography>

                          <Button
                            fullWidth={isMobile}
                            variant="contained"
                            size="large"
                            onClick={handleCrear}
                            startIcon={<CheckIcon />}
                          >
                            {loadingCierre
                              ? "Procesando..."
                              : "ENVIAR SOLICITUD"}
                          </Button>

                          <Button
                            fullWidth
                            onClick={handleReset}
                            sx={{ mt: 3 }}
                          >
                            Volver al inicio para revisar o editar información
                          </Button>
                        </>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="success.main"
                            fontWeight="bold"
                          >
                            ¡Registro culminado exitosamente!
                          </Typography>

                          <Box
                            sx={{
                              width: 150,
                              height: 150,
                              my: 1,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Lottie animationData={Fin} loop={true} />
                          </Box>

                          <Alert
                            severity="success"
                            sx={{ marginBottom: "15px" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 3,
                                textAlign: "left",
                                //lineHeight: 1.6,
                              }}
                            >
                              {estatusLegacy}
                            </Typography>
                          </Alert>

                          {datosFicha && (
                            <>
                              {/* <PDFDownloadLink
                              key={JSON.stringify(datosFicha)}
                              document={<FormatoFicha datos={datosFicha} />}
                              fileName={`Ficha_Inversionista_${usuarioId}.pdf`}
                              style={{ textDecoration: "none" }}
                            >
                              {({ loading }) => (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="large"
                                  disabled={loading}
                                  startIcon={<DownloadIcon />}
                                >
                                  {loading
                                    ? "Generando archivo..."
                                    : "Descarga tu ficha aquí"}
                                </Button>
                              )}
                            </PDFDownloadLink> */}
                              <PDFDownloadLink
                                key={JSON.stringify(datosFicha)}
                                document={<FormatoFicha datos={datosFicha} />}
                                fileName={`Ficha_Inversionista_${usuarioId}.pdf`}
                                style={{ textDecoration: "none" }}
                                target="_blank"
                              >
                                {({ loading, url }) => (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    disabled={loading}
                                    startIcon={<DownloadIcon />}
                                  >
                                    {loading
                                      ? "Generando archivo..."
                                      : "Descarga tu ficha aquí"}
                                  </Button>
                                )}
                              </PDFDownloadLink>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Fragment>
          ) : (
            <Fragment>
              <div className="mt-4">
                {/* GRUPO PÁGINA 1 */}
                {activeStep === 0 && (
                  <>
                    <Accordion //defaultExpanded={false}
                      id="panel1"
                      expanded={expanded === "panel1"}
                      onChange={handleChange("panel1")}
                    >
                      <AccordionSummary>
                        {renderTitle(1, "DATOS PERSONALES", seccion1)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <DatosPersonalesCliente expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                    <Accordion
                      id="panel2"
                      expanded={expanded === "panel2"}
                      onChange={handleChange("panel2")}
                    >
                      <AccordionSummary>
                        {renderTitle(2, "DIRECCIÓN DOMICILIO FISCAL", seccion2)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <DireccionDomicilio expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                    <Accordion
                      id="panel3"
                      expanded={expanded === "panel3"}
                      onChange={handleChange("panel3")}
                    >
                      <AccordionSummary>
                        {renderTitle(3, "PERSONA PEP", seccion3)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <PersonaPep expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}

                {/* GRUPO PÁGINA 2 */}
                {activeStep === 1 && (
                  <>
                    <Accordion
                      id="panel4"
                      expanded={expanded === "panel4"}
                      onChange={handleChange("panel4")}
                    >
                      <AccordionSummary>
                        {renderTitle(4, "REF. BANCARIAS", seccion4)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <ReferenciasBancarias expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                    <Accordion
                      id="panel5"
                      expanded={expanded === "panel5"}
                      onChange={handleChange("panel5")}
                    >
                      <AccordionSummary>
                        {renderTitle(5, "REF. PERSONALES", seccion5)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <ReferenciasPersonales expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                    <Accordion
                      id="panel6"
                      expanded={expanded === "panel6"}
                      onChange={handleChange("panel6")}
                    >
                      <AccordionSummary>
                        {renderTitle(6, "ACT. ECONÓMICA", seccion6)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <ActividadEconomica expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}

                {/* GRUPO PÁGINA 3 */}
                {activeStep === 2 && (
                  <>
                    <Accordion
                      id="panel7"
                      expanded={expanded === "panel7"}
                      onChange={handleChange("panel7")}
                    >
                      <AccordionSummary>
                        {renderTitle(7, "PRODUCTO/SERVICIO", seccion7)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <InformacionProductoServicio expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      id="panel8"
                      expanded={expanded === "panel8"}
                      onChange={handleChange("panel8")}
                    >
                      <AccordionSummary>
                        {renderTitle(8, "MOV. FONDOS", seccion8)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <InformacionMovilizacionFondos expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      id="panel9"
                      expanded={expanded === "panel9"}
                      onChange={handleChange("panel9")}
                    >
                      <AccordionSummary>
                        {renderTitle(9, "MEDIOS CONTACTO", seccion9)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <MediosContacto expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}

                {/* GRUPO PÁGINA 4 */}
                {activeStep === 3 && (
                  <>
                    <Accordion
                      id="panel10"
                      expanded={expanded === "panel10"}
                      onChange={handleChange("panel10")}
                    >
                      <AccordionSummary>
                        {renderTitle(10, "PERFIL DE INVERSIÓN", seccion10)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <PerfilInversion expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>

                    {/* <Accordion
                      id="panel11"
                      expanded={expanded === "panel11"}
                      onChange={handleChange("panel11")}
                    >
                      <AccordionSummary>
                        {renderTitle(
                          11,
                          "OTROS PRODUCTOS O SERVICIOS",
                          seccion11,
                        )}
                      </AccordionSummary>
                      <AccordionDetails>
                        <CuentasUOtrosProductos expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      id="panel12"
                      expanded={expanded === "panel12"}
                      onChange={handleChange("panel12")}
                    >
                      <AccordionSummary>
                        {renderTitle(12, "FONDOS DEL EXTERIOR", seccion12)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <EnviaRecibeFondos expandir={setExpanded} />
                      </AccordionDetails>
                    </Accordion> */}
                  </>
                )}
              </div>

              {/* CONTROLES DE NAVEGACIÓN */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", pt: 4 }}
              >
                <Button
                  variant="outlined"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ minWidth: isMobile ? "80px" : "120px" }}
                >
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ minWidth: isMobile ? "80px" : "120px" }}
                >
                  {activeStep === steps.length - 1 ? (
                    <>
                      Enviar Solicitud <UploadFileIcon />
                    </>
                  ) : (
                    "Siguiente"
                  )}
                </Button>
              </Box>
            </Fragment>
          )}
        </Box>
      </div>
    </Box>
  );
};

export default CrearFicha;
