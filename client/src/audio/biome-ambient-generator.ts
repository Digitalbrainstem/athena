// ---------------------------------------------------------------------------
// BiomeAmbientGenerator — real-time ambient soundscapes per biome
// Uses live Web Audio nodes (noise generators, oscillators, scheduled events)
// to create rich, non-repeating environmental audio.
// ---------------------------------------------------------------------------

import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Noise buffer helpers
// ---------------------------------------------------------------------------

function createNoiseBuffer(ctx: AudioContext, seconds: number, color: 'white' | 'pink' | 'brown'): AudioBuffer {
  const length = Math.ceil(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === 'white') {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  } else if (color === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    // brown
    let last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }

  return buffer;
}

// ---------------------------------------------------------------------------
// Active ambient state
// ---------------------------------------------------------------------------

interface ActiveAmbient {
  masterGain: GainNode;
  stopFns: (() => void)[];
}

// ---------------------------------------------------------------------------
// Helper: create a looping noise layer
// ---------------------------------------------------------------------------

function addNoiseLayer(
  ctx: AudioContext,
  output: AudioNode,
  noiseBuffer: AudioBuffer,
  gain: number,
  opts?: {
    lowpass?: number;
    highpass?: number;
    bandpassFreq?: number;
    bandpassQ?: number;
  },
): () => void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;

  const gainNode = ctx.createGain();
  gainNode.gain.value = gain;

  let chain: AudioNode = src;

  if (opts?.highpass) {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = opts.highpass;
    chain.connect(hp);
    chain = hp;
  }
  if (opts?.lowpass) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = opts.lowpass;
    chain.connect(lp);
    chain = lp;
  }
  if (opts?.bandpassFreq) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = opts.bandpassFreq;
    bp.Q.value = opts.bandpassQ ?? 1;
    chain.connect(bp);
    chain = bp;
  }

  chain.connect(gainNode);
  gainNode.connect(output);
  src.start(0);

  return () => { try { src.stop(); } catch { /* already stopped */ } };
}

// ---------------------------------------------------------------------------
// Helper: create a sustained oscillator layer
// ---------------------------------------------------------------------------

function addOscLayer(
  ctx: AudioContext,
  output: AudioNode,
  type: OscillatorType,
  frequency: number,
  gain: number,
  detune = 0,
): () => void {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.detune.value = detune;

  const g = ctx.createGain();
  g.gain.value = gain;
  osc.connect(g);
  g.connect(output);
  osc.start(0);

  return () => { try { osc.stop(); } catch { /* already stopped */ } };
}

// ---------------------------------------------------------------------------
// Helper: schedule periodic one-shot events
// ---------------------------------------------------------------------------

type OneShotBuilder = (ctx: AudioContext, output: AudioNode) => void;

function schedulePeriodicEvent(
  ctx: AudioContext,
  output: AudioNode,
  builder: OneShotBuilder,
  minInterval: number,
  maxInterval: number,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function schedule(): void {
    if (stopped) return;
    const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000;
    timer = setTimeout(() => {
      if (stopped || ctx.state !== 'running') { schedule(); return; }
      builder(ctx, output);
      schedule();
    }, delay);
  }
  schedule();

  return () => {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
  };
}

// ---------------------------------------------------------------------------
// One-shot sound builders
// ---------------------------------------------------------------------------

/** Short chirp — bird or similar */
function buildChirp(
  ctx: AudioContext, output: AudioNode,
  freqStart: number, freqEnd: number, duration: number, gain: number,
): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), now + duration);

  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, now);
  g.gain.setValueAtTime(gain, now + duration * 0.3);
  g.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(g);
  g.connect(output);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

/** Water drip — short high sine with fast decay */
function buildDrip(ctx: AudioContext, output: AudioNode, gain: number): void {
  const now = ctx.currentTime;
  const freq = 2000 + Math.random() * 2500;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.12);

  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(g);
  g.connect(output);
  osc.start(now);
  osc.stop(now + 0.16);
}

/** Metallic tap — short square wave burst */
function buildTap(ctx: AudioContext, output: AudioNode, freq: number, gain: number): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;

  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2000;

  osc.connect(lp);
  lp.connect(g);
  g.connect(output);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** Crystal chime — sine with shimmer (two detuned oscillators) */
