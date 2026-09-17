import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import ReactGA from "react-ga";
import axios from "axios";
import "./styles.css";

// Material UI
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Iconos
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import Layout from "./pages/layout/Layout";

// Paginas Cliente
import Maintenance from "./pages/Maintenance";
import Entrar from "./pages/auth/entrar/SignIn";
import EntrarLegacy from "./pages/auth/entrar/SignInDirecto";
import Registrar from "./pages/auth/registrar/SignUp";
import ResetPassword from "./pages/auth/entrar/components/ResetPassword";

// Paginas BackOffice:
import EntrarBo from "./pages/auth/entrarBo/SignIn";
import RegistrarBo from "./pages/auth/registrarBo/SignUp";
import ResetPasswordBo from "./pages/auth/entrarBo/components/ResetPassword";

library.add(fas, fab, far);

// ✅ Manteniendo tus variables como las usas
ReactGA.initialize(import.meta.env.REACT_APP_URL_GOOGLE_ANALITICS);

// Interceptor de Axios: Si el servidor responde 503, forzamos recarga
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 503) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.pageview(location.pathname + location.search);
  }, [location]);
  return null;
};

const AppRoutes = ({ isMaintenanceMode }) => {
  const location = useLocation();
  const isBO = location.pathname.startsWith("/bo");

  const token = isBO
    ? localStorage.getItem("bo_token")
    : localStorage.getItem("cl_token");

  return (
    <>
      <RouteChangeTracker />

      <Routes>
        {/* Rutas Públicas - BackOffice */}
        <Route path="/bo-entrar" element={<EntrarBo />} />
        <Route path="/bo-registrar" element={<RegistrarBo />} />
        <Route path="/bo-completar-registro" element={<RegistrarBo />} />
        <Route path="/bo-reset-password" element={<ResetPasswordBo />} />

        {/* Rutas Privadas - BackOffice */}
        <Route
          path="/bo-inicio"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-estatus-general"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-nuevas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-en-pausa"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-en-cumplimiento"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-lcft-listas-y-noticias"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-de-pep"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-notitia-criminis"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-devueltas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-aprobadas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-activas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-firmadas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-fichas-rechazadas"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-formato"
          element={token ? <Layout /> : <Navigate to="/" replace />}
        />

        <Route
          path="/bo-crear-formato-csv"
          element={token ? <Layout /> : <Navigate to="/" />}
        />
        <Route
          path="/bo-crear-formato-json"
          element={token ? <Layout /> : <Navigate to="/" />}
        />
        <Route
          path="/bo-enviar-json"
          element={token ? <Layout /> : <Navigate to="/" />}
        />

        {isMaintenanceMode ? (
          <>
            <Route path="/mantenimiento" element={<Maintenance />} />
            <Route
              path="*"
              element={<Navigate to="/mantenimiento" replace />}
            />
          </>
        ) : (
          <>
            {/* Rutas Públicas - Cliente */}
            <Route path="/legacy" element={<EntrarLegacy />} />
            <Route path="/" element={<Entrar />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/completar-registro" element={<Registrar />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas Privadas - Cliente */}
            <Route
              path="/inicio"
              element={token ? <Layout /> : <Navigate to="/" replace />}
            />

            <Route
              path="/iniciar-registro"
              element={token ? <Layout /> : <Navigate to="/" replace />}
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  );
};

function App() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(null);
  const prefijo = `/`;

  // ✅ Para detectar cambio false -> true sin depender del estado en deps
  const prevMaintenanceRef = useRef(null);

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const apiUrl = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;

        // ✅ Evita el crash si apiUrl viene undefined
        if (!apiUrl) {
          console.error(
            "REACT_APP_URL_API_LOCAL_SEGURIDAD no está definida (import.meta.env...).",
          );
          setIsMaintenanceMode(false);
          return;
        }

        // ✅ Garantiza slash final para concatenar bien
        const baseURL = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;

        const res = await axios.get(`${baseURL}config/mantenimiento`);
        const maintenanceActive = res.data.mantenimiento;

        // ✅ Si cambia de false a true, recarga
        const prev = prevMaintenanceRef.current;
        if (prev === false && maintenanceActive === true) {
          window.location.reload();
        }

        prevMaintenanceRef.current = maintenanceActive;
        setIsMaintenanceMode(maintenanceActive);
      } catch (error) {
        console.error("Error consultando mantenimiento:", error);
        setIsMaintenanceMode(false);
      }
    };

    checkMaintenanceStatus();

    const interval = setInterval(checkMaintenanceStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pantalla de carga inicial
  if (isMaintenanceMode === null) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router basename={prefijo}>
      <AppRoutes isMaintenanceMode={isMaintenanceMode} />
    </Router>
  );
}

export default App;
