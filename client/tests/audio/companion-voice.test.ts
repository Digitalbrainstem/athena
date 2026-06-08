import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompanionVoiceManager } from '../../src/audio/companion-voice.js';

describe('CompanionVoiceManager', () => {
  let voice: CompanionVoiceManager | null = null;

  afterEach(() => {
    voice?.dispose();
    voice = null;
  });

  it('reports the queued speaker when browser speech synthesis is unavailable', async () => {
    const originalSpeechSynthesis = globalThis.speechSynthesis;
    vi.stubGlobal('speechSynthesis', undefined);

    voice = new CompanionVoiceManager();
    const spoken: Array<{ speaker: string; text: string }> = [];
    voice.onSpeak = (speaker, text) => spoken.push({ speaker, text });

    await voice.speak('The Workbench is ready.', 'neutral', 'Hilda');

    expect(spoken).toEqual([{ speaker: 'Hilda', text: 'The Workbench is ready.' }]);
    vi.stubGlobal('speechSynthesis', originalSpeechSynthesis);
  });
});
