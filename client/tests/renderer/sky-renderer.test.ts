import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { SkyRenderer } from '../../src/renderer/sky-renderer.js';

describe('SkyRenderer', () => {
  let scene: THREE.Scene;
  let sky: SkyRenderer;

  beforeEach(() => {
    scene = new THREE.Scene();
    sky = new SkyRenderer(scene);
  });

  it('sets solid color background', () => {
    sky.sync({ type: 'color', primaryColor: '#FF0000' });
    expect(scene.background).toBeInstanceOf(THREE.Color);
  });

  it('sets fog for color sky', () => {
    sky.sync({ type: 'color', primaryColor: '#87CEEB' });
    expect(scene.fog).toBeDefined();
  });

  it('handles gradient sky type', () => {
    sky.sync({ type: 'gradient', primaryColor: '#87CEEB', secondaryColor: '#E0F7FA' });
    expect(scene.background).toBeInstanceOf(THREE.Color);
    expect(scene.fog).toBeDefined();
  });

  it('handles skybox type with fallback', () => {
    sky.sync({ type: 'skybox', primaryColor: '#000000', skyboxId: 'test' });
    expect(scene.background).toBeInstanceOf(THREE.Color);
  });

  it('skips update if nothing changed', () => {
    sky.sync({ type: 'color', primaryColor: '#FF0000' });
    const bg1 = scene.background;
    sky.sync({ type: 'color', primaryColor: '#FF0000' });
    expect(scene.background).toBe(bg1);
  });

  it('dispose clears background and fog', () => {
    sky.sync({ type: 'color', primaryColor: '#FF0000' });
    sky.dispose();
    expect(scene.background).toBeNull();
    expect(scene.fog).toBeNull();
  });
});
