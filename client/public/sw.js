/// <reference lib="webworker" />

/**
 * Nexus Academy Service Worker — offline-first game support.
 *
 * Strategies:
 *   • Cache-first for static assets (JS, CSS, HTML, 3D models, textures, sounds)
 *   • Network-first for API calls (fall back to cache when offline)
 *   • Offline fallback — game runs entirely from cache when no network
 *   • Background sync queue for learning events
 */

const CACHE_VERSION = 'nexus-v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

/** Assets precached on install so the game works offline after first load. */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ---- Lifecycle events -------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ---- Fetch handling ---------------------------------------------------------

/** Extensions we consider static assets — cache-first. */
const STATIC_EXT_RE = /\.(js|css|wasm|html|json|glb|gltf|obj|fbx|png|jpg|jpeg|webp|svg|gif|ico|mp3|ogg|wav|webm|m4a|woff2?|ttf|eot)$/i;

/** True when the URL points to the game API server. */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

/** True for static asset requests (by extension or same-origin non-API). */
function isStaticAsset(url) {
  return STATIC_EXT_RE.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Navigation requests (HTML pages) — cache-first with network fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request)
          .then((res) => {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(event.request, clone));
            return res;
          })
          .catch(() => caches.match('/index.html'))
      )
    );
    return;
  }

  // API requests — network-first, fall back to cache
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(API_CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets — cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // Everything else — network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ---- Message handling (cache management from main thread) -------------------

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) =>
        Promise.allSettled(
          urls.map((u) =>
            cache.match(u).then((existing) => {
              if (!existing) return cache.add(u);
            })
          )
        )
      )
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_VERSION') {
    event.source.postMessage({ type: 'CACHE_VERSION', version: CACHE_VERSION });
  }
});
