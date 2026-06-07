import { NexusCore } from '@nexus-academy/core';
import type { Quest, SceneGraph } from '@nexus-academy/core';
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
import { CompanionPicker } from './ui/companion-picker.js';
import { OnboardingFlow } from './ui/onboarding-flow.js';
import { NpcDialoguePanel, findNearestNpc, npcsInBiome, BIOME_NPCS } from './ui/npc-dialogue.js';
import type { NpcEntity } from './ui/npc-dialogue.js';
import { TradePanel } from './ui/trade-panel.js';
import { CalibrationFlow } from './game/calibration-flow.js';
import { AccessibilityManager } from './a11y/accessibility-manager.js';
import { OfflineManager } from './net/offline.js';
import { registerServiceWorker } from './net/sw-register.js';
import { AssetManager } from './assets/asset-manager.js';
import { WorldManager } from './world/world-manager.js';
import type { Disposable } from './types.js';

const DEBUG = import.meta.env.DEV;

const disposables: Disposable[] = [];

const STARTER_INVENTORY: Array<{ itemType: string; quantity: number }> = [
  { itemType: 'red-pigment', quantity: 3 },
  { itemType: 'blue-pigment', quantity: 3 },
  { itemType: 'yellow-pigment', quantity: 3 },
  { itemType: 'pine-wood', quantity: 5 },
  { itemType: 'clay', quantity: 2 },
  { itemType: 'H2O', quantity: 2 },
];

function describeInteraction(name: string, biomeId: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes('crop')) return 'These rows are alive with patterns: count the spacing, compare the heights, and the farm starts to make sense.';
  if (normalized.includes('scarecrow')) return 'The scarecrow marks the wind and shadow direction. It is a quiet clue for where crops need protection.';
  if (normalized.includes('well')) return 'The well is a water source. Water, soil, and sunlight are the farm system working together.';
  if (normalized.includes('wheelbarrow')) return 'The wheelbarrow helps move materials. Heavy loads become easier when the wheel carries the friction.';
  if (normalized.includes('barn')) return 'The barn stores tools and harvests. Good storage keeps a farm running through changing weather.';
  if (normalized.includes('chest')) return 'The chest is ready for discoveries. Useful materials should feel like treasures, not menu items.';
  if (normalized.includes('workbench')) return 'The workbench is where materials become inventions. Try combining pigments or building with pine wood.';
  if (normalized.includes('forge')) return 'The forge is for heat, metal, and transformation. The right material changes when energy is added.';
  if (normalized.includes('anvil')) return 'The anvil gives metal a place to change shape. Force works best when the surface beneath it is solid.';
  return biomeId === 'farm'
    ? `The ${name} belongs to the farm system. Look for how it connects to water, soil, sunlight, and motion.`
    : `You examine the ${name}. The world is waiting for the right idea, not the right menu click.`;
}

function ensureStarterInventory(core: NexusCore): void {
  if (core.worldSystem.getInventory().length > 0) return;
  for (const item of STARTER_INVENTORY) {
    core.worldSystem.addInventoryItem(item.itemType, item.quantity);
  }
}

function buildDebugSceneGraph(sceneGraph: SceneGraph, worldManager: WorldManager): SceneGraph {
  const offset = worldManager.isInside() ? worldManager.getBiomeOffset() : null;
  const worldSpaceGraph = offset
    ? {
        ...sceneGraph,
        objects: sceneGraph.objects.map(obj => ({
          ...obj,
          position: {
            x: obj.position.x + offset.x,
            y: obj.position.y + offset.y,
            z: obj.position.z + offset.z,
          },
        })),
      }
    : sceneGraph;
  return worldManager.mergeGameplayObjects(worldSpaceGraph);
}

