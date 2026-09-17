import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import axios from "axios";
import AppTheme from "../../../shared-theme/AppTheme";
import ColorModeSelect from "../../../shared-theme/ColorModeSelect";
import Logo from "../../../../components/Logo";
import TituloApp from "../../../../components/TituloApp";

// Reutilizamos tus estilos de SignIn
const autofillStyles = {
  "& .MuiInputBase-input": {
    "&:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
      WebkitTextFillColor: "inherit !important",
      transition: "background-color 5000000s ease-in-out 0s !important",
    },
  },
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const ResetContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
  position: "relative",
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

const ResetPassword = (props) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const url = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      await axios.post(
        `${url}reset-password`,
        { token, password },
        { headers: { Authorization: `Bearer ${tokenApi}` } },
      );
      // Podrías usar un modal de éxito, aquí un alert simple por brevedad
      alert("Contraseña actualizada con éxito");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "El enlace ha expirado o es inválido.",
      );
    }
  };

  return (
    <div className="bg-cover bg-center h-full w-full">
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <ResetContainer direction="column" justifyContent="space-between">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
          <Card>
            <Logo />
            <TituloApp />
            <Typography
              component="h1"
              variant="h1"
              sx={{
                width: "100%",
                fontSize: "clamp(1rem, 10vw, 1.15rem)",
                mb: 1,
              }}
            >
              Nueva Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Por favor, ingresa tu nueva clave de acceso.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              {error && (
                <div className="flex flex-row items-center gap-2">
                  <Lottie
                    animationData={ErrorForm}
                    loop={false}
                    style={{ width: "24px", height: "24px" }}
                  />
                  <p className="text-base font-extralight text-red-500">
                    {error}
                  </p>
                </div>
              )}

              <FormControl>
                <FormLabel htmlFor="password">Nueva Contraseña</FormLabel>
                <TextField
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••"
                  required
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={autofillStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="confirmPassword">
                  Confirmar Contraseña
                </FormLabel>
                <TextField
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••"
                  required
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={autofillStyles}
                />
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1 }}
              >
                Actualizar Contraseña
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/login")}
                fullWidth
                variant="text"
                sx={{ textTransform: "none" }}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          </Card>
        </ResetContainer>
      </AppTheme>
    </div>
  );
};

export default ResetPassword;
