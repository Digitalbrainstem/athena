import * as THREE from 'three';
import type { SceneObject, Vec3 } from '../types.js';
import type { Disposable } from '../types.js';
import type { AssetManager } from '../assets/asset-manager.js';

const DEFAULT_COLOR = '#888888';
const DEFAULT_TIER = 'foundation' as const;

function colorToHex(color: string | undefined): number {
  if (!color) return 0x888888;
  if (color.startsWith('#')) return parseInt(color.slice(1), 16);
  return parseInt(color, 16);
}

export class ObjectFactory implements Disposable {
  private readonly geometryCache = new Map<string, THREE.BufferGeometry>();
  private readonly materialCache = new Map<string, THREE.MeshStandardMaterial>();
  private readonly highlightMaterialCache = new Map<string, THREE.MeshStandardMaterial>();

  /**
   * Optional AssetManager reference — when set, meshType 'model' objects are
   * resolved to procedural models instead of falling back to a box.
   */
  private assetManager: AssetManager | null = null;

  /** Cached authored/procedural group objects keyed by entityId. */
  private readonly proceduralGroups = new Map<number, THREE.Group>();
  private readonly groupModelIds = new Map<number, string>();

  setAssetManager(manager: AssetManager): void {
    this.assetManager = manager;
  }

  getGeometry(meshType: string, scale: Vec3): THREE.BufferGeometry {
    const key = `${meshType}:${scale.x}:${scale.y}:${scale.z}`;
    let geom = this.geometryCache.get(key);
    if (geom) return geom;

    switch (meshType) {
      case 'box':
        geom = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
        break;
      case 'sphere':
        geom = new THREE.SphereGeometry(Math.max(scale.x, scale.y, scale.z) / 2, 16, 16);
        break;
      case 'cylinder':
        geom = new THREE.CylinderGeometry(scale.x / 2, scale.x / 2, scale.y, 16);
        break;
      case 'plane':
        geom = new THREE.PlaneGeometry(scale.x, scale.y);
        break;
      default:
        geom = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
        break;
    }

    this.geometryCache.set(key, geom);
    return geom;
  }

