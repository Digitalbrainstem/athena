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
