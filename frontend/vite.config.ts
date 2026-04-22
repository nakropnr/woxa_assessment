import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendPort = process.env["BACKEND_PORT"] ?? process.env["PORT"] ?? "8080";
const backendHost = process.env["BACKEND_HOST"] ?? "localhost";
const backendProtocol = process.env["BACKEND_PROTOCOL"] ?? "http";
const backendTarget = `${backendProtocol}://${backendHost}:${backendPort}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api/* calls in dev are forwarded to your Express backend
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
