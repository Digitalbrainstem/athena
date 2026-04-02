import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OfflineManager } from '../../src/net/offline.js';
import type { SyncableEvent } from '../../src/net/offline.js';

// ---------------------------------------------------------------------------
// Fake IndexedDB — vitest/jsdom ships a minimal IDB implementation, but we
// need to ensure operations work end-to-end. We use the real fake-indexeddb
// polyfill that jsdom provides.
// ---------------------------------------------------------------------------

describe('OfflineManager', () => {
  let manager: OfflineManager;

  beforeEach(async () => {
    // Reset navigator.onLine between tests
    vi.stubGlobal('navigator', { onLine: true });
    manager = new OfflineManager();
    await manager.clearQueue();
  });

  afterEach(() => {
    manager.dispose();
    vi.unstubAllGlobals();
  });

  // ---------- Status detection ------------------------------------------------

  it('reports online when navigator.onLine is true', () => {
    vi.stubGlobal('navigator', { onLine: true });
    expect(manager.isOnline()).toBe(true);
  });

  it('reports offline when navigator.onLine is false', () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(manager.isOnline()).toBe(false);
  });

  it('returns true when navigator is undefined (SSR-safe)', () => {
    vi.stubGlobal('navigator', undefined);
    // Must create a new manager after stubbing
    const m = new OfflineManager();
    expect(m.isOnline()).toBe(true);
    m.dispose();
  });

  // ---------- Status change callbacks -----------------------------------------

  it('fires callbacks on online event', () => {
    const cb = vi.fn();
    manager.onStatusChange(cb);
    window.dispatchEvent(new Event('online'));
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('fires callbacks on offline event', () => {
    const cb = vi.fn();
    manager.onStatusChange(cb);
    window.dispatchEvent(new Event('offline'));
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('supports multiple listeners', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    manager.onStatusChange(cb1);
    manager.onStatusChange(cb2);
    window.dispatchEvent(new Event('offline'));
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('does not fire after dispose', () => {
    const cb = vi.fn();
    manager.onStatusChange(cb);
    manager.dispose();
    window.dispatchEvent(new Event('offline'));
    expect(cb).not.toHaveBeenCalled();
  });

  it('tolerates callback errors without breaking other listeners', () => {
    const badCb = vi.fn(() => { throw new Error('boom'); });
    const goodCb = vi.fn();
    manager.onStatusChange(badCb);
    manager.onStatusChange(goodCb);
    window.dispatchEvent(new Event('online'));
    expect(badCb).toHaveBeenCalled();
    expect(goodCb).toHaveBeenCalled();
  });

  // ---------- Accessibility announcements -------------------------------------

  it('announces offline status to screen readers', () => {
    const announcer = vi.fn();
    const m = new OfflineManager(announcer);
    window.dispatchEvent(new Event('offline'));
    expect(announcer).toHaveBeenCalledWith('Playing offline. Your progress is saved locally.');
    m.dispose();
  });

  it('announces online status to screen readers', () => {
    const announcer = vi.fn();
    const m = new OfflineManager(announcer);
    window.dispatchEvent(new Event('online'));
    expect(announcer).toHaveBeenCalledWith('Connected. Syncing your progress.');
    m.dispose();
  });

  // ---------- Sync queue (IndexedDB) ------------------------------------------

  it('queues events and reports queue size', async () => {
    const event: SyncableEvent = {
      kind: 'learning_event',
      payload: { subject: 'math', action: 'solve' },
      createdAt: Date.now(),
    };
    await manager.queueForSync(event);
    expect(await manager.getQueueSize()).toBe(1);
  });

  it('flushQueue returns all events in order and clears the queue', async () => {
    const e1: SyncableEvent = { kind: 'learning_event', payload: { n: 1 }, createdAt: 1000 };
    const e2: SyncableEvent = { kind: 'quest_completion', payload: { n: 2 }, createdAt: 2000 };
    await manager.queueForSync(e1);
    await manager.queueForSync(e2);

    const flushed = await manager.flushQueue();
    expect(flushed).toHaveLength(2);
    expect(flushed[0]!.kind).toBe('learning_event');
    expect(flushed[1]!.kind).toBe('quest_completion');

    // Queue is now empty
    expect(await manager.getQueueSize()).toBe(0);
  });

  it('flushQueue returns empty array when nothing is queued', async () => {
    const flushed = await manager.flushQueue();
    expect(flushed).toEqual([]);
  });

  it('clearQueue drops all pending events', async () => {
    await manager.queueForSync({ kind: 'mastery_update', payload: {}, createdAt: Date.now() });
    await manager.queueForSync({ kind: 'mastery_update', payload: {}, createdAt: Date.now() });
    expect(await manager.getQueueSize()).toBe(2);
    await manager.clearQueue();
    expect(await manager.getQueueSize()).toBe(0);
  });

  // ---------- Dispose idempotency ---------------------------------------------

  it('dispose is idempotent', () => {
    manager.dispose();
    manager.dispose(); // should not throw
  });
});
