// SoundLink service worker — cache the app shell so it runs fully offline.
const CACHE = 'soundlink-v4';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Network-first: always try to fetch the latest when online (so updates arrive),
// fall back to cache when offline. Keeps the app fresh AND fully offline-capable.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((r) => { const c = r.clone(); caches.open(CACHE).then((ca) => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request))
  );
});
