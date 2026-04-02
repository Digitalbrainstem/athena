// One-switch scanning mode — enables the entire game to be played with a
// single button / switch / sip-and-puff device. An automatic scanner cycles
// through interactive elements; the user presses to select, holds for a
// secondary menu, and double-presses to confirm/interact.

import type { GameAction, AccessibilitySettings } from '@nexus-academy/core';
import type { ActionCallback, Disposable } from '../types.js';

/** Interactable element tracked by the scanner. */
export interface ScanTarget {
  entityId: number;
  label: string;
  action: GameAction;
}

const DEFAULT_SCAN_SPEED_S = 2.0;
const HOLD_THRESHOLD_MS = 500;
const DOUBLE_PRESS_WINDOW_MS = 400;

export class OneSwitchScanner implements Disposable {
  private targets: ScanTarget[] = [];
  private currentIndex = -1;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private active = false;
  private disposed = false;

  // Hold / double-press detection
  private pressStart = 0;
  private lastPressTime = 0;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  // Callbacks
  private onSelect: ActionCallback | null = null;
  private onHighlight: ((entityId: number | null) => void) | null = null;
  private onSecondaryMenu: (() => void) | null = null;

  // Configurables
  private scanSpeedMs: number;
  private holdThresholdMs: number;
  private doublePressWindowMs: number;

  // Event handling
  private abort: AbortController | null = null;

  constructor(settings?: Partial<AccessibilitySettings>) {
    const speed = settings?.scanSpeed ?? DEFAULT_SCAN_SPEED_S;
    this.scanSpeedMs = speed * 1000;
    this.holdThresholdMs = settings?.holdDuration ?? HOLD_THRESHOLD_MS;
    this.doublePressWindowMs = DOUBLE_PRESS_WINDOW_MS;
  }

  /** Register callback for when the user selects an element. */
  onAction(callback: ActionCallback): void {
    this.onSelect = callback;
  }

  /** Register callback for when the highlight changes. */
  onHighlightChange(callback: (entityId: number | null) => void): void {
    this.onHighlight = callback;
  }

  /** Register callback for the secondary (hold) menu. */
  onSecondary(callback: () => void): void {
    this.onSecondaryMenu = callback;
  }

  /** Start scanning. Begins auto-cycling through targets. */
  start(): void {
    if (this.disposed || this.active) return;
    this.active = true;
    this.currentIndex = -1;

    // Listen for any keydown/keyup or single touch as the "switch" input
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    document.addEventListener('keydown', this.onPress, opts);
    document.addEventListener('keyup', this.onRelease, opts);
    document.addEventListener('pointerdown', this.onPress, opts);
    document.addEventListener('pointerup', this.onRelease, opts);

    this.startScanTimer();
  }

  /** Stop scanning and release all listeners. */
  stop(): void {
    this.active = false;
    this.stopScanTimer();
    this.clearHold();
    this.abort?.abort();
    this.abort = null;
    this.onHighlight?.(null);
    this.currentIndex = -1;
  }

  /** Update the list of scannable targets (called each frame). */
  setTargets(targets: ScanTarget[]): void {
    this.targets = targets;

    // If current index is out of bounds, reset
    if (this.currentIndex >= this.targets.length) {
      this.currentIndex = this.targets.length > 0 ? 0 : -1;
      this.emitHighlight();
    }
  }

  /** Update settings (e.g. scan speed changed in accessibility menu). */
  updateSettings(settings: Partial<AccessibilitySettings>): void {
    if (settings.scanSpeed !== undefined) {
      this.scanSpeedMs = settings.scanSpeed * 1000;
      if (this.active) {
        this.stopScanTimer();
        this.startScanTimer();
      }
    }
    if (settings.holdDuration !== undefined) {
      this.holdThresholdMs = settings.holdDuration;
    }
  }

  get isActive(): boolean {
    return this.active;
  }

  get highlightedIndex(): number {
    return this.currentIndex;
  }

  get highlightedTarget(): ScanTarget | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.targets.length) return null;
    return this.targets[this.currentIndex] ?? null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.onSelect = null;
    this.onHighlight = null;
    this.onSecondaryMenu = null;
    this.targets = [];
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private startScanTimer(): void {
    this.stopScanTimer();
    if (this.targets.length === 0) return;

    this.advanceScan();
    this.scanTimer = setInterval(() => this.advanceScan(), this.scanSpeedMs);
  }

  private stopScanTimer(): void {
    if (this.scanTimer !== null) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  private advanceScan(): void {
    if (this.targets.length === 0) {
      this.currentIndex = -1;
      this.emitHighlight();
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.targets.length;
    this.emitHighlight();
  }

  private emitHighlight(): void {
    const target = this.highlightedTarget;
    this.onHighlight?.(target?.entityId ?? null);
  }

  // --- Press / release handlers ---

  private onPress = (e: Event): void => {
    if (!this.active || this.targets.length === 0) return;

    // Prevent default so keyboard presses don't also trigger other handlers
    e.preventDefault();

    const now = performance.now();
    this.pressStart = now;

    // Start hold detection
    this.clearHold();
    this.holdTimer = setTimeout(() => {
      // Long press → secondary menu
      this.onSecondaryMenu?.();
      this.holdTimer = null;
    }, this.holdThresholdMs);
  };

  private onRelease = (e: Event): void => {
    if (!this.active || this.targets.length === 0) return;
    e.preventDefault();

    const now = performance.now();
    const pressDuration = now - this.pressStart;

    // Cancel hold if released before threshold
    this.clearHold();

    // If this was a long hold, the secondary menu already fired — skip
    if (pressDuration >= this.holdThresholdMs) return;

    // Double-press detection
    if (now - this.lastPressTime < this.doublePressWindowMs) {
      // Double press → confirm / interact
      this.selectCurrent();
      this.lastPressTime = 0;
    } else {
      this.lastPressTime = now;
      // Single tap just advances — the user selects by pressing when the
      // desired element is highlighted. We interpret a single press as "select current".
      this.selectCurrent();
    }
  };

  private selectCurrent(): void {
    const target = this.highlightedTarget;
    if (target) {
      this.onSelect?.(target.action);
    }
  }

  private clearHold(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }
}
