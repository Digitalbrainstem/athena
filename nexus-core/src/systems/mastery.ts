// SM-2 spaced repetition, mastery dimensions, gap detection

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { MasteryRecord, SM2Result } from '../types/profile.js';
import type { MasteryRepository } from '../db/repositories/mastery.js';
import type { LearningEventRepository } from '../db/repositories/learning-event.js';

// --- SM-2 Algorithm ---

/**
 * SM-2 spaced repetition algorithm (SuperMemo 2).
 *
 * @param quality - Response quality 0-5 (0=blackout, 5=perfect)
 * @param easeFactor - Current ease factor (minimum 1.3, default 2.5)
 * @param streak - Current repetition count (0-based)
 * @param intervalDays - Current interval in days
 * @returns Updated SM-2 parameters
 */
export function sm2(
  quality: number,
  easeFactor: number,
  streak: number,
  intervalDays: number,
): SM2Result {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let newEF = easeFactor;
  let newStreak = streak;
  let newInterval: number;

  if (q < 3) {
    // Failed: reset streak, interval back to 1 day
    newStreak = 0;
    newInterval = 1;
    // EF does not change on failure per original SM-2
  } else {
    // Successful review
    if (newStreak === 0) {
      newInterval = 1;
    } else if (newStreak === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * easeFactor);
    }
    newStreak++;

    // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3;
  }

  // Calculate next review date
  const now = new Date();
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  const nextReview = nextDate.toISOString().replace('T', ' ').slice(0, 19);

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    intervalDays: newInterval,
    streak: newStreak,
    nextReview,
  };
}

// --- Mastery Dimensions ---

const MASTERY_THRESHOLD = 0.7;

export interface MasteryDimensions {
  retention: number;
  transfer: number;
  depth: number;
  integration: number;
  isMastered: boolean;
}

/**
 * Calculate composite mastery level from the four dimensions.
 * A skill is mastered only when ALL dimensions exceed the threshold.
 */
export function calculateMasteryLevel(record: MasteryRecord): MasteryDimensions {
  const integration = calculateIntegration(record);
  const retention = record.retentionScore;
  const transfer = record.transferScore;
  const depth = record.depthScore;

  const isMastered =
    retention >= MASTERY_THRESHOLD &&
    transfer >= MASTERY_THRESHOLD &&
    depth >= MASTERY_THRESHOLD &&
    integration >= MASTERY_THRESHOLD;

  return { retention, transfer, depth, integration, isMastered };
}

function calculateIntegration(record: MasteryRecord): number {
  // Integration is derived from success rate and ease factor
  if (record.attempts === 0) return 0;
  const successRate = record.successes / record.attempts;
  const efNormalized = Math.min(1, (record.easeFactor - 1.3) / (2.5 - 1.3));
  return Math.min(1, (successRate * 0.6 + efNormalized * 0.4));
}

/**
 * Update retention score based on SM-2 quality.
 * Higher quality = higher retention, but blended with existing score.
 */
export function updateRetention(currentRetention: number, quality: number): number {
  const qNormalized = quality / 5;
  // Exponential moving average: 70% new signal, 30% old
  const newRetention = currentRetention * 0.3 + qNormalized * 0.7;
  return Math.round(Math.max(0, Math.min(1, newRetention)) * 1000) / 1000;
}

/**
 * Update transfer score when a skill is used in a new context.
 * Each unique context contributes to transfer mastery.
 */
export function updateTransfer(currentTransfer: number, uniqueContextCount: number): number {
  // Transfer improves with diversity of contexts (logarithmic growth)
  const targetTransfer = Math.min(1, Math.log2(uniqueContextCount + 1) / 3);
  const newTransfer = Math.max(currentTransfer, targetTransfer);
  return Math.round(newTransfer * 1000) / 1000;
}

/**
 * Update depth score from teaching interactions.
 * Teaching (explaining to companion) deepens understanding.
 */
export function updateDepth(currentDepth: number, teachingQuality: number): number {
  const qNormalized = teachingQuality / 5;
  const newDepth = currentDepth * 0.4 + qNormalized * 0.6;
  return Math.round(Math.max(0, Math.min(1, newDepth)) * 1000) / 1000;
}

// --- Gap Detection ---

/** Prerequisite mapping: skill -> required prerequisite skills */
export interface SkillPrerequisites {
  [skillId: string]: string[];
}

const DEFAULT_PREREQUISITES: SkillPrerequisites = {
  'math.algebra': ['math.arithmetic'],
  'math.geometry': ['math.arithmetic'],
  'math.trigonometry': ['math.geometry', 'math.algebra'],
  'math.calculus': ['math.algebra', 'math.trigonometry'],
  'science.chemistry': ['math.arithmetic', 'science.matter'],
  'science.physics': ['math.algebra', 'science.matter'],
  'science.biology.ecology': ['science.biology.basics'],
  'language.writing': ['language.reading'],
  'language.grammar': ['language.reading'],
  'engineering.structures': ['math.geometry', 'science.physics'],
  'engineering.circuits': ['math.algebra', 'science.physics'],
};

export interface GapAnalysis {
  skillId: string;
  gaps: GapDetail[];
  remediationPath: string[];
}

export interface GapDetail {
  prerequisiteSkillId: string;
  currentLevel: number;
  requiredLevel: number;
}

/**
 * Detect knowledge gaps when a player fails a skill.
 * Traces prerequisite tree to find the root cause.
 */
