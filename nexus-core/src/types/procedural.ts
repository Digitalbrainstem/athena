// Procedural Quest Generation types
// Template-based quest generation with anti-repetition guarantees.

import type { MasteryTier } from './components.js';

/** All quest mechanics available in the procedural system */
export type QuestMechanic =
  | 'build' | 'craft' | 'diagnose' | 'explore' | 'teach' | 'experiment'
  | 'negotiate' | 'navigate' | 'decode' | 'collect' | 'protect' | 'design'
  | 'measure' | 'compare' | 'sort' | 'sequence' | 'balance' | 'transform'
  | 'observe' | 'predict' | 'repair' | 'optimize' | 'collaborate';

/** All valid quest mechanics as a readonly array (for validation) */
export const QUEST_MECHANICS: readonly QuestMechanic[] = [
  'build', 'craft', 'diagnose', 'explore', 'teach', 'experiment',
  'negotiate', 'navigate', 'decode', 'collect', 'protect', 'design',
  'measure', 'compare', 'sort', 'sequence', 'balance', 'transform',
  'observe', 'predict', 'repair', 'optimize', 'collaborate',
] as const;

/** What role a skill plays in a quest */
export type SkillRole = 'primary' | 'secondary' | 'review';

/** A parameterized skill slot in a quest template */
export interface SkillSlot {
  role: SkillRole;
  category: string;
  minLevel: number;
  teaches: boolean;
}

/** Structure of steps within a template, with variable placeholders */
export interface TemplateStep {
  instruction: string;
  spokenInstruction: string;
  screenReaderText: string;
  objectiveType: string;
  hints: string[];
  successResponse: string;
  failureResponse: string;
}

/** The structural definition of a quest template */
export interface TemplateStructure {
  steps: TemplateStep[];
  companionIntro: string;
  companionOutro: string;
  estimatedMinutes: number;
}

/** A reusable quest blueprint that gets filled with specific parameters */
export interface QuestTemplate {
  id: string;
  name: string;
  mechanic: QuestMechanic;
  tier: MasteryTier[];
  biomes: string[];
  skillSlots: SkillSlot[];
  structure: TemplateStructure;
  antiRepetitionCategory: string;
}

/** Criteria for generating a quest */
export interface GenerationCriteria {
  targetSkills?: string[];
  biome?: string;
  mechanic?: QuestMechanic;
  difficulty?: number;
  includeReview?: boolean;
  avoidSkills?: string[];
}

/** A quest generated from a template with all parameters filled */
export interface GeneratedQuest {
  id: string;
  templateId: string;
  title: string;
  biome: string;
  masteryTier: MasteryTier;
  mechanic: QuestMechanic;
  skillsRequired: string[];
  skillsTaught: string[];
  content: GeneratedQuestContent;
}

/** Full content of a generated quest */
export interface GeneratedQuestContent {
  description: string;
  steps: GeneratedQuestStep[];
  companionIntro: string;
  companionOutro: string;
  estimatedMinutes: number;
}

/** A step in a generated quest */
export interface GeneratedQuestStep {
  index: number;
  instruction: string;
  spokenInstruction: string;
  screenReaderText: string;
  companionRepeat: string;
  objectiveType: string;
  hints: string[];
  successResponse: string;
  failureResponse: string;
}

/** A record of a mechanic+biome combo used for anti-repetition */
export interface MechanicUsageRecord {
  mechanic: QuestMechanic;
  biome: string;
  skills: string[];
  stepCount: number;
  timestamp: string;
}
