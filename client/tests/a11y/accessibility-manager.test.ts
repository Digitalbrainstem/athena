import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityManager } from '../../src/a11y/accessibility-manager.js';
import type { Announcement, Caption } from '@nexus-academy/core';

/* ---------- helpers ---------- */

function makeAnnouncement(overrides?: Partial<Announcement>): Announcement {
  return {
    text: 'Quest completed',
    priority: 'polite',
    category: 'quest',
    ...overrides,
  };
}

function makeCaption(overrides?: Partial<Caption>): Caption {
  return {
    text: 'Hello there',
    type: 'voice',
    timestamp: 0,
    ...overrides,
  };
}

/* ---------- matchMedia stub ---------- */

function stubMatchMedia(matches = false) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql: MediaQueryList = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, cb: EventListenerOrEventListenerObject) => {
      listeners.push(cb as (e: MediaQueryListEvent) => void);
    },
    removeEventListener: (_: string, cb: EventListenerOrEventListenerObject) => {
      const idx = listeners.indexOf(cb as (e: MediaQueryListEvent) => void);
      if (idx >= 0) listeners.splice(idx, 1);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql);
  return { mql, listeners };
}

/* ---------- DOM scaffolding ---------- */

let politeEl: HTMLElement;
let assertiveEl: HTMLElement;
let captionContainer: HTMLElement;

function createDOM(): void {
  politeEl = document.createElement('div');
  politeEl.id = 'a11y-announcer-polite';
  document.body.appendChild(politeEl);

  assertiveEl = document.createElement('div');
  assertiveEl.id = 'a11y-announcer-assertive';
  document.body.appendChild(assertiveEl);

  captionContainer = document.createElement('div');
  captionContainer.id = 'caption-container';
  document.body.appendChild(captionContainer);
}

function teardownDOM(): void {
  politeEl.remove();
  assertiveEl.remove();
  captionContainer.remove();
}

/* ================================================== */

