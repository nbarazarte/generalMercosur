import { useState } from "react";
import axiosSeguridad from "../../../api/axiosSeguridad";
import getDeviceInfo from "../../../helper/getDeviceInfo";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/authSlice";

/**
 * Custom Hook para gestionar la lógica de autenticación y recuperación de clave.
 */
export const useLoginAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [toasts, setToasts] = useState([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({
    email: false,
    password: false,
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    const errors = { email: false, password: false };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginEmail || !emailRegex.test(loginEmail.trim())) {
      errors.email = true;
      valid = false;
    }
    if (!loginPassword) {
      errors.password = true;
      valid = false;
    }

    setLoginErrors(errors);
    if (!valid) return;

    setIsLoginLoading(true);

    try {
      const { deviceId, deviceName } = await getDeviceInfo();

      const response = await axiosSeguridad.post(`/login`, {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        device_id: deviceId,
        device_name: deviceName,
      });

      dispatch(setUser(response.data));

      showToast("¡Sesión iniciada correctamente!", "success");
      navigate("/home");
    } catch (error) {
      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message) ||
        (isNetworkError && error.message !== "Faltan variables de entorno."
          ? "No hay conexión con la API."
          : error.message);

      showToast(errorMessage, "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    let valid = true;
    const errors = { email: false, password: loginErrors.password };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginEmail || !emailRegex.test(loginEmail.trim())) {
      errors.email = true;
      valid = false;
    }

    setLoginErrors(errors);
    if (!valid) return;

    setIsLoginLoading(true);

    try {
      const response = await axiosSeguridad.post(`/forgot-password`, {
        email: loginEmail.trim(),
      });

      showToast(
        response.data.message ||
          "Si el correo está registrado, recibirás un enlace.",
        "success",
      );
    } catch (error) {
      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message) ||
        (isNetworkError && error.message !== "Faltan variables de entorno."
          ? "No hay conexión con la API."
          : error.message);

      showToast(errorMessage, "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  return {
    toasts,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    loginErrors,
    setLoginErrors,
    isLoginLoading,
    handleLoginSubmit,
    handleRecoverPassword,
  };
};

export default useLoginAdmin;
