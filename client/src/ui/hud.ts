import type { UIState } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

export class HUD implements Disposable {
  private promptEl: HTMLElement | null = null;
  private fpsEl: HTMLElement | null = null;
  private crosshairEl: HTMLElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private debug = false;
  private disposed = false;
  private promptTimeout: ReturnType<typeof setTimeout> | null = null;

  init(debug = false): void {
    this.debug = debug;
    this.promptEl = document.getElementById('interaction-prompt');
    this.fpsEl = document.getElementById('fps-counter');
    this.crosshairEl = document.getElementById('crosshair');
    this.dialogueEl = document.getElementById('dialogue-box');
    if (this.fpsEl) this.fpsEl.classList.toggle('hud-hidden', !debug);
  }

  update(ui: UIState): void {
    if (this.disposed) return;
    if (this.dialogueEl) {
      if (ui.dialogueActive && ui.dialogueText) {
        this.dialogueEl.classList.remove('hud-hidden');
        const speaker = ui.dialogueSpeaker ? `${ui.dialogueSpeaker}: ` : '';
        this.dialogueEl.textContent = `${speaker}${ui.dialogueText}`;
        this.dialogueEl.setAttribute('aria-label', `${speaker}${ui.dialogueText}`);
      } else {
        this.dialogueEl.classList.add('hud-hidden');
      }
    }
    if (ui.paused) {
      this.setCrosshairVisible(false);
    }
  }

  showPrompt(text: string): void {
    if (this.disposed || !this.promptEl) return;
    if (this.promptEl.textContent !== text) {
      this.promptEl.textContent = text;
      this.promptEl.setAttribute('aria-label', text);
    }
    this.promptEl.classList.add('visible');
  }

  hidePrompt(): void { this.promptEl?.classList.remove('visible'); }

  flashPrompt(text: string, ms = 1500): void {
    this.showPrompt(text);
    if (this.promptTimeout !== null) clearTimeout(this.promptTimeout);
    this.promptTimeout = setTimeout(() => { this.hidePrompt(); this.promptTimeout = null; }, ms);
  }

  updateFPS(fps: number): void {
    if (!this.debug || !this.fpsEl) return;
    this.fpsEl.textContent = `${fps} FPS`;
  }

  setCrosshairVisible(visible: boolean): void {
    this.crosshairEl?.classList.toggle('hud-hidden', !visible);
  }

  get isDebug(): boolean { return this.debug; }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.promptTimeout !== null) { clearTimeout(this.promptTimeout); this.promptTimeout = null; }
    this.promptEl = null;
    this.fpsEl = null;
    this.crosshairEl = null;
    this.dialogueEl = null;
  }
}
