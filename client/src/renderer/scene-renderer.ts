import * as THREE from 'three';
import type { SceneGraph, SceneObject, CameraDescriptor } from '../types.js';
import type { MasteryTier } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import { ObjectFactory } from './object-factory.js';
import { LightManager } from './light-manager.js';
import { SkyRenderer } from './sky-renderer.js';
import { GroundRenderer } from './ground-renderer.js';
import type { AssetManager } from '../assets/asset-manager.js';
import type { CompanionModel } from '../assets/companion-models.js';
import type { WorldManager } from '../world/world-manager.js';

const LOD_PROFILES = {
  low:    { pixelRatioCap: 1,   antialias: false },
  medium: { pixelRatioCap: 1.5, antialias: true  },
  high:   { pixelRatioCap: 2,   antialias: true  },
} as const;

export type LODTier = keyof typeof LOD_PROFILES;

const COMPANION_COLOR = 0x22d3ee; // Frost
const COMPANION_GLOW = 0xa78bfa;  // Aurora

export class SceneRenderer implements Disposable {
  readonly gl: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private readonly objectFactory: ObjectFactory;
  private readonly lightManager: LightManager;
  private readonly skyRenderer: SkyRenderer;
  private readonly groundRenderer: GroundRenderer;

  private readonly entityMeshes = new Map<number, THREE.Mesh>();
  private readonly entityGroups = new Map<number, THREE.Group>();
  private lodTier: LODTier;
  private disposed = false;

  private predictiveYaw = 0;
  private predictivePitch = 0;
  private hasPredictiveLook = false;

  // Companion orb / model
  private companionGroup: THREE.Group | null = null;
  private companionModel: CompanionModel | null = null;
  private companionTime = 0;
  private assetManager: AssetManager | null = null;
  private worldManager: WorldManager | null = null;

  // Smooth companion follow state
  private companionPosX = 0;
  private companionPosY = 0;
  private companionPosZ = 0;
  private companionInitialized = false;
  private companionSpeaking = false;

  constructor(canvas: HTMLCanvasElement, initialTier: LODTier = 'medium') {
    this.lodTier = initialTier;
    const profile = LOD_PROFILES[initialTier];

    this.gl = new THREE.WebGLRenderer({
      canvas,
      antialias: profile.antialias,
      alpha: false,
      powerPreference: 'default',
      stencil: false,
    });

    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.0;
    this.gl.shadowMap.enabled = false;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.gl.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.far = 600;

    this.objectFactory = new ObjectFactory();
    this.lightManager = new LightManager(this.scene);
    this.skyRenderer = new SkyRenderer(this.scene);
    this.groundRenderer = new GroundRenderer(this.scene);

    this.createCompanionOrb();

    window.addEventListener('resize', this.onResize);
  }

  /** Connect the AssetManager so procedural models are used for 'model' mesh types. */
  setAssetManager(manager: AssetManager): void {
    this.assetManager = manager;
    this.objectFactory.setAssetManager(manager);
  }

  /** Connect the WorldManager for overworld rendering. */
  setWorldManager(wm: WorldManager): void {
    this.worldManager = wm;
  }

  /** Replace the default companion orb with a proper companion character model. */
  setCompanionModel(companionType: string, tier: MasteryTier): void {
    if (!this.assetManager || !companionType) return;
    const model = this.assetManager.getCompanionModel(companionType, tier);
    // Remove the existing orb / model
    if (this.companionGroup) {
      this.scene.remove(this.companionGroup);
    }
    if (this.companionModel) {
      this.companionModel.dispose();
    }
    this.companionGroup = model.group;
    this.companionModel = model;
    this.companionTime = 0;
    this.scene.add(this.companionGroup);
  }

