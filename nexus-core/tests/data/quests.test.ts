import { describe, it, expect } from 'vitest';
import {
  allFoundationQuests,
  allQuests,
  foundationWorkshopQuests,
  foundationForestQuests,
  foundationCavernsQuests,
} from '../../src/data/quests/index.js';

// Valid biome IDs from the world system
const VALID_BIOMES = ['workshop', 'alchemist-lab', 'crystal-caverns', 'living-forest', 'library-echoes'];

// Forbidden quiz-style phrases
const QUIZ_PATTERNS = [
  /\bWhat is\b/i,
  /\bHow many .+ are there\?/i,
  /\bCan you tell me\b/i,
  /\bDo you know\b/i,
  /\bWhat color is\b.*\?/i,
  /\bName the\b.*\?/i,
];

// Gender-specific terms to flag
const GENDERED_TERMS = [
  /\bboy\b/i,
  /\bgirl\b/i,
  /\b(?<![a-z])his\b/i,
  /\bher\b/i,
  /\b(?<![a-z])he\b/i,
  /\bshe\b/i,
  /\bprince\b/i,
  /\bprincess\b/i,
  /\bbrother\b/i,
  /\bsister\b/i,
];

function collectAllText(quest: (typeof allQuests)[number]): string {
  const parts: string[] = [
    quest.title,
    quest.content.description,
    quest.content.companionIntro ?? '',
    quest.content.companionOutro ?? '',
  ];
  for (const step of quest.content.steps) {
    parts.push(step.instruction);
    parts.push(step.successResponse ?? '');
    parts.push(step.failureResponse ?? '');
    if (step.hints) {
      parts.push(...step.hints);
    }
    if (step.hint) {
      parts.push(step.hint);
    }
  }
  return parts.join(' ');
}

describe('Foundation Quest Data — Counts', () => {
  it('has at least 35 total Foundation quests', () => {
    expect(allFoundationQuests.length).toBeGreaterThanOrEqual(35);
  });

  it('has at least 15 Workshop quests', () => {
    expect(foundationWorkshopQuests.length).toBeGreaterThanOrEqual(15);
  });

  it('has at least 10 Living Forest quests', () => {
    expect(foundationForestQuests.length).toBeGreaterThanOrEqual(10);
  });

  it('has at least 10 Crystal Caverns quests', () => {
    expect(foundationCavernsQuests.length).toBeGreaterThanOrEqual(10);
  });

  it('allQuests contains every Foundation quest', () => {
    expect(allQuests.length).toBeGreaterThanOrEqual(allFoundationQuests.length);
    for (const q of allFoundationQuests) {
      expect(allQuests.find((a) => a.id === q.id)).toBeDefined();
    }
  });
});

describe('Foundation Quest Data — Structure', () => {
  for (const quest of allFoundationQuests) {
    describe(`Quest "${quest.id}"`, () => {
      it('has required top-level fields', () => {
        expect(quest.id).toBeTruthy();
        expect(quest.title).toBeTruthy();
        expect(quest.biome).toBeTruthy();
        expect(quest.masteryTier).toBe('foundation');
        expect(quest.content).toBeDefined();
        expect(quest.content.description).toBeTruthy();
      });

      it('has valid biome reference', () => {
        expect(VALID_BIOMES).toContain(quest.biome);
      });

      it('has valid skills arrays', () => {
        expect(Array.isArray(quest.skillsRequired ?? [])).toBe(true);
        expect(Array.isArray(quest.skillsTaught ?? [])).toBe(true);
        expect((quest.skillsTaught ?? []).length).toBeGreaterThan(0);
        for (const skill of (quest.skillsTaught ?? [])) {
          expect(skill).toMatch(/^[a-z]+\.[a-z0-9-]+$/);
        }
      });

      it('has companion dialogue', () => {
        expect(quest.content.companionIntro).toBeTruthy();
        expect(quest.content.companionOutro).toBeTruthy();
      });

      it('has reasonable estimated minutes (3-10)', () => {
        expect(quest.content.estimatedMinutes).toBeGreaterThanOrEqual(3);
        expect(quest.content.estimatedMinutes).toBeLessThanOrEqual(10);
      });

      it('has at least one step', () => {
        expect(quest.content.steps.length).toBeGreaterThan(0);
      });

      for (const step of quest.content.steps) {
        describe(`Step ${step.index}`, () => {
          it('has instruction and objective type', () => {
            expect(step.instruction).toBeTruthy();
            expect(step.objectiveType).toBeTruthy();
          });

          it('has hints array with at least one hint', () => {
            expect(Array.isArray(step.hints)).toBe(true);
            expect(step.hints!.length).toBeGreaterThan(0);
          });

          it('has success and failure responses', () => {
            expect(step.successResponse).toBeTruthy();
            expect(step.failureResponse).toBeTruthy();
          });
        });
      }
    });
  }
});

describe('Foundation Quest Data — Educational Integrity', () => {
  it('has no quiz-style language', () => {
    for (const quest of allFoundationQuests) {
      const text = collectAllText(quest);
      for (const pattern of QUIZ_PATTERNS) {
        const match = text.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" contains quiz-style phrase: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  it('uses gender-neutral language', () => {
    for (const quest of allFoundationQuests) {
      const text = collectAllText(quest);
      for (const pattern of GENDERED_TERMS) {
        const match = text.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" contains gendered term: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  it('has unique quest IDs', () => {
    const ids = allFoundationQuests.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('quest IDs follow naming convention', () => {
    for (const quest of allFoundationQuests) {
      expect(quest.id).toMatch(/^f-/);
      expect(quest.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('step indices are sequential starting from 0', () => {
    for (const quest of allFoundationQuests) {
      quest.content.steps.forEach((step, i) => {
        expect(step.index).toBe(i);
      });
    }
  });
});
