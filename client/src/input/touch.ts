import type { GameAction, MovePayload } from '@nexus-academy/core';
import type { InputProvider, ActionCallback } from '../types.js';
import { TouchCameraController } from './touch-camera.js';
import { VirtualJoystick } from './virtual-joystick.js';

const SWIPE_THRESHOLD = 80;
const TAP_MAX_DURATION = 300; // ms — longer than this is a drag, not a tap
const TAP_MAX_DISTANCE = 15; // px — more movement than this is a drag

interface RightTouchRecord { x: number; y: number; time: number }

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'label',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
}

export class TouchInput implements InputProvider {
  readonly name = 'touch' as const;
  private emit: ActionCallback | null = null;
  private abort: AbortController | null = null;
  private moveInterval: ReturnType<typeof setInterval> | null = null;
  private readonly camera: TouchCameraController;
  private readonly joystick: VirtualJoystick;
  private readonly rightTouchStarts = new Map<number, RightTouchRecord>();
  private readonly mobile: boolean;

  constructor(mobile = false) {
    this.mobile = mobile;
    this.camera = new TouchCameraController();
    this.joystick = new VirtualJoystick();
    if (mobile) {
      this.joystick.mount();
      this.joystick.show();
    }
  }

  attach(emit: ActionCallback): void {
    this.detach();
    this.emit = emit;
    this.abort = new AbortController();
    const sig = this.abort.signal;
    document.addEventListener('touchstart', this.onTouchStart, { passive: false, signal: sig });
    document.addEventListener('touchmove', this.onTouchMove, { passive: false, signal: sig });
    document.addEventListener('touchend', this.onTouchEnd, { passive: true, signal: sig });
    document.addEventListener('touchcancel', this.onTouchCancel, { passive: true, signal: sig });
    this.moveInterval = setInterval(this.emitMovement, 16);
  }

  detach(): void {
    this.abort?.abort();
    this.abort = null;
    if (this.moveInterval !== null) { clearInterval(this.moveInterval); this.moveInterval = null; }
    this.rightTouchStarts.clear();
    this.emit = null;
  }

  dispose(): void {
    this.detach();
    this.joystick.dispose();
  }

  // -- Touch handlers -------------------------------------------------------

  private onTouchStart = (e: TouchEvent): void => {
    if (isInteractiveTarget(e.target)) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];

      // Left half → virtual joystick (movement)
      if (this.joystick.claimTouch(t)) {
        e.preventDefault();
        this.emitMovement();
        continue;
      }

      // Right half
      if (t.clientX >= window.innerWidth / 2) {
        if (this.mobile) this.camera.claimTouch(t);
        this.rightTouchStarts.set(t.identifier, {
          x: t.clientX, y: t.clientY, time: performance.now(),
        });
        e.preventDefault();
      }
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];

      if (this.joystick.handleMove(t)) {
        e.preventDefault();
        this.emitMovement();
        continue;
      }

      if (this.mobile) {
        const look = this.camera.handleMove(t);
        if (look) {
          this.fire({ type: 'look', source: 'touch', payload: look });
          e.preventDefault();
        }
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];

      if (this.joystick.releaseTouch(t.identifier)) continue;
      if (this.mobile) this.camera.releaseTouch(t.identifier);

      const start = this.rightTouchStarts.get(t.identifier);
      this.rightTouchStarts.delete(t.identifier);
      if (!start) continue;

      const elapsed = performance.now() - start.time;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Swipe left → back (both modes)
      if (dx < -SWIPE_THRESHOLD) {
        this.fire({ type: 'back', source: 'touch' });
      } else if (this.mobile) {
        // Mobile: only short taps fire interact (long drags are camera look)
        if (elapsed < TAP_MAX_DURATION && dist < TAP_MAX_DISTANCE) {
          this.fire({ type: 'interact', source: 'touch' });
        }
      } else {
        // Non-mobile: any right-side touch end is interact (old behavior)
        this.fire({ type: 'interact', source: 'touch' });
      }
    }
  };

  private onTouchCancel = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      this.joystick.releaseTouch(t.identifier);
      this.camera.releaseTouch(t.identifier);
      this.rightTouchStarts.delete(t.identifier);
    }
  };

  // -- Movement emission (16ms interval) ------------------------------------

  private emitMovement = (): void => {
    const { x, z, magnitude } = this.joystick.getInput();
    if (x === 0 && z === 0) return;
    const payload: MovePayload = {
      direction: { x, z },
      running: magnitude > 0.75,
    };
    this.fire({ type: 'move', source: 'touch', payload });
  };

  private fire(action: GameAction): void { this.emit?.(action); }
}
