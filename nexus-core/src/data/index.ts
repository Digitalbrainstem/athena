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
