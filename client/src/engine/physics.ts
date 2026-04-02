import * as THREE from 'three';
import type { WorldObject, Disposable } from '../types.js';

const GRAVITY = -9.81;
const GROUND_Y = 0;

export interface PhysicsBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  grounded: boolean;
  halfExtents: THREE.Vector3;
}

export class Physics implements Disposable {
  private readonly bodies: PhysicsBody[] = [];
  private colliders: ReadonlyArray<WorldObject> = [];

  addBody(body: PhysicsBody): void {
    if (!this.bodies.includes(body)) this.bodies.push(body);
  }

  removeBody(body: PhysicsBody): void {
    const idx = this.bodies.indexOf(body);
    if (idx !== -1) this.bodies.splice(idx, 1);
  }

  setColliders(objects: ReadonlyArray<WorldObject>): void {
    this.colliders = objects;
  }

  update(dt: number): number {
    for (const body of this.bodies) {
      this.integrate(body, dt);
      this.resolveWorldCollisions(body);
      this.clampToGround(body);
    }
    return this.bodies.length;
  }

  getBodies(): ReadonlyArray<PhysicsBody> {
    return this.bodies;
  }

  dispose(): void {
    this.bodies.length = 0;
    this.colliders = [];
  }

  private integrate(body: PhysicsBody, dt: number): void {
    if (!body.grounded) body.velocity.y += GRAVITY * dt;
    body.position.addScaledVector(body.velocity, dt);
  }

  private clampToGround(body: PhysicsBody): void {
    const feetY = body.position.y - body.halfExtents.y;
    if (feetY <= GROUND_Y) {
      body.position.y = GROUND_Y + body.halfExtents.y;
      body.velocity.y = 0;
      body.grounded = true;
    } else {
      body.grounded = false;
    }
  }

  private resolveWorldCollisions(body: PhysicsBody): void {
    const bMin = _v1.copy(body.position).sub(body.halfExtents);
    const bMax = _v2.copy(body.position).add(body.halfExtents);

    for (const obj of this.colliders) {
      if (!obj.aabb) continue;
      if (!(bMin.x < obj.aabb.max.x && bMax.x > obj.aabb.min.x &&
            bMin.y < obj.aabb.max.y && bMax.y > obj.aabb.min.y &&
            bMin.z < obj.aabb.max.z && bMax.z > obj.aabb.min.z)) continue;

      const ox = Math.min(bMax.x - obj.aabb.min.x, obj.aabb.max.x - bMin.x);
      const oy = Math.min(bMax.y - obj.aabb.min.y, obj.aabb.max.y - bMin.y);
      const oz = Math.min(bMax.z - obj.aabb.min.z, obj.aabb.max.z - bMin.z);

      if (ox <= oy && ox <= oz) {
        body.position.x += (body.position.x < obj.position.x ? -ox : ox);
        body.velocity.x = 0;
      } else if (oz <= ox && oz <= oy) {
        body.position.z += (body.position.z < obj.position.z ? -oz : oz);
        body.velocity.z = 0;
      } else {
        body.position.y += (body.position.y < obj.position.y ? -oy : oy);
        body.velocity.y = 0;
      }

      bMin.copy(body.position).sub(body.halfExtents);
      bMax.copy(body.position).add(body.halfExtents);
    }
  }
}

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
