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
}

export interface QuestStep {
  index: number;
  instruction: string;
  objectiveType: 'interact' | 'collect' | 'build' | 'craft' | 'navigate' | 'observe' | 'teach';
  targetId?: string;
  requiredCount?: number;
  hint?: string;
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
