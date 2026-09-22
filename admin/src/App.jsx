// src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthLayout from "./layouts/AuthLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Home, { MainAside } from "./pages/systems/home/home";

// Rutas de los sistemas:
import Admin from "./pages/systems/admin/admin";
import RRHH from "./pages/systems/rrhh/rrhh";
import Tickets from "./pages/systems/tickets/tickets";
import KCS from "./pages/systems/kcs/kcs";

// Componente Guard/Protector de Rutas
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const token = localStorage.getItem("cl_token");

  // Si está autenticado en Redux o tiene token válido en localStorage, renderiza las rutas hijas
  if (isAuthenticated || token) {
    return <Outlet />;
  }

  // Si no está autenticado, redirige al login
  return <Navigate to="/login" replace />;
};

// Componente para evitar que usuarios ya autenticados entren de nuevo a /login
const PublicOnlyRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const token = localStorage.getItem("cl_token");

  if (isAuthenticated || token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Públicas (Solo accesibles si NO estás autenticado) */}
      <Route element={<PublicOnlyRoute />}>
        <Route
          element={<AuthLayout asideContent={LoginAside} showLogout={false} />}
        >
          <Route path="/login" element={<Login />} />
        </Route>
      </Route>

      {/* Rutas Protegidas (Solo accesibles si ESTÁS autenticado) */}
      <Route element={<ProtectedRoute />}>
        {/* Vista principal home */}
        <Route
          element={
            <AuthLayout asideContent={<MainAside />} showLogout={true} />
          }
        >
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Páginas de los sistemas */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/rrhh" element={<RRHH />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/kcs" element={<KCS />} />
      </Route>

      {/* CUALQUIER OTRA RUTA: Redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
