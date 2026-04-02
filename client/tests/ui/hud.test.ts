import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HUD } from '../../src/ui/hud.js';
import type { UIState, Announcement, Caption } from '@nexus-academy/core';
import type { AccessibilityManager } from '../../src/a11y/accessibility-manager.js';

/* ---------- helpers ---------- */

function makeUIState(overrides?: Partial<UIState>): UIState {
  return {
    elements: [],
    dialogueActive: false,
    inventoryOpen: false,
    mapOpen: false,
    paused: false,
    ...overrides,
  };
}

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

function createMockA11y(): AccessibilityManager {
  return {
    processAnnouncements: vi.fn(),
    processCaptions: vi.fn(),
    init: vi.fn(),
    dispose: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  } as unknown as AccessibilityManager;
}

/* ================================================== */

describe('HUD', () => {
  let hud: HUD;
  let promptEl: HTMLElement;
  let fpsEl: HTMLElement;
  let crosshairEl: HTMLElement;

  beforeEach(() => {
    promptEl = document.createElement('div');
    promptEl.id = 'interaction-prompt';
    document.body.appendChild(promptEl);

    fpsEl = document.createElement('div');
    fpsEl.id = 'fps-counter';
    document.body.appendChild(fpsEl);

    crosshairEl = document.createElement('div');
    crosshairEl.id = 'crosshair';
    document.body.appendChild(crosshairEl);

    hud = new HUD();
    hud.init(true);
  });

  afterEach(() => {
    hud.dispose();
    promptEl.remove();
    fpsEl.remove();
    crosshairEl.remove();
  });

  /* ---------- Original tests ---------- */

  it('showPrompt makes prompt visible', () => {
    hud.showPrompt('Press E to interact');
    expect(promptEl.classList.contains('visible')).toBe(true);
    expect(promptEl.textContent).toBe('Press E to interact');
    expect(promptEl.getAttribute('aria-label')).toBe('Press E to interact');
  });

  it('hidePrompt removes visibility', () => {
    hud.showPrompt('test');
    hud.hidePrompt();
    expect(promptEl.classList.contains('visible')).toBe(false);
  });

  it('updateFPS sets text content', () => {
    hud.updateFPS(60);
    expect(fpsEl.textContent).toBe('60 FPS');
  });

  it('FPS counter is visible in debug mode', () => {
    expect(fpsEl.classList.contains('hud-hidden')).toBe(false);
  });

  it('FPS counter hidden when not in debug mode', () => {
    hud.dispose();
    hud = new HUD();
    hud.init(false);
    const el = document.getElementById('fps-counter')!;
    expect(el.classList.contains('hud-hidden')).toBe(true);
  });

  it('setCrosshairVisible toggles visibility', () => {
    hud.setCrosshairVisible(false);
    expect(crosshairEl.classList.contains('hud-hidden')).toBe(true);
    hud.setCrosshairVisible(true);
    expect(crosshairEl.classList.contains('hud-hidden')).toBe(false);
  });

  it('update with UIState does not throw', () => {
    expect(() => hud.update(makeUIState())).not.toThrow();
  });

  it('update hides crosshair when paused', () => {
    hud.update(makeUIState({ paused: true }));
    expect(crosshairEl.classList.contains('hud-hidden')).toBe(true);
  });

  it('isDebug reflects init parameter', () => {
    expect(hud.isDebug).toBe(true);
  });

  it('dispose is idempotent', () => {
    hud.dispose();
    expect(() => hud.dispose()).not.toThrow();
  });

  /* ---------- init with AccessibilityManager ---------- */

  describe('init() with AccessibilityManager', () => {
    it('stores the a11y manager reference', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);

      // Verify it's wired up by calling processAnnouncements
      hud.processAnnouncements([makeAnnouncement()]);
      expect(mockA11y.processAnnouncements).toHaveBeenCalled();
    });

    it('works without a11y manager (undefined)', () => {
      hud.dispose();
      hud = new HUD();
      hud.init(false);
      // Should not throw when no a11y manager
      expect(() => hud.processAnnouncements([makeAnnouncement()])).not.toThrow();
      expect(() => hud.processCaptions([makeCaption()])).not.toThrow();
    });
  });

  /* ---------- processAnnouncements delegation ---------- */

  describe('processAnnouncements()', () => {
    it('delegates to AccessibilityManager', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);

      const announcements = [makeAnnouncement({ text: 'Hello' })];
      hud.processAnnouncements(announcements);
      expect(mockA11y.processAnnouncements).toHaveBeenCalledWith(announcements);
    });

    it('passes multiple announcements through', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);

      const announcements = [
        makeAnnouncement({ text: 'first', priority: 'polite' }),
        makeAnnouncement({ text: 'second', priority: 'assertive' }),
      ];
      hud.processAnnouncements(announcements);
      expect(mockA11y.processAnnouncements).toHaveBeenCalledWith(announcements);
    });

    it('does nothing when no a11y manager is set', () => {
      // Default hud has no a11y manager
      hud.dispose();
      hud = new HUD();
      hud.init(false);
      expect(() => hud.processAnnouncements([makeAnnouncement()])).not.toThrow();
    });

    it('does nothing after dispose', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);
      hud.dispose();

      hud.processAnnouncements([makeAnnouncement()]);
      expect(mockA11y.processAnnouncements).not.toHaveBeenCalled();
    });
  });

  /* ---------- processCaptions delegation ---------- */

  describe('processCaptions()', () => {
    it('delegates to AccessibilityManager', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);

      const captions = [makeCaption({ text: 'Hello world' })];
      hud.processCaptions(captions);
      expect(mockA11y.processCaptions).toHaveBeenCalledWith(captions);
    });

    it('passes mixed caption types through', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);

      const captions = [
        makeCaption({ type: 'voice', text: 'dialogue' }),
        makeCaption({ type: 'sfx', text: 'boom' }),
        makeCaption({ type: 'ambient', text: 'wind' }),
      ];
      hud.processCaptions(captions);
      expect(mockA11y.processCaptions).toHaveBeenCalledWith(captions);
    });

    it('does nothing when no a11y manager is set', () => {
      hud.dispose();
      hud = new HUD();
      hud.init(false);
      expect(() => hud.processCaptions([makeCaption()])).not.toThrow();
    });

    it('does nothing after dispose', () => {
      hud.dispose();
      hud = new HUD();
      const mockA11y = createMockA11y();
      hud.init(false, mockA11y);
      hud.dispose();

      hud.processCaptions([makeCaption()]);
      expect(mockA11y.processCaptions).not.toHaveBeenCalled();
    });
  });
});
