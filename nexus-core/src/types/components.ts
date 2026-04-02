// Component type definitions for the ECS

export interface PositionComponent {
  x: number;
  y: number;
  z: number;
}

export interface RotationComponent {
  x: number;
  y: number;
  z: number;
}

export interface RenderableComponent {
  meshType: 'box' | 'sphere' | 'cylinder' | 'model' | 'plane';
  modelId?: string;
  color?: string;
  scale: { x: number; y: number; z: number };
  material?: string;
  visible: boolean;
}

export interface InteractableComponent {
  interactionType: 'examine' | 'pickup' | 'use' | 'talk' | 'craft' | 'build';
  radius: number;
  prompt: string;
  requiredKnowledge?: string[];
  teaches?: string[];
}

export interface CharacterComponent {
  name: string;
  role: 'companion' | 'npc' | 'merchant' | 'quest_giver';
  dialogue?: string[];
  personality?: string;
}

export interface QuestMarkerComponent {
  questId: string;
  stepIndex: number;
  markerType: 'start' | 'objective' | 'complete';
}

export interface PhysicsBodyComponent {
  bodyType: 'static' | 'dynamic' | 'kinematic';
  colliderType: 'box' | 'sphere' | 'capsule' | 'mesh';
  mass: number;
  velocity: { x: number; y: number; z: number };
  grounded: boolean;
}

export interface LightComponent {
  lightType: 'point' | 'directional' | 'ambient' | 'hemisphere';
  color: string;
  intensity: number;
  range?: number;
}

export interface PlayerComponent {
  profileId: string;
  masteryTier: MasteryTier;
  activeBiome: string;
}

export interface InventoryItemComponent {
  itemType: string;
  quantity: number;
  properties?: Record<string, unknown>;
}

export type MasteryTier = 'foundation' | 'discovery' | 'builder' | 'innovator' | 'creator';

export type ComponentType =
  | 'position'
  | 'rotation'
  | 'renderable'
  | 'interactable'
  | 'character'
  | 'questMarker'
  | 'physicsBody'
  | 'light'
  | 'player'
  | 'inventoryItem';

export interface ComponentTypeMap {
  position: PositionComponent;
  rotation: RotationComponent;
  renderable: RenderableComponent;
  interactable: InteractableComponent;
  character: CharacterComponent;
  questMarker: QuestMarkerComponent;
  physicsBody: PhysicsBodyComponent;
  light: LightComponent;
  player: PlayerComponent;
  inventoryItem: InventoryItemComponent;
}
