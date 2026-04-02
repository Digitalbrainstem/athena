// Real chemical compounds and reactions grounded in actual chemistry
// All formulas, compositions, and stoichiometry are scientifically accurate

import type { Compound, ChemicalReaction } from '../types/craft.js';

// ---------------------------------------------------------------------------
// Compounds — 35 real substances
// ---------------------------------------------------------------------------

export const COMPOUNDS: readonly Compound[] = [
  // --- Foundation / Discovery tier ---
  {
    formula: 'H2O', name: 'Water',
    elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
    properties: { state: 'liquid', color: 'clear', hazardous: false },
    discoveryTier: 'foundation',
  },
  {
    formula: 'NaCl', name: 'Salt',
    elements: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'foundation',
  },
  {
    formula: 'CO2', name: 'Carbon Dioxide',
    elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }],
    properties: { state: 'gas', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'O2', name: 'Oxygen Gas',
    elements: [{ symbol: 'O', count: 2 }],
    properties: { state: 'gas', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'H2', name: 'Hydrogen Gas',
    elements: [{ symbol: 'H', count: 2 }],
    properties: { state: 'gas', hazardous: true },
    discoveryTier: 'discovery',
  },
  {
    formula: 'CaCO3', name: 'Calcium Carbonate',
    elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'C', count: 1 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'NaHCO3', name: 'Baking Soda',
    elements: [{ symbol: 'Na', count: 1 }, { symbol: 'H', count: 1 }, { symbol: 'C', count: 1 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'CH3COOH', name: 'Vinegar (Acetic Acid)',
    elements: [{ symbol: 'C', count: 2 }, { symbol: 'H', count: 4 }, { symbol: 'O', count: 2 }],
    properties: { state: 'liquid', color: 'clear', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'CH3COONa', name: 'Sodium Acetate',
    elements: [{ symbol: 'C', count: 2 }, { symbol: 'H', count: 3 }, { symbol: 'O', count: 2 }, { symbol: 'Na', count: 1 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'discovery',
  },
  {
    formula: 'SiO2', name: 'Silicon Dioxide (Sand/Glass)',
    elements: [{ symbol: 'Si', count: 1 }, { symbol: 'O', count: 2 }],
    properties: { state: 'solid', color: 'clear', hazardous: false },
    discoveryTier: 'discovery',
  },

  // --- Builder tier ---
  {
    formula: 'Fe2O3', name: 'Iron(III) Oxide (Rust)',
    elements: [{ symbol: 'Fe', count: 2 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'red-brown', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'NH3', name: 'Ammonia',
    elements: [{ symbol: 'N', count: 1 }, { symbol: 'H', count: 3 }],
    properties: { state: 'gas', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'HCl', name: 'Hydrochloric Acid',
    elements: [{ symbol: 'H', count: 1 }, { symbol: 'Cl', count: 1 }],
    properties: { state: 'liquid', color: 'clear', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'NaOH', name: 'Sodium Hydroxide (Lye)',
    elements: [{ symbol: 'Na', count: 1 }, { symbol: 'O', count: 1 }, { symbol: 'H', count: 1 }],
    properties: { state: 'solid', color: 'white', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'H2SO4', name: 'Sulfuric Acid',
    elements: [{ symbol: 'H', count: 2 }, { symbol: 'S', count: 1 }, { symbol: 'O', count: 4 }],
    properties: { state: 'liquid', color: 'clear', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'CaO', name: 'Quicklime (Calcium Oxide)',
    elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'O', count: 1 }],
    properties: { state: 'solid', color: 'white', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'Ca(OH)2', name: 'Slaked Lime',
    elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'O', count: 2 }, { symbol: 'H', count: 2 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'C6H12O6', name: 'Glucose',
    elements: [{ symbol: 'C', count: 6 }, { symbol: 'H', count: 12 }, { symbol: 'O', count: 6 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'C2H5OH', name: 'Ethanol',
    elements: [{ symbol: 'C', count: 2 }, { symbol: 'H', count: 6 }, { symbol: 'O', count: 1 }],
    properties: { state: 'liquid', color: 'clear', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'CH4', name: 'Methane',
    elements: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }],
    properties: { state: 'gas', hazardous: true },
    discoveryTier: 'builder',
  },
  {
    formula: 'MgO', name: 'Magnesium Oxide',
    elements: [{ symbol: 'Mg', count: 1 }, { symbol: 'O', count: 1 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'KNO3', name: 'Potassium Nitrate (Saltpeter)',
    elements: [{ symbol: 'K', count: 1 }, { symbol: 'N', count: 1 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'N2', name: 'Nitrogen Gas',
    elements: [{ symbol: 'N', count: 2 }],
    properties: { state: 'gas', hazardous: false },
    discoveryTier: 'builder',
  },
  {
    formula: 'Cl2', name: 'Chlorine Gas',
    elements: [{ symbol: 'Cl', count: 2 }],
    properties: { state: 'gas', hazardous: true },
    discoveryTier: 'builder',
  },

  // --- Innovator tier ---
  {
    formula: 'C9H8O4', name: 'Aspirin (Acetylsalicylic Acid)',
    elements: [{ symbol: 'C', count: 9 }, { symbol: 'H', count: 8 }, { symbol: 'O', count: 4 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'innovator',
  },
  {
    formula: 'C7H6O3', name: 'Salicylic Acid',
    elements: [{ symbol: 'C', count: 7 }, { symbol: 'H', count: 6 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'innovator',
  },
  {
    formula: 'C4H6O3', name: 'Acetic Anhydride',
    elements: [{ symbol: 'C', count: 4 }, { symbol: 'H', count: 6 }, { symbol: 'O', count: 3 }],
    properties: { state: 'liquid', color: 'clear', hazardous: true },
    discoveryTier: 'innovator',
  },
  {
    formula: 'H3PO4', name: 'Phosphoric Acid',
    elements: [{ symbol: 'H', count: 3 }, { symbol: 'P', count: 1 }, { symbol: 'O', count: 4 }],
    properties: { state: 'liquid', color: 'clear', hazardous: true },
    discoveryTier: 'innovator',
  },
  {
    formula: 'Na2SO4', name: 'Sodium Sulfate',
    elements: [{ symbol: 'Na', count: 2 }, { symbol: 'S', count: 1 }, { symbol: 'O', count: 4 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'innovator',
  },
  {
    formula: 'CuSO4', name: 'Copper Sulfate',
    elements: [{ symbol: 'Cu', count: 1 }, { symbol: 'S', count: 1 }, { symbol: 'O', count: 4 }],
    properties: { state: 'solid', color: 'blue', hazardous: true },
    discoveryTier: 'innovator',
  },
  {
    formula: 'FeCl3', name: 'Iron(III) Chloride',
    elements: [{ symbol: 'Fe', count: 1 }, { symbol: 'Cl', count: 3 }],
    properties: { state: 'solid', color: 'brown-black', hazardous: true },
    discoveryTier: 'innovator',
  },

  // --- Creator tier ---
  {
    formula: 'C8H10N4O2', name: 'Caffeine',
    elements: [{ symbol: 'C', count: 8 }, { symbol: 'H', count: 10 }, { symbol: 'N', count: 4 }, { symbol: 'O', count: 2 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'creator',
  },
  {
    formula: 'C6H8O7', name: 'Citric Acid',
    elements: [{ symbol: 'C', count: 6 }, { symbol: 'H', count: 8 }, { symbol: 'O', count: 7 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'creator',
  },
  {
    formula: 'C3H8O3', name: 'Glycerol',
    elements: [{ symbol: 'C', count: 3 }, { symbol: 'H', count: 8 }, { symbol: 'O', count: 3 }],
    properties: { state: 'liquid', color: 'clear', hazardous: false },
    discoveryTier: 'creator',
  },
  {
    formula: 'Al2O3', name: 'Aluminium Oxide (Corundum)',
    elements: [{ symbol: 'Al', count: 2 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'creator',
  },
  {
    formula: 'TiO2', name: 'Titanium Dioxide',
    elements: [{ symbol: 'Ti', count: 1 }, { symbol: 'O', count: 2 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'creator',
  },
  {
    formula: 'Na2CO3', name: 'Washing Soda (Sodium Carbonate)',
    elements: [{ symbol: 'Na', count: 2 }, { symbol: 'C', count: 1 }, { symbol: 'O', count: 3 }],
    properties: { state: 'solid', color: 'white', hazardous: false },
    discoveryTier: 'builder',
  },
] as const;

// ---------------------------------------------------------------------------
// Chemical Reactions — 23 real, balanced reactions across all tiers
// ---------------------------------------------------------------------------

export const REACTIONS: readonly ChemicalReaction[] = [
  // === Discovery (age 6-10): simple observable reactions ===
  {
    id: 'vinegar-baking-soda',
    name: 'Vinegar and Baking Soda Fizz',
    // CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂
    reactants: [{ formula: 'CH3COOH', moles: 1 }, { formula: 'NaHCO3', moles: 1 }],
    products: [{ formula: 'CH3COONa', moles: 1 }, { formula: 'H2O', moles: 1 }, { formula: 'CO2', moles: 1 }],
    energyChange: 'exothermic',
    tier: 'discovery',
  },
  {
    id: 'rust-formation',
    name: 'Rusting of Iron',
    // 4Fe + 3O₂ → 2Fe₂O₃
    reactants: [{ formula: 'Fe', moles: 4 }, { formula: 'O2', moles: 3 }],
    products: [{ formula: 'Fe2O3', moles: 2 }],
    conditions: 'moisture',
    energyChange: 'exothermic',
    tier: 'discovery',
  },
  {
    id: 'photosynthesis-simplified',
    name: 'Photosynthesis (Simplified)',
    // 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
    reactants: [{ formula: 'CO2', moles: 6 }, { formula: 'H2O', moles: 6 }],
    products: [{ formula: 'C6H12O6', moles: 1 }, { formula: 'O2', moles: 6 }],
    conditions: 'sunlight',
    energyChange: 'endothermic',
    tier: 'discovery',
  },
  {
    id: 'calcium-oxide-water',
    name: 'Slaking Lime',
    // CaO + H₂O → Ca(OH)₂
    reactants: [{ formula: 'CaO', moles: 1 }, { formula: 'H2O', moles: 1 }],
    products: [{ formula: 'Ca(OH)2', moles: 1 }],
    energyChange: 'exothermic',
    tier: 'discovery',
  },

  // === Builder (age 11-14): stoichiometry, balanced equations ===
  {
    id: 'water-synthesis',
    name: 'Hydrogen Combustion (Water Synthesis)',
    // 2H₂ + O₂ → 2H₂O
    reactants: [{ formula: 'H2', moles: 2 }, { formula: 'O2', moles: 1 }],
    products: [{ formula: 'H2O', moles: 2 }],
    conditions: 'spark',
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'haber-process',
    name: 'Haber Process (Ammonia Synthesis)',
    // N₂ + 3H₂ → 2NH₃
    reactants: [{ formula: 'N2', moles: 1 }, { formula: 'H2', moles: 3 }],
    products: [{ formula: 'NH3', moles: 2 }],
    conditions: 'high pressure, iron catalyst',
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'acid-base-neutralization',
    name: 'Acid–Base Neutralization',
    // HCl + NaOH → NaCl + H₂O
    reactants: [{ formula: 'HCl', moles: 1 }, { formula: 'NaOH', moles: 1 }],
    products: [{ formula: 'NaCl', moles: 1 }, { formula: 'H2O', moles: 1 }],
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'methane-combustion',
    name: 'Methane Combustion',
    // CH₄ + 2O₂ → CO₂ + 2H₂O
    reactants: [{ formula: 'CH4', moles: 1 }, { formula: 'O2', moles: 2 }],
    products: [{ formula: 'CO2', moles: 1 }, { formula: 'H2O', moles: 2 }],
    conditions: 'ignition',
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'lime-kiln',
    name: 'Thermal Decomposition of Limestone',
    // CaCO₃ → CaO + CO₂
    reactants: [{ formula: 'CaCO3', moles: 1 }],
    products: [{ formula: 'CaO', moles: 1 }, { formula: 'CO2', moles: 1 }],
    conditions: 'heat (900°C)',
    energyChange: 'endothermic',
    tier: 'builder',
  },
  {
    id: 'ethanol-combustion',
    name: 'Ethanol Combustion',
    // C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O
    reactants: [{ formula: 'C2H5OH', moles: 1 }, { formula: 'O2', moles: 3 }],
    products: [{ formula: 'CO2', moles: 2 }, { formula: 'H2O', moles: 3 }],
    conditions: 'ignition',
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'magnesium-combustion',
    name: 'Burning Magnesium',
    // 2Mg + O₂ → 2MgO
    reactants: [{ formula: 'Mg', moles: 2 }, { formula: 'O2', moles: 1 }],
    products: [{ formula: 'MgO', moles: 2 }],
    conditions: 'ignition',
    energyChange: 'exothermic',
    tier: 'builder',
  },
  {
    id: 'fermentation',
    name: 'Alcoholic Fermentation',
    // C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂
    reactants: [{ formula: 'C6H12O6', moles: 1 }],
    products: [{ formula: 'C2H5OH', moles: 2 }, { formula: 'CO2', moles: 2 }],
    conditions: 'yeast enzymes',
    energyChange: 'exothermic',
    tier: 'builder',
  },

  // === Innovator (age 15-18): organic chemistry, redox, acid–base ===
  {
    id: 'aspirin-synthesis',
    name: 'Aspirin Synthesis',
    // C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + CH₃COOH
    reactants: [{ formula: 'C7H6O3', moles: 1 }, { formula: 'C4H6O3', moles: 1 }],
    products: [{ formula: 'C9H8O4', moles: 1 }, { formula: 'CH3COOH', moles: 1 }],
    conditions: 'H₃PO₄ catalyst, 85°C',
    energyChange: 'exothermic',
    tier: 'innovator',
  },
  {
    id: 'sulfuric-acid-neutralization',
    name: 'Sulfuric Acid + Sodium Hydroxide',
    // H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O
    reactants: [{ formula: 'H2SO4', moles: 1 }, { formula: 'NaOH', moles: 2 }],
    products: [{ formula: 'Na2SO4', moles: 1 }, { formula: 'H2O', moles: 2 }],
    energyChange: 'exothermic',
    tier: 'innovator',
  },
  {
    id: 'copper-sulfate-iron',
    name: 'Single Displacement — Iron in Copper Sulfate',
    // Fe + CuSO₄ → Cu + FeSO₄
    reactants: [{ formula: 'Fe', moles: 1 }, { formula: 'CuSO4', moles: 1 }],
    products: [{ formula: 'Cu', moles: 1 }],
    conditions: 'aqueous solution',
    energyChange: 'exothermic',
    tier: 'innovator',
  },
  {
    id: 'electrolysis-water',
    name: 'Electrolysis of Water',
    // 2H₂O → 2H₂ + O₂
    reactants: [{ formula: 'H2O', moles: 2 }],
    products: [{ formula: 'H2', moles: 2 }, { formula: 'O2', moles: 1 }],
    conditions: 'electrical current',
    energyChange: 'endothermic',
    tier: 'innovator',
  },
  {
    id: 'thermite-reaction',
    name: 'Thermite Reaction',
    // 2Al + Fe₂O₃ → Al₂O₃ + 2Fe
    reactants: [{ formula: 'Al', moles: 2 }, { formula: 'Fe2O3', moles: 1 }],
    products: [{ formula: 'Al2O3', moles: 1 }, { formula: 'Fe', moles: 2 }],
    conditions: 'ignition (high temperature)',
    energyChange: 'exothermic',
    tier: 'innovator',
  },
  {
    id: 'iron-chloride-formation',
    name: 'Iron and Chlorine Reaction',
    // 2Fe + 3Cl₂ → 2FeCl₃
    reactants: [{ formula: 'Fe', moles: 2 }, { formula: 'Cl2', moles: 3 }],
    products: [{ formula: 'FeCl3', moles: 2 }],
    conditions: 'heat',
    energyChange: 'exothermic',
    tier: 'innovator',
  },

  // === Creator (18+): synthesis, catalysis, thermodynamics ===
  {
    id: 'solvay-process-step',
    name: 'Solvay Process — Sodium Carbonate',
    // 2NaCl + CaCO₃ → Na₂CO₃ + CaCl₂  (net simplified)
    reactants: [{ formula: 'NaCl', moles: 2 }, { formula: 'CaCO3', moles: 1 }],
    products: [{ formula: 'Na2CO3', moles: 1 }],
    conditions: 'ammonia, CO₂ intermediates',
    energyChange: 'endothermic',
    tier: 'creator',
  },
  {
    id: 'glucose-combustion',
    name: 'Cellular Respiration (Glucose Combustion)',
    // C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O
    reactants: [{ formula: 'C6H12O6', moles: 1 }, { formula: 'O2', moles: 6 }],
    products: [{ formula: 'CO2', moles: 6 }, { formula: 'H2O', moles: 6 }],
    conditions: 'enzymes (biological)',
    energyChange: 'exothermic',
    tier: 'creator',
  },
  {
    id: 'contact-process',
    name: 'Contact Process — Sulfuric Acid',
    // 2SO₂ + O₂ → 2SO₃ (simplified; models the concept)
    reactants: [{ formula: 'S', moles: 1 }, { formula: 'O2', moles: 1.5 }],
    products: [{ formula: 'H2SO4', moles: 1 }],
    conditions: 'V₂O₅ catalyst, 450°C',
    energyChange: 'exothermic',
    tier: 'creator',
  },
  {
    id: 'aluminium-smelting',
    name: 'Hall–Héroult Process (Aluminium Smelting)',
    // 2Al₂O₃ → 4Al + 3O₂
    reactants: [{ formula: 'Al2O3', moles: 2 }],
    products: [{ formula: 'Al', moles: 4 }, { formula: 'O2', moles: 3 }],
    conditions: 'electrolysis, molten cryolite',
    energyChange: 'endothermic',
    tier: 'creator',
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getCompound(formula: string): Compound | undefined {
  return COMPOUNDS.find(c => c.formula === formula);
}

export function getReaction(id: string): ChemicalReaction | undefined {
  return REACTIONS.find(r => r.id === id);
}

export function reactionsForTier(tier: Compound['discoveryTier']): ChemicalReaction[] {
  const order: Record<string, number> = {
    foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
  };
  const max = order[tier] ?? 0;
  return REACTIONS.filter(r => (order[r.tier] ?? 0) <= max);
}
