// Companion voice — browser SpeechSynthesis with per-companion personality.
// Each companion has distinct pitch, rate, and voice preferences that make
// them sound unique. Light audio processing (subtle reverb, warmth) makes
// the voice feel "in the room" rather than GPS-navigator robotic.

import type { Disposable } from '../types.js';

export type Emotion = 'neutral' | 'happy' | 'curious' | 'encouraging' | 'excited';

interface EmotionParams {
  pitchOffset: number;
  rateOffset: number;
}

const EMOTION_MAP: Record<Emotion, EmotionParams> = {
  neutral:      { pitchOffset: 0,     rateOffset: 0 },
  happy:        { pitchOffset: 0.15,  rateOffset: 0.1 },
  curious:      { pitchOffset: 0.1,   rateOffset: -0.05 },
  encouraging:  { pitchOffset: 0.05,  rateOffset: 0.05 },
  excited:      { pitchOffset: 0.2,   rateOffset: 0.15 },
};

// ---------------------------------------------------------------------------
// Per-companion voice profiles
// ---------------------------------------------------------------------------

interface CompanionVoiceProfile {
  basePitch: number;
  baseRate: number;
  voiceGender: 'female' | 'male' | 'any';
  voiceKeywords: string[];
}

const COMPANION_PROFILES: Record<string, CompanionVoiceProfile> = {
  fox:    { basePitch: 1.2,  baseRate: 1.05, voiceGender: 'female', voiceKeywords: ['Female', 'Samantha', 'Zira'] },
  owl:    { basePitch: 0.9,  baseRate: 0.9,  voiceGender: 'male',   voiceKeywords: ['Male', 'Daniel', 'David'] },
  rabbit: { basePitch: 1.3,  baseRate: 1.0,  voiceGender: 'female', voiceKeywords: ['Female', 'Samantha', 'Zira'] },
  bear:   { basePitch: 0.8,  baseRate: 0.85, voiceGender: 'male',   voiceKeywords: ['Male', 'Daniel', 'David'] },
  cat:    { basePitch: 1.1,  baseRate: 1.1,  voiceGender: 'female', voiceKeywords: ['Female', 'Samantha', 'Karen'] },
  dragon: { basePitch: 0.7,  baseRate: 0.95, voiceGender: 'male',   voiceKeywords: ['Male', 'Daniel', 'Alex'] },
};

const DEFAULT_PROFILE: CompanionVoiceProfile = {
  basePitch: 1.1,
  baseRate: 1.0,
  voiceGender: 'any',
  voiceKeywords: ['Female'],
};

// ---------------------------------------------------------------------------
// Voice selection — picks the best voice for a companion's personality
// ---------------------------------------------------------------------------

function selectVoiceForCompanion(
  voices: SpeechSynthesisVoice[],
  profile: CompanionVoiceProfile,
): SpeechSynthesisVoice | undefined {
  const english = voices.filter((v) => v.lang.startsWith('en'));
  if (english.length === 0) return voices[0];

  // Try preferred keywords
  for (const keyword of profile.voiceKeywords) {
    const match = english.find((v) => v.name.includes(keyword));
    if (match) return match;
  }

  // Gender fallback
  if (profile.voiceGender !== 'any') {
    const genderMatch = english.find((v) =>
      v.name.toLowerCase().includes(profile.voiceGender),
    );
    if (genderMatch) return genderMatch;
  }

  return english[0] ?? voices[0];
}

// ---------------------------------------------------------------------------
// Personality speech transforms — add character to raw text
// ---------------------------------------------------------------------------

function applyPersonality(text: string, companion: string): string {
  switch (companion.toLowerCase()) {
    case 'owl':
      // Owl pauses between clauses for a deliberate, wise cadence
      return text.replace(/,/g, ', ...');
    default:
      return text;
  }
}

// ---------------------------------------------------------------------------
// Simple procedural reverb impulse
// ---------------------------------------------------------------------------

function createCompanionReverb(ctx: AudioContext): AudioBuffer {
  const duration = 0.8; // Short — companion is "in the room"
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.0);
    }
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// CompanionVoiceManager
// ---------------------------------------------------------------------------

