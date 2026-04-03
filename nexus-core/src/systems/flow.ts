// Flow Engine — Dynamic difficulty adjustment and struggle detection
//
// Implements Csikszentmihalyi's flow channel: keeps players in the sweet spot
// between boredom (too easy) and anxiety (too hard). Detects struggle patterns,
// scaffolds gently, suggests redirections for prerequisite gaps, and prevents
// repetitive mechanic sequences.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  AttemptOutcome,
  FlowState,
  FlowZone,
  ScaffoldAction,
  ScaffoldType,
  Redirection,
  ChallengeAttemptRecord,
  ChallengeInfo,
} from '../types/flow.js';
import { SKILL_PREREQUISITES } from '../data/skill-prerequisites.js';

// --- Constants ---

/** Rolling window size for success rate calculation */
const ROLLING_WINDOW = 20;

/** Threshold above which we escalate difficulty */
const BOREDOM_THRESHOLD = 0.85;

/** Threshold below which we scaffold */
const ANXIETY_THRESHOLD = 0.40;

/** Number of attempts before a challenge counts as a struggle */
const STRUGGLE_ATTEMPT_THRESHOLD = 5;

/** Maximum recent mechanics to track for anti-pattern detection */
const MECHANIC_HISTORY_SIZE = 20;

/** If same mechanic appears this many times in last N, flag it */
const MECHANIC_REPEAT_THRESHOLD = 3;

/** Window to check for mechanic repetition */
const MECHANIC_REPEAT_WINDOW = 5;

/** Default tolerance multiplier (no widening) */
const BASE_TOLERANCE = 1.0;

/** Max tolerance widening */
const MAX_TOLERANCE = 1.5;

// --- Scaffold escalation thresholds (attempt-based) ---

const OBSERVE_MIN_ATTEMPTS = 4;
const OBSERVE_MAX_ATTEMPTS = 5;
const ALTERNATIVE_MIN_ATTEMPTS = 6;
const ALTERNATIVE_MAX_ATTEMPTS = 7;
// --- Skill-to-biome mapping for redirections ---

const SKILL_BIOME_MAP: Record<string, string> = {
  'math.counting': 'workshop',
  'math.number-sense': 'workshop',
  'math.shapes': 'workshop',
  'math.patterns': 'crystal-caverns',
  'math.size-comparison': 'workshop',
  'math.sorting': 'workshop',
  'math.arithmetic': 'workshop',
  'math.geometry': 'workshop',
  'math.algebra': 'workshop',
  'math.trigonometry': 'workshop',
  'math.calculus': 'workshop',
  'science.observation': 'living-forest',
  'science.matter': 'alchemist-lab',
  'science.colors': 'alchemist-lab',
  'science.weather': 'living-forest',
  'science.senses': 'living-forest',
  'science.chemistry': 'alchemist-lab',
  'science.physics': 'workshop',
  'science.geology': 'crystal-caverns',
  'science.biology.basics': 'living-forest',
  'science.biology.ecology': 'living-forest',
  'science.biology.anatomy': 'living-forest',
  'language.listening': 'library-echoes',
  'language.vocabulary': 'library-echoes',
  'language.reading': 'library-echoes',
  'language.writing': 'library-echoes',
  'language.grammar': 'library-echoes',
  'engineering.basics': 'workshop',
  'engineering.structures': 'workshop',
  'engineering.circuits': 'workshop',
  'spatial.directions': 'crystal-caverns',
  'spatial.turns': 'crystal-caverns',
  'motor.fine': 'workshop',
};

// --- Companion observation messages (never judgmental, principle VI) ---

const OBSERVE_MESSAGES: readonly string[] = [
  "Hmm, I noticed something interesting about how that part connects...",
  "Hey, look at this piece here — it reminds me of something we saw before.",
  "I think there's a pattern here. See how this part works?",
  "Wait — what if we look at it from this angle?",
  "Ooh, I just noticed something! The first part was really clever.",
];

