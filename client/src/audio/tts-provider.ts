import type { Disposable } from '../types.js';
import type { TTSProvider, TTSOptions, Voice } from './types.js';

// ---------------------------------------------------------------------------
// Fish Audio TTS provider — companion voice (requires network + API key)
// ---------------------------------------------------------------------------

const FISH_AUDIO_API = 'https://api.fish.audio/v1/tts';

export class FishAudioProvider implements TTSProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private ctx: AudioContext | null = null;

  constructor(apiKey: string, model = 'speech-1.5') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async speak(text: string, voice: string, options?: TTSOptions): Promise<AudioBuffer> {
    const body: Record<string, unknown> = {
      text,
      reference_id: voice,
      format: options?.format ?? 'mp3',
      latency: options?.latency ?? 'normal',
    };

    if (options?.speed !== undefined) {
      body.prosody = { speed: options.speed };
    }

    if (options?.emotion) {
      body.text = `(${options.emotion}) ${text}`;
    }

    const response = await fetch(FISH_AUDIO_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'model': this.model,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Fish Audio TTS failed: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const ctx = this.ensureContext();
    return ctx.decodeAudioData(arrayBuffer);
  }

  async getVoices(): Promise<Voice[]> {
    return [
      { id: 'warm-companion', name: 'Warm', profile: 'warm', language: 'en' },
      { id: 'energetic-companion', name: 'Energetic', profile: 'energetic', language: 'en' },
      { id: 'calm-companion', name: 'Calm', profile: 'calm', language: 'en' },
      { id: 'playful-companion', name: 'Playful', profile: 'playful', language: 'en' },
      { id: 'scholarly-companion', name: 'Scholarly', profile: 'scholarly', language: 'en' },
    ];
  }
}

// ---------------------------------------------------------------------------
// Browser SpeechSynthesis fallback — works offline, no API key needed
// ---------------------------------------------------------------------------

export class BrowserTTSProvider implements TTSProvider {
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  speak(text: string, voice: string, options?: TTSOptions): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      if (typeof speechSynthesis === 'undefined') {
        // No SpeechSynthesis available — return silent buffer
        const ctx = this.ensureContext();
        resolve(ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Try to find the requested voice by name
      const voices = speechSynthesis.getVoices();
      const match = voices.find(v => v.name === voice || v.voiceURI === voice);
      if (match) utterance.voice = match;

      if (options?.speed !== undefined) {
        utterance.rate = Math.max(0.5, Math.min(1.5, options.speed));
      }

      // Browser SpeechSynthesis doesn't return AudioBuffer, so we create a
      // placeholder buffer. The actual speech is played through the system
      // audio path. Callers should use speakDirect() for browser TTS.
      const ctx = this.ensureContext();
      const duration = Math.max(0.5, text.length * 0.06);
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);

      utterance.onend = () => resolve(buffer);
      utterance.onerror = (e) => reject(new Error(`SpeechSynthesis error: ${e.error}`));

      speechSynthesis.speak(utterance);
    });
  }

  /** Speak directly via browser SpeechSynthesis (no AudioBuffer intermediary). */
  speakDirect(text: string, speed = 1.0): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof speechSynthesis === 'undefined') {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.5, Math.min(1.5, speed));
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`SpeechSynthesis error: ${e.error}`));
      speechSynthesis.speak(utterance);
    });
  }

  async getVoices(): Promise<Voice[]> {
    if (typeof speechSynthesis === 'undefined') return [];
    const sysVoices = speechSynthesis.getVoices();
    return sysVoices.map(v => ({
      id: v.voiceURI,
      name: v.name,
      profile: 'calm' as const,
      language: v.lang,
    }));
  }
}

// ---------------------------------------------------------------------------
// CompanionVoice — queues dialogue, manages TTS provider switching
// ---------------------------------------------------------------------------

export class CompanionVoice implements Disposable {
  private provider: TTSProvider;
  private fallback: BrowserTTSProvider;
  private voiceId: string;
  private speed = 1.0;
  private disposed = false;

  private readonly queue: Array<{ text: string; resolve: () => void; reject: (e: Error) => void }> = [];
  private isPlaying = false;

  /** Callback invoked when voice playback starts (for caption sync). */
  onSpeak: ((text: string) => void) | null = null;
  /** Callback invoked when voice playback ends. */
  onEnd: (() => void) | null = null;

  constructor(provider: TTSProvider, voiceId = 'warm-companion') {
    this.provider = provider;
    this.fallback = new BrowserTTSProvider();
    this.voiceId = voiceId;
  }

  /** Queue a line of dialogue. Resolves when playback completes. */
  async speak(text: string): Promise<void> {
    if (this.disposed) return;

    return new Promise<void>((resolve, reject) => {
      this.queue.push({ text, resolve, reject });
      if (!this.isPlaying) {
        void this.drain();
      }
    });
  }

  /** Stop all current and queued speech immediately. */
  stop(): void {
    for (const item of this.queue) item.resolve();
    this.queue.length = 0;
    this.isPlaying = false;
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    this.onEnd?.();
  }

  /** Set speech speed as a percentage (50–150). */
  setSpeed(percentage: number): void {
    this.speed = Math.max(0.5, Math.min(1.5, percentage / 100));
  }

  getSpeed(): number {
    return this.speed * 100;
  }

  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  setProvider(provider: TTSProvider): void {
    this.provider = provider;
  }

  get queueLength(): number {
    return this.queue.length;
  }

  private async drain(): Promise<void> {
    this.isPlaying = true;

    while (this.queue.length > 0 && !this.disposed) {
      const item = this.queue.shift()!;
      this.onSpeak?.(item.text);

      try {
        await this.provider.speak(item.text, this.voiceId, { speed: this.speed });
        item.resolve();
      } catch {
        // Fall back to browser TTS
        try {
          await this.fallback.speak(item.text, '', { speed: this.speed });
          item.resolve();
        } catch (fallbackErr) {
          item.reject(fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr)));
        }
      }
    }

    this.isPlaying = false;
    this.onEnd?.();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.onSpeak = null;
    this.onEnd = null;
  }
}
