import * as THREE from 'three';
import type { CollisionBox } from '../camera/first-person.js';
import type { SceneGraph, SceneObject, SkyDescriptor, Disposable } from '../types.js';
import {
  OverworldTerrain,
  BIOME_LOCATIONS,
  PATH_CONNECTIONS,
  getBiomeLocation,
  type BiomeLocation,
} from './overworld.js';
import { LandmarkManager } from './landmarks.js';
import { BuildingInterior, hasBuildingInterior } from './building-interior.js';
import { PathNetwork } from './paths.js';
import { OverworldSkyDome } from './sky-dome.js';
import { TransitionOverlay } from './transition.js';
import { WorkshopBiome } from './workshop-biome.js';
import { getWorkshopCollisionBoxes, getWorkshopGameplayObjects } from './workshop-biome.js';
import { MaterialLibrary } from '../assets/materials.js';
import { ProceduralModelGenerator } from '../assets/procedural-models.js';
import { BiomeEnvironmentGenerator } from '../assets/biome-environments.js';
import type { MasteryTier } from '@nexus-academy/core';

// ---------------------------------------------------------------------------
// WorldManager — orchestrates the connected overworld
// ---------------------------------------------------------------------------

/** Distance to biome entrance that triggers "Press E to enter" prompt */
const ENTER_RANGE = 5;
/** Distance to door inside building that triggers "Press E to exit" prompt */
const EXIT_RANGE = 3;

const TOWN_SQUARE_COLLISION_BOXES: CollisionBox[] = [
  { cx: 0, cz: 0, hx: 3.6, hz: 3.6 },
  { cx: 5, cz: 5, hx: 0.7, hz: 0.7 },
];

const BIOME_ENVIRONMENT_TIER: MasteryTier = 'foundation';
const ENVIRONMENT_ENTITY_ID_BASE = -300_000;
const PASS_THROUGH_ENVIRONMENT_PROPS = new Set([
  'flower',
  'grass',
  'candle',
  'torch',
  'lantern',
  'banner',
]);
const NON_INTERACTIVE_ENVIRONMENT_PROPS = new Set([
  'fence',
  'tree',
  'bush',
  'flower',
  'grass',
  'rock',
  'torch',
  'lantern',
  'banner',
]);

function landmarkHalfSize(biome: BiomeLocation): number {
  return Math.max(2, Math.min(biome.radius * 0.45, 6));
}

function propTypeFromObject(obj: THREE.Object3D): string | null {
  const propType = obj.userData.biomePropType;
  return typeof propType === 'string' ? propType : null;
}

function propIndexFromObject(obj: THREE.Object3D): number {
  const propIndex = obj.userData.biomePropIndex;
  return typeof propIndex === 'number' ? propIndex : 0;
}

function humanizePropType(propType: string): string {
  return propType
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .toLowerCase();
}

export type WorldMode = 'overworld' | 'entering' | 'inside' | 'exiting';

export interface NearbyBiome {
  biome: BiomeLocation;
  distance: number;
  entranceDistance: number;
}

/** Town square signpost / fountain — decorative center of the world */
function createTownSquare(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'town-square';

  // Central fountain base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3.5, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 }),
  );
  base.position.y = 0.25;
  g.add(base);

  // Fountain pillar
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 2.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.7 }),
  );
  pillar.position.y = 1.75;
  g.add(pillar);

  // Frost orb at top (the Nexus glow)
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    }),
  );
  orb.position.y = 3.5;
  g.add(orb);

  // Point light from the orb
  const light = new THREE.PointLight(0x22d3ee, 0.6, 15);
  light.position.y = 3.5;
  g.add(light);

  // Signpost arms pointing to nearby biomes
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.9 }),
  );
  signPost.position.set(5, 1.5, 5);
  g.add(signPost);

  // Sign arms
  const signArm1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.9 }),
  );
  signArm1.position.set(5.5, 2.5, 5);
  signArm1.rotation.y = -0.6;
  g.add(signArm1);

  const signArm2 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.9 }),
  );
  signArm2.position.set(5.5, 2.1, 5);
  signArm2.rotation.y = 0.8;
  g.add(signArm2);

  return g;
}

