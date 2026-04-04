import * as THREE from 'three';
import type { SkyDescriptor, Disposable } from '../types.js';
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

// ---------------------------------------------------------------------------
// WorldManager — orchestrates the connected overworld
// ---------------------------------------------------------------------------

/** Distance to biome entrance that triggers "Press E to enter" prompt */
const ENTER_RANGE = 5;
/** Distance to door inside building that triggers "Press E to exit" prompt */
const EXIT_RANGE = 3;

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

  // Sub-systems
  private readonly terrain: OverworldTerrain;
  private readonly landmarks: LandmarkManager;
  private readonly pathNetwork: PathNetwork;
  private readonly skyDome: OverworldSkyDome;
  private readonly transition: TransitionOverlay;
  private readonly townSquare: THREE.Group;

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

    // Interior group (populated when entering a building)
    this.interiorGroup = new THREE.Group();
    this.interiorGroup.name = 'interior';

    // Transition overlay
    this.transition = new TransitionOverlay();

    // Start in overworld
    scene.add(this.overworldGroup);
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
  getExtraCollisionBoxes(): { cx: number; cz: number; hx: number; hz: number }[] {
    if (this._activeInterior) return this._activeInterior.wallBoxes;
    return [];
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

      // Create interior if it's a building type
      if (hasBuildingInterior(biomeId)) {
        this._activeInterior = new BuildingInterior(biome);
        this.interiorGroup.add(this._activeInterior.group);
      }

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

    // Create interior if it's a building type
    if (hasBuildingInterior(biomeId)) {
      this._activeInterior = new BuildingInterior(biome);
      this.interiorGroup.add(this._activeInterior.group);
    }

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
    if (this._mode !== 'inside' || !this._activeInterior) return false;
    const door = this._activeInterior.doorWorldPosition;
    const dx = px - door.x;
    const dz = pz - door.z;
    return Math.sqrt(dx * dx + dz * dz) < EXIT_RANGE;
  }
}
