// Travel method definitions and biome routes
// Progression: walking → horse/cart → sailing/airship → spacecraft → FTL/wormhole
// Each method requires genuine knowledge to unlock and operate

import type { TravelMethodDefinition, BiomeRoute, VehicleRecipe } from '../types/travel.js';

// ---------------------------------------------------------------------------
// Travel method definitions
// ---------------------------------------------------------------------------

export const TRAVEL_METHODS: readonly TravelMethodDefinition[] = [
  {
    id: 'walking',
    name: 'Walking',
    description: 'On foot — the most basic form of travel.',
    minTier: 'foundation',
    requiredSkills: [],
    speed: 5,
    requiresVehicle: false,
    fuelType: null,
    fuelRate: 0,
    traversableTerrains: ['land'],
    teaches: ['spatial-reasoning', 'direction', 'distance', 'counting'],
  },
  {
    id: 'horse',
    name: 'Horse',
    description: 'Riding a horse through the countryside.',
    minTier: 'discovery',
    requiredSkills: ['math.arithmetic', 'science.biology.basics'],
    speed: 30,
    requiresVehicle: false,
    fuelType: 'feed',
    fuelRate: 0.1,
    traversableTerrains: ['land'],
    teaches: ['speed-distance-time', 'biology.animals', 'resource-planning'],
  },
  {
    id: 'cart',
    name: 'Cart',
    description: 'A wheeled cart for carrying goods and passengers.',
    minTier: 'discovery',
    requiredSkills: ['math.arithmetic', 'engineering.basics', 'math.geometry'],
    speed: 15,
    requiresVehicle: true,
    fuelType: null,
    fuelRate: 0,
    traversableTerrains: ['land'],
    teaches: ['simple-machines', 'load-capacity', 'wheel-axle-mechanics'],
  },
  {
    id: 'sailing',
    name: 'Sailing Ship',
    description: 'A wind-powered vessel for ocean travel.',
    minTier: 'builder',
    requiredSkills: ['science.physics', 'math.geometry', 'geography.navigation'],
    speed: 25,
    requiresVehicle: true,
    fuelType: null,
    fuelRate: 0,
    traversableTerrains: ['water'],
    teaches: ['fluid-dynamics', 'navigation', 'wind-patterns', 'trigonometry'],
  },
  {
    id: 'airship',
    name: 'Airship',
    description: 'A lighter-than-air craft for aerial travel.',
    minTier: 'builder',
    requiredSkills: ['science.physics', 'science.chemistry', 'engineering.structures', 'math.geometry'],
    speed: 80,
    requiresVehicle: true,
    fuelType: 'hydrogen_gas',
    fuelRate: 0.5,
    traversableTerrains: ['air'],
    teaches: ['buoyancy', 'gas-laws', 'atmospheric-pressure', 'aerodynamics'],
  },
  {
    id: 'submarine',
    name: 'Submarine',
    description: 'An underwater vessel for deep-sea exploration.',
    minTier: 'builder',
    requiredSkills: ['science.physics', 'science.chemistry', 'engineering.structures'],
    speed: 35,
    requiresVehicle: true,
    fuelType: 'battery_charge',
    fuelRate: 0.8,
    traversableTerrains: ['water', 'underground'],
    teaches: ['pressure', 'buoyancy-control', 'sonar', 'marine-biology'],
  },
  {
    id: 'train',
    name: 'Train',
    description: 'A steam or electric rail vehicle.',
    minTier: 'builder',
    requiredSkills: ['engineering.structures', 'science.physics', 'math.arithmetic'],
    speed: 100,
    requiresVehicle: true,
    fuelType: 'coal',
    fuelRate: 0.3,
    traversableTerrains: ['land'],
    teaches: ['thermodynamics', 'friction', 'steam-engines', 'rail-engineering'],
  },
  {
    id: 'spacecraft',
    name: 'Spacecraft',
    description: 'A rocket-powered vessel for orbital and interplanetary travel.',
    minTier: 'innovator',
    requiredSkills: [
      'science.physics.mechanics', 'science.physics.thermodynamics',
      'science.chemistry', 'math.calculus', 'engineering.structures',
    ],
    speed: 28000,
    requiresVehicle: true,
    fuelType: 'rocket_fuel',
    fuelRate: 5.0,
    traversableTerrains: ['air', 'space'],
    teaches: ['orbital-mechanics', 'rocket-equation', 'delta-v', 'life-support'],
  },
  {
    id: 'ftl',
    name: 'FTL Drive',
    description: 'Faster-than-light travel between star systems.',
    minTier: 'creator',
    requiredSkills: [
      'science.physics.relativity', 'science.physics.quantum',
      'math.calculus', 'math.differential-equations',
    ],
    speed: 300000000,
    requiresVehicle: true,
    fuelType: 'exotic_matter',
    fuelRate: 10.0,
    traversableTerrains: ['hyperspace'],
    teaches: ['special-relativity', 'general-relativity', 'spacetime-geometry'],
  },
  {
    id: 'wormhole',
    name: 'Wormhole',
    description: 'Traversable wormhole connecting distant regions of spacetime.',
    minTier: 'creator',
    requiredSkills: [
      'science.physics.relativity', 'science.physics.quantum',
      'math.topology', 'math.differential-equations',
    ],
    speed: Infinity,
    requiresVehicle: true,
    fuelType: 'exotic_matter',
    fuelRate: 50.0,
    traversableTerrains: ['hyperspace'],
    teaches: ['general-relativity', 'topology', 'exotic-matter', 'spacetime-curvature'],
  },
] as const;

