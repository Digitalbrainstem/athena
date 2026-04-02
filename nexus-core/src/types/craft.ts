// Crafting system types — chemistry, physics, and recipes grounded in real science

import type { MasteryTier } from './components.js';
import type { Vec3 } from './scene.js';

// ---------------------------------------------------------------------------
// Accessibility — every piece of game data must be usable without vision
// ---------------------------------------------------------------------------

/** Accessibility metadata attached to every craftable/viewable game object.
 *  Ensures screen-reader, audio-only, and color-blind support. */
export interface AccessibilityMeta {
  /** Human-friendly spoken name ("water" not "H₂O") */
  spokenName: string;
  /** Spoken formula for compounds/elements ("two H, one O") */
  spokenFormula?: string;
  /** Plain-language description suitable for screen readers */
  description: string;
  /** Shape identifier for color-blind mode (e.g. "circle", "triangle") */
  iconShape?: string;
}

// ---------------------------------------------------------------------------
// Chemistry
// ---------------------------------------------------------------------------

/** A chemical element from the periodic table */
export interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  /** Atomic mass in unified atomic mass units (u / amu) */
  atomicMass: number;
  category: ElementCategory;
  /** Mastery tier at which the player first encounters this element */
  discoveryTier: MasteryTier;
  accessibility: AccessibilityMeta;
}

export type ElementCategory =
  | 'nonmetal'
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'metalloid'
  | 'halogen'
  | 'transition-metal'
  | 'post-transition-metal';

/** A chemical compound built from elements */
export interface Compound {
  formula: string;
  name: string;
  elements: ElementRef[];
  properties: CompoundProperties;
  /** Mastery tier at which the player first encounters this compound */
  discoveryTier: MasteryTier;
  accessibility: AccessibilityMeta;
}

export interface ElementRef {
  symbol: string;
  count: number;
}

export interface CompoundProperties {
  state: 'solid' | 'liquid' | 'gas';
  color?: string;
  hazardous: boolean;
}

/** A real balanced chemical reaction */
export interface ChemicalReaction {
  id: string;
  name: string;
  reactants: ReactionComponent[];
  products: ReactionComponent[];
  /** Optional conditions required for the reaction */
  conditions?: string;
  energyChange: 'exothermic' | 'endothermic' | 'neutral';
  tier: MasteryTier;
}

export interface ReactionComponent {
  formula: string;
  moles: number;
}

// ---------------------------------------------------------------------------
// Physics / Building
// ---------------------------------------------------------------------------

/** Physical properties of a real building material */
export interface BuildingMaterial {
  id: string;
  name: string;
  properties: MaterialProperties;
  tier: MasteryTier;
  accessibility: AccessibilityMeta;
}

export interface MaterialProperties {
  /** kg/m³ */
  density: number;
  /** Tensile strength in MPa */
  tensileStrength: number;
  /** Compressive strength in MPa */
  compressiveStrength: number;
  /** Young's modulus in GPa */
  elasticity: number;
  flammable: boolean;
}

export type StructuralElementType =
  | 'beam'
  | 'column'
  | 'arch'
  | 'truss'
  | 'foundation'
  | 'wall';

export interface StructuralElement {
  type: StructuralElementType;
  material: string;
  dimensions: { length: number; width: number; height: number };
  position: Vec3;
  rotation: Vec3;
}

export type FailureMode =
  | 'buckling'
  | 'tension'
  | 'compression'
  | 'shear'
  | 'overturning';

export interface StructuralAnalysis {
  stable: boolean;
  /** Maximum load in Newtons */
  maxLoad: number;
  /** Points where the structure would fail first */
  weakPoints: Vec3[];
  /** actual strength / required strength */
  safetyFactor: number;
  failureMode?: FailureMode;
  /** Human-readable announcement of the analysis result */
  announcement?: string;
}

// ---------------------------------------------------------------------------
// Recipes — game-facing layer mapping actions to real science
// ---------------------------------------------------------------------------

export type RecipeInputType = 'element' | 'compound' | 'material' | 'item';
export type RecipeOutputType = 'compound' | 'structure' | 'item' | 'tool' | 'element';

export interface RecipeInput {
  type: RecipeInputType;
  id: string;
  quantity: number;
}

export interface RecipeOutput {
  type: RecipeOutputType;
  id: string;
  quantity: number;
}

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  tier: MasteryTier;
  /** Biome where this recipe is available (or 'any') */
  biome: string;
  inputs: RecipeInput[];
  output: RecipeOutput;
  /** Learning events generated on success */
  skillsTaught: string[];
  /** Explanation the companion can use for teaching moments */
  scienceExplanation: string;
  accessibility: AccessibilityMeta;
}

// ---------------------------------------------------------------------------
// Craft results
// ---------------------------------------------------------------------------

export interface CraftResult {
  success: boolean;
  output?: RecipeOutput;
  /** Human-readable reason for failure */
  failureReason?: string;
  /** Learning events generated */
  learningEvents: string[];
}
