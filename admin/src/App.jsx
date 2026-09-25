import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeLayout from "./pages/layouts/HomeLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Home, { MainAside } from "./pages/systems/home/home";

// Rutas de los sistemas:
import UsuariosAccesos from "./pages/systems/admin/usuariosAccesos";
import Sistemas from "./pages/systems/admin/sistemas";
import Dashboard from "./pages/systems/admin/dashboard";

import RRHH from "./pages/systems/rrhh/rrhh";
import Tickets from "./pages/systems/tickets/tickets";
import KCS from "./pages/systems/kcs/kcs";

// Rastreador de navegación para todos los sistemas
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Obtenemos el prefijo de la ruta actual (ej: "/admin", "/rrhh", "/tickets", "/kcs")
    const currentPath = location.pathname;

    // Si el usuario está fuera de un sistema (ej: /home), limpiamos la bandera de 'dentro del sistema'
    const systemPaths = ["/admin", "/rrhh", "/tickets", "/kcs"];
    const activeSystem = systemPaths.find((path) =>
      currentPath.startsWith(path),
    );

    if (!activeSystem) {
      localStorage.setItem("active_system", "none");
    } else {
      localStorage.setItem("active_system", activeSystem);
    }
  }, [location]);

  return null;
};

// Componente Wrapper genérico para la pantalla de carga previa
const SystemLoaderWrapper = ({ systemName, systemKey, children }) => {
  const location = useLocation();

  // Comprobamos el sistema activo en el que el usuario ya se encontraba
  const lastActiveSystem = localStorage.getItem("active_system");
  const loaderSeen =
    localStorage.getItem(`loader_seen_${systemKey}`) === "true";

  // Si el usuario navegó desde otro lugar fuera de este sistema, es una entrada nueva
  const isComingFromOutside = lastActiveSystem !== systemKey;

  // Solo muestra la pantalla de carga si entra desde afuera o nunca ha visto el loader
  const shouldShowLoader = isComingFromOutside || !loaderSeen;

  const [loading, setLoading] = useState(shouldShowLoader);

  useEffect(() => {
    if (shouldShowLoader) {
      localStorage.setItem(`loader_seen_${systemKey}`, "true");
      localStorage.setItem("active_system", systemKey);

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [shouldShowLoader, systemKey]);

  if (loading) {
    return (
      <div className="system-loader-screen">
        <div className="loader-content">
          <div className="spinner"></div>
          <h3>{systemName}</h3>
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
  // 1. Estado inicial del tema leyendo localStorage al montar la app
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // 2. Sincroniza la clase .dark en <html> o <body> inmediatamente al recargar (F5)
  useEffect(() => {
    const root = document.documentElement; // Cambia a document.body si usas la clase en el body
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas Públicas (Solo accesibles si NO estás autenticado) */}
        <Route element={<PublicOnlyRoute />}>
          <Route
            element={
              <HomeLayout asideContent={LoginAside} showLogout={false} />
            }
          >
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>

        {/* Rutas Protegidas (Solo accesibles si ESTÁS autenticado) */}
        <Route element={<ProtectedRoute />}>
          {/* Vista principal home (Sin pantalla de carga) */}
          <Route
            element={
              <HomeLayout asideContent={<MainAside />} showLogout={true} />
            }
          >
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Páginas de los sistemas con pantalla de carga */}

          {/* Sistema de Administración General */}
          <Route
            path="/admin"
            element={
              <SystemLoaderWrapper
                systemName="Sistema de Administración General"
                systemKey="/admin"
              >
                <Outlet /> {/* Permite renderizar las subrutas hijas */}
              </SystemLoaderWrapper>
            }
          >
            {/* Subruta 0: Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Subruta 1: Usuarios y Accesos */}
            <Route path="usuarios-accesos" element={<UsuariosAccesos />} />

            {/* Subruta 2: Sistemas */}
            <Route path="sistemas" element={<Sistemas />} />

            {/* Redirección por defecto al entrar solo a /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Sistema de Recursos Humanos */}
          <Route
            path="/rrhh"
            element={
              <SystemLoaderWrapper
                systemName="Sistema de Recursos Humanos"
                systemKey="/rrhh"
              >
                <RRHH />
              </SystemLoaderWrapper>
            }
          />

          {/* Sistema de Tickets */}
          <Route
            path="/tickets"
            element={
              <SystemLoaderWrapper
                systemName="Sistema de Tickets"
                systemKey="/tickets"
              >
                <Tickets />
              </SystemLoaderWrapper>
            }
          />

          {/* Sistema de Base de Conocimiento (KCS) */}
          <Route
            path="/kcs"
            element={
              <SystemLoaderWrapper
                systemName="Sistema de Base de Conocimiento (KCS)"
                systemKey="/kcs"
              >
                <KCS />
              </SystemLoaderWrapper>
            }
          />
        </Route>

        {/* CUALQUIER OTRA RUTA: Redirige al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
