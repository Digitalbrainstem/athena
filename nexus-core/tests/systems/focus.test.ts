import { describe, it, expect, beforeEach } from 'vitest';
import { FocusModeSystem } from '../../src/systems/focus.js';
import { INTENSITY_WEIGHTS, DEFAULT_SKILL_WEIGHT, validateFocusRequest } from '../../src/types/focus.js';
import type { CompanionFocusRequest, ParentFocusRequest } from '../../src/types/focus.js';

describe('FocusModeSystem', () => {
  let system: FocusModeSystem;
  let now: number;

  beforeEach(() => {
    now = new Date('2025-01-15T10:00:00Z').getTime();
    system = new FocusModeSystem(() => now);
  });

  // ─── Entry A: Companion Focus Request ─────────────────────────────────

  describe('requestFocus (companion)', () => {
    it('creates a focus session from companion request', () => {
      const request: CompanionFocusRequest = {
        naturalLanguage: 'I want to practice fractions',
        parsedSkills: ['math.fractions'],
      };
      const session = system.requestFocus('player-1', request);

      expect(session.profileId).toBe('player-1');
      expect(session.source).toBe('companion');
      expect(session.skills).toEqual(['math.fractions']);
      expect(session.intensity).toBe('moderate'); // default
      expect(session.active).toBe(true);
      expect(session.questsCompleted).toBe(0);
    });

    it('uses specified intensity', () => {
      const request: CompanionFocusRequest = {
        naturalLanguage: 'Help me with algebra a lot',
        parsedSkills: ['math.algebra'],
        intensity: 'intensive',
      };
      const session = system.requestFocus('player-1', request);
      expect(session.intensity).toBe('intensive');
    });

    it('supports duration in quests', () => {
      const request: CompanionFocusRequest = {
        naturalLanguage: 'Practice geometry for a bit',
        parsedSkills: ['math.geometry'],
        durationQuests: 5,
      };
      const session = system.requestFocus('player-1', request);
      expect(session.durationQuests).toBe(5);
    });

    it('supports multiple skills', () => {
      const request: CompanionFocusRequest = {
        naturalLanguage: 'I want to work on math and reading',
        parsedSkills: ['math.arithmetic', 'language.reading'],
      };
      const session = system.requestFocus('player-1', request);
      expect(session.skills).toEqual(['math.arithmetic', 'language.reading']);
    });

    it('rejects empty skills list', () => {
      const request: CompanionFocusRequest = {
        naturalLanguage: 'I want to focus',
        parsedSkills: [],
      };
      expect(() => system.requestFocus('player-1', request)).toThrow('Invalid focus request');
    });
  });

  // ─── Entry B: Parent/Teacher Focus ────────────────────────────────────

  describe('setParentFocus', () => {
    it('creates a parent-initiated focus session', () => {
      const focus: ParentFocusRequest = {
        skills: ['math.fractions', 'math.ratios'],
        intensity: 'moderate',
        source: 'parent',
        durationQuests: 10,
      };
      const session = system.setParentFocus('player-1', focus);

      expect(session.source).toBe('parent');
      expect(session.skills).toEqual(['math.fractions', 'math.ratios']);
      expect(session.intensity).toBe('moderate');
      expect(session.durationQuests).toBe(10);
    });

    it('creates a teacher-initiated focus session', () => {
      const focus: ParentFocusRequest = {
        skills: ['science.chemistry.stoichiometry'],
        intensity: 'intensive',
        source: 'teacher',
        reason: 'Upcoming lab requires stoichiometry',
      };
      const session = system.setParentFocus('player-1', focus);
      expect(session.source).toBe('teacher');
    });

    it('rejects invalid focus with too many skills', () => {
      const skills = Array.from({ length: 15 }, (_, i) => `math.skill${i}`);
      const focus: ParentFocusRequest = {
        skills,
        intensity: 'moderate',
        source: 'parent',
      };
      expect(() => system.setParentFocus('player-1', focus)).toThrow('Invalid parent focus');
    });
  });

  // ─── Entry C: Study Forge ─────────────────────────────────────────────

  describe('enterStudyForge', () => {
    it('creates an intensive focus session', () => {
      const session = system.enterStudyForge('player-1', ['math.algebra']);
      expect(session.source).toBe('study_forge');
      expect(session.intensity).toBe('intensive');
      expect(session.skills).toEqual(['math.algebra']);
      expect(session.durationQuests).toBeNull(); // Indefinite
    });

    it('uses default skills when none provided', () => {
      const session = system.enterStudyForge('player-1');
      expect(session.skills.length).toBeGreaterThan(0);
    });

    it('uses default skills when empty array provided', () => {
      const session = system.enterStudyForge('player-1', []);
      expect(session.skills.length).toBeGreaterThan(0);
    });

    it('limits skills to MAX_FOCUS_SKILLS', () => {
      const manySkills = Array.from({ length: 20 }, (_, i) => `math.skill${i}`);
      const session = system.enterStudyForge('player-1', manySkills);
      expect(session.skills.length).toBeLessThanOrEqual(10);
    });
  });

  // ─── Active Session Management ────────────────────────────────────────

  describe('session management', () => {
    it('getActiveFocus returns null when no session', () => {
      expect(system.getActiveFocus('player-1')).toBeNull();
    });

    it('getActiveFocus returns active session', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      const session = system.getActiveFocus('player-1');
      expect(session).not.toBeNull();
      expect(session!.skills).toEqual(['math.fractions']);
    });

    it('hasFocus reports correctly', () => {
      expect(system.hasFocus('player-1')).toBe(false);
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      expect(system.hasFocus('player-1')).toBe(true);
    });

    it('clearFocus deactivates session', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      system.clearFocus('player-1');
      expect(system.hasFocus('player-1')).toBe(false);
      expect(system.getActiveFocus('player-1')).toBeNull();
    });

    it('new focus session replaces existing one', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      system.requestFocus('player-1', {
        naturalLanguage: 'algebra',
        parsedSkills: ['math.algebra'],
      });
      const session = system.getActiveFocus('player-1');
      expect(session!.skills).toEqual(['math.algebra']);
    });

    it('multiple profiles have independent focus sessions', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      system.enterStudyForge('player-2', ['science.chemistry']);

      expect(system.getActiveFocus('player-1')!.skills).toEqual(['math.fractions']);
      expect(system.getActiveFocus('player-2')!.skills).toEqual(['science.chemistry']);
    });
  });

  // ─── Quest Completion Tracking ────────────────────────────────────────

  describe('recordQuestCompletion', () => {
    it('increments quest count', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });

      system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 });
      const session = system.getActiveFocus('player-1');
      expect(session!.questsCompleted).toBe(1);
    });

    it('tracks skill progress for focus skills only', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });

      system.recordQuestCompletion('player-1', ['math.fractions', 'math.arithmetic'], {
        'math.fractions': 0.15,
        'math.arithmetic': 0.05, // Not a focus skill
      });

      const session = system.getActiveFocus('player-1');
      expect(session!.skillProgress['math.fractions']).toBe(0.15);
      expect(session!.skillProgress['math.arithmetic']).toBeUndefined();
    });

    it('accumulates progress across quests', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });

      system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 });
      system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.2 });

      const session = system.getActiveFocus('player-1');
      expect(session!.skillProgress['math.fractions']).toBeCloseTo(0.3);
      expect(session!.questsCompleted).toBe(2);
    });

    it('auto-clears session when duration reached', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        durationQuests: 3,
      });

      expect(system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 })).toBe(true);
      expect(system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 })).toBe(true);
      expect(system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 })).toBe(false);

      expect(system.hasFocus('player-1')).toBe(false);
    });

    it('returns false for non-existent session', () => {
      expect(system.recordQuestCompletion('player-1', ['math.fractions'], {})).toBe(false);
    });

    it('indefinite sessions never auto-clear', () => {
      system.enterStudyForge('player-1', ['math.algebra']);

      for (let i = 0; i < 100; i++) {
        expect(system.recordQuestCompletion('player-1', ['math.algebra'], { 'math.algebra': 0.01 })).toBe(true);
      }

      expect(system.hasFocus('player-1')).toBe(true);
      expect(system.getActiveFocus('player-1')!.questsCompleted).toBe(100);
    });
  });

  // ─── Skill Weights (Quest Engine Integration) ─────────────────────────

  describe('getSkillWeights', () => {
    it('returns empty map when no focus session', () => {
      const weights = system.getSkillWeights('player-1');
      expect(weights.size).toBe(0);
    });

    it('returns weights for focus skills with subtle intensity', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        intensity: 'subtle',
      });

      const weights = system.getSkillWeights('player-1');
      expect(weights.get('math.fractions')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.subtle);
    });

    it('returns weights for focus skills with moderate intensity', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        intensity: 'moderate',
      });

      const weights = system.getSkillWeights('player-1');
      expect(weights.get('math.fractions')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.moderate);
    });

    it('returns weights for focus skills with intensive intensity', () => {
      system.enterStudyForge('player-1', ['math.algebra']);

      const weights = system.getSkillWeights('player-1');
      expect(weights.get('math.algebra')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.intensive);
    });

    it('subtle has lowest weight multiplier', () => {
      expect(INTENSITY_WEIGHTS.subtle).toBeLessThan(INTENSITY_WEIGHTS.moderate);
      expect(INTENSITY_WEIGHTS.moderate).toBeLessThan(INTENSITY_WEIGHTS.intensive);
    });
  });

  describe('getDetailedSkillWeights', () => {
    it('returns empty array when no focus session', () => {
      expect(system.getDetailedSkillWeights('player-1')).toEqual([]);
    });

    it('returns detailed weights with source info', () => {
      system.setParentFocus('player-1', {
        skills: ['math.fractions', 'math.ratios'],
        intensity: 'moderate',
        source: 'parent',
      });

      const weights = system.getDetailedSkillWeights('player-1');
      expect(weights.length).toBe(2);
      expect(weights[0]!.source).toBe('parent');
      expect(weights[0]!.skillId).toBe('math.fractions');
      expect(weights[0]!.weight).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.moderate);
    });
  });

  describe('applyFocusWeights', () => {
    it('returns unchanged weights when no focus session', () => {
      const base = new Map([['math.fractions', 1.0], ['math.algebra', 1.0]]);
      const result = system.applyFocusWeights('player-1', base);
      expect(result.get('math.fractions')).toBe(1.0);
      expect(result.get('math.algebra')).toBe(1.0);
    });

    it('multiplies focus skill weights by intensity', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        intensity: 'moderate',
      });

      const base = new Map([['math.fractions', 1.0], ['math.algebra', 1.0]]);
      const result = system.applyFocusWeights('player-1', base);

      expect(result.get('math.fractions')).toBe(1.0 * INTENSITY_WEIGHTS.moderate);
      expect(result.get('math.algebra')).toBe(1.0); // Unchanged
    });

    it('adds focus skills not in base map', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        intensity: 'subtle',
      });

      const base = new Map([['math.algebra', 1.0]]);
      const result = system.applyFocusWeights('player-1', base);

      expect(result.get('math.fractions')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.subtle);
      expect(result.get('math.algebra')).toBe(1.0);
    });

    it('does not modify the original base map', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        intensity: 'intensive',
      });

      const base = new Map([['math.fractions', 1.0]]);
      system.applyFocusWeights('player-1', base);
      expect(base.get('math.fractions')).toBe(1.0); // Original unchanged
    });
  });

  // ─── Focus Summary ────────────────────────────────────────────────────

  describe('getFocusSummary', () => {
    it('returns null when no focus session', () => {
      expect(system.getFocusSummary('player-1')).toBeNull();
    });

    it('returns summary with quest count for duration session', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
        durationQuests: 10,
      });
      system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.1 });

      const summary = system.getFocusSummary('player-1');
      expect(summary).not.toBeNull();
      expect(summary).toContain('1/10');
      expect(summary).toContain('math.fractions');
    });

    it('returns summary without duration for indefinite session', () => {
      system.enterStudyForge('player-1', ['math.algebra']);
      system.recordQuestCompletion('player-1', ['math.algebra'], { 'math.algebra': 0.05 });

      const summary = system.getFocusSummary('player-1');
      expect(summary).not.toBeNull();
      expect(summary).toContain('1 quests completed');
      expect(summary).toContain('math.algebra');
    });
  });

  // ─── Validation ───────────────────────────────────────────────────────

  describe('validateFocusRequest', () => {
    it('accepts valid request', () => {
      expect(validateFocusRequest(['math.fractions'], 'moderate', 5)).toEqual([]);
    });

    it('rejects empty skills', () => {
      const errors = validateFocusRequest([], 'moderate');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects too many skills', () => {
      const skills = Array.from({ length: 15 }, (_, i) => `skill${i}`);
      const errors = validateFocusRequest(skills, 'moderate');
      expect(errors.some(e => e.includes('Maximum'))).toBe(true);
    });

    it('rejects duplicate skills', () => {
      const errors = validateFocusRequest(['math.fractions', 'math.fractions'], 'moderate');
      expect(errors.some(e => e.includes('Duplicate'))).toBe(true);
    });

    it('rejects zero duration', () => {
      const errors = validateFocusRequest(['math.fractions'], 'moderate', 0);
      expect(errors.some(e => e.includes('Duration'))).toBe(true);
    });
  });

  // ─── Clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all focus sessions', () => {
      system.requestFocus('player-1', {
        naturalLanguage: 'fractions',
        parsedSkills: ['math.fractions'],
      });
      system.enterStudyForge('player-2', ['math.algebra']);
      system.clear();

      expect(system.hasFocus('player-1')).toBe(false);
      expect(system.hasFocus('player-2')).toBe(false);
    });
  });
});
