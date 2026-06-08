import type { NexusCore, SceneGraph, SceneObject, GameAction, MovePayload, LookPayload, Quest } from '@nexus-academy/core';
import { updateHighlights } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import type { InputManager } from '../input/manager.js';
import type { SceneRenderer } from '../renderer/scene-renderer.js';
import type { FirstPersonCamera } from '../camera/first-person.js';
import type { AudioManager } from '../audio/audio-manager.js';
import type { HUD } from '../ui/hud.js';
import type { WorldManager } from '../world/world-manager.js';
import { BIOME_ENTER_RANGE } from '../world/world-manager.js';
import { debug, debugSceneGraph } from '../debug.js';

/** Callback to check for nearby NPCs. Returns NPC name if one is in range, null otherwise. */
export type NpcProximityChecker = (playerX: number, playerZ: number) => string | null;

const DEFAULT_FIXED_DT = 1 / 60;
const MAX_FRAME_TIME = 0.25;
const MAX_STEPS_PER_FRAME = 8;

/** Cooldown before offering the next quest after completion (seconds). */
const QUEST_OFFER_COOLDOWN = 10;
/** How often to check for available quests (seconds). */
const QUEST_CHECK_INTERVAL = 5;

export class GameLoop implements Disposable {
  private running = false;
  private rafId = 0;
  private lastTime = -1;
  private accumulator = 0;
  private disposed = false;
  private frameCount = 0;
  private firstFrameLogged = false;
  private fpsAccumulator = 0;
  private _fps = 0;
  private positionSeeded = false;
  private mobile = false;
  private activeControl: 'keyboard' | 'gamepad' | 'touch' = 'keyboard';

  // --- Footstep movement tracking ---
  private lastPosX = 0;
  private lastPosZ = 0;
  private positionTracked = false;

  // --- Quest state tracking ---
  private lastQuestId: string | null = null;
  private lastStepsCompleted = -1;
  private questCompleteCooldown = 0;
  private questCheckTimer = 0;
  private questOfferPending = false;
  private pendingQuestComplete: Quest | null = null;

  // --- NPC proximity ---
  private npcProximityChecker: NpcProximityChecker | null = null;
  private lastHighlightedScene: SceneGraph | null = null;

  private readonly fixedDt: number;
  private readonly core: NexusCore;
  private readonly inputManager: InputManager;
  private readonly fpCam: FirstPersonCamera;
  private readonly sceneRenderer: SceneRenderer;
  private readonly audioManager: AudioManager;
  private readonly hud: HUD;
  private worldManager: WorldManager | null = null;

  constructor(
    core: NexusCore,
    inputManager: InputManager,
    fpCam: FirstPersonCamera,
    sceneRenderer: SceneRenderer,
    audioManager: AudioManager,
    hud: HUD,
    fixedDt = DEFAULT_FIXED_DT,
  ) {
    this.core = core;
    this.inputManager = inputManager;
    this.fpCam = fpCam;
    this.sceneRenderer = sceneRenderer;
    this.audioManager = audioManager;
    this.hud = hud;
    this.fixedDt = fixedDt;
  }

  /** Connect the WorldManager for overworld integration. */
  setWorldManager(wm: WorldManager): void {
    this.worldManager = wm;
    this.fpCam.setHeightProvider((x, z) => wm.getHeightAt(x, z));
  }

