import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CaptionSync } from '../../src/audio/caption-sync.js';
import { CaptionRenderer } from '../../src/a11y/captions.js';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '@nexus-academy/core';
import type { AudioCue, AccessibilitySettings } from '@nexus-academy/core';

function createMockDom(): void {
  document.body.innerHTML = '<div id="caption-container"></div>';
}

function makeSettings(overrides: Partial<AccessibilitySettings> = {}): AccessibilitySettings {
  return { ...DEFAULT_ACCESSIBILITY_SETTINGS, subtitles: true, soundCaptions: true, ...overrides };
}

function makeCue(overrides: Partial<AudioCue> = {}): AudioCue {
  return {
    id: 'test-cue',
    type: 'sfx',
    action: 'play',
    asset: '/sounds/chime.ogg',
    volume: 0.8,
    loop: false,
    captionText: 'Crystal chime',
    ...overrides,
  };
}

describe('CaptionSync', () => {
  let captionRenderer: CaptionRenderer;
  let sync: CaptionSync;

  beforeEach(() => {
    createMockDom();
    captionRenderer = new CaptionRenderer();
    captionRenderer.init();
    sync = new CaptionSync(captionRenderer);
  });

  afterEach(() => {
    sync.dispose();
    captionRenderer.dispose();
    document.body.innerHTML = '';
  });

  it('generates caption for play cue with captionText', () => {
    sync.processAudioCues([makeCue()], makeSettings());
    expect(captionRenderer.activeCount).toBe(1);
    const container = document.getElementById('caption-container')!;
    expect(container.children[0].textContent).toBe('[Crystal chime]');
  });

  it('generates caption for fade_in cue', () => {
    sync.processAudioCues(
      [makeCue({ action: 'fade_in', type: 'music', captionText: 'Calm exploration music' })],
      makeSettings(),
    );
    const container = document.getElementById('caption-container')!;
    expect(container.children.length).toBe(1);
  });

  it('skips cues without captionText', () => {
    sync.processAudioCues([makeCue({ captionText: undefined })], makeSettings());
    expect(captionRenderer.activeCount).toBe(0);
  });

  it('skips stop and fade_out actions', () => {
    sync.processAudioCues([makeCue({ action: 'stop' })], makeSettings());
    sync.processAudioCues([makeCue({ action: 'fade_out' })], makeSettings());
    expect(captionRenderer.activeCount).toBe(0);
  });

  it('maps voice type correctly', () => {
    sync.processAudioCues(
      [makeCue({ type: 'voice', captionText: 'Welcome', action: 'play' })],
      makeSettings(),
    );
    const container = document.getElementById('caption-container')!;
    // voice without speaker should show plain text
    expect(container.children[0].textContent).toBe('Welcome');
  });

  it('does nothing after disposal', () => {
    sync.dispose();
    sync.processAudioCues([makeCue()], makeSettings());
    expect(captionRenderer.activeCount).toBe(0);
  });
});
