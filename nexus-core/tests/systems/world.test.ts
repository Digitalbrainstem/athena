import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema } from '../../src/db/schema.js';
import { ProfileRepository } from '../../src/db/repositories/profile.js';
import { WorldStateRepository } from '../../src/db/repositories/world-state.js';
import { World } from '../../src/ecs/world.js';
import { WorldSystem, BIOME_DEFINITIONS, getBiomeDefinition } from '../../src/systems/world.js';

describe('Biome Definitions', () => {
  it('has at least 5 biomes defined', () => {
    expect(BIOME_DEFINITIONS.length).toBeGreaterThanOrEqual(5);
  });

  it('each biome has required fields', () => {
    for (const biome of BIOME_DEFINITIONS) {
      expect(biome.id).toBeTruthy();
      expect(biome.name).toBeTruthy();
      expect(biome.description).toBeTruthy();
      expect(biome.primarySubjects.length).toBeGreaterThan(0);
      expect(biome.objects.length).toBeGreaterThan(0);
      expect(biome.ambientLighting).toBeDefined();
      expect(biome.groundType).toBeTruthy();
      expect(biome.skyType).toBeTruthy();
    }
  });

  it('gets biome by ID', () => {
    const workshop = getBiomeDefinition('workshop');
    expect(workshop).toBeDefined();
    expect(workshop!.name).toBe('The Workshop');
  });

  it('returns undefined for unknown biome', () => {
    expect(getBiomeDefinition('nonexistent')).toBeUndefined();
  });

  it('workshop biome has correct subjects', () => {
    const workshop = getBiomeDefinition('workshop')!;
    expect(workshop.primarySubjects).toContain('engineering');
    expect(workshop.primarySubjects).toContain('math.arithmetic');
  });

  it('alchemist lab biome has chemistry', () => {
    const lab = getBiomeDefinition('alchemist-lab')!;
    expect(lab.primarySubjects).toContain('science.chemistry');
  });

  it('living forest biome has biology', () => {
    const forest = getBiomeDefinition('living-forest')!;
    expect(forest.primarySubjects).toContain('science.biology.basics');
  });
});

describe('WorldSystem', () => {
  let db: DatabaseConnection;
  let world: World;
  let worldSystem: WorldSystem;
  let profileId: string;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);

    const profileRepo = new ProfileRepository(db);
    const profile = profileRepo.create({ name: 'Explorer' });
    profileId = profile.id;

    worldSystem = new WorldSystem();
    worldSystem.setRepository(new WorldStateRepository(db));

    world = new World();
    world.registerComponent('position');
    world.registerComponent('rotation');
    world.registerComponent('renderable');
    world.registerComponent('interactable');
    world.registerComponent('player');
    world.registerComponent('light');
    world.addSystem(worldSystem);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('loads profile and gets world state', () => {
    worldSystem.loadProfile(profileId);
    const state = worldSystem.getWorldState();

    expect(state).toBeDefined();
    expect(state!.activeBiome).toBe('workshop');
    expect(state!.discoveredBiomes).toContain('workshop');
  });

  it('changes biome when discovered', () => {
    worldSystem.loadProfile(profileId);
    worldSystem.discoverBiome('alchemist-lab');

    const changed = worldSystem.changeBiome('alchemist-lab');
    expect(changed).toBe(true);

    const state = worldSystem.getWorldState();
    expect(state!.activeBiome).toBe('alchemist-lab');
  });

  it('rejects biome change to undiscovered biome', () => {
    worldSystem.loadProfile(profileId);

    const changed = worldSystem.changeBiome('crystal-caverns');
    expect(changed).toBe(false);
  });

  it('discovers new biomes', () => {
    worldSystem.loadProfile(profileId);

    const discovered = worldSystem.discoverBiome('living-forest');
    expect(discovered).toBe(true);

    const state = worldSystem.getWorldState();
    expect(state!.discoveredBiomes).toContain('living-forest');
  });

  it('rejects invalid biome discovery', () => {
    worldSystem.loadProfile(profileId);
    expect(worldSystem.discoverBiome('nonexistent-biome')).toBe(false);
  });

  it('manages inventory', () => {
    worldSystem.loadProfile(profileId);

    worldSystem.addInventoryItem('wood', 5);
    worldSystem.addInventoryItem('stone', 3);

    let inventory = worldSystem.getInventory();
    expect(inventory).toHaveLength(2);
    expect(inventory.find(i => i.itemType === 'wood')!.quantity).toBe(5);

    worldSystem.removeInventoryItem('wood', 2);
    inventory = worldSystem.getInventory();
    expect(inventory.find(i => i.itemType === 'wood')!.quantity).toBe(3);
  });

  it('rejects removing more items than available', () => {
    worldSystem.loadProfile(profileId);
    worldSystem.addInventoryItem('gem', 2);

    expect(worldSystem.removeInventoryItem('gem', 5)).toBe(false);
  });

  it('builds scene graph from world state', () => {
    worldSystem.loadProfile(profileId);
    const graph = worldSystem.buildSceneGraph(world);

    expect(graph.camera).toBeDefined();
    expect(graph.lights.length).toBeGreaterThan(0);
    expect(graph.objects.length).toBeGreaterThan(0); // Biome objects
    expect(graph.sky).toBeDefined();
    expect(graph.ground).toBeDefined();
    expect(graph.ui).toBeDefined();
  });

  it('scene graph includes biome-specific objects', () => {
    worldSystem.loadProfile(profileId);
    const graph = worldSystem.buildSceneGraph(world);

    // Workshop biome has workbench, gear wall, blueprint table
    expect(graph.objects.length).toBeGreaterThanOrEqual(3);
  });

  it('scene graph includes ECS entities', () => {
    worldSystem.loadProfile(profileId);

    const entity = world.createEntity();
    world.addComponent(entity, 'position', { x: 5, y: 0, z: 5 });
    world.addComponent(entity, 'renderable', {
      meshType: 'sphere',
      color: '#ff0000',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    });

    const graph = worldSystem.buildSceneGraph(world);

    const ecsObject = graph.objects.find((o) => o.entityId === entity);
    expect(ecsObject).toBeDefined();
    expect(ecsObject!.position).toEqual({ x: 5, y: 0, z: 5 });
  });

  it('camera follows player entity', () => {
    worldSystem.loadProfile(profileId);

    const player = world.createEntity();
    world.addComponent(player, 'player', {
      profileId,
      masteryTier: 'foundation',
      activeBiome: 'workshop',
    });
    world.addComponent(player, 'position', { x: 10, y: 0, z: 20 });

    const graph = worldSystem.buildSceneGraph(world);
    expect(graph.camera.position.x).toBe(10);
    expect(graph.camera.position.z).toBe(20); // first-person — camera at player z
  });
});
