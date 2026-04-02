// Cross-biome mysteries — require fragments + skills from multiple areas
// Each mystery spans 2-4 biomes and requires interdisciplinary knowledge.
// Knowledge-gated: you need specific skills to UNDERSTAND the connection.

import type { Mystery } from '../types/story.js';

export const MYSTERIES: readonly Mystery[] = [
  {
    id: 'mystery-star-map-cipher',
    title: 'The Star Map Cipher',
    requiredFragments: [
      'equation-observatory-03',  // First Light Coordinates (D.T. constellation)
      'star-ruins-02',            // The Mosaic Star (ancient ruins pattern)
      'journal-observatory-02',   // Star Charts journal page
    ],
    requiredSkills: ['math.geometry', 'math.trigonometry'],
    biomes: ['observatory', 'ancient-ruins'],
    solved: false,
    description: 'The First Light constellation traces letters when charted. The mosaic in the Ancient Ruins contains the same pattern. Together they reveal a message the Founders embedded in the sky itself.',
  },
  {
    id: 'mystery-living-machine',
    title: 'The Living Machine',
    requiredFragments: [
      'machine-forest-01',        // Photosynthesis Lamp
      'machine-alchemist-01',     // Molecular Assembler
      'journal-forest-01',        // The Living Forest journal
    ],
    requiredSkills: ['science.biology.basics', 'science.chemistry'],
    biomes: ['living-forest', 'alchemist-lab'],
    solved: false,
    description: 'The Photosynthesis Lamp mimics a leaf. The Molecular Assembler arranges atoms. Together they reveal the Founders were trying to build a living machine — one that grows, repairs, and evolves like a real organism.',
  },
  {
    id: 'mystery-time-equation',
    title: 'The Time Equation',
    requiredFragments: [
      'equation-time-rift-01',    // Temporal Mechanics
      'equation-observatory-01',  // Spacetime Curvature
      'journal-library-03',       // Stories (memory persists through narrative)
    ],
    requiredSkills: ['science.physics', 'math.calculus'],
    biomes: ['time-rift', 'observatory', 'library-echoes'],
    solved: false,
    description: 'Temporal mechanics describes time as navigable. Spacetime curvature provides the mathematics. The journal page about stories adds the key: the Founders navigated time through narrative, not physics.',
  },
  {
    id: 'mystery-origin-date',
    title: 'The Origin Date',
    requiredFragments: [
      'equation-caverns-01',      // Origin Crystal (04.01.2026)
      'equation-alchemist-01',    // D-T Fusion (D.T. Unit 01)
      'equation-observatory-03',  // First Light Coordinates (D.T.)
    ],
    requiredSkills: ['science.geology', 'science.chemistry', 'math.geometry'],
    biomes: ['crystal-caverns', 'alchemist-lab', 'observatory'],
    solved: false,
    description: 'Three fragments encode the same initials: D.T. A crystal encodes a date. A reactor bears a designation. A constellation traces letters. One person. One date. One beginning.',
  },
  {
    id: 'mystery-healing-web',
    title: 'The Healing Web',
    requiredFragments: [
      'machine-healers-01',       // Vital Signs Reader
      'machine-forest-02',        // Ecosystem Monitor
      'journal-healers-01',       // The Healer's Oath
    ],
    requiredSkills: ['science.biology.anatomy', 'science.biology.ecology'],
    biomes: ['healers-sanctuary', 'living-forest'],
    solved: false,
    description: 'The body is an ecosystem. The forest is a body. The Vital Signs Reader and the Ecosystem Monitor use the same underlying mathematics — because health operates at every scale.',
  },
  {
    id: 'mystery-sound-of-math',
    title: 'The Sound of Mathematics',
    requiredFragments: [
      'journal-music-01',         // Sound and Number
      'equation-arena-01',        // Nash Equilibrium
      'truth-purpose-02',         // The Song of Everything
    ],
    requiredSkills: ['math.algebra'],
    biomes: ['music-hall', 'arena'],
    solved: false,
    description: 'Music IS math. Game theory IS harmony. When Nash Equilibrium meets musical ratios, a deeper pattern emerges: cooperation and melody follow the same mathematical rules.',
  },
  {
    id: 'mystery-builders-intent',
    title: 'The Builder\'s Intent',
    requiredFragments: [
      'machine-workshop-01',      // Perpetual Engine (impossibility as lesson)
      'journal-workshop-01',      // Why We Built the Workshop
      'machine-workshop-02',      // Balance Scale (weigh ideas)
    ],
    requiredSkills: ['engineering.basics', 'science.physics'],
    biomes: ['workshop'],
    solved: false,
    description: 'The Perpetual Engine teaches impossibility. The Balance Scale weighs evidence. The journal explains why: the Workshop was built not to make engineers, but to make thinkers who can build.',
  },
  {
    id: 'mystery-language-of-nature',
    title: 'The Language of Nature',
    requiredFragments: [
      'machine-library-01',       // Translation Engine
      'journal-forest-02',        // Roots and Branches
      'equation-library-01',      // Knowledge Equation
    ],
    requiredSkills: ['language.reading', 'science.biology.basics'],
    biomes: ['library-echoes', 'living-forest'],
    solved: false,
    description: 'The Translation Engine translates meaning, not words. Trees communicate through roots. Knowledge spreads like gravity. Nature has its own language — and the Founders learned to speak it.',
  },
  {
    id: 'mystery-storm-harvest',
    title: 'The Storm Harvest',
    requiredFragments: [
      'machine-storm-01',         // Lightning Harvester
      'equation-storm-01',        // Perfect Prediction
      'journal-storm-01',         // Taming Thunder
    ],
    requiredSkills: ['science.physics', 'math.algebra'],
    biomes: ['storm-tower'],
    solved: false,
    description: 'Capture lightning. Predict weather. Respect the storm. The Founders mastered energy not by conquering nature but by understanding and working within its patterns.',
  },
  {
    id: 'mystery-code-of-creation',
    title: 'The Code of Creation',
    requiredFragments: [
      'machine-code-forge-01',    // Logic Loom
      'equation-code-forge-01',   // Halting Problem
      'truth-core-10',            // Binary Origins
    ],
    requiredSkills: ['engineering.basics'],
    biomes: ['code-forge'],
    solved: false,
    description: 'From looms to logic, from binary to Turing machines. The Code Forge reveals that programming is humanity\'s oldest craft — pattern-making — expressed in a new medium.',
  },
  {
    id: 'mystery-navigation-truth',
    title: 'The Navigator\'s Truth',
    requiredFragments: [
      'equation-explorers-01',    // Navigation Paradox
      'equation-observatory-02',  // Wormhole Proof
      'journal-caverns-03',       // The Echo
    ],
    requiredSkills: ['math.trigonometry', 'math.calculus'],
    biomes: ['explorers-map', 'observatory', 'crystal-caverns'],
    solved: false,
    description: 'The shortest path on a curved surface is never straight. Wormholes bend space. Questions return changed. Navigation through knowledge, like through space, is always curved.',
  },
  {
    id: 'mystery-founders-identity',
    title: 'The Founders\' Identity',
    requiredFragments: [
      'truth-core-01',            // Human Hands
      'truth-core-02',            // Our Languages
      'truth-core-03',            // Earth Chemistry
      'truth-core-04',            // Our Stars
      'truth-core-05',            // Our History
    ],
    requiredSkills: ['science.chemistry', 'science.physics', 'language.reading'],
    biomes: ['workshop', 'library-echoes', 'alchemist-lab', 'observatory', 'ancient-ruins'],
    solved: false,
    description: 'Human tools. Human languages. Human chemistry. Human stars. Human history. The evidence is overwhelming. The Founders are not alien. They are not ancient. They are us — from the future.',
  },
];

/** Get a mystery by ID */
export function getMystery(id: string): Mystery | undefined {
  return MYSTERIES.find(m => m.id === id);
}

/** Get all mysteries that involve a specific biome */
export function mysteriesForBiome(biome: string): readonly Mystery[] {
  return MYSTERIES.filter(m => m.biomes.includes(biome));
}

/** Get all mysteries that require a specific fragment */
export function mysteriesRequiringFragment(fragmentId: string): readonly Mystery[] {
  return MYSTERIES.filter(m => m.requiredFragments.includes(fragmentId));
}
