// Companion picker — cinematic full-screen carousel for choosing your
// companion.  Shown after the portal gateway dissolves.  Player enters their
// name, then swipes / arrows through a one-at-a-time carousel of 3D companion
// models with auto-playing voice introductions.
//
// Flow:  Portal → Name Entry → Companion Picker → Game World

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { COMPANION_LIST } from '../core/registry.js';
import type { CompanionDef } from '../core/registry.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Picker-specific view of companion data
// ---------------------------------------------------------------------------

interface PickerCompanion {
  id: string;
  emoji: string;
  name: string;
  description: string;
  modelPath: string;
  voicePath: string;
  color: number;
  accentColor: number;
}

function toPickerCompanion(c: CompanionDef): PickerCompanion {
  return {
    id: c.id, emoji: c.emoji, name: c.name,
    description: `${c.title} — ${c.description}`,
    modelPath: c.modelPath, voicePath: c.introVoicePath,
    color: c.color, accentColor: c.accentColor,
  };
}

const COMPANIONS = COMPANION_LIST.map(toPickerCompanion);

const PARTICLE_COUNT = 100;
const SWIPE_THRESHOLD = 50;

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface CompanionPickerResult {
  name: string;
  companionId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class CompanionPicker implements Disposable {
  private overlay: HTMLElement | null = null;
  private disposed = false;
  private resolveSelection: ((result: CompanionPickerResult) => void) | null = null;

  // Carousel state
  private currentIndex = 0;
  private transitioning = false;

  // 3D model preview (single shared renderer)
  private modelCanvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private models: (THREE.Group | null)[] = [];
  private modelBaseY: number[] = [];
  private animId = 0;
  private startTime = 0;

  // Background particles
  private bgCanvas: HTMLCanvasElement | null = null;
  private bgRenderer: THREE.WebGLRenderer | null = null;
  private bgScene: THREE.Scene | null = null;
  private bgCamera: THREE.PerspectiveCamera | null = null;
  private bgParticles: THREE.Points | null = null;
  private bgAnimId = 0;

  // Audio
  private audioCtx: AudioContext | null = null;
  private voiceBuffers = new Map<string, AudioBuffer>();
  private currentAudioSource: AudioBufferSourceNode | null = null;

  // Touch / mouse drag tracking
  private touchStartX = 0;
  private touchCurrentX = 0;
  private isDragging = false;

  // Bound event handlers (so we can remove them later)
  private readonly boundKeyDown = this.handleKeyDown.bind(this);
  private readonly boundMouseMove = this.handleMouseMove.bind(this);
  private readonly boundMouseUp = this.handleMouseUp.bind(this);
  private readonly boundResize = this.handleResize.bind(this);

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Display the companion picker overlay.  Returns a promise that resolves
   * when the player has entered a name and chosen a companion.
   */
  async show(): Promise<CompanionPickerResult> {
    if (this.disposed) throw new Error('CompanionPicker has been disposed');

    return new Promise<CompanionPickerResult>((resolve) => {
      this.resolveSelection = resolve;
      this.overlay = this.buildOverlay();
      document.body.appendChild(this.overlay);

      this.initScene();
      this.initBackground();
      this.loadAllModels();
      this.loadAllVoices();

      this.startTime = performance.now();
      this.animate();
      this.animateBackground();

      // Focus name input for keyboard users
      const nameInput = this.overlay.querySelector<HTMLInputElement>('#cp-name');
      nameInput?.focus();

      // Auto-play the first companion voice after a brief delay
      setTimeout(() => this.playVoice(this.currentIndex), 600);
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    cancelAnimationFrame(this.animId);
    cancelAnimationFrame(this.bgAnimId);

    this.stopCurrentVoice();
    void this.audioCtx?.close();

    // 3D cleanup
    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.renderer?.dispose();

    // Background cleanup
    if (this.bgParticles) {
      this.bgParticles.geometry.dispose();
      (this.bgParticles.material as THREE.Material).dispose();
    }
    this.bgRenderer?.dispose();

    // Event listeners
    document.removeEventListener('keydown', this.boundKeyDown);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    window.removeEventListener('resize', this.boundResize);

    this.overlay?.remove();
    this.overlay = null;
    this.resolveSelection = null;
  }

  // -----------------------------------------------------------------------
  // DOM construction
  // -----------------------------------------------------------------------

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'companion-picker';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Choose your companion');

    // Background particle canvas
    const bgCanvas = document.createElement('canvas');
    bgCanvas.className = 'cp-bg-canvas';
    bgCanvas.setAttribute('aria-hidden', 'true');
    overlay.appendChild(bgCanvas);
    this.bgCanvas = bgCanvas;

    // Screen-reader announcement
    const sr = document.createElement('div');
    sr.className = 'sr-only';
    sr.setAttribute('role', 'status');
    sr.setAttribute('aria-live', 'polite');
    sr.textContent = 'Welcome to Nexus Academy. Enter your name and choose a companion.';
    overlay.appendChild(sr);

    // Main content wrapper
    const content = document.createElement('div');
    content.className = 'cp-content';

    // ---- Name entry ----
    const nameSection = document.createElement('div');
    nameSection.className = 'cp-name-section';

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'cp-name');
    nameLabel.textContent = 'What should your companion call you?';
    nameSection.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'cp-name';
    nameInput.className = 'cp-name-input';
    nameInput.placeholder = 'Enter your name';
    nameInput.maxLength = 30;
    nameInput.autocomplete = 'given-name';
    nameSection.appendChild(nameInput);

    content.appendChild(nameSection);

    // ---- Carousel ----
    const carouselSection = document.createElement('div');
    carouselSection.className = 'cp-carousel-section';

    const heading = document.createElement('h2');
    heading.className = 'cp-heading';
    heading.textContent = 'Choose Your Companion';
    carouselSection.appendChild(heading);

    // Viewport (arrows + model)
    const viewport = document.createElement('div');
    viewport.className = 'cp-viewport';
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-roledescription', 'carousel');
    viewport.setAttribute('aria-label', 'Companion carousel');

    const leftArrow = document.createElement('button');
    leftArrow.className = 'cp-arrow cp-arrow-left';
    leftArrow.setAttribute('aria-label', 'Previous companion');
    leftArrow.textContent = '\u2039';
    leftArrow.addEventListener('click', () => this.navigate(-1));
    viewport.appendChild(leftArrow);

    const modelArea = document.createElement('div');
    modelArea.className = 'cp-model-area';

    const modelCanvas = document.createElement('canvas');
    modelCanvas.className = 'cp-model-canvas';
    modelCanvas.setAttribute('aria-hidden', 'true');
    modelArea.appendChild(modelCanvas);
    this.modelCanvas = modelCanvas;

    const emojiFallback = document.createElement('div');
    emojiFallback.className = 'cp-emoji-fallback';
    emojiFallback.setAttribute('aria-hidden', 'true');
    emojiFallback.textContent = COMPANIONS[0]!.emoji;
    modelArea.appendChild(emojiFallback);

    viewport.appendChild(modelArea);

    const rightArrow = document.createElement('button');
    rightArrow.className = 'cp-arrow cp-arrow-right';
    rightArrow.setAttribute('aria-label', 'Next companion');
    rightArrow.textContent = '\u203A';
    rightArrow.addEventListener('click', () => this.navigate(1));
    viewport.appendChild(rightArrow);

    carouselSection.appendChild(viewport);

    // Companion info
    const info = document.createElement('div');
    info.className = 'cp-info';
    info.setAttribute('aria-live', 'polite');

    const companionName = document.createElement('h3');
    companionName.className = 'cp-companion-name';
    companionName.textContent = COMPANIONS[0]!.name;
    info.appendChild(companionName);

    const companionDesc = document.createElement('p');
    companionDesc.className = 'cp-companion-desc';
    companionDesc.textContent = COMPANIONS[0]!.description;
    info.appendChild(companionDesc);

    carouselSection.appendChild(info);

    // Dots
    const dots = document.createElement('div');
    dots.className = 'cp-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Companion selection');

    for (let i = 0; i < COMPANIONS.length; i++) {
      const dot = document.createElement('button');
      dot.className = 'cp-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', COMPANIONS[i]!.name);
      dot.addEventListener('click', () => this.goTo(i));
      dots.appendChild(dot);
    }
    carouselSection.appendChild(dots);

    // Choose button
    const chooseBtn = document.createElement('button');
    chooseBtn.className = 'cp-choose-btn';
    chooseBtn.textContent = `Choose ${COMPANIONS[0]!.name}`;
    chooseBtn.setAttribute('aria-label', `Choose ${COMPANIONS[0]!.name} as your companion`);
    chooseBtn.addEventListener('click', () => this.confirmSelection());
    carouselSection.appendChild(chooseBtn);

    // Error message
    const errorEl = document.createElement('p');
    errorEl.className = 'cp-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'assertive');
    carouselSection.appendChild(errorEl);

    content.appendChild(carouselSection);
    overlay.appendChild(content);

    // ---- Input events ----
    viewport.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    viewport.addEventListener('touchend', this.handleTouchEnd);
    viewport.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);

    this.injectStyles();
    return overlay;
  }

  // -----------------------------------------------------------------------
  // Carousel navigation
  // -----------------------------------------------------------------------

  private navigate(direction: number): void {
    const next = this.currentIndex + direction;
    if (next >= 0 && next < COMPANIONS.length) this.goTo(next);
  }

  private goTo(index: number): void {
    if (index === this.currentIndex || this.transitioning) return;
    if (index < 0 || index >= COMPANIONS.length) return;

    this.transitioning = true;
    this.currentIndex = index;

    // Swap model visibility
    for (let i = 0; i < this.models.length; i++) {
      const m = this.models[i];
      if (m) m.visible = i === index;
    }

    const c = COMPANIONS[index]!;

    // Update text
    const nameEl = this.overlay?.querySelector<HTMLElement>('.cp-companion-name');
    const descEl = this.overlay?.querySelector<HTMLElement>('.cp-companion-desc');
    const emojiEl = this.overlay?.querySelector<HTMLElement>('.cp-emoji-fallback');
    const btn = this.overlay?.querySelector<HTMLButtonElement>('.cp-choose-btn');

    if (nameEl) nameEl.textContent = c.name;
    if (descEl) descEl.textContent = c.description;
    if (emojiEl) emojiEl.textContent = c.emoji;
    if (btn) {
      btn.textContent = `Choose ${c.name}`;
      btn.setAttribute('aria-label', `Choose ${c.name} as your companion`);
    }

    // Update dots
    this.overlay?.querySelectorAll<HTMLElement>('.cp-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Arrow visibility at edges
    const left = this.overlay?.querySelector<HTMLElement>('.cp-arrow-left');
    const right = this.overlay?.querySelector<HTMLElement>('.cp-arrow-right');
    if (left) left.style.visibility = index === 0 ? 'hidden' : 'visible';
    if (right) right.style.visibility = index === COMPANIONS.length - 1 ? 'hidden' : 'visible';

    this.playVoice(index);

    setTimeout(() => { this.transitioning = false; }, 300);
  }

  private confirmSelection(): void {
    const nameInput = this.overlay?.querySelector<HTMLInputElement>('#cp-name');
    const errorEl = this.overlay?.querySelector<HTMLElement>('.cp-error');
    const name = nameInput?.value.trim() ?? '';

    if (!name) {
      if (errorEl) errorEl.textContent = 'Please enter your name to get started.';
      nameInput?.focus();
      return;
    }

    if (errorEl) errorEl.textContent = '';
    const companion = COMPANIONS[this.currentIndex]!;
    const result: CompanionPickerResult = { name, companionId: companion.id };

    // Capture resolver before dispose clears it
    const resolve = this.resolveSelection;
    this.dispose();
    resolve?.(result);
  }

  // -----------------------------------------------------------------------
  // Keyboard / touch / mouse handlers
  // -----------------------------------------------------------------------

  private handleKeyDown(e: KeyboardEvent): void {
    // Don't intercept when typing in the name input
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.navigate(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.navigate(1);
        break;
      case 'Enter':
        e.preventDefault();
        this.confirmSelection();
        break;
    }
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    this.touchStartX = e.touches[0]!.clientX;
    this.touchCurrentX = this.touchStartX;
    this.isDragging = true;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (!this.isDragging || e.touches.length !== 1) return;
    this.touchCurrentX = e.touches[0]!.clientX;
  };

  private handleTouchEnd = (): void => {
    if (!this.isDragging) return;
    this.isDragging = false;
    const dx = this.touchCurrentX - this.touchStartX;
    if (dx > SWIPE_THRESHOLD) this.navigate(-1);
    else if (dx < -SWIPE_THRESHOLD) this.navigate(1);
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).closest('button')) return;
    this.touchStartX = e.clientX;
    this.touchCurrentX = this.touchStartX;
    this.isDragging = true;
    e.preventDefault();
  };

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    this.touchCurrentX = e.clientX;
  }

  private handleMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const dx = this.touchCurrentX - this.touchStartX;
    if (dx > SWIPE_THRESHOLD) this.navigate(-1);
    else if (dx < -SWIPE_THRESHOLD) this.navigate(1);
  }

  private handleResize(): void {
    // Resize model canvas
    if (this.renderer && this.modelCanvas) {
      const size = this.computeCanvasSize();
      this.renderer.setSize(size, size);
    }
    // Resize background canvas
    if (this.bgRenderer && this.bgCamera) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.bgRenderer.setSize(w, h);
      this.bgCamera.aspect = w / h;
      this.bgCamera.updateProjectionMatrix();
    }
  }

  // -----------------------------------------------------------------------
  // 3D scene — companion model preview
  // -----------------------------------------------------------------------

  private computeCanvasSize(): number {
    return Math.min(window.innerWidth * 0.65, 380);
  }

  private initScene(): void {
    if (!this.modelCanvas) return;

    const size = this.computeCanvasSize();

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.modelCanvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      return; // No WebGL — emoji fallback stays visible
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(size, size);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(0, 1.0, 3.5);
    this.camera.lookAt(0, 0.5, 0);

    // Three-point lighting with project accent colours
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 5, 3);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x22d3ee, 0.4); // Frost accent
    rim.position.set(-2, 2, -3);
    this.scene.add(rim);

    const fill = new THREE.DirectionalLight(0xa78bfa, 0.3); // Aurora accent
    fill.position.set(-3, 1, 2);
    this.scene.add(fill);

    // Hide the emoji fallback since WebGL is available
    const fb = this.overlay?.querySelector<HTMLElement>('.cp-emoji-fallback');
    if (fb) fb.style.display = 'none';
  }

  private loadAllModels(): void {
    if (!this.scene) return;
    const loader = new GLTFLoader();

    for (let i = 0; i < COMPANIONS.length; i++) {
      const companion = COMPANIONS[i]!;
      this.models[i] = null;
      this.modelBaseY[i] = 0;

      loader.load(
        companion.modelPath,
        (gltf) => {
          if (this.disposed || !this.scene) return;

          const model = gltf.scene;

          // Normalise size so all companions appear roughly the same scale
          const box = new THREE.Box3().setFromObject(model);
          const dims = new THREE.Vector3();
          box.getSize(dims);
          const scale = 1.8 / Math.max(dims.x, dims.y, dims.z);
          model.scale.setScalar(scale);

          // Re-centre at origin, sitting on y = 0
          box.setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);
          model.position.set(-center.x, -box.min.y, -center.z);

          this.modelBaseY[i] = model.position.y;
          model.visible = i === this.currentIndex;
          this.models[i] = model;
          this.scene!.add(model);
        },
        undefined,
        (err) => {
          console.warn(`[CompanionPicker] Model load failed (${companion.name}):`, err);
        },
      );
    }
  }

  // -----------------------------------------------------------------------
  // Audio — voice intro clips
  // -----------------------------------------------------------------------

  private loadAllVoices(): void {
    try {
      this.audioCtx = new AudioContext();
    } catch {
      return;
    }

    for (const companion of COMPANIONS) {
      fetch(companion.voicePath)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => this.audioCtx!.decodeAudioData(buf))
        .then((decoded) => { this.voiceBuffers.set(companion.id, decoded); })
        .catch((err) => {
          console.warn(`[CompanionPicker] Voice load failed (${companion.name}):`, err);
        });
    }
  }

  private playVoice(index: number): void {
    this.stopCurrentVoice();

    const companion = COMPANIONS[index];
    if (!companion || !this.audioCtx) return;

    const buffer = this.voiceBuffers.get(companion.id);
    if (!buffer) {
      // Not loaded yet — retry once shortly
      const retryTimer = setTimeout(() => {
        if (!this.disposed && this.currentIndex === index) this.playVoice(index);
      }, 400);
      // Clean up timer if we dispose first
      if (this.disposed) clearTimeout(retryTimer);
      return;
    }

    if (this.audioCtx.state === 'suspended') void this.audioCtx.resume();

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start();
    this.currentAudioSource = source;
    source.onended = () => {
      if (this.currentAudioSource === source) this.currentAudioSource = null;
    };
  }

  private stopCurrentVoice(): void {
    if (this.currentAudioSource) {
      try { this.currentAudioSource.stop(); } catch { /* already stopped */ }
      this.currentAudioSource = null;
    }
  }

  // -----------------------------------------------------------------------
  // Animation loops
  // -----------------------------------------------------------------------

  private animate = (): void => {
    if (this.disposed) return;
    this.animId = requestAnimationFrame(this.animate);
    if (!this.renderer || !this.scene || !this.camera) return;

    const elapsed = (performance.now() - this.startTime) / 1000;

    const model = this.models[this.currentIndex];
    if (model) {
      model.rotation.y = elapsed * 0.4;
      model.position.y = this.modelBaseY[this.currentIndex]! + Math.sin(elapsed * 1.2) * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private animateBackground = (): void => {
    if (this.disposed || !this.bgRenderer || !this.bgScene || !this.bgCamera || !this.bgParticles) return;
    this.bgAnimId = requestAnimationFrame(this.animateBackground);

    const posAttr = this.bgParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const vels = this.bgParticles.geometry.userData.velocities as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = posAttr.getX(i) + vels[i * 3]!;
      let y = posAttr.getY(i) + vels[i * 3 + 1]!;
      const z = posAttr.getZ(i) + vels[i * 3 + 2]!;

      if (y > 4) { y = -4; x = (Math.random() - 0.5) * 12; }
      if (x > 6) x = -6;
      if (x < -6) x = 6;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    const elapsed = (performance.now() - this.startTime) / 1000;
    (this.bgParticles.material as THREE.PointsMaterial).opacity =
      0.35 + 0.15 * Math.sin(elapsed * 0.4);

    this.bgRenderer.render(this.bgScene, this.bgCamera);
  };

  // -----------------------------------------------------------------------
  // Background particles
  // -----------------------------------------------------------------------

  private initBackground(): void {
    if (!this.bgCanvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    try {
      this.bgRenderer = new THREE.WebGLRenderer({
        canvas: this.bgCanvas,
        antialias: false,
        alpha: true,
      });
    } catch {
      return;
    }

    this.bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.bgRenderer.setSize(w, h);
    this.bgRenderer.setClearColor(0x000000, 0);

    this.bgScene = new THREE.Scene();
    this.bgCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.bgCamera.position.set(0, 0, 5);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    const palette = [
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xa78bfa), // Aurora
      new THREE.Color(0x22d3ee), // Frost
      new THREE.Color(0xffdab9), // Sunrise
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;

      velocities[i * 3]     = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = 0.002 + Math.random() * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      const c = palette[Math.floor(Math.random() * palette.length)]!;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.bgParticles = new THREE.Points(geo, mat);
    this.bgScene.add(this.bgParticles);
  }

  // -----------------------------------------------------------------------
  // Styles (injected once)
  // -----------------------------------------------------------------------

  private injectStyles(): void {
    if (document.getElementById('cp-styles')) return;

    const style = document.createElement('style');
    style.id = 'cp-styles';
    style.textContent = `
      #companion-picker {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: radial-gradient(ellipse at center, #0a0a1a 0%, #000 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        color: #e0e0e0;
        overflow: hidden;
      }

      #companion-picker .sr-only {
        position: absolute;
        width: 1px; height: 1px;
        margin: -1px; padding: 0;
        overflow: hidden;
        clip: rect(0,0,0,0);
        border: 0;
      }

      .cp-bg-canvas {
        position: absolute;
        inset: 0;
        width: 100%; height: 100%;
        pointer-events: none;
      }

      .cp-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.2rem;
        max-width: 520px;
        width: 92%;
        padding: 1rem;
        max-height: 100vh;
        overflow-y: auto;
      }

      /* ---- Name entry ---- */
      .cp-name-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
      }

      .cp-name-section label {
        font-size: 1.05rem;
        color: #a78bfa;
        font-weight: 500;
      }

      .cp-name-input {
        width: 100%;
        max-width: 320px;
        padding: 0.7rem 1rem;
        border: 2px solid rgba(167,139,250,0.3);
        border-radius: 12px;
        background: rgba(255,255,255,0.05);
        color: #fff;
        font-size: 1.1rem;
        text-align: center;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .cp-name-input::placeholder { color: rgba(255,255,255,0.3); }
      .cp-name-input:focus {
        border-color: #a78bfa;
        box-shadow: 0 0 20px rgba(167,139,250,0.25);
      }

      /* ---- Carousel ---- */
      .cp-carousel-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
        width: 100%;
      }

      .cp-heading {
        font-size: 1.25rem;
        font-weight: 600;
        color: #22d3ee;
        margin: 0;
        letter-spacing: 0.02em;
      }

      .cp-viewport {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        user-select: none;
        touch-action: pan-y;
        cursor: grab;
      }
      .cp-viewport:active { cursor: grabbing; }

      .cp-arrow {
        flex-shrink: 0;
        width: 44px; height: 44px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.08);
        color: #22d3ee;
        font-size: 1.8rem;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, transform 0.15s;
      }
      .cp-arrow:hover { background: rgba(34,211,238,0.15); transform: scale(1.1); }
      .cp-arrow:active { transform: scale(0.95); }
      .cp-arrow-left { visibility: hidden; }

      .cp-model-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 180px;
        aspect-ratio: 1;
        max-width: 380px;
        margin: 0 auto;
      }

      .cp-model-canvas {
        width: 100%; height: 100%;
        border-radius: 16px;
      }

      .cp-emoji-fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5.5rem;
        pointer-events: none;
      }

      /* ---- Companion info ---- */
      .cp-info {
        text-align: center;
        min-height: 3.5rem;
      }

      .cp-companion-name {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.25rem;
        color: #fff;
      }

      .cp-companion-desc {
        font-size: 0.95rem;
        color: rgba(255,255,255,0.7);
        margin: 0;
        font-style: italic;
        line-height: 1.4;
      }

      /* ---- Dots ---- */
      .cp-dots {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .cp-dot {
        width: 12px; height: 12px;
        border: 2px solid rgba(167,139,250,0.4);
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        padding: 0;
        transition: background 0.2s, border-color 0.2s, transform 0.2s;
      }
      .cp-dot.active {
        background: #a78bfa;
        border-color: #a78bfa;
        transform: scale(1.2);
      }
      .cp-dot:hover:not(.active) {
        border-color: #a78bfa;
        background: rgba(167,139,250,0.2);
      }

      /* ---- Choose button ---- */
      .cp-choose-btn {
        padding: 0.8rem 2.5rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #a78bfa, #22d3ee);
        color: #000;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        letter-spacing: 0.03em;
        transition: transform 0.15s, box-shadow 0.2s;
      }
      .cp-choose-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 30px rgba(167,139,250,0.4), 0 0 60px rgba(34,211,238,0.2);
      }
      .cp-choose-btn:active { transform: scale(0.97); }

      /* ---- Error ---- */
      .cp-error {
        color: #ff6b6b;
        font-size: 0.9rem;
        min-height: 1.2rem;
        margin: 0;
      }

      /* ---- Responsive tweaks ---- */
      @media (max-height: 700px) {
        .cp-content { gap: 0.6rem; }
        .cp-model-area { min-height: 140px; }
        .cp-heading { font-size: 1.05rem; }
      }
    `;
    document.head.appendChild(style);
  }
}
