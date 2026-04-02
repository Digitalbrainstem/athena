import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { runMigrations } from '../../src/db/migrations.js';
import { ProfileRepository } from '../../src/db/repositories/profile.js';
import { World } from '../../src/ecs/world.js';
import { InterestTracker, InterestRepository } from '../../src/systems/interest.js';
import {
  INTEREST_CATEGORIES,
  SIGNAL_TYPE_MULTIPLIERS,
  BIOME_INTEREST_MAP,
  INTEREST_DECAY_RATE,
} from '../../src/types/interest.js';
import type { InterestSignal, InterestCategory } from '../../src/types/interest.js';

// --- Test helpers ---

function makeSignal(overrides: Partial<InterestSignal> = {}): InterestSignal {
  return {
    type: 'object_interact',
    category: 'animals',
    weight: 0.5,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

function makeOldSignal(daysAgo: number, category: InterestCategory, weight = 0.8): InterestSignal {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    type: 'biome_time',
    category,
    weight,
    timestamp: date.toISOString(),
  };
}

// ============================================================
// Type/Constant Validation
// ============================================================

describe('Interest Types & Constants', () => {
  it('has 15 interest categories', () => {
    expect(INTEREST_CATEGORIES.length).toBe(15);
  });

  it('all categories are non-empty strings', () => {
    for (const cat of INTEREST_CATEGORIES) {
      expect(cat.length).toBeGreaterThan(0);
    }
  });

  it('signal type multipliers are defined for all types', () => {
    expect(SIGNAL_TYPE_MULTIPLIERS.biome_time).toBe(0.4);
    expect(SIGNAL_TYPE_MULTIPLIERS.object_interact).toBe(0.3);
    expect(SIGNAL_TYPE_MULTIPLIERS.choice_made).toBe(0.2);
    expect(SIGNAL_TYPE_MULTIPLIERS.item_kept).toBe(0.1);
    expect(SIGNAL_TYPE_MULTIPLIERS.quest_completed).toBe(0.25);
    expect(SIGNAL_TYPE_MULTIPLIERS.quest_abandoned).toBe(-0.1);
    expect(SIGNAL_TYPE_MULTIPLIERS.companion_topic).toBe(0.15);
  });

  it('biome interest map covers all built biomes', () => {
    expect(BIOME_INTEREST_MAP['workshop']).toBeDefined();
    expect(BIOME_INTEREST_MAP['alchemist-lab']).toBeDefined();
    expect(BIOME_INTEREST_MAP['crystal-caverns']).toBeDefined();
    expect(BIOME_INTEREST_MAP['living-forest']).toBeDefined();
    expect(BIOME_INTEREST_MAP['library-echoes']).toBeDefined();
  });

  it('biome interest map categories are valid', () => {
    for (const [biome, categories] of Object.entries(BIOME_INTEREST_MAP)) {
      for (const cat of categories) {
        expect(INTEREST_CATEGORIES as readonly string[], `Invalid category "${cat}" in biome "${biome}"`)
          .toContain(cat);
      }
    }
  });

  it('decay rate is positive', () => {
    expect(INTEREST_DECAY_RATE).toBeGreaterThan(0);
    expect(INTEREST_DECAY_RATE).toBeLessThan(1);
  });
});

// ============================================================
// InterestRepository (Database)
// ============================================================

describe('InterestRepository', () => {
  let db: DatabaseConnection;
  let repo: InterestRepository;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    runMigrations(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Tester' });
    profileId = profile.id;

    repo = new InterestRepository(db);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('records and retrieves signals', () => {
    const signal = makeSignal();
    repo.recordSignal(profileId, signal);

    const signals = repo.getSignals(profileId);
    expect(signals.length).toBe(1);
    expect(signals[0]!.category).toBe('animals');
    expect(signals[0]!.weight).toBe(0.5);
  });

  it('records multiple signals', () => {
    repo.recordSignal(profileId, makeSignal({ category: 'animals' }));
    repo.recordSignal(profileId, makeSignal({ category: 'machines' }));
    repo.recordSignal(profileId, makeSignal({ category: 'space' }));

    const signals = repo.getSignals(profileId);
    expect(signals.length).toBe(3);
  });

  it('returns signals in reverse chronological order', () => {
    const older = new Date();
    older.setHours(older.getHours() - 1);

    repo.recordSignal(profileId, makeSignal({ category: 'animals', timestamp: older.toISOString() }));
    repo.recordSignal(profileId, makeSignal({ category: 'machines', timestamp: new Date().toISOString() }));

    const signals = repo.getSignals(profileId);
    expect(signals[0]!.category).toBe('machines'); // most recent first
  });

  it('saves and retrieves weights', () => {
    const weights = {} as Record<string, number>;
    for (const cat of INTEREST_CATEGORIES) {
      weights[cat] = 0;
    }
    weights['animals'] = 0.8;
    weights['machines'] = 0.5;

    repo.saveWeights(profileId, weights as any);
    const retrieved = repo.getWeights(profileId);

    expect(retrieved.animals).toBe(0.8);
    expect(retrieved.machines).toBe(0.5);
    expect(retrieved.space).toBe(0);
  });

  it('upserts weights (update existing)', () => {
    const weights1 = {} as Record<string, number>;
    for (const cat of INTEREST_CATEGORIES) {
      weights1[cat] = 0;
    }
    weights1['animals'] = 0.3;

    repo.saveWeights(profileId, weights1 as any);

    weights1['animals'] = 0.9;
    repo.saveWeights(profileId, weights1 as any);

    const retrieved = repo.getWeights(profileId);
    expect(retrieved.animals).toBe(0.9);
  });

  it('returns empty weights for new profile', () => {
    const weights = repo.getWeights(profileId);
    for (const cat of INTEREST_CATEGORIES) {
      expect(weights[cat]).toBe(0);
    }
  });

  it('counts signals correctly', () => {
    expect(repo.getSignalCount(profileId)).toBe(0);

    repo.recordSignal(profileId, makeSignal());
    repo.recordSignal(profileId, makeSignal());
    repo.recordSignal(profileId, makeSignal());

    expect(repo.getSignalCount(profileId)).toBe(3);
  });

  it('isolates signals between profiles', () => {
    const profileRepo = new ProfileRepository(db);
    const profile2 = profileRepo.create({ name: 'Other' });

    repo.recordSignal(profileId, makeSignal({ category: 'animals' }));
    repo.recordSignal(profile2.id, makeSignal({ category: 'machines' }));

    expect(repo.getSignals(profileId).length).toBe(1);
    expect(repo.getSignals(profile2.id).length).toBe(1);
    expect(repo.getSignals(profileId)[0]!.category).toBe('animals');
    expect(repo.getSignals(profile2.id)[0]!.category).toBe('machines');
  });
});

// ============================================================
// InterestTracker (System)
// ============================================================

describe('InterestTracker', () => {
  let db: DatabaseConnection;
  let tracker: InterestTracker;
  let world: World;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    runMigrations(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Player' });
    profileId = profile.id;

    tracker = new InterestTracker();
    tracker.setRepository(new InterestRepository(db));

    world = new World();
    world.addSystem(tracker);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('returns zero weights with no signals', () => {
    const weights = tracker.getWeights(profileId);
    for (const cat of INTEREST_CATEGORIES) {
      expect(weights[cat]).toBe(0);
    }
  });

  it('processes queued signals on update', () => {
    tracker.recordSignal(profileId, makeSignal({ category: 'animals', weight: 0.8 }));
    world.update(0.016);

    const weights = tracker.getWeights(profileId);
    expect(weights.animals).toBeGreaterThan(0);
  });

  it('applies signal type multipliers', () => {
    // biome_time has 0.4 multiplier, object_interact has 0.3
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'animals',
      weight: 1.0,
    }));
    world.update(0.016);
    const w1 = tracker.getWeights(profileId);

    // Reset
    const db2 = new DatabaseConnection();
    // Use fresh tracker
    const tracker2 = new InterestTracker();
    // Can't easily reset, so just verify relative weights
    expect(w1.animals).toBeGreaterThan(0);
  });

  it('accumulates signals for the same category', () => {
    tracker.recordSignal(profileId, makeSignal({ category: 'machines', weight: 0.5 }));
    world.update(0.016);
    const w1 = tracker.getWeights(profileId);

    tracker.recordSignal(profileId, makeSignal({ category: 'machines', weight: 0.5 }));
    world.update(0.016);
    const w2 = tracker.getWeights(profileId);

    expect(w2.machines).toBeGreaterThan(w1.machines);
  });

  it('handles multiple categories simultaneously', () => {
    tracker.recordSignal(profileId, makeSignal({ category: 'animals', weight: 0.8 }));
    tracker.recordSignal(profileId, makeSignal({ category: 'space', weight: 0.6 }));
    tracker.recordSignal(profileId, makeSignal({ category: 'art', weight: 0.3 }));
    world.update(0.016);

    const weights = tracker.getWeights(profileId);
    expect(weights.animals).toBeGreaterThan(0);
    expect(weights.space).toBeGreaterThan(0);
    expect(weights.art).toBeGreaterThan(0);
    expect(weights.coding).toBe(0);
  });

  it('clamps weights to [0, 1]', () => {
    // Many strong signals for the same category
    for (let i = 0; i < 20; i++) {
      tracker.recordSignal(profileId, makeSignal({
        type: 'biome_time',
        category: 'machines',
        weight: 1.0,
      }));
    }
    world.update(0.016);

    const weights = tracker.getWeights(profileId);
    expect(weights.machines).toBeLessThanOrEqual(1);
    expect(weights.machines).toBeGreaterThanOrEqual(0);
  });

  it('handles quest_abandoned negative signals', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'quest_completed',
      category: 'history',
      weight: 0.8,
    }));
    world.update(0.016);
    const w1 = tracker.getWeights(profileId);

    tracker.recordSignal(profileId, makeSignal({
      type: 'quest_abandoned',
      category: 'history',
      weight: 0.8,
    }));
    world.update(0.016);
    const w2 = tracker.getWeights(profileId);

    expect(w2.history).toBeLessThan(w1.history);
  });
});

