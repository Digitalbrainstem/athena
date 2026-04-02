import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { ProfileRepository } from '../../src/db/repositories/profile.js';
import { QuestRepository } from '../../src/db/repositories/quest.js';
import { MasteryRepository } from '../../src/db/repositories/mastery.js';
import { LearningEventRepository } from '../../src/db/repositories/learning-event.js';
import { World } from '../../src/ecs/world.js';
import { QuestSystem, canTransition } from '../../src/systems/quest.js';
import { MasterySystem } from '../../src/systems/mastery.js';

describe('Quest State Machine', () => {
  it('allows available → active', () => {
    expect(canTransition('available', 'active')).toBe(true);
  });

  it('allows active → completed', () => {
    expect(canTransition('active', 'completed')).toBe(true);
  });

  it('allows active → abandoned', () => {
    expect(canTransition('active', 'abandoned')).toBe(true);
  });

  it('allows abandoned → active (restart)', () => {
    expect(canTransition('abandoned', 'active')).toBe(true);
  });

  it('disallows completed → active', () => {
    expect(canTransition('completed', 'active')).toBe(false);
  });

  it('disallows available → completed', () => {
    expect(canTransition('available', 'completed')).toBe(false);
  });
});

describe('QuestSystem', () => {
  let db: DatabaseConnection;
  let world: World;
  let questSystem: QuestSystem;
  let masterySystem: MasterySystem;
  let questRepo: QuestRepository;
  let profileId: string;

  const sampleQuest = {
    id: 'quest-bridge',
    title: 'Build a Bridge',
    biome: 'workshop',
    masteryTier: 'foundation',
    skillsRequired: [] as string[],
    skillsTaught: ['math.geometry', 'engineering.structures'],
    content: {
      description: 'Build a bridge',
      steps: [
        { index: 0, instruction: 'Examine', objectiveType: 'observe' as const },
        { index: 1, instruction: 'Collect', objectiveType: 'collect' as const },
        { index: 2, instruction: 'Build', objectiveType: 'build' as const },
      ],
    },
  };

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Tester' });
    profileId = profile.id;

    questRepo = new QuestRepository(db);
    const masteryRepo = new MasteryRepository(db);
    const eventRepo = new LearningEventRepository(db);

    masterySystem = new MasterySystem();
    masterySystem.setRepositories(masteryRepo, eventRepo);

    questSystem = new QuestSystem();
    questSystem.setRepositories(questRepo, masteryRepo);
    questSystem.setMasterySystem(masterySystem);

    world = new World();
    world.addSystem(masterySystem);
    world.addSystem(questSystem);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('starts a quest via action', () => {
    questRepo.create(sampleQuest);

    questSystem.queueAction({
      type: 'start',
      questId: 'quest-bridge',
      profileId,
    });

    world.update(0.016);

    const active = questSystem.getActiveQuests(profileId);
    expect(active).toHaveLength(1);
    expect(active[0]!.questId).toBe('quest-bridge');
  });

  it('progresses a quest', () => {
    questRepo.create(sampleQuest);
    questSystem.queueAction({ type: 'start', questId: 'quest-bridge', profileId });
    world.update(0.016);

    questSystem.queueAction({ type: 'progress', questId: 'quest-bridge', profileId, stepsCompleted: 2 });
    world.update(0.016);

    const progress = questRepo.getProgress(profileId, 'quest-bridge');
    expect(progress!.stepsCompleted).toBe(2);
  });

  it('auto-completes quest when all steps done', () => {
    questRepo.create(sampleQuest);
    questSystem.queueAction({ type: 'start', questId: 'quest-bridge', profileId });
    world.update(0.016);

    questSystem.queueAction({ type: 'progress', questId: 'quest-bridge', profileId, stepsCompleted: 3 });
    world.update(0.016);

    const progress = questRepo.getProgress(profileId, 'quest-bridge');
    expect(progress!.status).toBe('completed');
  });

  it('generates learning events on completion', () => {
    questRepo.create(sampleQuest);
    questSystem.queueAction({ type: 'start', questId: 'quest-bridge', profileId });
    world.update(0.016);

    questSystem.queueAction({ type: 'complete', questId: 'quest-bridge', profileId });
    world.update(0.016);

    // Mastery system should process events next update
    world.update(0.016);

    const masteryRepo = new MasteryRepository(db);
    const geometry = masteryRepo.getForSkill(profileId, 'math.geometry');
    expect(geometry).toBeDefined();
    expect(geometry!.attempts).toBeGreaterThan(0);
  });

  it('abandons a quest', () => {
    questRepo.create(sampleQuest);
    questSystem.queueAction({ type: 'start', questId: 'quest-bridge', profileId });
    world.update(0.016);

    questSystem.queueAction({ type: 'abandon', questId: 'quest-bridge', profileId });
    world.update(0.016);

    const progress = questRepo.getProgress(profileId, 'quest-bridge');
    expect(progress!.status).toBe('abandoned');
  });

  it('selects quests based on biome and tier', () => {
    questRepo.create(sampleQuest);
    questRepo.create({
      ...sampleQuest,
      id: 'quest-gears',
      title: 'Gear Mechanics',
    });

    const selected = questSystem.selectQuests({
      profileId,
      biome: 'workshop',
      masteryTier: 'foundation',
    });

    expect(selected.length).toBeGreaterThan(0);
  });

  it('respects max active quest limit', () => {
    for (let i = 0; i < 5; i++) {
      questRepo.create({
        ...sampleQuest,
        id: `quest-${i}`,
        title: `Quest ${i}`,
      });
    }

    // Start 3 quests (max)
    for (let i = 0; i < 3; i++) {
      questSystem.queueAction({ type: 'start', questId: `quest-${i}`, profileId });
    }
    world.update(0.016);

    const selected = questSystem.selectQuests({
      profileId,
      biome: 'workshop',
      masteryTier: 'foundation',
      maxActive: 3,
    });

    expect(selected).toHaveLength(0);
  });
});
