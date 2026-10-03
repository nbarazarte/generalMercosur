import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { persistor } from "../../store/store";
import axios from "axios";

const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
const API_TOKEN = import.meta.env.VITE_TOKEN;

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 3. Obtén el userId actual desde el estado de Redux antes de borrarlo
  const userId = useSelector((state) => state.auth.user?.id);

  const handleLogout = async () => {
    try {
      // 4. Hacemos la petición al backend para que borre el token/sesión en la BD
      if (userId) {
        await axios.post(
          `${API_URL}/logout`,
          { userId },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          },
        );
      }

      // 5. Limpieza local (Redux y persistencia)
      dispatch(logout());
      await persistor.flush();
      await persistor.purge();
      window.localStorage.removeItem("persist:root");
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
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