const ALTERNATIVE_MESSAGES: readonly string[] = [
  "What if we tried a completely different approach?",
  "I wonder if there's another way to get there...",
  "Hey, I saw something over there that might give us another idea!",
  "Let's step back and think about this differently.",
  "There might be more than one way to solve this!",
];

const REDIRECT_MESSAGES: readonly string[] = [
  "Hey, I just remembered something we saw in {biome}! Let's go check it out — it might help us here.",
  "Ooh, there's this really cool thing in {biome} that's kind of related. Want to explore?",
  "I think exploring {biome} for a bit would be fun — and we might learn something useful!",
  "Let's take an adventure to {biome}! I have a feeling something there will click for us.",
];

/**
 * Flow Engine — manages dynamic difficulty, struggle detection, scaffolding,
 * and anti-pattern prevention. Implements as an ECS system and standalone API.
 *
 * Core algorithm:
 * - Tracks rolling success rate over last 20 interactions per player
 * - Detects struggle via attempt counts per challenge
 * - Escalates scaffold interventions: observe → alternative → redirect
 * - Widens tolerance multiplier when struggling (1.2x–1.5x)
 * - Tracks mechanic diversity to prevent repetitive gameplay
 * - Uses skill prerequisite tree for gap-based redirections
 */
export class FlowEngine implements System {
  readonly name = 'flow';
  readonly priority = 5; // Run before mastery system

  /** Per-profile attempt history (profileId → records) */
  private readonly attemptHistory = new Map<string, ChallengeAttemptRecord[]>();

  /** Per-profile per-challenge attempt counts (profileId:challengeId → count) */
  private readonly challengeAttemptCounts = new Map<string, number>();

  /** Per-profile per-challenge tolerance multipliers (profileId:challengeId → multiplier) */
  private readonly toleranceMultipliers = new Map<string, number>();

  /** Per-profile recent mechanic history */
  private readonly mechanicHistory = new Map<string, string[]>();

  /** Challenge metadata registry */
  private readonly challengeRegistry = new Map<string, ChallengeInfo>();

  /** Per-profile mastery levels for gap detection */
  private readonly masteryLevels = new Map<string, Map<string, number>>();

  // --- ECS System interface ---

  update(_world: World, _dt: number): void {
    // Flow engine is event-driven via recordAttempt; no per-frame work needed
  }

  // --- Public API ---

  /**
   * Register a challenge so the flow engine knows its skill and mechanic.
   * Must be called before recordAttempt for accurate scaffold/redirect logic.
   */
  registerChallenge(info: ChallengeInfo): void {
    this.challengeRegistry.set(info.id, info);
  }

  /**
   * Set mastery levels for a profile (used for gap detection).
   * Keys are skill IDs, values are 0.0–1.0 mastery levels.
   */
  setMasteryLevels(profileId: string, levels: Map<string, number>): void {
    this.masteryLevels.set(profileId, new Map(levels));
  }

  /**
   * Record an attempt on a challenge. This is the primary input to the flow engine.
   * Updates rolling statistics, attempt counts, and mechanic history.
   */
  recordAttempt(profileId: string, challengeId: string, outcome: AttemptOutcome): void {
    const key = `${profileId}:${challengeId}`;
    const record: ChallengeAttemptRecord = {
      profileId,
      challengeId,
      outcome,
      timestamp: Date.now(),
      mechanic: this.challengeRegistry.get(challengeId)?.mechanic,
      skill: this.challengeRegistry.get(challengeId)?.skill,
    };

    // Append to per-profile history
    let history = this.attemptHistory.get(profileId);
    if (!history) {
      history = [];
      this.attemptHistory.set(profileId, history);
    }
    history.push(record);

    // Trim to rolling window (keep extra for averageAttempts calculation)
    const maxHistory = ROLLING_WINDOW * 3;
    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }

    // Update per-challenge attempt count
    const currentCount = this.challengeAttemptCounts.get(key) ?? 0;
    this.challengeAttemptCounts.set(key, currentCount + 1);

