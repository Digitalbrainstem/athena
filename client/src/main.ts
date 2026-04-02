import { NexusCore } from '@nexus-academy/core';
import { SceneRenderer } from './renderer/scene-renderer.js';
import { GameLoop } from './game/loop.js';
import { InputManager } from './input/manager.js';
import { KeyboardInput } from './input/keyboard.js';
import { TouchInput } from './input/touch.js';
import { FirstPersonCamera } from './camera/first-person.js';
import { AudioManager } from './audio/audio-manager.js';
import { HUD } from './ui/hud.js';
import { ProfileScreen } from './ui/profile-screen.js';
import { AccessibilityManager } from './a11y/accessibility-manager.js';
import { OfflineManager } from './net/offline.js';
import { registerServiceWorker } from './net/sw-register.js';
import { AssetManager } from './assets/asset-manager.js';
import type { Disposable } from './types.js';

const DEBUG = import.meta.env.DEV;

const disposables: Disposable[] = [];

async function boot(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) { console.error('[Nexus] Could not find #game-canvas element'); return; }

  // Accessibility — first, so CSS vars apply before first paint
  const a11y = new AccessibilityManager();
  a11y.init();
  disposables.push(a11y);

  const core = await NexusCore.create({ debug: DEBUG });
  disposables.push({ dispose: () => { void core.destroy(); } });

  // --- Profile selection / creation ---
  const profileScreen = new ProfileScreen();
  disposables.push(profileScreen);

  const profiles = await core.listProfiles();

  let profileId: string;
  if (profiles.length === 0) {
    // No profiles — show creation screen
    const result = await profileScreen.show(core);
    profileId = result.profileId;
  } else {
    // Profiles exist — let the player pick (or auto-select single profile)
    if (profiles.length === 1) {
      profileId = profiles[0]!.id;
    } else {
      const result = await profileScreen.show(core);
      profileId = result.profileId;
    }
  }

  // Load the selected profile into the engine
  await core.loadProfile(profileId);

  // Queue a companion greeting for first entry
  const companionState = core.getCompanionState();
  const profile = (await core.listProfiles()).find((p) => p.id === profileId);
  if (companionState && profile) {
    core.companionSystem.queueInteraction({
      type: 'greet',
      profileId,
      context: 'workshop_first_entry',
    });
  }

  // --- Remove any leftover overlay, reveal canvas ---
  const overlay = document.getElementById('click-to-play');
  overlay?.classList.add('hidden');

  // --- Initialize renderers & input ---
  const assetManager = new AssetManager();
  disposables.push(assetManager);

  const sceneRenderer = new SceneRenderer(canvas);
  sceneRenderer.setAssetManager(assetManager);
  disposables.push(sceneRenderer);

  const input = new InputManager();
  input.register(new KeyboardInput());
  if ('ontouchstart' in window) input.register(new TouchInput());
  disposables.push(input);

  const fpCam = new FirstPersonCamera();
  disposables.push(fpCam);

  const audioManager = new AudioManager();
  disposables.push(audioManager);

  const hud = new HUD();
  hud.init(DEBUG, a11y);
  disposables.push(hud);

  const loop = new GameLoop(core, input, fpCam, sceneRenderer, audioManager, hud);
  disposables.push(loop);

  // Offline support — announce network status changes to screen readers
  const offlineMgr = new OfflineManager((text) => {
    a11y.processAnnouncements([{ text, priority: 'polite', category: 'system' }]);
  });
  offlineMgr.onStatusChange((online) => {
    if (DEBUG) console.log(`[Nexus] Network: ${online ? 'online' : 'offline'}`);
  });
  disposables.push(offlineMgr);

  // Service Worker — register for offline asset caching
  void registerServiceWorker().then((result) => {
    if (DEBUG && result.success) console.log('[Nexus] Service Worker registered');
    else if (DEBUG && !result.success) console.log('[Nexus] SW not available:', result.error);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) loop.stop();
    else if (!loop.isRunning) loop.start();
  });

  // Start the game loop immediately after profile selection
  fpCam.requestPointerLock(canvas);
  loop.start();

  canvas.addEventListener('click', () => {
    if (!fpCam.isPointerLocked && loop.isRunning) fpCam.requestPointerLock(canvas);
  });

  input.onAction((action) => {
    if (action.type === 'pause' && fpCam.isPointerLocked) fpCam.exitPointerLock();
  });
}

function init(): void {
  boot().catch((err) => {
    console.error('[Nexus] Failed to initialize:', err);
    const p = document.querySelector('#click-to-play p');
    if (p) p.textContent = 'Failed to start — check console for details.';
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
