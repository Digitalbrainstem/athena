// ---------------------------------------------------------------------------
// MusicGenerator — adaptive procedural music using Web Audio API
// Generates biome-appropriate music in 3 layers: ambient, activity, intensity.
// Handles crossfading between biomes.
// ---------------------------------------------------------------------------

import type { Disposable } from '../types.js';
import { SoundSynthesizer } from './synthesizer.js';
import { BIOME_SOUNDSCAPES, getBiomeMusicCaption } from './biome-soundscapes.js';
import type { MusicLayer } from './biome-soundscapes.js';

// ---------------------------------------------------------------------------
// Layer state tracking
// ---------------------------------------------------------------------------

interface ActiveLayer {
  source: AudioBufferSourceNode;
  gain: GainNode;
  biomeId: string;
  layer: MusicLayer;
}

// ---------------------------------------------------------------------------
// Caption callback
// ---------------------------------------------------------------------------

export type MusicCaptionCallback = (caption: string) => void;

// ---------------------------------------------------------------------------
// MusicGenerator
// ---------------------------------------------------------------------------

export class MusicGenerator implements Disposable {
  private readonly ctx: AudioContext;
  private readonly synth: SoundSynthesizer;
  private readonly masterGain: GainNode;
  private readonly activeLayers = new Map<MusicLayer, ActiveLayer>();
  private currentBiome: string | null = null;
  private disposed = false;

  /** Called whenever a music layer starts, providing caption text. */
  onCaption: MusicCaptionCallback | null = null;

  constructor(context: AudioContext, synthesizer: SoundSynthesizer) {
    this.ctx = context;
    this.synth = synthesizer;
    this.masterGain = context.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(context.destination);
  }

  /** Set master music volume (0–1). */
  setVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /** Get current master music volume. */
  getVolume(): number {
    return this.masterGain.gain.value;
  }

  /** Get the currently active biome, if any. */
  getCurrentBiome(): string | null {
    return this.currentBiome;
  }

  /**
   * Generate and start playing a specific layer for a biome.
   * If a layer is already playing, it replaces it with a quick crossfade.
   */
  generateLayer(biomeId: string, layer: MusicLayer): void {
    if (this.disposed) return;

    const soundscape = BIOME_SOUNDSCAPES[biomeId];
    if (!soundscape) return;

    // Stop existing layer of this type
    this.stopLayer(layer, 500);

    // Generate the buffer
    const buffer = this.synth.generateMusicLayer(biomeId, layer);

    // Create source
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Create gain for this layer with fade-in
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(
      this.getLayerVolume(layer),
      this.ctx.currentTime + 0.5,
    );

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.activeLayers.set(layer, { source, gain, biomeId, layer });
    this.currentBiome = biomeId;

    // Emit caption
    const caption = getBiomeMusicCaption(biomeId, layer);
    this.onCaption?.(caption);

    // Cleanup on end (in case the buffer isn't looping)
    source.onended = () => {
      if (this.activeLayers.get(layer)?.source === source) {
        this.activeLayers.delete(layer);
      }
    };
  }

  /**
   * Crossfade from one biome's music to another over the specified duration.
   */
  crossfade(fromBiome: string, toBiome: string, durationMs: number): void {
    if (this.disposed) return;
    if (fromBiome === toBiome) return;

    const fadeSec = durationMs / 1000;

    // Fade out all current layers
    for (const [layer, active] of this.activeLayers) {
      if (active.biomeId === fromBiome) {
        active.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeSec);
        const sourceRef = active.source;
        setTimeout(() => {
          try { sourceRef.stop(); } catch { /* already stopped */ }
        }, durationMs + 100);
      }
    }

    // After a brief overlap, start the new biome layers
    const startDelay = fadeSec * 0.3;

    // Only start layers that were previously active (or at least ambient)
    const layersToStart: MusicLayer[] = [];
    for (const [layer, active] of this.activeLayers) {
      if (active.biomeId === fromBiome) {
        layersToStart.push(layer);
      }
    }

    // Always ensure ambient plays
    if (!layersToStart.includes('ambient')) {
      layersToStart.push('ambient');
    }

    setTimeout(() => {
      if (this.disposed) return;
      for (const layer of layersToStart) {
        this.activeLayers.delete(layer);
        this.generateLayer(toBiome, layer);
      }
    }, startDelay * 1000);
  }

  /**
   * Set the activity state, fading in/out the activity and intensity layers.
   */
  setActivityLevel(level: 'idle' | 'active' | 'intense'): void {
    if (this.disposed || !this.currentBiome) return;

    switch (level) {
      case 'idle':
        // Only ambient
        this.stopLayer('activity', 1500);
        this.stopLayer('intensity', 1500);
        break;
      case 'active':
        // Ambient + activity
        if (!this.activeLayers.has('activity')) {
          this.generateLayer(this.currentBiome, 'activity');
        }
        this.stopLayer('intensity', 1500);
        break;
      case 'intense':
        // All layers
        if (!this.activeLayers.has('activity')) {
          this.generateLayer(this.currentBiome, 'activity');
        }
        if (!this.activeLayers.has('intensity')) {
          this.generateLayer(this.currentBiome, 'intensity');
        }
        break;
    }
  }

  /**
   * Stop a specific layer with optional fade-out.
   */
  stopLayer(layer: MusicLayer, fadeOutMs = 0): void {
    const active = this.activeLayers.get(layer);
    if (!active) return;

    if (fadeOutMs > 0) {
      const fadeSec = fadeOutMs / 1000;
      active.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeSec);
      const sourceRef = active.source;
      setTimeout(() => {
        try { sourceRef.stop(); } catch { /* already stopped */ }
      }, fadeOutMs + 100);
    } else {
      try { active.source.stop(); } catch { /* already stopped */ }
    }

    this.activeLayers.delete(layer);
  }

  /**
   * Stop all music layers.
   */
  stopAll(fadeOutMs = 1000): void {
    for (const layer of ['ambient', 'activity', 'intensity'] as MusicLayer[]) {
      this.stopLayer(layer, fadeOutMs);
    }
    this.currentBiome = null;
  }

  /**
   * Check if a specific layer is currently playing.
   */
  isLayerPlaying(layer: MusicLayer): boolean {
    return this.activeLayers.has(layer);
  }

  /**
   * Get all currently active layers.
   */
  getActiveLayers(): MusicLayer[] {
    return [...this.activeLayers.keys()];
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    for (const active of this.activeLayers.values()) {
      try { active.source.stop(); } catch { /* already stopped */ }
    }
    this.activeLayers.clear();
    this.currentBiome = null;
    this.onCaption = null;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private getLayerVolume(layer: MusicLayer): number {
    switch (layer) {
      case 'ambient': return 0.5;
      case 'activity': return 0.35;
      case 'intensity': return 0.3;
    }
  }
}
