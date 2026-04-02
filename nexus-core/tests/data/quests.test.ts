import { describe, it, expect } from 'vitest';
import {
  allFoundationQuests,
  allInnovatorQuests,
  allCreatorQuests,
  allQuests,
  foundationWorkshopQuests,
  foundationForestQuests,
  foundationCavernsQuests,
  foundationScienceQuests,
  foundationSocialQuests,
  foundationEngineeringQuests,
  foundationHumanitiesQuests,
} from '../../src/data/quests/index.js';
import { BIOME_IDS } from '../../src/data/biomes.js';

// Valid biome IDs from the world system
const VALID_BIOMES = [...BIOME_IDS];
const ALL_VALID_BIOMES = [...BIOME_IDS];

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
  /\bbefore time\b/i,
  /\btimer\b/i,
  /\btime.s up\b/i,
  /\brun out of time\b/i,
  /\byou.re too slow\b/i,
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
  /\byour score\b/i,
  /\bgrade\b/i,
  /\bpercent\b/i,
  /\b\d+ out of \d+\b/i,
  /\byou (got|earned|scored) \d+/i,
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
  it('has at least 400 total Foundation quests', () => {
    expect(allFoundationQuests.length).toBeGreaterThanOrEqual(400);
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

  it('has at least 90 Science quests', () => {
    expect(foundationScienceQuests.length).toBeGreaterThanOrEqual(90);
  });

  it('has at least 45 Social quests', () => {
    expect(foundationSocialQuests.length).toBeGreaterThanOrEqual(45);
  });

  it('has at least 90 Engineering quests', () => {
    expect(foundationEngineeringQuests.length).toBeGreaterThanOrEqual(90);
  });

  it('has at least 105 Humanities quests', () => {
    expect(foundationHumanitiesQuests.length).toBeGreaterThanOrEqual(105);
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

// ============================================================================
// Pedagogical Principles (Montessori / Reggio / Singapore / Finland / Vygotsky)
// ============================================================================
describe('Foundation Quest Data — Pedagogical Principles', () => {
  // Principle: Concrete-first (Montessori/Singapore CPA)
  // Every Foundation quest must involve interacting with concrete objects
  const CONCRETE_OBJECTIVES = new Set([
    'interact', 'collect', 'build', 'craft', 'navigate', 'observe',
    'count', 'match', 'sort', 'find', 'mix', 'measure', 'pattern', 'place',
  ]);

  it('every step uses a concrete objective type (no abstract-only steps)', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        expect(
          CONCRETE_OBJECTIVES.has(step.objectiveType),
          `Quest "${quest.id}" step ${step.index} uses non-concrete objectiveType "${step.objectiveType}"`,
        ).toBe(true);
      }
    }
  });

  // Principle: World demands knowledge (Reggio Emilia)
  // Quest descriptions should describe a world NEED, not an assignment
  const ASSIGNMENT_PATTERNS = [
    /\byour (task|job|assignment)\b/i,
    /\bI want you to\b/i,
    /\bthe teacher\b/i,
    /\bthe lesson\b/i,
    /\btoday we will learn\b/i,
    /\btime to practice\b/i,
    /\blet.s learn about\b/i,
    /\bI.m going to teach\b/i,
  ];

  it('descriptions never use assignment/school language', () => {
    for (const quest of allFoundationQuests) {
      const desc = quest.content.description;
      for (const pattern of ASSIGNMENT_PATTERNS) {
        const match = desc.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" description uses school language: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  // Principle: Intrinsic motivation (Deci & Ryan SDT)
  // No visible scores, no XP, no "you earned", no "reward points"
  const EXTRINSIC_REWARD_PATTERNS = [
    /\byou earned\b/i,
    /\breward points\b/i,
    /\bXP\b/,
    /\bexperience points\b/i,
    /\blevel up\b/i,
    /\byour score\b/i,
    /\bstars? earned\b/i,
  ];

  it('never mentions extrinsic rewards in any text', () => {
    for (const quest of allFoundationQuests) {
      const text = collectAllText(quest);
      for (const pattern of EXTRINSIC_REWARD_PATTERNS) {
        const match = text.match(pattern);
        expect(
          match,
          `Quest "${quest.id}" mentions extrinsic reward: "${match?.[0]}"`,
        ).toBeNull();
      }
    }
  });

  // Principle: Scaffolding (Vygotsky ZPD)
  // Every quest with 2+ steps should have increasing complexity (step indices)
  // AND every step should have hints (scaffolding support)
  it('every step has at least one hint (scaffolding)', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        expect(
          step.hints.length,
          `Quest "${quest.id}" step ${step.index} has no hints (no scaffolding)`,
        ).toBeGreaterThan(0);
      }
    }
  });

  // Principle: Play IS learning (Finland)
  // Failure responses should describe world consequences, not correctness
  // "The bridge wobbled and fell!" not "That's not quite right."
  it('failure responses describe world consequences or encourage retry', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        const f = step.failureResponse;
        // Should not be empty platitudes
        expect(
          f.length,
          `Quest "${quest.id}" step ${step.index} failureResponse is too short`,
        ).toBeGreaterThan(10);
      }
    }
  });

  // Principle: No teaching vocab to youngest children (Montessori isolation of difficulty)
  // Foundation quest instructions should not require reading ability
  // spokenInstruction MUST exist for every step (voice-first for ages 2-5)
  it('every step has spokenInstruction (voice-first, no reading required)', () => {
    for (const quest of allFoundationQuests) {
      for (const step of quest.content.steps) {
        expect(
          step.spokenInstruction,
          `Quest "${quest.id}" step ${step.index} missing spokenInstruction (ages 2-5 cannot read)`,
        ).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// Helpers for Innovator/Creator validation
// ============================================================================

function collectAllTextGeneric(quest: (typeof allQuests)[number]): string {
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

// ============================================================================
// INNOVATOR TIER — AP-level content (ages 15-18)
// ============================================================================

describe('Innovator Quest Data — Counts', () => {
  it('has at least 800 total Innovator quests', () => {
    expect(allInnovatorQuests.length).toBeGreaterThanOrEqual(800);
  });

  it('covers all 27 biomes', () => {
    const biomes = new Set(allInnovatorQuests.map((q) => q.biome));
    expect(biomes.size).toBe(27);
    for (const id of ALL_VALID_BIOMES) {
      expect(biomes.has(id), `Missing innovator quests for biome: ${id}`).toBe(true);
    }
  });

  it('allQuests contains every Innovator quest', () => {
    for (const q of allInnovatorQuests) {
      expect(allQuests.find((a) => a.id === q.id)).toBeDefined();
    }
  });
});

describe('Innovator Quest Data — Structure', () => {
  for (const quest of allInnovatorQuests) {
    describe(`Quest "${quest.id}"`, () => {
      it('has required fields and innovator tier', () => {
        expect(quest.id).toBeTruthy();
        expect(quest.title).toBeTruthy();
        expect(ALL_VALID_BIOMES).toContain(quest.biome);
        expect(quest.masteryTier).toBe('innovator');
        expect(quest.content.description).toBeTruthy();
        expect(quest.content.companionIntro).toBeTruthy();
        expect(quest.content.companionOutro).toBeTruthy();
        expect(quest.content.estimatedMinutes).toBeGreaterThanOrEqual(20);
        expect(quest.content.estimatedMinutes).toBeLessThanOrEqual(40);
        expect((quest.skillsTaught ?? []).length).toBeGreaterThanOrEqual(2);
        for (const skill of (quest.skillsTaught ?? [])) {
          expect(skill).toMatch(/^[a-z]+\.[a-z0-9-]+$/);
        }
      });

      it('has at least 3 steps with triple instruction', () => {
        expect(quest.content.steps.length).toBeGreaterThanOrEqual(3);
        for (const step of quest.content.steps) {
          expect(step.instruction).toBeTruthy();
          expect(step.spokenInstruction).toBeTruthy();
          expect(step.screenReaderText).toBeTruthy();
          expect(step.companionRepeat).toBeTruthy();
          expect(step.hints!.length).toBeGreaterThan(0);
          expect(step.successResponse).toBeTruthy();
          expect(step.failureResponse).toBeTruthy();
          for (const pattern of HARSH_WORDS) {
            expect(step.failureResponse).not.toMatch(pattern);
          }
        }
      });
    });
  }
});

describe('Innovator Quest Data — Content Quality', () => {
  it('uses no quiz-style language', () => {
    for (const quest of allInnovatorQuests) {
      const text = collectAllTextGeneric(quest);
      for (const pattern of QUIZ_PATTERNS) {
        expect(text.match(pattern), `"${quest.id}" quiz: "${text.match(pattern)?.[0]}"`).toBeNull();
      }
    }
  });

  it('uses gender-neutral language', () => {
    for (const quest of allInnovatorQuests) {
      const text = collectAllTextGeneric(quest);
      for (const pattern of GENDERED_TERMS) {
        expect(text.match(pattern), `"${quest.id}" gendered: "${text.match(pattern)?.[0]}"`).toBeNull();
      }
    }
  });

  it('has unique quest IDs starting with i-', () => {
    const ids = allInnovatorQuests.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const quest of allInnovatorQuests) {
      expect(quest.id).toMatch(/^i-/);
      expect(quest.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('step indices are sequential starting from 0', () => {
    for (const quest of allInnovatorQuests) {
      quest.content.steps.forEach((step, i) => { expect(step.index).toBe(i); });
    }
  });
});

// ============================================================================
// CREATOR TIER — College/research-level content (ages 18+)
// ============================================================================

describe('Creator Quest Data — Counts', () => {
  it('has at least 800 total Creator quests', () => {
    expect(allCreatorQuests.length).toBeGreaterThanOrEqual(800);
  });

  it('covers all 27 biomes', () => {
    const biomes = new Set(allCreatorQuests.map((q) => q.biome));
    expect(biomes.size).toBe(27);
    for (const id of ALL_VALID_BIOMES) {
      expect(biomes.has(id), `Missing creator quests for biome: ${id}`).toBe(true);
    }
  });
});

describe('Creator Quest Data — Structure', () => {
  for (const quest of allCreatorQuests) {
    describe(`Quest "${quest.id}"`, () => {
      it('has required fields and creator tier', () => {
        expect(quest.id).toBeTruthy();
        expect(quest.title).toBeTruthy();
        expect(ALL_VALID_BIOMES).toContain(quest.biome);
        expect(quest.masteryTier).toBe('creator');
        expect(quest.content.description).toBeTruthy();
        expect(quest.content.companionIntro).toBeTruthy();
        expect(quest.content.companionOutro).toBeTruthy();
        expect(quest.content.estimatedMinutes).toBeGreaterThanOrEqual(25);
        expect(quest.content.estimatedMinutes).toBeLessThanOrEqual(40);
        expect((quest.skillsTaught ?? []).length).toBeGreaterThanOrEqual(2);
        for (const skill of (quest.skillsTaught ?? [])) {
          expect(skill).toMatch(/^[a-z]+\.[a-z0-9-]+$/);
        }
      });

      it('has at least 4 steps with triple instruction', () => {
        expect(quest.content.steps.length).toBeGreaterThanOrEqual(4);
        for (const step of quest.content.steps) {
          expect(step.instruction).toBeTruthy();
          expect(step.spokenInstruction).toBeTruthy();
          expect(step.screenReaderText).toBeTruthy();
          expect(step.companionRepeat).toBeTruthy();
          expect(step.hints!.length).toBeGreaterThan(0);
          expect(step.successResponse).toBeTruthy();
          expect(step.failureResponse).toBeTruthy();
          for (const pattern of HARSH_WORDS) {
            expect(step.failureResponse).not.toMatch(pattern);
          }
        }
      });
    });
  }
});

describe('Creator Quest Data — Content Quality', () => {
  it('uses no quiz-style language', () => {
    for (const quest of allCreatorQuests) {
      const text = collectAllTextGeneric(quest);
      for (const pattern of QUIZ_PATTERNS) {
        expect(text.match(pattern), `"${quest.id}" quiz: "${text.match(pattern)?.[0]}"`).toBeNull();
      }
    }
  });

  it('uses gender-neutral language', () => {
    for (const quest of allCreatorQuests) {
      const text = collectAllTextGeneric(quest);
      for (const pattern of GENDERED_TERMS) {
        expect(text.match(pattern), `"${quest.id}" gendered: "${text.match(pattern)?.[0]}"`).toBeNull();
      }
    }
  });

  it('has unique quest IDs starting with c-', () => {
    const ids = allCreatorQuests.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const quest of allCreatorQuests) {
      expect(quest.id).toMatch(/^c-/);
      expect(quest.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('step indices are sequential starting from 0', () => {
    for (const quest of allCreatorQuests) {
      quest.content.steps.forEach((step, i) => { expect(step.index).toBe(i); });
    }
  });
});

// ============================================================================
// Cross-tier integrity
// ============================================================================
describe('Cross-Tier Quest Integrity', () => {
  it('total quest count is at least 1600', () => {
    expect(allQuests.length).toBeGreaterThanOrEqual(1600);
  });

  it('no duplicate IDs across all tiers', () => {
    const ids = allQuests.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
