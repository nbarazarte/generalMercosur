import { useState } from "react";
import axios from "axios";
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
    <p className="subtitle">
      Tu portal de acceso centralizado de los sistemas de Mercosur.
    </p>

    <ul className="feature-list">
      <li className="feature-item">
        <span className="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <div className="feature-text">
          <p>Recursos Humanos</p>
          <p>Gestiona tu ficha de empleado</p>
        </div>
      </li>
      <li className="feature-item">
        <span className="feature-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
        </span>
        <div className="feature-text">
          <p>Tickets</p>
          <p>Atiende a tus clientes de manera eficiente</p>
        </div>
      </li>
      <li className="feature-item">
        <span className="feature-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </span>
        <div className="feature-text">
          <p>Base de datos de Conocimiento</p>
          <p>Accede a información valiosa para nuestros clientes</p>
        </div>
      </li>
    </ul>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Inicializar dispatch
  const [toasts, setToasts] = useState([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({
    email: false,
    password: false,
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
  const API_TOKEN = import.meta.env.VITE_TOKEN;

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
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
          device_id: deviceId,
          device_name: deviceName,
        },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );

      // Guardar en localStorage
      localStorage.setItem("cl_userId", String(response.data.id));
      localStorage.setItem("cl_token", response.data.token);
      localStorage.setItem("cl_userEmail", response.data.email);
      localStorage.setItem("cl_username", response.data.username);

      // Guardar en el estado global de Redux
      dispatch(setUser(response.data.username));

      showToast("¡Sesión iniciada correctamente!", "success");
      navigate("/home");
    } catch (error) {
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || "No hay conexión con el servidor.";
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
                      style={{ width: "1.25rem", height: "1.25rem" }}
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
                      style={{ width: "1.25rem", height: "1.25rem" }}
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Función de recuperación próximamente", "info");
                }}
              >
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