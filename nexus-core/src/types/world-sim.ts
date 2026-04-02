// World simulation types — emergent systems, weather, settlements, consequences
// The world is alive: actions ripple forward, materials interact, weather cascades

import type { MasteryTier } from './components.js';

// ---------------------------------------------------------------------------
// Material interactions
// ---------------------------------------------------------------------------

export interface MaterialInteraction {
  id: string;
  materials: [string, string];
  result: string;
  /** Required conditions for this interaction to occur */
  conditions: InteractionCondition[];
  /** Optional catalyst that speeds up or enables the reaction */
  catalyst?: string;
  /** What real science this teaches */
  educational: string;
  /** Minimum tier to encounter this interaction */
  minTier: MasteryTier;
  /** Reversible? (e.g., water ↔ ice) */
  reversible: boolean;
  /** Energy released or absorbed (positive = exothermic) */
  energyDelta: number;
}

export type InteractionCondition =
  | 'heat'
  | 'cold'
  | 'pressure'
  | 'catalyst'
  | 'electricity'
  | 'light'
  | 'vacuum'
  | 'water'
  | 'air';

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export type WeatherType =
  | 'clear'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'blizzard'
  | 'wind'
  | 'storm'
  | 'fog'
  | 'heatwave'
  | 'drought';

export interface WeatherState {
  biome: string;
  current: WeatherType;
  temperature: number;
  humidity: number;
  windSpeed: number;
  /** Time until weather changes (seconds) */
  changeIn: number;
  /** Active weather effects in this biome */
  activeEffects: WeatherEffect[];
}

export interface WeatherEffect {
  type: WeatherType;
  /** What the weather does to the world */
  effects: WorldEffect[];
  /** What this teaches about meteorology/physics */
  educational: string;
}

export interface WorldEffect {
  target: 'fire' | 'water' | 'plants' | 'structures' | 'terrain' |
          'visibility' | 'movement' | 'metal' | 'electronics' | 'creatures';
  action: 'damage' | 'boost' | 'extinguish' | 'create' | 'spread' |
          'slow' | 'block' | 'grow' | 'erode' | 'freeze' | 'melt' | 'electrify';
  magnitude: number;
  /** Additional detail about the effect */
  description: string;
}

// ---------------------------------------------------------------------------
// Settlements
// ---------------------------------------------------------------------------

export interface SettlementState {
  biome: string;
  name: string;
  population: number;
  prosperity: number;
  /** What the player has built/contributed */
  playerContributions: Contribution[];
  /** NPCs that have appeared due to growth */
  npcs: SettlementNpc[];
  /** Buildings constructed */
  buildings: SettlementBuilding[];
  /** Active problems the settlement faces */
  problems: SettlementProblem[];
  /** Growth stage (0=empty, 1=camp, 2=village, 3=town, 4=city, 5=metropolis) */
  growthStage: number;
}

export interface Contribution {
  type: 'build' | 'trade' | 'quest' | 'resource' | 'knowledge';
  description: string;
  prosperityBoost: number;
  timestamp: string;
}

export interface SettlementNpc {
  id: string;
  name: string;
  role: string;
  /** What problems this NPC can help with or create */
  quests: string[];
  /** Appears at this prosperity threshold */
  appearsAt: number;
}

export interface SettlementBuilding {
  id: string;
  name: string;
  type: 'house' | 'shop' | 'workshop' | 'school' | 'market' |
        'harbor' | 'farm' | 'wall' | 'bridge' | 'tower';
  condition: number;
  /** Player contributed to building this? */
  playerBuilt: boolean;
}

export interface SettlementProblem {
  id: string;
  type: 'resource_shortage' | 'damaged_structure' | 'disease' |
        'environmental' | 'trade_dispute' | 'expansion';
  description: string;
  severity: number;
  /** Skills needed to solve this problem */
  requiredSkills: string[];
}

// ---------------------------------------------------------------------------
// Consequences — actions ripple forward through time
// ---------------------------------------------------------------------------

export interface WorldConsequence {
  id: string;
  profileId: string;
  /** What the player did */
  sourceAction: string;
  /** What happened as a result */
  effect: string;
  /** When this consequence triggers (game time) */
  triggersAt: number;
  /** Has it been triggered yet? */
  triggered: boolean;
  /** Chain: what this consequence leads to next */
  chainedConsequences: string[];
  /** How this connects to learning */
  educational: string;
  /** The biome affected */
  biome: string;
}

// ---------------------------------------------------------------------------
// World events
// ---------------------------------------------------------------------------

export interface SimWorldEvent {
  id: string;
  type: 'weather_change' | 'settlement_growth' | 'resource_discovery' |
        'npc_arrival' | 'structure_damage' | 'ecosystem_change' |
        'trade_route_open' | 'consequence_triggered' | 'material_interaction';
  biome: string;
  description: string;
  educational: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Ecosystem
// ---------------------------------------------------------------------------

export interface EcosystemState {
  biome: string;
  /** Species populations (name → count) */
  populations: Record<string, number>;
  /** Soil/water quality (0-1) */
  environmentalHealth: number;
  /** Active ecological processes */
  processes: EcologicalProcess[];
}

export interface EcologicalProcess {
  type: 'growth' | 'decay' | 'migration' | 'erosion' |
        'pollination' | 'predation' | 'symbiosis';
  description: string;
  rate: number;
  educational: string;
}
