// CraftSystem tests — chemistry, physics, and recipe crafting
// Validates real science: stoichiometry, structural analysis, balanced equations

import { describe, it, expect, beforeEach } from 'vitest';
import { CraftSystem } from '../../src/systems/craft.js';
import { ELEMENTS, getElement, getElementByNumber, elementsForTier } from '../../src/data/elements.js';
import { COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier } from '../../src/data/compounds.js';
import { RECIPES, getRecipe, recipesForTierAndBiome } from '../../src/data/recipes.js';
import { BUILDING_MATERIALS, getMaterial, materialsForTier } from '../../src/data/materials.js';
import type { ChemicalReaction, CraftRecipe, RecipeInput, StructuralElement } from '../../src/types/craft.js';
import { World } from '../../src/ecs/world.js';

// ---------------------------------------------------------------------------
// Elements (periodic table data)
// ---------------------------------------------------------------------------

describe('Elements — Periodic Table Data', () => {
  it('contains first 36 elements (H through Kr)', () => {
    expect(ELEMENTS.length).toBe(36);
    expect(ELEMENTS[0].symbol).toBe('H');
    expect(ELEMENTS[0].atomicNumber).toBe(1);
    expect(ELEMENTS[35].symbol).toBe('Kr');
    expect(ELEMENTS[35].atomicNumber).toBe(36);
  });

  it('has correct atomic masses for well-known elements', () => {
    const h = getElement('H')!;
    expect(h.atomicMass).toBeCloseTo(1.008, 2);

    const c = getElement('C')!;
    expect(c.atomicMass).toBeCloseTo(12.011, 2);

    const o = getElement('O')!;
    expect(o.atomicMass).toBeCloseTo(15.999, 2);

    const fe = getElement('Fe')!;
    expect(fe.atomicMass).toBeCloseTo(55.845, 2);

    const na = getElement('Na')!;
    expect(na.atomicMass).toBeCloseTo(22.990, 2);
  });

  it('assigns correct element categories', () => {
    expect(getElement('H')!.category).toBe('nonmetal');
    expect(getElement('He')!.category).toBe('noble-gas');
    expect(getElement('Na')!.category).toBe('alkali-metal');
    expect(getElement('Ca')!.category).toBe('alkaline-earth-metal');
    expect(getElement('Fe')!.category).toBe('transition-metal');
    expect(getElement('Si')!.category).toBe('metalloid');
    expect(getElement('Cl')!.category).toBe('halogen');
    expect(getElement('Al')!.category).toBe('post-transition-metal');
  });

  it('looks up elements by atomic number', () => {
    expect(getElementByNumber(1)!.symbol).toBe('H');
    expect(getElementByNumber(26)!.symbol).toBe('Fe');
    expect(getElementByNumber(79)).toBeUndefined(); // gold not in first 36
  });

  it('returns undefined for unknown element symbols', () => {
    expect(getElement('Xx')).toBeUndefined();
  });

  it('filters elements by mastery tier', () => {
    const foundationElements = elementsForTier('foundation');
    expect(foundationElements.length).toBe(0); // no elements at foundation

    const discoveryElements = elementsForTier('discovery');
    expect(discoveryElements.length).toBeGreaterThan(0);
    expect(discoveryElements.every(e => e.discoveryTier === 'discovery')).toBe(true);

    const allElements = elementsForTier('creator');
    expect(allElements.length).toBe(36);
  });

  it('has strictly increasing atomic numbers', () => {
    for (let i = 1; i < ELEMENTS.length; i++) {
      expect(ELEMENTS[i].atomicNumber).toBe(ELEMENTS[i - 1].atomicNumber + 1);
    }
  });
});

// ---------------------------------------------------------------------------
// Compounds
// ---------------------------------------------------------------------------

