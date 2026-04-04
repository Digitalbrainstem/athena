// Profile screen — accessible HTML overlay for creating/selecting profiles.
// Shown after the portal gateway dissolves.  Immersive dark background with
// warm ambient Three.js particles floating behind the form.  Companion picker
// shows 3D model previews with personality descriptions.

import * as THREE from 'three';
import type { NexusCore, Profile, MasteryTier } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Companion data with personality descriptions
// ---------------------------------------------------------------------------

interface CompanionInfo {
  id: string;
  emoji: string;
  label: string;
  description: string;
  color: number;
  accentColor: number;
}

const COMPANION_OPTIONS: CompanionInfo[] = [
  { id: 'fox',    emoji: '🦊', label: 'Fox',    description: 'Curious and quick, always sniffing out adventure',       color: 0xff6b2b, accentColor: 0xffa040 },
  { id: 'owl',    emoji: '🦉', label: 'Owl',    description: 'Wise and patient, sees what others miss',               color: 0x8b6914, accentColor: 0xd4a574 },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit', description: 'Gentle and kind, makes everything feel safe',           color: 0xf5f0e8, accentColor: 0xffc0cb },
  { id: 'bear',   emoji: '🐻', label: 'Bear',   description: 'Steady and strong, always by your side',                color: 0x8b4513, accentColor: 0xd2691e },
  { id: 'cat',    emoji: '🐱', label: 'Cat',    description: 'Clever and playful, finds the fun in everything',       color: 0x555555, accentColor: 0x22d3ee },
  { id: 'dragon', emoji: '🐉', label: 'Dragon', description: 'Bold and brave, never afraid to try',                   color: 0x228b22, accentColor: 0xffd700 },
];

const AGE_RANGES: { value: string; label: string; tier: MasteryTier }[] = [
  { value: '2-5', label: '2–5 years', tier: 'foundation' },
  { value: '6-10', label: '6–10 years', tier: 'discovery' },
  { value: '11-14', label: '11–14 years', tier: 'builder' },
  { value: '15-18', label: '15–18 years', tier: 'innovator' },
  { value: '18+', label: '18+ years', tier: 'creator' },
  { value: 'none', label: "I'd rather not say", tier: 'foundation' },
];

const AMBIENT_PARTICLE_COUNT = 120;

export type ProfileScreenResult = { profileId: string };

export class ProfileScreen implements Disposable {
  private overlay: HTMLElement | null = null;
  private disposed = false;
  private resolveSelection: ((result: ProfileScreenResult) => void) | null = null;

  // 3D companion preview state
  private previewRenderers: THREE.WebGLRenderer[] = [];
  private previewScenes: THREE.Scene[] = [];
  private previewCameras: THREE.PerspectiveCamera[] = [];
  private previewMeshes: THREE.Group[] = [];
  private previewAnimId = 0;
  private previewStartTime = 0;

  // Ambient background particles
  private bgCanvas: HTMLCanvasElement | null = null;
  private bgRenderer: THREE.WebGLRenderer | null = null;
  private bgScene: THREE.Scene | null = null;
  private bgCamera: THREE.PerspectiveCamera | null = null;
  private bgParticles: THREE.Points | null = null;
  private bgAnimId = 0;
  private bgStartTime = 0;

