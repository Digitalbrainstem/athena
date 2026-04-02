import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import { MaterialLibrary, type BiomePalette } from './materials.js';
import { ProceduralModelGenerator, PROCEDURAL_OBJECT_TYPES } from './procedural-models.js';
import { BiomeEnvironmentGenerator, type BiomeEnvironmentConfig } from './biome-environments.js';

// ---------------------------------------------------------------------------
// AssetManager — top-level entry point for the entire asset system
// ---------------------------------------------------------------------------

export class AssetManager implements Disposable {
  readonly materials: MaterialLibrary;
  readonly models: ProceduralModelGenerator;
  readonly biomes: BiomeEnvironmentGenerator;

  private readonly modelCache = new Map<string, THREE.Group>();
  private readonly biomeCache = new Map<string, THREE.Group>();
  private disposed = false;

  constructor() {
    this.materials = new MaterialLibrary();
    this.models = new ProceduralModelGenerator(this.materials);
    this.biomes = new BiomeEnvironmentGenerator(this.materials, this.models);
  }

  // ---- Models -----------------------------------------------------------

  /** Get (or generate & cache) a procedural model for an object type + tier. */
  getModel(objectType: string, tier: MasteryTier): THREE.Group {
    const key = `${objectType}:${tier}`;
    let group = this.modelCache.get(key);
    if (group) return group.clone();
    group = this.models.generate(objectType, tier);
    this.modelCache.set(key, group);
    return group.clone();
  }

  /** Check if a model type is known (has a dedicated generator, not fallback). */
  hasModel(objectType: string): boolean {
    return PROCEDURAL_OBJECT_TYPES.includes(objectType);
  }

  // ---- Biome environments -----------------------------------------------

  /** Get (or generate & cache) a full biome environment. */
  getBiomeEnvironment(
    biomeId: string,
    tier: MasteryTier,
    config?: BiomeEnvironmentConfig,
  ): THREE.Group {
    const key = `${biomeId}:${tier}:${config?.reducedDetail ?? false}:${config?.reducedMotion ?? false}`;
    let group = this.biomeCache.get(key);
    if (group) return group.clone();
    group = this.biomes.generate(biomeId, tier, config);
    this.biomeCache.set(key, group);
    return group.clone();
  }

  // ---- Materials --------------------------------------------------------

  /** Get a material preset. */
  getMaterial(preset: string, tier?: MasteryTier): THREE.MeshStandardMaterial {
    return this.materials.get(preset, tier);
  }

  /** Get the biome color palette. */
  getBiomePalette(biomeId: string): BiomePalette | undefined {
    return this.materials.getBiomePalette(biomeId);
  }

  // ---- Lifecycle --------------------------------------------------------

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Dispose cached model groups (geometry + materials inside)
    for (const group of this.modelCache.values()) {
      disposeGroup(group);
    }
    this.modelCache.clear();

    for (const group of this.biomeCache.values()) {
      disposeGroup(group);
    }
    this.biomeCache.clear();

    this.models.dispose();
    this.materials.dispose();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function disposeGroup(group: THREE.Group): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Geometry may be shared via the ProceduralModelGenerator cache,
      // so we only dispose it from the generator's own dispose().
      const mat = child.material;
      if (Array.isArray(mat)) {
        for (const m of mat) m.dispose();
      } else {
        mat.dispose();
      }
    }
  });
}
