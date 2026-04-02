import type { GameAction, MovePayload } from '@nexus-academy/core';
import type { InputProvider, ActionCallback } from '../types.js';

const DEAD_ZONE = 0.15;
const MAX_RADIUS = 60;
const SWIPE_THRESHOLD = 80;

export class TouchInput implements InputProvider {
  readonly name = 'touch' as const;
  private emit: ActionCallback | null = null;
  private abort: AbortController | null = null;
  private joystickActive = false;
  private joystickOrigin = { x: 0, y: 0 };
  private joystickTouchId: number | null = null;
  private moveInterval: ReturnType<typeof setInterval> | null = null;
  private currentDir = { x: 0, z: 0 };
  private rightTouchStart = new Map<number, number>();

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
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.currentDir = { x: 0, z: 0 };
    this.rightTouchStart.clear();
    this.emit = null;
  }

  dispose(): void { this.detach(); }

  private onTouchStart = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.clientX < window.innerWidth / 2 && !this.joystickActive) {
        this.joystickActive = true;
        this.joystickTouchId = t.identifier;
        this.joystickOrigin = { x: t.clientX, y: t.clientY };
        e.preventDefault();
      } else if (t.clientX >= window.innerWidth / 2) {
        this.rightTouchStart.set(t.identifier, t.clientX);
      }
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.joystickTouchId) {
        e.preventDefault();
        const dx = t.clientX - this.joystickOrigin.x;
        const dy = t.clientY - this.joystickOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_RADIUS * DEAD_ZONE) {
          this.currentDir = { x: 0, z: 0 };
        } else {
          const clamped = Math.min(dist, MAX_RADIUS);
          const scale = clamped / MAX_RADIUS;
          const angle = Math.atan2(dy, dx);
          this.currentDir = { x: Math.cos(angle) * scale, z: Math.sin(angle) * scale };
        }
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.joystickTouchId) {
        this.joystickActive = false;
        this.joystickTouchId = null;
        this.currentDir = { x: 0, z: 0 };
      } else {
        const startX = this.rightTouchStart.get(t.identifier);
        this.rightTouchStart.delete(t.identifier);
        if (startX !== undefined) {
          if (t.clientX - startX < -SWIPE_THRESHOLD) { this.fire({ type: 'back', source: 'touch' }); }
          else { this.fire({ type: 'interact', source: 'touch' }); }
        }
      }
    }
  };

  private onTouchCancel = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.joystickTouchId) {
        this.joystickActive = false;
        this.joystickTouchId = null;
        this.currentDir = { x: 0, z: 0 };
      }
      this.rightTouchStart.delete(t.identifier);
    }
  };

  private emitMovement = (): void => {
    if (this.currentDir.x === 0 && this.currentDir.z === 0) return;
    const payload: MovePayload = {
      direction: { ...this.currentDir },
      running: false,
    };
    this.fire({ type: 'move', source: 'touch', payload });
  };

  private fire(action: GameAction): void { this.emit?.(action); }
}
