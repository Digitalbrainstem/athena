import * as THREE from 'three';
import { loadGLB, preloadGLBs, clearModelCache, type ModelCategory } from './glb-loader.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Workshop Biome — the starting area built from real GLB models
// ---------------------------------------------------------------------------

// Base path to content models (served via Vite public or dev server)
const M = '/content/models';

/** All models used in the workshop biome with their paths and categories */
const WORKSHOP_MODELS = {
  // Workshop items
  forge:      { path: `${M}/workshop/workshop_forge.glb`,      category: 'metal' as const, scale: 1.0 },
  workbench:  { path: `${M}/workshop/workshop_workbench.glb`,  category: 'wood' as const,  scale: 1.0 },
  anvil:      { path: `${M}/workshop/workshop_anvil.glb`,      category: 'metal' as const, scale: 1.0 },
  toolrack:   { path: `${M}/workshop/workshop_toolrack.glb`,   category: 'wood' as const,  scale: 1.0 },
  crate:      { path: `${M}/workshop/workshop_crate.glb`,      category: 'wood' as const,  scale: 1.0 },
  barrel:     { path: `${M}/workshop/workshop_barrel.glb`,     category: 'wood' as const,  scale: 1.0 },
  // Buildings
  cottage:    { path: `${M}/buildings/cottage_small.glb`,       category: 'wood' as const,  scale: 1.2 },
  marketStall:{ path: `${M}/buildings/market_stall.glb`,        category: 'wood' as const,  scale: 1.0 },
  // Structures
  fence:      { path: `${M}/structures/wooden_fence.glb`,      category: 'wood' as const,  scale: 1.0 },
  well:       { path: `${M}/structures/well_stone.glb`,        category: 'stone' as const, scale: 1.0 },
  bridge:     { path: `${M}/structures/wooden_bridge.glb`,     category: 'wood' as const,  scale: 1.0 },
  stonePath:  { path: `${M}/structures/stone_path.glb`,        category: 'stone' as const, scale: 1.0 },
  signpost:   { path: `${M}/structures/signpost_wooden.glb`,   category: 'wood' as const,  scale: 1.0 },
  lantern:    { path: `${M}/structures/lantern_post.glb`,      category: 'lantern' as const, scale: 1.0 },
  // Nature
  treeOak:    { path: `${M}/nature/tree_oak.glb`,              category: 'tree' as const,  scale: 1.2 },
  treePine:   { path: `${M}/nature/tree_pine.glb`,             category: 'tree' as const,  scale: 1.2 },
  rockLarge:  { path: `${M}/nature/rock_large.glb`,            category: 'stone' as const, scale: 1.0 },
  rockCluster:{ path: `${M}/nature/rock_cluster.glb`,          category: 'stone' as const, scale: 1.0 },
  bush:       { path: `${M}/nature/bush_flowering.glb`,        category: 'bush' as const,  scale: 1.0 },
  grass:      { path: `${M}/nature/grass_patch.glb`,           category: 'grass' as const, scale: 1.0 },
  // Items
  chest:      { path: `${M}/items/treasure_chest.glb`,         category: 'chest' as const, scale: 0.8 },
};

interface PlacedObject {
  model: keyof typeof WORKSHOP_MODELS;
  x: number;
  z: number;
  y?: number;
  rotY?: number;
  scale?: number;
  name?: string;
  interactive?: boolean;
}

/**
 * Layout of the workshop biome — positions are relative to biome center (0,0).
 * The biome center is at worldPosition (-40, 30) per overworld.ts.
 */
