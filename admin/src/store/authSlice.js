import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: null,
    email: null,
    username: null,
    nombre: null,
    apellido: null,
    sistemasOpciones: [],
  },
  token: null,
  refreshToken: null, // 1. Añadido para almacenar el token de renovación
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const {
        id,
        token,
        refreshToken,
        email,
        username,
        nombre,
        apellido,
        sistemasOpciones,
      } = action.payload;

      state.user = { id, email, username, nombre, apellido, sistemasOpciones };
      state.token = token;
      state.refreshToken = refreshToken; // 2. Guardamos el refreshToken al iniciar sesión
      state.isAuthenticated = true;
    },
    // 3. Nuevo reducer para actualizar únicamente el token de acceso al usar el refreshToken
    updateAccessToken: (state, action) => {
      state.token = action.payload;
    },
    // Reducer para actualizar solo la lista de sistemas y opciones
    setSistemasOpciones: (state, action) => {
      if (state.user) {
        state.user.sistemasOpciones = action.payload;
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
      state.refreshToken = null; // 4. Limpiamos también el refreshToken al cerrar sesión
      state.isAuthenticated = false;
      localStorage.removeItem("cl_deviceId");
    },
  },
});

export const { setUser, updateAccessToken, setSistemasOpciones, logout } =
  authSlice.actions;
export default authSlice.reducer;
