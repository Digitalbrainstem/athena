import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { AssetManager } from '../../src/assets/asset-manager.js';
import { FROST, AURORA } from '../../src/assets/materials.js';
import type { MasteryTier } from '@nexus-academy/core';
import { BIOME_IDS } from '@nexus-academy/core';

describe('AssetManager', () => {
  let manager: AssetManager;

  beforeEach(() => {
    manager = new AssetManager();
  });

  afterEach(() => {
    manager.dispose();
  });

  // ---- Model generation & caching ------------------------------------

  it('generates a model for a known object type', () => {
    const group = manager.getModel('workbench', 'foundation');
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBeGreaterThan(0);
  });

  it('returns a cloned group (not the cached original)', () => {
    const a = manager.getModel('workbench', 'foundation');
    const b = manager.getModel('workbench', 'foundation');
    expect(a).not.toBe(b); // different instances
    expect(a.children.length).toBe(b.children.length);
  });

  it('hasModel returns true for known types', () => {
    expect(manager.hasModel('workbench')).toBe(true);
    expect(manager.hasModel('telescope')).toBe(true);
    expect(manager.hasModel('tree')).toBe(true);
  });

  it('hasModel returns false for unknown types', () => {
    expect(manager.hasModel('flying_spaghetti_monster')).toBe(false);
  });

  it('generates a fallback for unknown object types', () => {
    const group = manager.getModel('unknown_thing', 'builder');
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBeGreaterThan(0);
  });

  // ---- Material system -----------------------------------------------

  it('returns material presets', () => {
    const wood = manager.getMaterial('wood');
    expect(wood).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(wood.roughness).toBeCloseTo(0.9);
    expect(wood.metalness).toBeCloseTo(0.0);
  });

  it('returns tier-adjusted materials', () => {
    const woodF = manager.getMaterial('wood', 'foundation');
    const woodC = manager.getMaterial('wood', 'creator');
    // Foundation has higher saturation than creator
    const hslF = { h: 0, s: 0, l: 0 };
    const hslC = { h: 0, s: 0, l: 0 };
    woodF.color.getHSL(hslF);
    woodC.color.getHSL(hslC);
    expect(hslF.s).toBeGreaterThanOrEqual(hslC.s);
  });

  it('caches materials — same preset returns same instance', () => {
    const a = manager.getMaterial('stone');
    const b = manager.getMaterial('stone');
    expect(a).toBe(b);
  });

  it('different presets return different materials', () => {
    const wood = manager.getMaterial('wood');
    const metal = manager.getMaterial('metal');
    expect(wood).not.toBe(metal);
  });

  it('crystal material is transparent', () => {
    const crystal = manager.getMaterial('crystal');
    expect(crystal.transparent).toBe(true);
    expect(crystal.opacity).toBeLessThan(1);
  });

  it('glow material has emissive', () => {
    const glow = manager.getMaterial('glow');
    expect(glow.emissiveIntensity).toBeGreaterThan(0);
  });

  // ---- Biome palettes -------------------------------------------------

  it('has palettes for all 27 biomes', () => {
    for (const id of BIOME_IDS) {
      const palette = manager.getBiomePalette(id);
      expect(palette, `Missing palette for biome: ${id}`).toBeDefined();
      expect(palette!.dominant).toBeTypeOf('number');
      expect(palette!.ground).toBeTypeOf('number');
      expect(palette!.sky).toBeTypeOf('number');
    }
  });

  it('returns undefined for unknown biome palette', () => {
    expect(manager.getBiomePalette('nonexistent')).toBeUndefined();
  });

  // ---- Biome environment generation -----------------------------------

  it('generates a biome environment for workshop', () => {
    const env = manager.getBiomeEnvironment('workshop', 'foundation');
    expect(env).toBeInstanceOf(THREE.Group);
    expect(env.name).toBe('biome:workshop');
    expect(env.children.length).toBeGreaterThan(1); // ground + props
  });

  it('generates environments for all 27 biomes', () => {
    for (const id of BIOME_IDS) {
      const env = manager.getBiomeEnvironment(id, 'discovery');
      expect(env).toBeInstanceOf(THREE.Group);
      expect(env.name).toBe(`biome:${id}`);
      // At minimum has the ground plane
      expect(env.children.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('caches biome environments — same config returns clone', () => {
    const a = manager.getBiomeEnvironment('workshop', 'foundation');
    const b = manager.getBiomeEnvironment('workshop', 'foundation');
    expect(a).not.toBe(b); // cloned, not same ref
    expect(a.children.length).toBe(b.children.length);
  });

  it('reducedDetail generates fewer props', () => {
    const full = manager.getBiomeEnvironment('living-forest', 'discovery');
    const reduced = manager.getBiomeEnvironment('living-forest', 'discovery', { reducedDetail: true });
    expect(reduced.children.length).toBeLessThanOrEqual(full.children.length);
  });

  it('environment ground plane is horizontal', () => {
    const env = manager.getBiomeEnvironment('workshop', 'foundation');
    const ground = env.children.find((c) => c.name === 'biome-ground') as THREE.Mesh | undefined;
    expect(ground).toBeDefined();
    expect(ground!.rotation.x).toBeCloseTo(-Math.PI / 2);
  });

  // ---- Accent color constants -----------------------------------------

  it('exports correct accent colors', () => {
    expect(FROST).toBe(0x22d3ee);
    expect(AURORA).toBe(0xa78bfa);
  });

  // ---- Dispose ---------------------------------------------------------

  it('dispose cleans up all resources without error', () => {
    manager.getModel('workbench', 'foundation');
    manager.getModel('tree', 'builder');
    manager.getBiomeEnvironment('workshop', 'foundation');
    manager.getMaterial('wood');
    manager.getMaterial('crystal');
    expect(() => manager.dispose()).not.toThrow();
  });

  it('double dispose is safe', () => {
    manager.getModel('workbench', 'foundation');
    manager.dispose();
    expect(() => manager.dispose()).not.toThrow();
  });

  // ---- Cross-tier model coverage --------------------------------------

  const SAMPLE_TYPES = ['workbench', 'telescope', 'cauldron', 'crystal', 'tree', 'bookshelf',
    'terminal', 'hospitalBed', 'fence', 'piano', 'easel', 'podium'] as const;
  const TIERS: MasteryTier[] = ['foundation', 'discovery', 'builder', 'innovator', 'creator'];

  for (const type of SAMPLE_TYPES) {
    for (const tier of TIERS) {
      it(`generates ${type} for ${tier} tier`, () => {
        const group = manager.getModel(type, tier);
        expect(group).toBeInstanceOf(THREE.Group);
        expect(group.children.length).toBeGreaterThan(0);
      });
    }
  }
});
