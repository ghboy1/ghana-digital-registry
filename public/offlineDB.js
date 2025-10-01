// Offline Database for storing registrations when offline
class OfflineDB {
  constructor() {
    this.dbName = 'OfflineRegistryDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for pending registrations
        if (!db.objectStoreNames.contains('pendingRegistrations')) {
          const store = db.createObjectStore('pendingRegistrations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create object store for cached records
        if (!db.objectStoreNames.contains('cachedRecords')) {
          const store = db.createObjectStore('cachedRecords', { 
            keyPath: 'registration_number' 
          });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'registration_date', { unique: false });
        }
      };
    });
  }

  // Add a pending registration (when offline)
  async addPendingRegistration(type, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingRegistrations'], 'readwrite');
      const store = transaction.objectStore('pendingRegistrations');
      
      const registration = {
        type: type,
        data: data,
        timestamp: new Date().getTime(),
        status: 'pending'
      };

      const request = store.add(registration);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending registrations
  async getPendingRegistrations() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingRegistrations'], 'readonly');
      const store = transaction.objectStore('pendingRegistrations');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove a pending registration (after successful sync)
  async removePendingRegistration(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingRegistrations'], 'readwrite');
      const store = transaction.objectStore('pendingRegistrations');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache records for offline viewing
  async cacheRecords(type, records) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cachedRecords'], 'readwrite');
      const store = transaction.objectStore('cachedRecords');

      // Clear existing records of this type
      const clearRequest = store.index('type').openCursor(IDBKeyRange.only(type));
      
      clearRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          // Add new records
          records.forEach(record => {
            record.cacheType = type;
            store.add(record);
          });
          resolve();
        }
      };

      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  // Get cached records
  async getCachedRecords(type) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cachedRecords'], 'readonly');
      const store = transaction.objectStore('cachedRecords');
      const index = store.index('type');
      const request = index.getAll(IDBKeyRange.only(type));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if we have cached data
  async hasCachedData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cachedRecords'], 'readonly');
      const store = transaction.objectStore('cachedRecords');
      const request = store.count();

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }
}

// Create global instance
const offlineDB = new OfflineDB();