import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeLayout from "./pages/layouts/HomeLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Home, { MainAside } from "./pages/systems/home/home";

// Rutas de los sistemas:

//admin:
import UsuariosAccesos from "./pages/systems/admin/usuariosAccesos";
import Sistemas from "./pages/systems/admin/sistemas";
import Dashboard from "./pages/systems/admin/dashboard";

//rrhh:
import RRHH from "./pages/systems/rrhh/rrhh";

//tickets:
import DashboardTickets from "./pages/systems/tickets/dashboardTickets";
import CasosTickets from "./pages/systems/tickets/casosTickets";

//kcs:
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
  const lastActiveSystem = localStorage.getItem("active_system");
  const loaderSeen =
    localStorage.getItem(`loader_seen_${systemKey}`) === "true";

  const isComingFromOutside = lastActiveSystem !== systemKey;
  const shouldShowLoader = isComingFromOutside || !loaderSeen;

  const [loading, setLoading] = useState(shouldShowLoader);

  useEffect(() => {
    if (!shouldShowLoader) return;

    localStorage.setItem(`loader_seen_${systemKey}`, "true");
    localStorage.setItem("active_system", systemKey);

    // Oculta el loader tras 1.5 segundos exactos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [shouldShowLoader, systemKey]);

  if (loading) {
    return (
      <div className="system-loader-screen">
        <div className="loader-bg-glow glow-1"></div>
        <div className="loader-bg-glow glow-2"></div>

        <div className="loader-card">
          <div className="loader-icon-container">
            <div className="loader-ring"></div>
            <div className="loader-ring ring-reverse"></div>
            <div className="loader-core-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <div className="loader-text-group">
            <span className="loader-badge">Accediendo al entorno</span>
            <h3 className="loader-title">{systemName}</h3>
            <p className="loader-subtitle">
              Cargando módulos y permisos de usuario...
            </p>
          </div>

          <div className="loader-progress-wrapper">
            <div className="loader-progress-bar">
              {/* Animación fluida controlada directamente por CSS */}
              <div className="loader-progress-fill-animated"></div>
            </div>
            <div className="loader-progress-info">
              <span>Sincronizando</span>
              <span className="loader-status-text">Cargando...</span>
            </div>
          </div>
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
                <Outlet /> {/* Permite renderizar las subrutas hijas */}
              </SystemLoaderWrapper>
            }
          >
            {/* Subruta 0: Dashboard */}
            <Route path="dashboard" element={<DashboardTickets />} />

             {/* Subruta 1: Casos / Tickets */}
            <Route path="casos-tickets" element={<CasosTickets />} />

            {/* Redirección por defecto al entrar solo a /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

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
