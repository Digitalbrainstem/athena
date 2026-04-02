import * as THREE from 'three';
import type { SceneLight } from '../types.js';
import type { Disposable } from '../types.js';

export class LightManager implements Disposable {
  private readonly scene: THREE.Scene;
  private readonly lights = new Map<number, THREE.Light>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  sync(descriptors: SceneLight[]): void {
    const incoming = new Set<number>();

    for (const desc of descriptors) {
      incoming.add(desc.entityId);
      let light = this.lights.get(desc.entityId);

      if (light) {
        this.updateLight(light, desc);
      } else {
        light = this.createLight(desc);
        this.lights.set(desc.entityId, light);
        this.scene.add(light);
      }
    }

    for (const [id, light] of this.lights) {
      if (!incoming.has(id)) {
        this.scene.remove(light);
        light.dispose();
        this.lights.delete(id);
      }
    }
  }

  private createLight(desc: SceneLight): THREE.Light {
    let light: THREE.Light;
    const color = new THREE.Color(desc.color);

    switch (desc.lightType) {
      case 'ambient':
        light = new THREE.AmbientLight(color, desc.intensity);
        break;
      case 'directional': {
        const dir = new THREE.DirectionalLight(color, desc.intensity);
        dir.position.set(desc.position.x, desc.position.y, desc.position.z);
        light = dir;
        break;
      }
      case 'point': {
        const point = new THREE.PointLight(color, desc.intensity, desc.range ?? 50);
        point.position.set(desc.position.x, desc.position.y, desc.position.z);
        light = point;
        break;
      }
      case 'hemisphere':
        light = new THREE.HemisphereLight(color, 0x444444, desc.intensity);
        break;
      default:
        light = new THREE.AmbientLight(color, desc.intensity);
    }

    return light;
  }

  private updateLight(light: THREE.Light, desc: SceneLight): void {
    light.color.set(desc.color);
    light.intensity = desc.intensity;

    if (light instanceof THREE.DirectionalLight || light instanceof THREE.PointLight) {
      light.position.set(desc.position.x, desc.position.y, desc.position.z);
    }

    if (light instanceof THREE.PointLight && desc.range !== undefined) {
      light.distance = desc.range;
    }
  }

  dispose(): void {
    for (const light of this.lights.values()) {
      this.scene.remove(light);
      light.dispose();
    }
    this.lights.clear();
  }
}
