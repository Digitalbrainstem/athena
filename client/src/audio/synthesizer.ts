// ---------------------------------------------------------------------------
// SoundSynthesizer — procedural audio generation using Web Audio API
// Generates ALL game sounds at runtime. No external audio files.
// ---------------------------------------------------------------------------

import type { SFXRecipe, OscillatorStep, NoiseStep } from './sfx-library.js';
import { SFX_REGISTRY, getSFXCaption } from './sfx-library.js';
import type { BiomeSoundscape } from './biome-soundscapes.js';
import { BIOME_SOUNDSCAPES, getBiomeMusicCaption } from './biome-soundscapes.js';

// ---------------------------------------------------------------------------
// Noise buffer generation
// ---------------------------------------------------------------------------

function createNoiseBuffer(
  ctx: AudioContext,
  durationSec: number,
  color: 'white' | 'pink' | 'brown',
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (color === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (color === 'pink') {
    // Voss-McCartney pink noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // normalize
    }
  } else {
    // Brown noise: integrated white noise
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5; // normalize
    }
  }

  return buffer;
}

// ---------------------------------------------------------------------------
// SoundSynthesizer
// ---------------------------------------------------------------------------

export class SoundSynthesizer {
  private readonly ctx: AudioContext;
  private readonly bufferCache = new Map<string, AudioBuffer>();

  constructor(context: AudioContext) {
    this.ctx = context;
  }

  /**
   * Generate a sound effect AudioBuffer from a recipe.
   * Results are cached for reuse.
   */
  generateSFX(type: string): AudioBuffer {
    const cached = this.bufferCache.get(type);
    if (cached) return cached;

    const recipe = SFX_REGISTRY[type];
    if (!recipe) {
      return this.generateSilence(0.01);
    }

    const buffer = this.renderRecipe(recipe);
    this.bufferCache.set(type, buffer);
    return buffer;
  }

  /**
   * Generate an ambient AudioBuffer for a biome.
   * Combines the biome's ambient layer SFX recipes.
   */
  generateAmbient(biomeId: string): AudioBuffer {
    const cacheKey = `ambient:${biomeId}`;
    const cached = this.bufferCache.get(cacheKey);
    if (cached) return cached;

    const soundscape = BIOME_SOUNDSCAPES[biomeId];
    if (!soundscape) {
      return this.generateSilence(4.0);
    }

    // Render each ambient layer and mix them
    const layers: AudioBuffer[] = [];
    for (const sfxId of soundscape.ambientLayers) {
      const recipe = SFX_REGISTRY[sfxId];
      if (recipe) {
        layers.push(this.renderRecipe(recipe));
      }
    }

    if (layers.length === 0) {
      return this.generateSilence(4.0);
    }

    // Mix all layers into a single buffer
    const maxLength = Math.max(...layers.map(b => b.length));
    const buffer = this.ctx.createBuffer(1, maxLength, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (const layer of layers) {
      const data = layer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        output[i] += data[i];
      }
    }

    // Soft clip to prevent distortion
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.tanh(output[i]);
    }

