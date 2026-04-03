// Integration tests for the Flow Engine
// Verifies full scenarios: escalation, scaffolding progression,
// anti-pattern detection, and partial success handling.

import { describe, it, expect, beforeEach } from 'vitest';
import { FlowEngine } from '../../src/systems/flow.js';
import type { AttemptOutcome, ChallengeInfo } from '../../src/types/flow.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSuccess(attemptNum = 1): AttemptOutcome {
  return { success: true, partial: false, timeSpentMs: 5000, hintsUsed: 0, attemptNumber: attemptNum };
}

function makeFailure(attemptNum = 1): AttemptOutcome {
  return { success: false, partial: false, timeSpentMs: 5000, hintsUsed: 0, attemptNumber: attemptNum };
}

function makePartial(attemptNum = 1): AttemptOutcome {
  return { success: false, partial: true, timeSpentMs: 5000, hintsUsed: 0, attemptNumber: attemptNum };
}

function makeChallenge(id: string, skill: string, mechanic = 'build', biome = 'workshop'): ChallengeInfo {
  return { id, skill, mechanic, biome };
}

// ─── Scenario 1: Player succeeds easily (85%+ success rate) ─────────────────

describe('Flow Integration: Easy Success Escalation', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('recommends escalation when success rate exceeds 85%', () => {
    // Player succeeds on 20 unique challenges
    for (let i = 0; i < 20; i++) {
      engine.registerChallenge(makeChallenge(`easy-${i}`, 'math.arithmetic'));
      engine.recordAttempt('player-1', `easy-${i}`, makeSuccess());
    }

    const state = engine.getFlowState('player-1');
    expect(state.zone).toBe('boredom');
    expect(state.successRate).toBeGreaterThan(0.85);
    expect(engine.shouldEscalate('player-1')).toBe(true);
  });

  it('does not trigger scaffolding when succeeding easily', () => {
    for (let i = 0; i < 20; i++) {
      const cid = `no-scaffold-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));
      engine.recordAttempt('player-1', cid, makeSuccess());
      expect(engine.shouldScaffold('player-1', cid)).toBeNull();
    }
  });

  it('transitions from boredom to flow when difficulty increases', () => {
    // First 20: easy successes → boredom
    for (let i = 0; i < 20; i++) {
      engine.registerChallenge(makeChallenge(`bored-${i}`, 'math.arithmetic'));
      engine.recordAttempt('player-1', `bored-${i}`, makeSuccess());
    }
    expect(engine.getFlowState('player-1').zone).toBe('boredom');

    // Next: mix of successes and failures (harder challenges) → flow
    for (let i = 0; i < 15; i++) {
      const cid = `harder-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));
      const outcome = i % 3 === 0 ? makeFailure() : makeSuccess();
      engine.recordAttempt('player-1', cid, outcome);
    }

    const state = engine.getFlowState('player-1');
    expect(state.zone).toBe('flow');
    expect(engine.shouldEscalate('player-1')).toBe(false);
  });
});

// ─── Scenario 2: Player struggles (3+ attempts on same challenge) ────────────