  render(sceneGraph: SceneGraph): void {
    if (this.disposed) return;

    this.syncCamera(sceneGraph.camera);
    this.skyRenderer.sync(sceneGraph.sky);

    // When WorldManager is active, it provides terrain/interior instead of the flat ground
    if (this.worldManager) {
      if (this.worldManager.isOverworld()) {
        // Overworld mode: terrain is the ground, hide default ground.
        // Don't render biome objects (they're inside buildings).
        this.groundRenderer.sync({ ...sceneGraph.ground, color: '#000000', size: { width: 0, depth: 0 } });
        this.lightManager.sync(sceneGraph.lights);
        this.syncObjects([]); // Clear biome objects
      } else if (this.worldManager.isInside()) {
        // Inside mode: interior provides floor, render biome objects at offset
        this.groundRenderer.sync({ ...sceneGraph.ground, color: '#000000', size: { width: 0, depth: 0 } });
        this.lightManager.sync(sceneGraph.lights);
        const offset = this.worldManager.getBiomeOffset();
        const offsetObjects = sceneGraph.objects.map((obj) => ({
          ...obj,
          position: {
            x: obj.position.x + offset.x,
            y: obj.position.y + offset.y,
            z: obj.position.z + offset.z,
          },
        }));
        this.syncObjects(offsetObjects);
      } else {
        // Transitioning: render nothing extra
        this.lightManager.sync(sceneGraph.lights);
      }
    } else {
      // No WorldManager: original behavior
      this.groundRenderer.sync(sceneGraph.ground);
      this.lightManager.sync(sceneGraph.lights);
      this.syncObjects(sceneGraph.objects);
    }

    this.updateCompanion(sceneGraph.camera);
    this.gl.render(this.scene, this.camera);
  }

  applyPredictiveLook(deltaX: number, deltaY: number): void {
    this.predictiveYaw += deltaX;
    this.predictivePitch += deltaY;
    this.hasPredictiveLook = true;
  }

  getLODTier(): LODTier { return this.lodTier; }

  setLODTier(tier: LODTier): void {
    this.lodTier = tier;
    const profile = LOD_PROFILES[tier];
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
  }

  getStats(): THREE.WebGLInfo { return this.gl.info; }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    window.removeEventListener('resize', this.onResize);

    for (const mesh of this.entityMeshes.values()) {
      this.scene.remove(mesh);
    }
    this.entityMeshes.clear();

    for (const group of this.entityGroups.values()) {
      this.scene.remove(group);
    }
    this.entityGroups.clear();

    if (this.companionGroup) {
      this.scene.remove(this.companionGroup);
      this.companionGroup = null;
    }
    if (this.companionModel) {
      this.companionModel.dispose();
      this.companionModel = null;
    }

