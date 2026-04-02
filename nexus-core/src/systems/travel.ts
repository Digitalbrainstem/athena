// TravelSystem — Progression from walking to FTL
// Each transport method requires genuine knowledge to unlock and operate
// Knowledge IS the key to the universe — literally

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  TravelMethod, TravelCheck, TravelResult, TravelEvent,
  TravelMethodDefinition, VehicleRecipe, PlayerVehicle, BiomeRoute,
} from '../types/travel.js';
import type { MasteryTier } from '../types/components.js';
import {
  BIOME_ROUTES, VEHICLE_RECIPES,
  getTravelMethod, travelMethodsForTier, getRoute, vehicleRecipesForTier,
} from '../data/travel-methods.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIER_ORDER: Record<string, number> = {
  foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
};

// ---------------------------------------------------------------------------
// TravelSystem
// ---------------------------------------------------------------------------

export class TravelSystem implements System {
  readonly name = 'travel';
  readonly priority = 50;

  private playerVehicles: Map<string, PlayerVehicle[]> = new Map();
  private playerSkills: Map<string, Set<string>> = new Map();
  private playerTiers: Map<string, MasteryTier> = new Map();
  private playerBiomes: Map<string, string> = new Map();
  private playerFuel: Map<string, Map<string, number>> = new Map();

  // ── ECS lifecycle ────────────────────────────────────────────────────────

  update(_world: World, _dt: number): void {
    // Travel is event-driven, not tick-based
  }

  // ── Player State ────────────────────────────────────────────────────────

  /** Register a player's current state */
  setPlayerState(
    profileId: string,
    tier: MasteryTier,
    currentBiome: string,
    skills: string[],
  ): void {
    this.playerTiers.set(profileId, tier);
    this.playerBiomes.set(profileId, currentBiome);
    this.playerSkills.set(profileId, new Set(skills));
  }

  /** Add a vehicle to the player's collection */
  addVehicle(profileId: string, vehicle: PlayerVehicle): void {
    const vehicles = this.playerVehicles.get(profileId) ?? [];
    vehicles.push(vehicle);
    this.playerVehicles.set(profileId, vehicles);
  }

  /** Get player's vehicles */
  getPlayerVehicles(profileId: string): PlayerVehicle[] {
    return this.playerVehicles.get(profileId) ?? [];
  }

  /** Set fuel amount for a player */
  setFuel(profileId: string, fuelType: string, amount: number): void {
    let fuels = this.playerFuel.get(profileId);
    if (!fuels) {
      fuels = new Map();
      this.playerFuel.set(profileId, fuels);
    }
    fuels.set(fuelType, amount);
  }

  /** Get fuel amount */
  getFuel(profileId: string, fuelType: string): number {
    return this.playerFuel.get(profileId)?.get(fuelType) ?? 0;
  }

  // ── Travel Methods ──────────────────────────────────────────────────────

  /** Get travel methods available to the player based on their tier and skills */
  getAvailableMethods(profileId: string): TravelMethodDefinition[] {
    const tier = this.playerTiers.get(profileId) ?? 'foundation';
    const skills = this.playerSkills.get(profileId) ?? new Set<string>();
    const vehicles = this.playerVehicles.get(profileId) ?? [];

    const tierMethods = travelMethodsForTier(tier);

    return tierMethods.filter(method => {
      // Check skill requirements
      const hasSkills = method.requiredSkills.every(s => skills.has(s));
      if (!hasSkills) return false;

      // Check vehicle requirement
      if (method.requiresVehicle) {
        const hasVehicle = vehicles.some(v => v.method === method.id);
        if (!hasVehicle) return false;
      }

      return true;
    });
  }

