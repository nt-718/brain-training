const CACHE_NAME = 'noutore-v3';
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
  './css/color-vision.css',
  './css/color-code.css',
  './css/mirror-path.css',
  './css/pair-logic.css',
  './css/chain-word.css',
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
  './js/color-vision.js',
  './js/color-code.js',
  './js/mirror-path.js',
  './js/pair-logic.js',
  './js/chain-word.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  // 新しいSWを即座にアクティブにする
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  // すべてのタブを即座に新しいSWの管理下に置く
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // ネットワーク優先：常に最新を取得し、オフライン時のみキャッシュを使う
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 成功したレスポンスをキャッシュに更新
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
