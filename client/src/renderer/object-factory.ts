import * as THREE from 'three';
import type { SceneObject, Vec3 } from '../types.js';
import type { Disposable } from '../types.js';

const DEFAULT_COLOR = '#888888';

function colorToHex(color: string | undefined): number {
  if (!color) return 0x888888;
  if (color.startsWith('#')) return parseInt(color.slice(1), 16);
  return parseInt(color, 16);
}

export class ObjectFactory implements Disposable {
  private readonly geometryCache = new Map<string, THREE.BufferGeometry>();
  private readonly materialCache = new Map<string, THREE.MeshStandardMaterial>();
  private readonly highlightMaterialCache = new Map<string, THREE.MeshStandardMaterial>();

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

  createMesh(obj: SceneObject): THREE.Mesh {
    const { renderable, position, rotation } = obj;
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

  updateMesh(mesh: THREE.Mesh, obj: SceneObject): void {
    const { renderable, position, rotation } = obj;
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

  dispose(): void {
    for (const geom of this.geometryCache.values()) geom.dispose();
    this.geometryCache.clear();
    for (const mat of this.materialCache.values()) mat.dispose();
    this.materialCache.clear();
    for (const mat of this.highlightMaterialCache.values()) mat.dispose();
    this.highlightMaterialCache.clear();
  }
}
