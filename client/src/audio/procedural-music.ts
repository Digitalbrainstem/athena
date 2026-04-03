// ---------------------------------------------------------------------------
// ProceduralMusic — real-time pentatonic music generation per biome
// Uses live OscillatorNodes with a look-ahead scheduling pattern to create
// non-repeating, biome-appropriate background music.
// ---------------------------------------------------------------------------

import type { Disposable } from '../types.js';
import { BIOME_SOUNDSCAPES } from './biome-soundscapes.js';

// ---------------------------------------------------------------------------
// Musical scales (frequencies)
// ---------------------------------------------------------------------------

interface BiomeMusicConfig {
  /** Root frequency */
  root: number;
  /** Scale ratios (pentatonic) */
  scale: number[];
  /** Tempo in BPM */
  bpm: number;
  /** Pad oscillator type */
  padType: OscillatorType;
  /** Melody oscillator type */
  melodyType: OscillatorType;
  /** Pad gain */
  padGain: number;
  /** Melody gain */
  melodyGain: number;
  /** Beats between melody notes */
  melodySpacing: number;
  /** Whether to include bass pulse */
  hasBass: boolean;
  /** Bass gain */
  bassGain: number;
}

function getConfigForBiome(biomeId: string): BiomeMusicConfig {
  const scape = BIOME_SOUNDSCAPES[biomeId];
  const root = scape?.keyRoot ?? 261.63;
  const scale = scape?.scaleRatios ?? [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
  const bpm = scape?.tempoBase ?? 72;

  // Biome-specific overrides for musical character
  switch (biomeId) {
    case 'workshop':
      return { root, scale, bpm, padType: 'sine', melodyType: 'triangle', padGain: 0.06, melodyGain: 0.05, melodySpacing: 2, hasBass: true, bassGain: 0.04 };
    case 'crystal-caverns':
      return { root, scale, bpm, padType: 'sine', melodyType: 'sine', padGain: 0.05, melodyGain: 0.04, melodySpacing: 4, hasBass: false, bassGain: 0 };
    case 'living-forest':
      return { root, scale, bpm, padType: 'sine', melodyType: 'triangle', padGain: 0.05, melodyGain: 0.05, melodySpacing: 2, hasBass: true, bassGain: 0.03 };
    case 'observatory':
      return { root, scale, bpm, padType: 'sine', melodyType: 'sine', padGain: 0.06, melodyGain: 0.03, melodySpacing: 4, hasBass: false, bassGain: 0 };
    case 'storm-tower':
      return { root, scale, bpm, padType: 'sawtooth', melodyType: 'sawtooth', padGain: 0.04, melodyGain: 0.04, melodySpacing: 1, hasBass: true, bassGain: 0.05 };
    case 'library-echoes':
      return { root, scale, bpm, padType: 'sine', melodyType: 'sine', padGain: 0.04, melodyGain: 0.03, melodySpacing: 3, hasBass: false, bassGain: 0 };
    default:
      return { root, scale, bpm, padType: 'sine', melodyType: 'triangle', padGain: 0.05, melodyGain: 0.04, melodySpacing: 2, hasBass: true, bassGain: 0.03 };
  }
}

// ---------------------------------------------------------------------------
// ProceduralMusic
// ---------------------------------------------------------------------------

export class ProceduralMusic implements Disposable {
  private readonly ctx: AudioContext;
  private readonly masterGain: GainNode;
  private disposed = false;
  private currentBiome: string | null = null;

  // Pad oscillators (continuous)
  private padOscs: OscillatorNode[] = [];
  private padGains: GainNode[] = [];

  // Melody scheduling
  private melodyTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private melodyIndex = 0;
  private config: BiomeMusicConfig | null = null;
  private melodyFreqs: number[] = [];

  // Bass scheduling
  private bassTimer: ReturnType<typeof setInterval> | null = null;
  private nextBassTime = 0;

  constructor(ctx: AudioContext, output: AudioNode) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(output);
  }

  getCurrentBiome(): string | null {
    return this.currentBiome;
  }

  /** Set music volume (0–1). */
  setVolume(v: number): void {
    this.masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, v)),
      this.ctx.currentTime + 0.2,
    );
  }

  /** Start music for a biome (crossfade from current). */
  startBiome(biomeId: string): void {
    if (this.disposed || biomeId === this.currentBiome) return;

    // Stop current music
    this.stopInternal(2000);

    this.currentBiome = biomeId;
    this.config = getConfigForBiome(biomeId);

    // Build frequency table: scale across 2 octaves
    this.melodyFreqs = [];
    for (const ratio of this.config.scale) {
      this.melodyFreqs.push(this.config.root * ratio);
      this.melodyFreqs.push(this.config.root * ratio * 2);
    }

    // Start pad after a brief delay
    setTimeout(() => {
      if (this.disposed || this.currentBiome !== biomeId) return;
      this.startPad();
      this.startMelody();
      if (this.config!.hasBass) this.startBass();

      // Fade in
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 3);
    }, 500);
  }

  /** Stop all music with fade. */
  stop(fadeMs = 1500): void {
    this.stopInternal(fadeMs);
    this.currentBiome = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopInternal(0);
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private stopInternal(fadeMs: number): void {
    const fadeSec = fadeMs / 1000;

    // Fade master
    if (fadeMs > 0) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeSec);
    } else {
      this.masterGain.gain.value = 0;
    }

    // Stop melody scheduler
    if (this.melodyTimer !== null) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.bassTimer !== null) {
      clearInterval(this.bassTimer);
      this.bassTimer = null;
    }

    // Clean up pad oscillators after fade
    const oscs = [...this.padOscs];
    const gains = [...this.padGains];
    this.padOscs = [];
    this.padGains = [];

    const cleanupDelay = Math.max(fadeMs + 200, 100);
    setTimeout(() => {
      for (const osc of oscs) {
        try { osc.stop(); } catch { /* ok */ }
      }
      for (const g of gains) {
        try { g.disconnect(); } catch { /* ok */ }
      }
    }, cleanupDelay);
  }

  private startPad(): void {
    if (!this.config) return;
    const cfg = this.config;
    const root = cfg.root;
    const fifth = root * 1.5;

    // Root
    this.createPadOsc(cfg.padType, root, cfg.padGain);
    // Fifth
    this.createPadOsc(cfg.padType, fifth, cfg.padGain * 0.6);
    // Octave (very quiet)
    this.createPadOsc(cfg.padType, root * 2, cfg.padGain * 0.25, 3);
  }

  private createPadOsc(type: OscillatorType, freq: number, gain: number, detune = 0): void {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    // Apply lowpass to soften pad
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;

    const g = this.ctx.createGain();
    g.gain.value = gain;

    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(0);

    this.padOscs.push(osc);
    this.padGains.push(g);
  }

  private startMelody(): void {
    if (!this.config) return;
    this.melodyIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 2; // Start melody after 2s

    this.melodyTimer = setInterval(() => {
      if (this.disposed || !this.config || this.ctx.state !== 'running') return;
      this.scheduleMelodyNotes();
    }, 200);
  }

  private scheduleMelodyNotes(): void {
    if (!this.config) return;
    const cfg = this.config;
    const beatDur = 60 / cfg.bpm;
    const scheduleAhead = 1.0; // Look 1 second ahead

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
      // Pick a note from the scale (semi-random, weighted toward consonant intervals)
      const freq = this.pickMelodyNote();
      const noteDur = beatDur * cfg.melodySpacing * 0.7;

      this.scheduleNote(
        cfg.melodyType,
        freq,
        cfg.melodyGain,
        this.nextNoteTime,
        noteDur,
      );

      this.nextNoteTime += beatDur * cfg.melodySpacing;
      this.melodyIndex++;
    }
  }

  private pickMelodyNote(): number {
    const freqs = this.melodyFreqs;
    if (freqs.length === 0) return 440;

    // Weighted random — prefer lower octave notes, occasional high notes
    const idx = this.melodyIndex;
    const base = (idx * 3 + 7) % freqs.length;
    const variation = Math.random() < 0.3 ? Math.floor(Math.random() * freqs.length) : base;
    return freqs[variation]!;
  }

  private scheduleNote(
    type: OscillatorType,
    freq: number,
    gain: number,
    startTime: number,
    duration: number,
  ): void {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    // Soften with lowpass
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;

    const g = this.ctx.createGain();
    // ADSR: quick attack, sustain, slow release
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.05);
    g.gain.setValueAtTime(gain * 0.8, startTime + duration * 0.4);
    g.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private startBass(): void {
    if (!this.config) return;
    this.nextBassTime = this.ctx.currentTime + 1;

    this.bassTimer = setInterval(() => {
      if (this.disposed || !this.config || this.ctx.state !== 'running') return;
      this.scheduleBassNotes();
    }, 200);
  }

  private scheduleBassNotes(): void {
    if (!this.config) return;
    const cfg = this.config;
    const beatDur = 60 / cfg.bpm;
    const scheduleAhead = 1.0;
    const bassFreq = cfg.root / 2;

    while (this.nextBassTime < this.ctx.currentTime + scheduleAhead) {
      const noteDur = beatDur * 0.5;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = bassFreq;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, this.nextBassTime);
      g.gain.linearRampToValueAtTime(cfg.bassGain, this.nextBassTime + 0.03);
      g.gain.linearRampToValueAtTime(0, this.nextBassTime + noteDur);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(this.nextBassTime);
      osc.stop(this.nextBassTime + noteDur + 0.05);

      this.nextBassTime += beatDur * 2; // Bass on every other beat
    }
  }
}
