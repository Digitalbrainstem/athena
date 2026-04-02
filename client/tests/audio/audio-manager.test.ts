import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../../src/audio/audio-manager.js';
import type { AudioCue } from '@nexus-academy/core';

// Mock AudioContext for jsdom
class MockGainNode {
  gain = { value: 0, linearRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}

class MockPannerNode {
  panningModel = 'HRTF';
  distanceModel = 'inverse';
  refDistance = 1;
  maxDistance = 100;
  positionX = { value: 0 };
  positionY = { value: 0 };
  positionZ = { value: 0 };
  connect = vi.fn();
}

class MockAudioBufferSourceNode {
  buffer: AudioBuffer | null = null;
  loop = false;
  onended: (() => void) | null = null;
  connect = vi.fn();
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
  createPanner = vi.fn(() => new MockPannerNode());
  createBuffer = vi.fn((_channels: number, _length: number, _sampleRate: number) => ({} as AudioBuffer));
}

vi.stubGlobal('AudioContext', MockAudioContext);

describe('AudioManager', () => {
  let manager: AudioManager;

  beforeEach(() => {
    manager = new AudioManager();
  });

  afterEach(() => { manager.dispose(); });

  it('processes empty cue array without error', () => {
    expect(() => manager.process([])).not.toThrow();
  });

  it('handles play cue without crash', () => {
    const cues: AudioCue[] = [
      { id: 'test-sfx', type: 'sfx', action: 'play', asset: 'click.wav', volume: 0.5, loop: false },
    ];
    expect(() => manager.process(cues)).not.toThrow();
  });

  it('handles stop cue for nonexistent source', () => {
    const cues: AudioCue[] = [
      { id: 'nonexistent', type: 'sfx', action: 'stop', asset: '', volume: 0, loop: false },
    ];
    expect(() => manager.process(cues)).not.toThrow();
  });

  it('handles fade_in cue', () => {
    const cues: AudioCue[] = [
      { id: 'music-1', type: 'music', action: 'fade_in', asset: 'bg.mp3', volume: 0.7, loop: true },
    ];
    expect(() => manager.process(cues)).not.toThrow();
  });

  it('handles fade_out cue', () => {
    const cues: AudioCue[] = [
      { id: 'music-1', type: 'music', action: 'fade_out', asset: 'bg.mp3', volume: 0, loop: false },
    ];
    expect(() => manager.process(cues)).not.toThrow();
  });

  it('does not process cues after dispose', () => {
    manager.dispose();
    const cues: AudioCue[] = [
      { id: 'test-sfx', type: 'sfx', action: 'play', asset: 'click.wav', volume: 0.5, loop: false },
    ];
    expect(() => manager.process(cues)).not.toThrow();
  });

  it('dispose is idempotent', () => {
    manager.dispose();
    expect(() => manager.dispose()).not.toThrow();
  });
});