describe('Flow Integration: Struggle Scaffolding Progression', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('escalates scaffolding: null → observe → alternative → redirect', () => {
    const cid = 'hard-challenge';
    engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

    // Attempts 1-3: no scaffolding
    for (let i = 1; i <= 3; i++) {
      engine.recordAttempt('player-1', cid, makeFailure(i));
      expect(engine.shouldScaffold('player-1', cid)).toBeNull();
    }

    // Attempt 4: companion observation (not the answer)
    engine.recordAttempt('player-1', cid, makeFailure(4));
    const scaffold4 = engine.shouldScaffold('player-1', cid);
    expect(scaffold4).not.toBeNull();
    expect(scaffold4!.type).toBe('observe');
    expect(scaffold4!.message).toBeTruthy();
    // Observation should NOT give the answer
    expect(scaffold4!.message!.toLowerCase()).not.toContain('answer');
    expect(scaffold4!.message!.toLowerCase()).not.toContain('solution');

    // Attempt 5: still observe
    engine.recordAttempt('player-1', cid, makeFailure(5));
    const scaffold5 = engine.shouldScaffold('player-1', cid);
    expect(scaffold5!.type).toBe('observe');

    // Attempt 6: alternative approach + wider tolerance
    engine.recordAttempt('player-1', cid, makeFailure(6));
    const scaffold6 = engine.shouldScaffold('player-1', cid);
    expect(scaffold6!.type).toBe('alternative');
    expect(scaffold6!.message).toBeTruthy();
    // Tolerance should have widened
    expect(engine.getToleranceMultiplier('player-1', cid)).toBeGreaterThan(1.0);

    // Attempt 7: still alternative
    engine.recordAttempt('player-1', cid, makeFailure(7));
    const scaffold7 = engine.shouldScaffold('player-1', cid);
    expect(scaffold7!.type).toBe('alternative');

    // Attempt 8: redirect to different biome
    engine.recordAttempt('player-1', cid, makeFailure(8));
    const scaffold8 = engine.shouldScaffold('player-1', cid);
    expect(scaffold8!.type).toBe('redirect');
    expect(scaffold8!.message).toBeTruthy();
    // Redirect should mention a biome
    const msg = scaffold8!.message!.toLowerCase();
    expect(
      msg.includes('workshop') ||
      msg.includes('caverns') ||
      msg.includes('forest') ||
      msg.includes('lab') ||
      msg.includes('library') ||
      msg.includes('explore'),
    ).toBe(true);
  });

  it('tolerance multiplier widens on struggles and caps at 1.5', () => {
    const cid = 'tolerance-challenge';
    engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));

    // First 5 attempts: no tolerance widening
    for (let i = 1; i <= 5; i++) {
      engine.recordAttempt('player-1', cid, makeFailure(i));
      expect(engine.getToleranceMultiplier('player-1', cid)).toBe(1.0);
    }

    // Attempts 6+: tolerance starts widening
    for (let i = 6; i <= 20; i++) {
      engine.recordAttempt('player-1', cid, makeFailure(i));
    }
    const tol = engine.getToleranceMultiplier('player-1', cid);
    expect(tol).toBeGreaterThan(1.0);
    expect(tol).toBeLessThanOrEqual(1.5);
  });

  it('resets scaffold state when player eventually succeeds', () => {
    const cid = 'eventual-success';
    engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));

    // Fail 6 times → should be at 'alternative' scaffold
    for (let i = 1; i <= 6; i++) {
      engine.recordAttempt('player-1', cid, makeFailure(i));
    }
    expect(engine.shouldScaffold('player-1', cid)!.type).toBe('alternative');
    expect(engine.getToleranceMultiplier('player-1', cid)).toBeGreaterThan(1.0);

    // Succeed on attempt 7 → resets everything
    engine.recordAttempt('player-1', cid, makeSuccess(7));
    expect(engine.shouldScaffold('player-1', cid)).toBeNull();
    expect(engine.getToleranceMultiplier('player-1', cid)).toBe(1.0);
  });
});

// ─── Scenario 3: Anti-pattern detection ──────────────────────────────────────

