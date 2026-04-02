import * as THREE from 'three';
import type { MovePayload, Disposable, WorldObject } from '../types.js';

const EYE_HEIGHT = 1.6;
const MOVE_SPEED = 5;
const ACCELERATION = 30;
const DECELERATION = 20;
const MOUSE_SENSITIVITY = 0.002;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const PLAYER_HALF_W = 0.3;
const PLAYER_HALF_H = EYE_HEIGHT / 2;
const PLAYER_HALF_D = 0.3;

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _diff = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _halfExt = new THREE.Vector3(PLAYER_HALF_W, PLAYER_HALF_H, PLAYER_HALF_D);
const _bMin = new THREE.Vector3();
const _bMax = new THREE.Vector3();

export class FirstPersonCamera implements Disposable {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0;
  private pitch = 0;
  private readonly velocity = new THREE.Vector3();
  private pointerLocked = false;
  private disposed = false;
  private abort: AbortController | null = null;
  private colliders: ReadonlyArray<WorldObject> = [];

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 500);
    this.camera.position.set(0, EYE_HEIGHT, 4);
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    document.addEventListener('pointerlockchange', this.onPointerLockChange, opts);
    document.addEventListener('mousemove', this.onMouseMove, opts);
  }

  setColliders(objects: ReadonlyArray<WorldObject>): void { this.colliders = objects; }

  applyMovement(move: MovePayload | null, dt: number): void {
    if (this.disposed) return;

    if (move && (move.x !== 0 || move.z !== 0)) {
      _forward.set(0, 0, -1).applyAxisAngle(_up, this.yaw);
      _right.crossVectors(_forward, _up).normalize();
      _desired.set(0, 0, 0);
      _desired.addScaledVector(_forward, -move.z * MOVE_SPEED);
      _desired.addScaledVector(_right, move.x * MOVE_SPEED);
    } else {
      _desired.set(0, 0, 0);
    }

    _diff.set(_desired.x - this.velocity.x, 0, _desired.z - this.velocity.z);
    const diffLen = _diff.length();
    if (diffLen > 0.001) {
      const rate = _desired.lengthSq() > this.velocity.lengthSq() ? ACCELERATION : DECELERATION;
      const maxStep = rate * dt;
      if (diffLen <= maxStep) {
        this.velocity.x = _desired.x;
        this.velocity.z = _desired.z;
      } else {
        _diff.multiplyScalar(maxStep / diffLen);
        this.velocity.x += _diff.x;
        this.velocity.z += _diff.z;
      }
    } else {
      this.velocity.x = _desired.x;
      this.velocity.z = _desired.z;
    }

    this.camera.position.x += this.velocity.x * dt;
    this.camera.position.z += this.velocity.z * dt;
    this.resolveCollisions();
    if (this.camera.position.y < EYE_HEIGHT) this.camera.position.y = EYE_HEIGHT;
    this.updateRotation();
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
  }

  private updateRotation(): void {
    _euler.set(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(_euler);
  }

  private resolveCollisions(): void {
    const pos = this.camera.position;
    _bMin.copy(pos).sub(_halfExt);
    _bMax.copy(pos).add(_halfExt);
    for (const obj of this.colliders) {
      if (!obj.aabb) continue;
      const a = obj.aabb;
      if (!(_bMin.x < a.max.x && _bMax.x > a.min.x &&
            _bMin.y < a.max.y && _bMax.y > a.min.y &&
            _bMin.z < a.max.z && _bMax.z > a.min.z)) continue;
      const ox = Math.min(_bMax.x - a.min.x, a.max.x - _bMin.x);
      const oy = Math.min(_bMax.y - a.min.y, a.max.y - _bMin.y);
      const oz = Math.min(_bMax.z - a.min.z, a.max.z - _bMin.z);
      if (ox <= oy && ox <= oz) { pos.x += (pos.x < obj.position.x ? -ox : ox); this.velocity.x = 0; }
      else if (oz <= ox && oz <= oy) { pos.z += (pos.z < obj.position.z ? -oz : oz); this.velocity.z = 0; }
      else { pos.y += (pos.y < obj.position.y ? -oy : oy); this.velocity.y = 0; }
      _bMin.copy(pos).sub(_halfExt);
      _bMax.copy(pos).add(_halfExt);
    }
  }

  private onPointerLockChange = (): void => { this.pointerLocked = document.pointerLockElement !== null; };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.pointerLocked) return;
    this.yaw -= e.movementX * MOUSE_SENSITIVITY;
    this.pitch -= e.movementY * MOUSE_SENSITIVITY;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
  };
}
