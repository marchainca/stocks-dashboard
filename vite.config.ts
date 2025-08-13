import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
   resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // En dev: toda llamada a /stocks se proxeará al backend
    proxy: {
      '/stocks': {
        target: 'http://localhost:8580',
        changeOrigin: true,
        secure: false,
        // No reescribimos ruta: /stocks -> /stocks
        // rewrite: (path) => path,
      },
    },
  },
})
