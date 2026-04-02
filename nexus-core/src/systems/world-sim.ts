// WorldSimulation — Emergent systems: material interactions, weather, settlements, consequences
// The world is alive: actions ripple forward, materials interact, weather cascades
// No stubs — every system teaches real science

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  MaterialInteraction, WeatherState, WeatherType,
  SettlementState, Contribution, SettlementNpc, SettlementBuilding,
  SettlementProblem, WorldConsequence, SimWorldEvent,
  EcosystemState,
} from '../types/world-sim.js';
import type { MasteryTier } from '../types/components.js';
import {
  MATERIAL_INTERACTIONS, findInteraction, interactionsForTier,
} from '../data/material-interactions.js';
import {
  getWeatherEffect, nextWeather,
} from '../data/weather-effects.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIER_ORDER: Record<string, number> = {
  foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
};

// Settlement growth thresholds
const GROWTH_STAGES = [0, 10, 30, 60, 100, 200] as const;
const GROWTH_STAGE_NAMES = ['empty', 'camp', 'village', 'town', 'city', 'metropolis'] as const;

// Default NPC templates that appear as settlements grow
const NPC_TEMPLATES: readonly { role: string; name: string; appearsAt: number; quests: string[] }[] = [
  { role: 'merchant', name: 'Traveling Merchant', appearsAt: 10, quests: ['supply-run'] },
  { role: 'builder', name: 'Village Builder', appearsAt: 20, quests: ['construction'] },
  { role: 'healer', name: 'Village Healer', appearsAt: 30, quests: ['medicine-gathering'] },
  { role: 'teacher', name: 'Wandering Scholar', appearsAt: 40, quests: ['knowledge-quest'] },
  { role: 'engineer', name: 'Master Engineer', appearsAt: 60, quests: ['infrastructure'] },
  { role: 'diplomat', name: 'Trade Ambassador', appearsAt: 80, quests: ['trade-route'] },
  { role: 'scientist', name: 'Research Alchemist', appearsAt: 100, quests: ['experiment'] },
  { role: 'governor', name: 'City Governor', appearsAt: 150, quests: ['governance'] },
];

// ---------------------------------------------------------------------------
// WorldSimulation
// ---------------------------------------------------------------------------

export class WorldSimulation implements System {
  readonly name = 'world-sim';
  readonly priority = 60;

  private weather: Map<string, WeatherState> = new Map();
  private settlements: Map<string, SettlementState> = new Map();
  private consequences: Map<string, WorldConsequence[]> = new Map();
  private ecosystems: Map<string, EcosystemState> = new Map();
  private eventLog: SimWorldEvent[] = [];
  private gameTime = 0;
  private _eventIdCounter = 0;
  private _consequenceIdCounter = 0;
  private _rng: () => number = Math.random;

  /** Override RNG for deterministic testing */
  setRng(rng: () => number): void {
    this._rng = rng;
  }

  // ── ECS lifecycle ────────────────────────────────────────────────────────

  update(_world: World, dt: number): void {
    const events = this.simulate(dt);
    for (const event of events) {
      _world.emitEvent({ type: 'world_sim_event', data: { eventId: event.id, eventType: event.type, biome: event.biome } });
    }
  }

  // ── Core Simulation ─────────────────────────────────────────────────────

  /** Tick the world forward, returning events that occurred */
  simulate(dt: number): SimWorldEvent[] {
    this.gameTime += dt;
    const events: SimWorldEvent[] = [];

    // Update weather for all biomes
    for (const [biome, ws] of this.weather) {
      const weatherEvents = this.tickWeather(biome, ws, dt);
      events.push(...weatherEvents);
    }

    // Update settlements
    for (const [biome, settlement] of this.settlements) {
      const settlementEvents = this.tickSettlement(biome, settlement, dt);
      events.push(...settlementEvents);
    }

    // Update ecosystems
    for (const [biome, eco] of this.ecosystems) {
      const ecoEvents = this.tickEcosystem(biome, eco, dt);
      events.push(...ecoEvents);
    }

    // Check consequences
    const consequenceEvents = this.tickConsequences();
    events.push(...consequenceEvents);

    this.eventLog.push(...events);
    return events;
  }

  // ── Material Interactions ───────────────────────────────────────────────

  /** Get the result of two materials interacting */
  getMaterialInteraction(a: string, b: string): MaterialInteraction | null {
    return findInteraction(a, b) ?? null;
  }

  /** Get all material interactions available at a tier */
  getInteractionsForTier(tier: MasteryTier): MaterialInteraction[] {
    return interactionsForTier(tier);
  }

