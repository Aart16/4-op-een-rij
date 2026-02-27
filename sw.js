self.addEventListener('fetch', (event) => {
    // Basis service worker om de app offline te laten werken
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});