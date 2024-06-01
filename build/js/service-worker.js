const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/fm.js',
    '/client.fm.js',
    '/shared.fm.js'
];

// Install a service worker
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Try the fetch, return cached response if no network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // add to cache if request was successful and url is in the list
                const requestUrl = new URL(event.request.url);
                if (urlsToCache.includes(requestUrl.pathname)) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
        .catch(() => {
            // Try to get the response from the cache
            return caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || Promise.reject('no-match');
            });
        })
    );
});


// Update a service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.keys().then((cacheKeys) => {
                return Promise.all(
                    cacheKeys.map((cacheKey) => {
                        const requestUrl = new URL(cacheKey.url);
                        if (!urlsToCache.includes(requestUrl.pathname)) {
                            // If the cached request is not in the list of URLs to cache, delete it
                            return cache.delete(cacheKey);
                        }
                    })
                );
            });
      }).then(() => {
            // Activate the service worker immediately after purging cache
            return self.clients.claim();
        })
    );
});
