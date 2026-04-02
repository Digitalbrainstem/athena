// Screen Time Enforcement System
// Implements gentle, in-character break reminders and parental time limits.
// NEVER punitive. NEVER removes progress. NEVER makes the player feel bad.
// See docs/20-SCREEN_TIME_SAFETY.md

import type { MasteryTier } from '../types/components.js';
import type {
  BreakAction,
  LimitAction,
  ScreenTimeConfig,
  SessionState,
  SessionStats,
} from '../types/screen-time.js';
import { defaultScreenTimeConfig, validateScreenTimeConfig } from '../types/screen-time.js';

// ─── Companion Break Messages ───────────────────────────────────────────────
// In-character, warm, never punitive. Grouped by tier and occasion.

interface MessagePool {
  readonly gentle: readonly string[];
  readonly firm: readonly string[];
  readonly activities: readonly string[];
}

const FOUNDATION_MESSAGES: MessagePool = {
  gentle: [
    "Wow, we've been playing for a while! Want to take a water break? I'm thirsty!",
    "My wings are tired from all that flying! Let's rest for a bit. Maybe stretch?",
    "You know what would feel great? Standing up and wiggling around!",
    "I just saw a butterfly outside! Want to go look out the window with me?",
    "Let's take a little break — I want to hear about your favorite animal!",
    "Time for a wiggle break! Can you touch your toes? I'll count to ten!",
  ],
  firm: [
    "We've had such a great adventure! Let's take a little rest. I'll save everything right here!",
    "Break time! Let's do some jumping jacks together. I'll be right here when we're done!",
    "Let's pause our adventure and stretch! Can you reach up high like a tree?",
  ],
  activities: [
    'Do 10 jumping jacks!',
    'Touch your toes 5 times!',
    'Spin around 3 times!',
    'Stretch up as high as you can!',
    'Do your best animal impression!',
    'Give someone a high five!',
  ],
};

const DISCOVERY_MESSAGES: MessagePool = {
  gentle: [
    "Hey, we've been adventuring for a while! Want to take a stretch break?",
    "The Nexus will be here when you get back. Go get some water!",
    "I could use a rest. How about we take five?",
    "Want to take a quick break? Maybe grab a snack?",
    "We've been exploring non-stop! Let's catch our breath.",
    "My compass is getting dizzy! Let's pause and stretch.",
  ],
  firm: [
    "What an adventure! Let's take a breather. Everything is saved right here!",
    "Break time — let's recharge! Stretch, grab water, and we'll pick right back up!",
    "Let's rest up so we can tackle the next challenge at full energy!",
  ],
  activities: [
    'Get a glass of water!',
    'Do 15 jumping jacks!',
    'Run in place for 30 seconds!',
    'Stretch your arms above your head!',
    'Look out the window and count 5 things you see!',
  ],
};

const BUILDER_MESSAGES: MessagePool = {
  gentle: [
    "We've been at this for a while. Your eyes could probably use a break!",
    "Good time for a break? Stretch, hydrate, come back refreshed.",
    "The workshop will still be here. Take five!",
    "Even master builders take breaks. Stretch those hands!",
    "Been focused for a good stretch — want to step away for a bit?",
  ],
  firm: [
    "Solid session! Let's take a quick break to recharge. Everything's saved.",
    "Break time! A quick stretch will keep your mind sharp for the next challenge.",
    "Pausing for a few minutes — you'll come back with fresh eyes!",
  ],
  activities: [
    'Do some stretches!',
    'Get something to drink!',
    'Take a short walk!',
    'Look at something far away for 20 seconds!',
  ],
};

const INNOVATOR_MESSAGES: MessagePool = {
  gentle: [
    "Been a solid session. Break when you're ready.",
    "Reminder to hydrate and stretch!",
    "Good stopping point coming up — consider a break?",
    "Your brain works better with breaks. Just saying!",
  ],
  firm: [
    "Great work today! Taking a short break — everything is saved.",
    "Quick pause to recharge. Back in a few!",
  ],
  activities: [
    'Stretch and hydrate!',
    'Step outside for a minute!',
    'Rest your eyes — look at something distant!',
  ],
};

const CREATOR_MESSAGES: MessagePool = {
  gentle: [
    "Friendly reminder: breaks exist.",
    "Hydrate check!",
    "Still here? Take a stretch when you get a chance.",
  ],
  firm: [
    "Break time. Everything's saved. Back soon!",
    "Quick recharge break — you've earned it.",
  ],
  activities: [
    'Stretch!',
    'Hydrate!',
    'Step away for a few minutes!',
  ],
};

const MESSAGE_POOLS: Readonly<Record<MasteryTier, MessagePool>> = {
  foundation: FOUNDATION_MESSAGES,
  discovery: DISCOVERY_MESSAGES,
  builder: BUILDER_MESSAGES,
  innovator: INNOVATOR_MESSAGES,
  creator: CREATOR_MESSAGES,
};

// ─── Limit / Session-End Messages ───────────────────────────────────────────

