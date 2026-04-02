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
  InterestRepository as InterestRepositoryDB,
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
  FlowEngine, CalibrationSystem,
  ScreenTimeSystem, FocusModeSystem,
  DialogueGenerator, InterestTracker, InterestRepository,
  EconomySystem, computePrice, currencyToCopper, normalizeCurrency,
  getTradeableItem, getNpcMerchant, merchantsInBiome,
  TRADEABLE_ITEMS, NPC_MERCHANTS,
  TravelSystem, findRoute, reachableBiomes, fuelForRoute,
  WorldSimulation, computeGrowthStage, getGrowthStageName,
  CodexSystem, ProceduralQuestGenerator, AntiRepetitionTracker,
  MultiplayerSystem,
  CodeForgeSystem, SiblingPlaySystem, ClassroomSystem,
  announcePlayerAction, suggestCollaboration, celebrateTeamwork,
  announcePlayerJoined, announcePlayerLeft, announceObjectiveAssigned, announceQuestProgress,
  createSessionState, canJoinSession, addPlayerToSession, removePlayerFromSession,
  getConnectedPlayers, isSessionEmpty,
  startSharedQuest, claimObjective, completeObjective, isQuestComplete,
  getCompletedObjectiveCount, getPendingObjectives,
  createMessage,
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
  MATERIAL_INTERACTIONS, getInteraction, findInteraction,
  interactionsForTier, interactionsWithMaterial,
  WEATHER_EFFECTS, WEATHER_TRANSITIONS,
  getWeatherEffect, getTransitionsFrom, nextWeather,
  TRAVEL_METHODS, BIOME_ROUTES, VEHICLE_RECIPES,
  getTravelMethod, travelMethodsForTier, getRoute, routesFrom,
  getVehicleRecipe, vehicleRecipesForTier,
  ALL_FRAGMENTS, getFragment, fragmentsForThread, fragmentsForBiome,
  fragmentsForTier, getThreadCounts,
  MYSTERIES, getMystery, mysteriesForBiome, mysteriesRequiringFragment,
  QUEST_TEMPLATES, getQuestTemplate, templatesForMechanic,
  questTemplatesForTier, questTemplatesForBiome,
} from './data/index.js';
export type { BiomeAccessibility, BiomeId, WeatherTransition } from './data/index.js';

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
  AccessibilitySettings, AccessibilityPreset, ColorBlindMode, FontFamily,
  Announcement, AnnouncementPriority, AnnouncementCategory,
  Caption, CaptionType,
  AttemptOutcome, FlowState, FlowZone, ScaffoldAction, ScaffoldType,
  Redirection, ChallengeAttemptRecord, ChallengeInfo,
  CalibrationSession, CalibrationResponse, CalibrationNext, CalibrationResults,
  CalibrationSubject, SubjectCalibrationState, CalibrationLevelDefinition, AgeStartingLevel,
  BreakAction, LimitAction, SessionStats, ScreenTimeConfig, SessionState,
  FocusSource, FocusIntensity, CompanionFocusRequest, ParentFocusRequest,
  FocusSession, SkillWeight,
  DialogueTrigger, DialogueEmotion, DialogueCondition, DialogueVariant,
  DialogueTemplate, DialogueResponse, DialogueContext, GeneratedDialogue,
  InterestCategory, InterestSignalType, InterestSignal, InterestWeights,
  ThemeWeights, BiomeRecommendation,
  MarketPrice, MarketState, TradeItem, TradeOffer, TradeResult,
  PlayerEconomy, CurrencyHolding, TradeRecord, SupplyDemandCurve,
  TradeableItem, ItemCategory, NpcMerchant,
  TravelMethod, TravelMethodDefinition, TerrainType, TravelCheck, TravelResult,
  TravelEvent, VehicleRecipe, VehicleMaterial, VehicleStats, PlayerVehicle, BiomeRoute,
  MaterialInteraction, InteractionCondition, WeatherType, WeatherState, WeatherEffect,
  WorldEffect, SettlementState, Contribution, SettlementNpc, SettlementBuilding,
  SettlementProblem, WorldConsequence, SimWorldEvent, EcosystemState, EcologicalProcess,
  StoryThread, Fragment, Mystery, CodexState, MysteryProgress as MysteryProgressType,
  CodexUpdate,
  QuestMechanic, SkillRole, SkillSlot, TemplateStep, TemplateStructure,
  QuestTemplate, GenerationCriteria, GeneratedQuest, GeneratedQuestContent,
  GeneratedQuestStep, MechanicUsageRecord,
  LANSession, SessionStatus, MultiplayerSessionState, PlayerSessionState,
  SharedQuestState, SharedObjective,
  MultiplayerMessageType, MultiplayerMessage,
  JoinRequestPayload, JoinAcceptedPayload, JoinRejectedPayload,
  PlayerJoinedPayload, PlayerLeftPayload, GameActionPayload,
  QuestStartPayload, QuestUpdatePayload,
  ObjectiveClaimPayload, ObjectiveCompletePayload,
  CompanionAnnouncementKind, CompanionAnnouncementPayload,
} from './types/index.js';
export { DEFAULT_COMPANION_CONFIG, getSpokenInstruction, getScreenReaderText, getCompanionRepeat,
  ALL_CALIBRATION_SUBJECTS,
  DEFAULT_BREAK_INTERVALS, defaultScreenTimeConfig, validateScreenTimeConfig,
  INTENSITY_WEIGHTS, DEFAULT_SKILL_WEIGHT, MAX_FOCUS_SKILLS, validateFocusRequest,
  INTEREST_CATEGORIES, SIGNAL_TYPE_MULTIPLIERS, BIOME_INTEREST_MAP, INTEREST_DECAY_RATE,
  QUEST_MECHANICS,
  MAX_PLAYERS_PER_SESSION, SESSION_BEACON_PORT, SESSION_BEACON_INTERVAL_MS,
  SESSION_TIMEOUT_MS, STATE_SYNC_INTERVAL_MS,
} from './types/index.js';

// Dialogue data
export {
  DIALOGUE_TEMPLATES, getTemplatesForTrigger, getTemplateCount,
} from './data/index.js';
