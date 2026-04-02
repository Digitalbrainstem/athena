// Package entry point — re-exports everything

// Core
export { NexusCore } from './core.js';
export type { NexusCoreConfig } from './core.js';

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
  InventorySystem,
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
} from './types/index.js';
export { DEFAULT_COMPANION_CONFIG } from './types/index.js';
