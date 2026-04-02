import { describe, it, expect, vi, afterEach } from 'vitest';
import { registerServiceWorker, requestCacheUrls } from '../../src/net/sw-register.js';

describe('registerServiceWorker', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns failure when serviceWorker is not in navigator', async () => {
    const origSW = (navigator as unknown as Record<string, unknown>).serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });

    const result = await registerServiceWorker();
    expect(result.success).toBe(false);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', { value: origSW, configurable: true });
  });

  it('returns success when registration succeeds', async () => {
    const fakeReg = {
      installing: null,
      addEventListener: vi.fn(),
    };
    const fakeSW = {
      register: vi.fn().mockResolvedValue(fakeReg),
    };
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeSW, configurable: true });

    const result = await registerServiceWorker();
    expect(result.success).toBe(true);
    expect(result.registration).toBe(fakeReg);
    expect(fakeSW.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });

    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
  });

  it('returns failure when registration throws', async () => {
    const fakeSW = {
      register: vi.fn().mockRejectedValue(new Error('denied')),
    };
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeSW, configurable: true });

    const result = await registerServiceWorker();
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);

    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
  });
});

describe('requestCacheUrls', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends CACHE_URLS message to controller', () => {
    const postMessage = vi.fn();
    const fakeSW = { controller: { postMessage } };
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeSW, configurable: true });

    requestCacheUrls(['/a.js', '/b.css']);
    expect(postMessage).toHaveBeenCalledWith({
      type: 'CACHE_URLS',
      urls: ['/a.js', '/b.css'],
    });

    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
  });

  it('does nothing when there is no controller', () => {
    const fakeSW = { controller: null };
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeSW, configurable: true });

    // Should not throw
    requestCacheUrls(['/a.js']);

    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
  });
});
