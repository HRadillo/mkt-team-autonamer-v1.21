import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves sites from a subpath (/<repo>/). Using a relative base
// avoids "black screen" issues caused by absolute asset URLs.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