const WORKSHOP_LAYOUT: PlacedObject[] = [
  // === Central Workshop Area ===
  // Cottage as the main workshop building
  { model: 'cottage', x: 0, z: -2, rotY: 0, name: 'workshop-building' },

  // Workshop work area (in front of the cottage)
  { model: 'forge',     x: -3.5, z: 3,  rotY: 0,    name: 'forge',     interactive: true },
  { model: 'workbench', x: 0,    z: 4,  rotY: 0,    name: 'workbench', interactive: true },
  { model: 'anvil',     x: 3.5,  z: 3,  rotY: -0.3, name: 'anvil',     interactive: true },
  { model: 'toolrack',  x: -5,   z: 0,  rotY: Math.PI / 2, name: 'toolrack' },

  // Storage corner
  { model: 'crate',  x: 5,   z: -1, rotY: 0.2 },
  { model: 'crate',  x: 5.8, z: -0.3, rotY: 0.6, scale: 0.8 },
  { model: 'barrel', x: 5.5, z: 1,  rotY: 0 },
  { model: 'barrel', x: 6.2, z: 0.2, rotY: 0.8 },

  // Treasure chest (interactive!)
  { model: 'chest', x: -5.5, z: -3, rotY: Math.PI / 4, name: 'treasure-chest', interactive: true },

  // === Stone Paths ===
  // Main path from entrance to cottage
  { model: 'stonePath', x: 0, z: 7, rotY: 0 },
  { model: 'stonePath', x: 0, z: 9, rotY: 0 },
  { model: 'stonePath', x: 0, z: 11, rotY: 0 },
  // Side path to the well
  { model: 'stonePath', x: 3, z: 7, rotY: Math.PI / 2 },
  { model: 'stonePath', x: 5, z: 7, rotY: Math.PI / 2 },
  // Path towards market stall
  { model: 'stonePath', x: -3, z: 7, rotY: Math.PI / 2 },
  { model: 'stonePath', x: -5, z: 7, rotY: Math.PI / 2 },

  // === Well ===
  { model: 'well', x: 7, z: 7, rotY: 0, name: 'village-well' },

  // === Market Stall ===
  { model: 'marketStall', x: -7, z: 8, rotY: Math.PI / 6, name: 'market-stall' },

  // === Signpost at entrance ===
  { model: 'signpost', x: 1, z: 12, rotY: Math.PI, name: 'entrance-sign' },

  // === Bridge ===
  { model: 'bridge', x: 0, z: 14, rotY: 0, name: 'entrance-bridge' },

  // === Lanterns for lighting ===
  { model: 'lantern', x: -3,  z: 5,   rotY: 0 },
  { model: 'lantern', x: 3,   z: 5,   rotY: 0 },
  { model: 'lantern', x: -6,  z: 10,  rotY: 0 },
  { model: 'lantern', x: 6,   z: 10,  rotY: 0 },
  { model: 'lantern', x: 0,   z: -5,  rotY: 0 },
  { model: 'lantern', x: -8,  z: 0,   rotY: 0 },

  // === Fences defining the perimeter ===
  // North side (behind cottage)
  { model: 'fence', x: -6,  z: -6, rotY: 0 },
  { model: 'fence', x: -3,  z: -6, rotY: 0 },
  { model: 'fence', x: 0,   z: -6, rotY: 0 },
  { model: 'fence', x: 3,   z: -6, rotY: 0 },
  { model: 'fence', x: 6,   z: -6, rotY: 0 },
  // East side
  { model: 'fence', x: 9,  z: -4,  rotY: Math.PI / 2 },
  { model: 'fence', x: 9,  z: -1,  rotY: Math.PI / 2 },
  { model: 'fence', x: 9,  z: 2,   rotY: Math.PI / 2 },
  { model: 'fence', x: 9,  z: 5,   rotY: Math.PI / 2 },
  // West side
  { model: 'fence', x: -9, z: -4,  rotY: Math.PI / 2 },
  { model: 'fence', x: -9, z: -1,  rotY: Math.PI / 2 },
  { model: 'fence', x: -9, z: 2,   rotY: Math.PI / 2 },
  { model: 'fence', x: -9, z: 5,   rotY: Math.PI / 2 },

  // === Trees around edges ===
  { model: 'treeOak',  x: -11, z: -5,  rotY: 0 },
  { model: 'treeOak',  x: -12, z: 3,   rotY: 0.5 },
  { model: 'treePine', x: 11,  z: -4,  rotY: 0 },
  { model: 'treePine', x: 12,  z: 4,   rotY: 0.3 },
  { model: 'treeOak',  x: -10, z: 10,  rotY: 1.2 },
  { model: 'treePine', x: 10,  z: 12,  rotY: 0.8 },
  { model: 'treeOak',  x: -8,  z: -8,  rotY: 2.1 },
  { model: 'treePine', x: 8,   z: -8,  rotY: 1.5 },
  { model: 'treeOak',  x: 0,   z: -9,  rotY: 0.7 },
  { model: 'treePine', x: -5,  z: 14,  rotY: 0 },
  { model: 'treeOak',  x: 6,   z: 14,  rotY: 1.0 },

  // === Rocks ===
  { model: 'rockLarge',   x: -11, z: -2, rotY: 0.4 },
  { model: 'rockCluster', x: 11,  z: 0,  rotY: 1.2 },
  { model: 'rockLarge',   x: -6,  z: -8, rotY: 2.0, scale: 0.7 },
  { model: 'rockCluster', x: 7,   z: -7, rotY: 0.5, scale: 0.8 },

  // === Bushes and grass ===
  { model: 'bush', x: -10, z: 6,   rotY: 0.3 },
  { model: 'bush', x: 10,  z: 8,   rotY: 1.1 },
  { model: 'bush', x: -7,  z: -4,  rotY: 2.0 },
  { model: 'bush', x: 8,   z: -3,  rotY: 0.7 },

  { model: 'grass', x: -4, z: 10, rotY: 0 },
  { model: 'grass', x: 4,  z: 10, rotY: 0.5 },
  { model: 'grass', x: -2, z: -4, rotY: 1.0 },
  { model: 'grass', x: 2,  z: -4, rotY: 2.0 },
  { model: 'grass', x: 7,  z: 3,  rotY: 0.3 },
  { model: 'grass', x: -7, z: 5,  rotY: 1.5 },
];

