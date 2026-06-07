import * as THREE from 'three';
import { loadGLB, preloadGLBs, type ModelCategory } from './glb-loader.js';
import type { CollisionBox } from '../camera/first-person.js';
import type { Disposable, SceneObject } from '../types.js';

// ---------------------------------------------------------------------------
// Workshop Biome — the starting area built from real GLB models
// ---------------------------------------------------------------------------

// Base path to content models (served via Vite public or dev server)
const M = '/content/models';
const K = `${M}/kenney`;

/** All models used in the workshop biome with their paths and categories */
const WORKSHOP_MODELS = {
  // Workshop items
  forge:      { path: `${K}/furniture/kitchenStove.glb`,       category: 'metal' as const, scale: 2.2 },
  workbench:  { path: `${K}/furniture/tableCross.glb`,         category: 'wood' as const,  scale: 1.0 },
  anvil:      { path: `${K}/nature/stone_largeA.glb`,          category: 'stone' as const, scale: 1.3 },
  toolrack:   { path: `${K}/furniture/coatRackStanding.glb`,   category: 'wood' as const,  scale: 1.35 },
  crate:      { path: `${K}/medieval/detail-crate.glb`,        category: 'wood' as const,  scale: 0.75 },
  barrel:     { path: `${K}/medieval/barrels.glb`,             category: 'wood' as const,  scale: 0.45 },
  // Buildings
  workshopHouse: { path: `${K}/medieval/wall-pane-wood-door.glb`, category: 'wood' as const, scale: 2.0 },
  marketStall:{ path: `${K}/furniture/table.glb`,              category: 'wood' as const,  scale: 2.0 },
  // Structures
  fence:      { path: `${K}/nature/fence_simple.glb`,          category: 'wood' as const,  scale: 1.35 },
  well:       { path: `${K}/nature/pot_large.glb`,             category: 'stone' as const, scale: 1.4 },
  bridge:     { path: `${K}/nature/bridge_wood.glb`,           category: 'wood' as const,  scale: 1.4 },
  stonePath:  { path: `${K}/nature/path_stone.glb`,            category: 'stone' as const, scale: 1.3 },
  signpost:   { path: `${K}/nature/sign.glb`,                  category: 'wood' as const,  scale: 1.5 },
  lantern:    { path: `${K}/furniture/lampSquareTable.glb`,    category: 'lantern' as const, scale: 2.0 },
  // Nature
  treeOak:    { path: `${K}/nature/tree_oak.glb`,              category: 'tree' as const,  scale: 2.8 },
  treePine:   { path: `${K}/nature/tree_pineTallA.glb`,        category: 'tree' as const,  scale: 2.8 },
  rockLarge:  { path: `${K}/nature/rock_largeA.glb`,           category: 'stone' as const, scale: 1.8 },
  rockCluster:{ path: `${K}/nature/stone_largeA.glb`,          category: 'stone' as const, scale: 1.5 },
  bush:       { path: `${K}/nature/plant_bushLarge.glb`,       category: 'bush' as const,  scale: 1.4 },
  grass:      { path: `${K}/nature/grass_large.glb`,           category: 'grass' as const, scale: 1.3 },
  // Items
  chest:      { path: `${K}/furniture/cardboardBoxOpen.glb`,   category: 'chest' as const, scale: 1.2 },
};