    this.bufferCache.set(cacheKey, buffer);
    return buffer;
  }

  /**
   * Generate a music layer AudioBuffer for a biome.
   * Uses the biome's musical key and pentatonic scale.
   */
  generateMusicLayer(
    biomeId: string,
    layer: 'ambient' | 'activity' | 'intensity',
  ): AudioBuffer {
    const cacheKey = `music:${biomeId}:${layer}`;
    const cached = this.bufferCache.get(cacheKey);
    if (cached) return cached;

    const soundscape = BIOME_SOUNDSCAPES[biomeId];
    if (!soundscape) {
      return this.generateSilence(8.0);
    }

    const buffer = this.renderMusicLayer(soundscape, layer);
    this.bufferCache.set(cacheKey, buffer);
    return buffer;
  }

  /**
   * Generate a companion tone pattern for a given emotion.
   */
  generateCompanionTone(emotion: string): AudioBuffer {
    const type = `companion-${emotion}`;
    const cached = this.bufferCache.get(type);
    if (cached) return cached;

    const recipe = SFX_REGISTRY[type];
    if (recipe) {
      const buffer = this.renderRecipe(recipe);
      this.bufferCache.set(type, buffer);
      return buffer;
    }

    // Fallback: generic warm tone
    return this.generateSFX('companion-greet');
  }

  /**
   * Get caption text for any sound type.
   */
  getCaptionForSFX(type: string): string {
    return getSFXCaption(type);
  }

  getCaptionForAmbient(biomeId: string): string {
    const soundscape = BIOME_SOUNDSCAPES[biomeId];
    return soundscape?.ambientCaption ?? `[${biomeId} ambient sounds]`;
  }

  getCaptionForMusic(biomeId: string, layer: 'ambient' | 'activity' | 'intensity'): string {
    return getBiomeMusicCaption(biomeId, layer);
  }

  /** Clear the buffer cache (useful for memory management). */
  clearCache(): void {
    this.bufferCache.clear();
  }

  /** Number of cached buffers. */
  get cacheSize(): number {
    return this.bufferCache.size;
  }

  // -----------------------------------------------------------------------
  // Private rendering methods
  // -----------------------------------------------------------------------

  private generateSilence(durationSec: number): AudioBuffer {
    const length = Math.ceil(this.ctx.sampleRate * durationSec);
    return this.ctx.createBuffer(1, Math.max(1, length), this.ctx.sampleRate);
  }

  /**
   * Offline-render an SFXRecipe to an AudioBuffer.
   */
  private renderRecipe(recipe: SFXRecipe): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.ceil(sampleRate * recipe.duration);
    const buffer = this.ctx.createBuffer(1, Math.max(1, length), sampleRate);
    const output = buffer.getChannelData(0);

    // Render oscillators
    for (const osc of recipe.oscillators) {
      this.renderOscillatorToBuffer(output, sampleRate, osc);
    }

    // Render noise layers
    for (const noise of recipe.noises) {
      this.renderNoiseToBuffer(output, sampleRate, noise);
    }

    // Soft clip
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.tanh(output[i]);
    }

    return buffer;
  }

  private renderOscillatorToBuffer(
    output: Float32Array,
    sampleRate: number,
    step: OscillatorStep,
  ): void {
    const startSample = Math.floor(step.offset * sampleRate);
    const durationSamples = Math.ceil(step.duration * sampleRate);
    const endSample = Math.min(startSample + durationSamples, output.length);

    const freqStart = step.frequency;
    const freqEnd = step.frequencyEnd ?? step.frequency;
    const gainStart = step.gain;
    const gainEnd = step.gainEnd ?? step.gain;
    const detuneAmount = step.detune ?? 0;
    const detuneFactor = Math.pow(2, detuneAmount / 1200);

    let phase = 0;

    for (let i = startSample; i < endSample; i++) {
      const t = durationSamples > 1 ? (i - startSample) / (durationSamples - 1) : 0;
      const freq = (freqStart + (freqEnd - freqStart) * t) * detuneFactor;
      const gain = gainStart + (gainEnd - gainStart) * t;

      let sample: number;
      switch (step.type) {
        case 'sine':
          sample = Math.sin(phase);
          break;
        case 'square':
          sample = Math.sin(phase) >= 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
          break;
        case 'sawtooth':
          sample = 2 * ((phase / (2 * Math.PI)) % 1) - 1;
          break;
        default:
          sample = Math.sin(phase);
      }

      output[i] += sample * gain;
      phase += (2 * Math.PI * freq) / sampleRate;

      // Keep phase within 0..2π to avoid floating-point issues
      if (phase > 2 * Math.PI) {
        phase -= 2 * Math.PI;
      }
    }
  }

  private renderNoiseToBuffer(
    output: Float32Array,
    sampleRate: number,
    step: NoiseStep,
  ): void {
    const startSample = Math.floor(step.offset * sampleRate);
    const durationSamples = Math.ceil(step.duration * sampleRate);
    const endSample = Math.min(startSample + durationSamples, output.length);

    const gainStart = step.gain;
    const gainEnd = step.gainEnd ?? step.gain;

    // Generate noise
    const noiseLength = endSample - startSample;
    if (noiseLength <= 0) return;

    const noiseData = new Float32Array(noiseLength);

    if (step.color === 'white') {
      for (let i = 0; i < noiseLength; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
    } else if (step.color === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < noiseLength; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        noiseData[i] = pink * 0.11;
      }
    } else {
      let last = 0;
      for (let i = 0; i < noiseLength; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        noiseData[i] = last * 3.5;
      }
    }

    // Apply simple IIR lowpass filter if specified
    if (step.filterFreq) {
      applyLowpass(noiseData, sampleRate, step.filterFreq);
    }

    // Apply simple IIR highpass filter if specified
    if (step.highpassFreq) {
      applyHighpass(noiseData, sampleRate, step.highpassFreq);
    }

    // Apply bandpass if specified
    if (step.bandpassFreq) {
      applyLowpass(noiseData, sampleRate, step.bandpassFreq * (step.bandpassQ ?? 1));
      applyHighpass(noiseData, sampleRate, step.bandpassFreq / (step.bandpassQ ?? 1));
    }

    // Write to output with gain envelope
    for (let i = 0; i < noiseLength; i++) {
      const t = noiseLength > 1 ? i / (noiseLength - 1) : 0;
      const gain = gainStart + (gainEnd - gainStart) * t;
      output[startSample + i] += noiseData[i] * gain;
    }
  }

  // -----------------------------------------------------------------------
  // Music layer generation
  // -----------------------------------------------------------------------

  private renderMusicLayer(
    soundscape: BiomeSoundscape,
    layer: 'ambient' | 'activity' | 'intensity',
  ): AudioBuffer {
    const durationSec = 8.0; // 8-second loopable segment
    const sampleRate = this.ctx.sampleRate;
    const length = Math.ceil(sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const output = buffer.getChannelData(0);

    const root = soundscape.keyRoot;
    const scale = soundscape.scaleRatios;
    const bpm = soundscape.tempoBase;
    const beatDuration = 60 / bpm;

    // Get frequencies for pentatonic scale across two octaves
    const freqs: number[] = [];
    for (const ratio of scale) {
      freqs.push(root * ratio);
      freqs.push(root * ratio * 2);
    }

    switch (layer) {
      case 'ambient':
        this.renderAmbientMusic(output, sampleRate, durationSec, freqs, beatDuration, soundscape);
        break;
      case 'activity':
        this.renderActivityMusic(output, sampleRate, durationSec, freqs, beatDuration, soundscape);
        break;
      case 'intensity':
        this.renderIntensityMusic(output, sampleRate, durationSec, freqs, beatDuration, soundscape);
        break;
    }

    // Soft clip
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.tanh(output[i]);
    }

    return buffer;
  }

  private renderAmbientMusic(
    output: Float32Array,
    sampleRate: number,
    durationSec: number,
    freqs: number[],
    beatDuration: number,
    soundscape: BiomeSoundscape,
  ): void {
    // Slow arpeggios using the pentatonic scale
    const noteCount = Math.floor(durationSec / (beatDuration * 2));
    const noteDuration = beatDuration * 2;
    const gain = 0.06;

    // Pad: sustained root + fifth
    const root = freqs[0];
    const fifth = freqs[3] ?? freqs[0] * 1.5;
    this.renderOscillatorToBuffer(output, sampleRate, {
      type: 'sine',
      frequency: root,
      gain: 0.04,
      offset: 0,
      duration: durationSec,
    });
    this.renderOscillatorToBuffer(output, sampleRate, {
      type: 'sine',
      frequency: fifth,
      gain: 0.025,
      offset: 0,
      duration: durationSec,
    });

    // Slow arpeggio notes
    const usableFreqs = freqs.slice(0, 5);
    // Use a deterministic sequence based on biome key
    const seed = Math.floor(soundscape.keyRoot * 100);
    for (let i = 0; i < noteCount; i++) {
      const freqIndex = (seed + i * 3) % usableFreqs.length;
      const freq = usableFreqs[freqIndex];
      const offset = i * noteDuration;

      this.renderOscillatorToBuffer(output, sampleRate, {
        type: 'sine',
        frequency: freq,
        gain: gain,
        gainEnd: 0.0,
        offset,
        duration: noteDuration * 0.8,
      });
    }
  }

  private renderActivityMusic(
    output: Float32Array,
    sampleRate: number,
    durationSec: number,
    freqs: number[],
    beatDuration: number,
    soundscape: BiomeSoundscape,
  ): void {
    // Rhythmic patterns over the pentatonic scale
    const noteCount = Math.floor(durationSec / beatDuration);
    const gain = 0.05;

    // Gentle bass pulse on beat
    const bassFreq = freqs[0] / 2;
    for (let i = 0; i < noteCount; i += 2) {
      const offset = i * beatDuration;
      this.renderOscillatorToBuffer(output, sampleRate, {
        type: 'triangle',
        frequency: bassFreq,
        gain: 0.04,
        gainEnd: 0.0,
        offset,
        duration: beatDuration * 0.5,
      });
    }

    // Melodic notes on beats
    const usableFreqs = freqs.slice(2, 8);
    const seed = Math.floor(soundscape.keyRoot * 77);
    for (let i = 0; i < noteCount; i++) {
      const freqIndex = (seed + i * 5) % usableFreqs.length;
      const freq = usableFreqs[freqIndex];
      const offset = i * beatDuration;

      this.renderOscillatorToBuffer(output, sampleRate, {
        type: 'triangle',
        frequency: freq,
        gain: gain,
        gainEnd: 0.0,
        offset,
        duration: beatDuration * 0.6,
      });
    }
  }

  private renderIntensityMusic(
    output: Float32Array,
    sampleRate: number,
    durationSec: number,
    freqs: number[],
    beatDuration: number,
    soundscape: BiomeSoundscape,
  ): void {
    // Fuller harmony, more notes, driving rhythm
    const noteCount = Math.floor(durationSec / (beatDuration * 0.5));
    const halfBeat = beatDuration * 0.5;
    const gain = 0.04;

    // Sustained chord pad
    this.renderOscillatorToBuffer(output, sampleRate, {
      type: 'sine',
      frequency: freqs[0],
      gain: 0.05,
      offset: 0,
      duration: durationSec,
    });
    this.renderOscillatorToBuffer(output, sampleRate, {
      type: 'sine',
      frequency: freqs[2] ?? freqs[0] * 1.25,
      gain: 0.03,
      offset: 0,
      duration: durationSec,
    });
    this.renderOscillatorToBuffer(output, sampleRate, {
      type: 'sine',
      frequency: freqs[3] ?? freqs[0] * 1.5,
      gain: 0.025,
      offset: 0,
      duration: durationSec,
    });

    // Quick arpeggio pattern
    const usableFreqs = freqs.slice(0, freqs.length);
    const seed = Math.floor(soundscape.keyRoot * 137);
    for (let i = 0; i < noteCount; i++) {
      const freqIndex = (seed + i * 7) % usableFreqs.length;
      const freq = usableFreqs[freqIndex];
      const offset = i * halfBeat;

      this.renderOscillatorToBuffer(output, sampleRate, {
        type: 'triangle',
        frequency: freq,
        gain: gain,
        gainEnd: 0.0,
        offset,
        duration: halfBeat * 0.7,
      });
    }

    // Bass rhythm
    for (let i = 0; i < Math.floor(durationSec / beatDuration); i++) {
      const offset = i * beatDuration;
      this.renderOscillatorToBuffer(output, sampleRate, {
        type: 'sine',
        frequency: freqs[0] / 2,
        gain: 0.04,
        gainEnd: 0.0,
        offset,
        duration: beatDuration * 0.4,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Simple IIR filters (single-pole approximations for offline rendering)
// ---------------------------------------------------------------------------

function applyLowpass(data: Float32Array, sampleRate: number, cutoffHz: number): void {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  let prev = data[0];
  for (let i = 1; i < data.length; i++) {
    prev = prev + alpha * (data[i] - prev);
    data[i] = prev;
  }
}

function applyHighpass(data: Float32Array, sampleRate: number, cutoffHz: number): void {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let prevInput = data[0];
  let prevOutput = data[0];
  for (let i = 1; i < data.length; i++) {
    const input = data[i];
    prevOutput = alpha * (prevOutput + input - prevInput);
    prevInput = input;
    data[i] = prevOutput;
  }
}
