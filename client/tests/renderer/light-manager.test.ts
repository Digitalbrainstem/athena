import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { LightManager } from '../../src/renderer/light-manager.js';
import type { SceneLight } from '@nexus-academy/core';

describe('LightManager', () => {
  let scene: THREE.Scene;
  let manager: LightManager;

  beforeEach(() => {
    scene = new THREE.Scene();
    manager = new LightManager(scene);
  });

  it('creates ambient lights from descriptors', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 0, y: 0, z: 0 }, lightType: 'ambient', color: '#FFE4B5', intensity: 0.4 },
    ];
    manager.sync(lights);
    const ambient = scene.children.find(c => c instanceof THREE.AmbientLight);
    expect(ambient).toBeDefined();
    expect((ambient as THREE.AmbientLight).intensity).toBe(0.4);
  });

  it('creates directional lights', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: -1, y: -2, z: -1 }, lightType: 'directional', color: '#FFFFFF', intensity: 0.8 },
    ];
    manager.sync(lights);
    const dir = scene.children.find(c => c instanceof THREE.DirectionalLight);
    expect(dir).toBeDefined();
  });

  it('creates point lights', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 5, y: 3, z: -2 }, lightType: 'point', color: '#FF0000', intensity: 1.0, range: 20 },
    ];
    manager.sync(lights);
    const point = scene.children.find(c => c instanceof THREE.PointLight) as THREE.PointLight | undefined;
    expect(point).toBeDefined();
    expect(point!.distance).toBe(20);
  });

  it('creates hemisphere lights', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 0, y: 0, z: 0 }, lightType: 'hemisphere', color: '#FFFFFF', intensity: 0.5 },
    ];
    manager.sync(lights);
    const hemi = scene.children.find(c => c instanceof THREE.HemisphereLight);
    expect(hemi).toBeDefined();
  });

  it('updates existing lights', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 0, y: 0, z: 0 }, lightType: 'ambient', color: '#FFFFFF', intensity: 0.5 },
    ];
    manager.sync(lights);
    lights[0].intensity = 1.0;
    manager.sync(lights);
    const ambient = scene.children.find(c => c instanceof THREE.AmbientLight) as THREE.AmbientLight;
    expect(ambient.intensity).toBe(1.0);
  });

  it('removes lights no longer in the scene graph', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 0, y: 0, z: 0 }, lightType: 'ambient', color: '#FFFFFF', intensity: 0.5 },
      { entityId: 2, position: { x: 5, y: 5, z: 5 }, lightType: 'point', color: '#FF0000', intensity: 1.0 },
    ];
    manager.sync(lights);
    expect(scene.children.length).toBe(2);

    manager.sync([lights[0]]);
    expect(scene.children.length).toBe(1);
  });

  it('dispose removes all lights', () => {
    const lights: SceneLight[] = [
      { entityId: 1, position: { x: 0, y: 0, z: 0 }, lightType: 'ambient', color: '#FFFFFF', intensity: 0.5 },
    ];
    manager.sync(lights);
    manager.dispose();
    expect(scene.children.length).toBe(0);
  });
});
