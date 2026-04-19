const CACHE_NAME = 'noutore-v49-no-cache';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // PWAキャッシュを完全に無効化（常にネットワークから取得）
  e.respondWith(
    fetch(e.request).catch(err => {
      console.error('Fetch failed:', err);
      throw err;
    })
  );
});
