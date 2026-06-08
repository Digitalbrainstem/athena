import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { BIOME_LOCATIONS } from '../../src/world/overworld.js';
import { createBiomePropModel, getBiomeLayout } from '../../src/assets/biome-environments.js';
import { MaterialLibrary } from '../../src/assets/materials.js';
import { ProceduralModelGenerator } from '../../src/assets/procedural-models.js';

describe('biome prop model coverage', () => {
  it('renders every biome layout prop with a real modeled generator instead of a fallback cube', () => {
    const materials = new MaterialLibrary();
    const generator = new ProceduralModelGenerator(materials);

    try {
      for (const biome of BIOME_LOCATIONS) {
        for (const prop of getBiomeLayout(biome.id)) {
          const model = createBiomePropModel(prop, 'foundation', generator);
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());

          expect(
            model.userData.fallback,
            `${biome.id}:${prop.type} should have an authored or procedural model`,
          ).not.toBe(true);
          expect(
            Math.max(size.x, size.y, size.z),
            `${biome.id}:${prop.type} should be visible at player scale`,
          ).toBeGreaterThan(0.1);
          expect(
            Math.max(size.x, size.y, size.z),
            `${biome.id}:${prop.type} should not dwarf the first-person camera`,
          ).toBeLessThan(12);
        }
      }
    } finally {
      generator.dispose();
      materials.dispose();
    }
  });
});
