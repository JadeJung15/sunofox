const SF_STUDIO_CACHE = 'sf-studio-20260614-music-to-novel';
const SF_STUDIO_ASSETS = [
  '/manifest.webmanifest',
  '/css/style.css?v=20260607-auth',
  '/css/mv-storyboard.css?v=20260607-auth',
  '/js/mvStoryboardStudio.js?v=20260701-workflow-import-options',
  '/assets/sunofox-logo-black.png',
  '/assets/novels/villainess-page-one-cover.jpg',
  '/assets/sf-studio-icon-192.png',
  '/assets/sf-studio-icon-512.png',
  '/assets/sunofox-app-icon-192.png',
  '/assets/sunofox-app-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SF_STUDIO_CACHE)
      .then((cache) => Promise.allSettled(
        SF_STUDIO_ASSETS.map((asset) => cache.add(new Request(asset, { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('sf-studio-') && key !== SF_STUDIO_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const acceptsHtml = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
  if (acceptsHtml) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkResponse = fetch(request).then((response) => {
        if (response.ok && ['style', 'script', 'image', 'font'].includes(request.destination)) {
          const clone = response.clone();
          caches.open(SF_STUDIO_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || networkResponse;
    })
  );
});
