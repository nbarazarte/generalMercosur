import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Copyright from "../internals/components/Copyright";
import { useLocation } from "react-router-dom";

//Páginas que forman la lógica de negocio de la aplicación:
import Inicio from "../../businessLogic/Inicio";
import CrearFicha from "../../businessLogic/CrearFicha";

//Páginas que forman la lógica de negocio de la aplicación: (Usuario Mercosur)
import InicioBo from "../../businessLogicBo/InicioBo";
import FichasPorRevision from "../../businessLogicBo/FichasEnCumplimiento";
import FichasEnRevision from "../../businessLogicBo/FichasLcFtListasyNoticias";
import FichasAprobadas from "../../businessLogicBo/FichasAprobadas";
import FichasNuevas from "../../businessLogicBo/FichasNuevas";
import EstatusGeneral from "../../businessLogicBo/EstatusGeneral";
import FormatoFicha from "../../businessLogicBo/FormatoFicha";
import Preview from "../../businessLogicBo/Preview";
import RegistrosAgileCheck from "../../businessLogicBo/RegistrosPep";
import RegistrosNoticiasCrimen from "../../businessLogicBo/RegistrosNoticiasCrimen";
import FichasActivas from "../../businessLogicBo/FichasActivas";
import RegistrosPep from "../../businessLogicBo/RegistrosPep";
import FichasDevueltas from "../../businessLogicBo/FichasDevueltas";
import FichasRechazadas from "../../businessLogicBo/FichasRechazadas";
import FichasFirmadas from "../../businessLogicBo/FichasFirmadas";
import FichasEnPausa from "../../businessLogicBo/FichasEnPausa";

export default function MainGrid() {
  const location = useLocation();

  const isBO = window.location.pathname.startsWith("/bo");

  const nombreSistema = isBO
    ? import.meta.env.REACT_APP_NOMBRE_SISTEMA_BO
    : import.meta.env.REACT_APP_NOMBRE_SISTEMA;

  const [embeber, setEmbeber] = React.useState(
    localStorage.getItem("embeber") || null,
  );

  // console.log(localStorage.getItem("embeber"));
  // console.log(embeber);
  const mostrarMenu = embeber !== "true";

  return (
    <Box
      className="bg-transparent paso-tres"
      sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}
    >
      {/* cards */}

      {/* Renderizado condicional usando ternario */}
      {mostrarMenu ? (
        <>
          <Typography
            className="text-center text-2xl pt-8 pb-0"
            component="h2"
            variant="h6"
            sx={{ mb: 0 }}
          >
            {nombreSistema}
          </Typography>
        </>
      ) : null}

      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {/* Rutas Clientes */}
        {location.pathname == "/inicio" && <Inicio />}
        {location.pathname == "/iniciar-registro" && <CrearFicha />}

        {/* Rutas Usuarios Mercosur */}
        {location.pathname == "/bo-inicio" && <InicioBo />}

        {location.pathname == "/bo-fichas-nuevas" && <FichasNuevas />}
        {location.pathname == "/bo-fichas-en-pausa" && <FichasEnPausa />}

        {location.pathname == "/bo-fichas-en-cumplimiento" && (
          <FichasPorRevision />
        )}

        {location.pathname == "/bo-fichas-lcft-listas-y-noticias" && (
          <FichasEnRevision />
        )}

        {location.pathname == "/bo-fichas-de-pep" && <RegistrosPep />}

        {location.pathname == "/bo-fichas-notitia-criminis" && (
          <RegistrosNoticiasCrimen />
        )}
        {location.pathname == "/bo-fichas-devueltas" && <FichasDevueltas />}

        {location.pathname == "/bo-fichas-aprobadas" && <FichasAprobadas />}

        {location.pathname == "/bo-fichas-activas" && <FichasActivas />}

        {location.pathname == "/bo-fichas-rechazadas" && <FichasRechazadas />}

        {location.pathname == "/bo-estatus-general" && <EstatusGeneral />}

        {location.pathname == "/bo-formato" && <Preview />}

        {location.pathname == "/bo-fichas-firmadas" && <FichasFirmadas />}

        {location.pathname == "/bo-crear-formato-csv" && <Paso1 />}
        {location.pathname == "/bo-crear-formato-json" && <Paso2 />}
        {location.pathname == "/bo-enviar-json" && <Paso3 />}
      </Grid>

      {/* <Copyright sx={{ my: 23 }} /> */}
      <Copyright />
    </Box>
  );
}
