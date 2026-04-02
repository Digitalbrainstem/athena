// Calibration System — Adaptive new-player assessment disguised as gameplay
//
// Uses a binary search algorithm inspired by Item Response Theory to quickly
// estimate a new player's skill levels across multiple subjects. The entire
// process feels like an adventure, not a test — the companion guides the
// player through natural-feeling challenges while the system converges on
// their actual skill levels.
//
// Principles enforced:
// - Principle 0: Learning through play, never through testing
// - Principle I: No punishment, gentle failure
// - Principle VI: No judgment ("Good job!" is never said)
// - Principle VII: Game adapts to the player
// - Principle VIII: Mastery over speed — no rushing

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { MasteryTier } from '../types/components.js';
import type {
  CalibrationSession,
  CalibrationResponse,
  CalibrationNext,
  CalibrationResults,
  CalibrationSubject,
  SubjectCalibrationState,
} from '../types/calibration.js';
import { ALL_CALIBRATION_SUBJECTS } from '../types/calibration.js';

// --- Constants ---

/** Default max interactions for entire calibration */
const DEFAULT_MAX_INTERACTIONS = 30;

/** Default max interactions per subject */
const DEFAULT_MAX_PER_SUBJECT = 5;

/** Min interactions per subject before it can be marked done */
const MIN_PER_SUBJECT = 3;

/** Response time thresholds for binary search jumps (milliseconds) */
const FAST_RESPONSE_MS = 3000;
const SLOW_RESPONSE_MS = 10000;

/** Level bounds */
const MIN_LEVEL = 0.0;
const MAX_LEVEL = 1.0;

/** Initial step size for binary search */
const INITIAL_STEP_SIZE = 0.2;

/** Minimum step size before convergence */
const MIN_STEP_SIZE = 0.03;

/** Step size reduction factor after each interaction */
const STEP_DECAY = 0.65;

// --- Age to starting level mapping ---

interface AgeMapping {
  minAge: number;
  maxAge: number;
  level: number;
  tier: MasteryTier;
}

const AGE_LEVEL_MAP: readonly AgeMapping[] = [
  { minAge: 2, maxAge: 3, level: 0.05, tier: 'foundation' },
  { minAge: 4, maxAge: 5, level: 0.15, tier: 'foundation' },
  { minAge: 6, maxAge: 8, level: 0.30, tier: 'discovery' },
  { minAge: 9, maxAge: 10, level: 0.40, tier: 'discovery' },
  { minAge: 11, maxAge: 13, level: 0.55, tier: 'builder' },
  { minAge: 14, maxAge: 16, level: 0.70, tier: 'builder' },
  { minAge: 17, maxAge: 18, level: 0.80, tier: 'innovator' },
  { minAge: 19, maxAge: 24, level: 0.90, tier: 'innovator' },
  { minAge: 25, maxAge: 999, level: 0.90, tier: 'creator' },
];

// --- Calibration challenge definitions per subject/level ---
// Each subject has challenges mapped to normalized levels (0.0–1.0)