  /** Check if a player can travel to a target biome */
  canTravel(profileId: string, targetBiome: string): TravelCheck {
    const currentBiome = this.playerBiomes.get(profileId);
    if (!currentBiome) {
      return { canTravel: false, reason: 'Player location unknown' };
    }

    if (currentBiome === targetBiome) {
      return { canTravel: false, reason: 'Already in this biome' };
    }

    // Find a route
    const route = findRoute(currentBiome, targetBiome);
    if (!route) {
      return { canTravel: false, reason: 'No known route to this destination' };
    }

    const tier = this.playerTiers.get(profileId) ?? 'foundation';
    const tierLevel = TIER_ORDER[tier] ?? 0;

    // Check tier requirement
    if ((TIER_ORDER[route.minTier] ?? 0) > tierLevel) {
      return {
        canTravel: false,
        reason: 'You need to learn more before you can find the way there',
        requiredMethod: route.requiredMethod,
        distance: route.distance,
      };
    }

    // Check travel method
    const methodDef = getTravelMethod(route.requiredMethod);
    if (!methodDef) {
      return { canTravel: false, reason: 'Unknown travel method required' };
    }

    // Check skills
    const skills = this.playerSkills.get(profileId) ?? new Set<string>();
    const missingSkills = methodDef.requiredSkills.filter(s => !skills.has(s));
    if (missingSkills.length > 0) {
      return {
        canTravel: false,
        reason: 'You need more knowledge for this journey',
        requiredMethod: route.requiredMethod,
        requiredSkills: missingSkills,
        distance: route.distance,
      };
    }

    // Check vehicle
    if (methodDef.requiresVehicle) {
      const vehicles = this.playerVehicles.get(profileId) ?? [];
      const vehicle = vehicles.find(v => v.method === route.requiredMethod);
      if (!vehicle) {
        return {
          canTravel: false,
          reason: `You need a ${methodDef.name} for this journey`,
          requiredMethod: route.requiredMethod,
          requiredVehicle: methodDef.name,
          distance: route.distance,
        };
      }

      // Check fuel
      if (methodDef.fuelType) {
        const fuelNeeded = route.distance * methodDef.fuelRate;
        const fuelAvailable = this.getFuel(profileId, methodDef.fuelType);
        if (fuelAvailable < fuelNeeded) {
          return {
            canTravel: false,
            reason: `Not enough ${methodDef.fuelType} for the journey`,
            requiredMethod: route.requiredMethod,
            fuelRequired: { type: methodDef.fuelType, amount: fuelNeeded },
            distance: route.distance,
          };
        }
      }
    }

    // Calculate travel time
    const travelTime = route.distance / methodDef.speed;

    // Can travel!
    const check: TravelCheck = {
      canTravel: true,
      requiredMethod: route.requiredMethod,
      distance: route.distance,
      estimatedTime: travelTime,
    };

    if (methodDef.fuelType) {
      check.fuelRequired = {
        type: methodDef.fuelType,
        amount: route.distance * methodDef.fuelRate,
      };
    }

    return check;
  }

  /** Execute travel from current biome to target biome */
  travel(profileId: string, targetBiome: string, method: string): TravelResult {
    const currentBiome = this.playerBiomes.get(profileId) ?? '';
    const check = this.canTravel(profileId, targetBiome);

    if (!check.canTravel) {
      return {
        success: false,
        method: method as TravelMethod,
        fromBiome: currentBiome,
        toBiome: targetBiome,
        distance: check.distance ?? 0,
        travelTime: 0,
        events: [],
        learningEvents: [],
      };
    }

    const route = findRoute(currentBiome, targetBiome);
    if (!route) {
      return {
        success: false,
        method: method as TravelMethod,
        fromBiome: currentBiome,
        toBiome: targetBiome,
        distance: 0,
        travelTime: 0,
        events: [],
        learningEvents: [],
      };
    }

    const methodDef = getTravelMethod(route.requiredMethod);
    if (!methodDef) {
      return {
        success: false,
        method: method as TravelMethod,
        fromBiome: currentBiome,
        toBiome: targetBiome,
        distance: route.distance,
        travelTime: 0,
        events: [],
        learningEvents: [],
      };
    }

    // Consume fuel
    let fuelConsumed: { type: string; amount: number } | undefined;
    if (methodDef.fuelType) {
      const amount = route.distance * methodDef.fuelRate;
      const currentFuel = this.getFuel(profileId, methodDef.fuelType);
      this.setFuel(profileId, methodDef.fuelType, currentFuel - amount);
      fuelConsumed = { type: methodDef.fuelType, amount };

      // Update vehicle fuel if applicable
      const vehicles = this.playerVehicles.get(profileId) ?? [];
      const vehicle = vehicles.find(v => v.method === route.requiredMethod);
      if (vehicle) {
        vehicle.currentFuel = Math.max(0, vehicle.currentFuel - amount);
      }
    }

    // Generate travel events from landmarks
    const events: TravelEvent[] = route.landmarks.map(landmark => ({
      type: 'landmark' as const,
      description: `Passed ${formatLandmark(landmark)}`,
      educational: `Navigation and observation during ${methodDef.name} travel`,
    }));

    // Move the player
    this.playerBiomes.set(profileId, targetBiome);

    const travelTime = route.distance / methodDef.speed;

    return {
      success: true,
      method: route.requiredMethod,
      fromBiome: currentBiome,
      toBiome: targetBiome,
      distance: route.distance,
      travelTime,
      fuelConsumed,
      events,
      learningEvents: [...methodDef.teaches],
    };
  }

