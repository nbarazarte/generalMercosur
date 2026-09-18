import React from "react";
import logoImg from "../../assets/images/Logo - negativo naranja.png";

const Logo = ({ width, height }) => {
    return (
        <img
            src={logoImg}
            alt="Mercosur Casa de Bolsa"
            className="h-10 w-auto" // Opcional: ajusta según tu CSS/Tailwind
            style={{ width, height }}
        />
    );
};

export default Logo;