const CALIBRATION_CHALLENGES: Record<CalibrationSubject, CalibrationLevel[]> = {
  math: [
    { level: 0.0, id: 'cal-math-counting', desc: 'counting' },
    { level: 0.15, id: 'cal-math-number-sense', desc: 'number sense' },
    { level: 0.30, id: 'cal-math-arithmetic', desc: 'arithmetic' },
    { level: 0.45, id: 'cal-math-fractions', desc: 'fractions' },
    { level: 0.55, id: 'cal-math-pre-algebra', desc: 'pre-algebra' },
    { level: 0.65, id: 'cal-math-algebra', desc: 'algebra' },
    { level: 0.75, id: 'cal-math-geometry', desc: 'geometry' },
    { level: 0.85, id: 'cal-math-trigonometry', desc: 'trigonometry' },
    { level: 1.0, id: 'cal-math-calculus', desc: 'calculus' },
  ],
  reading: [
    { level: 0.0, id: 'cal-read-letters', desc: 'letters' },
    { level: 0.15, id: 'cal-read-phonics', desc: 'phonics' },
    { level: 0.30, id: 'cal-read-words', desc: 'words' },
    { level: 0.45, id: 'cal-read-sentences', desc: 'sentences' },
    { level: 0.60, id: 'cal-read-paragraphs', desc: 'paragraphs' },
    { level: 0.75, id: 'cal-read-comprehension', desc: 'comprehension' },
    { level: 0.90, id: 'cal-read-analysis', desc: 'analysis' },
    { level: 1.0, id: 'cal-read-critical', desc: 'critical reading' },
  ],
  science: [
    { level: 0.0, id: 'cal-sci-observation', desc: 'observation' },
    { level: 0.2, id: 'cal-sci-classification', desc: 'classification' },
    { level: 0.35, id: 'cal-sci-cause-effect', desc: 'cause and effect' },
    { level: 0.50, id: 'cal-sci-hypothesis', desc: 'hypothesis' },
    { level: 0.65, id: 'cal-sci-experimentation', desc: 'experimentation' },
    { level: 0.80, id: 'cal-sci-analysis', desc: 'scientific analysis' },
    { level: 1.0, id: 'cal-sci-synthesis', desc: 'scientific synthesis' },
  ],
  logic: [
    { level: 0.0, id: 'cal-logic-patterns', desc: 'patterns' },
    { level: 0.2, id: 'cal-logic-sequences', desc: 'sequences' },
    { level: 0.4, id: 'cal-logic-categories', desc: 'categorization' },
    { level: 0.55, id: 'cal-logic-deduction', desc: 'deduction' },
    { level: 0.70, id: 'cal-logic-inference', desc: 'inference' },
    { level: 0.85, id: 'cal-logic-formal', desc: 'formal logic' },
    { level: 1.0, id: 'cal-logic-proof', desc: 'proof construction' },
  ],
  spatial: [
    { level: 0.0, id: 'cal-spatial-shapes', desc: 'shapes' },
    { level: 0.2, id: 'cal-spatial-directions', desc: 'directions' },
    { level: 0.35, id: 'cal-spatial-rotation', desc: 'rotation' },
    { level: 0.5, id: 'cal-spatial-3d', desc: '3D visualization' },
    { level: 0.65, id: 'cal-spatial-coordinates', desc: 'coordinate systems' },
    { level: 0.80, id: 'cal-spatial-transformation', desc: 'transformations' },
    { level: 1.0, id: 'cal-spatial-topology', desc: 'topology' },
  ],
  vocabulary: [
    { level: 0.0, id: 'cal-vocab-basic', desc: 'basic words' },
    { level: 0.15, id: 'cal-vocab-everyday', desc: 'everyday words' },
    { level: 0.30, id: 'cal-vocab-contextual', desc: 'contextual vocabulary' },
    { level: 0.50, id: 'cal-vocab-descriptive', desc: 'descriptive vocabulary' },
    { level: 0.65, id: 'cal-vocab-academic', desc: 'academic vocabulary' },
    { level: 0.80, id: 'cal-vocab-technical', desc: 'technical vocabulary' },
    { level: 1.0, id: 'cal-vocab-specialized', desc: 'specialized vocabulary' },
  ],
};

interface CalibrationLevel {
  level: number;
  id: string;
  desc: string;
}

// --- Companion dialogue (never judgmental, never says "good job") ---

const INTRO_DIALOGUES: readonly string[] = [
  "Welcome to the Nexus! I'm so excited to explore with you! Let's see what's around here...",
  "Hey there! I just woke up and this place is AMAZING! Want to look around together?",
  "Ooh, a new friend! I'm Spark! This world is full of puzzles and secrets — let's go!",
];

