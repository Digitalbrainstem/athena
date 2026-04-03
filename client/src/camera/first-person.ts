import type { GameAction, LookPayload, MovePayload, SceneObject } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const MOUSE_SENSITIVITY = 0.002;
const PITCH_LIMIT = (85 * Math.PI) / 180; // ±85 degrees

// Movement physics constants
const MAX_WALK_SPEED = 4;
const MAX_RUN_SPEED = 8;
const ACCEL_TIME = 0.3; // seconds to reach max speed
const DECEL_TIME = 0.3; // seconds to stop
const STOP_THRESHOLD = 0.05;
const EYE_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.3;

export class FirstPersonCamera implements Disposable {
  private yaw = 0;
  private pitch = 0;
  private pointerLocked = false;
  private disposed = false;
  private abort: AbortController | null = null;
  private pendingLookActions: GameAction[] = [];

  // World-space position (client is the authority)
  posX = 0;
  posZ = 0;

  // Velocity-based movement
  private vx = 0;
  private vz = 0;
  private targetDx = 0;
  private targetDz = 0;
  private running = false;
  private pendingMoveActions: GameAction[] = [];

  // Collision objects (updated each frame from scene graph)
  private collisionBoxes: { cx: number; cz: number; hx: number; hz: number }[] = [];

  constructor() {
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    document.addEventListener('pointerlockchange', this.onPointerLockChange, opts);
    document.addEventListener('mousemove', this.onMouseMove, opts);
  }

  /** Seed the camera position from the ECS (called once at startup). */
  seedPosition(x: number, z: number): void {
    this.posX = x;
    this.posZ = z;
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

  /** Update collision boxes from the scene graph objects. */
  updateCollisionBoxes(objects: SceneObject[]): void {
    this.collisionBoxes = [];
    for (const obj of objects) {
      if (!obj.renderable || !obj.renderable.visible) continue;
      const s = obj.renderable.scale;
      const p = obj.position;
      this.collisionBoxes.push({
        cx: p.x,
        cz: p.z,
        hx: Math.max(s.x, 0.3) * 0.5,
        hz: Math.max(s.z, 0.3) * 0.5,
      });
    }
  }

  /** Advance velocity physics by dt seconds. Call once per fixed step. */
  updateMovement(dt: number): void {
    const maxSpeed = this.running ? MAX_RUN_SPEED : MAX_WALK_SPEED;
    const accel = maxSpeed / ACCEL_TIME;
    const friction = maxSpeed / DECEL_TIME;

    // Rotate input direction by yaw so movement is camera-relative
    let worldDx = 0;
    let worldDz = 0;
    if (this.targetDx !== 0 || this.targetDz !== 0) {
      const len = Math.sqrt(this.targetDx * this.targetDx + this.targetDz * this.targetDz);
      const nx = this.targetDx / len;
      const nz = this.targetDz / len;
      const sinY = Math.sin(this.yaw);
      const cosY = Math.cos(this.yaw);
      worldDx = nx * cosY - nz * sinY;
      worldDz = nx * sinY + nz * cosY;
    }

    if (worldDx !== 0 || worldDz !== 0) {
      // Accelerate toward desired direction
      this.vx += (worldDx * maxSpeed - this.vx) * Math.min(1, accel * dt / maxSpeed);
      this.vz += (worldDz * maxSpeed - this.vz) * Math.min(1, accel * dt / maxSpeed);
    } else {
      // Apply friction when no input
      const speed = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
      if (speed > STOP_THRESHOLD) {
        const drop = friction * dt;
        const factor = Math.max(0, (speed - drop) / speed);
        this.vx *= factor;
        this.vz *= factor;
      } else {
        this.vx = 0;
        this.vz = 0;
      }
    }

    // Clamp to max speed
    const len = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
    if (len > maxSpeed) {
      this.vx = (this.vx / len) * maxSpeed;
      this.vz = (this.vz / len) * maxSpeed;
    }

    // Stop completely when velocity is negligible
    if (Math.abs(this.vx) < STOP_THRESHOLD && Math.abs(this.vz) < STOP_THRESHOLD) {
      this.vx = 0;
      this.vz = 0;
    }

    // Apply velocity to position
    if (this.vx !== 0 || this.vz !== 0) {
      let newX = this.posX + this.vx * dt;
      let newZ = this.posZ + this.vz * dt;

      // AABB collision — slide along surfaces
      for (const box of this.collisionBoxes) {
        const overlapX = (PLAYER_RADIUS + box.hx) - Math.abs(newX - box.cx);
        const overlapZ = (PLAYER_RADIUS + box.hz) - Math.abs(newZ - box.cz);
        if (overlapX > 0 && overlapZ > 0) {
          // Push out on the axis with smallest overlap (slide)
          if (overlapX < overlapZ) {
            newX += newX < box.cx ? -overlapX : overlapX;
            this.vx = 0;
          } else {
            newZ += newZ < box.cz ? -overlapZ : overlapZ;
            this.vz = 0;
          }
        }
      }

      this.posX = newX;
      this.posZ = newZ;

      // Emit smoothed move action (for ECS / sound effects)
      const payload: MovePayload = {
        direction: { x: this.vx, z: this.vz },
        running: this.running,
      };
      this.pendingMoveActions.push({ type: 'move', source: 'keyboard', payload });
    }

    // Clear input target each frame (keyboard will re-set if keys held)
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

  /** Get the camera position at eye height. */
  getEyePosition(): { x: number; y: number; z: number } {
    return { x: this.posX, y: EYE_HEIGHT, z: this.posZ };
  }

  requestPointerLock(element: HTMLElement): void {
    if (this.disposed) return;
    try { element.requestPointerLock(); } catch { /* may be denied */ }
  }

  exitPointerLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  /** Apply external look input (touch or gamepad). Updates yaw/pitch directly. */
  applyLook(deltaX: number, deltaY: number): void {
    this.yaw += deltaX;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch + deltaY));
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