describe('Compounds — Real Chemical Substances', () => {
  it('contains at least 30 compounds', () => {
    expect(COMPOUNDS.length).toBeGreaterThanOrEqual(30);
  });

  it('has water (H2O) with correct composition', () => {
    const water = getCompound('H2O')!;
    expect(water).toBeDefined();
    expect(water.name).toBe('Water');
    expect(water.elements).toEqual([
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ]);
    expect(water.properties.state).toBe('liquid');
    expect(water.properties.hazardous).toBe(false);
  });

  it('has salt (NaCl) with correct composition', () => {
    const salt = getCompound('NaCl')!;
    expect(salt).toBeDefined();
    expect(salt.name).toBe('Salt');
    expect(salt.elements).toEqual([
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ]);
    expect(salt.properties.state).toBe('solid');
  });

  it('has glucose with correct complex formula', () => {
    const glucose = getCompound('C6H12O6')!;
    expect(glucose).toBeDefined();
    expect(glucose.name).toBe('Glucose');
    const totalAtoms = glucose.elements.reduce((sum, e) => sum + e.count, 0);
    expect(totalAtoms).toBe(24); // 6 + 12 + 6
  });

  it('marks hazardous compounds correctly', () => {
    expect(getCompound('H2')!.properties.hazardous).toBe(true);
    expect(getCompound('HCl')!.properties.hazardous).toBe(true);
    expect(getCompound('H2O')!.properties.hazardous).toBe(false);
    expect(getCompound('NaCl')!.properties.hazardous).toBe(false);
  });

  it('returns undefined for unknown formulas', () => {
    expect(getCompound('XyZ')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Chemical Reactions — stoichiometry
// ---------------------------------------------------------------------------

describe('Chemical Reactions — Stoichiometry', () => {
  let craft: CraftSystem;

  beforeEach(() => {
    craft = new CraftSystem();
  });

  it('contains at least 20 reactions', () => {
    expect(REACTIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('water synthesis is balanced: 2H₂ + O₂ → 2H₂O', () => {
    const reaction = getReaction('water-synthesis')!;
    expect(reaction).toBeDefined();
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('rust formation is balanced: 4Fe + 3O₂ → 2Fe₂O₃', () => {
    const reaction = getReaction('rust-formation')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('Haber process is balanced: N₂ + 3H₂ → 2NH₃', () => {
    const reaction = getReaction('haber-process')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('acid-base neutralization is balanced: HCl + NaOH → NaCl + H₂O', () => {
    const reaction = getReaction('acid-base-neutralization')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('methane combustion is balanced: CH₄ + 2O₂ → CO₂ + 2H₂O', () => {
    const reaction = getReaction('methane-combustion')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('photosynthesis is balanced: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', () => {
    const reaction = getReaction('photosynthesis-simplified')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('lime kiln is balanced: CaCO₃ → CaO + CO₂', () => {
    const reaction = getReaction('lime-kiln')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('aspirin synthesis is balanced', () => {
    const reaction = getReaction('aspirin-synthesis')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('thermite reaction is balanced: 2Al + Fe₂O₃ → Al₂O₃ + 2Fe', () => {
    const reaction = getReaction('thermite-reaction')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('electrolysis of water is balanced: 2H₂O → 2H₂ + O₂', () => {
    const reaction = getReaction('electrolysis-water')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('vinegar + baking soda is balanced', () => {
    const reaction = getReaction('vinegar-baking-soda')!;
    expect(craft.isBalanced(reaction)).toBe(true);
  });

  it('detects an unbalanced reaction', () => {
    const unbalanced: ChemicalReaction = {
      id: 'fake-unbalanced',
      name: 'Intentionally unbalanced',
      reactants: [{ formula: 'H2', moles: 1 }, { formula: 'O2', moles: 1 }],
      products: [{ formula: 'H2O', moles: 1 }],
      energyChange: 'exothermic',
      tier: 'builder',
    };
    // Left: H=2, O=2. Right: H=2, O=1. Not balanced.
    expect(craft.isBalanced(unbalanced)).toBe(false);
  });

  it('correctly identifies energy changes', () => {
    expect(getReaction('water-synthesis')!.energyChange).toBe('exothermic');
    expect(getReaction('photosynthesis-simplified')!.energyChange).toBe('endothermic');
    expect(getReaction('electrolysis-water')!.energyChange).toBe('endothermic');
    expect(getReaction('lime-kiln')!.energyChange).toBe('endothermic');
  });

  it('filters reactions by tier', () => {
    const discoveryReactions = reactionsForTier('discovery');
    expect(discoveryReactions.length).toBeGreaterThan(0);
    expect(discoveryReactions.every(r => r.tier === 'discovery')).toBe(true);

    const allReactions = reactionsForTier('creator');
    expect(allReactions.length).toBe(REACTIONS.length);
  });
});

// ---------------------------------------------------------------------------
// Formula composition parser
// ---------------------------------------------------------------------------

describe('Formula Composition Parser', () => {
  let craft: CraftSystem;

  beforeEach(() => {
    craft = new CraftSystem();
  });

  it('parses H2O correctly', () => {
    const comp = craft.getFormulaComposition('H2O');
    expect(comp).toEqual({ H: 2, O: 1 });
  });

  it('parses Fe2O3 correctly', () => {
    const comp = craft.getFormulaComposition('Fe2O3');
    expect(comp).toEqual({ Fe: 2, O: 3 });
  });

  it('parses C6H12O6 (glucose) correctly', () => {
    const comp = craft.getFormulaComposition('C6H12O6');
    expect(comp).toEqual({ C: 6, H: 12, O: 6 });
  });

  it('parses single-letter elements like NaCl', () => {
    const comp = craft.getFormulaComposition('NaCl');
    expect(comp).toEqual({ Na: 1, Cl: 1 });
  });

  it('handles pure elements like Fe', () => {
    const comp = craft.getFormulaComposition('Fe');
    expect(comp).toEqual({ Fe: 1 });
  });

  it('handles pure elements like Al', () => {
    const comp = craft.getFormulaComposition('Al');
    expect(comp).toEqual({ Al: 1 });
  });
});

// ---------------------------------------------------------------------------
// Building Materials
// ---------------------------------------------------------------------------

describe('Building Materials — Real Physical Properties', () => {
  it('contains at least 15 materials', () => {
    expect(BUILDING_MATERIALS.length).toBeGreaterThanOrEqual(15);
  });

  it('steel is denser than wood', () => {
    const steel = getMaterial('mild-steel')!;
    const pine = getMaterial('pine-wood')!;
    expect(steel.properties.density).toBeGreaterThan(pine.properties.density);
  });

  it('steel has higher tensile strength than concrete', () => {
    const steel = getMaterial('mild-steel')!;
    const concrete = getMaterial('concrete')!;
    expect(steel.properties.tensileStrength).toBeGreaterThan(concrete.properties.tensileStrength);
  });

  it('concrete is weak in tension but strong in compression (real engineering fact)', () => {
    const concrete = getMaterial('concrete')!;
    expect(concrete.properties.compressiveStrength).toBeGreaterThan(
      concrete.properties.tensileStrength * 5,
    );
  });

  it('reinforced concrete has better tensile strength than plain concrete', () => {
    const plain = getMaterial('concrete')!;
    const reinforced = getMaterial('reinforced-concrete')!;
    expect(reinforced.properties.tensileStrength).toBeGreaterThan(
      plain.properties.tensileStrength,
    );
  });

  it('wood is flammable, stone is not', () => {
    expect(getMaterial('pine-wood')!.properties.flammable).toBe(true);
    expect(getMaterial('oak-wood')!.properties.flammable).toBe(true);
    expect(getMaterial('granite')!.properties.flammable).toBe(false);
    expect(getMaterial('mild-steel')!.properties.flammable).toBe(false);
  });

  it('carbon fiber composite has exceptional strength-to-weight ratio', () => {
    const cf = getMaterial('carbon-fiber-composite')!;
    const steel = getMaterial('mild-steel')!;
    const cfRatio = cf.properties.tensileStrength / cf.properties.density;
    const steelRatio = steel.properties.tensileStrength / steel.properties.density;
    expect(cfRatio).toBeGreaterThan(steelRatio);
  });

  it('returns undefined for unknown materials', () => {
    expect(getMaterial('unobtanium')).toBeUndefined();
  });

  it('filters materials by tier', () => {
    const foundationMats = materialsForTier('foundation');
    expect(foundationMats.length).toBeGreaterThan(0);
    expect(foundationMats.every(m => m.tier === 'foundation')).toBe(true);

    const allMats = materialsForTier('creator');
    expect(allMats.length).toBe(BUILDING_MATERIALS.length);
  });

  it('all materials have positive physical properties', () => {
    for (const mat of BUILDING_MATERIALS) {
      expect(mat.properties.density).toBeGreaterThan(0);
      expect(mat.properties.tensileStrength).toBeGreaterThan(0);
      expect(mat.properties.compressiveStrength).toBeGreaterThan(0);
      expect(mat.properties.elasticity).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Structural Analysis
// ---------------------------------------------------------------------------

describe('Structural Analysis', () => {
  let craft: CraftSystem;

  beforeEach(() => {
    craft = new CraftSystem();
  });

  it('returns unstable for empty structure', () => {
    const analysis = craft.analyzeStructure([]);
    expect(analysis.stable).toBe(false);
    expect(analysis.maxLoad).toBe(0);
    expect(analysis.safetyFactor).toBe(0);
  });

  it('a steel column supports significant load', () => {
    const column: StructuralElement = {
      type: 'column',
      material: 'mild-steel',
      dimensions: { length: 3, width: 0.3, height: 0.3 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([column]);
    expect(analysis.stable).toBe(true);
    expect(analysis.maxLoad).toBeGreaterThan(0);
    expect(analysis.safetyFactor).toBeGreaterThan(1);
  });

  it('a foundation provides stability', () => {
    const foundation: StructuralElement = {
      type: 'foundation',
      material: 'concrete',
      dimensions: { length: 4, width: 4, height: 0.5 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([foundation]);
    expect(analysis.stable).toBe(true);
    expect(analysis.safetyFactor).toBeGreaterThan(1);
  });

  it('a wooden beam has a finite load capacity', () => {
    const beam: StructuralElement = {
      type: 'beam',
      material: 'oak-wood',
      dimensions: { length: 4, width: 0.2, height: 0.3 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([beam]);
    expect(analysis.maxLoad).toBeGreaterThan(0);
    expect(analysis.weakPoints.length).toBeGreaterThan(0);
  });

  it('steel beam handles more load than pine beam of same dimensions', () => {
    const dims = { length: 5, width: 0.2, height: 0.3 };
    const pos = { x: 0, y: 0, z: 0 };
    const rot = { x: 0, y: 0, z: 0 };

    const steelBeam: StructuralElement = { type: 'beam', material: 'mild-steel', dimensions: dims, position: pos, rotation: rot };
    const woodBeam: StructuralElement = { type: 'beam', material: 'pine-wood', dimensions: dims, position: pos, rotation: rot };

    const steelAnalysis = craft.analyzeStructure([steelBeam]);
    const woodAnalysis = craft.analyzeStructure([woodBeam]);

    expect(steelAnalysis.maxLoad).toBeGreaterThan(woodAnalysis.maxLoad);
  });

  it('arch has higher capacity than plain wall of same material', () => {
    const dims = { length: 5, width: 0.3, height: 0.3 };
    const pos = { x: 0, y: 0, z: 0 };
    const rot = { x: 0, y: 0, z: 0 };

    const arch: StructuralElement = { type: 'arch', material: 'limestone', dimensions: dims, position: pos, rotation: rot };
    const wall: StructuralElement = { type: 'wall', material: 'limestone', dimensions: dims, position: pos, rotation: rot };

    const archAnalysis = craft.analyzeStructure([arch]);
    const wallAnalysis = craft.analyzeStructure([wall]);

    expect(archAnalysis.maxLoad).toBeGreaterThan(wallAnalysis.maxLoad);
  });

  it('handles unknown material gracefully', () => {
    const element: StructuralElement = {
      type: 'column',
      material: 'unobtanium',
      dimensions: { length: 3, width: 0.3, height: 0.3 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([element]);
    expect(analysis).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

describe('Recipes — Game-Facing Crafting', () => {
  it('contains at least 30 recipes', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(30);
  });

  it('has recipes for all five tiers', () => {
    const tiers = new Set(RECIPES.map(r => r.tier));
    expect(tiers.has('foundation')).toBe(true);
    expect(tiers.has('discovery')).toBe(true);
    expect(tiers.has('builder')).toBe(true);
    expect(tiers.has('innovator')).toBe(true);
    expect(tiers.has('creator')).toBe(true);
  });

  it('every recipe has at least one skill taught', () => {
    for (const recipe of RECIPES) {
      expect(recipe.skillsTaught.length).toBeGreaterThan(0);
    }
  });

  it('every recipe has a science explanation', () => {
    for (const recipe of RECIPES) {
      expect(recipe.scienceExplanation.length).toBeGreaterThan(10);
    }
  });

  it('filters recipes by tier and biome', () => {
    const workshopFoundation = recipesForTierAndBiome('foundation', 'workshop');
    expect(workshopFoundation.length).toBeGreaterThan(0);
    for (const r of workshopFoundation) {
      expect(r.biome === 'workshop' || r.biome === 'any').toBe(true);
    }

    const labBuilder = recipesForTierAndBiome('builder', 'alchemist-lab');
    expect(labBuilder.length).toBeGreaterThan(0);
  });

  it('every recipe has a unique id', () => {
    const ids = RECIPES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up recipe by id', () => {
    const recipe = getRecipe('water-from-elements');
    expect(recipe).toBeDefined();
    expect(recipe!.name).toBe('Synthesize Water');
  });
});

// ---------------------------------------------------------------------------
// CraftSystem — attemptCraft
// ---------------------------------------------------------------------------

describe('CraftSystem — attemptCraft', () => {
  let craft: CraftSystem;

  beforeEach(() => {
    craft = new CraftSystem();
  });

  it('succeeds with correct inputs for water synthesis', () => {
    const recipe = getRecipe('water-from-elements')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'H2', quantity: 2 },
      { type: 'compound', id: 'O2', quantity: 1 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('H2O');
    expect(result.output!.quantity).toBe(2);
    expect(result.learningEvents.length).toBeGreaterThan(0);
  });

  it('fails when an input is missing', () => {
    const recipe = getRecipe('water-from-elements')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'H2', quantity: 2 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(false);
    expect(result.failureReason).toContain('Missing');
  });

  it('fails when an input has insufficient quantity', () => {
    const recipe = getRecipe('water-from-elements')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'H2', quantity: 1 },
      { type: 'compound', id: 'O2', quantity: 1 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(false);
    expect(result.failureReason).toContain('insufficient');
  });

  it('succeeds for foundation tier recipes (color mixing)', () => {
    const recipe = getRecipe('mix-purple-paint')!;
    const inputs: RecipeInput[] = [
      { type: 'item', id: 'red-pigment', quantity: 1 },
      { type: 'item', id: 'blue-pigment', quantity: 1 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('purple-pigment');
  });

  it('succeeds for fizzy volcano (vinegar + baking soda)', () => {
    const recipe = getRecipe('fizzy-volcano')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'CH3COOH', quantity: 1 },
      { type: 'compound', id: 'NaHCO3', quantity: 1 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('CO2');
    expect(result.learningEvents).toContain('acid-base-intro');
  });

  it('succeeds for aspirin synthesis (innovator tier)', () => {
    const recipe = getRecipe('aspirin-craft')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'C7H6O3', quantity: 1 },
      { type: 'compound', id: 'C4H6O3', quantity: 1 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('C9H8O4');
    expect(result.learningEvents).toContain('organic-synthesis');
  });

  it('succeeds for smelt iron recipe', () => {
    const recipe = getRecipe('smelt-iron')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'Fe2O3', quantity: 1 },
      { type: 'element', id: 'C', quantity: 3 },
    ];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('Fe');
    expect(result.output!.quantity).toBe(2);
  });

  it('fails with unknown compound input', () => {
    const recipe: CraftRecipe = {
      id: 'test-bad-input',
      name: 'Bad Recipe',
      description: 'test',
      tier: 'builder',
      biome: 'any',
      inputs: [{ type: 'compound', id: 'FAKE123', quantity: 1 }],
      output: { type: 'item', id: 'nothing', quantity: 1 },
      skillsTaught: ['nothing'],
      scienceExplanation: 'test',
    };
    const inputs: RecipeInput[] = [{ type: 'compound', id: 'FAKE123', quantity: 1 }];
    const result = craft.attemptCraft(recipe, inputs);
    expect(result.success).toBe(false);
    expect(result.failureReason).toContain('Unknown');
  });

  it('getAvailableRecipes returns recipes filtered by tier and biome', () => {
    const recipes = craft.getAvailableRecipes('discovery', 'alchemist-lab');
    expect(recipes.length).toBeGreaterThan(0);
    for (const r of recipes) {
      expect(r.biome === 'alchemist-lab' || r.biome === 'any').toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// CraftSystem — ECS integration (queueCraft + update)
// ---------------------------------------------------------------------------

describe('CraftSystem — ECS Integration', () => {
  let craft: CraftSystem;
  let world: World;

  beforeEach(() => {
    craft = new CraftSystem();
    world = new World();
    world.addSystem(craft);
  });

  it('processes queued crafts on update and emits learning events', async () => {
    const recipe = getRecipe('mix-green-paint')!;
    const inputs: RecipeInput[] = [
      { type: 'item', id: 'yellow-pigment', quantity: 1 },
      { type: 'item', id: 'blue-pigment', quantity: 1 },
    ];

    const resultPromise = craft.queueCraft(recipe, inputs);
    world.update(0.016); // one frame

    const result = await resultPromise;
    expect(result.success).toBe(true);
    expect(result.output!.id).toBe('green-pigment');
  });

  it('emits learning events into the world during update', async () => {
    const recipe = getRecipe('neutralization')!;
    const inputs: RecipeInput[] = [
      { type: 'compound', id: 'HCl', quantity: 1 },
      { type: 'compound', id: 'NaOH', quantity: 1 },
    ];

    const events: Array<{ type: string; data: unknown }> = [];
    const originalEmit = world.emitEvent.bind(world);
    world.emitEvent = (event) => {
      events.push(event);
      originalEmit(event);
    };

    const resultPromise = craft.queueCraft(recipe, inputs);
    world.update(0.016);
    await resultPromise;

    const learningEvents = events.filter(e => e.type === 'learning_event');
    expect(learningEvents.length).toBeGreaterThan(0);
  });

  it('has correct priority (40, after inventory)', () => {
    expect(craft.priority).toBe(40);
    expect(craft.name).toBe('craft');
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: recipes reference valid data
// ---------------------------------------------------------------------------

describe('Data Integrity — Cross-Referencing', () => {
  it('all compound recipe inputs reference known compounds', () => {
    for (const recipe of RECIPES) {
      for (const input of recipe.inputs) {
        if (input.type === 'compound') {
          const compound = getCompound(input.id);
          expect(compound, `Recipe "${recipe.id}" references unknown compound "${input.id}"`).toBeDefined();
        }
      }
    }
  });

  it('all element recipe inputs reference known elements', () => {
    for (const recipe of RECIPES) {
      for (const input of recipe.inputs) {
        if (input.type === 'element') {
          const element = getElement(input.id);
          expect(element, `Recipe "${recipe.id}" references unknown element "${input.id}"`).toBeDefined();
        }
      }
    }
  });

  it('all material recipe inputs reference known building materials', () => {
    for (const recipe of RECIPES) {
      for (const input of recipe.inputs) {
        if (input.type === 'material') {
          const material = getMaterial(input.id);
          expect(material, `Recipe "${recipe.id}" references unknown material "${input.id}"`).toBeDefined();
        }
      }
    }
  });

  it('all compound elements reference known periodic table elements', () => {
    for (const compound of COMPOUNDS) {
      for (const ref of compound.elements) {
        const el = getElement(ref.symbol);
        expect(el, `Compound "${compound.formula}" references unknown element "${ref.symbol}"`).toBeDefined();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Accessibility metadata
// ---------------------------------------------------------------------------

describe('Accessibility — Elements', () => {
  it('every element has accessibility metadata', () => {
    for (const el of ELEMENTS) {
      expect(el.accessibility, `Element ${el.symbol} missing accessibility`).toBeDefined();
      expect(el.accessibility.spokenName.length).toBeGreaterThan(0);
      expect(el.accessibility.description.length).toBeGreaterThan(10);
    }
  });

  it('spokenName is lowercase and human-readable', () => {
    const h = getElement('H')!;
    expect(h.accessibility.spokenName).toBe('hydrogen');
    const fe = getElement('Fe')!;
    expect(fe.accessibility.spokenName).toBe('iron');
  });

  it('every element has an iconShape for color-blind identification', () => {
    for (const el of ELEMENTS) {
      expect(el.accessibility.iconShape, `Element ${el.symbol} missing iconShape`).toBeDefined();
      expect(el.accessibility.iconShape!.length).toBeGreaterThan(0);
    }
  });

  it('different categories map to different icon shapes', () => {
    const shapes = new Set(ELEMENTS.map(e => e.accessibility.iconShape));
    // We have 8 categories, so should have multiple distinct shapes
    expect(shapes.size).toBeGreaterThanOrEqual(5);
  });

  it('elements are identifiable by symbol+name, not just color', () => {
    // Every element has spokenName (the full name) — no reliance on color
    for (const el of ELEMENTS) {
      expect(el.accessibility.spokenName).toBe(el.name.toLowerCase());
    }
  });
});

describe('Accessibility — Compounds', () => {
  it('every compound has accessibility metadata', () => {
    for (const c of COMPOUNDS) {
      expect(c.accessibility, `Compound ${c.formula} missing accessibility`).toBeDefined();
      expect(c.accessibility.spokenName.length).toBeGreaterThan(0);
      expect(c.accessibility.description.length).toBeGreaterThan(10);
    }
  });

  it('spokenFormula describes composition in plain English', () => {
    const water = getCompound('H2O')!;
    expect(water.accessibility.spokenFormula).toBeDefined();
    // Should mention H and O
    expect(water.accessibility.spokenFormula!.toLowerCase()).toContain('h');
    expect(water.accessibility.spokenFormula!.toLowerCase()).toContain('o');
  });

  it('water has human-friendly spokenName, not formula', () => {
    const water = getCompound('H2O')!;
    expect(water.accessibility.spokenName).toBe('water');
  });

  it('salt has human-friendly spokenName', () => {
    const salt = getCompound('NaCl')!;
    expect(salt.accessibility.spokenName).toBe('salt');
  });

  it('every compound has an iconShape', () => {
    for (const c of COMPOUNDS) {
      expect(c.accessibility.iconShape, `Compound ${c.formula} missing iconShape`).toBeDefined();
    }
  });

  it('iconShape varies by physical state', () => {
    const water = getCompound('H2O')!; // liquid
    const salt = getCompound('NaCl')!;  // solid
    const co2 = getCompound('CO2')!;    // gas
    // Different states should have different shapes
    expect(water.accessibility.iconShape).not.toBe(salt.accessibility.iconShape);
    expect(co2.accessibility.iconShape).not.toBe(salt.accessibility.iconShape);
  });
});

describe('Accessibility — Building Materials', () => {
  it('every material has accessibility metadata', () => {
    for (const mat of BUILDING_MATERIALS) {
      expect(mat.accessibility, `Material ${mat.id} missing accessibility`).toBeDefined();
      expect(mat.accessibility.spokenName.length).toBeGreaterThan(0);
      expect(mat.accessibility.description.length).toBeGreaterThan(10);
    }
  });

  it('spokenName is human-friendly, not the id', () => {
    const pine = getMaterial('pine-wood')!;
    expect(pine.accessibility.spokenName).not.toContain('-');
    expect(pine.accessibility.spokenName.toLowerCase()).toContain('pine');
  });

  it('every material has an iconShape', () => {
    for (const mat of BUILDING_MATERIALS) {
      expect(mat.accessibility.iconShape, `Material ${mat.id} missing iconShape`).toBeDefined();
    }
  });

  it('materials have descriptions with real physical property info', () => {
    const steel = getMaterial('mild-steel')!;
    expect(steel.accessibility.description.length).toBeGreaterThan(20);
  });
});

describe('Accessibility — Recipes', () => {
  it('every recipe has accessibility metadata', () => {
    for (const recipe of RECIPES) {
      expect(recipe.accessibility, `Recipe ${recipe.id} missing accessibility`).toBeDefined();
      expect(recipe.accessibility.spokenName.length).toBeGreaterThan(0);
      expect(recipe.accessibility.description.length).toBeGreaterThan(10);
    }
  });

  it('recipe spokenFormula describes inputs and outputs', () => {
    const water = getRecipe('water-from-elements')!;
    expect(water.accessibility.spokenFormula).toBeDefined();
    expect(water.accessibility.spokenFormula!.length).toBeGreaterThan(0);
  });

  it('recipe descriptions work for screen readers (no visual-only info)', () => {
    for (const recipe of RECIPES) {
      const desc = recipe.accessibility.description.toLowerCase();
      // Should not reference colors as the only identifier
      expect(desc).not.toMatch(/\bthe (red|blue|green) one\b/);
    }
  });

  it('every recipe has an iconShape', () => {
    for (const recipe of RECIPES) {
      expect(recipe.accessibility.iconShape, `Recipe ${recipe.id} missing iconShape`).toBeDefined();
    }
  });

  it('recipe descriptions mention tap-based interactions, not drag', () => {
    for (const recipe of RECIPES) {
      const desc = recipe.accessibility.description.toLowerCase();
      // Must not require drag-and-drop
      expect(desc).not.toContain('drag');
    }
  });
});

describe('Accessibility — Structural Analysis Announcements', () => {
  let craft: CraftSystem;

  beforeEach(() => {
    craft = new CraftSystem();
  });

  it('empty structure gets an announcement', () => {
    const analysis = craft.analyzeStructure([]);
    expect(analysis.announcement).toBeDefined();
    expect(analysis.announcement!.length).toBeGreaterThan(0);
  });

  it('stable structure announcement says "stable"', () => {
    const column: StructuralElement = {
      type: 'column',
      material: 'mild-steel',
      dimensions: { length: 3, width: 0.3, height: 0.3 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([column]);
    expect(analysis.announcement).toContain('stable');
  });

  it('stable structure announcement mentions load capacity', () => {
    const foundation: StructuralElement = {
      type: 'foundation',
      material: 'concrete',
      dimensions: { length: 4, width: 4, height: 0.5 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const analysis = craft.analyzeStructure([foundation]);
    expect(analysis.announcement).toContain('kilogram');
  });

  it('describeStructuralAnalysis produces human-readable text', () => {
    const description = craft.describeStructuralAnalysis({
      stable: false,
      maxLoad: 0,
      weakPoints: [{ x: 1, y: 2, z: 3 }],
      safetyFactor: 0.5,
      failureMode: 'buckling',
    });
    expect(description).toContain('unstable');
    expect(description).toContain('buckle');
  });

  it('describeStructuralAnalysis handles stable structures', () => {
    const description = craft.describeStructuralAnalysis({
      stable: true,
      maxLoad: 50000,
      weakPoints: [{ x: 0, y: 0, z: 0 }],
      safetyFactor: 2.5,
    });
    expect(description).toContain('stable');
    expect(description).toContain('kilogram');
  });

  it('announces narrow safety margin with warning', () => {
    const description = craft.describeStructuralAnalysis({
      stable: true,
      maxLoad: 1000,
      weakPoints: [{ x: 0, y: 0, z: 0 }],
      safetyFactor: 1.2,
    });
    expect(description).toContain('narrow');
  });
});

