// Screen time types for parental control and break reminders
// See docs/20-SCREEN_TIME_SAFETY.md for design philosophy

import type { MasteryTier } from './components.js';

/** Action to take when a break reminder is due. */
export interface BreakAction {
  readonly type: 'gentle_reminder' | 'firm_pause';
  readonly companionMessage: string;
  readonly minutesPlayed: number;
  readonly suggestedActivity?: string;
}

/** Action to take when approaching or hitting time limits. */
export interface LimitAction {
  readonly type: 'approaching_limit' | 'limit_reached' | 'outside_hours';
  readonly companionMessage: string;
  readonly minutesRemaining: number;
}

/** Statistics for the current play session. */
export interface SessionStats {
  readonly profileId: string;
  readonly sessionStart: number;
  readonly minutesPlayed: number;
  readonly breaksTaken: number;
  readonly dailyMinutesPlayed: number;
  readonly isActive: boolean;
}

/** Per-profile screen time configuration set by a parent. */
export interface ScreenTimeConfig {
  readonly sessionLimitMinutes: number | null;
  readonly dailyLimitMinutes: number | null;
  readonly allowedHoursStart: number | null;
  readonly allowedHoursEnd: number | null;
  readonly breakIntervalMinutes: number;
  readonly breakEnforcement: 'gentle' | 'firm';
  readonly firmPauseDurationMinutes: number;
}

/** Tracked state for a single play session. */
export interface SessionState {
  readonly profileId: string;
  readonly startTime: number;
  readonly breaksTaken: number;
  readonly lastBreakTime: number;
  readonly pausedUntil: number | null;
  readonly dailyAccumulatedMinutes: number;
  readonly dailyResetDate: string;
}

/** Default break intervals by mastery tier (from doc 20). */
export const DEFAULT_BREAK_INTERVALS: Readonly<Record<MasteryTier, number>> = {
  foundation: 15,
  discovery: 30,
  builder: 45,
  innovator: 60,
  creator: 90,
};

/** Default screen time config — unlimited with age-appropriate breaks. */
export function defaultScreenTimeConfig(tier: MasteryTier): ScreenTimeConfig {
  return {
    sessionLimitMinutes: null,
    dailyLimitMinutes: null,
    allowedHoursStart: null,
    allowedHoursEnd: null,
    breakIntervalMinutes: DEFAULT_BREAK_INTERVALS[tier],
    breakEnforcement: 'gentle',
    firmPauseDurationMinutes: 5,
  };
}

/** Validate that a screen time config has sensible values. */
export function validateScreenTimeConfig(config: ScreenTimeConfig): string[] {
  const errors: string[] = [];

  if (config.sessionLimitMinutes !== null) {
    if (config.sessionLimitMinutes < 15 || config.sessionLimitMinutes > 240) {
      errors.push('Session limit must be between 15 and 240 minutes (or null for unlimited)');
    }
  }

  if (config.dailyLimitMinutes !== null) {
    if (config.dailyLimitMinutes < 30 || config.dailyLimitMinutes > 480) {
      errors.push('Daily limit must be between 30 and 480 minutes (or null for unlimited)');
    }
  }

  if (config.allowedHoursStart !== null && config.allowedHoursEnd !== null) {
    if (config.allowedHoursStart < 0 || config.allowedHoursStart > 23) {
      errors.push('Allowed hours start must be between 0 and 23');
    }
    if (config.allowedHoursEnd < 0 || config.allowedHoursEnd > 23) {
      errors.push('Allowed hours end must be between 0 and 23');
    }
  } else if (
    (config.allowedHoursStart === null) !== (config.allowedHoursEnd === null)
  ) {
    errors.push('Both allowedHoursStart and allowedHoursEnd must be set, or both null');
  }

  if (config.breakIntervalMinutes < 10 || config.breakIntervalMinutes > 90) {
    errors.push('Break interval must be between 10 and 90 minutes');
  }

  if (config.firmPauseDurationMinutes < 1 || config.firmPauseDurationMinutes > 15) {
    errors.push('Firm pause duration must be between 1 and 15 minutes');
  }

  return errors;
}
