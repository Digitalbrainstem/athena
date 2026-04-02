import type { AudioCue, Vec3 } from '../types.js';
import type { Disposable } from '../types.js';

const FADE_DURATION_MS = 1000;

export class AudioManager implements Disposable {
  private ctx: AudioContext | null = null;
  private readonly activeSources = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  private readonly audioCache = new Map<string, AudioBuffer>();
  private disposed = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  process(cues: AudioCue[]): void {
    if (this.disposed || cues.length === 0) return;

    for (const cue of cues) {
      switch (cue.action) {
        case 'play': this.play(cue); break;
        case 'stop': this.stop(cue.id); break;
        case 'fade_in': this.fadeIn(cue); break;
        case 'fade_out': this.fadeOut(cue.id); break;
      }
    }
  }

  private play(cue: AudioCue): void {
    this.stop(cue.id);

    const ctx = this.ensureContext();
    const buffer = this.audioCache.get(cue.asset);

    if (!buffer) {
      this.loadAudio(cue.asset);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = cue.loop;

    const gain = ctx.createGain();
    gain.gain.value = cue.volume;

    source.connect(gain);

    if (cue.position) {
      this.connectSpatial(ctx, gain, cue.position);
    } else {
      gain.connect(ctx.destination);
    }

    source.start(0);
    this.activeSources.set(cue.id, { source, gain });

    source.onended = () => {
      this.activeSources.delete(cue.id);
    };
  }

  private stop(id: string): void {
    const entry = this.activeSources.get(id);
    if (entry) {
      try { entry.source.stop(); } catch { /* already stopped */ }
      this.activeSources.delete(id);
    }
  }

  private fadeIn(cue: AudioCue): void {
    this.stop(cue.id);

    const ctx = this.ensureContext();
    const buffer = this.audioCache.get(cue.asset);
    if (!buffer) {
      this.loadAudio(cue.asset);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = cue.loop;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(cue.volume, ctx.currentTime + FADE_DURATION_MS / 1000);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    this.activeSources.set(cue.id, { source, gain });
    source.onended = () => { this.activeSources.delete(cue.id); };
  }

  private fadeOut(id: string): void {
    const entry = this.activeSources.get(id);
    if (!entry || !this.ctx) return;

    entry.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + FADE_DURATION_MS / 1000);
    setTimeout(() => this.stop(id), FADE_DURATION_MS);
  }

  private connectSpatial(ctx: AudioContext, gain: GainNode, position: Vec3): void {
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    gain.connect(panner);
    panner.connect(ctx.destination);
  }

  private loadAudio(asset: string): void {
    if (this.audioCache.has(asset)) return;

    const ctx = this.ensureContext();
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * 0.01, sampleRate);
    this.audioCache.set(asset, buffer);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    for (const entry of this.activeSources.values()) {
      try { entry.source.stop(); } catch { /* already stopped */ }
    }
    this.activeSources.clear();
    this.audioCache.clear();

    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