  /**
   * Show the profile screen overlay and wait for the user to select or create a profile.
   * Returns the selected profile id.
   */
  async show(core: NexusCore): Promise<ProfileScreenResult> {
    if (this.disposed) throw new Error('ProfileScreen has been disposed');

    const profiles = await core.listProfiles();

    return new Promise<ProfileScreenResult>((resolve) => {
      this.resolveSelection = resolve;
      this.overlay = this.buildOverlay(profiles, core);
      document.body.appendChild(this.overlay);

      // Ambient background particles
      this.initBackgroundParticles();

      // Focus the first interactive element for keyboard users
      const firstFocusable = this.overlay.querySelector<HTMLElement>(
        'button, input, [tabindex="0"]',
      );
      firstFocusable?.focus();
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopPreviews();
    this.stopBackground();
    this.overlay?.remove();
    this.overlay = null;
    this.resolveSelection = null;
  }

  private stopPreviews(): void {
    cancelAnimationFrame(this.previewAnimId);
    for (const r of this.previewRenderers) r.dispose();
    for (const scene of this.previewScenes) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    this.previewRenderers = [];
    this.previewScenes = [];
    this.previewCameras = [];
    this.previewMeshes = [];
  }

  private stopBackground(): void {
    cancelAnimationFrame(this.bgAnimId);
    if (this.bgParticles) {
      this.bgParticles.geometry.dispose();
      (this.bgParticles.material as THREE.Material).dispose();
    }
    this.bgRenderer?.dispose();
    this.bgCanvas = null;
    this.bgRenderer = null;
    this.bgScene = null;
    this.bgCamera = null;
    this.bgParticles = null;
  }

  // ---------------------------------------------------------------------------
  // DOM builders
  // ---------------------------------------------------------------------------

  private buildOverlay(profiles: Profile[], core: NexusCore): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'profile-screen';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Profile selection');

    // Background canvas for ambient particles
    const bgCanvas = document.createElement('canvas');
    bgCanvas.className = 'profile-bg-canvas';
    bgCanvas.setAttribute('aria-hidden', 'true');
    overlay.appendChild(bgCanvas);
    this.bgCanvas = bgCanvas;

    // Screen-reader welcome
    const srAnnounce = document.createElement('div');
    srAnnounce.className = 'sr-only';
    srAnnounce.setAttribute('role', 'status');
    srAnnounce.setAttribute('aria-live', 'polite');
    srAnnounce.textContent = 'Welcome to Nexus Academy. Create a new player or select an existing one.';
    overlay.appendChild(srAnnounce);

    const title = document.createElement('h1');
    title.textContent = 'Nexus Academy';
    title.id = 'profile-screen-title';
    overlay.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'profile-subtitle';
    subtitle.textContent = 'Choose your explorer';
    overlay.appendChild(subtitle);

    if (profiles.length > 0) {
      overlay.appendChild(this.buildProfileList(profiles));
    }

    overlay.appendChild(this.buildCreateForm(core));

    return overlay;
  }

  private buildProfileList(profiles: Profile[]): HTMLElement {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'existing-profiles-heading');

    const heading = document.createElement('h2');
    heading.id = 'existing-profiles-heading';
    heading.textContent = 'Your Explorers';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'profile-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Select an existing player');

