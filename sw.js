/* Service Worker - Encuesta Artesanos Isla Hermosa */
var APP_CACHE = 'artesanos-app-v2';
var TILE_CACHE = 'artesanos-tiles-v1';

var APP_FILES = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(APP_CACHE)
      .then(function(cache) { return cache.addAll(APP_FILES).catch(function() {}); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k !== APP_CACHE && k !== TILE_CACHE;
      }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url;
  try { url = new URL(e.request.url); } catch(x) { return; }

  /* OSM tiles — cache first, fetch on miss */
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(
      caches.open(TILE_CACHE).then(function(cache) {
        return cache.match(e.request).then(function(hit) {
          if (hit) return hit;
          return fetch(e.request, { mode: 'cors' }).then(function(res) {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(function() { return new Response('', { status: 503 }); });
        });
      })
    );
    return;
  }

  /* GAS API — network only; SW returns offline sentinel on failure */
  if (url.hostname === 'script.google.com') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response(
          JSON.stringify({ __error: 'offline' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  /* Leaflet CDN + Google Fonts — cache first */
  if (url.hostname === 'unpkg.com' ||
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(APP_CACHE).then(function(cache) {
        return cache.match(e.request).then(function(hit) {
          if (hit) return hit;
          return fetch(e.request).then(function(res) {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(function() { return new Response('', { status: 503 }); });
        });
      })
    );
    return;
  }

  /* App shell — cache first, revalidate in background */
  e.respondWith(
    caches.open(APP_CACHE).then(function(cache) {
      return cache.match(e.request).then(function(hit) {
        var networkFetch = fetch(e.request).then(function(res) {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(function() { return hit || new Response('Sin conexión', { status: 503 }); });
        return hit || networkFetch;
      });
    })
  );
});

/* ── Pre-carga de tiles por área (recibe mensaje desde la página) ── */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'CACHE_TILES') {
    precacheTiles(e.data.bbox, e.data.minZoom || 11, e.data.maxZoom || 16, e.source);
  }
});

function tileXY(lat, lng, z) {
  var n = Math.pow(2, z);
  var x = Math.floor((lng + 180) / 360 * n);
  var lr = lat * Math.PI / 180;
  var y = Math.floor((1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n);
  return { x: x, y: y };
}

function precacheTiles(bbox, zMin, zMax, client) {
  caches.open(TILE_CACHE).then(function(cache) {
    var urls = [];
    for (var z = zMin; z <= zMax; z++) {
      var sw = tileXY(bbox.south, bbox.west, z);
      var ne = tileXY(bbox.north, bbox.east, z);
      var x0 = Math.min(sw.x, ne.x), x1 = Math.max(sw.x, ne.x);
      var y0 = Math.min(sw.y, ne.y), y1 = Math.max(sw.y, ne.y);
      for (var x = x0; x <= x1; x++) {
        for (var y = y0; y <= y1; y++) {
          var sub = ['a','b','c'][(x + y) % 3];
          urls.push('https://' + sub + '.tile.openstreetmap.org/' + z + '/' + x + '/' + y + '.png');
        }
      }
    }
    var total = urls.length, done = 0, cached = 0;
    function tick() {
      done++;
      if (client) client.postMessage({ type: 'TILE_PROGRESS', done: done, total: total, cached: cached });
    }
    urls.forEach(function(url) {
      cache.match(url).then(function(hit) {
        if (hit) { cached++; tick(); return; }
        fetch(url, { mode: 'cors' }).then(function(res) {
          if (res.ok) { cache.put(url, res); cached++; }
          tick();
        }).catch(tick);
      });
    });
  });
}