  /** Try to perform a material interaction, checking conditions */
  tryInteraction(
    materialA: string,
    materialB: string,
    conditions: string[],
    tier: MasteryTier,
  ): { success: boolean; interaction?: MaterialInteraction; reason?: string } {
    const interaction = findInteraction(materialA, materialB);
    if (!interaction) {
      return { success: false, reason: 'These materials do not interact' };
    }

    // Check tier
    if ((TIER_ORDER[interaction.minTier] ?? 0) > (TIER_ORDER[tier] ?? 0)) {
      return { success: false, reason: 'You need more knowledge to understand this interaction' };
    }

    // Check conditions
    const missingConditions = interaction.conditions.filter(
      c => !conditions.includes(c),
    );
    if (missingConditions.length > 0) {
      return {
        success: false,
        interaction,
        reason: `This interaction requires: ${missingConditions.join(', ')}`,
      };
    }

    // Check catalyst if needed
    if (interaction.catalyst && !conditions.includes(interaction.catalyst)) {
      return {
        success: false,
        interaction,
        reason: `This interaction needs a catalyst: ${interaction.catalyst}`,
      };
    }

    return { success: true, interaction };
  }

  // ── Weather ─────────────────────────────────────────────────────────────

  /** Initialize weather for a biome */
  initializeWeather(biome: string, initial: WeatherType = 'clear'): WeatherState {
    const effect = getWeatherEffect(initial);
    const state: WeatherState = {
      biome,
      current: initial,
      temperature: 20,
      humidity: 0.5,
      windSpeed: 5,
      changeIn: 120 + this._rng() * 180,
      activeEffects: effect ? [effect] : [],
    };
    this.updateWeatherMetrics(state);
    this.weather.set(biome, state);
    return state;
  }

  /** Get current weather effects for a biome */
  getWeatherEffects(biome: string): WeatherState | undefined {
    return this.weather.get(biome);
  }

  /** Force a weather change (for world events or testing) */
  setWeather(biome: string, weatherType: WeatherType): void {
    const state = this.weather.get(biome);
    if (!state) {
      this.initializeWeather(biome, weatherType);
      return;
    }

    state.current = weatherType;
    const effect = getWeatherEffect(weatherType);
    state.activeEffects = effect ? [effect] : [];
    state.changeIn = 120 + this._rng() * 180;
    this.updateWeatherMetrics(state);
  }

  // ── Settlements ─────────────────────────────────────────────────────────

  /** Initialize a settlement for a biome */
  initializeSettlement(biome: string, name: string): SettlementState {
    const existing = this.settlements.get(biome);
    if (existing) return existing;

    const settlement: SettlementState = {
      biome,
      name,
      population: 5,
      prosperity: 0,
      playerContributions: [],
      npcs: [],
      buildings: [],
      problems: [],
      growthStage: 0,
    };
    this.settlements.set(biome, settlement);
    return settlement;
  }

  /** Get settlement state for a biome */
  getSettlement(biome: string): SettlementState | undefined {
    return this.settlements.get(biome);
  }

  /** Player contributes to a settlement */
  addContribution(
    biome: string,
    contribution: Omit<Contribution, 'timestamp'>,
  ): SimWorldEvent[] {
    const settlement = this.settlements.get(biome);
    if (!settlement) return [];

    const events: SimWorldEvent[] = [];

    settlement.playerContributions.push({
      ...contribution,
      timestamp: new Date().toISOString(),
    });

    settlement.prosperity += contribution.prosperityBoost;
    settlement.population += Math.floor(contribution.prosperityBoost * 0.5);

    // Check for growth stage advancement
    const oldStage = settlement.growthStage;
    const newStage = computeGrowthStage(settlement.prosperity);
    if (newStage > oldStage) {
      settlement.growthStage = newStage;
      events.push(this.createEvent(
        'settlement_growth',
        biome,
        `${settlement.name} has grown into a ${GROWTH_STAGE_NAMES[newStage] ?? 'settlement'}!`,
        'Settlements grow when people contribute resources, knowledge, and labor. This is how real communities develop.',
      ));

      // Spawn new NPCs based on prosperity threshold
      const newNpcs = NPC_TEMPLATES.filter(
        t => t.appearsAt <= settlement.prosperity &&
             !settlement.npcs.some(n => n.role === t.role),
      );
      for (const template of newNpcs) {
        const npc: SettlementNpc = {
          id: `npc-${biome}-${template.role}`,
          name: template.name,
          role: template.role,
          quests: template.quests,
          appearsAt: template.appearsAt,
        };
        settlement.npcs.push(npc);
        events.push(this.createEvent(
          'npc_arrival',
          biome,
          `${template.name} has arrived in ${settlement.name}`,
          'Growing communities attract specialists. The more a settlement prospers, the more skilled people it attracts.',
        ));
      }
    }

    // Add events to the log so they are available via getEventsSince
    this.eventLog.push(...events);

    return events;
  }

