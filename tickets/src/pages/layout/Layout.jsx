import * as React from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import MainGrid from "./components/MainGrid";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
//import imagenFondo from "../../assets/images/fondoLight.png";
//import imagenFondo_oscuro from "../../assets/images/fondoDark.png";
import { useSelector } from "react-redux";

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import { useState } from "react";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const muiMode = useSelector((state) => state.plantilla.muiMode);

  //console.log("muiMode", muiMode);

  const [embeber, setEmbeber] = useState(
    localStorage.getItem("embeber") || null,
  );

  // console.log(localStorage.getItem("embeber"));
  // console.log(embeber);
  const mostrarMenu = embeber !== "true";

  //console.log(mostrarMenu);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        {/* Renderizado condicional usando ternario */}
        {mostrarMenu ? (
          <>
            <SideMenu />
            <AppNavbar />
          </>
        ) : null}

        {/* Main content */}

        {location.pathname == "/inicio" && (
          <Box
            //className="bg-transparent paso-tres"
            sx={{
              width: "100%",
              maxWidth: { sm: "100%", md: "1900px" },
              /* backgroundImage:
                muiMode == "light"
                  ? `url(${imagenFondo})`
                  : `url(${imagenFondo_oscuro})`, */
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: "100vh",
            }}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              {mostrarMenu ? (
                <>
                  <Header />
                </>
              ) : null}

              <MainGrid />
            </Stack>
          </Box>
        )}

        {location.pathname != "/inicio" && (
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: "auto",
            })}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              {mostrarMenu ? (
                <>
                  <Header />
                </>
              ) : null}

              <MainGrid />
            </Stack>
          </Box>
        )}
      </Box>
    </AppTheme>
  );
}
