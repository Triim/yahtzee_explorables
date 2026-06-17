import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/engine': path.resolve(__dirname, './src/engine'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/scenes': path.resolve(__dirname, './src/scenes'),
      '@/scaffolding': path.resolve(__dirname, './src/scaffolding'),
      '@/state': path.resolve(__dirname, './src/state'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/data': path.resolve(__dirname, './src/data'),
    },
  },
  worker: {
    format: 'es',
  },
})
