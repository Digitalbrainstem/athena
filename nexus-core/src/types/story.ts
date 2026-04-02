// Story & Narrative types — Codex, Fragments, Mysteries
// The Founders' story unfolds through discovery, not exposition.

import type { MasteryTier } from './components.js';

/** The five story threads that span the entire game */
export type StoryThread = 'star_trail' | 'journal' | 'machines' | 'equations' | 'truth';

/** A single piece of the Founders' story */
export interface Fragment {
  id: string;
  tier: MasteryTier;
  biome: string;
  storyThread: StoryThread;
  title: string;
  content: string;
  /** When this fragment was discovered (ISO datetime), undefined if not yet found */
  discoveredAt?: string;
  // Accessibility — every fragment must have all three
  spokenContent: string;
  screenReaderText: string;
  /** JSON-encoded condition that triggers discovery */
  discoveryCondition?: string;
}

/** A cross-biome mystery that requires fragments + skills from multiple areas */
export interface Mystery {
  id: string;
  title: string;
  requiredFragments: string[];
  requiredSkills: string[];
  biomes: string[];
  solved: boolean;
  description: string;
}

/** The full state of a player's Codex */
export interface CodexState {
  totalFragments: number;
  discoveredCount: number;
  threadProgress: Record<string, { found: number; total: number }>;
  mysteries: MysteryProgress[];
  hints: string[];
}

/** Progress toward solving a specific mystery */
export interface MysteryProgress {
  mysteryId: string;
  title: string;
  description: string;
  requiredFragments: string[];
  foundFragments: string[];
  requiredSkills: string[];
  metSkills: string[];
  biomes: string[];
  solvable: boolean;
  solved: boolean;
}

/** Result of discovering a fragment */
export interface CodexUpdate {
  fragment: Fragment;
  newDiscovery: boolean;
  threadProgress: { found: number; total: number };
  mysteriesAdvanced: string[];
  mysteriesSolved: string[];
}