  getMaterial(color: string | undefined, materialHint?: string): THREE.MeshStandardMaterial {
    // When an AssetManager is available, try using its preset material library
    if (this.assetManager && materialHint && materialHint !== 'standard') {
      const presetMat = this.assetManager.getMaterial(materialHint);
      if (presetMat) return presetMat;
    }

    const c = color ?? DEFAULT_COLOR;
    const key = `${c}:${materialHint ?? 'standard'}`;
    let mat = this.materialCache.get(key);
    if (mat) return mat;

    const roughness = materialHint === 'metal' ? 0.3 : 0.7;
    const metalness = materialHint === 'metal' ? 0.6 : 0.05;

    mat = new THREE.MeshStandardMaterial({
      color: colorToHex(c),
      roughness,
      metalness,
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getHighlightMaterial(color: string | undefined, materialHint?: string): THREE.MeshStandardMaterial {
    const c = color ?? DEFAULT_COLOR;
    const key = `${c}:${materialHint ?? 'standard'}`;
    let mat = this.highlightMaterialCache.get(key);
    if (mat) return mat;

    const baseMat = this.getMaterial(color, materialHint);
    mat = baseMat.clone();
    mat.emissive = new THREE.Color(0x22d3ee);
    mat.emissiveIntensity = 0.3;
    this.highlightMaterialCache.set(key, mat);
    return mat;
  }

  /**
   * Create a Three.js object for a SceneObject. Returns a Mesh for primitive
   * types (box/sphere/cylinder/plane). For objects with a modelId that the
   * AssetManager recognises, returns a procedural Group regardless of meshType.
   */
  createMesh(obj: SceneObject): THREE.Mesh {
    const { renderable, position, rotation } = obj;

    // Attempt real GLB model resolution first, then procedural model fallback.
    if (renderable.modelId && this.assetManager) {
      if (this.assetManager.hasAuthoredModel(renderable.modelId)) {
        const group = this.assetManager.getAuthoredModel(renderable.modelId);
        if (group) {
          this.configureGroup(group, obj);
          this.proceduralGroups.set(obj.entityId, group);
          this.groupModelIds.set(obj.entityId, renderable.modelId);
          return this.createHiddenPlaceholder(obj);
        }
      }

      if (this.assetManager.hasModel(renderable.modelId)) {
        const group = this.assetManager.getModel(renderable.modelId, DEFAULT_TIER);
        this.configureGroup(group, obj);
        this.proceduralGroups.set(obj.entityId, group);
        this.groupModelIds.set(obj.entityId, renderable.modelId);
        return this.createHiddenPlaceholder(obj);
      }
    }

    const geom = this.getGeometry(renderable.meshType, renderable.scale);
    const mat = obj.highlight
      ? this.getHighlightMaterial(renderable.color, renderable.material)
      : this.getMaterial(renderable.color, renderable.material);

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.visible = renderable.visible;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /** Get a cached procedural group for an entity, if one was created. */
  getProceduralGroup(entityId: number): THREE.Group | undefined {
    return this.proceduralGroups.get(entityId);
  }

  shouldRecreateObject(obj: SceneObject): boolean {
    const currentGroupModelId = this.groupModelIds.get(obj.entityId);
    if (currentGroupModelId !== undefined) {
      return currentGroupModelId !== (obj.renderable.modelId ?? '');
    }
    return Boolean(
      obj.renderable.modelId
        && this.assetManager
        && (this.assetManager.hasAuthoredModel(obj.renderable.modelId)
          || this.assetManager.hasModel(obj.renderable.modelId)),
    );
  }

  updateMesh(mesh: THREE.Mesh, obj: SceneObject): void {
    const { renderable, position, rotation } = obj;

    // For procedural group objects, update the group directly
    const group = this.proceduralGroups.get(obj.entityId);
    if (group) {
      this.configureGroup(group, obj);
      return;
    }

    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.visible = renderable.visible;

    const expectedGeom = this.getGeometry(renderable.meshType, renderable.scale);
    if (mesh.geometry !== expectedGeom) {
      mesh.geometry = expectedGeom;
    }

    const expectedMat = obj.highlight
      ? this.getHighlightMaterial(renderable.color, renderable.material)
      : this.getMaterial(renderable.color, renderable.material);
    if (mesh.material !== expectedMat) {
      mesh.material = expectedMat;
    }
  }

  /** Remove a procedural group from internal cache (called on entity removal). */
  removeProceduralGroup(entityId: number): THREE.Group | undefined {
    const group = this.proceduralGroups.get(entityId);
    if (group) {
      this.proceduralGroups.delete(entityId);
      this.groupModelIds.delete(entityId);
    }
    return group;
  }

  dispose(): void {
    for (const geom of this.geometryCache.values()) geom.dispose();
    this.geometryCache.clear();
    for (const mat of this.materialCache.values()) mat.dispose();
    this.materialCache.clear();
    for (const mat of this.highlightMaterialCache.values()) mat.dispose();
    this.highlightMaterialCache.clear();
    this.proceduralGroups.clear();
    this.groupModelIds.clear();
  }

  private createHiddenPlaceholder(obj: SceneObject): THREE.Mesh {
    const placeholder = new THREE.Mesh(
      this.getGeometry('box', { x: 0.01, y: 0.01, z: 0.01 }),
      this.getMaterial(obj.renderable.color, obj.renderable.material),
    );
    placeholder.visible = false;
    placeholder.userData.proceduralEntityId = obj.entityId;
    return placeholder;
  }

  private configureGroup(group: THREE.Group, obj: SceneObject): void {
    const { renderable, position, rotation } = obj;
    group.position.set(position.x, position.y, position.z);
    group.rotation.set(rotation.x, rotation.y, rotation.z);
    const baseScale = group.userData.baseScale instanceof THREE.Vector3
      ? group.userData.baseScale
      : new THREE.Vector3(1, 1, 1);
    const shouldApplySceneScale = group.userData.authoredWorldModel === true;
    group.scale.set(
      baseScale.x * (shouldApplySceneScale ? renderable.scale.x : 1),
      baseScale.y * (shouldApplySceneScale ? renderable.scale.y : 1),
      baseScale.z * (shouldApplySceneScale ? renderable.scale.z : 1),
    );
    group.visible = renderable.visible;
    this.applyGroupHighlight(group, obj.highlight);
  }

  private applyGroupHighlight(group: THREE.Group, highlighted: boolean): void {
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if (!(mat instanceof THREE.MeshStandardMaterial) && !(mat instanceof THREE.MeshPhysicalMaterial)) continue;
        const data = mat.userData as {
          originalEmissive?: number;
          originalEmissiveIntensity?: number;
        };
        if (data.originalEmissive === undefined) {
          data.originalEmissive = mat.emissive.getHex();
          data.originalEmissiveIntensity = mat.emissiveIntensity;
        }
        if (highlighted) {
          mat.emissive.setHex(0x22d3ee);
          mat.emissiveIntensity = Math.max(data.originalEmissiveIntensity ?? 0, 0.28);
        } else {
          mat.emissive.setHex(data.originalEmissive);
          mat.emissiveIntensity = data.originalEmissiveIntensity ?? 0;
        }
      }
    });
  }
}
