self.addEventListener('install', (e) => {
    console.log('service worker installed');
    // e.waitUntil(
    //     caches.open('static')
    //     .then((cache) => {
    //         cache.addAll([]);
    //     })
    // );
});

self.addEventListener('activate', () => {
    console.log('SW activated');
});

self.addEventListener('fetch', (event) => {
    // event.respondWith(
    //     caches.match(event.request)
    //     .then((res) => {
    //         if (res) {
    //             return res;
    //         } else {
    //             return fetch(event.request);
    //         }
    //     })
    // );
    console.log('event fetched');
});