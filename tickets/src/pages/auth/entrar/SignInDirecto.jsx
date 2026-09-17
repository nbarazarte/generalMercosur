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
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useEffect } from "react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [flag, setFlag] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const correo = searchParams.get("correo") || "";
  const clave = searchParams.get("clave") || "";

  const url = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;

  useEffect(() => {
    setFlag(true);
    const loguearse = async () => {
      if (correo && clave) {
        setEmail(correo);
        setPassword(clave);

        try {
          const response = await axios.post(
            `${url}login`,
            { email, password },
            { headers: { Authorization: `Bearer ${tokenApi}` } },
          );

          localStorage.setItem("cl_userId", String(response.data.id));
          localStorage.setItem("cl_token", response.data.token);
          localStorage.setItem("cl_userEmail", response.data.email);

          localStorage.setItem("embeber", "true");

          dispatch(setUsuarioId(response.data.id));
          window.location.href = "/inicio";
        } catch (err) {
          setError(err.response?.data || "Error al conectar con el servidor");
        }
      }
    };

    loguearse();
  }, [!flag]);

  return (
    <div className="bg-[#1a1a1a] bg-cover bg-center h-full w-full">
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
        </SignInContainer>
      </AppTheme>
    </div>
  );
};

export default SignIn;
