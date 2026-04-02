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
  /** What the companion says aloud (audio) — auto-generated from instruction if omitted */
  spokenInstruction?: string;
  /** What a screen reader announces — auto-generated from instruction if omitted */
  screenReaderText?: string;
  /** Simplified restatement for "say that again" — auto-generated from instruction if omitted */
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
