const CACHE_NAME = "farmer-app-v1";
const VERSION_URL = "/api/version";

let currentVersion = null;

async function checkForUpdate() {
  try {
    const response = await fetch(VERSION_URL + "?t=" + Date.now());
    const data = await response.json();
    
    if (currentVersion && data.version !== currentVersion) {
      currentVersion = data.version;
      notifyClients();
    }
    
    currentVersion = data.version;
  } catch (e) {
    console.log("Version check failed:", e);
  }
}

function notifyClients() {
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "UPDATE_AVAILABLE",
        version: currentVersion,
      });
    });
  });
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
  
  checkForUpdate();
  setInterval(checkForUpdate, 60000);
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_VERSION") {
    checkForUpdate();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  if (event.request.url.includes(VERSION_URL)) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          response.clone().then((r) => r.json().then((data) => {
            currentVersion = data.version;
          }));
        }
        return response;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});