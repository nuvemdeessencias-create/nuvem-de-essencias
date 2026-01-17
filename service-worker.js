const CACHE_NAME = 'nuvem-essencias-v1';
const assets = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instala o Service Worker e armazena os arquivos básicos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Faz o app carregar os arquivos do cache quando estiver offline ou lento
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
