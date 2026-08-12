const VERSION = 'singlish-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './about.html',
  './privacy.html',
  './terms.html',
  './styles.css',
  './converter.js',
  './fmabhaya.js',
  './manifest.webmanifest',
  './image/app-logo.png',
  './image/favicon-96x96.png',
  './image/hero.jpg',
  './image/ios.png',
  './image/logo-800x800.png',
  './image/icon-192.png',
  './image/icon-512.png',
  './fonts/FMAbhaya.ttf',
  './fonts/FMBindumathi.ttf',
  './fonts/FMEmanee.ttf',
  './fonts/FMGanganee.ttf',
  './fonts/FMGemunu.ttf',
  './fonts/FMMalithi.ttf',
  './fonts/FMArjunn.ttf',
  './fonts/4uAjantha.ttf',
  './fonts/4uAnurada.ttf',
  './fonts/4uAraliya.ttf',
  './fonts/DLManel.ttf',
  './fonts/0KDMANEL.ttf',
  './fonts/CCMottaTypeOne.ttf',
  './fonts/cpw_arana.ttf',
  './fonts/TharuDigitalNikini.ttf',
  './fonts/tharu_digital_mahee.ttf'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS).then(function () {
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== VERSION) return caches.delete(key);
      })).then(function () {
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      return cached || fetch(request).then(function (response) {
        var copy = response.clone();
        caches.open(VERSION).then(function (cache) {
          cache.put(request, copy);
        });
        return response;
      })['catch'](function () {
        return caches.match('./');
      });
    })
  );
});
