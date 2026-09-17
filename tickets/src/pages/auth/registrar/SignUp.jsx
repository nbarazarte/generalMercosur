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
import AppTheme from "../../shared-theme/AppTheme";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import { useNavigate, useSearchParams } from "react-router-dom"; // Añadido useSearchParams
import axios from "axios";
import Logo from "../../../components/Logo";
import TituloApp from "../../../components/TituloApp";
import ImagenFondo from "../../../assets/images/fondo-cuspal.jpeg";
import { useDispatch } from "react-redux";
import { setUsuarioId } from "../../../store/plantillaSlice";
import Alert from "@mui/material/Alert";
import Lottie from "lottie-react";
import emailEnviado from "../../../assets/LottieFiles/Email Animation.json";
import enviandoCorreo from "../../../assets/LottieFiles/Sending animation.json";
import cifrando from "../../../assets/LottieFiles/locker and secure.json";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Obtener el token de la URL
  const tokenUrl = searchParams.get("token");

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const direccion = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const url = direccion;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;
  const headers = { Authorization: `Bearer ${tokenApi}` };

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [mensajeEnviando, setMensajeEnviando] = useState("");

  const validateInputs = () => {
    let isValid = true;

    // Solo validar email si no hay token (proceso de invitación)
    // Limpiar el email: quitar espacios y pasar a minúsculas
    const cleanedEmail = email.trim().toLowerCase();
    setEmail(cleanedEmail); // Actualizamos el estado para que el usuario vea el cambio

    if (!tokenUrl) {
      // Validar con el valor ya limpio
      if (!cleanedEmail || !/\S+@\S+\.\S+/.test(cleanedEmail)) {
        setEmailError(true);
        setEmailErrorMessage("Dirección de correo electrónico inválida.");
        isValid = false;
      } else {
        setEmailError(false);
        setEmailErrorMessage("");
      }
    }

    // Solo validar password si hay token (proceso de registro real)
    if (tokenUrl) {
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
    }

    return isValid;
  };

  const handleSubmit = async () => {
    // 1. Iniciamos el estado de carga y limpiamos mensajes previos
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (tokenUrl) {
        // REGISTRO FINAL: Enviamos token y password
        const response = await axios.post(
          `${url}register`,
          { token: tokenUrl, password },
          { headers },
        );

        setSuccess("Registro exitoso. Redirigiendo...");

        localStorage.setItem("cl_userId", String(response.data.id));
        localStorage.setItem("cl_token", response.data.token);
        localStorage.setItem("cl_userEmail", response.data.email);
        dispatch(setUsuarioId(response.data.id));
        //dispatch(setUserName(response.data.username));
        setTimeout(() => {
          window.location.href = `/inicio`;
        }, 2000);
      } else {
        setMensajeEnviando(`Enviando correo a ${email}...`);
        // SOLICITUD DE INVITACIÓN: Enviamos solo email
        const respuesta = await axios.post(
          `${url}request-register`,
          { email },
          { headers },
        );

        //console.log(respuesta);
        setMensajeEnviando(`Enviando correo a ${email}`);

        setSuccess(`${respuesta.data.message}`);
      }
    } catch (err) {
      // Si hay error, el loading también debe detenerse

      setError(err.response?.data?.error || "Ocurrió un error en el servidor");
      setSuccess("");
    } finally {
      // 2. IMPORTANTE: El loading se apaga siempre al terminar la petición
      // a menos que estemos redirigiendo (en el caso de éxito de registro final)
      if (!tokenUrl) {
        setMensajeEnviando("");
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-cover bg-center h-full w-full">
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <SignUpContainer direction="column" justifyContent="space-between">
          <Card>
            <Logo />
            <TituloApp />

            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {!loading && (
                <>
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                      width: "100%",
                      fontSize: "clamp(1rem, 10vw, 1.15rem)",
                    }}
                  >
                    {tokenUrl ? "Completar Registro" : "Registro de Usuarios"}
                  </Typography>

                  {/* Solo mostrar Email si no hay token */}
                  {!tokenUrl && (
                    <FormControl>
                      <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        placeholder="usuario@correo.com"
                        name="email"
                        autoComplete="email"
                        variant="outlined"
                        error={emailError}
                        helperText={emailErrorMessage}
                        color={emailError ? "error" : "primary"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}

                        /* onChange={(e) => {
                          // 1. Transformamos a mayúsculas y guardamos en una constante
                          const upperValue = e.target.value.toUpperCase();
                          // 2. Pasamos la constante transformada al estado
                          setEmail(upperValue);
                        }} */
                      />
                    </FormControl>
                  )}

                  {/* Solo mostrar Password si hay token */}
                  {tokenUrl && (
                    <FormControl>
                      <FormLabel htmlFor="password">Contraseña</FormLabel>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        variant="outlined"
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        color={passwordError ? "error" : "primary"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </FormControl>
                  )}

                  {error && <Alert severity="error">{error}</Alert>}

                  {success && (
                    <Alert icon={false} severity="success">
                      <div className="flex flex-row items-center">
                        <Lottie
                          animationData={emailEnviado}
                          loop={true}
                          style={{ width: "25%", height: "25%" }}
                        />
                        <p className="text-base font-extralight text-red-500">
                          {error}
                        </p>
                        {success}
                      </div>
                    </Alert>
                  )}

                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      if (validateInputs()) {
                        handleSubmit();
                      }
                    }}
                  >
                    {tokenUrl ? "Guardar Datos" : "Enviar Invitación"}
                  </Button>
                </>
              )}

              {loading && (
                <div className="flex flex-col items-center">
                  <Lottie
                    animationData={!mensajeEnviando ? cifrando : enviandoCorreo}
                    loop={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                  {mensajeEnviando} {error}
                </div>
              )}
            </Box>
          </Card>
        </SignUpContainer>
      </AppTheme>
    </div>
  );
}
