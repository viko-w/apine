import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pinned so the Tauri devUrl in src-tauri/tauri.conf.json stays valid.
  // Without this Vite falls back to 5174 if 5173 is taken.
  server: {
    port: 5173,
    strictPort: true,
  },
})
