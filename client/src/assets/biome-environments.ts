import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import { MaterialLibrary, BIOME_PALETTES } from './materials.js';
import { ProceduralModelGenerator } from './procedural-models.js';
import { loadCachedWorldModel } from './world-models.js';

// ---------------------------------------------------------------------------
// BiomeEnvironmentGenerator — produces a full 3D environment for each biome
// ---------------------------------------------------------------------------

export interface BiomeEnvironmentConfig {
  /** Reduce decorations for lower-end devices */
  reducedDetail?: boolean;
  /** Skip animated decorations (accessibility: reduced motion) */
  reducedMotion?: boolean;
}

export interface PropPlacement {
  type: string;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
}

export class BiomeEnvironmentGenerator {
  private readonly lib: MaterialLibrary;
  private readonly models: ProceduralModelGenerator;

  constructor(lib: MaterialLibrary, models: ProceduralModelGenerator) {
    this.lib = lib;
    this.models = models;
  }

  generate(
    biomeId: string,
    tier: MasteryTier,
    config: BiomeEnvironmentConfig = {},
  ): THREE.Group {
    const palette = BIOME_PALETTES[biomeId];
    if (!palette) return new THREE.Group();

    const group = new THREE.Group();
    group.name = `biome:${biomeId}`;

    // Ground plane
    const ground = this.makeGround(palette, tier);
    group.add(ground);

    // Biome-specific ambient props
    const layout = BIOME_LAYOUTS[biomeId];
    if (layout) {
      const propCount = config.reducedDetail ? Math.ceil(layout.length / 2) : layout.length;
      for (let i = 0; i < propCount; i++) {
        const prop = layout[i]!;
        const model = createBiomePropModel(prop, tier, this.models);
        model.name = `${biomeId}:${prop.type}:${i}`;
        model.userData.biomePropIndex = i;
        group.add(model);
      }
    }

    return group;
  }

  /** Build the biome's ground plane with biome-appropriate color. */
  private makeGround(palette: { ground: number }, tier: MasteryTier): THREE.Mesh {
    const s = tier === 'foundation' ? 32 : 64;
    const geom = new THREE.PlaneGeometry(50, 50, s, s);
    const mat = this.lib.fromColor(palette.ground, 0.9, 0.0);
    const m = new THREE.Mesh(geom, mat);
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    m.name = 'biome-ground';
    return m;
  }
}

export function getBiomeLayout(biomeId: string): readonly PropPlacement[] {
  return BIOME_LAYOUTS[biomeId] ?? [];
}

export function createBiomePropModel(
  prop: PropPlacement,
  tier: MasteryTier,
  models: ProceduralModelGenerator,
): THREE.Group {
  const model = loadCachedWorldModel(prop.type) ?? models.generate(prop.type, tier);
  model.userData.biomePropType = prop.type;
  model.position.set(...prop.pos);
  if (prop.rot) model.rotation.set(...prop.rot);
  if (prop.scale) model.scale.multiply(new THREE.Vector3(...prop.scale));
  return model;
}

// ---------------------------------------------------------------------------
// Per-biome prop layouts — gives every biome a distinct visual identity
// ---------------------------------------------------------------------------

