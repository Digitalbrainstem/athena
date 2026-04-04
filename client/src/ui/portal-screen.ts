// Portal gateway — the first thing anyone sees when they launch Nexus Academy.
// Full-screen Three.js particle vortex: 1200 particles spiral inward in a
// funnel shape.  Frost → Aurora → Gold gradient, background stars, volumetric
// light rays from a pulsing golden core, slow rotation.  Auto-animates on
// load.  "Step Inside" materialises after 3 seconds.  Clicking it flies the
// camera forward through the portal center with a white flash, then dissolves.

import * as THREE from 'three';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const DEEP_SPACE  = new THREE.Color(0x0a0a2e);
const FROST       = new THREE.Color(0x22d3ee);
const AURORA      = new THREE.Color(0xa78bfa);
const GOLD        = new THREE.Color(0xffd700);

const VORTEX_COUNT = 1200;
const STAR_COUNT   = 400;
const RAY_COUNT    = 6;

// ---------------------------------------------------------------------------
// PortalScreen
// ---------------------------------------------------------------------------

export class PortalScreen implements Disposable {
  private disposed = false;
  private entering = false;
  private overlay: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private vortex: THREE.Points | null = null;
  private stars: THREE.Points | null = null;
  private coreGlow: THREE.Mesh | null = null;
  private halo: THREE.Mesh | null = null;
  private rays: THREE.Mesh[] = [];
  private flashOverlay: HTMLElement | null = null;
  private animationId = 0;
  private startTime = 0;
  private enterStartTime = 0;
  private resolveStep: (() => void) | null = null;

  /**
   * Show the portal and wait for the user to click "Step Inside".
   * Resolves when the fly-through + white flash transition completes.
   */
  async show(): Promise<void> {
    if (this.disposed) return;

    return new Promise<void>((resolve) => {
      this.resolveStep = resolve;
      this.startTime = performance.now();
      this.buildDOM();
      this.initThreeScene();
      this.animate();
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.cleanup();
  }

  // -------------------------------------------------------------------------
  // DOM
  // -------------------------------------------------------------------------

  private buildDOM(): void {
    const overlay = document.createElement('div');
    overlay.id = 'portal-screen';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Welcome to Nexus Academy');

    // Screen-reader announce
    const sr = document.createElement('div');
    sr.className = 'sr-only';
    sr.setAttribute('role', 'status');
    sr.setAttribute('aria-live', 'polite');
    sr.textContent = 'Welcome to Nexus Academy. A portal of light is opening before you.';
    overlay.appendChild(sr);

    // Canvas for Three.js portal — fills the entire overlay
    const canvas = document.createElement('canvas');
    canvas.id = 'portal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    overlay.appendChild(canvas);
    this.canvas = canvas;

    // Title — emerges from glow
    const title = document.createElement('h1');
    title.className = 'portal-title';
    title.textContent = 'Nexus Academy';
    overlay.appendChild(title);

    // "Step Inside" prompt — appears after 3 s
    const prompt = document.createElement('button');
    prompt.className = 'portal-prompt';
    prompt.type = 'button';
    prompt.textContent = 'Step Inside';
    prompt.setAttribute('aria-label', 'Step inside the Nexus');
    prompt.addEventListener('click', () => this.onStepInside());
    prompt.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onStepInside();
      }
    });
    overlay.appendChild(prompt);