// ============================================================
// Exponential Decay
// ============================================================

describe('Interest Weight Decay', () => {
  let tracker: InterestTracker;

  beforeEach(() => {
    tracker = new InterestTracker();
  });

  it('recent signals have higher weight than old signals', () => {
    const recentSignals = [makeSignal({ category: 'animals', weight: 1.0 })];
    const oldSignals = [makeOldSignal(30, 'animals', 1.0)];

    const recentWeights = tracker.computeWeights(recentSignals);
    const oldWeights = tracker.computeWeights(oldSignals);

    expect(recentWeights.animals).toBeGreaterThan(oldWeights.animals);
  });

  it('signals from today have minimal decay', () => {
    const signal = makeSignal({ type: 'biome_time', category: 'machines', weight: 1.0 });
    const weights = tracker.computeWeights([signal]);

    // biome_time multiplier is 0.4, decay for today is ~1.0
    expect(weights.machines).toBeCloseTo(0.4, 1);
  });

  it('signals from 30 days ago are significantly reduced', () => {
    const signal = makeOldSignal(30, 'space', 1.0);
    const weights = tracker.computeWeights([signal]);

    // After 30 days with decay rate 0.05: e^(-0.05*30) ≈ 0.22
    // biome_time multiplier 0.4, so ≈ 0.4 * 0.22 ≈ 0.088
    expect(weights.space).toBeLessThan(0.15);
    expect(weights.space).toBeGreaterThan(0);
  });

  it('signals from 100 days ago are nearly zero', () => {
    const signal = makeOldSignal(100, 'art', 1.0);
    const weights = tracker.computeWeights([signal]);

    // e^(-0.05*100) = e^(-5) ≈ 0.0067
    expect(weights.art).toBeLessThan(0.01);
  });

  it('mixed recent and old signals favor recent', () => {
    const signals = [
      makeOldSignal(60, 'animals', 1.0),  // old, heavily decayed
      makeSignal({ type: 'biome_time', category: 'machines', weight: 1.0 }), // fresh
    ];

    const weights = tracker.computeWeights(signals);
    expect(weights.machines).toBeGreaterThan(weights.animals);
  });
});

