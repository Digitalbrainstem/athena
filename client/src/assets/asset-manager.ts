import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import type { Vec3 } from '@nexus-academy/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Disposable } from '../types.js';
import { MaterialLibrary, type BiomePalette } from './materials.js';
import { ProceduralModelGenerator, hasGenerator } from './procedural-models.js';
import { BiomeEnvironmentGenerator, type BiomeEnvironmentConfig } from './biome-environments.js';
import { CompanionModelGenerator, type CompanionModel } from './companion-models.js';
import { getCompanion } from '../core/registry.js';
import {
  hasWorldModel,
  loadCachedWorldModel,
  preloadWorldModels,
} from './world-models.js';

// ---------------------------------------------------------------------------
// AssetManager — top-level entry point for the entire asset system
// ---------------------------------------------------------------------------

const USE_AUTHORED_COMPANION_MODELS = false;

export class AssetManager implements Disposable {
  readonly materials: MaterialLibrary;
  readonly models: ProceduralModelGenerator;
  readonly biomes: BiomeEnvironmentGenerator;
  readonly companions: CompanionModelGenerator;

  private readonly gltfLoader = new GLTFLoader();
  private readonly modelCache = new Map<string, THREE.Group>();
  private readonly biomeCache = new Map<string, THREE.Group>();
  private readonly companionCache = new Map<string, THREE.Group>();
  private disposed = false;

  constructor() {
    this.materials = new MaterialLibrary();
    this.models = new ProceduralModelGenerator(this.materials);
    this.biomes = new BiomeEnvironmentGenerator(this.materials, this.models);
    this.companions = new CompanionModelGenerator(this.materials, this.models);
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
    return hasGenerator(objectType);
  }

  hasAuthoredModel(objectType: string): boolean {
    return hasWorldModel(objectType);
  }

  getAuthoredModel(objectType: string): THREE.Group | null {
    return loadCachedWorldModel(objectType);
  }

  async preloadAuthoredModels(modelIds?: string[]): Promise<void> {
    await preloadWorldModels(modelIds);
  }

  // ---- Companion models --------------------------------------------------

  /** Get (or generate & cache) a companion model for a type + tier. */
  getCompanionModel(companionType: string, tier: MasteryTier): CompanionModel {
    const key = `companion:${companionType}:${tier}`;
    let group = this.companionCache.get(key);
    if (!group) {
      const model = this.companions.generate(companionType, tier);
      group = model.group;
      this.companionCache.set(key, group);
      // Return the original on first call
      return model;
    }
    // For cached hits, generate a fresh model (new animation state + materials)
    return this.companions.generate(companionType, tier);
  }

  /** Load the authored companion GLB from the registry, falling back to procedural geometry. */
  async loadCompanionModel(companionType: string, tier: MasteryTier): Promise<CompanionModel> {
    if (!USE_AUTHORED_COMPANION_MODELS) {
      return this.getCompanionModel(companionType, tier);
    }

    try {
      const companion = getCompanion(companionType);
      const gltf = await this.gltfLoader.loadAsync(companion.modelPath);
      if (this.disposed) return this.getCompanionModel(companionType, tier);

      const group = normalizeCompanionScene(companionType, tier, gltf.scene);
      return new RegistryCompanionModel(companionType, group);
    } catch (err) {
      console.warn(`[Assets] Failed to load companion GLB for "${companionType}", using procedural fallback:`, err);
      return this.getCompanionModel(companionType, tier);
    }
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

    for (const group of this.companionCache.values()) {
      disposeGroup(group);
    }
    this.companionCache.clear();

    this.companions.dispose();
    this.models.dispose();
    this.materials.dispose();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class RegistryCompanionModel implements CompanionModel {
  readonly type: string;
  readonly group: THREE.Group;

  private readonly baseScale: number;

  constructor(type: string, group: THREE.Group) {
    this.type = type;
    this.group = group;
    this.baseScale = group.scale.x;
  }

  idle(time: number): void {
    const breathe = 1 + Math.sin(time * 2.2) * 0.012;
    this.group.scale.setScalar(this.baseScale * breathe);
    this.group.rotation.z = Math.sin(time * 1.4) * 0.025;
  }

  speak(time: number): void {
    const pulse = 1 + Math.sin(time * 8) * 0.025;
    this.group.scale.setScalar(this.baseScale * pulse);
  }

  point(direction: Vec3): void {
    this.group.rotation.y = Math.atan2(direction.x, direction.z);
  }

  emote(emotion: string): void {
    if (emotion === 'excited' || emotion === 'encouraging') {
      this.group.scale.setScalar(this.baseScale * 1.04);
    }
  }

  dispose(): void {
    this.group.removeFromParent();
    disposeGroup(this.group);
  }
}

function normalizeCompanionScene(
  companionType: string,
  tier: MasteryTier,
  scene: THREE.Group,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `companion:${companionType}`;

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const targetHeight = tier === 'foundation' ? 0.85 : 1.0;
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  scene.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(scene);
  const center = scaledBox.getCenter(new THREE.Vector3());
  scene.position.sub(center);

  group.add(scene);
  group.userData.companionType = companionType;
  group.userData.tier = tier;
  return group;
}

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
