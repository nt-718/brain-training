const CACHE_NAME = 'noutore-v37';
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
  './css/shell-game.css',
  './css/just-stop.css',
  './css/sequence-memory.css',
  './css/emoji-order.css',
  './css/color-vision.css',
  './css/mirror-path.css',
  './css/pair-logic.css',
  './css/leaderboard.css',
  './js/auth.js',
  './js/settings.js',
  './js/api.js',
  './js/leaderboard.js',
  './js/main.js',
  './js/visual-calc.js',
  './js/num-tap.js',
  './js/memory-matrix.js',
  './js/color-match.js',
  './js/n-back.js',
  './js/flash-math.js',
  './js/shell-game.js',
  './js/just-stop.js',
  './js/sequence-memory.js',
  './js/emoji-order.js',
  './js/color-vision.js',
  './js/mirror-path.js',
  './js/pair-logic.js',
  './css/balance-scale.css',
  './js/balance-scale.js',
  './css/pattern-next.css',
  './js/pattern-next.js',
  './css/mental-nav.css',
  './js/mental-nav.js',
  './css/apple-catch.css',
  './js/apple-catch.js',
  './css/num-order.css',
  './js/num-order.js',
  './css/obj-count.css',
  './js/obj-count.js',
  './css/hi-lo.css',
  './js/hi-lo.js',
  './css/color-seq.css',
  './js/color-seq.js',
  './css/prime-hunt.css',
  './js/prime-hunt.js',
  './css/card-flip.css',
  './js/card-flip.js',
  './css/cube-count.css',
  './js/cube-count.js',
  './css/make-ten.css',
  './js/make-ten.js',
  './css/flash-sudoku.css',
  './js/flash-sudoku.js',
  './css/race-pos.css',
  './js/race-pos.js',
  './css/day-calc.css',
  './js/day-calc.js',
  './css/dollar-calc.css',
  './js/dollar-calc.js',
  './css/double-detect.css',
  './js/double-detect.js',
  './css/tax-calc.css',
  './js/tax-calc.js',
  './css/otp-memory.css',
  './js/otp-memory.js',
  './css/arrow-swipe.css',
  './js/arrow-swipe.js',
  './css/clock-calc.css',
  './js/clock-calc.js',
  './css/lights-out.css',
  './js/lights-out.js',
  './css/emoji-finder.css',
  './js/emoji-finder.js',
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
  const url = new URL(e.request.url);

  // APIリクエストやGET以外のリクエストはキャッシュしない（常にネットワーク）
  if (url.pathname.startsWith('/api/') || e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  // ネットワーク優先：常に最新を取得し、オフライン時のみキャッシュを使う
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 成功し、有効なレスポンスのみキャッシュに更新 (外部APIのDiceBearなどのCORSも含める)
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
