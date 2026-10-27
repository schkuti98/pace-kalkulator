// Dateien merken, damit die App ohne Internet funktioniert
const speicherName = 'pace-kalkulator-v1';
const dateien = [
   './',
   './index.html',
   './style.css',
   './script.js',
   './manifest.json',
   './icons/icon-192.png',
   './icons/icon-512.png'
];

self.addEventListener('install', function (ereignis) {
   ereignis.waitUntil(
      caches.open(speicherName).then(function (speicher) {
         return speicher.addAll(dateien);
      })
   );
   self.skipWaiting();
});

self.addEventListener('activate', function (ereignis) {
   ereignis.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (ereignis) {
   if (ereignis.request.method !== 'GET') return;
   ereignis.respondWith(
      caches.match(ereignis.request).then(function (antwort) {
         return antwort || fetch(ereignis.request);
      })
   );
});
