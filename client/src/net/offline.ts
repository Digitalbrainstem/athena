/**
 * OfflineManager — detects network status changes, queues syncable events,
 * and flushes them when connection returns.
 *
 * Designed so the game never loses progress. Offline is not degraded — it is
 * the default mode (Principle IX: standalone operation).
 */

import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Any event that can be replayed to the server when connection returns. */
export interface SyncableEvent {
  /** Discriminator so the server knows which endpoint to hit. */
  kind: 'learning_event' | 'quest_completion' | 'mastery_update';
  /** JSON-serialisable payload. */
  payload: Record<string, unknown>;
  /** Epoch-ms when the event was originally created. */
  createdAt: number;
}

export type StatusCallback = (online: boolean) => void;

// ---------------------------------------------------------------------------
// IndexedDB helpers (sync queue persistence)
// ---------------------------------------------------------------------------

const DB_NAME = 'nexus-offline';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(event: SyncableEvent): Promise<void> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(event);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbGetAll(): Promise<{ key: IDBValidKey; value: SyncableEvent }[]> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const results: { key: IDBValidKey; value: SyncableEvent }[] = [];
    const cursor = store.openCursor();
    cursor.onsuccess = () => {
      const c = cursor.result;
      if (c) {
        results.push({ key: c.key, value: c.value as SyncableEvent });
        c.continue();
      }
    };
    tx.oncomplete = () => { db.close(); resolve(results); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbDelete(keys: IDBValidKey[]): Promise<void> {
  if (keys.length === 0) return;
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const k of keys) store.delete(k);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbCount(): Promise<number> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function idbClear(): Promise<void> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ---------------------------------------------------------------------------
// OfflineManager
// ---------------------------------------------------------------------------

export class OfflineManager implements Disposable {
  private listeners: StatusCallback[] = [];
  private disposed = false;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  /** Announce status transitions to screen readers. */
  private announce: ((text: string) => void) | null = null;

  constructor(announcer?: (text: string) => void) {
    this.announce = announcer ?? null;

    if (typeof window !== 'undefined') {
      this.onlineHandler = () => this.handleStatusChange(true);
      this.offlineHandler = () => this.handleStatusChange(false);
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  // ---- Status queries -------------------------------------------------------

  /** True when the browser reports a network connection. */
  isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  /** Register a callback for online/offline transitions. */
  onStatusChange(callback: StatusCallback): void {
    this.listeners.push(callback);
  }

  // ---- Sync queue -----------------------------------------------------------

  /** Queue an event for later sync. Persisted in IndexedDB so nothing is lost. */
  async queueForSync(event: SyncableEvent): Promise<void> {
    await idbPut(event);
  }

  /**
   * Retrieve and remove all queued events (FIFO). Returns the events so the
   * caller can POST them to the server.
   */
  async flushQueue(): Promise<SyncableEvent[]> {
    const rows = await idbGetAll();
    if (rows.length === 0) return [];
    const keys = rows.map((r) => r.key);
    const events = rows.map((r) => r.value);
    await idbDelete(keys);
    return events;
  }

  /** Number of events waiting to sync. */
  async getQueueSize(): Promise<number> {
    return idbCount();
  }

  /** Drop all pending events (e.g. on user logout). */
  async clearQueue(): Promise<void> {
    await idbClear();
  }

  // ---- Lifecycle ------------------------------------------------------------

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.onlineHandler) window.removeEventListener('online', this.onlineHandler);
    if (this.offlineHandler) window.removeEventListener('offline', this.offlineHandler);
    this.onlineHandler = null;
    this.offlineHandler = null;
    this.listeners = [];
    this.announce = null;
  }

  // ---- Internals ------------------------------------------------------------

  private handleStatusChange(online: boolean): void {
    if (this.disposed) return;
    for (const cb of this.listeners) {
      try { cb(online); } catch { /* listener errors must not break the manager */ }
    }
    // Accessible announcements — connection status is meaningful to the player
    if (this.announce) {
      this.announce(
        online
          ? 'Connected. Syncing your progress.'
          : 'Playing offline. Your progress is saved locally.',
      );
    }
  }
}
