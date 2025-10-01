const CACHE_NAME = 'ghana-registry-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  // We'll cache the main page and assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // For API calls, let them go through but cache responses
  if (event.request.url.includes('/api/') || event.request.url.includes('/auth/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For static assets, try cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Cache the new response
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // If both cache and network fail, show offline page
              if (event.request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Sync event for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  // Get pending registrations from IndexedDB
  const db = await openDB();
  const pendingRegistrations = await getAllPendingRegistrations(db);
  
  for (const registration of pendingRegistrations) {
    try {
      let response;
      
      if (registration.type === 'birth') {
        response = await fetch('/api/births', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registration.data)
        });
      } else if (registration.type === 'death') {
        response = await fetch('/api/deaths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registration.data)
        });
      }
      
      if (response && response.ok) {
        // Remove from pending registrations
        await deletePendingRegistration(db, registration.id);
        console.log('Successfully synced registration:', registration.id);
        
        // Send notification to client
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              registrationId: registration.id,
              registrationType: registration.type
            });
          });
        });
      }
    } catch (error) {
      console.error('Sync failed for registration:', registration.id, error);
    }
  }
}

// IndexedDB helper functions for Service Worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineRegistryDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingRegistrations')) {
        const store = db.createObjectStore('pendingRegistrations', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getAllPendingRegistrations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingRegistrations'], 'readonly');
    const store = transaction.objectStore('pendingRegistrations');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deletePendingRegistration(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingRegistrations'], 'readwrite');
    const store = transaction.objectStore('pendingRegistrations');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}