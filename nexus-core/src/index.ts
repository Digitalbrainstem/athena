// Package entry point — re-exports everything

// Core
export { NexusCore } from './core.js';
export type { NexusCoreConfig } from './core.js';

// Quest Data
export {
  allQuests,
  allFoundationQuests,
  foundationWorkshopQuests,
  foundationForestQuests,
  foundationCavernsQuests,
} from './data/quests/index.js';

// ECS
export { EntityManager, ComponentStorage, World, createSystem } from './ecs/index.js';
export type { System, WorldEvent } from './ecs/index.js';

// Database
export { DatabaseConnection, createSchema, ProfileRepository, MasteryRepository,
  QuestRepository, LearningEventRepository, WorldStateRepository, CompanionRepository,
} from './db/index.js';
export type { DatabaseConfig } from './db/index.js';

// Systems
export { MasterySystem, sm2, calculateMasteryLevel, updateRetention, updateTransfer,
  updateDepth, detectGaps, QuestSystem, canTransition, WorldSystem, BIOME_DEFINITIONS,
  getBiomeDefinition, CompanionSystem, getNextStage, shouldAdvanceStage, getDialogueStyle,
  InventorySystem, CraftSystem,
  ELEMENTS, getElement, getElementByNumber, elementsForTier,
  COMPOUNDS, REACTIONS, getCompound, getReaction, reactionsForTier,
  RECIPES, getRecipe, recipesForTierAndBiome,
  BUILDING_MATERIALS, getMaterial, materialsForTier,
} from './systems/index.js';
export type { MasteryDimensions, GapAnalysis, GapDetail, SkillPrerequisites,
  PendingLearningEvent, QuestAction, QuestSelectionCriteria, CompanionInteraction,
  DialogueStyle, InventoryAction,
} from './systems/index.js';

// Scene
export { distance, findObjectsInRadius, findNearestInteractable, updateHighlights,
  createEmptySceneGraph, playSfx, playAmbient, playMusic, playVoice, stopAudio,
  fadeOut, getBiomeAmbience,
} from './scene/index.js';

// Accessibility
export {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  sanitizeSettings,
  applyPreset,
  mergeSettings,
  AnnouncementQueue,
  generateCaption,
  generateCaptions,
} from './accessibility/index.js';

// Data
export {
  BIOME_ACCESSIBILITY, getBiomeAccessibility, BIOME_IDS, isValidBiome,
  SKILL_PREREQUISITES, getPrerequisites, getAllPrerequisites, arePrerequisitesMet,
  getRootSkills, getDependents,
} from './data/index.js';
export type { BiomeAccessibility, BiomeId } from './data/index.js';

// Types — re-export everything
export type {
  PositionComponent, RotationComponent, RenderableComponent, InteractableComponent,
  CharacterComponent, QuestMarkerComponent, PhysicsBodyComponent, LightComponent,
  PlayerComponent, InventoryItemComponent, MasteryTier, ComponentType, ComponentTypeMap,
  GameAction, ActionType, ActionSource, MovePayload, LookPayload, SelectPayload, SpeakPayload,
  Vec3, CameraDescriptor, SceneLight, SceneObject, SkyDescriptor, GroundDescriptor,
  UIElement, UIState, AudioCue, SceneGraph,
  Profile, CreateProfileInput, Auth, MasteryRecord, LearningEvent, SM2Result,
  Quest, QuestContent, QuestStep, QuestReward, QuestProgress, QuestStatus, CreateQuestInput,
  WorldState, BuiltStructure, InventoryEntry, LightingPreset, WorldObjectTemplate, BiomeDefinition,
  CompanionState, CompanionMemory, CompanionConfig, PersonalityStage,
  Element, ElementCategory, ElementRef, Compound, CompoundProperties,
  ChemicalReaction, ReactionComponent, AccessibilityMeta,
  BuildingMaterial, MaterialProperties,
  StructuralElement, StructuralElementType, StructuralAnalysis, FailureMode,
  RecipeInput, RecipeInputType, RecipeOutput, RecipeOutputType,
  CraftRecipe, CraftResult,
} from './types/index.js';
export { DEFAULT_COMPANION_CONFIG, getSpokenInstruction, getScreenReaderText, getCompanionRepeat } from './types/index.js';
