import { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

// Contenido estático para el Aside de Restablecer Contraseña
export const ResetPasswordAside = (
  <div className="aside-content">
    <h1>
      Mercosur
      <br />
      Enterprise Portal
    </h1>
    <p className="subtitle">
      Restablece tu contraseña de forma segura para recuperar el acceso a los sistemas de Mercosur Casa de Bolsa.
    </p>

    <ul className="feature-list">
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
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <div className="feature-text">
          <p>Seguridad Avanzada</p>
          <p>Tu nueva contraseña será encriptada de forma segura</p>
        </div>
      </li>
    </ul>
  </div>
);

const ResetearContrasena = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [toasts, setToasts] = useState([]);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetErrors, setResetErrors] = useState({
    password: false,
    confirm: false,
  });
  const [isResetLoading, setIsResetLoading] = useState(false);

  const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
  const API_TOKEN = import.meta.env.VITE_TOKEN;

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    const errors = { password: false, confirm: false };

    if (!resetPassword || resetPassword.length < 6) {
      errors.password = true;
      valid = false;
    }
    if (!resetConfirmPassword || resetPassword !== resetConfirmPassword) {
      errors.confirm = true;
      valid = false;
    }

    setResetErrors(errors);
    if (!valid) return;

    if (!token) {
      showToast("Token de recuperación no válido o ausente en el enlace.", "error");
      return;
    }

    setIsResetLoading(true);

    try {
      if (!API_URL || !API_TOKEN) {
        throw new Error("Faltan variables de entorno.");
      }

      const response = await axios.post(
        `${API_URL}/reset-password`,
        {
          token: token,
          password: resetPassword,
        },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );

      showToast(
        response.data.message || "Contraseña actualizada correctamente.",
        "success"
      );

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || error.response?.data?.error) ||
        (isNetworkError && error.message !== "Faltan variables de entorno."
          ? "No hay conexión con la API."
          : error.message);

      showToast(errorMessage, "error");
    } finally {
      setIsResetLoading(false);
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

      <div className="view-login active" id="viewResetPassword">
        <div className="form-header">
          <h2>Restablecer contraseña</h2>
        </div>

        <div className="glass-card">
          <form onSubmit={handleResetSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="resetPassword">Nueva contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showResetPassword ? "text" : "password"}
                  id="resetPassword"
                  className={`form-input ${resetErrors.password ? "error" : ""}`}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={resetPassword}
                  onChange={(e) => {
                    setResetPassword(e.target.value);
                    setResetErrors((prev) => ({ ...prev, password: false }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showResetPassword ? (
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
                className={`error-message ${resetErrors.password ? "visible" : ""}`}
              >
                La contraseña debe tener al menos 6 caracteres
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resetConfirmPassword">Confirmar contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showResetConfirmPassword ? "text" : "password"}
                  id="resetConfirmPassword"
                  className={`form-input ${resetErrors.confirm ? "error" : ""}`}
                  placeholder="Repetir contraseña"
                  autoComplete="new-password"
                  value={resetConfirmPassword}
                  onChange={(e) => {
                    setResetConfirmPassword(e.target.value);
                    setResetErrors((prev) => ({ ...prev, confirm: false }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showResetConfirmPassword ? (
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
                className={`error-message ${resetErrors.confirm ? "visible" : ""}`}
              >
                Las contraseñas no coinciden
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary ${isResetLoading ? "loading" : ""}`}
              disabled={isResetLoading}
            >
              <span className="btn-label">Actualizar contraseña</span>
              <div className="spinner"></div>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetearContrasena;