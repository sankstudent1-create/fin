import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginServiceWorker from './vite-plugin-sw.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginServiceWorker()],
  build: {
    // Disable automatic <link rel="modulepreload"> injection
    // This eliminates the ~150 "preloaded resource not used" browser warnings
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'framer-motion': ['framer-motion'],
        }
      }
    },
    assetsInlineLimit: 4096,
  },
  server: {
    port: 3000,
    host: true
  }
})

