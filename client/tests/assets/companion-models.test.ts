import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  CompanionModelGenerator,
  COMPANION_TYPES,
} from '../../src/assets/companion-models.js';
import { ProceduralModelGenerator } from '../../src/assets/procedural-models.js';
import { MaterialLibrary } from '../../src/assets/materials.js';
import type { MasteryTier } from '@nexus-academy/core';

const TIERS: MasteryTier[] = [
  'foundation', 'discovery', 'builder', 'innovator', 'creator',
];

describe('CompanionModelGenerator', () => {
  let lib: MaterialLibrary;
  let geo: ProceduralModelGenerator;
  let gen: CompanionModelGenerator;

  beforeEach(() => {
    lib = new MaterialLibrary();
    geo = new ProceduralModelGenerator(lib);
    gen = new CompanionModelGenerator(lib, geo);
  });

  afterEach(() => {
    gen.dispose();
    geo.dispose();
    lib.dispose();
  });

  // ---------- Basic generation -------------------------------------------

  it('exposes all 6 companion types', () => {
    expect(COMPANION_TYPES).toHaveLength(6);
    expect(COMPANION_TYPES).toContain('fox');
    expect(COMPANION_TYPES).toContain('owl');
    expect(COMPANION_TYPES).toContain('rabbit');
    expect(COMPANION_TYPES).toContain('bear');
    expect(COMPANION_TYPES).toContain('cat');
    expect(COMPANION_TYPES).toContain('dragon');
  });

  it('generates a CompanionModel for every type (foundation tier)', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      expect(companion).toBeDefined();
      expect(companion.type).toBe(type);
      expect(companion.group).toBeInstanceOf(THREE.Group);
    }
  });

  it('generates all types across all tiers without error', () => {
    for (const type of COMPANION_TYPES) {
      for (const tier of TIERS) {
        const companion = gen.generate(type, tier);
        expect(companion.group).toBeInstanceOf(THREE.Group);
        companion.dispose();
      }
    }
  });

  it('throws for unknown companion types', () => {
    expect(() => gen.generate('unicorn', 'foundation')).toThrow(
      /Unknown companion type/,
    );
  });

  // ---------- Structure checks -------------------------------------------

  it('each companion group has > 5 child meshes', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      expect(companion.group.children.length).toBeGreaterThan(5);
      companion.dispose();
    }
  });

  it('scale is approximately 0.4 units tall', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      const box = new THREE.Box3().setFromObject(companion.group);
      const height = box.max.y - box.min.y;
      // Allow tolerance: between 0.2 and 0.55 units
      expect(height).toBeGreaterThan(0.2);
      expect(height).toBeLessThan(0.55);
      companion.dispose();
    }
  });

  it('each type has a distinct silhouette (different bounding box sizes)', () => {
    const sizes = new Map<string, { w: number; h: number; d: number }>();
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      const box = new THREE.Box3().setFromObject(companion.group);
      const size = new THREE.Vector3();
      box.getSize(size);
      sizes.set(type, { w: size.x, h: size.y, d: size.z });
      companion.dispose();
    }

    // At least some pairs must differ significantly (> 10%)
    const entries = [...sizes.entries()];
    let diffs = 0;
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [, a] = entries[i];
        const [, b] = entries[j];
        const dW = Math.abs(a.w - b.w) / Math.max(a.w, b.w);
        const dH = Math.abs(a.h - b.h) / Math.max(a.h, b.h);
        const dD = Math.abs(a.d - b.d) / Math.max(a.d, b.d);
        if (dW > 0.1 || dH > 0.1 || dD > 0.1) diffs++;
      }
    }
    // Most pairs should differ (at least 10 out of 15 pairs)
    expect(diffs).toBeGreaterThanOrEqual(10);
  });

  // ---------- Tier-based detail ------------------------------------------

  it('higher tiers add more detail (builder has >= foundation children)', () => {
    for (const type of COMPANION_TYPES) {
      const foundation = gen.generate(type, 'foundation');
      const builder = gen.generate(type, 'builder');
      expect(builder.group.children.length).toBeGreaterThanOrEqual(
        foundation.group.children.length,
      );
      foundation.dispose();
      builder.dispose();
    }
  });

  // ---------- Animation methods ------------------------------------------

  it('idle() modifies group transforms', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      const beforeY = companion.group.position.y;
      companion.idle(1.5);
      // idle should move the group at least slightly
      const afterY = companion.group.position.y;
      // At time=1.5, sin(1.5*1.2) != 0 so position should change
      expect(afterY).not.toBeCloseTo(beforeY, 10);
      companion.dispose();
    }
  });

  it('speak() modifies head rotation', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      companion.speak(0.5);
      // Speak should cause some rotation on the group
      expect(
        companion.group.rotation.x !== 0 ||
        companion.group.position.y !== 0,
      ).toBe(true);
      companion.dispose();
    }
  });

  it('point() rotates group toward direction', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      companion.point({ x: 1, y: 0, z: 0 });
      // Should rotate toward +X
      expect(companion.group.rotation.y).not.toBe(0);
      companion.dispose();
    }
  });

  it('emote() does not throw for known emotions', () => {
    const emotions = ['excited', 'curious', 'encouraging', 'thoughtful'];
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      for (const emotion of emotions) {
        expect(() => companion.emote(emotion)).not.toThrow();
      }
      companion.dispose();
    }
  });

  // ---------- Materials --------------------------------------------------

  it('uses MeshStandardMaterial for body parts', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      let standardCount = 0;
      companion.group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            standardCount++;
          }
        }
      });
      expect(standardCount).toBeGreaterThan(3);
      companion.dispose();
    }
  });

  it('eyes have emissive properties', () => {
    for (const type of COMPANION_TYPES) {
      const companion = gen.generate(type, 'foundation');
      const eyeL = companion.group.getObjectByName('eyeL');
      if (eyeL instanceof THREE.Mesh) {
        const eyeMat = eyeL.material;
        if (eyeMat instanceof THREE.MeshStandardMaterial) {
          expect(eyeMat.emissiveIntensity).toBeGreaterThan(0);
        }
      }
      companion.dispose();
    }
  });

  // ---------- UserData ---------------------------------------------------

  it('stores type and tier in group.userData', () => {
    const companion = gen.generate('fox', 'discovery');
    expect(companion.group.userData.companionType).toBe('fox');
    expect(companion.group.userData.tier).toBe('discovery');
    companion.dispose();
  });

  // ---------- Dispose ----------------------------------------------------

  it('dispose removes group from parent if attached', () => {
    const parent = new THREE.Group();
    const companion = gen.generate('owl', 'foundation');
    parent.add(companion.group);
    expect(parent.children).toContain(companion.group);
    companion.dispose();
    expect(parent.children).not.toContain(companion.group);
  });
});
