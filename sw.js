const CACHE_NAME = 'orange-finance-v7';

const EXTERNAL_ASSETS = [
  'https://img.icons8.com/color/192/wallet.png',
  'https://img.icons8.com/color/512/wallet.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/outfit/v11/QGYsz_ueBhS6024798RS6m6u.woff2',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/sw.js',
  ...EXTERNAL_ASSETS
];

// Install SW and Cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching critical assets');
      
      // 1. Critical Local Assets
      try {
        await cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/src/main.jsx',
          '/src/App.jsx'
        ]);
      } catch (e) {
        console.error('Critical local assets failed to cache:', e);
      }

      // 2. External & Secondary Assets
      for (const url of URLS_TO_CACHE) {
        try {
          // Skip if already handled by addAll
          if (['/', '/index.html', '/manifest.json', '/src/main.jsx', '/src/App.jsx'].includes(url)) continue;
          
          const response = await fetch(url, { mode: 'no-cors' });
          if (response || response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`Failed to cache ${url}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate and Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept Requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  
  // Check if this is one of our external assets
  const isExternalAsset = EXTERNAL_ASSETS.some(asset => url.href.includes(asset));

  // Skip cross-origin requests UNLESS they are our specific assets or navigation
  if (!url.href.startsWith(self.location.origin) && !isNavigation && !isExternalAsset) {
    return;
  }

  event.respondWith(
    (async () => {
      // 1. Try Cache First (Faster, works offline)
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        // If online, update the cache in the background (Stale-While-Revalidate)
        if (navigator.onLine) {
          fetch(event.request).then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, networkResponse.clone());
            }
          }).catch(() => {}); // Ignore background fetch errors
        }
        return cachedResponse;
      }

      try {
        // 2. Fallback to Network
        const networkResponse = await fetch(event.request);
        
        // If successful, cache it
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // 3. Offline Fallback for Navigation
        if (isNavigation) {
          const cache = await caches.open(CACHE_NAME);
          const fallback = await cache.match('/index.html') || await cache.match('/');
          if (fallback) return fallback;
        }
        
        throw error;
      }
    })()
  );
});
