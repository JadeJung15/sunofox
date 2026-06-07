const SF_STUDIO_CACHE = 'sf-studio-20260607-figma-reference-v2';
const SF_STUDIO_ASSETS = [
  '/manifest.webmanifest',
  '/css/style.css?v=20260607-fanpage',
  '/css/sf-home.css?v=20260607-figma-reference-v2',
  '/css/sf-category.css?v=20260607-categories',
  '/css/sf-community.css?v=20260607-d1-community',
  '/css/mv-storyboard.css?v=20260607-auth',
  '/js/sfLinkHub.js?v=20260607-media-fix',
  '/js/sfCommunity.js?v=20260607-d1-community',
  '/js/sfCommunityPost.js?v=20260607-d1-community',
  '/js/mvStoryboardStudio.js?v=20260607-auth',
  '/assets/sunofox-logo-black.png',
  '/assets/figma-home/sf-home-reference-v2.jpg',
  '/assets/sf-studio-icon-192.png',
  '/assets/sf-studio-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SF_STUDIO_CACHE)
      .then((cache) => cache.addAll(SF_STUDIO_ASSETS))
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

  if (url.pathname === '/' || url.pathname === '/mv-studio' || url.pathname === '/mv-studio.html' || url.pathname.startsWith('/mv-studio/')) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
