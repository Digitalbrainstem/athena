import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HUD } from '../../src/ui/hud.js';
import type { UIState } from '@nexus-academy/core';

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
});
