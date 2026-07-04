# 13 — Offline Patterns

## Problem
Bangladesh internet is unreliable. Apps must work offline or degrade gracefully.

## Pattern 1: Service Worker (Cordova + Capacitor)

### Register Service Worker
```javascript
// index.html — register after app loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}
```

### Service Worker (sw.js) — Cache First
```javascript
const CACHE_NAME = 'app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/css/style.css',
  '/utils.js',
  '/db-firebase.js',
  '/auth.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Return cached if available, else fetch from network
      return cached || fetch(event.request).then(response => {
        // Cache successful network responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Both cache and network failed — show offline page
        return caches.match('/offline.html');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
```

## Pattern 2: IndexedDB for Local Data (Cordova)

Use localStorage for simple data, but with try/catch since private mode blocks it.

```javascript
// Safe localStorage wrapper
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch(e) { return null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, val); return true; } catch(e) { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch(e) {}
  }
};
```

For larger data, use Dexie.js (IndexedDB wrapper):
```html
<script src="https://unpkg.com/dexie@3/dist/dexie.js"></script>
<script>
const db = new Dexie('AppOfflineDB');
db.version(1).stores({
  orders: '++id, date, status',
  products: '++id, name, category'
});

// Save offline
function saveOffline(table, data) {
  return db[table].put(data);
}

// Sync when online
function syncPending() {
  // Check network
  if (navigator.onLine) {
    db.orders.where('synced').equals(0).each(order => {
      // Upload to Firebase/Supabase
      uploadOrder(order).then(() => {
        db.orders.update(order.id, { synced: 1 });
      });
    });
  }
}

// Listen for connectivity
window.addEventListener('online', syncPending);
</script>
```

## Pattern 3: Offline Queue for Writes

When user makes changes offline, queue them and sync when online.

```javascript
const offlineQueue = [];

function queueWrite(collection, action, data) {
  offlineQueue.push({
    collection,
    action, // 'add' | 'update' | 'delete'
    data,
    timestamp: Date.now(),
    id: generateId()
  });
  // Save to localStorage
  storage.set('offline_queue', JSON.stringify(offlineQueue));
}

async function processOfflineQueue() {
  const queue = JSON.parse(storage.get('offline_queue') || '[]');
  for (const item of queue) {
    try {
      if (item.action === 'add') {
        await db.collection(item.collection).add(item.data);
      } else if (item.action === 'update') {
        await db.collection(item.collection).doc(item.data.id).update(item.data);
      }
      // Remove from queue
      offlineQueue.splice(offlineQueue.indexOf(item), 1);
    } catch(e) {
      console.log('Queue item failed (will retry):', item.id);
    }
  }
  storage.set('offline_queue', JSON.stringify(offlineQueue));
}

// Auto-process on connectivity
window.addEventListener('online', processOfflineQueue);
```

## Pattern 4: Offline Fallback UI

```javascript
function checkConnectivity() {
  if (!navigator.onLine) {
    showBanner('🔴 Offline — ডেটা লোকালি সেভ হবে। অনলাইন হলে সিঙ্ক হবে।');
  } else {
    hideBanner();
    processOfflineQueue();
  }
}

window.addEventListener('online', checkConnectivity);
window.addEventListener('offline', checkConnectivity);
checkConnectivity(); // Initial check
```

## Cordova Specific: Network Plugin
```javascript
document.addEventListener('deviceready', () => {
  function checkNetwork() {
    const networkState = navigator.connection.type;
    const states = {};
    states[Connection.NONE] = 'Offline';
    states[Connection.WIFI] = 'WiFi';
    states[Connection.CELL] = 'Mobile Data';
    return states[networkState] || 'Unknown';
  }
  document.addEventListener('online', () => showSyncButton());
  document.addEventListener('offline', () => showOfflineBanner());
});
```
