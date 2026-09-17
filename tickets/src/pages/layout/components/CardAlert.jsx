import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import WhatsAppIcon from "@mui/icons-material/WhatsApp"; // Importamos el icono de WhatsApp
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Box from "@mui/material/Box";

export default function CardAlert() {
  // Número formateado: 58 (Venezuela) + 4149277412
  const whatsappUrl = "https://wa.me/584149277412?text=Hola,%20necesito%20ayuda%20con%20mi%20registro%20en%20Mercosur%20Casa%20de%20Bolsa";

  return (
    <Card
      variant="outlined"
      sx={{ m: 1.5, flexShrink: 0, bgcolor: "background.paper" }}
    >
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" color="primary" />

        <Typography gutterBottom sx={{ fontWeight: 600, mt: 1 }}>
          ¿Necesitas ayuda para empezar?
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Nuestro equipo de soporte está listo para guiarte por WhatsApp en tus primeras
          inversiones.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<WhatsAppIcon />}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              bgcolor: "#25D366", 
              "&:hover": { bgcolor: "#128C7E" } 
            }}
          >
            Contactar
          </Button>

          <Button
            variant="text"
            size="small"
            fullWidth
            href="https://mercosur.com.ve/home/centrode-sopore/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            O visita mercosur.com.ve
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}