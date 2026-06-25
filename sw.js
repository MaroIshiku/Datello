const CACHE_NAME = 'datello-static-2026-06-26-qr-safe';
const STATIC_ASSETS = [
  './', './index.html', './css/style.css', './js/app.js', './js/auth.js', './js/crypto.js', './js/qr.js', './js/store.js',
  './css/style.css?v=datello-qr-safe-20260626', './js/app.js?v=datello-qr-safe-20260626', './js/auth.js?v=datello-qr-safe-20260626', './js/crypto.js?v=datello-qr-safe-20260626', './js/qr.js?v=datello-qr-safe-20260626', './js/store.js?v=datello-qr-safe-20260626',
  './manifest.json?v=datello-qr-safe-20260626', './assets/datello-logo-20260626.png', './assets/datello-icon-192-20260626.png', './assets/datello-icon-512-20260626.png', './assets/datello-favicon-20260626.png', './assets/pb.png', './assets/pp.png'
];
const NETWORK_ONLY = /(?:api\/data|api\/token|data\.json|save\.php)(?:\?|$)/;
const STATIC_REQUEST = /\.(?:html|css|js|json|png|svg|webmanifest)(?:\?|$)/;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isStatic = url.origin === self.location.origin && (url.pathname === '/' || STATIC_REQUEST.test(url.pathname));
  if (!isStatic || NETWORK_ONLY.test(url.pathname) || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    if (!response.ok) return response;
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request)));
});