// ---------------------------------------------------------------------------
// Biome route network
// ---------------------------------------------------------------------------

export const BIOME_ROUTES: readonly BiomeRoute[] = [
  // Foundation tier — local walking routes
  { from: 'workshop', to: 'living-forest', distance: 2, terrain: 'land', requiredMethod: 'walking', minTier: 'foundation', landmarks: ['stone-bridge', 'flower-garden'] },
  { from: 'workshop', to: 'crystal-caverns', distance: 3, terrain: 'land', requiredMethod: 'walking', minTier: 'foundation', landmarks: ['old-well', 'cave-entrance'] },
  { from: 'workshop', to: 'alchemist-lab', distance: 2, terrain: 'land', requiredMethod: 'walking', minTier: 'foundation', landmarks: ['herb-garden'] },
  { from: 'living-forest', to: 'library-echoes', distance: 4, terrain: 'land', requiredMethod: 'walking', minTier: 'foundation', landmarks: ['ancient-oak', 'reading-clearing'] },

  // Discovery tier — regional riding/cart routes
  { from: 'workshop', to: 'trading-post', distance: 15, terrain: 'land', requiredMethod: 'horse', minTier: 'discovery', landmarks: ['crossroads', 'merchant-camp'] },
  { from: 'workshop', to: 'architects-domain', distance: 12, terrain: 'land', requiredMethod: 'cart', minTier: 'discovery', landmarks: ['quarry', 'blueprint-post'] },
  { from: 'living-forest', to: 'healers-sanctuary', distance: 10, terrain: 'land', requiredMethod: 'horse', minTier: 'discovery', landmarks: ['medicinal-meadow'] },
  { from: 'trading-post', to: 'ancient-ruins', distance: 20, terrain: 'land', requiredMethod: 'horse', minTier: 'discovery', landmarks: ['desert-oasis', 'crumbling-gate'] },
  { from: 'trading-post', to: 'arena', distance: 8, terrain: 'land', requiredMethod: 'horse', minTier: 'discovery', landmarks: ['colosseum-approach'] },
  { from: 'crystal-caverns', to: 'music-hall', distance: 10, terrain: 'land', requiredMethod: 'cart', minTier: 'discovery', landmarks: ['echo-canyon'] },
  { from: 'library-echoes', to: 'gallery', distance: 8, terrain: 'land', requiredMethod: 'horse', minTier: 'discovery', landmarks: ['art-trail'] },
  { from: 'workshop', to: 'code-forge', distance: 10, terrain: 'land', requiredMethod: 'cart', minTier: 'discovery', landmarks: ['gear-road'] },

  // Builder tier — sailing/airship/submarine/train routes
  { from: 'trading-post', to: 'shipyard', distance: 50, terrain: 'water', requiredMethod: 'sailing', minTier: 'builder', landmarks: ['coral-reef', 'lighthouse'] },
  { from: 'shipyard', to: 'explorers-map', distance: 80, terrain: 'water', requiredMethod: 'sailing', minTier: 'builder', landmarks: ['uncharted-island', 'whale-pod'] },
  { from: 'workshop', to: 'storm-tower', distance: 60, terrain: 'air', requiredMethod: 'airship', minTier: 'builder', landmarks: ['cloud-layer', 'wind-corridor'] },
  { from: 'storm-tower', to: 'observatory', distance: 40, terrain: 'air', requiredMethod: 'airship', minTier: 'builder', landmarks: ['mountain-peak'] },
  { from: 'crystal-caverns', to: 'time-rift', distance: 30, terrain: 'underground', requiredMethod: 'submarine', minTier: 'builder', landmarks: ['underground-lake', 'temporal-anomaly'] },
  { from: 'workshop', to: 'trading-post', distance: 25, terrain: 'land', requiredMethod: 'train', minTier: 'builder', landmarks: ['rail-bridge', 'tunnel'] },

  // Innovator tier — spacecraft routes
  { from: 'observatory', to: 'lunar-base', distance: 384400, terrain: 'space', requiredMethod: 'spacecraft', minTier: 'innovator', landmarks: ['low-earth-orbit', 'van-allen-belts'] },

  // Creator tier — FTL/wormhole routes
  { from: 'lunar-base', to: 'nexus-core', distance: 4.2e13, terrain: 'hyperspace', requiredMethod: 'ftl', minTier: 'creator', landmarks: ['oort-cloud', 'alpha-centauri-system'] },
] as const;

