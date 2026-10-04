import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../../store/authSlice";
import { persistor } from "../../store/store";
import axiosSeguridad from "../utils/axiosSeguridad";

import { DynamicIcon } from "../components/IconCatalog";

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.user?.id);
  const token = useSelector(
    (state) => state.auth.token || state.auth.user?.token,
  );

  const handleLogout = async () => {
    try {
      if (userId && token) {
        await axiosSeguridad.post(`/logout`, { userId });
      }
    } catch (error) {
      console.warn(
        "No se pudo notificar al servidor el cierre de sesión (posiblemente el token ya expiró o fue eliminado):",
        error,
      );
    } finally {
      dispatch(logout());
      try {
        await persistor.flush();
        await persistor.purge();
      } catch (err) {
        console.error("Error al limpiar el persistor:", err);
      }
      window.localStorage.removeItem("persist:root");
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      className="flex items-center gap-3 w-full px-3.5 py-2.5"
      onClick={handleLogout}
      id="logoutToggle"
      type="button"
      title="Cerrar sesión"
      style={{ cursor: "pointer" }}
    >
      <span className="flex items-center justify-center">
        <DynamicIcon name="FiLogOut" />
      </span>
      {/* <span>Cerrar sesión</span> */}
    </button>
  );
};

export default LogoutButton;
