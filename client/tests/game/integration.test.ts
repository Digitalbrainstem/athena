import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NexusCore, BIOME_DEFINITIONS } from '@nexus-academy/core';

/**
 * End-to-end integration test:
 * Create NexusCore → create profile → load → update → verify the scene graph
 * contains Workshop biome objects, companion state, and quest availability.
 */
describe('Workshop first-playable integration', () => {
  let core: NexusCore;

  beforeEach(async () => {
    core = await NexusCore.create({ debug: true });
  });

  afterEach(async () => {
    await core.destroy();
  });

  it('creates a profile and loads it', async () => {
    const profile = await core.createProfile({ name: 'Emma', avatarData: 'fox' });
    expect(profile.id).toBeTruthy();
    expect(profile.name).toBe('Emma');
    expect(profile.masteryTier).toBe('foundation');

    await core.loadProfile(profile.id);
    expect(core.getActiveProfileId()).toBe(profile.id);
  });

  it('scene graph contains Workshop biome objects after profile load', async () => {
    const profile = await core.createProfile({ name: 'TestPlayer' });
    await core.loadProfile(profile.id);

    // Run a single tick so the world system builds the scene graph
    core.update(1 / 60, []);

    const sg = core.getSceneGraph();

    // Verify sky and ground match Workshop biome
    const workshopDef = BIOME_DEFINITIONS.find((b) => b.id === 'workshop')!;
    expect(workshopDef).toBeDefined();
    expect(sg.sky.primaryColor).toBe(workshopDef.skyPrimaryColor);
    expect(sg.ground.color).toBe(workshopDef.groundColor);

    // Verify Workshop objects are present in the scene graph
    const objectNames = new Set<string>();
    for (const obj of sg.objects) {
      if (obj.interactable?.prompt) {
        objectNames.add(obj.interactable.prompt);
      }
    }

    // Workshop should have Workbench, Gear Display Wall, and Blueprint Table
    expect(objectNames.has('Interact with Workbench')).toBe(true);
    expect(objectNames.has('Interact with Gear Display Wall')).toBe(true);
    expect(objectNames.has('Interact with Blueprint Table')).toBe(true);
  });

  it('scene graph has proper lighting from Workshop biome', async () => {
    const profile = await core.createProfile({ name: 'LightTest' });
    await core.loadProfile(profile.id);
    core.update(1 / 60, []);

    const sg = core.getSceneGraph();

    // Workshop biome should have at least ambient + directional lights
    expect(sg.lights.length).toBeGreaterThanOrEqual(2);
    const ambient = sg.lights.find((l) => l.lightType === 'ambient');
    const directional = sg.lights.find((l) => l.lightType === 'directional');
    expect(ambient).toBeDefined();
    expect(directional).toBeDefined();
  });

  it('companion state is created with guide personality stage', async () => {
    const profile = await core.createProfile({ name: 'CompanionTest' });
    await core.loadProfile(profile.id);

    const companion = core.getCompanionState();
    expect(companion).toBeDefined();
    expect(companion!.personalityStage).toBe('guide');
    expect(companion!.profileId).toBe(profile.id);
  });

  it('companion greeting interaction is processed', async () => {
    const profile = await core.createProfile({ name: 'GreetTest' });
    await core.loadProfile(profile.id);

    // Queue a greeting
    core.companionSystem.queueInteraction({
      type: 'greet',
      profileId: profile.id,
      context: 'workshop_first_entry',
    });

    // Process the update
    core.update(1 / 60, []);

    // Trust should have increased slightly from the greeting
    const companion = core.getCompanionState();
    expect(companion).toBeDefined();
    expect(companion!.trustLevel).toBeGreaterThan(0);
  });

  it('lists profiles correctly', async () => {
    const before = await core.listProfiles();
    expect(before.length).toBe(0);

    await core.createProfile({ name: 'Player1', avatarData: 'owl' });
    await core.createProfile({ name: 'Player2', avatarData: 'bear' });

    const after = await core.listProfiles();
    expect(after.length).toBe(2);
    expect(after.map((p) => p.name).sort()).toEqual(['Player1', 'Player2']);
  });

  it('camera position tracks player position via setPlayerPosition', async () => {
    const profile = await core.createProfile({ name: 'MoveTest' });
    await core.loadProfile(profile.id);

    // Get initial scene graph
    core.update(1 / 60, []);
    const sgBefore = core.getSceneGraph();
    const camBefore = sgBefore.camera.position;

    // Movement is client-authoritative: write position via API
    core.setPlayerPosition(5, 0);
    core.update(1 / 60, []);

    const sgAfter = core.getSceneGraph();
    const camAfter = sgAfter.camera.position;

    // Camera should have moved in the x direction
    expect(camAfter.x).not.toBe(camBefore.x);
  });

  it('Workshop objects have correct interactable types', async () => {
    const profile = await core.createProfile({ name: 'InteractTest' });
    await core.loadProfile(profile.id);
    core.update(1 / 60, []);

    const sg = core.getSceneGraph();
    const interactables = sg.objects.filter((o) => o.interactable);

    // Workbench = craft, Gear Display Wall = examine, Blueprint Table = use
    const workbench = interactables.find((o) => o.interactable?.prompt.includes('Workbench'));
    const gearWall = interactables.find((o) => o.interactable?.prompt.includes('Gear Display Wall'));
    const blueprint = interactables.find((o) => o.interactable?.prompt.includes('Blueprint Table'));

    expect(workbench?.interactable?.interactionType).toBe('craft');
    expect(gearWall?.interactable?.interactionType).toBe('examine');
    expect(blueprint?.interactable?.interactionType).toBe('use');
  });

  it('scene graph has ground and sky descriptors', async () => {
    const profile = await core.createProfile({ name: 'DescTest' });
    await core.loadProfile(profile.id);
    core.update(1 / 60, []);

    const sg = core.getSceneGraph();

    expect(sg.ground.type).toBe('wood');
    expect(sg.ground.size.width).toBeGreaterThan(0);
    expect(sg.ground.size.depth).toBeGreaterThan(0);
    expect(sg.sky.type).toBe('gradient');
    expect(sg.sky.primaryColor).toBeTruthy();
  });
});
