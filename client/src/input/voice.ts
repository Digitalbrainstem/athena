import type { GameAction, SpeakPayload, ActionSource } from '@nexus-academy/core';
import type { InputProvider, ActionCallback } from '../types.js';

// ─── Configuration ──────────────────────────────────────────────────────────

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  wakeWord: string;
  companionName: string;
  fuzzyThreshold: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: VoiceConfig = {
  language: 'en-US',
  continuous: true,
  interimResults: false,
  maxAlternatives: 3,
  wakeWord: 'hey nexus',
  companionName: 'nexus',
  fuzzyThreshold: 0.6,
  enabled: true,
};

// ─── Fuzzy Matching Dictionaries ────────────────────────────────────────────

/** Phonetic substitution dictionary for young children (Foundation tier, ages 2-5) */
export const CHILD_SPEECH_MAP: ReadonlyMap<string, string> = new Map([
  // Numbers
  ['wun', 'one'], ['won', 'one'],
  ['too', 'two'], ['tu', 'two'],
  ['twee', 'three'], ['fee', 'three'],
  ['fo', 'four'], ['faw', 'four'],
  ['fie', 'five'], ['fibe', 'five'], ['fiv', 'five'],
  ['sick', 'six'], ['sik', 'six'],
  ['seben', 'seven'], ['sebben', 'seven'],
  ['eit', 'eight'],
  ['nyne', 'nine'],
  ['den', 'ten'], ['tin', 'ten'],
  // Colors
  ['weh', 'red'], ['wed', 'red'], ['rud', 'red'],
  ['boo', 'blue'], ['bwoo', 'blue'], ['bue', 'blue'],
  ['gween', 'green'], ['geen', 'green'],
  ['yewow', 'yellow'], ['yewo', 'yellow'], ['lello', 'yellow'], ['yelo', 'yellow'],
  ['puh-ple', 'purple'], ['pupple', 'purple'], ['purpoh', 'purple'],
  ['owange', 'orange'], ['ornge', 'orange'],
  ['pik', 'pink'],
  ['bwack', 'black'],
  ['wite', 'white'], ['wight', 'white'],
  // Actions
  ['oh-pen', 'open'], ['opin', 'open'],
  ['hep', 'help'], ['hewp', 'help'],
  ['wook', 'look'], ['luk', 'look'],
  ['pwease', 'please'],
  ['wuhn', 'run'],
  ['stahp', 'stop'],
  ['tuwn', 'turn'], ['tun', 'turn'],
  ['fowuhd', 'forward'], ['foward', 'forward'],
  // Shapes
  ['sqware', 'square'], ['skware', 'square'],
  ['twi-angew', 'triangle'], ['twiangow', 'triangle'],
  ['sirkle', 'circle'], ['sirkul', 'circle'],
]);

/** Number word to numeric value */
const NUMBER_WORDS: ReadonlyMap<string, number> = new Map([
  ['zero', 0], ['one', 1], ['two', 2], ['three', 3], ['four', 4],
  ['five', 5], ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9],
  ['ten', 10], ['eleven', 11], ['twelve', 12], ['thirteen', 13],
  ['fourteen', 14], ['fifteen', 15], ['sixteen', 16], ['seventeen', 17],
  ['eighteen', 18], ['nineteen', 19], ['twenty', 20],
]);

// ─── Command Patterns ───────────────────────────────────────────────────────

interface CommandPattern {
  patterns: RegExp[];
  action: (match: RegExpMatchArray) => GameAction;
}

