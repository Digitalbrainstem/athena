// Systems exports
export { MasterySystem, sm2, calculateMasteryLevel, updateRetention, updateTransfer, updateDepth, detectGaps } from './mastery.js';
export type { MasteryDimensions, GapAnalysis, GapDetail, SkillPrerequisites, PendingLearningEvent } from './mastery.js';
export { QuestSystem, canTransition } from './quest.js';
export type { QuestAction, QuestSelectionCriteria } from './quest.js';
export { WorldSystem, BIOME_DEFINITIONS, getBiomeDefinition } from './world.js';
export { CompanionSystem, getNextStage, shouldAdvanceStage, getDialogueStyle } from './companion.js';
export type { CompanionInteraction, DialogueStyle } from './companion.js';
export { InventorySystem } from './inventory.js';
export type { InventoryAction } from './inventory.js';
export { CraftSystem,
  ELEMENTS, getElement, getElementByNumber, elementsForTier,
  COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier,
  RECIPES, getRecipe, recipesForTierAndBiome,
  BUILDING_MATERIALS, getMaterial, materialsForTier,
} from './craft.js';
export { EconomySystem, computePrice, currencyToCopper, normalizeCurrency,
  getTradeableItem, getNpcMerchant, merchantsInBiome,
  TRADEABLE_ITEMS, NPC_MERCHANTS,
} from './economy.js';
export { TravelSystem, findRoute, reachableBiomes, fuelForRoute } from './travel.js';
export { WorldSimulation, computeGrowthStage, getGrowthStageName } from './world-sim.js';
export { DialogueGenerator } from './dialogue.js';
export { InterestTracker, InterestRepository } from './interest.js';
export { FlowEngine } from './flow.js';
export { CalibrationSystem } from './calibration.js';
export { ScreenTimeSystem } from './screen-time.js';
export { FocusModeSystem } from './focus.js';
