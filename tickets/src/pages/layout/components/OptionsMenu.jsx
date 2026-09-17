import React, { useState, Fragment } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Menu, Divider, ListItemText, ListItemIcon, Box } from "@mui/material";
import MuiMenuItem from "@mui/material/MenuItem";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import { dividerClasses } from "@mui/material/Divider";
import { listItemIconClasses } from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

// Redux e Routing
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPlantilla } from "../../../store/plantillaSlice";
import { handleLogout } from "../../../../utils/utils";
import MenuButton from "./MenuButton";

const MenuItem = styled(MuiMenuItem)({
  margin: "2px 0",
});

export default function OptionsMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función maestra de cierre de sesión
  const onLogoutClick = () => {
    // 1. Cerramos el menú visualmente
    handleClose();

    // 2. Limpiamos el estado de Redux (Esto limpia automáticamente Redux Persist)
    dispatch(resetPlantilla());

    // 3. Limpiamos el almacenamiento físico del navegador
    //localStorage.clear();
    //sessionStorage.clear();

    // 4. Ejecutamos la lógica de redirección y limpieza de tokens
    handleLogout(navigate);
  };

  return (
    <Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: "transparent" }}
      >
        <MoreVertRoundedIcon className="paso-cinco" />
      </MenuButton>

      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: "4px",
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          },
          [`& .${dividerClasses.root}`]: {
            margin: "4px -4px",
          },
        }}
      >
        <MenuItem
          onClick={onLogoutClick}
          sx={{
            color: theme.palette.error.main, // Color rojo para indicar acción crítica
            [`& .${listItemIconClasses.root}`]: {
              ml: "auto",
              minWidth: 0,
              color: theme.palette.error.main,
            },
          }}
        >
          <ListItemText primary="Salir" />
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </Fragment>
  );
}