function buildCommands(companionName: string): CommandPattern[] {
  const esc = companionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    // Back / Cancel — checked before movement so "go back" is cancel, not movement
    {
      patterns: [/^(?:go\s+back|back|never\s+mind|cancel)$/i],
      action: () => ({ type: 'back', source: 'voice' }),
    },
    // Movement (backward only with explicit "backward", not "back")
    {
      patterns: [/^go\s+(left|right|forward|backward)$/i, /^(left|right|forward|backward)$/i, /^turn\s+(left|right)$/i, /^walk\s+(?:to\s+the\s+)?(left|right|forward|backward)$/i],
      action: (m) => {
        const dir = (m[1] ?? '').toLowerCase();
        const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
        const dz = dir === 'forward' ? -1 : dir === 'backward' ? 1 : 0;
        return { type: 'move', source: 'voice', payload: { direction: { x: dx, z: dz }, running: false } };
      },
    },
    // Interact
    {
      patterns: [/^(?:pick\s*(?:it\s*)?up|grab\s+that|take\s+it|interact|open\s+it|use\s+it)$/i],
      action: () => ({ type: 'interact', source: 'voice' }),
    },
    // Inventory
    {
      patterns: [/^(?:open\s+(?:my\s+)?(?:bag|inventory)|inventory|what\s+do\s+i\s+have)$/i],
      action: () => ({ type: 'inventory', source: 'voice' }),
    },
    // Map
    {
      patterns: [/^(?:show\s+map|where\s+am\s+i|map)$/i],
      action: () => ({ type: 'map', source: 'voice' }),
    },
    // Companion
    {
      patterns: [new RegExp(`^hey\\s+${esc}$`, 'i'), /^(?:help|i'm\s+stuck|give\s+me\s+a\s+hint|hint)$/i],
      action: () => ({ type: 'companion', source: 'voice' }),
    },
    // Pause
    {
      patterns: [/^(?:pause|stop|wait|hey\s+nexus,?\s+wait)$/i],
      action: () => ({ type: 'pause', source: 'voice' }),
    },
    // Crafting
    {
      patterns: [/^(?:craft|crafting|open\s+craft(?:ing)?)$/i],
      action: () => ({ type: 'craft', source: 'voice' }),
    },
  ];
}

// ─── String Similarity ──────────────────────────────────────────────────────

export function levenshteinDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use single-row DP for space efficiency
  let prev = new Array<number>(lb + 1);
  let curr = new Array<number>(lb + 1);

  for (let j = 0; j <= lb; j++) prev[j] = j;

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,          // deletion
        (curr[j - 1] ?? 0) + 1,      // insertion
        (prev[j - 1] ?? 0) + cost,   // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[lb] ?? la;
}

export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

// ─── Fuzzy Matching Engine ──────────────────────────────────────────────────

export function fuzzyMatchWord(word: string, candidates: ReadonlyMap<string, string>): { matched: string; confidence: number } | null {
  const lower = word.toLowerCase().trim();

  // Exact match in dictionary
  const exact = candidates.get(lower);
  if (exact) return { matched: exact, confidence: 1.0 };

  // Fuzzy search — high threshold (0.85) to avoid false positives on normal words
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [variant, canonical] of candidates) {
    const score = similarity(lower, variant);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = canonical;
    }
  }

  if (bestMatch && bestScore > 0.8) {
    return { matched: bestMatch, confidence: bestScore };
  }

  return null;
}

export function fuzzyMatchTranscript(transcript: string, candidates: ReadonlyMap<string, string>): string {
  const words = transcript.toLowerCase().split(/\s+/);
  return words.map(w => {
    const result = fuzzyMatchWord(w, candidates);
    return result ? result.matched : w;
  }).join(' ');
}

// ─── SpeechRecognition Availability ─────────────────────────────────────────

