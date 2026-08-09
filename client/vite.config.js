import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Use 127.0.0.1 (not "localhost"): on Windows + Node 17+, "localhost"
      // often resolves to IPv6 ::1 first, which is why the error read
      // "ECONNREFUSED ::1:5000". Pinning IPv4 removes that ambiguity.
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
})