const APPROACHING_LIMIT_MESSAGES: readonly string[] = [
  "We're getting close to the end of today's adventure time! Let's make these last minutes count.",
  "Just a heads up — we have a little more time left for today. Let's finish up what we're doing!",
  "Almost time to wrap up for today! Want to finish this one last thing?",
];

const LIMIT_REACHED_MESSAGES: readonly string[] = [
  "What a great adventure today! I'm saving everything right here. See you next time!",
  "We did so much today! Everything is saved. The Nexus will be here when you get back!",
  "Awesome session! I'll keep watch over everything while you're away. See you soon!",
];

const OUTSIDE_HOURS_MESSAGES: readonly string[] = [
  "The Nexus is resting right now! Come back during adventure hours — I'll be waiting!",
  "It's quiet time in the Nexus. We'll have more adventures soon!",
  "The Nexus will be open again soon! Rest up so we're ready for more exploring!",
];

// ─── Deterministic Message Selection ────────────────────────────────────────

function selectMessage(messages: readonly string[], seed: number): string {
  return messages[seed % messages.length]!;
}

// ─── Time Helpers ───────────────────────────────────────────────────────────

function getDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getHourOfDay(timestamp: number): number {
  return new Date(timestamp).getHours();
}

function minutesSince(start: number, now: number): number {
  return Math.max(0, (now - start) / 60_000);
}

// ─── Screen Time System ─────────────────────────────────────────────────────

export class ScreenTimeSystem {
  private sessions = new Map<string, SessionState>();
  private configs = new Map<string, ScreenTimeConfig>();
  private tiers = new Map<string, MasteryTier>();
  private nowFn: () => number;

  constructor(nowFn?: () => number) {
    this.nowFn = nowFn ?? (() => Date.now());
  }

  /** Set screen time config for a profile. Validates before applying. */
  setConfig(profileId: string, config: ScreenTimeConfig): string[] {
    const errors = validateScreenTimeConfig(config);
    if (errors.length === 0) {
      this.configs.set(profileId, config);
    }
    return errors;
  }

  /** Get current config for a profile, falling back to tier defaults. */
  getConfig(profileId: string): ScreenTimeConfig {
    return this.configs.get(profileId) ??
      defaultScreenTimeConfig(this.tiers.get(profileId) ?? 'discovery');
  }

  /** Set the mastery tier for a profile (used for default break intervals). */
  setTier(profileId: string, tier: MasteryTier): void {
    this.tiers.set(profileId, tier);
  }

  /** Start a new play session for a profile. */
  startSession(profileId: string): void {
    const now = this.nowFn();
    const today = getDateString(now);
    const existing = this.sessions.get(profileId);

    const dailyCarry = existing && existing.dailyResetDate === today
      ? existing.dailyAccumulatedMinutes +
        (existing.pausedUntil === null ? minutesSince(existing.startTime, now) : 0)
      : 0;

    this.sessions.set(profileId, {
      profileId,
      startTime: now,
      breaksTaken: 0,
      lastBreakTime: now,
      pausedUntil: null,
      dailyAccumulatedMinutes: dailyCarry,
      dailyResetDate: today,
    });
  }

  /** End the current session for a profile. */
  endSession(profileId: string): void {
    const session = this.sessions.get(profileId);
    if (!session) return;

    const now = this.nowFn();
    const today = getDateString(now);
    const played = minutesSince(session.startTime, now);

    // Preserve daily accumulation so it carries across sessions
    this.sessions.set(profileId, {
      ...session,
      startTime: now,
      dailyAccumulatedMinutes: session.dailyResetDate === today
        ? session.dailyAccumulatedMinutes + played
        : played,
      dailyResetDate: today,
      pausedUntil: null,
    });
    this.sessions.delete(profileId);
  }

  /** Record that the player took a break. */
  recordBreak(profileId: string): void {
    const session = this.sessions.get(profileId);
    if (!session) return;
    const now = this.nowFn();
    this.sessions.set(profileId, {
      ...session,
      breaksTaken: session.breaksTaken + 1,
      lastBreakTime: now,
      pausedUntil: null,
    });
  }

  /** Check if a break reminder should be shown. Returns null if not needed. */
  checkBreak(profileId: string): BreakAction | null {
    const session = this.sessions.get(profileId);
    if (!session) return null;

    const now = this.nowFn();

    // If currently paused (firm enforcement), check if pause is done
    if (session.pausedUntil !== null) {
      if (now < session.pausedUntil) {
        return null; // Still paused, don't stack reminders
      }
      // Pause expired, clear it
      this.sessions.set(profileId, { ...session, pausedUntil: null, lastBreakTime: now });
      return null;
    }

    const config = this.getConfig(profileId);
    const minutesSinceBreak = minutesSince(session.lastBreakTime, now);

    if (minutesSinceBreak < config.breakIntervalMinutes) {
      return null;
    }

    const tier = this.tiers.get(profileId) ?? 'discovery';
    const pool = MESSAGE_POOLS[tier];
    const totalMinutes = minutesSince(session.startTime, now);
    const seed = Math.floor(totalMinutes + session.breaksTaken);

    if (config.breakEnforcement === 'firm') {
      const pauseEnd = now + config.firmPauseDurationMinutes * 60_000;
      this.sessions.set(profileId, { ...session, pausedUntil: pauseEnd });

      return {
        type: 'firm_pause',
        companionMessage: selectMessage(pool.firm, seed),
        minutesPlayed: Math.round(totalMinutes),
        suggestedActivity: selectMessage(pool.activities, seed),
      };
    }

    return {
      type: 'gentle_reminder',
      companionMessage: selectMessage(pool.gentle, seed),
      minutesPlayed: Math.round(totalMinutes),
      suggestedActivity: selectMessage(pool.activities, seed),
    };
  }

