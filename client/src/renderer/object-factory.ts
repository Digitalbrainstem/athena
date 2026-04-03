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

  /** Cached procedural group objects keyed by entityId. */
  private readonly proceduralGroups = new Map<number, THREE.Group>();

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

    // Attempt procedural model resolution when a modelId is present
    if (renderable.modelId && this.assetManager) {
      if (this.assetManager.hasModel(renderable.modelId)) {
        const group = this.assetManager.getModel(renderable.modelId, DEFAULT_TIER);
        group.position.set(position.x, position.y, position.z);
        group.rotation.set(rotation.x, rotation.y, rotation.z);
        group.visible = renderable.visible;
        this.proceduralGroups.set(obj.entityId, group);
        const placeholder = new THREE.Mesh(
          this.getGeometry('box', { x: 0.01, y: 0.01, z: 0.01 }),
          this.getMaterial(renderable.color, renderable.material),
        );
        placeholder.visible = false;
        placeholder.userData.proceduralEntityId = obj.entityId;
        return placeholder;
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

  updateMesh(mesh: THREE.Mesh, obj: SceneObject): void {
    const { renderable, position, rotation } = obj;

    // For procedural group objects, update the group directly
    const group = this.proceduralGroups.get(obj.entityId);
    if (group) {
      group.position.set(position.x, position.y, position.z);
      group.rotation.set(rotation.x, rotation.y, rotation.z);
      group.visible = renderable.visible;

      // Toggle highlight glow on child meshes
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (obj.highlight) {
            child.material.emissive = child.material.emissive ?? new THREE.Color(0x000000);
            child.material.emissiveIntensity = Math.max(child.material.emissiveIntensity, 0.25);
          }
        }
      });
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
  }
}
