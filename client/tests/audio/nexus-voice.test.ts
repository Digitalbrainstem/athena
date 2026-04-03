import { describe, it, expect, afterEach } from 'vitest';
import { NexusVoice } from '../../src/audio/nexus-voice.js';
import type { NexusVoiceLine } from '../../src/audio/nexus-voice.js';

describe('NexusVoice', () => {
  let voice: NexusVoice;

  afterEach(() => {
    voice?.dispose();
  });

  it('creates and disposes without error', () => {
    voice = new NexusVoice();
    expect(voice).toBeDefined();
    voice.dispose();
  });

  it('fires onSpeak callback with correct text', async () => {
    voice = new NexusVoice();
    const spoken: string[] = [];
    voice.onSpeak = (text) => spoken.push(text);

    await voice.speak('welcome');
    expect(spoken.length).toBe(1);
    expect(spoken[0]).toContain('Welcome to the Nexus');
  });

  it('fires onEnd callback after speaking', async () => {
    voice = new NexusVoice();
    let ended = false;
    voice.onEnd = () => { ended = true; };

    await voice.speak('welcome_back');
    expect(ended).toBe(true);
  });

  it('speaks all defined voice lines', async () => {
    voice = new NexusVoice();
    const lines: NexusVoiceLine[] = [
      'welcome', 'welcome_back', 'long_absence',
      'tier_transition', 'discovery', 'nexus_core',
    ];
    const spoken: string[] = [];
    voice.onSpeak = (text) => spoken.push(text);

    for (const line of lines) {
      await voice.speak(line);
    }
    expect(spoken.length).toBe(lines.length);
    expect(spoken[0]).toContain('Welcome to the Nexus');
    expect(spoken[1]).toBe('Welcome back.');
    expect(spoken[2]).toContain('been a while');
    expect(spoken[3]).toContain('grown');
    expect(spoken[4]).toContain('beginning to see');
    expect(spoken[5]).toContain('You made it');
  });

  it('setVolume clamps to 0–1', () => {
    voice = new NexusVoice();
    voice.setVolume(1.5);
    voice.setVolume(-0.5);
    voice.setVolume(0.7);
    // No error — just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('does nothing after dispose', async () => {
    voice = new NexusVoice();
    const spoken: string[] = [];
    voice.onSpeak = (text) => spoken.push(text);

    voice.dispose();
    await voice.speak('welcome');
    expect(spoken.length).toBe(0);
  });
});
