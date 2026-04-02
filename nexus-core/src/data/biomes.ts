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
  'ancient-ruins': {
    spokenName: 'The Ancient Ruins',
    description: 'Crumbling structures from a lost civilization with excavation sites, inscribed walls, and artifact tables.',
    ambientDescription: 'Wind whispers through stone corridors. Distant chiseling echoes off weathered columns.',
  },
  'time-rift': {
    spokenName: 'The Time Rift',
    description: 'A shimmering portal chamber where historical periods converge and cause-and-effect unfolds.',
    ambientDescription: 'A deep harmonic hum pulses rhythmically. Clock-like ticking echoes from every direction.',
  },
  'explorers-map': {
    spokenName: "The Explorer's Map",
    description: 'A cartographer\'s base with world maps, compasses, globes, and cultural displays from every continent.',
    ambientDescription: 'Compass needles click softly. Parchment rustles as an ocean breeze drifts through open windows.',
  },
  gallery: {
    spokenName: 'The Gallery',
    description: 'A creative studio and museum with easels, sculpture stations, and art from every era.',
    ambientDescription: 'Soft footsteps on polished floors. Brushstrokes swish gently. A quiet hum of creative energy fills the air.',
  },
  newsroom: {
    spokenName: 'The Newsroom',
    description: 'A bustling media center with an editor\'s desk, printing press, interview booth, and archive library.',
    ambientDescription: 'Typewriter keys clatter rapidly. A printing press rumbles in the background. Urgent murmuring fills the room.',
  },
  theater: {
    spokenName: 'The Theater',
    description: 'A grand performance hall with a stage, costume workshop, and script writing desk.',
    ambientDescription: 'Heavy curtains rustle. Footsteps echo on a wooden stage. A spotlight hums overhead.',
  },
  marketplace: {
    spokenName: 'The Marketplace',
    description: 'A vibrant trading hub with market stalls, a bank counter, and a supply chain map.',
    ambientDescription: 'Coins clink on countertops. Cheerful haggling and the creak of wooden carts fill a bustling open-air market.',
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
  'ancient-ruins',
  'time-rift',
  'explorers-map',
  'gallery',
  'newsroom',
  'theater',
  'marketplace',
] as const;

export type BiomeId = (typeof BIOME_IDS)[number];

/** Validate that a biome ID exists. */
export function isValidBiome(id: string): id is BiomeId {
  return BIOME_IDS.includes(id);
}