export function detectGaps(
  failedSkillId: string,
  masteryRecords: Map<string, MasteryRecord>,
  prerequisites: SkillPrerequisites = DEFAULT_PREREQUISITES,
): GapAnalysis {
  const gaps: GapDetail[] = [];
  const visited = new Set<string>();

  function checkPrereqs(skillId: string): void {
    if (visited.has(skillId)) return;
    visited.add(skillId);

    const prereqs = prerequisites[skillId];
    if (!prereqs) return;

    for (const prereq of prereqs) {
      const record = masteryRecords.get(prereq);
      const currentLevel = record
        ? (record.retentionScore + record.transferScore + record.depthScore) / 3
        : 0;

      if (currentLevel < MASTERY_THRESHOLD) {
        gaps.push({
          prerequisiteSkillId: prereq,
          currentLevel,
          requiredLevel: MASTERY_THRESHOLD,
        });
        // Recursively check deeper prerequisites
        checkPrereqs(prereq);
      }
    }
  }

  checkPrereqs(failedSkillId);

  // Build remediation path: start from deepest gaps
  const remediationPath = gaps
    .sort((a, b) => a.currentLevel - b.currentLevel)
    .map((g) => g.prerequisiteSkillId);

  return {
    skillId: failedSkillId,
    gaps,
    remediationPath,
  };
}

// --- Learning Event Queue ---

export interface PendingLearningEvent {
  profileId: string;
  skillId: string;
  questId?: string;
  eventType: string;
  quality: number;
  context?: string;
  responseTimeMs?: number;
}

// --- MasterySystem (ECS System) ---

export class MasterySystem implements System {
  readonly name = 'mastery';
  readonly priority = 10;

  private pendingEvents: PendingLearningEvent[] = [];
  private masteryRepo: MasteryRepository | null = null;
  private eventRepo: LearningEventRepository | null = null;
  private prerequisites: SkillPrerequisites = DEFAULT_PREREQUISITES;

  setRepositories(masteryRepo: MasteryRepository, eventRepo: LearningEventRepository): void {
    this.masteryRepo = masteryRepo;
    this.eventRepo = eventRepo;
  }

  setPrerequisites(prereqs: SkillPrerequisites): void {
    this.prerequisites = prereqs;
  }

  queueEvent(event: PendingLearningEvent): void {
    this.pendingEvents.push(event);
  }

  update(_world: World, _dt: number): void {
    if (!this.masteryRepo || !this.eventRepo) return;

    const events = this.pendingEvents.splice(0);

    for (const event of events) {
      this.processEvent(event);
    }
  }

  private processEvent(event: PendingLearningEvent): void {
    if (!this.masteryRepo || !this.eventRepo) return;

    // Record the learning event
    this.eventRepo.record({
      profileId: event.profileId,
      skillId: event.skillId,
      questId: event.questId,
      eventType: event.eventType,
      quality: event.quality,
      context: event.context,
      responseTimeMs: event.responseTimeMs,
    });

    // Get or create mastery record
    let record = this.masteryRepo.getForSkill(event.profileId, event.skillId);
    if (!record) {
      record = this.masteryRepo.upsert(event.profileId, event.skillId, {});
    }

    // Run SM-2
    const sm2Result = sm2(
      event.quality,
      record.easeFactor,
      record.streak,
      record.intervalDays,
    );

    // Update retention
    const newRetention = updateRetention(record.retentionScore, event.quality);

    // Update transfer if new context
    let newTransfer = record.transferScore;
    if (event.context) {
      const contextEvents = this.eventRepo.getForSkill(event.profileId, event.skillId);
      const uniqueContexts = new Set(contextEvents.map((e) => e.context).filter(Boolean));
      uniqueContexts.add(event.context);
      newTransfer = updateTransfer(record.transferScore, uniqueContexts.size);
    }

    // Update depth if teaching event
    let newDepth = record.depthScore;
    if (event.eventType === 'teach') {
      newDepth = updateDepth(record.depthScore, event.quality);
    }

    // Calculate new level
    const avgScore = (newRetention + newTransfer + newDepth) / 3;

    // Save updated mastery
    this.masteryRepo.upsert(event.profileId, event.skillId, {
      level: Math.round(avgScore * 1000) / 1000,
      retentionScore: newRetention,
      transferScore: newTransfer,
      depthScore: newDepth,
      attempts: record.attempts + 1,
      successes: event.quality >= 3 ? record.successes + 1 : record.successes,
      lastAttempt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      nextReview: sm2Result.nextReview,
      easeFactor: sm2Result.easeFactor,
      streak: sm2Result.streak,
      intervalDays: sm2Result.intervalDays,
    });
  }

  /** Get gap analysis for a specific skill */
  analyzeGaps(profileId: string): GapAnalysis[] {
    if (!this.masteryRepo) return [];

    const records = this.masteryRepo.getForProfile(profileId);
    const recordMap = new Map(records.map((r) => [r.skillId, r]));
    const analyses: GapAnalysis[] = [];

    // Check weak skills for gaps
    const weakSkills = this.masteryRepo.getWeakSkills(profileId, MASTERY_THRESHOLD);
    for (const skill of weakSkills) {
      const analysis = detectGaps(skill.skillId, recordMap, this.prerequisites);
      if (analysis.gaps.length > 0) {
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  /** Get skills due for spaced repetition review */
  getDueForReview(profileId: string): MasteryRecord[] {
    if (!this.masteryRepo) return [];
    return this.masteryRepo.getDueForReview(profileId);
  }
}