describe('AccessibilityManager', () => {
  let mgr: AccessibilityManager;

  beforeEach(() => {
    stubMatchMedia();
    createDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    mgr?.dispose();
    teardownDOM();
    vi.useRealTimers();
    vi.restoreAllMocks();
    // Clean up any leftover classes on <html>
    const root = document.documentElement;
    root.className = '';
    root.removeAttribute('style');
  });

  /* ---------- 1. Default settings ---------- */

  describe('default settings', () => {
    it('applies default settings on init', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      const s = mgr.getSettings();
      expect(s.highContrast).toBe(false);
      expect(s.reducedMotion).toBe(false);
      expect(s.colorBlindMode).toBe('none');
      expect(s.fontFamily).toBe('system');
      expect(s.fontSize).toBe(100);
      expect(s.lineSpacing).toBe(1.4);
      expect(s.subtitles).toBe(false);
      expect(s.soundCaptions).toBe(false);
    });

    it('sets CSS custom properties from defaults on init', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--a11y-font-size')).toBe('1rem');
      expect(root.style.getPropertyValue('--a11y-line-spacing')).toBe('1.4');
    });
  });

  /* ---------- 2. updateSettings changes CSS ---------- */

  describe('updateSettings()', () => {
    it('changes CSS classes on <html> when settings are updated', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      mgr.updateSettings({ highContrast: true, reducedMotion: true });
      const root = document.documentElement;
      expect(root.classList.contains('high-contrast')).toBe(true);
      expect(root.classList.contains('reduced-motion')).toBe(true);
    });

    it('removes CSS classes when settings are toggled off', () => {
      mgr = new AccessibilityManager({ highContrast: true });
      mgr.init();

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      mgr.updateSettings({ highContrast: false });
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });

  /* ---------- 3. High contrast ---------- */

  describe('high contrast mode', () => {
    it('adds high-contrast class', () => {
      mgr = new AccessibilityManager({ highContrast: true });
      mgr.init();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('does not add high-contrast class when disabled', () => {
      mgr = new AccessibilityManager({ highContrast: false });
      mgr.init();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });

  /* ---------- 4. Reduced motion ---------- */

  describe('reduced motion', () => {
    it('adds reduced-motion class when enabled', () => {
      mgr = new AccessibilityManager({ reducedMotion: true });
      mgr.init();
      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('respects OS prefers-reduced-motion', () => {
      stubMatchMedia(true); // OS says reduce motion
      mgr = new AccessibilityManager(); // user did NOT explicitly set it
      mgr.init();
      expect(mgr.getSettings().reducedMotion).toBe(true);
      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('responds to matchMedia change events', () => {
      const { listeners } = stubMatchMedia(false);
      mgr = new AccessibilityManager();
      mgr.init();
      expect(mgr.getSettings().reducedMotion).toBe(false);

      // Simulate OS change
      for (const cb of listeners) cb({ matches: true } as MediaQueryListEvent);
      expect(mgr.getSettings().reducedMotion).toBe(true);
      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });
  });

  /* ---------- 5. Color blind modes ---------- */

  describe('color blind modes', () => {
    it.each([
      ['deuteranopia', 'colorblind-deuteranopia'],
      ['protanopia', 'colorblind-protanopia'],
      ['tritanopia', 'colorblind-tritanopia'],
    ] as const)('colorBlindMode=%s adds class %s', (mode, cssClass) => {
      mgr = new AccessibilityManager({ colorBlindMode: mode });
      mgr.init();

      const root = document.documentElement;
      expect(root.classList.contains(cssClass)).toBe(true);

      // Other mode classes should NOT be present
      const allModes = ['colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia'];
      for (const other of allModes.filter(c => c !== cssClass)) {
        expect(root.classList.contains(other)).toBe(false);
      }
    });

    it('no color blind class when mode is none', () => {
      mgr = new AccessibilityManager({ colorBlindMode: 'none' });
      mgr.init();
      const root = document.documentElement;
      expect(root.classList.contains('colorblind-deuteranopia')).toBe(false);
      expect(root.classList.contains('colorblind-protanopia')).toBe(false);
      expect(root.classList.contains('colorblind-tritanopia')).toBe(false);
    });
  });

  /* ---------- 6. Font family classes ---------- */

  describe('font family', () => {
    it('adds font-opendyslexic class', () => {
      mgr = new AccessibilityManager({ fontFamily: 'opendyslexic' });
      mgr.init();
      const root = document.documentElement;
      expect(root.classList.contains('font-opendyslexic')).toBe(true);
      expect(root.classList.contains('font-high-legibility')).toBe(false);
    });

    it('adds font-high-legibility class', () => {
      mgr = new AccessibilityManager({ fontFamily: 'high-legibility' });
      mgr.init();
      const root = document.documentElement;
      expect(root.classList.contains('font-high-legibility')).toBe(true);
      expect(root.classList.contains('font-opendyslexic')).toBe(false);
    });

    it('no font class when fontFamily is system', () => {
      mgr = new AccessibilityManager({ fontFamily: 'system' });
      mgr.init();
      const root = document.documentElement;
      expect(root.classList.contains('font-opendyslexic')).toBe(false);
      expect(root.classList.contains('font-high-legibility')).toBe(false);
    });

    it('switches font class on update', () => {
      mgr = new AccessibilityManager({ fontFamily: 'opendyslexic' });
      mgr.init();
      mgr.updateSettings({ fontFamily: 'high-legibility' });
      const root = document.documentElement;
      expect(root.classList.contains('font-opendyslexic')).toBe(false);
      expect(root.classList.contains('font-high-legibility')).toBe(true);
    });
  });

  /* ---------- 7. CSS custom properties ---------- */

  describe('CSS custom properties', () => {
    it('sets --a11y-font-size from fontSize percentage', () => {
      mgr = new AccessibilityManager({ fontSize: 150 });
      mgr.init();
      expect(document.documentElement.style.getPropertyValue('--a11y-font-size')).toBe('1.5rem');
    });

    it('sets --a11y-line-spacing from lineSpacing', () => {
      mgr = new AccessibilityManager({ lineSpacing: 1.8 });
      mgr.init();
      expect(document.documentElement.style.getPropertyValue('--a11y-line-spacing')).toBe('1.8');
    });

    it('updates custom properties on updateSettings', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      mgr.updateSettings({ fontSize: 200, lineSpacing: 2.0 });
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--a11y-font-size')).toBe('2rem');
      expect(root.style.getPropertyValue('--a11y-line-spacing')).toBe('2');
    });

    it('clamps fontSize to valid range', () => {
      mgr = new AccessibilityManager({ fontSize: 999 });
      mgr.init();
      expect(mgr.getSettings().fontSize).toBe(200);
      expect(document.documentElement.style.getPropertyValue('--a11y-font-size')).toBe('2rem');
    });
  });

  /* ---------- 8. processAnnouncements ---------- */

  describe('processAnnouncements()', () => {
    it('feeds polite text to polite aria-live region', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      mgr.processAnnouncements([makeAnnouncement({ text: 'New quest!', priority: 'polite' })]);
      // Text is set via setTimeout(0)
      vi.advanceTimersByTime(0);
      expect(politeEl.textContent).toBe('New quest!');
    });

    it('feeds assertive text to assertive aria-live region', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      mgr.processAnnouncements([makeAnnouncement({ text: 'Danger!', priority: 'assertive' })]);
      vi.advanceTimersByTime(0);
      expect(assertiveEl.textContent).toBe('Danger!');
    });

    it('clears text before setting for screen reader re-announcement', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      politeEl.textContent = 'old';

      mgr.processAnnouncements([makeAnnouncement({ text: 'new', priority: 'polite' })]);
      // Before setTimeout fires, text should be cleared
      expect(politeEl.textContent).toBe('');
      vi.advanceTimersByTime(0);
      expect(politeEl.textContent).toBe('new');
    });

    it('handles multiple announcements', () => {
      mgr = new AccessibilityManager();
      mgr.init();

      mgr.processAnnouncements([
        makeAnnouncement({ text: 'first', priority: 'polite' }),
        makeAnnouncement({ text: 'second', priority: 'assertive' }),
      ]);
      vi.advanceTimersByTime(0);
      expect(politeEl.textContent).toBe('first');
      expect(assertiveEl.textContent).toBe('second');
    });

    it('does nothing after dispose', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      mgr.dispose();

      mgr.processAnnouncements([makeAnnouncement({ text: 'ignored' })]);
      vi.advanceTimersByTime(0);
      expect(politeEl.textContent).toBe('');
    });
  });

  /* ---------- 9. processCaptions creates DOM ---------- */

  describe('processCaptions()', () => {
    it('creates caption DOM elements', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ text: 'Hello world' })]);

      const captions = captionContainer.querySelectorAll('.caption-line');
      expect(captions.length).toBe(1);
      expect(captions[0].textContent).toContain('Hello world');
      expect(captions[0].getAttribute('role')).toBe('log');
    });

    /* ---------- 10. Respects settings ---------- */

    it('skips all captions when both subtitles and soundCaptions are off', () => {
      mgr = new AccessibilityManager({ subtitles: false, soundCaptions: false });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption()]);
      expect(captionContainer.children.length).toBe(0);
    });

    it('skips voice captions when subtitles is off', () => {
      mgr = new AccessibilityManager({ subtitles: false, soundCaptions: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'voice' })]);
      expect(captionContainer.children.length).toBe(0);
    });

    it('skips music captions when subtitles is off', () => {
      mgr = new AccessibilityManager({ subtitles: false, soundCaptions: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'music' })]);
      expect(captionContainer.children.length).toBe(0);
    });

    it('skips sfx captions when soundCaptions is off', () => {
      mgr = new AccessibilityManager({ subtitles: true, soundCaptions: false });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'sfx' })]);
      expect(captionContainer.children.length).toBe(0);
    });

    it('shows sfx captions when soundCaptions is on', () => {
      mgr = new AccessibilityManager({ soundCaptions: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'sfx', text: 'explosion' })]);
      expect(captionContainer.children.length).toBe(1);
    });

    /* ---------- 11. Caption expiry ---------- */

    it('removes expired captions', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      const perfSpy = vi.spyOn(performance, 'now');

      // Add a caption at time=1000, expiry will be 5000
      perfSpy.mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ text: 'first' })]);
      expect(captionContainer.children.length).toBe(1);

      // Process more at time=6000, first should expire
      perfSpy.mockReturnValue(6000);
      mgr.processCaptions([makeCaption({ text: 'second' })]);

      // First was expired, second was added
      expect(captionContainer.children.length).toBe(1);
      expect(captionContainer.children[0].textContent).toContain('second');
    });

    /* ---------- 12. Max 3 visible captions ---------- */

    it('limits to 3 visible captions', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([
        makeCaption({ text: 'one' }),
        makeCaption({ text: 'two' }),
        makeCaption({ text: 'three' }),
        makeCaption({ text: 'four' }),
      ]);

      expect(captionContainer.querySelectorAll('.caption-line').length).toBe(3);
      // The oldest (one) should have been removed
      const texts = Array.from(captionContainer.querySelectorAll('.caption-line'))
        .map(el => el.textContent);
      expect(texts).not.toContain('one');
      expect(texts.some(t => t?.includes('four'))).toBe(true);
    });

    /* ---------- 13. SFX bracketed formatting ---------- */

    it('formats SFX captions with brackets [text]', () => {
      mgr = new AccessibilityManager({ soundCaptions: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'sfx', text: 'Crystal chime' })]);

      const line = captionContainer.querySelector('.caption-line')!;
      expect(line.textContent).toBe('[Crystal chime]');
      expect(line.classList.contains('caption-sfx')).toBe(true);
    });

    it('formats ambient captions with brackets', () => {
      mgr = new AccessibilityManager({ soundCaptions: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'ambient', text: 'Wind howling' })]);

      const line = captionContainer.querySelector('.caption-line')!;
      expect(line.textContent).toBe('[Wind howling]');
      expect(line.classList.contains('caption-sfx')).toBe(true);
    });

    /* ---------- 14. Voice captions with speaker ---------- */

    it('shows speaker name for voice captions', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([
        makeCaption({ type: 'voice', text: 'Follow me!', speaker: 'Lyra' }),
      ]);

      const line = captionContainer.querySelector('.caption-line')!;
      expect(line.textContent).toBe('Lyra: Follow me!');
      const speakerSpan = line.querySelector('.caption-speaker');
      expect(speakerSpan).not.toBeNull();
      expect(speakerSpan!.textContent).toBe('Lyra: ');
    });

    it('shows voice caption without speaker when speaker is absent', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ type: 'voice', text: 'Hello' })]);

      const line = captionContainer.querySelector('.caption-line')!;
      expect(line.textContent).toBe('Hello');
      expect(line.querySelector('.caption-speaker')).toBeNull();
    });
  });

  /* ---------- 15. getSettings ---------- */

  describe('getSettings()', () => {
    it('returns current settings', () => {
      mgr = new AccessibilityManager({ highContrast: true, fontSize: 120 });
      mgr.init();

      const s = mgr.getSettings();
      expect(s.highContrast).toBe(true);
      expect(s.fontSize).toBe(120);
    });

    it('reflects updates from updateSettings', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      mgr.updateSettings({ colorBlindMode: 'protanopia' });
      expect(mgr.getSettings().colorBlindMode).toBe('protanopia');
    });

    it('returns a readonly snapshot', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      const s1 = mgr.getSettings();
      mgr.updateSettings({ highContrast: true });
      const s2 = mgr.getSettings();
      // s1 should be unchanged since mergeSettings creates a new object
      expect(s1.highContrast).toBe(false);
      expect(s2.highContrast).toBe(true);
    });
  });

  /* ---------- 16. Dispose cleans up ---------- */

  describe('dispose()', () => {
    it('removes all CSS classes from <html>', () => {
      mgr = new AccessibilityManager({
        highContrast: true,
        reducedMotion: true,
        colorBlindMode: 'deuteranopia',
        fontFamily: 'opendyslexic',
      });
      mgr.init();

      const root = document.documentElement;
      expect(root.classList.contains('high-contrast')).toBe(true);

      mgr.dispose();
      expect(root.classList.contains('high-contrast')).toBe(false);
      expect(root.classList.contains('reduced-motion')).toBe(false);
      expect(root.classList.contains('colorblind-deuteranopia')).toBe(false);
      expect(root.classList.contains('font-opendyslexic')).toBe(false);
    });

    it('removes CSS custom properties', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      mgr.dispose();

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--a11y-font-size')).toBe('');
      expect(root.style.getPropertyValue('--a11y-line-spacing')).toBe('');
    });

    it('removes all active caption elements from DOM', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      mgr.processCaptions([makeCaption({ text: 'test' })]);
      expect(captionContainer.children.length).toBe(1);

      mgr.dispose();
      expect(captionContainer.children.length).toBe(0);
    });

    it('removes matchMedia listener', () => {
      const { listeners } = stubMatchMedia(false);
      mgr = new AccessibilityManager();
      mgr.init();

      mgr.dispose();
      // After dispose, matchMedia changes should not affect settings
      expect(listeners.length).toBe(0);
    });

    /* ---------- 17. Dispose idempotent ---------- */

    it('is idempotent', () => {
      mgr = new AccessibilityManager({ highContrast: true });
      mgr.init();
      mgr.dispose();
      expect(() => mgr.dispose()).not.toThrow();
    });

    it('processAnnouncements is a no-op after dispose', () => {
      mgr = new AccessibilityManager();
      mgr.init();
      mgr.dispose();

      expect(() => {
        mgr.processAnnouncements([makeAnnouncement()]);
      }).not.toThrow();
    });

    it('processCaptions is a no-op after dispose', () => {
      mgr = new AccessibilityManager({ subtitles: true });
      mgr.init();
      mgr.dispose();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      expect(() => {
        mgr.processCaptions([makeCaption()]);
      }).not.toThrow();
    });
  });
});
