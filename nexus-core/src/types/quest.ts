// Quest types

export type QuestStatus = 'available' | 'active' | 'completed' | 'abandoned';

export interface Quest {
  id: string;
  title: string;
  biome: string;
  masteryTier: string;
  skillsRequired: string[];
  skillsTaught: string[];
  content: QuestContent;
  generatedBy: string;
  validated: boolean;
  createdAt: string;
}

export interface QuestContent {
  description: string;
  steps: QuestStep[];
  rewards?: QuestReward[];
  companionIntro?: string;
  companionOutro?: string;
  estimatedMinutes?: number;
}

export interface QuestStep {
  index: number;
  instruction: string;
  /** What the companion says aloud — defaults to instruction if not provided */
  spokenInstruction?: string;
  /** What a screen reader announces — defaults to instruction if not provided */
  screenReaderText?: string;
  /** Simplified restatement for "say that again?" — defaults to instruction if not provided */
  companionRepeat?: string;
  objectiveType: 'interact' | 'collect' | 'build' | 'craft' | 'navigate' | 'observe' | 'teach'
    | 'count' | 'match' | 'sort' | 'find' | 'mix' | 'measure' | 'pattern';
  targetId?: string;
  targetValue?: unknown;
  requiredCount?: number;
  hints: string[];
  successResponse: string;
  /** Gentle, never punishing */
  failureResponse: string;
}

/**
 * Get the spoken instruction for a quest step.
 * Falls back to `instruction` if `spokenInstruction` is not set.
 */
export function getSpokenInstruction(step: QuestStep): string {
  return step.spokenInstruction ?? step.instruction;
}

/**
 * Get the screen reader text for a quest step.
 * Falls back to `instruction` if `screenReaderText` is not set.
 */
export function getScreenReaderText(step: QuestStep): string {
  return step.screenReaderText ?? step.instruction;
}

/**
 * Get the companion repeat text for a quest step.
 * Falls back to a simplified restatement or `instruction`.
 */
export function getCompanionRepeat(step: QuestStep): string {
  return step.companionRepeat ?? step.instruction;
}

export interface QuestReward {
  type: 'item' | 'biome_access' | 'recipe' | 'companion_trait';
  value: string;
  quantity?: number;
}

export interface QuestProgress {
  id: number;
  profileId: string;
  questId: string;
  status: QuestStatus;
  startedAt?: string;
  completedAt?: string;
  stepsCompleted: number;
}

export interface CreateQuestInput {
  id: string;
  title: string;
  biome: string;
  masteryTier: string;
  skillsRequired?: string[];
  skillsTaught?: string[];
  content: QuestContent;
  generatedBy?: string;
}
