import { NexusCore } from '@nexus-academy/core';
import { SceneRenderer } from './renderer/scene-renderer.js';
import { GameLoop } from './game/loop.js';
import { InputManager } from './input/manager.js';
import { KeyboardInput } from './input/keyboard.js';
import { debug, debugSceneGraph } from './debug.js';
import { initDebugBridge } from './debug-bridge.js';
import { TouchInput } from './input/touch.js';
import { FirstPersonCamera } from './camera/first-person.js';
import { AudioManager } from './audio/audio-manager.js';
import { CompanionVoiceManager } from './audio/companion-voice.js';
import { NexusVoice } from './audio/nexus-voice.js';
import { HUD } from './ui/hud.js';
import { PortalScreen } from './ui/portal-screen.js';
import { ProfileScreen } from './ui/profile-screen.js';
import { AccessibilityManager } from './a11y/accessibility-manager.js';
import { OfflineManager } from './net/offline.js';
import { registerServiceWorker } from './net/sw-register.js';
import { AssetManager } from './assets/asset-manager.js';
import type { Disposable } from './types.js';

const DEBUG = import.meta.env.DEV;

const disposables: Disposable[] = [];

async function boot(): Promise<void> {
  // Start debug bridge — pipes browser console to terminal via WebSocket
  initDebugBridge();
  
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) { console.error('[Nexus] Could not find #game-canvas element'); return; }

  // Accessibility — first, so CSS vars apply before first paint
  const a11y = new AccessibilityManager();
  a11y.init();
  disposables.push(a11y);

  const core = await NexusCore.create({ debug: DEBUG, sqliteWasmUrl: '/sql-wasm.wasm' });
  debug('core', 'NexusCore created');
  disposables.push({ dispose: () => { void core.destroy(); } });

  // --- Portal Gateway (title screen) ---
  // Hide the default click-to-play overlay — portal replaces it
  const clickOverlay = document.getElementById('click-to-play');
  clickOverlay?.classList.add('hidden');

  const portalScreen = new PortalScreen();
  disposables.push(portalScreen);

  // Nexus Voice — speaks as the portal opens
  const nexusVoice = new NexusVoice();
  disposables.push(nexusVoice);

  // Show portal and start Nexus Voice in parallel
  const portalPromise = portalScreen.show();
  // Slight delay so the portal light appears first, then the voice
  setTimeout(() => {
    void nexusVoice.speak('welcome');
  }, 800);

  await portalPromise;
  debug('ui', 'Portal gateway complete — entering profile screen');

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
  // Force one tick so WorldSystem loads biome data from DB
  core.update(1 / 60, []);
  debug('core', 'Profile loaded + first tick:', profileId);

  // --- AudioContext — MUST be created during or after a user gesture ---
  // Profile selection is a click event, so the browser will allow audio.
  const audioCtx = new AudioContext();
  debug('audio', `AudioContext created — state: ${audioCtx.state}, sampleRate: ${audioCtx.sampleRate}`);
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }

  // Log initial scene graph
  const initialSG = core.getSceneGraph();
  debug('scene', 'Initial scene graph after profile load:');
  debugSceneGraph(initialSG);

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

  // --- Remove any leftover overlays, reveal canvas ---
  // (Portal overlay already removed; this catches edge cases)

  // --- Initialize renderers & input ---
  const assetManager = new AssetManager();
  disposables.push(assetManager);

  const sceneRenderer = new SceneRenderer(canvas);
  sceneRenderer.setAssetManager(assetManager);
  disposables.push(sceneRenderer);

  // Wire the companion character model into the scene (replaces default orb)
  if (profile?.avatarData) {
    sceneRenderer.setCompanionModel(profile.avatarData, profile.masteryTier);
  }

  const input = new InputManager();
  input.register(new KeyboardInput());
  const isMobile = 'ontouchstart' in window && window.innerWidth < 1024;
  if ('ontouchstart' in window) input.register(new TouchInput(isMobile));
  disposables.push(input);

  const fpCam = new FirstPersonCamera();
  disposables.push(fpCam);

  const audioManager = new AudioManager();
  audioManager.setContext(audioCtx);
  disposables.push(audioManager);

  // --- Companion Voice (browser SpeechSynthesis) ---
  const companionVoice = new CompanionVoiceManager();
  if (companionState) {
    companionVoice.setSpeaker(companionState.name);
  }
  disposables.push(companionVoice);

  const hud = new HUD();
  hud.init(DEBUG, a11y);
  if (isMobile) hud.setMobile(true);
  disposables.push(hud);

  const loop = new GameLoop(core, input, fpCam, sceneRenderer, audioManager, hud);
  if (isMobile) loop.setMobile(true);
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

  // Expose debug bridge for E2E tests (dev mode only)
  if (DEBUG) {
    (window as any).__nexus_debug = {
      get cameraPosition() { return fpCam.getEyePosition(); },
      get cameraVelocity() { return { vx: (fpCam as any).vx ?? 0, vz: (fpCam as any).vz ?? 0 }; },
      get sceneGraph() { return core.getSceneGraph(); },
      get sceneObjects() { return core.getSceneGraph().objects.length; },
      get groundColor() { return core.getSceneGraph().ground.color; },
      get skyColor() { return core.getSceneGraph().sky.primaryColor; },
      get fps() { return loop.fps; },
      get isRunning() { return loop.isRunning; },
      get profileId() { return profileId; },
      get currentBiome() { return core.getSceneGraph().ground; },
      setPlayerPosition(x: number, z: number) { fpCam.seedPosition(x, z); core.setPlayerPosition(x, z); },
      changeBiome(biomeId: string) {
        core.worldSystem.discoverBiome(biomeId);
        core.worldSystem.changeBiome(biomeId);
        core.update(1 / 60, []);
      },
    };
  }

  // Start the game loop immediately after profile selection
  debug('core', 'Starting game loop...');
  debug('render', 'SceneRenderer:', sceneRenderer ? 'initialized' : 'NULL');
  debug('render', 'AssetManager:', assetManager ? 'initialized' : 'NULL');
  debug('camera', 'FirstPersonCamera:', fpCam ? 'initialized' : 'NULL');
  debug('input', 'InputManager ready');
  loop.start();

  canvas.addEventListener('click', () => {
    if (!isMobile && !fpCam.isPointerLocked && loop.isRunning) fpCam.requestPointerLock(canvas);
    // Resume AudioContext on any click/tap (browser policy may suspend it)
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume().then(() => {
        debug('audio', 'AudioContext resumed on click');
      });
    }
  });

  // Track last spoken dialogue to avoid re-speaking the same line each frame
  let lastDialogueText = '';

  input.onAction((action) => {
    if (action.type === 'pause' && fpCam.isPointerLocked) fpCam.exitPointerLock();

    // Interact with highlighted object → trigger companion dialogue + interaction SFX
    if (action.type === 'interact') {
      const sg = core.getSceneGraph();
      const highlighted = sg.objects.find(o => o.highlight && o.interactable);
      if (highlighted?.interactable) {
        const name = highlighted.interactable.prompt.replace(/^Interact with /, '');

        // Play interaction chime SFX
        core.worldSystem.queueSfx('discovery-sparkle', 0.6);

        core.companionSystem.queueInteraction({
          type: 'react',
          profileId,
          context: `examine_${name.toLowerCase().replace(/\s+/g, '_')}`,
        });
      }
    }
  });

  // Poll for dialogue each frame and speak it via companion voice
  const dialoguePoll = setInterval(() => {
    const sg = core.getSceneGraph();
    if (sg.ui.dialogueActive && sg.ui.dialogueText && sg.ui.dialogueText !== lastDialogueText) {
      lastDialogueText = sg.ui.dialogueText;
      const emotion = sg.ui.dialogueText.includes('!')
        ? 'excited' as const
        : 'neutral' as const;
      void companionVoice.speak(sg.ui.dialogueText, emotion);
    } else if (!sg.ui.dialogueActive) {
      lastDialogueText = '';
    }
  }, 200);
  disposables.push({ dispose: () => clearInterval(dialoguePoll) });
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
