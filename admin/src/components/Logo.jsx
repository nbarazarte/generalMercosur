import logoImg from "../assets/images/Logo - negativo naranja.png";
import logoImgDark from "../assets/images/Logo - original.png";

const Logo = ({ theme, size }) => {
  return (
    <img
      src={theme === "light" ? logoImgDark : logoImg}
      alt="Mercosur Casa de Bolsa"
      className={`w-${size} h-auto`}
    />
  );
};

export default Logo;
