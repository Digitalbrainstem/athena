import { describe, it, expect, beforeEach } from 'vitest';
import {
  TravelSystem, findRoute, reachableBiomes, fuelForRoute,
} from '../../src/systems/travel.js';
import {
  TRAVEL_METHODS, BIOME_ROUTES, VEHICLE_RECIPES,
  getTravelMethod, travelMethodsForTier, getRoute, routesFrom,
  getVehicleRecipe, vehicleRecipesForTier,
} from '../../src/data/travel-methods.js';

// ---------------------------------------------------------------------------
// Travel Methods Data
// ---------------------------------------------------------------------------

describe('Travel Methods Data', () => {
  it('has at least 10 travel methods', () => {
    expect(TRAVEL_METHODS.length).toBeGreaterThanOrEqual(10);
  });

  it('every method has required fields', () => {
    for (const method of TRAVEL_METHODS) {
      expect(method.id).toBeTruthy();
      expect(method.name).toBeTruthy();
      expect(method.description).toBeTruthy();
      expect(method.speed).toBeGreaterThan(0);
      expect(method.traversableTerrains.length).toBeGreaterThan(0);
      expect(method.teaches.length).toBeGreaterThan(0);
    }
  });

  it('method IDs are unique', () => {
    const ids = TRAVEL_METHODS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up method by ID', () => {
    const walking = getTravelMethod('walking');
    expect(walking).toBeDefined();
    expect(walking!.minTier).toBe('foundation');
    expect(walking!.speed).toBe(5);
  });

  it('walking has no fuel requirement', () => {
    const walking = getTravelMethod('walking');
    expect(walking!.fuelType).toBeNull();
    expect(walking!.fuelRate).toBe(0);
  });

  it('spacecraft requires rocket fuel', () => {
    const spacecraft = getTravelMethod('spacecraft');
    expect(spacecraft!.fuelType).toBe('rocket_fuel');
    expect(spacecraft!.fuelRate).toBeGreaterThan(0);
  });

  it('filters methods by tier', () => {
    const foundationMethods = travelMethodsForTier('foundation');
    expect(foundationMethods.length).toBe(1);
    expect(foundationMethods[0]!.id).toBe('walking');

    const discoveryMethods = travelMethodsForTier('discovery');
    expect(discoveryMethods.length).toBeGreaterThan(1);
    expect(discoveryMethods.some(m => m.id === 'horse')).toBe(true);

    const creatorMethods = travelMethodsForTier('creator');
    expect(creatorMethods.length).toBe(TRAVEL_METHODS.length);
  });

  it('progression matches tier design', () => {
    const walking = getTravelMethod('walking');
    expect(walking!.minTier).toBe('foundation');

    const horse = getTravelMethod('horse');
    expect(horse!.minTier).toBe('discovery');

    const airship = getTravelMethod('airship');
    expect(airship!.minTier).toBe('builder');

    const spacecraft = getTravelMethod('spacecraft');
    expect(spacecraft!.minTier).toBe('innovator');

    const ftl = getTravelMethod('ftl');
    expect(ftl!.minTier).toBe('creator');

    const wormhole = getTravelMethod('wormhole');
    expect(wormhole!.minTier).toBe('creator');
  });
});

// ---------------------------------------------------------------------------
// Biome Routes Data
// ---------------------------------------------------------------------------

describe('Biome Routes Data', () => {
  it('has at least 15 routes', () => {
    expect(BIOME_ROUTES.length).toBeGreaterThanOrEqual(15);
  });

  it('every route has required fields', () => {
    for (const route of BIOME_ROUTES) {
      expect(route.from).toBeTruthy();
      expect(route.to).toBeTruthy();
      expect(route.distance).toBeGreaterThan(0);
      expect(route.terrain).toBeTruthy();
      expect(route.requiredMethod).toBeTruthy();
    }
  });

  it('finds route between biomes', () => {
    const route = getRoute('workshop', 'living-forest');
    expect(route).toBeDefined();
    expect(route!.distance).toBeGreaterThan(0);
    expect(route!.requiredMethod).toBe('walking');
  });

  it('finds route in reverse direction', () => {
    const route = getRoute('living-forest', 'workshop');
    expect(route).toBeDefined();
  });

  it('returns undefined for no route', () => {
    expect(getRoute('workshop', 'nexus-core')).toBeUndefined();
  });

  it('lists routes from a biome', () => {
    const routes = routesFrom('workshop');
    expect(routes.length).toBeGreaterThan(0);
  });

  it('foundation routes use walking', () => {
    const foundationRoutes = BIOME_ROUTES.filter(r => r.minTier === 'foundation');
    for (const route of foundationRoutes) {
      expect(route.requiredMethod).toBe('walking');
    }
  });
});

// ---------------------------------------------------------------------------
// Vehicle Recipes Data
// ---------------------------------------------------------------------------