  /** Add a building to a settlement */
  addBuilding(biome: string, building: SettlementBuilding): SimWorldEvent[] {
    const settlement = this.settlements.get(biome);
    if (!settlement) return [];

    settlement.buildings.push(building);
    const events: SimWorldEvent[] = [];

    if (building.playerBuilt) {
      events.push(...this.addContribution(biome, {
        type: 'build',
        description: `Built ${building.name}`,
        prosperityBoost: 5,
      }));
    }

    return events;
  }

  /** Report a problem in a settlement */
  addProblem(biome: string, problem: SettlementProblem): void {
    const settlement = this.settlements.get(biome);
    if (!settlement) return;
    settlement.problems.push(problem);
  }

  /** Resolve a settlement problem */
  resolveProblem(biome: string, problemId: string): SimWorldEvent[] {
    const settlement = this.settlements.get(biome);
    if (!settlement) return [];

    const idx = settlement.problems.findIndex(p => p.id === problemId);
    if (idx === -1) return [];

    const problem = settlement.problems[idx]!;
    settlement.problems.splice(idx, 1);

    return this.addContribution(biome, {
      type: 'quest',
      description: `Solved: ${problem.description}`,
      prosperityBoost: problem.severity * 3,
    });
  }

  // ── Consequences ────────────────────────────────────────────────────────

  /** Get all consequences for a profile */
  getConsequences(profileId: string): WorldConsequence[] {
    return this.consequences.get(profileId) ?? [];
  }

  /** Register a new consequence that will trigger later */
  addConsequence(consequence: Omit<WorldConsequence, 'id' | 'triggered'>): string {
    const id = `consequence-${++this._consequenceIdCounter}`;
    const full: WorldConsequence = {
      ...consequence,
      id,
      triggered: false,
    };

    const existing = this.consequences.get(consequence.profileId) ?? [];
    existing.push(full);
    this.consequences.set(consequence.profileId, existing);
    return id;
  }

  /** Create chained consequences (bridge built → trade route → merchants) */
  addConsequenceChain(
    profileId: string,
    biome: string,
    chain: { action: string; effect: string; delayFromPrevious: number; educational: string }[],
  ): string[] {
    const ids: string[] = [];
    let triggerTime = this.gameTime;

    for (let i = 0; i < chain.length; i++) {
      const link = chain[i]!;
      triggerTime += link.delayFromPrevious;

      const id = this.addConsequence({
        profileId,
        sourceAction: link.action,
        effect: link.effect,
        triggersAt: triggerTime,
        chainedConsequences: [],
        educational: link.educational,
        biome,
      });
      ids.push(id);

      // Link previous to this one
      if (i > 0) {
        const prevId = ids[i - 1]!;
        const prevList = this.consequences.get(profileId) ?? [];
        const prev = prevList.find(c => c.id === prevId);
        if (prev) {
          prev.chainedConsequences.push(id);
        }
      }
    }

    return ids;
  }

  // ── Ecosystem ───────────────────────────────────────────────────────────

  /** Initialize an ecosystem for a biome */
  initializeEcosystem(biome: string, populations: Record<string, number>): EcosystemState {
    const eco: EcosystemState = {
      biome,
      populations,
      environmentalHealth: 1.0,
      processes: [
        { type: 'growth', description: 'Natural vegetation growth', rate: 0.01, educational: 'Plants grow by photosynthesis, converting CO₂ and water into biomass using sunlight.' },
        { type: 'decay', description: 'Decomposition of organic matter', rate: 0.005, educational: 'Decomposers break down dead organisms, recycling nutrients back into the soil.' },
      ],
    };
    this.ecosystems.set(biome, eco);
    return eco;
  }

  /** Get ecosystem state */
  getEcosystem(biome: string): EcosystemState | undefined {
    return this.ecosystems.get(biome);
  }

