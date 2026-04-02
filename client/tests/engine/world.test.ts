import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { World } from '../../src/engine/world.js';

describe('World', () => {
  let world: World;
  beforeEach(() => { world = new World(); world.setup(); });

  it('creates a scene', () => { expect(world.scene).toBeInstanceOf(THREE.Scene); });
  it('adds a ground plane', () => { expect(world.scene.getObjectByName('ground')).toBeInstanceOf(THREE.Mesh); });
  it('sets scene background', () => { expect(world.scene.background).toBeInstanceOf(THREE.Color); });
  it('sets scene fog', () => { expect(world.scene.fog).toBeDefined(); });

  it('populates at least 5 world objects', () => {
    expect(world.getObjects().length).toBeGreaterThanOrEqual(5);
  });

  it('every object has id, position, and aabb', () => {
    for (const obj of world.getObjects()) {
      expect(obj.id).toBeTruthy();
      expect(obj.position).toBeInstanceOf(THREE.Vector3);
      expect(obj.aabb).toBeDefined();
      expect(obj.aabb!.min).toBeInstanceOf(THREE.Vector3);
      expect(obj.aabb!.max).toBeInstanceOf(THREE.Vector3);
    }
  });

  it('creates workshop chunk', () => {
    const chunks = world.getChunks();
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].biomeType).toBe('workshop');
    expect(chunks[0].objects.length).toBeGreaterThanOrEqual(5);
  });

  it('findNearestInteractable returns object within radius', () => {
    const bench = world.getObjects().find((o) => o.id === 'workbench');
    expect(bench).toBeDefined();
    const result = world.findNearestInteractable(bench!.position.clone());
    expect(result).not.toBeNull();
    expect(result!.id).toBe('workbench');
  });

  it('findNearestInteractable returns null when far away', () => {
    expect(world.findNearestInteractable(new THREE.Vector3(999, 0, 999))).toBeNull();
  });

  it('dispose clears objects and chunks', () => {
    world.dispose();
    expect(world.getObjects()).toHaveLength(0);
    expect(world.getChunks()).toHaveLength(0);
  });

  it('dispose is idempotent', () => {
    world.dispose();
    expect(() => world.dispose()).not.toThrow();
  });
});
