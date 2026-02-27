/* ================================================================== */
/*  Orange Finance — Service Worker  v10                               */
/*  Strategy: Cache-First for static, Network-First for API          */
/* ================================================================== */
const CACHE_VERSION = 'of-v11';
const DATA_CACHE = 'of-data-v11';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  /* Google Fonts — Poppins + Montserrat */
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Montserrat:wght@500;600;700;800;900&display=swap',
  'https://fonts.gstatic.com',
  /* App icons */
  'https://img.icons8.com/color/192/wallet.png',
  'https://img.icons8.com/color/512/wallet.png',
];

/* ── INSTALL ─────────────────────────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);

    // Cache local app shell first — these MUST succeed
    try {
      await cache.addAll(['/', '/index.html', '/manifest.json', '/favicon.ico']);
    } catch (e) {
      console.warn('[SW] App shell cache failed:', e);
    }

    // Cache external assets with no-cors (opaque responses are fine for fonts/icons)
    const externals = [
      'https://img.icons8.com/color/192/wallet.png',
      'https://img.icons8.com/color/512/wallet.png',
      'https://img.icons8.com/color/96/minus.png',
      'https://img.icons8.com/color/96/plus--v1.png',
      'https://img.icons8.com/color/96/camera.png',
      'https://img.icons8.com/color/96/bot.png',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Montserrat:wght@500;600;700;800;900&display=swap',
    ];
    for (const url of externals) {
      try {
        const res = await fetch(url, { mode: 'no-cors' });
        await cache.put(url, res);
      } catch (e) {
        console.warn('[SW] External cache miss:', url);
      }
    }

    console.log('[SW] Installed v11 ✓');
  })());
  self.skipWaiting();
});

/* ── ACTIVATE ────────────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== CACHE_VERSION && k !== DATA_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
    console.log('[SW] Activated v11 ✓');
  })());
});

/* ── FETCH ───────────────────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET, chrome-extension, and Supabase API calls
  if (req.method !== 'GET') return;
  if (req.url.includes('chrome-extension')) return;

  // Supabase API → Network-first, fallback to cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(req, DATA_CACHE));
    return;
  }

  // Google Fonts CSS → Network-first (so updates get picked up)
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(networkFirst(req, CACHE_VERSION));
    return;
  }

  // Font files & icons → Cache-first (immutable)
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'img.icons8.com') {
    event.respondWith(cacheFirst(req, CACHE_VERSION));
    return;
  }

  // App navigation requests → return /index.html (SPA shell)
  if (req.mode === 'navigate') {
    event.respondWith(spaFallback(req));
    return;
  }

  // Everything else → Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req, CACHE_VERSION));
});

/* ── STRATEGIES ─────────────────────────────────────────────────── */

/** Try network, update cache, fallback to cache on failure */
async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/** Return cached version immediately, then update in background */
async function staleWhileRevalidate(req, cacheName) {
  const cached = await caches.match(req);
  const networkPromise = fetch(req).then(async (res) => {
    if (res && res.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  }).catch(() => null);

  return cached || await networkPromise;
}

/** Return cached, only fetch if not in cache */
async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req, { mode: 'no-cors' });
    if (res) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return new Response('', { status: 404 });
  }
}

/** SPA: always return /index.html for navigation */
async function spaFallback(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(req, res.clone());
      return res;
    }
  } catch { /* offline */ }
  const fallback = await caches.match('/index.html') || await caches.match('/');
  return fallback || new Response('<h1>Offline</h1>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

/* ── BACKGROUND SYNC (save queued TX offline) ────────────────────── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  try {
    const client = await self.clients.matchAll();
    client.forEach(c => c.postMessage({ type: 'SYNC_TRANSACTIONS' }));
  } catch (e) {
    console.warn('[SW] Sync failed:', e);
  }
}

/* ── PUSH NOTIFICATIONS ─────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Orange Finance', body: 'You have a new notification' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Orange Finance', {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: 'https://img.icons8.com/color/192/wallet.png',
      tag: 'orange-finance',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.notification.data?.action || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If an existing window is open, navigate it
      for (const client of clients) {
        if (client.url.includes(self.registration.scope)) {
          client.navigate(action);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(action);
    })
  );
});
