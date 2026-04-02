import { describe, it, expect, beforeEach } from 'vitest';
import { CalibrationSystem } from '../../src/systems/calibration.js';
import type {
  CalibrationResponse,
  CalibrationSession,
  CalibrationSubject,
} from '../../src/types/calibration.js';
import { ALL_CALIBRATION_SUBJECTS } from '../../src/types/calibration.js';

// --- Helpers ---

function fastCorrect(): CalibrationResponse {
  return { correct: true, responseTimeMs: 1500, attemptCount: 1 };
}

function slowCorrect(): CalibrationResponse {
  return { correct: true, responseTimeMs: 5000, attemptCount: 1 };
}

function incorrect(): CalibrationResponse {
  return { correct: false, responseTimeMs: 5000, attemptCount: 1 };
}

function noAttempt(): CalibrationResponse {
  return { correct: false, responseTimeMs: 15000, attemptCount: 0 };
}

function runCalibrationToCompletion(
  system: CalibrationSystem,
  sessionId: string,
  response: CalibrationResponse = slowCorrect(),
): void {
  let safety = 0;
  while (!system.isComplete(sessionId) && safety < 50) {
    const next = system.processResponse(sessionId, response);
    if (next.done) break;
    safety++;
  }
}

describe('CalibrationSystem', () => {
  let system: CalibrationSystem;

  beforeEach(() => {
    system = new CalibrationSystem();
  });

  // --- System Identity ---

  describe('ECS System interface', () => {
    it('has correct name and priority', () => {
      expect(system.name).toBe('calibration');
      expect(system.priority).toBe(3);
    });
  });

  // --- Session Creation ---

  describe('startCalibration', () => {
    it('creates a session with unique ID', () => {
      const session = system.startCalibration('player-1', 8);
      expect(session.id).toContain('cal-player-1');
      expect(session.profileId).toBe('player-1');
    });

    it('initializes all 6 subjects', () => {
      const session = system.startCalibration('p1', 10);
      expect(session.subjects).toHaveLength(6);
      expect(session.subjects).toEqual(expect.arrayContaining([
        'math', 'reading', 'science', 'logic', 'spatial', 'vocabulary',
      ]));
    });

    it('sets starting level based on estimated age', () => {
      const young = system.startCalibration('p-young', 3);
      const mid = system.startCalibration('p-mid', 10);
      const old = system.startCalibration('p-old', 18);

      expect(young.currentLevel).toBeLessThan(mid.currentLevel);
      expect(mid.currentLevel).toBeLessThan(old.currentLevel);
    });

    it('age 2-3 starts at foundation level', () => {
      const session = system.startCalibration('p1', 2);
      expect(session.currentLevel).toBe(0.05);
    });

    it('age 6-8 starts at discovery level', () => {
      const session = system.startCalibration('p1', 7);
      expect(session.currentLevel).toBe(0.30);
    });

    it('age 11-13 starts at builder level', () => {
      const session = system.startCalibration('p1', 12);
      expect(session.currentLevel).toBe(0.55);
    });

    it('age 17-18 starts at innovator level', () => {
      const session = system.startCalibration('p1', 17);
      expect(session.currentLevel).toBe(0.80);
    });

    it('age 25+ starts at creator level', () => {
      const session = system.startCalibration('p1', 30);
      expect(session.currentLevel).toBe(0.90);
    });

    it('initializes subject states for all subjects', () => {
      const session = system.startCalibration('p1', 10);
      for (const subject of ALL_CALIBRATION_SUBJECTS) {
        const state = session.subjectStates.get(subject);
        expect(state).toBeDefined();
        expect(state!.done).toBe(false);
        expect(state!.interactions).toBe(0);
      }
    });

    it('sets max interactions to 30', () => {
      const session = system.startCalibration('p1', 10);
      expect(session.maxInteractions).toBe(30);
    });

    it('starts with math as first subject', () => {
      const session = system.startCalibration('p1', 10);
      expect(session.currentSubject).toBe('math');
    });

    it('is not completed initially', () => {
      const session = system.startCalibration('p1', 10);
      expect(session.completed).toBe(false);
    });
  });

  // --- Binary Search Algorithm ---

  describe('binary search algorithm', () => {
    it('fast correct response jumps up 2 steps', () => {
      const session = system.startCalibration('p1', 10);
      const initialLevel = session.subjectStates.get('math')!.level;

      system.processResponse(session.id, fastCorrect());

      const updatedSession = system.getSession(session.id)!;
      const mathState = updatedSession.subjectStates.get('math')!;
      expect(mathState.level).toBeGreaterThan(initialLevel);
      // Fast correct jumps up by stepSize * 2 = 0.2 * 2 = 0.4
      expect(mathState.level).toBeCloseTo(initialLevel + 0.4, 1);
    });

    it('slow correct response jumps up 1 step', () => {
      const session = system.startCalibration('p1', 10);
      const initialLevel = session.subjectStates.get('math')!.level;

      system.processResponse(session.id, slowCorrect());

      const updatedSession = system.getSession(session.id)!;
      const mathState = updatedSession.subjectStates.get('math')!;
      expect(mathState.level).toBeGreaterThan(initialLevel);
      // Slow correct jumps up by stepSize = 0.2
      expect(mathState.level).toBeCloseTo(initialLevel + 0.2, 1);
    });

    it('incorrect response drops 1 step', () => {
      const session = system.startCalibration('p1', 10);
      const initialLevel = session.subjectStates.get('math')!.level;

      system.processResponse(session.id, incorrect());

      const updatedSession = system.getSession(session.id)!;
      const mathState = updatedSession.subjectStates.get('math')!;
      expect(mathState.level).toBeLessThan(initialLevel);
    });

    it('no attempt (>10s) marks subject as done', () => {
      const session = system.startCalibration('p1', 10);

      system.processResponse(session.id, noAttempt());

      const updatedSession = system.getSession(session.id)!;
      const mathState = updatedSession.subjectStates.get('math')!;
      expect(mathState.done).toBe(true);
    });

    it('level never goes below 0.0', () => {
      const session = system.startCalibration('p1', 3);

      // Multiple incorrect responses to push level down
      for (let i = 0; i < 5; i++) {
        const next = system.processResponse(session.id, incorrect());
        if (next.done) break;
      }

      const updatedSession = system.getSession(session.id)!;
      for (const [_, state] of updatedSession.subjectStates) {
        expect(state.level).toBeGreaterThanOrEqual(0.0);
      }
    });

    it('level never exceeds 1.0', () => {
      const session = system.startCalibration('p1', 18);

      // Multiple fast correct responses to push level up
      for (let i = 0; i < 10; i++) {
        const next = system.processResponse(session.id, fastCorrect());
        if (next.done) break;
      }

      const updatedSession = system.getSession(session.id)!;
      for (const [_, state] of updatedSession.subjectStates) {
        expect(state.level).toBeLessThanOrEqual(1.0);
      }
    });

    it('step size decays for convergence', () => {
      const session = system.startCalibration('p1', 10);
      const initialStep = session.subjectStates.get('math')!.stepSize;

      system.processResponse(session.id, slowCorrect());

      const mathState = system.getSession(session.id)!.subjectStates.get('math')!;
      expect(mathState.stepSize).toBeLessThan(initialStep);
    });

    it('converges to stable level after multiple interactions', () => {
      const session = system.startCalibration('p1', 10);

      // Simulate: player is around level 0.5 — alternate correct/incorrect
      const responses = [
        slowCorrect(), slowCorrect(), incorrect(),
        slowCorrect(), incorrect(),
      ];

      for (const response of responses) {
        const next = system.processResponse(session.id, response);
        if (next.done) break;
      }

      // Step size should have decreased significantly
      const mathState = system.getSession(session.id)!.subjectStates.get('math')!;
      expect(mathState.stepSize).toBeLessThan(0.2);
    });
  });

  // --- Subject Cycling ---

  describe('subject cycling', () => {
    it('cycles through subjects in round-robin order', () => {
      const session = system.startCalibration('p1', 10);
      const subjects: CalibrationSubject[] = [];

      subjects.push(session.currentSubject);

      for (let i = 0; i < 6; i++) {
        const next = system.processResponse(session.id, slowCorrect());
        if (next.nextSubject) {
          subjects.push(next.nextSubject);
        }
      }

      // Should cycle through all 6 subjects
      const unique = new Set(subjects);
      expect(unique.size).toBeGreaterThanOrEqual(5);
    });

    it('skips completed subjects', () => {
      const session = system.startCalibration('p1', 10);

      // Mark math as done via no-attempt
      system.processResponse(session.id, noAttempt());

      // Next subject should not be math
      const updatedSession = system.getSession(session.id)!;
      expect(updatedSession.currentSubject).not.toBe('math');
    });
  });

  // --- Completion ---

  describe('completion', () => {
    it('isComplete returns false initially', () => {
      const session = system.startCalibration('p1', 10);
      expect(system.isComplete(session.id)).toBe(false);
    });

    it('isComplete returns true for unknown session', () => {
      expect(system.isComplete('nonexistent')).toBe(true);
    });

    it('completes when max interactions reached', () => {
      const session = system.startCalibration('p1', 10);

      runCalibrationToCompletion(system, session.id);

      expect(system.isComplete(session.id)).toBe(true);
    });

    it('completes when all subjects are done', () => {
      const session = system.startCalibration('p1', 10);

      // Mark all subjects as done via no-attempt
      for (let i = 0; i < 10; i++) {
        const next = system.processResponse(session.id, noAttempt());
        if (next.done) break;
      }

      expect(system.isComplete(session.id)).toBe(true);
    });

    it('returns done=true on processResponse after completion', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id);

      const next = system.processResponse(session.id, slowCorrect());
      expect(next.done).toBe(true);
    });
  });

  // --- Results ---

  describe('getResults', () => {
    it('returns empty results for unknown session', () => {
      const results = system.getResults('nonexistent');
      expect(results.skillLevels.size).toBe(0);
      expect(results.detectedTier).toBe('foundation');
      expect(results.interests).toEqual([]);
    });

    it('returns skill levels after calibration', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id);

      const results = system.getResults(session.id);
      expect(results.skillLevels.size).toBeGreaterThan(0);
    });

    it('detects foundation tier for young players', () => {
      const session = system.startCalibration('p1', 3);

      // Answer everything incorrectly
      runCalibrationToCompletion(system, session.id, incorrect());

      const results = system.getResults(session.id);
      expect(results.detectedTier).toBe('foundation');
    });

    it('detects higher tiers for high-performing players', () => {
      const session = system.startCalibration('p1', 16);

      // Answer everything quickly and correctly
      runCalibrationToCompletion(system, session.id, fastCorrect());

      const results = system.getResults(session.id);
      expect(['builder', 'innovator', 'creator']).toContain(results.detectedTier);
    });

    it('identifies interests based on response patterns', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id, fastCorrect());

      const results = system.getResults(session.id);
      expect(results.interests.length).toBeGreaterThanOrEqual(0);
      expect(results.interests.length).toBeLessThanOrEqual(2);
    });

    it('reports estimated duration', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id);

      const results = system.getResults(session.id);
      expect(results.estimatedDuration).toBeGreaterThanOrEqual(0);
    });

    it('skill levels are between 0 and 1', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id, fastCorrect());

      const results = system.getResults(session.id);
      for (const [_, level] of results.skillLevels) {
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(1);
      }
    });
  });

  // --- First Challenge ---

  describe('getFirstChallenge', () => {
    it('returns first challenge with intro dialogue', () => {
      const session = system.startCalibration('p1', 10);
      const first = system.getFirstChallenge(session.id);

      expect(first.done).toBe(false);
      expect(first.nextSubject).toBe('math');
      expect(first.nextChallenge).toBeTruthy();
      expect(first.companionDialogue).toBeTruthy();
      expect(first.companionDialogue.length).toBeGreaterThan(20);
    });

    it('returns done for unknown session', () => {
      const first = system.getFirstChallenge('nonexistent');
      expect(first.done).toBe(true);
    });

    it('challenge ID matches the subject', () => {
      const session = system.startCalibration('p1', 10);
      const first = system.getFirstChallenge(session.id);
      expect(first.nextChallenge).toContain('cal-math');
    });
  });

  // --- Companion Dialogue ---

  describe('companion dialogue (Principle VI compliance)', () => {
    it('intro dialogue never says "good job" or implies judgment', () => {
      const session = system.startCalibration('p1', 8);
      const first = system.getFirstChallenge(session.id);
      const dialogue = first.companionDialogue.toLowerCase();

      expect(dialogue).not.toContain('good job');
      expect(dialogue).not.toContain('correct');
      expect(dialogue).not.toContain('wrong');
      expect(dialogue).not.toContain('test');
      expect(dialogue).not.toContain('quiz');
      expect(dialogue).not.toContain('assessment');
    });

    it('transition dialogue maintains adventure feeling', () => {
      const session = system.startCalibration('p1', 10);

      const next = system.processResponse(session.id, slowCorrect());
      if (!next.done) {
        const dialogue = next.companionDialogue.toLowerCase();
        expect(dialogue).not.toContain('good job');
        expect(dialogue).not.toContain('score');
        expect(dialogue).not.toContain('grade');
        expect(dialogue).not.toContain('test');
      }
    });

    it('completion dialogue is celebratory about exploration, not grades', () => {
      const session = system.startCalibration('p1', 10);
      runCalibrationToCompletion(system, session.id);

      // Process one more to get completion dialogue
      const result = system.processResponse(session.id, slowCorrect());
      const dialogue = result.companionDialogue.toLowerCase();

      expect(dialogue).not.toContain('score');
      expect(dialogue).not.toContain('grade');
      expect(dialogue).not.toContain('level');
      expect(dialogue).not.toContain('test');
    });

    it('dialogue always has content (never empty)', () => {
      const session = system.startCalibration('p1', 10);

      for (let i = 0; i < 10; i++) {
        const next = system.processResponse(session.id, slowCorrect());
        expect(next.companionDialogue).toBeTruthy();
        expect(next.companionDialogue.length).toBeGreaterThan(5);
        if (next.done) break;
      }
    });
  });

  // --- Challenge Selection ---

  describe('challenge selection', () => {
    it('selects challenge appropriate for estimated level', () => {
      const session = system.startCalibration('p1', 3);
      const first = system.getFirstChallenge(session.id);
      // Age 3 should get a low-level math challenge
      expect(first.nextChallenge).toContain('cal-math');
    });

    it('selects higher-level challenges as level increases', () => {
      const session = system.startCalibration('p1', 16);
      const first = system.getFirstChallenge(session.id);
      // Age 16 should start with higher-level challenges
      expect(first.nextLevel).toBeGreaterThan(0.5);
    });

    it('processResponse returns a next challenge when not done', () => {
      const session = system.startCalibration('p1', 10);
      const next = system.processResponse(session.id, slowCorrect());

      if (!next.done) {
        expect(next.nextChallenge).toBeTruthy();
        expect(next.nextSubject).toBeTruthy();
        expect(next.nextLevel).toBeDefined();
      }
    });
  });

  // --- Calibration at Different Ages ---

  describe('calibration at different ages', () => {
    it('age 2 calibrates at lowest levels', () => {
      const session = system.startCalibration('p1', 2);
      expect(session.currentLevel).toBe(0.05);
    });

    it('age 10 calibrates at mid-discovery level', () => {
      const session = system.startCalibration('p1', 10);
      expect(session.currentLevel).toBe(0.40);
    });

    it('age 14 calibrates at builder level', () => {
      const session = system.startCalibration('p1', 14);
      expect(session.currentLevel).toBe(0.70);
    });

    it('different ages produce different detected tiers', () => {
      const youngSession = system.startCalibration('young', 3);
      runCalibrationToCompletion(system, youngSession.id, incorrect());
      const youngResults = system.getResults(youngSession.id);

      const teenSession = system.startCalibration('teen', 16);
      runCalibrationToCompletion(system, teenSession.id, fastCorrect());
      const teenResults = system.getResults(teenSession.id);

      // Young player answering incorrectly should be at lower tier
      expect(youngResults.detectedTier).not.toBe(teenResults.detectedTier);
    });
  });

  // --- Edge Cases ---

  describe('edge cases', () => {
    it('handles very young age (age 1)', () => {
      const session = system.startCalibration('p1', 1);
      expect(session.currentLevel).toBe(0.05);
    });

    it('handles very old age (age 50)', () => {
      const session = system.startCalibration('p1', 50);
      expect(session.currentLevel).toBe(0.90);
    });

    it('multiple sessions for same profile are independent', () => {
      const s1 = system.startCalibration('p1', 5);
      const s2 = system.startCalibration('p1', 15);

      expect(s1.id).not.toBe(s2.id);
      expect(s1.currentLevel).not.toBe(s2.currentLevel);
    });

    it('processResponse for nonexistent session returns done', () => {
      const next = system.processResponse('fake', slowCorrect());
      expect(next.done).toBe(true);
    });

    it('getSession returns undefined for nonexistent session', () => {
      expect(system.getSession('fake')).toBeUndefined();
    });

    it('calibration handles mixed response patterns', () => {
      const session = system.startCalibration('p1', 10);

      const responses: CalibrationResponse[] = [
        fastCorrect(), incorrect(), slowCorrect(),
        fastCorrect(), incorrect(), slowCorrect(),
        noAttempt(), fastCorrect(), incorrect(),
        slowCorrect(),
      ];

      for (const response of responses) {
        const next = system.processResponse(session.id, response);
        if (next.done) break;
      }

      // Should still be able to get valid results
      const results = system.getResults(session.id);
      expect(results.skillLevels.size).toBeGreaterThan(0);
    });
  });

  // --- Principle 0 Enforcement ---

  describe('feels like play, not school (Principle 0)', () => {
    it('never mentions testing, quizzes, or assessment', () => {
      const session = system.startCalibration('p1', 10);
      const first = system.getFirstChallenge(session.id);
      const allDialogue: string[] = [first.companionDialogue];

      for (let i = 0; i < 15; i++) {
        const next = system.processResponse(session.id, slowCorrect());
        allDialogue.push(next.companionDialogue);
        if (next.done) break;
      }

      const combined = allDialogue.join(' ').toLowerCase();
      expect(combined).not.toContain('test');
      expect(combined).not.toContain('quiz');
      expect(combined).not.toContain('assessment');
      expect(combined).not.toContain('exam');
      expect(combined).not.toContain('score');
      expect(combined).not.toContain('grade');
    });

    it('uses adventure/exploration language', () => {
      const session = system.startCalibration('p1', 8);
      const first = system.getFirstChallenge(session.id);
      const dialogue = first.companionDialogue.toLowerCase();

      const adventureWords = ['explore', 'discover', 'puzzle', 'wonder', 'exciting', 'adventure', 'amazing', 'fun', 'cool', 'secrets'];
      const hasAdventureWord = adventureWords.some((word) => dialogue.includes(word));
      expect(hasAdventureWord).toBe(true);
    });
  });

  // --- ALL_CALIBRATION_SUBJECTS constant ---

  describe('ALL_CALIBRATION_SUBJECTS', () => {
    it('contains exactly 6 subjects', () => {
      expect(ALL_CALIBRATION_SUBJECTS).toHaveLength(6);
    });

    it('contains all expected subjects', () => {
      expect(ALL_CALIBRATION_SUBJECTS).toContain('math');
      expect(ALL_CALIBRATION_SUBJECTS).toContain('reading');
      expect(ALL_CALIBRATION_SUBJECTS).toContain('science');
      expect(ALL_CALIBRATION_SUBJECTS).toContain('logic');
      expect(ALL_CALIBRATION_SUBJECTS).toContain('spatial');
      expect(ALL_CALIBRATION_SUBJECTS).toContain('vocabulary');
    });
  });
});
