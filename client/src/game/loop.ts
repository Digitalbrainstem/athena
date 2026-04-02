import type { NexusCore, SceneGraph, GameAction } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import type { InputManager } from '../input/manager.js';
import type { SceneRenderer } from '../renderer/scene-renderer.js';
import type { FirstPersonCamera } from '../camera/first-person.js';
import type { AudioManager } from '../audio/audio-manager.js';
import type { HUD } from '../ui/hud.js';

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
  private fpsAccumulator = 0;
  private _fps = 0;

  private readonly fixedDt: number;
  private readonly core: NexusCore;
  private readonly inputManager: InputManager;
  private readonly fpCam: FirstPersonCamera;
  private readonly sceneRenderer: SceneRenderer;
  private readonly audioManager: AudioManager;
  private readonly hud: HUD;

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

    this.accumulator += frameDt;

    let steps = 0;
    while (this.accumulator >= this.fixedDt && steps < MAX_STEPS_PER_FRAME) {
      const actions: GameAction[] = [
        ...this.inputManager.flush(),
        ...this.fpCam.flushLookActions(),
      ];
      this.core.update(this.fixedDt, actions);
      this.accumulator -= this.fixedDt;
      steps++;
    }

    if (steps >= MAX_STEPS_PER_FRAME) this.accumulator = 0;

    const sceneGraph: SceneGraph = this.core.getSceneGraph();
    this.sceneRenderer.render(sceneGraph);
    this.audioManager.process(sceneGraph.audio);
    this.hud.update(sceneGraph.ui);
    this.hud.processAnnouncements(sceneGraph.announcements);
    this.hud.processCaptions(sceneGraph.captions);
    this.hud.updateFPS(this._fps);
  };
}
