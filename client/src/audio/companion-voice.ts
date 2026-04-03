// Companion voice — browser SpeechSynthesis wrapper for spoken dialogue.
// Falls back to silent operation if SpeechSynthesis is unavailable.

import type { Disposable } from '../types.js';

export type Emotion = 'neutral' | 'happy' | 'curious' | 'encouraging' | 'excited';

interface EmotionParams {
  pitch: number;
  rate: number;
}

const EMOTION_MAP: Record<Emotion, EmotionParams> = {
  neutral:      { pitch: 1.1, rate: 1.0 },
  happy:        { pitch: 1.3, rate: 1.1 },
  curious:      { pitch: 1.2, rate: 0.95 },
  encouraging:  { pitch: 1.15, rate: 1.05 },
  excited:      { pitch: 1.35, rate: 1.15 },
};

/**
 * CompanionVoiceManager uses browser SpeechSynthesis to speak companion
 * dialogue aloud. It queues utterances so lines don't overlap, and
 * emits callbacks for caption synchronization.
 */
export class CompanionVoiceManager implements Disposable {
  private disposed = false;
  private speaking = false;
  private queue: Array<{ text: string; emotion: Emotion; resolve: () => void }> = [];

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
  speak(text: string, emotion: Emotion = 'neutral'): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (typeof speechSynthesis === 'undefined') {
      console.log(`[CompanionVoice] SpeechSynthesis unavailable — skipping: "${text}"`);
      this.onSpeak?.(this.speakerName, text);
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push({ text, emotion, resolve });
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
      this.onSpeak?.(this.speakerName, item.text);

      try {
        await this.speakUtterance(item.text, item.emotion);
      } catch (e) {
        console.warn('[CompanionVoice] SpeechSynthesis error:', e);
      }

      item.resolve();
    }

    this.speaking = false;
    this.onEnd?.();
  }

  private speakUtterance(text: string, emotion: Emotion): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const params = EMOTION_MAP[emotion];
      utterance.pitch = params.pitch;
      utterance.rate = params.rate;

      // Try to find a friendly English voice
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
        ?? voices.find(v => v.lang.startsWith('en'))
        ?? voices[0];
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`SpeechSynthesis: ${e.error}`));

      console.log(`[CompanionVoice] Speaking: "${text}" (emotion=${emotion}, pitch=${params.pitch}, rate=${params.rate})`);
      speechSynthesis.speak(utterance);
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.onSpeak = null;
    this.onEnd = null;
  }
}
