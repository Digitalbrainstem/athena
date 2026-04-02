import * as THREE from 'three';
import type { GroundDescriptor } from '../types.js';
import type { Disposable } from '../types.js';

export class GroundRenderer implements Disposable {
  private readonly scene: THREE.Scene;
  private groundMesh: THREE.Mesh | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private geometry: THREE.PlaneGeometry | null = null;
  private material: THREE.MeshStandardMaterial | null = null;
  private currentKey: string | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  sync(ground: GroundDescriptor): void {
    const key = `${ground.color}:${ground.size.width}:${ground.size.depth}`;
    if (this.currentKey === key) return;
    this.currentKey = key;

    this.removeExisting();

    this.geometry = new THREE.PlaneGeometry(ground.size.width, ground.size.depth, 32, 32);
    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ground.color),
      roughness: 0.9,
      metalness: 0.0,
    });

    this.groundMesh = new THREE.Mesh(this.geometry, this.material);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.groundMesh.name = 'ground';
    this.scene.add(this.groundMesh);

    this.gridHelper = new THREE.GridHelper(
      Math.max(ground.size.width, ground.size.depth),
      40, 0x38bdf8, 0x38bdf8,
    );
    const gridMat = this.gridHelper.material as THREE.Material;
    gridMat.opacity = 0.08;
    gridMat.transparent = true;
    this.gridHelper.position.y = 0.01;
    this.scene.add(this.gridHelper);
  }

  private removeExisting(): void {
    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      this.groundMesh = null;
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper = null;
    }
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
  }

  dispose(): void {
    this.removeExisting();
    this.currentKey = null;
  }
}
