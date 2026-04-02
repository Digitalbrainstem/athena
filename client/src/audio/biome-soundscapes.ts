// ---------------------------------------------------------------------------
// Biome Soundscapes — 27 biome ambient definitions
// Each biome has layered ambient sound, music layers, and a caption.
// All biome IDs match those in nexus-core/data/biomes.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Musical key constants (frequencies for root notes)
// Only the root notes actually used by biome soundscapes:
// ---------------------------------------------------------------------------

// Science biomes: C major / A minor
const C4 = 261.63;
const A3 = 220.00;

// Nature biomes: G major
const G3 = 196.00;

// Engineering biomes: D minor
const D3 = 146.83;

// Humanities biomes: F major
const F3 = 174.61;

// Social biomes: Bb major
const Bb2 = 116.54;

// ---------------------------------------------------------------------------
// Biome sound profile
// ---------------------------------------------------------------------------

export type MusicLayer = 'ambient' | 'activity' | 'intensity';

export interface BiomeSoundscape {
  biomeId: string;
  name: string;
  /** Caption displayed when ambient is playing */
  ambientCaption: string;
  /** SFX IDs composing the ambient soundscape */
  ambientLayers: string[];
  /** Music caption per layer */
  musicCaptions: Record<MusicLayer, string>;
  /** Musical key root frequency */
  keyRoot: number;
  /** Pentatonic scale degrees for music generation (relative to keyRoot) */
  scaleRatios: number[];
  /** Tempo in BPM for music generation */
  tempoBase: number;
  /** Reverb mix (0–1) */
  reverbMix: number;
}

// A pentatonic scale has 5 notes. Ratios from root:
// Major pentatonic: 1, 9/8, 5/4, 3/2, 5/3
const MAJOR_PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
// Minor pentatonic: 1, 6/5, 4/3, 3/2, 9/5
const MINOR_PENTA = [1, 6 / 5, 4 / 3, 3 / 2, 9 / 5];

// ---------------------------------------------------------------------------
// All 27 biome soundscapes
// ---------------------------------------------------------------------------