const TRANSITION_DIALOGUES: Record<CalibrationSubject, readonly string[]> = {
  math: [
    "Ooh, a puzzle door! I wonder what opens it...",
    "Look at these number crystals! I wonder what they do?",
    "There's some kind of counting mechanism on this wall!",
  ],
  reading: [
    "Ooh, there's writing on this old stone! Can you make it out?",
    "Look — a scroll! I wonder what it says...",
    "The walls are covered in strange symbols!",
  ],
  science: [
    "Whoa, look at that plant! Something interesting is happening...",
    "I see something glowing over there! Let's investigate!",
    "This place is full of living things — I wonder how they work?",
  ],
  logic: [
    "There's a pattern in these tiles! I wonder what comes next...",
    "This door has a tricky lock — it looks like a puzzle!",
    "Ooh, a riddle carved into the wall!",
  ],
  spatial: [
    "Look at these shapes floating in the air! So cool!",
    "There's a maze ahead! I wonder where it goes...",
    "These crystals form some kind of pattern in space!",
  ],
  vocabulary: [
    "There's a sign here with a big word! I wonder what it means...",
    "The books are whispering! Let's listen to what they say...",
    "Look, a message bottle! I wonder what word is inside...",
  ],
};

const BETWEEN_DIALOGUES: readonly string[] = [
  "Ooh, what's over here?",
  "I see something interesting ahead!",
  "Let's keep exploring!",
  "There's more to discover this way!",
  "I wonder what we'll find next...",
];

const COMPLETION_DIALOGUES: readonly string[] = [
  "We explored so much! This world is amazing — I can't wait to see more!",
  "What an adventure! There's a whole world out there waiting for us!",
  "That was so fun! I already see more places we can explore together!",
];

// --- Session ID counter ---
let nextSessionId = 1;

/**
 * Calibration System — Adaptive assessment disguised as a first play session.
 *
 * Binary search algorithm:
 * - Starts at age-expected level for each subject
 * - Correct + fast (<3s): jump up 2 steps
 * - Correct + slow (3–10s): jump up 1 step
 * - Incorrect: drop 1 step
 * - No attempt (>10s): skip subject, try later
 * - 3–5 interactions per subject → ±1 level accuracy
 * - Total: 20–30 interactions covering 6 subjects in 15–30 minutes
 */
export class CalibrationSystem implements System {
  readonly name = 'calibration';
  readonly priority = 3;

  /** Active calibration sessions (sessionId → session) */
  private readonly sessions = new Map<string, CalibrationSession>();

  // --- ECS System interface ---

  update(_world: World, _dt: number): void {
    // Calibration is event-driven; no per-frame work needed
  }

  // --- Public API ---

  /**
   * Start a calibration session for a new profile.
   * The estimated age seeds the binary search starting point.
   */
  startCalibration(profileId: string, estimatedAge: number): CalibrationSession {
    const id = `cal-${profileId}-${nextSessionId++}`;
    const startingLevel = this.getStartingLevel(estimatedAge);
    const subjects = [...ALL_CALIBRATION_SUBJECTS];

    const subjectStates = new Map<CalibrationSubject, SubjectCalibrationState>();
    for (const subject of subjects) {
      subjectStates.set(subject, {
        subject,
        level: startingLevel,
        stepSize: INITIAL_STEP_SIZE,
        interactions: 0,
        maxInteractions: DEFAULT_MAX_PER_SUBJECT,
        done: false,
        history: [],
      });
    }

    const session: CalibrationSession = {
      id,
      profileId,
      subjects,
      currentSubject: subjects[0]!,
      currentLevel: startingLevel,
      interactions: 0,
      maxInteractions: DEFAULT_MAX_INTERACTIONS,
      estimatedAge,
      subjectStates,
      startedAt: Date.now(),
      completed: false,
    };

    this.sessions.set(id, session);
    return session;
  }

