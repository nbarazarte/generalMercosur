import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateAccessToken, logout } from "../store/authSlice";
import axiosSeguridad from "../api/axiosSeguridad";

export function useSessionManager(locationPathname) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state) => state.auth?.refreshToken);
  const userId = useSelector((state) => state.auth?.user?.id);

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const warningTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const startCountdown = () => {
    let seconds = 60;
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

  const startSessionTimer = () => {
    clearSessionTimers();
    setShowWarning(false);

    const tokenLifetimeMs = 60 * 60 * 1000; // 1 hora
    const warningTimeMs = tokenLifetimeMs - 60 * 1000; // 59 minutos

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningTimeMs);
  };

  const handleExtendSession = async () => {
    try {
      if (!refreshToken) throw new Error("No hay Refresh Token disponible.");
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
      console.error("No se pudo notificar el cierre de sesión:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  useEffect(() => {
    // Excluimos las rutas públicas para que no ejecuten validaciones ni expulsen al login
    const isPublicRoute =
      locationPathname?.includes("/resetear-contrasena") ||
      locationPathname?.includes("/login") ||
      locationPathname?.includes("/forgot-password");

    if (isPublicRoute) {
      clearSessionTimers();
      return;
    }

    const initSessionCheck = async () => {
      if (refreshToken) {
        try {
          const response = await axiosSeguridad.post("/refresh-token", {
            refreshToken,
          });
          const nuevoToken = response.data.token || response.data.accessToken;
          dispatch(updateAccessToken(nuevoToken));
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
  }, [locationPathname]);

  return {
    showWarning,
    timeLeft,
    handleExtendSession,
    handleForceLogout,
  };
}