const WORKSHOP_HOUSE_PARTS = {
  door:   { path: `${K}/medieval/wall-pane-wood-door.glb`,   category: 'wood' as const, scale: 2.0 },
  wall:   { path: `${K}/medieval/wall-pane-wood.glb`,        category: 'wood' as const, scale: 2.0 },
  window: { path: `${K}/medieval/wall-pane-wood-window.glb`, category: 'wood' as const, scale: 2.0 },
  roof:   { path: `${K}/medieval/roof.glb`,                  category: 'wood' as const, scale: 2.0 },
  edge:   { path: `${K}/medieval/roof-edge.glb`,             category: 'wood' as const, scale: 2.0 },
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

interface Footprint {
  hx: number;
  hz: number;
  height: number;
  solid?: boolean;
}

const WORKSHOP_ENTITY_BASE = -5000;

const MODEL_FOOTPRINTS: Partial<Record<keyof typeof WORKSHOP_MODELS, Footprint>> = {
  forge:       { hx: 1.25, hz: 1.0,  height: 1.6 },
  workbench:   { hx: 1.35, hz: 0.75, height: 1.0 },
  anvil:       { hx: 0.7,  hz: 0.55, height: 0.9 },
  toolrack:    { hx: 0.25, hz: 1.3,  height: 1.8 },
  crate:       { hx: 0.55, hz: 0.55, height: 0.9 },
  barrel:      { hx: 0.45, hz: 0.45, height: 1.1 },
  workshopHouse: { hx: 3.5, hz: 2.5, height: 3.2 },
  marketStall: { hx: 1.7,  hz: 1.2,  height: 2.0 },
  fence:       { hx: 1.35, hz: 0.12, height: 0.8 },
  well:        { hx: 1.15, hz: 1.15, height: 1.4 },
  bridge:      { hx: 1.2,  hz: 2.0,  height: 0.4, solid: false },
  signpost:    { hx: 0.28, hz: 0.28, height: 2.2 },
  lantern:     { hx: 0.18, hz: 0.18, height: 2.5 },
  treeOak:     { hx: 0.75, hz: 0.75, height: 4.5 },
  treePine:    { hx: 0.7,  hz: 0.7,  height: 4.8 },
  rockLarge:   { hx: 0.85, hz: 0.7,  height: 1.0 },
  rockCluster: { hx: 1.0,  hz: 0.8,  height: 0.8 },
  bush:        { hx: 0.55, hz: 0.55, height: 0.7, solid: false },
  grass:       { hx: 0.4,  hz: 0.4,  height: 0.2, solid: false },
  stonePath:   { hx: 0.9,  hz: 0.9,  height: 0.05, solid: false },
  chest:       { hx: 0.75, hz: 0.45, height: 0.65 },
};

const INTERACTION_MODEL_IDS: Partial<Record<keyof typeof WORKSHOP_MODELS, string>> = {
  forge: 'forge',
  workbench: 'workbench',
  anvil: 'anvil',
  chest: 'chest',
};

/**
 * Layout of the workshop biome — positions are relative to biome center (0,0).
 * The biome center is at worldPosition (-40, 30) per overworld.ts.
 */
const WORKSHOP_LAYOUT: PlacedObject[] = [
  // === Central Workshop Area ===
  { model: 'workshopHouse', x: 0, z: -2, rotY: 0, name: 'workshop-building' },

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

function rotatedFootprint(hx: number, hz: number, rotY = 0): { hx: number; hz: number } {
  const c = Math.abs(Math.cos(rotY));
  const s = Math.abs(Math.sin(rotY));
  return {
    hx: hx * c + hz * s,
    hz: hx * s + hz * c,
  };
}

function objectScale(obj: PlacedObject): number {
  const def = WORKSHOP_MODELS[obj.model];
  return (obj.scale ?? 1) * (def.scale ?? 1);
}

export function getWorkshopCollisionBoxes(offsetX: number, offsetZ: number): CollisionBox[] {
  const boxes: CollisionBox[] = [];
  for (const obj of WORKSHOP_LAYOUT) {
    const fp = MODEL_FOOTPRINTS[obj.model];
    if (obj.interactive) continue;
    if (!fp || fp.solid === false) continue;
    const s = objectScale(obj);
    const rotated = rotatedFootprint(fp.hx * s, fp.hz * s, obj.rotY);
    boxes.push({
      cx: offsetX + obj.x,
      cz: offsetZ + obj.z,
      hx: rotated.hx,
      hz: rotated.hz,
    });
  }
  return boxes;
}

export function getWorkshopGameplayObjects(offsetX: number, offsetY: number, offsetZ: number): SceneObject[] {
  const objects: SceneObject[] = [];
  for (let i = 0; i < WORKSHOP_LAYOUT.length; i++) {
    const obj = WORKSHOP_LAYOUT[i]!;
    if (!obj.interactive) continue;

    const fp = MODEL_FOOTPRINTS[obj.model] ?? { hx: 0.75, hz: 0.75, height: 1.0 };
    const s = objectScale(obj);
    const scale = {
      x: fp.hx * 2 * s,
      y: fp.height * s,
      z: fp.hz * 2 * s,
    };
    const name = obj.name ?? obj.model;
    objects.push({
      entityId: WORKSHOP_ENTITY_BASE - i,
      position: { x: offsetX + obj.x, y: offsetY + (obj.y ?? 0), z: offsetZ + obj.z },
      rotation: { x: 0, y: obj.rotY ?? 0, z: 0 },
      renderable: {
        meshType: 'model',
        modelId: INTERACTION_MODEL_IDS[obj.model] ?? obj.model,
        color: '#D4A574',
        scale,
        visible: false,
      },
      interactable: {
        interactionType: obj.model === 'chest' ? 'open' : 'craft',
        radius: obj.model === 'chest' ? 2.2 : 2.5,
        prompt: `Interact with ${name.replace(/-/g, ' ')}`,
      },
      highlight: false,
    });
  }
  return objects;
}

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
      if (obj.model === 'workshopHouse') {
        for (const part of Object.values(WORKSHOP_HOUSE_PARTS)) {
          if (!uniqueModels.has(part.path)) {
            uniqueModels.set(part.path, { path: part.path, category: part.category, scale: part.scale });
          }
        }
      } else {
        const def = WORKSHOP_MODELS[obj.model];
        if (!uniqueModels.has(def.path)) {
          uniqueModels.set(def.path, { path: def.path, category: def.category, scale: def.scale });
        }
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
      const group = obj.model === 'workshopHouse'
        ? await buildWorkshopHouse(obj.scale ?? 1)
        : (await loadPlacedModel(obj));

      group.position.set(obj.x, obj.y ?? 0, obj.z);
      if (obj.rotY) group.rotation.y = obj.rotY;
      if (obj.name) group.name = obj.name;

      // Mark interactive objects with userData
      if (obj.interactive) {
        group.userData.interactive = true;
        group.userData.interactionType = obj.model === 'chest' ? 'open' : 'craft';
        group.userData.prompt = obj.name ?? obj.model;
      }

      return group;
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
  }
}

async function loadPlacedModel(obj: PlacedObject): Promise<THREE.Group> {
  const def = WORKSHOP_MODELS[obj.model];
  const s = (obj.scale ?? 1) * (def.scale ?? 1);
  return (await loadGLB(def.path, def.category, s)).group;
}

async function buildWorkshopHouse(scale: number): Promise<THREE.Group> {
  const house = new THREE.Group();
  house.name = 'workshop-house';

  const addPart = async (
    part: keyof typeof WORKSHOP_HOUSE_PARTS,
    position: [number, number, number],
    rotY = 0,
    extraScale = 1,
  ): Promise<void> => {
    const def = WORKSHOP_HOUSE_PARTS[part];
    const result = await loadGLB(def.path, def.category, def.scale * scale * extraScale);
    result.group.position.set(position[0] * scale, position[1] * scale, position[2] * scale);
    result.group.rotation.y = rotY;
    house.add(result.group);
  };

  await Promise.all([
    // Front wall with door, facing the player path.
    addPart('wall', [-1.9, 0, 1.5]),
    addPart('door', [0, 0, 1.5]),
    addPart('window', [1.9, 0, 1.5]),
    // Back wall.
    addPart('window', [-1.9, 0, -1.5], Math.PI),
    addPart('wall', [0, 0, -1.5], Math.PI),
    addPart('window', [1.9, 0, -1.5], Math.PI),
    // Side walls.
    addPart('wall', [-2.9, 0, -0.55], Math.PI / 2),
    addPart('wall', [-2.9, 0, 0.95], Math.PI / 2),
    addPart('wall', [2.9, 0, -0.55], -Math.PI / 2),
    addPart('wall', [2.9, 0, 0.95], -Math.PI / 2),
    // Roof pieces.
    addPart('roof', [-1.2, 1.45, 0], 0, 1.25),
    addPart('roof', [1.2, 1.45, 0], 0, 1.25),
    addPart('edge', [-2.6, 1.45, 0], 0, 1.1),
    addPart('edge', [2.6, 1.45, 0], Math.PI, 1.1),
  ]);

  return house;
}
