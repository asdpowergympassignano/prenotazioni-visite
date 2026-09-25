/* Service worker della pagina prenotazioni.
   - Rende la pagina installabile come app e la fa aprire anche senza rete.
   - Quando c'è rete la pagina si scarica sempre fresca: nessuno resta con una
     versione vecchia.
   - Le richieste verso Google (i dati) e verso altri siti non passano mai di qui. */

var CACHE = 'visita-medica-v1';
var FILE = [
  './',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (chiavi) {
        return Promise.all(chiavi
          .filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  /* La pagina: prima la rete, e solo se manca si usa la copia salvata */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (r) {
        if (r.ok) {
          var copia = r.clone();
          caches.open(CACHE).then(function (c) { c.put('./', copia); });
        }
        return r;
      }).catch(function () {
        return caches.match('./');
      })
    );
    return;
  }

  /* Icone e manifest: la copia salvata, altrimenti la rete */
  e.respondWith(
    caches.match(req).then(function (r) { return r || fetch(req); })
  );
});