  // ── Vehicle Crafting ────────────────────────────────────────────────────

  /** Get vehicle recipes available at a mastery tier */
  getVehicleRecipes(tier: MasteryTier): VehicleRecipe[] {
    return vehicleRecipesForTier(tier);
  }

  /** Check if player can build a specific vehicle */
  canBuildVehicle(profileId: string, recipeId: string): { canBuild: boolean; missingSkills: string[]; missingMaterials: string[] } {
    const recipe = VEHICLE_RECIPES.find(r => r.id === recipeId);
    if (!recipe) {
      return { canBuild: false, missingSkills: [], missingMaterials: [`Recipe ${recipeId} not found`] };
    }

    const tier = this.playerTiers.get(profileId) ?? 'foundation';
    if ((TIER_ORDER[recipe.tier] ?? 0) > (TIER_ORDER[tier] ?? 0)) {
      return { canBuild: false, missingSkills: ['tier-too-low'], missingMaterials: [] };
    }

    const skills = this.playerSkills.get(profileId) ?? new Set<string>();
    const missingSkills = recipe.buildSkills.filter(s => !skills.has(s));

    // Materials check would integrate with InventorySystem
    return {
      canBuild: missingSkills.length === 0,
      missingSkills,
      missingMaterials: [],
    };
  }

  /** Build a vehicle from a recipe */
  buildVehicle(profileId: string, recipeId: string, vehicleName: string): PlayerVehicle | null {
    const check = this.canBuildVehicle(profileId, recipeId);
    if (!check.canBuild) return null;

    const recipe = VEHICLE_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return null;

    const vehicle: PlayerVehicle = {
      id: `vehicle-${profileId}-${Date.now()}`,
      recipeId,
      name: vehicleName,
      method: recipe.method,
      currentFuel: 0,
      maxFuel: recipe.stats.fuelCapacity,
      durability: recipe.stats.durability,
      maxDurability: recipe.stats.durability,
    };

    this.addVehicle(profileId, vehicle);
    return vehicle;
  }

  /** Get the player's current biome */
  getPlayerBiome(profileId: string): string | undefined {
    return this.playerBiomes.get(profileId);
  }
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/** Find a route between two biomes (either direction) */
export function findRoute(from: string, to: string): BiomeRoute | undefined {
  return getRoute(from, to);
}

/** Get all reachable biomes from a given biome at a given tier */
export function reachableBiomes(
  fromBiome: string,
  tier: MasteryTier,
): BiomeRoute[] {
  const maxLevel = TIER_ORDER[tier] ?? 0;
  return BIOME_ROUTES.filter(
    r =>
      (r.from === fromBiome || r.to === fromBiome) &&
      (TIER_ORDER[r.minTier] ?? 0) <= maxLevel,
  );
}

/** Calculate fuel needed for a route */
export function fuelForRoute(route: BiomeRoute): { type: string; amount: number } | null {
  const method = getTravelMethod(route.requiredMethod);
  if (!method || !method.fuelType) return null;
  return {
    type: method.fuelType,
    amount: route.distance * method.fuelRate,
  };
}

/** Format a landmark ID into a readable name */
function formatLandmark(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