    // If succeeded or redirected, reset challenge attempt count
    if (outcome.success) {
      this.challengeAttemptCounts.set(key, 0);
      this.toleranceMultipliers.delete(key);
    }

    // Update tolerance multiplier based on attempt escalation
    if (!outcome.success) {
      const attempts = this.challengeAttemptCounts.get(key) ?? 0;
      if (attempts >= ALTERNATIVE_MIN_ATTEMPTS) {
        const currentTolerance = this.toleranceMultipliers.get(key) ?? BASE_TOLERANCE;
        this.toleranceMultipliers.set(
          key,
          Math.min(MAX_TOLERANCE, currentTolerance + 0.1),
        );
      }
    }

    // Track mechanic for anti-pattern detection
    if (record.mechanic) {
      let mechanics = this.mechanicHistory.get(profileId);
      if (!mechanics) {
        mechanics = [];
        this.mechanicHistory.set(profileId, mechanics);
      }
      // Only add on first attempt (avoid counting retries)
      if (outcome.attemptNumber === 1) {
        mechanics.push(record.mechanic);
        if (mechanics.length > MECHANIC_HISTORY_SIZE) {
          mechanics.splice(0, mechanics.length - MECHANIC_HISTORY_SIZE);
        }
      }
    }
  }

  /**
   * Get the current flow state for a player based on their recent history.
   */
  getFlowState(profileId: string): FlowState {
    const history = this.attemptHistory.get(profileId) ?? [];

    if (history.length === 0) {
      return {
        zone: 'flow',
        successRate: 0.5,
        averageAttempts: 1,
        currentStreak: 0,
        struggleCount: 0,
      };
    }

    // Get unique recent challenge interactions (last attempt per challenge)
    const recentByChallenge = this.getRecentChallengeOutcomes(history, ROLLING_WINDOW);
    const successRate = this.calculateSuccessRate(recentByChallenge);
    const averageAttempts = this.calculateAverageAttempts(recentByChallenge);
    const currentStreak = this.calculateStreak(history);
    const struggleCount = this.calculateStruggleCount(recentByChallenge);
    const zone = this.determineZone(successRate);

    return {
      zone,
      successRate: Math.round(successRate * 1000) / 1000,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
      currentStreak,
      struggleCount,
    };
  }

  /**
   * Check if a challenge needs scaffolding based on attempt count.
   * Returns null if no intervention is needed (attempts 1–3).
   */
  shouldScaffold(profileId: string, challengeId: string): ScaffoldAction | null {
    const key = `${profileId}:${challengeId}`;
    const attempts = this.challengeAttemptCounts.get(key) ?? 0;

    if (attempts < OBSERVE_MIN_ATTEMPTS) {
      return null;
    }

    if (attempts <= OBSERVE_MAX_ATTEMPTS) {
      return this.createScaffold('observe', profileId, challengeId);
    }

    if (attempts <= ALTERNATIVE_MAX_ATTEMPTS) {
      return this.createScaffold('alternative', profileId, challengeId);
    }

    // 8+ attempts: redirect to prerequisite
    return this.createScaffold('redirect', profileId, challengeId);
  }

  /**
   * Check if difficulty should be escalated (player in boredom zone).
   */
  shouldEscalate(profileId: string): boolean {
    const state = this.getFlowState(profileId);
    return state.zone === 'boredom';
  }

  /**
   * Suggest a redirection when a player is struggling due to a prerequisite gap.
   * Uses the skill prerequisite tree to find the weakest prerequisite.
   */
  suggestRedirection(profileId: string): Redirection | null {
    const history = this.attemptHistory.get(profileId) ?? [];
    if (history.length === 0) return null;

    // Find the most-struggled challenge
    const struggleChallenges = this.findStruggledChallenges(profileId);
    if (struggleChallenges.length === 0) return null;

    const worstChallenge = struggleChallenges[0]!;
    const challengeInfo = this.challengeRegistry.get(worstChallenge);
    if (!challengeInfo) return null;

    const skill = challengeInfo.skill;
    const prereqs = SKILL_PREREQUISITES[skill];
    if (!prereqs || prereqs.length === 0) return null;

    const levels = this.masteryLevels.get(profileId) ?? new Map<string, number>();

    // Find the weakest prerequisite
    let weakestPrereq: string | null = null;
    let weakestLevel = Infinity;

    for (const prereq of prereqs) {
      const level = levels.get(prereq) ?? 0;
      if (level < weakestLevel) {
        weakestLevel = level;
        weakestPrereq = prereq;
      }
    }

    if (!weakestPrereq || weakestLevel >= 0.7) return null;

    const targetBiome = SKILL_BIOME_MAP[weakestPrereq] ?? 'workshop';
    const biomeDisplay = this.formatBiomeName(targetBiome);
    const messageTemplate = REDIRECT_MESSAGES[
      Math.floor(this.seededRandom(profileId) * REDIRECT_MESSAGES.length)
    ] ?? REDIRECT_MESSAGES[0]!;
    const companionMessage = messageTemplate.replace('{biome}', biomeDisplay);

    return {
      fromSkill: skill,
      gapSkill: weakestPrereq,
      targetBiome,
      companionMessage,
    };
  }

  /**
   * Get the dynamic tolerance multiplier for a challenge.
   * Returns 1.0 normally, up to 1.5 when the player is struggling.
   */
  getToleranceMultiplier(profileId: string, challengeId: string): number {
    const key = `${profileId}:${challengeId}`;
    return this.toleranceMultipliers.get(key) ?? BASE_TOLERANCE;
  }

  /**
   * Get the last N gameplay mechanics used by a player.
   */
  getRecentMechanics(profileId: string, count: number): string[] {
    const mechanics = this.mechanicHistory.get(profileId) ?? [];
    return mechanics.slice(-count);
  }

  /**
   * Check if a mechanic should be avoided (appears too often recently).
   */
  shouldAvoidMechanic(profileId: string, mechanic: string): boolean {
    const mechanics = this.mechanicHistory.get(profileId) ?? [];
    const recentWindow = mechanics.slice(-MECHANIC_REPEAT_WINDOW);
    const count = recentWindow.filter((m) => m === mechanic).length;
    return count >= MECHANIC_REPEAT_THRESHOLD;
  }

  /**
   * Reset the attempt count for a challenge (e.g., after redirect).
   */
  resetChallengeAttempts(profileId: string, challengeId: string): void {
    const key = `${profileId}:${challengeId}`;
    this.challengeAttemptCounts.set(key, 0);
    this.toleranceMultipliers.delete(key);
  }

  /**
   * Clear all state for a profile (e.g., on logout).
   */
  clearProfile(profileId: string): void {
    this.attemptHistory.delete(profileId);
    this.mechanicHistory.delete(profileId);
    this.masteryLevels.delete(profileId);
    const prefix = `${profileId}:`;
    for (const key of [...this.challengeAttemptCounts.keys()]) {
      if (key.startsWith(prefix)) this.challengeAttemptCounts.delete(key);
    }
    for (const key of [...this.toleranceMultipliers.keys()]) {
      if (key.startsWith(prefix)) this.toleranceMultipliers.delete(key);
    }
  }

  // --- Private helpers ---

  /**
   * Get the final outcome per unique challenge from recent history.
   * Returns up to `window` most recent unique challenge results.
   */
  private getRecentChallengeOutcomes(
    history: ChallengeAttemptRecord[],
    window: number,
  ): ChallengeAttemptRecord[] {
    const seen = new Map<string, ChallengeAttemptRecord>();

    // Walk backwards to get the most recent outcome per challenge
    for (let i = history.length - 1; i >= 0; i--) {
      const record = history[i]!;
      if (!seen.has(record.challengeId)) {
        seen.set(record.challengeId, record);
      }
      if (seen.size >= window) break;
    }

    return Array.from(seen.values());
  }

  private calculateSuccessRate(outcomes: ChallengeAttemptRecord[]): number {
    if (outcomes.length === 0) return 0.5;
    const successes = outcomes.filter((o) => o.outcome.success || o.outcome.partial).length;
    return successes / outcomes.length;
  }

  private calculateAverageAttempts(outcomes: ChallengeAttemptRecord[]): number {
    if (outcomes.length === 0) return 1;
    const totalAttempts = outcomes.reduce((sum, o) => sum + o.outcome.attemptNumber, 0);
    return totalAttempts / outcomes.length;
  }

  private calculateStreak(history: ChallengeAttemptRecord[]): number {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i]!.outcome.success) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private calculateStruggleCount(outcomes: ChallengeAttemptRecord[]): number {
    return outcomes.filter((o) => o.outcome.attemptNumber >= STRUGGLE_ATTEMPT_THRESHOLD).length;
  }

  private determineZone(successRate: number): FlowZone {
    if (successRate > BOREDOM_THRESHOLD) return 'boredom';
    if (successRate < ANXIETY_THRESHOLD) return 'anxiety';
    return 'flow';
  }

  private createScaffold(type: ScaffoldType, profileId: string, challengeId: string): ScaffoldAction {
    const key = `${profileId}:${challengeId}`;
    const challengeInfo = this.challengeRegistry.get(challengeId);

    if (type === 'observe') {
      const idx = (this.challengeAttemptCounts.get(key) ?? 0) % OBSERVE_MESSAGES.length;
      return {
        type: 'observe',
        message: OBSERVE_MESSAGES[idx],
      };
    }

    if (type === 'alternative') {
      const idx = (this.challengeAttemptCounts.get(key) ?? 0) % ALTERNATIVE_MESSAGES.length;
      return {
        type: 'alternative',
        message: ALTERNATIVE_MESSAGES[idx],
      };
    }

    // Redirect: find a prerequisite gap
    if (challengeInfo) {
      const prereqs = SKILL_PREREQUISITES[challengeInfo.skill];
      if (prereqs && prereqs.length > 0) {
        // Find weakest prerequisite based on player mastery
        const levels = this.masteryLevels.get(profileId);
        let targetSkill = prereqs[0]!;
        if (levels) {
          let weakestLevel = levels.get(prereqs[0]!) ?? 0;
          for (const prereq of prereqs) {
            const level = levels.get(prereq) ?? 0;
            if (level < weakestLevel) {
              weakestLevel = level;
              targetSkill = prereq;
            }
          }
        }
        const targetBiome = SKILL_BIOME_MAP[targetSkill] ?? 'workshop';
        const biomeDisplay = this.formatBiomeName(targetBiome);
        const messageTemplate = REDIRECT_MESSAGES[
          (this.challengeAttemptCounts.get(key) ?? 0) % REDIRECT_MESSAGES.length
        ] ?? REDIRECT_MESSAGES[0]!;

        return {
          type: 'redirect',
          message: messageTemplate.replace('{biome}', biomeDisplay),
          targetSkill,
          targetBiome,
        };
      }
    }

    // Fallback redirect without specific prerequisite
    return {
      type: 'redirect',
      message: "Let's go explore somewhere new — I bet we'll find something cool!",
    };
  }

  private findStruggledChallenges(profileId: string): string[] {
    const history = this.attemptHistory.get(profileId) ?? [];
    const challengeAttempts = new Map<string, number>();

    for (const record of history) {
      const current = challengeAttempts.get(record.challengeId) ?? 0;
      challengeAttempts.set(record.challengeId, current + 1);
    }

    return Array.from(challengeAttempts.entries())
      .filter(([_, count]) => count >= STRUGGLE_ATTEMPT_THRESHOLD)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);
  }

  private formatBiomeName(biomeId: string): string {
    const names: Record<string, string> = {
      'workshop': 'the Workshop',
      'alchemist-lab': 'the Alchemist\'s Lab',
      'crystal-caverns': 'the Crystal Caverns',
      'living-forest': 'the Living Forest',
      'library-echoes': 'the Library of Echoes',
    };
    return names[biomeId] ?? biomeId;
  }

  /** Simple seeded random for deterministic companion message selection */
  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 1000) / 1000;
  }
}
