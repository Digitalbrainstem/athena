import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../../src/db/connection.js';
import { createSchema } from '../../../src/db/schema.js';
import { ProfileRepository } from '../../../src/db/repositories/profile.js';
import { MasteryRepository } from '../../../src/db/repositories/mastery.js';

describe('MasteryRepository', () => {
  let db: DatabaseConnection;
  let repo: MasteryRepository;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Test Player' });
    profileId = profile.id;

    repo = new MasteryRepository(db);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('creates a mastery record via upsert', () => {
    const record = repo.upsert(profileId, 'math.arithmetic', {
      level: 0.5,
      retentionScore: 0.6,
    });

    expect(record.profileId).toBe(profileId);
    expect(record.skillId).toBe('math.arithmetic');
    expect(record.level).toBe(0.5);
    expect(record.retentionScore).toBe(0.6);
    expect(record.easeFactor).toBe(2.5);
  });

  it('updates existing record via upsert', () => {
    repo.upsert(profileId, 'math.arithmetic', { level: 0.3 });
    const updated = repo.upsert(profileId, 'math.arithmetic', { level: 0.7 });

    expect(updated.level).toBe(0.7);
  });

  it('gets records for a profile', () => {
    repo.upsert(profileId, 'math.arithmetic', { level: 0.5 });
    repo.upsert(profileId, 'math.geometry', { level: 0.3 });
    repo.upsert(profileId, 'science.physics', { level: 0.1 });

    const records = repo.getForProfile(profileId);
    expect(records).toHaveLength(3);
  });

  it('gets a specific skill record', () => {
    repo.upsert(profileId, 'math.arithmetic', { level: 0.5 });

    const record = repo.getForSkill(profileId, 'math.arithmetic');
    expect(record).toBeDefined();
    expect(record!.level).toBe(0.5);
  });

  it('returns undefined for non-existent skill', () => {
    expect(repo.getForSkill(profileId, 'nonexistent')).toBeUndefined();
  });

  it('gets records due for review', () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString().replace('T', ' ').slice(0, 19);
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString().replace('T', ' ').slice(0, 19);

    repo.upsert(profileId, 'math.arithmetic', { nextReview: pastDate });
    repo.upsert(profileId, 'math.geometry', { nextReview: futureDate });

    const due = repo.getDueForReview(profileId);
    expect(due).toHaveLength(1);
    expect(due[0]!.skillId).toBe('math.arithmetic');
  });

  it('gets weak skills below threshold', () => {
    repo.upsert(profileId, 'math.arithmetic', {
      retentionScore: 0.8,
      transferScore: 0.8,
      depthScore: 0.8,
    });
    repo.upsert(profileId, 'math.geometry', {
      retentionScore: 0.3,
      transferScore: 0.2,
      depthScore: 0.1,
    });

    const weak = repo.getWeakSkills(profileId, 0.5);
    expect(weak).toHaveLength(1);
    expect(weak[0]!.skillId).toBe('math.geometry');
  });

  it('deletes mastery record', () => {
    repo.upsert(profileId, 'math.arithmetic', {});
    expect(repo.delete(profileId, 'math.arithmetic')).toBe(true);
    expect(repo.getForSkill(profileId, 'math.arithmetic')).toBeUndefined();
  });

  it('returns false when deleting non-existent record', () => {
    expect(repo.delete(profileId, 'nonexistent')).toBe(false);
  });

  it('handles all mastery dimensions', () => {
    const record = repo.upsert(profileId, 'science.chemistry', {
      level: 0.5,
      retentionScore: 0.6,
      transferScore: 0.4,
      depthScore: 0.7,
      attempts: 10,
      successes: 8,
      easeFactor: 2.3,
      streak: 5,
      intervalDays: 12,
    });

    expect(record.retentionScore).toBe(0.6);
    expect(record.transferScore).toBe(0.4);
    expect(record.depthScore).toBe(0.7);
    expect(record.attempts).toBe(10);
    expect(record.successes).toBe(8);
    expect(record.easeFactor).toBe(2.3);
    expect(record.streak).toBe(5);
    expect(record.intervalDays).toBe(12);
  });

  it('upsert with defaults creates valid record', () => {
    const record = repo.upsert(profileId, 'new.skill', {});

    expect(record.level).toBe(0);
    expect(record.retentionScore).toBe(0);
    expect(record.transferScore).toBe(0);
    expect(record.depthScore).toBe(0);
    expect(record.attempts).toBe(0);
    expect(record.successes).toBe(0);
    expect(record.easeFactor).toBe(2.5);
    expect(record.streak).toBe(0);
    expect(record.intervalDays).toBe(0);
  });
});
