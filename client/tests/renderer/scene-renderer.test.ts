import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { SceneRenderer } from '../../src/renderer/scene-renderer.js';
import type { SceneGraph } from '@nexus-academy/core';

// Mock WebGLRenderer since jsdom doesn't support canvas getContext
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  class MockWebGLRenderer {
    domElement = document.createElement('canvas');
    info = { memory: {}, render: {}, programs: null, autoReset: true, reset: () => {} } as unknown as THREE.WebGLInfo;
    shadowMap = { enabled: false, type: actual.PCFSoftShadowMap };
    toneMapping = actual.ACESFilmicToneMapping;
    toneMappingExposure = 1.0;
    outputColorSpace = actual.SRGBColorSpace;
    setPixelRatio(_v: number) {}
    setSize(_w: number, _h: number) {}
    render(_s: THREE.Scene, _c: THREE.Camera) {}
    dispose() {}
  }
  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

function makeSceneGraph(overrides?: Partial<SceneGraph>): SceneGraph {
  return {
    camera: { position: { x: 0, y: 5, z: 10 }, rotation: { x: -0.3, y: 0, z: 0 }, fov: 60, near: 0.1, far: 1000 },
    lights: [
      { entityId: -1, position: { x: -1, y: -2, z: -1 }, lightType: 'ambient', color: '#FFE4B5', intensity: 0.4 },
      { entityId: -2, position: { x: -1, y: -2, z: -1 }, lightType: 'directional', color: '#FFF8DC', intensity: 0.8 },
    ],
    objects: [
      {
        entityId: 1,
        position: { x: 0, y: 0.5, z: -3 },
        rotation: { x: 0, y: 0, z: 0 },
        renderable: { meshType: 'box', color: '#8B4513', scale: { x: 2, y: 1, z: 1 }, visible: true },
        highlight: false,
      },
      {
        entityId: 2,
        position: { x: -5, y: 1.5, z: -5 },
        rotation: { x: 0, y: 0, z: 0 },
        renderable: { meshType: 'sphere', color: '#22d3ee', scale: { x: 1, y: 1, z: 1 }, visible: true },
        highlight: false,
      },
    ],
    sky: { type: 'color', primaryColor: '#87CEEB' },
    ground: { type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } },
    ui: { elements: [], dialogueActive: false, inventoryOpen: false, mapOpen: false, paused: false },
    audio: [],
    announcements: [],
    captions: [],
    ...overrides,
  };
}

describe('SceneRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: SceneRenderer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    renderer = new SceneRenderer(canvas, 'low');
  });

  it('creates a scene and camera', () => {
    expect(renderer.scene).toBeInstanceOf(THREE.Scene);
    expect(renderer.camera).toBeInstanceOf(THREE.PerspectiveCamera);
  });

  it('render populates the scene with objects', () => {
    const sg = makeSceneGraph();
    renderer.render(sg);
    // 2 entity meshes + ground mesh + grid helper + 2 lights = several children
    expect(renderer.scene.children.length).toBeGreaterThanOrEqual(2);
  });

  it('syncs camera from scene graph', () => {
    const sg = makeSceneGraph({ camera: { position: { x: 5, y: 10, z: 20 }, rotation: { x: 0, y: 0, z: 0 }, fov: 75, near: 0.5, far: 500 } });
    renderer.render(sg);
    expect(renderer.camera.position.x).toBe(5);
    expect(renderer.camera.position.y).toBe(10);
    expect(renderer.camera.fov).toBe(75);
  });

  it('adds new objects for new entity IDs', () => {
    const sg = makeSceneGraph();
    renderer.render(sg);
    const childCount = renderer.scene.children.length;

    sg.objects.push({
      entityId: 3,
      position: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: { meshType: 'cylinder', color: '#FF0000', scale: { x: 1, y: 2, z: 1 }, visible: true },
      highlight: false,
    });
    renderer.render(sg);
    expect(renderer.scene.children.length).toBeGreaterThan(childCount);
  });

  it('removes meshes for entities no longer in scene graph', () => {
    const sg = makeSceneGraph();
    renderer.render(sg);
    const childCount = renderer.scene.children.length;

    sg.objects = [sg.objects[0]];
    renderer.render(sg);
    expect(renderer.scene.children.length).toBeLessThan(childCount);
  });

  it('updates existing mesh positions', () => {
    const sg = makeSceneGraph();
    renderer.render(sg);
    sg.objects[0].position = { x: 10, y: 20, z: 30 };
    renderer.render(sg);
    const meshes = renderer.scene.children.filter(
      (c: THREE.Object3D): c is THREE.Mesh => c instanceof THREE.Mesh,
    );
    const moved = meshes.find((m: THREE.Mesh) => m.position.x === 10 && m.position.y === 20);
    expect(moved).toBeDefined();
  });

  it('sets sky background color', () => {
    renderer.render(makeSceneGraph({ sky: { type: 'color', primaryColor: '#FF0000' } }));
    expect(renderer.scene.background).toBeInstanceOf(THREE.Color);
  });

  it('creates ground plane', () => {
    renderer.render(makeSceneGraph());
    const ground = renderer.scene.getObjectByName('ground');
    expect(ground).toBeDefined();
    expect(ground).toBeInstanceOf(THREE.Mesh);
  });

  it('getLODTier returns current tier', () => {
    expect(renderer.getLODTier()).toBe('low');
    renderer.setLODTier('high');
    expect(renderer.getLODTier()).toBe('high');
  });

  it('dispose cleans up', () => {
    renderer.render(makeSceneGraph());
    renderer.dispose();
    // After dispose, render should be a no-op (no throw)
    renderer.render(makeSceneGraph());
  });

  it('dispose is idempotent', () => {
    renderer.dispose();
    expect(() => renderer.dispose()).not.toThrow();
  });
});
