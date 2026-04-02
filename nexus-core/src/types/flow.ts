// Flow engine types — dynamic difficulty adjustment and struggle detection

/** Outcome of a single attempt on a challenge */
export interface AttemptOutcome {
  success: boolean;
  /** Some parts of a multi-step challenge were correct */
  partial: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attemptNumber: number;
}

/** Current flow state for a player */
export interface FlowState {
  zone: FlowZone;
  /** Rolling success rate over recent interactions */
  successRate: number;
  /** Average attempts per challenge recently */
  averageAttempts: number;
  /** Consecutive successes */
  currentStreak: number;
  /** Number of challenges with 5+ attempts in recent window */
  struggleCount: number;
}

export type FlowZone = 'boredom' | 'flow' | 'anxiety';

/** Scaffold intervention when a player is struggling */
export interface ScaffoldAction {
  type: ScaffoldType;
  /** Companion dialogue (in-character, never judgmental) */
  message?: string;
  /** Skill to redirect toward */
  targetSkill?: string;
  /** Biome to redirect toward */
  targetBiome?: string;
}

export type ScaffoldType = 'observe' | 'hint' | 'alternative' | 'redirect' | 'widen_tolerance';

/** Suggestion to redirect the player to address a prerequisite gap */
export interface Redirection {
  fromSkill: string;
  /** The prerequisite that's weak */
  gapSkill: string;
  /** Where to go practice it */
  targetBiome: string;
  /** In-character companion suggestion */
  companionMessage: string;
}

/** Internal record of one challenge attempt stored by the flow engine */
export interface ChallengeAttemptRecord {
  profileId: string;
  challengeId: string;
  outcome: AttemptOutcome;
  timestamp: number;
  mechanic?: string;
  skill?: string;
}

/** Configuration for challenge metadata the flow engine needs */
export interface ChallengeInfo {
  id: string;
  skill: string;
  mechanic: string;
  biome: string;
}
