// кладёт всё в кэш при первом успешном открытии, дальше игра работает без интернета
const CACHE = "teplo-1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request);
    if (hit) return hit;
    const res = await fetch(e.request);
    if (res.ok) (await caches.open(CACHE)).put(e.request, res.clone());
    return res;
  })());
});