  /** Apply a player action to an ecosystem */
  applyEcosystemAction(
    biome: string,
    action: 'plant' | 'harvest' | 'clear' | 'protect' | 'pollute' | 'restore',
    magnitude: number,
  ): SimWorldEvent[] {
    const eco = this.ecosystems.get(biome);
    if (!eco) return [];

    const events: SimWorldEvent[] = [];

    switch (action) {
      case 'plant':
        eco.populations['plants'] = (eco.populations['plants'] ?? 0) + magnitude;
        eco.environmentalHealth = Math.min(1, eco.environmentalHealth + magnitude * 0.01);
        events.push(this.createEvent('ecosystem_change', biome,
          'New plants are taking root and growing',
          'Planting increases biodiversity and improves soil quality through root systems that prevent erosion.'));
        break;

      case 'harvest':
        for (const species of Object.keys(eco.populations)) {
          if (eco.populations[species] !== undefined) {
            eco.populations[species] = Math.max(0, (eco.populations[species] ?? 0) - magnitude * 0.1);
          }
        }
        break;

      case 'clear':
        for (const species of Object.keys(eco.populations)) {
          if (eco.populations[species] !== undefined) {
            eco.populations[species] = Math.max(0, (eco.populations[species] ?? 0) - magnitude);
          }
        }
        eco.environmentalHealth = Math.max(0, eco.environmentalHealth - magnitude * 0.05);
        events.push(this.createEvent('ecosystem_change', biome,
          'Clearing has reduced the local habitat',
          'Deforestation reduces biodiversity, increases erosion, and removes CO₂ absorption capacity.'));
        break;

      case 'protect':
        eco.environmentalHealth = Math.min(1, eco.environmentalHealth + magnitude * 0.02);
        if (!eco.processes.some(p => p.type === 'symbiosis')) {
          eco.processes.push({
            type: 'symbiosis',
            description: 'Protected species are thriving together',
            rate: 0.02,
            educational: 'Conservation allows ecosystems to self-regulate. Biodiversity increases resilience.',
          });
        }
        events.push(this.createEvent('ecosystem_change', biome,
          'The protected area is flourishing',
          'Protected ecosystems recover through natural succession — pioneer species pave the way for complex communities.'));
        break;

      case 'pollute':
        eco.environmentalHealth = Math.max(0, eco.environmentalHealth - magnitude * 0.1);
        for (const species of Object.keys(eco.populations)) {
          if (eco.populations[species] !== undefined) {
            eco.populations[species] = Math.max(0, (eco.populations[species] ?? 0) * (1 - magnitude * 0.02));
          }
        }
        events.push(this.createEvent('ecosystem_change', biome,
          'Pollution is affecting the local ecosystem',
          'Pollution disrupts food chains, contaminates water, and reduces biodiversity. Effects cascade through the ecosystem.'));
        break;

      case 'restore':
        eco.environmentalHealth = Math.min(1, eco.environmentalHealth + magnitude * 0.05);
        events.push(this.createEvent('ecosystem_change', biome,
          'Restoration efforts are showing results',
          'Ecosystem restoration takes time but is possible. Wetland restoration, reforestation, and pollution cleanup can reverse damage.'));
        break;
    }

    return events;
  }

  // ── Queries ─────────────────────────────────────────────────────────────

  /** Get all events since a given time */
  getEventsSince(time: number): SimWorldEvent[] {
    return this.eventLog.filter(e => e.timestamp >= time);
  }

  /** Get the current game time */
  getGameTime(): number {
    return this.gameTime;
  }

  /** Get total material interaction count */
  getInteractionCount(): number {
    return MATERIAL_INTERACTIONS.length;
  }

  // ── Internal tick functions ─────────────────────────────────────────────

  private tickWeather(
    biome: string,
    state: WeatherState,
    dt: number,
  ): SimWorldEvent[] {
    const events: SimWorldEvent[] = [];

    state.changeIn -= dt;
    if (state.changeIn <= 0) {
      const oldWeather = state.current;
      // Pass a long elapsed time — the weather has been active for its full duration
      const newWeatherType = nextWeather(state.current, 600, this._rng);

      if (newWeatherType !== oldWeather) {
        state.current = newWeatherType;
        const effect = getWeatherEffect(newWeatherType);
        state.activeEffects = effect ? [effect] : [];
        this.updateWeatherMetrics(state);

        events.push(this.createEvent(
          'weather_change',
          biome,
          `Weather changed from ${oldWeather} to ${newWeatherType}`,
          effect?.educational ?? 'Weather patterns are driven by atmospheric pressure, temperature, and moisture.',
        ));

        // Apply weather effects to settlement
        if (effect) {
          this.applyWeatherToSettlement(biome, effect);
        }
      }

      state.changeIn = 120 + this._rng() * 180;
    }

    return events;
  }

