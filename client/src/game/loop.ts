import type { NexusCore, SceneGraph, GameAction, MovePayload, LookPayload } from '@nexus-academy/core';
import { updateHighlights } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import type { InputManager } from '../input/manager.js';
import type { SceneRenderer } from '../renderer/scene-renderer.js';
import type { FirstPersonCamera } from '../camera/first-person.js';
import type { AudioManager } from '../audio/audio-manager.js';
import type { HUD } from '../ui/hud.js';
import type { WorldManager } from '../world/world-manager.js';
import { debug, debugSceneGraph } from '../debug.js';

const DEFAULT_FIXED_DT = 1 / 60;
const MAX_FRAME_TIME = 0.25;
const MAX_STEPS_PER_FRAME = 8;

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

  // --- Footstep movement tracking ---
  private lastPosX = 0;
  private lastPosZ = 0;
  private positionTracked = false;

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
  setMobile(mobile: boolean): void { this.mobile = mobile; }

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

    let steps = 0;
    while (this.accumulator >= this.fixedDt && steps < MAX_STEPS_PER_FRAME) {
      const rawActions: GameAction[] = [
        ...this.inputManager.flush(),
        ...this.fpCam.flushLookActions(),
      ];

      // Feed raw movement input into the FP camera's velocity system
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

      // Update velocity physics (acceleration / friction / clamping / collision)
      this.fpCam.updateMovement(this.fixedDt);

      // Write authoritative position back into the ECS
      this.core.setPlayerPosition(this.fpCam.posX, this.fpCam.posZ);

      // Replace raw move actions with smoothed ones from the velocity system
      const nonMoveActions = rawActions.filter(a => a.type !== 'move');
      const smoothedMoves = this.fpCam.flushMoveActions();
      const actions = [...nonMoveActions, ...smoothedMoves];

      this.core.update(this.fixedDt, actions);
      this.accumulator -= this.fixedDt;
      steps++;
    }

    if (steps >= MAX_STEPS_PER_FRAME) this.accumulator = 0;

    const sceneGraph: SceneGraph = this.core.getSceneGraph();

    // Update collision boxes — only inside buildings (overworld has no invisible walls)
    if (this.worldManager && !this.worldManager.isOverworld()) {
      this.fpCam.updateCollisionBoxes(sceneGraph.objects);
      this.fpCam.addExtraCollisionBoxes(this.worldManager.getExtraCollisionBoxes());
    } else {
      this.fpCam.updateCollisionBoxes([]);
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
    }

    // Recompute highlights using the client-authoritative camera position.
    // The scene graph was built with the ECS player position which should
    // match, but re-running ensures the prompt always tracks the real camera.
    const playerGroundPos = { x: eye.x, y: 0, z: eye.z };
    const highlighted = updateHighlights(sceneGraph, playerGroundPos);

    // Debug: log scene graph once on first frame only
    if (!this.firstFrameLogged) {
      this.firstFrameLogged = true;
      debug('scene', 'First frame scene graph:');
      debugSceneGraph(highlighted);
      debug('render', 'Ground:', highlighted.ground);
      debug('render', 'Sky:', highlighted.sky);
      debug('camera', 'Camera:', highlighted.camera);
    }

    // Show / hide interaction prompts based on highlight state
    this.updateInteractionPrompt(highlighted);

    // WorldManager biome proximity prompts
    if (this.worldManager) {
      if (this.worldManager.isOverworld()) {
        const nearby = this.worldManager.nearbyBiome;
        if (nearby && nearby.entranceDistance < 5) {
          this.hud.showPrompt(`Press E to enter ${nearby.biome.name}`);
        }
      } else if (this.worldManager.isInside() && this.worldManager.isNearDoor) {
        this.hud.showPrompt('Press E to exit');
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
  };

  /** Show an interaction prompt when a highlighted interactable is nearby. */
  private updateInteractionPrompt(scene: SceneGraph): void {
    const highlighted = scene.objects.find(o => o.highlight && o.interactable);
    if (highlighted?.interactable) {
      const name = highlighted.interactable.prompt.replace(/^Interact with /, '');
      const text = this.mobile
        ? `Tap to examine the ${name}`
        : `Press E to examine the ${name}`;
      this.hud.showPrompt(text);
    } else {
      this.hud.hidePrompt();
    }
  }
}
