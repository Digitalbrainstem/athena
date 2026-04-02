/**
 * ContentCache — IndexedDB-backed cache for quest content, audio files,
 * textures, and other game assets that need to be available offline.
 *
 * Unlike the Service Worker cache (which handles HTTP request/response pairs),
 * this cache stores structured game data so the engine can query it directly.
 *
 * Design goals:
 *   • Pre-cache months of content ahead of the player's level
 *   • Track cache version for delta updates
 *   • Storage quota management (< 500 MB target)
 */

import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CachedContent {
  /** Unique key — e.g. "quest:geometry-bridge-01" or "audio:companion-greeting" */
  key: string;
  /** MIME type or a domain-specific type tag. */
  contentType: string;
  /** The actual data (JSON object, ArrayBuffer for binary, string for text). */
  data: unknown;
  /** ISO timestamp when this entry was cached. */
  cachedAt: string;
  /** Content version from the server — used for delta updates. */
  version: number;
  /** Size in bytes (approximate, for quota tracking). */
  sizeBytes: number;
}

export interface CacheStats {
  /** Total entries currently stored. */
  entryCount: number;
  /** Approximate total size in bytes. */
  totalBytes: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'nexus-content';
const DB_VERSION = 1;
const STORE_NAME = 'content';
const META_STORE = 'meta';

/** Target maximum cache size in bytes (500 MB). */
export const MAX_CACHE_BYTES = 500 * 1024 * 1024;

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

function openContentDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('contentType', 'contentType', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// ContentCache
// ---------------------------------------------------------------------------

export class ContentCache implements Disposable {
  /** @internal Set to true once dispose() is called. */
  get disposed(): boolean { return this._d; }
  private _d = false;

  // ---- Core CRUD -----------------------------------------------------------

  /** Store a content entry. Overwrites if the key already exists. */
  async put(entry: CachedContent): Promise<void> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(entry);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  /** Retrieve a single entry by key, or null if not cached. */
  async get(key: string): Promise<CachedContent | null> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => { db.close(); resolve((req.result as CachedContent) ?? null); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  /** Check whether a key exists without reading the full data. */
  async has(key: string): Promise<boolean> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getKey(key);
      req.onsuccess = () => { db.close(); resolve(req.result !== undefined); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  /** Remove a single cached entry. */
  async remove(key: string): Promise<void> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  /** Remove all cached content. */
  async clear(): Promise<void> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  // ---- Querying -------------------------------------------------------------

  /** Return all keys matching a prefix (e.g. "quest:" or "audio:"). */
  async keysByPrefix(prefix: string): Promise<string[]> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const range = IDBKeyRange.bound(prefix, prefix + '\uffff');
      const req = tx.objectStore(STORE_NAME).getAllKeys(range);
      req.onsuccess = () => { db.close(); resolve(req.result as string[]); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  /** Return entries matching a content type (via index). */
  async getByType(contentType: string): Promise<CachedContent[]> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const idx = tx.objectStore(STORE_NAME).index('contentType');
      const req = idx.getAll(contentType);
      req.onsuccess = () => { db.close(); resolve(req.result as CachedContent[]); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  // ---- Versioning -----------------------------------------------------------

  /**
   * Return the cached version number for a key, or 0 if not cached.
   * Useful for delta-update checks without reading the full payload.
   */
  async getVersion(key: string): Promise<number> {
    const entry = await this.get(key);
    return entry?.version ?? 0;
  }

  /**
   * Store content only if the incoming version is newer than what we have.
   * Returns true if the entry was written, false if skipped.
   */
  async putIfNewer(entry: CachedContent): Promise<boolean> {
    const current = await this.getVersion(entry.key);
    if (entry.version <= current) return false;
    await this.put(entry);
    return true;
  }

  // ---- Quota management -----------------------------------------------------

  /** Compute approximate cache stats. */
  async stats(): Promise<CacheStats> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      let entryCount = 0;
      let totalBytes = 0;
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          entryCount++;
          totalBytes += (c.value as CachedContent).sizeBytes;
          c.continue();
        }
      };
      tx.oncomplete = () => { db.close(); resolve({ entryCount, totalBytes }); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  /**
   * Evict oldest entries until totalBytes is under the given limit.
   * Entries are sorted by cachedAt ascending and removed one at a time.
   */
  async evictUntilUnder(maxBytes: number = MAX_CACHE_BYTES): Promise<number> {
    const { totalBytes } = await this.stats();
    if (totalBytes <= maxBytes) return 0;

    let remaining = totalBytes;
    let evicted = 0;
    const db = await openContentDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const idx = tx.objectStore(STORE_NAME).index('cachedAt');
      const cursor = idx.openCursor();

      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c && remaining > maxBytes) {
          remaining -= (c.value as CachedContent).sizeBytes;
          evicted++;
          c.delete();
          c.continue();
        }
      };
      tx.oncomplete = () => { db.close(); resolve(evicted); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  // ---- Meta store (for cache version tracking) ------------------------------

  /** Store a metadata key/value (e.g. "last-sync-time"). */
  async setMeta(key: string, value: unknown): Promise<void> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readwrite');
      tx.objectStore(META_STORE).put({ key, value });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  /** Retrieve a metadata value by key. */
  async getMeta<T = unknown>(key: string): Promise<T | null> {
    const db = await openContentDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get(key);
      req.onsuccess = () => {
        db.close();
        const row = req.result as { key: string; value: T } | undefined;
        resolve(row?.value ?? null);
      };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  // ---- Lifecycle ------------------------------------------------------------

  dispose(): void {
    this._d = true;
  }
}
