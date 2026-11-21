// Vectrex web player: offline and instant start.
// The page and its files are served from this cache straight away, and refreshed from the
// network in the background, so an update shows up on the next visit. Offline, the cache is used.
const CACHE = 'vectrex-player';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    // a page is cached under its own path, so the public page and dev/ never stand in for each other
    const path = new URL(req.url).pathname;
    const key = req.mode === 'navigate' ? (path.endsWith('/') ? path + 'index.html' : path) : req;
    const hit = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(res => {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
