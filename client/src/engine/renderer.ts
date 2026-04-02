import * as THREE from 'three';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Three.js Renderer — production setup with proper disposal and LOD
// ---------------------------------------------------------------------------

export const LOD_TIERS = ['low', 'medium', 'high'] as const;
export type LODTier = typeof LOD_TIERS[number];

interface LODProfile {
  pixelRatioCap: number;
  antialias: boolean;
}

const LOD_PROFILES: Record<LODTier, LODProfile> = {
  low:    { pixelRatioCap: 1,   antialias: false },
  medium: { pixelRatioCap: 1.5, antialias: true  },
  high:   { pixelRatioCap: 2,   antialias: true  },
};

export class Renderer implements Disposable {
  readonly gl: THREE.WebGLRenderer;
  private lodTier: LODTier;
  private camera: THREE.Camera | null = null;
  private disposed = false;

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

    // Tone mapping for natural lighting
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.0;

    // Shadow maps configured but disabled for Foundation tier (safe, soft look).
    // Flip to true when Explorer tier introduces shadows.
    this.gl.shadowMap.enabled = false;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // Output color space
    this.gl.outputColorSpace = THREE.SRGBColorSpace;

    window.addEventListener('resize', this.onResize);
  }

  /** Bind a camera so resize events update its projection */
  bindCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.syncCameraAspect();
  }

  /** Render a single frame */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this.disposed) return;
    this.gl.render(scene, camera);
  }

  /** Current LOD tier */
  getLODTier(): LODTier {
    return this.lodTier;
  }

  /** Switch LOD tier at runtime (e.g. from auto-detect or user settings) */
  setLODTier(tier: LODTier): void {
    this.lodTier = tier;
    const profile = LOD_PROFILES[tier];
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
  }

  /** Read Three.js renderer.info for debug stats */
  getStats(): THREE.WebGLInfo {
    return this.gl.info;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
    this.gl.dispose();
    this.camera = null;
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private onResize = (): void => {
    if (this.disposed) return;
    const profile = LOD_PROFILES[this.lodTier];
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.syncCameraAspect();
  };

  private syncCameraAspect(): void {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}
