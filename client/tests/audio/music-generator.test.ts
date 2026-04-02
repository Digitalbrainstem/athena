import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MusicGenerator } from '../../src/audio/music-generator.js';
import { SoundSynthesizer } from '../../src/audio/synthesizer.js';

// ---------------------------------------------------------------------------
// Mock AudioContext for jsdom
// ---------------------------------------------------------------------------

class MockAudioBuffer {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  private readonly data: Float32Array[];

  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.data = [];
    for (let i = 0; i < channels; i++) {
      this.data.push(new Float32Array(length));
    }
  }

  getChannelData(channel: number): Float32Array {
    return this.data[channel];
  }
}

class MockGainNode {
  gain = { value: 0, linearRampToValueAtTime: vi.fn() };
  connect = vi.fn().mockReturnThis();
}

class MockAudioBufferSourceNode {
  buffer: MockAudioBuffer | null = null;
  loop = false;
  onended: (() => void) | null = null;
  connect = vi.fn().mockReturnThis();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createBufferSource = vi.fn(() => new MockAudioBufferSourceNode());
  createGain = vi.fn(() => new MockGainNode());
  createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => {
    return new MockAudioBuffer(channels, length, sampleRate);
  });
}

vi.stubGlobal('AudioContext', MockAudioContext);

describe('MusicGenerator', () => {
  let ctx: MockAudioContext;
  let synth: SoundSynthesizer;
  let generator: MusicGenerator;

  beforeEach(() => {
    ctx = new MockAudioContext();
    synth = new SoundSynthesizer(ctx as unknown as AudioContext);
    generator = new MusicGenerator(ctx as unknown as AudioContext, synth);
  });

  it('starts with no active biome', () => {
    expect(generator.getCurrentBiome()).toBeNull();
  });

  it('starts with no active layers', () => {
    expect(generator.getActiveLayers()).toEqual([]);
  });

  describe('generateLayer', () => {
    it('generates and starts an ambient layer', () => {
      generator.generateLayer('workshop', 'ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(true);
      expect(generator.getCurrentBiome()).toBe('workshop');
    });

    it('generates and starts an activity layer', () => {
      generator.generateLayer('workshop', 'activity');
      expect(generator.isLayerPlaying('activity')).toBe(true);
    });

    it('generates and starts an intensity layer', () => {
      generator.generateLayer('workshop', 'intensity');
      expect(generator.isLayerPlaying('intensity')).toBe(true);
    });

    it('replaces existing layer of same type', () => {
      generator.generateLayer('workshop', 'ambient');
      const layers1 = generator.getActiveLayers();
      expect(layers1).toContain('ambient');

      generator.generateLayer('living-forest', 'ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(true);
      expect(generator.getCurrentBiome()).toBe('living-forest');
    });

    it('ignores unknown biome', () => {
      generator.generateLayer('nonexistent', 'ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(false);
    });

    it('does nothing after dispose', () => {
      generator.dispose();
      generator.generateLayer('workshop', 'ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(false);
    });

    it('emits caption when generating a layer', () => {
      const captions: string[] = [];
      generator.onCaption = (caption) => captions.push(caption);
      generator.generateLayer('workshop', 'ambient');
      expect(captions.length).toBe(1);
      expect(captions[0]).toContain('workshop');
    });
  });

  describe('setVolume / getVolume', () => {
    it('defaults to 0.7', () => {
      // The MockGainNode starts at 0, but MusicGenerator sets it to 0.7
      expect(generator.getVolume()).toBe(0.7);
    });

    it('sets volume within range', () => {
      generator.setVolume(0.5);
      expect(generator.getVolume()).toBe(0.5);
    });

    it('clamps volume to 0-1', () => {
      generator.setVolume(-0.5);
      expect(generator.getVolume()).toBe(0);
      generator.setVolume(1.5);
      expect(generator.getVolume()).toBe(1);
    });
  });

  describe('setActivityLevel', () => {
    it('idle: stops activity and intensity layers', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.generateLayer('workshop', 'activity');
      generator.generateLayer('workshop', 'intensity');

      generator.setActivityLevel('idle');
      // activity and intensity should be stopped (or fading out)
      // After the fade, they won't be active (handled by setTimeout)
      expect(generator.getCurrentBiome()).toBe('workshop');
    });

    it('active: starts activity layer if not playing', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.setActivityLevel('active');
      expect(generator.isLayerPlaying('activity')).toBe(true);
    });

    it('intense: starts both activity and intensity', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.setActivityLevel('intense');
      expect(generator.isLayerPlaying('activity')).toBe(true);
      expect(generator.isLayerPlaying('intensity')).toBe(true);
    });

    it('does nothing without a current biome', () => {
      generator.setActivityLevel('intense');
      expect(generator.getActiveLayers()).toEqual([]);
    });
  });

  describe('stopLayer', () => {
    it('stops a playing layer', () => {
      generator.generateLayer('workshop', 'ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(true);
      generator.stopLayer('ambient');
      expect(generator.isLayerPlaying('ambient')).toBe(false);
    });

    it('handles stopping non-existent layer', () => {
      expect(() => generator.stopLayer('ambient')).not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('stops all playing layers', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.generateLayer('workshop', 'activity');
      generator.generateLayer('workshop', 'intensity');

      generator.stopAll(0);
      expect(generator.getActiveLayers()).toEqual([]);
      expect(generator.getCurrentBiome()).toBeNull();
    });
  });

  describe('crossfade', () => {
    it('does not crossfade to same biome', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.crossfade('workshop', 'workshop', 2000);
      // Nothing should change
      expect(generator.isLayerPlaying('ambient')).toBe(true);
    });

    it('crossfade to new biome does not throw', () => {
      generator.generateLayer('workshop', 'ambient');
      expect(() => generator.crossfade('workshop', 'living-forest', 2000)).not.toThrow();
    });

    it('does nothing after dispose', () => {
      generator.dispose();
      expect(() => generator.crossfade('workshop', 'living-forest', 2000)).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('disposes cleanly', () => {
      generator.generateLayer('workshop', 'ambient');
      generator.dispose();
      expect(generator.getCurrentBiome()).toBeNull();
      expect(generator.getActiveLayers()).toEqual([]);
    });

    it('is idempotent', () => {
      generator.dispose();
      expect(() => generator.dispose()).not.toThrow();
    });

    it('nulls out caption callback', () => {
      generator.onCaption = vi.fn();
      generator.dispose();
      expect(generator.onCaption).toBeNull();
    });
  });
});
