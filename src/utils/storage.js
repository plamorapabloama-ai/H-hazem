const DB_NAME = 'EgyHR';
const DB_VERSION = 1;
const STORE_NAME = 'data';
const DATA_VERSION_KEY = 'egy_hr_data_version';
const CURRENT_DATA_VERSION = '2.0.0';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function dbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silent fail
  }
}

export async function dbRemove(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silent fail
  }
}

export async function dbClear() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silent fail
  }
}

export async function dbKeys() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

const MIGRATED_KEY = 'egy_hr_migrated_to_idb';

export async function migrateFromLocalStorage() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  const keys = [
    'egy_hr_currentUser',
    'egy_hr_employees',
    'egy_hr_effects',
    'egy_hr_settings',
    'egy_hr_adminPassword'
  ];
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      await dbSet(key, val);
    }
  }
  localStorage.setItem(MIGRATED_KEY, '1');
}

export async function loadAllFromDB() {
  const keys = [
    'egy_hr_currentUser',
    'egy_hr_employees',
    'egy_hr_effects',
    'egy_hr_settings',
    'egy_hr_adminPassword'
  ];
  const result = {};
  for (const key of keys) {
    result[key] = await dbGet(key);
  }
  return result;
}

export async function saveAllToDB(data) {
  const entries = Object.entries(data);
  for (const [key, value] of entries) {
    await dbSet(key, value);
  }
}

export async function clearAllDB() {
  await dbClear();
}

/**
 * فحص إصدار البيانات — إذا تغير يمسح كل شيء ويبدأ من جديد
 */
export async function checkAndResetDB() {
  try {
    const storedVersion = await dbGet(DATA_VERSION_KEY);
    if (storedVersion !== CURRENT_DATA_VERSION) {
      await dbClear();
      await dbSet(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      return true; // تم التصفير
    }
    return false;
  } catch {
    return false;
  }
}

export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return {
      usageBytes: est.usage || 0,
      quotaBytes: est.quota || 0,
      usageMB: ((est.usage || 0) / (1024 * 1024)).toFixed(2),
      quotaMB: ((est.quota || 0) / (1024 * 1024)).toFixed(0),
      percent: est.quota ? Math.min(((est.usage || 0) / est.quota) * 100, 100) : 0
    };
  }
  return null;
}
