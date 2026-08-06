/* Dobble — palvelutyöntekijä.

   TÄRKEÄÄ: vain oman palvelimen pyynnöt käsitellään. Aiempi versio sieppasi
   myös Firebase-yhteyden ja tallensi virtayhteyden vastauksen välimuistiin,
   jolloin EventSource sai seuraavilla latauksilla valmiiksi päättyneen
   vastauksen elävän yhteyden sijaan — yhteys näytti katkenneen pysyvästi. */

var CACHE = "dobble-v60";
var FILES = [
  "./", "./index.html", "./manifest.json", "./config.js",
  "./icon-192.png", "./icon-512.png",
  "./icon-maskable-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* cache:"reload" ohittaa selaimen oman HTTP-välimuistin, jottei
         uuden nimen alle päädy vanhaa sisältöä. */
      return Promise.all(FILES.map(function (u) {
        return fetch(new Request(u, { cache: "reload" }))
          .then(function (r) { if (r.ok) return c.put(u, r); })
          .catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (e) {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  /* Vieraat osoitteet (Firebase) menevät koskemattomina läpi. */
  if (url.origin !== self.location.origin) return;

  var doc = (req.mode === "navigate") || /\.(html|js|json)$/.test(url.pathname);

  if (doc) {
    /* Verkko ensin: uusi versio tulee käyttöön heti, välimuisti on vara. */
    e.respondWith(
      fetch(req).then(function (r) {
        if (r && r.ok) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return r;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
    return;
  }

  /* Kuvat ym. välimuistista, koska ne eivät muutu. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) {
        if (r && r.ok) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return r;
      });
    })
  );
});
