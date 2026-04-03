// Integration tests for the Focus Mode System
// Verifies full workflows: parent-set focus → weight amplification →
// quest tracking → auto-clear after duration.

import { describe, it, expect, beforeEach } from 'vitest';
import { FocusModeSystem } from '../../src/systems/focus.js';
import { INTENSITY_WEIGHTS, DEFAULT_SKILL_WEIGHT } from '../../src/types/focus.js';
import type { ParentFocusRequest } from '../../src/types/focus.js';

describe('Focus Integration: Parent Sets Focus on Fractions', () => {
  let system: FocusModeSystem;
  let now: number;

  beforeEach(() => {
    now = new Date('2025-01-15T10:00:00Z').getTime();
    system = new FocusModeSystem(() => now);
  });

  it('full lifecycle: parent sets focus → weights amplify → quests tracked → auto-clears', () => {
    const focus: ParentFocusRequest = {
      skills: ['math.fractions'],
      intensity: 'moderate',
      source: 'parent',
      durationQuests: 5,
      reason: 'Teacher said fractions need work',
    };

    // Step 1: Parent sets focus
    const session = system.setParentFocus('child-1', focus);
    expect(session.active).toBe(true);
    expect(session.source).toBe('parent');
    expect(session.skills).toEqual(['math.fractions']);
    expect(session.durationQuests).toBe(5);

    // Step 2: Skill weights should amplify fractions
    const weights = system.getSkillWeights('child-1');
    expect(weights.get('math.fractions')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.moderate);

    // Step 3: Apply focus to quest selection base weights
    const baseWeights = new Map([
      ['math.fractions', 1.0],
      ['math.algebra', 1.0],
      ['science.physics', 1.0],
      ['language.reading', 1.0],
    ]);

    const adjusted = system.applyFocusWeights('child-1', baseWeights);
    expect(adjusted.get('math.fractions')).toBe(3.0); // 1.0 × 3.0 (moderate)
    expect(adjusted.get('math.algebra')).toBe(1.0); // Unchanged
    expect(adjusted.get('science.physics')).toBe(1.0); // Unchanged
    expect(adjusted.get('language.reading')).toBe(1.0); // Unchanged

    // Fractions should be 3× more likely to be selected
    const fractionWeight = adjusted.get('math.fractions')!;
    const otherWeight = adjusted.get('math.algebra')!;
    expect(fractionWeight / otherWeight).toBe(3.0);

    // Step 4: Complete quests, tracking progress
    for (let i = 1; i <= 4; i++) {
      const active = system.recordQuestCompletion(
        'child-1',
        ['math.fractions'],
        { 'math.fractions': 0.05 },
      );
      expect(active).toBe(true);
      expect(system.hasFocus('child-1')).toBe(true);

      const current = system.getActiveFocus('child-1')!;
      expect(current.questsCompleted).toBe(i);
      expect(current.skillProgress['math.fractions']).toBeCloseTo(0.05 * i);
    }

    // Step 5: Complete 5th quest → auto-clears
    const stillActive = system.recordQuestCompletion(
      'child-1',
      ['math.fractions'],
      { 'math.fractions': 0.05 },
    );
    expect(stillActive).toBe(false);
    expect(system.hasFocus('child-1')).toBe(false);
    expect(system.getActiveFocus('child-1')).toBeNull();

    // Step 6: After clear, weights return to default
    const weightsAfter = system.getSkillWeights('child-1');
    expect(weightsAfter.size).toBe(0); // No focus → empty weights

    const adjustedAfter = system.applyFocusWeights('child-1', baseWeights);
    expect(adjustedAfter.get('math.fractions')).toBe(1.0); // Back to normal
  });
});

describe('Focus Integration: Intensity Levels', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('subtle focus barely increases weight (1.5×)', () => {
    system.requestFocus('player-1', {
      naturalLanguage: 'I want to practice fractions a little',
      parsedSkills: ['math.fractions'],
      intensity: 'subtle',
    });

    const base = new Map([['math.fractions', 1.0], ['math.algebra', 1.0]]);
    const adjusted = system.applyFocusWeights('player-1', base);

    expect(adjusted.get('math.fractions')).toBe(1.5);
    expect(adjusted.get('math.algebra')).toBe(1.0);
  });

  it('moderate focus significantly increases weight (3×)', () => {
    system.requestFocus('player-1', {
      naturalLanguage: 'I want to focus on fractions',
      parsedSkills: ['math.fractions'],
      intensity: 'moderate',
    });

    const base = new Map([['math.fractions', 1.0], ['math.algebra', 1.0]]);
    const adjusted = system.applyFocusWeights('player-1', base);

    expect(adjusted.get('math.fractions')).toBe(3.0);
  });

  it('intensive focus (Study Forge) dominates selection (8×)', () => {
    system.enterStudyForge('player-1', ['math.fractions']);

    const base = new Map([['math.fractions', 1.0], ['math.algebra', 1.0]]);
    const adjusted = system.applyFocusWeights('player-1', base);

    expect(adjusted.get('math.fractions')).toBe(8.0);
    expect(adjusted.get('math.algebra')).toBe(1.0);
  });

  it('intensity ordering: subtle < moderate < intensive', () => {
    expect(INTENSITY_WEIGHTS.subtle).toBeLessThan(INTENSITY_WEIGHTS.moderate);
    expect(INTENSITY_WEIGHTS.moderate).toBeLessThan(INTENSITY_WEIGHTS.intensive);
  });
});

