import type { InputProvider, ActionCallback, GameAction, MovePayload } from '../types.js';

interface KeyState { forward: boolean; backward: boolean; left: boolean; right: boolean; }
const INITIAL_KEY_STATE: KeyState = Object.freeze({ forward: false, backward: false, left: false, right: false });

export class KeyboardInput implements InputProvider {
  readonly name = 'keyboard' as const;
  private emit: ActionCallback | null = null;
  private keys: KeyState = { ...INITIAL_KEY_STATE };
  private moveInterval: ReturnType<typeof setInterval> | null = null;
  private abort: AbortController | null = null;

  attach(emit: ActionCallback): void {
    this.detach();
    this.emit = emit;
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    document.addEventListener('keydown', this.onKeyDown, opts);
    document.addEventListener('keyup', this.onKeyUp, opts);
    document.addEventListener('visibilitychange', this.onVisibilityChange, opts);
    window.addEventListener('blur', this.resetKeys, opts);
    this.moveInterval = setInterval(this.emitMovement, 16);
  }

  detach(): void {
    this.abort?.abort();
    this.abort = null;
    if (this.moveInterval !== null) { clearInterval(this.moveInterval); this.moveInterval = null; }
    this.emit = null;
    this.keys = { ...INITIAL_KEY_STATE };
  }

  dispose(): void { this.detach(); }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    const action = this.mapKey(e.code, true);
    if (action) { e.preventDefault(); this.emit?.(action); }
  };

  private onKeyUp = (e: KeyboardEvent): void => { this.mapKey(e.code, false); };
  private onVisibilityChange = (): void => { if (document.hidden) this.resetKeys(); };
  private resetKeys = (): void => { this.keys = { ...INITIAL_KEY_STATE }; };

  private emitMovement = (): void => {
    const { forward, backward, left, right } = this.keys;
    if (!forward && !backward && !left && !right) return;
    const payload: MovePayload = {
      x: (left ? -1 : 0) + (right ? 1 : 0),
      z: (forward ? -1 : 0) + (backward ? 1 : 0),
    };
    this.emit?.({ type: 'move', source: 'keyboard', payload });
  };

  private mapKey(code: string, down: boolean): GameAction | null {
    switch (code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = down; return null;
      case 'KeyS': case 'ArrowDown': this.keys.backward = down; return null;
      case 'KeyA': case 'ArrowLeft': this.keys.left = down; return null;
      case 'KeyD': case 'ArrowRight': this.keys.right = down; return null;
      case 'KeyE': return down ? { type: 'interact', source: 'keyboard' } : null;
      case 'KeyI': return down ? { type: 'inventory', source: 'keyboard' } : null;
      case 'KeyM': return down ? { type: 'map', source: 'keyboard' } : null;
      case 'Escape': return down ? { type: 'pause', source: 'keyboard' } : null;
      case 'Backspace': return down ? { type: 'back', source: 'keyboard' } : null;
      default: return null;
    }
  }
}
