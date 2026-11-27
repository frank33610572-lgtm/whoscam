const CACHE = 'whoscam-v13';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'videos/v1.jpg', 'videos/v2.jpg', 'videos/v3.jpg', 'videos/v4.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || e.request.headers.has('range')) return;
  if (e.request.mode === 'navigate') {
    // open instantly from cache, refresh the cached copy in the background
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match('index.html');
      const net = fetch(e.request).then(r => { if (r.ok) c.put('index.html', r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.search) return; // version checks etc. always go to the network
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && /\.(png|jpg|webmanifest)$/.test(url.pathname)) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
