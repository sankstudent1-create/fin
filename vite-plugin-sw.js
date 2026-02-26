import { copyFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Copies sw.js from public/ to dist/ at build time.
 * public/sw.js is served as-is (no hashing) by Vite.
 * dist/sw.js is needed for production deployment.
 */
export default function vitePluginServiceWorker() {
  return {
    name: 'vite-plugin-service-worker',
    writeBundle() {
      // Try public/sw.js first, fallback to root sw.js
      const sources = [
        resolve(process.cwd(), 'public', 'sw.js'),
        resolve(process.cwd(), 'sw.js'),
      ];
      const distPath = resolve(process.cwd(), 'dist', 'sw.js');

      for (const swPath of sources) {
        try {
          copyFileSync(swPath, distPath);
          console.log(`✅ Service Worker copied: ${swPath} → dist/sw.js`);
          return;
        } catch { /* try next */ }
      }
      console.error('❌ Service Worker copy failed: sw.js not found in public/ or root');
    }
  };
}