  /**
   * Process a calibration response and determine what to present next.
   * Implements the binary search with response-time-aware jumps.
   */
  processResponse(sessionId: string, response: CalibrationResponse): CalibrationNext {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        done: true,
        companionDialogue: COMPLETION_DIALOGUES[0]!,
      };
    }

    if (session.completed) {
      return {
        done: true,
        companionDialogue: this.pickDialogue(COMPLETION_DIALOGUES, session.interactions),
      };
    }

    const subjectState = session.subjectStates.get(session.currentSubject);
    if (!subjectState) {
      return {
        done: true,
        companionDialogue: COMPLETION_DIALOGUES[0]!,
      };
    }

    // Record the response
    subjectState.history.push(response);
    subjectState.interactions++;
    session.interactions++;

    // --- Binary search adjustment ---
    if (response.responseTimeMs > SLOW_RESPONSE_MS && !response.correct) {
      // No real attempt — skip this subject for now
      subjectState.done = true;
    } else if (response.correct) {
      if (response.responseTimeMs < FAST_RESPONSE_MS) {
        // Fast correct: jump up 2 steps
        subjectState.level = clamp(subjectState.level + subjectState.stepSize * 2);
      } else {
        // Slow correct: jump up 1 step
        subjectState.level = clamp(subjectState.level + subjectState.stepSize);
      }
    } else {
      // Incorrect: drop 1 step
      subjectState.level = clamp(subjectState.level - subjectState.stepSize);
    }

    // Decay step size for convergence
    subjectState.stepSize = Math.max(MIN_STEP_SIZE, subjectState.stepSize * STEP_DECAY);

    // Check if this subject is done
    if (subjectState.interactions >= subjectState.maxInteractions) {
      subjectState.done = true;
    }
    if (subjectState.interactions >= MIN_PER_SUBJECT && subjectState.stepSize <= MIN_STEP_SIZE) {
      subjectState.done = true;
    }

    // Update session current level
    session.currentLevel = subjectState.level;

    // Find next subject
    const nextSubjectResult = this.findNextSubject(session);

    if (!nextSubjectResult || session.interactions >= session.maxInteractions) {
      // Calibration complete
      session.completed = true;
      return {
        done: true,
        companionDialogue: this.pickDialogue(COMPLETION_DIALOGUES, session.interactions),
      };
    }

    session.currentSubject = nextSubjectResult;
    session.currentLevel = session.subjectStates.get(nextSubjectResult)!.level;

    const nextChallenge = this.findChallengeForLevel(nextSubjectResult, session.currentLevel);
    const dialogue = this.generateTransitionDialogue(session, nextSubjectResult);

    return {
      done: false,
      nextSubject: nextSubjectResult,
      nextLevel: session.currentLevel,
      nextChallenge,
      companionDialogue: dialogue,
    };
  }

  /**
   * Check if a calibration session is complete.
   */
  isComplete(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;
    return session.completed;
  }

  /**
   * Get calibration results. Returns estimated skill levels and detected tier.
   */
  getResults(sessionId: string): CalibrationResults {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        skillLevels: new Map(),
        detectedTier: 'foundation',
        interests: [],
        estimatedDuration: 0,
      };
    }

    const skillLevels = new Map<CalibrationSubject, number>();
    const interestScores: { subject: CalibrationSubject; score: number }[] = [];

    for (const [subject, state] of session.subjectStates) {
      const level = Math.round(state.level * 1000) / 1000;
      skillLevels.set(subject, level);

      // Interest signal: subjects with fast response times indicate engagement
      if (state.history.length > 0) {
        const avgResponseTime = state.history.reduce(
          (sum, r) => sum + r.responseTimeMs, 0,
        ) / state.history.length;
        const correctRate = state.history.filter((r) => r.correct).length / state.history.length;
        // Higher interest = fast responses + good accuracy
        const interestScore = correctRate / (1 + avgResponseTime / 5000);
        interestScores.push({ subject, score: interestScore });
      }
    }

    // Top 2 interests
    interestScores.sort((a, b) => b.score - a.score);
    const interests = interestScores
      .slice(0, 2)
      .filter((s) => s.score > 0)
      .map((s) => s.subject);

    // Detected tier: based on average level across subjects
    const levels = Array.from(skillLevels.values());
    const avgLevel = levels.length > 0
      ? levels.reduce((sum, l) => sum + l, 0) / levels.length
      : 0;
    const detectedTier = this.levelToTier(avgLevel);

    const estimatedDuration = Date.now() - session.startedAt;

    return {
      skillLevels,
      detectedTier,
      interests,
      estimatedDuration,
    };
  }

  /**
   * Get the first challenge to present for a new calibration session.
   */
  getFirstChallenge(sessionId: string): CalibrationNext {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { done: true, companionDialogue: COMPLETION_DIALOGUES[0]! };
    }

    const subject = session.currentSubject;
    const challenge = this.findChallengeForLevel(subject, session.currentLevel);
    const intro = this.pickDialogue(INTRO_DIALOGUES, 0);
    const subjectDialogue = this.pickDialogue(
      TRANSITION_DIALOGUES[subject],
      session.interactions,
    );

    return {
      done: false,
      nextSubject: subject,
      nextLevel: session.currentLevel,
      nextChallenge: challenge,
      companionDialogue: `${intro} ${subjectDialogue}`,
    };
  }

  /**
   * Get a session by ID (for inspection/testing).
   */
  getSession(sessionId: string): CalibrationSession | undefined {
    return this.sessions.get(sessionId);
  }

  // --- Private helpers ---

  private getStartingLevel(age: number): number {
    for (const mapping of AGE_LEVEL_MAP) {
      if (age >= mapping.minAge && age <= mapping.maxAge) {
        return mapping.level;
      }
    }
    // Default: very young child
    return 0.05;
  }

  /**
   * Find the next subject to probe. Cycles through incomplete subjects
   * in round-robin order to keep the experience varied.
   */
  private findNextSubject(session: CalibrationSession): CalibrationSubject | null {
    const currentIdx = session.subjects.indexOf(session.currentSubject);
    const count = session.subjects.length;

    // Round-robin: try subjects after current, then wrap around
    for (let offset = 1; offset <= count; offset++) {
      const idx = (currentIdx + offset) % count;
      const subject = session.subjects[idx]!;
      const state = session.subjectStates.get(subject);
      if (state && !state.done) {
        return subject;
      }
    }

    return null; // All subjects done
  }

  /**
   * Find the closest calibration challenge for a given subject and level.
   */
  private findChallengeForLevel(subject: CalibrationSubject, level: number): string {
    const challenges = CALIBRATION_CHALLENGES[subject];
    if (challenges.length === 0) return `cal-${subject}-default`;

    // Find the challenge closest to the current level
    let closest = challenges[0]!;
    let closestDist = Math.abs(closest.level - level);

    for (const challenge of challenges) {
      const dist = Math.abs(challenge.level - level);
      if (dist < closestDist) {
        closest = challenge;
        closestDist = dist;
      }
    }

    return closest.id;
  }

  /**
   * Generate transition dialogue between subjects.
   * Never says "good job" or implies judgment.
   */
  private generateTransitionDialogue(
    session: CalibrationSession,
    nextSubject: CalibrationSubject,
  ): string {
    const prevSubject = session.currentSubject;

    if (prevSubject === nextSubject) {
      return this.pickDialogue(BETWEEN_DIALOGUES, session.interactions);
    }

    const subjectDialogues = TRANSITION_DIALOGUES[nextSubject];
    const between = this.pickDialogue(BETWEEN_DIALOGUES, session.interactions);
    const subjectLine = this.pickDialogue(subjectDialogues, session.interactions + 1);

    return `${between} ${subjectLine}`;
  }

  private pickDialogue(dialogues: readonly string[], seed: number): string {
    if (dialogues.length === 0) return '';
    return dialogues[seed % dialogues.length]!;
  }

  private levelToTier(level: number): MasteryTier {
    if (level < 0.20) return 'foundation';
    if (level < 0.45) return 'discovery';
    if (level < 0.65) return 'builder';
    if (level < 0.85) return 'innovator';
    return 'creator';
  }
}

/** Clamp a value to [MIN_LEVEL, MAX_LEVEL] */
function clamp(value: number): number {
  return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, value));
}
