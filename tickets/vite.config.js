/* import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "replace-eval",
      transform(code) {
        return code.replace(/eval\(/g, "safeEval(");
      },
    },
  ],
  envPrefix: "REACT_APP_",
  //Si no se necesita un prefijo en la app se puede comentar la lina de abajo
  //base: `/${process.env.REACT_APP_PREFIJO}/`,
  base: `/`,
}); */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "replace-eval",
      transform(code) {
        return code.replace(/eval\(/g, "safeEval(");
      },
    },
  ],
  server: {
    proxy: {
      "/api-r4": {
        target: "https://r4conecta.mibanco.com.ve",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-r4/, ""),
      },
    },
  },
  envPrefix: "REACT_APP_",
  base: `/`,
});