async function boot(): Promise<void> {
  // Start debug bridge — pipes browser console to terminal via WebSocket
  initDebugBridge();

  // Lock to landscape on mobile devices (best-effort, non-blocking)
  try {
    (screen.orientation as any).lock('landscape').catch(() => {});
  } catch { /* */ }
  
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) { console.error('[Nexus] Could not find #game-canvas element'); return; }

  // Accessibility — first, so CSS vars apply before first paint
  const a11y = new AccessibilityManager();
  a11y.init();
  disposables.push(a11y);

  // --- Portal Gateway FIRST — show immediately, don't wait for core ---
  const firstTime = !localStorage.getItem('nexus_intro_seen');

  const portalScreen = new PortalScreen();
  disposables.push(portalScreen);

  // Show portal WHILE NexusCore loads in parallel
  const portalPromise = portalScreen.show({ firstTime });
  const corePromise = NexusCore.create({ debug: DEBUG, sqliteWasmUrl: '/sql-wasm.wasm' });

  // Nexus Voice for returning players
  const nexusVoice = new NexusVoice();
  disposables.push(nexusVoice);

  if (!firstTime) {
    setTimeout(() => { void nexusVoice.speak('welcome'); }, 800);
  }

  // Wait for BOTH portal interaction and core loading
  const [, core] = await Promise.all([portalPromise, corePromise]);
  debug('core', 'NexusCore created + portal complete');
  disposables.push({ dispose: () => { void core.destroy(); } });

  // --- Onboarding: Name → Age → Companion (first-time) or quick pick (returning) ---
  let playerName: string;
  let companionId: string;
  let ageTier: string;

  if (firstTime) {
    const onboarding = new OnboardingFlow();
    disposables.push(onboarding);
    const result = await onboarding.run();
    playerName = result.playerName;
    companionId = result.companionId;
    ageTier = result.ageTier;
    debug('ui', `Onboarding complete: ${playerName}, tier=${ageTier}, companion=${companionId}`);
  } else {
    const companionPicker = new CompanionPicker();
    disposables.push(companionPicker);
    const companionResult = await companionPicker.show();
    playerName = companionResult.name;
    companionId = companionResult.companionId;
    ageTier = 'discovery';
    debug('ui', `Returning: ${companionId} for "${playerName}"`);
  }

  // --- Profile selection / creation (uses companion picker result) ---
  const profileScreen = new ProfileScreen();
  disposables.push(profileScreen);

  const profiles = await core.listProfiles();

  let profileId: string;
  if (profiles.length === 0) {
    const newProfile = await core.createProfile({
      name: playerName,
      avatarData: companionId,
    });
    profileId = newProfile.id;
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
  ensureStarterInventory(core);
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
    void sceneRenderer.setCompanionModel(profile.avatarData, profile.masteryTier);
  }

  const input = new InputManager();
  input.register(new KeyboardInput());
  const hasTouchInput = 'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || window.matchMedia('(pointer: coarse)').matches;
  const isMobile = hasTouchInput && (
    window.innerWidth < 1024
    || window.matchMedia('(pointer: coarse)').matches
  );
  if (hasTouchInput) input.register(new TouchInput(isMobile));
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

  // --- NPC Interaction + Trading ---
  const npcDialogue = new NpcDialoguePanel();
  disposables.push(npcDialogue);

  const tradePanel = new TradePanel();
  disposables.push(tradePanel);

  // --- Calibration Flow ---
  const calibrationFlow = new CalibrationFlow();
  disposables.push(calibrationFlow);

  // --- Companion speech helper ---
  const companionSpeak = (text: string): void => {
    const speaker = core.getCompanionState()?.name ?? 'Companion';
    core.worldSystem.queueDialogue(speaker, text);
  };

  const loop = new GameLoop(core, input, fpCam, sceneRenderer, audioManager, hud);
  if (isMobile) loop.setMobile(true);
  disposables.push(loop);

  // --- Connected Overworld ---
  const worldManager = new WorldManager(sceneRenderer.scene);
  sceneRenderer.setWorldManager(worldManager);
  loop.setWorldManager(worldManager);

  // Wire NPC proximity detection into the game loop
  loop.setNpcProximityChecker((px, pz) => {
    const biomeId = worldManager.activeBiomeId ?? core.getCurrentBiome();
    const npc = findNearestNpc(biomeId, px, pz);
    return npc ? npc.name : null;
  });

  disposables.push(worldManager);
  debug('world', 'WorldManager created — overworld terrain, landmarks, and paths loaded');

  // --- Crafting + Map Panels ---
  const handleFastTravel = (biomeId: string): void => {
    // Fast-travel: switch core biome and world manager
    core.worldSystem.discoverBiome(biomeId);
    core.worldSystem.changeBiome(biomeId);
    worldManager.forceEnterBiome(biomeId);
    const pos = worldManager.getEntryPosition(biomeId);
    if (pos) {
      fpCam.seedPosition(pos.x, pos.z);
      core.setPlayerPosition(pos.x, pos.z);
    }
    const yaw = worldManager.getEntryYaw(biomeId);
    if (yaw !== null) fpCam.faceYaw(yaw);
    core.update(1 / 60, []);
    debug('travel', `Fast-traveled to biome: ${biomeId}`);
  };

  hud.initCraftPanel({
    core,
    profileId,
    onCompanionSpeak: companionSpeak,
  });

  hud.initMapPanel({
    core,
    profileId,
    worldManager,
    onCompanionSpeak: companionSpeak,
    onTravelTo: handleFastTravel,
  });
  debug('ui', 'Crafting and map panels initialized');

  // Spawn at the active opening biome so the first playable moment has models,
  // collision, and nearby interactions instead of an empty town-square walk.
  const startPos = worldManager.getStartPosition(core.getCurrentBiome());
  fpCam.seedPosition(startPos.x, startPos.z);
  core.setPlayerPosition(startPos.x, startPos.z);

  debug('assets', 'Preloading authored starter models...');
  await worldManager.ready;
  await assetManager.preloadAuthoredModels();
  debug('assets', 'Authored starter models ready');

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
      get sceneGraph() { return buildDebugSceneGraph(core.getSceneGraph(), worldManager); },
      get sceneObjects() { return buildDebugSceneGraph(core.getSceneGraph(), worldManager).objects.length; },
      get groundColor() { return core.getSceneGraph().ground.color; },
      get skyColor() { return core.getSceneGraph().sky.primaryColor; },
      get fps() { return loop.fps; },
      get isRunning() { return loop.isRunning; },
      get profileId() { return profileId; },
      get currentBiome() { return core.getSceneGraph().ground; },
      setPlayerPosition(x: number, z: number) { fpCam.seedPosition(x, z); core.setPlayerPosition(x, z); },
      faceYaw(yaw: number) { fpCam.faceYaw(yaw); },
      changeBiome(biomeId: string) {
        core.worldSystem.discoverBiome(biomeId);
        core.worldSystem.changeBiome(biomeId);
        // Also switch WorldManager to show the biome interior
        worldManager.forceEnterBiome(biomeId);
        const yaw = worldManager.getEntryYaw(biomeId);
        if (yaw !== null) fpCam.faceYaw(yaw);
        core.update(1 / 60, []);
      },
      get worldMode() { return worldManager.mode; },
      get activeBiomeId() { return worldManager.activeBiomeId; },
      get terrainHeight() {
        const pos = fpCam.getEyePosition();
        return worldManager.getHeightAt(pos.x, pos.z);
      },
      async enterBiome() { return worldManager.enterBiome(); },
      async exitBiome() { return worldManager.exitBiome(); },

      // --- Quest debug bridge ---
      get activeQuests() {
        const quests = core.getActiveQuests();
        return quests.map(p => ({
          ...p,
          quest: core.getQuestById(p.questId),
        }));
      },
      startQuest(questId: string) {
        core.questSystem.queueAction({
          type: 'start',
          questId,
          profileId,
        });
        core.update(1 / 60, []);
        return core.getActiveQuests();
      },
      completeStep() {
        const active = core.getActiveQuests();
        if (active.length === 0) return 'No active quest';
        const progress = active[0]!;
        const quest = core.getQuestById(progress.questId);
        if (!quest) return 'Quest not found';
        const newSteps = progress.stepsCompleted + 1;
        core.questSystem.queueAction({
          type: 'progress',
          questId: progress.questId,
          profileId,
          stepsCompleted: newSteps,
        });
        core.update(1 / 60, []);
        return { questId: progress.questId, stepsCompleted: newSteps, total: quest.content.steps.length };
      },
      listAvailable(biome?: string) {
        const b = biome ?? core.getCurrentBiome();
        return core.selectAvailableQuests(b);
      },
      getQuestById(questId: string) {
        return core.getQuestById(questId);
      },

      // --- NPC debug bridge ---
      spawnNPC(biome: string, type: string) {
        const npcs = npcsInBiome(biome);
        const matching = type ? npcs.filter(n => n.type === type) : npcs;
        return matching.map(n => ({ id: n.id, name: n.name, type: n.type, biome: n.biome, position: n.position }));
      },
      get npcsInCurrentBiome() {
        const biomeId = worldManager.activeBiomeId ?? core.getCurrentBiome();
        return npcsInBiome(biomeId).map(n => ({ id: n.id, name: n.name, type: n.type }));
      },
      openNpcDialogue(npcId: string) {
        const npc = BIOME_NPCS.find((n: NpcEntity) => n.id === npcId);
        if (npc) {
          npcDialogue.show(npc, (n, opt) => handleNpcOption(n, opt));
          return `Opened dialogue with ${npc.name}`;
        }
        return 'NPC not found';
      },

      // --- Calibration debug bridge ---
      startCalibration() {
        if (profile) {
          const started = calibrationFlow.start(
            core,
            profile,
            (speaker, text) => { core.worldSystem.queueDialogue(speaker, text); },
            (results) => { console.log('[Calibration] Complete:', results); },
          );
          return started ? 'Calibration started' : 'Profile already has mastery data';
        }
        return 'No profile loaded';
      },
      getCalibrationState() {
        return calibrationFlow.getState();
      },
      simulateCalibration(correct: boolean, responseTimeMs?: number) {
        calibrationFlow.simulateInteraction(core, correct, responseTimeMs);
        return calibrationFlow.getState();
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

  // --- Initialize biome atmosphere from pre-tick audio cues ---
  // The first core.update() emits a fade_in for the starting biome's ambient,
  // but that happens before the AudioManager exists. Extract the biome and
  // start the atmosphere explicitly.
  const initialBiomeCue = initialSG.audio.find(
    (c) => c.type === 'ambient' && c.action === 'fade_in' && c.asset.endsWith('-ambient'),
  );
  const startingBiome = initialBiomeCue
    ? initialBiomeCue.asset.replace('-ambient', '')
    : 'workshop';
  audioManager.startAtmosphere(startingBiome);
  debug('audio', `Atmosphere started for biome: ${startingBiome}`);

  const hasBlockingUi = () => hud.hasOpenPanel
    || npcDialogue.isOpen
    || tradePanel.isOpen
    || document.getElementById('calibration-challenge') !== null;

  const releasePointerForUi = (): void => {
    if (fpCam.isPointerLocked) fpCam.exitPointerLock();
  };

  // --- Initial quest offering for the starting biome (after a short delay) ---
  setTimeout(() => {
    const biome = core.getCurrentBiome();
    const available = core.selectAvailableQuests(biome);
    if (available.length > 0) {
      pendingQuestOffer = available;
      const first = available[0]!;
      const intro = first.content.companionIntro
        ?? 'I noticed something interesting over by the workbench…';
      core.worldSystem.queueDialogue(
        core.getCompanionState()?.name ?? 'Companion',
        intro,
      );
      core.worldSystem.queueSfx('discovery-sparkle', 0.4);
      debug('quest', `Initial quest offer in ${biome}: ${available.map(q => q.title).join(', ')}`);
    }
  }, 5000);

  canvas.addEventListener('click', () => {
    // Resume AudioContext on any click/tap (browser policy may suspend it)
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume().then(() => {
        debug('audio', 'AudioContext resumed on click');
      });
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Desktop game controls: left-click enters mouse-look; E/gamepad/touch handle use.
  // Real UI panels explicitly release pointer lock before opening.
  canvas.addEventListener('mousedown', (e) => {
    if (!isMobile && loop.isRunning && !fpCam.isPointerLocked && !hasBlockingUi() && (e.button === 0 || e.button === 2)) {
      fpCam.requestPointerLock(canvas);
    }
  });

  // Track last spoken dialogue to avoid re-speaking the same line each frame
  let lastDialogueText = '';

  // --- Quest state ---
  let activeQuestId: string | null = null;
  let pendingQuestOffer: Quest[] = [];

  // Quest offer callback — companion announces available quests
  loop.onQuestOffer((quests) => {
    if (activeQuestId) return; // Already in a quest
    pendingQuestOffer = quests;
    const first = quests[0];
    if (first?.content.companionIntro) {
      core.companionSystem.queueInteraction({
        type: 'hint',
        profileId,
        context: `quest_offer_${first.id}`,
      });
      // Queue dialogue directly since hint context may not generate the right text
      core.worldSystem.queueDialogue(
        core.getCompanionState()?.name ?? 'Companion',
        first.content.companionIntro,
      );
      core.worldSystem.queueSfx('discovery-sparkle', 0.4);
    }
    debug('quest', `Quest offer: ${quests.map(q => q.title).join(', ')}`);
  });

  // Quest completion callback — companion celebrates
  loop.onQuestComplete((quest) => {
    activeQuestId = null;
    if (quest.content.companionOutro) {
      core.worldSystem.queueDialogue(
        core.getCompanionState()?.name ?? 'Companion',
        quest.content.companionOutro,
      );
    }
    core.worldSystem.queueSfx('quest-complete', 0.8);

    // Record learning events already handled by QuestSystem.completeQuest
    debug('quest', `Quest completed: ${quest.title} — skills: ${quest.skillsTaught.join(', ')}`);
  });

  input.onAction((action) => {
    if (action.type === 'pause' && fpCam.isPointerLocked) fpCam.exitPointerLock();

    // Interact with highlighted object → trigger companion dialogue + interaction SFX
    if (action.type === 'interact') {
      const highlighted = loop.getHighlightedInteractable()
        ?? core.getSceneGraph().objects.find(o => o.highlight && o.interactable);
      const highlightedIsNpc = highlighted?.interactable?.interactionType === 'talk';

      // --- NPC Interaction ---
      // Check if there's a nearby NPC when inside a biome
      if (worldManager.isInside() && (!highlighted?.interactable || highlightedIsNpc) && !npcDialogue.isOpen && !tradePanel.isOpen) {
        const biomeId = worldManager.activeBiomeId ?? core.getCurrentBiome();
        const eye = fpCam.getEyePosition();
        const nearbyNpc = findNearestNpc(biomeId, eye.x, eye.z);
        if (nearbyNpc) {
          releasePointerForUi();
          // Handle calibration challenge interaction
          if (calibrationFlow.isActive && calibrationFlow.activeChallenge) {
            const challengeOverlay = document.getElementById('calibration-challenge');
            if (challengeOverlay) {
              const btns = challengeOverlay.querySelectorAll('button');
              btns.forEach(btn => {
                btn.addEventListener('click', () => {
                  const correct = btn.dataset.action === 'correct';
                  calibrationFlow.submitResponse(core, correct);
                }, { once: true });
              });
            }
            return;
          }

          npcDialogue.show(nearbyNpc, (npc, optionId) => {
            handleNpcOption(npc, optionId);
          });
          debug('npc', `Opened dialogue with ${nearbyNpc.name} (${nearbyNpc.type})`);
          return;
        }
      }

      // --- Calibration challenge interaction ---
      if (calibrationFlow.isActive) {
        const challengeOverlay = document.getElementById('calibration-challenge');
        if (challengeOverlay) {
          const btns = challengeOverlay.querySelectorAll('button');
          btns.forEach(btn => {
            btn.addEventListener('click', () => {
              const correct = btn.dataset.action === 'correct';
              calibrationFlow.submitResponse(core, correct);
            }, { once: true });
          });
          return;
        }
      }

      if (highlighted?.interactable) {
        const name = highlighted.interactable.prompt.replace(/^Interact with /, '');

        // --- Crafting station interaction → open craft panel ---
        if (highlighted.interactable.interactionType === 'craft') {
          const stationType = (highlighted.renderable.modelId ?? 'workbench').toLowerCase();
          releasePointerForUi();
          hud.craftPanel?.open(stationType);
          debug('craft', `Opened crafting panel for station: ${stationType}`);
          return;
        }

        // Play interaction chime SFX
        core.worldSystem.queueSfx('discovery-sparkle', 0.6);

        // --- Quest interaction logic ---
        const activeQuests = core.getActiveQuests();
        const currentQuest = activeQuests.length > 0
          ? core.getQuestById(activeQuests[0]!.questId)
          : null;
        const currentProgress = activeQuests[0] ?? null;

        if (currentQuest && currentProgress && currentProgress.status === 'active') {
          // Active quest — check if this object matches current step target
          const step = currentQuest.content.steps[currentProgress.stepsCompleted];
          if (step) {
            // Progress the quest: advance by one step
            const newSteps = currentProgress.stepsCompleted + 1;
            core.questSystem.queueAction({
              type: 'progress',
              questId: currentQuest.id,
              profileId,
              stepsCompleted: newSteps,
            });

            // Show step success response via companion
            core.worldSystem.queueDialogue(
              core.getCompanionState()?.name ?? 'Companion',
              step.successResponse,
            );
            debug('quest', `Quest step ${newSteps}/${currentQuest.content.steps.length}: ${step.instruction}`);
          }
        } else if (!currentQuest && pendingQuestOffer.length > 0) {
          // No active quest but we have a pending offer — start the first offered quest
          const quest = pendingQuestOffer[0]!;
          core.questSystem.queueAction({
            type: 'start',
            questId: quest.id,
            profileId,
          });
          activeQuestId = quest.id;
          pendingQuestOffer = [];
          loop.clearQuestOffer();

          // Companion introduces the quest
          const intro = quest.content.companionIntro ?? `Let's try: ${quest.title}`;
          core.worldSystem.queueDialogue(
            core.getCompanionState()?.name ?? 'Companion',
            intro,
          );
          debug('quest', `Quest started: ${quest.title} (${quest.id})`);
        } else {
          // Regular interaction — companion reacts
          core.companionSystem.queueInteraction({
            type: 'react',
            profileId,
            context: `examine_${name.toLowerCase().replace(/\s+/g, '_')}`,
          });
          core.worldSystem.queueDialogue(
            core.getCompanionState()?.name ?? 'Companion',
            describeInteraction(name, worldManager.activeBiomeId ?? core.getCurrentBiome()),
          );
        }
        return;
      }

      // Biome travel is a fallback when no nearby object/NPC owns the E press.
      if (worldManager.isOverworld()) {
        const nearby = worldManager.nearbyBiome;
        if (nearby && nearby.entranceDistance < 5) {
          void worldManager.enterBiome().then((biomeId) => {
            if (biomeId) {
              const pos = worldManager.getEntryPosition(biomeId);
              if (pos) {
                fpCam.seedPosition(pos.x, pos.z);
                core.setPlayerPosition(pos.x, pos.z);
              }
              const yaw = worldManager.getEntryYaw(biomeId);
              if (yaw !== null) fpCam.faceYaw(yaw);
              core.worldSystem.discoverBiome(biomeId);
              core.worldSystem.changeBiome(biomeId);
              core.update(1 / 60, []);
              debug('world', `Entered biome: ${biomeId}`);

              const available = core.selectAvailableQuests(biomeId);
              if (available.length > 0 && core.getActiveQuests().length === 0) {
                pendingQuestOffer = available;
                const first = available[0]!;
                const intro = first.content.companionIntro
                  ?? `I noticed something interesting here…`;
                setTimeout(() => {
                  core.worldSystem.queueDialogue(
                    core.getCompanionState()?.name ?? 'Companion',
                    intro,
                  );
                  core.worldSystem.queueSfx('discovery-sparkle', 0.4);
                }, 2000);
                debug('quest', `Biome entry quest offer in ${biomeId}: ${available.map(q => q.title).join(', ')}`);
              }
            }
          });
          return;
        }
      } else if (worldManager.isInside() && worldManager.isNearDoor) {
        void worldManager.exitBiome().then(() => {
          const pos = worldManager.getExitPosition();
          const yaw = worldManager.getExitYaw();
          if (pos) {
            fpCam.seedPosition(pos.x, pos.z);
            core.setPlayerPosition(pos.x, pos.z);
          }
          if (yaw !== null) fpCam.faceYaw(yaw);
          debug('world', 'Exited to overworld');
        });
      }
    }
  });

  // --- Keyboard shortcuts for panels (C = craft, M = map) ---
  document.addEventListener('keydown', (e) => {
    // Don't capture keys when typing in an input/textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'c' || e.key === 'C') {
      // C key: toggle crafting panel when a station is highlighted.
      if (hud.mapPanel?.isOpen) return; // don't open craft while map is open
      if (hud.craftPanel?.isOpen) {
        hud.craftPanel.close();
      } else {
        const highlightedCraftStation = loop.getHighlightedInteractable();
        const craftStation = highlightedCraftStation?.interactable?.interactionType === 'craft'
          ? highlightedCraftStation
          : worldManager.isInside()
            ? core.getSceneGraph().objects.find(o => o.highlight && o.interactable?.interactionType === 'craft')
            : undefined;
        if (craftStation) {
          const stationType = (craftStation.renderable.modelId ?? 'workbench').toLowerCase();
          releasePointerForUi();
          hud.craftPanel?.open(stationType);
          debug('craft', `C key → opened crafting panel for: ${stationType}`);
        } else {
          companionSpeak("There's no crafting station nearby.");
        }
      }
    }

    if (e.key === 'm' || e.key === 'M') {
      // M key: toggle map panel
      if (hud.craftPanel?.isOpen) return; // don't open map while crafting
      if (!hud.mapPanel?.isOpen) releasePointerForUi();
      hud.mapPanel?.toggle();
      debug('ui', `M key → map panel ${hud.mapPanel?.isOpen ? 'opened' : 'closed'}`);
    }

    if (e.key === 'l' || e.key === 'L') {
      if (!isMobile && loop.isRunning && !fpCam.isPointerLocked && !hasBlockingUi()) {
        fpCam.requestPointerLock(canvas);
      }
    }
  });

  // --- NPC option handler ---
  function handleNpcOption(npc: NpcEntity, optionId: string): void {
    const biomeId = worldManager.activeBiomeId ?? core.getCurrentBiome();

    switch (optionId) {
      case 'browse':
      case 'sell': {
        if (!npc.merchant) return;
        npcDialogue.hide();

        // Initialize market if needed and get prices
        core.economySystem.initializeMarket(biomeId);
        const prices = core.economySystem.getMarketPrices(biomeId);
        const playerEcon = core.economySystem.getPlayerEconomy(profileId);
        const playerTier = profile?.masteryTier ?? 'foundation';

        // Get player inventory items that could be sold
        const playerInvItems: { itemId: string; quantity: number }[] = [];
        const inv = core.inventorySystem.getItems(core.getWorld());
        for (const entry of inv) {
          playerInvItems.push({ itemId: entry.itemType, quantity: entry.quantity });
        }

        tradePanel.show(
          npc.merchant,
          prices,
          playerEcon,
          playerInvItems,
          playerTier,
          (offer) => core.economySystem.executeTrade(profileId, biomeId, offer, playerTier),
          () => { debug('trade', 'Trade panel closed'); },
        );
        debug('trade', `Opened trade panel with ${npc.name}`);
        break;
      }

      case 'quest': {
        npcDialogue.hide();
        // Offer quests from this NPC
        if (npc.questIds && npc.questIds.length > 0) {
          const quest = core.getQuestById(npc.questIds[0]!);
          if (quest) {
            core.questSystem.queueAction({ type: 'start', questId: quest.id, profileId });
            activeQuestId = quest.id;
            const intro = quest.content.companionIntro ?? `${npc.name} has a task for us!`;
            core.worldSystem.queueDialogue(npc.name, intro);
            debug('quest', `NPC quest started: ${quest.title}`);
          }
        } else {
          core.worldSystem.queueDialogue(npc.name,
            "I don't have anything right now, but check back later!",
          );
        }
        break;
      }

      case 'learn': {
        // Sage explains a concept
        const topic = npc.expertise?.[0] ?? 'the world';
        npcDialogue.updateText(
          `Let me tell you what I know about ${topic}... Every question leads to a discovery!`,
        );
        debug('npc', `Sage ${npc.name} teaching about ${topic}`);
        break;
      }

      case 'chat': {
        // Villager/NPC ambient chat
        const chatLines = [
          "It's always wonderful to meet someone curious about the world!",
          "I've been thinking about how everything in this place is connected...",
          "Did you notice the way the light changes here? Isn't it beautiful?",
        ];
        npcDialogue.updateText(chatLines[Math.floor(Math.random() * chatLines.length)]!);
        debug('npc', `Chatting with ${npc.name}`);
        break;
      }

      default:
        break;
    }
  }

  // --- Calibration disabled — will be reimplemented as natural world interactions ---
  // The calibration system currently shows an intrusive dialog box which breaks
  // immersion and doesn't work on touch devices. When reimplemented, calibration
  // should be invisible — the world responds to what the player does naturally.
  // See: docs/06-MASTERY_SYSTEM.md for the Ender Protocol design.
  //
  // if (profile) {
  //   calibrationFlow.start(core, profile, ...);
  // }

  // Poll for dialogue each frame and speak it via companion voice
  const dialoguePoll = setInterval(() => {
    const sg = core.getSceneGraph();
    if (sg.ui.dialogueActive && sg.ui.dialogueText && sg.ui.dialogueText !== lastDialogueText) {
      lastDialogueText = sg.ui.dialogueText;
      sceneRenderer.setCompanionSpeaking(true);
      const emotion = sg.ui.dialogueText.includes('!')
        ? 'excited' as const
        : 'neutral' as const;
      void companionVoice.speak(sg.ui.dialogueText, emotion);
    } else if (!sg.ui.dialogueActive) {
      lastDialogueText = '';
      sceneRenderer.setCompanionSpeaking(false);
    }
  }, 200);
  disposables.push({ dispose: () => clearInterval(dialoguePoll) });
}

function init(): void {
  boot().catch((err) => {
    console.error('[Nexus] Failed to initialize:', err);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
