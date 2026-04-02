import * as THREE from 'three';
import type { SceneGraph, SceneObject, CameraDescriptor } from '../types.js';
import type { Disposable } from '../types.js';
import { ObjectFactory } from './object-factory.js';
import { LightManager } from './light-manager.js';
import { SkyRenderer } from './sky-renderer.js';
import { GroundRenderer } from './ground-renderer.js';

const LOD_PROFILES = {
  low:    { pixelRatioCap: 1,   antialias: false },
  medium: { pixelRatioCap: 1.5, antialias: true  },
  high:   { pixelRatioCap: 2,   antialias: true  },
} as const;

export type LODTier = keyof typeof LOD_PROFILES;

export class SceneRenderer implements Disposable {
  readonly gl: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private readonly objectFactory: ObjectFactory;
  private readonly lightManager: LightManager;
  private readonly skyRenderer: SkyRenderer;
  private readonly groundRenderer: GroundRenderer;

  private readonly entityMeshes = new Map<number, THREE.Mesh>();
  private lodTier: LODTier;
  private disposed = false;

  private predictiveYaw = 0;
  private predictivePitch = 0;
  private hasPredictiveLook = false;

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

    this.objectFactory = new ObjectFactory();
    this.lightManager = new LightManager(this.scene);
    this.skyRenderer = new SkyRenderer(this.scene);
    this.groundRenderer = new GroundRenderer(this.scene);

    window.addEventListener('resize', this.onResize);
  }

  render(sceneGraph: SceneGraph): void {
    if (this.disposed) return;

    this.syncCamera(sceneGraph.camera);
    this.skyRenderer.sync(sceneGraph.sky);
    this.groundRenderer.sync(sceneGraph.ground);
    this.lightManager.sync(sceneGraph.lights);
    this.syncObjects(sceneGraph.objects);

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

    this.lightManager.dispose();
    this.skyRenderer.dispose();
    this.groundRenderer.dispose();
    this.objectFactory.dispose();
    this.gl.dispose();
  }

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
        this.entityMeshes.set(obj.entityId, mesh);
        this.scene.add(mesh);
      }
    }

    for (const [id, mesh] of this.entityMeshes) {
      if (!incoming.has(id)) {
        this.scene.remove(mesh);
        this.entityMeshes.delete(id);
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