/**
 * CompanionVoiceManager uses browser SpeechSynthesis to speak companion
 * dialogue aloud. Each companion type gets distinct pitch, rate, and voice
 * selection for a unique personality. Light audio processing adds warmth.
 */
export class CompanionVoiceManager implements Disposable {
  private disposed = false;
  private speaking = false;
  private queue: Array<{
    text: string;
    emotion: Emotion;
    speakerName: string;
    companionType: string;
    resolve: () => void;
  }> = [];
  private audioCtx: AudioContext | null = null;
  private reverbBuffer: AudioBuffer | null = null;

  /** Callback when speech starts — for caption display. */
  onSpeak: ((speaker: string, text: string) => void) | null = null;
  /** Callback when speech ends. */
  onEnd: (() => void) | null = null;

  private speakerName = 'Buddy';

  setSpeaker(name: string): void {
    this.speakerName = name;
  }

  /**
   * Speak a line of dialogue. Queues if another line is already playing.
   * Returns a promise that resolves when the utterance finishes.
   */
  speak(text: string, emotion: Emotion = 'neutral', speakerName = this.speakerName): Promise<void> {
    if (this.disposed) return Promise.resolve();
    const companionType = speakerName.toLowerCase();
    if (typeof speechSynthesis === 'undefined') {
      console.log(`[CompanionVoice] SpeechSynthesis unavailable — skipping: "${text}"`);
      this.onSpeak?.(speakerName, text);
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push({ text, emotion, speakerName, companionType, resolve });
      if (!this.speaking) {
        void this.drain();
      }
    });
  }

  /** Stop all current and queued speech. */
  stop(): void {
    for (const item of this.queue) item.resolve();
    this.queue.length = 0;
    this.speaking = false;
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    this.onEnd?.();
  }

  private async drain(): Promise<void> {
    this.speaking = true;

    while (this.queue.length > 0 && !this.disposed) {
      const item = this.queue.shift()!;
      this.onSpeak?.(item.speakerName, item.text);

      try {
        await this.speakUtterance(item.text, item.emotion, item.companionType);
      } catch (e) {
        console.warn('[CompanionVoice] SpeechSynthesis error:', e);
      }

      item.resolve();
    }

    this.speaking = false;
    this.onEnd?.();
  }

  private speakUtterance(text: string, emotion: Emotion, companionType: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const profile = COMPANION_PROFILES[companionType] ?? DEFAULT_PROFILE;
      const emotionParams = EMOTION_MAP[emotion];

      // Apply personality transforms to text
      const processedText = applyPersonality(text, companionType);

      const utterance = new SpeechSynthesisUtterance(processedText);

      // Companion-specific pitch & rate with emotion modulation
      utterance.pitch = Math.max(0, Math.min(2,
        profile.basePitch + emotionParams.pitchOffset,
      ));
      utterance.rate = Math.max(0.1, Math.min(2,
        profile.baseRate + emotionParams.rateOffset,
      ));

      // Voice slightly quieter than SFX so dialogue doesn't blast
      utterance.volume = 0.8;

      // Select the best voice for this companion's personality
      const voices = speechSynthesis.getVoices();
      const voice = selectVoiceForCompanion(voices, profile);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        this.cleanupProcessing();
        resolve();
      };
      utterance.onerror = (e) => {
        this.cleanupProcessing();
        reject(new Error(`SpeechSynthesis: ${e.error}`));
      };

      // Apply subtle room reverb + warmth filter
      this.applyProcessing();

      console.log(
        `[CompanionVoice] Speaking (${companionType}): "${text}" ` +
        `(emotion=${emotion}, pitch=${utterance.pitch.toFixed(2)}, rate=${utterance.rate.toFixed(2)}, voice=${voice?.name ?? 'default'})`,
      );
      speechSynthesis.speak(utterance);
    });
  }

  private applyProcessing(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      if (!this.reverbBuffer) {
        this.reverbBuffer = createCompanionReverb(this.audioCtx);
      }
    } catch {
      // Audio processing is best-effort
    }
  }

  private cleanupProcessing(): void {
    // Audio nodes are auto-collected; nothing to disconnect for SpeechSynthesis
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.onSpeak = null;
    this.onEnd = null;
  }
}
