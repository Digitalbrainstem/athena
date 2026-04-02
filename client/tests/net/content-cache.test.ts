import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentCache, MAX_CACHE_BYTES } from '../../src/net/content-cache.js';
import type { CachedContent } from '../../src/net/content-cache.js';

function makeEntry(overrides: Partial<CachedContent> = {}): CachedContent {
  return {
    key: overrides.key ?? 'quest:test-001',
    contentType: overrides.contentType ?? 'application/json',
    data: overrides.data ?? { title: 'Test Quest' },
    cachedAt: overrides.cachedAt ?? new Date().toISOString(),
    version: overrides.version ?? 1,
    sizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('ContentCache', () => {
  let cache: ContentCache;

  beforeEach(async () => {
    cache = new ContentCache();
    await cache.clear();
  });

  afterEach(() => {
    cache.dispose();
  });

  // ---------- Basic CRUD ------------------------------------------------------

  it('put then get returns the entry', async () => {
    const entry = makeEntry();
    await cache.put(entry);
    const result = await cache.get('quest:test-001');
    expect(result).not.toBeNull();
    expect(result!.key).toBe('quest:test-001');
    expect(result!.data).toEqual({ title: 'Test Quest' });
  });

  it('get returns null for missing key', async () => {
    expect(await cache.get('nonexistent')).toBeNull();
  });

  it('has returns true when entry exists', async () => {
    await cache.put(makeEntry());
    expect(await cache.has('quest:test-001')).toBe(true);
  });

  it('has returns false for missing key', async () => {
    expect(await cache.has('nope')).toBe(false);
  });

  it('remove deletes a single entry', async () => {
    await cache.put(makeEntry());
    await cache.remove('quest:test-001');
    expect(await cache.get('quest:test-001')).toBeNull();
  });

  it('clear removes all entries', async () => {
    await cache.put(makeEntry({ key: 'a' }));
    await cache.put(makeEntry({ key: 'b' }));
    await cache.clear();
    expect(await cache.has('a')).toBe(false);
    expect(await cache.has('b')).toBe(false);
  });

  // ---------- Overwrite -------------------------------------------------------

  it('put overwrites existing entry with same key', async () => {
    await cache.put(makeEntry({ version: 1, data: 'old' }));
    await cache.put(makeEntry({ version: 2, data: 'new' }));
    const result = await cache.get('quest:test-001');
    expect(result!.version).toBe(2);
    expect(result!.data).toBe('new');
  });

  // ---------- Querying --------------------------------------------------------

  it('keysByPrefix returns matching keys', async () => {
    await cache.put(makeEntry({ key: 'quest:a' }));
    await cache.put(makeEntry({ key: 'quest:b' }));
    await cache.put(makeEntry({ key: 'audio:c' }));

    const keys = await cache.keysByPrefix('quest:');
    expect(keys).toHaveLength(2);
    expect(keys).toContain('quest:a');
    expect(keys).toContain('quest:b');
  });

  it('keysByPrefix returns empty for no match', async () => {
    await cache.put(makeEntry({ key: 'quest:a' }));
    const keys = await cache.keysByPrefix('texture:');
    expect(keys).toHaveLength(0);
  });

  it('getByType returns entries with matching contentType', async () => {
    await cache.put(makeEntry({ key: 'a', contentType: 'audio/mp3' }));
    await cache.put(makeEntry({ key: 'b', contentType: 'audio/mp3' }));
    await cache.put(makeEntry({ key: 'c', contentType: 'application/json' }));

    const audio = await cache.getByType('audio/mp3');
    expect(audio).toHaveLength(2);
  });

  // ---------- Versioning ------------------------------------------------------

  it('getVersion returns 0 for uncached key', async () => {
    expect(await cache.getVersion('missing')).toBe(0);
  });

  it('getVersion returns stored version', async () => {
    await cache.put(makeEntry({ version: 7 }));
    expect(await cache.getVersion('quest:test-001')).toBe(7);
  });

  it('putIfNewer writes when version is higher', async () => {
    await cache.put(makeEntry({ version: 1 }));
    const wrote = await cache.putIfNewer(makeEntry({ version: 2, data: 'updated' }));
    expect(wrote).toBe(true);
    const result = await cache.get('quest:test-001');
    expect(result!.data).toBe('updated');
  });

  it('putIfNewer skips when version is same or older', async () => {
    await cache.put(makeEntry({ version: 5, data: 'original' }));
    expect(await cache.putIfNewer(makeEntry({ version: 5, data: 'nope' }))).toBe(false);
    expect(await cache.putIfNewer(makeEntry({ version: 3, data: 'nope' }))).toBe(false);
    const result = await cache.get('quest:test-001');
    expect(result!.data).toBe('original');
  });

  // ---------- Stats -----------------------------------------------------------

  it('stats reports entry count and total bytes', async () => {
    await cache.put(makeEntry({ key: 'a', sizeBytes: 100 }));
    await cache.put(makeEntry({ key: 'b', sizeBytes: 200 }));
    const s = await cache.stats();
    expect(s.entryCount).toBe(2);
    expect(s.totalBytes).toBe(300);
  });

  it('stats reports zero for empty cache', async () => {
    const s = await cache.stats();
    expect(s.entryCount).toBe(0);
    expect(s.totalBytes).toBe(0);
  });

  // ---------- Eviction --------------------------------------------------------

  it('evictUntilUnder removes oldest entries to fit under limit', async () => {
    // Insert 3 entries, each 200 bytes, with ascending cachedAt
    await cache.put(makeEntry({ key: 'old', sizeBytes: 200, cachedAt: '2024-01-01T00:00:00Z' }));
    await cache.put(makeEntry({ key: 'mid', sizeBytes: 200, cachedAt: '2024-06-01T00:00:00Z' }));
    await cache.put(makeEntry({ key: 'new', sizeBytes: 200, cachedAt: '2025-01-01T00:00:00Z' }));

    // Evict to fit in 400 bytes — should remove the oldest entry
    const evicted = await cache.evictUntilUnder(400);
    expect(evicted).toBeGreaterThanOrEqual(1);
    expect(await cache.has('new')).toBe(true);
  });

  it('evictUntilUnder is a no-op when under limit', async () => {
    await cache.put(makeEntry({ key: 'a', sizeBytes: 100 }));
    const evicted = await cache.evictUntilUnder(1000);
    expect(evicted).toBe(0);
    expect(await cache.has('a')).toBe(true);
  });

  // ---------- Meta store ------------------------------------------------------

  it('setMeta / getMeta round-trips values', async () => {
    await cache.setMeta('last-sync', '2025-01-15T12:00:00Z');
    expect(await cache.getMeta('last-sync')).toBe('2025-01-15T12:00:00Z');
  });

  it('getMeta returns null for missing key', async () => {
    expect(await cache.getMeta('nonexistent')).toBeNull();
  });

  it('setMeta overwrites existing value', async () => {
    await cache.setMeta('version', 1);
    await cache.setMeta('version', 2);
    expect(await cache.getMeta('version')).toBe(2);
  });

  // ---------- Constants -------------------------------------------------------

  it('MAX_CACHE_BYTES is 500 MB', () => {
    expect(MAX_CACHE_BYTES).toBe(500 * 1024 * 1024);
  });

  // ---------- Dispose ---------------------------------------------------------

  it('dispose is idempotent', () => {
    cache.dispose();
    cache.dispose(); // should not throw
  });
});
