import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DialogueDisplay } from '../../src/ui/dialogue.js';
import type { UIState } from '@nexus-academy/core';

function createMockDom(): void {
  document.body.innerHTML = '<div id="dialogue-box" class="hud-hidden"></div>';
}

function makeUI(overrides: Partial<UIState> = {}): UIState {
  return {
    elements: [],
    dialogueActive: false,
    inventoryOpen: false,
    mapOpen: false,
    paused: false,
    ...overrides,
  };
}

describe('DialogueDisplay', () => {
  let dialogue: DialogueDisplay;

  beforeEach(() => {
    createMockDom();
    dialogue = new DialogueDisplay();
    dialogue.init();
  });

  afterEach(() => {
    dialogue.dispose();
    document.body.innerHTML = '';
  });

  it('starts hidden', () => {
    const el = document.getElementById('dialogue-box')!;
    expect(el.classList.contains('hud-hidden')).toBe(true);
    expect(dialogue.isVisible).toBe(false);
  });

  it('shows dialogue with text', () => {
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Welcome!' }));
    const el = document.getElementById('dialogue-box')!;
    expect(el.classList.contains('hud-hidden')).toBe(false);
    expect(el.textContent).toBe('Welcome!');
    expect(dialogue.isVisible).toBe(true);
  });

  it('shows dialogue with speaker name', () => {
    dialogue.update(makeUI({
      dialogueActive: true,
      dialogueText: 'Let\'s explore!',
      dialogueSpeaker: 'Buddy',
    }));
    const el = document.getElementById('dialogue-box')!;
    expect(el.textContent).toBe('Buddy: Let\'s explore!');
    expect(el.getAttribute('aria-label')).toBe('Buddy: Let\'s explore!');
  });

  it('hides dialogue when inactive', () => {
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Hello' }));
    dialogue.update(makeUI({ dialogueActive: false }));
    const el = document.getElementById('dialogue-box')!;
    expect(el.classList.contains('hud-hidden')).toBe(true);
    expect(dialogue.isVisible).toBe(false);
  });

  it('does not re-set text if unchanged', () => {
    const el = document.getElementById('dialogue-box')!;
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Same' }));
    const first = el.textContent;
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Same' }));
    expect(el.textContent).toBe(first);
  });

  it('force-hides', () => {
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Hello' }));
    dialogue.hide();
    const el = document.getElementById('dialogue-box')!;
    expect(el.classList.contains('hud-hidden')).toBe(true);
    expect(dialogue.isVisible).toBe(false);
  });

  it('does nothing after disposal', () => {
    dialogue.dispose();
    dialogue.update(makeUI({ dialogueActive: true, dialogueText: 'Ignored' }));
    // Should not throw
    expect(dialogue.isVisible).toBe(false);
  });
});
