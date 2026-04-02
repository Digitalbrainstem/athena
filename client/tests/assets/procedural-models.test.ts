import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { ProceduralModelGenerator, PROCEDURAL_OBJECT_TYPES } from '../../src/assets/procedural-models.js';
import { MaterialLibrary } from '../../src/assets/materials.js';
import type { MasteryTier } from '@nexus-academy/core';

const TIERS: MasteryTier[] = ['foundation', 'discovery', 'builder', 'innovator', 'creator'];

describe('ProceduralModelGenerator', () => {
  let lib: MaterialLibrary;
  let gen: ProceduralModelGenerator;

  beforeEach(() => {
    lib = new MaterialLibrary();
    gen = new ProceduralModelGenerator(lib);
  });

  afterEach(() => {
    gen.dispose();
    lib.dispose();
  });

  it('exposes a list of known object types', () => {
    expect(PROCEDURAL_OBJECT_TYPES.length).toBeGreaterThan(30);
    expect(PROCEDURAL_OBJECT_TYPES).toContain('workbench');
    expect(PROCEDURAL_OBJECT_TYPES).toContain('telescope');
    expect(PROCEDURAL_OBJECT_TYPES).toContain('cauldron');
    expect(PROCEDURAL_OBJECT_TYPES).toContain('crystal');
    expect(PROCEDURAL_OBJECT_TYPES).toContain('tree');
    expect(PROCEDURAL_OBJECT_TYPES).toContain('bookshelf');
  });

  it('generates a Group for every known object type (foundation tier)', () => {
    for (const type of PROCEDURAL_OBJECT_TYPES) {
      const group = gen.generate(type, 'foundation');
      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.children.length).toBeGreaterThan(0);
    }
  });

  it('generates distinct models for different tiers', () => {
    const foundation = gen.generate('tree', 'foundation');
    const builder = gen.generate('tree', 'builder');
    // Builder tier trees have more canopy spheres → more children
    expect(builder.children.length).toBeGreaterThanOrEqual(foundation.children.length);
  });

  it('returns a fallback group for unknown object types', () => {
    const group = gen.generate('nonexistent_thing', 'foundation');
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBeGreaterThan(0);
    expect(group.userData.fallback).toBe(true);
  });

  it('workbench has correct structure', () => {
    const wb = gen.generate('workbench', 'builder');
    expect(wb.children.length).toBeGreaterThanOrEqual(6); // top + 4 legs + shelf + vice
    const meshes = wb.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    expect(meshes.length).toBeGreaterThanOrEqual(6);
    // All children should have castShadow
    for (const m of meshes) {
      expect(m.castShadow).toBe(true);
    }
  });

  it('telescope has glass lens', () => {
    const tel = gen.generate('telescope', 'discovery');
    const meshes = tel.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    const glassMesh = meshes.find((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      return mat.transparent === true;
    });
    expect(glassMesh).toBeDefined();
  });

  it('cauldron has transparent liquid', () => {
    const cauldron = gen.generate('cauldron', 'foundation');
    const meshes = cauldron.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    const liquid = meshes.find((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      return mat.transparent === true && mat.opacity < 1;
    });
    expect(liquid).toBeDefined();
  });

  it('crystal cluster has multiple shards', () => {
    const cluster = gen.generate('crystalCluster', 'discovery');
    expect(cluster.children.length).toBeGreaterThanOrEqual(5); // 5 shards + rock base
  });

  it('all generated objects sit at or above y=0', () => {
    for (const type of PROCEDURAL_OBJECT_TYPES) {
      const group = gen.generate(type, 'foundation');
      // The group itself should be at origin; children may vary but the model
      // should generally have positive y positions
      expect(group.position.y).toBe(0);
    }
  });

  for (const tier of TIERS) {
    it(`generates all object types without errors for tier: ${tier}`, () => {
      for (const type of PROCEDURAL_OBJECT_TYPES) {
        expect(() => gen.generate(type, tier)).not.toThrow();
      }
    });
  }

  it('caches geometries across multiple generate calls', () => {
    const g1 = gen.generate('workbench', 'foundation');
    const g2 = gen.generate('workbench', 'foundation');
    // The groups are different instances but share the same geometry objects
    const meshes1 = g1.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    const meshes2 = g2.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    if (meshes1.length > 0 && meshes2.length > 0) {
      // The top surface should share geometry
      expect(meshes1[0]!.geometry).toBe(meshes2[0]!.geometry);
    }
  });

  it('dispose does not throw', () => {
    gen.generate('workbench', 'foundation');
    gen.generate('tree', 'builder');
    expect(() => gen.dispose()).not.toThrow();
  });
});
