const CACHE_NAME = 'task-manager-v2'; // Incremented cache version
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Install event: Caches the basic files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event: Cleans up old caches and takes control immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) { // Delete caches that don't match the current CACHE_NAME
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // This line ensures that the new Service Worker takes control immediately after activation.
  return self.clients.claim();
});

// Fetch event: Network-first for index.html, then cache-first for others
self.addEventListener('fetch', (event) => {
  // For index.html (and the root path), try network first, then fall back to cache
  if (event.request.url.endsWith('/index.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('[Service Worker] Network failed for index.html, serving from cache');
        return caches.match(event.request);
      })
    );
    return; // Stop further processing for index.html
  }

  // For all other assets, use a cache-first, then network strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        console.log('[Service Worker] Failed to fetch and no cache for:', event.request.url);
      });
    })
  );
});