  private tickSettlement(
    _biome: string,
    settlement: SettlementState,
    dt: number,
  ): SimWorldEvent[] {
    const events: SimWorldEvent[] = [];

    // Natural prosperity decay (settlements need ongoing support)
    settlement.prosperity = Math.max(0, settlement.prosperity - dt * 0.001);

    // Building decay
    for (const building of settlement.buildings) {
      building.condition = Math.max(0, building.condition - dt * 0.0005);
      if (building.condition < 0.3 && building.condition > 0) {
        // Generate a repair problem if none exists
        const problemId = `repair-${building.id}`;
        if (!settlement.problems.some(p => p.id === problemId)) {
          settlement.problems.push({
            id: problemId,
            type: 'damaged_structure',
            description: `${building.name} needs repair`,
            severity: 3,
            requiredSkills: ['engineering.basics'],
          });
        }
      }
    }

    return events;
  }

  private tickEcosystem(
    _biome: string,
    eco: EcosystemState,
    dt: number,
  ): SimWorldEvent[] {
    // Apply ecological processes
    for (const process of eco.processes) {
      switch (process.type) {
        case 'growth':
          for (const species of Object.keys(eco.populations)) {
            if (eco.populations[species] !== undefined) {
              eco.populations[species] = (eco.populations[species] ?? 0) *
                (1 + process.rate * dt * eco.environmentalHealth);
            }
          }
          break;

        case 'decay':
          eco.environmentalHealth = Math.min(
            1,
            eco.environmentalHealth + process.rate * dt * 0.1,
          );
          break;

        case 'erosion':
          eco.environmentalHealth = Math.max(
            0,
            eco.environmentalHealth - process.rate * dt,
          );
          break;

        default:
          break;
      }
    }

    return [];
  }

  private tickConsequences(): SimWorldEvent[] {
    const events: SimWorldEvent[] = [];

    for (const [_profileId, consequenceList] of this.consequences) {
      for (const consequence of consequenceList) {
        if (!consequence.triggered && this.gameTime >= consequence.triggersAt) {
          consequence.triggered = true;
          events.push(this.createEvent(
            'consequence_triggered',
            consequence.biome,
            consequence.effect,
            consequence.educational,
          ));
        }
      }
    }

    return events;
  }

  private applyWeatherToSettlement(
    biome: string,
    effect: import('../types/world-sim.js').WeatherEffect,
  ): void {
    const settlement = this.settlements.get(biome);
    if (!settlement) return;

    for (const worldEffect of effect.effects) {
      if (worldEffect.target === 'structures' && worldEffect.action === 'damage') {
        for (const building of settlement.buildings) {
          building.condition = Math.max(
            0,
            building.condition - worldEffect.magnitude * 10,
          );
        }
      }
    }
  }

  private updateWeatherMetrics(state: WeatherState): void {
    switch (state.current) {
      case 'clear': state.temperature = 22; state.humidity = 0.4; state.windSpeed = 5; break;
      case 'rain': state.temperature = 15; state.humidity = 0.8; state.windSpeed = 10; break;
      case 'heavy_rain': state.temperature = 13; state.humidity = 0.95; state.windSpeed = 20; break;
      case 'snow': state.temperature = -2; state.humidity = 0.7; state.windSpeed = 10; break;
      case 'blizzard': state.temperature = -15; state.humidity = 0.8; state.windSpeed = 60; break;
      case 'wind': state.temperature = 18; state.humidity = 0.3; state.windSpeed = 40; break;
      case 'storm': state.temperature = 12; state.humidity = 0.9; state.windSpeed = 50; break;
      case 'fog': state.temperature = 10; state.humidity = 1.0; state.windSpeed = 2; break;
      case 'heatwave': state.temperature = 38; state.humidity = 0.2; state.windSpeed = 3; break;
      case 'drought': state.temperature = 35; state.humidity = 0.1; state.windSpeed = 5; break;
    }
  }

  private createEvent(
    type: SimWorldEvent['type'],
    biome: string,
    description: string,
    educational: string,
  ): SimWorldEvent {
    return {
      id: `event-${++this._eventIdCounter}`,
      type,
      biome,
      description,
      educational,
      timestamp: this.gameTime,
    };
  }
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/** Compute settlement growth stage from prosperity */
export function computeGrowthStage(prosperity: number): number {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (prosperity >= (GROWTH_STAGES[i] ?? 0)) return i;
  }
  return 0;
}

/** Get growth stage name */
export function getGrowthStageName(stage: number): string {
  return GROWTH_STAGE_NAMES[stage] ?? 'unknown';
}