// ---------------------------------------------------------------------------
// Vehicle recipes
// ---------------------------------------------------------------------------

export const VEHICLE_RECIPES: readonly VehicleRecipe[] = [
  {
    id: 'basic-cart',
    name: 'Basic Cart',
    method: 'cart',
    tier: 'discovery',
    materials: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'iron_nails', quantity: 10 },
      { itemId: 'rope', quantity: 5 },
    ],
    buildSkills: ['engineering.basics', 'math.geometry'],
    teaches: ['wheel-axle-mechanics', 'load-distribution', 'simple-machines'],
    stats: { speed: 15, fuelCapacity: 0, cargoCapacity: 200, durability: 100, passengerCapacity: 2 },
  },
  {
    id: 'sailing-boat',
    name: 'Sailing Boat',
    method: 'sailing',
    tier: 'builder',
    materials: [
      { itemId: 'wood', quantity: 50 },
      { itemId: 'cloth', quantity: 20 },
      { itemId: 'rope', quantity: 15 },
      { itemId: 'iron', quantity: 10 },
      { itemId: 'pitch', quantity: 5 },
    ],
    buildSkills: ['engineering.structures', 'science.physics', 'math.geometry'],
    teaches: ['buoyancy', 'sail-physics', 'hull-design', 'navigation'],
    stats: { speed: 25, fuelCapacity: 0, cargoCapacity: 500, durability: 150, passengerCapacity: 4 },
  },
  {
    id: 'hot-air-balloon',
    name: 'Hot Air Balloon',
    method: 'airship',
    tier: 'builder',
    materials: [
      { itemId: 'cloth', quantity: 40 },
      { itemId: 'rope', quantity: 20 },
      { itemId: 'wood', quantity: 10 },
      { itemId: 'iron', quantity: 5 },
    ],
    buildSkills: ['science.physics', 'science.chemistry', 'engineering.basics'],
    teaches: ['gas-laws', 'buoyancy', 'atmospheric-pressure', 'heat-transfer'],
    stats: { speed: 30, fuelCapacity: 50, cargoCapacity: 100, durability: 80, passengerCapacity: 2 },
  },
  {
    id: 'diving-bell',
    name: 'Diving Bell',
    method: 'submarine',
    tier: 'builder',
    materials: [
      { itemId: 'iron', quantity: 30 },
      { itemId: 'glass', quantity: 10 },
      { itemId: 'rubber', quantity: 15 },
      { itemId: 'copper', quantity: 5 },
    ],
    buildSkills: ['engineering.structures', 'science.physics', 'science.chemistry'],
    teaches: ['pressure', 'buoyancy-control', 'sealed-environments'],
    stats: { speed: 10, fuelCapacity: 20, cargoCapacity: 50, durability: 200, passengerCapacity: 1 },
  },
  {
    id: 'steam-locomotive',
    name: 'Steam Locomotive',
    method: 'train',
    tier: 'builder',
    materials: [
      { itemId: 'steel', quantity: 100 },
      { itemId: 'copper', quantity: 20 },
      { itemId: 'iron', quantity: 50 },
      { itemId: 'rubber', quantity: 10 },
      { itemId: 'glass', quantity: 5 },
    ],
    buildSkills: ['engineering.structures', 'science.physics.thermodynamics', 'science.chemistry'],
    teaches: ['steam-power', 'thermodynamics', 'pressure-vessels', 'rail-engineering'],
    stats: { speed: 100, fuelCapacity: 200, cargoCapacity: 2000, durability: 300, passengerCapacity: 20 },
  },
  {
    id: 'rocket-ship',
    name: 'Rocket Ship',
    method: 'spacecraft',
    tier: 'innovator',
    materials: [
      { itemId: 'steel', quantity: 200 },
      { itemId: 'aluminum', quantity: 150 },
      { itemId: 'titanium', quantity: 50 },
      { itemId: 'glass', quantity: 20 },
      { itemId: 'electronics', quantity: 30 },
      { itemId: 'rubber', quantity: 20 },
    ],
    buildSkills: [
      'engineering.structures', 'science.physics.mechanics',
      'science.physics.thermodynamics', 'science.chemistry', 'math.calculus',
    ],
    teaches: ['rocket-equation', 'orbital-mechanics', 'delta-v', 'life-support', 'material-science'],
    stats: { speed: 28000, fuelCapacity: 1000, cargoCapacity: 500, durability: 250, passengerCapacity: 4 },
  },
  {
    id: 'ftl-cruiser',
    name: 'FTL Cruiser',
    method: 'ftl',
    tier: 'creator',
    materials: [
      { itemId: 'titanium', quantity: 500 },
      { itemId: 'exotic_matter', quantity: 100 },
      { itemId: 'electronics', quantity: 200 },
      { itemId: 'crystal', quantity: 50 },
    ],
    buildSkills: [
      'science.physics.relativity', 'science.physics.quantum',
      'math.calculus', 'math.differential-equations', 'engineering.structures',
    ],
    teaches: ['special-relativity', 'general-relativity', 'spacetime-geometry', 'exotic-matter-physics'],
    stats: { speed: 300000000, fuelCapacity: 5000, cargoCapacity: 1000, durability: 500, passengerCapacity: 10 },
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getTravelMethod(id: string): TravelMethodDefinition | undefined {
  return TRAVEL_METHODS.find(m => m.id === id);
}

export function travelMethodsForTier(
  tier: import('../types/components.js').MasteryTier,
): TravelMethodDefinition[] {
  const tierOrder: Record<string, number> = {
    foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
  };
  const maxLevel = tierOrder[tier] ?? 0;
  return TRAVEL_METHODS.filter(m => (tierOrder[m.minTier] ?? 0) <= maxLevel);
}

export function getRoute(from: string, to: string): BiomeRoute | undefined {
  return BIOME_ROUTES.find(
    r => (r.from === from && r.to === to) || (r.from === to && r.to === from),
  );
}

export function routesFrom(biome: string): BiomeRoute[] {
  return BIOME_ROUTES.filter(r => r.from === biome || r.to === biome);
}

export function getVehicleRecipe(id: string): VehicleRecipe | undefined {
  return VEHICLE_RECIPES.find(r => r.id === id);
}

export function vehicleRecipesForTier(
  tier: import('../types/components.js').MasteryTier,
): VehicleRecipe[] {
  const tierOrder: Record<string, number> = {
    foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
  };
  const maxLevel = tierOrder[tier] ?? 0;
  return VEHICLE_RECIPES.filter(r => (tierOrder[r.tier] ?? 0) <= maxLevel);
}
