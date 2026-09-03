/* SMARTIE Quote Desk — offline cache.
   Bump CACHE whenever you upload a new index.html, so every phone picks
   up the new version instead of serving the old one from its cache. */
const CACHE = 'smartie-quote-desk-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './jspdf.umd.min.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // never cache a sync push
  const url = new URL(req.url);
  if (url.hostname.includes('script.google.com')) return;  // stock sync always goes to the network

  // Network first for the page itself, so a new upload is picked up promptly.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: serve from cache, fall back to the network.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
