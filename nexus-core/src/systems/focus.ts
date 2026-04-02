// Focus Mode System
// Three entry points: companion request, parent/teacher setting, Study Forge biome.
// Biases quest generation toward focus skills without the player noticing
// (subtle/moderate) or with directed practice (intensive / Study Forge).

import type {
  CompanionFocusRequest,
  FocusIntensity,
  FocusSession,
  FocusSource,
  ParentFocusRequest,
  SkillWeight,
} from '../types/focus.js';
import {
  DEFAULT_SKILL_WEIGHT,
  INTENSITY_WEIGHTS,
  MAX_FOCUS_SKILLS,
  validateFocusRequest,
} from '../types/focus.js';

// ─── ID Generation ──────────────────────────────────────────────────────────

let focusCounter = 0;

function generateFocusId(): string {
  focusCounter += 1;
  return `focus-${Date.now().toString(36)}-${focusCounter.toString(36)}`;
}

// ─── Focus Mode System ──────────────────────────────────────────────────────

export class FocusModeSystem {
  private activeSessions = new Map<string, FocusSession>();
  private nowFn: () => number;

  constructor(nowFn?: () => number) {
    this.nowFn = nowFn ?? (() => Date.now());
  }

  /**
   * Entry A: Player tells companion they want to focus on something.
   * "I want to get better at fractions" → companion parses → focus session.
   */
  requestFocus(profileId: string, request: CompanionFocusRequest): FocusSession {
    const intensity = request.intensity ?? 'moderate';
    const errors = validateFocusRequest(request.parsedSkills, intensity, request.durationQuests);
    if (errors.length > 0) {
      throw new Error(`Invalid focus request: ${errors.join('; ')}`);
    }

    return this.createSession(
      profileId,
      'companion',
      request.parsedSkills,
      intensity,
      request.durationQuests ?? null,
    );
  }

  /**
   * Entry B: Parent or teacher sets focus from the dashboard.
   * "Focus on algebra for the next 10 quests."
   */
  setParentFocus(profileId: string, focus: ParentFocusRequest): FocusSession {
    const errors = validateFocusRequest(focus.skills, focus.intensity, focus.durationQuests);
    if (errors.length > 0) {
      throw new Error(`Invalid parent focus request: ${errors.join('; ')}`);
    }

    return this.createSession(
      profileId,
      focus.source,
      focus.skills,
      focus.intensity,
      focus.durationQuests ?? null,
    );
  }

  /**
   * Entry C: Player enters the Study Forge biome in the Library of Echoes.
   * Automatically starts an intensive focus session for the player's weakest skills.
   * weakSkills should be provided by the mastery system's gap analysis.
   */
  enterStudyForge(profileId: string, weakSkills?: string[]): FocusSession {
    const skills = weakSkills && weakSkills.length > 0
      ? weakSkills.slice(0, MAX_FOCUS_SKILLS)
      : ['math.arithmetic', 'language.reading'];

    return this.createSession(
      profileId,
      'study_forge',
      skills,
      'intensive',
      null,
    );
  }

  /** Get the currently active focus session for a profile, or null. */
  getActiveFocus(profileId: string): FocusSession | null {
    return this.activeSessions.get(profileId) ?? null;
  }

  /** Clear the current focus session for a profile. */
  clearFocus(profileId: string): void {
    const session = this.activeSessions.get(profileId);
    if (session) {
      this.activeSessions.set(profileId, { ...session, active: false });
      this.activeSessions.delete(profileId);
    }
  }

  /**
   * Record that a quest was completed during a focus session.
   * Updates quest count and skill progress. Auto-clears if duration reached.
   * Returns true if the session is still active after recording.
   */
  recordQuestCompletion(
    profileId: string,
    _skillsUsed: string[],
    masteryDeltas: Record<string, number>,
  ): boolean {
    const session = this.activeSessions.get(profileId);
    if (!session || !session.active) return false;

    const newProgress = { ...session.skillProgress };
    for (const [skill, delta] of Object.entries(masteryDeltas)) {
      if (session.skills.includes(skill)) {
        newProgress[skill] = (newProgress[skill] ?? 0) + delta;
      }
    }

    const newQuestsCompleted = session.questsCompleted + 1;
    const reachedDuration = session.durationQuests !== null &&
      newQuestsCompleted >= session.durationQuests;

    const updated: FocusSession = {
      ...session,
      questsCompleted: newQuestsCompleted,
      skillProgress: newProgress,
      active: !reachedDuration,
    };

    if (reachedDuration) {
      this.activeSessions.delete(profileId);
    } else {
      this.activeSessions.set(profileId, updated);
    }

    return !reachedDuration;
  }

