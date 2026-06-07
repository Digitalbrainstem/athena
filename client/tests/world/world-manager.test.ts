import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { WorldManager } from '../../src/world/world-manager.js';

vi.mock('../../src/world/workshop-biome.js', async () => {
  const THREE = await import('three');

  return {
    WorkshopBiome: class MockWorkshopBiome {
      readonly group = new THREE.Group();
      init(): Promise<void> { return Promise.resolve(); }
      dispose(): void { this.group.clear(); }
    },
    getWorkshopCollisionBoxes: vi.fn(() => []),
    getWorkshopGameplayObjects: vi.fn(() => []),
  };
});

function findByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (child.name === name) found = child;
  });
  return found;
}

describe('WorldManager', () => {
  it('populates natural biomes instead of entering an empty scene', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('farm');

      const farm = findByName(scene, 'biome:farm');
      expect(world.isInside()).toBe(true);
      expect(world.activeBiomeId).toBe('farm');
      expect(farm).toBeDefined();
      expect(farm!.children.length).toBeGreaterThan(1);
      expect(findByName(scene, 'overworld')).toBeNull();
    } finally {
      world.dispose();
    }
  });

  it('returns from a natural biome to the overworld', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('farm');
      world.forceExitBiome();

      expect(world.isOverworld()).toBe(true);
      expect(world.activeBiomeId).toBeNull();
      expect(findByName(scene, 'biome:farm')).toBeNull();
      expect(findByName(scene, 'overworld')).toBeDefined();
    } finally {
      world.dispose();
    }
  });
});
