import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import { MaterialLibrary, BIOME_PALETTES } from './materials.js';
import { ProceduralModelGenerator } from './procedural-models.js';

// ---------------------------------------------------------------------------
// BiomeEnvironmentGenerator — produces a full 3D environment for each biome
// ---------------------------------------------------------------------------

export interface BiomeEnvironmentConfig {
  /** Reduce decorations for lower-end devices */
  reducedDetail?: boolean;
  /** Skip animated decorations (accessibility: reduced motion) */
  reducedMotion?: boolean;
}

interface PropPlacement {
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
        const model = this.models.generate(prop.type, tier);
        model.name = `${biomeId}:${prop.type}:${i}`;
        model.userData.biomePropType = prop.type;
        model.userData.biomePropIndex = i;
        model.position.set(...prop.pos);
        if (prop.rot) model.rotation.set(...prop.rot);
        if (prop.scale) model.scale.set(...prop.scale);
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
    { type: 'tree', pos: [-4, 0, -5] },
    { type: 'tree', pos: [3, 0, -6] },
    { type: 'treePine', pos: [-6, 0, -3] },
    { type: 'treePine', pos: [6, 0, -4] },
    { type: 'bush', pos: [-2, 0, -2] },
    { type: 'bush', pos: [2, 0, -1] },
    { type: 'mushroom', pos: [1, 0, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'mushroom', pos: [-1, 0, -4] },
    { type: 'flower', pos: [0, 0, -1] },
    { type: 'flower', pos: [1, 0, 0] },
    { type: 'pond', pos: [3, 0, 2] },
    { type: 'rock', pos: [-3, 0, 1] },
    { type: 'log', pos: [-1, 0, 1] },
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
    { type: 'barn', pos: [0, 0, -6] },
    { type: 'fence', pos: [-3, 0, -2] },
    { type: 'fence', pos: [-2, 0, -2] },
    { type: 'fence', pos: [-1, 0, -2] },
    { type: 'fence', pos: [0, 0, -2] },
    { type: 'cropRow', pos: [2, 0, 0] },
    { type: 'cropRow', pos: [3, 0, 0] },
    { type: 'cropRow', pos: [4, 0, 0] },
    { type: 'wheelbarrow', pos: [-4, 0, 0] },
    { type: 'scarecrow', pos: [3, 0, -3] },
    { type: 'wellBucket', pos: [-5, 0, -3] },
    { type: 'tree', pos: [6, 0, -4] },
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
