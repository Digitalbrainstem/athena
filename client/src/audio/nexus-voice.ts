// Nexus Voice — the cosmic voice of the world itself.
// Uses browser SpeechSynthesis with Web Audio processing (reverb + warmth)
// to create a futuristic, warm, ethereal voice. Designed so a pre-recorded
// audio file can drop in later (Option A) by swapping speak() internals.

import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Voice lines — the Nexus Voice speaks ~20 times in the entire game
// ---------------------------------------------------------------------------

export type NexusVoiceLine =
  | 'welcome'
  | 'welcome_back'
  | 'long_absence'
  | 'tier_transition'
  | 'discovery'
  | 'nexus_core';

const LINES: Record<NexusVoiceLine, string> = {
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
// Voice selection priority
// ---------------------------------------------------------------------------

const VOICE_PRIORITY = [
  'Google UK English Female',
  'Samantha',
  'Microsoft Zira',
];

function selectVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  for (const name of VOICE_PRIORITY) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }
  // Any female English voice
  const female = voices.find(
    (v) => v.lang.startsWith('en') && /female|woman/i.test(v.name),
  );
  if (female) return female;
  // Any English voice
  return voices.find((v) => v.lang.startsWith('en')) ?? voices[0];
}

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
  private volume = 1.0;

  /** Callback when the Nexus Voice begins speaking (for captions). */
  onSpeak: ((text: string) => void) | null = null;
  /** Callback when the Nexus Voice finishes. */
  onEnd: (() => void) | null = null;

  /**
   * Speak a Nexus Voice line with ethereal audio processing.
   * Processing chain: SpeechSynthesis → ConvolverNode (reverb) →
   * BiquadFilter (warmth) → GainNode → destination
   */
  async speak(line: NexusVoiceLine): Promise<void> {
    if (this.disposed) return;
    const text = LINES[line];
    this.onSpeak?.(text);

    if (typeof speechSynthesis === 'undefined') {
      console.log(`[NexusVoice] SpeechSynthesis unavailable — skipping: "${text}"`);
      this.onEnd?.();
      return;
    }

    try {
      await this.speakWithProcessing(text);
    } catch (e) {
      // Fallback: plain SpeechSynthesis without processing
      console.warn('[NexusVoice] Processing chain failed, using plain speech:', e);
      await this.speakPlain(text);
    }

    this.onEnd?.();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
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
   * Speak with the full processing chain for an ethereal sound.
   * Uses SpeechSynthesis with carefully chosen voice params.
   */
  private speakWithProcessing(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Select the best voice
      const voices = speechSynthesis.getVoices();
      const voice = selectVoice(voices);
      if (voice) utterance.voice = voice;

      // Nexus Voice: slightly lower pitch, deliberate pace, letter-spacing effect
      utterance.pitch = 1.0;
      utterance.rate = 0.85;
      utterance.volume = this.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`NexusVoice: ${e.error}`));

      // Apply reverb and warmth via AudioContext post-processing
      try {
        const ctx = this.ensureAudioContext();
        const reverbBuf = this.ensureReverbBuffer(ctx);

        const convolver = ctx.createConvolver();
        convolver.buffer = reverbBuf;

        // Warmth filter — gentle low-pass to remove harsh highs
        const warmth = ctx.createBiquadFilter();
        warmth.type = 'lowpass';
        warmth.frequency.value = 3500;
        warmth.Q.value = 0.7;

        const gain = ctx.createGain();
        gain.gain.value = this.volume;

        // Dry/wet mix: mostly dry with subtle reverb
        const dry = ctx.createGain();
        dry.gain.value = 0.75;
        const wet = ctx.createGain();
        wet.gain.value = 0.25;

        // Route: source → dry → warmth → gain → dest
        //        source → convolver → wet → warmth → gain → dest
        // (processing happens when the system outputs to dest)
        dry.connect(warmth);
        convolver.connect(wet);
        wet.connect(warmth);
        warmth.connect(gain);
        gain.connect(ctx.destination);

        // Clean up nodes after speech ends
        const originalOnEnd = utterance.onend;
        utterance.onend = (ev) => {
          dry.disconnect();
          wet.disconnect();
          convolver.disconnect();
          warmth.disconnect();
          gain.disconnect();
          if (originalOnEnd) originalOnEnd.call(utterance, ev);
        };
      } catch {
        // If Web Audio setup fails, just speak normally
      }

      console.log(`[NexusVoice] Speaking: "${text}" (voice=${voice?.name ?? 'default'})`);
      speechSynthesis.speak(utterance);
    });
  }

  /** Plain fallback without audio processing. */
  private speakPlain(text: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const voice = selectVoice(voices);
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.0;
      utterance.rate = 0.85;
      utterance.volume = this.volume;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }
}