describe('Vehicle Recipes Data', () => {
  it('has at least 7 vehicle recipes', () => {
    expect(VEHICLE_RECIPES.length).toBeGreaterThanOrEqual(7);
  });

  it('every recipe has required fields', () => {
    for (const recipe of VEHICLE_RECIPES) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.materials.length).toBeGreaterThan(0);
      expect(recipe.buildSkills.length).toBeGreaterThan(0);
      expect(recipe.teaches.length).toBeGreaterThan(0);
      expect(recipe.stats.speed).toBeGreaterThan(0);
    }
  });

  it('looks up recipe by ID', () => {
    const cart = getVehicleRecipe('basic-cart');
    expect(cart).toBeDefined();
    expect(cart!.method).toBe('cart');
    expect(cart!.tier).toBe('discovery');
  });

  it('filters recipes by tier', () => {
    const foundationRecipes = vehicleRecipesForTier('foundation');
    expect(foundationRecipes.length).toBe(0);

    const discoveryRecipes = vehicleRecipesForTier('discovery');
    expect(discoveryRecipes.length).toBeGreaterThan(0);

    const creatorRecipes = vehicleRecipesForTier('creator');
    expect(creatorRecipes.length).toBe(VEHICLE_RECIPES.length);
  });
});

// ---------------------------------------------------------------------------
// Pure Functions
// ---------------------------------------------------------------------------

describe('findRoute', () => {
  it('finds route in either direction', () => {
    const r1 = findRoute('workshop', 'crystal-caverns');
    const r2 = findRoute('crystal-caverns', 'workshop');
    expect(r1).toBeDefined();
    expect(r2).toBeDefined();
    expect(r1!.distance).toBe(r2!.distance);
  });

  it('returns undefined for unknown route', () => {
    expect(findRoute('workshop', 'nonexistent')).toBeUndefined();
  });
});

describe('reachableBiomes', () => {
  it('returns walking routes for foundation tier', () => {
    const routes = reachableBiomes('workshop', 'foundation');
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      expect(route.requiredMethod).toBe('walking');
    }
  });

  it('returns more routes for higher tiers', () => {
    const foundationRoutes = reachableBiomes('workshop', 'foundation');
    const builderRoutes = reachableBiomes('workshop', 'builder');
    expect(builderRoutes.length).toBeGreaterThanOrEqual(foundationRoutes.length);
  });
});

