/* Service worker for Household List.
 *
 * Goal: the app opens and shows the cached list even with no network. Sync
 * needs relays (WSS) and can't work offline — but the local-first design means
 * the UI works against IndexedDB and reconnects when you're back online.
 *
 * Caching strategy:
 *  - navigations        → network-first, fall back to cached index.html
 *  - CDN modules & fonts → cache-first (esm.sh/fonts URLs are versioned and
 *                          immutable, so this is safe and gives instant offline)
 *  - same-origin assets  → cache-first with network fallback
 *
 * Relay WebSocket traffic is never touched — those aren't fetches, and stale
 * list data must always come from IndexedDB + live merge, never from here.
 *
 * Bump CACHE_VERSION to force clients onto a new app shell.
 */

const CACHE_VERSION = 'v15';
const SHELL = `shell-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

// Resolve relative to the SW's own scope so this works under a subpath
// (e.g. GitHub Pages: /repo/).
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
].map((p) => new URL(p, self.registration.scope).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Best-effort: a missing optional asset shouldn't abort the install.
      await Promise.allSettled(SHELL_ASSETS.map((u) => cache.add(u)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, RUNTIME]);
      for (const key of await caches.keys()) {
        if (!keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

const scopeUrl = () => self.registration.scope;

function isCdn(url) {
  return (
    url.hostname === 'esm.sh' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // App navigations (including the Share Target GET, whose query string the
  // page reads from location.search) → network-first, cached shell fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(SHELL);
          return (
            (await cache.match(new URL('./index.html', scopeUrl()).toString())) ||
            (await cache.match(new URL('./', scopeUrl()).toString())) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Versioned, immutable third-party assets → cache-first.
  if (isCdn(url)) {
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // Same-origin static assets (icons, etc.) → cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL));
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    // Cache successful and opaque (cross-origin no-cors) responses alike.
    if (res && (res.ok || res.type === 'opaque')) {
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return hit || Response.error();
  }
}
