// Re-export all types
export type {
  PositionComponent,
  RotationComponent,
  RenderableComponent,
  InteractableComponent,
  CharacterComponent,
  QuestMarkerComponent,
  PhysicsBodyComponent,
  LightComponent,
  PlayerComponent,
  InventoryItemComponent,
  MasteryTier,
  ComponentType,
  ComponentTypeMap,
} from './components.js';

export type {
  GameAction,
  ActionType,
  ActionSource,
  MovePayload,
  LookPayload,
  SelectPayload,
  SpeakPayload,
} from './actions.js';

export type {
  Vec3,
  CameraDescriptor,
  SceneLight,
  SceneObject,
  SkyDescriptor,
  GroundDescriptor,
  UIElement,
  UIState,
  AudioCue,
  SceneGraph,
} from './scene.js';

export type {
  Profile,
  CreateProfileInput,
  Auth,
  MasteryRecord,
  LearningEvent,
  SM2Result,
} from './profile.js';

export type {
  Quest,
  QuestContent,
  QuestStep,
  QuestReward,
  QuestProgress,
  QuestStatus,
  CreateQuestInput,
} from './quest.js';

export { getSpokenInstruction, getScreenReaderText, getCompanionRepeat } from './quest.js';

export type {
  WorldState,
  BuiltStructure,
  InventoryEntry,
  LightingPreset,
  WorldObjectTemplate,
  BiomeDefinition,
} from './world.js';

export type {
  CompanionState,
  CompanionMemory,
  CompanionConfig,
  PersonalityStage,
} from './companion.js';

export { DEFAULT_COMPANION_CONFIG } from './companion.js';

export type {
  DialogueTrigger,
  DialogueEmotion,
  DialogueCondition,
  DialogueVariant,
  DialogueTemplate,
  DialogueResponse,
  DialogueContext,
  GeneratedDialogue,
} from './dialogue.js';

export type {
  InterestCategory,
  InterestSignalType,
  InterestSignal,
  InterestWeights,
  ThemeWeights,
  BiomeRecommendation,
} from './interest.js';

export {
  INTEREST_CATEGORIES,
  SIGNAL_TYPE_MULTIPLIERS,
  BIOME_INTEREST_MAP,
  INTEREST_DECAY_RATE,
} from './interest.js';

export type {
  AccessibilityMeta,
  Element,
  ElementCategory,
  ElementRef,
  Compound,
  CompoundProperties,
  ChemicalReaction,
  ReactionComponent,
  BuildingMaterial,
  MaterialProperties,
  StructuralElement,
  StructuralElementType,
  StructuralAnalysis,
  FailureMode,
  RecipeInput,
  RecipeInputType,
  RecipeOutput,
  RecipeOutputType,
  CraftRecipe,
  CraftResult,
} from './craft.js';

export type {
  AccessibilitySettings,
  AccessibilityPreset,
  ColorBlindMode,
  FontFamily,
  Announcement,
  AnnouncementPriority,
  AnnouncementCategory,
  Caption,
  CaptionType,
} from './accessibility.js';

export type {
  MarketPrice,
  MarketState,
  TradeItem,
  TradeOffer,
  TradeResult,
  PlayerEconomy,
  CurrencyHolding,
  TradeRecord,
  SupplyDemandCurve,
  TradeableItem,
  ItemCategory,
  NpcMerchant,
} from './economy.js';

export type {
  TravelMethod,
  TravelMethodDefinition,
  TerrainType,
  TravelCheck,
  TravelResult,
  TravelEvent,
  VehicleRecipe,
  VehicleMaterial,
  VehicleStats,
  PlayerVehicle,
  BiomeRoute,
} from './travel.js';

export type {
  MaterialInteraction,
  InteractionCondition,
  WeatherType,
  WeatherState,
  WeatherEffect,
  WorldEffect,
  SettlementState,
  Contribution,
  SettlementNpc,
  SettlementBuilding,
  SettlementProblem,
  WorldConsequence,
  SimWorldEvent,
  EcosystemState,
  EcologicalProcess,
} from './world-sim.js';

export type {
  AttemptOutcome,
  FlowState,
  FlowZone,
  ScaffoldAction,
  ScaffoldType,
  Redirection,
  ChallengeAttemptRecord,
  ChallengeInfo,
} from './flow.js';

export type {
  CalibrationSession,
  CalibrationResponse,
  CalibrationNext,
  CalibrationResults,
  CalibrationSubject,
  SubjectCalibrationState,
  CalibrationLevelDefinition,
  AgeStartingLevel,
} from './calibration.js';

export { ALL_CALIBRATION_SUBJECTS } from './calibration.js';

export type {
  BreakAction,
  LimitAction,
  SessionStats,
  ScreenTimeConfig,
  SessionState,
} from './screen-time.js';

export {
  DEFAULT_BREAK_INTERVALS,
  defaultScreenTimeConfig,
  validateScreenTimeConfig,
} from './screen-time.js';

export type {
  FocusSource,
  FocusIntensity,
  CompanionFocusRequest,
  ParentFocusRequest,
  FocusSession,
  SkillWeight,
} from './focus.js';

export {
  INTENSITY_WEIGHTS,
  DEFAULT_SKILL_WEIGHT,
  MAX_FOCUS_SKILLS,
  validateFocusRequest,
} from './focus.js';
