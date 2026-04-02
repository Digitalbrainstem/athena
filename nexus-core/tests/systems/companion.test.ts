import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { ProfileRepository } from '../../src/db/repositories/profile.js';
import { CompanionRepository } from '../../src/db/repositories/companion.js';
import { World } from '../../src/ecs/world.js';
import {
  CompanionSystem,
  getNextStage,
  shouldAdvanceStage,
  getDialogueStyle,
} from '../../src/systems/companion.js';

describe('Companion Stage Progression', () => {
  it('guide → partner', () => {
    expect(getNextStage('guide')).toBe('partner');
  });

  it('partner → ally', () => {
    expect(getNextStage('partner')).toBe('ally');
  });

  it('ally → peer', () => {
    expect(getNextStage('ally')).toBe('peer');
  });

  it('peer has no next stage', () => {
    expect(getNextStage('peer')).toBeNull();
  });

  it('should advance when age and trust meet threshold', () => {
    expect(shouldAdvanceStage('guide', 0.4, 7)).toBe(true); // partner needs age 6, trust 0.3
  });

  it('should not advance when age too low', () => {
    expect(shouldAdvanceStage('guide', 0.5, 3)).toBe(false); // partner needs age 6
  });

  it('should not advance when trust too low', () => {
    expect(shouldAdvanceStage('guide', 0.1, 10)).toBe(false); // partner needs trust 0.3
  });

  it('peer never advances', () => {
    expect(shouldAdvanceStage('peer', 1.0, 30)).toBe(false);
  });
});

describe('Dialogue Style', () => {
  it('guide style is casual with high encouragement', () => {
    const style = getDialogueStyle('guide');
    expect(style.formality).toBe('casual');
    expect(style.encouragementLevel).toBe('high');
    expect(style.questionComplexity).toBe('simple');
  });

  it('peer style is collaborative with complex questions', () => {
    const style = getDialogueStyle('peer');
    expect(style.formality).toBe('peer');
    expect(style.questionComplexity).toBe('complex');
  });

  it('all stages use humor', () => {
    const stages = ['guide', 'partner', 'ally', 'peer'] as const;
    for (const stage of stages) {
      expect(getDialogueStyle(stage).usesHumor).toBe(true);
    }
  });
});

describe('CompanionSystem', () => {
  let db: DatabaseConnection;
  let world: World;
  let companionSystem: CompanionSystem;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Friend' });
    profileId = profile.id;

    companionSystem = new CompanionSystem();
    companionSystem.setRepository(new CompanionRepository(db));
    companionSystem.loadProfile(profileId);

    world = new World();
    world.addSystem(companionSystem);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('gets companion state', () => {
    const state = companionSystem.getState();
    expect(state).toBeDefined();
    expect(state!.name).toBe('Buddy');
    expect(state!.personalityStage).toBe('guide');
    expect(state!.trustLevel).toBe(0.5);
  });

  it('processes greet interaction', () => {
    companionSystem.queueInteraction({
      type: 'greet',
      profileId,
    });

    world.update(0.016);

    const state = companionSystem.getState();
    expect(state!.trustLevel).toBeGreaterThan(0.5);
    expect(state!.memory.length).toBeGreaterThan(0);
  });

  it('processes teach interaction with trust boost', () => {
    companionSystem.queueInteraction({
      type: 'teach_request',
      profileId,
      context: 'math.geometry',
      quality: 5,
    });

    world.update(0.016);

    const state = companionSystem.getState();
    expect(state!.trustLevel).toBeGreaterThan(0.5);
  });

  it('records memories', () => {
    companionSystem.queueInteraction({ type: 'greet', profileId });
    companionSystem.queueInteraction({ type: 'encourage', profileId });
    companionSystem.queueInteraction({ type: 'react', profileId, context: 'built a bridge' });

    world.update(0.016);

    const state = companionSystem.getState();
    expect(state!.memory.length).toBe(3);
  });

  it('checks stage advancement', () => {
    // Adjust trust to above partner threshold
    const companionRepo = new CompanionRepository(db);
    companionRepo.update(profileId, { trustLevel: 0.4 });

    const advanced = companionSystem.checkStageAdvancement(profileId, 8);
    expect(advanced).toBe(true);

    const state = companionRepo.get(profileId);
    expect(state!.personalityStage).toBe('partner');
  });

  it('does not advance if conditions not met', () => {
    const advanced = companionSystem.checkStageAdvancement(profileId, 3); // too young
    expect(advanced).toBe(false);
  });

  it('gets dialogue style for current state', () => {
    const style = companionSystem.getDialogueStyle();
    expect(style).toBeDefined();
    expect(style!.formality).toBe('casual'); // guide stage
  });
});