function buildChime(ctx: AudioContext, output: AudioNode, gain: number): void {
  const now = ctx.currentTime;
  const baseFreq = 800 + Math.random() * 600;
  const duration = 0.6 + Math.random() * 0.4;

  for (const detune of [0, 7, -5]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    osc.detune.value = detune;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain * 0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(g);
    g.connect(output);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }
}

/** Electric zap — short white noise burst */
function buildZap(ctx: AudioContext, output: AudioNode, gain: number): void {
  const now = ctx.currentTime;
  const dur = 0.05 + Math.random() * 0.1;
  const length = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;

  const g = ctx.createGain();
  g.gain.value = gain;

  src.connect(hp);
  hp.connect(g);
  g.connect(output);
  src.start(now);
}

/** Thunder rumble — low-frequency noise burst */
function buildThunder(ctx: AudioContext, output: AudioNode, gain: number): void {
  const now = ctx.currentTime;
  const dur = 1.5 + Math.random() * 1.5;
  const length = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    const env = Math.pow(1 - i / length, 2);
    data[i] = last * 3.5 * env;
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 250;

  const g = ctx.createGain();
  g.gain.value = gain;

  src.connect(lp);
  lp.connect(g);
  g.connect(output);
  src.start(now);
}

/** Wood creak — short brown noise burst */
function buildCreak(ctx: AudioContext, output: AudioNode, gain: number): void {
  const now = ctx.currentTime;
  const dur = 0.15 + Math.random() * 0.1;
  const length = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    const env = Math.pow(1 - i / length, 3);
    data[i] = last * 3.5 * env;
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 250;

  const g = ctx.createGain();
  g.gain.value = gain;

  src.connect(lp);
  lp.connect(g);
  g.connect(output);
  src.start(now);
}

// ---------------------------------------------------------------------------
// Biome ambient builders — each returns an array of stop functions
// ---------------------------------------------------------------------------

function buildWorkshopAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Warm room tone
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.12, { lowpass: 350 }));
  // Subtle hum
  stops.push(addOscLayer(ctx, output, 'sine', 160, 0.035));
  // Higher warmth
  stops.push(addOscLayer(ctx, output, 'sine', 240, 0.015, 3));
  // Gear ticking
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildTap(c, o, 1200, 0.08), 1.5, 2.5));
  // Distant hammering
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildTap(c, o, 600 + Math.random() * 200, 0.06), 4, 8));
  // Wood creak
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildCreak(c, o, 0.1), 10, 22));

  return stops;
}

function buildCavernAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Cave wind
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.08, { lowpass: 180 }));
  // Crystal resonance — root
  stops.push(addOscLayer(ctx, output, 'sine', 110, 0.04));
  // Crystal resonance — fifth
  stops.push(addOscLayer(ctx, output, 'sine', 165, 0.025));
  // Sub bass
  stops.push(addOscLayer(ctx, output, 'sine', 55, 0.03));
  // Water drips
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildDrip(c, o, 0.12), 1.5, 5));
  // Crystal chimes
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChime(c, o, 0.08), 5, 14));
  // Distant drip (quieter, further apart)
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildDrip(c, o, 0.05), 3, 8));

  return stops;
}

function buildForestAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Leaves rustling
  stops.push(addNoiseLayer(ctx, output, noise.pink, 0.09, { bandpassFreq: 2000, bandpassQ: 0.8 }));
  // Stream water
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.11, { lowpass: 600, highpass: 150 }));
  // Gentle wind
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.06, { lowpass: 300 }));
  // Bird chirp variant 1 — ascending
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 2200, 3800, 0.12, 0.1), 3, 7));
  // Bird chirp variant 2 — descending
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 3500, 2000, 0.15, 0.08), 4, 9));
  // Bird song — longer call
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 1800, 2600, 0.3, 0.07), 8, 16));
  // Distant bird
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 1500, 900, 0.4, 0.04), 10, 22));
  // Insect buzz (very subtle)
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => {
      const now = c.currentTime;
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2800 + Math.random() * 400;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.02, now + 0.1);
      g.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(g); g.connect(o);
      osc.start(now); osc.stop(now + 0.41);
    }, 8, 18));

  return stops;
}

function buildObservatoryAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Deep space drone
  stops.push(addOscLayer(ctx, output, 'sine', 42, 0.04));
  // Space pad — detuned sines
  stops.push(addOscLayer(ctx, output, 'sine', 220, 0.02, 5));
  stops.push(addOscLayer(ctx, output, 'sine', 330, 0.015, -3));
  stops.push(addOscLayer(ctx, output, 'sine', 440, 0.01, 7));
  // High altitude wind
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.06, { lowpass: 150 }));
  // Distant mechanism
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => {
      const now = c.currentTime;
      const dur = 0.8 + Math.random() * 0.5;
      const src = c.createBufferSource();
      const len = Math.ceil(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      src.buffer = buf;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 2;
      const g = c.createGain(); g.gain.value = 0.03;
      src.connect(bp); bp.connect(g); g.connect(o);
      src.start(now);
    }, 15, 30));

  return stops;
}

function buildStormTowerAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Wind howl
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.16, { lowpass: 800, highpass: 150 }));
  // Higher wind
  stops.push(addNoiseLayer(ctx, output, noise.pink, 0.06, { bandpassFreq: 600, bandpassQ: 0.5 }));
  // Tension drone
  stops.push(addOscLayer(ctx, output, 'sawtooth', 80, 0.02));
  // Electric zaps
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildZap(c, o, 0.12), 2, 7));
  // Thunder
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildThunder(c, o, 0.15), 10, 25));

  return stops;
}

function buildDefaultAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Gentle wind
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.10, { lowpass: 400 }));
  // Nature hum
  stops.push(addOscLayer(ctx, output, 'sine', 120, 0.02));
  // Occasional bird
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 2200, 3200, 0.12, 0.07), 5, 12));
  // Distant bird call
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 1600, 1000, 0.35, 0.04), 12, 25));

  return stops;
}

function buildLibraryAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Room tone — very quiet
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.04, { lowpass: 200 }));
  // Subtle warmth
  stops.push(addOscLayer(ctx, output, 'sine', 100, 0.015));
  // Page turn / rustle
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => {
      const now = c.currentTime;
      const len = Math.ceil(c.sampleRate * 0.15);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      const src = c.createBufferSource(); src.buffer = buf;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = c.createGain(); g.gain.value = 0.05;
      src.connect(lp); lp.connect(g); g.connect(o);
      src.start(now);
    }, 6, 18));
  // Candle flicker sound (very subtle crackling)
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => {
      const now = c.currentTime;
      const len = Math.ceil(c.sampleRate * 0.05);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      const src = c.createBufferSource(); src.buffer = buf;
      const g = c.createGain(); g.gain.value = 0.02;
      src.connect(g); g.connect(o);
      src.start(now);
    }, 2, 6));

  return stops;
}

function buildTradingPostAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Crowd murmur
  stops.push(addNoiseLayer(ctx, output, noise.pink, 0.07, { lowpass: 800, highpass: 200 }));
  // Wind
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.05, { lowpass: 300 }));
  // Coin clinks
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildTap(c, o, 3000 + Math.random() * 1500, 0.06), 2, 5));
  // Bell
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChime(c, o, 0.05), 8, 18));

  return stops;
}

function buildLabAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Equipment hum
  stops.push(addOscLayer(ctx, output, 'sine', 120, 0.03));
  stops.push(addOscLayer(ctx, output, 'sine', 180, 0.015, 2));
  // Air circulation
  stops.push(addNoiseLayer(ctx, output, noise.pink, 0.05, { lowpass: 500 }));
  // Bubbling
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildDrip(c, o, 0.06), 1, 3));
  // Electrical tick
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildTap(c, o, 2000, 0.04), 3, 7));

  return stops;
}

function buildShipyardAmbient(ctx: AudioContext, output: AudioNode, noise: NoiseBuffers): (() => void)[] {
  const stops: (() => void)[] = [];

  // Waves
  stops.push(addNoiseLayer(ctx, output, noise.brown, 0.12, { lowpass: 500 }));
  // Wind
  stops.push(addNoiseLayer(ctx, output, noise.pink, 0.06, { bandpassFreq: 400, bandpassQ: 0.5 }));
  // Rope creak
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildCreak(c, o, 0.08), 5, 12));
  // Ship bell
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChime(c, o, 0.07), 12, 30));
  // Seagull
  stops.push(schedulePeriodicEvent(ctx, output,
    (c, o) => buildChirp(c, o, 1800, 1200, 0.5, 0.06), 8, 20));

  return stops;
}

