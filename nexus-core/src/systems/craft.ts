// CraftSystem — ECS system for chemistry, physics, and recipe crafting
// All crafting is grounded in real science: stoichiometry, structural analysis, etc.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  ChemicalReaction,
  CraftRecipe,
  CraftResult,
  RecipeInput,
  StructuralAnalysis,
  StructuralElement,
} from '../types/craft.js';
import type { MasteryTier } from '../types/components.js';
import type { Vec3 } from '../types/scene.js';
import { getCompound, REACTIONS } from '../data/compounds.js';
import { getElement } from '../data/elements.js';
import { recipesForTierAndBiome } from '../data/recipes.js';
import { getMaterial } from '../data/materials.js';

// ---------------------------------------------------------------------------
// Gravity constant (m/s²)
// ---------------------------------------------------------------------------
const G = 9.81;

// ---------------------------------------------------------------------------
// CraftSystem
// ---------------------------------------------------------------------------

export class CraftSystem implements System {
  readonly name = 'craft';
  readonly priority = 40;

  // Queue of craft actions to process on next update()
  private pendingCrafts: Array<{
    recipe: CraftRecipe;
    inputs: RecipeInput[];
    resolve: (result: CraftResult) => void;
  }> = [];

  // ── ECS lifecycle ────────────────────────────────────────────────────────

