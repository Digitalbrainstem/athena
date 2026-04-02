// Real building materials with actual physical properties
// Sources: Engineering Toolbox, MatWeb, CES EduPack reference values

import type { BuildingMaterial } from '../types/craft.js';

export const BUILDING_MATERIALS: readonly BuildingMaterial[] = [
  // --- Foundation tier (basic, safe materials) ---
  {
    id: 'pine-wood',
    name: 'Pine Wood',
    properties: {
      density: 510,               // kg/m³
      tensileStrength: 40,        // MPa (along grain)
      compressiveStrength: 35,    // MPa (along grain)
      elasticity: 9,              // GPa
      flammable: true,
    },
    tier: 'foundation',
  },
  {
    id: 'sandstone',
    name: 'Sandstone',
    properties: {
      density: 2200,
      tensileStrength: 4,
      compressiveStrength: 40,
      elasticity: 15,
      flammable: false,
    },
    tier: 'foundation',
  },
  {
    id: 'clay-brick',
    name: 'Clay Brick',
    properties: {
      density: 1900,
      tensileStrength: 2,
      compressiveStrength: 20,
      elasticity: 15,
      flammable: false,
    },
    tier: 'foundation',
  },

  // --- Discovery tier ---
  {
    id: 'oak-wood',
    name: 'Oak Wood',
    properties: {
      density: 690,
      tensileStrength: 60,
      compressiveStrength: 50,
      elasticity: 12,
      flammable: true,
    },
    tier: 'discovery',
  },
  {
    id: 'limestone',
    name: 'Limestone',
    properties: {
      density: 2500,
      tensileStrength: 5,
      compressiveStrength: 60,
      elasticity: 30,
      flammable: false,
    },
    tier: 'discovery',
  },
  {
    id: 'granite',
    name: 'Granite',
    properties: {
      density: 2700,
      tensileStrength: 10,
      compressiveStrength: 170,
      elasticity: 50,
      flammable: false,
    },
    tier: 'discovery',
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    properties: {
      density: 400,
      tensileStrength: 140,       // remarkably strong in tension
      compressiveStrength: 60,
      elasticity: 15,
      flammable: true,
    },
    tier: 'discovery',
  },

  // --- Builder tier ---
  {
    id: 'concrete',
    name: 'Concrete',
    properties: {
      density: 2400,
      tensileStrength: 3,         // very weak in tension — real engineering fact
      compressiveStrength: 30,
      elasticity: 25,
      flammable: false,
    },
    tier: 'builder',
  },
  {
    id: 'mild-steel',
    name: 'Mild Steel (A36)',
    properties: {
      density: 7850,
      tensileStrength: 400,
      compressiveStrength: 250,
      elasticity: 200,
      flammable: false,
    },
    tier: 'builder',
  },
  {
    id: 'wrought-iron',
    name: 'Wrought Iron',
    properties: {
      density: 7750,
      tensileStrength: 220,
      compressiveStrength: 200,
      elasticity: 190,
      flammable: false,
    },
    tier: 'builder',
  },
  {
    id: 'glass',
    name: 'Soda-Lime Glass',
    properties: {
      density: 2500,
      tensileStrength: 33,
      compressiveStrength: 1000,
      elasticity: 70,
      flammable: false,
    },
    tier: 'builder',
  },
  {
    id: 'reinforced-concrete',
    name: 'Reinforced Concrete',
    properties: {
      density: 2500,
      tensileStrength: 30,        // much better than plain concrete due to rebar
      compressiveStrength: 40,
      elasticity: 30,
      flammable: false,
    },
    tier: 'builder',
  },
  {
    id: 'copper',
    name: 'Copper (structural)',
    properties: {
      density: 8940,
      tensileStrength: 210,
      compressiveStrength: 210,
      elasticity: 117,
      flammable: false,
    },
    tier: 'builder',
  },

  // --- Innovator tier ---
  {
    id: 'high-strength-steel',
    name: 'High-Strength Steel (A992)',
    properties: {
      density: 7850,
      tensileStrength: 450,
      compressiveStrength: 345,
      elasticity: 200,
      flammable: false,
    },
    tier: 'innovator',
  },
  {
    id: 'aluminium-alloy',
    name: 'Aluminium Alloy (6061-T6)',
    properties: {
      density: 2700,
      tensileStrength: 310,
      compressiveStrength: 276,
      elasticity: 69,
      flammable: false,
    },
    tier: 'innovator',
  },
  {
    id: 'pre-stressed-concrete',
    name: 'Pre-Stressed Concrete',
    properties: {
      density: 2500,
      tensileStrength: 50,
      compressiveStrength: 60,
      elasticity: 36,
      flammable: false,
    },
    tier: 'innovator',
  },
  {
    id: 'stainless-steel',
    name: 'Stainless Steel (304)',
    properties: {
      density: 8000,
      tensileStrength: 505,
      compressiveStrength: 210,
      elasticity: 193,
      flammable: false,
    },
    tier: 'innovator',
  },

  // --- Creator tier ---
  {
    id: 'titanium-alloy',
    name: 'Titanium Alloy (Ti-6Al-4V)',
    properties: {
      density: 4430,
      tensileStrength: 950,
      compressiveStrength: 970,
      elasticity: 114,
      flammable: false,
    },
    tier: 'creator',
  },
  {
    id: 'carbon-fiber-composite',
    name: 'Carbon Fiber Composite',
    properties: {
      density: 1600,
      tensileStrength: 1500,
      compressiveStrength: 1200,
      elasticity: 150,
      flammable: false,
    },
    tier: 'creator',
  },
  {
    id: 'ultra-high-performance-concrete',
    name: 'UHPC (Ultra-High-Performance Concrete)',
    properties: {
      density: 2550,
      tensileStrength: 15,
      compressiveStrength: 150,
      elasticity: 50,
      flammable: false,
    },
    tier: 'creator',
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getMaterial(id: string): BuildingMaterial | undefined {
  return BUILDING_MATERIALS.find(m => m.id === id);
}

export function materialsForTier(tier: BuildingMaterial['tier']): BuildingMaterial[] {
  const order: Record<string, number> = {
    foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
  };
  const max = order[tier] ?? 0;
  return BUILDING_MATERIALS.filter(m => (order[m.tier] ?? 0) <= max);
}