    this.lightManager.dispose();
    this.skyRenderer.dispose();
    this.groundRenderer.dispose();
    this.objectFactory.dispose();
    this.gl.dispose();
  }

  // -- Companion orb -------------------------------------------------------

  private createCompanionOrb(): void {
    const group = new THREE.Group();

    // Core sphere
    const coreGeo = new THREE.SphereGeometry(0.15, 16, 12);
    const coreMat = new THREE.MeshStandardMaterial({
      color: COMPANION_COLOR,
      emissive: COMPANION_COLOR,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer glow shell
    const glowGeo = new THREE.SphereGeometry(0.22, 12, 8);
    const glowMat = new THREE.MeshStandardMaterial({
      color: COMPANION_GLOW,
      emissive: COMPANION_GLOW,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.25,
      roughness: 0.0,
      metalness: 0.0,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // Point light to illuminate surroundings
    const light = new THREE.PointLight(COMPANION_COLOR, 0.5, 4);
    group.add(light);

    this.companionGroup = group;
    this.scene.add(group);
  }

  /** Tell the companion whether it should face the player (speaking). */
  setCompanionSpeaking(speaking: boolean): void {
    this.companionSpeaking = speaking;
  }

  private updateCompanion(cam: CameraDescriptor): void {
    if (!this.companionGroup) return;
    this.companionTime += 0.016;

    const FOLLOW_DISTANCE = 2.0;
    const FOLLOW_LERP = 3.0;    // speed of position smoothing (units/sec factor)
    const HEIGHT_OFFSET = -0.3;  // companion floats slightly below eye level

    // Target position: ~2 units to the right and slightly behind the player
    const yaw = cam.rotation.y;
    const offsetRight = 1.2;
    const offsetForward = -1.5;

    const targetX = cam.position.x
      + Math.sin(yaw + Math.PI / 2) * offsetRight
      + Math.sin(yaw) * offsetForward;
    const targetZ = cam.position.z
      + Math.cos(yaw + Math.PI / 2) * offsetRight
      + Math.cos(yaw) * offsetForward;
    const targetY = cam.position.y + HEIGHT_OFFSET;

    // Initialize on first frame to avoid lerping from origin
    if (!this.companionInitialized) {
      this.companionPosX = targetX;
      this.companionPosY = targetY;
      this.companionPosZ = targetZ;
      this.companionInitialized = true;
    }

    // Smooth lerp toward target position (dt ≈ 0.016)
    const dt = 0.016;
    const t = 1 - Math.exp(-FOLLOW_LERP * dt);
    this.companionPosX += (targetX - this.companionPosX) * t;
    this.companionPosY += (targetY - this.companionPosY) * t;
    this.companionPosZ += (targetZ - this.companionPosZ) * t;

    // If companion drifts too far (e.g. teleport), snap closer
    const dx = this.companionPosX - cam.position.x;
    const dz = this.companionPosZ - cam.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > FOLLOW_DISTANCE * 3) {
      this.companionPosX = targetX;
      this.companionPosY = targetY;
      this.companionPosZ = targetZ;
    }

    // Gentle bobbing
    const bob = Math.sin(this.companionTime * 2) * 0.08;
    this.companionGroup.position.set(
      this.companionPosX,
      this.companionPosY + bob,
      this.companionPosZ,
    );

    // Facing: look at player when speaking, otherwise face player's direction
    if (this.companionSpeaking) {
      const toPlayerX = cam.position.x - this.companionPosX;
      const toPlayerZ = cam.position.z - this.companionPosZ;
      this.companionGroup.rotation.y = Math.atan2(toPlayerX, toPlayerZ);
    } else {
      this.companionGroup.rotation.y = yaw + Math.PI;
    }

    // Run character-specific idle animation if available, otherwise rotate orb
    if (this.companionModel) {
      this.companionModel.idle(this.companionTime);
    } else {
      // Slow orb spin on top of facing direction
      this.companionGroup.rotation.y += 0.005;
    }
  }

  // -- Camera / objects ----------------------------------------------------

  private syncCamera(desc: CameraDescriptor): void {
    this.camera.fov = desc.fov;
    this.camera.near = desc.near;
    this.camera.far = desc.far;

    this.camera.position.set(desc.position.x, desc.position.y, desc.position.z);

    let yaw = desc.rotation.y;
    let pitch = desc.rotation.x;

    if (this.hasPredictiveLook) {
      yaw += this.predictiveYaw;
      pitch += this.predictivePitch;
      this.predictiveYaw = 0;
      this.predictivePitch = 0;
      this.hasPredictiveLook = false;
    }

    const euler = new THREE.Euler(pitch, yaw, desc.rotation.z, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    this.camera.updateProjectionMatrix();
  }

  private syncObjects(objects: SceneObject[]): void {
    const incoming = new Set<number>();

    for (const obj of objects) {
      incoming.add(obj.entityId);

      const existing = this.entityMeshes.get(obj.entityId);
      if (existing) {
        this.objectFactory.updateMesh(existing, obj);
      } else {
        const mesh = this.objectFactory.createMesh(obj);

        // Check if a procedural group was created for this entity
        const group = this.objectFactory.getProceduralGroup(obj.entityId);
        if (group) {
          this.entityGroups.set(obj.entityId, group);
          this.scene.add(group);
          // Still track the placeholder mesh so the loop works
          this.entityMeshes.set(obj.entityId, mesh);
        } else {
          this.entityMeshes.set(obj.entityId, mesh);
          this.scene.add(mesh);
        }
      }
    }

    for (const [id, mesh] of this.entityMeshes) {
      if (!incoming.has(id)) {
        this.scene.remove(mesh);
        this.entityMeshes.delete(id);

        const group = this.objectFactory.removeProceduralGroup(id);
        if (group) {
          this.scene.remove(group);
          this.entityGroups.delete(id);
        }
      }
    }
  }

  private onResize = (): void => {
    if (this.disposed) return;
    const profile = LOD_PROFILES[this.lodTier];
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}
