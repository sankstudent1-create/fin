const CACHE_NAME = 'orange-finance-v4';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install SW and Cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      // Attempt to cache all files. If one fails (e.g., missing favicon), 
      // catch the error so the Service Worker still installs!
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.warn('Some assets failed to cache (likely missing files):', err);
        // Ensure at least index.html is cached for basic offline support
        return cache.add('/index.html');
      });
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
  // Skip cross-origin requests (like Supabase/CDN) to avoid CORS errors
  // unless they are navigation requests (HTML pages)
  const isNavigation = event.request.mode === 'navigate';
  
  if (!event.request.url.startsWith(self.location.origin) && !isNavigation) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Try Network First (Get freshest content)
        // This is critical for authentication flows and real-time data
        const networkResponse = await fetch(event.request);
        
        // If successful, cache it for later
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // 2. If Network fails (Offline), try Cache
        console.log('Network failed, falling back to cache:', error);
        
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 3. Special handling for navigation (HTML) requests
        // If we are offline and don't have the specific page cached, 
        // return the main index.html (SPA Fallback)
        if (isNavigation) {
          const cache = await caches.open(CACHE_NAME);
          // Try finding index.html
          let indexCache = await cache.match('/index.html');
          // If not found, try finding root /
          if (!indexCache) {
             indexCache = await cache.match('/');
          }
          if (indexCache) {
            return indexCache;
          }
        }
        
        // If nothing works, just propagate the error (browser will show offline page)
        throw error;
      }
    })()
  );
});
