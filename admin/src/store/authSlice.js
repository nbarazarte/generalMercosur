import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    username: localStorage.getItem("cl_username") || null,
  },
  isAuthenticated: !!localStorage.getItem("cl_username"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // action.payload debe ser el nombre de usuario o un objeto con los datos
      const username =
        typeof action.payload === "string"
          ? action.payload
          : action.payload.username;

      state.user = { username };
      state.isAuthenticated = true;
      localStorage.setItem("cl_username", username);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("cl_username");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