  /**
   * Get skill weights for the quest engine.
   * Focus skills receive a weight multiplier based on intensity.
   * Non-focus skills keep their default weight.
   * Returns a map of skillId → weight for all known skills.
   */
  getSkillWeights(profileId: string): Map<string, number> {
    const weights = new Map<string, number>();
    const session = this.activeSessions.get(profileId);

    if (!session || !session.active) {
      return weights;
    }

    const multiplier = INTENSITY_WEIGHTS[session.intensity];
    for (const skill of session.skills) {
      weights.set(skill, DEFAULT_SKILL_WEIGHT * multiplier);
    }

    return weights;
  }

  /**
   * Get detailed skill weight entries for the quest engine.
   * Includes source information for transparency/debugging.
   */
  getDetailedSkillWeights(profileId: string): SkillWeight[] {
    const session = this.activeSessions.get(profileId);

    if (!session || !session.active) {
      return [];
    }

    const multiplier = INTENSITY_WEIGHTS[session.intensity];
    return session.skills.map((skillId) => ({
      skillId,
      weight: DEFAULT_SKILL_WEIGHT * multiplier,
      source: session.source,
    }));
  }

  /**
   * Apply focus weights to a given base weight map.
   * Focus skills get their weight multiplied; non-focus skills are unchanged.
   * This is the main integration point with the quest selection engine.
   */
  applyFocusWeights(
    profileId: string,
    baseWeights: Map<string, number>,
  ): Map<string, number> {
    const session = this.activeSessions.get(profileId);
    if (!session || !session.active) return new Map(baseWeights);

    const result = new Map(baseWeights);
    const multiplier = INTENSITY_WEIGHTS[session.intensity];

    for (const skill of session.skills) {
      const base = result.get(skill) ?? DEFAULT_SKILL_WEIGHT;
      result.set(skill, base * multiplier);
    }

    return result;
  }

  /** Check if there is an active focus session. */
  hasFocus(profileId: string): boolean {
    const session = this.activeSessions.get(profileId);
    return session !== undefined && session.active;
  }

  /** Get summary of focus progress for companion dialogue. */
  getFocusSummary(profileId: string): string | null {
    const session = this.activeSessions.get(profileId);
    if (!session || !session.active) return null;

    const skillNames = session.skills.join(', ');
    const progress = Object.values(session.skillProgress)
      .reduce((sum, v) => sum + v, 0);

    if (session.durationQuests !== null) {
      return `Focusing on ${skillNames} — ${session.questsCompleted}/${session.durationQuests} quests completed (progress: +${progress.toFixed(2)})`;
    }

    return `Focusing on ${skillNames} — ${session.questsCompleted} quests completed (progress: +${progress.toFixed(2)})`;
  }

  /** Clear all focus data (used for testing or profile deletion). */
  clear(): void {
    this.activeSessions.clear();
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private createSession(
    profileId: string,
    source: FocusSource,
    skills: string[],
    intensity: FocusIntensity,
    durationQuests: number | null,
  ): FocusSession {
    // Clear any existing session first
    this.activeSessions.delete(profileId);

    const initialProgress: Record<string, number> = {};
    for (const skill of skills) {
      initialProgress[skill] = 0;
    }

    const session: FocusSession = {
      id: generateFocusId(),
      profileId,
      source,
      skills,
      intensity,
      durationQuests,
      questsCompleted: 0,
      skillProgress: initialProgress,
      createdAt: this.nowFn(),
      active: true,
    };

    this.activeSessions.set(profileId, session);
    return session;
  }
}
