// First 36 elements (H → Kr) with real atomic masses and categories
// Source: IUPAC 2021 standard atomic weights

import type { Element } from '../types/craft.js';

export const ELEMENTS: readonly Element[] = [
  { symbol: 'H',  name: 'Hydrogen',   atomicNumber: 1,  atomicMass: 1.008,   category: 'nonmetal',              discoveryTier: 'discovery' },
  { symbol: 'He', name: 'Helium',     atomicNumber: 2,  atomicMass: 4.0026,  category: 'noble-gas',             discoveryTier: 'discovery' },
  { symbol: 'Li', name: 'Lithium',    atomicNumber: 3,  atomicMass: 6.941,   category: 'alkali-metal',          discoveryTier: 'builder' },
  { symbol: 'Be', name: 'Beryllium',  atomicNumber: 4,  atomicMass: 9.0122,  category: 'alkaline-earth-metal',  discoveryTier: 'innovator' },
  { symbol: 'B',  name: 'Boron',      atomicNumber: 5,  atomicMass: 10.81,   category: 'metalloid',             discoveryTier: 'innovator' },
  { symbol: 'C',  name: 'Carbon',     atomicNumber: 6,  atomicMass: 12.011,  category: 'nonmetal',              discoveryTier: 'discovery' },
  { symbol: 'N',  name: 'Nitrogen',   atomicNumber: 7,  atomicMass: 14.007,  category: 'nonmetal',              discoveryTier: 'builder' },
  { symbol: 'O',  name: 'Oxygen',     atomicNumber: 8,  atomicMass: 15.999,  category: 'nonmetal',              discoveryTier: 'discovery' },
  { symbol: 'F',  name: 'Fluorine',   atomicNumber: 9,  atomicMass: 18.998,  category: 'halogen',               discoveryTier: 'innovator' },
  { symbol: 'Ne', name: 'Neon',       atomicNumber: 10, atomicMass: 20.180,  category: 'noble-gas',             discoveryTier: 'builder' },
  { symbol: 'Na', name: 'Sodium',     atomicNumber: 11, atomicMass: 22.990,  category: 'alkali-metal',          discoveryTier: 'discovery' },
  { symbol: 'Mg', name: 'Magnesium',  atomicNumber: 12, atomicMass: 24.305,  category: 'alkaline-earth-metal',  discoveryTier: 'builder' },
  { symbol: 'Al', name: 'Aluminium',  atomicNumber: 13, atomicMass: 26.982,  category: 'post-transition-metal', discoveryTier: 'builder' },
  { symbol: 'Si', name: 'Silicon',    atomicNumber: 14, atomicMass: 28.086,  category: 'metalloid',             discoveryTier: 'builder' },
  { symbol: 'P',  name: 'Phosphorus', atomicNumber: 15, atomicMass: 30.974,  category: 'nonmetal',              discoveryTier: 'builder' },
  { symbol: 'S',  name: 'Sulfur',     atomicNumber: 16, atomicMass: 32.06,   category: 'nonmetal',              discoveryTier: 'discovery' },
  { symbol: 'Cl', name: 'Chlorine',   atomicNumber: 17, atomicMass: 35.45,   category: 'halogen',               discoveryTier: 'discovery' },
  { symbol: 'Ar', name: 'Argon',      atomicNumber: 18, atomicMass: 39.948,  category: 'noble-gas',             discoveryTier: 'builder' },
  { symbol: 'K',  name: 'Potassium',  atomicNumber: 19, atomicMass: 39.098,  category: 'alkali-metal',          discoveryTier: 'builder' },
  { symbol: 'Ca', name: 'Calcium',    atomicNumber: 20, atomicMass: 40.078,  category: 'alkaline-earth-metal',  discoveryTier: 'discovery' },
  { symbol: 'Sc', name: 'Scandium',   atomicNumber: 21, atomicMass: 44.956,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'Ti', name: 'Titanium',   atomicNumber: 22, atomicMass: 47.867,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'V',  name: 'Vanadium',   atomicNumber: 23, atomicMass: 50.942,  category: 'transition-metal',      discoveryTier: 'creator' },
  { symbol: 'Cr', name: 'Chromium',   atomicNumber: 24, atomicMass: 51.996,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'Mn', name: 'Manganese',  atomicNumber: 25, atomicMass: 54.938,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'Fe', name: 'Iron',       atomicNumber: 26, atomicMass: 55.845,  category: 'transition-metal',      discoveryTier: 'builder' },
  { symbol: 'Co', name: 'Cobalt',     atomicNumber: 27, atomicMass: 58.933,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'Ni', name: 'Nickel',     atomicNumber: 28, atomicMass: 58.693,  category: 'transition-metal',      discoveryTier: 'innovator' },
  { symbol: 'Cu', name: 'Copper',     atomicNumber: 29, atomicMass: 63.546,  category: 'transition-metal',      discoveryTier: 'builder' },
  { symbol: 'Zn', name: 'Zinc',       atomicNumber: 30, atomicMass: 65.38,   category: 'transition-metal',      discoveryTier: 'builder' },
  { symbol: 'Ga', name: 'Gallium',    atomicNumber: 31, atomicMass: 69.723,  category: 'post-transition-metal', discoveryTier: 'creator' },
  { symbol: 'Ge', name: 'Germanium',  atomicNumber: 32, atomicMass: 72.630,  category: 'metalloid',             discoveryTier: 'creator' },
  { symbol: 'As', name: 'Arsenic',    atomicNumber: 33, atomicMass: 74.922,  category: 'metalloid',             discoveryTier: 'creator' },
  { symbol: 'Se', name: 'Selenium',   atomicNumber: 34, atomicMass: 78.971,  category: 'nonmetal',              discoveryTier: 'creator' },
  { symbol: 'Br', name: 'Bromine',    atomicNumber: 35, atomicMass: 79.904,  category: 'halogen',               discoveryTier: 'innovator' },
  { symbol: 'Kr', name: 'Krypton',    atomicNumber: 36, atomicMass: 83.798,  category: 'noble-gas',             discoveryTier: 'creator' },
] as const;

/** Look up an element by symbol. Returns undefined if not found. */
export function getElement(symbol: string): Element | undefined {
  return ELEMENTS.find(e => e.symbol === symbol);
}

/** Look up an element by atomic number. Returns undefined if not found. */
export function getElementByNumber(atomicNumber: number): Element | undefined {
  return ELEMENTS.find(e => e.atomicNumber === atomicNumber);
}

/** Get all elements available at or below the given mastery tier. */
export function elementsForTier(tier: import('../types/craft.js').Element['discoveryTier']): Element[] {
  const order: Record<string, number> = {
    foundation: 0,
    discovery: 1,
    builder: 2,
    innovator: 3,
    creator: 4,
  };
  const max = order[tier] ?? 0;
  return ELEMENTS.filter(e => (order[e.discoveryTier] ?? 0) <= max);
}
