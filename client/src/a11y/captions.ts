// Caption renderer — displays subtitles and sound-effect captions in the DOM.
// Respects AccessibilitySettings for what types of captions to show.

import type { Caption, AccessibilitySettings } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const DEFAULT_LIFETIME_MS = 4000;
const DEFAULT_MAX_VISIBLE = 3;

interface ActiveCaption {
  el: HTMLElement;
  expiry: number;
}

export interface CaptionRendererOptions {
  lifetimeMs?: number;
  maxVisible?: number;
}

export class CaptionRenderer implements Disposable {
  private container: HTMLElement | null = null;
  private active: ActiveCaption[] = [];
  private disposed = false;
  private readonly lifetimeMs: number;
  private readonly maxVisible: number;

  constructor(opts?: CaptionRendererOptions) {
    this.lifetimeMs = opts?.lifetimeMs ?? DEFAULT_LIFETIME_MS;
    this.maxVisible = opts?.maxVisible ?? DEFAULT_MAX_VISIBLE;
  }

  init(): void {
    this.container = document.getElementById('caption-container');
  }

  /**
   * Process new captions from the scene graph.
   * Only renders caption types enabled by the current settings.
   */
  process(captions: ReadonlyArray<Caption>, settings: Readonly<AccessibilitySettings>): void {
    if (this.disposed || !this.container) return;
    if (!settings.subtitles && !settings.soundCaptions) return;

    const now = performance.now();

    for (const cap of captions) {
      if (cap.type === 'sfx' && !settings.soundCaptions) continue;
      if (cap.type === 'ambient' && !settings.soundCaptions) continue;
      if ((cap.type === 'voice' || cap.type === 'music') && !settings.subtitles) continue;

      const el = document.createElement('p');
      el.classList.add('caption-line');

      if (cap.type === 'sfx' || cap.type === 'ambient') {
        el.classList.add('caption-sfx');
      }

      if (cap.speaker) {
        const speakerSpan = document.createElement('span');
        speakerSpan.classList.add('caption-speaker');
        speakerSpan.textContent = `${cap.speaker}: `;
        el.appendChild(speakerSpan);
        el.appendChild(document.createTextNode(cap.text));
      } else if (cap.type === 'sfx' || cap.type === 'ambient') {
        el.textContent = `[${cap.text}]`;
      } else {
        el.textContent = cap.text;
      }

      el.setAttribute('role', 'log');
      this.container.appendChild(el);
      this.active.push({ el, expiry: now + this.lifetimeMs });

      // Enforce maximum visible captions
      while (this.active.length > this.maxVisible) {
        const oldest = this.active.shift();
        oldest?.el.remove();
      }
    }

    this.expireOld(now);
  }

  /** Remove captions that have exceeded their display lifetime. */
  private expireOld(now: number): void {
    while (this.active.length > 0 && this.active[0].expiry <= now) {
      const old = this.active.shift();
      old?.el.remove();
    }
  }

  /** Clear all active captions immediately. */
  clear(): void {
    for (const cap of this.active) cap.el.remove();
    this.active.length = 0;
  }

  get activeCount(): number {
    return this.active.length;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();
    this.container = null;
  }
}
