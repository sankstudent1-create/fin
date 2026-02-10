import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginServiceWorker from './vite-plugin-sw.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginServiceWorker()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'framer-motion': ['framer-motion'],
          'tesseract': ['tesseract.js'],
          'confetti': ['canvas-confetti']
        }
      }
    },
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    host: true
  }
})
