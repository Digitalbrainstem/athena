import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { CodexSystem } from '../../src/systems/story.js';
import { ALL_FRAGMENTS, getFragment, fragmentsForThread, fragmentsForBiome, fragmentsForTier, getThreadCounts } from '../../src/data/fragments.js';
import { MYSTERIES, getMystery, mysteriesForBiome, mysteriesRequiringFragment } from '../../src/data/mysteries.js';

describe('Story & Narrative System', () => {
  let db: DatabaseConnection;
  let codex: CodexSystem;
  const profileId = 'test-player-001';

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    // Create a test profile
    db.run(
      "INSERT INTO profiles (id, name, mastery_tier) VALUES (?, ?, ?)",
      [profileId, 'Test Player', 'foundation'],
    );
    // Create companion and world_state for FK
    db.run(
      "INSERT INTO companions (profile_id, name) VALUES (?, ?)",
      [profileId, 'Buddy'],
    );
    db.run(
      "INSERT INTO world_state (profile_id) VALUES (?)",
      [profileId],
    );
    codex = new CodexSystem();
    codex.setDatabase(db);
    codex.initialize();
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  // ─── Fragment Data Tests ─────────────────────────────────────────────────

  describe('Fragment Data', () => {
    it('has 100+ fragments', () => {
      expect(ALL_FRAGMENTS.length).toBeGreaterThanOrEqual(100);
    });

    it('has fragments across all 5 story threads', () => {
      const counts = getThreadCounts();
      expect(counts.star_trail).toBeGreaterThan(0);
      expect(counts.journal).toBeGreaterThan(0);
      expect(counts.machines).toBeGreaterThan(0);
      expect(counts.equations).toBeGreaterThan(0);
      expect(counts.truth).toBeGreaterThan(0);
    });

    it('has ~25 Star Trail fragments (Foundation)', () => {
      const starTrail = fragmentsForThread('star_trail');
      expect(starTrail.length).toBeGreaterThanOrEqual(20);
      for (const f of starTrail) {
        expect(f.tier).toBe('foundation');
      }
    });

    it('has ~25 Journal fragments (Discovery)', () => {
      const journal = fragmentsForThread('journal');
      expect(journal.length).toBeGreaterThanOrEqual(20);
      for (const f of journal) {
        expect(f.tier).toBe('discovery');
      }
    });

    it('has ~20 Machine fragments (Builder)', () => {
      const machines = fragmentsForThread('machines');
      expect(machines.length).toBeGreaterThanOrEqual(15);
      for (const f of machines) {
        expect(f.tier).toBe('builder');
      }
    });

    it('has ~15 Equation fragments (Innovator)', () => {
      const equations = fragmentsForThread('equations');
      expect(equations.length).toBeGreaterThanOrEqual(10);
      for (const f of equations) {
        expect(f.tier).toBe('innovator');
      }
    });

    it('has ~15 Truth fragments (Creator)', () => {
      const truth = fragmentsForThread('truth');
      expect(truth.length).toBeGreaterThanOrEqual(10);
      for (const f of truth) {
        expect(f.tier).toBe('creator');
      }
    });

    it('every fragment has accessibility fields', () => {
      for (const f of ALL_FRAGMENTS) {
        expect(f.spokenContent).toBeTruthy();
        expect(f.spokenContent.length).toBeGreaterThan(10);
        expect(f.screenReaderText).toBeTruthy();
        expect(f.screenReaderText.length).toBeGreaterThan(10);
      }
    });

    it('every fragment has unique ID', () => {
      const ids = ALL_FRAGMENTS.map(f => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every fragment has a title and content', () => {
      for (const f of ALL_FRAGMENTS) {
        expect(f.title).toBeTruthy();
        expect(f.content).toBeTruthy();
      }
    });

    it('no fragment dialogue uses quiz language', () => {
      const quizPatterns = [/\btest\b/i, /\bquiz\b/i, /\bgrade\b/i, /\bscore\b/i, /\bcorrect answer\b/i, /\bwrong answer\b/i, /\bfail the\b/i];
      for (const f of ALL_FRAGMENTS) {
        const text = f.content + ' ' + f.spokenContent;
        for (const pattern of quizPatterns) {
          expect(pattern.test(text), `Fragment "${f.id}" contains quiz language matching ${pattern}`).toBe(false);
        }
      }
    });

    it('all fragment dialogue is gender-neutral', () => {
      const genderedWords = [' he ', ' she ', ' his ', ' her ', ' him ', ' boy ', ' girl '];
      for (const f of ALL_FRAGMENTS) {
        const lower = ` ${f.content.toLowerCase()} `;
        for (const word of genderedWords) {
          expect(lower).not.toContain(word);
        }
      }
    });

    it('retrieves fragment by ID', () => {
      const fragment = getFragment('star-workshop-01');
      expect(fragment).toBeDefined();
      expect(fragment!.title).toBe('The Workbench Star');
    });

    it('returns undefined for unknown fragment', () => {
      expect(getFragment('nonexistent')).toBeUndefined();
    });

    it('filters fragments by biome', () => {
      const workshopFragments = fragmentsForBiome('workshop');
      expect(workshopFragments.length).toBeGreaterThan(0);
      for (const f of workshopFragments) {
        expect(f.biome).toBe('workshop');
      }
    });

    it('filters fragments by tier', () => {
      const foundationFragments = fragmentsForTier('foundation');
      expect(foundationFragments.length).toBeGreaterThan(0);
      for (const f of foundationFragments) {
        expect(f.tier).toBe('foundation');
      }
    });

    it('contains the D.T. easter egg fragments', () => {
      const firstLight = getFragment('equation-observatory-03');
      expect(firstLight).toBeDefined();
      expect(firstLight!.content).toContain('D.T.');

      const dtFusion = getFragment('equation-alchemist-01');
      expect(dtFusion).toBeDefined();
      expect(dtFusion!.content).toContain('D.T.');

      const originCrystal = getFragment('equation-caverns-01');
      expect(originCrystal).toBeDefined();
      expect(originCrystal!.content).toContain('04.01.2026');
    });

    it('contains The Warm Book fragment', () => {
      const warmBook = getFragment('truth-revelation-02');
      expect(warmBook).toBeDefined();
      expect(warmBook!.content).toContain('D.T.');
      expect(warmBook!.title).toBe('The Warm Book');
    });

    it('contains The Hidden Room fragment', () => {
      const hiddenRoom = getFragment('truth-revelation-03');
      expect(hiddenRoom).toBeDefined();
      expect(hiddenRoom!.content).toContain('April 1, 2026');
      expect(hiddenRoom!.content).toContain('20260401');
      expect(hiddenRoom!.content).toContain('full turn');
    });
  });

  // ─── Mystery Data Tests ──────────────────────────────────────────────────

  describe('Mystery Data', () => {
    it('has 10+ mysteries', () => {
      expect(MYSTERIES.length).toBeGreaterThanOrEqual(10);
    });

    it('every mystery has required fragments that exist', () => {
      for (const mystery of MYSTERIES) {
        for (const fragId of mystery.requiredFragments) {
          expect(getFragment(fragId)).toBeDefined();
        }
      }
    });

    it('every mystery spans multiple biomes or has depth', () => {
      for (const mystery of MYSTERIES) {
        // Must require something meaningful
        expect(mystery.requiredFragments.length).toBeGreaterThanOrEqual(2);
        expect(mystery.requiredSkills.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('every mystery has a title and description', () => {
      for (const mystery of MYSTERIES) {
        expect(mystery.title).toBeTruthy();
        expect(mystery.description).toBeTruthy();
        expect(mystery.description.length).toBeGreaterThan(20);
      }
    });

    it('retrieves mystery by ID', () => {
      const mystery = getMystery('mystery-star-map-cipher');
      expect(mystery).toBeDefined();
      expect(mystery!.title).toBe('The Star Map Cipher');
    });

    it('filters mysteries by biome', () => {
      const observatoryMysteries = mysteriesForBiome('observatory');
      expect(observatoryMysteries.length).toBeGreaterThan(0);
      for (const m of observatoryMysteries) {
        expect(m.biomes).toContain('observatory');
      }
    });

    it('finds mysteries requiring a specific fragment', () => {
      const mysteries = mysteriesRequiringFragment('equation-observatory-03');
      expect(mysteries.length).toBeGreaterThan(0);
    });

    it('contains The Origin Date mystery (D.T. easter egg)', () => {
      const origin = getMystery('mystery-origin-date');
      expect(origin).toBeDefined();
      expect(origin!.requiredFragments).toContain('equation-caverns-01');
      expect(origin!.requiredFragments).toContain('equation-alchemist-01');
      expect(origin!.requiredFragments).toContain('equation-observatory-03');
    });

    it('contains The Founders Identity mystery', () => {
      const identity = getMystery('mystery-founders-identity');
      expect(identity).toBeDefined();
      expect(identity!.biomes.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── CodexSystem Tests ───────────────────────────────────────────────────

  describe('CodexSystem', () => {
    it('initializes with all fragments in the database', () => {
      const row = db.queryOne<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM codex_fragments',
      );
      expect(row!.cnt).toBe(ALL_FRAGMENTS.length);
    });

    it('initializes with all mysteries in the database', () => {
      const row = db.queryOne<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM mysteries',
      );
      expect(row!.cnt).toBe(MYSTERIES.length);
    });

    it('discovers a fragment', () => {
      const update = codex.discoverFragment(profileId, 'star-workshop-01');
      expect(update.newDiscovery).toBe(true);
      expect(update.fragment.id).toBe('star-workshop-01');
      expect(update.fragment.discoveredAt).toBeTruthy();
      expect(update.threadProgress.found).toBe(1);
    });

    it('does not re-discover an already-found fragment', () => {
      codex.discoverFragment(profileId, 'star-workshop-01');
      const update2 = codex.discoverFragment(profileId, 'star-workshop-01');
      expect(update2.newDiscovery).toBe(false);
      expect(update2.threadProgress.found).toBe(1);
    });

    it('throws for unknown fragment', () => {
      expect(() => codex.discoverFragment(profileId, 'nonexistent')).toThrow();
    });

    it('tracks multiple discoveries', () => {
      codex.discoverFragment(profileId, 'star-workshop-01');
      codex.discoverFragment(profileId, 'star-workshop-02');
      codex.discoverFragment(profileId, 'star-forest-01');

      const discovered = codex.getDiscoveredFragments(profileId);
      expect(discovered.length).toBe(3);
    });

    it('returns discovered fragments in order', () => {
      codex.discoverFragment(profileId, 'star-workshop-01');
      codex.discoverFragment(profileId, 'journal-workshop-01');

      const discovered = codex.getDiscoveredFragments(profileId);
      expect(discovered[0]!.id).toBe('star-workshop-01');
      expect(discovered[1]!.id).toBe('journal-workshop-01');
    });

    it('returns empty discovered list for new player', () => {
      const discovered = codex.getDiscoveredFragments(profileId);
      expect(discovered).toHaveLength(0);
    });

    it('provides codex state with thread progress', () => {
      codex.discoverFragment(profileId, 'star-workshop-01');
      codex.discoverFragment(profileId, 'star-workshop-02');

      const state = codex.getCodexState(profileId);
      expect(state.totalFragments).toBe(ALL_FRAGMENTS.length);
      expect(state.discoveredCount).toBe(2);
      expect(state.threadProgress['star_trail']!.found).toBe(2);
      expect(state.threadProgress['journal']!.found).toBe(0);
    });

    it('generates hints for partially-discovered threads', () => {
      codex.discoverFragment(profileId, 'star-workshop-01');

      const state = codex.getCodexState(profileId);
      expect(state.hints.length).toBeGreaterThan(0);
      expect(state.hints.some(h => h.includes('stars'))).toBe(true);
    });

    it('generates no hints for undiscovered threads', () => {
      // No fragments discovered — no hints
      const state = codex.getCodexState(profileId);
      expect(state.hints).toHaveLength(0);
    });

    it('tracks mystery progress', () => {
      const progress = codex.checkMysteryProgress(profileId, 'mystery-star-map-cipher');
      expect(progress.mysteryId).toBe('mystery-star-map-cipher');
      expect(progress.foundFragments).toHaveLength(0);
      expect(progress.solvable).toBe(false);
      expect(progress.solved).toBe(false);
    });

    it('advances mystery when required fragments are found', () => {
      // Discover fragments needed for The Builder's Intent mystery
      codex.discoverFragment(profileId, 'machine-workshop-01');
      codex.discoverFragment(profileId, 'journal-workshop-01');

      const progress = codex.checkMysteryProgress(profileId, 'mystery-builders-intent');
      expect(progress.foundFragments.length).toBe(2);
    });

    it('marks mystery as solvable when all fragments and skills are met', () => {
      // The Builder's Intent requires 3 fragments + engineering.basics + science.physics
      codex.discoverFragment(profileId, 'machine-workshop-01');
      codex.discoverFragment(profileId, 'journal-workshop-01');
      codex.discoverFragment(profileId, 'machine-workshop-02');

      // Add mastery records for required skills
      db.run(
        "INSERT INTO mastery (profile_id, skill_id, level) VALUES (?, ?, ?)",
        [profileId, 'engineering.basics', 1],
      );
      db.run(
        "INSERT INTO mastery (profile_id, skill_id, level) VALUES (?, ?, ?)",
        [profileId, 'science.physics', 1],
      );

      const progress = codex.checkMysteryProgress(profileId, 'mystery-builders-intent');
      expect(progress.solvable).toBe(true);
    });

    it('is not solvable without required skills', () => {
      codex.discoverFragment(profileId, 'machine-workshop-01');
      codex.discoverFragment(profileId, 'journal-workshop-01');
      codex.discoverFragment(profileId, 'machine-workshop-02');
      // Don't add mastery

      const progress = codex.checkMysteryProgress(profileId, 'mystery-builders-intent');
      expect(progress.foundFragments.length).toBe(3);
      expect(progress.metSkills.length).toBe(0);
      expect(progress.solvable).toBe(false);
    });

    it('solves a mystery', () => {
      codex.solveMystery(profileId, 'mystery-builders-intent');

      const progress = codex.checkMysteryProgress(profileId, 'mystery-builders-intent');
      expect(progress.solved).toBe(true);
    });

    it('throws for unknown mystery', () => {
      expect(() => codex.checkMysteryProgress(profileId, 'nonexistent')).toThrow();
    });

    it('provides total fragment count', () => {
      expect(codex.getTotalFragmentCount()).toBe(ALL_FRAGMENTS.length);
    });

    it('auto-solves mysteries when discovery makes them solvable', () => {
      // Setup: add skills for Builder's Intent
      db.run(
        "INSERT INTO mastery (profile_id, skill_id, level) VALUES (?, ?, ?)",
        [profileId, 'engineering.basics', 1],
      );
      db.run(
        "INSERT INTO mastery (profile_id, skill_id, level) VALUES (?, ?, ?)",
        [profileId, 'science.physics', 1],
      );

      // Discover first two fragments
      codex.discoverFragment(profileId, 'machine-workshop-01');
      codex.discoverFragment(profileId, 'journal-workshop-01');

      // Discover the final required fragment — should auto-solve
      const update = codex.discoverFragment(profileId, 'machine-workshop-02');
      expect(update.mysteriesSolved.length).toBeGreaterThanOrEqual(1);
    });

    it('initializes idempotently (double init does not break)', () => {
      codex.initialize();
      codex.initialize();
      const row = db.queryOne<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM codex_fragments',
      );
      expect(row!.cnt).toBe(ALL_FRAGMENTS.length);
    });

    it('codex state includes all mystery progress', () => {
      const state = codex.getCodexState(profileId);
      expect(state.mysteries.length).toBe(MYSTERIES.length);
    });
  });
});
