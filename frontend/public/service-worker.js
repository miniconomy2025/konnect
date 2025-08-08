/* Simple image caching service worker (stale-while-revalidate) */
const CACHE_NAME = 'image-cache-v1';

self.addEventListener('install', (event) => {
  // Only proceed if secure context; otherwise do nothing
  if (!self.isSecureContext) {
    return;
  }
  // Activate immediately on install
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (!self.isSecureContext) return;
  // Clean up old caches
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (!self.isSecureContext) return;
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImageRequest =
    req.destination === 'image' || /\.(png|jpe?g|gif|webp|svg|ico|bmp|avif)$/i.test(url.pathname);

  if (!isImageRequest) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req, { ignoreVary: true, ignoreSearch: false });

      const doNetworkFetch = async () => {
        try {
          let res = await fetch(req);
          if (res && res.status >= 400) {
            // Retry with no-cors for hosts that block hotlinking
            const noCorsReq = new Request(req.url, { mode: 'no-cors', method: 'GET', headers: req.headers, credentials: 'omit', cache: 'no-store' });
            res = await fetch(noCorsReq);
          }
          try {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              await cache.put(req, res.clone());
            }
          } catch (_) {}
          return res;
        } catch (_) {
          return cached;
        }
      };

      return cached || (await doNetworkFetch());
    })()
  );
});

