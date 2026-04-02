import type { BiomeMusic } from './types.js';

// ---------------------------------------------------------------------------
// Biome sound identifiers
// Every biome has a consistent set of ambient, action, and feedback sounds.
// All sounds are warm and positive — no buzzers, sad trombones, or failure stings.
// ---------------------------------------------------------------------------

export const WORKSHOP_SOUNDS = {
  ambient: 'workshop-ambient',
  hammerTap: 'workshop-hammer',
  gearTurn: 'workshop-gear-turn',
  crystalChime: 'workshop-crystal',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const FOREST_SOUNDS = {
  ambient: 'forest-ambient',
  birdSong: 'forest-bird-song',
  windRustle: 'forest-wind-rustle',
  leafCrunch: 'forest-leaf-crunch',
  streamFlow: 'forest-stream',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const CAVERN_SOUNDS = {
  ambient: 'cavern-ambient',
  waterDrip: 'cavern-water-drip',
  crystalHum: 'cavern-crystal-hum',
  echoStep: 'cavern-echo-step',
  stoneShift: 'cavern-stone-shift',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const LAB_SOUNDS = {
  ambient: 'lab-ambient',
  bubblePop: 'lab-bubble-pop',
  glassClank: 'lab-glass-clank',
  liquidPour: 'lab-liquid-pour',
  steamHiss: 'lab-steam-hiss',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const OBSERVATORY_SOUNDS = {
  ambient: 'observatory-ambient',
  starTwinkle: 'observatory-star-twinkle',
  telescopeWhir: 'observatory-telescope-whir',
  cosmicHum: 'observatory-cosmic-hum',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const CODE_FORGE_SOUNDS = {
  ambient: 'codeforge-ambient',
  keyType: 'codeforge-key-type',
  circuitPulse: 'codeforge-circuit-pulse',
  dataFlow: 'codeforge-data-flow',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const LIBRARY_SOUNDS = {
  ambient: 'library-ambient',
  pageTurn: 'library-page-turn',
  whisper: 'library-whisper',
  bookClose: 'library-book-close',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const TRADING_POST_SOUNDS = {
  ambient: 'tradingpost-ambient',
  coinClink: 'tradingpost-coin-clink',
  bargainBell: 'tradingpost-bargain-bell',
  crowdMurmur: 'tradingpost-crowd-murmur',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const RUINS_SOUNDS = {
  ambient: 'ruins-ambient',
  ancientChime: 'ruins-ancient-chime',
  stoneScrape: 'ruins-stone-scrape',
  dustSettle: 'ruins-dust-settle',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const STORM_TOWER_SOUNDS = {
  ambient: 'stormtower-ambient',
  thunderRumble: 'stormtower-thunder',
  electricArc: 'stormtower-electric-arc',
  windHowl: 'stormtower-wind-howl',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

export const SHIPYARD_SOUNDS = {
  ambient: 'shipyard-ambient',
  wavesCrash: 'shipyard-waves-crash',
  ropePull: 'shipyard-rope-pull',
  bellRing: 'shipyard-bell-ring',
  companionGreet: 'companion-greet',
  questStart: 'quest-start-chime',
  success: 'gentle-success',
  discovery: 'discovery-sparkle',
} as const;

// ---------------------------------------------------------------------------
// Shared feedback sounds (used across all biomes)
// Warm and positive — never punishing, never judgmental.
// ---------------------------------------------------------------------------

export const FEEDBACK_SOUNDS = {
  /** Bright ascending chime (major chord, 200ms) */
  correct: 'feedback-correct-chime',
  /** Soft neutral tone (150ms, gentle, no punishment) */
  tryAgain: 'feedback-try-again-soft',
  /** Wonder chord — open fifth with shimmer (500ms) */
  discovery: 'discovery-sparkle',
  /** Solid click + structural settling (300ms) */
  buildSuccess: 'feedback-build-click',
  /** Playful crumble — not scary (800ms) */
  buildCollapse: 'feedback-build-crumble-playful',
  /** Bubbling completion + sparkle (400ms) */
  craftSuccess: 'feedback-craft-bubble-sparkle',
  /** Comedic poof/smoke (300ms) */
  craftPoof: 'feedback-craft-poof',
  /** Short memorable fanfare (2s) */
  questComplete: 'feedback-quest-complete',
  /** Ancient resonance + chime (1s) */
  storyFragment: 'feedback-story-fragment',
  /** Subtle warm glow tone (500ms) — player feels it, doesn't know why */
  levelUp: 'feedback-level-up-glow',
  /** Warm welcoming chime for starting a quest */
  questStart: 'quest-start-chime',
  /** Gentle positive sound (never triumphant or judgmental) */
  success: 'gentle-success',
} as const;

// ---------------------------------------------------------------------------
// Universal sounds
// ---------------------------------------------------------------------------

export const UI_SOUNDS = {
  menuOpen: 'ui-menu-open',
  menuClose: 'ui-menu-close',
  menuSelect: 'ui-menu-select',
  menuNavigate: 'ui-menu-navigate',
  inventoryOpen: 'ui-inventory-open',
  inventoryClose: 'ui-inventory-close',
  saveGame: 'ui-save-game',
  mapOpen: 'ui-map-open',
} as const;

export const FOOTSTEP_SOUNDS = {
  grass: 'footstep-grass',
  stone: 'footstep-stone',
  wood: 'footstep-wood',
  sand: 'footstep-sand',
  water: 'footstep-water',
  metal: 'footstep-metal',
} as const;

// ---------------------------------------------------------------------------
// Biome music registry — 3 adaptive layers per biome
// ---------------------------------------------------------------------------

export const BIOME_MUSIC_REGISTRY: Record<string, BiomeMusic> = {
  workshop: {
    biomeId: 'workshop',
    ambientLayer: 'music-workshop-ambient',
    activityLayer: 'music-workshop-activity',
    intensityLayer: 'music-workshop-intensity',
  },
  forest: {
    biomeId: 'forest',
    ambientLayer: 'music-forest-ambient',
    activityLayer: 'music-forest-activity',
    intensityLayer: 'music-forest-intensity',
  },
  caverns: {
    biomeId: 'caverns',
    ambientLayer: 'music-caverns-ambient',
    activityLayer: 'music-caverns-activity',
    intensityLayer: 'music-caverns-intensity',
  },
  lab: {
    biomeId: 'lab',
    ambientLayer: 'music-lab-ambient',
    activityLayer: 'music-lab-activity',
    intensityLayer: 'music-lab-intensity',
  },
  observatory: {
    biomeId: 'observatory',
    ambientLayer: 'music-observatory-ambient',
    activityLayer: 'music-observatory-activity',
    intensityLayer: 'music-observatory-intensity',
  },
  codeforge: {
    biomeId: 'codeforge',
    ambientLayer: 'music-codeforge-ambient',
    activityLayer: 'music-codeforge-activity',
    intensityLayer: 'music-codeforge-intensity',
  },
  library: {
    biomeId: 'library',
    ambientLayer: 'music-library-ambient',
    activityLayer: 'music-library-activity',
    intensityLayer: 'music-library-intensity',
  },
  tradingpost: {
    biomeId: 'tradingpost',
    ambientLayer: 'music-tradingpost-ambient',
    activityLayer: 'music-tradingpost-activity',
    intensityLayer: 'music-tradingpost-intensity',
  },
  ruins: {
    biomeId: 'ruins',
    ambientLayer: 'music-ruins-ambient',
    activityLayer: 'music-ruins-activity',
    intensityLayer: 'music-ruins-intensity',
  },
  stormtower: {
    biomeId: 'stormtower',
    ambientLayer: 'music-stormtower-ambient',
    activityLayer: 'music-stormtower-activity',
    intensityLayer: 'music-stormtower-intensity',
  },
  shipyard: {
    biomeId: 'shipyard',
    ambientLayer: 'music-shipyard-ambient',
    activityLayer: 'music-shipyard-activity',
    intensityLayer: 'music-shipyard-intensity',
  },
};