  /** Set a callback for NPC proximity detection. */
  setNpcProximityChecker(checker: NpcProximityChecker): void {
    this.npcProximityChecker = checker;
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTime = -1;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = 0; }
  }

  dispose(): void {
    this.stop();
    this.disposed = true;
  }

  get fps(): number { return this._fps; }
  get isRunning(): boolean { return this.running; }
  get fixedTimestep(): number { return this.fixedDt; }

  /** Enable mobile-specific behaviour (touch prompts, etc.). */
  setMobile(mobile: boolean): void {
    this.mobile = mobile;
    if (mobile) this.activeControl = 'touch';
  }

  /** Return the most recent highlighted interactable, including direct world models. */
  getHighlightedInteractable(): SceneObject | undefined {
    return this.lastHighlightedScene?.objects.find(o => o.highlight && o.interactable);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    if (this.lastTime < 0) { this.lastTime = now; return; }

    let frameDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (frameDt > MAX_FRAME_TIME) frameDt = MAX_FRAME_TIME;

    this.frameCount++;
    this.fpsAccumulator += frameDt;
    if (this.fpsAccumulator >= 1) {
      this._fps = Math.round(this.frameCount / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }

    // Seed the camera position from ECS once
    if (!this.positionSeeded) {
      this.positionSeeded = true;
      const ecsPos = this.core.getPlayerPosition();
      this.fpCam.seedPosition(ecsPos.x, ecsPos.z);
    }

    this.accumulator += frameDt;

    // Flush input ONCE per frame — touch/keyboard move & look actions persist
    // across all physics sub-steps so mobile joystick input isn't lost.
    const rawActions: GameAction[] = [
      ...this.inputManager.flush(),
      ...this.fpCam.flushLookActions(),
    ];
    this.updateActiveControl(rawActions);

    // Feed movement & look input into the FP camera (applied to every sub-step)
    for (const a of rawActions) {
      if (a.type === 'move' && a.payload && 'direction' in a.payload) {
        const mp = a.payload as MovePayload;
        this.fpCam.setMoveInput(mp.direction.x, mp.direction.z, mp.running);
      }
      // Apply touch/gamepad look actions to the camera (mouse look handled internally)
      if (a.type === 'look' && a.source !== 'mouse' && a.payload && 'deltaX' in a.payload) {
        const lp = a.payload as LookPayload;
        this.fpCam.applyLook(lp.deltaX, lp.deltaY);
      }
    }

    const nonMoveActions = rawActions.filter(a => a.type !== 'move');

    // Update collision boxes BEFORE physics so walls block movement this frame
    const preSceneGraph: SceneGraph = this.core.getSceneGraph();
    if (this.worldManager?.isOverworld()) {
      this.fpCam.updateCollisionBoxes([]);
      this.fpCam.addExtraCollisionBoxes(this.worldManager.getOverworldCollisionBoxes());
    } else if (this.worldManager && !this.worldManager.isOverworld()) {
      const offset = this.worldManager.getBiomeOffset();
      const collisionObjects = offset
        ? preSceneGraph.objects.map(obj => ({
            ...obj,
            position: {
              x: obj.position.x + offset.x,
              y: obj.position.y + offset.y,
              z: obj.position.z + offset.z,
            },
          }))
        : preSceneGraph.objects;
      this.fpCam.updateCollisionBoxes(collisionObjects);
      this.fpCam.addExtraCollisionBoxes(this.worldManager.getExtraCollisionBoxes());
    } else {
      this.fpCam.updateCollisionBoxes([]);
    }

    let steps = 0;
    const smoothedActions: GameAction[] = [];
    while (this.accumulator >= this.fixedDt && steps < MAX_STEPS_PER_FRAME) {
      // Update velocity physics (acceleration / friction / clamping / collision)
      this.fpCam.updateMovement(this.fixedDt);

      // Write authoritative position back into the ECS
      this.core.setPlayerPosition(this.fpCam.posX, this.fpCam.posZ);

      // Replace raw move actions with smoothed ones from the velocity system
      smoothedActions.push(...this.fpCam.flushMoveActions());
      this.accumulator -= this.fixedDt;
      steps++;
    }

    // Clear move input after all sub-steps (will be re-set next frame if held)
    this.fpCam.clearMoveInput();

    if (steps >= MAX_STEPS_PER_FRAME) this.accumulator = 0;

    const updateDt = steps > 0 ? steps * this.fixedDt : frameDt;
    this.core.update(updateDt, [...nonMoveActions, ...smoothedActions]);

    let sceneGraph: SceneGraph = this.core.getSceneGraph();
    if (this.worldManager?.isOverworld()) {
      sceneGraph = { ...sceneGraph, objects: [] };
    } else if (this.worldManager?.isInside()) {
      const offset = this.worldManager.getBiomeOffset();
      const biomeObjects = this.worldManager.activeBiomeId === 'workshop'
        ? sceneGraph.objects.filter(obj => obj.renderable.modelId === 'npc')
        : sceneGraph.objects;
      sceneGraph = {
        ...sceneGraph,
        objects: biomeObjects.map(obj => ({
          ...obj,
          position: {
            x: obj.position.x + offset.x,
            y: obj.position.y + offset.y,
            z: obj.position.z + offset.z,
          },
        })),
      };
    }

    // Override scene graph camera with client-authoritative position & rotation
    const rot = this.fpCam.getPredictiveRotation();
    const eye = this.fpCam.getEyePosition();
    sceneGraph.camera = {
      ...sceneGraph.camera,
      position: eye,
      rotation: { x: rot.pitch, y: rot.yaw, z: 0 },
    };

    // Update WorldManager with player position
    if (this.worldManager) {
      this.worldManager.update(this.fpCam.posX, this.fpCam.posZ, frameDt);

      // Override sky when in overworld
      if (this.worldManager.isOverworld()) {
        sceneGraph.sky = this.worldManager.getOverworldSky();
        // Reduce fog density for overworld so landmarks are visible at distance
        sceneGraph.sky.type = 'gradient';
      }

      sceneGraph = this.worldManager.mergeGameplayObjects(sceneGraph);
    }

    // Recompute highlights using the client-authoritative camera position.
    // The scene graph was built with the ECS player position which should
    // match, but re-running ensures the prompt always tracks the real camera.
    const playerGroundPos = { x: eye.x, y: 0, z: eye.z };
    const highlighted = updateHighlights(sceneGraph, playerGroundPos);
    this.lastHighlightedScene = highlighted;

    // Debug: log scene graph once on first frame only
    if (!this.firstFrameLogged) {
      this.firstFrameLogged = true;
      debug('scene', 'First frame scene graph:');
      debugSceneGraph(highlighted);
      debug('render', 'Ground:', highlighted.ground);
      debug('render', 'Sky:', highlighted.sky);
      debug('camera', 'Camera:', highlighted.camera);
    }

    const highlightedInteractable = highlighted.objects.find(o => o.highlight && o.interactable);
    // Show / hide interaction prompts based on highlight state
    this.updateInteractionPrompt(highlighted);

    // WorldManager biome proximity prompts
    if (this.worldManager && !highlightedInteractable) {
      if (this.worldManager.isOverworld()) {
        const nearby = this.worldManager.nearbyBiome;
        if (nearby && nearby.entranceDistance <= BIOME_ENTER_RANGE) {
          this.hud.showPrompt(`${this.actionLabel()} to enter ${nearby.biome.name}`);
        }
      } else if (this.worldManager.isInside() && this.npcProximityChecker) {
        // NPC proximity prompt — only when inside a biome
        const npcName = this.npcProximityChecker(eye.x, eye.z);
        if (npcName) {
          const action = this.actionLabel();
          this.hud.showPrompt(`${action} to talk to ${npcName}`);
        } else if (this.worldManager.isNearDoor) {
          this.hud.showPrompt(`${this.actionLabel()} to exit`);
        }
      } else if (this.worldManager.isInside() && this.worldManager.isNearDoor) {
        this.hud.showPrompt(`${this.actionLabel()} to exit`);
      }
    }

    this.sceneRenderer.render(highlighted);
    this.audioManager.process(highlighted.audio);

    // --- Footstep triggering based on movement ---
    const groundType = highlighted.ground?.type ?? 'grass';
    if (!this.positionTracked) {
      this.lastPosX = eye.x;
      this.lastPosZ = eye.z;
      this.positionTracked = true;
    } else {
      const dx = eye.x - this.lastPosX;
      const dz = eye.z - this.lastPosZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const speed = frameDt > 0 ? dist / frameDt : 0;
      this.lastPosX = eye.x;
      this.lastPosZ = eye.z;
      this.audioManager.tickMovement(frameDt, speed, groundType);
    }

    this.hud.update(highlighted.ui);
    this.hud.processAnnouncements(highlighted.announcements);
    this.hud.processCaptions(highlighted.captions);
    this.hud.updateFPS(this._fps);

    if (this.fpCam.isPointerLocked && this.hud.hasOpenPanel) {
      this.fpCam.exitPointerLock();
    }

    // --- Quest HUD sync ---
    this.updateQuestPanel(frameDt, highlighted);
  };

  /** Callback invoked when the loop detects a quest should be offered. */
  private questOfferCallback: ((quests: Quest[]) => void) | null = null;

  /** Callback invoked when a quest completes (for celebration/companion dialogue). */
  private questCompleteCallback: ((quest: Quest) => void) | null = null;

  /** Register a callback for when a quest offer is detected. */
  onQuestOffer(cb: (quests: Quest[]) => void): void { this.questOfferCallback = cb; }

  /** Register a callback for when a quest is completed. */
  onQuestComplete(cb: (quest: Quest) => void): void { this.questCompleteCallback = cb; }

  /** Update quest panel each frame — check active quests, detect completion, trigger offers. */
  private updateQuestPanel(frameDt: number, _scene: SceneGraph): void {
    const activeQuests = this.core.getActiveQuests();
    this.captureCompletedQuest(activeQuests);

    if (this.hud.hasOpenPanel) {
      this.hud.hideQuestIndicator();
      this.hud.hideQuestPanel();
      return;
    }

    if (this.pendingQuestComplete) {
      this.showCompletedQuest(this.pendingQuestComplete);
      this.pendingQuestComplete = null;
      return;
    }

    if (activeQuests.length > 0) {
      const progress = activeQuests[0]!;
      const quest = this.core.getQuestById(progress.questId);

      if (quest) {
        // Detect completion (status still 'active' means in-progress)
        if (progress.status === 'completed' || progress.stepsCompleted >= quest.content.steps.length) {
          // Quest just completed — check if we already handled it
          if (this.lastQuestId === quest.id && this.lastStepsCompleted < quest.content.steps.length) {
            this.showCompletedQuest(quest);
          }
          this.lastQuestId = null;
          this.lastStepsCompleted = -1;
        } else {
          // Active quest in progress
          this.hud.showQuestPanel(quest, progress);

          // Show quest indicator when near a relevant object
          const currentStep = quest.content.steps[progress.stepsCompleted];
          if (currentStep?.targetId) {
            const objectNearby = _scene.objects.find(
              o => o.highlight && o.interactable,
            );
            if (objectNearby) {
              this.hud.showQuestIndicator('✦ Quest objective');
            } else {
              this.hud.hideQuestIndicator();
            }
          } else {
            this.hud.hideQuestIndicator();
          }

          this.lastQuestId = quest.id;
          this.lastStepsCompleted = progress.stepsCompleted;
        }
      }
    } else {
      this.hud.hideQuestIndicator();

      this.lastQuestId = null;
      this.lastStepsCompleted = -1;

      // Keep the completion panel from being overwritten by fallback guidance.
      if (this.questCompleteCooldown > 0) {
        this.questCompleteCooldown -= frameDt;
        return;
      }

      // No active quests — maybe offer one
      this.showGuidance(_scene);

      // Periodic check for available quests
      this.questCheckTimer += frameDt;
      if (this.questCheckTimer >= QUEST_CHECK_INTERVAL && !this.questOfferPending) {
        this.questCheckTimer = 0;
        const biome = this.core.getCurrentBiome();
        const available = this.core.selectAvailableQuests(biome);
        if (available.length > 0) {
          this.questOfferPending = true;
          this.questOfferCallback?.(available);
          debug('quest', `Offering ${available.length} quest(s) in ${biome}`);
        }
      }
    }
  }

  private captureCompletedQuest(activeQuests: readonly { questId: string }[]): void {
    if (activeQuests.length > 0 || !this.lastQuestId || this.lastStepsCompleted < 0) return;

    const completedQuest = this.core.getQuestById(this.lastQuestId);
    if (!completedQuest) return;

    this.pendingQuestComplete = completedQuest;
    this.lastQuestId = null;
    this.lastStepsCompleted = -1;
  }

  private showCompletedQuest(quest: Quest): void {
    this.hud.showQuestComplete(quest.title);
    this.questCompleteCooldown = QUEST_OFFER_COOLDOWN;
    this.questOfferPending = false;
    this.questCompleteCallback?.(quest);
    debug('quest', `Quest completed: ${quest.title}`);
  }

  /** Mark the quest offer as consumed (called after player accepts or dismisses). */
  clearQuestOffer(): void {
    this.questOfferPending = false;
  }

  private showGuidance(scene: SceneGraph): void {
    const highlighted = scene.objects.find(o => o.highlight && o.interactable);
    const action = this.actionLabel();

    if (highlighted?.interactable) {
      const name = highlighted.interactable.prompt.replace(/^Interact with /, '');
      const type = highlighted.interactable.interactionType;
      if (type === 'craft') {
        this.hud.showGuidance(
          'Try the Workshop',
          `${action} to use the ${name}, then choose materials to combine.`,
          'Start with pigments or pine wood; the world reacts when materials fit together.',
        );
        return;
      }
      if (type === 'talk') {
        this.hud.showGuidance(
          'Meet the Locals',
          `${action} to talk to ${name}.`,
          'NPCs can point you toward useful places, trades, and challenges.',
        );
        return;
      }
      this.hud.showGuidance(
        'Investigate the World',
        `${action} to examine ${name}.`,
        'Useful objects teach by doing; look for what changes in the world.',
      );
      return;
    }

    if (this.worldManager?.isOverworld()) {
      if (this.core.getCurrentBiome() === 'workshop') {
        this.hud.showGuidance(
          'Reach the Workbench',
          `Walk through the Workshop yard and use the outside workbench with ${action}.`,
          'Mix Red Pigment and Blue Pigment to make purple paint; the world will show what changed.',
        );
        return;
      }

      const nearby = this.worldManager.nearbyBiome;
      if (nearby && nearby.entranceDistance <= BIOME_ENTER_RANGE) {
        this.hud.showGuidance(
          `Enter ${nearby.biome.name}`,
          `${action} to step inside and find the first hands-on challenge.`,
          this.controlHint(),
        );
      } else {
        this.hud.showGuidance(
          'Find a Place to Explore',
          'Walk toward a landmark, then use the prompt when you reach its entrance.',
          this.controlHint(),
        );
      }
      return;
    }

    const activeBiome = this.worldManager?.activeBiomeId ?? this.core.getCurrentBiome();
    const biomeName = activeBiome.replace(/[-_]+/g, ' ');
    if (activeBiome === 'workshop') {
      this.hud.showGuidance(
        'First Workshop Challenge',
        `${action} at the Workbench, then select Red Pigment and Blue Pigment to mix purple paint.`,
        this.controlHint(),
      );
      return;
    }

    this.hud.showGuidance(
      `Explore ${biomeName}`,
      'Aim at objects until a prompt appears, then interact to learn what they do.',
      'The goal is not a quiz; use the world itself to discover the rule.',
    );
  }

  /** Show an interaction prompt when a highlighted interactable is nearby. */
  private updateInteractionPrompt(scene: SceneGraph): void {
    if (this.hud.hasOpenPanel) {
      this.hud.hidePrompt();
      return;
    }

    const highlighted = scene.objects.find(o => o.highlight && o.interactable);
    if (highlighted?.interactable) {
      const name = highlighted.interactable.prompt.replace(/^Interact with /, '');
      const actionText = (() => {
        switch (highlighted.interactable.interactionType) {
          case 'craft': return `use the ${name}`;
          case 'open': return `open the ${name}`;
          case 'talk': return `talk to ${name}`;
          case 'pickup': return `pick up the ${name}`;
          case 'build': return `build with the ${name}`;
          case 'use': return `use the ${name}`;
          default: return `examine the ${name}`;
        }
      })();
      const text = this.mobile
        ? `Tap to ${actionText}`
        : `${this.actionLabel()} to ${actionText}`;
      this.hud.showPrompt(text);
    } else {
      this.hud.hidePrompt();
    }
  }

  private updateActiveControl(actions: GameAction[]): void {
    for (const action of actions) {
      if (action.source === 'gamepad') {
        this.activeControl = 'gamepad';
      } else if (action.source === 'touch') {
        this.activeControl = 'touch';
      } else if (action.source === 'keyboard' || action.source === 'mouse') {
        this.activeControl = 'keyboard';
      }
    }
  }

  private actionLabel(): string {
    if (this.mobile || this.activeControl === 'touch') return 'Tap';
    if (this.activeControl === 'gamepad') return 'Press A';
    return 'Press E';
  }

  private controlHint(): string {
    if (this.mobile || this.activeControl === 'touch') {
      return 'Left thumb moves, right thumb looks, and the Action button appears when something can be used.';
    }
    if (this.activeControl === 'gamepad') {
      return 'Left stick moves, right stick looks, A uses objects, B backs out, and RB opens the map.';
    }
    return 'WASD moves, mouse looks, Shift runs, E uses objects, and M opens the map.';
  }
}
