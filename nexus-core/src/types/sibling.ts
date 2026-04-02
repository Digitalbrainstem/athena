// Sibling play mode types — shared household world

import type { MasteryTier } from './components.js';
import type { BuiltStructure } from './world.js';
import type { PersonalityStage } from './companion.js';

// --- Player views ---

export interface PlayerView {
  profileId: string;
  profileName: string;
  masteryTier: MasteryTier;
  companionStage: PersonalityStage;
  activeBiome: string;
  challengeDifficulty: ChallengeDifficulty;
}

export type ChallengeDifficulty = 'foundation' | 'discovery' | 'builder' | 'innovator' | 'creator';

// --- Discoveries ---

export interface Discovery {
  id: string;
  type: DiscoveryType;
  description: string;
  biome: string;
  foundByProfileId: string;
  foundByName: string;
  timestamp: string;
}

export type DiscoveryType = 'biome' | 'fragment' | 'creature' | 'recipe' | 'element' | 'landmark';

// --- Shared structures ---

export interface SharedStructure extends BuiltStructure {
  builtByProfileId: string;
  builtByName: string;
  createdAt: string;
}

// --- Companion messages ---

export interface SiblingCompanionMessage {
  targetProfileId: string;
  messageType: SiblingMessageType;
  text: string;
  spokenText: string;
  screenReaderText: string;
}

export type SiblingMessageType =
  | 'discovery_shared'
  | 'structure_built'
  | 'help_offered'
  | 'collaboration_started'
  | 'teaching_moment';

// --- Shared world ---

export interface SharedWorld {
  worldSeed: string;
  sharedStructures: SharedStructure[];
  sharedDiscoveries: Discovery[];
  playerViews: Map<string, PlayerView>;
  createdAt: string;
  lastActivity: string;
}

// --- Sibling profile summary (no PII beyond first name) ---

export interface SiblingProfile {
  profileId: string;
  name: string;
  masteryTier: MasteryTier;
  companionStage: PersonalityStage;
  isActive: boolean;
}

// --- Teaching interactions ---

export interface TeachingMoment {
  id: string;
  olderProfileId: string;
  youngerProfileId: string;
  skill: string;
  biome: string;
  olderTask: string;
  youngerTask: string;
  companionPromptOlder: SiblingCompanionMessage;
  companionPromptYounger: SiblingCompanionMessage;
  createdAt: string;
}

// --- Collaboration task ---

export interface CollaborationTask {
  id: string;
  biome: string;
  description: string;
  participants: CollaborationParticipant[];
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

export interface CollaborationParticipant {
  profileId: string;
  name: string;
  role: string;
  taskDescription: string;
  difficulty: ChallengeDifficulty;
}
