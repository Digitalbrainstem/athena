// World, biome, and object types

export interface WorldState {
  profileId: string;
  activeBiome: string;
  discoveredBiomes: string[];
  builtStructures: BuiltStructure[];
  inventory: InventoryEntry[];
  travelCapability: string[];
  worldSeed?: string;
}

export interface BuiltStructure {
  id: string;
  biome: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface InventoryEntry {
  itemType: string;
  quantity: number;
  properties?: Record<string, unknown>;
}

export interface LightingPreset {
  ambientColor: string;
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  directionalDirection: { x: number; y: number; z: number };
}

export interface WorldObjectTemplate {
  id: string;
  name: string;
  meshType: 'box' | 'sphere' | 'cylinder' | 'model' | 'plane';
  modelId?: string;
  color: string;
  /** Shape identifier for colour-blind mode (e.g. 'circle', 'star') */
  iconShape?: string;
  scale: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  interactionType?: 'examine' | 'pickup' | 'use' | 'talk' | 'craft' | 'build';
  teaches?: string[];
  /** Spoken name for audio/screen-reader users */
  spokenName?: string;
  /** Plain-language description of this object */
  accessibilityDescription?: string;
}

export interface BiomeDefinition {
  id: string;
  name: string;
  description: string;
  /** Spoken name for audio/screen-reader users */
  spokenName?: string;
  /** What the biome sounds like (for audio-first users) */
  ambientDescription?: string;
  primarySubjects: string[];
  objects: WorldObjectTemplate[];
  ambientLighting: LightingPreset;
  groundType: string;
  groundColor: string;
  skyType: 'color' | 'gradient' | 'skybox';
  skyPrimaryColor: string;
  skySecondaryColor?: string;
}
