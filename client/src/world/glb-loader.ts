import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ---------------------------------------------------------------------------
// GLB Model Loader — loads untextured GLB models and applies materials
// ---------------------------------------------------------------------------

const loader = new GLTFLoader();

/** Material color categories for untextured models */
export type ModelCategory =
  | 'wood'
  | 'metal'
  | 'stone'
  | 'tree'
  | 'bush'
  | 'grass'
  | 'chest'
  | 'lantern'
  | 'default';

const CATEGORY_MATERIALS: Record<ModelCategory, { color: number; roughness: number; metalness: number; emissive?: number; emissiveIntensity?: number }> = {
  wood:    { color: 0x8b6914, roughness: 0.85, metalness: 0.05 },
  metal:   { color: 0x505050, roughness: 0.4,  metalness: 0.7 },
  stone:   { color: 0x999999, roughness: 0.9,  metalness: 0.05 },
  tree:    { color: 0x228b22, roughness: 0.8,  metalness: 0.0 },
  bush:    { color: 0x2ecc71, roughness: 0.85, metalness: 0.0 },
  grass:   { color: 0x4a7c3f, roughness: 0.9,  metalness: 0.0 },
  chest:   { color: 0x8b6914, roughness: 0.7,  metalness: 0.15 },
  lantern: { color: 0x708090, roughness: 0.5,  metalness: 0.3, emissive: 0xffd700, emissiveIntensity: 0.4 },
  default: { color: 0x9e7e4e, roughness: 0.75, metalness: 0.1 },
};

/** Infer material category from a model file name */
export function inferCategory(fileName: string): ModelCategory {
  const lower = fileName.toLowerCase();
  if (lower.includes('tree'))    return 'tree';
  if (lower.includes('bush') || lower.includes('flower')) return 'bush';
  if (lower.includes('grass'))   return 'grass';
  if (lower.includes('rock') || lower.includes('stone') || lower.includes('well')) return 'stone';
  if (lower.includes('anvil') || lower.includes('forge') || lower.includes('lantern')) return 'metal';
  if (lower.includes('chest'))   return 'chest';
  if (lower.includes('lantern')) return 'lantern';
  if (lower.includes('wood') || lower.includes('fence') || lower.includes('barrel') ||
      lower.includes('crate') || lower.includes('workbench') || lower.includes('toolrack') ||
      lower.includes('cottage') || lower.includes('market') || lower.includes('signpost') ||
      lower.includes('bridge')) return 'wood';
  return 'default';
}

function createMaterial(category: ModelCategory): THREE.MeshStandardMaterial {
  const cfg = CATEGORY_MATERIALS[category];
  return new THREE.MeshStandardMaterial({
    color: cfg.color,
    roughness: cfg.roughness,
    metalness: cfg.metalness,
    emissive: cfg.emissive ?? 0x000000,
    emissiveIntensity: cfg.emissiveIntensity ?? 0,
    flatShading: false,
  });
}

/**
 * Special case: trees get a brown trunk + green canopy.
 * We apply brown to the lower half geometry and green to the upper.
 * Since we can't easily separate, we apply green (canopy) to the whole model
 * and add a small brown cylinder for the trunk feel.
 */

export interface LoadedModel {
  group: THREE.Group;
  dispose: () => void;
}

const modelCache = new Map<string, THREE.Group>();

/**
 * Load a GLB model from the given path, compute normals, and apply a
 * default material based on the inferred category.
 */
export async function loadGLB(
  path: string,
  category?: ModelCategory,
  scale?: number,
): Promise<LoadedModel> {
  const cat = category ?? inferCategory(path);
  const cacheKey = `${path}:${cat}:${scale ?? 1}`;

  const cached = modelCache.get(cacheKey);
  if (cached) {
    const clone = cached.clone();
    return { group: clone, dispose: () => disposeGroup(clone) };
  }

  return new Promise((resolve) => {
    loader.load(
      path,
      (gltf) => {
        const group = new THREE.Group();
        const material = createMaterial(cat);
        const s = scale ?? 1;

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Compute normals for untextured models
            if (mesh.geometry) {
              mesh.geometry.computeVertexNormals();
            }
            // Apply our default material
            mesh.material = material;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        gltf.scene.scale.set(s, s, s);
        group.add(gltf.scene);
        group.name = path.split('/').pop()?.replace('.glb', '') ?? 'model';

        modelCache.set(cacheKey, group.clone());
        resolve({ group, dispose: () => disposeGroup(group) });
      },
      undefined,
      (error) => {
        console.warn(`[GLB] Failed to load ${path}:`, error);
        // Return a fallback box so the scene isn't broken
        const fallback = new THREE.Group();
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          createMaterial(cat),
        );
        box.position.y = 0.5;
        fallback.add(box);
        fallback.name = 'glb-fallback';
        resolve({ group: fallback, dispose: () => disposeGroup(fallback) });
      },
    );
  });
}

/** Load a GLB synchronously from cache, or return null if not cached. */
export function loadGLBCached(path: string, category?: ModelCategory, scale?: number): THREE.Group | null {
  const cat = category ?? inferCategory(path);
  const cacheKey = `${path}:${cat}:${scale ?? 1}`;
  const cached = modelCache.get(cacheKey);
  return cached ? cached.clone() : null;
}

/** Pre-load a batch of GLB models (call at startup). */
export async function preloadGLBs(
  models: { path: string; category?: ModelCategory; scale?: number }[],
): Promise<void> {
  await Promise.all(models.map(m => loadGLB(m.path, m.category, m.scale)));
}

function disposeGroup(group: THREE.Group): void {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose();
      }
    }
  });
}

export function clearModelCache(): void {
  for (const group of modelCache.values()) {
    disposeGroup(group);
  }
  modelCache.clear();
}
