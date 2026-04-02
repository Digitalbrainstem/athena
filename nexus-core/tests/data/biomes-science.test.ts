import { describe, it, expect } from 'vitest';
import { BIOME_DEFINITIONS, getBiomeDefinition } from '../../src/systems/world.js';
import {
  BIOME_ACCESSIBILITY,
  BIOME_IDS,
  isValidBiome,
  getBiomeAccessibility,
} from '../../src/data/biomes.js';

const SCIENCE_BIOME_IDS = [
  'observatory',
  'storm-tower',
  'healers-sanctuary',
  'hospital',
  'farm',
  'laboratory',
] as const;

// ---------------------------------------------------------------------------
// Existence & Registration
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Registration', () => {
  for (const biomeId of SCIENCE_BIOME_IDS) {
    it(`${biomeId} exists in BIOME_DEFINITIONS`, () => {
      expect(getBiomeDefinition(biomeId)).toBeDefined();
    });

    it(`${biomeId} exists in BIOME_IDS`, () => {
      expect(BIOME_IDS).toContain(biomeId);
    });

    it(`${biomeId} passes isValidBiome()`, () => {
      expect(isValidBiome(biomeId)).toBe(true);
    });

    it(`${biomeId} has accessibility metadata in BIOME_ACCESSIBILITY`, () => {
      const a11y = getBiomeAccessibility(biomeId);
      expect(a11y).toBeDefined();
      expect(a11y!.spokenName).toBeTruthy();
      expect(a11y!.description).toBeTruthy();
      expect(a11y!.ambientDescription).toBeTruthy();
    });
  }

  it('total biome count is at least 18', () => {
    expect(BIOME_DEFINITIONS.length).toBeGreaterThanOrEqual(18);
  });
});

