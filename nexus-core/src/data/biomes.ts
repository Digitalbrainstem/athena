// Biome definitions with accessibility metadata
// Re-exports the biome data that was previously only in WorldSystem.

export interface BiomeAccessibility {
  spokenName: string;
  description: string;
  ambientDescription: string;
}

export const BIOME_ACCESSIBILITY: Record<string, BiomeAccessibility> = {
  workshop: {
    spokenName: 'The Workshop',
    description: 'A large inventor\'s workshop with tools, gears, and building materials everywhere.',
    ambientDescription: 'You hear gears turning and tools clinking.',
  },
  'alchemist-lab': {
    spokenName: 'The Alchemist\'s Lab',
    description: 'A mysterious laboratory with bubbling potions and glowing jars.',
    ambientDescription: 'Bubbling liquids and quiet hissing fill the air.',
  },
  'crystal-caverns': {
    spokenName: 'The Crystal Caverns',
    description: 'Glittering underground caverns filled with crystals and mineral veins.',
    ambientDescription: 'Water drips echo through the cavern. Crystals hum softly.',
  },
  'living-forest': {
    spokenName: 'The Living Forest',
    description: 'A vibrant forest teeming with animals, trees, and mushrooms.',
    ambientDescription: 'Birds sing, leaves rustle, and a stream babbles nearby.',
  },
  'library-echoes': {
    spokenName: 'The Library of Echoes',
    description: 'An endless library where books whisper and words float through the air.',
    ambientDescription: 'Pages turn softly. Quiet whispers echo between the shelves.',
  },
};

/** Get accessibility metadata for a biome. */
export function getBiomeAccessibility(biomeId: string): BiomeAccessibility | undefined {
  return BIOME_ACCESSIBILITY[biomeId];
}

// The actual BiomeDefinition objects are in systems/world.ts.
// This module extends them with accessibility only.
// If you need the full definition, import from systems/world.ts.

/** List of all biome IDs in canonical order. */
export const BIOME_IDS: readonly string[] = [
  'workshop',
  'alchemist-lab',
  'crystal-caverns',
  'living-forest',
  'library-echoes',
] as const;

export type BiomeId = (typeof BIOME_IDS)[number];

/** Validate that a biome ID exists. */
export function isValidBiome(id: string): id is BiomeId {
  return BIOME_IDS.includes(id);
}
