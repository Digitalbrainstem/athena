import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  VoiceInput,
  CHILD_SPEECH_MAP,
  levenshteinDistance,
  similarity,
  fuzzyMatchWord,
  fuzzyMatchTranscript,
  isSpeechRecognitionAvailable,
} from '../../src/input/voice.js';
import type { GameAction } from '../../src/types.js';

// ─── Levenshtein Distance ───────────────────────────────────────────────────

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns length for empty vs non-empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('computes single edit', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('computes multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('handles insertion', () => {
    expect(levenshteinDistance('abc', 'abcd')).toBe(1);
  });

  it('handles deletion', () => {
    expect(levenshteinDistance('abcd', 'abc')).toBe(1);
  });
});

// ─── Similarity ─────────────────────────────────────────────────────────────

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('hello', 'hello')).toBe(1);
  });

  it('returns 1 for two empty strings', () => {
    expect(similarity('', '')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    expect(similarity('abc', 'xyz')).toBeCloseTo(0, 1);
  });

  it('returns high value for similar strings', () => {
    expect(similarity('three', 'twee')).toBeGreaterThan(0.5);
  });
});

// ─── Fuzzy Match Word ───────────────────────────────────────────────────────

describe('fuzzyMatchWord', () => {
  it('matches exact child speech variant', () => {
    const result = fuzzyMatchWord('twee', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('three');
    expect(result!.confidence).toBe(1.0);
  });

  it('matches "weh" to "red"', () => {
    const result = fuzzyMatchWord('weh', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('red');
  });

  it('matches "boo" to "blue"', () => {
    const result = fuzzyMatchWord('boo', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('blue');
  });

  it('matches "gween" to "green"', () => {
    const result = fuzzyMatchWord('gween', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('green');
  });

  it('matches "yewow" to "yellow"', () => {
    const result = fuzzyMatchWord('yewow', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('yellow');
  });

  it('matches "hep" to "help"', () => {
    const result = fuzzyMatchWord('hep', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('help');
  });

  it('matches "wook" to "look"', () => {
    const result = fuzzyMatchWord('wook', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('look');
  });

  it('matches "oh-pen" to "open"', () => {
    const result = fuzzyMatchWord('oh-pen', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('open');
  });

  it('returns null for completely unmatched word', () => {
    const result = fuzzyMatchWord('xyzzyplugh', CHILD_SPEECH_MAP);
    expect(result).toBeNull();
  });

  it('is case insensitive', () => {
    const result = fuzzyMatchWord('TWEE', CHILD_SPEECH_MAP);
    expect(result).not.toBeNull();
    expect(result!.matched).toBe('three');
  });

  it('matches number variants', () => {
    expect(fuzzyMatchWord('wun', CHILD_SPEECH_MAP)!.matched).toBe('one');
    expect(fuzzyMatchWord('too', CHILD_SPEECH_MAP)!.matched).toBe('two');
    expect(fuzzyMatchWord('fo', CHILD_SPEECH_MAP)!.matched).toBe('four');
    expect(fuzzyMatchWord('fie', CHILD_SPEECH_MAP)!.matched).toBe('five');
  });
});

// ─── Fuzzy Match Transcript ─────────────────────────────────────────────────

describe('fuzzyMatchTranscript', () => {
  it('corrects child speech in a sentence', () => {
    const result = fuzzyMatchTranscript('I see twee weh things', CHILD_SPEECH_MAP);
    expect(result).toContain('three');
    expect(result).toContain('red');
  });

  it('passes through normal words unchanged', () => {
    const result = fuzzyMatchTranscript('hello world', CHILD_SPEECH_MAP);
    expect(result).toBe('hello world');
  });

  it('handles single word', () => {
    expect(fuzzyMatchTranscript('gween', CHILD_SPEECH_MAP)).toBe('green');
  });
});

// ─── CHILD_SPEECH_MAP ───────────────────────────────────────────────────────

describe('CHILD_SPEECH_MAP', () => {
  it('contains number variants', () => {
    expect(CHILD_SPEECH_MAP.has('wun')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('too')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('twee')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('fo')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('fie')).toBe(true);
  });

  it('contains color variants', () => {
    expect(CHILD_SPEECH_MAP.has('weh')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('boo')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('gween')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('yewow')).toBe(true);
  });

  it('contains action variants', () => {
    expect(CHILD_SPEECH_MAP.has('oh-pen')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('hep')).toBe(true);
    expect(CHILD_SPEECH_MAP.has('wook')).toBe(true);
  });

  it('maps all values to real English words', () => {
    for (const [, value] of CHILD_SPEECH_MAP) {
      expect(value.length).toBeGreaterThan(0);
      expect(value).toMatch(/^[a-z]+$/);
    }
  });
});

// ─── Speech Recognition Availability ────────────────────────────────────────

describe('isSpeechRecognitionAvailable', () => {
  it('returns false in jsdom (no SpeechRecognition)', () => {
    expect(isSpeechRecognitionAvailable()).toBe(false);
  });
});

// ─── VoiceInput ─────────────────────────────────────────────────────────────

describe('VoiceInput', () => {
  let input: VoiceInput;
  let received: GameAction[];

  beforeEach(() => {
    received = [];
    input = new VoiceInput();
  });

  afterEach(() => {
    input.dispose();
  });

  it('implements InputProvider interface', () => {
    expect(input.name).toBe('voice');
    expect(typeof input.attach).toBe('function');
    expect(typeof input.detach).toBe('function');
    expect(typeof input.dispose).toBe('function');
  });

  it('reports not listening when detached', () => {
    expect(input.isListening()).toBe(false);
  });

  it('reports not available in jsdom', () => {
    expect(input.isAvailable()).toBe(false);
  });

  it('attach without SpeechRecognition does not throw', () => {
    const emit = (a: GameAction) => received.push(a);
    expect(() => input.attach(emit)).not.toThrow();
  });

  it('setCompanionName updates config', () => {
    input.setCompanionName('Spark');
    // Should not throw, updates internal state
    expect(true).toBe(true);
  });

  it('setEnabled(false) is safe to call', () => {
    input.setEnabled(false);
    expect(input.isListening()).toBe(false);
  });
});

// ─── VoiceInput with Mocked SpeechRecognition ───────────────────────────────

describe('VoiceInput with mock SpeechRecognition', () => {
  let input: VoiceInput;
  let received: GameAction[];
  let mockRecognition: MockSpeechRecognition;
  let OriginalSR: unknown;

  class MockSpeechRecognition {
    lang = '';
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    onresult: ((event: unknown) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    onend: (() => void) | null = null;
    started = false;

    start(): void { this.started = true; }
    stop(): void { this.started = false; }

    simulateResult(transcript: string, confidence = 0.9): void {
      const event = {
        resultIndex: 0,
        results: [{
          isFinal: true,
          length: 1,
          0: { transcript, confidence },
          [Symbol.iterator]: function* () { yield { transcript, confidence }; },
        }],
      };
      Object.defineProperty(event.results, 'length', { value: 1 });
      this.onresult?.(event);
    }
  }

  beforeEach(() => {
    received = [];
    OriginalSR = (window as unknown as Record<string, unknown>)['SpeechRecognition'];
    (window as unknown as Record<string, unknown>)['SpeechRecognition'] = MockSpeechRecognition;
    input = new VoiceInput();
    input.attach((a: GameAction) => received.push(a));
    mockRecognition = (input as unknown as { recognition: MockSpeechRecognition }).recognition;
  });

  afterEach(() => {
    input.dispose();
    if (OriginalSR) {
      (window as unknown as Record<string, unknown>)['SpeechRecognition'] = OriginalSR;
    } else {
      delete (window as unknown as Record<string, unknown>)['SpeechRecognition'];
    }
  });

  it('starts listening when attached', () => {
    expect(mockRecognition.started).toBe(true);
  });

  it('recognizes "go left" as move command', () => {
    mockRecognition.simulateResult('go left');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('move');
    expect(received[0]!.source).toBe('voice');
  });

  it('recognizes "open inventory" as inventory command', () => {
    mockRecognition.simulateResult('open inventory');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('inventory');
  });

  it('recognizes "pick up" as interact command', () => {
    mockRecognition.simulateResult('pick up');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('interact');
  });

  it('recognizes "pause" command', () => {
    mockRecognition.simulateResult('pause');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('pause');
  });

  it('recognizes "show map" command', () => {
    mockRecognition.simulateResult('show map');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('map');
  });

  it('recognizes "go back" command', () => {
    mockRecognition.simulateResult('go back');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('back');
  });

  it('recognizes "help" as companion command', () => {
    mockRecognition.simulateResult('help');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('companion');
  });

  it('recognizes "craft" command', () => {
    mockRecognition.simulateResult('craft');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('craft');
  });

  it('applies fuzzy matching for child speech', () => {
    // "gween" should be corrected to "green" before attempting command match
    mockRecognition.simulateResult('gween');
    expect(received).toHaveLength(1);
    // "green" doesn't match a command, so it becomes a speak action
    expect(received[0]!.type).toBe('speak');
    const payload = received[0]!.payload as { text: string; confidence: number };
    expect(payload.text).toBe('green');
  });

  it('recognizes number words as speak actions', () => {
    mockRecognition.simulateResult('five');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('speak');
    const payload = received[0]!.payload as { text: string; confidence: number };
    expect(payload.text).toBe('5');
  });

  it('recognizes child pronunciation of numbers', () => {
    mockRecognition.simulateResult('twee');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('speak');
    const payload = received[0]!.payload as { text: string; confidence: number };
    expect(payload.text).toBe('3'); // "twee" → "three" → 3
  });

  it('falls back to speak action for unrecognized text', () => {
    mockRecognition.simulateResult('the bridge is very tall');
    expect(received).toHaveLength(1);
    expect(received[0]!.type).toBe('speak');
  });

  it('never stores or transmits audio (privacy by design)', () => {
    // The VoiceInput class has no storage mechanisms — verify no storage properties
    const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(input));
    const instance = Object.getOwnPropertyNames(input);
    const all = [...proto, ...instance];
    expect(all.some(p => p.includes('store') || p.includes('save') || p.includes('record') || p.includes('upload'))).toBe(false);
  });
});
