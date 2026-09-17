import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Login from "./pages/auth/login";
import Registro from "./pages/auth/registro";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </div>
  );
}