describe('Focus Integration: Multi-Skill Focus', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('focuses on multiple skills simultaneously', () => {
    system.setParentFocus('child-1', {
      skills: ['math.fractions', 'math.ratios', 'math.percentages'],
      intensity: 'moderate',
      source: 'parent',
      durationQuests: 10,
    });

    const base = new Map([
      ['math.fractions', 1.0],
      ['math.ratios', 1.0],
      ['math.percentages', 1.0],
      ['science.physics', 1.0],
    ]);

    const adjusted = system.applyFocusWeights('child-1', base);
    expect(adjusted.get('math.fractions')).toBe(3.0);
    expect(adjusted.get('math.ratios')).toBe(3.0);
    expect(adjusted.get('math.percentages')).toBe(3.0);
    expect(adjusted.get('science.physics')).toBe(1.0);
  });

  it('tracks progress per focus skill independently', () => {
    system.setParentFocus('child-1', {
      skills: ['math.fractions', 'math.ratios'],
      intensity: 'moderate',
      source: 'parent',
    });

    // Quest that exercises fractions but not ratios
    system.recordQuestCompletion('child-1', ['math.fractions'], {
      'math.fractions': 0.1,
      'math.ratios': 0,
    });

    const session = system.getActiveFocus('child-1')!;
    expect(session.skillProgress['math.fractions']).toBe(0.1);
    expect(session.skillProgress['math.ratios']).toBe(0);
  });
});

describe('Focus Integration: Study Forge Entry', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('creates intensive indefinite session for weak skills', () => {
    const session = system.enterStudyForge('player-1', ['math.fractions', 'math.decimals']);

    expect(session.intensity).toBe('intensive');
    expect(session.source).toBe('study_forge');
    expect(session.durationQuests).toBeNull(); // Indefinite

    // Should stay active after many quests
    for (let i = 0; i < 50; i++) {
      const active = system.recordQuestCompletion('player-1', ['math.fractions'], {
        'math.fractions': 0.01,
      });
      expect(active).toBe(true);
    }

    expect(system.hasFocus('player-1')).toBe(true);
    expect(system.getActiveFocus('player-1')!.questsCompleted).toBe(50);
  });

  it('requires manual clear for indefinite sessions', () => {
    system.enterStudyForge('player-1', ['math.fractions']);

    // 100 quests later, still active
    for (let i = 0; i < 100; i++) {
      system.recordQuestCompletion('player-1', ['math.fractions'], { 'math.fractions': 0.01 });
    }
    expect(system.hasFocus('player-1')).toBe(true);

    // Manual clear
    system.clearFocus('player-1');
    expect(system.hasFocus('player-1')).toBe(false);
  });
});

describe('Focus Integration: Focus Summary for Companion', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('provides progress summary for companion dialogue', () => {
    system.setParentFocus('child-1', {
      skills: ['math.fractions'],
      intensity: 'moderate',
      source: 'parent',
      durationQuests: 10,
    });

    system.recordQuestCompletion('child-1', ['math.fractions'], { 'math.fractions': 0.15 });
    system.recordQuestCompletion('child-1', ['math.fractions'], { 'math.fractions': 0.10 });

    const summary = system.getFocusSummary('child-1');
    expect(summary).not.toBeNull();
    expect(summary).toContain('math.fractions');
    expect(summary).toContain('2/10');
    expect(summary).toContain('+0.25');
  });

  it('returns null when no focus active', () => {
    expect(system.getFocusSummary('nobody')).toBeNull();
  });
});

describe('Focus Integration: Session Replacement', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('new focus replaces old one (only one focus per player)', () => {
    system.requestFocus('player-1', {
      naturalLanguage: 'fractions',
      parsedSkills: ['math.fractions'],
      intensity: 'moderate',
    });

    system.requestFocus('player-1', {
      naturalLanguage: 'algebra',
      parsedSkills: ['math.algebra'],
      intensity: 'intensive',
    });

    const session = system.getActiveFocus('player-1')!;
    expect(session.skills).toEqual(['math.algebra']);
    expect(session.intensity).toBe('intensive');

    // Old focus skill weights should be gone
    const weights = system.getSkillWeights('player-1');
    expect(weights.has('math.fractions')).toBe(false);
    expect(weights.get('math.algebra')).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.intensive);
  });
});

describe('Focus Integration: Non-Focus Skills Unaffected', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('non-focus skill mastery deltas are ignored in progress tracking', () => {
    system.requestFocus('player-1', {
      naturalLanguage: 'fractions',
      parsedSkills: ['math.fractions'],
    });

    system.recordQuestCompletion('player-1', ['math.fractions', 'math.algebra'], {
      'math.fractions': 0.1,
      'math.algebra': 0.2,
      'science.physics': 0.05,
    });

    const session = system.getActiveFocus('player-1')!;
    expect(session.skillProgress['math.fractions']).toBe(0.1);
    // Non-focus skills not tracked
    expect(session.skillProgress['math.algebra']).toBeUndefined();
    expect(session.skillProgress['science.physics']).toBeUndefined();
  });
});

describe('Focus Integration: Detailed Weights with Source Info', () => {
  let system: FocusModeSystem;

  beforeEach(() => {
    system = new FocusModeSystem(() => Date.now());
  });

  it('provides source attribution for transparency', () => {
    system.setParentFocus('child-1', {
      skills: ['math.fractions', 'math.ratios'],
      intensity: 'moderate',
      source: 'teacher',
    });

    const detailed = system.getDetailedSkillWeights('child-1');
    expect(detailed.length).toBe(2);

    for (const entry of detailed) {
      expect(entry.source).toBe('teacher');
      expect(entry.weight).toBe(DEFAULT_SKILL_WEIGHT * INTENSITY_WEIGHTS.moderate);
    }

    const skillIds = detailed.map((d) => d.skillId);
    expect(skillIds).toContain('math.fractions');
    expect(skillIds).toContain('math.ratios');
  });
});
