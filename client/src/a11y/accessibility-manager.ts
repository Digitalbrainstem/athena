import type { AccessibilitySettings, Announcement, Caption } from '@nexus-academy/core';
import { sanitizeSettings, mergeSettings } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const CAPTION_LIFETIME_MS = 4000;
const MAX_VISIBLE_CAPTIONS = 3;

export class AccessibilityManager implements Disposable {
  private settings: AccessibilitySettings;
  private politeEl: HTMLElement | null = null;
  private assertiveEl: HTMLElement | null = null;
  private captionContainer: HTMLElement | null = null;
  private activeCaptions: { el: HTMLElement; expiry: number }[] = [];
  private reducedMotionQuery: MediaQueryList | null = null;
  private disposed = false;

  constructor(initial?: Partial<AccessibilitySettings>) {
    this.settings = sanitizeSettings(initial ?? {});
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (this.reducedMotionQuery.matches && !this.settings.reducedMotion) {
      this.settings = mergeSettings(this.settings, { reducedMotion: true });
    }
    this.reducedMotionQuery.addEventListener('change', this.onReducedMotionChange);
  }

  init(): void {
    this.politeEl = document.getElementById('a11y-announcer-polite');
    this.assertiveEl = document.getElementById('a11y-announcer-assertive');
    this.captionContainer = document.getElementById('caption-container');
    this.applySettings();
  }

  getSettings(): Readonly<AccessibilitySettings> {
    return this.settings;
  }

  updateSettings(overrides: Partial<AccessibilitySettings>): void {
    this.settings = mergeSettings(this.settings, overrides);
    this.applySettings();
  }

  processAnnouncements(announcements: Announcement[]): void {
    if (this.disposed) return;
    for (const ann of announcements) {
      const el = ann.priority === 'assertive' ? this.assertiveEl : this.politeEl;
      if (el) {
        // Must clear then set for screen readers to re-announce
        el.textContent = '';
        // Use setTimeout 0 to ensure DOM mutation is picked up
        setTimeout(() => { el.textContent = ann.text; }, 0);
      }
    }
  }

  processCaptions(captions: Caption[]): void {
    if (this.disposed || !this.captionContainer) return;
    if (!this.settings.subtitles && !this.settings.soundCaptions) return;

    const now = performance.now();

    for (const cap of captions) {
      // Filter based on settings
      if (cap.type === 'sfx' && !this.settings.soundCaptions) continue;
      if ((cap.type === 'voice' || cap.type === 'music') && !this.settings.subtitles) continue;

      const el = document.createElement('p');
      el.classList.add('caption-line');
      if (cap.type === 'sfx' || cap.type === 'ambient') {
        el.classList.add('caption-sfx');
      }
      if (cap.speaker) {
        const speaker = document.createElement('span');
        speaker.classList.add('caption-speaker');
        speaker.textContent = `${cap.speaker}: `;
        el.appendChild(speaker);
        el.appendChild(document.createTextNode(cap.text));
      } else if (cap.type === 'sfx' || cap.type === 'ambient') {
        el.textContent = `[${cap.text}]`;
      } else {
        el.textContent = cap.text;
      }
      el.setAttribute('role', 'log');

      this.captionContainer.appendChild(el);
      this.activeCaptions.push({ el, expiry: now + CAPTION_LIFETIME_MS });

      // Remove oldest if over limit
      while (this.activeCaptions.length > MAX_VISIBLE_CAPTIONS) {
        const oldest = this.activeCaptions.shift();
        oldest?.el.remove();
      }
    }

    // Expire old captions
    this.expireCaptions(now);
  }

  private expireCaptions(now: number): void {
    while (this.activeCaptions.length > 0 && this.activeCaptions[0].expiry <= now) {
      const old = this.activeCaptions.shift();
      old?.el.remove();
    }
  }

  private applySettings(): void {
    const root = document.documentElement;
    const s = this.settings;

    // Font sizing
    root.style.setProperty('--a11y-font-size', `${s.fontSize / 100}rem`);
    root.style.setProperty('--a11y-line-spacing', `${s.lineSpacing}`);

    // Font family class
    root.classList.toggle('font-opendyslexic', s.fontFamily === 'opendyslexic');
    root.classList.toggle('font-high-legibility', s.fontFamily === 'high-legibility');

    // High contrast
    root.classList.toggle('high-contrast', s.highContrast);

    // Reduced motion
    root.classList.toggle('reduced-motion', s.reducedMotion);

    // Color blind modes
    root.classList.toggle('colorblind-deuteranopia', s.colorBlindMode === 'deuteranopia');
    root.classList.toggle('colorblind-protanopia', s.colorBlindMode === 'protanopia');
    root.classList.toggle('colorblind-tritanopia', s.colorBlindMode === 'tritanopia');
  }

  private onReducedMotionChange = (e: MediaQueryListEvent): void => {
    if (e.matches) {
      this.updateSettings({ reducedMotion: true });
    }
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.reducedMotionQuery?.removeEventListener('change', this.onReducedMotionChange);
    this.reducedMotionQuery = null;
    // Clean up captions
    for (const cap of this.activeCaptions) cap.el.remove();
    this.activeCaptions = [];
    // Clear CSS
    const root = document.documentElement;
    root.style.removeProperty('--a11y-font-size');
    root.style.removeProperty('--a11y-line-spacing');
    root.classList.remove('high-contrast', 'reduced-motion',
      'colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia',
      'font-opendyslexic', 'font-high-legibility');
    this.politeEl = null;
    this.assertiveEl = null;
    this.captionContainer = null;
  }
}
