/**
 * Rapier3D physics integration for Nexus Academy.
 *
 * Phase 1: World raycasting + optional wall/object colliders.
 * Player movement stays with FirstPersonCamera (heightmap-based).
 * Rapier provides accurate raycasting for click interaction and
 * wall collision for the companion.
 */
import type RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

let rapier: typeof RAPIER | null = null;
let world: RAPIER.World | null = null;
let eventQueue: RAPIER.EventQueue | null = null;

// Maps Three.js mesh uuid → Rapier collider handle for lookup
const meshToCollider = new Map<string, RAPIER.Collider>();
const colliderToMesh = new Map<number, string>();

// Track rigid bodies for cleanup
const bodies: RAPIER.RigidBody[] = [];

export interface RaycastHit {
  point: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  distance: number;
  meshId: string | null;
}

export async function initPhysics(): Promise<boolean> {
  try {
    const RAPIER_MODULE = await import('@dimforge/rapier3d-compat');
    await RAPIER_MODULE.init();
    rapier = RAPIER_MODULE;
    const gravity = new rapier.Vector3(0.0, -9.81, 0.0);
    world = new rapier.World(gravity);
    eventQueue = new rapier.EventQueue(true);
    return true;
  } catch (e) {
    console.warn('[Physics] Rapier init failed, running without physics:', e);
    return false;
  }
}

export function isReady(): boolean {
  return rapier !== null && world !== null;
}

export function stepPhysics(dt: number): void {
  if (!world || !eventQueue) return;
  world.timestep = dt;
  world.step(eventQueue);
}

/**
 * Add a static collider from a Three.js Box3 (for walls, floors, objects).
 * Much cheaper than trimesh — use for axis-aligned obstacles.
 */
export function addBoxCollider(
  meshId: string,
  center: { x: number; y: number; z: number },
  halfExtents: { x: number; y: number; z: number },
): void {
  if (!rapier || !world) return;

  const bodyDesc = rapier.RigidBodyDesc.fixed()
    .setTranslation(center.x, center.y, center.z);
  const body = world.createRigidBody(bodyDesc);
  bodies.push(body);

  const colliderDesc = rapier.ColliderDesc.cuboid(
    halfExtents.x, halfExtents.y, halfExtents.z,
  );
  const collider = world.createCollider(colliderDesc, body);

  meshToCollider.set(meshId, collider);
  colliderToMesh.set(collider.handle, meshId);
}

/**
 * Add a static ground plane at y=0.
 */
export function addGroundPlane(size = 500): void {
  addBoxCollider('__ground__', { x: 0, y: -0.5, z: 0 }, { x: size, y: 0.5, z: size });
}

/**
 * Add static colliders for an array of Three.js meshes (using bounding boxes).
 */
export function addMeshColliders(meshes: THREE.Object3D[]): void {
  if (!rapier || !world) return;

  for (const obj of meshes) {
    const mesh = obj as THREE.Mesh;
    if (!mesh.geometry) continue;

    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    if (!bb) continue;

    // Transform to world space
    mesh.updateMatrixWorld(true);
    const min = bb.min.clone().applyMatrix4(mesh.matrixWorld);
    const max = bb.max.clone().applyMatrix4(mesh.matrixWorld);

    const center = {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    };
    const halfExtents = {
      x: Math.abs(max.x - min.x) / 2,
      y: Math.abs(max.y - min.y) / 2,
      z: Math.abs(max.z - min.z) / 2,
    };

    // Skip tiny objects
    if (halfExtents.x < 0.01 && halfExtents.z < 0.01) continue;

    addBoxCollider(mesh.uuid, center, halfExtents);
  }
}

/**
 * Raycast from origin in direction. Returns closest hit or null.
 */
export function raycast(
  origin: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number },
  maxDistance: number,
): RaycastHit | null {
  if (!rapier || !world) return null;

  const ray = new rapier.Ray(
    new rapier.Vector3(origin.x, origin.y, origin.z),
    new rapier.Vector3(direction.x, direction.y, direction.z),
  );

  const hit = world.castRay(ray, maxDistance, true);
  if (!hit) return null;

  const hitPoint = ray.pointAt(hit.timeOfImpact);
  const normal = hit.collider.castRayAndGetNormal(ray, maxDistance, true);
  const meshId = colliderToMesh.get(hit.collider.handle) ?? null;

  const n = normal ? { x: normal.normal.x, y: normal.normal.y, z: normal.normal.z }
                   : { x: 0, y: 1, z: 0 };

  return {
    point: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
    normal: n,
    distance: hit.timeOfImpact,
    meshId,
  };
}

/**
 * Raycast from screen coordinates through camera.
 * Returns the hit or null.
 */
export function screenRaycast(
  camera: THREE.PerspectiveCamera,
  screenX: number,
  screenY: number,
  maxDistance = 50,
): RaycastHit | null {
  if (!rapier || !world) return null;

  // Convert screen coords to NDC (-1 to 1)
  const ndcX = (screenX / window.innerWidth) * 2 - 1;
  const ndcY = -(screenY / window.innerHeight) * 2 + 1;

  // Unproject to get world-space ray direction
  const near = new THREE.Vector3(ndcX, ndcY, 0).unproject(camera);
  const far = new THREE.Vector3(ndcX, ndcY, 1).unproject(camera);
  const dir = far.sub(near).normalize();

  return raycast(
    { x: near.x, y: near.y, z: near.z },
    { x: dir.x, y: dir.y, z: dir.z },
    maxDistance,
  );
}

/**
 * Remove all colliders for a given set of mesh IDs (e.g., on biome change).
 */
export function removeColliders(meshIds: string[]): void {
  if (!world) return;
  for (const id of meshIds) {
    const collider = meshToCollider.get(id);
    if (collider) {
      colliderToMesh.delete(collider.handle);
      meshToCollider.delete(id);
      world.removeCollider(collider, true);
    }
  }
}

/**
 * Clear all physics bodies and colliders (e.g., on world reset).
 */
export function clearAll(): void {
  if (!world) return;
  meshToCollider.clear();
  colliderToMesh.clear();
  for (const body of bodies) {
    world.removeRigidBody(body);
  }
  bodies.length = 0;
}

/**
 * Destroy the physics world entirely.
 */
export function cleanup(): void {
  clearAll();
  if (world) {
    world.free();
    world = null;
  }
  if (eventQueue) {
    eventQueue.free();
    eventQueue = null;
  }
  rapier = null;
}