  update(world: World, _dt: number): void {
    const crafts = this.pendingCrafts.splice(0);

    for (const { recipe, inputs, resolve } of crafts) {
      const result = this.executeCraft(recipe, inputs);

      // Emit learning events into the world
      for (const skill of result.learningEvents) {
        world.emitEvent({ type: 'learning_event', data: { skill, source: 'craft', recipeId: recipe.id } });
      }

      resolve(result);
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Queue a craft to be processed on the next update().
   * Returns a promise that resolves with the CraftResult.
   */
  queueCraft(recipe: CraftRecipe, inputs: RecipeInput[]): Promise<CraftResult> {
    return new Promise(resolve => {
      this.pendingCrafts.push({ recipe, inputs, resolve });
    });
  }

  /**
   * Synchronously attempt a craft — validates inputs against real science.
   * Preferred for direct (non-ECS-loop) usage.
   */
  attemptCraft(recipe: CraftRecipe, providedInputs: RecipeInput[]): CraftResult {
    return this.executeCraft(recipe, providedInputs);
  }

  /**
   * Check whether a chemical reaction has balanced stoichiometry.
   * Counts total atoms of each element on both sides of the equation.
   */
  isBalanced(reaction: ChemicalReaction): boolean {
    const countSide = (side: ChemicalReaction['reactants']): Record<string, number> => {
      const totals: Record<string, number> = {};
      for (const { formula, moles } of side) {
        const composition = this.getFormulaComposition(formula);
        for (const [sym, count] of Object.entries(composition)) {
          totals[sym] = (totals[sym] ?? 0) + count * moles;
        }
      }
      return totals;
    };

    const left = countSide(reaction.reactants);
    const right = countSide(reaction.products);

    const allSymbols = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const sym of allSymbols) {
      const l = left[sym] ?? 0;
      const r = right[sym] ?? 0;
      // Allow tiny floating-point tolerance
      if (Math.abs(l - r) > 0.001) return false;
    }
    return true;
  }

  /**
   * Perform basic structural analysis on a set of structural elements.
   * Uses simplified engineering formulas appropriate for the game context.
   */
  analyzeStructure(elements: StructuralElement[]): StructuralAnalysis {
    if (elements.length === 0) {
      return {
        stable: false, maxLoad: 0, weakPoints: [], safetyFactor: 0, failureMode: 'overturning',
        announcement: 'This structure has no elements. Add structural components to begin building.',
      };
    }

    let totalCapacity = Infinity;
    let totalWeight = 0;
    const weakPoints: Vec3[] = [];
    let criticalFailure: StructuralAnalysis['failureMode'] | undefined;

    const hasFoundation = elements.some(e => e.type === 'foundation');
    const hasVertical = elements.some(e => e.type === 'column' || e.type === 'wall');

    for (const el of elements) {
      const mat = getMaterial(el.material);
      if (!mat) continue;

      const { length, width, height } = el.dimensions;
      const volume = length * width * height;
      const crossSection = width * height; // m²
      const weight = volume * mat.properties.density * G; // Newtons
      totalWeight += weight;

      let elementCapacity: number;
      let failMode: StructuralAnalysis['failureMode'];

      switch (el.type) {
        case 'column': {
          // Euler buckling: Pcr = π²EI/(KL)² where K=1.0 (pinned-pinned assumed)
          // I = (width * height³) / 12 for a rectangular cross-section
          const I = (width * Math.pow(height, 3)) / 12;
          const bucklingLoad = (Math.PI * Math.PI * mat.properties.elasticity * 1e9 * I) /
            (length * length);
          const crushLoad = mat.properties.compressiveStrength * 1e6 * crossSection;
          elementCapacity = Math.min(bucklingLoad, crushLoad);
          failMode = bucklingLoad < crushLoad ? 'buckling' : 'compression';
          break;
        }
        case 'beam': {
          // Simplified max bending load for simply-supported beam: P = 4 * σ * I / (L * c)
          // where c = height/2, I = (width * height³)/12
          const I = (width * Math.pow(height, 3)) / 12;
          const c = height / 2;
          const bendingLoad = (4 * mat.properties.tensileStrength * 1e6 * I) / (length * c);
          // Shear capacity: V = τ * A (approximation, τ ≈ 0.6 * tensile for metals)
          const shearLoad = 0.6 * mat.properties.tensileStrength * 1e6 * crossSection;
          elementCapacity = Math.min(bendingLoad, shearLoad);
          failMode = bendingLoad < shearLoad ? 'tension' : 'shear';
          break;
        }
        case 'wall': {
          elementCapacity = mat.properties.compressiveStrength * 1e6 * crossSection;
          failMode = 'compression';
          break;
        }
        case 'arch': {
          // Arches are very efficient in compression; model as 1.5× wall capacity
          elementCapacity = 1.5 * mat.properties.compressiveStrength * 1e6 * crossSection;
          failMode = 'compression';
          break;
        }
        case 'truss': {
          // Truss members primarily carry axial loads (tension or compression)
          const tensionCap = mat.properties.tensileStrength * 1e6 * crossSection;
          const compressionCap = mat.properties.compressiveStrength * 1e6 * crossSection;
          elementCapacity = Math.min(tensionCap, compressionCap);
          failMode = tensionCap < compressionCap ? 'tension' : 'compression';
          break;
        }
        case 'foundation': {
          elementCapacity = mat.properties.compressiveStrength * 1e6 * (length * width);
          failMode = 'compression';
          break;
        }
        default:
          elementCapacity = 0;
          failMode = 'compression';
      }

      if (elementCapacity < totalCapacity) {
        totalCapacity = elementCapacity;
        criticalFailure = failMode;
        weakPoints.length = 0;
        weakPoints.push({ ...el.position });
      } else if (Math.abs(elementCapacity - totalCapacity) < 1) {
        weakPoints.push({ ...el.position });
      }
    }

    // Structure is unstable without a foundation or vertical support
    const structureStable = hasFoundation || hasVertical;
    const safetyFactor = totalCapacity / Math.max(totalWeight, 1);

    return {
      stable: structureStable && safetyFactor >= 1.0,
      maxLoad: Math.max(0, totalCapacity - totalWeight),
      weakPoints,
      safetyFactor: Math.round(safetyFactor * 100) / 100,
      failureMode: safetyFactor < 1.0 ? criticalFailure : undefined,
      announcement: this.describeStructuralAnalysis({
        stable: structureStable && safetyFactor >= 1.0,
        maxLoad: Math.max(0, totalCapacity - totalWeight),
        weakPoints,
        safetyFactor: Math.round(safetyFactor * 100) / 100,
        failureMode: safetyFactor < 1.0 ? criticalFailure : undefined,
      }),
    };
  }

  /**
   * Get all recipes available for the given tier and biome.
   */
  getAvailableRecipes(tier: MasteryTier, biome: string): CraftRecipe[] {
    return recipesForTierAndBiome(tier, biome);
  }

  /**
   * Look up a reaction by its ID.
   */
  getReaction(id: string): ChemicalReaction | undefined {
    return REACTIONS.find(r => r.id === id);
  }

  /**
   * Generate a human-readable, screen-reader-friendly announcement
   * describing a structural analysis result.
   */
  describeStructuralAnalysis(analysis: StructuralAnalysis): string {
    if (analysis.maxLoad === 0 && analysis.safetyFactor === 0) {
      return 'This structure has no elements. Add structural components to begin building.';
    }

    const loadKg = Math.round(analysis.maxLoad / G);
    const parts: string[] = [];

    if (analysis.stable) {
      parts.push('This structure is stable.');
      parts.push(`It can support about ${loadKg.toLocaleString()} kilograms.`);
      if (analysis.safetyFactor >= 3) {
        parts.push('The safety margin is excellent.');
      } else if (analysis.safetyFactor >= 1.5) {
        parts.push('The safety margin is adequate.');
      } else {
        parts.push('The safety margin is narrow — consider reinforcing.');
      }
    } else {
      parts.push('This structure is unstable.');
      if (analysis.failureMode) {
        const modeDescriptions: Record<string, string> = {
          buckling: 'a column or beam would buckle under the load',
          tension: 'a member would snap from being pulled apart',
          compression: 'a member would be crushed under the weight',
          shear: 'a connection would fail from sideways force',
          overturning: 'the structure would topple over',
        };
        parts.push(`The likely failure: ${modeDescriptions[analysis.failureMode] ?? analysis.failureMode}.`);
      }
      if (analysis.weakPoints.length > 0) {
        const wp = analysis.weakPoints[0]!;
        parts.push(`The weakest point is at position ${wp.x}, ${wp.y}, ${wp.z}.`);
      }
    }

    return parts.join(' ');
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private executeCraft(recipe: CraftRecipe, providedInputs: RecipeInput[]): CraftResult {
    // 1. Validate every required input is provided in sufficient quantity
    for (const required of recipe.inputs) {
      const provided = providedInputs.find(
        p => p.type === required.type && p.id === required.id,
      );
      if (!provided || provided.quantity < required.quantity) {
        return {
          success: false,
          failureReason: `Missing or insufficient input: ${required.quantity}× ${required.id} (${required.type})`,
          learningEvents: [],
        };
      }
    }

    // 2. Validate inputs reference real data
    for (const input of recipe.inputs) {
      if (!this.validateInput(input)) {
        return {
          success: false,
          failureReason: `Unknown ${input.type}: "${input.id}"`,
          learningEvents: [],
        };
      }
    }

    // 3. Success!
    return {
      success: true,
      output: { ...recipe.output },
      learningEvents: [...recipe.skillsTaught],
    };
  }

  /** Validate that a recipe input references known game data (or is a game item). */
  private validateInput(input: RecipeInput): boolean {
    switch (input.type) {
      case 'element':
        return getElement(input.id) !== undefined;
      case 'compound':
        return getCompound(input.id) !== undefined;
      case 'material':
        return getMaterial(input.id) !== undefined;
      case 'item':
        // Game items are not constrained to chemistry/physics data
        return true;
      default:
        return false;
    }
  }

  /**
   * Parse a chemical formula into its element composition.
   * Handles simple formulas like H2O, NaCl, C6H12O6, Fe2O3.
   * Also resolves compound data for known formulas.
   */
  getFormulaComposition(formula: string): Record<string, number> {
    // First check our compound database
    const compound = getCompound(formula);
    if (compound) {
      const result: Record<string, number> = {};
      for (const { symbol, count } of compound.elements) {
        result[symbol] = (result[symbol] ?? 0) + count;
      }
      return result;
    }

    // Check if it is a pure element (e.g. "Fe", "Al")
    const element = getElement(formula);
    if (element) {
      return { [element.symbol]: 1 };
    }

    // Otherwise parse the formula string: sequences of [A-Z][a-z]?\d*
    const result: Record<string, number> = {};
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(formula)) !== null) {
      if (!match[1]) break;
      const sym = match[1];
      const count = match[2] ? parseInt(match[2], 10) : 1;
      result[sym] = (result[sym] ?? 0) + count;
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Standalone utility re-exports for convenience
// ---------------------------------------------------------------------------

export { ELEMENTS, getElement, getElementByNumber, elementsForTier } from '../data/elements.js';
export { COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier } from '../data/compounds.js';
export { RECIPES, getRecipe, recipesForTierAndBiome } from '../data/recipes.js';
export { BUILDING_MATERIALS, getMaterial, materialsForTier } from '../data/materials.js';