// ---------------------------------------------------------------------------
// WorkshopBiome — async builder
// ---------------------------------------------------------------------------

export class WorkshopBiome implements Disposable {
  readonly group = new THREE.Group();
  private loaded = false;
  private disposed = false;

  constructor() {
    this.group.name = 'workshop-biome';
  }

  /** Pre-load all GLB models used by the workshop. */
  async preload(): Promise<void> {
    const uniqueModels = new Map<string, { path: string; category?: ModelCategory; scale?: number }>();
    for (const obj of WORKSHOP_LAYOUT) {
      const def = WORKSHOP_MODELS[obj.model];
      if (!uniqueModels.has(def.path)) {
        uniqueModels.set(def.path, { path: def.path, category: def.category, scale: def.scale });
      }
    }
    await preloadGLBs(Array.from(uniqueModels.values()));
  }

  /** Build the full workshop biome. Call after preload(). */
  async build(): Promise<void> {
    if (this.loaded || this.disposed) return;

    // Ground plane for the workshop area
    const groundGeo = new THREE.CircleGeometry(14, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6b8f4e,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.01;
    ground.receiveShadow = true;
    ground.name = 'workshop-ground';
    this.group.add(ground);

    // Workshop floor (slightly raised, darker)
    const floorGeo = new THREE.PlaneGeometry(12, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.03, 0);
    floor.receiveShadow = true;
    floor.name = 'workshop-floor';
    this.group.add(floor);

    // Load and place all models
    const loadPromises = WORKSHOP_LAYOUT.map(async (obj) => {
      const def = WORKSHOP_MODELS[obj.model];
      const s = (obj.scale ?? 1) * (def.scale ?? 1);
      const result = await loadGLB(def.path, def.category, s);

      result.group.position.set(obj.x, obj.y ?? 0, obj.z);
      if (obj.rotY) result.group.rotation.y = obj.rotY;
      if (obj.name) result.group.name = obj.name;

      // Mark interactive objects with userData
      if (obj.interactive) {
        result.group.userData.interactive = true;
        result.group.userData.interactionType = obj.model === 'chest' ? 'open' : 'craft';
        result.group.userData.prompt = obj.name ?? obj.model;
      }

      return result.group;
    });

    const meshes = await Promise.all(loadPromises);
    for (const m of meshes) {
      if (!this.disposed) this.group.add(m);
    }

    // Add point lights at lantern positions for warm glow
    const lanternPositions = WORKSHOP_LAYOUT.filter(o => o.model === 'lantern');
    for (const lp of lanternPositions) {
      const light = new THREE.PointLight(0xffd700, 0.6, 8);
      light.position.set(lp.x, 2.5, lp.z);
      this.group.add(light);
    }

    // Ambient light boost for the workshop area
    const workshopAmbient = new THREE.PointLight(0xff9933, 0.3, 20);
    workshopAmbient.position.set(0, 4, 2);
    this.group.add(workshopAmbient);

    // Forge glow
    const forgeGlow = new THREE.PointLight(0xff4400, 0.8, 6);
    forgeGlow.position.set(-3.5, 1.5, 3);
    this.group.add(forgeGlow);

    this.loaded = true;
  }

  /** Preload + build in one call. */
  async init(): Promise<void> {
    await this.preload();
    await this.build();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (obj.material instanceof THREE.Material) obj.material.dispose();
      }
    });
    this.group.clear();
    clearModelCache();
  }
}
