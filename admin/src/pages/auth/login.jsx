import { useState } from "react";
import axiosSeguridad from "../utils/axiosSeguridad";
import getDeviceInfo from "../../helper/getDeviceInfo";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

// Contenido estático para el Aside de Login
export const LoginAside = (
  <div className="aside-content">
    <h1>
      Mercosur
      <br />
      Enterprise Portal
    </h1>

    <p className="subtitle">Tu portal de acceso centralizado</p>

    <div className="feature-list">
      <div className="feature-item flex items-start gap-3 w-full">
        <div className="feature-icon shrink-0 w-6 h-6 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div className="feature-text min-w-0 flex-1">
          <p className="m-0 break-words">Acceso Unificado</p>
          <p className="mt-1 mb-0 mx-0 break-words">
            Conéctate a todas tus herramientas operativas desde un solo lugar
          </p>
        </div>
      </div>

      <div className="feature-item flex items-start gap-3 w-full">
        <div className="feature-icon shrink-0 w-6 h-6 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="feature-text min-w-0 flex-1">
          <p className="m-0 break-words">Arquitectura Modular</p>
          <p className="mt-1 mb-0 mx-0 break-words">
            Capacidad de integrar nuevas herramientas, módulos y servicios
          </p>
        </div>
      </div>

      <div className="feature-item flex items-start gap-3 w-full">
        <div className="feature-icon shrink-0 w-6 h-6 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <div className="feature-text min-w-0 flex-1">
          <p className="m-0 break-words">Diseño Adaptativo</p>
          <p className="mt-1 mb-0 mx-0 break-words">
            Experiencia fluida desde cualquier dispositivo
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Login = () => {
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
      // CAMBIO: Se usa 'x-client-uuid' en lugar de 'Authorization'
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

  return (
    <>
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      <div className="view-login active" id="viewLogin">
        <div className="form-header">
          <h2>Iniciar sesión</h2>
        </div>

        <div className="glass-card">
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="loginEmail">Correo electrónico</label>
              <input
                type="email"
                id="loginEmail"
                className={`form-input ${loginErrors.email ? "error" : ""}`}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value.toLowerCase());
                  setLoginErrors((prev) => ({ ...prev, email: false }));
                }}
                required
              />
              <div
                className={`error-message ${loginErrors.email ? "visible" : ""}`}
              >
                Ingresa un correo válido
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  id="loginPassword"
                  className={`form-input ${loginErrors.password ? "error" : ""}`}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginErrors((prev) => ({ ...prev, password: false }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showLoginPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" x2="23" y1="1" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div
                className={`error-message ${loginErrors.password ? "visible" : ""}`}
              >
                La contraseña es requerida
              </div>
            </div>

            <div className="forgot-link">
              <a href="#" onClick={handleRecoverPassword}>
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              className={`btn-primary ${isLoginLoading ? "loading" : ""}`}
              disabled={isLoginLoading}
            >
              <span className="btn-label">Iniciar sesión</span>
              <div className="spinner"></div>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
