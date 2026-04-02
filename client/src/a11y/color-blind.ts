// Color blind filter manager — toggles SVG filter CSS classes on the
// document root so the canvas is viewed through a color-simulation filter.
// Also applies enhanced interactive-object outlines when a filter is active.

import type { ColorBlindMode } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const MODE_CLASSES: Record<Exclude<ColorBlindMode, 'none'>, string> = {
  deuteranopia: 'colorblind-deuteranopia',
  protanopia: 'colorblind-protanopia',
  tritanopia: 'colorblind-tritanopia',
};

export class ColorBlindFilter implements Disposable {
  private currentMode: ColorBlindMode = 'none';
  private disposed = false;

  /** Apply a color-blind simulation filter (or remove all filters). */
  apply(mode: ColorBlindMode): void {
    if (this.disposed) return;
    if (mode === this.currentMode) return;

    const root = document.documentElement;

    // Remove previous filter class
    if (this.currentMode !== 'none') {
      root.classList.remove(MODE_CLASSES[this.currentMode]);
    }

    // Add new filter class
    if (mode !== 'none') {
      root.classList.add(MODE_CLASSES[mode]);
    }

    // Toggle enhanced-outlines class when any filter is active
    root.classList.toggle('colorblind-active', mode !== 'none');

    this.currentMode = mode;
  }

  getMode(): ColorBlindMode {
    return this.currentMode;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    const root = document.documentElement;
    for (const cls of Object.values(MODE_CLASSES)) {
      root.classList.remove(cls);
    }
    root.classList.remove('colorblind-active');
    this.currentMode = 'none';
  }
}
