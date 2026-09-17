import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box"; // Importamos Box para usarlo como span si es necesario

export default function Copyright(props) {
  return (
    <Typography
      variant="body2"
      align="center"
      {...props}
      className="text-xs pt-0"
      sx={[
        {
          color: "text.secondary",
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {/* 1. Cambiamos <p> por <span> o un Box con componente span */}
      <Box component="span" sx={{ display: 'block' }}>
        GCIA. General de Tecnología de la Información
      </Box>
      
      <Link color="inherit" href="https://mercosur.com.ve/">
        Mercosur {new Date().getFullYear()}
      </Link>
    </Typography>
  );
}