    for (const profile of profiles) {
      const card = document.createElement('button');
      card.className = 'profile-card';
      card.setAttribute('role', 'option');
      card.setAttribute(
        'aria-label',
        `Play as ${profile.name}, ${profile.masteryTier} tier`,
      );
      card.dataset.profileId = profile.id;

      const avatar = document.createElement('span');
      avatar.className = 'profile-card-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      const match = COMPANION_OPTIONS.find((a) => a.id === profile.avatarData);
      avatar.textContent = match?.emoji ?? '🌟';
      card.appendChild(avatar);

      const name = document.createElement('span');
      name.className = 'profile-card-name';
      name.textContent = profile.name;
      card.appendChild(name);

      card.addEventListener('click', () => {
        this.selectProfile(profile.id);
      });

      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectProfile(profile.id);
        }
      });

      list.appendChild(card);
    }

    section.appendChild(list);
    return section;
  }

  private buildCreateForm(core: NexusCore): HTMLElement {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'create-profile-heading');
    section.className = 'create-section';

    const heading = document.createElement('h2');
    heading.id = 'create-profile-heading';
    heading.textContent = 'New Explorer';
    section.appendChild(heading);

    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'profile-name');
    nameLabel.textContent = 'Name';
    nameGroup.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'profile-name';
    nameInput.placeholder = 'Your name';
    nameInput.maxLength = 30;
    nameInput.autocomplete = 'given-name';
    nameInput.setAttribute('aria-describedby', 'name-help');
    nameGroup.appendChild(nameInput);

    const nameHelp = document.createElement('small');
    nameHelp.id = 'name-help';
    nameHelp.className = 'form-help';
    nameHelp.textContent = 'What should the companion call you?';
    nameGroup.appendChild(nameHelp);

    section.appendChild(nameGroup);

    // Age range selector
    const ageGroup = document.createElement('div');
    ageGroup.className = 'form-group';

    const ageLabel = document.createElement('label');
    ageLabel.setAttribute('for', 'profile-age');
    ageLabel.textContent = 'Age range';
    ageGroup.appendChild(ageLabel);

    const ageSelect = document.createElement('select');
    ageSelect.id = 'profile-age';
    ageSelect.setAttribute('aria-describedby', 'age-help');
    for (const opt of AGE_RANGES) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      ageSelect.appendChild(option);
    }
    ageGroup.appendChild(ageSelect);

    const ageHelp = document.createElement('small');
    ageHelp.id = 'age-help';
    ageHelp.className = 'form-help';
    ageHelp.textContent = 'Helps calibrate your starting experience';
    ageGroup.appendChild(ageHelp);

    section.appendChild(ageGroup);

    // Companion picker with 3D previews + personality descriptions
    const avatarGroup = document.createElement('div');
    avatarGroup.className = 'form-group companion-picker-group';

    const avatarLabel = document.createElement('span');
    avatarLabel.id = 'avatar-label';
    avatarLabel.textContent = 'Pick a companion';
    avatarLabel.setAttribute('role', 'presentation');
    avatarGroup.appendChild(avatarLabel);

    const avatarGrid = document.createElement('div');
    avatarGrid.className = 'avatar-grid';
    avatarGrid.setAttribute('role', 'radiogroup');
    avatarGrid.setAttribute('aria-labelledby', 'avatar-label');

    let selectedAvatar = COMPANION_OPTIONS[0]!.id;

    for (const opt of COMPANION_OPTIONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', opt.id === selectedAvatar ? 'true' : 'false');
      btn.setAttribute('aria-label', `${opt.label} — ${opt.description}`);
      btn.dataset.avatarId = opt.id;

      // 3D preview canvas
      const previewCanvas = document.createElement('canvas');
      previewCanvas.className = 'companion-preview-canvas';
      previewCanvas.width = 80;
      previewCanvas.height = 80;
      previewCanvas.setAttribute('aria-hidden', 'true');
      btn.appendChild(previewCanvas);

      // Emoji fallback (hidden when canvas works, shown in tests/no-WebGL)
      const emoji = document.createElement('span');
      emoji.className = 'avatar-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = opt.emoji;
      btn.appendChild(emoji);

      // Companion name
      const nameEl = document.createElement('span');
      nameEl.className = 'companion-name';
      nameEl.textContent = opt.label;
      btn.appendChild(nameEl);

      // Personality description
      const desc = document.createElement('span');
      desc.className = 'companion-desc';
      desc.textContent = opt.description;
      btn.appendChild(desc);

      if (opt.id === selectedAvatar) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        selectedAvatar = opt.id;
        for (const sibling of avatarGrid.querySelectorAll<HTMLElement>('.avatar-option')) {
          sibling.classList.remove('selected');
          sibling.setAttribute('aria-checked', 'false');
        }
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      });

      // Hover/focus greeting animation handled in animation loop
      btn.addEventListener('mouseenter', () => btn.classList.add('greeting'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('greeting'));
      btn.addEventListener('focus', () => btn.classList.add('greeting'));
      btn.addEventListener('blur', () => btn.classList.remove('greeting'));

      avatarGrid.appendChild(btn);

      // Set up 3D preview for this companion
      this.initCompanionPreview(previewCanvas, opt);
    }

    avatarGroup.appendChild(avatarGrid);
    section.appendChild(avatarGroup);

    // Start preview animations
    this.previewStartTime = performance.now();
    this.animatePreviews();

    // Error display
    const errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'assertive');
    section.appendChild(errorEl);

    // Create button
    const createBtn = document.createElement('button');
    createBtn.type = 'button';
    createBtn.className = 'create-btn';
    createBtn.setAttribute('aria-label', 'Create new player');
    createBtn.textContent = 'Enter the Nexus';

    createBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        errorEl.textContent = 'Please enter a name to get started.';
        nameInput.focus();
        return;
      }
      errorEl.textContent = '';
      createBtn.disabled = true;
      createBtn.textContent = 'Creating…';

      const selectedAge = AGE_RANGES.find(a => a.value === ageSelect.value);
      const tier = selectedAge?.tier ?? 'foundation';
      this.stopPreviews();
      this.createAndSelect(core, name, selectedAvatar as string, tier);
    });

    section.appendChild(createBtn);
    return section;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  private selectProfile(profileId: string): void {
    this.stopPreviews();
    this.stopBackground();
    this.overlay?.remove();
    this.overlay = null;
    this.resolveSelection?.({ profileId });
    this.resolveSelection = null;
  }

  private createAndSelect(
    core: NexusCore,
    name: string,
    avatarData: string,
    _masteryTier: MasteryTier,
  ): void {
    core
      .createProfile({ name, avatarData })
      .then((profile) => {
        this.selectProfile(profile.id);
      })
      .catch((err: unknown) => {
        console.error('[ProfileScreen] Failed to create profile:', err);
        const errorEl = this.overlay?.querySelector<HTMLElement>('.form-error');
        if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
        const btn = this.overlay?.querySelector<HTMLButtonElement>('.create-btn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Enter the Nexus';
        }
      });
  }

  // ---------------------------------------------------------------------------
  // 3D companion previews
  // ---------------------------------------------------------------------------

  private initCompanionPreview(canvas: HTMLCanvasElement, info: CompanionInfo): void {
    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(80, 80);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
      camera.position.set(0, 0.3, 2.2);
      camera.lookAt(0, 0.1, 0);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 0.8);
      key.position.set(2, 3, 2);
      scene.add(key);

      // Build a simple stylized companion shape
      const group = this.buildCompanionShape(info);
      scene.add(group);

      // Hide emoji fallback since WebGL is available
      const emojiEl = canvas.parentElement?.querySelector('.avatar-emoji');
      if (emojiEl) (emojiEl as HTMLElement).style.display = 'none';

      this.previewRenderers.push(renderer);
      this.previewScenes.push(scene);
      this.previewCameras.push(camera);
      this.previewMeshes.push(group);
    } catch {
      // WebGL not available — emoji fallback remains visible
    }
  }

  private buildCompanionShape(info: CompanionInfo): THREE.Group {
    const group = new THREE.Group();
    const main = new THREE.Color(info.color);
    const accent = new THREE.Color(info.accentColor);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: main,
      roughness: 0.5,
      metalness: 0.1,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.2,
      roughness: 0.3,
    });

    // Body — slightly squashed sphere
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 12),
      bodyMat,
    );
    body.scale.set(1, 0.9, 0.85);
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      bodyMat,
    );
    head.position.set(0, 0.5, 0);
    group.add(head);

    // Eyes — two small dark spheres
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), eyeMat);
    leftEye.position.set(-0.1, 0.55, 0.24);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), eyeMat);
    rightEye.position.set(0.1, 0.55, 0.24);
    group.add(rightEye);

    // Accent feature — varies by companion
    switch (info.id) {
      case 'fox': {
        // Pointed ears
        const earGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
        const leftEar = new THREE.Mesh(earGeo, accentMat);
        leftEar.position.set(-0.15, 0.75, 0);
        leftEar.rotation.z = 0.15;
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, accentMat);
        rightEar.position.set(0.15, 0.75, 0);
        rightEar.rotation.z = -0.15;
        group.add(rightEar);
        // Bushy tail
        const tail = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 6),
          accentMat,
        );
        tail.position.set(0, 0.05, -0.5);
        tail.scale.set(0.7, 0.7, 1.3);
        group.add(tail);
        break;
      }
      case 'owl': {
        // Wide flat ears (tufts)
        const tuftGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
        const lt = new THREE.Mesh(tuftGeo, accentMat);
        lt.position.set(-0.18, 0.78, 0);
        lt.rotation.z = 0.3;
        group.add(lt);
        const rt = new THREE.Mesh(tuftGeo, accentMat);
        rt.position.set(0.18, 0.78, 0);
        rt.rotation.z = -0.3;
        group.add(rt);
        // Beak
        const beak = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.1, 6),
          new THREE.MeshStandardMaterial({ color: 0xffa500 }),
        );
        beak.position.set(0, 0.48, 0.28);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);
        break;
      }
      case 'rabbit': {
        // Long ears
        const earGeo = new THREE.CapsuleGeometry(0.05, 0.3, 4, 8);
        const le = new THREE.Mesh(earGeo, accentMat);
        le.position.set(-0.1, 0.9, -0.05);
        le.rotation.z = 0.1;
        group.add(le);
        const re = new THREE.Mesh(earGeo, accentMat);
        re.position.set(0.1, 0.9, -0.05);
        re.rotation.z = -0.1;
        group.add(re);
        break;
      }
      case 'bear': {
        // Round ears
        const earGeo = new THREE.SphereGeometry(0.1, 8, 6);
        const le = new THREE.Mesh(earGeo, bodyMat);
        le.position.set(-0.2, 0.72, 0);
        group.add(le);
        const re = new THREE.Mesh(earGeo, bodyMat);
        re.position.set(0.2, 0.72, 0);
        group.add(re);
        // Snout
        const snout = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 6),
          accentMat,
        );
        snout.position.set(0, 0.45, 0.25);
        snout.scale.set(1, 0.7, 0.8);
        group.add(snout);
        break;
      }
      case 'cat': {
        // Pointed ears
        const earGeo = new THREE.ConeGeometry(0.07, 0.15, 4);
        const le = new THREE.Mesh(earGeo, bodyMat);
        le.position.set(-0.15, 0.75, 0);
        group.add(le);
        const re = new THREE.Mesh(earGeo, bodyMat);
        re.position.set(0.15, 0.75, 0);
        group.add(re);
        // Tail — curved cylinder
        const tailGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.5, 8);
        const tail = new THREE.Mesh(tailGeo, accentMat);
        tail.position.set(0, 0.2, -0.5);
        tail.rotation.x = -0.5;
        group.add(tail);
        break;
      }
      case 'dragon': {
        // Horns
        const hornGeo = new THREE.ConeGeometry(0.05, 0.2, 6);
        const lh = new THREE.Mesh(hornGeo, accentMat);
        lh.position.set(-0.12, 0.8, -0.05);
        lh.rotation.z = 0.3;
        group.add(lh);
        const rh = new THREE.Mesh(hornGeo, accentMat);
        rh.position.set(0.12, 0.8, -0.05);
        rh.rotation.z = -0.3;
        group.add(rh);
        // Wings (flat triangles)
        const wingGeo = new THREE.BufferGeometry();
        wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([
          0, 0, 0,  -0.5, 0.3, -0.1,  -0.2, -0.2, -0.15,
        ], 3));
        wingGeo.computeVertexNormals();
        const lw = new THREE.Mesh(wingGeo, accentMat);
        lw.position.set(-0.3, 0.2, -0.1);
        group.add(lw);
        const rwGeo = new THREE.BufferGeometry();
        rwGeo.setAttribute('position', new THREE.Float32BufferAttribute([
          0, 0, 0,  0.5, 0.3, -0.1,  0.2, -0.2, -0.15,
        ], 3));
        rwGeo.computeVertexNormals();
        const rw = new THREE.Mesh(rwGeo, accentMat);
        rw.position.set(0.3, 0.2, -0.1);
        group.add(rw);
        break;
      }
    }

    return group;
  }

  private animatePreviews = (): void => {
    if (this.disposed || this.previewRenderers.length === 0) return;
    this.previewAnimId = requestAnimationFrame(this.animatePreviews);

    const elapsed = (performance.now() - this.previewStartTime) / 1000;

    for (let i = 0; i < this.previewRenderers.length; i++) {
      const group = this.previewMeshes[i];
      const renderer = this.previewRenderers[i];
      const scene = this.previewScenes[i];
      const camera = this.previewCameras[i];
      if (!group || !renderer || !scene || !camera) continue;

      // Slow rotation
      group.rotation.y = elapsed * 0.5;

      // Gentle bobbing
      group.position.y = Math.sin(elapsed * 1.5 + i) * 0.03;

      // Greeting animation on hover — bounce
      const btn = renderer.domElement.parentElement;
      if (btn?.classList.contains('greeting')) {
        group.position.y += Math.sin(elapsed * 6) * 0.05;
        group.rotation.y = elapsed * 1.5; // Faster spin
      }

      renderer.render(scene, camera);
    }
  };

  // ---------------------------------------------------------------------------
  // Ambient background particles — warm motes drifting behind the form
  // ---------------------------------------------------------------------------

  private initBackgroundParticles(): void {
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
      return; // no WebGL
    }

    this.bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.bgRenderer.setSize(w, h);
    this.bgRenderer.setClearColor(0x000000, 0);

    this.bgScene = new THREE.Scene();
    this.bgCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.bgCamera.position.set(0, 0, 5);

    // Warm ambient particles
    const positions = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
    const colors = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);

    const warmColors = [
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xa78bfa), // Aurora
      new THREE.Color(0x22d3ee), // Frost
      new THREE.Color(0xffdab9), // Sunrise
    ];

    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;

      velocities[i * 3]     = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = 0.002 + Math.random() * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      const c = warmColors[Math.floor(Math.random() * warmColors.length)]!;
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

    this.bgStartTime = performance.now();
    this.animateBackground();
  }

  private animateBackground = (): void => {
    if (this.disposed || !this.bgRenderer || !this.bgScene || !this.bgCamera || !this.bgParticles) return;
    this.bgAnimId = requestAnimationFrame(this.animateBackground);

    const posAttr = this.bgParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const vels = this.bgParticles.geometry.userData.velocities as Float32Array;

    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      let x = posAttr.getX(i) + vels[i * 3]!;
      let y = posAttr.getY(i) + vels[i * 3 + 1]!;
      let z = posAttr.getZ(i) + vels[i * 3 + 2]!;

      // Wrap around when out of bounds
      if (y > 4) { y = -4; x = (Math.random() - 0.5) * 12; }
      if (x > 6) x = -6;
      if (x < -6) x = 6;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    const elapsed = (performance.now() - this.bgStartTime) / 1000;
    (this.bgParticles.material as THREE.PointsMaterial).opacity = 0.35 + 0.15 * Math.sin(elapsed * 0.4);

    this.bgRenderer.render(this.bgScene, this.bgCamera);
  };
}
