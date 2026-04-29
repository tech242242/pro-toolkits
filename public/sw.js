// Simple Service Worker to satisfy PWA installation requirements
const CACHE_NAME = 'tool-kit-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler needed for PWA
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
