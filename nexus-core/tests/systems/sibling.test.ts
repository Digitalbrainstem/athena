import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../../src/ecs/world.js';
import { SiblingPlaySystem } from '../../src/systems/sibling.js';
import type { SiblingProfile, SharedStructure, Discovery } from '../../src/types/sibling.js';

function makeProfile(
  id: string,
  name: string,
  tier: 'foundation' | 'discovery' | 'builder' | 'innovator' | 'creator' = 'foundation',
  stage: 'guide' | 'partner' | 'ally' | 'peer' = 'guide',
): SiblingProfile {
  return { profileId: id, name, masteryTier: tier, companionStage: stage, isActive: true };
}

describe('SiblingPlaySystem', () => {
  let system: SiblingPlaySystem;

  beforeEach(() => {
    system = new SiblingPlaySystem();
  });

  // --- Shared world lifecycle ---

  describe('createSharedWorld', () => {
    it('creates a shared world with multiple profiles', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'foundation', 'guide'),
        makeProfile('p2', 'Jordan', 'discovery', 'partner'),
      ];
      const world = system.createSharedWorld(profiles);

      expect(world.worldSeed).toBeTruthy();
      expect(world.sharedStructures).toEqual([]);
      expect(world.sharedDiscoveries).toEqual([]);
      expect(world.playerViews.size).toBe(2);
      expect(world.createdAt).toBeTruthy();
    });

    it('rejects empty profiles', () => {
      expect(() => system.createSharedWorld([])).toThrow('At least one profile');
    });

    it('rejects more than 6 profiles', () => {
      const profiles = Array.from({ length: 7 }, (_, i) =>
        makeProfile(`p${i}`, `Player ${i}`),
      );
      expect(() => system.createSharedWorld(profiles)).toThrow('Maximum 6');
    });

    it('allows a single profile (solo household)', () => {
      const world = system.createSharedWorld([makeProfile('p1', 'Alex')]);
      expect(world.playerViews.size).toBe(1);
    });
  });

  // --- Player views ---

  describe('getPlayerView', () => {
    it('returns the correct view for each player', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'foundation', 'guide'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const view1 = system.getPlayerView(world.worldSeed, 'p1');
      expect(view1).toBeDefined();
      expect(view1!.masteryTier).toBe('foundation');
      expect(view1!.challengeDifficulty).toBe('foundation');
      expect(view1!.companionStage).toBe('guide');

      const view2 = system.getPlayerView(world.worldSeed, 'p2');
      expect(view2).toBeDefined();
      expect(view2!.masteryTier).toBe('builder');
      expect(view2!.challengeDifficulty).toBe('builder');
      expect(view2!.companionStage).toBe('ally');
    });

    it('returns undefined for unknown profile', () => {
      const world = system.createSharedWorld([makeProfile('p1', 'Alex')]);
      expect(system.getPlayerView(world.worldSeed, 'unknown')).toBeUndefined();
    });

    it('returns undefined for unknown world', () => {
      expect(system.getPlayerView('bad-seed', 'p1')).toBeUndefined();
    });
  });

  describe('getAllPlayerViews', () => {
    it('returns all views', () => {
      const profiles = [
        makeProfile('p1', 'Alex'),
        makeProfile('p2', 'Jordan'),
        makeProfile('p3', 'Morgan'),
      ];
      const world = system.createSharedWorld(profiles);
      const views = system.getAllPlayerViews(world.worldSeed);
      expect(views.length).toBe(3);
    });

    it('returns empty for unknown world', () => {
      expect(system.getAllPlayerViews('unknown')).toEqual([]);
    });
  });

  // --- Same biome, different difficulty ---

  describe('same biome, different difficulty', () => {
    it('siblings in the same world see different challenge difficulties', () => {
      const profiles = [
        makeProfile('young', 'Emma', 'foundation', 'guide'),
        makeProfile('old', 'Sam', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const youngView = system.getPlayerView(world.worldSeed, 'young')!;
      const oldView = system.getPlayerView(world.worldSeed, 'old')!;

      // Same world, same biome default
      expect(youngView.activeBiome).toBe(oldView.activeBiome);
      // Different difficulty
      expect(youngView.challengeDifficulty).toBe('foundation');
      expect(oldView.challengeDifficulty).toBe('builder');
    });
  });

  // --- Shared structures ---

  describe('addSharedStructure', () => {
    it('adds a structure visible to all siblings', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const structure: SharedStructure = {
        id: 'bridge-1',
        biome: 'workshop',
        type: 'bridge',
        position: { x: 0, y: 0, z: 0 },
        builtByProfileId: 'p1',
        builtByName: 'Alex',
        createdAt: new Date().toISOString(),
      };

      system.addSharedStructure(world.worldSeed, structure);

      const structures = system.getSharedStructures(world.worldSeed);
      expect(structures.length).toBe(1);
      expect(structures[0]!.builtByName).toBe('Alex');
    });

    it('generates companion messages for OTHER siblings (not the builder)', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
        makeProfile('p3', 'Morgan', 'foundation', 'guide'),
      ];
      const world = system.createSharedWorld(profiles);

      const structure: SharedStructure = {
        id: 'bridge-1',
        biome: 'workshop',
        type: 'bridge',
        position: { x: 0, y: 0, z: 0 },
        builtByProfileId: 'p1',
        builtByName: 'Alex',
        createdAt: new Date().toISOString(),
      };

      system.addSharedStructure(world.worldSeed, structure);
      const messages = system.drainMessages();

      // 2 messages (Jordan and Morgan, not Alex)
      expect(messages.length).toBe(2);
      expect(messages.every((m) => m.targetProfileId !== 'p1')).toBe(true);
      expect(messages.every((m) => m.messageType === 'structure_built')).toBe(true);
    });

    it('companion message adapts to stage', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'foundation', 'guide'),
      ];
      const world = system.createSharedWorld(profiles);

      system.addSharedStructure(world.worldSeed, {
        id: 's1',
        biome: 'workshop',
        type: 'tower',
        position: { x: 0, y: 0, z: 0 },
        builtByProfileId: 'p1',
        builtByName: 'Alex',
        createdAt: new Date().toISOString(),
      });

      const messages = system.drainMessages();
      expect(messages.length).toBe(1);
      // Guide stage gets excited message
      expect(messages[0]!.text).toContain('Alex');
      expect(messages[0]!.text).toContain('tower');
    });

    it('throws for unknown world', () => {
      expect(() =>
        system.addSharedStructure('unknown', {
          id: 's1',
          biome: 'workshop',
          type: 'bridge',
          position: { x: 0, y: 0, z: 0 },
          builtByProfileId: 'p1',
          builtByName: 'Alex',
          createdAt: new Date().toISOString(),
        }),
      ).toThrow('Shared world not found');
    });
  });

  // --- Discovery sharing ---

  describe('shareDiscovery', () => {
    it('shares a discovery with all siblings', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const discovery: Discovery = {
        id: 'disc-1',
        type: 'fragment',
        description: 'a star in the Observatory',
        biome: 'observatory',
        foundByProfileId: 'p1',
        foundByName: 'Alex',
        timestamp: new Date().toISOString(),
      };

      system.shareDiscovery(world.worldSeed, discovery);

      const discoveries = system.getSharedDiscoveries(world.worldSeed);
      expect(discoveries.length).toBe(1);
      expect(discoveries[0]!.foundByName).toBe('Alex');
    });

    it('notifies other siblings about the discovery', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      system.shareDiscovery(world.worldSeed, {
        id: 'disc-1',
        type: 'biome',
        description: 'the Crystal Caverns',
        biome: 'crystal-caverns',
        foundByProfileId: 'p1',
        foundByName: 'Alex',
        timestamp: new Date().toISOString(),
      });

      const messages = system.drainMessages();
      expect(messages.length).toBe(1);
      expect(messages[0]!.targetProfileId).toBe('p2');
      expect(messages[0]!.messageType).toBe('discovery_shared');
      expect(messages[0]!.text).toContain('Alex');
    });

    it('deduplicates discoveries by id', () => {
      const profiles = [makeProfile('p1', 'Alex'), makeProfile('p2', 'Jordan')];
      const world = system.createSharedWorld(profiles);

      const discovery: Discovery = {
        id: 'disc-1',
        type: 'fragment',
        description: 'a star',
        biome: 'observatory',
        foundByProfileId: 'p1',
        foundByName: 'Alex',
        timestamp: new Date().toISOString(),
      };

      system.shareDiscovery(world.worldSeed, discovery);
      system.shareDiscovery(world.worldSeed, discovery);

      expect(system.getSharedDiscoveries(world.worldSeed).length).toBe(1);
    });

    it('throws for unknown world', () => {
      expect(() =>
        system.shareDiscovery('unknown', {
          id: 'disc-1',
          type: 'biome',
          description: 'test',
          biome: 'workshop',
          foundByProfileId: 'p1',
          foundByName: 'Alex',
          timestamp: new Date().toISOString(),
        }),
      ).toThrow('Shared world not found');
    });
  });

  // --- Teaching moments ---

  describe('suggestTeachingMoment', () => {
    it('creates a teaching moment between older and younger sibling', () => {
      const profiles = [
        makeProfile('young', 'Emma', 'foundation', 'guide'),
        makeProfile('old', 'Sam', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const moment = system.suggestTeachingMoment(
        world.worldSeed,
        'old',
        'young',
        'math.fractions',
      );

      expect(moment).not.toBeNull();
      expect(moment!.olderProfileId).toBe('old');
      expect(moment!.youngerProfileId).toBe('young');
      expect(moment!.skill).toBe('math.fractions');
      expect(moment!.companionPromptOlder.targetProfileId).toBe('old');
      expect(moment!.companionPromptYounger.targetProfileId).toBe('young');
    });

    it('generates age-appropriate companion messages', () => {
      const profiles = [
        makeProfile('young', 'Emma', 'foundation', 'guide'),
        makeProfile('old', 'Sam', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const moment = system.suggestTeachingMoment(
        world.worldSeed,
        'old',
        'young',
        'math.division',
      );

      // Older gets ally-style message
      expect(moment!.companionPromptOlder.text).toContain('Emma');
      // Younger gets guide-style message
      expect(moment!.companionPromptYounger.text).toContain('Sam');
    });

    it('returns null if older has same or lower tier', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'discovery', 'partner'),
      ];
      const world = system.createSharedWorld(profiles);

      const moment = system.suggestTeachingMoment(
        world.worldSeed,
        'p1',
        'p2',
        'math.addition',
      );

      expect(moment).toBeNull();
    });

    it('returns null for unknown world', () => {
      expect(
        system.suggestTeachingMoment('unknown', 'p1', 'p2', 'skill'),
      ).toBeNull();
    });

    it('returns null for unknown profiles', () => {
      const world = system.createSharedWorld([makeProfile('p1', 'Alex')]);
      expect(
        system.suggestTeachingMoment(world.worldSeed, 'p1', 'unknown', 'skill'),
      ).toBeNull();
    });

    it('queues companion messages for both siblings', () => {
      const profiles = [
        makeProfile('young', 'Emma', 'foundation', 'guide'),
        makeProfile('old', 'Sam', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      system.suggestTeachingMoment(world.worldSeed, 'old', 'young', 'math.fractions');
      const messages = system.drainMessages();
      expect(messages.length).toBe(2);
      expect(messages.some((m) => m.targetProfileId === 'old')).toBe(true);
      expect(messages.some((m) => m.targetProfileId === 'young')).toBe(true);
    });
  });

  // --- Collaboration ---

  describe('createCollaboration', () => {
    it('creates a collaboration task with roles based on tier', () => {
      const profiles = [
        makeProfile('young', 'Emma', 'foundation', 'guide'),
        makeProfile('old', 'Sam', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      const task = system.createCollaboration(
        world.worldSeed,
        ['young', 'old'],
        'bridge',
      );

      expect(task).not.toBeNull();
      expect(task!.participants.length).toBe(2);

      const emma = task!.participants.find((p) => p.profileId === 'young')!;
      const sam = task!.participants.find((p) => p.profileId === 'old')!;

      // Builder gets designer role, Foundation gets supplier role
      expect(sam.role).toBe('designer');
      expect(emma.role).toBe('supplier');
      expect(sam.difficulty).toBe('builder');
      expect(emma.difficulty).toBe('foundation');
    });

    it('returns null for unknown world', () => {
      expect(system.createCollaboration('unknown', ['p1'], 'bridge')).toBeNull();
    });

    it('returns null if a participant is not registered', () => {
      const world = system.createSharedWorld([makeProfile('p1', 'Alex')]);
      expect(system.createCollaboration(world.worldSeed, ['p1', 'unknown'], 'bridge')).toBeNull();
    });
  });

  // --- Safety rules ---

  describe('safety and privacy', () => {
    it('companion mediates all interaction — no direct communication', () => {
      const profiles = [
        makeProfile('p1', 'Alex', 'discovery', 'partner'),
        makeProfile('p2', 'Jordan', 'builder', 'ally'),
      ];
      const world = system.createSharedWorld(profiles);

      system.addSharedStructure(world.worldSeed, {
        id: 's1',
        biome: 'workshop',
        type: 'bridge',
        position: { x: 0, y: 0, z: 0 },
        builtByProfileId: 'p1',
        builtByName: 'Alex',
        createdAt: new Date().toISOString(),
      });

      const messages = system.drainMessages();
      // All messages go through companion (have targetProfileId and companion text)
      for (const msg of messages) {
        expect(msg.targetProfileId).toBeTruthy();
        expect(msg.text).toBeTruthy();
        expect(msg.spokenText).toBeTruthy();
        expect(msg.screenReaderText).toBeTruthy();
      }
    });

    it('no leaderboards, no ranking, no comparison data exposed', () => {
      // The system only exposes per-player views, not comparisons
      const profiles = [
        makeProfile('p1', 'Alex', 'foundation', 'guide'),
        makeProfile('p2', 'Jordan', 'creator', 'peer'),
      ];
      const world = system.createSharedWorld(profiles);

      const view1 = system.getPlayerView(world.worldSeed, 'p1')!;
      const view2 = system.getPlayerView(world.worldSeed, 'p2')!;

      // Views contain only the individual player's data, no comparison
      expect(view1.profileId).toBe('p1');
      expect(view2.profileId).toBe('p2');
      // No rank, no score, no comparison fields
      expect('rank' in view1).toBe(false);
      expect('score' in view1).toBe(false);
      expect('rank' in view2).toBe(false);
      expect('score' in view2).toBe(false);
    });

    it('only exposes first name — no PII beyond that', () => {
      const profiles = [makeProfile('p1', 'Alex')];
      const world = system.createSharedWorld(profiles);

      const view = system.getPlayerView(world.worldSeed, 'p1')!;
      // Only profileId and profileName — no email, no age, no birth date
      expect(view.profileName).toBe('Alex');
      expect('email' in view).toBe(false);
      expect('birthDate' in view).toBe(false);
      expect('age' in view).toBe(false);
    });
  });

  // --- System interface ---

  describe('System interface', () => {
    it('has the correct name and priority', () => {
      expect(system.name).toBe('sibling-play');
      expect(system.priority).toBe(46);
    });

    it('update does not throw', () => {
      const world = new World();
      expect(() => system.update(world, 0.016)).not.toThrow();
    });
  });

  // --- Cleanup ---

  describe('cleanup', () => {
    it('destroySharedWorld removes the world', () => {
      const profiles = [makeProfile('p1', 'Alex')];
      const world = system.createSharedWorld(profiles);
      expect(system.getSharedWorld(world.worldSeed)).toBeDefined();

      system.destroySharedWorld(world.worldSeed);
      expect(system.getSharedWorld(world.worldSeed)).toBeUndefined();
    });

    it('reset clears all state', () => {
      const profiles = [makeProfile('p1', 'Alex'), makeProfile('p2', 'Jordan')];
      const world = system.createSharedWorld(profiles);
      system.addSharedStructure(world.worldSeed, {
        id: 's1',
        biome: 'workshop',
        type: 'wall',
        position: { x: 0, y: 0, z: 0 },
        builtByProfileId: 'p1',
        builtByName: 'Alex',
        createdAt: new Date().toISOString(),
      });

      system.reset();
      expect(system.getSharedWorld(world.worldSeed)).toBeUndefined();
      expect(system.drainMessages()).toEqual([]);
      expect(system.getTeachingMoments()).toEqual([]);
      expect(system.getCollaborationTasks()).toEqual([]);
    });
  });
});
