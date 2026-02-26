import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/collab/",
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:4444",
    },
  },
});
