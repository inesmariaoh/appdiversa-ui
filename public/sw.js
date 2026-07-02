const CACHE_NOMBRE = 'appdiversa-static-v1';
const RECURSOS = ['/', '/manifest.webmanifest'];

globalThis.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) => cache.addAll(RECURSOS)).then(() => {
      globalThis.skipWaiting();
    })
  );
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_NOMBRE)
          .map((clave) => caches.delete(clave))
      )
    ).then(() => globalThis.clients.claim())
  );
});

globalThis.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) return respuestaCache;
      return fetch(event.request).then((respuestaRed) => {
        if (respuestaRed.ok && respuestaRed.type === 'basic') {
          const copia = respuestaRed.clone();
          caches
            .open(CACHE_NOMBRE)
            .then((cache) => cache.put(event.request, copia))
            .catch(() => {});
        }
        return respuestaRed;
      });
    })
  );
});