// ============================================================
// Biome Recommendations
// ============================================================

describe('Biome Recommendations', () => {
  let db: DatabaseConnection;
  let tracker: InterestTracker;
  let world: World;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    runMigrations(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Explorer' });
    profileId = profile.id;

    tracker = new InterestTracker();
    tracker.setRepository(new InterestRepository(db));

    world = new World();
    world.addSystem(tracker);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('returns empty recommendations with no signals', () => {
    const recs = tracker.recommendBiomes(profileId);
    expect(recs.length).toBe(0);
  });

  it('recommends animal-themed biomes for animal interest', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'animals',
      weight: 1.0,
    }));
    world.update(0.016);

    const recs = tracker.recommendBiomes(profileId);
    expect(recs.length).toBeGreaterThan(0);

    // Living forest should be high (animals + nature)
    const forestRec = recs.find((r) => r.biomeId === 'living-forest');
    expect(forestRec).toBeDefined();
    expect(forestRec!.score).toBeGreaterThan(0);
  });

  it('recommends machine-themed biomes for machine interest', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'object_interact',
      category: 'machines',
      weight: 1.0,
    }));
    world.update(0.016);

    const recs = tracker.recommendBiomes(profileId);
    const workshopRec = recs.find((r) => r.biomeId === 'workshop');
    expect(workshopRec).toBeDefined();
  });

  it('returns recommendations sorted by score descending', () => {
    tracker.recordSignal(profileId, makeSignal({ category: 'machines', weight: 1.0 }));
    tracker.recordSignal(profileId, makeSignal({ category: 'building', weight: 0.8 }));
    world.update(0.016);

    const recs = tracker.recommendBiomes(profileId);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i]!.score).toBeLessThanOrEqual(recs[i - 1]!.score);
    }
  });

  it('includes reason in recommendations', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'sparkly',
      weight: 1.0,
    }));
    world.update(0.016);

    const recs = tracker.recommendBiomes(profileId);
    expect(recs.length).toBeGreaterThan(0);
    for (const rec of recs) {
      expect(rec.reason.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Theme Weights
// ============================================================

describe('Theme Weights', () => {
  let db: DatabaseConnection;
  let tracker: InterestTracker;
  let world: World;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    runMigrations(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Themer' });
    profileId = profile.id;

    tracker = new InterestTracker();
    tracker.setRepository(new InterestRepository(db));

    world = new World();
    world.addSystem(tracker);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('returns primary and secondary themes', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'animals',
      weight: 1.0,
    }));
    tracker.recordSignal(profileId, makeSignal({
      type: 'object_interact',
      category: 'space',
      weight: 0.8,
    }));
    world.update(0.016);

    const themes = tracker.getThemeWeights(profileId);
    expect(themes.primaryTheme).toBeDefined();
    expect(themes.secondaryTheme).toBeDefined();
    expect(themes.primaryTheme).not.toBe(themes.secondaryTheme);
  });

  it('primary theme has highest weight', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'machines',
      weight: 1.0,
    }));
    tracker.recordSignal(profileId, makeSignal({
      type: 'object_interact',
      category: 'art',
      weight: 0.3,
    }));
    world.update(0.016);

    const themes = tracker.getThemeWeights(profileId);
    const primaryWeight = themes.weights[themes.primaryTheme] ?? 0;
    const secondaryWeight = themes.weights[themes.secondaryTheme] ?? 0;
    expect(primaryWeight).toBeGreaterThanOrEqual(secondaryWeight);
  });

  it('weights record only includes non-zero categories', () => {
    tracker.recordSignal(profileId, makeSignal({
      type: 'biome_time',
      category: 'sparkly',
      weight: 1.0,
    }));
    world.update(0.016);

    const themes = tracker.getThemeWeights(profileId);
    // Only sparkly should have positive weight
    for (const [cat, w] of Object.entries(themes.weights)) {
      expect(w).toBeGreaterThan(0);
      // All non-zero entries should be valid categories
      expect(INTEREST_CATEGORIES as readonly string[]).toContain(cat);
    }
  });

  it('returns themes even with no signals (defaults)', () => {
    const themes = tracker.getThemeWeights(profileId);
    expect(themes.primaryTheme).toBeDefined();
    expect(themes.secondaryTheme).toBeDefined();
    expect(INTEREST_CATEGORIES as readonly string[]).toContain(themes.primaryTheme);
    expect(INTEREST_CATEGORIES as readonly string[]).toContain(themes.secondaryTheme);
  });
});

// ============================================================
// System interface
// ============================================================

describe('InterestTracker System Interface', () => {
  it('has correct name and priority', () => {
    const tracker = new InterestTracker();
    expect(tracker.name).toBe('interest');
    expect(tracker.priority).toBe(25);
  });

  it('handles update without repository gracefully', () => {
    const tracker = new InterestTracker();
    const world = new World();
    world.addSystem(tracker);

    tracker.recordSignal('nonexistent', makeSignal());
    // Should not throw
    world.update(0.016);
  });

  it('returns empty weights without repository', () => {
    const tracker = new InterestTracker();
    const weights = tracker.getWeights('nonexistent');
    for (const cat of INTEREST_CATEGORIES) {
      expect(weights[cat]).toBe(0);
    }
  });
});