  /** Check if the player is approaching or has exceeded time limits. */
  checkLimits(profileId: string): LimitAction | null {
    const session = this.sessions.get(profileId);
    if (!session) return null;

    const now = this.nowFn();
    const config = this.getConfig(profileId);

    // Outside allowed hours?
    if (config.allowedHoursStart !== null && config.allowedHoursEnd !== null) {
      const hour = getHourOfDay(now);
      const start = config.allowedHoursStart;
      const end = config.allowedHoursEnd;

      const outsideHours = start <= end
        ? (hour < start || hour >= end)
        : (hour >= end && hour < start); // overnight range like 22-6

      if (outsideHours) {
        const seed = Math.floor(now / 60_000);
        return {
          type: 'outside_hours',
          companionMessage: selectMessage(OUTSIDE_HOURS_MESSAGES, seed),
          minutesRemaining: 0,
        };
      }
    }

    const sessionMinutes = minutesSince(session.startTime, now);
    const today = getDateString(now);
    const dailyMinutes = session.dailyResetDate === today
      ? session.dailyAccumulatedMinutes + sessionMinutes
      : sessionMinutes;

    // Session limit check
    if (config.sessionLimitMinutes !== null) {
      const remaining = config.sessionLimitMinutes - sessionMinutes;
      if (remaining <= 0) {
        const seed = Math.floor(sessionMinutes);
        return {
          type: 'limit_reached',
          companionMessage: selectMessage(LIMIT_REACHED_MESSAGES, seed),
          minutesRemaining: 0,
        };
      }
      if (remaining <= 5) {
        const seed = Math.floor(sessionMinutes);
        return {
          type: 'approaching_limit',
          companionMessage: selectMessage(APPROACHING_LIMIT_MESSAGES, seed),
          minutesRemaining: Math.round(remaining),
        };
      }
    }

    // Daily limit check
    if (config.dailyLimitMinutes !== null) {
      const remaining = config.dailyLimitMinutes - dailyMinutes;
      if (remaining <= 0) {
        const seed = Math.floor(dailyMinutes);
        return {
          type: 'limit_reached',
          companionMessage: selectMessage(LIMIT_REACHED_MESSAGES, seed),
          minutesRemaining: 0,
        };
      }
      if (remaining <= 5) {
        const seed = Math.floor(dailyMinutes);
        return {
          type: 'approaching_limit',
          companionMessage: selectMessage(APPROACHING_LIMIT_MESSAGES, seed),
          minutesRemaining: Math.round(remaining),
        };
      }
    }

    return null;
  }

  /** Get stats for the current session. */
  getSessionStats(profileId: string): SessionStats {
    const session = this.sessions.get(profileId);

    if (!session) {
      return {
        profileId,
        sessionStart: 0,
        minutesPlayed: 0,
        breaksTaken: 0,
        dailyMinutesPlayed: 0,
        isActive: false,
      };
    }

    const now = this.nowFn();
    const sessionMinutes = minutesSince(session.startTime, now);
    const today = getDateString(now);
    const dailyMinutes = session.dailyResetDate === today
      ? session.dailyAccumulatedMinutes + sessionMinutes
      : sessionMinutes;

    return {
      profileId,
      sessionStart: session.startTime,
      minutesPlayed: Math.round(sessionMinutes),
      breaksTaken: session.breaksTaken,
      dailyMinutesPlayed: Math.round(dailyMinutes),
      isActive: session.pausedUntil === null || now >= session.pausedUntil,
    };
  }

  /** Check if a session is currently paused (firm break enforcement). */
  isPaused(profileId: string): boolean {
    const session = this.sessions.get(profileId);
    if (!session || session.pausedUntil === null) return false;
    return this.nowFn() < session.pausedUntil;
  }

  /** Get the remaining pause time in milliseconds, or 0 if not paused. */
  getPauseRemaining(profileId: string): number {
    const session = this.sessions.get(profileId);
    if (!session || session.pausedUntil === null) return 0;
    const remaining = session.pausedUntil - this.nowFn();
    return Math.max(0, remaining);
  }

  /** Check if any session is currently active for a profile. */
  hasActiveSession(profileId: string): boolean {
    return this.sessions.has(profileId);
  }

  /** Clear all session data (used for testing or profile deletion). */
  clear(): void {
    this.sessions.clear();
    this.configs.clear();
    this.tiers.clear();
  }
}
