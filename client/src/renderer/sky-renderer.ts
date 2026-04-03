import * as THREE from 'three';
import type { SkyDescriptor } from '../types.js';
import type { Disposable } from '../types.js';

export class SkyRenderer implements Disposable {
  private readonly scene: THREE.Scene;
  private currentType: string | null = null;
  private currentPrimary: string | null = null;
  private skyMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  sync(sky: SkyDescriptor): void {
    if (this.currentType === sky.type && this.currentPrimary === sky.primaryColor) return;
    this.currentType = sky.type;
    this.currentPrimary = sky.primaryColor;

    // Remove old sky mesh
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
      (this.skyMesh.material as THREE.Material).dispose();
      this.skyMesh = null;
    }

    const primary = new THREE.Color(sky.primaryColor);
    const secondary = new THREE.Color(sky.secondaryColor ?? sky.primaryColor);

    switch (sky.type) {
      case 'gradient': {
        // Create a gradient sky dome using vertex colors
        const geo = new THREE.SphereGeometry(200, 32, 16);
        const colors = new Float32Array(geo.attributes.position.count * 3);
        const posAttr = geo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const y = posAttr.getY(i);
          const t = Math.max(0, Math.min(1, (y + 200) / 400));
          const c = new THREE.Color().lerpColors(primary, secondary, t);
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.BackSide,
          fog: false,
        });
        this.skyMesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.skyMesh);
        this.scene.background = null;

        // Warm fog that blends with the sky
        const fogColor = new THREE.Color().lerpColors(primary, secondary, 0.3);
        this.scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.008);
        break;
      }
      case 'color':
        this.scene.background = primary;
        this.scene.fog = new THREE.FogExp2(primary.getHex(), 0.012);
        break;
      case 'skybox':
        this.scene.background = primary;
        this.scene.fog = null;
        break;
    }
  }

  dispose(): void {
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
      (this.skyMesh.material as THREE.Material).dispose();
      this.skyMesh = null;
    }
    this.scene.background = null;
    this.scene.fog = null;
    this.currentType = null;
    this.currentPrimary = null;
  }
}
