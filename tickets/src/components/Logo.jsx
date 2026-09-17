import React from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import logoMercosur from "../assets/images/Logo - original.png";
import logoMercosurDark from "../assets/images/Logo - negativo naranja.png";

const Logo = () => {
  const { muiMode } = useSelector((state) => state.plantilla);

  return (
    <Box 
      sx={{ 
        width: "100%",           // 1. Ocupa todo el ancho disponible
        display: "flex",        // 2. Activa Flexbox
        justifyContent: "center", // 3. Centra horizontalmente
        alignItems: "center",    // 4. Centra verticalmente
        //py: 2                    // 5. Un poco de padding arriba/abajo
      }}
    >
      <Box
        component="img"
        src={muiMode === "light" ? logoMercosur : logoMercosurDark}
        alt="Logo Mercosur"
        sx={{
          height: "auto",
          // Ajustamos los porcentajes para que el logo no sea minúsculo
          width: {
            xs: "40%",  // En móvil debe ser más grande para que se lea
            sm: "30%", 
            md: "20%",  
          },
          maxWidth: "150px",
          minWidth: "100px", // Un mínimo razonable para que no desaparezca
        }}
      />
    </Box>
  );
};

export default Logo;