import React, { useState } from "react";
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
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../../shared-theme/AppTheme";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../../components/Logo";
import TituloApp from "../../../components/TituloApp";
import Lottie from "lottie-react";
import ErrorForm from "../../../assets/LottieFiles/Animation - 1751622035697.json";
import { useDispatch } from "react-redux";
import { setUsuarioId } from "../../../store/plantillaSlice";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link } from "@mui/material";

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

const SignInContainer = styled(Stack)(({ theme }) => ({
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

const SignIn = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const url = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Ingrese un correo electrónico válido.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "La contraseña debe tener al menos 6 caracteres.",
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!isValid) return;

    try {
      const response = await axios.post(
        `${url}login`,
        { email, password },
        { headers: { Authorization: `Bearer ${tokenApi}` } },
      );

      localStorage.setItem("cl_userId", String(response.data.id));
      localStorage.setItem("cl_token", response.data.token);
      localStorage.setItem("cl_userEmail", response.data.email);

      localStorage.setItem("embeber", "false");

      dispatch(setUsuarioId(response.data.id));
      window.location.href = "/inicio";
    } catch (err) {
      setError(err.response?.data || "Error al conectar con el servidor");
    }
  };

  return (
    <div className="bg-cover bg-center h-full w-full">
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
          <Card>
            <Logo />
            <TituloApp />
            <Typography
              component="h1"
              variant="h1"
              sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 1.15rem)" }}
            >
              Iniciar Sesión
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
                <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="usuario@correo.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={autofillStyles}
                />
              </FormControl>

              <FormControl>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FormLabel htmlFor="password">Contraseña</FormLabel>
                  <Link
                    component="button" // Se comporta como botón para accesibilidad pero se ve como link
                    type="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(true);
                    }}
                    sx={{
                      textTransform: "none",
                      textDecoration: "none", // Quita el subrayado inicial si prefieres
                      "&:hover": {
                        textDecoration: "underline", // Aparece el subrayado al pasar el mouse
                      },
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={autofillStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          disableRipple
                          sx={{
                            p: 0, // Sin padding para eliminar el círculo
                            mr: -2, // Pegado al borde derecho
                            backgroundColor: "transparent !important", // Fuerza transparencia total
                            border: "none",
                            outline: "none",
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "transparent !important", // Evita el fondo gris en hover
                              "& .MuiSvgIcon-root": {
                                opacity: 1, // Se ilumina al pasar el mouse
                              },
                            },
                            "&:focus, &:active, &:focus-visible": {
                              outline: "none",
                              border: "none",
                              boxShadow: "none",
                              backgroundColor: "transparent !important",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: "1.1rem", // Más pequeño y fino
                              opacity: 0.6, // Hace que el icono sea translúcido/discreto
                              transition: "opacity 0.2s", // Suaviza el cambio
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <Button type="submit" fullWidth variant="contained">
                Entrar
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/registrar")}
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ mt: 2, textTransform: "none" }}
              >
                ¿No tienes una cuenta? Regístrate
              </Button>
            </Box>

            {/* Componente Modal FUERA del Box form */}
            <ForgotPassword open={open} handleClose={handleClose} />
          </Card>
        </SignInContainer>
      </AppTheme>
    </div>
  );
};

export default SignIn;