describe('Flow Integration: Anti-Pattern Detection', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('detects mechanic repetition (build, build, build, build, build)', () => {
    // Register 5 challenges all using 'build' mechanic
    for (let i = 1; i <= 5; i++) {
      engine.registerChallenge(makeChallenge(`build-${i}`, 'math.arithmetic', 'build'));
      engine.recordAttempt('player-1', `build-${i}`, makeSuccess());
    }

    // Engine should flag 'build' as overused
    expect(engine.shouldAvoidMechanic('player-1', 'build')).toBe(true);

    // But other mechanics should be fine
    expect(engine.shouldAvoidMechanic('player-1', 'explore')).toBe(false);
    expect(engine.shouldAvoidMechanic('player-1', 'diagnose')).toBe(false);
  });

  it('recommends diverse mechanics after repetition detected', () => {
    for (let i = 1; i <= 5; i++) {
      engine.registerChallenge(makeChallenge(`rep-${i}`, 'math.arithmetic', 'build'));
      engine.recordAttempt('player-1', `rep-${i}`, makeSuccess());
    }

    // Should recommend avoiding 'build', suggest alternatives
    expect(engine.shouldAvoidMechanic('player-1', 'build')).toBe(true);
    expect(engine.shouldAvoidMechanic('player-1', 'diagnose')).toBe(false);
    expect(engine.shouldAvoidMechanic('player-1', 'explore')).toBe(false);
    expect(engine.shouldAvoidMechanic('player-1', 'teach')).toBe(false);
  });

  it('diverse mechanics do not trigger anti-pattern', () => {
    const mechanics = ['build', 'explore', 'diagnose', 'teach', 'craft'];
    for (let i = 0; i < 5; i++) {
      const cid = `diverse-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic', mechanics[i]!));
      engine.recordAttempt('player-1', cid, makeSuccess());
    }

    for (const m of mechanics) {
      expect(engine.shouldAvoidMechanic('player-1', m)).toBe(false);
    }
  });

  it('retries on the same challenge do not inflate mechanic count', () => {
    engine.registerChallenge(makeChallenge('retry-challenge', 'math.arithmetic', 'build'));

    // Fail 5 times then succeed
    for (let i = 1; i <= 5; i++) {
      engine.recordAttempt('player-1', 'retry-challenge', makeFailure(i));
    }
    engine.recordAttempt('player-1', 'retry-challenge', makeSuccess(6));

    // Only 1 entry in mechanic history (first attempt only, not success)
    const recent = engine.getRecentMechanics('player-1', 10);
    expect(recent.length).toBe(1);
    expect(recent[0]).toBe('build');
  });

  it('mechanic history rolls off after window size', () => {
    // Fill with 20 diverse mechanics
    for (let i = 0; i < 20; i++) {
      const cid = `fill-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic', `mech-${i}`));
      engine.recordAttempt('player-1', cid, makeSuccess());
    }

    // Now add 3 'build' in the last 5
    for (let i = 20; i < 23; i++) {
      const cid = `build-late-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic', 'build'));
      engine.recordAttempt('player-1', cid, makeSuccess());
    }

    // The window only checks last 5, so build appears 3 times → should avoid
    expect(engine.shouldAvoidMechanic('player-1', 'build')).toBe(true);
  });
});

// ─── Scenario 4: Partial success handling ────────────────────────────────────

describe('Flow Integration: Partial Success', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('partial success counts toward success rate', () => {
    // Fill with 20 partial successes
    for (let i = 0; i < 20; i++) {
      engine.registerChallenge(makeChallenge(`partial-${i}`, 'math.arithmetic'));
      engine.recordAttempt('player-1', `partial-${i}`, makePartial());
    }

    const state = engine.getFlowState('player-1');
    // Partial counts as success in the flow engine
    expect(state.successRate).toBeGreaterThan(0.85);
    expect(state.zone).toBe('boredom');
  });

  it('mix of partial and full success maintains flow zone', () => {
    for (let i = 0; i < 20; i++) {
      const cid = `mixed-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));
      // 60% full success, 15% partial, 25% failure → ~75% effective success
      const roll = i % 20;
      if (roll < 12) {
        engine.recordAttempt('player-1', cid, makeSuccess());
      } else if (roll < 15) {
        engine.recordAttempt('player-1', cid, makePartial());
      } else {
        engine.recordAttempt('player-1', cid, makeFailure());
      }
    }

    const state = engine.getFlowState('player-1');
    expect(state.zone).toBe('flow');
    expect(state.successRate).toBeGreaterThanOrEqual(0.40);
    expect(state.successRate).toBeLessThanOrEqual(0.85);
  });
});

// ─── Scenario 5: Per-player isolation ────────────────────────────────────────

