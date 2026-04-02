// Companion personality, trust, teaching interactions

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { CompanionRepository } from '../db/repositories/companion.js';
import type { CompanionState, PersonalityStage, CompanionMemory } from '../types/companion.js';
import { DEFAULT_COMPANION_CONFIG } from '../types/companion.js';

// --- Personality stage progression ---

const STAGE_ORDER: PersonalityStage[] = ['guide', 'partner', 'ally', 'peer'];

export function getNextStage(current: PersonalityStage): PersonalityStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1]!;
}

export function shouldAdvanceStage(
  current: PersonalityStage,
  trustLevel: number,
  playerAge: number,
): boolean {
  const next = getNextStage(current);
  if (!next) return false;

  const threshold = DEFAULT_COMPANION_CONFIG.stageThresholds[next];
  return playerAge >= threshold.minAge && trustLevel >= threshold.minTrust;
}

// --- Companion dialogue style ---

export interface DialogueStyle {
  formality: 'casual' | 'friendly' | 'collaborative' | 'peer';
  encouragementLevel: 'high' | 'medium' | 'low';
  questionComplexity: 'simple' | 'moderate' | 'complex';
  usesHumor: boolean;
}

export function getDialogueStyle(stage: PersonalityStage): DialogueStyle {
  switch (stage) {
    case 'guide':
      return {
        formality: 'casual',
        encouragementLevel: 'high',
        questionComplexity: 'simple',
        usesHumor: true,
      };
    case 'partner':
      return {
        formality: 'friendly',
        encouragementLevel: 'medium',
        questionComplexity: 'moderate',
        usesHumor: true,
      };
    case 'ally':
      return {
        formality: 'collaborative',
        encouragementLevel: 'medium',
        questionComplexity: 'complex',
        usesHumor: true,
      };
    case 'peer':
      return {
        formality: 'peer',
        encouragementLevel: 'low',
        questionComplexity: 'complex',
        usesHumor: true,
      };
  }
}

// --- CompanionSystem ---

export interface CompanionInteraction {
  type: 'greet' | 'hint' | 'teach_request' | 'encourage' | 'react';
  profileId: string;
  context?: string;
  quality?: number;
}

export class CompanionSystem implements System {
  readonly name = 'companion';
  readonly priority = 30;

  private companionRepo: CompanionRepository | null = null;
  private pendingInteractions: CompanionInteraction[] = [];
  private activeProfileId: string | null = null;

  setRepository(repo: CompanionRepository): void {
    this.companionRepo = repo;
  }

  loadProfile(profileId: string): void {
    this.activeProfileId = profileId;
  }

  queueInteraction(interaction: CompanionInteraction): void {
    this.pendingInteractions.push(interaction);
  }

  update(_world: World, _dt: number): void {
    if (!this.companionRepo || !this.activeProfileId) return;

    const interactions = this.pendingInteractions.splice(0);

    for (const interaction of interactions) {
      this.processInteraction(interaction);
    }
  }

  private processInteraction(interaction: CompanionInteraction): void {
    if (!this.companionRepo) return;

    const state = this.companionRepo.get(interaction.profileId);
    if (!state) return;

    switch (interaction.type) {
      case 'greet':
        this.handleGreet(state);
        break;
      case 'hint':
        this.handleHint(state, interaction.context);
        break;
      case 'teach_request':
        this.handleTeachRequest(state, interaction.context, interaction.quality);
        break;
      case 'encourage':
        this.handleEncourage(state);
        break;
      case 'react':
        this.handleReact(state, interaction.context);
        break;
    }
  }

  private handleGreet(state: CompanionState): void {
    if (!this.companionRepo) return;
    this.companionRepo.adjustTrust(state.profileId, 0.01);
    this.addMemory(state.profileId, 'interaction', 'Player greeted companion', 0.3);
  }

  private handleHint(state: CompanionState, context?: string): void {
    if (!this.companionRepo) return;
    this.addMemory(state.profileId, 'interaction', `Gave hint: ${context ?? 'general'}`, 0.5);
  }

  private handleTeachRequest(state: CompanionState, context?: string, quality?: number): void {
    if (!this.companionRepo) return;
    // Teaching builds deep trust
    const trustDelta = (quality ?? 3) >= 3 ? 0.05 : 0.02;
    this.companionRepo.adjustTrust(state.profileId, trustDelta);
    this.addMemory(state.profileId, 'interaction', `Teaching: ${context ?? 'unknown topic'}`, 0.8);
  }

  private handleEncourage(state: CompanionState): void {
    if (!this.companionRepo) return;
    this.addMemory(state.profileId, 'interaction', 'Encouraged player', 0.4);
  }

  private handleReact(state: CompanionState, context?: string): void {
    if (!this.companionRepo) return;
    this.addMemory(state.profileId, 'interaction', `Reacted to: ${context ?? 'event'}`, 0.3);
  }

  private addMemory(profileId: string, type: CompanionMemory['type'], content: string, importance: number): void {
    if (!this.companionRepo) return;
    this.companionRepo.addMemory(profileId, {
      timestamp: new Date().toISOString(),
      type,
      content,
      importance,
    });
  }

  /** Check if companion should advance to next personality stage */
  checkStageAdvancement(profileId: string, playerAge: number): boolean {
    if (!this.companionRepo) return false;

    const state = this.companionRepo.get(profileId);
    if (!state) return false;

    if (shouldAdvanceStage(state.personalityStage, state.trustLevel, playerAge)) {
      const next = getNextStage(state.personalityStage);
      if (next) {
        this.companionRepo.update(profileId, { personalityStage: next });
        this.addMemory(profileId, 'achievement', `Advanced to ${next} stage`, 1.0);
        return true;
      }
    }
    return false;
  }

  getState(): CompanionState | undefined {
    if (!this.companionRepo || !this.activeProfileId) return undefined;
    return this.companionRepo.get(this.activeProfileId);
  }

  getDialogueStyle(): DialogueStyle | undefined {
    const state = this.getState();
    if (!state) return undefined;
    return getDialogueStyle(state.personalityStage);
  }
}
