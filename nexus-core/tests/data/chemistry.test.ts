import { describe, it, expect } from 'vitest';
import { ELEMENTS, getElement, getElementByNumber, elementsForTier } from '../../src/data/elements.js';
import { COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier } from '../../src/data/compounds.js';
import { BUILDING_MATERIALS, getMaterial, materialsForTier } from '../../src/data/materials.js';
import { RECIPES, getRecipe, recipesForTierAndBiome } from '../../src/data/recipes.js';
import {
  SKILL_PREREQUISITES,
  getPrerequisites,
  getAllPrerequisites,
  arePrerequisitesMet,
  getRootSkills,
  getDependents,
} from '../../src/data/skill-prerequisites.js';
import {
  BIOME_ACCESSIBILITY, getBiomeAccessibility, BIOME_IDS, isValidBiome,
} from '../../src/data/biomes.js';

// ============================================================================
// Elements
// ============================================================================
describe('Elements Data', () => {
  it('has exactly 36 elements (H through Kr)', () => {
    expect(ELEMENTS).toHaveLength(36);
  });

  it('first element is Hydrogen', () => {
    expect(ELEMENTS[0]!.symbol).toBe('H');
    expect(ELEMENTS[0]!.atomicNumber).toBe(1);
  });

  it('last element is Krypton', () => {
    expect(ELEMENTS[35]!.symbol).toBe('Kr');
    expect(ELEMENTS[35]!.atomicNumber).toBe(36);
  });

  it('all elements have unique atomic numbers', () => {
    const numbers = ELEMENTS.map(e => e.atomicNumber);
    expect(new Set(numbers).size).toBe(36);
  });

  it('all elements have unique symbols', () => {
    const symbols = ELEMENTS.map(e => e.symbol);
    expect(new Set(symbols).size).toBe(36);
  });

  it('all elements have positive atomic mass', () => {
    for (const el of ELEMENTS) {
      expect(el.atomicMass, `${el.symbol} mass`).toBeGreaterThan(0);
    }
  });

  it('all elements have accessibility metadata', () => {
    for (const el of ELEMENTS) {
      expect(el.accessibility, `${el.symbol} accessibility`).toBeDefined();
      expect(el.accessibility.spokenName, `${el.symbol} spokenName`).toBeTruthy();
      expect(el.accessibility.description, `${el.symbol} description`).toBeTruthy();
    }
  });

  it('getElement finds by symbol', () => {
    expect(getElement('O')?.name).toBe('Oxygen');
    expect(getElement('Fe')?.name).toBe('Iron');
    expect(getElement('Xx')).toBeUndefined();
  });

  it('getElementByNumber finds by atomic number', () => {
    expect(getElementByNumber(6)?.symbol).toBe('C');
    expect(getElementByNumber(100)).toBeUndefined();
  });

  it('elementsForTier includes lower tiers', () => {
    const foundation = elementsForTier('foundation');
    expect(foundation.length).toBe(0); // No elements at foundation tier
    const discovery = elementsForTier('discovery');
    expect(discovery.length).toBeGreaterThan(0);
    const creator = elementsForTier('creator');
    expect(creator.length).toBe(36); // All elements
  });
});

// ============================================================================
// Compounds
// ============================================================================
describe('Compounds Data', () => {
  it('has at least 30 compounds', () => {
    expect(COMPOUNDS.length).toBeGreaterThanOrEqual(30);
  });

  it('all compounds have unique formulas', () => {
    const formulas = COMPOUNDS.map(c => c.formula);
    expect(new Set(formulas).size).toBe(formulas.length);
  });

  it('all compounds have element refs', () => {
    for (const c of COMPOUNDS) {
      expect(c.elements.length, `${c.formula} elements`).toBeGreaterThan(0);
    }
  });

  it('all compound elements reference real elements', () => {
    for (const c of COMPOUNDS) {
      for (const el of c.elements) {
        expect(getElement(el.symbol), `${c.formula} → ${el.symbol}`).toBeDefined();
      }
    }
  });

  it('all compounds have accessibility metadata', () => {
    for (const c of COMPOUNDS) {
      expect(c.accessibility, `${c.formula} accessibility`).toBeDefined();
      expect(c.accessibility.spokenName, `${c.formula} spokenName`).toBeTruthy();
      expect(c.accessibility.description, `${c.formula} description`).toBeTruthy();
    }
  });

  it('water is H2O', () => {
    const water = getCompound('H2O');
    expect(water).toBeDefined();
    expect(water!.name).toBe('Water');
    expect(water!.accessibility.spokenName).toBe('water');
  });

  it('getCompound returns undefined for unknown formulas', () => {
    expect(getCompound('XyZ')).toBeUndefined();
  });
});