export class WorldManager implements Disposable {
  // State
  private _mode: WorldMode = 'overworld';
  private _activeBiomeId: string | null = null;
  private _activeInterior: BuildingInterior | null = null;
  private _activeEnvironment: THREE.Group | null = null;
  private _activeEnvironmentCollisionBoxes: CollisionBox[] = [];
  private _activeEnvironmentGameplayObjects: SceneObject[] = [];

  // Sub-systems
  private readonly terrain: OverworldTerrain;
  private readonly landmarks: LandmarkManager;
  private readonly pathNetwork: PathNetwork;
  private readonly skyDome: OverworldSkyDome;
  private readonly transition: TransitionOverlay;
  private readonly townSquare: THREE.Group;
  private readonly environmentMaterials: MaterialLibrary;
  private readonly proceduralModels: ProceduralModelGenerator;
  private readonly biomeEnvironments: BiomeEnvironmentGenerator;
  private workshopBiome: WorkshopBiome | null = null;

  // Scene groups
  private readonly overworldGroup: THREE.Group;
  private readonly interiorGroup: THREE.Group;

  // The Three.js scene we add/remove groups from
  private readonly scene: THREE.Scene;

  // Nearest biome for enter/exit prompts
  private _nearbyBiome: NearbyBiome | null = null;
  private _nearDoor = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create overworld group
    this.overworldGroup = new THREE.Group();
    this.overworldGroup.name = 'overworld';

    // Terrain
    this.terrain = new OverworldTerrain(BIOME_LOCATIONS, PATH_CONNECTIONS);
    this.overworldGroup.add(this.terrain.mesh);
    this.overworldGroup.add(this.terrain.decorations);

    // Landmarks
    this.landmarks = new LandmarkManager(BIOME_LOCATIONS);
    this.landmarks.getLandmark('workshop')?.removeFromParent();
    this.overworldGroup.add(this.landmarks.group);

    // Paths
    this.pathNetwork = new PathNetwork(
      BIOME_LOCATIONS,
      PATH_CONNECTIONS,
      (x, z) => this.terrain.getHeightAt(x, z),
    );
    this.overworldGroup.add(this.pathNetwork.group);

    // Sky enhancements
    this.skyDome = new OverworldSkyDome();
    this.overworldGroup.add(this.skyDome.group);

    // Town square decorations
    this.townSquare = createTownSquare();
    this.overworldGroup.add(this.townSquare);

    // Procedural biome environments for natural/non-building areas.
    this.environmentMaterials = new MaterialLibrary();
    this.proceduralModels = new ProceduralModelGenerator(this.environmentMaterials);
    this.biomeEnvironments = new BiomeEnvironmentGenerator(this.environmentMaterials, this.proceduralModels);

    // Interior group (populated when entering a building)
    this.interiorGroup = new THREE.Group();
    this.interiorGroup.name = 'interior';

    // Transition overlay
    this.transition = new TransitionOverlay();

    // Start in overworld
    scene.add(this.overworldGroup);

