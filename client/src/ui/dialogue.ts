// Dialogue — companion dialogue bubble display.
// Renders dialogue from the UIState into a visible speech-bubble overlay
// with speaker identification and ARIA-live updates.

import type { UIState } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

export class DialogueDisplay implements Disposable {
  private dialogueEl: HTMLElement | null = null;
  private currentText = '';
  private disposed = false;

  init(): void {
    this.dialogueEl = document.getElementById('dialogue-box');
  }

  /** Update the dialogue bubble from the current UIState. */
  update(ui: Readonly<UIState>): void {
    if (this.disposed || !this.dialogueEl) return;

    if (ui.dialogueActive && ui.dialogueText) {
      const speaker = ui.dialogueSpeaker ? `${ui.dialogueSpeaker}: ` : '';
      const fullText = `${speaker}${ui.dialogueText}`;

      if (fullText !== this.currentText) {
        this.currentText = fullText;
        this.dialogueEl.textContent = fullText;
        this.dialogueEl.setAttribute('aria-label', fullText);
      }
      this.dialogueEl.classList.remove('hud-hidden');
    } else {
      if (this.currentText !== '') {
        this.currentText = '';
      }
      this.dialogueEl.classList.add('hud-hidden');
    }
  }

  /** Force-hide the dialogue. */
  hide(): void {
    if (this.dialogueEl) this.dialogueEl.classList.add('hud-hidden');
    this.currentText = '';
  }

  get isVisible(): boolean {
    return this.currentText !== '';
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.dialogueEl = null;
    this.currentText = '';
  }
}