// ============================================================================
// Reactions
// ============================================================================
describe('Reactions Data', () => {
  it('has at least 20 reactions', () => {
    expect(REACTIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('all reactions have unique IDs', () => {
    const ids = REACTIONS.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all reactions have reactants and products', () => {
    for (const r of REACTIONS) {
      expect(r.reactants.length, `${r.id} reactants`).toBeGreaterThan(0);
      expect(r.products.length, `${r.id} products`).toBeGreaterThan(0);
    }
  });

  it('getReaction finds by ID', () => {
    expect(getReaction('vinegar-baking-soda')?.name).toContain('Vinegar');
    expect(getReaction('nonexistent')).toBeUndefined();
  });

  it('reactionsForTier includes lower tiers', () => {
    const discovery = reactionsForTier('discovery');
    const creator = reactionsForTier('creator');
    expect(creator.length).toBeGreaterThanOrEqual(discovery.length);
  });
});

// ============================================================================
// Materials
// ============================================================================
describe('Materials Data', () => {
  it('has at least 15 materials', () => {
    expect(BUILDING_MATERIALS.length).toBeGreaterThanOrEqual(15);
  });

  it('all materials have positive density', () => {
    for (const m of BUILDING_MATERIALS) {
      expect(m.properties.density, `${m.id} density`).toBeGreaterThan(0);
    }
  });

  it('all materials have accessibility metadata', () => {
    for (const m of BUILDING_MATERIALS) {
      expect(m.accessibility, `${m.id} accessibility`).toBeDefined();
      expect(m.accessibility.spokenName, `${m.id} spokenName`).toBeTruthy();
    }
  });

  it('getMaterial finds by ID', () => {
    expect(getMaterial('pine-wood')?.name).toContain('Pine');
    expect(getMaterial('nope')).toBeUndefined();
  });

  it('materialsForTier includes lower tiers', () => {
    const foundation = materialsForTier('foundation');
    const creator = materialsForTier('creator');
    expect(creator.length).toBeGreaterThanOrEqual(foundation.length);
  });
});

// ============================================================================
// Recipes
// ============================================================================
describe('Recipes Data', () => {
  it('has at least 30 recipes', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(30);
  });

  it('all recipes have unique IDs', () => {
    const ids = RECIPES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all recipes have inputs and output', () => {
    for (const r of RECIPES) {
      expect(r.inputs.length, `${r.id} inputs`).toBeGreaterThan(0);
      expect(r.output, `${r.id} output`).toBeDefined();
    }
  });

  it('all recipes have science explanations', () => {
    for (const r of RECIPES) {
      expect(r.scienceExplanation, `${r.id} explanation`).toBeTruthy();
      expect(r.scienceExplanation.length).toBeGreaterThan(20);
    }
  });

  it('all recipes have skills taught', () => {
    for (const r of RECIPES) {
      expect(r.skillsTaught.length, `${r.id} skillsTaught`).toBeGreaterThan(0);
    }
  });

  it('getRecipe finds by ID', () => {
    const recipe = getRecipe('mix-purple-paint');
    expect(recipe).toBeDefined();
  });

  it('recipesForTierAndBiome filters correctly', () => {
    const workshopFoundation = recipesForTierAndBiome('foundation', 'workshop');
    expect(workshopFoundation.length).toBeGreaterThan(0);
    for (const r of workshopFoundation) {
      expect(r.biome === 'workshop' || r.biome === 'any').toBe(true);
    }
  });
});

// ============================================================================
// Skill Prerequisites
// ============================================================================
describe('Skill Prerequisites', () => {
  it('has entry points (root skills with no prerequisites)', () => {
    const roots = getRootSkills();
    expect(roots.length).toBeGreaterThan(0);
    expect(roots).toContain('math.counting');
    expect(roots).toContain('science.observation');
  });

  it('getPrerequisites returns direct dependencies', () => {
    expect(getPrerequisites('math.arithmetic')).toContain('math.counting');
    expect(getPrerequisites('math.counting')).toEqual([]);
  });

  it('getPrerequisites returns empty for unknown skills', () => {
    expect(getPrerequisites('nonexistent')).toEqual([]);
  });

  it('getAllPrerequisites returns transitive dependencies', () => {
    const all = getAllPrerequisites('math.geometry');
    expect(all).toContain('math.shapes');
    expect(all).toContain('math.arithmetic');
    expect(all).toContain('math.counting'); // transitive
  });

  it('arePrerequisitesMet checks threshold', () => {
    const levels = new Map<string, number>([
      ['math.counting', 0.5],
      ['math.number-sense', 0.5],
    ]);
    expect(arePrerequisitesMet('math.arithmetic', levels, 0.3)).toBe(true);
    expect(arePrerequisitesMet('math.arithmetic', levels, 0.8)).toBe(false);
  });

  it('arePrerequisitesMet returns true for root skills', () => {
    expect(arePrerequisitesMet('math.counting', new Map())).toBe(true);
  });

  it('getDependents finds skills that depend on a skill', () => {
    const deps = getDependents('math.counting');
    expect(deps).toContain('math.number-sense');
    expect(deps).toContain('math.patterns');
  });

  it('no circular dependencies', () => {
    // Ensure we can compute all prerequisites for every skill without infinite loop
    for (const skillId of Object.keys(SKILL_PREREQUISITES)) {
      const all = getAllPrerequisites(skillId);
      expect(all).not.toContain(skillId);
    }
  });
});

// ============================================================================
// Biomes
// ============================================================================
describe('Biome Data', () => {
  it('has 12 biome IDs', () => {
    expect(BIOME_IDS).toHaveLength(12);
  });

  it('isValidBiome returns true for valid IDs', () => {
    expect(isValidBiome('workshop')).toBe(true);
    expect(isValidBiome('living-forest')).toBe(true);
    expect(isValidBiome('nope')).toBe(false);
  });

  it('all biomes have accessibility metadata', () => {
    for (const id of BIOME_IDS) {
      const a11y = getBiomeAccessibility(id);
      expect(a11y, `${id} accessibility`).toBeDefined();
      expect(a11y!.spokenName).toBeTruthy();
      expect(a11y!.description).toBeTruthy();
      expect(a11y!.ambientDescription).toBeTruthy();
    }
  });
});
