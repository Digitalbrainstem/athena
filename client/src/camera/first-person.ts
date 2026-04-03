import type { GameAction, LookPayload, MovePayload } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const MOUSE_SENSITIVITY = 0.002;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

// Movement physics constants
const ACCELERATION = 18;
const FRICTION = 12;
const MAX_SPEED = 1;
const STOP_THRESHOLD = 0.01;

export class FirstPersonCamera implements Disposable {
  private yaw = 0;
  private pitch = 0;
  private pointerLocked = false;
  private disposed = false;
  private abort: AbortController | null = null;
  private pendingLookActions: GameAction[] = [];

  // Velocity-based movement
  private vx = 0;
  private vz = 0;
  private targetDx = 0;
  private targetDz = 0;
  private running = false;
  private pendingMoveActions: GameAction[] = [];

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

  /** Feed raw directional input (from keyboard). */
  setMoveInput(dx: number, dz: number, running: boolean): void {
    this.targetDx = dx;
    this.targetDz = dz;
    this.running = running;
  }

  /** Advance velocity physics by dt seconds. Call once per fixed step. */
  updateMovement(dt: number): void {
    if (this.targetDx !== 0 || this.targetDz !== 0) {
      // Accelerate toward target direction
      this.vx += (this.targetDx - this.vx) * ACCELERATION * dt;
      this.vz += (this.targetDz - this.vz) * ACCELERATION * dt;
    } else {
      // Friction when no input
      const decay = Math.max(0, 1 - FRICTION * dt);
      this.vx *= decay;
      this.vz *= decay;
    }

    // Stop completely when velocity is negligible
    if (Math.abs(this.vx) < STOP_THRESHOLD) this.vx = 0;
    if (Math.abs(this.vz) < STOP_THRESHOLD) this.vz = 0;

    // Clamp to max speed
    const len = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
    if (len > MAX_SPEED) {
      this.vx = (this.vx / len) * MAX_SPEED;
      this.vz = (this.vz / len) * MAX_SPEED;
    }

    // Emit smoothed move action
    if (this.vx !== 0 || this.vz !== 0) {
      const payload: MovePayload = {
        direction: { x: this.vx, z: this.vz },
        running: this.running,
      };
      this.pendingMoveActions.push({ type: 'move', source: 'keyboard', payload });
    }

    // Clear input target each frame (keyboard will re-set it if keys are held)
    this.targetDx = 0;
    this.targetDz = 0;
  }

  /** Flush smoothed move actions for this frame. */
  flushMoveActions(): GameAction[] {
    const actions = this.pendingMoveActions;
    this.pendingMoveActions = [];
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
    this.pendingMoveActions = [];
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
