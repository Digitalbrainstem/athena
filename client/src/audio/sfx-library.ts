// ---------------------------------------------------------------------------
// SFX Library — 200+ procedural sound effect recipes
// Every sound is generated at runtime using Web Audio API.
// No external audio files. No negative/failure sounds.
// All sounds are warm, positive, and inviting.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SFX recipe types
// ---------------------------------------------------------------------------

export type OscType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface OscillatorStep {
  type: OscType;
  frequency: number;
  /** Frequency at the end of this step (portamento). Same as frequency if omitted. */
  frequencyEnd?: number;
  gain: number;
  /** Gain at the end of this step (envelope). Same as gain if omitted. */
  gainEnd?: number;
  /** Start offset in seconds from recipe start */
  offset: number;
  /** Duration in seconds */
  duration: number;
  /** Detune in cents */
  detune?: number;
}

export interface NoiseStep {
  /** 'white' = flat spectrum, 'pink' = -3dB/octave, 'brown' = -6dB/octave */
  color: 'white' | 'pink' | 'brown';
  gain: number;
  gainEnd?: number;
  offset: number;
  duration: number;
  /** Lowpass filter cutoff in Hz */
  filterFreq?: number;
  /** Highpass filter cutoff in Hz */
  highpassFreq?: number;
  /** Bandpass center frequency in Hz */
  bandpassFreq?: number;
  bandpassQ?: number;
}

export interface SFXRecipe {
  /** Human-readable caption text for accessibility */
  caption: string;
  oscillators: OscillatorStep[];
  noises: NoiseStep[];
  /** Total duration in seconds (for buffer allocation) */
  duration: number;
}

// ---------------------------------------------------------------------------
// Note frequencies (A4 = 440Hz, equal temperament)
// ---------------------------------------------------------------------------

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const G4 = 392.00;
const A4 = 440.00;
const C5 = 523.25;
const E5 = 659.26;
const G5 = 783.99;
const A5 = 880.00;
const B5 = 987.77;
const C6 = 1046.50;

const A3 = 220.00;
const G3 = 196.00;

// ---------------------------------------------------------------------------
// UI Sounds
// ---------------------------------------------------------------------------

