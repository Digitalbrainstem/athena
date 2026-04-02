import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ObjectFactory } from '../../src/renderer/object-factory.js';
import type { SceneObject } from '@nexus-academy/core';

function makeObject(overrides?: Partial<SceneObject>): SceneObject {
  return {
    entityId: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    renderable: {
      meshType: 'box',
      color: '#FF0000',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    },
    highlight: false,
    ...overrides,
  };
}

describe('ObjectFactory', () => {
  let factory: ObjectFactory;
  beforeEach(() => { factory = new ObjectFactory(); });

  it('creates a box mesh', () => {
    const mesh = factory.createMesh(makeObject());
    expect(mesh).toBeInstanceOf(THREE.Mesh);
    expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);
  });

  it('creates a sphere mesh', () => {
    const mesh = factory.createMesh(makeObject({ renderable: { meshType: 'sphere', color: '#00FF00', scale: { x: 2, y: 2, z: 2 }, visible: true } }));
    expect(mesh.geometry).toBeInstanceOf(THREE.SphereGeometry);
  });

  it('creates a cylinder mesh', () => {
    const mesh = factory.createMesh(makeObject({ renderable: { meshType: 'cylinder', color: '#0000FF', scale: { x: 1, y: 2, z: 1 }, visible: true } }));
    expect(mesh.geometry).toBeInstanceOf(THREE.CylinderGeometry);
  });

  it('creates a plane mesh', () => {
    const mesh = factory.createMesh(makeObject({ renderable: { meshType: 'plane', color: '#888888', scale: { x: 4, y: 3, z: 0.1 }, visible: true } }));
    expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
  });

  it('caches geometries — same scale returns same geometry instance', () => {
    const a = factory.getGeometry('box', { x: 1, y: 1, z: 1 });
    const b = factory.getGeometry('box', { x: 1, y: 1, z: 1 });
    expect(a).toBe(b);
  });

  it('different scales return different geometry instances', () => {
    const a = factory.getGeometry('box', { x: 1, y: 1, z: 1 });
    const b = factory.getGeometry('box', { x: 2, y: 2, z: 2 });
    expect(a).not.toBe(b);
  });

  it('caches materials — same color returns same material instance', () => {
    const a = factory.getMaterial('#FF0000');
    const b = factory.getMaterial('#FF0000');
    expect(a).toBe(b);
  });

  it('different colors return different material instances', () => {
    const a = factory.getMaterial('#FF0000');
    const b = factory.getMaterial('#00FF00');
    expect(a).not.toBe(b);
  });

  it('highlight material has emissive color', () => {
    const mat = factory.getHighlightMaterial('#FF0000');
    expect(mat.emissive).toBeInstanceOf(THREE.Color);
    expect(mat.emissiveIntensity).toBeGreaterThan(0);
  });

  it('sets mesh position from SceneObject', () => {
    const mesh = factory.createMesh(makeObject({ position: { x: 5, y: 10, z: -3 } }));
    expect(mesh.position.x).toBe(5);
    expect(mesh.position.y).toBe(10);
    expect(mesh.position.z).toBe(-3);
  });

  it('sets mesh rotation from SceneObject', () => {
    const mesh = factory.createMesh(makeObject({ rotation: { x: 0.5, y: 1.0, z: 0 } }));
    expect(mesh.rotation.x).toBeCloseTo(0.5);
    expect(mesh.rotation.y).toBeCloseTo(1.0);
  });

  it('sets mesh visibility from SceneObject', () => {
    const mesh = factory.createMesh(makeObject({ renderable: { meshType: 'box', color: '#FF0000', scale: { x: 1, y: 1, z: 1 }, visible: false } }));
    expect(mesh.visible).toBe(false);
  });

  it('updateMesh updates position', () => {
    const obj = makeObject();
    const mesh = factory.createMesh(obj);
    obj.position = { x: 99, y: 88, z: 77 };
    factory.updateMesh(mesh, obj);
    expect(mesh.position.x).toBe(99);
    expect(mesh.position.y).toBe(88);
    expect(mesh.position.z).toBe(77);
  });

  it('updateMesh applies highlight material', () => {
    const obj = makeObject();
    const mesh = factory.createMesh(obj);
    const normalMat = mesh.material;
    obj.highlight = true;
    factory.updateMesh(mesh, obj);
    expect(mesh.material).not.toBe(normalMat);
  });

  it('uses fallback box geometry for model meshType', () => {
    const mesh = factory.createMesh(makeObject({ renderable: { meshType: 'model', modelId: 'some_model', color: '#FF0000', scale: { x: 1, y: 1, z: 1 }, visible: true } }));
    expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);
  });

  it('dispose cleans up all cached resources', () => {
    factory.createMesh(makeObject());
    factory.createMesh(makeObject({ renderable: { meshType: 'sphere', color: '#00FF00', scale: { x: 2, y: 2, z: 2 }, visible: true } }));
    expect(() => factory.dispose()).not.toThrow();
  });
});
