
// src/auth/storage.js
export const AUTH = {
  BO: {
    prefix: "bo",
    keys: ["userId", "token", "userName", "userEmail"],
  },
  CL: {
    prefix: "",
    keys: ["userId", "token", "userEmail"],
  },
};

export const setSession = (type, data) => {
  const prefix = AUTH[type].prefix;

  if (data.id != null) localStorage.setItem(`${prefix}_userId`, String(data.id));
  if (data.token) localStorage.setItem(`${prefix}_token`, data.token);

  // opcionales según tipo
  if (type === "BO") {
    localStorage.setItem(`${prefix}_userName`, data.username ?? "");
    localStorage.setItem(`${prefix}_userEmail`, data.email ?? "");
  } else {
    localStorage.setItem(`${prefix}_userEmail`, data.email ?? "");
  }
};

export const getSession = (type) => {
  const prefix = AUTH[type].prefix;
  return {
    userId: localStorage.getItem(`${prefix}_userId`),
    token: localStorage.getItem(`${prefix}_token`),
    userName: localStorage.getItem(`${prefix}_userName`),
    userEmail: localStorage.getItem(`${prefix}_userEmail`),
  };
};

export const clearSession = (type) => {
  const prefix = AUTH[type].prefix;
  AUTH[type].keys.forEach((k) => localStorage.removeItem(`${prefix}_${k}`));
};
