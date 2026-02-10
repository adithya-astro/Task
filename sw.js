const CACHE_NAME = 'Task Manager';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Logic for offline support can be added here
  event.respondWith(fetch(event.request));
});