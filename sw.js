const CACHE_NAME = 'orange-finance-v6';

// Define the external icons we use so we can cache them
const EXTERNAL_ICONS = [
  'https://img.icons8.com/color/192/wallet.png',
  'https://img.icons8.com/color/512/wallet.png'
];

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico', // If this is missing, the code below handles it safely
  ...EXTERNAL_ICONS
];

// Install SW and Cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Opened cache');
      
      // 1. Critical Assets (Must succeed for offline mode to work)
      try {
        await cache.add('/index.html');
        await cache.add('/');
        await cache.add('/manifest.json');
      } catch (e) {
        console.error('Critical assets failed to cache:', e);
      }

      // 2. Secondary Assets (Icons, etc. - Try best effort)
      // We loop through them so one failure doesn't stop the whole install
      for (const url of URLS_TO_CACHE) {
        try {
          // Skip if already cached above
          if (url === '/' || url === '/index.html' || url === '/manifest.json') continue;
          
          // Fetch and cache
          const response = await fetch(url);
          if (response.ok) {
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
  
  // Check if this is one of our external icons
  const isExternalIcon = EXTERNAL_ICONS.includes(url.href);

  // Skip cross-origin requests UNLESS they are our specific icons or navigation
  if (!url.href.startsWith(self.location.origin) && !isNavigation && !isExternalIcon) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Network First (Get freshest content)
        const networkResponse = await fetch(event.request);
        
        // If successful, cache it
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        // Special handling for opaque responses (like external images)
        else if (networkResponse && networkResponse.status === 0 && isExternalIcon) {
           const cache = await caches.open(CACHE_NAME);
           cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // 2. Network Failed -> Try Cache
        console.log('Network failed, falling back to cache:', error);
        
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 3. Offline Fallback for Navigation (The "App Shell")
        if (isNavigation) {
          const cache = await caches.open(CACHE_NAME);
          // Try exact match first, then root, then index.html
          const fallback = await cache.match('/index.html') || await cache.match('/');
          if (fallback) return fallback;
        }
        
        throw error;
      }
    })()
  );
});
