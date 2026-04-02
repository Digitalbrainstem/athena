/**
 * Service Worker registration and update handling for the main thread.
 */

/** Result of attempting SW registration. */
export interface SWRegistrationResult {
  success: boolean;
  registration?: ServiceWorkerRegistration;
  error?: unknown;
}

/**
 * Register the service worker and wire up update detection.
 * Safe to call in environments where service workers are unsupported — returns
 * a failed result without throwing.
 */
export async function registerServiceWorker(): Promise<SWRegistrationResult> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { success: false, error: 'Service workers not supported' };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    // When a new SW is found, tell it to activate immediately
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          // New version active — the service worker will claim clients
        }
      });
    });

    return { success: true, registration };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Ask the active service worker to precache a list of URLs.
 * Useful for caching game assets discovered at runtime (3D models, textures, etc.).
 */
export function requestCacheUrls(urls: string[]): void {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: 'CACHE_URLS', urls });
}
