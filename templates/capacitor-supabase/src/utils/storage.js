/**
 * localStorage wrapper with try/catch — handles quota errors and SSR
 */

const STORAGE_PREFIX = 'app_';

/**
 * Safely get an item from localStorage
 * @param {string} key
 * @param {*} [defaultValue=null]
 * @returns {*}
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Stored value is not valid JSON, return the raw string
      try {
        return localStorage.getItem(STORAGE_PREFIX + key);
      } catch {
        return defaultValue;
      }
    }
    console.warn('localStorage getItem error:', err.message);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param {string} key
 * @param {*} value
 * @returns {boolean} success
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('localStorage quota exceeded. Clearing old data...');
      // Try to clear old cached data
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX + 'cache_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        // Retry
        localStorage.setItem(STORAGE_PREFIX + key, serialized);
        return true;
      } catch {
        console.error('localStorage still full after clearing cache');
        return false;
      }
    }
    console.warn('localStorage setItem error:', err.message);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.warn('localStorage removeItem error:', err.message);
  }
}

/**
 * Clear all app-prefixed items from localStorage
 * @returns {number} Number of items removed
 */
export function clearAppStorage() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return keysToRemove.length;
  } catch (err) {
    console.warn('localStorage clearAppStorage error:', err.message);
    return 0;
  }
}

/**
 * Check if localStorage is available (not blocked, not in SSR)
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = STORAGE_PREFIX + '_test_';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage info (if available)
 * @returns {{ used: number, remaining: number|null, total: number|null }}
 */
export function getStorageInfo() {
  const info = { used: 0, remaining: null, total: null };

  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16
      }
    }
    info.used = totalSize;

    // Estimate remaining (most browsers allow ~5MB)
    info.total = 5 * 1024 * 1024; // 5MB estimate
    info.remaining = Math.max(0, info.total - info.used);
  } catch {
    // Storage info not available
  }

  return info;
}

/**
 * Safe JSON parse with fallback
 * @param {string} str
 * @param {*} [fallback=null]
 * @returns {*}
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export default {
  getItem,
  setItem,
  removeItem,
  clearAppStorage,
  isStorageAvailable,
  getStorageInfo,
  safeJSONParse,
};
