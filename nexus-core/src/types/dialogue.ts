// Dialogue system types — companion dialogue generation

import type { PersonalityStage } from './companion.js';

// --- Dialogue triggers ---

export type DialogueTrigger =
  | 'greet_first_time' | 'greet_returning' | 'greet_after_absence'
  | 'quest_intro' | 'quest_hint' | 'quest_success' | 'quest_struggle'
  | 'discovery' | 'achievement' | 'biome_enter' | 'biome_leave'
  | 'teach_request' | 'teach_explain' | 'teach_encourage'
  | 'idle_observation' | 'idle_question' | 'idle_suggestion'
  | 'focus_mode_start' | 'focus_mode_complete'
  | 'calibration_intro' | 'calibration_transition' | 'calibration_complete'
  | 'redirect_suggestion' | 'struggle_observe' | 'struggle_alternative';

export type DialogueEmotion =
  | 'excited' | 'curious' | 'thoughtful' | 'encouraging'
  | 'proud' | 'playful';

// --- Conditions ---

export interface DialogueCondition {
  type: 'biome' | 'skill_level' | 'trust_level' | 'time_of_day' | 'session_count';
  value: string | number;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
}

// --- Dialogue variant ---

export interface DialogueVariant {
  text: string;
  conditions?: DialogueCondition[];
}

// --- Template ---

export interface DialogueTemplate {
  id: string;
  trigger: DialogueTrigger;
  personalityStage: PersonalityStage[];
  variants: DialogueVariant[];
  emotion: DialogueEmotion;
  accessibility: {
    spokenText: string;
    screenReaderText: string;
  };
}

// --- Branching responses ---

export interface DialogueResponse {
  id: string;
  text: string;
  nextTriggerId?: string;
}

// --- Context for generation ---

export interface DialogueContext {
  profileId: string;
  personalityStage: PersonalityStage;
  currentBiome: string;
  currentQuest?: string;
  recentSkills: string[];
  trustLevel: number;
  playerName: string;
  companionName: string;
  sessionCount: number;
}

// --- Generated output ---

export interface GeneratedDialogue {
  text: string;
  spokenText: string;
  screenReaderText: string;
  emotion: DialogueEmotion;
  responses?: DialogueResponse[];
  templateId: string;
}
