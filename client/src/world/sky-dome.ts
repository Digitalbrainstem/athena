import * as THREE from 'three';
import type { Disposable } from '../types.js';
import { fbm } from './noise.js';

// ---------------------------------------------------------------------------
// Enhanced sky dome for the overworld — blue sky with stylized clouds
// ---------------------------------------------------------------------------

const CLOUD_COLOR = 0xf5f0e8; // Warm White per art direction
const CLOUD_COUNT = 40;

export class OverworldSkyDome implements Disposable {
  readonly group: THREE.Group;
  private readonly clouds: THREE.Mesh[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private time = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'overworld-sky';

    this.createClouds();
  }

  /** Call each frame with dt to animate cloud drift */
  update(dt: number): void {
    this.time += dt;
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i]!;
      // Slow drift
      cloud.position.x += Math.sin(this.time * 0.02 + i) * 0.01;
      cloud.position.z += Math.cos(this.time * 0.015 + i * 0.7) * 0.008;
    }
  }

  /** Returns a SkyDescriptor-compatible object for the overworld */
  getSkyDescriptor(): {
    type: 'gradient';
    primaryColor: string;
    secondaryColor: string;
  } {
    return {
      type: 'gradient',
      primaryColor: '#87CEEB',    // Soft sky blue
      secondaryColor: '#e0f0ff',  // Pale horizon
    };
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.clouds.length = 0;
  }

  private createClouds(): void {
    const cloudGeo = new THREE.SphereGeometry(1, 6, 4);
    this.geometries.push(cloudGeo);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: CLOUD_COLOR,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
    });
    this.materials.push(cloudMat);

    for (let i = 0; i < CLOUD_COUNT; i++) {
      // Distribute clouds in a ring around the sky
      const angle = (i / CLOUD_COUNT) * Math.PI * 2 + fbm(i * 3.7, 0, 2) * 1.5;
      const dist = 80 + fbm(i * 2.1, 10, 2) * 60;
      const height = 50 + fbm(i * 1.3, 20, 2) * 30;

      const cloudGroup = new THREE.Group();

      // Each cloud is a cluster of overlapping spheres
      const puffCount = 3 + Math.floor(fbm(i * 4.2, 30, 2) * 4);
      for (let j = 0; j < puffCount; j++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(
          (j - puffCount / 2) * 2.5 + fbm(i + j * 7, 50, 2) * 2,
          fbm(i + j * 3, 60, 2) * 1.5,
          fbm(i + j * 5, 70, 2) * 2,
        );
        const s = 2 + fbm(i + j, 80, 2) * 3;
        puff.scale.set(s, s * 0.5, s * 0.8);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        Math.sin(angle) * dist,
        height,
        Math.cos(angle) * dist,
      );

      this.clouds.push(cloudGroup as unknown as THREE.Mesh);
      this.group.add(cloudGroup);
    }
  }
}
