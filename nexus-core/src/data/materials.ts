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
    accessibility: {
      spokenName: 'pine wood',
      description: 'Pine wood is a light, affordable softwood. It is easy to work with but catches fire easily.',
      iconShape: 'triangle',
    },
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
    accessibility: {
      spokenName: 'sandstone',
      description: 'Sandstone is a sedimentary rock made of compressed sand grains. It is easy to carve and has been used in buildings for thousands of years.',
      iconShape: 'square',
    },
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
    accessibility: {
      spokenName: 'clay brick',
      description: 'Clay brick is made by firing shaped clay in a kiln. It resists fire and weathering, making it one of the oldest building materials still in use.',
      iconShape: 'square',
    },
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
    accessibility: {
      spokenName: 'oak wood',
      description: 'Oak wood is a dense, strong hardwood prized for its durability. It is widely used in furniture, flooring, and timber-frame construction.',
      iconShape: 'triangle',
    },
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
    accessibility: {
      spokenName: 'limestone',
      description: 'Limestone is a sedimentary rock rich in calcium carbonate. It is the key ingredient in cement and is used in many historic buildings.',
      iconShape: 'square',
    },
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
    accessibility: {
      spokenName: 'granite',
      description: 'Granite is an extremely hard igneous rock with very high compressive strength. It is commonly used for countertops, monuments, and building foundations.',
      iconShape: 'square',
    },
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
    accessibility: {
      spokenName: 'bamboo',
      description: 'Bamboo is a fast-growing grass with remarkable tensile strength for its weight. It is used for scaffolding, bridges, and houses across Asia.',
      iconShape: 'triangle',
    },
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
    accessibility: {
      spokenName: 'concrete',
      description: 'Concrete is a mixture of cement, water, sand, and gravel that hardens into stone-like mass. It is very strong under compression but very weak under tension.',
      iconShape: 'hexagon',
    },
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
    accessibility: {
      spokenName: 'mild steel',
      description: 'Mild steel is strong and relatively inexpensive. It is the most common structural steel in buildings and bridges.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'wrought iron',
      description: 'Wrought iron is a tough, malleable iron with very low carbon content. It was the primary structural metal before steel, used in railings, gates, and early bridges.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'soda-lime glass',
      description: 'Soda-lime glass is the most common type of glass, made from sand, soda ash, and lime. It is incredibly strong under compression but shatters easily under impact.',
      iconShape: 'circle',
    },
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
    accessibility: {
      spokenName: 'reinforced concrete',
      description: 'Reinforced concrete embeds steel rebar inside concrete to handle tension. This combination makes it far stronger than plain concrete and is used in most modern structures.',
      iconShape: 'hexagon',
    },
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
    accessibility: {
      spokenName: 'copper',
      description: 'Copper is a soft, ductile metal that resists corrosion. It is widely used for roofing, plumbing, and electrical wiring in buildings.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'high-strength steel',
      description: 'High-strength steel is an advanced structural steel that is stronger than mild steel at the same weight. It is used in skyscrapers and long-span bridges.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'aluminium alloy',
      description: 'Aluminium alloy 6061 is lightweight yet strong, with about one-third the density of steel. It is used in aircraft, curtain walls, and lightweight structural frames.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'pre-stressed concrete',
      description: 'Pre-stressed concrete has steel tendons stretched inside it before it sets, keeping the concrete permanently compressed. It can span longer distances than regular reinforced concrete.',
      iconShape: 'hexagon',
    },
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
    accessibility: {
      spokenName: 'stainless steel',
      description: 'Stainless steel contains chromium that forms an invisible protective layer, preventing rust. It is used in kitchen equipment, medical instruments, and building facades.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'titanium alloy',
      description: 'Titanium alloy is as strong as steel but nearly half the weight, and it resists corrosion almost completely. It is used in aerospace, medical implants, and high-performance architecture.',
      iconShape: 'star',
    },
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
    accessibility: {
      spokenName: 'carbon fiber composite',
      description: 'Carbon fiber composite weaves thin carbon strands into a resin matrix, creating a material with extraordinary strength-to-weight ratio. It is used in race cars, aircraft, and advanced bridges.',
      iconShape: 'pentagon',
    },
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
    accessibility: {
      spokenName: 'ultra-high-performance concrete',
      description: 'Ultra-high-performance concrete uses fine powders and steel fibers to achieve compressive strength five times that of regular concrete. It is used in thin, elegant structures like pedestrian bridges.',
      iconShape: 'hexagon',
    },
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
