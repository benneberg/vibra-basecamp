import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  // 👇 This is *critical* for GitHub Pages to resolve URLs properly
  base: '/vibra-basecamp/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
