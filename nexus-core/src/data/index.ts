// Data module — re-exports all game data
export { ELEMENTS, getElement, getElementByNumber, elementsForTier } from './elements.js';
export { COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier } from './compounds.js';
export { RECIPES, getRecipe, recipesForTierAndBiome } from './recipes.js';
export { BUILDING_MATERIALS, getMaterial, materialsForTier } from './materials.js';
export {
  BIOME_ACCESSIBILITY,
  getBiomeAccessibility,
  BIOME_IDS,
  isValidBiome,
} from './biomes.js';
export type { BiomeAccessibility, BiomeId } from './biomes.js';
export {
  SKILL_PREREQUISITES,
  getPrerequisites,
  getAllPrerequisites,
  arePrerequisitesMet,
  getRootSkills,
  getDependents,
} from './skill-prerequisites.js';
export {
  allQuests,
  allFoundationQuests,
  foundationWorkshopQuests,
  foundationForestQuests,
  foundationCavernsQuests,
} from './quests/index.js';
export {
  MATERIAL_INTERACTIONS, getInteraction, findInteraction,
  interactionsForTier, interactionsWithMaterial,
} from './material-interactions.js';
export {
  WEATHER_EFFECTS, WEATHER_TRANSITIONS,
  getWeatherEffect, getTransitionsFrom, nextWeather,
} from './weather-effects.js';
export type { WeatherTransition } from './weather-effects.js';
export {
  TRAVEL_METHODS, BIOME_ROUTES, VEHICLE_RECIPES,
  getTravelMethod, travelMethodsForTier, getRoute, routesFrom,
  getVehicleRecipe, vehicleRecipesForTier,
} from './travel-methods.js';
export {
  DIALOGUE_TEMPLATES,
  getTemplatesForTrigger,
  getTemplateCount,
} from './dialogue-templates.js';