    // White-flash overlay for the fly-through finale
    const flash = document.createElement('div');
    flash.className = 'portal-flash';
    overlay.appendChild(flash);
    this.flashOverlay = flash;

    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Show prompt after 3 s
    setTimeout(() => {
      if (this.disposed) return;
      prompt.classList.add('visible');
      prompt.focus();
    }, 3000);
  }

  private onStepInside(): void {
    if (!this.overlay || this.entering) return;
    this.entering = true;
    this.enterStartTime = performance.now();

    // If no WebGL (tests/jsdom), complete immediately via timeout
    if (!this.renderer) {
      setTimeout(() => this.finishTransition(), 100);
    }
  }

  private finishTransition(): void {
    this.cleanup();
    this.resolveStep?.();
    this.resolveStep = null;
  }

  private cleanup(): void {
    cancelAnimationFrame(this.animationId);

    // Dispose vortex
    if (this.vortex) {
      this.vortex.geometry.dispose();
      (this.vortex.material as THREE.Material).dispose();
    }
    // Dispose stars
    if (this.stars) {
      this.stars.geometry.dispose();
      (this.stars.material as THREE.Material).dispose();
    }
    // Dispose core + halo
    if (this.coreGlow) {
      this.coreGlow.geometry.dispose();
      (this.coreGlow.material as THREE.Material).dispose();
    }
    if (this.halo) {
      this.halo.geometry.dispose();
      (this.halo.material as THREE.Material).dispose();
    }
    // Dispose rays
    for (const r of this.rays) {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    }
    this.rays = [];

    this.renderer?.dispose();
    this.overlay?.remove();
    this.overlay = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.vortex = null;
    this.stars = null;
    this.coreGlow = null;
    this.halo = null;
    this.flashOverlay = null;
  }

  // -------------------------------------------------------------------------
  // Three.js scene
  // -------------------------------------------------------------------------

  private initThreeScene(): void {
    if (!this.canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
      });
    } catch {
      console.warn('[PortalScreen] WebGL not available — running without 3D');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(DEEP_SPACE, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(DEEP_SPACE.getHex(), 0.08);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    this.camera.position.set(0, 0, 6);

    this.createStars();
    this.createVortex();
    this.createCoreGlow();
    this.createLightRays();

    window.addEventListener('resize', this.onResize);
  }

  // -- Stars ---------------------------------------------------------------

  private createStars(): void {
    if (!this.scene) return;

    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = -10 - Math.random() * 40;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { drifts: Array.from({ length: STAR_COUNT }, () => (Math.random() - 0.5) * 0.02) };

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  // -- Vortex particles ----------------------------------------------------

  private createVortex(): void {
    if (!this.scene) return;

    const positions = new Float32Array(VORTEX_COUNT * 3);
    const colors    = new Float32Array(VORTEX_COUNT * 3);
    const angles    = new Float32Array(VORTEX_COUNT);
    const radii     = new Float32Array(VORTEX_COUNT);
    const heights   = new Float32Array(VORTEX_COUNT);
    const speeds    = new Float32Array(VORTEX_COUNT);
    const phases    = new Float32Array(VORTEX_COUNT);

    for (let i = 0; i < VORTEX_COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 3.0;
      const height = (Math.random() - 0.5) * 3.0;
      const speed  = 0.2 + Math.random() * 0.8;

      angles[i]  = angle;
      radii[i]   = radius;
      heights[i] = height;
      speeds[i]  = speed;
      phases[i]  = Math.random() * Math.PI * 2;

      positions[i * 3]     = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color based on radius: outer → AURORA, mid → FROST, inner → GOLD
      const t = Math.min(radius / 3.0, 1.0);
      const color = new THREE.Color();
      if (t > 0.5) {
        color.copy(FROST).lerp(AURORA, (t - 0.5) * 2);
      } else {
        color.copy(GOLD).lerp(FROST, t * 2);
      }
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.userData = { angles, radii, heights, speeds, phases };

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.vortex = new THREE.Points(geo, mat);
    this.scene.add(this.vortex);
  }

  // -- Core glow -----------------------------------------------------------

  private createCoreGlow(): void {
    if (!this.scene) return;

    // Inner golden core
    const coreGeo = new THREE.SphereGeometry(0.35, 32, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    this.coreGlow = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.coreGlow);

    // Frost halo ring
    const haloGeo = new THREE.SphereGeometry(0.8, 24, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: FROST,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.scene.add(this.halo);

    // Aurora outer shimmer
    const shimmerGeo = new THREE.SphereGeometry(1.4, 16, 12);
    const shimmerMat = new THREE.MeshBasicMaterial({
      color: AURORA,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
    });
    const shimmer = new THREE.Mesh(shimmerGeo, shimmerMat);
    this.scene.add(shimmer);
    // Track for disposal via rays array
    this.rays.push(shimmer);
  }

  // -- Volumetric light rays (faked transparent planes) --------------------

  private createLightRays(): void {
    if (!this.scene) return;

    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      const geo = new THREE.PlaneGeometry(0.15, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: GOLD,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ray = new THREE.Mesh(geo, mat);
      ray.position.set(0, 0, 0);
      ray.rotation.z = angle;
      this.scene.add(ray);
      this.rays.push(ray);
    }
  }

  // -------------------------------------------------------------------------
  // Animation loop
  // -------------------------------------------------------------------------

  private animate = (): void => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.renderer || !this.scene || !this.camera) return;

    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;

    // --- Intro: scale up from a point of light (first 2 s) ---
    const introT = Math.min(elapsed / 2.0, 1.0);
    const eased  = 1 - Math.pow(1 - introT, 3);

    // --- Fly-through when entering ---
    if (this.entering) {
      const enterElapsed = (now - this.enterStartTime) / 1000;
      const flyDuration  = 1.4;
      const flashStart   = 0.8;

      // Camera rushes forward
      const flyT = Math.min(enterElapsed / flyDuration, 1.0);
      const flyEased = flyT * flyT * (3 - 2 * flyT); // smooth-step
      this.camera.position.z = 6 - flyEased * 8;
      this.camera.fov = 60 + flyEased * 40;
      this.camera.updateProjectionMatrix();

      // White flash
      if (enterElapsed > flashStart && this.flashOverlay) {
        const flashT = Math.min((enterElapsed - flashStart) / (flyDuration - flashStart), 1.0);
        this.flashOverlay.style.opacity = String(flashT);
      }

      if (enterElapsed >= flyDuration) {
        this.finishTransition();
        return;
      }
    }

    // --- Vortex particle animation ---
    if (this.vortex) {
      this.vortex.scale.setScalar(eased);

      const posAttr   = this.vortex.geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = this.vortex.geometry.getAttribute('color') as THREE.BufferAttribute;
      const d = this.vortex.geometry.userData as {
        angles: Float32Array; radii: Float32Array;
        heights: Float32Array; speeds: Float32Array; phases: Float32Array;
      };

      for (let i = 0; i < VORTEX_COUNT; i++) {
        const baseAngle = d.angles[i]! + elapsed * d.speeds[i]!;
        // Inward spiral: radius oscillates and slowly shrinks toward center
        const spiralR = d.radii[i]! * (0.7 + 0.3 * Math.sin(elapsed * 0.4 + d.phases[i]!));
        const h = d.heights[i]! + Math.sin(elapsed * 0.5 + d.phases[i]!) * 0.2;

        posAttr.setXYZ(
          i,
          Math.cos(baseAngle) * spiralR,
          h,
          Math.sin(baseAngle) * spiralR,
        );

        // Colour shifts as particles orbit
        const t = Math.min(spiralR / 3.0, 1.0);
        const color = new THREE.Color();
        if (t > 0.5) {
          color.copy(FROST).lerp(AURORA, (t - 0.5) * 2);
        } else {
          color.copy(GOLD).lerp(FROST, t * 2);
        }
        colorAttr.setXYZ(i, color.r, color.g, color.b);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Slow overall rotation
      this.vortex.rotation.y += 0.003;
      this.vortex.rotation.x = Math.sin(elapsed * 0.25) * 0.12;
    }

    // --- Core glow pulse ---
    if (this.coreGlow) {
      this.coreGlow.scale.setScalar(eased * (0.9 + 0.15 * Math.sin(elapsed * 2.0)));
      const pulse = 0.55 + 0.2 * Math.sin(elapsed * 2.0);
      (this.coreGlow.material as THREE.MeshBasicMaterial).opacity = pulse * eased;
    }
    if (this.halo) {
      this.halo.scale.setScalar(eased * (1.0 + 0.1 * Math.sin(elapsed * 1.5)));
    }

    // --- Light ray rotation ---
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i]!;
      ray.rotation.z += 0.001 + i * 0.0003;
      if (ray.material instanceof THREE.MeshBasicMaterial && ray.material.opacity < 0.1) {
        ray.material.opacity = 0.03 + 0.02 * Math.sin(elapsed * 1.2 + i);
      }
    }

    // --- Stars gentle drift ---
    if (this.stars) {
      const sp = this.stars.geometry.getAttribute('position') as THREE.BufferAttribute;
      const drifts = this.stars.geometry.userData.drifts as number[];
      for (let i = 0; i < STAR_COUNT; i++) {
        const y = sp.getY(i) + drifts[i]! * 0.05;
        sp.setY(i, y);
      }
      sp.needsUpdate = true;
      (this.stars.material as THREE.PointsMaterial).opacity = 0.5 + 0.2 * Math.sin(elapsed * 0.3);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };
}
