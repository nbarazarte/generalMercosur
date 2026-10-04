import React from "react";
import { DynamicIcon } from "../components/IconCatalog";

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      className="ma-nav-btn"
      onClick={onToggle}
      id="themeToggle"
      type="button"
      title="Cambiar tema"
      style={{ cursor: "pointer" }}
    >
      <span className="ic">
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
