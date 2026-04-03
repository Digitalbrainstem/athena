// ---------------------------------------------------------------------------
// FootstepManager — terrain-based footstep sound triggering
// Plays the appropriate footstep SFX based on ground type and player speed.
// ---------------------------------------------------------------------------

import type { Disposable } from '../types.js';
import { SoundSynthesizer } from './synthesizer.js';

// ---------------------------------------------------------------------------
// Ground type → footstep SFX mapping
// ---------------------------------------------------------------------------

const GROUND_TO_SFX: Record<string, string> = {
  'wood':       'footstep-wood',
  'grass':      'footstep-grass',
  'stone':      'footstep-stone',
  'rock':       'footstep-stone',
  'sandstone':  'footstep-sand',
  'sand':       'footstep-sand',
  'metal':      'footstep-metal',
  'water':      'footstep-water',
  'marble':     'footstep-stone',
  'lab-floor':  'footstep-stone',
  'crystal':    'footstep-stone',
  'dirt':       'footstep-grass',
};

const DEFAULT_SFX = 'footstep-grass';

/** Walk step interval in seconds */
const WALK_INTERVAL = 0.45;
/** Run step interval in seconds */
const RUN_INTERVAL = 0.28;
/** Minimum speed (units/s) to trigger footsteps */
const SPEED_THRESHOLD = 0.5;
/** Speed above which player is considered running */
const RUN_SPEED = 5.0;

// ---------------------------------------------------------------------------
// FootstepManager
// ---------------------------------------------------------------------------

export class FootstepManager implements Disposable {
  private readonly ctx: AudioContext;
  private readonly output: AudioNode;
  private readonly synth: SoundSynthesizer;
  private readonly bufferCache = new Map<string, AudioBuffer>();
  private stepTimer = 0;
  private disposed = false;

  constructor(ctx: AudioContext, output: AudioNode, synth: SoundSynthesizer) {
    this.ctx = ctx;
    this.output = output;
    this.synth = synth;
  }

  /**
   * Called each frame with movement info.
   * @param dt Frame delta time in seconds
   * @param speed Player speed in units/second
   * @param groundType Ground type string from GroundDescriptor.type
   */
  tick(dt: number, speed: number, groundType: string): void {
    if (this.disposed || speed < SPEED_THRESHOLD) {
      this.stepTimer = 0;
      return;
    }

    const isRunning = speed >= RUN_SPEED;
    const interval = isRunning ? RUN_INTERVAL : WALK_INTERVAL;

    this.stepTimer += dt;
    if (this.stepTimer >= interval) {
      this.stepTimer -= interval;
      this.playStep(groundType, isRunning);
    }
  }

  /** Reset the step timer (e.g. when player stops). */
  reset(): void {
    this.stepTimer = 0;
  }

  dispose(): void {
    this.disposed = true;
    this.bufferCache.clear();
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private playStep(groundType: string, isRunning: boolean): void {
    if (this.ctx.state !== 'running') return;

    const sfxId = GROUND_TO_SFX[groundType] ?? DEFAULT_SFX;
    let buffer = this.bufferCache.get(sfxId);
    if (!buffer) {
      buffer = this.synth.generateSFX(sfxId);
      this.bufferCache.set(sfxId, buffer);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    // Slight playback rate variation for natural feel
    src.playbackRate.value = 0.9 + Math.random() * 0.2;

    const gain = this.ctx.createGain();
    // Running footsteps are louder
    gain.gain.value = isRunning ? 0.35 : 0.25;

    src.connect(gain);
    gain.connect(this.output);
    src.start(0);
  }
}
