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

// ---------------------------------------------------------------------------
// Principle 0: Learning Through Play — NO quiz-style language
// ---------------------------------------------------------------------------
const QUIZ_PATTERNS = [
  /\bWhat is\b/i,
  /\bHow many .+ are there\?/i,
  /\bCan you tell me\b/i,
  /\bDo you know\b/i,
  /\bWhat color is\b.*\?/i,
  /\bName the\b.*\?/i,
  /\bCan you name\b/i,
];

// ---------------------------------------------------------------------------
// Principle V: The World Is for Everyone — NO gendered language
// ---------------------------------------------------------------------------
const GENDERED_TERMS = [
  /\bboy\b/i,
  /\bgirl\b/i,
  /\bprince\b/i,
  /\bprincess\b/i,
  /\bbrother\b/i,
  /\bsister\b/i,
  /\bhe\s/i,
  /\bshe\s/i,
  /\bhis\s/i,
  /\bher\s/i,
];

// ---------------------------------------------------------------------------
// Principle VI: No Judgment — NO negative feedback words
// ---------------------------------------------------------------------------
const HARSH_WORDS = [
  /\bwrong\b/i,
  /\bincorrect\b/i,
  /\bfailed\b/i,
  /\bgame over\b/i,
  /\byou lose\b/i,
  /\bstupid\b/i,
  /\bbad\b/i,
  /\bterrible\b/i,
  /\bawful\b/i,
];

// ---------------------------------------------------------------------------
// Principle VIII: Mastery Over Speed — NO time pressure
// ---------------------------------------------------------------------------
const TIMER_WORDS = [
  /\bhurry\b/i,
  /\bquick(?:ly)?\b/i,
  /\bbefore time\b/i,
  /\btimer\b/i,
  /\btime.s up\b/i,
  /\brun out of time\b/i,
  /\bfaster\b/i,
];

// ---------------------------------------------------------------------------
// Visual Accessibility — NO color-only identification
// ---------------------------------------------------------------------------
const COLOR_WORDS = 'red|blue|green|yellow|orange|purple|pink|white|brown|gold';
const COLOR_ONLY_PATTERNS = [
  new RegExp(`\\bthe (${COLOR_WORDS}) ones?\\b`, 'i'),
];

// ---------------------------------------------------------------------------
// Motor Accessibility — NO drag operations
// ---------------------------------------------------------------------------
const DRAG_PATTERNS = [
  /\bdrag\b/i,
];

// ---------------------------------------------------------------------------
// No Visible Scores
// ---------------------------------------------------------------------------
const SCORE_PATTERNS = [
  /\bscore\b/i,
  /\bgrade\b/i,
  /\bpercent\b/i,
  /\bout of \d+\b/i,
  /\bpoints\b/i,
  /\b\d+\/\d+\b/,
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

function collectStepText(step: (typeof allQuests)[number]['content']['steps'][number]): string {
  return [
    step.instruction,
    step.spokenInstruction ?? '',
    step.screenReaderText ?? '',
    step.companionRepeat ?? '',
    step.successResponse,
    step.failureResponse,
    ...step.hints,
  ].join(' ');
}

// ============================================================================
// Quest Count Requirements
// ============================================================================
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

// ============================================================================
// Structural Requirements (per quest, per step)
// ============================================================================
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
          // ── Checklist Item 8: triple instruction format ──
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
            expect(step.companionRepeat!.length).toBeLessThanOrEqual(step.instruction.length + 30);
          });

          // ── Checklist Item 10: hints available ──
          it('has hints array with at least one hint', () => {
            expect(Array.isArray(step.hints)).toBe(true);
            expect(step.hints!.length).toBeGreaterThan(0);
          });

          // ── Checklist Item 9: failure response gentle ──
          it('has success and failure responses', () => {
            expect(step.successResponse).toBeTruthy();
            expect(step.failureResponse).toBeTruthy();
          });

          // ── Checklist Item 2 + 4: Safe, no judgment ──
          it('failure response is encouraging — no harsh words', () => {
            const f = step.failureResponse;
            for (const pattern of HARSH_WORDS) {
              expect(f, `failureResponse "${f}" contains harsh word`).not.toMatch(pattern);
            }
          });

          // ── No drag operations (motor accessibility) ──
          it('never references drag operations', () => {
            const text = collectStepText(step);
            for (const pattern of DRAG_PATTERNS) {
              expect(text, `step text mentions "drag"`).not.toMatch(pattern);
            }
          });

          // ── No visible scores ──
          it('never mentions scores or grades', () => {
            const text = collectStepText(step);
            for (const pattern of SCORE_PATTERNS) {
              expect(text, `step text mentions scores/grades`).not.toMatch(pattern);
            }
          });
        });
      }
    });
  }
});

// ============================================================================
// Checklist Item 7: Color accessibility — NEVER color alone
// ============================================================================
describe('Foundation Quest Data — Color Accessibility', () => {
  it('no color-only identification in any text field', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        const fields = [
          step.instruction,
          step.spokenInstruction ?? '',
          step.screenReaderText ?? '',
          step.companionRepeat ?? '',
          step.successResponse,
          step.failureResponse,
          ...step.hints,
        ];
        for (const field of fields) {
          for (const pattern of COLOR_ONLY_PATTERNS) {
            const match = field.match(pattern);
            expect(
              match,
              `Quest "${quest.id}" step ${step.index}: "${match?.[0]}" uses color alone`,
            ).toBeNull();
          }
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

// ============================================================================
// Checklist Item 1: Feels like play — NO quiz phrasing
// ============================================================================
describe('Foundation Quest Data — No Quiz Language', () => {
  it('no quiz-style language in any quest text', () => {
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
});

// ============================================================================
// Checklist Item 3: Gender neutral
// ============================================================================
describe('Foundation Quest Data — Gender Neutral', () => {
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
});

// ============================================================================
// Checklist Item 5: No timers for Foundation
// ============================================================================
describe('Foundation Quest Data — No Time Pressure', () => {
  it('no time-pressure language in any quest text', () => {
    for (const quest of allFoundationQuests) {
      const text = collectAllText(quest);
      for (const pattern of TIMER_WORDS) {
        const match = text.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" contains time-pressure word: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  it('no timeLimit field on any quest', () => {
    for (const quest of allFoundationQuests) {
      const content = quest.content as Record<string, unknown>;
      expect(content['timeLimit'], `Quest "${quest.id}" has timeLimit`).toBeUndefined();
    }
  });
});

// ============================================================================
// Additional structural integrity
// ============================================================================
describe('Foundation Quest Data — Integrity', () => {
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

  it('all quests are Foundation tier', () => {
    for (const quest of allFoundationQuests) {
      expect(quest.masteryTier).toBe('foundation');
    }
  });

  it('companion intro never asks quiz questions', () => {
    for (const quest of allFoundationQuests) {
      const intro = quest.content.companionIntro ?? '';
      for (const pattern of QUIZ_PATTERNS) {
        const match = intro.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" companionIntro contains quiz phrase: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  it('companion outro never uses harsh words', () => {
    for (const quest of allFoundationQuests) {
      const outro = quest.content.companionOutro ?? '';
      for (const pattern of HARSH_WORDS) {
        expect(outro, `Quest "${quest.id}" companionOutro contains harsh word`).not.toMatch(pattern);
      }
    }
  });
});
