// Portal gateway — cinematic intro rendered entirely with GLSL shaders.
//
// First-time players see a cinematic sequence:
//   0s     Black screen, portal ambient music fades in
//   2s     Nexus Voice: "A new mind enters the Nexus..." — stars fade in
//   ~6s    Founder voice — portal ring materializes
//   ~10s   Nexus Voice: "Step through..." — portal fully revealed
//   ready  Entire screen clickable
//   click  3s stargate wormhole tunnel fly-through
//
// Returning players skip the cinematic — portal appears immediately.
//
// Everything is GPU-rendered. No CSS animations. No HTML buttons.

import * as THREE from 'three';
import { createGalaxyPortalMaterial } from '../shaders/galaxy-portal.js';
import type { GalaxyPortalUniforms } from '../shaders/galaxy-portal.js';
import { CINEMATIC_LINES, MUSIC } from '../core/registry.js';
import type { Disposable } from '../types.js';

const FLY_DURATION = 3.0;
const T_PROMPT_IN  = 1.5;

export interface PortalShowOptions {
  firstTime?: boolean;
}

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
  private tapPrompt: HTMLElement | null = null;
  private logoElement: HTMLElement | null = null;

  private animationId = 0;
  private startTime = 0;
  private enterStartTime = 0;
  private resolveStep: (() => void) | null = null;

  // Cinematic intro state
  private firstTime = false;
  private reveal = 1.0;
  private targetReveal = 1.0;
  private revealSpeed = 0.0;
  private audioCtx: AudioContext | null = null;
  private musicElement: HTMLAudioElement | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private lastFrameTime = 0;

  async show(options?: PortalShowOptions): Promise<void> {
    if (this.disposed) return;
    this.firstTime = options?.firstTime ?? false;

    return new Promise<void>((resolve) => {
      this.resolveStep = resolve;
      this.startTime = performance.now();
      this.buildDOM();

      if (this.firstTime) {
        this.reveal = 0.0;
        this.targetReveal = 0.0;
        // The HTML "instant-tap" overlay already captured the gesture
        // so we skip waitForGesture and start cinematic immediately
      }

      // Initialize WebGL
      this.initScene();
      this.animate();

      if (this.firstTime) {
        void this.runCinematic();
      } else {
        if (this.logoElement) this.logoElement.style.opacity = '1';
      }
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.stopAudio();
    this.cleanup();
  }

  // ── Cinematic intro — first-time players only ─────────────────────────────

  private async runCinematic(): Promise<void> {
    console.log('[Portal] Cinematic starting (gesture already captured by HTML tap)');

    // Non-blocking fullscreen + landscape
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen().catch(() => {});
      }
    } catch { /* */ }
    try { (screen.orientation as any).lock('landscape').catch(() => {}); } catch { /* */ }

    // AudioContext — user already tapped via the HTML overlay
    this.audioCtx = new AudioContext();
    try { await this.audioCtx.resume(); } catch { /* */ }
    console.log('[Portal] AudioContext:', this.audioCtx.state);

    // Start music immediately (don't wait for it)
    this.startMusic();

    // Start revealing immediately — show something right away
    this.driveReveal(0.15, 2.0);
    console.log('[Portal] Phase 1: Music + stars emerging');
    await this.wait(1500);
    if (this.disposed) return;

    // PHASE 2: The Call — stars appear, Emily speaks
    console.log('[Portal] Phase 2: The Call');
    this.driveReveal(0.3, 4.0);
    await this.playVoice(CINEMATIC_LINES[0]); // "Have you ever wondered..."
    if (this.disposed) return;

    await this.wait(1200);
    if (this.disposed) return;

    this.driveReveal(0.5, 3.0);
    await this.playVoice(CINEMATIC_LINES[1]); // "Not what someone told you..."
    if (this.disposed) return;

    await this.wait(800);
    if (this.disposed) return;

    // PHASE 3: The Promise — portal ring forms
    console.log('[Portal] Phase 3: The Promise');
    this.driveReveal(0.7, 3.0);
    await this.playVoice(CINEMATIC_LINES[2]); // "This is the Nexus..."
    if (this.disposed) return;

    await this.wait(600);
    if (this.disposed) return;

    this.driveReveal(0.85, 4.0);
    await this.playVoice(CINEMATIC_LINES[3]); // "Here, every question you ask..."
    if (this.disposed) return;

    await this.wait(800);
    if (this.disposed) return;

    // PHASE 4: The Invitation — full reveal + logo appears
    console.log('[Portal] Phase 4: The Invitation');
    this.driveReveal(1.0, 3.0);

    // Nexus Academy logo fades in as portal fully reveals
    if (this.logoElement) this.logoElement.style.opacity = '1';

    await this.playVoice(CINEMATIC_LINES[4]); // "There are no grades here..."
    if (this.disposed) return;

    await this.wait(1000);
    if (this.disposed) return;

    await this.playVoice(CINEMATIC_LINES[5]); // "Step through..."
    if (this.disposed) return;

    console.log('[Portal] Cinematic complete — portal ready');

    // Mark intro as seen
    try { localStorage.setItem('nexus_intro_seen', '1'); } catch { /* ignore */ }

    // Portal is now clickable
    this.ready = true;
    if (this.overlay) this.overlay.style.cursor = 'pointer';
    if (this.tapPrompt) {
      this.tapPrompt.textContent = '✦ Tap anywhere to enter ✦';
      this.tapPrompt.style.opacity = '1';
    }
  }

  private startMusic(): void {
    try {
      this.musicElement = new Audio(MUSIC.portal_ambient);
      this.musicElement.loop = true;
      this.musicElement.volume = 0;
      void this.musicElement.play().catch(() => { /* autoplay blocked */ });
      this.fadeMusic(0.3, 3000);
    } catch { /* music not critical */ }
  }

  private fadeMusic(target: number, durationMs: number): void {
    if (!this.musicElement) return;
    const start = this.musicElement.volume;
    const startTime = performance.now();
    const tick = () => {
      if (!this.musicElement || this.disposed) return;
      const t = Math.min(1, (performance.now() - startTime) / durationMs);
      this.musicElement.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  private async playVoice(url: string): Promise<void> {
    if (!this.audioCtx || this.disposed) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      await new Promise<void>((resolve) => {
        if (this.disposed || !this.audioCtx) { resolve(); return; }
        const source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);
        this.currentSource = source;
        source.onended = () => {
          this.currentSource = null;
          resolve();
        };
        source.start();
      });
    } catch (e) {
      console.warn('[Portal] Voice playback failed:', url, e);
      await this.wait(3000);
    }
  }

  private driveReveal(target: number, durationSec: number): void {
    const delta = target - this.reveal;
    this.targetReveal = target;
    this.revealSpeed = delta / Math.max(durationSec, 0.01);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private stopAudio(): void {
    try { this.currentSource?.stop(); } catch { /* ignore */ }
    this.currentSource = null;
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.src = '';
      this.musicElement = null;
    }
    if (this.audioCtx) {
      void this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  // ── DOM — minimal, just the canvas and a11y ──────────────────────────────

  private buildDOM(): void {
    const overlay = document.createElement('div');
    overlay.id = 'portal-screen';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Welcome to Nexus Academy');
    overlay.tabIndex = 0;
    overlay.style.cursor = 'pointer';

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

    // Visible tap prompt
    const prompt = document.createElement('div');
    prompt.id = 'portal-tap-prompt';
    prompt.style.cssText = `
      position: absolute; bottom: 15%; left: 0; right: 0;
      text-align: center; z-index: 5; pointer-events: none;
      font-family: 'Nunito', sans-serif; font-size: 1.1rem;
      color: rgba(255,255,255,0.8); letter-spacing: 0.1em;
      animation: pulse-glow 2s ease-in-out infinite;
    `;
    prompt.textContent = '✦ Tap anywhere to enter ✦';
    // Hide until ready
    prompt.style.opacity = '0';
    prompt.style.transition = 'opacity 0.8s ease';
    overlay.appendChild(prompt);
    this.tapPrompt = prompt;

    // Nexus Academy logo — your original chrome metallic text with transparent bg
    const logo = document.createElement('div');
    logo.id = 'portal-logo';
    logo.style.cssText = `
      position: absolute; top: 25%; left: 0; right: 0; transform: translateY(-50%);
      text-align: center; z-index: 5; pointer-events: none;
      opacity: 0; transition: opacity 2s ease;
    `;
    const logoImg = document.createElement('img');
    logoImg.src = '/nexus-text-transparent.png';
    logoImg.alt = 'Nexus Academy';
    logoImg.style.cssText = `
      max-width: min(80%, 500px); height: auto;
      filter: drop-shadow(0 0 20px rgba(34,211,238,0.5)) drop-shadow(0 0 40px rgba(167,139,250,0.3));
    `;
    logo.appendChild(logoImg);
    overlay.appendChild(logo);
    this.logoElement = logo;

    // Click/tap anywhere — request fullscreen + enter portal
    const enter = () => {
      // Request fullscreen on first interaction (hides address bar)
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => { /* ignore */ });
      }
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

    // Fade music out during flythrough
    this.fadeMusic(0, FLY_DURATION * 1000);

    if (!this.renderer) setTimeout(() => this.finishTransition(), 100);
  }

  private finishTransition(): void {
    this.stopAudio();
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

  private initScene(): void {
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

    // Fullscreen quad — pure procedural portal shader
    this.portalMaterial = createGalaxyPortalMaterial();
    this.portalMaterial.uniforms.uResolution.value.set(w, h);
    this.portalMaterial.uniforms.uReveal.value = this.reveal;
    const quad = new THREE.PlaneGeometry(2, 2);
    this.portalMesh = new THREE.Mesh(quad, this.portalMaterial);
    this.scene.add(this.portalMesh);

    this.lastFrameTime = performance.now();
    window.addEventListener('resize', this.onResize);
  }

  // ── Animation ────────────────────────────────────────────────────────────

  private animate = (): void => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.renderer || !this.scene || !this.camera || !this.portalMaterial) return;

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    const t = (now - this.startTime) / 1000;

    // Update shader
    this.portalMaterial.uniforms.uTime.value = t;

    // Reveal animation (cinematic fade-in)
    if (this.revealSpeed > 0 && this.reveal < this.targetReveal) {
      this.reveal = Math.min(this.targetReveal, this.reveal + this.revealSpeed * dt);
    } else if (this.revealSpeed < 0 && this.reveal > this.targetReveal) {
      this.reveal = Math.max(this.targetReveal, this.reveal + this.revealSpeed * dt);
    }
    this.portalMaterial.uniforms.uReveal.value = this.reveal;

    // Spaghettification — starts at 2.5s, builds gradually (only when fully revealed)
    if (this.reveal >= 1.0) {
      const warpT = Math.max(0, (t - 2.5) / 4);
      this.portalMaterial.uniforms.uWarp.value = Math.min(warpT, 1.0);
    }

    // Screen becomes clickable (returning players: time-based)
    if (!this.firstTime && !this.ready && t >= T_PROMPT_IN) {
      this.ready = true;
      if (this.overlay) this.overlay.style.cursor = 'pointer';
      if (this.tapPrompt) this.tapPrompt.style.opacity = '1';
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
