import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 24678
    }
  },
  define: {
    __WS_TOKEN__: JSON.stringify('vite-hmr-token')
  }
}) 