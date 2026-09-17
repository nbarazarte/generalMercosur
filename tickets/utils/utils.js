
import axios from "axios";

const handleLogout = async (navigate) => {
  // ✅ si la ruta inicia con /bo => es BackOffice
  const isBO = window.location.pathname.startsWith("/bo");

  // ✅ Vite: variables deben ser VITE_
  // const url = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
  // const tokenApi = import.meta.env.VITE_TOKEN;

  const url = import.meta.env.REACT_APP_URL_API_LOCAL_SEGURIDAD;
  const tokenApi = import.meta.env.REACT_APP_TOKEN;


  const headers = tokenApi ? { Authorization: `Bearer ${tokenApi}` } : {};

  // ✅ userId según contexto
  const userId = isBO
    ? localStorage.getItem("bo_userId")
    : localStorage.getItem("cl_userId");

  try {
    const endpoint = isBO ? "logout-bo" : "logout";
    await axios.post(`${url}${endpoint}`, { userId }, { headers });
  } catch (err) {
    console.log("Error en el cierre de sesión", err);
  } finally {
    // ✅ limpiar SOLO lo que corresponde
    if (isBO) {
      localStorage.removeItem("bo_userId");
      localStorage.removeItem("bo_token");
      localStorage.removeItem("bo_userName");
      localStorage.removeItem("bo_userEmail");
      navigate("/bo-entrar", { replace: true });
    } else {
      localStorage.removeItem("cl_userId");
      localStorage.removeItem("cl_token");
      localStorage.removeItem("cl_userEmail");
      navigate("/", { replace: true });
    }
  }
};

export { handleLogout };