const uiSounds: Record<string, SFXRecipe> = {
  'gentle-success': {
    caption: '[Gentle success chime]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: C4, gain: 0.3, gainEnd: 0.2, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: E4, gain: 0.3, gainEnd: 0.2, offset: 0.1, duration: 0.15 },
      { type: 'sine', frequency: G4, gain: 0.35, gainEnd: 0.0, offset: 0.2, duration: 0.3 },
    ],
    noises: [],
  },

  'discovery-sparkle': {
    caption: '[Discovery sparkle]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: E5, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'sine', frequency: G5, gain: 0.15, gainEnd: 0.0, offset: 0.05, duration: 0.08 },
      { type: 'sine', frequency: C6, gain: 0.12, gainEnd: 0.0, offset: 0.1, duration: 0.1 },
      { type: 'sine', frequency: B5, gain: 0.12, gainEnd: 0.0, offset: 0.18, duration: 0.08 },
      { type: 'sine', frequency: E5, gain: 0.1, gainEnd: 0.0, offset: 0.25, duration: 0.12 },
      { type: 'sine', frequency: A5, gain: 0.12, gainEnd: 0.0, offset: 0.32, duration: 0.1 },
      { type: 'sine', frequency: C6, gain: 0.15, gainEnd: 0.0, offset: 0.4, duration: 0.2 },
    ],
    noises: [],
  },

  'quest-start-chime': {
    caption: '[Quest start chime]',
    duration: 0.8,
    oscillators: [
      { type: 'triangle', frequency: G4, gain: 0.3, gainEnd: 0.15, offset: 0, duration: 0.25 },
      { type: 'triangle', frequency: C5, gain: 0.35, gainEnd: 0.15, offset: 0.2, duration: 0.25 },
      { type: 'sine', frequency: E5, gain: 0.3, gainEnd: 0.0, offset: 0.4, duration: 0.4 },
    ],
    noises: [],
  },

  'menu-select': {
    caption: '[Menu select]',
    duration: 0.08,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.04 },
    ],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 4000 },
    ],
  },

  'menu-back': {
    caption: '[Menu back]',
    duration: 0.1,
    oscillators: [
      { type: 'sine', frequency: 600, frequencyEnd: 400, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 3000 },
    ],
  },

  'ui-menu-open': {
    caption: '[Menu open]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: 400, frequencyEnd: 600, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.12 },
    ],
    noises: [],
  },

  'ui-menu-close': {
    caption: '[Menu close]',
    duration: 0.12,
    oscillators: [
      { type: 'sine', frequency: 500, frequencyEnd: 350, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [],
  },

  'ui-menu-navigate': {
    caption: '[Menu navigate]',
    duration: 0.06,
    oscillators: [
      { type: 'sine', frequency: 700, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.04 },
    ],
    noises: [],
  },

  'ui-inventory-open': {
    caption: '[Inventory open]',
    duration: 0.25,
    oscillators: [
      { type: 'triangle', frequency: C5, gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'triangle', frequency: G5, gain: 0.15, gainEnd: 0.0, offset: 0.08, duration: 0.17 },
    ],
    noises: [],
  },

  'ui-inventory-close': {
    caption: '[Inventory close]',
    duration: 0.2,
    oscillators: [
      { type: 'triangle', frequency: G4, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'triangle', frequency: C4, gain: 0.12, gainEnd: 0.0, offset: 0.05, duration: 0.15 },
    ],
    noises: [],
  },

  'ui-save-game': {
    caption: '[Game saved]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: E4, gain: 0.2, gainEnd: 0.1, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: G4, gain: 0.2, gainEnd: 0.0, offset: 0.15, duration: 0.25 },
    ],
    noises: [],
  },

  'ui-map-open': {
    caption: '[Map open]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: D4, gain: 0.15, gainEnd: 0.05, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: A4, gain: 0.18, gainEnd: 0.0, offset: 0.1, duration: 0.2 },
    ],
    noises: [
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 2000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Footstep sounds
// ---------------------------------------------------------------------------

const footstepSounds: Record<string, SFXRecipe> = {
  'footstep-stone': {
    caption: '[Footsteps on stone]',
    duration: 0.12,
    oscillators: [
      { type: 'square', frequency: 120, frequencyEnd: 80, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [
      { color: 'white', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 3000, highpassFreq: 500 },
    ],
  },

  'footstep-wood': {
    caption: '[Footsteps on wood]',
    duration: 0.1,
    oscillators: [
      { type: 'triangle', frequency: 200, frequencyEnd: 150, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.06 },
    ],
    noises: [
      { color: 'pink', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.06, filterFreq: 2500 },
    ],
  },

  'footstep-grass': {
    caption: '[Footsteps on grass]',
    duration: 0.12,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 5000, highpassFreq: 1000 },
    ],
  },

  'footstep-metal': {
    caption: '[Footsteps on metal]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.03 },
      { type: 'sine', frequency: 1200, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.04 },
    ],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.06, filterFreq: 6000, highpassFreq: 1500 },
    ],
  },

  'footstep-sand': {
    caption: '[Footsteps on sand]',
    duration: 0.15,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.12, filterFreq: 3000, highpassFreq: 800 },
    ],
  },

  'footstep-water': {
    caption: '[Footsteps in water]',
    duration: 0.2,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 4000 },
      { color: 'pink', gain: 0.06, gainEnd: 0.0, offset: 0.04, duration: 0.15, filterFreq: 2000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Water sounds
// ---------------------------------------------------------------------------

const waterSounds: Record<string, SFXRecipe> = {
  'water-splash': {
    caption: '[Water splash]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 100, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.15 },
    ],
    noises: [
      { color: 'white', gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.3, filterFreq: 5000 },
      { color: 'pink', gain: 0.1, gainEnd: 0.0, offset: 0.1, duration: 0.35, filterFreq: 3000 },
    ],
  },

  'water-flowing': {
    caption: '[Flowing water]',
    duration: 2.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.08, gainEnd: 0.08, offset: 0, duration: 2.0, filterFreq: 2500, highpassFreq: 200 },
      { color: 'white', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 2.0, filterFreq: 4000, highpassFreq: 500 },
    ],
  },

  'water-drip': {
    caption: '[Water drip]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 1800, frequencyEnd: 800, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.06 },
      { type: 'sine', frequency: 1400, frequencyEnd: 600, gain: 0.06, gainEnd: 0.0, offset: 0.1, duration: 0.05 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Fire sounds
// ---------------------------------------------------------------------------

const fireSounds: Record<string, SFXRecipe> = {
  'fire-crackle': {
    caption: '[Fire crackle]',
    duration: 0.4,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05, filterFreq: 3000 },
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0.02, duration: 0.04, filterFreq: 5000, highpassFreq: 1000 },
      { color: 'brown', gain: 0.06, gainEnd: 0.0, offset: 0.12, duration: 0.04, filterFreq: 2500 },
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0.2, duration: 0.03, filterFreq: 4500, highpassFreq: 800 },
      { color: 'brown', gain: 0.05, gainEnd: 0.0, offset: 0.28, duration: 0.04, filterFreq: 2000 },
    ],
  },

  'fire-whoosh': {
    caption: '[Fire whoosh]',
    duration: 0.6,
    oscillators: [
      { type: 'sawtooth', frequency: 100, frequencyEnd: 300, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.4 },
    ],
    noises: [
      { color: 'white', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.5, filterFreq: 4000, highpassFreq: 500 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Wind sounds
// ---------------------------------------------------------------------------

const windSounds: Record<string, SFXRecipe> = {
  'wind-gentle': {
    caption: '[Gentle wind]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.04, gainEnd: 0.06, offset: 0, duration: 1.5, filterFreq: 1200, highpassFreq: 100 },
      { color: 'pink', gain: 0.06, gainEnd: 0.03, offset: 1.5, duration: 1.5, filterFreq: 1000, highpassFreq: 80 },
    ],
  },

  'wind-strong': {
    caption: '[Strong wind]',
    duration: 3.0,
    oscillators: [
      { type: 'sawtooth', frequency: 60, frequencyEnd: 80, gain: 0.03, gainEnd: 0.02, offset: 0, duration: 3.0 },
    ],
    noises: [
      { color: 'pink', gain: 0.12, gainEnd: 0.15, offset: 0, duration: 1.5, filterFreq: 2000, highpassFreq: 200 },
      { color: 'white', gain: 0.06, gainEnd: 0.08, offset: 0, duration: 3.0, filterFreq: 3000, highpassFreq: 400 },
      { color: 'pink', gain: 0.15, gainEnd: 0.1, offset: 1.5, duration: 1.5, filterFreq: 1800, highpassFreq: 150 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Crystal sounds
// ---------------------------------------------------------------------------

const crystalSounds: Record<string, SFXRecipe> = {
  'crystal-chime': {
    caption: '[Crystal chime]',
    duration: 1.2,
    oscillators: [
      { type: 'sine', frequency: 1200, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 1800, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.6 },
      { type: 'sine', frequency: 2400, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.5 },
      { type: 'sine', frequency: 3000, gain: 0.03, gainEnd: 0.0, offset: 0.05, duration: 0.4 },
    ],
    noises: [],
  },

  'crystal-hum': {
    caption: '[Crystal hum]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 440, gain: 0.06, gainEnd: 0.06, offset: 0, duration: 2.0, detune: 3 },
      { type: 'sine', frequency: 660, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 2.0, detune: -2 },
      { type: 'sine', frequency: 880, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 2.0 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Mechanical / workshop sounds
// ---------------------------------------------------------------------------

const mechanicalSounds: Record<string, SFXRecipe> = {
  'gear-turn': {
    caption: '[Gear turning]',
    duration: 0.5,
    oscillators: [
      { type: 'square', frequency: 80, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'square', frequency: 90, gain: 0.06, gainEnd: 0.0, offset: 0.1, duration: 0.08 },
      { type: 'square', frequency: 85, gain: 0.06, gainEnd: 0.0, offset: 0.2, duration: 0.08 },
      { type: 'square', frequency: 95, gain: 0.06, gainEnd: 0.0, offset: 0.3, duration: 0.08 },
      { type: 'square', frequency: 82, gain: 0.05, gainEnd: 0.0, offset: 0.4, duration: 0.08 },
    ],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.5, filterFreq: 800 },
    ],
  },

  'gear-click': {
    caption: '[Gear click]',
    duration: 0.08,
    oscillators: [
      { type: 'square', frequency: 150, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.03 },
    ],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 3000, highpassFreq: 500 },
    ],
  },

  'hammer-tap': {
    caption: '[Hammer tap]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 300, frequencyEnd: 150, gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.05, filterFreq: 4000, highpassFreq: 800 },
    ],
  },

  'anvil-ring': {
    caption: '[Anvil ring]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 1.0 },
      { type: 'sine', frequency: 1600, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 2400, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.5 },
    ],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 6000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Crafting sounds
// ---------------------------------------------------------------------------

const craftingSounds: Record<string, SFXRecipe> = {
  'potion-bubble': {
    caption: '[Potion bubbling]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 300, frequencyEnd: 500, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 350, frequencyEnd: 550, gain: 0.08, gainEnd: 0.0, offset: 0.12, duration: 0.1 },
      { type: 'sine', frequency: 280, frequencyEnd: 480, gain: 0.07, gainEnd: 0.0, offset: 0.25, duration: 0.1 },
      { type: 'sine', frequency: 320, frequencyEnd: 520, gain: 0.06, gainEnd: 0.0, offset: 0.35, duration: 0.1 },
    ],
    noises: [],
  },

  'potion-pour': {
    caption: '[Potion pouring]',
    duration: 1.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.06, gainEnd: 0.08, offset: 0, duration: 0.5, filterFreq: 3000, highpassFreq: 300 },
      { color: 'pink', gain: 0.08, gainEnd: 0.03, offset: 0.5, duration: 0.5, filterFreq: 2500, highpassFreq: 200 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Door sounds
// ---------------------------------------------------------------------------

const doorSounds: Record<string, SFXRecipe> = {
  'door-open': {
    caption: '[Door opening]',
    duration: 0.5,
    oscillators: [
      { type: 'sawtooth', frequency: 60, frequencyEnd: 100, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.4 },
    ],
    noises: [
      { color: 'brown', gain: 0.08, gainEnd: 0.02, offset: 0, duration: 0.4, filterFreq: 600 },
    ],
  },

  'door-close': {
    caption: '[Door closing]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 60, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'brown', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 800 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Book / library sounds
// ---------------------------------------------------------------------------

const bookSounds: Record<string, SFXRecipe> = {
  'book-open': {
    caption: '[Book opening]',
    duration: 0.3,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.15, filterFreq: 4000, highpassFreq: 1500 },
      { color: 'pink', gain: 0.04, gainEnd: 0.0, offset: 0.08, duration: 0.15, filterFreq: 3000, highpassFreq: 800 },
    ],
  },

  'page-turn': {
    caption: '[Page turning]',
    duration: 0.25,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.15, filterFreq: 5000, highpassFreq: 2000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Nature / animal sounds
// ---------------------------------------------------------------------------

const natureSounds: Record<string, SFXRecipe> = {
  'bird-chirp': {
    caption: '[Bird chirp]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 2200, frequencyEnd: 3000, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.06 },
      { type: 'sine', frequency: 2800, frequencyEnd: 2200, gain: 0.08, gainEnd: 0.0, offset: 0.08, duration: 0.06 },
    ],
    noises: [],
  },

  'bird-song': {
    caption: '[Bird song]',
    duration: 1.2,
    oscillators: [
      { type: 'sine', frequency: 1800, frequencyEnd: 2400, gain: 0.08, gainEnd: 0.03, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 2400, frequencyEnd: 2000, gain: 0.07, gainEnd: 0.0, offset: 0.2, duration: 0.12 },
      { type: 'sine', frequency: 2000, frequencyEnd: 2800, gain: 0.08, gainEnd: 0.03, offset: 0.4, duration: 0.15 },
      { type: 'sine', frequency: 2600, frequencyEnd: 1800, gain: 0.06, gainEnd: 0.0, offset: 0.6, duration: 0.2 },
      { type: 'sine', frequency: 2200, frequencyEnd: 3000, gain: 0.07, gainEnd: 0.0, offset: 0.85, duration: 0.15 },
    ],
    noises: [],
  },

  'insect-buzz': {
    caption: '[Insect buzzing]',
    duration: 1.0,
    oscillators: [
      { type: 'sawtooth', frequency: 180, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 0.5, detune: 5 },
      { type: 'sawtooth', frequency: 185, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 0.5, detune: -5 },
      { type: 'sawtooth', frequency: 175, gain: 0.02, gainEnd: 0.0, offset: 0.5, duration: 0.5 },
    ],
    noises: [],
  },

  'leaves-rustle': {
    caption: '[Leaves rustling]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.06, offset: 0, duration: 0.3, filterFreq: 6000, highpassFreq: 2000 },
      { color: 'white', gain: 0.06, gainEnd: 0.02, offset: 0.3, duration: 0.5, filterFreq: 5000, highpassFreq: 1500 },
    ],
  },

  'rain-light': {
    caption: '[Light rain]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.06, offset: 0, duration: 3.0, filterFreq: 8000, highpassFreq: 1000 },
      { color: 'pink', gain: 0.04, gainEnd: 0.04, offset: 0, duration: 3.0, filterFreq: 4000, highpassFreq: 500 },
    ],
  },

  'rain-heavy': {
    caption: '[Heavy rain]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.12, offset: 0, duration: 3.0, filterFreq: 10000, highpassFreq: 500 },
      { color: 'pink', gain: 0.08, gainEnd: 0.08, offset: 0, duration: 3.0, filterFreq: 5000, highpassFreq: 200 },
      { color: 'brown', gain: 0.04, gainEnd: 0.04, offset: 0, duration: 3.0, filterFreq: 400 },
    ],
  },

  'thunder': {
    caption: '[Thunder]',
    duration: 3.0,
    oscillators: [
      { type: 'sine', frequency: 40, frequencyEnd: 25, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 2.5 },
      { type: 'sawtooth', frequency: 60, frequencyEnd: 30, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 2.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.2, gainEnd: 0.0, offset: 0, duration: 2.0, filterFreq: 600 },
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.8, filterFreq: 3000 },
    ],
  },

  'frog-croak': {
    caption: '[Frog croak]',
    duration: 0.4,
    oscillators: [
      { type: 'square', frequency: 80, frequencyEnd: 60, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.2 },
      { type: 'square', frequency: 85, frequencyEnd: 55, gain: 0.06, gainEnd: 0.0, offset: 0.22, duration: 0.15 },
    ],
    noises: [],
  },

  'owl-hoot': {
    caption: '[Owl hooting]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 350, frequencyEnd: 320, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.3 },
      { type: 'sine', frequency: 280, frequencyEnd: 260, gain: 0.12, gainEnd: 0.0, offset: 0.5, duration: 0.4 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Science sounds
// ---------------------------------------------------------------------------

const scienceSounds: Record<string, SFXRecipe> = {
  'electric-zap': {
    caption: '[Electric zap]',
    duration: 0.3,
    oscillators: [
      { type: 'sawtooth', frequency: 80, frequencyEnd: 200, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.05 },
      { type: 'square', frequency: 1000, frequencyEnd: 3000, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 8000, highpassFreq: 2000 },
    ],
  },

  'electric-hum': {
    caption: '[Electric hum]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 60, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 2.0 },
      { type: 'sine', frequency: 120, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 2.0 },
      { type: 'sine', frequency: 180, gain: 0.01, gainEnd: 0.01, offset: 0, duration: 2.0 },
    ],
    noises: [],
  },

  'chemical-fizz': {
    caption: '[Chemical fizzing]',
    duration: 1.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.1, offset: 0, duration: 0.5, filterFreq: 8000, highpassFreq: 3000 },
      { color: 'white', gain: 0.1, gainEnd: 0.03, offset: 0.5, duration: 0.5, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },

  'chemical-bubble': {
    caption: '[Chemical bubbling]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 250, frequencyEnd: 400, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 300, frequencyEnd: 500, gain: 0.05, gainEnd: 0.0, offset: 0.15, duration: 0.1 },
      { type: 'sine', frequency: 220, frequencyEnd: 380, gain: 0.04, gainEnd: 0.0, offset: 0.3, duration: 0.1 },
      { type: 'sine', frequency: 350, frequencyEnd: 550, gain: 0.05, gainEnd: 0.0, offset: 0.5, duration: 0.1 },
      { type: 'sine', frequency: 280, frequencyEnd: 450, gain: 0.04, gainEnd: 0.0, offset: 0.65, duration: 0.1 },
      { type: 'sine', frequency: 310, frequencyEnd: 480, gain: 0.04, gainEnd: 0.0, offset: 0.8, duration: 0.1 },
    ],
    noises: [],
  },

  'telescope-focus': {
    caption: '[Telescope focusing]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 400, gain: 0.04, gainEnd: 0.02, offset: 0, duration: 0.6 },
    ],
    noises: [
      { color: 'brown', gain: 0.05, gainEnd: 0.02, offset: 0, duration: 0.7, filterFreq: 500 },
    ],
  },

  'heartbeat-monitor': {
    caption: '[Heartbeat monitor]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'sine', frequency: 800, gain: 0.1, gainEnd: 0.0, offset: 0.15, duration: 0.06 },
    ],
    noises: [],
  },

  'typing-keyboard': {
    caption: '[Keyboard typing]',
    duration: 0.5,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.02, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.07, gainEnd: 0.0, offset: 0.06, duration: 0.02, filterFreq: 4500, highpassFreq: 1200 },
      { color: 'white', gain: 0.09, gainEnd: 0.0, offset: 0.11, duration: 0.02, filterFreq: 5500, highpassFreq: 1800 },
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0.18, duration: 0.02, filterFreq: 4000, highpassFreq: 1000 },
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0.24, duration: 0.02, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.07, gainEnd: 0.0, offset: 0.3, duration: 0.02, filterFreq: 4800, highpassFreq: 1400 },
      { color: 'white', gain: 0.09, gainEnd: 0.0, offset: 0.38, duration: 0.02, filterFreq: 5200, highpassFreq: 1600 },
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0.44, duration: 0.02, filterFreq: 4200, highpassFreq: 1100 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Feedback sounds (used across all biomes — warm and positive)
// ---------------------------------------------------------------------------

const feedbackSounds: Record<string, SFXRecipe> = {
  'feedback-correct-chime': {
    caption: '[Bright chime]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: C5, gain: 0.25, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: E5, gain: 0.2, gainEnd: 0.0, offset: 0.05, duration: 0.15 },
      { type: 'sine', frequency: G5, gain: 0.2, gainEnd: 0.0, offset: 0.1, duration: 0.2 },
    ],
    noises: [],
  },

  'feedback-try-again-soft': {
    caption: '[Soft tone]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: E4, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.15 },
    ],
    noises: [],
  },

  'feedback-build-click': {
    caption: '[Build click]',
    duration: 0.35,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 150, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'brown', gain: 0.1, gainEnd: 0.03, offset: 0, duration: 0.15, filterFreq: 1000 },
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.2, filterFreq: 2000, highpassFreq: 400 },
    ],
  },

  'feedback-build-crumble-playful': {
    caption: '[Playful crumble]',
    duration: 0.9,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 80, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.6 },
    ],
    noises: [
      { color: 'brown', gain: 0.1, gainEnd: 0.02, offset: 0, duration: 0.7, filterFreq: 800 },
      { color: 'pink', gain: 0.06, gainEnd: 0.0, offset: 0.2, duration: 0.5, filterFreq: 2000, highpassFreq: 300 },
    ],
  },

  'feedback-craft-bubble-sparkle': {
    caption: '[Craft sparkle]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 400, frequencyEnd: 600, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 500, frequencyEnd: 700, gain: 0.06, gainEnd: 0.0, offset: 0.08, duration: 0.1 },
      { type: 'sine', frequency: E5, gain: 0.1, gainEnd: 0.0, offset: 0.2, duration: 0.15 },
      { type: 'sine', frequency: G5, gain: 0.1, gainEnd: 0.0, offset: 0.3, duration: 0.2 },
    ],
    noises: [],
  },

  'feedback-craft-poof': {
    caption: '[Comedic poof]',
    duration: 0.35,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 100, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.15 },
    ],
    noises: [
      { color: 'white', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.2, filterFreq: 3000 },
    ],
  },

  'feedback-quest-complete': {
    caption: '[Quest complete fanfare]',
    duration: 2.0,
    oscillators: [
      { type: 'triangle', frequency: G4, gain: 0.2, gainEnd: 0.15, offset: 0, duration: 0.3 },
      { type: 'triangle', frequency: C5, gain: 0.25, gainEnd: 0.15, offset: 0.25, duration: 0.3 },
      { type: 'triangle', frequency: E5, gain: 0.25, gainEnd: 0.15, offset: 0.5, duration: 0.3 },
      { type: 'sine', frequency: G5, gain: 0.3, gainEnd: 0.0, offset: 0.75, duration: 1.2 },
      { type: 'sine', frequency: C5, gain: 0.15, gainEnd: 0.0, offset: 0.75, duration: 1.0 },
      { type: 'sine', frequency: E5, gain: 0.12, gainEnd: 0.0, offset: 0.75, duration: 1.0 },
    ],
    noises: [],
  },

  'feedback-story-fragment': {
    caption: '[Story fragment discovered]',
    duration: 1.2,
    oscillators: [
      { type: 'sine', frequency: A3, gain: 0.1, gainEnd: 0.05, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: E4, gain: 0.08, gainEnd: 0.05, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 1200, gain: 0.06, gainEnd: 0.0, offset: 0.4, duration: 0.6 },
      { type: 'sine', frequency: 1800, gain: 0.04, gainEnd: 0.0, offset: 0.5, duration: 0.5 },
    ],
    noises: [],
  },

  'feedback-level-up-glow': {
    caption: '[Warm glow]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: C4, gain: 0.0, gainEnd: 0.15, offset: 0, duration: 0.3 },
      { type: 'sine', frequency: C4, gain: 0.15, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
      { type: 'sine', frequency: E4, gain: 0.0, gainEnd: 0.1, offset: 0, duration: 0.3 },
      { type: 'sine', frequency: E4, gain: 0.1, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
      { type: 'sine', frequency: G4, gain: 0.0, gainEnd: 0.08, offset: 0.1, duration: 0.25 },
      { type: 'sine', frequency: G4, gain: 0.08, gainEnd: 0.0, offset: 0.35, duration: 0.25 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Companion tones (simple tone patterns as placeholders for TTS)
// ---------------------------------------------------------------------------

const companionSounds: Record<string, SFXRecipe> = {
  'companion-greet': {
    caption: '[Companion greeting]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: G4, gain: 0.15, gainEnd: 0.1, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: C5, gain: 0.15, gainEnd: 0.1, offset: 0.15, duration: 0.2 },
      { type: 'sine', frequency: E5, gain: 0.12, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
    ],
    noises: [],
  },

  'companion-excited': {
    caption: '[Companion excited]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: C5, gain: 0.15, gainEnd: 0.1, offset: 0, duration: 0.12 },
      { type: 'sine', frequency: E5, gain: 0.15, gainEnd: 0.1, offset: 0.1, duration: 0.12 },
      { type: 'sine', frequency: G5, gain: 0.18, gainEnd: 0.0, offset: 0.2, duration: 0.3 },
    ],
    noises: [],
  },

  'companion-thinking': {
    caption: '[Companion thinking]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: E4, gain: 0.1, gainEnd: 0.08, offset: 0, duration: 0.35 },
      { type: 'sine', frequency: D4, gain: 0.08, gainEnd: 0.0, offset: 0.4, duration: 0.4 },
    ],
    noises: [],
  },

  'companion-celebrating': {
    caption: '[Companion celebrating]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: C5, gain: 0.15, gainEnd: 0.08, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: E5, gain: 0.15, gainEnd: 0.08, offset: 0.12, duration: 0.15 },
      { type: 'sine', frequency: G5, gain: 0.18, gainEnd: 0.08, offset: 0.24, duration: 0.15 },
      { type: 'sine', frequency: C6, gain: 0.2, gainEnd: 0.0, offset: 0.36, duration: 0.44 },
    ],
    noises: [],
  },

  'companion-curious': {
    caption: '[Companion curious]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: E4, gain: 0.1, gainEnd: 0.12, offset: 0, duration: 0.25 },
      { type: 'sine', frequency: A4, gain: 0.12, gainEnd: 0.0, offset: 0.2, duration: 0.3 },
    ],
    noises: [],
  },

  'companion-impressed': {
    caption: '[Companion impressed]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: C4, gain: 0.08, gainEnd: 0.12, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: G4, gain: 0.12, gainEnd: 0.15, offset: 0.15, duration: 0.2 },
      { type: 'sine', frequency: C5, gain: 0.15, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
    ],
    noises: [],
  },

  'companion-gentle-redirect': {
    caption: '[Companion gentle redirect]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: E4, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.35 },
      { type: 'sine', frequency: G4, gain: 0.06, gainEnd: 0.0, offset: 0.05, duration: 0.3 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Biome-specific action sounds
// ---------------------------------------------------------------------------

const biomeSpecificSounds: Record<string, SFXRecipe> = {
  // Workshop
  'workshop-ambient': {
    caption: '[Workshop atmosphere: gentle hammering, warm hum]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 120, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 180, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 500 },
    ],
  },
  'workshop-hammer': {
    caption: '[Workshop hammer]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 350, frequencyEnd: 180, gain: 0.18, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 4000, highpassFreq: 1000 },
    ],
  },
  'workshop-gear-turn': {
    caption: '[Workshop gear turning]',
    duration: 0.4,
    oscillators: [
      { type: 'square', frequency: 75, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.06 },
      { type: 'square', frequency: 85, gain: 0.05, gainEnd: 0.0, offset: 0.08, duration: 0.06 },
      { type: 'square', frequency: 80, gain: 0.05, gainEnd: 0.0, offset: 0.16, duration: 0.06 },
      { type: 'square', frequency: 90, gain: 0.05, gainEnd: 0.0, offset: 0.24, duration: 0.06 },
    ],
    noises: [
      { color: 'brown', gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.35, filterFreq: 600 },
    ],
  },
  'workshop-crystal': {
    caption: '[Workshop crystal chime]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 1000, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.6 },
      { type: 'sine', frequency: 1500, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.4 },
    ],
    noises: [],
  },

  // Forest
  'forest-ambient': {
    caption: '[Forest sounds: birds, rustling leaves, flowing water]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 2200, frequencyEnd: 2800, gain: 0.03, gainEnd: 0.0, offset: 0.5, duration: 0.08 },
      { type: 'sine', frequency: 2600, frequencyEnd: 2000, gain: 0.02, gainEnd: 0.0, offset: 1.2, duration: 0.06 },
      { type: 'sine', frequency: 2400, frequencyEnd: 3000, gain: 0.03, gainEnd: 0.0, offset: 2.5, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.02, gainEnd: 0.03, offset: 0, duration: 2.0, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.03, gainEnd: 0.02, offset: 2.0, duration: 2.0, filterFreq: 4500, highpassFreq: 1200 },
      { color: 'pink', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 2000, highpassFreq: 150 },
    ],
  },
  'forest-bird-song': {
    caption: '[Forest bird song]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 2000, frequencyEnd: 2600, gain: 0.07, gainEnd: 0.0, offset: 0, duration: 0.12 },
      { type: 'sine', frequency: 2500, frequencyEnd: 1900, gain: 0.06, gainEnd: 0.0, offset: 0.2, duration: 0.1 },
      { type: 'sine', frequency: 2200, frequencyEnd: 2800, gain: 0.06, gainEnd: 0.0, offset: 0.4, duration: 0.12 },
      { type: 'sine', frequency: 2700, frequencyEnd: 2100, gain: 0.05, gainEnd: 0.0, offset: 0.6, duration: 0.15 },
    ],
    noises: [],
  },
  'forest-wind-rustle': {
    caption: '[Forest wind rustle]',
    duration: 1.5,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.03, gainEnd: 0.05, offset: 0, duration: 0.7, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.05, gainEnd: 0.02, offset: 0.7, duration: 0.8, filterFreq: 4000, highpassFreq: 1200 },
    ],
  },
  'forest-leaf-crunch': {
    caption: '[Leaf crunch]',
    duration: 0.15,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },
  'forest-stream': {
    caption: '[Forest stream]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.05, gainEnd: 0.05, offset: 0, duration: 3.0, filterFreq: 3000, highpassFreq: 200 },
      { color: 'white', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 3.0, filterFreq: 5000, highpassFreq: 800 },
    ],
  },

  // Caverns
  'cavern-ambient': {
    caption: '[Crystal cavern: echoing drips, crystal resonance]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 440, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, detune: 3 },
      { type: 'sine', frequency: 660, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, detune: -2 },
      { type: 'sine', frequency: 1800, frequencyEnd: 800, gain: 0.04, gainEnd: 0.0, offset: 0.8, duration: 0.06 },
      { type: 'sine', frequency: 1600, frequencyEnd: 700, gain: 0.03, gainEnd: 0.0, offset: 2.2, duration: 0.05 },
      { type: 'sine', frequency: 1900, frequencyEnd: 900, gain: 0.03, gainEnd: 0.0, offset: 3.4, duration: 0.06 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 400 },
    ],
  },
  'cavern-water-drip': {
    caption: '[Cavern water drip]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 1600, frequencyEnd: 700, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [],
  },
  'cavern-crystal-hum': {
    caption: '[Cavern crystal hum]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 330, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 2.0, detune: 5 },
      { type: 'sine', frequency: 495, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 2.0, detune: -3 },
    ],
    noises: [],
  },
  'cavern-echo-step': {
    caption: '[Echoing footstep]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 120, frequencyEnd: 80, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05 },
      { type: 'sine', frequency: 100, frequencyEnd: 70, gain: 0.04, gainEnd: 0.0, offset: 0.15, duration: 0.04 },
      { type: 'sine', frequency: 90, frequencyEnd: 60, gain: 0.02, gainEnd: 0.0, offset: 0.3, duration: 0.04 },
    ],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 3000, highpassFreq: 500 },
    ],
  },
  'cavern-stone-shift': {
    caption: '[Stone shifting]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: 80, frequencyEnd: 50, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [
      { color: 'brown', gain: 0.12, gainEnd: 0.02, offset: 0, duration: 0.5, filterFreq: 600 },
    ],
  },

  // Lab
  'lab-ambient': {
    caption: '[Laboratory: bubbling, soft hum, glass clinking]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 300, frequencyEnd: 500, gain: 0.03, gainEnd: 0.0, offset: 0.3, duration: 0.08 },
      { type: 'sine', frequency: 350, frequencyEnd: 550, gain: 0.03, gainEnd: 0.0, offset: 1.0, duration: 0.08 },
      { type: 'sine', frequency: 280, frequencyEnd: 480, gain: 0.02, gainEnd: 0.0, offset: 2.0, duration: 0.08 },
      { type: 'sine', frequency: 320, frequencyEnd: 500, gain: 0.03, gainEnd: 0.0, offset: 3.0, duration: 0.08 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },
  'lab-bubble-pop': {
    caption: '[Bubble pop]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: 400, frequencyEnd: 600, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [],
  },
  'lab-glass-clank': {
    caption: '[Glass clank]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 2000, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 3000, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 8000, highpassFreq: 3000 },
    ],
  },
  'lab-liquid-pour': {
    caption: '[Liquid pouring]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.05, gainEnd: 0.07, offset: 0, duration: 0.4, filterFreq: 3000, highpassFreq: 300 },
      { color: 'pink', gain: 0.07, gainEnd: 0.03, offset: 0.4, duration: 0.4, filterFreq: 2500, highpassFreq: 200 },
    ],
  },
  'lab-steam-hiss': {
    caption: '[Steam hissing]',
    duration: 0.5,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.4, filterFreq: 8000, highpassFreq: 3000 },
    ],
  },

  // Observatory
  'observatory-ambient': {
    caption: '[Observatory: cosmic wind, telescope machinery]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 80, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 120, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, detune: 2 },
      { type: 'sine', frequency: 1500, gain: 0.02, gainEnd: 0.0, offset: 1.5, duration: 0.3 },
      { type: 'sine', frequency: 2000, gain: 0.015, gainEnd: 0.0, offset: 3.0, duration: 0.25 },
    ],
    noises: [
      { color: 'pink', gain: 0.025, gainEnd: 0.025, offset: 0, duration: 4.0, filterFreq: 1000, highpassFreq: 50 },
    ],
  },
  'observatory-star-twinkle': {
    caption: '[Star twinkle]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 2000, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 3000, gain: 0.04, gainEnd: 0.0, offset: 0.05, duration: 0.12 },
      { type: 'sine', frequency: 2500, gain: 0.05, gainEnd: 0.0, offset: 0.15, duration: 0.2 },
    ],
    noises: [],
  },
  'observatory-telescope-whir': {
    caption: '[Telescope whirring]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 200, frequencyEnd: 400, gain: 0.04, gainEnd: 0.02, offset: 0, duration: 0.6 },
    ],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.02, offset: 0, duration: 0.7, filterFreq: 500 },
    ],
  },
  'observatory-cosmic-hum': {
    caption: '[Cosmic hum]',
    duration: 3.0,
    oscillators: [
      { type: 'sine', frequency: 55, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 3.0 },
      { type: 'sine', frequency: 82.5, gain: 0.025, gainEnd: 0.025, offset: 0, duration: 3.0, detune: 4 },
      { type: 'sine', frequency: 110, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 3.0, detune: -3 },
    ],
    noises: [],
  },

  // Code Forge
  'codeforge-ambient': {
    caption: '[Code Forge: typing, electronic hum, data flow]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 60, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 120, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.2, duration: 0.02, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.5, duration: 0.02, filterFreq: 4500, highpassFreq: 1200 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.9, duration: 0.02, filterFreq: 5200, highpassFreq: 1600 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.3, duration: 0.02, filterFreq: 4800, highpassFreq: 1400 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.8, duration: 0.02, filterFreq: 5100, highpassFreq: 1500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 2.5, duration: 0.02, filterFreq: 4600, highpassFreq: 1300 },
    ],
  },
  'codeforge-key-type': {
    caption: '[Key press]',
    duration: 0.06,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 5000, highpassFreq: 1500 },
    ],
  },
  'codeforge-circuit-pulse': {
    caption: '[Circuit pulse]',
    duration: 0.3,
    oscillators: [
      { type: 'square', frequency: 200, frequencyEnd: 800, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 400, gain: 0.04, gainEnd: 0.0, offset: 0.05, duration: 0.2 },
    ],
    noises: [],
  },
  'codeforge-data-flow': {
    caption: '[Data flowing]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 300, frequencyEnd: 600, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: 400, frequencyEnd: 700, gain: 0.03, gainEnd: 0.0, offset: 0.2, duration: 0.2 },
      { type: 'sine', frequency: 500, frequencyEnd: 800, gain: 0.03, gainEnd: 0.0, offset: 0.4, duration: 0.2 },
      { type: 'sine', frequency: 350, frequencyEnd: 650, gain: 0.03, gainEnd: 0.0, offset: 0.6, duration: 0.2 },
    ],
    noises: [],
  },

  // Library
  'library-ambient': {
    caption: '[Library: page turning, soft whispers, candle flicker]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 100, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'white', gain: 0.015, gainEnd: 0.0, offset: 0.8, duration: 0.12, filterFreq: 5000, highpassFreq: 2000 },
      { color: 'white', gain: 0.012, gainEnd: 0.0, offset: 2.2, duration: 0.1, filterFreq: 4500, highpassFreq: 1800 },
      { color: 'brown', gain: 0.01, gainEnd: 0.01, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },
  'library-page-turn': {
    caption: '[Page turning]',
    duration: 0.2,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.12, filterFreq: 5000, highpassFreq: 2000 },
    ],
  },
  'library-whisper': {
    caption: '[Whisper]',
    duration: 0.6,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.02, gainEnd: 0.03, offset: 0, duration: 0.3, filterFreq: 3000, highpassFreq: 500 },
      { color: 'pink', gain: 0.03, gainEnd: 0.0, offset: 0.3, duration: 0.3, filterFreq: 2500, highpassFreq: 400 },
    ],
  },
  'library-book-close': {
    caption: '[Book closing]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: 150, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.06, filterFreq: 3000, highpassFreq: 800 },
    ],
  },

  // Trading Post
  'tradingpost-ambient': {
    caption: '[Trading post: crowd murmur, coin clinking, bells]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 1200, gain: 0.03, gainEnd: 0.0, offset: 1.0, duration: 0.15 },
      { type: 'sine', frequency: 1800, gain: 0.02, gainEnd: 0.0, offset: 2.5, duration: 0.12 },
    ],
    noises: [
      { color: 'pink', gain: 0.04, gainEnd: 0.04, offset: 0, duration: 4.0, filterFreq: 2000, highpassFreq: 200 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.5, duration: 0.02, filterFreq: 8000, highpassFreq: 4000 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.8, duration: 0.02, filterFreq: 7000, highpassFreq: 3500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 3.2, duration: 0.02, filterFreq: 8500, highpassFreq: 4500 },
    ],
  },
  'tradingpost-coin-clink': {
    caption: '[Coin clinking]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 4000, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'sine', frequency: 6000, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.06 },
    ],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.02, filterFreq: 10000, highpassFreq: 5000 },
    ],
  },
  'tradingpost-bargain-bell': {
    caption: '[Bargain bell]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 1000, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.6 },
      { type: 'sine', frequency: 2000, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.4 },
      { type: 'sine', frequency: 3000, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [],
  },
  'tradingpost-crowd-murmur': {
    caption: '[Crowd murmur]',
    duration: 2.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.05, gainEnd: 0.05, offset: 0, duration: 2.0, filterFreq: 2000, highpassFreq: 200 },
      { color: 'brown', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 2.0, filterFreq: 600, highpassFreq: 100 },
    ],
  },

  // Ruins
  'ruins-ambient': {
    caption: '[Ancient ruins: wind, stone echoes, distant chimes]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: A3, gain: 0.025, gainEnd: 0.025, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: E4, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 1200, gain: 0.02, gainEnd: 0.0, offset: 2.0, duration: 0.5 },
    ],
    noises: [
      { color: 'pink', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 1200, highpassFreq: 80 },
    ],
  },
  'ruins-ancient-chime': {
    caption: '[Ancient chime]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: A3, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 1.2 },
      { type: 'sine', frequency: E4, gain: 0.07, gainEnd: 0.0, offset: 0, duration: 1.0 },
      { type: 'sine', frequency: A4, gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.8 },
    ],
    noises: [],
  },
  'ruins-stone-scrape': {
    caption: '[Stone scraping]',
    duration: 0.5,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.1, gainEnd: 0.03, offset: 0, duration: 0.4, filterFreq: 1200, highpassFreq: 200 },
    ],
  },
  'ruins-dust-settle': {
    caption: '[Dust settling]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.7, filterFreq: 3000, highpassFreq: 500 },
    ],
  },

  // Storm Tower
  'stormtower-ambient': {
    caption: '[Storm tower: wind, distant thunder, crackling electricity]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 40, frequencyEnd: 30, gain: 0.04, gainEnd: 0.0, offset: 1.0, duration: 1.5 },
      { type: 'sawtooth', frequency: 50, frequencyEnd: 35, gain: 0.02, gainEnd: 0.0, offset: 1.0, duration: 1.0 },
    ],
    noises: [
      { color: 'pink', gain: 0.06, gainEnd: 0.08, offset: 0, duration: 2.0, filterFreq: 1500, highpassFreq: 100 },
      { color: 'pink', gain: 0.08, gainEnd: 0.05, offset: 2.0, duration: 2.0, filterFreq: 1800, highpassFreq: 150 },
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 2.5, duration: 0.1, filterFreq: 8000, highpassFreq: 2000 },
    ],
  },
  'stormtower-thunder': {
    caption: '[Thunder rumble]',
    duration: 2.5,
    oscillators: [
      { type: 'sine', frequency: 35, frequencyEnd: 20, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 2.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 1.5, filterFreq: 500 },
    ],
  },
  'stormtower-electric-arc': {
    caption: '[Electric arc]',
    duration: 0.4,
    oscillators: [
      { type: 'sawtooth', frequency: 100, frequencyEnd: 500, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'square', frequency: 1500, frequencyEnd: 4000, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.15, filterFreq: 10000, highpassFreq: 2000 },
    ],
  },
  'stormtower-wind-howl': {
    caption: '[Wind howling]',
    duration: 2.0,
    oscillators: [
      { type: 'sawtooth', frequency: 70, frequencyEnd: 100, gain: 0.03, gainEnd: 0.02, offset: 0, duration: 2.0 },
    ],
    noises: [
      { color: 'pink', gain: 0.08, gainEnd: 0.1, offset: 0, duration: 1.0, filterFreq: 1500, highpassFreq: 150 },
      { color: 'pink', gain: 0.1, gainEnd: 0.06, offset: 1.0, duration: 1.0, filterFreq: 1800, highpassFreq: 200 },
    ],
  },

  // Shipyard
  'shipyard-ambient': {
    caption: '[Shipyard: waves, rope, bell, maritime atmosphere]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.04, gainEnd: 0.0, offset: 1.5, duration: 0.8 },
      { type: 'sine', frequency: 1600, gain: 0.02, gainEnd: 0.0, offset: 1.5, duration: 0.5 },
    ],
    noises: [
      { color: 'pink', gain: 0.04, gainEnd: 0.06, offset: 0, duration: 2.0, filterFreq: 1500, highpassFreq: 100 },
      { color: 'pink', gain: 0.06, gainEnd: 0.03, offset: 2.0, duration: 2.0, filterFreq: 1200, highpassFreq: 80 },
    ],
  },
  'shipyard-waves-crash': {
    caption: '[Waves crashing]',
    duration: 2.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.02, gainEnd: 0.12, offset: 0, duration: 0.8, filterFreq: 2000, highpassFreq: 100 },
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0.6, duration: 0.5, filterFreq: 5000, highpassFreq: 500 },
      { color: 'pink', gain: 0.1, gainEnd: 0.02, offset: 0.8, duration: 1.2, filterFreq: 1500, highpassFreq: 80 },
    ],
  },
  'shipyard-rope-pull': {
    caption: '[Rope pulling]',
    duration: 0.5,
    oscillators: [
      { type: 'sawtooth', frequency: 60, frequencyEnd: 100, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [
      { color: 'brown', gain: 0.06, gainEnd: 0.02, offset: 0, duration: 0.4, filterFreq: 800, highpassFreq: 100 },
    ],
  },
  'shipyard-bell-ring': {
    caption: '[Ship bell]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: 700, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 1.2 },
      { type: 'sine', frequency: 1400, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 2100, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.5 },
    ],
    noises: [],
  },

  // Hospital
  'hospital-ambient': {
    caption: '[Hospital: soft beeping, calm atmosphere]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'sine', frequency: 800, gain: 0.05, gainEnd: 0.0, offset: 1.0, duration: 0.08 },
      { type: 'sine', frequency: 800, gain: 0.05, gainEnd: 0.0, offset: 2.0, duration: 0.08 },
      { type: 'sine', frequency: 800, gain: 0.05, gainEnd: 0.0, offset: 3.0, duration: 0.08 },
    ],
    noises: [
      { color: 'brown', gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },

  // Farm
  'farm-ambient': {
    caption: '[Farm: birds, wind through crops, distant creek]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 2200, frequencyEnd: 2800, gain: 0.025, gainEnd: 0.0, offset: 0.5, duration: 0.08 },
      { type: 'sine', frequency: 2600, frequencyEnd: 2100, gain: 0.02, gainEnd: 0.0, offset: 1.8, duration: 0.06 },
      { type: 'sine', frequency: 2400, frequencyEnd: 2900, gain: 0.025, gainEnd: 0.0, offset: 3.2, duration: 0.07 },
    ],
    noises: [
      { color: 'pink', gain: 0.03, gainEnd: 0.04, offset: 0, duration: 2.0, filterFreq: 1000, highpassFreq: 60 },
      { color: 'pink', gain: 0.04, gainEnd: 0.03, offset: 2.0, duration: 2.0, filterFreq: 900, highpassFreq: 50 },
      { color: 'pink', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 2000, highpassFreq: 150 },
    ],
  },

  // Space Station
  'spacestation-ambient': {
    caption: '[Space station: hull ambience, air circulation, machinery]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 50, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 100, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, detune: 3 },
    ],
    noises: [
      { color: 'brown', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 400 },
      { color: 'pink', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 1000, highpassFreq: 200 },
    ],
  },

  // Healer's Sanctuary
  'healers-sanctuary-ambient': {
    caption: '[Healer\'s sanctuary: soft chimes, gentle nature]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 528, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 396, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 1200, gain: 0.02, gainEnd: 0.0, offset: 1.5, duration: 0.3 },
      { type: 'sine', frequency: 1500, gain: 0.015, gainEnd: 0.0, offset: 3.0, duration: 0.25 },
    ],
    noises: [
      { color: 'pink', gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, filterFreq: 800, highpassFreq: 50 },
    ],
  },

  // Architect's Domain
  'architects-domain-ambient': {
    caption: '[Architect\'s domain: drafting, geometric hums]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 150, gain: 0.025, gainEnd: 0.025, offset: 0, duration: 4.0 },
      { type: 'triangle', frequency: 300, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 400 },
    ],
  },

  // Laboratory
  'laboratory-ambient': {
    caption: '[Laboratory: equipment hum, precision instruments]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 60, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: 120, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 350 },
      { color: 'white', gain: 0.01, gainEnd: 0.0, offset: 1.5, duration: 0.03, filterFreq: 5000, highpassFreq: 2000 },
      { color: 'white', gain: 0.01, gainEnd: 0.0, offset: 3.0, duration: 0.03, filterFreq: 4500, highpassFreq: 1800 },
    ],
  },

  // Explorer's Map
  'explorers-map-ambient': {
    caption: '[Explorer\'s map: wind, compass ticking, distant lands]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 0, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 0.5, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 1.0, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 1.5, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 2.0, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 2.5, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 3.0, duration: 0.02 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.0, offset: 3.5, duration: 0.02 },
    ],
    noises: [
      { color: 'pink', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 1000, highpassFreq: 60 },
    ],
  },

  // Time Rift
  'time-rift-ambient': {
    caption: '[Time rift: temporal distortion, echoing whispers]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 200, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 2.0 },
      { type: 'sine', frequency: 200, frequencyEnd: 100, gain: 0.03, gainEnd: 0.03, offset: 2.0, duration: 2.0 },
      { type: 'sine', frequency: 300, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, detune: 7 },
    ],
    noises: [
      { color: 'brown', gain: 0.025, gainEnd: 0.025, offset: 0, duration: 4.0, filterFreq: 500 },
    ],
  },

  // Arena
  'arena-ambient': {
    caption: '[Arena: strategic atmosphere, focused energy]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 80, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 400 },
      { color: 'pink', gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, filterFreq: 1200, highpassFreq: 100 },
    ],
  },

  // Music Hall
  'music-hall-ambient': {
    caption: '[Music hall: resonant space, acoustic warmth]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: C4, gain: 0.025, gainEnd: 0.025, offset: 0, duration: 4.0 },
      { type: 'sine', frequency: G3, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.01, gainEnd: 0.01, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },

  // Digital World
  'digital-world-ambient': {
    caption: '[Digital world: data streams, network pulses]',
    duration: 4.0,
    oscillators: [
      { type: 'square', frequency: 200, frequencyEnd: 400, gain: 0.02, gainEnd: 0.0, offset: 0.3, duration: 0.1 },
      { type: 'square', frequency: 300, frequencyEnd: 500, gain: 0.02, gainEnd: 0.0, offset: 1.2, duration: 0.1 },
      { type: 'square', frequency: 250, frequencyEnd: 450, gain: 0.02, gainEnd: 0.0, offset: 2.5, duration: 0.1 },
      { type: 'sine', frequency: 60, gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },

  // Debate Hall
  'debate-hall-ambient': {
    caption: '[Debate hall: scholarly murmur, thoughtful atmosphere]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 150, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'pink', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 1500, highpassFreq: 200 },
      { color: 'brown', gain: 0.01, gainEnd: 0.01, offset: 0, duration: 4.0, filterFreq: 400 },
    ],
  },

  // Gallery
  'gallery-ambient': {
    caption: '[Gallery: echoing footsteps, quiet reverence]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 200, gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.012, gainEnd: 0.012, offset: 0, duration: 4.0, filterFreq: 350 },
    ],
  },

  // Newsroom
  'newsroom-ambient': {
    caption: '[Newsroom: typing, printers, busy energy]',
    duration: 4.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.1, duration: 0.02, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.3, duration: 0.02, filterFreq: 4800, highpassFreq: 1400 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.5, duration: 0.02, filterFreq: 5200, highpassFreq: 1600 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 0.8, duration: 0.02, filterFreq: 4600, highpassFreq: 1300 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.1, duration: 0.02, filterFreq: 5100, highpassFreq: 1500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.4, duration: 0.02, filterFreq: 4900, highpassFreq: 1450 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 1.8, duration: 0.02, filterFreq: 5300, highpassFreq: 1700 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 2.2, duration: 0.02, filterFreq: 4700, highpassFreq: 1350 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 2.6, duration: 0.02, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.02, gainEnd: 0.0, offset: 3.0, duration: 0.02, filterFreq: 5200, highpassFreq: 1600 },
      { color: 'pink', gain: 0.03, gainEnd: 0.03, offset: 0, duration: 4.0, filterFreq: 2000, highpassFreq: 200 },
    ],
  },

  // Theater
  'theater-ambient': {
    caption: '[Theater: hushed anticipation, velvet warmth]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 100, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.015, gainEnd: 0.015, offset: 0, duration: 4.0, filterFreq: 300 },
    ],
  },

  // Marketplace
  'marketplace-ambient': {
    caption: '[Marketplace: haggling, coins, bustling activity]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 4000, gain: 0.02, gainEnd: 0.0, offset: 0.8, duration: 0.04 },
      { type: 'sine', frequency: 3500, gain: 0.015, gainEnd: 0.0, offset: 2.2, duration: 0.04 },
      { type: 'sine', frequency: 4200, gain: 0.02, gainEnd: 0.0, offset: 3.5, duration: 0.04 },
    ],
    noises: [
      { color: 'pink', gain: 0.045, gainEnd: 0.045, offset: 0, duration: 4.0, filterFreq: 2200, highpassFreq: 250 },
      { color: 'brown', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0, filterFreq: 500, highpassFreq: 80 },
    ],
  },

  // Alchemist's Lab
  'alchemist-lab-ambient': {
    caption: '[Alchemist\'s lab: bubbling, mystical hum, glass clinking]',
    duration: 4.0,
    oscillators: [
      { type: 'sine', frequency: 280, frequencyEnd: 450, gain: 0.025, gainEnd: 0.0, offset: 0.4, duration: 0.1 },
      { type: 'sine', frequency: 320, frequencyEnd: 500, gain: 0.025, gainEnd: 0.0, offset: 1.3, duration: 0.1 },
      { type: 'sine', frequency: 260, frequencyEnd: 420, gain: 0.02, gainEnd: 0.0, offset: 2.4, duration: 0.1 },
      { type: 'sine', frequency: 340, frequencyEnd: 520, gain: 0.025, gainEnd: 0.0, offset: 3.3, duration: 0.1 },
      { type: 'sine', frequency: 200, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 4.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.018, gainEnd: 0.018, offset: 0, duration: 4.0, filterFreq: 350 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Building / construction sounds
// ---------------------------------------------------------------------------

const buildingSounds: Record<string, SFXRecipe> = {
  'wood-place': {
    caption: '[Wood placing]',
    duration: 0.2,
    oscillators: [
      { type: 'triangle', frequency: 180, frequencyEnd: 120, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'pink', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 2500, highpassFreq: 400 },
    ],
  },
  'stone-place': {
    caption: '[Stone placing]',
    duration: 0.25,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 70, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.06, filterFreq: 3000, highpassFreq: 600 },
    ],
  },
  'metal-place': {
    caption: '[Metal placing]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 600, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 900, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 5000, highpassFreq: 1200 },
    ],
  },
  'rope-tie': {
    caption: '[Rope tying]',
    duration: 0.3,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.06, gainEnd: 0.03, offset: 0, duration: 0.2, filterFreq: 800, highpassFreq: 100 },
    ],
  },
  'brick-stack': {
    caption: '[Brick stacking]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: 150, frequencyEnd: 100, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.06 },
    ],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 2500, highpassFreq: 500 },
    ],
  },
  'glass-place': {
    caption: '[Glass placing]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 2200, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 3300, gain: 0.02, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [],
  },
  'bridge-creak': {
    caption: '[Bridge creaking]',
    duration: 0.8,
    oscillators: [
      { type: 'sawtooth', frequency: 50, frequencyEnd: 70, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.6 },
    ],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.02, offset: 0, duration: 0.7, filterFreq: 600 },
    ],
  },
  'structure-settle': {
    caption: '[Structure settling]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 60, frequencyEnd: 40, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [
      { color: 'brown', gain: 0.05, gainEnd: 0.01, offset: 0, duration: 0.4, filterFreq: 400 },
    ],
  },
  'pulley-crank': {
    caption: '[Pulley cranking]',
    duration: 0.6,
    oscillators: [
      { type: 'square', frequency: 60, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'square', frequency: 65, gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.08 },
      { type: 'square', frequency: 58, gain: 0.04, gainEnd: 0.0, offset: 0.2, duration: 0.08 },
      { type: 'square', frequency: 63, gain: 0.04, gainEnd: 0.0, offset: 0.3, duration: 0.08 },
      { type: 'square', frequency: 61, gain: 0.04, gainEnd: 0.0, offset: 0.4, duration: 0.08 },
    ],
    noises: [
      { color: 'brown', gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.5, filterFreq: 700 },
    ],
  },
  'lever-pull': {
    caption: '[Lever pulling]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 200, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.2 },
    ],
    noises: [
      { color: 'brown', gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.15, filterFreq: 600 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Creature sounds
// ---------------------------------------------------------------------------

const creatureSounds: Record<string, SFXRecipe> = {
  'cricket-chirp': {
    caption: '[Cricket chirping]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 4000, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.03 },
      { type: 'sine', frequency: 4200, gain: 0.04, gainEnd: 0.0, offset: 0.05, duration: 0.03 },
      { type: 'sine', frequency: 3800, gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.03 },
      { type: 'sine', frequency: 4100, gain: 0.04, gainEnd: 0.0, offset: 0.15, duration: 0.03 },
    ],
    noises: [],
  },
  'bee-buzz': {
    caption: '[Bee buzzing]',
    duration: 0.8,
    oscillators: [
      { type: 'sawtooth', frequency: 220, gain: 0.025, gainEnd: 0.025, offset: 0, duration: 0.4, detune: 3 },
      { type: 'sawtooth', frequency: 225, gain: 0.025, gainEnd: 0.0, offset: 0.4, duration: 0.4, detune: -3 },
    ],
    noises: [],
  },
  'fish-splash': {
    caption: '[Fish splashing]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 300, frequencyEnd: 150, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.15, filterFreq: 4000 },
    ],
  },
  'wolf-howl': {
    caption: '[Distant wolf howl]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 250, frequencyEnd: 400, gain: 0.0, gainEnd: 0.06, offset: 0, duration: 0.5 },
      { type: 'sine', frequency: 400, frequencyEnd: 350, gain: 0.06, gainEnd: 0.06, offset: 0.5, duration: 0.8 },
      { type: 'sine', frequency: 350, frequencyEnd: 200, gain: 0.06, gainEnd: 0.0, offset: 1.3, duration: 0.7 },
    ],
    noises: [],
  },
  'horse-neigh': {
    caption: '[Horse neighing]',
    duration: 0.8,
    oscillators: [
      { type: 'sawtooth', frequency: 200, frequencyEnd: 500, gain: 0.05, gainEnd: 0.03, offset: 0, duration: 0.3 },
      { type: 'sawtooth', frequency: 500, frequencyEnd: 300, gain: 0.04, gainEnd: 0.0, offset: 0.3, duration: 0.5 },
    ],
    noises: [],
  },
  'chicken-cluck': {
    caption: '[Chicken clucking]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 400, frequencyEnd: 300, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.06 },
      { type: 'sine', frequency: 380, frequencyEnd: 280, gain: 0.05, gainEnd: 0.0, offset: 0.1, duration: 0.06 },
      { type: 'sine', frequency: 420, frequencyEnd: 320, gain: 0.05, gainEnd: 0.0, offset: 0.18, duration: 0.06 },
    ],
    noises: [],
  },
  'cow-moo': {
    caption: '[Cow mooing]',
    duration: 1.5,
    oscillators: [
      { type: 'sawtooth', frequency: 120, frequencyEnd: 100, gain: 0.04, gainEnd: 0.03, offset: 0, duration: 0.8 },
      { type: 'sawtooth', frequency: 100, frequencyEnd: 80, gain: 0.03, gainEnd: 0.0, offset: 0.8, duration: 0.7 },
    ],
    noises: [],
  },
  'cat-purr': {
    caption: '[Cat purring]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: 26, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 1.5 },
      { type: 'sine', frequency: 52, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 1.5 },
    ],
    noises: [],
  },
  'dog-bark': {
    caption: '[Dog barking]',
    duration: 0.3,
    oscillators: [
      { type: 'square', frequency: 300, frequencyEnd: 200, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'square', frequency: 280, frequencyEnd: 180, gain: 0.06, gainEnd: 0.0, offset: 0.15, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.05, filterFreq: 3000 },
    ],
  },
  'snake-hiss': {
    caption: '[Snake hissing]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.03, gainEnd: 0.05, offset: 0, duration: 0.3, filterFreq: 8000, highpassFreq: 4000 },
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0.3, duration: 0.5, filterFreq: 7000, highpassFreq: 3500 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Weather variation sounds
// ---------------------------------------------------------------------------

const weatherSounds: Record<string, SFXRecipe> = {
  'hail-patter': {
    caption: '[Hail pattering]',
    duration: 2.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.08, offset: 0, duration: 2.0, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },
  'snow-crunch': {
    caption: '[Snow crunching]',
    duration: 0.15,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 4000, highpassFreq: 1000 },
    ],
  },
  'ice-crack': {
    caption: '[Ice cracking]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: 1500, frequencyEnd: 500, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 8000, highpassFreq: 2000 },
    ],
  },
  'fog-horn': {
    caption: '[Fog horn]',
    duration: 2.0,
    oscillators: [
      { type: 'sawtooth', frequency: 80, gain: 0.0, gainEnd: 0.08, offset: 0, duration: 0.5 },
      { type: 'sawtooth', frequency: 80, gain: 0.08, gainEnd: 0.08, offset: 0.5, duration: 1.0 },
      { type: 'sawtooth', frequency: 80, gain: 0.08, gainEnd: 0.0, offset: 1.5, duration: 0.5 },
    ],
    noises: [],
  },
  'lightning-flash': {
    caption: '[Lightning flash]',
    duration: 0.2,
    oscillators: [
      { type: 'sawtooth', frequency: 100, frequencyEnd: 2000, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [
      { color: 'white', gain: 0.2, gainEnd: 0.0, offset: 0, duration: 0.08, filterFreq: 10000 },
    ],
  },
  'wind-chimes': {
    caption: '[Wind chimes]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: 1200, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.4 },
      { type: 'sine', frequency: 1500, gain: 0.05, gainEnd: 0.0, offset: 0.2, duration: 0.35 },
      { type: 'sine', frequency: 1800, gain: 0.04, gainEnd: 0.0, offset: 0.5, duration: 0.3 },
      { type: 'sine', frequency: 1400, gain: 0.05, gainEnd: 0.0, offset: 0.8, duration: 0.35 },
      { type: 'sine', frequency: 1600, gain: 0.04, gainEnd: 0.0, offset: 1.1, duration: 0.3 },
    ],
    noises: [],
  },
  'ocean-wave': {
    caption: '[Ocean wave]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.02, gainEnd: 0.1, offset: 0, duration: 1.2, filterFreq: 2000, highpassFreq: 80 },
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0.8, duration: 0.5, filterFreq: 5000, highpassFreq: 500 },
      { color: 'pink', gain: 0.1, gainEnd: 0.02, offset: 1.0, duration: 2.0, filterFreq: 1500, highpassFreq: 60 },
    ],
  },
  'waterfall-roar': {
    caption: '[Waterfall roaring]',
    duration: 3.0,
    oscillators: [],
    noises: [
      { color: 'pink', gain: 0.1, gainEnd: 0.1, offset: 0, duration: 3.0, filterFreq: 3000, highpassFreq: 150 },
      { color: 'white', gain: 0.05, gainEnd: 0.05, offset: 0, duration: 3.0, filterFreq: 6000, highpassFreq: 500 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Material interaction sounds
// ---------------------------------------------------------------------------

const materialSounds: Record<string, SFXRecipe> = {
  'cloth-tear': {
    caption: '[Cloth tearing]',
    duration: 0.3,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.2, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },
  'cloth-rustle': {
    caption: '[Cloth rustling]',
    duration: 0.4,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.3, filterFreq: 5000, highpassFreq: 1500 },
    ],
  },
  'chain-clink': {
    caption: '[Chain clinking]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: 3000, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.08 },
      { type: 'sine', frequency: 2500, gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.08 },
      { type: 'sine', frequency: 3200, gain: 0.04, gainEnd: 0.0, offset: 0.2, duration: 0.08 },
    ],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 8000, highpassFreq: 3000 },
    ],
  },
  'paper-crumple': {
    caption: '[Paper crumpling]',
    duration: 0.4,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.02, offset: 0, duration: 0.3, filterFreq: 7000, highpassFreq: 2500 },
    ],
  },
  'ceramic-clink': {
    caption: '[Ceramic clinking]',
    duration: 0.25,
    oscillators: [
      { type: 'sine', frequency: 1800, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 2700, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [],
  },
  'leather-creak': {
    caption: '[Leather creaking]',
    duration: 0.4,
    oscillators: [
      { type: 'sawtooth', frequency: 50, frequencyEnd: 80, gain: 0.02, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [
      { color: 'brown', gain: 0.03, gainEnd: 0.01, offset: 0, duration: 0.3, filterFreq: 500 },
    ],
  },
  'metal-scrape': {
    caption: '[Metal scraping]',
    duration: 0.5,
    oscillators: [
      { type: 'sawtooth', frequency: 500, frequencyEnd: 800, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.02, offset: 0, duration: 0.4, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },
  'glass-clink': {
    caption: '[Glass clinking]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: 2500, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: 3800, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.15 },
    ],
    noises: [],
  },
  'wood-creak': {
    caption: '[Wood creaking]',
    duration: 0.6,
    oscillators: [
      { type: 'sawtooth', frequency: 40, frequencyEnd: 60, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.5 },
    ],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.01, offset: 0, duration: 0.5, filterFreq: 500 },
    ],
  },
  'stone-grind': {
    caption: '[Stone grinding]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.08, gainEnd: 0.04, offset: 0, duration: 0.7, filterFreq: 1500, highpassFreq: 200 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Interaction / collection sounds
// ---------------------------------------------------------------------------

const interactionSounds: Record<string, SFXRecipe> = {
  'item-pickup': {
    caption: '[Item collected]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: E5, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: G5, gain: 0.1, gainEnd: 0.0, offset: 0.05, duration: 0.12 },
    ],
    noises: [],
  },
  'item-drop': {
    caption: '[Item dropped]',
    duration: 0.15,
    oscillators: [
      { type: 'sine', frequency: G4, frequencyEnd: E4, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [],
  },
  'chest-open': {
    caption: '[Chest opening]',
    duration: 0.5,
    oscillators: [
      { type: 'triangle', frequency: 200, frequencyEnd: 300, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.2 },
    ],
    noises: [
      { color: 'brown', gain: 0.06, gainEnd: 0.02, offset: 0, duration: 0.3, filterFreq: 700 },
    ],
  },
  'treasure-reveal': {
    caption: '[Treasure revealed]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: C5, gain: 0.12, gainEnd: 0.06, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: E5, gain: 0.12, gainEnd: 0.06, offset: 0.15, duration: 0.2 },
      { type: 'sine', frequency: G5, gain: 0.15, gainEnd: 0.0, offset: 0.3, duration: 0.5 },
    ],
    noises: [],
  },
  'scroll-unroll': {
    caption: '[Scroll unrolling]',
    duration: 0.5,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.04, gainEnd: 0.06, offset: 0, duration: 0.25, filterFreq: 4000, highpassFreq: 1500 },
      { color: 'white', gain: 0.06, gainEnd: 0.02, offset: 0.25, duration: 0.25, filterFreq: 3500, highpassFreq: 1200 },
    ],
  },
  'map-unfold': {
    caption: '[Map unfolding]',
    duration: 0.4,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.3, filterFreq: 4500, highpassFreq: 1800 },
    ],
  },
  'switch-toggle': {
    caption: '[Switch toggling]',
    duration: 0.1,
    oscillators: [
      { type: 'square', frequency: 300, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.04 },
    ],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 4000, highpassFreq: 1000 },
    ],
  },
  'button-press': {
    caption: '[Button pressing]',
    duration: 0.1,
    oscillators: [
      { type: 'sine', frequency: 600, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.05 },
    ],
    noises: [
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 3000, highpassFreq: 800 },
    ],
  },
  'key-insert': {
    caption: '[Key inserting]',
    duration: 0.3,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.1 },
    ],
    noises: [
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.05, filterFreq: 5000, highpassFreq: 1500 },
      { color: 'white', gain: 0.04, gainEnd: 0.0, offset: 0.15, duration: 0.04, filterFreq: 4000, highpassFreq: 1200 },
    ],
  },
  'lock-unlock': {
    caption: '[Lock unlocking]',
    duration: 0.2,
    oscillators: [
      { type: 'square', frequency: 200, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.04 },
      { type: 'sine', frequency: 600, gain: 0.05, gainEnd: 0.0, offset: 0.05, duration: 0.08 },
    ],
    noises: [],
  },
  'coin-collect': {
    caption: '[Coin collected]',
    duration: 0.25,
    oscillators: [
      { type: 'sine', frequency: 3500, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 5000, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.08 },
    ],
    noises: [],
  },
  'gem-collect': {
    caption: '[Gem collected]',
    duration: 0.4,
    oscillators: [
      { type: 'sine', frequency: 1500, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: 2200, gain: 0.06, gainEnd: 0.0, offset: 0.05, duration: 0.2 },
      { type: 'sine', frequency: 3000, gain: 0.04, gainEnd: 0.0, offset: 0.1, duration: 0.2 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Musical / instrument sounds
// ---------------------------------------------------------------------------

const instrumentSounds: Record<string, SFXRecipe> = {
  'bell-toll': {
    caption: '[Bell tolling]',
    duration: 2.5,
    oscillators: [
      { type: 'sine', frequency: 440, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 2.0 },
      { type: 'sine', frequency: 880, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 1.5 },
      { type: 'sine', frequency: 1320, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 1.0 },
    ],
    noises: [],
  },
  'chime-set': {
    caption: '[Chime set]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: C5, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.4 },
      { type: 'sine', frequency: E5, gain: 0.07, gainEnd: 0.0, offset: 0.15, duration: 0.35 },
      { type: 'sine', frequency: G5, gain: 0.06, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
      { type: 'sine', frequency: C6, gain: 0.05, gainEnd: 0.0, offset: 0.45, duration: 0.4 },
    ],
    noises: [],
  },
  'drum-tap': {
    caption: '[Drum tap]',
    duration: 0.2,
    oscillators: [
      { type: 'sine', frequency: 150, frequencyEnd: 60, gain: 0.15, gainEnd: 0.0, offset: 0, duration: 0.12 },
    ],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.03, filterFreq: 4000 },
    ],
  },
  'xylophone-note': {
    caption: '[Xylophone note]',
    duration: 0.6,
    oscillators: [
      { type: 'sine', frequency: 523.25, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.4 },
      { type: 'sine', frequency: 1046.5, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [],
  },
  'harp-pluck': {
    caption: '[Harp pluck]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 440, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 880, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 0.5 },
      { type: 'sine', frequency: 1320, gain: 0.025, gainEnd: 0.0, offset: 0, duration: 0.3 },
    ],
    noises: [],
  },
  'flute-note': {
    caption: '[Flute note]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 523.25, gain: 0.0, gainEnd: 0.1, offset: 0, duration: 0.15 },
      { type: 'sine', frequency: 523.25, gain: 0.1, gainEnd: 0.1, offset: 0.15, duration: 0.4 },
      { type: 'sine', frequency: 523.25, gain: 0.1, gainEnd: 0.0, offset: 0.55, duration: 0.25 },
    ],
    noises: [
      { color: 'white', gain: 0.01, gainEnd: 0.01, offset: 0, duration: 0.8, filterFreq: 2000, highpassFreq: 400 },
    ],
  },
  'gong-strike': {
    caption: '[Gong strike]',
    duration: 3.0,
    oscillators: [
      { type: 'sine', frequency: 100, gain: 0.12, gainEnd: 0.0, offset: 0, duration: 2.5 },
      { type: 'sine', frequency: 200, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 2.0 },
      { type: 'sine', frequency: 300, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 1.5 },
    ],
    noises: [
      { color: 'white', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.1, filterFreq: 5000 },
    ],
  },
  'music-box': {
    caption: '[Music box]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: E5, gain: 0.08, gainEnd: 0.0, offset: 0, duration: 0.2 },
      { type: 'sine', frequency: G5, gain: 0.07, gainEnd: 0.0, offset: 0.2, duration: 0.2 },
      { type: 'sine', frequency: C6, gain: 0.08, gainEnd: 0.0, offset: 0.4, duration: 0.2 },
      { type: 'sine', frequency: B5, gain: 0.06, gainEnd: 0.0, offset: 0.6, duration: 0.2 },
      { type: 'sine', frequency: A5, gain: 0.07, gainEnd: 0.0, offset: 0.8, duration: 0.2 },
    ],
    noises: [],
  },
};

