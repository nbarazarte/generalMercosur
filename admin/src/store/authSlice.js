import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: localStorage.getItem("cl_userId") || null,
    email: localStorage.getItem("cl_userEmail") || null,
    username: localStorage.getItem("cl_username") || null,
  },
  token: localStorage.getItem("cl_token") || null,
  isAuthenticated: !!localStorage.getItem("cl_token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { id, token, email, username } = action.payload;

      state.user = { id, email, username };
      state.token = token;
      state.isAuthenticated = true;

      // Persistencia centralizada en el Slice
      if (id) localStorage.setItem("cl_userId", String(id));
      if (token) localStorage.setItem("cl_token", token);
      if (email) localStorage.setItem("cl_userEmail", email);
      if (username) localStorage.setItem("cl_username", username);
    },
    logout: (state) => {
      state.user = { id: null, email: null, username: null };
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("cl_userId");
      localStorage.removeItem("cl_token");
      localStorage.removeItem("cl_userEmail");
      localStorage.removeItem("cl_username");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
