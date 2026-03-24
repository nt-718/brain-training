const CACHE_NAME = 'noutore-v1';
const ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './css/common.css',
  './css/visual-calc.css',
  './css/num-tap.css',
  './css/memory-matrix.css',
  './css/color-match.css',
  './css/n-back.css',
  './css/flash-math.css',
  './css/target-search.css',
  './css/symbol-logic.css',
  './css/swipe-sort.css',
  './css/shell-game.css',
  './css/just-stop.css',
  './css/word-link.css',
  './css/sequence-memory.css',
  './css/emoji-order.css',
  './js/main.js',
  './js/visual-calc.js',
  './js/num-tap.js',
  './js/memory-matrix.js',
  './js/color-match.js',
  './js/n-back.js',
  './js/flash-math.js',
  './js/target-search.js',
  './js/symbol-logic.js',
  './js/swipe-sort.js',
  './js/shell-game.js',
  './js/just-stop.js',
  './js/word-link.js',
  './js/sequence-memory.js',
  './js/emoji-order.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});
