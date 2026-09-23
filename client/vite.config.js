import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://hrms-backend-gi9l.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
