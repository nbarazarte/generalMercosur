import * as React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SaveIcon from "@mui/icons-material/Save";
import PlagiarismIcon from "@mui/icons-material/Plagiarism";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
function handleClick(event) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

export default function BasicBreadcrumbs() {
  return (
    <div role="presentation" onClick={handleClick} className="paso-uno">
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          {location.pathname == "/inicio" && <HomeRoundedIcon />}
          {location.pathname == "/guardar" && <SaveIcon />}
          {location.pathname == "/buscar" && <PlagiarismIcon />}
          {location.pathname == "/eliminar" && <DeleteForeverIcon />}
        </Link>
        <Typography className="text-md font-extralight ">
          {/* sx={{ color: 'text.primary' }} */}
          {/* {location.pathname.split("/")} */}
          {location.pathname
            .split("/")
            .filter(Boolean)
            .map(
              (segmento) =>
                segmento.charAt(0).toUpperCase() +
                segmento.slice(1).toLowerCase()
            )
            .join("/")}
        </Typography>
      </Breadcrumbs>
    </div>
  );
}
