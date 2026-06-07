import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { BIOME_ENTER_RANGE, WorldManager } from '../../src/world/world-manager.js';

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
  it('starts the player on the workshop approach path outside craft range', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      const start = world.getStartPosition('workshop');
      expect(start.x).toBeCloseTo(-40);
      expect(start.z).toBeCloseTo(42.25);
      expect(Math.hypot(start.x - -40, start.z - 38)).toBeGreaterThan(BIOME_ENTER_RANGE);
    } finally {
      world.dispose();
    }
  });

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
      expect(world.getExtraCollisionBoxes().length).toBeGreaterThan(0);
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

  it('bridges natural biome props into gameplay interactions', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('farm');
      const graph = world.mergeGameplayObjects({
        camera: {
          position: { x: 0, y: 1.6, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          fov: 70,
          near: 0.1,
          far: 500,
        },
        lights: [],
        objects: [],
        sky: { type: 'color', primaryColor: '#87CEEB' },
        ground: { type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } },
        ui: { elements: [], dialogueActive: false, inventoryOpen: false, mapOpen: false, paused: false },
        audio: [],
        announcements: [],
        captions: [],
      });

      expect(graph.objects.length).toBeGreaterThan(0);
      expect(graph.objects.map(obj => obj.renderable.modelId)).toEqual(expect.arrayContaining([
        'barn',
        'cropRow',
        'wheelbarrow',
        'scarecrow',
        'wellBucket',
      ]));
      expect(graph.objects.every(obj => obj.renderable.visible === false)).toBe(true);
      expect(graph.objects.every(obj => obj.interactable?.interactionType === 'examine')).toBe(true);
    } finally {
      world.dispose();
    }
  });
});