function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithWebkit;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionAvailable(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

// ─── VoiceInput ─────────────────────────────────────────────────────────────

export class VoiceInput implements InputProvider {
  readonly name: ActionSource = 'voice';

  private emit: ActionCallback | null = null;
  private recognition: SpeechRecognition | null = null;
  private readonly config: VoiceConfig;
  private commands: CommandPattern[];
  private listening = false;
  private wakeWordActive = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  // Privacy: no audio stored. Everything processed locally.
  // The SpeechRecognition API may send audio to cloud servers in some browsers,
  // but we never store or transmit results ourselves.

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.commands = buildCommands(this.config.companionName);
  }

  attach(emit: ActionCallback): void {
    this.detach();
    this.emit = emit;

    if (!this.config.enabled) return;

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = this.config.language;
    recognition.continuous = this.config.continuous;
    recognition.interimResults = this.config.interimResults;
    recognition.maxAlternatives = this.config.maxAlternatives;

    recognition.onresult = this.onResult;
    recognition.onerror = this.onError;
    recognition.onend = this.onEnd;

    this.recognition = recognition;
    this.startListening();
  }

  detach(): void {
    this.stopListening();
    if (this.restartTimer !== null) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    this.recognition = null;
    this.emit = null;
    this.wakeWordActive = false;
  }

  dispose(): void { this.detach(); }

  // ─── Public API ───────────────────────────────────────────────────────

  isListening(): boolean { return this.listening; }
  isAvailable(): boolean { return isSpeechRecognitionAvailable(); }

  setCompanionName(name: string): void {
    this.config.companionName = name;
    this.commands = buildCommands(name);
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled && this.emit && !this.listening) {
      this.startListening();
    } else if (!enabled) {
      this.stopListening();
    }
  }

  // ─── Recognition ──────────────────────────────────────────────────────

  private startListening(): void {
    if (this.listening || !this.recognition) return;
    try {
      this.recognition.start();
      this.listening = true;
    } catch {
      // Already started or not available
    }
  }

  private stopListening(): void {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      // Not running
    }
    this.listening = false;
  }

  private onResult = (event: SpeechRecognitionEvent): void => {
    if (!this.emit) return;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result?.isFinal) continue;

      for (let a = 0; a < result.length; a++) {
        const alt = result[a];
        if (!alt) continue;

        const raw = alt.transcript.trim();
        if (!raw) continue;
        const confidence = alt.confidence;

        // Check wake word on raw transcript first
        if (this.isWakeWord(raw)) {
          this.wakeWordActive = true;
          continue;
        }

        // 1) Try raw transcript against commands (handles normal speech)
        const rawAction = this.matchCommand(raw);
        if (rawAction) {
          this.emit(rawAction);
          return;
        }

        // 2) Apply fuzzy matching for child speech
        const corrected = fuzzyMatchTranscript(raw, CHILD_SPEECH_MAP);

        // 3) Try corrected transcript against commands
        if (corrected !== raw.toLowerCase()) {
          const correctedAction = this.matchCommand(corrected);
          if (correctedAction) {
            this.emit(correctedAction);
            return;
          }
        }

        // 4) Try numeric input (on corrected text)
        const numAction = this.matchNumber(corrected, confidence);
        if (numAction) {
          this.emit(numAction);
          return;
        }

        // 5) Fallback: emit as speak action with corrected text
        const payload: SpeakPayload = { text: corrected, confidence };
        this.emit({ type: 'speak', source: 'voice', payload });
        return;
      }
    }
  };

  private onError = (_event: SpeechRecognitionErrorEvent): void => {
    this.listening = false;
    // Auto-restart on transient errors (not "not-allowed" or "aborted")
    const code = _event.error;
    if (code !== 'not-allowed' && code !== 'aborted' && code !== 'service-not-allowed') {
      this.scheduleRestart();
    }
  };

  private onEnd = (): void => {
    this.listening = false;
    // Continuous mode: auto-restart
    if (this.emit && this.config.continuous && this.config.enabled) {
      this.scheduleRestart();
    }
  };

  private scheduleRestart(): void {
    if (this.restartTimer !== null) return;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (this.emit && this.config.enabled) {
        this.startListening();
      }
    }, 300);
  }

  // ─── Command Matching ─────────────────────────────────────────────────

  private isWakeWord(text: string): boolean {
    const lower = text.toLowerCase();
    return lower === this.config.wakeWord
        || lower === `hey ${this.config.companionName.toLowerCase()}`;
  }

  private matchCommand(text: string): GameAction | null {
    const lower = text.toLowerCase().trim();
    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        const match = lower.match(pattern);
        if (match) return cmd.action(match);
      }
    }
    return null;
  }

  private matchNumber(text: string, confidence: number): GameAction | null {
    const lower = text.toLowerCase().trim();

    // Try word-based number
    const num = NUMBER_WORDS.get(lower);
    if (num !== undefined) {
      const payload: SpeakPayload = { text: String(num), confidence };
      return { type: 'speak', source: 'voice', payload };
    }

    // Try direct numeric parse
    const parsed = parseInt(lower, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 9999) {
      const payload: SpeakPayload = { text: String(parsed), confidence };
      return { type: 'speak', source: 'voice', payload };
    }

    return null;
  }
}

// ─── Browser Vendor Prefix ──────────────────────────────────────────────────

interface WindowWithWebkit extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}
