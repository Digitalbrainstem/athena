// Travel system types — progression from walking to FTL
// Each transport method requires genuine knowledge to unlock and operate

import type { MasteryTier } from './components.js';

// ---------------------------------------------------------------------------
// Travel methods
// ---------------------------------------------------------------------------

export type TravelMethod =
  | 'walking'
  | 'horse'
  | 'cart'
  | 'sailing'
  | 'airship'
  | 'submarine'
  | 'train'
  | 'spacecraft'
  | 'ftl'
  | 'wormhole';

export interface TravelMethodDefinition {
  id: TravelMethod;
  name: string;
  description: string;
  /** Minimum mastery tier to unlock */
  minTier: MasteryTier;
  /** Skills required to use this method */
  requiredSkills: string[];
  /** Speed in km/h (game-world units) */
  speed: number;
  /** Does this method require a vehicle? */
  requiresVehicle: boolean;
  /** Fuel type needed (null = no fuel) */
  fuelType: string | null;
  /** Fuel consumption rate (units per km) */
  fuelRate: number;
  /** Which biome terrain types this method can traverse */
  traversableTerrains: TerrainType[];
  /** What this travel method teaches the player */
  teaches: string[];
}

export type TerrainType =
  | 'land'
  | 'water'
  | 'air'
  | 'underground'
  | 'space'
  | 'hyperspace';

// ---------------------------------------------------------------------------
// Travel checks and results
// ---------------------------------------------------------------------------

export interface TravelCheck {
  canTravel: boolean;
  requiredMethod?: TravelMethod;
  requiredSkills?: string[];
  requiredVehicle?: string;
  fuelRequired?: { type: string; amount: number };
  /** Why travel is blocked (human-readable, companion-friendly) */
  reason?: string;
  /** Distance in game-world km */
  distance?: number;
  /** Estimated travel time in game-world seconds */
  estimatedTime?: number;
}

export interface TravelResult {
  success: boolean;
  method: TravelMethod;
  fromBiome: string;
  toBiome: string;
  distance: number;
  travelTime: number;
  fuelConsumed?: { type: string; amount: number };
  /** Events that happened during travel */
  events: TravelEvent[];
  /** What the player learned during this journey */
  learningEvents: string[];
}

export interface TravelEvent {
  type: 'discovery' | 'encounter' | 'weather' | 'obstacle' | 'landmark';
  description: string;
  educational: string;
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

export interface VehicleRecipe {
  id: string;
  name: string;
  method: TravelMethod;
  tier: MasteryTier;
  /** Materials needed to build */
  materials: VehicleMaterial[];
  /** Skills needed to build (not just use) */
  buildSkills: string[];
  /** What building this vehicle teaches */
  teaches: string[];
  /** Vehicle stats once built */
  stats: VehicleStats;
}

export interface VehicleMaterial {
  itemId: string;
  quantity: number;
}

export interface VehicleStats {
  speed: number;
  fuelCapacity: number;
  cargoCapacity: number;
  durability: number;
  passengerCapacity: number;
}

export interface PlayerVehicle {
  id: string;
  recipeId: string;
  name: string;
  method: TravelMethod;
  currentFuel: number;
  maxFuel: number;
  durability: number;
  maxDurability: number;
}

// ---------------------------------------------------------------------------
// Route definitions between biomes
// ---------------------------------------------------------------------------

export interface BiomeRoute {
  from: string;
  to: string;
  distance: number;
  terrain: TerrainType;
  requiredMethod: TravelMethod;
  /** Minimum mastery tier for this route */
  minTier: MasteryTier;
  /** Points of interest along the way */
  landmarks: string[];
}