// ---------------------------------------------------------------------------
// Required Fields (structural integrity)
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Structure', () => {
  for (const biomeId of SCIENCE_BIOME_IDS) {
    describe(biomeId, () => {
      const biome = getBiomeDefinition(biomeId)!;

      it('has non-empty id, name, description', () => {
        expect(biome.id).toBe(biomeId);
        expect(biome.name).toBeTruthy();
        expect(biome.description.length).toBeGreaterThan(20);
      });

      it('has spokenName and ambientDescription', () => {
        expect(biome.spokenName).toBeTruthy();
        expect(biome.ambientDescription).toBeTruthy();
      });

      it('has at least one primary subject', () => {
        expect(biome.primarySubjects.length).toBeGreaterThan(0);
      });

      it('has at least 7 objects', () => {
        expect(biome.objects.length).toBeGreaterThanOrEqual(7);
      });

      it('has valid lighting preset', () => {
        const l = biome.ambientLighting;
        expect(l.ambientColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(l.ambientIntensity).toBeGreaterThan(0);
        expect(l.directionalColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(l.directionalIntensity).toBeGreaterThan(0);
        expect(l.directionalDirection).toBeDefined();
      });

      it('has ground and sky', () => {
        expect(biome.groundType).toBeTruthy();
        expect(biome.groundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(['color', 'gradient', 'skybox']).toContain(biome.skyType);
        expect(biome.skyPrimaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Accessibility — EVERY object
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Accessibility', () => {
  for (const biomeId of SCIENCE_BIOME_IDS) {
    describe(biomeId, () => {
      const biome = getBiomeDefinition(biomeId)!;

      for (const obj of biome.objects) {
        describe(`object "${obj.id}"`, () => {
          it('has spokenName', () => {
            expect(
              obj.spokenName,
              `${biomeId}/${obj.id} missing spokenName`,
            ).toBeTruthy();
          });

          it('has accessibilityDescription', () => {
            expect(
              obj.accessibilityDescription,
              `${biomeId}/${obj.id} missing accessibilityDescription`,
            ).toBeTruthy();
            expect(obj.accessibilityDescription!.length).toBeGreaterThan(20);
          });

          it('has iconShape for color-blind mode', () => {
            expect(
              obj.iconShape,
              `${biomeId}/${obj.id} missing iconShape`,
            ).toBeTruthy();
          });

          it('has teaches array with at least one skill', () => {
            expect(obj.teaches).toBeDefined();
            expect(obj.teaches!.length).toBeGreaterThan(0);
          });

          it('has valid interaction type', () => {
            expect(obj.interactionType).toBeTruthy();
            expect(['examine', 'pickup', 'use', 'talk', 'craft', 'build']).toContain(
              obj.interactionType,
            );
          });
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Foundation-friendly objects (at least 2 per biome that are big/colorful/safe)
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Foundation Objects', () => {
  const FOUNDATION_OBJECTS: Record<string, string[]> = {
    observatory: ['big-planet-mobile', 'star-sticker-board', 'moon-phases-wheel'],
    'storm-tower': ['magnet-play-table', 'static-balloon', 'weather-chart'],
    'healers-sanctuary': ['body-parts-puzzle', 'healthy-food-bins'],
    hospital: ['teddy-bandage-station', 'big-body-chart'],
    farm: ['animal-feeding-station', 'watering-can', 'seed-planting-box'],
    laboratory: ['color-mixing-station', 'magnet-exploration-table', 'magnifying-glass'],
  };

  for (const biomeId of SCIENCE_BIOME_IDS) {
    it(`${biomeId} has at least 2 Foundation-friendly objects`, () => {
      const expected = FOUNDATION_OBJECTS[biomeId]!;
      expect(expected.length).toBeGreaterThanOrEqual(2);

      const biome = getBiomeDefinition(biomeId)!;
      for (const foundId of expected) {
        const found = biome.objects.find((o) => o.id === foundId);
        expect(found, `${biomeId} missing Foundation object "${foundId}"`).toBeDefined();
        expect(found!.spokenName).toBeTruthy();
        expect(found!.accessibilityDescription).toBeTruthy();
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Unique Object IDs (no duplicates within or across biomes)
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Unique IDs', () => {
  it('all object IDs are unique within each biome', () => {
    for (const biomeId of SCIENCE_BIOME_IDS) {
      const biome = getBiomeDefinition(biomeId)!;
      const ids = biome.objects.map((o) => o.id);
      expect(new Set(ids).size, `duplicate IDs in ${biomeId}`).toBe(ids.length);
    }
  });

  it('no object ID collides across all biomes', () => {
    const allIds: string[] = [];
    for (const biome of BIOME_DEFINITIONS) {
      for (const obj of biome.objects) {
        allIds.push(`${biome.id}/${obj.id}`);
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

// ---------------------------------------------------------------------------
// Gender-neutral language
// ---------------------------------------------------------------------------
const GENDERED_TERMS = [
  /\bboy\b/i, /\bgirl\b/i, /\bprince\b/i, /\bprincess\b/i,
  /\bbrother\b/i, /\bsister\b/i, /\bhe\s/i, /\bshe\s/i,
  /\bhis\s/i, /\bher\s/i,
];

describe('Science + Medical Biomes — Gender Neutral', () => {
  for (const biomeId of SCIENCE_BIOME_IDS) {
    it(`${biomeId} uses gender-neutral language`, () => {
      const biome = getBiomeDefinition(biomeId)!;
      const text = [
        biome.name,
        biome.description,
        ...biome.objects.flatMap((o) => [
          o.name,
          o.spokenName ?? '',
          o.accessibilityDescription ?? '',
        ]),
      ].join(' ');

      for (const pattern of GENDERED_TERMS) {
        expect(text, `${biomeId} contains gendered term`).not.toMatch(pattern);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Real science check — subjects contain domain-specific keywords
// ---------------------------------------------------------------------------
describe('Science + Medical Biomes — Subject Coverage', () => {
  it('observatory covers astronomy', () => {
    const b = getBiomeDefinition('observatory')!;
    expect(b.primarySubjects.some((s) => s.includes('astronomy'))).toBe(true);
  });

  it('storm-tower covers electricity and weather', () => {
    const b = getBiomeDefinition('storm-tower')!;
    expect(b.primarySubjects.some((s) => s.includes('electricity'))).toBe(true);
    expect(b.primarySubjects.some((s) => s.includes('weather'))).toBe(true);
  });

  it('healers-sanctuary covers anatomy and medicine', () => {
    const b = getBiomeDefinition('healers-sanctuary')!;
    expect(b.primarySubjects.some((s) => s.includes('anatomy'))).toBe(true);
    expect(b.primarySubjects.some((s) => s.includes('medicine'))).toBe(true);
  });

  it('hospital covers medicine and first-aid', () => {
    const b = getBiomeDefinition('hospital')!;
    expect(b.primarySubjects.some((s) => s.includes('medicine'))).toBe(true);
    expect(b.primarySubjects.some((s) => s.includes('first-aid'))).toBe(true);
  });

  it('farm covers biology and agriculture', () => {
    const b = getBiomeDefinition('farm')!;
    expect(b.primarySubjects.some((s) => s.includes('biology'))).toBe(true);
    expect(b.primarySubjects.some((s) => s.includes('agriculture'))).toBe(true);
  });

  it('laboratory covers scientific method and chemistry', () => {
    const b = getBiomeDefinition('laboratory')!;
    expect(b.primarySubjects.some((s) => s.includes('method'))).toBe(true);
    expect(b.primarySubjects.some((s) => s.includes('chemistry'))).toBe(true);
  });
});
