// Caption overlay — dedicated UI component for rendering persistent captions.
// This is the visual container for the CaptionRenderer output, providing
// configurable position, font size, and background opacity.

import type { AccessibilitySettings } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

export type CaptionPosition = 'top' | 'bottom' | 'floating';
export type CaptionBackground = 'none' | 'semi' | 'opaque';

export class CaptionOverlay implements Disposable {
  private container: HTMLElement | null = null;
  private disposed = false;
  private position: CaptionPosition = 'bottom';
  private background: CaptionBackground = 'semi';

  init(): void {
    this.container = document.getElementById('caption-container');
    this.applyPosition();
  }

  /** Update visual settings based on accessibility preferences. */
  applySettings(settings: Readonly<AccessibilitySettings>): void {
    if (this.disposed || !this.container) return;

    // Font size follows global setting via CSS custom property
    this.container.style.setProperty('--caption-font-size', `${settings.fontSize / 100}rem`);
  }

  /** Set caption position on screen. */
  setPosition(position: CaptionPosition): void {
    if (this.disposed) return;
    this.position = position;
    this.applyPosition();
  }

  /** Set caption background opacity. */
  setBackground(bg: CaptionBackground): void {
    if (this.disposed || !this.container) return;
    this.background = bg;
    this.container.classList.remove('caption-bg-none', 'caption-bg-semi', 'caption-bg-opaque');
    this.container.classList.add(`caption-bg-${bg}`);
  }

  getPosition(): CaptionPosition {
    return this.position;
  }

  getBackground(): CaptionBackground {
    return this.background;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.container) {
      this.container.style.removeProperty('--caption-font-size');
    }
    this.container = null;
  }

  private applyPosition(): void {
    if (!this.container) return;
    this.container.classList.remove('caption-top', 'caption-bottom', 'caption-floating');
    this.container.classList.add(`caption-${this.position}`);
  }
}
