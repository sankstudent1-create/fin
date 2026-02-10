import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve } from 'path';

export default function vitePluginServiceWorker() {
  return {
    name: 'vite-plugin-service-worker',
    writeBundle() {
      const swPath = resolve(process.cwd(), 'sw.js');
      const distPath = resolve(process.cwd(), 'dist', 'sw.js');
      
      try {
        copyFileSync(swPath, distPath);
        console.log('Service Worker copied to dist/sw.js');
      } catch (err) {
        console.error('Failed to copy Service Worker:', err);
      }
    }
  };
}
