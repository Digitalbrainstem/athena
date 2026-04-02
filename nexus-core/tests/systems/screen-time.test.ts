import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenTimeSystem } from '../../src/systems/screen-time.js';
import type { ScreenTimeConfig } from '../../src/types/screen-time.js';
import { defaultScreenTimeConfig, validateScreenTimeConfig } from '../../src/types/screen-time.js';

describe('ScreenTimeSystem', () => {
  let system: ScreenTimeSystem;
  let now: number;

  beforeEach(() => {
    // Fixed time: 2025-01-15 10:00:00 UTC (a Wednesday, well within normal hours)
    now = new Date('2025-01-15T10:00:00Z').getTime();
    system = new ScreenTimeSystem(() => now);
  });

  // ─── Session Lifecycle ──────────────────────────────────────────────────

  describe('session lifecycle', () => {
    it('starts and tracks a session', () => {
      system.startSession('player-1');
      expect(system.hasActiveSession('player-1')).toBe(true);
    });

    it('reports no active session before starting', () => {
      expect(system.hasActiveSession('player-1')).toBe(false);
    });

    it('ends a session', () => {
      system.startSession('player-1');
      system.endSession('player-1');
      expect(system.hasActiveSession('player-1')).toBe(false);
    });

    it('ending a non-existent session is a no-op', () => {
      system.endSession('no-such-player');
      expect(system.hasActiveSession('no-such-player')).toBe(false);
    });

    it('tracks multiple profiles independently', () => {
      system.startSession('player-1');
      system.startSession('player-2');
      expect(system.hasActiveSession('player-1')).toBe(true);
      expect(system.hasActiveSession('player-2')).toBe(true);

      system.endSession('player-1');
      expect(system.hasActiveSession('player-1')).toBe(false);
      expect(system.hasActiveSession('player-2')).toBe(true);
    });

    it('starting a new session replaces the old one', () => {
      system.startSession('player-1');
      now += 10 * 60_000; // 10 minutes later
      system.startSession('player-1'); // Restart

      const stats = system.getSessionStats('player-1');
      expect(stats.minutesPlayed).toBe(0); // Fresh session
      expect(stats.dailyMinutesPlayed).toBe(10); // But daily accumulated
    });
  });

  // ─── Session Stats ──────────────────────────────────────────────────────

  describe('getSessionStats', () => {
    it('returns zero stats for inactive profile', () => {
      const stats = system.getSessionStats('nobody');
      expect(stats.profileId).toBe('nobody');
      expect(stats.minutesPlayed).toBe(0);
      expect(stats.breaksTaken).toBe(0);
      expect(stats.dailyMinutesPlayed).toBe(0);
      expect(stats.isActive).toBe(false);
    });

    it('tracks minutes played', () => {
      system.startSession('player-1');
      now += 25 * 60_000; // 25 minutes
      const stats = system.getSessionStats('player-1');
      expect(stats.minutesPlayed).toBe(25);
      expect(stats.isActive).toBe(true);
    });

    it('tracks breaks taken', () => {
      system.startSession('player-1');
      system.recordBreak('player-1');
      system.recordBreak('player-1');
      const stats = system.getSessionStats('player-1');
      expect(stats.breaksTaken).toBe(2);
    });

    it('accumulates daily minutes across sessions', () => {
      system.startSession('player-1');
      now += 30 * 60_000; // 30 minutes
      system.endSession('player-1');

      system.startSession('player-1');
      now += 20 * 60_000; // 20 more minutes
      const stats = system.getSessionStats('player-1');
      expect(stats.minutesPlayed).toBe(20);
      expect(stats.dailyMinutesPlayed).toBe(50); // 30 + 20
    });

    it('resets daily counter on new day', () => {
      system.startSession('player-1');
      now += 60 * 60_000; // 1 hour
      system.endSession('player-1');

      // Next day
      now = new Date('2025-01-16T10:00:00Z').getTime();
      system.startSession('player-1');
      now += 15 * 60_000;
      const stats = system.getSessionStats('player-1');
      expect(stats.minutesPlayed).toBe(15);
      expect(stats.dailyMinutesPlayed).toBe(15); // Reset
    });
  });

  // ─── Break Reminders ────────────────────────────────────────────────────

  describe('checkBreak', () => {
    it('returns null when no session is active', () => {
      expect(system.checkBreak('player-1')).toBeNull();
    });

    it('returns null before break interval is reached', () => {
      system.setTier('player-1', 'discovery'); // 30 min default
      system.startSession('player-1');
      now += 20 * 60_000; // 20 minutes
      expect(system.checkBreak('player-1')).toBeNull();
    });

    it('returns gentle reminder after break interval', () => {
      system.setTier('player-1', 'discovery'); // 30 min default
      system.startSession('player-1');
      now += 31 * 60_000; // 31 minutes
      const action = system.checkBreak('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('gentle_reminder');
      expect(action!.minutesPlayed).toBe(31);
      expect(action!.companionMessage).toBeTruthy();
      expect(action!.suggestedActivity).toBeTruthy();
    });

    it('returns firm pause when enforcement is firm', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 30,
        breakEnforcement: 'firm',
        firmPauseDurationMinutes: 5,
      };
      system.setConfig('player-1', config);
      system.setTier('player-1', 'discovery');
      system.startSession('player-1');
      now += 31 * 60_000;

      const action = system.checkBreak('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('firm_pause');
      expect(system.isPaused('player-1')).toBe(true);
    });

    it('resets break timer after taking a break', () => {
      system.setTier('player-1', 'foundation'); // 15 min default
      system.startSession('player-1');
      now += 16 * 60_000;
      expect(system.checkBreak('player-1')).not.toBeNull();

      system.recordBreak('player-1');
      expect(system.checkBreak('player-1')).toBeNull(); // Just took a break

      now += 16 * 60_000; // Another 16 minutes
      expect(system.checkBreak('player-1')).not.toBeNull(); // Due again
    });

    it('uses foundation tier default (15 min) for young players', () => {
      system.setTier('player-1', 'foundation');
      system.startSession('player-1');
      now += 14 * 60_000;
      expect(system.checkBreak('player-1')).toBeNull();
      now += 2 * 60_000; // Now 16 min
      expect(system.checkBreak('player-1')).not.toBeNull();
    });

    it('uses creator tier default (90 min) for adult players', () => {
      system.setTier('player-1', 'creator');
      system.startSession('player-1');
      now += 89 * 60_000;
      expect(system.checkBreak('player-1')).toBeNull();
      now += 2 * 60_000; // Now 91 min
      expect(system.checkBreak('player-1')).not.toBeNull();
    });

    it('does not stack reminders during a firm pause', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 30,
        breakEnforcement: 'firm',
        firmPauseDurationMinutes: 5,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 31 * 60_000;
      system.checkBreak('player-1'); // triggers pause

      now += 1 * 60_000; // 1 min into pause
      expect(system.checkBreak('player-1')).toBeNull(); // No stacking
      expect(system.isPaused('player-1')).toBe(true);
    });

    it('clears pause after firm pause duration expires', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 30,
        breakEnforcement: 'firm',
        firmPauseDurationMinutes: 5,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 31 * 60_000;
      system.checkBreak('player-1'); // triggers pause

      now += 6 * 60_000; // 6 min later - pause expired
      expect(system.isPaused('player-1')).toBe(false);
      expect(system.checkBreak('player-1')).toBeNull(); // Cleared, timer reset
    });
  });

  // ─── Message Quality ────────────────────────────────────────────────────

  describe('companion messages', () => {
    it('messages are never punitive for foundation tier', () => {
      system.setTier('player-1', 'foundation');
      system.startSession('player-1');
      now += 16 * 60_000;
      const action = system.checkBreak('player-1');
      expect(action).not.toBeNull();

      const msg = action!.companionMessage.toLowerCase();
      expect(msg).not.toContain('must');
      expect(msg).not.toContain('have to');
      expect(msg).not.toContain('you need to stop');
      expect(msg).not.toContain("time's up");
      expect(msg).not.toContain('not allowed');
    });

    it('messages are never punitive for discovery tier', () => {
      system.setTier('player-1', 'discovery');
      system.startSession('player-1');
      now += 31 * 60_000;
      const action = system.checkBreak('player-1');
      expect(action).not.toBeNull();

      const msg = action!.companionMessage.toLowerCase();
      expect(msg).not.toContain('must');
      expect(msg).not.toContain('have to');
      expect(msg).not.toContain("time's up");
    });

    it('messages include a suggested activity', () => {
      system.setTier('player-1', 'foundation');
      system.startSession('player-1');
      now += 16 * 60_000;
      const action = system.checkBreak('player-1');
      expect(action!.suggestedActivity).toBeTruthy();
      expect(action!.suggestedActivity!.length).toBeGreaterThan(5);
    });

    it('limit-reached messages are warm and save-positive', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 30,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 31 * 60_000;

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('limit_reached');

      const msg = action!.companionMessage.toLowerCase();
      expect(msg).not.toContain("time's up");
      expect(msg).not.toContain('not allowed');
      // Should contain positive language
      expect(msg).toMatch(/saved|save|see you|back|adventure|awesome|great/);
    });
  });

  // ─── Time Limits ────────────────────────────────────────────────────────

  describe('checkLimits', () => {
    it('returns null when no session is active', () => {
      expect(system.checkLimits('player-1')).toBeNull();
    });

    it('returns null when no limits are set', () => {
      system.startSession('player-1');
      now += 300 * 60_000; // 5 hours
      expect(system.checkLimits('player-1')).toBeNull();
    });

    it('detects approaching session limit', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 30,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 26 * 60_000; // 4 min remaining

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('approaching_limit');
      expect(action!.minutesRemaining).toBe(4);
    });

    it('detects session limit reached', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 30,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 31 * 60_000;

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('limit_reached');
      expect(action!.minutesRemaining).toBe(0);
    });

    it('detects approaching daily limit', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        dailyLimitMinutes: 60,
      };
      system.setConfig('player-1', config);

      // First session: 50 minutes
      system.startSession('player-1');
      now += 50 * 60_000;
      system.endSession('player-1');

      // Second session: 7 minutes (total 57, within 5 of limit)
      system.startSession('player-1');
      now += 7 * 60_000;

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('approaching_limit');
      expect(action!.minutesRemaining).toBe(3);
    });

    it('detects daily limit reached across sessions', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        dailyLimitMinutes: 60,
      };
      system.setConfig('player-1', config);

      system.startSession('player-1');
      now += 50 * 60_000;
      system.endSession('player-1');

      system.startSession('player-1');
      now += 11 * 60_000; // Total: 61 minutes

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('limit_reached');
    });

    it('detects outside allowed hours', () => {
      // Allowed hours: 8am to 8pm
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        allowedHoursStart: 8,
        allowedHoursEnd: 20,
      };
      system.setConfig('player-1', config);

      // Set time to 9pm (21:00)
      now = new Date('2025-01-15T21:00:00Z').getTime();
      system.startSession('player-1');

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('outside_hours');
    });

    it('allows play within allowed hours', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        allowedHoursStart: 8,
        allowedHoursEnd: 20,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1'); // 10am
      now += 5 * 60_000;

      expect(system.checkLimits('player-1')).toBeNull();
    });

    it('handles overnight allowed hours range', () => {
      // Allowed hours: 6am to 2am (overnight)
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        allowedHoursStart: 6,
        allowedHoursEnd: 2,
      };
      system.setConfig('player-1', config);

      // 11pm - should be allowed (between 6am and 2am)
      now = new Date('2025-01-15T23:00:00Z').getTime();
      system.startSession('player-1');
      expect(system.checkLimits('player-1')).toBeNull();

      // 3am - should be outside hours
      system.endSession('player-1');
      now = new Date('2025-01-16T03:00:00Z').getTime();
      system.startSession('player-1');
      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('outside_hours');
    });

    it('session limit takes priority over daily limit when both apply', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 15,
        dailyLimitMinutes: 60,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 16 * 60_000;

      const action = system.checkLimits('player-1');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('limit_reached');
    });
  });

  // ─── Pause System ──────────────────────────────────────────────────────

  describe('pause system', () => {
    it('isPaused returns false when not paused', () => {
      system.startSession('player-1');
      expect(system.isPaused('player-1')).toBe(false);
    });

    it('getPauseRemaining returns 0 when not paused', () => {
      system.startSession('player-1');
      expect(system.getPauseRemaining('player-1')).toBe(0);
    });

    it('getPauseRemaining returns correct value during pause', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 30,
        breakEnforcement: 'firm',
        firmPauseDurationMinutes: 5,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 31 * 60_000;
      system.checkBreak('player-1');

      now += 2 * 60_000; // 2 min into pause
      const remaining = system.getPauseRemaining('player-1');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(3 * 60_000); // ~3 min left
    });

    it('session stats show inactive during pause', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 15,
        breakEnforcement: 'firm',
        firmPauseDurationMinutes: 5,
      };
      system.setConfig('player-1', config);
      system.startSession('player-1');
      now += 16 * 60_000;
      system.checkBreak('player-1');

      const stats = system.getSessionStats('player-1');
      expect(stats.isActive).toBe(false);
    });
  });

  // ─── Config Validation ──────────────────────────────────────────────────

  describe('config validation', () => {
    it('accepts valid config', () => {
      const config: ScreenTimeConfig = {
        sessionLimitMinutes: 60,
        dailyLimitMinutes: 120,
        allowedHoursStart: 8,
        allowedHoursEnd: 20,
        breakIntervalMinutes: 30,
        breakEnforcement: 'gentle',
        firmPauseDurationMinutes: 5,
      };
      expect(validateScreenTimeConfig(config)).toEqual([]);
    });

    it('accepts unlimited config (nulls)', () => {
      const config = defaultScreenTimeConfig('discovery');
      expect(validateScreenTimeConfig(config)).toEqual([]);
    });

    it('rejects session limit below 15 minutes', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 5,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Session limit');
    });

    it('rejects session limit above 240 minutes', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 300,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects daily limit below 30 minutes', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        dailyLimitMinutes: 10,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects daily limit above 480 minutes', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        dailyLimitMinutes: 600,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects mismatched allowed hours (one null, one not)', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        allowedHoursStart: 8,
        allowedHoursEnd: null,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('both');
    });

    it('rejects break interval below 10', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 5,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects break interval above 90', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        breakIntervalMinutes: 120,
      };
      const errors = validateScreenTimeConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('system rejects invalid config', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 5,
      };
      const errors = system.setConfig('player-1', config);
      expect(errors.length).toBeGreaterThan(0);
      // Config should not have been applied
      const active = system.getConfig('player-1');
      expect(active.sessionLimitMinutes).toBeNull();
    });

    it('system applies valid config', () => {
      const config: ScreenTimeConfig = {
        ...defaultScreenTimeConfig('discovery'),
        sessionLimitMinutes: 60,
      };
      const errors = system.setConfig('player-1', config);
      expect(errors).toEqual([]);
      expect(system.getConfig('player-1').sessionLimitMinutes).toBe(60);
    });
  });

  // ─── Default Config by Tier ─────────────────────────────────────────────

  describe('defaultScreenTimeConfig', () => {
    it('foundation has 15 min break interval', () => {
      const config = defaultScreenTimeConfig('foundation');
      expect(config.breakIntervalMinutes).toBe(15);
      expect(config.sessionLimitMinutes).toBeNull();
      expect(config.dailyLimitMinutes).toBeNull();
      expect(config.breakEnforcement).toBe('gentle');
    });

    it('discovery has 30 min break interval', () => {
      expect(defaultScreenTimeConfig('discovery').breakIntervalMinutes).toBe(30);
    });

    it('builder has 45 min break interval', () => {
      expect(defaultScreenTimeConfig('builder').breakIntervalMinutes).toBe(45);
    });

    it('innovator has 60 min break interval', () => {
      expect(defaultScreenTimeConfig('innovator').breakIntervalMinutes).toBe(60);
    });

    it('creator has 90 min break interval', () => {
      expect(defaultScreenTimeConfig('creator').breakIntervalMinutes).toBe(90);
    });
  });

  // ─── Clear ──────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all sessions and configs', () => {
      system.startSession('player-1');
      system.startSession('player-2');
      system.setTier('player-1', 'foundation');
      system.clear();

      expect(system.hasActiveSession('player-1')).toBe(false);
      expect(system.hasActiveSession('player-2')).toBe(false);
    });
  });
});
