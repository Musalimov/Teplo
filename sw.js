// Версию менять при каждом обновлении файлов игры — старый кэш тогда стирается.
const CACHE = "teplo-7";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request);
    // отдаём из кэша сразу, а свежую версию подтягиваем в фоне
    const fresh = fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await fresh) || new Response("нет сети", { status: 504 });
  })());
});
