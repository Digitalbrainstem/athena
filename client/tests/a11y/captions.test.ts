import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CaptionRenderer } from '../../src/a11y/captions.js';
import type { Caption, AccessibilitySettings } from '@nexus-academy/core';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '@nexus-academy/core';

function createMockDom(): void {
  document.body.innerHTML = '<div id="caption-container"></div>';
}

function makeSettings(overrides: Partial<AccessibilitySettings> = {}): AccessibilitySettings {
  return { ...DEFAULT_ACCESSIBILITY_SETTINGS, subtitles: true, soundCaptions: true, ...overrides };
}

function makeCaption(overrides: Partial<Caption> = {}): Caption {
  return { text: 'Hello', type: 'voice', timestamp: performance.now(), ...overrides };
}

describe('CaptionRenderer', () => {
  let renderer: CaptionRenderer;

  beforeEach(() => {
    createMockDom();
    renderer = new CaptionRenderer({ lifetimeMs: 5000, maxVisible: 3 });
    renderer.init();
  });

  afterEach(() => {
    renderer.dispose();
    document.body.innerHTML = '';
  });

  it('renders voice captions with text', () => {
    renderer.process([makeCaption({ text: 'Welcome to the cave' })], makeSettings());
    const container = document.getElementById('caption-container')!;
    expect(container.children.length).toBe(1);
    expect(container.children[0].textContent).toBe('Welcome to the cave');
  });

  it('renders SFX captions in brackets', () => {
    renderer.process(
      [makeCaption({ text: 'Crystal chime', type: 'sfx' })],
      makeSettings(),
    );
    const container = document.getElementById('caption-container')!;
    expect(container.children[0].textContent).toBe('[Crystal chime]');
    expect(container.children[0].classList.contains('caption-sfx')).toBe(true);
  });

  it('renders ambient captions in brackets', () => {
    renderer.process(
      [makeCaption({ text: 'Running water', type: 'ambient' })],
      makeSettings(),
    );
    const container = document.getElementById('caption-container')!;
    expect(container.children[0].textContent).toBe('[Running water]');
  });

  it('renders speaker name with styling', () => {
    renderer.process(
      [makeCaption({ text: 'Shall we explore?', speaker: 'Buddy' })],
      makeSettings(),
    );
    const container = document.getElementById('caption-container')!;
    const el = container.children[0];
    const speakerSpan = el.querySelector('.caption-speaker');
    expect(speakerSpan).not.toBeNull();
    expect(speakerSpan!.textContent).toBe('Buddy: ');
    expect(el.textContent).toContain('Shall we explore?');
  });

  it('enforces max visible captions', () => {
    const settings = makeSettings();
    renderer.process([makeCaption({ text: 'One' })], settings);
    renderer.process([makeCaption({ text: 'Two' })], settings);
    renderer.process([makeCaption({ text: 'Three' })], settings);
    renderer.process([makeCaption({ text: 'Four' })], settings);
    expect(document.getElementById('caption-container')!.children.length).toBeLessThanOrEqual(3);
  });

  it('skips SFX when soundCaptions is disabled', () => {
    renderer.process(
      [makeCaption({ text: 'Boom', type: 'sfx' })],
      makeSettings({ soundCaptions: false }),
    );
    expect(document.getElementById('caption-container')!.children.length).toBe(0);
  });

  it('skips voice when subtitles is disabled', () => {
    renderer.process(
      [makeCaption({ text: 'Hello', type: 'voice' })],
      makeSettings({ subtitles: false }),
    );
    expect(document.getElementById('caption-container')!.children.length).toBe(0);
  });

  it('clears all captions', () => {
    renderer.process([makeCaption({ text: 'Test' })], makeSettings());
    renderer.clear();
    expect(document.getElementById('caption-container')!.children.length).toBe(0);
    expect(renderer.activeCount).toBe(0);
  });

  it('does nothing after disposal', () => {
    renderer.dispose();
    renderer.process([makeCaption({ text: 'Ignored' })], makeSettings());
    expect(document.getElementById('caption-container')!.children.length).toBe(0);
  });
});
