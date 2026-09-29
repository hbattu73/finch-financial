import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Fail loudly if 5173 is taken. Without this Vite silently moves to 5174,
    // which then mismatches the API's CORS origin and breaks every request.
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared/types': path.resolve(import.meta.dirname, '../types.ts'),
    },
  },
})
