// Portal gateway — cinematic intro rendered entirely with GLSL shaders.
//
// Sequence:
//   0-3s   Stars emerge from darkness, galaxy begins forming
//   3-6s   Full galaxy visible — spinning spiral with nebula clouds
//   6-8s   "NEXUS ACADEMY" title renders (canvas-textured plane, NOT CSS)
//   8s+    Subtle prompt pulses — entire screen clickable (no web button)
//   click  3s fly-through: galaxy spins faster, zoom into core, golden flash
//
// Everything is GPU-rendered. No CSS animations. No HTML buttons.

import * as THREE from 'three';
import { createGalaxyPortalMaterial } from '../shaders/galaxy-portal.js';
import type { GalaxyPortalUniforms } from '../shaders/galaxy-portal.js';
import type { Disposable } from '../types.js';

const FLY_DURATION = 3.0;
const T_PROMPT_IN  = 1.5;   // clickable after 1.5s

export class PortalScreen implements Disposable {
  private disposed = false;
  private entering = false;
  private ready = false;
  private overlay: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private portalMaterial: (THREE.ShaderMaterial & { uniforms: GalaxyPortalUniforms }) | null = null;
  private portalMesh: THREE.Mesh | null = null;

  private animationId = 0;
  private startTime = 0;
  private enterStartTime = 0;
  private resolveStep: (() => void) | null = null;

  async show(): Promise<void> {
    if (this.disposed) return;
    return new Promise<void>((resolve) => {
      this.resolveStep = resolve;
      this.startTime = performance.now();
      this.buildDOM();

      // Load text overlay (transparent PNG) — background is procedural shader
      const loader = new THREE.TextureLoader();
      loader.load('/nexus-text-transparent.png', (textTex) => {
        textTex.minFilter = THREE.LinearFilter;
        this.initScene(textTex);
        this.animate();
      });
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.cleanup();
  }

  // ── DOM — minimal, just the canvas and a11y ──────────────────────────────

  private buildDOM(): void {
    const overlay = document.createElement('div');
    overlay.id = 'portal-screen';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Welcome to Nexus Academy');
    overlay.tabIndex = 0;
    overlay.style.cursor = 'default';

    const sr = document.createElement('div');
    sr.className = 'sr-only';
    sr.setAttribute('role', 'status');
    sr.setAttribute('aria-live', 'polite');
    sr.textContent = 'Welcome to Nexus Academy. A galaxy is forming. Touch the light to enter.';
    overlay.appendChild(sr);

    const canvas = document.createElement('canvas');
    canvas.id = 'portal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    overlay.appendChild(canvas);
    this.canvas = canvas;

    // Click/tap anywhere — no button
    const enter = () => {
      if (!this.ready || this.entering) return;
      this.onEnter();
    };
    overlay.addEventListener('click', enter);
    overlay.addEventListener('touchstart', (e) => { e.preventDefault(); enter(); }, { passive: false });
    overlay.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.ready && !this.entering) {
        e.preventDefault();
        enter();
      }
    });

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  private onEnter(): void {
    if (this.entering) return;
    this.entering = true;
    this.enterStartTime = performance.now();
    if (this.overlay) this.overlay.style.cursor = 'none';
    if (!this.renderer) setTimeout(() => this.finishTransition(), 100);
  }

  private finishTransition(): void {
    this.cleanup();
    this.resolveStep?.();
    this.resolveStep = null;
  }

  private cleanup(): void {
    cancelAnimationFrame(this.animationId);
    this.portalMaterial?.dispose();
    this.portalMesh?.geometry.dispose();
    this.renderer?.dispose();
    this.overlay?.remove();
    this.overlay = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.portalMaterial = null;
    this.portalMesh = null;
  }

  // ── Scene: fullscreen quad with galaxy shader + text planes ──────────────

  private initScene(textTex: THREE.Texture): void {
    if (!this.canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false });
    } catch {
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Fullscreen quad — procedural background + text overlay
    this.portalMaterial = createGalaxyPortalMaterial(textTex);
    this.portalMaterial.uniforms.uResolution.value.set(w, h);
    const quad = new THREE.PlaneGeometry(2, 2);
    this.portalMesh = new THREE.Mesh(quad, this.portalMaterial);
    this.scene.add(this.portalMesh);

    window.addEventListener('resize', this.onResize);
  }

  // ── Animation ────────────────────────────────────────────────────────────

  private animate = (): void => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.renderer || !this.scene || !this.camera || !this.portalMaterial) return;

    const now = performance.now();
    const t = (now - this.startTime) / 1000;

    // Update shader
    this.portalMaterial.uniforms.uTime.value = t;

    // Spaghettification — starts at 2.5s, builds gradually
    const warpT = Math.max(0, (t - 2.5) / 4);
    this.portalMaterial.uniforms.uWarp.value = Math.min(warpT, 1.0);

    // Screen becomes clickable quickly
    if (!this.ready && t >= T_PROMPT_IN) {
      this.ready = true;
      if (this.overlay) this.overlay.style.cursor = 'pointer';
    }

    // Fly-through
    if (this.entering) {
      const et = (now - this.enterStartTime) / 1000;
      const flyT = Math.min(et / FLY_DURATION, 1.0);
      const flyE = flyT * flyT * (3 - 2 * flyT);

      this.portalMaterial.uniforms.uFlythrough.value = flyE;

      if (flyT >= 1.0) {
        this.finishTransition();
        return;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    if (!this.renderer || !this.portalMaterial) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.portalMaterial.uniforms.uResolution.value.set(w, h);
  };
}
