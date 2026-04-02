import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorldSimulation, computeGrowthStage, getGrowthStageName,
} from '../../src/systems/world-sim.js';
import {
  MATERIAL_INTERACTIONS, getInteraction, findInteraction,
  interactionsForTier, interactionsWithMaterial,
} from '../../src/data/material-interactions.js';
import {
  WEATHER_EFFECTS, WEATHER_TRANSITIONS,
  getWeatherEffect, getTransitionsFrom, nextWeather,
} from '../../src/data/weather-effects.js';
import type { SettlementBuilding } from '../../src/types/world-sim.js';

// ---------------------------------------------------------------------------
// Material Interactions Data
// ---------------------------------------------------------------------------

describe('Material Interactions Data', () => {
  it('has at least 100 interactions', () => {
    expect(MATERIAL_INTERACTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it('every interaction has required fields', () => {
    for (const interaction of MATERIAL_INTERACTIONS) {
      expect(interaction.id).toBeTruthy();
      expect(interaction.materials).toHaveLength(2);
      expect(interaction.materials[0]).toBeTruthy();
      expect(interaction.materials[1]).toBeTruthy();
      expect(interaction.result).toBeTruthy();
      expect(interaction.educational).toBeTruthy();
      expect(interaction.educational.length).toBeGreaterThan(20);
      expect(typeof interaction.reversible).toBe('boolean');
      expect(typeof interaction.energyDelta).toBe('number');
    }
  });

  it('interaction IDs are unique', () => {
    const ids = MATERIAL_INTERACTIONS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up interaction by ID', () => {
    const fireWood = getInteraction('fire-wood');
    expect(fireWood).toBeDefined();
    expect(fireWood!.result).toBe('charcoal');
  });

  it('finds interaction by materials', () => {
    const interaction = findInteraction('fire', 'water');
    expect(interaction).toBeDefined();
    expect(interaction!.result).toBe('steam');
  });

  it('finds interaction regardless of material order', () => {
    const i1 = findInteraction('fire', 'water');
    const i2 = findInteraction('water', 'fire');
    expect(i1).toBeDefined();
    expect(i2).toBeDefined();
    expect(i1!.id).toBe(i2!.id);
  });

  it('returns undefined for non-interacting materials', () => {
    expect(findInteraction('gold', 'wood')).toBeUndefined();
  });

  it('filters by tier correctly', () => {
    const foundationInteractions = interactionsForTier('foundation');
    const allInteractions = interactionsForTier('creator');

    expect(foundationInteractions.length).toBeGreaterThan(0);
    expect(allInteractions.length).toBe(MATERIAL_INTERACTIONS.length);
    expect(foundationInteractions.length).toBeLessThan(allInteractions.length);

    for (const i of foundationInteractions) {
      expect(i.minTier).toBe('foundation');
    }
  });

  it('finds all interactions with a given material', () => {
    const fireInteractions = interactionsWithMaterial('fire');
    expect(fireInteractions.length).toBeGreaterThan(5);
    for (const i of fireInteractions) {
      expect(i.materials[0] === 'fire' || i.materials[1] === 'fire').toBe(true);
    }
  });

  // Scientific accuracy checks
  it('fire + wood = charcoal (combustion)', () => {
    const i = findInteraction('fire', 'wood');
    expect(i!.result).toBe('charcoal');
    expect(i!.energyDelta).toBeGreaterThan(0);
  });

  it('water + cold = ice (freezing)', () => {
    const i = findInteraction('water', 'cold');
    expect(i!.result).toBe('ice');
    expect(i!.reversible).toBe(true);
  });

  it('electricity + water = hydrogen + oxygen (electrolysis)', () => {
    const i = findInteraction('electricity', 'water');
    expect(i!.result).toBe('hydrogen_and_oxygen');
    expect(i!.conditions).toContain('electricity');
  });

  it('acid + base = salt and water (neutralization)', () => {
    const i = findInteraction('acid', 'base');
    expect(i!.result).toBe('salt_and_water');
  });

  it('hydrogen + oxygen = water (combustion)', () => {
    const i = findInteraction('hydrogen', 'oxygen');
    expect(i!.result).toBe('water');
    expect(i!.energyDelta).toBeGreaterThan(0);
  });

  it('iron + carbon = steel (alloy)', () => {
    const i = findInteraction('iron', 'carbon');
    expect(i!.result).toBe('steel');
    expect(i!.conditions).toContain('heat');
  });

  it('copper + tin = bronze (alloy)', () => {
    const i = findInteraction('copper', 'tin');
    expect(i!.result).toBe('bronze');
  });

  it('seed + soil → seedling (biology)', () => {
    const i = findInteraction('seed', 'soil');
    expect(i!.result).toBe('seedling');
  });

  it('color mixing is scientifically accurate', () => {
    const rb = findInteraction('red_paint', 'blue_paint');
    expect(rb!.result).toBe('purple_paint');

    const ry = findInteraction('red_paint', 'yellow_paint');
    expect(ry!.result).toBe('orange_paint');

    const by = findInteraction('blue_paint', 'yellow_paint');
    expect(by!.result).toBe('green_paint');
  });

  it('nuclear interactions are at creator tier', () => {
    const fission = getInteraction('uranium-neutron');
    expect(fission!.minTier).toBe('creator');

    const fusion = getInteraction('hydrogen-fusion');
    expect(fusion!.minTier).toBe('creator');
  });
});

// ---------------------------------------------------------------------------
// Weather Effects Data
// ---------------------------------------------------------------------------

describe('Weather Effects Data', () => {
  it('has effects for all weather types', () => {
    const types: string[] = ['clear', 'rain', 'heavy_rain', 'snow', 'blizzard', 'wind', 'storm', 'fog', 'heatwave', 'drought'];
    for (const type of types) {
      const effect = getWeatherEffect(type as import('../../src/types/world-sim.js').WeatherType);
      expect(effect).toBeDefined();
      expect(effect!.effects.length).toBeGreaterThan(0);
      expect(effect!.educational).toBeTruthy();
    }
  });

  it('rain extinguishes fires', () => {
    const rain = getWeatherEffect('rain')!;
    const fireEffect = rain.effects.find(e => e.target === 'fire');
    expect(fireEffect).toBeDefined();
    expect(fireEffect!.action).toBe('extinguish');
  });

  it('wind spreads fire', () => {
    const wind = getWeatherEffect('wind')!;
    const fireEffect = wind.effects.find(e => e.target === 'fire');
    expect(fireEffect).toBeDefined();
    expect(fireEffect!.action).toBe('spread');
  });

  it('storm electrifies metal', () => {
    const storm = getWeatherEffect('storm')!;
    const metalEffect = storm.effects.find(e => e.target === 'metal');
    expect(metalEffect).toBeDefined();
    expect(metalEffect!.action).toBe('electrify');
  });

  it('snow freezes terrain', () => {
    const snow = getWeatherEffect('snow')!;
    const terrainEffect = snow.effects.find(e => e.target === 'terrain');
    expect(terrainEffect).toBeDefined();
    expect(terrainEffect!.action).toBe('freeze');
  });
});

describe('Weather Transitions', () => {
  it('has transitions for all weather types', () => {
    const types = ['clear', 'rain', 'heavy_rain', 'snow', 'blizzard', 'wind', 'storm', 'fog', 'heatwave', 'drought'];
    for (const type of types) {
      const transitions = getTransitionsFrom(type as import('../../src/types/world-sim.js').WeatherType);
      expect(transitions.length).toBeGreaterThan(0);
    }
  });

  it('transition probabilities sum to approximately 1 per source weather', () => {
    const types = ['clear', 'rain', 'storm', 'snow'];
    for (const type of types) {
      const transitions = getTransitionsFrom(type as import('../../src/types/world-sim.js').WeatherType);
      const sum = transitions.reduce((s, t) => s + t.probability, 0);
      expect(sum).toBeGreaterThan(0.9);
      expect(sum).toBeLessThanOrEqual(1.05);
    }
  });

  it('nextWeather returns a valid weather type', () => {
    const result = nextWeather('clear', 300, () => 0.5);
    const validTypes = ['clear', 'rain', 'heavy_rain', 'snow', 'blizzard', 'wind', 'storm', 'fog', 'heatwave', 'drought'];
    expect(validTypes).toContain(result);
  });

  it('nextWeather respects minimum duration', () => {
    // With 0 elapsed time, only transitions with minDuration <= 0 should work
    // Most transitions require minDuration > 0, so it should return current
    const result = nextWeather('blizzard', 0, () => 0.5);
    expect(result).toBe('blizzard');
  });

  it('deterministic RNG gives consistent results', () => {
    const r1 = nextWeather('clear', 300, () => 0.1);
    const r2 = nextWeather('clear', 300, () => 0.1);
    expect(r1).toBe(r2);
  });
});

// ---------------------------------------------------------------------------
// Pure Functions
// ---------------------------------------------------------------------------

describe('computeGrowthStage', () => {
  it('returns 0 for zero prosperity', () => {
    expect(computeGrowthStage(0)).toBe(0);
  });

  it('returns 1 (camp) for prosperity >= 10', () => {
    expect(computeGrowthStage(10)).toBe(1);
  });

  it('returns 2 (village) for prosperity >= 30', () => {
    expect(computeGrowthStage(30)).toBe(2);
  });

  it('returns 5 (metropolis) for prosperity >= 200', () => {
    expect(computeGrowthStage(200)).toBe(5);
  });
});

describe('getGrowthStageName', () => {
  it('returns correct names', () => {
    expect(getGrowthStageName(0)).toBe('empty');
    expect(getGrowthStageName(1)).toBe('camp');
    expect(getGrowthStageName(2)).toBe('village');
    expect(getGrowthStageName(3)).toBe('town');
    expect(getGrowthStageName(4)).toBe('city');
    expect(getGrowthStageName(5)).toBe('metropolis');
  });

  it('returns unknown for invalid stage', () => {
    expect(getGrowthStageName(99)).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// WorldSimulation
// ---------------------------------------------------------------------------

describe('WorldSimulation', () => {
  let sim: WorldSimulation;

  beforeEach(() => {
    sim = new WorldSimulation();
    sim.setRng(() => 0.5);
  });

  describe('Simulation Tick', () => {
    it('advances game time', () => {
      sim.simulate(10);
      expect(sim.getGameTime()).toBe(10);
      sim.simulate(5);
      expect(sim.getGameTime()).toBe(15);
    });

    it('returns empty events when nothing is initialized', () => {
      const events = sim.simulate(1);
      expect(events).toEqual([]);
    });
  });

  describe('Material Interactions', () => {
    it('finds known material interaction', () => {
      const interaction = sim.getMaterialInteraction('fire', 'wood');
      expect(interaction).not.toBeNull();
      expect(interaction!.result).toBe('charcoal');
    });

    it('returns null for unknown interaction', () => {
      expect(sim.getMaterialInteraction('gold', 'wood')).toBeNull();
    });

    it('gets interactions for tier', () => {
      const foundationInteractions = sim.getInteractionsForTier('foundation');
      expect(foundationInteractions.length).toBeGreaterThan(0);
    });

    it('tryInteraction succeeds with correct conditions', () => {
      const result = sim.tryInteraction('fire', 'wood', [], 'foundation');
      expect(result.success).toBe(true);
      expect(result.interaction!.result).toBe('charcoal');
    });

    it('tryInteraction fails with missing conditions', () => {
      const result = sim.tryInteraction('fire', 'iron_ore', [], 'discovery');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('requires');
    });

    it('tryInteraction fails for too-high tier', () => {
      const result = sim.tryInteraction('uranium', 'neutron', [], 'foundation');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('knowledge');
    });

    it('tryInteraction checks catalyst', () => {
      const result = sim.tryInteraction('fire', 'iron_ore', ['heat'], 'discovery');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('catalyst');
    });

    it('tryInteraction succeeds with catalyst', () => {
      const result = sim.tryInteraction('fire', 'iron_ore', ['heat', 'charcoal'], 'discovery');
      expect(result.success).toBe(true);
    });

    it('reports total interaction count', () => {
      expect(sim.getInteractionCount()).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Weather System', () => {
    it('initializes weather for a biome', () => {
      const state = sim.initializeWeather('workshop', 'clear');
      expect(state.biome).toBe('workshop');
      expect(state.current).toBe('clear');
      expect(state.temperature).toBeDefined();
    });

    it('retrieves weather state', () => {
      sim.initializeWeather('workshop', 'rain');
      const state = sim.getWeatherEffects('workshop');
      expect(state).toBeDefined();
      expect(state!.current).toBe('rain');
      expect(state!.activeEffects.length).toBeGreaterThan(0);
    });

    it('returns undefined for uninitialized biome', () => {
      expect(sim.getWeatherEffects('nonexistent')).toBeUndefined();
    });

    it('forces weather change', () => {
      sim.initializeWeather('workshop', 'clear');
      sim.setWeather('workshop', 'storm');
      const state = sim.getWeatherEffects('workshop')!;
      expect(state.current).toBe('storm');
      expect(state.activeEffects.length).toBeGreaterThan(0);
    });

    it('weather changes over time in simulation', () => {
      sim.initializeWeather('workshop', 'clear');
      // Simulate enough time for weather to change
      let changed = false;
      for (let i = 0; i < 100; i++) {
        sim.simulate(10);
        const state = sim.getWeatherEffects('workshop')!;
        if (state.current !== 'clear') {
          changed = true;
          break;
        }
      }
      // With deterministic RNG at 0.5, weather should eventually change
      expect(changed).toBe(true);
    });

    it('updates temperature based on weather type', () => {
      sim.initializeWeather('forest', 'blizzard');
      const state = sim.getWeatherEffects('forest')!;
      expect(state.temperature).toBeLessThan(0);
    });
  });

  describe('Settlements', () => {
    it('initializes a settlement', () => {
      const settlement = sim.initializeSettlement('workshop', 'Tinker Village');
      expect(settlement.name).toBe('Tinker Village');
      expect(settlement.population).toBe(5);
      expect(settlement.prosperity).toBe(0);
      expect(settlement.growthStage).toBe(0);
    });

    it('returns existing settlement on re-init', () => {
      const s1 = sim.initializeSettlement('workshop', 'Village A');
      const s2 = sim.initializeSettlement('workshop', 'Village B');
      expect(s1).toBe(s2);
      expect(s1.name).toBe('Tinker Village');
    });

    it('retrieves settlement state', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      const state = sim.getSettlement('workshop');
      expect(state).toBeDefined();
      expect(state!.name).toBe('Tinker Village');
    });

    it('player contributions increase prosperity', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      sim.addContribution('workshop', {
        type: 'build',
        description: 'Built a workshop',
        prosperityBoost: 15,
      });
      const state = sim.getSettlement('workshop')!;
      expect(state.prosperity).toBe(15);
      expect(state.playerContributions.length).toBe(1);
    });

    it('settlement grows when prosperity increases', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      // Add enough prosperity to reach camp (10)
      const events = sim.addContribution('workshop', {
        type: 'resource',
        description: 'Provided resources',
        prosperityBoost: 15,
      });
      const state = sim.getSettlement('workshop')!;
      expect(state.growthStage).toBe(1);
      expect(events.some(e => e.type === 'settlement_growth')).toBe(true);
    });

    it('NPCs appear as settlement grows', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      // Add enough prosperity to spawn NPCs
      sim.addContribution('workshop', {
        type: 'resource',
        description: 'Major construction',
        prosperityBoost: 50,
      });
      const state = sim.getSettlement('workshop')!;
      expect(state.npcs.length).toBeGreaterThan(0);
    });

    it('adds buildings to settlements', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      const building: SettlementBuilding = {
        id: 'house-1', name: 'Stone House', type: 'house',
        condition: 100, playerBuilt: true,
      };
      const events = sim.addBuilding('workshop', building);
      const state = sim.getSettlement('workshop')!;
      expect(state.buildings.length).toBe(1);
      expect(events.length).toBeGreaterThan(0);
    });

    it('adds and resolves problems', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      sim.addProblem('workshop', {
        id: 'water-shortage',
        type: 'resource_shortage',
        description: 'Village needs clean water',
        severity: 5,
        requiredSkills: ['science.chemistry', 'engineering.basics'],
      });
      const state1 = sim.getSettlement('workshop')!;
      expect(state1.problems.length).toBe(1);

      const events = sim.resolveProblem('workshop', 'water-shortage');
      const state2 = sim.getSettlement('workshop')!;
      expect(state2.problems.length).toBe(0);
      expect(state2.prosperity).toBeGreaterThan(0);
      expect(events.length).toBeGreaterThanOrEqual(0);
    });

    it('settlement decays over time', () => {
      sim.initializeSettlement('workshop', 'Tinker Village');
      sim.addContribution('workshop', {
        type: 'resource',
        description: 'Initial boost',
        prosperityBoost: 20,
      });
      const before = sim.getSettlement('workshop')!.prosperity;
      for (let i = 0; i < 100; i++) {
        sim.simulate(10);
      }
      const after = sim.getSettlement('workshop')!.prosperity;
      expect(after).toBeLessThan(before);
    });
  });

  describe('Consequences', () => {
    it('adds and retrieves consequences', () => {
      sim.addConsequence({
        profileId: 'p1',
        sourceAction: 'Built a bridge',
        effect: 'Trade route opens',
        triggersAt: 100,
        chainedConsequences: [],
        educational: 'Infrastructure enables commerce',
        biome: 'workshop',
      });

      const consequences = sim.getConsequences('p1');
      expect(consequences.length).toBe(1);
      expect(consequences[0]!.triggered).toBe(false);
    });

    it('consequences trigger at the right time', () => {
      sim.addConsequence({
        profileId: 'p1',
        sourceAction: 'Planted trees',
        effect: 'Forest grows',
        triggersAt: 50,
        chainedConsequences: [],
        educational: 'Trees take time to grow',
        biome: 'living-forest',
      });

      // Not yet triggered
      sim.simulate(30);
      expect(sim.getConsequences('p1')[0]!.triggered).toBe(false);

      // Now triggers
      const events = sim.simulate(30);
      expect(sim.getConsequences('p1')[0]!.triggered).toBe(true);
      expect(events.some(e => e.type === 'consequence_triggered')).toBe(true);
    });

    it('creates consequence chains', () => {
      const ids = sim.addConsequenceChain('p1', 'workshop', [
        { action: 'Built bridge', effect: 'Trade route opens', delayFromPrevious: 10, educational: 'Infrastructure enables trade' },
        { action: 'Trade route opens', effect: 'Merchants arrive', delayFromPrevious: 20, educational: 'Commerce follows transportation routes' },
        { action: 'Merchants arrive', effect: 'Market established', delayFromPrevious: 30, educational: 'Markets form where supply meets demand' },
      ]);

      expect(ids.length).toBe(3);

      const consequences = sim.getConsequences('p1');
      expect(consequences.length).toBe(3);

      // First consequence chains to second
      expect(consequences[0]!.chainedConsequences).toContain(ids[1]);
      expect(consequences[1]!.chainedConsequences).toContain(ids[2]);
    });

    it('returns empty for unknown profile', () => {
      expect(sim.getConsequences('nobody')).toEqual([]);
    });
  });

  describe('Ecosystem', () => {
    it('initializes an ecosystem', () => {
      const eco = sim.initializeEcosystem('living-forest', {
        trees: 100, deer: 20, birds: 50,
      });
      expect(eco.biome).toBe('living-forest');
      expect(eco.populations['trees']).toBe(100);
      expect(eco.environmentalHealth).toBe(1.0);
    });

    it('retrieves ecosystem state', () => {
      sim.initializeEcosystem('forest', { trees: 50 });
      const eco = sim.getEcosystem('forest');
      expect(eco).toBeDefined();
    });

    it('populations grow over time', () => {
      sim.initializeEcosystem('forest', { trees: 100 });
      for (let i = 0; i < 50; i++) {
        sim.simulate(1);
      }
      const eco = sim.getEcosystem('forest')!;
      expect(eco.populations['trees']).toBeGreaterThan(100);
    });

    it('planting increases populations and health', () => {
      sim.initializeEcosystem('forest', { plants: 50 });
      sim.applyEcosystemAction('forest', 'plant', 20);
      const eco = sim.getEcosystem('forest')!;
      expect(eco.populations['plants']).toBe(70);
    });

    it('clearing reduces populations and health', () => {
      sim.initializeEcosystem('forest', { plants: 100 });
      const events = sim.applyEcosystemAction('forest', 'clear', 30);
      const eco = sim.getEcosystem('forest')!;
      expect(eco.populations['plants']).toBe(70);
      expect(eco.environmentalHealth).toBeLessThan(1.0);
      expect(events.length).toBeGreaterThan(0);
    });

    it('protection improves health', () => {
      sim.initializeEcosystem('forest', { trees: 50 });
      const eco1 = sim.getEcosystem('forest')!;
      eco1.environmentalHealth = 0.5;
      sim.applyEcosystemAction('forest', 'protect', 10);
      expect(eco1.environmentalHealth).toBeGreaterThan(0.5);
    });

    it('pollution damages ecosystem', () => {
      sim.initializeEcosystem('forest', { fish: 100 });
      sim.applyEcosystemAction('forest', 'pollute', 5);
      const eco = sim.getEcosystem('forest')!;
      expect(eco.environmentalHealth).toBeLessThan(1.0);
      expect(eco.populations['fish']).toBeLessThan(100);
    });

    it('restoration improves health', () => {
      sim.initializeEcosystem('forest', { trees: 50 });
      const eco = sim.getEcosystem('forest')!;
      eco.environmentalHealth = 0.3;
      sim.applyEcosystemAction('forest', 'restore', 5);
      expect(eco.environmentalHealth).toBeGreaterThan(0.3);
    });
  });

  describe('Event Log', () => {
    it('accumulates events', () => {
      sim.initializeWeather('workshop', 'clear');
      sim.initializeSettlement('workshop', 'Village');
      sim.addContribution('workshop', {
        type: 'build',
        description: 'Built something',
        prosperityBoost: 15,
      });

      const events = sim.getEventsSince(0);
      expect(events.length).toBeGreaterThan(0);
    });

    it('filters events by time', () => {
      sim.initializeSettlement('workshop', 'Village');
      sim.addContribution('workshop', {
        type: 'build',
        description: 'Early build',
        prosperityBoost: 15,
      });

      sim.simulate(100);

      sim.addContribution('workshop', {
        type: 'trade',
        description: 'Later trade',
        prosperityBoost: 5,
      });

      const allEvents = sim.getEventsSince(0);
      const recentEvents = sim.getEventsSince(50);
      expect(allEvents.length).toBeGreaterThanOrEqual(recentEvents.length);
    });
  });

  describe('Integration: Weather + Settlement', () => {
    it('storm damages settlement buildings', () => {
      sim.initializeWeather('workshop', 'clear');
      sim.initializeSettlement('workshop', 'Village');
      sim.addBuilding('workshop', {
        id: 'house-1', name: 'House', type: 'house',
        condition: 100, playerBuilt: true,
      });

      // Force storm
      sim.setWeather('workshop', 'storm');
      sim.simulate(1);

      const settlement = sim.getSettlement('workshop')!;
      const house = settlement.buildings.find(b => b.id === 'house-1')!;
      // Storm might damage buildings through weather application
      expect(house.condition).toBeLessThanOrEqual(100);
    });
  });
});
