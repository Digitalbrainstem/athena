// Screen reader bridge — injects announcements into aria-live DOM regions
// so assistive technology can read game state changes aloud.

import type { Announcement } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

export class ScreenReaderBridge implements Disposable {
  private politeEl: HTMLElement | null = null;
  private assertiveEl: HTMLElement | null = null;
  private disposed = false;
  private clearTimers: ReturnType<typeof setTimeout>[] = [];

  init(): void {
    this.politeEl = document.getElementById('a11y-announcer-polite');
    this.assertiveEl = document.getElementById('a11y-announcer-assertive');
  }

  /**
   * Push announcements to the correct aria-live region.
   * Clears and re-sets textContent so screen readers detect the mutation.
   */
  announce(announcements: ReadonlyArray<Announcement>): void {
    if (this.disposed) return;

    for (const ann of announcements) {
      const el = ann.priority === 'assertive' ? this.assertiveEl : this.politeEl;
      if (!el) continue;

      // Clear first, then set after a microtask so the DOM mutation registers
      el.textContent = '';
      const timer = setTimeout(() => {
        el.textContent = ann.text;
      }, 0);
      this.clearTimers.push(timer);
    }
  }

  /** Immediately announce a single message (assertive). */
  announceImmediate(text: string): void {
    if (this.disposed || !this.assertiveEl) return;
    this.assertiveEl.textContent = '';
    const timer = setTimeout(() => {
      if (this.assertiveEl) this.assertiveEl.textContent = text;
    }, 0);
    this.clearTimers.push(timer);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const t of this.clearTimers) clearTimeout(t);
    this.clearTimers.length = 0;
    if (this.politeEl) this.politeEl.textContent = '';
    if (this.assertiveEl) this.assertiveEl.textContent = '';
    this.politeEl = null;
    this.assertiveEl = null;
  }
}
