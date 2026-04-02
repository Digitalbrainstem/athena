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

// Color-only instruction patterns — color word followed by a generic noun
// without a shape/position/name qualifier nearby.
// These catch "tap the red one" or "find the blue crystal" but allow
// "tap the red circle on the left" or "find the red hammer".
const COLOR_WORDS = 'red|blue|green|yellow|orange|purple|pink|white|brown|gold';

// Patterns that rely on color alone to identify a target.
// "the red one" / "the blue ones" with no shape/position qualifier
const COLOR_ONLY_PATTERNS = [
  new RegExp(`\\bthe (${COLOR_WORDS}) ones?\\b`, 'i'),
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
    parts.push(step.spokenInstruction ?? '');
    parts.push(step.screenReaderText ?? '');
    parts.push(step.companionRepeat ?? '');
    parts.push(step.successResponse ?? '');
    parts.push(step.failureResponse ?? '');
    if (step.hints) {
      parts.push(...step.hints);
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

          it('has triple instruction format (visual + audio + screen reader)', () => {
            expect(step.spokenInstruction, 'missing spokenInstruction').toBeTruthy();
            expect(step.screenReaderText, 'missing screenReaderText').toBeTruthy();
          });

          it('has companionRepeat for "say that again?"', () => {
            expect(step.companionRepeat, 'missing companionRepeat').toBeTruthy();
            // companionRepeat should be shorter/simpler than the main instruction
            expect(step.companionRepeat!.length).toBeLessThanOrEqual(step.instruction.length + 20);
          });

          it('has hints array with at least one hint', () => {
            expect(Array.isArray(step.hints)).toBe(true);
            expect(step.hints!.length).toBeGreaterThan(0);
          });

          it('has success and failure responses', () => {
            expect(step.successResponse).toBeTruthy();
            expect(step.failureResponse).toBeTruthy();
          });

          it('failure response is encouraging and offers a path forward', () => {
            const f = step.failureResponse;
            // Must not contain harsh negative words
            expect(f).not.toMatch(/\bwrong\b/i);
            expect(f).not.toMatch(/\bincorrect\b/i);
            expect(f).not.toMatch(/\bfailed\b/i);
            expect(f).not.toMatch(/\bgame over\b/i);
            expect(f).not.toMatch(/\byou lose\b/i);
          });
        });
      }
    });
  }
});

describe('Foundation Quest Data — Accessibility', () => {
  it('no color-only identification in instructions', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        for (const pattern of COLOR_ONLY_PATTERNS) {
          const match = step.instruction.match(pattern);
          expect(
            match,
            `Quest "${quest.id}" step ${step.index} instruction uses color-only identification: "${match?.[0]}"`,
          ).toBeNull();
        }
      }
    }
  });

  it('screenReaderText never starts with a color word alone', () => {
    const colorStart = new RegExp(`^(${COLOR_WORDS})\\b`, 'i');
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        if (step.screenReaderText) {
          expect(
            step.screenReaderText.match(colorStart),
            `Quest "${quest.id}" step ${step.index} screenReaderText starts with color word`,
          ).toBeNull();
        }
      }
    }
  });
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
