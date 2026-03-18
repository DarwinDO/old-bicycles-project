import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const backendTarget = 'https://extrajudicial-fleta-fallalishly.ngrok-free.dev'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      '/ws': {
        target: backendTarget,
        changeOrigin: true,
        secure: true,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})