    // Load the Workshop biome with real 3D models (async)
    this.loadWorkshopBiome();
  }

  /** Asynchronously load the Workshop biome GLB models into the overworld. */
  private loadWorkshopBiome(): void {
    const workshopLoc = getBiomeLocation('workshop');
    if (!workshopLoc) return;

    this.workshopBiome = new WorkshopBiome();
    void this.workshopBiome.init().then(() => {
      if (!this.workshopBiome) return;
      // Position the biome at its world location
      this.workshopBiome.group.position.set(
        workshopLoc.worldPosition.x,
        workshopLoc.baseHeight,
        workshopLoc.worldPosition.z,
      );
      this.overworldGroup.add(this.workshopBiome.group);
      console.log('[World] Workshop biome loaded with GLB models');
    }).catch((err) => {
      console.warn('[World] Failed to load Workshop biome:', err);
    });
  }

  // -- Public API -----------------------------------------------------------

  get mode(): WorldMode { return this._mode; }
  get activeBiomeId(): string | null { return this._activeBiomeId; }
  get nearbyBiome(): NearbyBiome | null { return this._nearbyBiome; }
  get isNearDoor(): boolean { return this._nearDoor; }

  isOverworld(): boolean {
    return this._mode === 'overworld';
  }

  isInside(): boolean {
    return this._mode === 'inside';
  }

  /** Get terrain height at world position (for camera ground clamping) */
  getHeightAt(x: number, z: number): number {
    if (this._mode === 'inside' && this._activeBiomeId) {
      const loc = getBiomeLocation(this._activeBiomeId);
      return loc?.baseHeight ?? 0;
    }
    return this.terrain.getHeightAt(x, z);
  }

  /** Starting position for the first playable moment in the overworld. */
  getStartPosition(biomeId = 'workshop'): { x: number; z: number } {
    const loc = getBiomeLocation(biomeId);
    if (!loc) return { x: 0, z: 0 };
    if (biomeId === 'workshop') {
      return { x: loc.worldPosition.x, z: loc.worldPosition.z + 2 };
    }
    const entranceLength = Math.hypot(loc.entranceOffset.x, loc.entranceOffset.z);
    const clearDistance = Math.max(entranceLength * 0.7, landmarkHalfSize(loc) + 0.9);
    if (entranceLength === 0) {
      return { x: loc.worldPosition.x, z: loc.worldPosition.z + clearDistance };
    }
    const nx = loc.entranceOffset.x / entranceLength;
    const nz = loc.entranceOffset.z / entranceLength;
    return {
      x: loc.worldPosition.x + nx * clearDistance,
      z: loc.worldPosition.z + nz * clearDistance,
    };
  }

  /** Get world-space offset for biome objects when inside */
  getBiomeOffset(): { x: number; y: number; z: number } {
    if (!this._activeBiomeId) return { x: 0, y: 0, z: 0 };
    const loc = getBiomeLocation(this._activeBiomeId);
    if (!loc) return { x: 0, y: 0, z: 0 };
    return {
      x: loc.worldPosition.x,
      y: loc.baseHeight,
      z: loc.worldPosition.z,
    };
  }

  /** Get extra collision boxes (interior walls when inside a building) */
  getExtraCollisionBoxes(): CollisionBox[] {
    if (this._activeInterior) return this._activeInterior.wallBoxes;
    return this._activeEnvironmentCollisionBoxes;
  }

  /** Get collision boxes for direct Three.js overworld content. */
  getOverworldCollisionBoxes(): CollisionBox[] {
    if (!this.isOverworld()) return [];

    const boxes: CollisionBox[] = [...TOWN_SQUARE_COLLISION_BOXES];
    for (const biome of BIOME_LOCATIONS) {
      if (biome.id === 'workshop') continue;
      const halfSize = landmarkHalfSize(biome);
      boxes.push({
        cx: biome.worldPosition.x,
        cz: biome.worldPosition.z,
        hx: halfSize,
        hz: halfSize,
      });
    }

    const workshop = getBiomeLocation('workshop');
    if (workshop) {
      boxes.push(...getWorkshopCollisionBoxes(
        workshop.worldPosition.x,
        workshop.worldPosition.z,
      ));
    }

    return boxes;
  }

  /** Gameplay metadata for direct Three.js overworld content. */
  getOverworldGameplayObjects(): SceneObject[] {
    if (!this.isOverworld()) return [];

    const objects: SceneObject[] = [];
    const workshop = getBiomeLocation('workshop');
    if (workshop) {
      objects.push(...getWorkshopGameplayObjects(
        workshop.worldPosition.x,
        workshop.baseHeight,
        workshop.worldPosition.z,
      ));
    }
    return objects;
  }

  /** Merge direct Three.js world content into the renderer-agnostic gameplay graph. */
  mergeGameplayObjects(graph: SceneGraph): SceneGraph {
    const objects = this.isOverworld()
      ? this.getOverworldGameplayObjects()
      : this._activeEnvironmentGameplayObjects;
    if (objects.length === 0) return graph;
    return {
      ...graph,
      objects: [...graph.objects, ...objects],
    };
  }

  /** Get overworld sky descriptor */
  getOverworldSky(): SkyDescriptor {
    const d = this.skyDome.getSkyDescriptor();
    return {
      type: d.type,
      primaryColor: d.primaryColor,
      secondaryColor: d.secondaryColor,
    };
  }

  /** Called each frame to update world state and check proximity */
  update(playerX: number, playerZ: number, dt: number): void {
    // Animate sky
    this.skyDome.update(dt);

    // Animate interior dust particles
    if (this._activeInterior) {
      this._activeInterior.updateDust(dt);
    }

    // Update nearby biome info
    this._nearbyBiome = this.findNearestBiome(playerX, playerZ);
    this._nearDoor = this.checkNearDoor(playerX, playerZ);
  }

  /**
   * Attempt to enter the nearest biome. Called when player presses E
   * near a biome entrance. Returns the biome ID if successful.
   */
  async enterBiome(): Promise<string | null> {
    if (this._mode !== 'overworld' || !this._nearbyBiome) return null;
    if (this._nearbyBiome.entranceDistance > ENTER_RANGE) return null;
    if (this.transition.isAnimating) return null;

    const biome = this._nearbyBiome.biome;
    const biomeId = biome.id;

    this._mode = 'entering';

    await this.transition.crossfade(() => {
      // Hide overworld
      this.scene.remove(this.overworldGroup);

      this.createActiveBiomeArea(biome);

      this.scene.add(this.interiorGroup);
      this._activeBiomeId = biomeId;
      this._mode = 'inside';
    });

    return biomeId;
  }

  /**
   * Exit current biome back to overworld. Called when player presses E
   * near the interior door.
   */
  async exitBiome(): Promise<void> {
    if (this._mode !== 'inside') return;
    if (this.transition.isAnimating) return;

    this._mode = 'exiting';

    await this.transition.crossfade(() => {
      this.cleanupInterior();
      this.scene.add(this.overworldGroup);
      this._activeBiomeId = null;
      this._mode = 'overworld';
    });
  }

  /**
   * Synchronously enter a biome (for testing / debug bridge).
   * Skips the crossfade animation.
   */
  forceEnterBiome(biomeId: string): void {
    const biome = getBiomeLocation(biomeId);
    if (!biome) return;

    // Clean up any existing interior
    this.cleanupInterior();

    // Hide overworld
    this.scene.remove(this.overworldGroup);

    this.createActiveBiomeArea(biome);

    this.scene.add(this.interiorGroup);
    this._activeBiomeId = biomeId;
    this._mode = 'inside';
  }

  /**
   * Synchronously exit to overworld (for testing / debug bridge).
   */
  forceExitBiome(): void {
    this.cleanupInterior();
    this.scene.remove(this.interiorGroup);
    this.scene.add(this.overworldGroup);
    this._activeBiomeId = null;
    this._mode = 'overworld';
  }

  /** Get the position the player should be teleported to when entering a biome */
  getEntryPosition(biomeId: string): { x: number; z: number } | null {
    const loc = getBiomeLocation(biomeId);
    if (!loc) return null;
    // Place player just inside the building, opposite the entrance offset
    return {
      x: loc.worldPosition.x + loc.entranceOffset.x * 0.3,
      z: loc.worldPosition.z + loc.entranceOffset.z * 0.3,
    };
  }

  /** Get the position the player should be teleported to when exiting */
  getExitPosition(): { x: number; z: number } | null {
    if (!this._activeBiomeId) return null;
    const loc = getBiomeLocation(this._activeBiomeId);
    if (!loc) return null;
    // Place player just outside the entrance
    return {
      x: loc.worldPosition.x + loc.entranceOffset.x * 1.5,
      z: loc.worldPosition.z + loc.entranceOffset.z * 1.5,
    };
  }

  dispose(): void {
    this.terrain.dispose();
    this.landmarks.dispose();
    this.pathNetwork.dispose();
    this.skyDome.dispose();
    this.transition.dispose();
    this.cleanupInterior();
    this.proceduralModels.dispose();
    this.environmentMaterials.dispose();

    if (this.workshopBiome) {
      this.workshopBiome.dispose();
      this.workshopBiome = null;
    }

    this.scene.remove(this.overworldGroup);
    this.scene.remove(this.interiorGroup);

    // Clean up town square geometries
    this.townSquare.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) obj.material.dispose();
      }
    });
  }

  // -- Private helpers ------------------------------------------------------

  private cleanupInterior(): void {
    if (this._activeInterior) {
      this.interiorGroup.remove(this._activeInterior.group);
      this._activeInterior.dispose();
      this._activeInterior = null;
    }

    if (this._activeEnvironment) {
      this.interiorGroup.remove(this._activeEnvironment);
      this._activeEnvironment = null;
    }
    this._activeEnvironmentCollisionBoxes = [];
    this._activeEnvironmentGameplayObjects = [];
  }

  private createActiveBiomeArea(biome: BiomeLocation): void {
    if (hasBuildingInterior(biome.id)) {
      this._activeInterior = new BuildingInterior(biome);
      this.interiorGroup.add(this._activeInterior.group);
      this._activeEnvironmentCollisionBoxes = [];
      this._activeEnvironmentGameplayObjects = [];
      return;
    }

    const environment = this.biomeEnvironments.generate(biome.id, BIOME_ENVIRONMENT_TIER, {
      reducedDetail: false,
      reducedMotion: false,
    });
    environment.position.set(
      biome.worldPosition.x,
      biome.baseHeight + 0.02,
      biome.worldPosition.z,
    );
    this._activeEnvironment = environment;
    this.interiorGroup.add(environment);
    environment.updateMatrixWorld(true);
    this._activeEnvironmentCollisionBoxes = collectEnvironmentCollisionBoxes(environment);
    this._activeEnvironmentGameplayObjects = collectEnvironmentGameplayObjects(environment);
  }

  private findNearestBiome(px: number, pz: number): NearbyBiome | null {
    let nearest: NearbyBiome | null = null;

    for (const biome of BIOME_LOCATIONS) {
      const dx = px - biome.worldPosition.x;
      const dz = pz - biome.worldPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      const ex = px - (biome.worldPosition.x + biome.entranceOffset.x);
      const ez = pz - (biome.worldPosition.z + biome.entranceOffset.z);
      const entranceDistance = Math.sqrt(ex * ex + ez * ez);

      if (!nearest || entranceDistance < nearest.entranceDistance) {
        nearest = { biome, distance, entranceDistance };
      }
    }

    return nearest;
  }

  private checkNearDoor(px: number, pz: number): boolean {
    if (this._mode !== 'inside' || !this._activeBiomeId) return false;
    const loc = getBiomeLocation(this._activeBiomeId);
    if (!loc) return false;
    const door = this._activeInterior
      ? this._activeInterior.doorWorldPosition
      : {
          x: loc.worldPosition.x + loc.entranceOffset.x,
          z: loc.worldPosition.z + loc.entranceOffset.z,
        };
    const dx = px - door.x;
    const dz = pz - door.z;
    return Math.sqrt(dx * dx + dz * dz) < EXIT_RANGE;
  }
}

