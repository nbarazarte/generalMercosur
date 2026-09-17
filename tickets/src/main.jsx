import React from "react";
import ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import { TourProvider } from "@reactour/tour";
import { components } from "@reactour/tour";
import { Provider } from "react-redux";
// 1. Importar el persistor desde tu store
import { store, persistor } from "./store/store";
// 2. Importar PersistGate
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./index.css";
import { Buffer } from 'buffer';

// Esto soluciona el error "Buffer is not defined"
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

function Badge({ children }) {
  return (
    <components.Badge
      styles={{
        badge: (base) => ({
          ...base,
          backgroundColor: "blue",
          color: "white",
          fontWeight: "bold",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          position: "absolute",
          top: "0", // parte superior del elemento
          left: "50%", // centrado horizontal
          transform: "translate(-50%, -50%)", // sube el badge un poco
          zIndex: 9999,
        }),
      }}
    >
      {children}
    </components.Badge>
  );
}

function Close({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ position: "absolute", right: 0, top: 0, color: "black" }}
      className="font-semibold m-2"
    >
      x
    </button>
  );
}

const steps = [
  {
    selector: ".paso-uno",
    content: (
      <div className="text-black font-extralight m-2">
        Muestra la página actual
      </div>
    ),
  },
  {
    selector: ".paso-dos",
    content: (
      <div className="text-black font-extralight m-2">
        Cambia el tema de la aplicación
      </div>
    ),
  },
  {
    selector: ".paso-tres",
    content: (
      <div className="text-black font-extralight m-2">
        Contenido de la aplicación
      </div>
    ),
  },
  {
    selector: ".paso-cuatro",
    content: (
      <div className="text-black font-extralight m-2">Muestra el usuario</div>
    ),
  },
  {
    selector: ".paso-cinco",
    content: (
      <div className="text-black font-extralight m-2">
        Salir de la aplicación
      </div>
    ),
  },
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* 3. Envolver con PersistGate */}
      {/* El prop loading puede recibir un componente de carga (spinner) mientras se recuperan los datos */}
      <PersistGate loading={null} persistor={persistor}>
        <StyledEngineProvider injectFirst>
          <TourProvider steps={steps} components={{ Badge, Close }}>
            <App />
          </TourProvider>
        </StyledEngineProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
