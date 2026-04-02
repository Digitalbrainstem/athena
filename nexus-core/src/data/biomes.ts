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
  observatory: {
    spokenName: 'The Observatory',
    description: 'A mountain-top telescope station with star charts, an orrery, a light prism, and a constellation map under a vast night sky.',
    ambientDescription: 'A soft hum of instruments fills the air. Wind whispers across the stone platform under a vast, star-filled sky.',
  },
  'storm-tower': {
    spokenName: 'The Storm Tower',
    description: 'A tower piercing the clouds with a lightning rod, wind turbine, Tesla coil, and weather instruments.',
    ambientDescription: 'Thunder rumbles in the distance. Wind howls through metal grating. A faint crackling of static electricity is constant.',
  },
  'healers-sanctuary': {
    spokenName: "The Healer's Sanctuary",
    description: 'A calm garden sanctuary with an anatomy model, herb garden, microscope, and nutrition table.',
    ambientDescription: 'Gentle wind chimes ring softly. Water trickles over smooth stones. The air smells of fresh herbs.',
  },
  hospital: {
    spokenName: 'The Hospital',
    description: 'A working hospital with a patient ward, surgery observation gallery, X-ray lightbox, pharmacy, and emergency triage.',
    ambientDescription: 'Soft beeping of monitors and quiet footsteps on clean floors. A calm voice occasionally announces over a speaker.',
  },
  farm: {
    spokenName: 'The Farm',
    description: 'A working farm with crop fields, animal pens, a greenhouse, market stand, and irrigation system.',
    ambientDescription: 'A rooster calls in the distance. Bees buzz between flower rows. A gentle breeze rustles through tall crops.',
  },
  laboratory: {
    spokenName: 'The Laboratory',
    description: 'A science laboratory with an experiment bench, safety station, hypothesis board, centrifuge, Bunsen burner, and periodic table wall.',
    ambientDescription: 'A soft hum of ventilation fans. The quiet bubbling of a water bath. Glassware clinks occasionally.',
  },
  'architects-domain': {
    spokenName: "The Architect's Domain",
    description: 'A grand design studio with a drafting table, load calculator, tessellation wall, building sandbox, and city planner.',
    ambientDescription: 'Pencils sketch across paper. Scale models click together. A distant crane hums.',
  },
  shipyard: {
    spokenName: 'The Shipyard',
    description: 'A bustling harbor workshop with a drydock, engine workshop, navigation console, and wind tunnel.',
    ambientDescription: 'Waves lap against docks. Welding sparks crackle. Ropes creak under tension.',
  },
  'code-forge': {
    spokenName: 'The Code Forge',
    description: 'A glowing digital workshop with a code terminal, robot workshop, circuit board station, and algorithm visualizer.',
    ambientDescription: 'Keyboards click softly. Holographic code scrolls upward. A robot whirs as it follows instructions.',
  },
  'digital-world': {
    spokenName: 'The Digital World',
    description: 'A neon-lit cyberspace with server racks, firewall controls, data stream displays, and encryption puzzles.',
    ambientDescription: 'Data streams hum like rivers. Firewalls crackle with energy. Encrypted messages pulse in rhythmic patterns.',
  },
  'space-station': {
    spokenName: 'The Space Station',
    description: 'An orbital outpost with mission control, telescopes, a zero-gravity lab, reactor core, and communication dish.',
    ambientDescription: 'Life support hums steadily. Stars drift past the viewport. Radio signals chirp from distant sources.',
  },
  'debate-hall': {
    spokenName: 'The Debate Hall',
    description: 'A columned amphitheatre with a podium, logic puzzle board, ethics scenario table, and Socratic circle.',
    ambientDescription: 'Voices echo off marble walls. A quill scratches on parchment. Soft murmurs of deliberation fill the room.',
  },
  'trading-post': {
    spokenName: 'The Trading Post',
    description: 'A frontier outpost with a market board, trade counter, warehouse, ledger desk, and auction block.',
    ambientDescription: 'Merchants call out prices. Coins clink on counters. Crates are stacked and counted.',
  },
  arena: {
    spokenName: 'The Arena',
    description: 'A grand coliseum of the mind with a strategy table, game board, probability machine, and puzzle vault.',
    ambientDescription: 'Game pieces clatter on stone. A crowd murmurs with anticipation. Gears of puzzle mechanisms turn and click.',
  },
  'music-hall': {
    spokenName: 'The Music Hall',
    description: 'A resonant concert hall with an instrument forge, sound wave display, rhythm machine, and acoustics chamber.',
    ambientDescription: 'A piano plays softly. Tuning forks ring with pure tones. Echoes dance between curved walls.',
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
  'observatory',
  'storm-tower',
  'healers-sanctuary',
  'hospital',
  'farm',
  'laboratory',
  'architects-domain',
  'shipyard',
  'code-forge',
  'digital-world',
  'space-station',
  'debate-hall',
  'trading-post',
  'arena',
  'music-hall',
] as const;

export type BiomeId = (typeof BIOME_IDS)[number];

/** Validate that a biome ID exists. */
export function isValidBiome(id: string): id is BiomeId {
  return BIOME_IDS.includes(id);
}