function collectEnvironmentCollisionBoxes(environment: THREE.Group): CollisionBox[] {
  const boxes: CollisionBox[] = [];
  for (const child of environment.children) {
    const propType = propTypeFromObject(child);
    if (!propType || PASS_THROUGH_ENVIRONMENT_PROPS.has(propType)) continue;

    child.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(child);
    if (bounds.isEmpty()) continue;

    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    if (size.x < 0.05 || size.z < 0.05) continue;

    boxes.push({
      cx: center.x,
      cz: center.z,
      hx: Math.max(0.25, Math.min(size.x * 0.5, 4)),
      hz: Math.max(0.25, Math.min(size.z * 0.5, 4)),
    });
  }
  return boxes;
}

function collectEnvironmentGameplayObjects(environment: THREE.Group): SceneObject[] {
  const objects: SceneObject[] = [];
  for (const child of environment.children) {
    const propType = propTypeFromObject(child);
    if (!propType || NON_INTERACTIVE_ENVIRONMENT_PROPS.has(propType)) continue;

    child.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(child);
    if (bounds.isEmpty()) continue;

    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const label = humanizePropType(propType);
    objects.push({
      entityId: ENVIRONMENT_ENTITY_ID_BASE - propIndexFromObject(child),
      position: { x: center.x, y: center.y, z: center.z },
      rotation: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
      renderable: {
        meshType: 'model',
        modelId: propType,
        scale: {
          x: Math.max(size.x, 0.5),
          y: Math.max(size.y, 0.5),
          z: Math.max(size.z, 0.5),
        },
        visible: false,
      },
      interactable: {
        interactionType: 'examine',
        radius: Math.max(2, Math.min(Math.max(size.x, size.z) * 0.6 + 1, 4)),
        prompt: `Interact with ${label}`,
      },
      highlight: false,
    });
  }
  return objects;
}
