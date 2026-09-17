import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Logo from "../../components/Logo";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSeccionesMasivo } from "../../store/plantillaSlice";
import Lottie from "lottie-react";
import Buscando from "../../../src/assets/LottieFiles/Searching.json";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
//import { set } from "../../../../apiOnboarding/mailer";

const Inicio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const lottieRef = useRef(null);

  const url = import.meta.env.REACT_APP_URL_API_LOCAL;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const direccion_seguridad = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const url_seguridad = direccion_seguridad;

  const plantilla = useSelector((state) => state.plantilla);
  const [observaciones, setObservaciones] = useState("");
  const [devuelta, setDevuelta] = useState(null);
  const [estatusLegacy, setEstatusLegacy] = useState(null);
  const [mostrar, setMostrar] = useState(true); // Estado para controlar la visibilidad del formulario

  const [llamado, setLlamado] = useState(false);

  const titulosSecciones = [
    "1. Datos Personales del Cliente",
    "2. Dirección de Domicilio",
    "3. Persona Expuesta Políticamente (PEP)",
    "4. Referencias Bancarias del Cliente",
    "5. Referencias Personales del Cliente",
    "6. Información Económico/Financiera del Cliente",
    "7. Información del Producto o Servicio",
    "8. Información Sobre Movilización de Fondos",
    "9. Medios de Contacto",
    "10. Perfil de inversión",
    //"11. ",
    //"12. ",
    "Confirmación de Datos",
  ];

  useEffect(() => {
    if (!plantilla.usuarioId) {
      setLoading(false);
      return;
    }

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

        //console.log(datosFicha?.data.usuario_email_auth);

        const correoUsuario = datosFicha?.data.usuario_email_auth;

        if (!correoUsuario) {
          console.warn("Correo no disponible para consultar estatus legacy.");
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

        //console.log(estatusLegacy.data.respuesta);

        let mensaje = "";

        if (
          estatusLegacy?.data.respuesta === "KYC en revisión" ||
          estatusLegacy?.data.respuesta === "KYC aprobado" ||
          estatusLegacy?.data.respuesta === "Cliente listo para operar al 100%"
        ) {
          mensaje = `Tu estatus en el sistema es: ${estatusLegacy.data.respuesta}. `;
          setMostrar(false); // Mostrar el formulario dependiendo del estatus
        }

        setEstatusLegacy(mensaje);
        dispatch(setSeccionesMasivo(datosFicha.data));
        //console.log(datosFicha.data.bol_devuelta);
        setDevuelta(datosFicha.data.bol_devuelta);
        setObservaciones(datosFicha.data.str_observaciones || "");
      } catch (error) {
        console.error("Error al obtener la ficha:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosMaestro();
  }, [plantilla.usuarioId, url, dispatch, tokenApi]);

  // Agrega esto dentro de tu componente
  useEffect(() => {
    //console.log("El valor real de mostrar es:", mostrar);

    if (mostrar === false && loading === false) {
      handleNavegarSecion(11); // Navega automáticamente a la sección 11 (Confirmación de Datos) si mostrar es false

      setLlamado(true);
    }
  }, [mostrar]);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1.5);
    }
  }, [loading]);

  const handleNavegarSecion = (numeroSeccion) => {
    //console.log(numeroSeccion);

    const panelId = `panel${numeroSeccion}`;
    navigate("/iniciar-registro", { state: { openPanel: panelId } });
  };

  if (loading) {
    return (
      <Box className="w-full h-96 flex justify-center items-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div style={{ width: "200px", height: "200px" }}>
            <Lottie
              lottieRef={lottieRef}
              animationData={Buscando}
              loop={true}
            />
          </div>
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400 font-medium animate-pulse">
            Revisando tu progreso...
          </p>
        </div>
      </Box>
    );
  }

  return (
    <Box className="w-full flex justify-center p-0 bg-transparent">
      <div className="max-w-screen-md w-full text-center">
        {/* Oculto en móviles y tablets. Solo visible en pantallas de 1024px o más */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-72 filter dark:brightness-125 p-4">
            <Logo />
          </div>
        </div>

        <div className="mt-8 lg:mt-0">
          {/* mt-8 da espacio en móvil y tablet. lg:mt-0 lo quita en PC porque ya está el logo */}
          <p className="text-blue-700 dark:text-blue-400 font-bold text-left mb-4 border-b border-gray-200 pb-2">
            Bienvenido (a), {/* aquí podrás ver el progreso de tu registro. */}
            {estatusLegacy && <span>{estatusLegacy}</span>}
          </p>

          {devuelta == true && (
            <Alert
              variant="filled"
              severity="warning"
              sx={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
                "& .MuiAlert-message": { width: "100%" },
                marginBottom: "15px",
              }}
            >
              <div className="text-left w-full">
                <strong className="block mb-2 text-xs uppercase tracking-wider opacity-90">
                  Historial de observaciones:
                </strong>
                {observaciones ? (
                  observaciones
                    .split(/Usuario:/)
                    .filter((part) => part.trim() !== "")
                    .map((part, index) => {
                      // 1. Quitamos el nombre del usuario (primera palabra)
                      // 2. Quitamos la palabra "Observaciones:" (con o sin espacio)
                      const contenidoLimpio = part
                        .replace(/^\s*\S+\s+/, "")
                        .replace(/Observaciones:\s*/g, "");

                      return (
                        <div
                          key={index}
                          className="mb-3 last:mb-0 border-b border-white/20 last:border-0 pb-2"
                        >
                          <p className="text-sm m-0 leading-snug">
                            • {contenidoLimpio.trim()}
                          </p>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm m-0">No hay observaciones</p>
                )}
              </div>
            </Alert>
          )}

          {mostrar !== false && loading == false && llamado == false && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              {titulosSecciones.map((titulo, index) => {
                const numeroSeccion = index + 1;
                const estaCompletada = plantilla[`seccion${numeroSeccion}`];

                return (
                  <div
                    key={numeroSeccion}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      estaCompletada
                        ? "border-blue-500/40 bg-green-50/10"
                        : "bg-white dark:bg-slate-800 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                          estaCompletada
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {estaCompletada ? "✓" : numeroSeccion}
                      </span>
                      <p className="text-sm font-medium ">{titulo}</p>
                    </div>

                    {/* Botón de acción */}
                    <button
                      onClick={() => handleNavegarSecion(numeroSeccion)}
                      className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        estaCompletada
                          ? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                          : "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      {estaCompletada ? "Ver" : "Llenar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default Inicio;
