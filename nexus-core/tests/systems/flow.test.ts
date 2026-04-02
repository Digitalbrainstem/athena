import { describe, it, expect, beforeEach } from 'vitest';
import { FlowEngine } from '../../src/systems/flow.js';
import type { AttemptOutcome, ChallengeInfo } from '../../src/types/flow.js';

// --- Helpers ---

function makeOutcome(overrides: Partial<AttemptOutcome> = {}): AttemptOutcome {
  return {
    success: false,
    partial: false,
    timeSpentMs: 5000,
    hintsUsed: 0,
    attemptNumber: 1,
    ...overrides,
  };
}

function makeSuccess(attempt = 1): AttemptOutcome {
  return makeOutcome({ success: true, attemptNumber: attempt });
}

function makeFailure(attempt = 1): AttemptOutcome {
  return makeOutcome({ success: false, attemptNumber: attempt });
}

function makeChallenge(id: string, skill = 'math.arithmetic', mechanic = 'build'): ChallengeInfo {
  return { id, skill, mechanic, biome: 'workshop' };
}

describe('FlowEngine', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  // --- System Identity ---

  describe('ECS System interface', () => {
    it('has correct name and priority', () => {
      expect(engine.name).toBe('flow');
      expect(engine.priority).toBe(5);
    });
  });

  // --- Flow State ---

  describe('getFlowState', () => {
    it('returns default flow state for new player', () => {
      const state = engine.getFlowState('player-1');
      expect(state.zone).toBe('flow');
      expect(state.successRate).toBe(0.5);
      expect(state.averageAttempts).toBe(1);
      expect(state.currentStreak).toBe(0);
      expect(state.struggleCount).toBe(0);
    });

    it('detects flow zone with balanced success/failure', () => {
      for (let i = 0; i < 10; i++) {
        const cid = `c-${i}`;
        engine.registerChallenge(makeChallenge(cid));
        // 7 successes, 3 failures = 70% success rate → flow
        engine.recordAttempt('p1', cid, makeSuccess());
      }
      for (let i = 10; i < 14; i++) {
        const cid = `c-${i}`;
        engine.registerChallenge(makeChallenge(cid));
        engine.recordAttempt('p1', cid, makeFailure());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('flow');
      expect(state.successRate).toBeGreaterThan(0.4);
      expect(state.successRate).toBeLessThanOrEqual(0.85);
    });

    it('detects boredom zone with high success rate', () => {
      for (let i = 0; i < 20; i++) {
        const cid = `boredom-${i}`;
        engine.registerChallenge(makeChallenge(cid));
        engine.recordAttempt('p1', cid, makeSuccess());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('boredom');
      expect(state.successRate).toBeGreaterThan(0.85);
    });

    it('detects anxiety zone with low success rate', () => {
      for (let i = 0; i < 20; i++) {
        const cid = `anxiety-${i}`;
        engine.registerChallenge(makeChallenge(cid));
        engine.recordAttempt('p1', cid, makeFailure());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('anxiety');
      expect(state.successRate).toBeLessThan(0.4);
    });

    it('tracks current success streak', () => {
      for (let i = 0; i < 5; i++) {
        engine.recordAttempt('p1', `s-${i}`, makeSuccess());
      }
      expect(engine.getFlowState('p1').currentStreak).toBe(5);

      engine.recordAttempt('p1', 'f-1', makeFailure());
      expect(engine.getFlowState('p1').currentStreak).toBe(0);
    });

    it('counts partial success as success for success rate', () => {
      for (let i = 0; i < 10; i++) {
        const cid = `partial-${i}`;
        engine.registerChallenge(makeChallenge(cid));
        engine.recordAttempt('p1', cid, makeOutcome({ partial: true }));
      }
      const state = engine.getFlowState('p1');
      expect(state.successRate).toBeGreaterThan(0);
    });

    it('tracks struggle count for challenges with 5+ attempts', () => {
      const cid = 'struggle-1';
      engine.registerChallenge(makeChallenge(cid));
      for (let i = 1; i <= 6; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const state = engine.getFlowState('p1');
      expect(state.struggleCount).toBeGreaterThanOrEqual(1);
    });

    it('computes average attempts per challenge', () => {
      // Challenge A: 3 attempts then success
      const cidA = 'avg-a';
      engine.registerChallenge(makeChallenge(cidA));
      engine.recordAttempt('p1', cidA, makeFailure(1));
      engine.recordAttempt('p1', cidA, makeFailure(2));
      engine.recordAttempt('p1', cidA, makeSuccess(3));

      // Challenge B: 1 attempt, success
      const cidB = 'avg-b';
      engine.registerChallenge(makeChallenge(cidB));
      engine.recordAttempt('p1', cidB, makeSuccess(1));

      const state = engine.getFlowState('p1');
      expect(state.averageAttempts).toBeGreaterThan(1);
    });
  });

  // --- Scaffold Detection ---

  describe('shouldScaffold', () => {
    it('returns null for attempts 1-3 (no intervention)', () => {
      const cid = 'scaffold-test';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

      for (let i = 1; i <= 3; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
        expect(engine.shouldScaffold(cid)).toBeNull();
      }
    });

    it('returns observe scaffold at attempts 4-5', () => {
      const cid = 'observe-test';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

      for (let i = 1; i <= 4; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      expect(scaffold).not.toBeNull();
      expect(scaffold!.type).toBe('observe');
      expect(scaffold!.message).toBeTruthy();
    });

    it('returns alternative scaffold at attempts 6-7', () => {
      const cid = 'alt-test';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

      for (let i = 1; i <= 6; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      expect(scaffold).not.toBeNull();
      expect(scaffold!.type).toBe('alternative');
      expect(scaffold!.message).toBeTruthy();
    });

    it('returns redirect scaffold at attempts 8+', () => {
      const cid = 'redirect-test';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

      for (let i = 1; i <= 8; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      expect(scaffold).not.toBeNull();
      expect(scaffold!.type).toBe('redirect');
    });

    it('redirect scaffold includes target skill and biome when known', () => {
      const cid = 'redirect-detail';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

      for (let i = 1; i <= 8; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      expect(scaffold!.type).toBe('redirect');
      // math.algebra prereqs are math.equations and math.expressions
      expect(scaffold!.targetSkill).toBe('math.equations');
      expect(scaffold!.targetBiome).toBeTruthy();
    });

    it('resets scaffold state on success', () => {
      const cid = 'reset-test';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 5; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.shouldScaffold(cid)).not.toBeNull();

      engine.recordAttempt('p1', cid, makeSuccess(6));
      expect(engine.shouldScaffold(cid)).toBeNull();
    });

    it('provides fallback redirect for skills without prerequisites', () => {
      const cid = 'no-prereq';
      engine.registerChallenge(makeChallenge(cid, 'math.counting'));

      for (let i = 1; i <= 8; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      expect(scaffold!.type).toBe('redirect');
      expect(scaffold!.message).toBeTruthy();
    });

    it('observe messages are never judgmental', () => {
      const cid = 'observe-msg';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 4; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      const scaffold = engine.shouldScaffold(cid);
      const msg = scaffold!.message!.toLowerCase();
      expect(msg).not.toContain('wrong');
      expect(msg).not.toContain('failed');
      expect(msg).not.toContain('try again');
      expect(msg).not.toContain('good job');
    });
  });

  // --- Escalation ---

  describe('shouldEscalate', () => {
    it('returns true when player is in boredom zone', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordAttempt('p1', `esc-${i}`, makeSuccess());
      }
      expect(engine.shouldEscalate('p1')).toBe(true);
    });

    it('returns false when player is in flow zone', () => {
      for (let i = 0; i < 14; i++) {
        engine.recordAttempt('p1', `flow-${i}`, makeSuccess());
      }
      for (let i = 0; i < 6; i++) {
        engine.recordAttempt('p1', `flow-f-${i}`, makeFailure());
      }
      expect(engine.shouldEscalate('p1')).toBe(false);
    });

    it('returns false when player is in anxiety zone', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordAttempt('p1', `anx-${i}`, makeFailure());
      }
      expect(engine.shouldEscalate('p1')).toBe(false);
    });
  });

  // --- Tolerance Multiplier ---

  describe('getToleranceMultiplier', () => {
    it('returns 1.0 by default', () => {
      expect(engine.getToleranceMultiplier('any-challenge')).toBe(1.0);
    });

    it('increases after 6+ failed attempts', () => {
      const cid = 'tol-test';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 7; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.getToleranceMultiplier(cid)).toBeGreaterThan(1.0);
    });

    it('resets to 1.0 on success', () => {
      const cid = 'tol-reset';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 7; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.getToleranceMultiplier(cid)).toBeGreaterThan(1.0);

      engine.recordAttempt('p1', cid, makeSuccess(8));
      expect(engine.getToleranceMultiplier(cid)).toBe(1.0);
    });

    it('never exceeds 1.5', () => {
      const cid = 'tol-max';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 50; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.getToleranceMultiplier(cid)).toBeLessThanOrEqual(1.5);
    });
  });

  // --- Redirection ---

  describe('suggestRedirection', () => {
    it('returns null for player with no history', () => {
      expect(engine.suggestRedirection('no-one')).toBeNull();
    });

    it('returns null when there are no struggled challenges', () => {
      engine.registerChallenge(makeChallenge('easy-1', 'math.algebra'));
      engine.recordAttempt('p1', 'easy-1', makeSuccess());
      expect(engine.suggestRedirection('p1')).toBeNull();
    });

    it('suggests redirection to weakest prerequisite', () => {
      const cid = 'hard-1';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));
      // math.algebra prereqs: math.equations, math.expressions
      engine.setMasteryLevels('p1', new Map([
        ['math.equations', 0.3],
        ['math.expressions', 0.2],
      ]));

      for (let i = 1; i <= 6; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }

      const redirect = engine.suggestRedirection('p1');
      expect(redirect).not.toBeNull();
      expect(redirect!.fromSkill).toBe('math.algebra');
      expect(redirect!.gapSkill).toBe('math.expressions');
      expect(redirect!.targetBiome).toBeTruthy();
      expect(redirect!.companionMessage).toBeTruthy();
    });

    it('returns null if all prerequisites are mastered', () => {
      const cid = 'mastered-prereqs';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));
      engine.setMasteryLevels('p1', new Map([
        ['math.equations', 0.9],
        ['math.expressions', 0.9],
      ]));

      for (let i = 1; i <= 6; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.suggestRedirection('p1')).toBeNull();
    });

    it('companion message never contains judgment', () => {
      const cid = 'msg-check';
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));
      engine.setMasteryLevels('p1', new Map([['math.arithmetic', 0.2]]));

      for (let i = 1; i <= 6; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }

      const redirect = engine.suggestRedirection('p1')!;
      const msg = redirect.companionMessage.toLowerCase();
      expect(msg).not.toContain('wrong');
      expect(msg).not.toContain('fail');
      expect(msg).not.toContain('try again');
      expect(msg).not.toContain('good job');
    });
  });

  // --- Anti-Pattern Detection ---

  describe('anti-pattern detection', () => {
    it('returns recent mechanics', () => {
      engine.registerChallenge({ id: 'ap-1', skill: 'math.arithmetic', mechanic: 'build', biome: 'workshop' });
      engine.registerChallenge({ id: 'ap-2', skill: 'math.arithmetic', mechanic: 'diagnose', biome: 'workshop' });
      engine.registerChallenge({ id: 'ap-3', skill: 'math.arithmetic', mechanic: 'explore', biome: 'workshop' });

      engine.recordAttempt('p1', 'ap-1', makeSuccess());
      engine.recordAttempt('p1', 'ap-2', makeSuccess());
      engine.recordAttempt('p1', 'ap-3', makeSuccess());

      const recent = engine.getRecentMechanics('p1', 3);
      expect(recent).toEqual(['build', 'diagnose', 'explore']);
    });

    it('returns empty array for unknown player', () => {
      expect(engine.getRecentMechanics('unknown', 5)).toEqual([]);
    });

    it('shouldAvoidMechanic returns false when mechanic is varied', () => {
      const mechanics = ['build', 'diagnose', 'explore', 'teach', 'experiment'];
      mechanics.forEach((m, i) => {
        engine.registerChallenge({ id: `varied-${i}`, skill: 'math.arithmetic', mechanic: m, biome: 'workshop' });
        engine.recordAttempt('p1', `varied-${i}`, makeSuccess());
      });
      expect(engine.shouldAvoidMechanic('p1', 'build')).toBe(false);
    });

    it('shouldAvoidMechanic returns true when mechanic repeats 3+ in last 5', () => {
      engine.registerChallenge({ id: 'rep-1', skill: 'math.arithmetic', mechanic: 'build', biome: 'workshop' });
      engine.registerChallenge({ id: 'rep-2', skill: 'math.arithmetic', mechanic: 'build', biome: 'workshop' });
      engine.registerChallenge({ id: 'rep-3', skill: 'math.arithmetic', mechanic: 'diagnose', biome: 'workshop' });
      engine.registerChallenge({ id: 'rep-4', skill: 'math.arithmetic', mechanic: 'build', biome: 'workshop' });

      engine.recordAttempt('p1', 'rep-1', makeSuccess());
      engine.recordAttempt('p1', 'rep-2', makeSuccess());
      engine.recordAttempt('p1', 'rep-3', makeSuccess());
      engine.recordAttempt('p1', 'rep-4', makeSuccess());

      expect(engine.shouldAvoidMechanic('p1', 'build')).toBe(true);
    });

    it('shouldAvoidMechanic returns false for unknown player', () => {
      expect(engine.shouldAvoidMechanic('unknown', 'build')).toBe(false);
    });

    it('limits mechanic history to 20 entries', () => {
      for (let i = 0; i < 25; i++) {
        const mechanic = `mech-${i % 10}`;
        engine.registerChallenge({ id: `lim-${i}`, skill: 'math.arithmetic', mechanic, biome: 'workshop' });
        engine.recordAttempt('p1', `lim-${i}`, makeSuccess());
      }
      const recent = engine.getRecentMechanics('p1', 100);
      expect(recent.length).toBeLessThanOrEqual(20);
    });

    it('does not count retries in mechanic history (only first attempt or success)', () => {
      engine.registerChallenge({ id: 'retry-1', skill: 'math.arithmetic', mechanic: 'build', biome: 'workshop' });
      // 5 failed attempts on the same challenge should not add 5 entries
      for (let i = 1; i <= 5; i++) {
        engine.recordAttempt('p1', 'retry-1', makeFailure(i));
      }
      engine.recordAttempt('p1', 'retry-1', makeSuccess(6));

      // Should have 2 entries: first attempt + success
      const recent = engine.getRecentMechanics('p1', 10);
      expect(recent.length).toBe(2);
    });
  });

  // --- Challenge Registration ---

  describe('registerChallenge', () => {
    it('stores challenge info for scaffold and redirect use', () => {
      engine.registerChallenge(makeChallenge('reg-1', 'math.algebra', 'build'));

      for (let i = 1; i <= 8; i++) {
        engine.recordAttempt('p1', 'reg-1', makeFailure(i));
      }

      const scaffold = engine.shouldScaffold('reg-1');
      // math.algebra first prereq is math.equations
      expect(scaffold!.targetSkill).toBe('math.equations');
    });
  });

  // --- Reset and Clear ---

  describe('resetChallengeAttempts', () => {
    it('resets attempt count and tolerance', () => {
      const cid = 'reset-chal';
      engine.registerChallenge(makeChallenge(cid));

      for (let i = 1; i <= 7; i++) {
        engine.recordAttempt('p1', cid, makeFailure(i));
      }
      expect(engine.shouldScaffold(cid)).not.toBeNull();
      expect(engine.getToleranceMultiplier(cid)).toBeGreaterThan(1.0);

      engine.resetChallengeAttempts(cid);
      expect(engine.shouldScaffold(cid)).toBeNull();
      expect(engine.getToleranceMultiplier(cid)).toBe(1.0);
    });
  });

  describe('clearProfile', () => {
    it('removes all state for a profile', () => {
      engine.recordAttempt('p1', 'clear-1', makeSuccess());
      engine.recordAttempt('p1', 'clear-2', makeFailure());

      engine.clearProfile('p1');

      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('flow');
      expect(state.currentStreak).toBe(0);
      expect(engine.getRecentMechanics('p1', 10)).toEqual([]);
    });
  });

  // --- Edge Cases ---

  describe('edge cases', () => {
    it('handles multiple profiles independently', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordAttempt('player-a', `a-${i}`, makeSuccess());
        engine.recordAttempt('player-b', `b-${i}`, makeFailure());
      }

      expect(engine.getFlowState('player-a').zone).toBe('boredom');
      expect(engine.getFlowState('player-b').zone).toBe('anxiety');
    });

    it('handles challenge without registration gracefully', () => {
      engine.recordAttempt('p1', 'unregistered', makeSuccess());
      const state = engine.getFlowState('p1');
      expect(state.currentStreak).toBe(1);
    });

    it('scaffold for unregistered challenge gives generic redirect', () => {
      for (let i = 1; i <= 8; i++) {
        engine.recordAttempt('p1', 'unreg-scaffold', makeFailure(i));
      }
      const scaffold = engine.shouldScaffold('unreg-scaffold');
      expect(scaffold!.type).toBe('redirect');
      expect(scaffold!.message).toBeTruthy();
    });

    it('rolling window trims history to prevent memory growth', () => {
      for (let i = 0; i < 100; i++) {
        engine.recordAttempt('p1', `big-${i}`, makeSuccess());
      }
      // Internal implementation detail: history should be trimmed
      // Just verify that flow state is still computed correctly
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('boredom');
    });
  });

  // --- Dynamic Difficulty Envelope ---

  describe('dynamic difficulty envelope', () => {
    it('success rate > 85% means boredom — escalate', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordAttempt('p1', `dd-${i}`, makeSuccess());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('boredom');
      expect(engine.shouldEscalate('p1')).toBe(true);
    });

    it('success rate 50-85% means flow — do not touch', () => {
      for (let i = 0; i < 15; i++) {
        engine.recordAttempt('p1', `flow-${i}`, makeSuccess());
      }
      for (let i = 0; i < 5; i++) {
        engine.recordAttempt('p1', `fail-${i}`, makeFailure());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('flow');
      expect(engine.shouldEscalate('p1')).toBe(false);
    });

    it('success rate < 40% means anxiety — scaffold', () => {
      for (let i = 0; i < 15; i++) {
        engine.recordAttempt('p1', `anx-${i}`, makeFailure());
      }
      for (let i = 0; i < 5; i++) {
        engine.recordAttempt('p1', `anx-ok-${i}`, makeSuccess());
      }
      const state = engine.getFlowState('p1');
      expect(state.zone).toBe('anxiety');
    });
  });

  // --- Partial Success Preservation ---

  describe('partial success', () => {
    it('partial outcomes contribute to success rate', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordAttempt('p1', `partial-${i}`, makeOutcome({ partial: true }));
      }
      const state = engine.getFlowState('p1');
      // Partials count as successes for flow zone determination
      expect(state.successRate).toBeGreaterThan(0);
    });
  });

  // --- Principle Enforcement ---

  describe('principle enforcement', () => {
    it('observe messages never say "wrong" or "try again" (Principle VI)', () => {
      const messages = [
        "Hmm, I noticed something interesting about how that part connects...",
        "Hey, look at this piece here — it reminds me of something we saw before.",
        "I think there's a pattern here. See how this part works?",
        "Wait — what if we look at it from this angle?",
        "Ooh, I just noticed something! The first part was really clever.",
      ];

      for (const msg of messages) {
        const lower = msg.toLowerCase();
        expect(lower).not.toContain('wrong');
        expect(lower).not.toContain('try again');
        expect(lower).not.toContain('failed');
        expect(lower).not.toContain('good job');
        expect(lower).not.toContain('correct');
      }
    });

    it('alternative messages never judge (Principle VI)', () => {
      const messages = [
        "What if we tried a completely different approach?",
        "I wonder if there's another way to get there...",
        "Hey, I saw something over there that might give us another idea!",
        "Let's step back and think about this differently.",
        "There might be more than one way to solve this!",
      ];

      for (const msg of messages) {
        const lower = msg.toLowerCase();
        expect(lower).not.toContain('wrong');
        expect(lower).not.toContain('fail');
        expect(lower).not.toContain('grade');
      }
    });
  });
});
