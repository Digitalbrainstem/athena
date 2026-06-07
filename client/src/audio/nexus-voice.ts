// Nexus Voice — the cosmic voice of the world itself.
// Uses pre-recorded Emily (Chatterbox TTS) voice lines with
// Web Audio reverb + warmth processing for an ethereal sound.

import { NEXUS_VOICE_LINES } from '../core/registry.js';
import type { NexusVoiceLine } from '../core/registry.js';
import type { Disposable } from '../types.js';

// Captions for accessibility
const CAPTIONS: Record<NexusVoiceLine, string> = {
  welcome:
    'Welcome to the Nexus. Everything you need to know is already inside you. We\'re just going to help you find it.',
  welcome_back:
    'Welcome back.',
  long_absence:
    'It\'s been a while. The Nexus has been waiting.',
  tier_transition:
    'You\'ve grown. The world grows with you.',
  discovery:
    'You\'re beginning to see.',
  nexus_core:
    'You made it. You always could.',
};

// ---------------------------------------------------------------------------
// Simple impulse response for reverb (generated procedurally)
// ---------------------------------------------------------------------------

function createReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// NexusVoice
// ---------------------------------------------------------------------------

export class NexusVoice implements Disposable {
  private disposed = false;
  private audioCtx: AudioContext | null = null;
  private convolverBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private volume = 1.0;

  /** Callback when the Nexus Voice begins speaking (for captions). */
  onSpeak: ((text: string) => void) | null = null;
  /** Callback when the Nexus Voice finishes. */
  onEnd: (() => void) | null = null;

  /**
   * Speak a Nexus Voice line using pre-recorded Emily WAV files
   * with ethereal audio processing (reverb + warmth).
   */
  async speak(line: NexusVoiceLine): Promise<void> {
    if (this.disposed) return;
    const caption = CAPTIONS[line];
    const voicePath = NEXUS_VOICE_LINES[line];
    this.onSpeak?.(caption);

    try {
      await this.playWavWithProcessing(voicePath);
    } catch (e) {
      console.warn('[NexusVoice] Voice playback failed:', voicePath, e);
    }

    this.onEnd?.();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try { this.currentSource?.stop(); } catch { /* ignore */ }
    this.currentSource = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.onSpeak = null;
    this.onEnd = null;
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private ensureReverbBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.convolverBuffer) {
      this.convolverBuffer = createReverbImpulse(ctx, 2.5, 2.0);
    }
    return this.convolverBuffer;
  }

  /**
   * Play a WAV file with reverb + warmth processing for ethereal sound.
   */
  private async playWavWithProcessing(url: string): Promise<void> {
    const ctx = this.ensureAudioContext();
    const reverbBuf = this.ensureReverbBuffer(ctx);

    // Fetch and decode the WAV file
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    return new Promise<void>((resolve) => {
      if (this.disposed) { resolve(); return; }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      this.currentSource = source;

      // Reverb convolver
      const convolver = ctx.createConvolver();
      convolver.buffer = reverbBuf;

      // Warmth filter — gentle low-pass to remove harsh highs
      const warmth = ctx.createBiquadFilter();
      warmth.type = 'lowpass';
      warmth.frequency.value = 4000;
      warmth.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.value = this.volume;

      // Dry/wet mix: mostly dry with subtle reverb
      const dry = ctx.createGain();
      dry.gain.value = 0.8;
      const wet = ctx.createGain();
      wet.gain.value = 0.2;

      // Route: source → dry → warmth → gain → dest
      //        source → convolver → wet → warmth → gain → dest
      source.connect(dry);
      source.connect(convolver);
      dry.connect(warmth);
      convolver.connect(wet);
      wet.connect(warmth);
      warmth.connect(gain);
      gain.connect(ctx.destination);

      source.onended = () => {
        this.currentSource = null;
        dry.disconnect();
        wet.disconnect();
        convolver.disconnect();
        warmth.disconnect();
        gain.disconnect();
        resolve();
      };

      source.start();
    });
  }
}
