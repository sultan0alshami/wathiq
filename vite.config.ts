import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcssImport from 'postcss-import';
import commonjs from 'rollup-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    exclude: ["jspdf-font-support"],
  },
  plugins: [react(), mode === "development" && componentTagger(), commonjs()].filter(Boolean),
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss(), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "jspdf-font-support": path.resolve(__dirname, "./src/lib/jspdf-font-support-browser.ts")
    },
  },
  build: {
    rollupOptions: {
      ...(mode === 'production' ? { external: ["jspdf-font-support"] } : {}),
    },
  },
}));
