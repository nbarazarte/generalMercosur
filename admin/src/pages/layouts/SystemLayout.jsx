import { useState, useEffect, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import { DynamicIcon } from "../components/IconCatalog";
import Footer from "../components/Footer";

import { useSelector, useDispatch } from "react-redux";
import { updateAccessToken, logout } from "../../store/authSlice";
import axiosSeguridad from "../utils/axiosSeguridad";
import "../../../src/systems.css";

export default function SystemLayout({ children, identificacion }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth?.user?.id);
  const usuario = useSelector((state) => state.auth?.user);
  const nombre = usuario?.nombre;
  const apellido = usuario?.apellido;
  const sistemas = useSelector((state) => state.auth?.user.sistemasOpciones);
  const refreshToken = useSelector((state) => state.auth?.refreshToken);

  // --- ESTADOS Y REFERENCIAS PARA EL CONTROL DE SESIÓN ---
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos de cuenta regresiva en el modal

  const warningTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const startSessionTimer = () => {
    clearSessionTimers();
    setShowWarning(false);

    // Token dura 1 hora. Avisamos 1 minuto antes (faltando 60s).
    const tokenLifetimeMs = 60 * 60 * 1000; // 1 hora total
    const warningTimeMs = tokenLifetimeMs - 60 * 1000; // Avisar faltando 1 minuto

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningTimeMs);
  };

  const startCountdown = () => {
    let seconds = 60; // 60 segundos de cuenta regresiva en el modal
    setTimeLeft(seconds);

    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);

    intervalTimerRef.current = setInterval(() => {
      seconds -= 1;
      setTimeLeft(seconds);
      if (seconds <= 0) {
        clearInterval(intervalTimerRef.current);
        handleForceLogout();
      }
    }, 1000);
  };

  // --- INICIO DE TEMPORIZADORES CONDICIONALES Y VALIDACIÓN AL MONTAR ---
  useEffect(() => {
    const initSessionCheck = async () => {
      if (refreshToken) {
        try {
          // Intentamos renovar el token al cargar/recargar la página
          const response = await axiosSeguridad.post("/refresh-token", {
            refreshToken,
          });
          const nuevoToken = response.data.token || response.data.accessToken;
          dispatch(updateAccessToken(nuevoToken));

          // Iniciamos el temporizador normal con un token fresco
          startSessionTimer();
        } catch (err) {
          console.error(
            "El Refresh Token ha expirado al recargar la página:",
            err,
          );
          handleForceLogout();
        }
      } else {
        handleForceLogout();
      }
    };

    initSessionCheck();

    return () => clearSessionTimers();
  }, [location.pathname]);

  const handleExtendSession = async () => {
    try {
      if (!refreshToken) {
        throw new Error(
          "No hay Refresh Token disponible en el estado de Redux.",
        );
      }

      const response = await axiosSeguridad.post("/refresh-token", {
        refreshToken,
      });

      const nuevoToken = response.data.token || response.data.accessToken;
      dispatch(updateAccessToken(nuevoToken));

      startSessionTimer();
    } catch (err) {
      console.error("Error al extender la sesión:", err);
      handleForceLogout();
    }
  };

  const handleForceLogout = async () => {
    clearSessionTimers();
    try {
      if (userId) {
        await axiosSeguridad.post("/logout", { userId });
      }
    } catch (err) {
      console.error(
        "No se pudo notificar el cierre de sesión al servidor:",
        err,
      );
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const getInfoSistema = (listaSistemas, nombreSistema) => {
    const sistemaEncontrado = listaSistemas?.find(
      (s) => s.sistema === nombreSistema,
    );

    const nav =
      sistemaEncontrado?.opciones
        ?.filter((opcion) => opcion.tiene_permiso)
        .map((item) => ({
          to: item.ruta_opcion,
          label: item.opcion,
          icon:
            item.ic || item.str_icono || item.opcion_icono || "FiCheckSquare",
        })) || [];

    return {
      sistemaNombre: sistemaEncontrado?.sistema || "",
      sistemaDescripcion: sistemaEncontrado?.descripcion || "",
      rol: sistemaEncontrado?.rol || "",
      nav: nav,
    };
  };

  const { rol, nav, sistemaNombre, sistemaDescripcion } = getInfoSistema(
    sistemas,
    identificacion,
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const iniciales = (n) =>
    n
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  return (
    <div className="ma-shell">
      <div
        className={`ma-side-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {showWarning && (
        <div className="fixed inset-0 w-screen h-screen bg-black/50 flex justify-center items-center z-[99999]">
          <div className="bg-[var(--merco-bg,#ffffff)] text-[var(--merco-text,#333)] p-6 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] max-w-[400px] w-[90%] text-center border border-[var(--merco-border,#e2e8f0)]">
            <h3 className="mb-3 text-[1.2rem] text-[var(--merco-warning,#d8992a)] flex items-center gap-2">
              <DynamicIcon name="FiAlertTriangle" />
              <span>Tu sesión está por expirar</span>
            </h3>
            <p className="mb-5 text-[0.95rem] leading-[1.5]">
              Por motivos de seguridad, tu sesión caducará en{" "}
              <b>{timeLeft} segundos</b> por inactividad. ¿Deseas mantenerla
              activa?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleExtendSession}
                className="btn btn-primary py-2 px-4 bg-[#10b981] border-none text-white rounded-md cursor-pointer font-bold"
              >
                Sí, extender sesión
              </button>
              <button
                onClick={handleForceLogout}
                className="btn btn-ghost py-2 px-4 bg-[#ef4444] border-none text-white rounded-md cursor-pointer font-bold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`ma-side ${mobileOpen ? "open" : ""}`}>
        <div className="flex flex-row justify-between items-start">
          <nav className="flex flex-col gap-2.5">
            <NavLink
              key="home"
              to="/home"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="flex flex-row items-center gap-2">
                <span className="ma-icon-wrapper">
                  <DynamicIcon name="FiHome" fallback="FiGrid" />
                </span>
                <span>Inicio</span>
              </div>
            </NavLink>

            {nav.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <div className="flex flex-row items-center gap-2">
                  <span className="ma-icon-wrapper">
                    <DynamicIcon name={item.icon} fallback="FiGrid" />
                  </span>
                  <span>{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col flex-1 justify-end pb-2">
          <div className="flex flex-col gap-2.5 px-1 mt-auto">
            <div className="h-px bg-white/10 my-2 w-full" />
            <div className="flex items-center gap-3 w-full px-2 py-1.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-sm shrink-0 shadow-inner">
                {iniciales(`${nombre} ${apellido}`)}
              </div>
              <div className="min-w-0 flex-1">
                <b className="block text-xs font-semibold text-slate-100 truncate">
                  {nombre} {apellido}
                </b>
                <small className="block text-[11px] text-slate-400 truncate">
                  {rol}
                </small>
              </div>
              <div className="flex flex-row gap-8">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="ma-main flex flex-col min-h-screen">
        <header className="ma-topbar flex items-center gap-3 w-full box-border pt-[10px] pb-2">
          <div className="flex items-center gap-3 flex-auto min-w-0">
            <button
              className="ma-burger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <DynamicIcon name="FiMenu" fallback="FiMenu" />
            </button>

            <div className="min-w-0">
              {sistemaNombre && (
                <h2 className="break-words m-0 leading-[1.2] text-[1.15rem]">
                  {sistemaNombre}
                </h2>
              )}
              {sistemaDescripcion && (
                <p className="mt-[2px] mb-0 mx-0 leading-[1.2] text-[0.825rem]">
                  {sistemaDescripcion}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="ma-content flex-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}
