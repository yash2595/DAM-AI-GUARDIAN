// Service Worker DISABLED - Causing loading issues
// Will be re-enabled after fixing cache issues

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event - skipped');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests without caching
  event.respondWith(fetch(event.request));
});