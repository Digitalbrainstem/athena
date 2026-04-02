// Focus mode types for directed learning sessions
// Three entry points: companion request, parent/teacher setting, Study Forge biome

/** How a focus session was initiated. */
export type FocusSource = 'companion' | 'parent' | 'teacher' | 'study_forge';

/** How aggressively quests are biased toward focus skills. */
export type FocusIntensity = 'subtle' | 'moderate' | 'intensive';

/** Player-initiated focus request through the companion. */
export interface CompanionFocusRequest {
  readonly naturalLanguage: string;
  readonly parsedSkills: string[];
  readonly intensity?: FocusIntensity;
  readonly durationQuests?: number;
}

/** Parent/teacher-initiated focus setting. */
export interface ParentFocusRequest {
  readonly skills: string[];
  readonly intensity: FocusIntensity;
  readonly source: 'parent' | 'teacher';
  readonly durationQuests?: number;
  readonly reason?: string;
}

/** Active focus session tracking state. */
export interface FocusSession {
  readonly id: string;
  readonly profileId: string;
  readonly source: FocusSource;
  readonly skills: string[];
  readonly intensity: FocusIntensity;
  readonly durationQuests: number | null;
  readonly questsCompleted: number;
  readonly skillProgress: Record<string, number>;
  readonly createdAt: number;
  readonly active: boolean;
}

/** Skill weight entry used by the quest engine for biased selection. */
export interface SkillWeight {
  readonly skillId: string;
  readonly weight: number;
  readonly source: FocusSource | 'default';
}

/** Weight multipliers by intensity level. */
export const INTENSITY_WEIGHTS: Readonly<Record<FocusIntensity, number>> = {
  subtle: 1.5,
  moderate: 3.0,
  intensive: 8.0,
};

/** Default weight for non-focus skills. */
export const DEFAULT_SKILL_WEIGHT = 1.0;

/** Maximum number of simultaneous focus skills. */
export const MAX_FOCUS_SKILLS = 10;

/** Validate a focus request. */
export function validateFocusRequest(
  skills: string[],
  intensity: FocusIntensity,
  durationQuests?: number,
): string[] {
  const errors: string[] = [];

  if (skills.length === 0) {
    errors.push('At least one focus skill is required');
  }

  if (skills.length > MAX_FOCUS_SKILLS) {
    errors.push(`Maximum ${MAX_FOCUS_SKILLS} focus skills allowed`);
  }

  const validIntensities: FocusIntensity[] = ['subtle', 'moderate', 'intensive'];
  if (!validIntensities.includes(intensity)) {
    errors.push('Intensity must be subtle, moderate, or intensive');
  }

  if (durationQuests !== undefined && durationQuests < 1) {
    errors.push('Duration must be at least 1 quest');
  }

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill)) {
      errors.push(`Duplicate skill: ${skill}`);
    }
    seen.add(skill);
  }

  return errors;
}
