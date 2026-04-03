import { describe, it, expect, afterEach } from 'vitest';
import { NexusCore } from '../src/core.js';

describe('NexusCore Integration', () => {
  let core: NexusCore | null = null;

  afterEach(async () => {
    if (core) {
      await core.destroy();
      core = null;
    }
  });

  it('creates a NexusCore instance', async () => {
    core = await NexusCore.create();
    expect(core).toBeDefined();
  });

  it('creates and lists profiles', async () => {
    core = await NexusCore.create();

    const profile1 = await core.createProfile({ name: 'Alice' });
    const profile2 = await core.createProfile({ name: 'Bob' });

    expect(profile1.name).toBe('Alice');
    expect(profile2.name).toBe('Bob');

    const profiles = await core.listProfiles();
    expect(profiles).toHaveLength(2);
  });

  it('loads a profile', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Charlie' });
    await core.loadProfile(profile.id);

    expect(core.getActiveProfileId()).toBe(profile.id);
  });

  it('throws when loading non-existent profile', async () => {
    core = await NexusCore.create();
    await expect(core.loadProfile('nonexistent')).rejects.toThrow('not found');
  });

  it('runs the game loop', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Player' });
    await core.loadProfile(profile.id);

    // Run a few frames
    core.update(0.016, []);
    core.update(0.016, []);
    core.update(0.016, []);

    const graph = core.getSceneGraph();
    expect(graph).toBeDefined();
    expect(graph.camera).toBeDefined();
    expect(graph.lights.length).toBeGreaterThan(0);
    expect(graph.objects.length).toBeGreaterThan(0);
  });

  it('sets player position via client-authoritative API', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Mover' });
    await core.loadProfile(profile.id);

    const world = core.getWorld();
    const players = world.query(['player', 'position']);
    expect(players.length).toBe(1);

    const playerEntity = players[0]!;
    const posBefore = world.getComponent(playerEntity, 'position');
    expect(posBefore).toBeDefined();

    // Movement is now client-authoritative via setPlayerPosition (the
    // WorldSystem no longer applies speed*dt). Verify the API works.
    core.setPlayerPosition(5, 10);

    const posAfter = world.getComponent(playerEntity, 'position');
    expect(posAfter!.x).toBe(5);
    expect(posAfter!.z).toBe(10);
  });

  it('accesses mastery data', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Scholar' });
    await core.loadProfile(profile.id);

    // Initially empty
    const mastery = core.getMasteryForProfile(profile.id);
    expect(mastery).toHaveLength(0);

    // Queue a learning event
    core.masterySystem.queueEvent({
      profileId: profile.id,
      skillId: 'math.arithmetic',
      eventType: 'practice',
      quality: 5,
    });

    core.update(0.016, []);

    const updated = core.getMasteryForProfile(profile.id);
    expect(updated).toHaveLength(1);
    expect(updated[0]!.skillId).toBe('math.arithmetic');
  });

  it('manages quests end-to-end', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Quester' });
    await core.loadProfile(profile.id);

    // Create a quest
    core.quests.create({
      id: 'test-quest',
      title: 'Test Quest',
      biome: 'workshop',
      masteryTier: 'foundation',
      skillsTaught: ['math.arithmetic'],
      content: {
        description: 'A test quest',
        steps: [
          { index: 0, instruction: 'Do step 1', objectiveType: 'observe' },
        ],
      },
    });

    // Start and complete it
    core.questSystem.queueAction({
      type: 'start',
      questId: 'test-quest',
      profileId: profile.id,
    });
    core.update(0.016, []);

    const active = core.getActiveQuests();
    expect(active).toHaveLength(1);

    core.questSystem.queueAction({
      type: 'complete',
      questId: 'test-quest',
      profileId: profile.id,
    });
    core.update(0.016, []);

    expect(core.getActiveQuests()).toHaveLength(0);
  });

  it('gets companion state', async () => {
    core = await NexusCore.create();

    const profile = await core.createProfile({ name: 'Companion Tester' });
    await core.loadProfile(profile.id);

    const companion = core.getCompanionState();
    expect(companion).toBeDefined();
    expect(companion!.name).toBe('Buddy');
  });

  it('exports and imports data', async () => {
    core = await NexusCore.create();

    await core.createProfile({ name: 'Exportable' });

    const exported = await core.exportData();
    expect(exported).toBeInstanceOf(Uint8Array);
    expect(exported.length).toBeGreaterThan(0);

    // Import into a new core
    const core2 = await NexusCore.create({ existingData: exported });

    const profiles = await core2.listProfiles();
    expect(profiles).toHaveLength(1);
    expect(profiles[0]!.name).toBe('Exportable');

    await core2.destroy();
  });

  it('destroys cleanly', async () => {
    core = await NexusCore.create();
    await core.createProfile({ name: 'Temp' });
    await core.destroy();
    core = null;
    // No errors should occur
  });

  it('scene graph has proper structure', async () => {
    core = await NexusCore.create();
    const profile = await core.createProfile({ name: 'Scene Test' });
    await core.loadProfile(profile.id);

    core.update(0.016, []);
    const graph = core.getSceneGraph();

    // Camera
    expect(graph.camera.fov).toBe(70);
    expect(graph.camera.near).toBe(0.1);
    expect(graph.camera.far).toBe(500);

    // Sky and ground
    expect(graph.sky.type).toBeTruthy();
    expect(graph.ground.type).toBeTruthy();
    expect(graph.ground.size.width).toBeGreaterThan(0);

    // UI state
    expect(graph.ui.paused).toBe(false);
    expect(graph.ui.dialogueActive).toBe(false);
    expect(graph.ui.inventoryOpen).toBe(false);
  });
});