// ---------------------------------------------------------------------------
// Noise buffer cache
// ---------------------------------------------------------------------------

interface NoiseBuffers {
  white: AudioBuffer;
  pink: AudioBuffer;
  brown: AudioBuffer;
}

// ---------------------------------------------------------------------------
// BiomeAmbientGenerator
// ---------------------------------------------------------------------------

export class BiomeAmbientGenerator implements Disposable {
  private readonly ctx: AudioContext;
  private readonly output: AudioNode;
  private noise: NoiseBuffers | null = null;
  private active: ActiveAmbient | null = null;
  private currentBiome: string | null = null;
  private disposed = false;

  constructor(ctx: AudioContext, output: AudioNode) {
    this.ctx = ctx;
    this.output = output;
  }

  getCurrentBiome(): string | null {
    return this.currentBiome;
  }

  /** Start playing ambient for a biome (crossfade from current). */
  startBiome(biomeId: string): void {
    if (this.disposed || biomeId === this.currentBiome) return;

    // Ensure noise buffers exist
    if (!this.noise) {
      this.noise = {
        white: createNoiseBuffer(this.ctx, 2, 'white'),
        pink: createNoiseBuffer(this.ctx, 2, 'pink'),
        brown: createNoiseBuffer(this.ctx, 2, 'brown'),
      };
    }

    // Fade out old ambient
    if (this.active) {
      this.fadeOutAndClean(this.active, 2500);
    }

    this.currentBiome = biomeId;

    // Build new ambient
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2.5);
    masterGain.connect(this.output);

    const stopFns = this.buildBiomeAmbient(biomeId, masterGain);

    this.active = { masterGain, stopFns };
  }

  /** Stop all ambient with optional fade. */
  stop(fadeMs = 1000): void {
    if (this.active) {
      this.fadeOutAndClean(this.active, fadeMs);
      this.active = null;
      this.currentBiome = null;
    }
  }

  /** Set ambient volume (0–1). */
  setVolume(v: number): void {
    if (this.active) {
      this.active.masterGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, v)),
        this.ctx.currentTime + 0.1,
      );
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop(0);
    this.noise = null;
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private fadeOutAndClean(ambient: ActiveAmbient, fadeMs: number): void {
    const fadeSec = fadeMs / 1000;
    ambient.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeSec);

    setTimeout(() => {
      for (const stop of ambient.stopFns) stop();
      try { ambient.masterGain.disconnect(); } catch { /* ok */ }
    }, fadeMs + 200);
  }

  private buildBiomeAmbient(biomeId: string, output: AudioNode): (() => void)[] {
    const noise = this.noise!;

    switch (biomeId) {
      case 'workshop':          return buildWorkshopAmbient(this.ctx, output, noise);
      case 'crystal-caverns':   return buildCavernAmbient(this.ctx, output, noise);
      case 'living-forest':     return buildForestAmbient(this.ctx, output, noise);
      case 'observatory':       return buildObservatoryAmbient(this.ctx, output, noise);
      case 'storm-tower':       return buildStormTowerAmbient(this.ctx, output, noise);
      case 'library-echoes':    return buildLibraryAmbient(this.ctx, output, noise);
      case 'trading-post':
      case 'marketplace':       return buildTradingPostAmbient(this.ctx, output, noise);
      case 'alchemist-lab':
      case 'laboratory':        return buildLabAmbient(this.ctx, output, noise);
      case 'shipyard':          return buildShipyardAmbient(this.ctx, output, noise);
      case 'farm':
      case 'healers-sanctuary':
      case 'explorers-map':     return buildForestAmbient(this.ctx, output, noise);
      case 'code-forge':
      case 'digital-world':     return buildLabAmbient(this.ctx, output, noise);
      case 'ancient-ruins':
      case 'time-rift':         return buildCavernAmbient(this.ctx, output, noise);
      case 'arena':
      case 'debate-hall':       return buildTradingPostAmbient(this.ctx, output, noise);
      case 'gallery':
      case 'theater':
      case 'music-hall':        return buildLibraryAmbient(this.ctx, output, noise);
      case 'newsroom':          return buildWorkshopAmbient(this.ctx, output, noise);
      default:                  return buildDefaultAmbient(this.ctx, output, noise);
    }
  }
}
