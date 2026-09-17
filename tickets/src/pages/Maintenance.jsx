import React from "react";
import { Box, CssBaseline, Typography, Stack, Card as MuiCard, styled } from "@mui/material";
import AppTheme from "./shared-theme/AppTheme";
import ColorModeSelect from "./shared-theme/ColorModeSelect";
import Logo from "../components/Logo";
import TituloApp from "../components/TituloApp";
import Lottie from "lottie-react";
import MaintenanceAnim from "../assets/LottieFiles/Under Maintenance.json";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  margin: "auto",
  textAlign: "center",
  [theme.breakpoints.up("sm")]: { maxWidth: "500px" },
  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
}));

const Container = styled(Stack)(({ theme }) => ({
  height: "100dvh",
  padding: theme.spacing(2),
  backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  ...theme.applyStyles("dark", {
    backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));

const Maintenance = (props) => (
  <AppTheme {...props}>
    <CssBaseline enableColorScheme />
    <Container justifyContent="center">
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <Card>
        <Logo />
        <TituloApp />
        <Lottie animationData={MaintenanceAnim} style={{ width: "180px", margin: "0 auto" }} />
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Mantenimiento</Typography>
        <Typography variant="body1" color="text.secondary">
          Estamos mejorando nuestra plataforma. Volveremos pronto.
        </Typography>
      </Card>
    </Container>
  </AppTheme>
);

export default Maintenance;