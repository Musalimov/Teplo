// Версию менять при каждом обновлении файлов игры.
const CACHE = "teplo-11";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html")
                 || url.pathname.endsWith("/");
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isPage) {
      // страницу всегда берём из сети, кэш — только запасной вариант без интернета
      try {
        const res = await fetch(e.request, { cache: "no-store" });
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        return (await cache.match(e.request)) || new Response("нет сети", { status: 504 });
      }
    }
    // словари неизменны при своих именах — их держим в кэше
    const hit = await cache.match(e.request);
    if (hit) return hit;
    const res = await fetch(e.request);
    if (res.ok) cache.put(e.request, res.clone());
    return res;
  })());
});
