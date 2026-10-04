import React, { useState, useEffect } from "react";
import { DynamicIcon } from "../components/IconCatalog";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      className="flex items-center gap-3 w-full px-3.5 py-2.5"
      onClick={handleToggle}
      id="themeToggle"
      type="button"
      title="Cambiar tema"
      style={{ cursor: "pointer" }}
    >
      <span className="flex items-center justify-center">
        {theme === "dark" ? (
          <DynamicIcon name="FiSun" />
        ) : (
          <DynamicIcon name="FiMoon" />
        )}
      </span>
      {/* <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span> */}
    </button>
  );
};

export default ThemeToggle;
