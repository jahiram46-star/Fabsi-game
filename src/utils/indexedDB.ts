import { UserProfile, LevelResult } from '../types.ts';

const DB_NAME = 'fabsi_puzzle_db';
const DB_VERSION = 1;
const STORE_USER = 'user_profile';
const STORE_PROGRESS = 'level_progress';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_USER)) {
        db.createObjectStore(STORE_USER, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: 'levelId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

const LOCAL_STORAGE_USER_KEY = 'fabsi_idb_user_profile';

export async function saveProfileToIndexedDB(profile: UserProfile): Promise<void> {
  // Always mirror in localStorage for redundancy
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_USER], 'readwrite');
      const store = tx.objectStore(STORE_USER);
      const req = store.put(profile);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveProfile error, used localStorage fallback:', err);
  }
}

export async function getProfileFromIndexedDB(): Promise<UserProfile | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_USER], 'readonly');
      const store = tx.objectStore(STORE_USER);
      const req = store.get('current_user');

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          const local = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          resolve(local ? JSON.parse(local) : null);
        }
      };

      req.onerror = () => {
        const local = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        resolve(local ? JSON.parse(local) : null);
      };
    });
  } catch {
    const local = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return local ? JSON.parse(local) : null;
  }
}

export async function saveLevelProgressToIndexedDB(result: LevelResult): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROGRESS], 'readwrite');
      const store = tx.objectStore(STORE_PROGRESS);
      const req = store.put({
        levelId: result.levelId,
        score: result.score,
        moves: result.moves,
        timeSeconds: result.timeSeconds,
        stars: result.stars,
        completedAt: new Date().toISOString(),
      });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveLevelProgress error:', err);
  }
}

export async function clearProfileFromIndexedDB(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_USER, STORE_PROGRESS], 'readwrite');
      tx.objectStore(STORE_USER).clear();
      tx.objectStore(STORE_PROGRESS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}