describe('Flow Integration: Multi-Profile Isolation', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('scaffold state is per-player, not global', () => {
    const cid = 'shared-challenge';
    engine.registerChallenge(makeChallenge(cid, 'math.algebra'));

    // Player A fails 5 times → should trigger scaffold for A
    for (let i = 1; i <= 5; i++) {
      engine.recordAttempt('player-a', cid, makeFailure(i));
    }

    // Player B attempts same challenge once → no scaffold for B
    engine.recordAttempt('player-b', cid, makeFailure(1));

    expect(engine.shouldScaffold('player-a', cid)).not.toBeNull();
    expect(engine.shouldScaffold('player-b', cid)).toBeNull();
  });

  it('tolerance multiplier is per-player', () => {
    const cid = 'tol-shared';
    engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));

    // Player A fails many times → tolerance widens
    for (let i = 1; i <= 10; i++) {
      engine.recordAttempt('player-a', cid, makeFailure(i));
    }

    // Player B has no attempts
    expect(engine.getToleranceMultiplier('player-a', cid)).toBeGreaterThan(1.0);
    expect(engine.getToleranceMultiplier('player-b', cid)).toBe(1.0);
  });

  it('mechanic history is per-player', () => {
    for (let i = 0; i < 5; i++) {
      const cid = `per-player-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic', 'build'));
      engine.recordAttempt('player-a', cid, makeSuccess());
    }

    // Player A should have anti-pattern detected
    expect(engine.shouldAvoidMechanic('player-a', 'build')).toBe(true);
    // Player B should be clean
    expect(engine.shouldAvoidMechanic('player-b', 'build')).toBe(false);
  });

  it('clearProfile only affects the cleared player', () => {
    engine.registerChallenge(makeChallenge('clear-test', 'math.arithmetic'));

    engine.recordAttempt('player-a', 'clear-test', makeSuccess());
    engine.recordAttempt('player-b', 'clear-test', makeSuccess());

    engine.clearProfile('player-a');

    expect(engine.getFlowState('player-a').currentStreak).toBe(0);
    expect(engine.getFlowState('player-b').currentStreak).toBe(1);
  });
});

// ─── Scenario 6: Prerequisite gap redirection ────────────────────────────────

describe('Flow Integration: Prerequisite Gap Redirection', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('suggests redirect to weakest prerequisite when struggling', () => {
    // Register an algebra challenge (prereqs: math.equations, math.expressions)
    engine.registerChallenge(makeChallenge('algebra-1', 'math.algebra', 'build'));

    // Set mastery: equations is fine (0.8), expressions is weak (0.2)
    const levels = new Map<string, number>([
      ['math.equations', 0.8],
      ['math.expressions', 0.2],
    ]);
    engine.setMasteryLevels('player-1', levels);

    // Struggle on algebra
    for (let i = 1; i <= 6; i++) {
      engine.recordAttempt('player-1', 'algebra-1', makeFailure(i));
    }

    const redirect = engine.suggestRedirection('player-1');
    expect(redirect).not.toBeNull();
    expect(redirect!.gapSkill).toBe('math.expressions');
    expect(redirect!.fromSkill).toBe('math.algebra');
    expect(redirect!.targetBiome).toBeTruthy();
    expect(redirect!.companionMessage).toBeTruthy();
    // Message should NOT be judgmental
    const msg = redirect!.companionMessage.toLowerCase();
    expect(msg).not.toContain('wrong');
    expect(msg).not.toContain('failed');
    expect(msg).not.toContain('bad');
  });

  it('returns null when all prerequisites are mastered', () => {
    engine.registerChallenge(makeChallenge('algebra-2', 'math.algebra'));

    const levels = new Map<string, number>([
      ['math.equations', 0.9],
      ['math.expressions', 0.8],
    ]);
    engine.setMasteryLevels('player-1', levels);

    for (let i = 1; i <= 6; i++) {
      engine.recordAttempt('player-1', 'algebra-2', makeFailure(i));
    }

    const redirect = engine.suggestRedirection('player-1');
    expect(redirect).toBeNull();
  });

  it('scaffold redirect also targets prerequisites when registered', () => {
    engine.registerChallenge(makeChallenge('redirect-prereq', 'math.algebra', 'build'));

    // Set mastery with a clear weakness
    const levels = new Map<string, number>([
      ['math.equations', 0.1],
      ['math.expressions', 0.6],
    ]);
    engine.setMasteryLevels('player-1', levels);

    // Fail 8 times to trigger redirect scaffold
    for (let i = 1; i <= 8; i++) {
      engine.recordAttempt('player-1', 'redirect-prereq', makeFailure(i));
    }

    const scaffold = engine.shouldScaffold('player-1', 'redirect-prereq');
    expect(scaffold!.type).toBe('redirect');
    // Should target weakest prereq
    expect(scaffold!.targetSkill).toBe('math.equations');
    expect(scaffold!.targetBiome).toBeTruthy();
  });
});

// ─── Scenario 7: Dynamic difficulty envelope ─────────────────────────────────

describe('Flow Integration: Dynamic Difficulty Envelope', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
  });

  it('tracks the full flow arc: anxiety → flow → boredom → flow', () => {
    // Phase 1: Player is struggling (anxiety)
    for (let i = 0; i < 20; i++) {
      engine.registerChallenge(makeChallenge(`struggle-${i}`, 'math.arithmetic'));
      engine.recordAttempt('player-1', `struggle-${i}`, makeFailure());
    }
    expect(engine.getFlowState('player-1').zone).toBe('anxiety');

    // Phase 2: Player starts improving (flow)
    for (let i = 0; i < 20; i++) {
      const cid = `improving-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));
      const outcome = i % 3 === 0 ? makeFailure() : makeSuccess();
      engine.recordAttempt('player-1', cid, outcome);
    }
    expect(engine.getFlowState('player-1').zone).toBe('flow');

    // Phase 3: Player masters it (boredom)
    for (let i = 0; i < 20; i++) {
      const cid = `mastered-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.arithmetic'));
      engine.recordAttempt('player-1', cid, makeSuccess());
    }
    expect(engine.getFlowState('player-1').zone).toBe('boredom');
    expect(engine.shouldEscalate('player-1')).toBe(true);

    // Phase 4: Difficulty increases, back to flow
    for (let i = 0; i < 20; i++) {
      const cid = `harder-${i}`;
      engine.registerChallenge(makeChallenge(cid, 'math.algebra'));
      const outcome = i % 4 === 0 ? makeFailure() : makeSuccess();
      engine.recordAttempt('player-1', cid, outcome);
    }
    expect(engine.getFlowState('player-1').zone).toBe('flow');
  });
});
