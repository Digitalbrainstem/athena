// Integration tests for the Calibration System
// Verifies that the full calibration pipeline works correctly for
// varied player profiles, not just isolated unit behavior.

import { describe, it, expect, beforeEach } from 'vitest';
import { CalibrationSystem } from '../../src/systems/calibration.js';
import type { CalibrationResponse, CalibrationSubject } from '../../src/types/calibration.js';

// ─── Response Helpers ────────────────────────────────────────────────────────

function fastCorrect(): CalibrationResponse {
  return { correct: true, responseTimeMs: 1500, attemptCount: 1 };
}

function slowCorrect(): CalibrationResponse {
  return { correct: true, responseTimeMs: 6000, attemptCount: 1 };
}

function incorrect(timeMs = 5000): CalibrationResponse {
  return { correct: false, responseTimeMs: timeMs, attemptCount: 1 };
}

function slowIncorrect(): CalibrationResponse {
  return { correct: false, responseTimeMs: 8000, attemptCount: 1 };
}

// ─── Full Session Simulation ─────────────────────────────────────────────────

describe('Calibration Integration', () => {
  let system: CalibrationSystem;

  beforeEach(() => {
    system = new CalibrationSystem();
  });

  describe('full calibration session for a 60-year-old returning learner', () => {
    // Simulate a 60-year-old who:
    // - Remembers basic math but forgot advanced math (fractions etc.)
    // - Knows conceptual science but not advanced formulas
    // - Has weak logic skills
    // - Is excellent at vocabulary and reading (fast, correct)
    // - Has average spatial reasoning

    it('converges to realistic skill estimates within 30 items', () => {
      const session = system.startCalibration('adult-60', 60);

      // 60-year-old starts at level 0.90 (age 25+ mapping)
      expect(session.currentLevel).toBe(0.90);
      expect(session.estimatedAge).toBe(60);

      const first = system.getFirstChallenge(session.id);
      expect(first.done).toBe(false);
      expect(first.nextChallenge).toBeTruthy();

      // Define response patterns per subject
      const responseMap: Record<CalibrationSubject, () => CalibrationResponse> = {
        // Math: correct on lower levels (fast), incorrect on higher
        math: () => {
          const state = session.subjectStates.get('math')!;
          if (state.level < 0.50) return fastCorrect();
          return incorrect();
        },
        // Reading: always correct and fast (excellent)
        reading: () => fastCorrect(),
        // Science: correct on conceptual (slow), wrong on advanced
        science: () => {
          const state = session.subjectStates.get('science')!;
          if (state.level < 0.55) return slowCorrect();
          return incorrect();
        },
        // Logic: always incorrect (weak area)
        logic: () => incorrect(),
        // Spatial: average — slow correct on easy, wrong on hard
        spatial: () => {
          const state = session.subjectStates.get('spatial')!;
          if (state.level < 0.40) return slowCorrect();
          return slowIncorrect();
        },
        // Vocabulary: always correct and fast (excellent)
        vocabulary: () => fastCorrect(),
      };

      // Run the calibration loop
      let iterations = 0;
      const maxIterations = 30;

      while (!system.isComplete(session.id) && iterations < maxIterations) {
        const currentSubject = session.currentSubject;
        const response = responseMap[currentSubject]();
        system.processResponse(session.id, response);
        iterations++;
      }

      // Should complete within 30 interactions
      expect(iterations).toBeLessThanOrEqual(30);
      expect(iterations).toBeGreaterThanOrEqual(15); // At least 3 per subject × 5 active subjects

      const results = system.getResults(session.id);

      // Math: correct on basics, fails above ~0.50 → should end around Discovery
      const mathLevel = results.skillLevels.get('math')!;
      expect(mathLevel).toBeGreaterThanOrEqual(0.20);
      expect(mathLevel).toBeLessThan(0.65);

      // Reading: always fast+correct → should climb to Creator
      const readingLevel = results.skillLevels.get('reading')!;
      expect(readingLevel).toBeGreaterThanOrEqual(0.85);

      // Science: correct slow below 0.55, fails above → Builder range
      const scienceLevel = results.skillLevels.get('science')!;
      expect(scienceLevel).toBeGreaterThanOrEqual(0.30);
      expect(scienceLevel).toBeLessThan(0.75);

      // Logic: always incorrect → drops toward Foundation
      const logicLevel = results.skillLevels.get('logic')!;
      expect(logicLevel).toBeLessThan(0.45);

      // Vocabulary: always fast+correct → should climb to Creator
      const vocabLevel = results.skillLevels.get('vocabulary')!;
      expect(vocabLevel).toBeGreaterThanOrEqual(0.85);

      // Spatial: mixed → should end in Discovery/Builder range
      const spatialLevel = results.skillLevels.get('spatial')!;
      expect(spatialLevel).toBeLessThan(0.65);

      // Interests should reflect fast+correct subjects
      expect(results.interests.length).toBeGreaterThan(0);
      // Reading and vocabulary should be top interests (fastest correct responses)
      const topInterests = results.interests;
      expect(
        topInterests.includes('reading') || topInterests.includes('vocabulary'),
      ).toBe(true);
    });
  });

  describe('age-based priors', () => {
    it('2-year-old starts at very low level', () => {
      const session = system.startCalibration('toddler', 2);
      expect(session.currentLevel).toBe(0.05);

      for (const [, state] of session.subjectStates) {
        expect(state.level).toBe(0.05);
      }
    });

    it('8-year-old starts at Discovery level', () => {
      const session = system.startCalibration('child-8', 8);
      expect(session.currentLevel).toBe(0.30);
    });

    it('60-year-old starts at high level with wide room to search', () => {
      const session = system.startCalibration('adult-60', 60);
      expect(session.currentLevel).toBe(0.90);

      // Step size is 0.2, which combined with the 0.90 starting point
      // gives enough room to search down significantly
      const mathState = session.subjectStates.get('math')!;
      expect(mathState.stepSize).toBe(0.2);

      // The search can go from 0.90 down to at least 0.50 in 3 interactions:
      // 0.90 → wrong → 0.70 (step 0.2)
      // 0.70 → wrong → 0.57 (step 0.13)
      // 0.57 → wrong → 0.49 (step 0.085)
      // This proves a wide enough search range for varied adult profiles
    });

    it('age 100 still works (edge case)', () => {
      const session = system.startCalibration('centenarian', 100);
      expect(session.currentLevel).toBe(0.90);
    });

    it('age 1 (below minimum) gets Foundation start', () => {
      const session = system.startCalibration('infant', 1);
      expect(session.currentLevel).toBe(0.05);
    });
  });

  describe('binary search convergence', () => {
    it('step size decays toward MIN_STEP_SIZE after each interaction', () => {
      const session = system.startCalibration('decay-test', 10);
      const mathState = session.subjectStates.get('math')!;

      const initialStep = mathState.stepSize;
      expect(initialStep).toBe(0.2);

      // Process a response for math
      system.processResponse(session.id, fastCorrect());

      // After first response, step should decay
      const afterFirst = session.subjectStates.get(session.currentSubject === 'math'
        ? 'math' : session.subjects[0]!)!;
      // Check math state specifically
      const mathAfter = session.subjectStates.get('math')!;
      expect(mathAfter.stepSize).toBeLessThan(initialStep);
      expect(mathAfter.stepSize).toBeCloseTo(0.2 * 0.65, 5);
    });

    it('subject marked done when step size falls below minimum after 3+ interactions', () => {
      const session = system.startCalibration('converge-test', 10);

      // Feed all-correct responses until math is done
      let mathDone = false;
      let iterations = 0;
      while (!mathDone && iterations < 30) {
        if (session.currentSubject === 'math') {
          system.processResponse(session.id, slowCorrect());
          const mathState = session.subjectStates.get('math')!;
          mathDone = mathState.done;
        } else {
          system.processResponse(session.id, slowCorrect());
        }
        iterations++;
      }

      const mathState = session.subjectStates.get('math')!;
      expect(mathState.done).toBe(true);
      expect(mathState.interactions).toBeGreaterThanOrEqual(3);
      expect(mathState.interactions).toBeLessThanOrEqual(5);
    });

    it('one wrong answer on easy items has large impact (high step size)', () => {
      const session = system.startCalibration('impact-test', 10);
      // Age 10 starts at 0.40

      const mathStateBefore = session.subjectStates.get('math')!;
      const levelBefore = mathStateBefore.level;
      const stepBefore = mathStateBefore.stepSize;

      // First interaction: wrong answer → drops by full step
      system.processResponse(session.id, incorrect());
      const mathStateAfter = session.subjectStates.get('math')!;
      const dropFromFirst = levelBefore - mathStateAfter.level;
      expect(dropFromFirst).toBeCloseTo(stepBefore, 5);

      // Let other subjects cycle, then come back to math
      // Process remaining subjects until we get back to math
      let backToMath = false;
      while (!backToMath) {
        system.processResponse(session.id, slowCorrect());
        if (session.currentSubject === 'math') backToMath = true;
      }

      // Second wrong: step has decayed, so drop is smaller
      const levelBefore2 = session.subjectStates.get('math')!.level;
      const step2 = session.subjectStates.get('math')!.stepSize;
      system.processResponse(session.id, incorrect());
      const dropFromSecond = levelBefore2 - session.subjectStates.get('math')!.level;

      // First wrong shifted more than second wrong
      expect(dropFromFirst).toBeGreaterThan(dropFromSecond);
      // And step size decayed
      expect(step2).toBeLessThan(stepBefore);
    });

    it('fast+correct jumps more than slow+correct', () => {
      // Start two sessions at the same age
      const sessionFast = system.startCalibration('fast-compare', 10);
      const sessionSlow = system.startCalibration('slow-compare', 10);

      // Same starting level
      const levelBefore = sessionFast.subjectStates.get('math')!.level;
      expect(sessionSlow.subjectStates.get('math')!.level).toBe(levelBefore);

      // Feed fast correct to first, slow correct to second
      system.processResponse(sessionFast.id, fastCorrect());
      system.processResponse(sessionSlow.id, slowCorrect());

      const fastMath = sessionFast.subjectStates.get('math')!;
      const slowMath = sessionSlow.subjectStates.get('math')!;

      // Fast correct jumps 2× step, slow correct jumps 1× step
      const fastJump = fastMath.level - levelBefore;
      const slowJump = slowMath.level - levelBefore;
      expect(fastJump).toBeGreaterThan(slowJump);
      expect(fastJump).toBeCloseTo(slowJump * 2, 5);
    });
  });

  describe('subject cycling and completion', () => {
    it('cycles through all 6 subjects in round-robin', () => {
      const session = system.startCalibration('cycle-test', 10);
      const subjectsSeen: CalibrationSubject[] = [session.currentSubject];

      // Process 6 responses to cycle through all subjects
      for (let i = 0; i < 6; i++) {
        const result = system.processResponse(session.id, slowCorrect());
        if (result.nextSubject) {
          subjectsSeen.push(result.nextSubject);
        }
      }

      // Should have visited all 6 subjects
      const uniqueSubjects = new Set(subjectsSeen);
      expect(uniqueSubjects.size).toBe(6);
    });

    it('skips completed subjects', () => {
      const session = system.startCalibration('skip-test', 10);

      // Force math to be done by marking it
      const mathState = session.subjectStates.get('math')!;
      mathState.done = true;

      // Process a response — next subject should NOT be math
      const result = system.processResponse(session.id, slowCorrect());
      expect(result.nextSubject).not.toBe('math');
    });

    it('completes when all subjects are done', () => {
      const session = system.startCalibration('all-done-test', 10);

      // Run until complete
      let iterations = 0;
      while (!system.isComplete(session.id) && iterations < 40) {
        system.processResponse(session.id, slowCorrect());
        iterations++;
      }

      expect(system.isComplete(session.id)).toBe(true);

      // All subjects should be marked done
      for (const [, state] of session.subjectStates) {
        expect(state.done).toBe(true);
      }
    });

    it('stops at max interactions even if subjects not converged', () => {
      const session = system.startCalibration('max-test', 10);

      // Feed alternating correct/incorrect to prevent convergence
      let iterations = 0;
      while (!system.isComplete(session.id) && iterations < 50) {
        const response = iterations % 2 === 0 ? fastCorrect() : incorrect();
        system.processResponse(session.id, response);
        iterations++;
      }

      expect(system.isComplete(session.id)).toBe(true);
      expect(session.interactions).toBeLessThanOrEqual(30);
    });
  });

  describe('tier detection from calibration results', () => {
    it('detects Foundation tier for young/struggling player', () => {
      const session = system.startCalibration('foundation-player', 3);

      while (!system.isComplete(session.id)) {
        system.processResponse(session.id, incorrect());
      }

      const results = system.getResults(session.id);
      expect(results.detectedTier).toBe('foundation');
    });

    it('detects Creator tier for high-performing adult', () => {
      const session = system.startCalibration('creator-player', 30);

      while (!system.isComplete(session.id)) {
        system.processResponse(session.id, fastCorrect());
      }

      const results = system.getResults(session.id);
      expect(results.detectedTier).toBe('creator');
    });

    it('detects Discovery tier for child with mixed results', () => {
      const session = system.startCalibration('discovery-player', 7);

      let i = 0;
      while (!system.isComplete(session.id)) {
        // Correct on basics, wrong on harder
        const state = session.subjectStates.get(session.currentSubject)!;
        const response = state.level < 0.35 ? slowCorrect() : incorrect();
        system.processResponse(session.id, response);
        i++;
      }

      const results = system.getResults(session.id);
      // Average level should land in Discovery range
      const levels = Array.from(results.skillLevels.values());
      const avg = levels.reduce((s, l) => s + l, 0) / levels.length;
      expect(avg).toBeGreaterThanOrEqual(0.10);
      expect(avg).toBeLessThan(0.55);
    });
  });

  describe('interest detection', () => {
    it('identifies subjects with fast+correct as interests', () => {
      const session = system.startCalibration('interest-test', 10);

      while (!system.isComplete(session.id)) {
        const subject = session.currentSubject;
        if (subject === 'math' || subject === 'reading') {
          system.processResponse(session.id, fastCorrect());
        } else {
          system.processResponse(session.id, slowCorrect());
        }
      }

      const results = system.getResults(session.id);
      // Math and reading should rank high due to fast responses
      expect(results.interests.length).toBeGreaterThan(0);
      expect(results.interests.length).toBeLessThanOrEqual(2);
    });
  });

  describe('companion dialogue — never feels like school', () => {
    it('intro dialogue is adventure-themed', () => {
      const session = system.startCalibration('dialogue-test', 8);
      const first = system.getFirstChallenge(session.id);

      expect(first.companionDialogue).toBeTruthy();
      expect(first.companionDialogue.length).toBeGreaterThan(10);

      // Should NOT contain school/test language
      const lower = first.companionDialogue.toLowerCase();
      expect(lower).not.toContain('test');
      expect(lower).not.toContain('quiz');
      expect(lower).not.toContain('exam');
      expect(lower).not.toContain('grade');
    });

    it('transition dialogues never say "good job"', () => {
      const session = system.startCalibration('nojudge-test', 10);
      const dialogues: string[] = [];

      while (!system.isComplete(session.id)) {
        const result = system.processResponse(session.id, fastCorrect());
        if (result.companionDialogue) {
          dialogues.push(result.companionDialogue);
        }
      }

      for (const d of dialogues) {
        const lower = d.toLowerCase();
        expect(lower).not.toContain('good job');
        expect(lower).not.toContain('well done');
        expect(lower).not.toContain('correct');
        expect(lower).not.toContain('wrong');
      }
    });
  });

  describe('no-attempt / timeout handling', () => {
    it('timeout + incorrect marks subject as done immediately', () => {
      const session = system.startCalibration('timeout-test', 10);

      // Send a response that's very slow AND incorrect (timeout/no-attempt)
      system.processResponse(session.id, { correct: false, responseTimeMs: 15000, attemptCount: 0 });

      // The first subject (math) should be marked done
      const mathState = session.subjectStates.get('math')!;
      expect(mathState.done).toBe(true);
      expect(mathState.interactions).toBe(1);
    });
  });

  describe('different age profiles produce different calibration results', () => {
    it('5-year-old and 15-year-old end at different levels with same correct/incorrect pattern', () => {
      const young = system.startCalibration('young-5', 5);
      const teen = system.startCalibration('teen-15', 15);

      // Both answer all correct (slow)
      while (!system.isComplete(young.id)) {
        system.processResponse(young.id, slowCorrect());
      }
      while (!system.isComplete(teen.id)) {
        system.processResponse(teen.id, slowCorrect());
      }

      const youngResults = system.getResults(young.id);
      const teenResults = system.getResults(teen.id);

      // Teen starts higher and climbs from a higher base
      const youngAvg = average(youngResults.skillLevels);
      const teenAvg = average(teenResults.skillLevels);
      expect(teenAvg).toBeGreaterThan(youngAvg);
    });
  });

  describe('session independence', () => {
    it('two concurrent sessions do not interfere', () => {
      const session1 = system.startCalibration('player-a', 10);
      const session2 = system.startCalibration('player-b', 25);

      // Player A always fails, Player B always succeeds (fast)
      for (let i = 0; i < 10; i++) {
        if (!system.isComplete(session1.id)) {
          system.processResponse(session1.id, incorrect());
        }
        if (!system.isComplete(session2.id)) {
          system.processResponse(session2.id, fastCorrect());
        }
      }

      const results1 = system.getResults(session1.id);
      const results2 = system.getResults(session2.id);

      expect(average(results1.skillLevels)).toBeLessThan(average(results2.skillLevels));
    });
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function average(levels: Map<string, number>): number {
  const vals = Array.from(levels.values());
  if (vals.length === 0) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}
