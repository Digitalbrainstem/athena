import type {
  Profile, CreateProfileRequest, LearningEvent, MasteryRecord, Quest,
  APIConfig, QueuedRequest, Disposable,
} from '../types.js';
import { APIError } from '../types.js';

const DEFAULT_CONFIG: APIConfig = {
  baseUrl: 'http://localhost:5200',
  timeoutMs: 10_000,
  maxRetries: 3,
  retryBaseMs: 500,
};

export class NexusAPI implements Disposable {
  private readonly config: APIConfig;
  private readonly offlineQueue: QueuedRequest[] = [];
  private flushing = false;
  private disposed = false;
  private onlineHandler: (() => void) | null = null;

  constructor(config?: Partial<APIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.baseUrl = this.config.baseUrl.replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      this.onlineHandler = () => { void this.flushQueue(); };
      window.addEventListener('online', this.onlineHandler);
    }
  }

  async getProfiles(signal?: AbortSignal): Promise<Profile[]> {
    return this.get<Profile[]>('/api/profiles', signal);
  }

  async getProfile(id: string, signal?: AbortSignal): Promise<Profile> {
    return this.get<Profile>(`/api/profiles/${encodeURIComponent(id)}`, signal);
  }

  async createProfile(data: CreateProfileRequest, signal?: AbortSignal): Promise<Profile> {
    return this.post<Profile>('/api/profiles', data, signal);
  }

  async reportEvent(event: LearningEvent, signal?: AbortSignal): Promise<void> {
    const body = JSON.stringify({ ...event, timestamp: event.timestamp ?? new Date().toISOString() });
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.offlineQueue.push({ path: '/api/events', method: 'POST', body, createdAt: Date.now() });
      return;
    }
    await this.post<void>('/api/events', JSON.parse(body) as LearningEvent, signal);
  }

  async getMastery(profileId: string, signal?: AbortSignal): Promise<MasteryRecord[]> {
    return this.get<MasteryRecord[]>(`/api/profiles/${encodeURIComponent(profileId)}/mastery`, signal);
  }

  async getNextQuests(profileId: string, signal?: AbortSignal): Promise<Quest[]> {
    return this.get<Quest[]>(`/api/profiles/${encodeURIComponent(profileId)}/quests`, signal);
  }

  async completeQuest(questId: string, profileId: string, signal?: AbortSignal): Promise<void> {
    await this.post<void>(
      `/api/profiles/${encodeURIComponent(profileId)}/quests/${encodeURIComponent(questId)}/complete`,
      {}, signal,
    );
  }

  get queueLength(): number { return this.offlineQueue.length; }

  async flushQueue(): Promise<void> {
    if (this.flushing || this.offlineQueue.length === 0) return;
    this.flushing = true;
    try {
      while (this.offlineQueue.length > 0) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) break;
        const req = this.offlineQueue[0];
        try {
          await this.fetchWithRetry(req.path, {
            method: req.method, headers: { 'Content-Type': 'application/json' }, body: req.body,
          });
          this.offlineQueue.shift();
        } catch { break; }
      }
    } finally { this.flushing = false; }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.onlineHandler) { window.removeEventListener('online', this.onlineHandler); this.onlineHandler = null; }
  }

  private async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await this.fetchWithRetry(path, { method: 'GET' }, signal);
    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const res = await this.fetchWithRetry(path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, signal);
    if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
    return res.json() as Promise<T>;
  }

  private async fetchWithRetry(path: string, init: RequestInit, externalSignal?: AbortSignal): Promise<Response> {
    const { timeoutMs, maxRetries, retryBaseMs } = this.config;
    const url = `${this.config.baseUrl}${path}`;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const onExternalAbort = (): void => controller.abort();
      externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

      try {
        const res = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener('abort', onExternalAbort);
        if (res.ok) return res;
        const err = new APIError(init.method ?? 'GET', path, res.status, res.statusText);
        if (!err.retryable || attempt === maxRetries) throw err;
        lastError = err;
      } catch (err) {
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener('abort', onExternalAbort);
        if (externalSignal?.aborted) throw err;
        if (attempt === maxRetries) throw lastError ?? err;
        lastError = err;
      }

      const delay = retryBaseMs * Math.pow(2, attempt) + Math.random() * retryBaseMs;
      await new Promise<void>((r) => setTimeout(r, delay));
    }

    throw lastError;
  }
}
