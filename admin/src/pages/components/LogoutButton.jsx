// src/pages/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice"; // Ajusta la ruta a tu authSlice

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // 1. Limpiar estado en Redux y localStorage mediante la acción logout
    dispatch(logout());

    // 2. Redirigir al usuario al login
    navigate("/login", { replace: true });
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleLogout}
      id="logoutToggle"
      title="Cerrar sesión"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Salir</span>
    </button>
  );
};

export default LogoutButton;
