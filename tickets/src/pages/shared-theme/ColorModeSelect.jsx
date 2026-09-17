import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useDispatch } from "react-redux";
import { setMuiMode } from "../../../src/store/plantillaSlice";
import { useEffect } from "react";

export default function ColorModeSelect(props) {
  const dispatch = useDispatch();
  const { mode, systemMode, setMode } = useColorScheme();

  const resolvedMode = systemMode || mode;
  //console.log(resolvedMode);

  useEffect(() => {
    dispatch(setMuiMode(resolvedMode));
  }, [resolvedMode]);

  if (!mode) {
    return null;
  }
  return (
    <Select
      value={mode}
      onChange={(event) => setMode(event.target.value)}
      SelectDisplayProps={{
        "data-screenshot": "toggle-mode",
      }}
      {...props}
    >
      <MenuItem value="system">Sistema</MenuItem>
      <MenuItem value="light">Claro</MenuItem>
      <MenuItem value="dark">Oscuro</MenuItem>
    </Select>
  );
}
