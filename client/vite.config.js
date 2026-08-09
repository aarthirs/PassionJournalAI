import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // 127.0.0.1 rather than "localhost": on Windows + Node 17+, "localhost"
    // resolves to IPv6 ::1 first, which caused ECONNREFUSED ::1:5000.
    proxy: {
      "/api": { target: "http://127.0.0.1:5000", changeOrigin: true },
    },
  },

  build: {
    // Warn earlier than the 500kB default so regressions are noticed.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /*
         * Split vendor code by library so a change to our app doesn't invalidate
         * the cached copy of React/Recharts in users' browsers. Recharts is by
         * far the heaviest and is only needed on two screens, so isolating it
         * matters most.
         */
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
})
