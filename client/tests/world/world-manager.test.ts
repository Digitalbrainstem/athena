import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { BIOME_ENTER_RANGE, WorldManager } from '../../src/world/world-manager.js';
import { findNearestNpc } from '../../src/ui/npc-dialogue.js';
import { getWorkshopApproachOffset, getWorkshopExteriorBounds, getWorkshopExteriorEntryOffset } from '../../src/world/workshop-biome.js';
import type { SceneGraph } from '../../src/types.js';

vi.mock('../../src/world/workshop-biome.js', async () => {
  const THREE = await import('three');
  const actual = await vi.importActual<typeof import('../../src/world/workshop-biome.js')>(
    '../../src/world/workshop-biome.js',
  );

  return {
    ...actual,
    WorkshopBiome: class MockWorkshopBiome {
      readonly group = new THREE.Group();
      init(): Promise<void> { return Promise.resolve(); }
      dispose(): void { this.group.clear(); }
      revealCraftedPigment(itemId: string): boolean {
        if (itemId !== 'purple-pigment') return false;
        const display = new THREE.Group();
        display.name = `crafted-${itemId}-display`;
        this.group.add(display);
        return true;
      }
    },
    getWorkshopCollisionBoxes: vi.fn(() => []),
  };
});

function findByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (child.name === name) found = child;
  });
  return found;
}

function emptyGraph(): SceneGraph {
  return {
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
  };
}

describe('WorldManager', () => {
  it('starts the player on the workshop approach path outside craft range', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      const start = world.getStartPosition('workshop');
      const exterior = getWorkshopExteriorBounds();
      const entry = getWorkshopExteriorEntryOffset();
      const approach = getWorkshopApproachOffset();

      expect(start.x).toBeCloseTo(-40 + approach.x);
      expect(start.z).toBeGreaterThan(30 + exterior.maxZ);
      expect(start.z).toBeCloseTo(30 + approach.z);
      expect(Math.hypot(start.x - -40, start.z - (30 + entry.z))).toBeGreaterThan(BIOME_ENTER_RANGE);
    } finally {
      world.dispose();
    }
  });

  it('enters the workshop only at the cottage doorway, not the old open-yard trigger', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.update(-40, 38, 1 / 60);
      expect(world.nearbyBiome?.biome.id).toBe('workshop');
      expect(world.nearbyBiome!.entranceDistance).toBeGreaterThan(BIOME_ENTER_RANGE);

      const entry = getWorkshopExteriorEntryOffset();
      world.update(-40 + entry.x, 30 + entry.z, 1 / 60);
      expect(world.nearbyBiome?.biome.id).toBe('workshop');
      expect(world.nearbyBiome!.entranceDistance).toBeLessThanOrEqual(BIOME_ENTER_RANGE);
    } finally {
      world.dispose();
    }
  });

  it('wires visible workshop yard stations into overworld interactions', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      const graph = world.mergeGameplayObjects(emptyGraph());
      const models = graph.objects.map(obj => obj.renderable.modelId);

      expect(models).toEqual(expect.arrayContaining([
        'workbench',
        'forge',
        'anvil',
        'chest',
      ]));
      expect(graph.objects.every(obj => obj.renderable.visible === false)).toBe(true);
      expect(graph.objects.filter(obj => obj.interactable?.interactionType === 'craft').length).toBeGreaterThanOrEqual(3);
    } finally {
      world.dispose();
    }
  });

  it('reveals crafted pigments while using the overworld workshop workbench', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      expect(world.isOverworld()).toBe(true);
      expect(world.revealCraftedPigment('purple-pigment')).toBe(true);
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

  it('converts world-space camera positions to local biome coordinates for NPC checks', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('workshop');
      const local = world.worldToActiveBiomeLocal(-43, 26);

      expect(local).toEqual({ x: -3, z: -4 });
      expect(findNearestNpc('workshop', local!.x, local!.z)?.name).toBe('Hilda');
    } finally {
      world.dispose();
    }
  });

  it('reveals a persistent pigment display after Workshop color crafting', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('workshop');

      expect(world.revealCraftedPigment('purple-pigment')).toBe(true);
      expect(findByName(scene, 'crafted-purple-pigment-display')).not.toBeNull();
      expect(findByName(scene, 'purple-mural-swatch')).not.toBeNull();
    } finally {
      world.dispose();
    }
  });

  it('populates early building interiors with biome-specific props and interactions', () => {
    const scene = new THREE.Scene();
    const world = new WorldManager(scene);

    try {
      world.forceEnterBiome('gallery');

      expect(findByName(scene, 'interior-gallery-easel-0')).not.toBeNull();
      expect(findByName(scene, 'interior-gallery-statue-2')).not.toBeNull();

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
        ground: { type: 'tile', color: '#f5deb3', size: { width: 100, depth: 100 } },
        ui: { elements: [], dialogueActive: false, inventoryOpen: false, mapOpen: false, paused: false },
        audio: [],
        announcements: [],
        captions: [],
      });

      expect(graph.objects.map(obj => obj.renderable.modelId)).toEqual(expect.arrayContaining([
        'easel',
        'statue',
        'paintingFrame',
      ]));
      expect(graph.objects.some(obj => obj.interactable?.prompt === 'Interact with easel')).toBe(true);
    } finally {
      world.dispose();
    }
  });
});
