// World state, biome management, object placement

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { WorldStateRepository } from '../db/repositories/world-state.js';
import type { BiomeDefinition, WorldState, InventoryEntry } from '../types/world.js';
import type { SceneGraph, SceneObject, SceneLight, AudioCue } from '../types/scene.js';

// --- Biome Definitions ---

export const BIOME_DEFINITIONS: BiomeDefinition[] = [
  {
    id: 'workshop',
    name: 'The Workshop',
    description: 'A sprawling inventor\'s workshop where engineering, math, and physics come alive through hands-on building.',
    primarySubjects: ['engineering', 'math.arithmetic', 'math.geometry', 'science.physics'],
    objects: [
      {
        id: 'workbench',
        name: 'Workbench',
        meshType: 'box',
        color: '#8B4513',
        scale: { x: 2, y: 1, z: 1 },
        position: { x: 0, y: 0.5, z: -3 },
        interactionType: 'craft',
        teaches: ['engineering.basics'],
      },
      {
        id: 'gear-wall',
        name: 'Gear Display Wall',
        meshType: 'plane',
        color: '#4A4A4A',
        scale: { x: 4, y: 3, z: 0.1 },
        position: { x: -5, y: 1.5, z: -5 },
        interactionType: 'examine',
        teaches: ['math.geometry', 'science.physics'],
      },
      {
        id: 'blueprint-table',
        name: 'Blueprint Table',
        meshType: 'box',
        color: '#2F4F4F',
        scale: { x: 1.5, y: 0.8, z: 1.5 },
        position: { x: 4, y: 0.4, z: -2 },
        interactionType: 'use',
        teaches: ['math.geometry', 'engineering.structures'],
      },
    ],
    ambientLighting: {
      ambientColor: '#FFE4B5',
      ambientIntensity: 0.4,
      directionalColor: '#FFF8DC',
      directionalIntensity: 0.8,
      directionalDirection: { x: -1, y: -2, z: -1 },
    },
    groundType: 'wood',
    groundColor: '#8B6914',
    skyType: 'color',
    skyPrimaryColor: '#87CEEB',
  },
  {
    id: 'alchemist-lab',
    name: "The Alchemist's Lab",
    description: 'A mysterious laboratory filled with bubbling potions, chemical reactions, and biological wonders.',
    primarySubjects: ['science.chemistry', 'science.biology.basics', 'science.matter'],
    objects: [
      {
        id: 'cauldron',
        name: 'Mixing Cauldron',
        meshType: 'cylinder',
        color: '#2F2F2F',
        scale: { x: 1, y: 1.2, z: 1 },
        position: { x: 0, y: 0.6, z: -2 },
        interactionType: 'craft',
        teaches: ['science.chemistry'],
      },
      {
        id: 'specimen-shelf',
        name: 'Specimen Shelf',
        meshType: 'box',
        color: '#654321',
        scale: { x: 3, y: 2, z: 0.5 },
        position: { x: -4, y: 1, z: -4 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
      {
        id: 'element-table',
        name: 'Element Classification Table',
        meshType: 'box',
        color: '#1C1C1C',
        scale: { x: 2, y: 0.8, z: 1 },
        position: { x: 3, y: 0.4, z: -3 },
        interactionType: 'use',
        teaches: ['science.matter'],
      },
    ],
    ambientLighting: {
      ambientColor: '#9370DB',
      ambientIntensity: 0.3,
      directionalColor: '#DDA0DD',
      directionalIntensity: 0.5,
      directionalDirection: { x: 0, y: -1, z: -1 },
    },
    groundType: 'stone',
    groundColor: '#3D3D3D',
    skyType: 'gradient',
    skyPrimaryColor: '#2E0854',
    skySecondaryColor: '#4B0082',
  },
  {
    id: 'crystal-caverns',
    name: 'The Crystal Caverns',
    description: 'Glittering underground caverns where geology, chemistry, and mathematical patterns intertwine in crystalline formations.',
    primarySubjects: ['science.geology', 'science.chemistry', 'math.geometry'],
    objects: [
      {
        id: 'crystal-cluster',
        name: 'Crystal Cluster',
        meshType: 'model',
        modelId: 'crystal_cluster',
        color: '#00CED1',
        scale: { x: 1.5, y: 2, z: 1.5 },
        position: { x: -2, y: 0, z: -4 },
        interactionType: 'examine',
        teaches: ['science.geology', 'math.geometry'],
      },
      {
        id: 'mineral-vein',
        name: 'Mineral Vein',
        meshType: 'box',
        color: '#DAA520',
        scale: { x: 3, y: 0.5, z: 0.3 },
        position: { x: 2, y: 1, z: -6 },
        interactionType: 'pickup',
        teaches: ['science.geology'],
      },
      {
        id: 'echo-pool',
        name: 'Echo Pool',
        meshType: 'cylinder',
        color: '#4169E1',
        scale: { x: 2, y: 0.1, z: 2 },
        position: { x: 0, y: 0, z: -8 },
        interactionType: 'examine',
        teaches: ['science.chemistry'],
      },
    ],
    ambientLighting: {
      ambientColor: '#00BFFF',
      ambientIntensity: 0.2,
      directionalColor: '#E0FFFF',
      directionalIntensity: 0.3,
      directionalDirection: { x: 0, y: -1, z: 0 },
    },
    groundType: 'rock',
    groundColor: '#2F4F4F',
    skyType: 'color',
    skyPrimaryColor: '#0D0D2B',
  },
  {
    id: 'living-forest',
    name: 'The Living Forest',
    description: 'A vibrant forest ecosystem teeming with life, where biology and ecology are discovered through observation and interaction.',
    primarySubjects: ['science.biology.basics', 'science.biology.ecology'],
    objects: [
      {
        id: 'ancient-tree',
        name: 'Ancient Tree',
        meshType: 'model',
        modelId: 'ancient_tree',
        color: '#228B22',
        scale: { x: 3, y: 5, z: 3 },
        position: { x: 0, y: 0, z: -5 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
      {
        id: 'pond',
        name: 'Forest Pond',
        meshType: 'cylinder',
        color: '#5F9EA0',
        scale: { x: 3, y: 0.05, z: 3 },
        position: { x: 5, y: 0, z: -8 },
        interactionType: 'examine',
        teaches: ['science.biology.ecology'],
      },
      {
        id: 'mushroom-ring',
        name: 'Mushroom Ring',
        meshType: 'model',
        modelId: 'mushroom_ring',
        color: '#FF6347',
        scale: { x: 2, y: 0.5, z: 2 },
        position: { x: -4, y: 0, z: -6 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
    ],
    ambientLighting: {
      ambientColor: '#90EE90',
      ambientIntensity: 0.5,
      directionalColor: '#FFFACD',
      directionalIntensity: 0.7,
      directionalDirection: { x: -0.5, y: -1, z: -0.5 },
    },
    groundType: 'grass',
    groundColor: '#228B22',
    skyType: 'gradient',
    skyPrimaryColor: '#87CEEB',
    skySecondaryColor: '#E0F7FA',
  },
  {
    id: 'library-echoes',
    name: 'The Library of Echoes',
    description: 'An infinite library where words have weight, stories come alive, and language is the key to every door.',
    primarySubjects: ['language.reading', 'language.writing', 'language.grammar'],
    objects: [
      {
        id: 'story-lectern',
        name: 'Story Lectern',
        meshType: 'box',
        color: '#8B0000',
        scale: { x: 0.6, y: 1.2, z: 0.6 },
        position: { x: 0, y: 0.6, z: -3 },
        interactionType: 'use',
        teaches: ['language.reading'],
      },
      {
        id: 'writing-desk',
        name: 'Enchanted Writing Desk',
        meshType: 'box',
        color: '#4B0082',
        scale: { x: 1.5, y: 0.8, z: 1 },
        position: { x: -3, y: 0.4, z: -4 },
        interactionType: 'use',
        teaches: ['language.writing'],
      },
      {
        id: 'word-wall',
        name: 'Word Wall',
        meshType: 'plane',
        color: '#F5DEB3',
        scale: { x: 5, y: 3, z: 0.1 },
        position: { x: 0, y: 1.5, z: -7 },
        interactionType: 'examine',
        teaches: ['language.grammar'],
      },
    ],
    ambientLighting: {
      ambientColor: '#FFD700',
      ambientIntensity: 0.3,
      directionalColor: '#FAEBD7',
      directionalIntensity: 0.6,
      directionalDirection: { x: 0, y: -1, z: -0.5 },
    },
    groundType: 'marble',
    groundColor: '#F5F5DC',
    skyType: 'color',
    skyPrimaryColor: '#2C1810',
  },
];

export function getBiomeDefinition(biomeId: string): BiomeDefinition | undefined {
  return BIOME_DEFINITIONS.find((b) => b.id === biomeId);
}

// --- WorldSystem ---

export class WorldSystem implements System {
  readonly name = 'world';
  readonly priority = 5;

  private worldStateRepo: WorldStateRepository | null = null;
  private activeProfileId: string | null = null;
  private cachedWorldState: WorldState | null = null;
  setRepository(repo: WorldStateRepository): void {
    this.worldStateRepo = repo;
  }

  loadProfile(profileId: string): void {
    this.activeProfileId = profileId;
    this.cachedWorldState = null;
  }

  update(world: World, _dt: number): void {
    if (!this.activeProfileId || !this.worldStateRepo) return;

    // Process move actions
    const actions = world.peekActions();
    for (const action of actions) {
      if (action.type === 'move' && action.payload && 'direction' in action.payload) {
        // Movement updates player position entities
        const players = world.query(['player', 'position']);
        for (const entity of players) {
          const pos = world.getComponent(entity, 'position');
          const payload = action.payload as { direction: { x: number; z: number }; running: boolean };
          if (pos) {
            const speed = payload.running ? 8 : 4;
            pos.x += payload.direction.x * speed * _dt;
            pos.z += payload.direction.z * speed * _dt;
          }
        }
      }
    }
  }

  getWorldState(): WorldState | null {
    if (!this.activeProfileId || !this.worldStateRepo) return null;
    if (!this.cachedWorldState) {
      this.cachedWorldState = this.worldStateRepo.get(this.activeProfileId) ?? null;
    }
    return this.cachedWorldState;
  }

  changeBiome(biomeId: string): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const state = this.getWorldState();
    if (!state) return false;

    if (!state.discoveredBiomes.includes(biomeId)) return false;

    this.worldStateRepo.update(this.activeProfileId, { activeBiome: biomeId });
    this.cachedWorldState = null;
    return true;
  }

  discoverBiome(biomeId: string): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const definition = getBiomeDefinition(biomeId);
    if (!definition) return false;

    this.worldStateRepo.addDiscoveredBiome(this.activeProfileId, biomeId);
    this.cachedWorldState = null;
    return true;
  }

  addInventoryItem(itemType: string, quantity: number): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;
    this.worldStateRepo.updateInventory(this.activeProfileId, itemType, quantity);
    this.cachedWorldState = null;
    return true;
  }

  removeInventoryItem(itemType: string, quantity: number): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const state = this.getWorldState();
    if (!state) return false;

    const item = state.inventory.find((i) => i.itemType === itemType);
    if (!item || item.quantity < quantity) return false;

    this.worldStateRepo.updateInventory(this.activeProfileId, itemType, -quantity);
    this.cachedWorldState = null;
    return true;
  }

  getInventory(): InventoryEntry[] {
    const state = this.getWorldState();
    return state?.inventory ?? [];
  }

  /** Build a scene graph from the current world state */
  buildSceneGraph(world: World): SceneGraph {
    const state = this.getWorldState();
    const biome = state ? getBiomeDefinition(state.activeBiome) : getBiomeDefinition('workshop');
    const biomeDef = biome ?? BIOME_DEFINITIONS[0]!;

    // Build lights from biome
    const lights: SceneLight[] = [
      {
        entityId: -1,
        position: biomeDef.ambientLighting.directionalDirection,
        lightType: 'ambient',
        color: biomeDef.ambientLighting.ambientColor,
        intensity: biomeDef.ambientLighting.ambientIntensity,
      },
      {
        entityId: -2,
        position: biomeDef.ambientLighting.directionalDirection,
        lightType: 'directional',
        color: biomeDef.ambientLighting.directionalColor,
        intensity: biomeDef.ambientLighting.directionalIntensity,
      },
    ];

    // Add light entities
    const lightEntities = world.query(['light', 'position']);
    for (const entity of lightEntities) {
      const lightComp = world.getComponent(entity, 'light');
      const pos = world.getComponent(entity, 'position');
      if (lightComp && pos) {
        lights.push({
          entityId: entity,
          position: { x: pos.x, y: pos.y, z: pos.z },
          lightType: lightComp.lightType,
          color: lightComp.color,
          intensity: lightComp.intensity,
          range: lightComp.range,
        });
      }
    }

    // Build objects from biome templates + ECS entities
    const objects: SceneObject[] = [];

    // Biome static objects
    for (const template of biomeDef.objects) {
      objects.push({
        entityId: -100 - objects.length,
        position: template.position,
        rotation: { x: 0, y: 0, z: 0 },
        renderable: {
          meshType: template.meshType,
          modelId: template.modelId,
          color: template.color,
          scale: template.scale,
          visible: true,
        },
        interactable: template.interactionType
          ? {
              interactionType: template.interactionType,
              radius: 2,
              prompt: `Interact with ${template.name}`,
            }
          : undefined,
        highlight: false,
      });
    }

    // ECS renderable entities
    const renderables = world.query(['position', 'renderable']);
    for (const entity of renderables) {
      const pos = world.getComponent(entity, 'position')!;
      const rot = world.getComponent(entity, 'rotation');
      const rend = world.getComponent(entity, 'renderable')!;
      const interact = world.getComponent(entity, 'interactable');

      objects.push({
        entityId: entity,
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: rot ? { x: rot.x, y: rot.y, z: rot.z } : { x: 0, y: 0, z: 0 },
        renderable: {
          meshType: rend.meshType,
          modelId: rend.modelId,
          color: rend.color,
          scale: rend.scale,
          material: rend.material,
          visible: rend.visible,
        },
        interactable: interact
          ? {
              interactionType: interact.interactionType,
              radius: interact.radius,
              prompt: interact.prompt,
            }
          : undefined,
        highlight: false,
      });
    }

    // Player camera
    const players = world.query(['player', 'position']);
    const playerEntity = players[0];
    let cameraPos = { x: 0, y: 5, z: 10 };
    let cameraRot = { x: -0.3, y: 0, z: 0 };

    if (playerEntity !== undefined) {
      const pos = world.getComponent(playerEntity, 'position');
      if (pos) {
        cameraPos = { x: pos.x, y: pos.y + 5, z: pos.z + 10 };
      }
    }

    const audio: AudioCue[] = [];

    return {
      camera: {
        position: cameraPos,
        rotation: cameraRot,
        fov: 60,
        near: 0.1,
        far: 1000,
      },
      lights,
      objects,
      sky: {
        type: biomeDef.skyType,
        primaryColor: biomeDef.skyPrimaryColor,
        secondaryColor: biomeDef.skySecondaryColor,
      },
      ground: {
        type: biomeDef.groundType,
        color: biomeDef.groundColor,
        size: { width: 100, depth: 100 },
      },
      ui: {
        elements: [],
        dialogueActive: false,
        inventoryOpen: false,
        mapOpen: false,
        paused: false,
      },
      audio,
    };
  }
}
