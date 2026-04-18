import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Use polling for file watching inside Docker on macOS (virtioFS doesn't support inotify)
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})
