import logoImg from "../../assets/images/Logo - negativo naranja.png";
import logoImgDark from "../../assets/images/Logo - original.png";

const LogoMobile = ({ theme }) => {
  return (
    <img src={theme === "dark" ? logoImg : logoImgDark} alt="Mercosur Casa de Bolsa" className="w-32 h-auto" />
  );
};

export default LogoMobile;