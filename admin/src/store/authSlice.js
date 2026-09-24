import { createSlice } from "@reduxjs/toolkit";

// Función auxiliar para obtener y parsear de forma segura desde localStorage
const getStoredSistemasOpciones = () => {
  const saved = localStorage.getItem("cl_sistemasOpciones");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error al parsear cl_sistemasOpciones del localStorage:", error);
    return [];
  }
};

const initialState = {
  user: {
    id: localStorage.getItem("cl_userId") || null,
    email: localStorage.getItem("cl_userEmail") || null,
    username: localStorage.getItem("cl_username") || null,
    nombre: localStorage.getItem("cl_nombre") || null, // Alias para username
    apellido: localStorage.getItem("cl_apellido") || null,
    sistemasOpciones: getStoredSistemasOpciones(),
  },
  token: localStorage.getItem("cl_token") || null,
  isAuthenticated: !!localStorage.getItem("cl_token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { id, token, email, username, nombre, apellido, sistemasOpciones } =
        action.payload;

      state.user = { id, email, username, nombre, apellido, sistemasOpciones };
      state.token = token;
      state.isAuthenticated = true;

      // Persistencia centralizada en el Slice
      if (id) localStorage.setItem("cl_userId", String(id));
      if (token) localStorage.setItem("cl_token", token);
      if (email) localStorage.setItem("cl_userEmail", email);
      if (username) localStorage.setItem("cl_username", username);
      if (nombre) localStorage.setItem("cl_nombre", nombre);
      if (apellido) localStorage.setItem("cl_apellido", apellido);
      if (sistemasOpciones) {
        localStorage.setItem("cl_sistemasOpciones", JSON.stringify(sistemasOpciones));
      }
    },
    logout: (state) => {
      state.user = {
        id: null,
        email: null,
        username: null,
        nombre: null,
        apellido: null,
        sistemasOpciones: [],
      };
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("cl_userId");
      localStorage.removeItem("cl_token");
      localStorage.removeItem("cl_userEmail");
      localStorage.removeItem("cl_username");
      localStorage.removeItem("cl_nombre");
      localStorage.removeItem("cl_apellido");
      localStorage.removeItem("cl_sistemasOpciones");
      localStorage.removeItem("cl_deviceId"); // en getDeviceInfo.js se genera un deviceId y se guarda en localStorage, al hacer logout se elimina para que al volver a loguearse se genere uno nuevo
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;