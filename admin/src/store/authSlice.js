// src/store/authSlice.js
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
  isAuthenticated: false,
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
      localStorage.removeItem("cl_deviceId");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