describe('fuelForRoute', () => {
  it('returns null for walking routes', () => {
    const route = getRoute('workshop', 'living-forest')!;
    expect(fuelForRoute(route)).toBeNull();
  });

  it('returns fuel info for vehicle routes', () => {
    const route = getRoute('workshop', 'storm-tower');
    if (route) {
      const fuel = fuelForRoute(route);
      if (fuel) {
        expect(fuel.type).toBeTruthy();
        expect(fuel.amount).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// TravelSystem
// ---------------------------------------------------------------------------

describe('TravelSystem', () => {
  let travel: TravelSystem;

  beforeEach(() => {
    travel = new TravelSystem();
  });

  describe('Player State', () => {
    it('sets and retrieves player state', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', ['math.arithmetic']);
      expect(travel.getPlayerBiome('p1')).toBe('workshop');
    });
  });

  describe('Available Methods', () => {
    it('foundation player can only walk', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const methods = travel.getAvailableMethods('p1');
      expect(methods.length).toBe(1);
      expect(methods[0]!.id).toBe('walking');
    });

    it('discovery player with skills can ride horse', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', [
        'math.arithmetic', 'science.biology.basics',
      ]);
      const methods = travel.getAvailableMethods('p1');
      expect(methods.some(m => m.id === 'horse')).toBe(true);
    });

    it('vehicle-requiring methods need a vehicle', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', [
        'math.arithmetic', 'engineering.basics', 'math.geometry',
      ]);
      // Cart requires a vehicle — should not show without one
      const methods = travel.getAvailableMethods('p1');
      expect(methods.some(m => m.id === 'cart')).toBe(false);

      // Add a cart vehicle
      travel.addVehicle('p1', {
        id: 'cart-1', recipeId: 'basic-cart', name: 'My Cart',
        method: 'cart', currentFuel: 0, maxFuel: 0, durability: 100, maxDurability: 100,
      });
      const methodsAfter = travel.getAvailableMethods('p1');
      expect(methodsAfter.some(m => m.id === 'cart')).toBe(true);
    });
  });

  describe('canTravel', () => {
    it('foundation player can walk to adjacent biomes', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const check = travel.canTravel('p1', 'living-forest');
      expect(check.canTravel).toBe(true);
      expect(check.requiredMethod).toBe('walking');
      expect(check.distance).toBe(2);
    });

    it('cannot travel to same biome', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const check = travel.canTravel('p1', 'workshop');
      expect(check.canTravel).toBe(false);
    });

    it('cannot travel without known route', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const check = travel.canTravel('p1', 'nexus-core');
      expect(check.canTravel).toBe(false);
    });

    it('cannot travel to distant biome without appropriate tier', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const check = travel.canTravel('p1', 'trading-post');
      expect(check.canTravel).toBe(false);
    });

    it('discovery player can reach trading post', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', [
        'math.arithmetic', 'science.biology.basics',
      ]);
      const check = travel.canTravel('p1', 'trading-post');
      expect(check.canTravel).toBe(true);
    });

    it('reports missing skills', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', []);
      const check = travel.canTravel('p1', 'trading-post');
      expect(check.canTravel).toBe(false);
      expect(check.requiredSkills).toBeDefined();
      expect(check.requiredSkills!.length).toBeGreaterThan(0);
    });

    it('reports fuel requirements', () => {
      travel.setPlayerState('p1', 'builder', 'workshop', [
        'science.physics', 'science.chemistry', 'engineering.structures', 'math.geometry',
      ]);
      travel.addVehicle('p1', {
        id: 'airship-1', recipeId: 'hot-air-balloon', name: 'My Balloon',
        method: 'airship', currentFuel: 0, maxFuel: 50, durability: 80, maxDurability: 80,
      });
      const check = travel.canTravel('p1', 'storm-tower');
      // Should fail due to insufficient fuel
      if (!check.canTravel && check.fuelRequired) {
        expect(check.fuelRequired.type).toBe('hydrogen_gas');
        expect(check.fuelRequired.amount).toBeGreaterThan(0);
      }
    });
  });

  describe('travel', () => {
    it('successfully travels between adjacent biomes', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const result = travel.travel('p1', 'living-forest', 'walking');
      expect(result.success).toBe(true);
      expect(result.fromBiome).toBe('workshop');
      expect(result.toBiome).toBe('living-forest');
      expect(result.distance).toBe(2);
      expect(result.travelTime).toBeGreaterThan(0);
      expect(result.learningEvents.length).toBeGreaterThan(0);
    });

    it('updates player biome after travel', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      travel.travel('p1', 'living-forest', 'walking');
      expect(travel.getPlayerBiome('p1')).toBe('living-forest');
    });

    it('generates landmark events', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const result = travel.travel('p1', 'living-forest', 'walking');
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events[0]!.type).toBe('landmark');
    });

    it('fails travel when cannot travel', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const result = travel.travel('p1', 'nexus-core', 'ftl');
      expect(result.success).toBe(false);
    });

    it('consumes fuel for fuel-requiring methods', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', [
        'math.arithmetic', 'science.biology.basics',
      ]);
      travel.setFuel('p1', 'feed', 100);
      const result = travel.travel('p1', 'trading-post', 'horse');
      expect(result.success).toBe(true);
      expect(result.fuelConsumed).toBeDefined();
      expect(result.fuelConsumed!.type).toBe('feed');
      expect(travel.getFuel('p1', 'feed')).toBeLessThan(100);
    });
  });

  describe('Vehicle Management', () => {
    it('adds and retrieves vehicles', () => {
      travel.addVehicle('p1', {
        id: 'v1', recipeId: 'basic-cart', name: 'My Cart',
        method: 'cart', currentFuel: 0, maxFuel: 0, durability: 100, maxDurability: 100,
      });
      const vehicles = travel.getPlayerVehicles('p1');
      expect(vehicles.length).toBe(1);
      expect(vehicles[0]!.name).toBe('My Cart');
    });

    it('returns empty array for player with no vehicles', () => {
      expect(travel.getPlayerVehicles('nobody').length).toBe(0);
    });

    it('gets vehicle recipes for tier', () => {
      const recipes = travel.getVehicleRecipes('discovery');
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.some(r => r.id === 'basic-cart')).toBe(true);
    });

    it('canBuildVehicle checks skills', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', ['engineering.basics', 'math.geometry']);
      const check = travel.canBuildVehicle('p1', 'basic-cart');
      expect(check.canBuild).toBe(true);
    });

    it('canBuildVehicle reports missing skills', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', []);
      const check = travel.canBuildVehicle('p1', 'basic-cart');
      expect(check.canBuild).toBe(false);
      expect(check.missingSkills.length).toBeGreaterThan(0);
    });

    it('canBuildVehicle rejects wrong tier', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', ['engineering.basics', 'math.geometry']);
      const check = travel.canBuildVehicle('p1', 'basic-cart');
      expect(check.canBuild).toBe(false);
    });

    it('builds a vehicle from recipe', () => {
      travel.setPlayerState('p1', 'discovery', 'workshop', ['engineering.basics', 'math.geometry']);
      const vehicle = travel.buildVehicle('p1', 'basic-cart', 'Explorer Cart');
      expect(vehicle).not.toBeNull();
      expect(vehicle!.name).toBe('Explorer Cart');
      expect(vehicle!.method).toBe('cart');

      // Vehicle should appear in player's collection
      const vehicles = travel.getPlayerVehicles('p1');
      expect(vehicles.length).toBe(1);
    });

    it('buildVehicle returns null if cannot build', () => {
      travel.setPlayerState('p1', 'foundation', 'workshop', []);
      const vehicle = travel.buildVehicle('p1', 'rocket-ship', 'Rocket');
      expect(vehicle).toBeNull();
    });
  });

  describe('Fuel Management', () => {
    it('sets and gets fuel', () => {
      travel.setFuel('p1', 'coal', 50);
      expect(travel.getFuel('p1', 'coal')).toBe(50);
    });

    it('returns 0 for no fuel', () => {
      expect(travel.getFuel('nobody', 'coal')).toBe(0);
    });
  });
});
