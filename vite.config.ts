import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Si estamos compilando (build) usa la ruta de GitHub Pages, si estamos en local usa la raíz "/"
    base: command === "build" ? "/workzone-demo-vacaciones/" : "/",
  };
});