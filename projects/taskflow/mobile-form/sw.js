const CACHE_NAME = 'taskflow-mobile-v2';
const ASSETS = [
  './index.html',
  './style.css',
  './main.js',
  './sw.js',
  '../bot/templates.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
