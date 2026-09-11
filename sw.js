/* SMARTIE Quote Desk — offline cache.
   Bump CACHE whenever you upload a new index.html, so every phone picks
   up the new version instead of serving the old one from its cache.
   Paths are relative, so the app works from a project sub-folder such as
   https://<user>.github.io/quote-desk/ as well as from a domain root. */
const CACHE = 'smartie-quote-desk-v8c4';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './jspdf.umd.min.js',
  './icon-192.png',
  './icon-512.png',
  './maskable-192.png',
  './maskable-512.png',
  './apple-touch-180.png',
  './favicon-32.png',
  './favicon-16.png'
];

self.addEventListener('install', e => {
  // One missing file must not stop the whole shell from being cached.
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      SHELL.map(u => c.add(u).catch(() => null))
    ))
  );
  // No skipWaiting here: the page decides when to take the update, so a
  // half-finished quotation is never reloaded out from under anyone.
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();     // the page asked us to take over
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('smartie-quote-desk') && k !== CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // never cache a sync push
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache sign-in or database traffic — it must always be live, and a
  // cached token or query result would be both stale and unsafe. No signed-in
  // user's data is ever written into the cache.
  const LIVE = ['script.google.com','firestore.googleapis.com','identitytoolkit.googleapis.com',
                'securetoken.googleapis.com','firebaseinstallations.googleapis.com',
                'firebase.googleapis.com','www.googleapis.com','firebaselogging',
                'googleapis.com/google.firestore'];
  if (LIVE.some(h => url.href.includes(h))) return;

  // Network first for the page itself, so a new upload is picked up promptly.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Everything else: serve from cache, fall back to the network.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => hit))
  );
});
