import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/server-a': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server-a/, ''),
      },
      '/server-b': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server-b/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
