import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { GroundRenderer } from '../../src/renderer/ground-renderer.js';

describe('GroundRenderer', () => {
  let scene: THREE.Scene;
  let ground: GroundRenderer;

  beforeEach(() => {
    scene = new THREE.Scene();
    ground = new GroundRenderer(scene);
  });

  it('creates ground mesh', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    const mesh = scene.getObjectByName('ground');
    expect(mesh).toBeInstanceOf(THREE.Mesh);
  });

  it('creates grid helper', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    const grid = scene.children.find(c => c instanceof THREE.GridHelper);
    expect(grid).toBeDefined();
  });

  it('skips update if nothing changed', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    const childCount = scene.children.length;
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    expect(scene.children.length).toBe(childCount);
  });

  it('replaces ground when descriptor changes', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    ground.sync({ type: 'stone', color: '#3D3D3D', size: { width: 200, depth: 200 } });
    const mesh = scene.getObjectByName('ground') as THREE.Mesh;
    expect(mesh).toBeDefined();
    // New color should be applied
    const material = mesh.material as THREE.MeshStandardMaterial;
    expect(material.color.getHexString()).not.toBe('228b22');
  });

  it('dispose removes ground and grid', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    ground.dispose();
    expect(scene.children.length).toBe(0);
  });

  it('dispose is idempotent', () => {
    ground.sync({ type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } });
    ground.dispose();
    expect(() => ground.dispose()).not.toThrow();
  });
});
