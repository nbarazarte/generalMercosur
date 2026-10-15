import logoImg from "../assets/images/Logo - negativo naranja.png";
import logoImgDark from "../assets/images/Logo - original.png";

const Logo = ({ theme, size }) => {
  return (
    <img
      src={theme === "light" ? logoImgDark : logoImg}
      alt="Mercosur Casa de Bolsa"
      className={`${size === "home" ? "w-32" : "w-16"} h-auto`}
    />
  );
};

export default Logo;
