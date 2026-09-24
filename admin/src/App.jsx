// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthLayout from "./pages/layouts/AuthLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Home, { MainAside } from "./pages/systems/home/home";

// Rutas de los sistemas:
import Admin from "./pages/systems/admin/admin";
import RRHH from "./pages/systems/rrhh/rrhh";
import Tickets from "./pages/systems/tickets/tickets";
import KCS from "./pages/systems/kcs/kcs";

// Componente para mostrar la pantalla de carga previa a cada sistema
const SystemLoaderWrapper = ({ systemName, children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="system-loader-screen">
        <div className="loader-content">
          <div className="spinner"></div>
          <h3>Entrando al {systemName}</h3>
          <p>Por favor, espera un momento</p>
        </div>
      </div>
    );
  }

  return children;
};

// Componente Guard/Protector de Rutas
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

// Componente para evitar que usuarios ya autenticados entren de nuevo a /login
const PublicOnlyRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (isAuthenticated) {
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
        {/* Vista principal home (Sin pantalla de carga) */}
        <Route
          element={
            <AuthLayout asideContent={<MainAside />} showLogout={true} />
          }
        >
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Páginas de los sistemas con pantalla de carga */}
        <Route
          path="/admin"
          element={
            <SystemLoaderWrapper systemName="Sistema de Administración">
              <Admin />
            </SystemLoaderWrapper>
          }
        />
        <Route
          path="/rrhh"
          element={
            <SystemLoaderWrapper systemName="Sistema de Recursos Humanos">
              <RRHH />
            </SystemLoaderWrapper>
          }
        />
        <Route
          path="/tickets"
          element={
            <SystemLoaderWrapper systemName="Sistema de Tickets">
              <Tickets />
            </SystemLoaderWrapper>
          }
        />
        <Route
          path="/kcs"
          element={
            <SystemLoaderWrapper systemName="Sistema de Base de Conocimiento (KCS)">
              <KCS />
            </SystemLoaderWrapper>
          }
        />
      </Route>

      {/* CUALQUIER OTRA RUTA: Redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;