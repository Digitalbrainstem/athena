// First 36 elements (H → Kr) with real atomic masses and categories
// Source: IUPAC 2021 standard atomic weights

import type { Element } from '../types/craft.js';

export const ELEMENTS: readonly Element[] = [
  {
    symbol: 'H',  name: 'Hydrogen',   atomicNumber: 1,  atomicMass: 1.008,   category: 'nonmetal',              discoveryTier: 'discovery',
    accessibility: { spokenName: 'hydrogen', description: 'The lightest element, making up most of the universe and part of water.', iconShape: 'circle' },
  },
  {
    symbol: 'He', name: 'Helium',     atomicNumber: 2,  atomicMass: 4.0026,  category: 'noble-gas',             discoveryTier: 'discovery',
    accessibility: { spokenName: 'helium', description: 'A very light gas that makes balloons float and your voice sound funny.', iconShape: 'hexagon' },
  },
  {
    symbol: 'Li', name: 'Lithium',    atomicNumber: 3,  atomicMass: 6.941,   category: 'alkali-metal',          discoveryTier: 'builder',
    accessibility: { spokenName: 'lithium', description: 'A soft, silvery metal so light it floats on water, used in rechargeable batteries.', iconShape: 'diamond' },
  },
  {
    symbol: 'Be', name: 'Beryllium',  atomicNumber: 4,  atomicMass: 9.0122,  category: 'alkaline-earth-metal',  discoveryTier: 'innovator',
    accessibility: { spokenName: 'beryllium', description: 'A light, strong metal used in spacecraft and X-ray machines.', iconShape: 'square' },
  },
  {
    symbol: 'B',  name: 'Boron',      atomicNumber: 5,  atomicMass: 10.81,   category: 'metalloid',             discoveryTier: 'innovator',
    accessibility: { spokenName: 'boron', description: 'A hard element used to make heat-resistant glass and cleaning products.', iconShape: 'pentagon' },
  },
  {
    symbol: 'C',  name: 'Carbon',     atomicNumber: 6,  atomicMass: 12.011,  category: 'nonmetal',              discoveryTier: 'discovery',
    accessibility: { spokenName: 'carbon', description: 'The building block of all living things, found in diamonds and pencil lead.', iconShape: 'circle' },
  },
  {
    symbol: 'N',  name: 'Nitrogen',   atomicNumber: 7,  atomicMass: 14.007,  category: 'nonmetal',              discoveryTier: 'builder',
    accessibility: { spokenName: 'nitrogen', description: 'Makes up most of the air you breathe and helps plants grow.', iconShape: 'circle' },
  },
  {
    symbol: 'O',  name: 'Oxygen',     atomicNumber: 8,  atomicMass: 15.999,  category: 'nonmetal',              discoveryTier: 'discovery',
    accessibility: { spokenName: 'oxygen', description: 'The gas you breathe to stay alive, and a key part of water.', iconShape: 'circle' },
  },
  {
    symbol: 'F',  name: 'Fluorine',   atomicNumber: 9,  atomicMass: 18.998,  category: 'halogen',               discoveryTier: 'innovator',
    accessibility: { spokenName: 'fluorine', description: 'A pale yellow gas added to toothpaste to help keep your teeth strong.', iconShape: 'triangle' },
  },
  {
    symbol: 'Ne', name: 'Neon',       atomicNumber: 10, atomicMass: 20.180,  category: 'noble-gas',             discoveryTier: 'builder',
    accessibility: { spokenName: 'neon', description: 'A gas that glows bright red-orange when electricity passes through it, used in glowing signs.', iconShape: 'hexagon' },
  },
  {
    symbol: 'Na', name: 'Sodium',     atomicNumber: 11, atomicMass: 22.990,  category: 'alkali-metal',          discoveryTier: 'discovery',
    accessibility: { spokenName: 'sodium', description: 'A soft, reactive metal that combines with chlorine to make table salt.', iconShape: 'diamond' },
  },
  {
    symbol: 'Mg', name: 'Magnesium',  atomicNumber: 12, atomicMass: 24.305,  category: 'alkaline-earth-metal',  discoveryTier: 'builder',
    accessibility: { spokenName: 'magnesium', description: 'A light metal that burns with a brilliant white flame, important for muscles and nerves.', iconShape: 'square' },
  },
  {
    symbol: 'Al', name: 'Aluminium',  atomicNumber: 13, atomicMass: 26.982,  category: 'post-transition-metal', discoveryTier: 'builder',
    accessibility: { spokenName: 'aluminium', description: 'A lightweight, silvery metal used in cans, foil, and airplanes.', iconShape: 'octagon' },
  },
  {
    symbol: 'Si', name: 'Silicon',    atomicNumber: 14, atomicMass: 28.086,  category: 'metalloid',             discoveryTier: 'builder',
    accessibility: { spokenName: 'silicon', description: 'Found in sand and used to make the computer chips inside every electronic device.', iconShape: 'pentagon' },
  },
  {
    symbol: 'P',  name: 'Phosphorus', atomicNumber: 15, atomicMass: 30.974,  category: 'nonmetal',              discoveryTier: 'builder',
    accessibility: { spokenName: 'phosphorus', description: 'Glows faintly in the dark and is essential for strong bones and teeth.', iconShape: 'circle' },
  },
  {
    symbol: 'S',  name: 'Sulfur',     atomicNumber: 16, atomicMass: 32.06,   category: 'nonmetal',              discoveryTier: 'discovery',
    accessibility: { spokenName: 'sulfur', description: 'A bright yellow element that smells like rotten eggs, used in matches and rubber.', iconShape: 'circle' },
  },
  {
    symbol: 'Cl', name: 'Chlorine',   atomicNumber: 17, atomicMass: 35.45,   category: 'halogen',               discoveryTier: 'discovery',
    accessibility: { spokenName: 'chlorine', description: 'A strong-smelling gas used to keep swimming pools and drinking water clean.', iconShape: 'triangle' },
  },
  {
    symbol: 'Ar', name: 'Argon',      atomicNumber: 18, atomicMass: 39.948,  category: 'noble-gas',             discoveryTier: 'builder',
    accessibility: { spokenName: 'argon', description: 'A gas that hardly reacts with anything, used inside light bulbs to protect the filament.', iconShape: 'hexagon' },
  },
  {
    symbol: 'K',  name: 'Potassium',  atomicNumber: 19, atomicMass: 39.098,  category: 'alkali-metal',          discoveryTier: 'builder',
    accessibility: { spokenName: 'potassium', description: 'A soft metal found in bananas that helps your heart and muscles work.', iconShape: 'diamond' },
  },
  {
    symbol: 'Ca', name: 'Calcium',    atomicNumber: 20, atomicMass: 40.078,  category: 'alkaline-earth-metal',  discoveryTier: 'discovery',
    accessibility: { spokenName: 'calcium', description: 'The mineral that makes your bones and teeth strong, also found in chalk and seashells.', iconShape: 'square' },
  },
  {
    symbol: 'Sc', name: 'Scandium',   atomicNumber: 21, atomicMass: 44.956,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'scandium', description: 'A rare, lightweight metal used to make strong alloys for bikes and airplanes.', iconShape: 'star' },
  },
  {
    symbol: 'Ti', name: 'Titanium',   atomicNumber: 22, atomicMass: 47.867,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'titanium', description: 'A super-strong, lightweight metal used in jet engines and artificial joints.', iconShape: 'star' },
  },
  {
    symbol: 'V',  name: 'Vanadium',   atomicNumber: 23, atomicMass: 50.942,  category: 'transition-metal',      discoveryTier: 'creator',
    accessibility: { spokenName: 'vanadium', description: 'A tough metal added to steel to make it extra strong for tools and engines.', iconShape: 'star' },
  },
  {
    symbol: 'Cr', name: 'Chromium',   atomicNumber: 24, atomicMass: 51.996,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'chromium', description: 'A shiny metal that gives chrome its mirror-like finish and makes rubies red.', iconShape: 'star' },
  },
  {
    symbol: 'Mn', name: 'Manganese',  atomicNumber: 25, atomicMass: 54.938,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'manganese', description: 'A hard metal used to make steel tougher, also found inside most batteries.', iconShape: 'star' },
  },
  {
    symbol: 'Fe', name: 'Iron',       atomicNumber: 26, atomicMass: 55.845,  category: 'transition-metal',      discoveryTier: 'builder',
    accessibility: { spokenName: 'iron', description: 'The most widely used metal, found in steel, bridges, and at the center of the Earth.', iconShape: 'star' },
  },
  {
    symbol: 'Co', name: 'Cobalt',     atomicNumber: 27, atomicMass: 58.933,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'cobalt', description: 'A hard, blue-silver metal used to make powerful magnets and vivid blue paints.', iconShape: 'star' },
  },
  {
    symbol: 'Ni', name: 'Nickel',     atomicNumber: 28, atomicMass: 58.693,  category: 'transition-metal',      discoveryTier: 'innovator',
    accessibility: { spokenName: 'nickel', description: 'A tough, shiny metal used in coins and stainless steel that resists rust very well.', iconShape: 'star' },
  },
  {
    symbol: 'Cu', name: 'Copper',     atomicNumber: 29, atomicMass: 63.546,  category: 'transition-metal',      discoveryTier: 'builder',
    accessibility: { spokenName: 'copper', description: 'A reddish metal that conducts electricity very well, used in wires and water pipes.', iconShape: 'star' },
  },
  {
    symbol: 'Zn', name: 'Zinc',       atomicNumber: 30, atomicMass: 65.38,   category: 'transition-metal',      discoveryTier: 'builder',
    accessibility: { spokenName: 'zinc', description: 'A blue-gray metal that protects other metals from rusting and helps your body heal.', iconShape: 'star' },
  },
  {
    symbol: 'Ga', name: 'Gallium',    atomicNumber: 31, atomicMass: 69.723,  category: 'post-transition-metal', discoveryTier: 'creator',
    accessibility: { spokenName: 'gallium', description: 'A soft metal that can melt in your hand because its melting point is just above room temperature.', iconShape: 'octagon' },
  },
  {
    symbol: 'Ge', name: 'Germanium',  atomicNumber: 32, atomicMass: 72.630,  category: 'metalloid',             discoveryTier: 'creator',
    accessibility: { spokenName: 'germanium', description: 'A shiny element used in fiber-optic cables and computer chips to carry light signals.', iconShape: 'pentagon' },
  },
  {
    symbol: 'As', name: 'Arsenic',    atomicNumber: 33, atomicMass: 74.922,  category: 'metalloid',             discoveryTier: 'creator',
    accessibility: { spokenName: 'arsenic', description: 'A brittle element found in minerals, used in tiny amounts in electronics and special glass.', iconShape: 'pentagon' },
  },
  {
    symbol: 'Se', name: 'Selenium',   atomicNumber: 34, atomicMass: 78.971,  category: 'nonmetal',              discoveryTier: 'creator',
    accessibility: { spokenName: 'selenium', description: 'An element your body needs in tiny amounts to stay healthy, also used in electronics.', iconShape: 'circle' },
  },
  {
    symbol: 'Br', name: 'Bromine',    atomicNumber: 35, atomicMass: 79.904,  category: 'halogen',               discoveryTier: 'innovator',
    accessibility: { spokenName: 'bromine', description: 'One of only two elements that are liquid at room temperature, with a deep red-brown color.', iconShape: 'triangle' },
  },
  {
    symbol: 'Kr', name: 'Krypton',    atomicNumber: 36, atomicMass: 83.798,  category: 'noble-gas',             discoveryTier: 'creator',
    accessibility: { spokenName: 'krypton', description: 'A rare gas that glows white when electricity passes through it, used in special lasers and lights.', iconShape: 'hexagon' },
  },
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
