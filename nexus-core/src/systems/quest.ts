// Quest state machine, selection, completion

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { QuestProgress, QuestStatus, Quest } from '../types/quest.js';
import type { QuestRepository } from '../db/repositories/quest.js';
import type { MasteryRepository } from '../db/repositories/mastery.js';
import type { MasterySystem, PendingLearningEvent } from './mastery.js';

// --- Quest State Machine ---

const VALID_TRANSITIONS: Record<QuestStatus, QuestStatus[]> = {
  available: ['active'],
  active: ['completed', 'abandoned'],
  completed: [],
  abandoned: ['active'],
};

export function canTransition(from: QuestStatus, to: QuestStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// --- Quest Selection ---

export interface QuestSelectionCriteria {
  profileId: string;
  biome: string;
  masteryTier: string;
  maxActive?: number;
}

export interface QuestAction {
  type: 'start' | 'progress' | 'complete' | 'abandon';
  questId: string;
  profileId: string;
  stepsCompleted?: number;
}

export class QuestSystem implements System {
  readonly name = 'quest';
  readonly priority = 20;

  private questRepo: QuestRepository | null = null;
  private masteryRepo: MasteryRepository | null = null;
  private masterySystem: MasterySystem | null = null;
  private pendingActions: QuestAction[] = [];

  setRepositories(questRepo: QuestRepository, masteryRepo: MasteryRepository): void {
    this.questRepo = questRepo;
    this.masteryRepo = masteryRepo;
  }

  setMasterySystem(masterySystem: MasterySystem): void {
    this.masterySystem = masterySystem;
  }

  queueAction(action: QuestAction): void {
    this.pendingActions.push(action);
  }

  update(_world: World, _dt: number): void {
    if (!this.questRepo) return;

    const actions = this.pendingActions.splice(0);

    for (const action of actions) {
      this.processAction(action);
    }
  }

  private processAction(action: QuestAction): void {
    if (!this.questRepo) return;

    switch (action.type) {
      case 'start':
        this.startQuest(action.profileId, action.questId);
        break;
      case 'progress':
        this.advanceQuest(action.profileId, action.questId, action.stepsCompleted ?? 0);
        break;
      case 'complete':
        this.completeQuest(action.profileId, action.questId);
        break;
      case 'abandon':
        this.abandonQuest(action.profileId, action.questId);
        break;
    }
  }

  private startQuest(profileId: string, questId: string): QuestProgress | undefined {
    if (!this.questRepo) return undefined;

    const quest = this.questRepo.getById(questId);
    if (!quest) return undefined;

    const existing = this.questRepo.getProgress(profileId, questId);
    if (existing && !canTransition(existing.status, 'active')) {
      return undefined;
    }

    return this.questRepo.startQuest(profileId, questId);
  }

  private advanceQuest(profileId: string, questId: string, stepsCompleted: number): void {
    if (!this.questRepo) return;

    const progress = this.questRepo.getProgress(profileId, questId);
    if (!progress || progress.status !== 'active') return;

    this.questRepo.updateProgress(profileId, questId, stepsCompleted);

    // Check if quest is now complete
    const quest = this.questRepo.getById(questId);
    if (quest && stepsCompleted >= quest.content.steps.length) {
      this.completeQuest(profileId, questId);
    }
  }

  private completeQuest(profileId: string, questId: string): void {
    if (!this.questRepo) return;

    const progress = this.questRepo.getProgress(profileId, questId);
    if (!progress || !canTransition(progress.status, 'completed')) return;

    this.questRepo.completeQuest(profileId, questId);

    // Generate learning events for all skills taught
    const quest = this.questRepo.getById(questId);
    if (quest && this.masterySystem) {
      for (const skillId of quest.skillsTaught) {
        const event: PendingLearningEvent = {
          profileId,
          skillId,
          questId,
          eventType: 'quest_completion',
          quality: 4, // Default quality for quest completion
          context: quest.biome,
        };
        this.masterySystem.queueEvent(event);
      }
    }
  }

  private abandonQuest(profileId: string, questId: string): void {
    if (!this.questRepo) return;

    const progress = this.questRepo.getProgress(profileId, questId);
    if (!progress || !canTransition(progress.status, 'abandoned')) return;

    this.questRepo.abandonQuest(profileId, questId);
  }

  /** Select available quests based on player state */
  selectQuests(criteria: QuestSelectionCriteria): Quest[] {
    if (!this.questRepo || !this.masteryRepo) return [];

    const maxActive = criteria.maxActive ?? 3;

    // Check how many active quests the player already has
    const activeQuests = this.questRepo.getActiveForProfile(criteria.profileId);
    if (activeQuests.length >= maxActive) return [];

    // Get quests for current biome and tier
    const candidates = this.questRepo.getForBiomeAndTier(criteria.biome, criteria.masteryTier);

    // Filter out already active or completed quests
    const completedIds = new Set(
      this.questRepo.getCompletedForProfile(criteria.profileId).map((p) => p.questId),
    );
    const activeIds = new Set(activeQuests.map((p) => p.questId));

    const available = candidates.filter(
      (q) => !completedIds.has(q.id) && !activeIds.has(q.id),
    );

    // Check skill requirements
    const mastery = this.masteryRepo.getForProfile(criteria.profileId);
    const masteryMap = new Map(mastery.map((m) => [m.skillId, m]));

    const qualified = available.filter((quest) => {
      return quest.skillsRequired.every((skillId) => {
        const record = masteryMap.get(skillId);
        return record && record.level >= 0.3; // Minimum competency threshold
      });
    });

    // Sort by relevance (prefer quests that teach skills due for review)
    return qualified.slice(0, maxActive - activeQuests.length);
  }

  getActiveQuests(profileId: string): QuestProgress[] {
    if (!this.questRepo) return [];
    return this.questRepo.getActiveForProfile(profileId);
  }
}
