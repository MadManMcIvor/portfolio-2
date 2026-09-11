/*
 * Cache-first service worker for /workout/.
 *
 * The whole app is a handful of static files, so the shell is precached on
 * install and served from the cache after that — the point is that a circuit
 * still runs in a gym with no signal. Each response is quietly revalidated in
 * the background, so a deploy lands on the next visit.
 *
 * Bump CACHE_VERSION when the shell changes; the old cache is dropped on
 * activate.
 */
const CACHE_VERSION = 'workout-v6';

const SHELL = [
  './',
  './index.html',
  './tokens.css',
  './styles.css',
  './manifest.webmanifest',
  './data/exercises.json',
  './js/main.js',
  './js/app.js',
  './js/board.js',
  './js/builder.js',
  './js/calendar.js',
  './js/equipment.js',
  './js/exercises.js',
  './js/favourites.js',
  './js/library.js',
  './js/player.js',
  './js/schedule.js',
  './js/settings.js',
  './js/storage.js',
  './js/themeToggle.js',
  './js/transfer.js',
  './js/util.js',
  './icons/icon.svg',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL('./', self.location.href).pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        // Offline and nothing cached: for a navigation, fall back to the shell
        // so the app still opens on a deep link.
        .catch(() => (request.mode === 'navigate' ? caches.match('./index.html') : undefined));

      return cached || fresh;
    })
  );
});
