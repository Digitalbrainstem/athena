import * as THREE from 'three';
import type { SkyDescriptor } from '../types.js';
import type { Disposable } from '../types.js';

export class SkyRenderer implements Disposable {
  private readonly scene: THREE.Scene;
  private currentType: string | null = null;
  private currentPrimary: string | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  sync(sky: SkyDescriptor): void {
    if (this.currentType === sky.type && this.currentPrimary === sky.primaryColor) return;
    this.currentType = sky.type;
    this.currentPrimary = sky.primaryColor;

    switch (sky.type) {
      case 'color':
        this.scene.background = new THREE.Color(sky.primaryColor);
        this.scene.fog = new THREE.FogExp2(new THREE.Color(sky.primaryColor).getHex(), 0.012);
        break;
      case 'gradient':
        this.scene.background = new THREE.Color(sky.primaryColor);
        this.scene.fog = new THREE.FogExp2(
          new THREE.Color(sky.secondaryColor ?? sky.primaryColor).getHex(),
          0.01,
        );
        break;
      case 'skybox':
        this.scene.background = new THREE.Color(sky.primaryColor);
        this.scene.fog = null;
        break;
    }
  }

  dispose(): void {
    this.scene.background = null;
    this.scene.fog = null;
    this.currentType = null;
    this.currentPrimary = null;
  }
}
