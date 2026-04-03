// Portal gateway — the first thing anyone sees when they launch Nexus Academy.
// A point of Frost light expands into a swirling particle vortex with
// Frost→Aurora gradient. Title forms from light. "Step Inside" dissolves into
// the profile screen.

import * as THREE from 'three';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const FROST = new THREE.Color(0x22d3ee);
const AURORA = new THREE.Color(0xa78bfa);
const GOLD = new THREE.Color(0xffd700);

const PARTICLE_COUNT = 500;

// ---------------------------------------------------------------------------
// PortalScreen
// ---------------------------------------------------------------------------

export class PortalScreen implements Disposable {
  private disposed = false;
  private overlay: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private particles: THREE.Points | null = null;
  private coreGlow: THREE.Mesh | null = null;
  private animationId = 0;
  private startTime = 0;
  private resolveStep: (() => void) | null = null;

  /**
   * Show the portal and wait for the user to click "Step Inside".
   * Resolves when the dissolution transition completes.
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

    // Canvas for Three.js portal
    const canvas = document.createElement('canvas');
    canvas.id = 'portal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    overlay.appendChild(canvas);
    this.canvas = canvas;

    // Title — forms from light
    const title = document.createElement('h1');
    title.className = 'portal-title';
    title.textContent = 'Nexus Academy';
    overlay.appendChild(title);

    // Subtitle prompt
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

    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Delay prompt appearance
    setTimeout(() => {
      prompt.classList.add('visible');
      prompt.focus();
    }, 2000);
  }

  private onStepInside(): void {
    if (!this.overlay) return;

    // Expand portal + fade out
    this.overlay.classList.add('dissolving');

    setTimeout(() => {
      this.cleanup();
      this.resolveStep?.();
      this.resolveStep = null;
    }, 1200);
  }

  private cleanup(): void {
    cancelAnimationFrame(this.animationId);

    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    if (this.coreGlow) {
      this.coreGlow.geometry.dispose();
      (this.coreGlow.material as THREE.Material).dispose();
    }
    this.renderer?.dispose();
    this.overlay?.remove();
    this.overlay = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.particles = null;
    this.coreGlow = null;
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
        alpha: true,
      });
    } catch {
      // WebGL not available (e.g. jsdom test environment) — skip 3D scene
      console.warn('[PortalScreen] WebGL not available — running without 3D');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    this.createParticles();
    this.createCoreGlow();

    window.addEventListener('resize', this.onResize);
  }

  private createParticles(): void {
    if (!this.scene) return;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    // Per-particle data for orbital animation
    const angles = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const heights = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5;
      const height = (Math.random() - 0.5) * 1.2;
      const speed = 0.3 + Math.random() * 0.7;

      angles[i] = angle;
      radii[i] = radius;
      heights[i] = height;
      speeds[i] = speed;

      // Initial position
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color interpolation Frost→Aurora based on angle
      const t = angle / (Math.PI * 2);
      const color = new THREE.Color().copy(FROST).lerp(AURORA, t);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 2.0 + Math.random() * 4.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Store orbital data on the geometry for animation
    geometry.userData = { angles, radii, heights, speeds };

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createCoreGlow(): void {
    if (!this.scene) return;

    // Golden core glow — the warmth of the world beyond
    const geo = new THREE.SphereGeometry(0.3, 24, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.coreGlow = new THREE.Mesh(geo, mat);
    this.scene.add(this.coreGlow);

    // Outer halo
    const haloGeo = new THREE.SphereGeometry(0.6, 16, 12);
    const haloMat = new THREE.MeshBasicMaterial({
      color: FROST,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    this.scene.add(halo);
  }

  // -------------------------------------------------------------------------
  // Animation loop
  // -------------------------------------------------------------------------

  private animate = (): void => {
    if (this.disposed || !this.renderer || !this.scene || !this.camera || !this.particles) return;

    this.animationId = requestAnimationFrame(this.animate);

    const elapsed = (performance.now() - this.startTime) / 1000;

    // Intro: scale up from point of light
    const introScale = Math.min(elapsed / 1.5, 1.0);
    const eased = 1 - Math.pow(1 - introScale, 3); // ease-out cubic

    this.particles.scale.setScalar(eased);
    if (this.coreGlow) {
      this.coreGlow.scale.setScalar(eased);
      // Pulse the core
      const pulse = 0.6 + Math.sin(elapsed * 2) * 0.15;
      (this.coreGlow.material as THREE.MeshBasicMaterial).opacity = pulse * eased;
    }

    // Orbital particle animation
    const posAttr = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = this.particles.geometry.getAttribute('color') as THREE.BufferAttribute;
    const data = this.particles.geometry.userData as {
      angles: Float32Array;
      radii: Float32Array;
      heights: Float32Array;
      speeds: Float32Array;
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = data.angles[i]! + elapsed * data.speeds[i]!;
      const radius = data.radii[i]!;
      const height = data.heights[i]! + Math.sin(elapsed * 0.5 + i) * 0.1;

      posAttr.setXYZ(
        i,
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      );

      // Shift colors as particles orbit
      const t = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
      const r = FROST.r + (AURORA.r - FROST.r) * t;
      const g = FROST.g + (AURORA.g - FROST.g) * t;
      const b = FROST.b + (AURORA.b - FROST.b) * t;
      colorAttr.setXYZ(i, r, g, b);
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Slow overall rotation
    this.particles.rotation.y += 0.002;
    this.particles.rotation.x = Math.sin(elapsed * 0.3) * 0.1;

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
