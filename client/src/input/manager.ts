import type { GameAction, ActionCallback, InputProvider, InputMethod, Disposable } from '../types.js';

export class InputManager implements Disposable {
  private readonly listeners: ActionCallback[] = [];
  private readonly providers = new Map<InputMethod, InputProvider>();
  private disposed = false;

  onAction(callback: ActionCallback): () => void {
    if (this.disposed) throw new Error('InputManager has been disposed');
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  register(provider: InputProvider): void {
    if (this.disposed) throw new Error('InputManager has been disposed');
    const existing = this.providers.get(provider.name);
    if (existing) existing.detach();
    this.providers.set(provider.name, provider);
    provider.attach(this.emit);
  }

  unregister(name: InputMethod): void {
    const p = this.providers.get(name);
    if (p) { p.detach(); this.providers.delete(name); }
  }

  hasProvider(name: InputMethod): boolean {
    return this.providers.has(name);
  }

  emit = (action: GameAction): void => {
    const snapshot = this.listeners.slice();
    for (const cb of snapshot) {
      try { cb(action); } catch (err) { console.error('[InputManager] Listener threw:', err); }
    }
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const p of this.providers.values()) { try { p.detach(); } catch { /* best-effort */ } }
    this.providers.clear();
    this.listeners.length = 0;
  }
}