export const BIOME_SOUNDSCAPES: Readonly<Record<string, BiomeSoundscape>> = Object.freeze({
  // ---- Science cluster (C major / A minor) ----

  workshop: {
    biomeId: 'workshop',
    name: 'The Workshop',
    ambientCaption: '[Workshop atmosphere: gentle hammering, gear turning, warm hum]',
    ambientLayers: ['workshop-ambient'],
    musicCaptions: {
      ambient: '[Calm workshop music]',
      activity: '[Active workshop rhythm]',
      intensity: '[Focused workshop energy]',
    },
    keyRoot: C4,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 80,
    reverbMix: 0.3,
  },

  'alchemist-lab': {
    biomeId: 'alchemist-lab',
    name: "The Alchemist's Lab",
    ambientCaption: "[Alchemist's lab: bubbling potions, mystical hum]",
    ambientLayers: ['alchemist-lab-ambient'],
    musicCaptions: {
      ambient: '[Mysterious alchemy music]',
      activity: '[Active brewing rhythm]',
      intensity: '[Magical transformation energy]',
    },
    keyRoot: A3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 70,
    reverbMix: 0.35,
  },

  'crystal-caverns': {
    biomeId: 'crystal-caverns',
    name: 'The Crystal Caverns',
    ambientCaption: '[Crystal caverns: echoing drips, crystal resonance, underground wind]',
    ambientLayers: ['cavern-ambient'],
    musicCaptions: {
      ambient: '[Ethereal cavern music]',
      activity: '[Crystal exploration rhythm]',
      intensity: '[Deep cavern energy]',
    },
    keyRoot: A3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 60,
    reverbMix: 0.7,
  },

  observatory: {
    biomeId: 'observatory',
    name: 'The Observatory',
    ambientCaption: '[Observatory: cosmic wind, telescope machinery, starlight]',
    ambientLayers: ['observatory-ambient'],
    musicCaptions: {
      ambient: '[Cosmic ambient music]',
      activity: '[Stargazing melody]',
      intensity: '[Celestial discovery energy]',
    },
    keyRoot: C4,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 55,
    reverbMix: 0.5,
  },

  laboratory: {
    biomeId: 'laboratory',
    name: 'The Laboratory',
    ambientCaption: '[Laboratory: equipment hum, precision instruments]',
    ambientLayers: ['laboratory-ambient'],
    musicCaptions: {
      ambient: '[Scientific ambient music]',
      activity: '[Experiment rhythm]',
      intensity: '[Discovery energy]',
    },
    keyRoot: C4,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 75,
    reverbMix: 0.25,
  },

  'storm-tower': {
    biomeId: 'storm-tower',
    name: 'The Storm Tower',
    ambientCaption: '[Storm tower: wind, distant thunder, crackling electricity]',
    ambientLayers: ['stormtower-ambient'],
    musicCaptions: {
      ambient: '[Dramatic storm music]',
      activity: '[Electric storm rhythm]',
      intensity: '[Thunder energy]',
    },
    keyRoot: A3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 90,
    reverbMix: 0.4,
  },

  'space-station': {
    biomeId: 'space-station',
    name: 'The Space Station',
    ambientCaption: '[Space station: hull ambience, air circulation, distant machinery]',
    ambientLayers: ['spacestation-ambient'],
    musicCaptions: {
      ambient: '[Weightless ambient music]',
      activity: '[Orbital operations rhythm]',
      intensity: '[Cosmic mission energy]',
    },
    keyRoot: C4,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 50,
    reverbMix: 0.2,
  },

  // ---- Nature cluster (G major) ----

  'living-forest': {
    biomeId: 'living-forest',
    name: 'The Living Forest',
    ambientCaption: '[Living forest: birds singing, rustling leaves, flowing stream]',
    ambientLayers: ['forest-ambient'],
    musicCaptions: {
      ambient: '[Peaceful forest music]',
      activity: '[Forest adventure rhythm]',
      intensity: '[Forest discovery energy]',
    },
    keyRoot: G3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 72,
    reverbMix: 0.3,
  },

  farm: {
    biomeId: 'farm',
    name: 'The Farm',
    ambientCaption: '[Farm: birds, wind through crops, distant creek]',
    ambientLayers: ['farm-ambient'],
    musicCaptions: {
      ambient: '[Pastoral farm music]',
      activity: '[Harvest rhythm]',
      intensity: '[Farming energy]',
    },
    keyRoot: G3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 78,
    reverbMix: 0.2,
  },

  'healers-sanctuary': {
    biomeId: 'healers-sanctuary',
    name: "The Healer's Sanctuary",
    ambientCaption: "[Healer's sanctuary: soft chimes, gentle nature sounds]",
    ambientLayers: ['healers-sanctuary-ambient'],
    musicCaptions: {
      ambient: '[Healing ambient music]',
      activity: '[Gentle healing rhythm]',
      intensity: '[Restorative energy]',
    },
    keyRoot: G3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 60,
    reverbMix: 0.35,
  },

  hospital: {
    biomeId: 'hospital',
    name: 'The Hospital',
    ambientCaption: '[Hospital: soft beeping, gentle footsteps, calm atmosphere]',
    ambientLayers: ['hospital-ambient'],
    musicCaptions: {
      ambient: '[Calm hospital music]',
      activity: '[Caring rhythm]',
      intensity: '[Life-saving energy]',
    },
    keyRoot: G3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 65,
    reverbMix: 0.25,
  },

  'explorers-map': {
    biomeId: 'explorers-map',
    name: "The Explorer's Map",
    ambientCaption: "[Explorer's map: wind, compass ticking, distant horizons]",
    ambientLayers: ['explorers-map-ambient'],
    musicCaptions: {
      ambient: '[Adventurous ambient music]',
      activity: '[Exploration rhythm]',
      intensity: '[Discovery energy]',
    },
    keyRoot: G3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 85,
    reverbMix: 0.3,
  },

  // ---- Engineering cluster (D minor) ----

  'code-forge': {
    biomeId: 'code-forge',
    name: 'The Code Forge',
    ambientCaption: '[Code Forge: keyboard typing, electronic hum, data processing]',
    ambientLayers: ['codeforge-ambient'],
    musicCaptions: {
      ambient: '[Digital ambient music]',
      activity: '[Coding rhythm]',
      intensity: '[Algorithm energy]',
    },
    keyRoot: D3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 85,
    reverbMix: 0.2,
  },

  'architects-domain': {
    biomeId: 'architects-domain',
    name: "The Architect's Domain",
    ambientCaption: "[Architect's domain: drafting sounds, geometric hums]",
    ambientLayers: ['architects-domain-ambient'],
    musicCaptions: {
      ambient: '[Structural ambient music]',
      activity: '[Building rhythm]',
      intensity: '[Construction energy]',
    },
    keyRoot: D3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 76,
    reverbMix: 0.3,
  },

  shipyard: {
    biomeId: 'shipyard',
    name: 'The Shipyard',
    ambientCaption: '[Shipyard: waves crashing, rope pulling, ship bell]',
    ambientLayers: ['shipyard-ambient'],
    musicCaptions: {
      ambient: '[Maritime ambient music]',
      activity: '[Seafaring rhythm]',
      intensity: '[Voyage energy]',
    },
    keyRoot: D3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 82,
    reverbMix: 0.35,
  },

  'digital-world': {
    biomeId: 'digital-world',
    name: 'The Digital World',
    ambientCaption: '[Digital world: data streams, network pulses]',
    ambientLayers: ['digital-world-ambient'],
    musicCaptions: {
      ambient: '[Cybernetic ambient music]',
      activity: '[Network rhythm]',
      intensity: '[System energy]',
    },
    keyRoot: D3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 90,
    reverbMix: 0.15,
  },

  arena: {
    biomeId: 'arena',
    name: 'The Arena',
    ambientCaption: '[Arena: strategic atmosphere, focused energy]',
    ambientLayers: ['arena-ambient'],
    musicCaptions: {
      ambient: '[Strategic ambient music]',
      activity: '[Competition rhythm]',
      intensity: '[Champion energy]',
    },
    keyRoot: D3,
    scaleRatios: MINOR_PENTA,
    tempoBase: 95,
    reverbMix: 0.35,
  },

  // ---- Humanities cluster (F major) ----

  'library-echoes': {
    biomeId: 'library-echoes',
    name: 'The Library of Echoes',
    ambientCaption: '[Library: page turning, soft whispers, candle flicker]',
    ambientLayers: ['library-ambient'],
    musicCaptions: {
      ambient: '[Contemplative library music]',
      activity: '[Reading rhythm]',
      intensity: '[Knowledge discovery energy]',
    },
    keyRoot: F3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 56,
    reverbMix: 0.4,
  },

  'ancient-ruins': {
    biomeId: 'ancient-ruins',
    name: 'The Ancient Ruins',
    ambientCaption: '[Ancient ruins: wind through stones, distant chimes]',
    ambientLayers: ['ruins-ambient'],
    musicCaptions: {
      ambient: '[Ancient ambient music]',
      activity: '[Archaeological rhythm]',
      intensity: '[Ancient discovery energy]',
    },
    keyRoot: F3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 62,
    reverbMix: 0.5,
  },

  'time-rift': {
    biomeId: 'time-rift',
    name: 'The Time Rift',
    ambientCaption: '[Time rift: temporal distortion, echoing whispers]',
    ambientLayers: ['time-rift-ambient'],
    musicCaptions: {
      ambient: '[Temporal ambient music]',
      activity: '[Time-shifting rhythm]',
      intensity: '[Temporal surge energy]',
    },
    keyRoot: F3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 68,
    reverbMix: 0.55,
  },

  gallery: {
    biomeId: 'gallery',
    name: 'The Gallery',
    ambientCaption: '[Gallery: echoing footsteps, quiet reverence]',
    ambientLayers: ['gallery-ambient'],
    musicCaptions: {
      ambient: '[Artistic ambient music]',
      activity: '[Creative rhythm]',
      intensity: '[Artistic energy]',
    },
    keyRoot: F3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 58,
    reverbMix: 0.45,
  },

  theater: {
    biomeId: 'theater',
    name: 'The Theater',
    ambientCaption: '[Theater: hushed anticipation, velvet warmth]',
    ambientLayers: ['theater-ambient'],
    musicCaptions: {
      ambient: '[Theatrical ambient music]',
      activity: '[Performance rhythm]',
      intensity: '[Dramatic energy]',
    },
    keyRoot: F3,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 72,
    reverbMix: 0.4,
  },

  // ---- Social cluster (Bb major) ----

  'trading-post': {
    biomeId: 'trading-post',
    name: 'The Trading Post',
    ambientCaption: '[Trading post: crowd murmur, coin clinking, bargain bells]',
    ambientLayers: ['tradingpost-ambient'],
    musicCaptions: {
      ambient: '[Bustling market music]',
      activity: '[Trading rhythm]',
      intensity: '[Bargain energy]',
    },
    keyRoot: Bb2,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 92,
    reverbMix: 0.25,
  },

  marketplace: {
    biomeId: 'marketplace',
    name: 'The Marketplace',
    ambientCaption: '[Marketplace: haggling, coins, bustling activity]',
    ambientLayers: ['marketplace-ambient'],
    musicCaptions: {
      ambient: '[Lively market music]',
      activity: '[Commerce rhythm]',
      intensity: '[Business energy]',
    },
    keyRoot: Bb2,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 95,
    reverbMix: 0.2,
  },

  'debate-hall': {
    biomeId: 'debate-hall',
    name: 'The Debate Hall',
    ambientCaption: '[Debate hall: scholarly murmur, thoughtful atmosphere]',
    ambientLayers: ['debate-hall-ambient'],
    musicCaptions: {
      ambient: '[Philosophical ambient music]',
      activity: '[Debate rhythm]',
      intensity: '[Rhetorical energy]',
    },
    keyRoot: Bb2,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 80,
    reverbMix: 0.35,
  },

  newsroom: {
    biomeId: 'newsroom',
    name: 'The Newsroom',
    ambientCaption: '[Newsroom: typing, printers, busy energy]',
    ambientLayers: ['newsroom-ambient'],
    musicCaptions: {
      ambient: '[Newsroom ambient music]',
      activity: '[Deadline rhythm]',
      intensity: '[Breaking news energy]',
    },
    keyRoot: Bb2,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 100,
    reverbMix: 0.2,
  },

  'music-hall': {
    biomeId: 'music-hall',
    name: 'The Music Hall',
    ambientCaption: '[Music hall: resonant space, acoustic warmth]',
    ambientLayers: ['music-hall-ambient'],
    musicCaptions: {
      ambient: '[Resonant hall music]',
      activity: '[Musical performance rhythm]',
      intensity: '[Crescendo energy]',
    },
    keyRoot: Bb2,
    scaleRatios: MAJOR_PENTA,
    tempoBase: 88,
    reverbMix: 0.5,
  },
});

/** Total number of defined biome soundscapes */
export const BIOME_COUNT = Object.keys(BIOME_SOUNDSCAPES).length;

/** Get a biome soundscape by ID, returning undefined if not found */
export function getBiomeSoundscape(biomeId: string): BiomeSoundscape | undefined {
  return BIOME_SOUNDSCAPES[biomeId];
}

/** Get all biome IDs */
export function getAllBiomeIds(): string[] {
  return Object.keys(BIOME_SOUNDSCAPES);
}

/** Get ambient caption for a biome */
export function getBiomeAmbientCaption(biomeId: string): string {
  const scape = BIOME_SOUNDSCAPES[biomeId];
  return scape?.ambientCaption ?? `[${biomeId} ambient sounds]`;
}

/** Get music caption for a biome layer */
export function getBiomeMusicCaption(biomeId: string, layer: MusicLayer): string {
  const scape = BIOME_SOUNDSCAPES[biomeId];
  return scape?.musicCaptions[layer] ?? `[${biomeId} ${layer} music]`;
}
