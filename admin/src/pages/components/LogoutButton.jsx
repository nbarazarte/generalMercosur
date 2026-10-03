import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../../store/authSlice";
import { persistor } from "../../store/store";
import axiosSeguridad from "../utils/axiosSeguridad";

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.user?.id);
  const token = useSelector(
    (state) => state.auth.token || state.auth.user?.token,
  );

  const handleLogout = async () => {
    try {
      // Intentamos notificar al backend para limpiar la BD (si el token aún es válido)
      if (userId && token) {
        await axiosSeguridad.post(`/logout`, { userId });
      }
    } catch (error) {
      console.warn(
        "No se pudo notificar al servidor el cierre de sesión (posiblemente el token ya expiró o fue eliminado):",
        error,
      );
    } finally {
      // 🔒 LIMPIEZA LOCAL GARANTIZADA: Ocurre siempre, falle o no el backend
      dispatch(logout());
      try {
        await persistor.flush();
        await persistor.purge();
      } catch (err) {
        console.error("Error al limpiar el persistor:", err);
      }
      window.localStorage.removeItem("persist:root");

      // Redirección forzada al login
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      className="ma-nav-btn"
      onClick={handleLogout}
      id="logoutToggle"
      type="button"
      title="Cerrar sesión"
    >
      <span className="ic">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </span>
      <span>Cerrar sesión</span>
    </button>
  );
};

export default LogoutButton;
