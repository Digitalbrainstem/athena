import type { Disposable, FixedUpdateCallback, FrameUpdateCallback, RenderCallback } from '../types.js';

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
  private readonly onFixedUpdate: FixedUpdateCallback;
  private readonly onFrameUpdate: FrameUpdateCallback;
  private readonly onRender: RenderCallback;

  constructor(
    onFixedUpdate: FixedUpdateCallback,
    onFrameUpdate: FrameUpdateCallback,
    onRender: RenderCallback,
    fixedDt = DEFAULT_FIXED_DT,
  ) {
    this.onFixedUpdate = onFixedUpdate;
    this.onFrameUpdate = onFrameUpdate;
    this.onRender = onRender;
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
      this.onFixedUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps++;
    }

    if (steps >= MAX_STEPS_PER_FRAME) this.accumulator = 0;

    const alpha = this.accumulator / this.fixedDt;
    this.onFrameUpdate(frameDt, alpha);
    this.onRender(alpha);
  };
}