const BIOME_LAYOUTS: Record<string, PropPlacement[]> = {
  'workshop': [
    { type: 'workbench', pos: [0, 0, -3] },
    { type: 'anvil', pos: [3, 0, -2] },
    { type: 'toolRack', pos: [-3, 0, -4], rot: [0, Math.PI / 2, 0] },
    { type: 'barrel', pos: [4, 0, 1] },
    { type: 'chest', pos: [-4, 0, 0] },
    { type: 'gear', pos: [-2, 1.5, -4.5], rot: [0, 0, 0], scale: [2, 2, 2] },
    { type: 'gear', pos: [2, 1.8, -4.5], rot: [0, 0, 0.3], scale: [1.5, 1.5, 1.5] },
    { type: 'lantern', pos: [-1, 1.2, -3] },
    { type: 'hammer', pos: [1, 0.93, -3], rot: [0, 0, Math.PI / 4] },
    { type: 'ladder', pos: [5, 0, -3], rot: [0, 0, 0.15] },
    { type: 'crate', pos: [-5, 0, 2] },
    { type: 'crate', pos: [-4.5, 0, 2.5] },
  ],

  'observatory': [
    { type: 'telescope', pos: [0, 0, -2] },
    { type: 'orrery', pos: [3, 0.8, -1], scale: [1.5, 1.5, 1.5] },
    { type: 'starMap', pos: [-3, 0, -4], rot: [0, 0, 0] },
    { type: 'bookshelf', pos: [-5, 0, -3] },
    { type: 'candle', pos: [-2, 0.75, -3], scale: [2, 2, 2] },
    { type: 'readingDesk', pos: [4, 0, -3] },
    { type: 'globe', pos: [4, 0.75, -2.8] },
    { type: 'chair', pos: [4, 0, -2] },
  ],

  'alchemist-lab': [
    { type: 'cauldron', pos: [0, 0, -2], scale: [1.5, 1.5, 1.5] },
    { type: 'alchemyTable', pos: [-3, 0, -3] },
    { type: 'potionBottle', pos: [-2.8, 0.9, -3] },
    { type: 'potionBottle', pos: [-2.5, 0.9, -3.1] },
    { type: 'potionBottle', pos: [-3.2, 0.9, -2.8] },
    { type: 'bookshelf', pos: [4, 0, -4] },
    { type: 'candle', pos: [-1, 0.9, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'candle', pos: [1, 0.9, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'mortar', pos: [-3.5, 0.9, -3] },
    { type: 'chest', pos: [3, 0, 0] },
  ],

  'crystal-caverns': [
    { type: 'crystal', pos: [2, 0, -3] },
    { type: 'crystal', pos: [-3, 0, -2], scale: [1.5, 1.5, 1.5] },
    { type: 'crystalCluster', pos: [0, 0, -4] },
    { type: 'crystalCluster', pos: [-5, 0, -1] },
    { type: 'crystalCluster', pos: [5, 0, 0] },
    { type: 'stalactite', pos: [-1, 4, -3] },
    { type: 'stalactite', pos: [3, 3.5, -2] },
    { type: 'stalactite', pos: [-4, 4.2, 1] },
    { type: 'rock', pos: [4, 0, -4] },
    { type: 'rock', pos: [-2, 0, 2] },
  ],

  'living-forest': [
    { type: 'tree', pos: [-5.8, 0, -6.4], scale: [1.25, 1.25, 1.25] },
    { type: 'tree', pos: [4.8, 0, -6.2], scale: [1.15, 1.15, 1.15] },
    { type: 'treePine', pos: [-7.2, 0, -2.6], scale: [1.05, 1.05, 1.05] },
    { type: 'treePine', pos: [7.0, 0, -3.8], scale: [1.1, 1.1, 1.1] },
    { type: 'ancientTree', pos: [-4.6, 0, -4.6], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [-3.2, 0, -1.6], scale: [1.2, 1.2, 1.2] },
    { type: 'bush', pos: [2.6, 0, -1.4], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [-5.8, 0, 1.2] },
    { type: 'bush', pos: [5.7, 0, 1.0] },
    { type: 'mushroomRing', pos: [1.1, 0, -3.3], scale: [0.9, 0.9, 0.9] },
    { type: 'mushroom', pos: [-0.8, 0, -4.0], scale: [1.3, 1.3, 1.3] },
    { type: 'log', pos: [-0.8, 0, 0.9], rot: [0, 0.5, 0], scale: [1.4, 1.4, 1.4] },
    { type: 'rock', pos: [-3.5, 0, 1.2] },
    { type: 'rock', pos: [4.8, 0, 3.8], scale: [0.8, 0.8, 0.8] },
    { type: 'pond', pos: [3.3, 0, 2.2], scale: [1.35, 1, 1.15] },

    { type: 'food-basket', pos: [-2.4, 0, -0.4], rot: [0, -0.25, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'carrot', pos: [-2.0, 0, -0.15], rot: [0, 0.4, 0], scale: [0.75, 0.75, 0.75] },
    { type: 'sunflower-seeds', pos: [-2.55, 0, -0.1], rot: [0, -0.2, 0] },
    { type: 'acorn', pos: [-2.85, 0, -0.2], scale: [1.2, 1.2, 1.2] },
    { type: 'fresh-leaves', pos: [-2.25, 0, -0.75], scale: [1.1, 1.1, 1.1] },
    { type: 'rabbit', pos: [-4.25, 0, -0.85], rot: [0, -0.2, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'bird', pos: [-1.0, 1.55, -4.6], rot: [0, 0.4, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'squirrel', pos: [-5.0, 0.55, -4.2], rot: [0, 0.6, 0], scale: [1.15, 1.15, 1.15] },
    { type: 'deer', pos: [5.4, 0, 1.6], rot: [0, -0.45, 0], scale: [1.15, 1.15, 1.15] },
    { type: 'fresh-leaves', pos: [5.0, 0.5, 1.0], rot: [0, -0.4, 0], scale: [1.25, 1.25, 1.25] },

    { type: 'garden-plot', pos: [-1.5, 0, 3.7], rot: [0, 0.15, 0], scale: [1.35, 1.2, 1.35] },
    { type: 'watering-can', pos: [-3.0, 0, 3.25], rot: [0, -0.5, 0], scale: [1.8, 1.8, 1.8] },
    { type: 'roots', pos: [-1.85, 0.06, 3.7], scale: [1.3, 1.3, 1.3] },
    { type: 'plant-stem', pos: [-1.45, 0.06, 3.65], scale: [1.2, 1.2, 1.2] },
    { type: 'fresh-leaves', pos: [-1.2, 0.45, 3.65], rot: [0, 0.3, 0], scale: [1.1, 1.1, 1.1] },
    { type: 'flower', pos: [-0.95, 0.08, 3.6], scale: [1.8, 1.8, 1.8] },

    { type: 'flower', pos: [-5.6, 0, 3.0], scale: [1.7, 1.7, 1.7] },
    { type: 'flower', pos: [-5.0, 0, 3.5], scale: [1.4, 1.4, 1.4] },
    { type: 'flower', pos: [-4.4, 0, 2.8], scale: [1.5, 1.5, 1.5] },
    { type: 'red-butterfly', pos: [-5.4, 0.55, 3.0], rot: [0, 0.3, 0], scale: [1.6, 1.6, 1.6] },
    { type: 'red-butterfly', pos: [-4.85, 0.75, 3.45], rot: [0, -0.2, 0], scale: [1.35, 1.35, 1.35] },
    { type: 'red-butterfly', pos: [-4.3, 0.6, 2.75], rot: [0, 0.5, 0], scale: [1.45, 1.45, 1.45] },
    { type: 'flower', pos: [4.7, 0, 4.7], scale: [1.5, 1.5, 1.5] },
    { type: 'flower', pos: [5.4, 0, 4.1], scale: [1.6, 1.6, 1.6] },
    { type: 'flower', pos: [6.0, 0, 4.9], scale: [1.4, 1.4, 1.4] },
    { type: 'blue-butterfly', pos: [4.65, 0.75, 4.65], rot: [0, -0.2, 0], scale: [1.45, 1.45, 1.45] },
    { type: 'blue-butterfly', pos: [5.35, 0.55, 4.0], rot: [0, 0.35, 0], scale: [1.55, 1.55, 1.55] },
    { type: 'blue-butterfly', pos: [6.05, 0.7, 4.9], rot: [0, -0.45, 0], scale: [1.35, 1.35, 1.35] },
    { type: 'blue-butterfly', pos: [5.65, 0.95, 4.55], rot: [0, 0.15, 0], scale: [1.25, 1.25, 1.25] },
  ],

  'library-echoes': [
    { type: 'bookshelf', pos: [-4, 0, -4] },
    { type: 'bookshelf', pos: [-2, 0, -4] },
    { type: 'bookshelf', pos: [0, 0, -4] },
    { type: 'bookshelf', pos: [2, 0, -4] },
    { type: 'bookshelf', pos: [4, 0, -4] },
    { type: 'readingDesk', pos: [0, 0, -1] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'candle', pos: [0, 0.75, -1], scale: [1.5, 1.5, 1.5] },
    { type: 'candle', pos: [-3, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [3, 0, -2], scale: [2, 2, 2] },
    { type: 'scrollRack', pos: [5, 0, -2] },
    { type: 'ladder', pos: [-5, 0, -3.5] },
  ],

  'ancient-ruins': [
    { type: 'ruinedWall', pos: [-3, 0, -4] },
    { type: 'ruinedWall', pos: [3, 0, -5], rot: [0, 0.4, 0] },
    { type: 'obelisk', pos: [0, 0, -3] },
    { type: 'brokenPillar', pos: [-5, 0, -2] },
    { type: 'brokenPillar', pos: [5, 0, -1] },
    { type: 'brokenPillar', pos: [-2, 0, 0] },
    { type: 'rock', pos: [2, 0, -1] },
    { type: 'rock', pos: [-4, 0, 1] },
    { type: 'bush', pos: [4, 0, 0] },
  ],

  'trading-post': [
    { type: 'marketStall', pos: [-3, 0, -3] },
    { type: 'marketStall', pos: [3, 0, -3] },
    { type: 'barrel', pos: [-5, 0, -1] },
    { type: 'barrel', pos: [-4.5, 0, -0.5] },
    { type: 'crate', pos: [5, 0, -1] },
    { type: 'crate', pos: [5.5, 0, 0] },
    { type: 'scales', pos: [0, 0.8, -3] },
    { type: 'lantern', pos: [-3, 1.8, -3] },
    { type: 'lantern', pos: [3, 1.8, -3] },
    { type: 'wagon', pos: [6, 0, 3] },
    { type: 'signpost', pos: [0, 0, 1] },
  ],

  'storm-tower': [
    { type: 'teslaCoil', pos: [0, 0, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'teslaCoil', pos: [-3, 0, -1] },
    { type: 'lightningRod', pos: [3, 0, -4] },
    { type: 'windVane', pos: [-4, 0, -3] },
    { type: 'consolePanel', pos: [2, 0, -2] },
    { type: 'terminal', pos: [-2, 0, -1] },
    { type: 'barrel', pos: [5, 0, 0] },
  ],

  'code-forge': [
    { type: 'terminal', pos: [0, 0, -2] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'terminal', pos: [3, 0, -2] },
    { type: 'serverRack', pos: [-5, 0, -4] },
    { type: 'serverRack', pos: [5, 0, -4] },
    { type: 'hologramDisplay', pos: [0, 0, -4] },
    { type: 'dataNode', pos: [-2, 0, 0], scale: [0.8, 0.8, 0.8] },
    { type: 'dataNode', pos: [2, 0, 0], scale: [0.8, 0.8, 0.8] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'chair', pos: [-3, 0, -1] },
    { type: 'chair', pos: [3, 0, -1] },
  ],

  'space-station': [
    { type: 'consolePanel', pos: [0, 0, -3] },
    { type: 'viewport', pos: [0, 0, -5] },
    { type: 'airlock', pos: [-5, 0, 0], rot: [0, Math.PI / 2, 0] },
    { type: 'serverRack', pos: [4, 0, -4] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'chair', pos: [0, 0, -2] },
    { type: 'hologramDisplay', pos: [3, 0, -1] },
  ],

  'arena': [
    { type: 'gameBoard', pos: [0, 0, -2] },
    { type: 'torch', pos: [-4, 0, -3] },
    { type: 'torch', pos: [4, 0, -3] },
    { type: 'torch', pos: [-4, 0, 2] },
    { type: 'torch', pos: [4, 0, 2] },
    { type: 'banner', pos: [-6, 0, -4] },
    { type: 'banner', pos: [6, 0, -4] },
    { type: 'chair', pos: [-1, 0, -1] },
    { type: 'chair', pos: [1, 0, -1] },
    { type: 'rock', pos: [-6, 0, 0], scale: [2, 2, 2] },
    { type: 'rock', pos: [6, 0, 0], scale: [2, 2, 2] },
  ],

  'music-hall': [
    { type: 'piano', pos: [0, 0, -3] },
    { type: 'drum', pos: [3, 0, -2] },
    { type: 'drum', pos: [3.5, 0, -2.5], scale: [0.8, 0.8, 0.8] },
    { type: 'musicStand', pos: [-2, 0, -2] },
    { type: 'musicStand', pos: [-3, 0, -1] },
    { type: 'chair', pos: [-2, 0, -1] },
    { type: 'chair', pos: [-3, 0, 0] },
    { type: 'lantern', pos: [-4, 1.5, -3] },
    { type: 'lantern', pos: [4, 1.5, -3] },
    { type: 'banner', pos: [-5, 0, -4] },
    { type: 'banner', pos: [5, 0, -4] },
  ],

  'hospital': [
    { type: 'hospitalBed', pos: [-3, 0, -2] },
    { type: 'hospitalBed', pos: [3, 0, -2] },
    { type: 'medicalCabinet', pos: [0, 0, -4] },
    { type: 'microscope', pos: [0, 0.82, -3.8] },
    { type: 'table', pos: [0, 0, -1] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'medicalCabinet', pos: [-5, 0, -3] },
  ],

  'farm': [
    { type: 'barn', pos: [0, 0, -8], scale: [1.45, 1.25, 1.35] },
    { type: 'stonePath', pos: [0, 0.02, -2.5], scale: [1.4, 1, 1.4] },
    { type: 'stonePath', pos: [0, 0.02, -4.5], scale: [1.4, 1, 1.4] },
    { type: 'fenceGate', pos: [0, 0, -1.8] },
    { type: 'fence', pos: [-4.5, 0, -2], rot: [0, 0.1, 0] },
    { type: 'fence', pos: [-3.2, 0, -2] },
    { type: 'fence', pos: [-1.8, 0, -2] },
    { type: 'fence', pos: [1.8, 0, -2] },
    { type: 'fence', pos: [3.2, 0, -2] },
    { type: 'fence', pos: [4.5, 0, -2], rot: [0, -0.1, 0] },
    { type: 'cropDirt', pos: [2, 0, 0] },
    { type: 'cropDirt', pos: [3.4, 0, 0] },
    { type: 'cropDirt', pos: [4.8, 0, 0] },
    { type: 'cropRow', pos: [2, 0, 0.45] },
    { type: 'cropRow', pos: [3.4, 0, 0.45] },
    { type: 'cropRow', pos: [4.8, 0, 0.45] },
    { type: 'corn', pos: [2.1, 0, 2.0] },
    { type: 'corn', pos: [3.5, 0, 2.0] },
    { type: 'corn', pos: [4.9, 0, 2.0] },
    { type: 'carrot', pos: [2.3, 0, 3.4] },
    { type: 'carrot', pos: [3.6, 0, 3.4] },
    { type: 'carrot', pos: [4.9, 0, 3.4] },
    { type: 'wheelbarrow', pos: [-4.5, 0, 0], rot: [0, 0.35, 0] },
    { type: 'scarecrow', pos: [4.7, 0, -3.8], scale: [1.3, 1.3, 1.3] },
    { type: 'wellBucket', pos: [-5.2, 0, -3.7] },
    { type: 'barrel', pos: [-3.2, 0, -4.1] },
    { type: 'crate', pos: [-4.2, 0, -4.3], rot: [0, -0.3, 0] },
    { type: 'tree', pos: [7.0, 0, -5.2], scale: [1.25, 1.25, 1.25] },
    { type: 'treePine', pos: [-7.0, 0, -4.7], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [6.5, 0, -1.2] },
    { type: 'grass', pos: [-6.2, 0, 1.2] },
    { type: 'flower', pos: [-5.7, 0, 2.1] },
  ],

  'laboratory': [
    { type: 'labBench', pos: [0, 0, -3] },
    { type: 'labBench', pos: [-4, 0, -3] },
    { type: 'beaker', pos: [0, 0.9, -3] },
    { type: 'beaker', pos: [0.3, 0.9, -3.1] },
    { type: 'bunsenBurner', pos: [-0.5, 0.9, -3] },
    { type: 'microscope', pos: [-4, 0.9, -3] },
    { type: 'medicalCabinet', pos: [4, 0, -4] },
    { type: 'chair', pos: [0, 0, -2] },
    { type: 'chair', pos: [-4, 0, -2] },
    { type: 'whiteboard', pos: [0, 0, -4.5], rot: [0, 0, 0] },
  ],

  'explorers-map': [
    { type: 'globe', pos: [0, 0, -2], scale: [2, 2, 2] },
    { type: 'compass', pos: [0, 0.75, -2], scale: [3, 3, 3] },
    { type: 'signpost', pos: [3, 0, 0] },
    { type: 'signpost', pos: [-3, 0, 0] },
    { type: 'chest', pos: [5, 0, -3] },
    { type: 'barrel', pos: [-5, 0, -2] },
    { type: 'readingDesk', pos: [-2, 0, -3] },
    { type: 'candle', pos: [-2, 0.75, -3] },
    { type: 'tree', pos: [6, 0, -5] },
    { type: 'rock', pos: [-6, 0, 2] },
  ],

  'time-rift': [
    { type: 'hourglass', pos: [0, 0, -2], scale: [3, 3, 3] },
    { type: 'timeCrystal', pos: [-3, 0, -3] },
    { type: 'timeCrystal', pos: [3, 0, -3] },
    { type: 'timeCrystal', pos: [-1, 0, -5] },
    { type: 'timeCrystal', pos: [1, 0, -5] },
    { type: 'ancientClock', pos: [-4, 0, -1] },
    { type: 'ancientClock', pos: [4, 0, -1] },
    { type: 'brokenPillar', pos: [-5, 0, 1] },
    { type: 'brokenPillar', pos: [5, 0, 1] },
  ],

  'healers-sanctuary': [
    { type: 'healingFountain', pos: [0, 0, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'herbGarden', pos: [-3, 0, -1] },
    { type: 'herbGarden', pos: [3, 0, -1] },
    { type: 'mortar', pos: [-2, 0.75, -3] },
    { type: 'potionBottle', pos: [2, 0.9, -3] },
    { type: 'bookshelf', pos: [-5, 0, -4] },
    { type: 'candle', pos: [-1, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [1, 0, -2], scale: [2, 2, 2] },
    { type: 'bush', pos: [5, 0, 0] },
    { type: 'flower', pos: [-4, 0, 0] },
    { type: 'flower', pos: [-3.5, 0, 0.3] },
  ],

  'architects-domain': [
    { type: 'draftingTable', pos: [0, 0, -2] },
    { type: 'column', pos: [-4, 0, -4] },
    { type: 'column', pos: [4, 0, -4] },
    { type: 'column', pos: [-4, 0, 2] },
    { type: 'column', pos: [4, 0, 2] },
    { type: 'compassRose', pos: [0, 0.85, -2] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'bookshelf', pos: [-5, 0, -2] },
    { type: 'statue', pos: [5, 0, -2] },
  ],

  'shipyard': [
    { type: 'anchor', pos: [3, 0, -1] },
    { type: 'sailPost', pos: [0, 0, -4] },
    { type: 'barrel', pos: [-3, 0, -2] },
    { type: 'barrel', pos: [-3.5, 0, -1.5] },
    { type: 'crate', pos: [-4, 0, -3] },
    { type: 'crate', pos: [5, 0, 0] },
    { type: 'chest', pos: [4, 0, -3] },
    { type: 'lantern', pos: [-2, 1.5, -4] },
    { type: 'ladder', pos: [0, 0, -2] },
  ],

  'digital-world': [
    { type: 'dataNode', pos: [0, 0, -3] },
    { type: 'dataNode', pos: [-3, 0, -2] },
    { type: 'dataNode', pos: [3, 0, -2] },
    { type: 'networkHub', pos: [0, 0, -1] },
    { type: 'terminal', pos: [-5, 0, -4] },
    { type: 'terminal', pos: [5, 0, -4] },
    { type: 'serverRack', pos: [-2, 0, -5] },
    { type: 'serverRack', pos: [2, 0, -5] },
    { type: 'hologramDisplay', pos: [0, 0, -5] },
  ],

  'debate-hall': [
    { type: 'podium', pos: [0, 0, -4] },
    { type: 'lectern', pos: [-3, 0, -3] },
    { type: 'lectern', pos: [3, 0, -3] },
    { type: 'chair', pos: [-2, 0, -1] },
    { type: 'chair', pos: [-1, 0, -1] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'chair', pos: [1, 0, -1] },
    { type: 'chair', pos: [2, 0, -1] },
    { type: 'banner', pos: [-5, 0, -4] },
    { type: 'banner', pos: [5, 0, -4] },
    { type: 'candle', pos: [-4, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [4, 0, -2], scale: [2, 2, 2] },
  ],

  'gallery': [
    { type: 'easel', pos: [-3, 0, -2] },
    { type: 'easel', pos: [3, 0, -2] },
    { type: 'statue', pos: [0, 0, -4] },
    { type: 'paintingFrame', pos: [-5, 0, -4.5] },
    { type: 'paintingFrame', pos: [-3, 0, -4.5] },
    { type: 'paintingFrame', pos: [3, 0, -4.5] },
    { type: 'paintingFrame', pos: [5, 0, -4.5] },
    { type: 'bench', pos: [0, 0, -1] },
    { type: 'lantern', pos: [-4, 1.5, -3] },
    { type: 'lantern', pos: [4, 1.5, -3] },
  ],

  'newsroom': [
    { type: 'printingPress', pos: [0, 0, -4] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'terminal', pos: [3, 0, -2] },
    { type: 'chair', pos: [-3, 0, -1] },
    { type: 'chair', pos: [3, 0, -1] },
    { type: 'camera', pos: [0, 1.2, -1] },
    { type: 'table', pos: [0, 0, -2] },
    { type: 'bookshelf', pos: [-5, 0, -4] },
  ],

  'theater': [
    { type: 'curtain', pos: [0, 0, -5] },
    { type: 'stageFloor', pos: [0, 0, -3] },
    { type: 'spotlight', pos: [-2, 3, -3] },
    { type: 'spotlight', pos: [2, 3, -3] },
    { type: 'chair', pos: [-2, 0, 0] },
    { type: 'chair', pos: [-1, 0, 0] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'chair', pos: [1, 0, 0] },
    { type: 'chair', pos: [2, 0, 0] },
    { type: 'chair', pos: [-2, 0, 1] },
    { type: 'chair', pos: [-1, 0, 1] },
    { type: 'chair', pos: [0, 0, 1] },
    { type: 'chair', pos: [1, 0, 1] },
    { type: 'chair', pos: [2, 0, 1] },
    { type: 'lantern', pos: [-5, 1.5, -3] },
    { type: 'lantern', pos: [5, 1.5, -3] },
  ],

  'marketplace': [
    { type: 'marketStall', pos: [-4, 0, -3] },
    { type: 'marketStall', pos: [0, 0, -3] },
    { type: 'marketStall', pos: [4, 0, -3] },
    { type: 'coinPile', pos: [0, 0.88, -3] },
    { type: 'wagon', pos: [-6, 0, 1] },
    { type: 'barrel', pos: [6, 0, 0] },
    { type: 'barrel', pos: [5.5, 0, 0.5] },
    { type: 'crate', pos: [-5, 0, -1] },
    { type: 'lantern', pos: [-4, 1.8, -3] },
    { type: 'lantern', pos: [0, 1.8, -3] },
    { type: 'lantern', pos: [4, 1.8, -3] },
    { type: 'signpost', pos: [0, 0, 2] },
  ],
};
