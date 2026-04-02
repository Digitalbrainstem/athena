// Calibration system types — adaptive new-player assessment

import type { MasteryTier } from './components.js';

/** Active calibration session */
export interface CalibrationSession {
  id: string;
  profileId: string;
  /** Subjects being probed */
  subjects: CalibrationSubject[];
  currentSubject: CalibrationSubject;
  /** Binary search position within current subject (0.0–1.0 normalized) */
  currentLevel: number;
  /** Total interactions so far */
  interactions: number;
  /** Maximum interactions before forced completion */
  maxInteractions: number;
  /** Estimated age used to seed starting levels */
  estimatedAge: number;
  /** Per-subject state tracking */
  subjectStates: Map<CalibrationSubject, SubjectCalibrationState>;
  /** Timestamp when calibration started */
  startedAt: number;
  /** Whether the session is complete */
  completed: boolean;
}

/** Per-subject binary search state */
export interface SubjectCalibrationState {
  subject: CalibrationSubject;
  /** Current estimated level (0.0–1.0) */
  level: number;
  /** Step size for binary search jumps */
  stepSize: number;
  /** Number of interactions completed for this subject */
  interactions: number;
  /** Maximum interactions per subject */
  maxInteractions: number;
  /** Whether this subject's calibration is done */
  done: boolean;
  /** History of responses for convergence */
  history: CalibrationResponse[];
}

/** Response to a calibration probe */
export interface CalibrationResponse {
  correct: boolean;
  responseTimeMs: number;
  attemptCount: number;
}

/** What to present next in calibration */
export interface CalibrationNext {
  done: boolean;
  nextSubject?: CalibrationSubject;
  nextLevel?: number;
  nextChallenge?: string;
  /** In-character companion dialogue to keep it feeling like play */
  companionDialogue: string;
}

/** Results from a completed calibration */
export interface CalibrationResults {
  /** Skill → estimated level (0.0–1.0) */
  skillLevels: Map<CalibrationSubject, number>;
  detectedTier: MasteryTier;
  /** Early interest signals based on response time and engagement */
  interests: string[];
  /** How long calibration took in milliseconds */
  estimatedDuration: number;
}

/** Subjects assessed during calibration */
export type CalibrationSubject =
  | 'math'
  | 'reading'
  | 'science'
  | 'logic'
  | 'spatial'
  | 'vocabulary';

/** All calibration subjects */
export const ALL_CALIBRATION_SUBJECTS: readonly CalibrationSubject[] = [
  'math',
  'reading',
  'science',
  'logic',
  'spatial',
  'vocabulary',
] as const;

/** Difficulty levels per subject for calibration probes */
export interface CalibrationLevelDefinition {
  level: number;
  description: string;
  challengeId: string;
  /** Approximate age range this level targets */
  ageRange: [number, number];
}

/** Age-to-starting-level mapping */
export interface AgeStartingLevel {
  minAge: number;
  maxAge: number;
  startingLevel: number;
}