// ---------------------------------------------------------------------------
// Ambient / environmental extra sounds
// ---------------------------------------------------------------------------

const ambientExtraSounds: Record<string, SFXRecipe> = {
  'cave-drip-echo': {
    caption: '[Cave drip with echo]',
    duration: 0.8,
    oscillators: [
      { type: 'sine', frequency: 1800, frequencyEnd: 800, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.05 },
      { type: 'sine', frequency: 1500, frequencyEnd: 700, gain: 0.03, gainEnd: 0.0, offset: 0.2, duration: 0.04 },
      { type: 'sine', frequency: 1300, frequencyEnd: 600, gain: 0.015, gainEnd: 0.0, offset: 0.4, duration: 0.03 },
    ],
    noises: [],
  },
  'underground-rumble': {
    caption: '[Underground rumble]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 30, frequencyEnd: 25, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 1.5 },
    ],
    noises: [
      { color: 'brown', gain: 0.08, gainEnd: 0.0, offset: 0, duration: 1.5, filterFreq: 200 },
    ],
  },
  'wind-through-ruins': {
    caption: '[Wind through ruins]',
    duration: 2.5,
    oscillators: [
      { type: 'sine', frequency: 250, frequencyEnd: 350, gain: 0.02, gainEnd: 0.0, offset: 0, duration: 2.0 },
    ],
    noises: [
      { color: 'pink', gain: 0.05, gainEnd: 0.03, offset: 0, duration: 2.5, filterFreq: 1500, highpassFreq: 150 },
    ],
  },
  'torch-crackle': {
    caption: '[Torch crackling]',
    duration: 1.5,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.04, filterFreq: 2000 },
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 0.1, duration: 0.03, filterFreq: 4000, highpassFreq: 800 },
      { color: 'brown', gain: 0.03, gainEnd: 0.0, offset: 0.3, duration: 0.04, filterFreq: 1800 },
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0.5, duration: 0.03, filterFreq: 3500, highpassFreq: 700 },
      { color: 'brown', gain: 0.04, gainEnd: 0.0, offset: 0.7, duration: 0.04, filterFreq: 2200 },
      { color: 'white', gain: 0.05, gainEnd: 0.0, offset: 0.9, duration: 0.03, filterFreq: 4200, highpassFreq: 900 },
      { color: 'brown', gain: 0.03, gainEnd: 0.0, offset: 1.1, duration: 0.04, filterFreq: 1600 },
      { color: 'white', gain: 0.06, gainEnd: 0.0, offset: 1.3, duration: 0.03, filterFreq: 3800, highpassFreq: 750 },
    ],
  },
  'campfire-warm': {
    caption: '[Warm campfire]',
    duration: 3.0,
    oscillators: [
      { type: 'sine', frequency: 100, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 3.0 },
    ],
    noises: [
      { color: 'brown', gain: 0.04, gainEnd: 0.04, offset: 0, duration: 3.0, filterFreq: 800 },
      { color: 'white', gain: 0.02, gainEnd: 0.02, offset: 0, duration: 3.0, filterFreq: 3000, highpassFreq: 800 },
    ],
  },
  'fountain-splash': {
    caption: '[Fountain splashing]',
    duration: 2.0,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.05, gainEnd: 0.05, offset: 0, duration: 2.0, filterFreq: 5000, highpassFreq: 500 },
      { color: 'pink', gain: 0.04, gainEnd: 0.04, offset: 0, duration: 2.0, filterFreq: 3000, highpassFreq: 200 },
    ],
  },
  'clock-tick': {
    caption: '[Clock ticking]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 1000, gain: 0.06, gainEnd: 0.0, offset: 0, duration: 0.02 },
      { type: 'sine', frequency: 800, gain: 0.05, gainEnd: 0.0, offset: 0.5, duration: 0.02 },
    ],
    noises: [],
  },
  'clock-chime': {
    caption: '[Clock chiming]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: G4, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 1.5 },
      { type: 'sine', frequency: G5, gain: 0.05, gainEnd: 0.0, offset: 0, duration: 1.0 },
    ],
    noises: [],
  },
  'candle-flicker': {
    caption: '[Candle flickering]',
    duration: 1.0,
    oscillators: [],
    noises: [
      { color: 'brown', gain: 0.01, gainEnd: 0.02, offset: 0, duration: 0.3, filterFreq: 500 },
      { color: 'brown', gain: 0.02, gainEnd: 0.01, offset: 0.3, duration: 0.3, filterFreq: 400 },
      { color: 'brown', gain: 0.01, gainEnd: 0.015, offset: 0.6, duration: 0.4, filterFreq: 450 },
    ],
  },
  'steam-vent': {
    caption: '[Steam venting]',
    duration: 0.8,
    oscillators: [],
    noises: [
      { color: 'white', gain: 0.12, gainEnd: 0.0, offset: 0, duration: 0.6, filterFreq: 6000, highpassFreq: 2000 },
    ],
  },
  'magic-shimmer': {
    caption: '[Magic shimmer]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 800, gain: 0.04, gainEnd: 0.0, offset: 0, duration: 0.3 },
      { type: 'sine', frequency: 1200, gain: 0.03, gainEnd: 0.0, offset: 0.1, duration: 0.3 },
      { type: 'sine', frequency: 1600, gain: 0.03, gainEnd: 0.0, offset: 0.2, duration: 0.3 },
      { type: 'sine', frequency: 2000, gain: 0.02, gainEnd: 0.0, offset: 0.3, duration: 0.3 },
      { type: 'sine', frequency: 2400, gain: 0.02, gainEnd: 0.0, offset: 0.4, duration: 0.4 },
    ],
    noises: [],
  },
  'portal-hum': {
    caption: '[Portal humming]',
    duration: 2.0,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 200, gain: 0.04, gainEnd: 0.04, offset: 0, duration: 1.0 },
      { type: 'sine', frequency: 200, frequencyEnd: 100, gain: 0.04, gainEnd: 0.04, offset: 1.0, duration: 1.0 },
      { type: 'sine', frequency: 150, gain: 0.02, gainEnd: 0.02, offset: 0, duration: 2.0, detune: 5 },
    ],
    noises: [],
  },
  'starfield-twinkle': {
    caption: '[Starfield twinkling]',
    duration: 1.5,
    oscillators: [
      { type: 'sine', frequency: 2500, gain: 0.03, gainEnd: 0.0, offset: 0, duration: 0.1 },
      { type: 'sine', frequency: 3000, gain: 0.025, gainEnd: 0.0, offset: 0.2, duration: 0.08 },
      { type: 'sine', frequency: 2200, gain: 0.03, gainEnd: 0.0, offset: 0.45, duration: 0.1 },
      { type: 'sine', frequency: 3500, gain: 0.02, gainEnd: 0.0, offset: 0.7, duration: 0.08 },
      { type: 'sine', frequency: 2800, gain: 0.025, gainEnd: 0.0, offset: 0.95, duration: 0.1 },
      { type: 'sine', frequency: 3200, gain: 0.02, gainEnd: 0.0, offset: 1.2, duration: 0.08 },
    ],
    noises: [],
  },
  'energy-charge': {
    caption: '[Energy charging]',
    duration: 1.0,
    oscillators: [
      { type: 'sine', frequency: 100, frequencyEnd: 800, gain: 0.0, gainEnd: 0.1, offset: 0, duration: 0.8 },
      { type: 'sine', frequency: 800, gain: 0.1, gainEnd: 0.0, offset: 0.8, duration: 0.2 },
    ],
    noises: [
      { color: 'white', gain: 0.0, gainEnd: 0.06, offset: 0, duration: 0.8, filterFreq: 4000, highpassFreq: 1000 },
    ],
  },
  'energy-release': {
    caption: '[Energy release]',
    duration: 0.5,
    oscillators: [
      { type: 'sine', frequency: 800, frequencyEnd: 100, gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.4 },
    ],
    noises: [
      { color: 'white', gain: 0.1, gainEnd: 0.0, offset: 0, duration: 0.3, filterFreq: 6000 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Merge all sound recipes into a single registry
// ---------------------------------------------------------------------------

export const SFX_REGISTRY: Readonly<Record<string, SFXRecipe>> = Object.freeze({
  ...uiSounds,
  ...footstepSounds,
  ...waterSounds,
  ...fireSounds,
  ...windSounds,
  ...crystalSounds,
  ...mechanicalSounds,
  ...craftingSounds,
  ...doorSounds,
  ...bookSounds,
  ...natureSounds,
  ...scienceSounds,
  ...feedbackSounds,
  ...companionSounds,
  ...biomeSpecificSounds,
  ...buildingSounds,
  ...creatureSounds,
  ...weatherSounds,
  ...materialSounds,
  ...interactionSounds,
  ...instrumentSounds,
  ...ambientExtraSounds,
});

/** All valid SFX type keys */
export type SFXType = keyof typeof SFX_REGISTRY;

/** Total number of defined SFX */
export const SFX_COUNT = Object.keys(SFX_REGISTRY).length;

/** Get caption text for a given SFX type */
export function getSFXCaption(type: string): string {
  const recipe = SFX_REGISTRY[type];
  return recipe?.caption ?? `[${type}]`;
}

/** Check whether a SFX type is registered */
export function hasSFX(type: string): boolean {
  return type in SFX_REGISTRY;
}

/** Get all registered SFX type keys */
export function getAllSFXTypes(): string[] {
  return Object.keys(SFX_REGISTRY);
}
