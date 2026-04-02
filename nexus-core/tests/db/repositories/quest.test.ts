import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../../src/db/connection.js';
import { createSchema } from '../../../src/db/schema.js';
import { ProfileRepository } from '../../../src/db/repositories/profile.js';
import { QuestRepository } from '../../../src/db/repositories/quest.js';

describe('QuestRepository', () => {
  let db: DatabaseConnection;
  let repo: QuestRepository;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Test Player' });
    profileId = profile.id;

    repo = new QuestRepository(db);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  const sampleQuest = {
    id: 'quest-1',
    title: 'Build a Bridge',
    biome: 'workshop',
    masteryTier: 'foundation',
    skillsRequired: ['math.arithmetic'],
    skillsTaught: ['math.geometry', 'engineering.structures'],
    content: {
      description: 'Build a bridge across the workshop chasm',
      steps: [
        { index: 0, instruction: 'Examine the chasm', objectiveType: 'observe' as const },
        { index: 1, instruction: 'Collect materials', objectiveType: 'collect' as const, requiredCount: 3 },
        { index: 2, instruction: 'Build the bridge', objectiveType: 'build' as const },
      ],
    },
  };

  it('creates a quest', () => {
    const quest = repo.create(sampleQuest);
    expect(quest.id).toBe('quest-1');
    expect(quest.title).toBe('Build a Bridge');
    expect(quest.biome).toBe('workshop');
    expect(quest.skillsTaught).toEqual(['math.geometry', 'engineering.structures']);
    expect(quest.content.steps).toHaveLength(3);
  });

  it('gets a quest by ID', () => {
    repo.create(sampleQuest);
    const quest = repo.getById('quest-1');
    expect(quest).toBeDefined();
    expect(quest!.title).toBe('Build a Bridge');
  });

  it('returns undefined for non-existent quest', () => {
    expect(repo.getById('nonexistent')).toBeUndefined();
  });

  it('gets quests by biome and tier', () => {
    repo.create(sampleQuest);
    repo.create({
      ...sampleQuest,
      id: 'quest-2',
      title: 'Gear Mechanics',
    });
    repo.create({
      ...sampleQuest,
      id: 'quest-3',
      title: 'Advanced Math',
      masteryTier: 'discovery',
    });

    const foundationQuests = repo.getForBiomeAndTier('workshop', 'foundation');
    expect(foundationQuests).toHaveLength(2);

    const discoveryQuests = repo.getForBiomeAndTier('workshop', 'discovery');
    expect(discoveryQuests).toHaveLength(1);
  });

  it('lists all quests', () => {
    repo.create(sampleQuest);
    repo.create({ ...sampleQuest, id: 'quest-2', title: 'Quest 2' });

    const all = repo.list();
    expect(all).toHaveLength(2);
  });

  it('deletes a quest', () => {
    repo.create(sampleQuest);
    expect(repo.delete('quest-1')).toBe(true);
    expect(repo.getById('quest-1')).toBeUndefined();
  });

  // --- Progress tracking ---

  it('starts a quest', () => {
    repo.create(sampleQuest);
    const progress = repo.startQuest(profileId, 'quest-1');

    expect(progress.status).toBe('active');
    expect(progress.questId).toBe('quest-1');
    expect(progress.profileId).toBe(profileId);
    expect(progress.startedAt).toBeTruthy();
    expect(progress.stepsCompleted).toBe(0);
  });

  it('updates quest progress', () => {
    repo.create(sampleQuest);
    repo.startQuest(profileId, 'quest-1');

    const updated = repo.updateProgress(profileId, 'quest-1', 2);
    expect(updated!.stepsCompleted).toBe(2);
  });

  it('completes a quest', () => {
    repo.create(sampleQuest);
    repo.startQuest(profileId, 'quest-1');

    const completed = repo.completeQuest(profileId, 'quest-1');
    expect(completed!.status).toBe('completed');
    expect(completed!.completedAt).toBeTruthy();
  });

  it('abandons a quest', () => {
    repo.create(sampleQuest);
    repo.startQuest(profileId, 'quest-1');

    const abandoned = repo.abandonQuest(profileId, 'quest-1');
    expect(abandoned!.status).toBe('abandoned');
  });

  it('gets active quests for a profile', () => {
    repo.create(sampleQuest);
    repo.create({ ...sampleQuest, id: 'quest-2', title: 'Quest 2' });
    repo.create({ ...sampleQuest, id: 'quest-3', title: 'Quest 3' });

    repo.startQuest(profileId, 'quest-1');
    repo.startQuest(profileId, 'quest-2');
    repo.startQuest(profileId, 'quest-3');
    repo.completeQuest(profileId, 'quest-3');

    const active = repo.getActiveForProfile(profileId);
    expect(active).toHaveLength(2);
  });

  it('gets completed quests for a profile', () => {
    repo.create(sampleQuest);
    repo.create({ ...sampleQuest, id: 'quest-2', title: 'Quest 2' });

    repo.startQuest(profileId, 'quest-1');
    repo.completeQuest(profileId, 'quest-1');
    repo.startQuest(profileId, 'quest-2');

    const completed = repo.getCompletedForProfile(profileId);
    expect(completed).toHaveLength(1);
    expect(completed[0]!.questId).toBe('quest-1');
  });

  it('restarts abandoned quest', () => {
    repo.create(sampleQuest);
    repo.startQuest(profileId, 'quest-1');
    repo.abandonQuest(profileId, 'quest-1');

    const restarted = repo.startQuest(profileId, 'quest-1');
    expect(restarted.status).toBe('active');
    expect(restarted.stepsCompleted).toBe(0);
  });

  it('deserializes quest content correctly', () => {
    repo.create(sampleQuest);
    const quest = repo.getById('quest-1');

    expect(quest!.content.steps).toHaveLength(3);
    expect(quest!.content.steps[0]!.instruction).toBe('Examine the chasm');
    expect(quest!.content.steps[1]!.requiredCount).toBe(3);
  });
});
