import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 22222,
    proxy: {
      '/api': {
        target: 'http://localhost:22223',
        changeOrigin: true,
      }
    }
  },
})
