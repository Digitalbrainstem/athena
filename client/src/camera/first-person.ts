import type { GameAction, LookPayload } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const MOUSE_SENSITIVITY = 0.002;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export class FirstPersonCamera implements Disposable {
  private yaw = 0;
  private pitch = 0;
  private pointerLocked = false;
  private disposed = false;
  private abort: AbortController | null = null;
  private pendingLookActions: GameAction[] = [];

  constructor() {
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    document.addEventListener('pointerlockchange', this.onPointerLockChange, opts);
    document.addEventListener('mousemove', this.onMouseMove, opts);
  }

  flushLookActions(): GameAction[] {
    const actions = this.pendingLookActions;
    this.pendingLookActions = [];
    return actions;
  }

  getPredictiveRotation(): { yaw: number; pitch: number } {
    return { yaw: this.yaw, pitch: this.pitch };
  }

  requestPointerLock(element: HTMLElement): void {
    if (this.disposed) return;
    try { element.requestPointerLock(); } catch { /* may be denied */ }
  }

  exitPointerLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  get isPointerLocked(): boolean { return this.pointerLocked; }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abort?.abort();
    this.abort = null;
    this.exitPointerLock();
    this.pendingLookActions = [];
  }

  private onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement !== null;
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.pointerLocked) return;
    const deltaX = -e.movementX * MOUSE_SENSITIVITY;
    const deltaY = -e.movementY * MOUSE_SENSITIVITY;
    this.yaw += deltaX;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch + deltaY));
    const payload: LookPayload = { deltaX, deltaY };
    this.pendingLookActions.push({ type: 'look', source: 'mouse', payload });
  };
}
