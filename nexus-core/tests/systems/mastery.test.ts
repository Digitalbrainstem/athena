import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { ProfileRepository } from '../../src/db/repositories/profile.js';
import { MasteryRepository } from '../../src/db/repositories/mastery.js';
import { LearningEventRepository } from '../../src/db/repositories/learning-event.js';
import { World } from '../../src/ecs/world.js';
import {
  MasterySystem,
  sm2,
  calculateMasteryLevel,
  updateRetention,
  updateTransfer,
  updateDepth,
  detectGaps,
} from '../../src/systems/mastery.js';
import type { MasteryRecord } from '../../src/types/profile.js';

describe('SM-2 Algorithm', () => {
  it('first successful review: interval = 1 day', () => {
    const result = sm2(4, 2.5, 0, 0);
    expect(result.intervalDays).toBe(1);
    expect(result.streak).toBe(1);
  });

  it('second successful review: interval = 6 days', () => {
    const result = sm2(4, 2.5, 1, 1);
    expect(result.intervalDays).toBe(6);
    expect(result.streak).toBe(2);
  });

  it('third successful review: interval = previous * EF', () => {
    const result = sm2(4, 2.5, 2, 6);
    expect(result.intervalDays).toBe(15); // 6 * 2.5 = 15
    expect(result.streak).toBe(3);
  });

  it('perfect response (q=5) increases ease factor', () => {
    const result = sm2(5, 2.5, 1, 1);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('quality 3 decreases ease factor slightly', () => {
    // EF' = 2.5 + (0.1 - (5-3) * (0.08 + (5-3) * 0.02))
    // EF' = 2.5 + (0.1 - 2 * (0.08 + 0.04))
    // EF' = 2.5 + (0.1 - 0.24) = 2.5 - 0.14 = 2.36
    const result = sm2(3, 2.5, 1, 1);
    expect(result.easeFactor).toBe(2.36);
  });

  it('quality 4 barely changes ease factor', () => {
    // EF' = 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02))
    // EF' = 2.5 + (0.1 - 1 * (0.08 + 0.02))
    // EF' = 2.5 + (0.1 - 0.10) = 2.5
    const result = sm2(4, 2.5, 1, 1);
    expect(result.easeFactor).toBe(2.5);
  });

  it('failed review (q<3) resets streak, interval to 1', () => {
    const result = sm2(2, 2.5, 5, 30);
    expect(result.streak).toBe(0);
    expect(result.intervalDays).toBe(1);
    // EF should not change on failure
    expect(result.easeFactor).toBe(2.5);
  });

  it('complete blackout (q=0) resets', () => {
    const result = sm2(0, 2.3, 3, 15);
    expect(result.streak).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBe(2.3);
  });

  it('ease factor never goes below 1.3', () => {
    // Multiple low-quality reviews
    let ef = 2.5;
    for (let i = 0; i < 20; i++) {
      const result = sm2(3, ef, 1, 1);
      ef = result.easeFactor;
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  it('generates a next review date', () => {
    const result = sm2(4, 2.5, 0, 0);
    expect(result.nextReview).toBeTruthy();
    // Should be a valid date string
    expect(new Date(result.nextReview).getTime()).not.toBeNaN();
  });

  it('clamps quality to 0-5', () => {
    const low = sm2(-1, 2.5, 0, 0);
    expect(low.streak).toBe(0); // Treated as q=0 (failure)

    const high = sm2(10, 2.5, 0, 0);
    expect(high.streak).toBe(1); // Treated as q=5 (success)
  });
});

describe('Mastery Dimensions', () => {
  const makeMastery = (overrides: Partial<MasteryRecord> = {}): MasteryRecord => ({
    id: 1,
    profileId: 'test',
    skillId: 'test.skill',
    level: 0.5,
    retentionScore: 0.8,
    transferScore: 0.7,
    depthScore: 0.75,
    attempts: 20,
    successes: 16,
    easeFactor: 2.5,
    streak: 5,
    intervalDays: 15,
    ...overrides,
  });

  it('reports mastered when all dimensions above threshold', () => {
    const dimensions = calculateMasteryLevel(makeMastery({
      retentionScore: 0.8,
      transferScore: 0.8,
      depthScore: 0.8,
    }));
    expect(dimensions.isMastered).toBe(true);
  });

  it('reports not mastered when any dimension below threshold', () => {
    const dimensions = calculateMasteryLevel(makeMastery({
      retentionScore: 0.9,
      transferScore: 0.1, // below threshold
      depthScore: 0.9,
    }));
    expect(dimensions.isMastered).toBe(false);
  });

  it('updateRetention blends old and new', () => {
    const result = updateRetention(0.5, 5); // perfect quality
    expect(result).toBeGreaterThan(0.5);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('updateRetention decreases with low quality', () => {
    const result = updateRetention(0.8, 0); // blackout
    expect(result).toBeLessThan(0.8);
  });

  it('updateTransfer improves with context diversity', () => {
    const result = updateTransfer(0, 5); // 5 unique contexts
    expect(result).toBeGreaterThan(0);
  });

  it('updateTransfer never exceeds 1.0', () => {
    const result = updateTransfer(0.9, 100);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('updateDepth improves with high-quality teaching', () => {
    const result = updateDepth(0.3, 5);
    expect(result).toBeGreaterThan(0.3);
  });
});

describe('Gap Detection', () => {
  it('detects missing prerequisites', () => {
    const records = new Map<string, MasteryRecord>();
    // Student trying algebra but hasn't mastered arithmetic
    records.set('math.arithmetic', {
      id: 1, profileId: 'p1', skillId: 'math.arithmetic',
      level: 0.2, retentionScore: 0.2, transferScore: 0.1, depthScore: 0.1,
      attempts: 3, successes: 1, easeFactor: 2.5, streak: 0, intervalDays: 1,
    });

    const analysis = detectGaps('math.algebra', records);
    expect(analysis.gaps.length).toBeGreaterThan(0);
    expect(analysis.gaps.some(g => g.prerequisiteSkillId === 'math.arithmetic')).toBe(true);
  });

  it('returns empty gaps when prerequisites are mastered', () => {
    const records = new Map<string, MasteryRecord>();
    records.set('math.arithmetic', {
      id: 1, profileId: 'p1', skillId: 'math.arithmetic',
      level: 0.9, retentionScore: 0.9, transferScore: 0.8, depthScore: 0.8,
      attempts: 50, successes: 48, easeFactor: 2.7, streak: 10, intervalDays: 30,
    });

    const analysis = detectGaps('math.algebra', records);
    expect(analysis.gaps).toHaveLength(0);
  });

  it('generates remediation path', () => {
    const records = new Map<string, MasteryRecord>();

    const analysis = detectGaps('math.trigonometry', records);
    expect(analysis.remediationPath.length).toBeGreaterThan(0);
  });

  it('handles skills with no prerequisites', () => {
    const records = new Map<string, MasteryRecord>();
    const analysis = detectGaps('unknown.skill', records);
    expect(analysis.gaps).toHaveLength(0);
  });
});

describe('MasterySystem (ECS)', () => {
  let db: DatabaseConnection;
  let system: MasterySystem;
  let world: World;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Test' });
    profileId = profile.id;

    system = new MasterySystem();
    system.setRepositories(
      new MasteryRepository(db),
      new LearningEventRepository(db),
    );

    world = new World();
    world.addSystem(system);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('processes learning events and creates mastery records', () => {
    system.queueEvent({
      profileId,
      skillId: 'math.arithmetic',
      eventType: 'practice',
      quality: 4,
      context: 'workshop',
    });

    world.update(0.016);

    const masteryRepo = new MasteryRepository(db);
    const record = masteryRepo.getForSkill(profileId, 'math.arithmetic');
    expect(record).toBeDefined();
    expect(record!.attempts).toBe(1);
    expect(record!.successes).toBe(1);
    expect(record!.retentionScore).toBeGreaterThan(0);
  });

  it('handles failed events correctly', () => {
    system.queueEvent({
      profileId,
      skillId: 'math.algebra',
      eventType: 'practice',
      quality: 1, // failure
    });

    world.update(0.016);

    const masteryRepo = new MasteryRepository(db);
    const record = masteryRepo.getForSkill(profileId, 'math.algebra');
    expect(record).toBeDefined();
    expect(record!.successes).toBe(0);
    expect(record!.streak).toBe(0);
  });

  it('processes multiple events in one update', () => {
    system.queueEvent({ profileId, skillId: 'skill.a', eventType: 'practice', quality: 5 });
    system.queueEvent({ profileId, skillId: 'skill.b', eventType: 'practice', quality: 4 });
    system.queueEvent({ profileId, skillId: 'skill.c', eventType: 'practice', quality: 3 });

    world.update(0.016);

    const masteryRepo = new MasteryRepository(db);
    expect(masteryRepo.getForSkill(profileId, 'skill.a')).toBeDefined();
    expect(masteryRepo.getForSkill(profileId, 'skill.b')).toBeDefined();
    expect(masteryRepo.getForSkill(profileId, 'skill.c')).toBeDefined();
  });
});
