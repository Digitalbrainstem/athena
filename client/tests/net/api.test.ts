import { describe, it, expect, vi, afterEach } from 'vitest';
import { NexusAPI } from '../../src/net/api.js';
import { APIError } from '../../src/types.js';

function mockFetch(status: number, body: unknown = null): ReturnType<typeof vi.fn> {
  const headers = new Map<string, string>();
  if (body === null) headers.set('content-length', '0');
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300, status, statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    headers: { get: (k: string) => headers.get(k) ?? null },
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

function apiNoRetry(): NexusAPI {
  return new NexusAPI({ baseUrl: 'http://test:5200', maxRetries: 0, timeoutMs: 5000, retryBaseMs: 10 });
}

describe('NexusAPI', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('getProfiles calls GET /api/profiles', async () => {
    const data = [{ id: '1', name: 'Ada', ageTier: 'foundation', createdAt: '' }];
    const f = mockFetch(200, data);
    const api = apiNoRetry();
    const r = await api.getProfiles();
    expect(f).toHaveBeenCalledWith('http://test:5200/api/profiles', expect.objectContaining({ method: 'GET' }));
    expect(r).toEqual(data);
    api.dispose();
  });

  it('getProfile calls GET /api/profiles/:id', async () => {
    const data = { id: '42', name: 'Kai', ageTier: 'explorer', createdAt: '' };
    mockFetch(200, data);
    const api = apiNoRetry();
    expect(await api.getProfile('42')).toEqual(data);
    api.dispose();
  });

  it('createProfile calls POST /api/profiles', async () => {
    const data = { id: '99', name: 'Zara', ageTier: 'foundation', createdAt: '' };
    const f = mockFetch(201, data);
    const api = apiNoRetry();
    const r = await api.createProfile({ name: 'Zara', birthDate: '2022-01-01' });
    expect(f).toHaveBeenCalledWith('http://test:5200/api/profiles', expect.objectContaining({ method: 'POST' }));
    expect(r).toEqual(data);
    api.dispose();
  });

  it('reportEvent calls POST /api/events', async () => {
    const f = mockFetch(204);
    const api = apiNoRetry();
    await api.reportEvent({ profileId: '1', subject: 'math', action: 'solve', result: 'success' });
    expect(f).toHaveBeenCalledWith('http://test:5200/api/events', expect.objectContaining({ method: 'POST' }));
    api.dispose();
  });

  it('getMastery calls GET /api/profiles/:id/mastery', async () => {
    const data = [{ subject: 'geometry', level: 3, lastPracticed: '' }];
    mockFetch(200, data);
    const api = apiNoRetry();
    expect(await api.getMastery('1')).toEqual(data);
    api.dispose();
  });

  it('getNextQuests calls GET', async () => {
    const data = [{ id: 'q1', title: 'Build', description: '', subject: 'geometry', difficulty: 1 }];
    mockFetch(200, data);
    const api = apiNoRetry();
    expect(await api.getNextQuests('1')).toEqual(data);
    api.dispose();
  });

  it('completeQuest calls POST', async () => {
    const f = mockFetch(204);
    const api = apiNoRetry();
    await api.completeQuest('q1', 'p1');
    expect(f).toHaveBeenCalledWith('http://test:5200/api/profiles/p1/quests/q1/complete', expect.objectContaining({ method: 'POST' }));
    api.dispose();
  });

  it('throws APIError on 404', async () => {
    mockFetch(404);
    const api = apiNoRetry();
    await expect(api.getProfile('missing')).rejects.toThrow(APIError);
    api.dispose();
  });

  it('throws APIError on 500', async () => {
    mockFetch(500);
    const api = apiNoRetry();
    await expect(api.createProfile({ name: 'X', birthDate: '2020-01-01' })).rejects.toThrow(APIError);
    api.dispose();
  });

  it('APIError.retryable is true for 5xx and 429', () => {
    expect(new APIError('GET', '/', 500, 'ISE').retryable).toBe(true);
    expect(new APIError('GET', '/', 429, 'Too Many').retryable).toBe(true);
    expect(new APIError('GET', '/', 404, 'Not Found').retryable).toBe(false);
  });

  it('retries on 500 up to maxRetries then throws', async () => {
    const f = mockFetch(500);
    const api = new NexusAPI({ baseUrl: 'http://test:5200', maxRetries: 2, timeoutMs: 5000, retryBaseMs: 1 });
    await expect(api.getProfiles()).rejects.toThrow(APIError);
    expect(f).toHaveBeenCalledTimes(3);
    api.dispose();
  });

  it('queues events when navigator is offline', async () => {
    mockFetch(204);
    vi.stubGlobal('navigator', { onLine: false });
    const api = new NexusAPI({ baseUrl: 'http://test:5200', maxRetries: 0, timeoutMs: 5000, retryBaseMs: 10 });
    await api.reportEvent({ profileId: '1', subject: 'math', action: 'solve', result: 'success' });
    expect(api.queueLength).toBe(1);
    api.dispose();
  });

  it('uses default config when none provided', () => {
    mockFetch(200, []);
    const api = new NexusAPI();
    expect(api).toBeInstanceOf(NexusAPI);
    api.dispose();
  });
});
