import type { UIState, Announcement, Caption, Quest, QuestProgress } from '@nexus-academy/core';
import type { AccessibilityManager } from '../a11y/accessibility-manager.js';
import type { Disposable } from '../types.js';
import { CraftPanel, type CraftPanelOptions } from './craft-panel.js';
import { MapPanel, type MapPanelOptions } from './map-panel.js';

export interface QuestPanelData {
  quest: Quest;
  progress: QuestProgress;
}

export class HUD implements Disposable {
  private promptEl: HTMLElement | null = null;
  private fpsEl: HTMLElement | null = null;
  private crosshairEl: HTMLElement | null = null;
  private actionButtonEl: HTMLButtonElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private questPanelEl: HTMLElement | null = null;
  private questTitleEl: HTMLElement | null = null;
  private questStepEl: HTMLElement | null = null;
  private questProgressEl: HTMLElement | null = null;
  private questHintEl: HTMLElement | null = null;
  private questIndicatorEl: HTMLElement | null = null;
  private a11y: AccessibilityManager | null = null;
  private debug = false;
  private disposed = false;
  private promptTimeout: ReturnType<typeof setTimeout> | null = null;
  private hintTimeout: ReturnType<typeof setTimeout> | null = null;
  private completeTimeout: ReturnType<typeof setTimeout> | null = null;
  private mobile = false;
  private actionHandler: (() => void) | null = null;

  // Panels
  private _craftPanel: CraftPanel | null = null;
  private _mapPanel: MapPanel | null = null;

  init(debug = false, a11yManager?: AccessibilityManager): void {
    this.debug = debug;
    this.a11y = a11yManager ?? null;
    this.promptEl = document.getElementById('interaction-prompt');
    this.fpsEl = document.getElementById('fps-counter');
    this.crosshairEl = document.getElementById('crosshair');
    this.actionButtonEl = document.getElementById('touch-action-button') as HTMLButtonElement | null;
    this.dialogueEl = document.getElementById('dialogue-box');
    this.questPanelEl = document.getElementById('quest-panel');
    this.questTitleEl = this.questPanelEl?.querySelector('.quest-title') ?? null;
    this.questStepEl = this.questPanelEl?.querySelector('.quest-step') ?? null;
    this.questProgressEl = this.questPanelEl?.querySelector('.quest-progress') ?? null;
    this.questHintEl = this.questPanelEl?.querySelector('.quest-hint') ?? null;
    this.questIndicatorEl = document.getElementById('quest-indicator');
    if (this.fpsEl) this.fpsEl.classList.toggle('hud-hidden', !debug);
    this.actionButtonEl?.addEventListener('click', this.handleActionButton);

    // Dialogue is driven by the world state and auto-expires there.
    // Do not make it clickable; hiding only the DOM would immediately redraw it.
    if (this.dialogueEl) {
      this.dialogueEl.style.cursor = 'default';
      this.dialogueEl.style.pointerEvents = 'none';
    }
  }

  /** Initialize the crafting panel. */
  initCraftPanel(opts: CraftPanelOptions): void {
    this._craftPanel = new CraftPanel(opts);
    this._craftPanel.init();
  }

  /** Initialize the map panel. */
  initMapPanel(opts: MapPanelOptions): void {
    this._mapPanel = new MapPanel(opts);
    this._mapPanel.init();
  }

  get craftPanel(): CraftPanel | null { return this._craftPanel; }
  get mapPanel(): MapPanel | null { return this._mapPanel; }

  /** Returns true if any overlay panel is open (craft, map, etc.) */
  get hasOpenPanel(): boolean {
    return (this._craftPanel?.isOpen ?? false) || (this._mapPanel?.isOpen ?? false);
  }

  get isDialogueVisible(): boolean {
    return this.dialogueEl !== null && !this.dialogueEl.classList.contains('hud-hidden');
  }

  /** Activate mobile layout — hides crosshair, adds body class for CSS. */
  setMobile(mobile: boolean): void {
    this.mobile = mobile;
    document.body.classList.toggle('mobile', mobile);
    if (mobile) this.setCrosshairVisible(false);
    this.actionButtonEl?.classList.add('hud-hidden');
    this.fpsEl?.classList.toggle('hud-hidden', mobile || !this.debug);
  }

  get isMobile(): boolean { return this.mobile; }

  setActionHandler(handler: () => void): void {
    this.actionHandler = handler;
  }

  update(ui: UIState): void {
    if (this.disposed) return;

    // Dialogue
    if (this.dialogueEl) {
      if (ui.dialogueActive && ui.dialogueText && !this.hasOpenPanel) {
        this.dialogueEl.classList.remove('hud-hidden');
        const speaker = ui.dialogueSpeaker ? `${ui.dialogueSpeaker}: ` : '';
        const fullText = `${speaker}${ui.dialogueText}`;
        this.dialogueEl.textContent = fullText;
        this.dialogueEl.setAttribute('aria-label', fullText);
      } else {
        this.dialogueEl.classList.add('hud-hidden');
      }
    }

    if (ui.paused) {
      this.setCrosshairVisible(false);
    }
  }

  processAnnouncements(announcements: Announcement[]): void {
    if (this.disposed || !this.a11y) return;
    this.a11y.processAnnouncements(announcements);
  }

  processCaptions(captions: Caption[]): void {
    if (this.disposed || !this.a11y) return;
    this.a11y.processCaptions(captions);
  }

  showPrompt(text: string): void {
    if (this.disposed || !this.promptEl) return;
    if (this.promptEl.textContent !== text) {
      this.promptEl.textContent = text;
      this.promptEl.setAttribute('aria-label', text);
    }
    this.promptEl.classList.add('visible');
    if (this.mobile && this.actionButtonEl) {
      this.actionButtonEl.textContent = text.replace(/^Tap to\s+/i, '');
      this.actionButtonEl.setAttribute('aria-label', text);
      this.actionButtonEl.classList.remove('hud-hidden');
    }
  }

  hidePrompt(): void {
    if (!this.promptEl) return;
    this.promptEl.classList.remove('visible');
    this.promptEl.textContent = '';
    this.promptEl.removeAttribute('aria-label');
    if (this.actionButtonEl) {
      this.actionButtonEl.classList.add('hud-hidden');
      this.actionButtonEl.textContent = 'Action';
      this.actionButtonEl.setAttribute('aria-label', 'Action');
    }
  }

  flashPrompt(text: string, ms = 1500): void {
    this.showPrompt(text);
    if (this.promptTimeout !== null) clearTimeout(this.promptTimeout);
    this.promptTimeout = setTimeout(() => { this.hidePrompt(); this.promptTimeout = null; }, ms);
  }

  updateFPS(fps: number): void {
    if (!this.debug || this.mobile || !this.fpsEl) return;
    this.fpsEl.textContent = `${fps} FPS`;
  }

  setCrosshairVisible(visible: boolean): void {
    this.crosshairEl?.classList.toggle('hud-hidden', !visible);
  }

  // --- Quest Panel Methods ---

  /** Show the quest panel with the active quest and its current step. */
  showQuestPanel(quest: Quest, progress: QuestProgress): void {
    if (this.disposed || !this.questPanelEl) return;
    if (this.mobile && this.hasVisiblePrompt()) {
      this.hideQuestPanel();
      return;
    }

    if (this.questTitleEl) {
      this.questTitleEl.textContent = quest.title;
    }

    const stepIndex = progress.stepsCompleted;
    const step = quest.content.steps[stepIndex];
    if (this.questStepEl) {
      this.questStepEl.textContent = step?.instruction ?? '';
    }

    if (this.questProgressEl) {
      const total = quest.content.steps.length;
      this.questProgressEl.textContent = `Step ${Math.min(stepIndex + 1, total)} of ${total}`;
    }

    // Clear any lingering hint when step changes
    if (this.questHintEl && !this.questHintEl.textContent) {
      this.questHintEl.textContent = '';
    }

    this.questPanelEl.classList.add('quest-visible');
  }

  /** Hide the quest panel. */
  hideQuestPanel(): void {
    if (!this.questPanelEl) return;
    this.questPanelEl.classList.remove('quest-visible', 'quest-complete-flash');
    if (this.questTitleEl) this.questTitleEl.textContent = '';
    if (this.questStepEl) this.questStepEl.textContent = '';
    if (this.questProgressEl) this.questProgressEl.textContent = '';
    if (this.questHintEl) this.questHintEl.textContent = '';
  }

  /** Show immediate guidance when no formal quest is active yet. */
  showGuidance(title: string, step: string, hint = ''): void {
    if (this.disposed || !this.questPanelEl) return;
    if (this.mobile && this.hasVisiblePrompt()) {
      this.hideQuestPanel();
      return;
    }
    if (this.questTitleEl) this.questTitleEl.textContent = title;
    if (this.questStepEl) this.questStepEl.textContent = step;
    if (this.questProgressEl) this.questProgressEl.textContent = 'Getting started';
    if (this.questHintEl) this.questHintEl.textContent = hint;
    this.questPanelEl.classList.add('quest-visible');
  }

  /** Show a hint in the quest panel (after struggle detection from FlowEngine). */
  showQuestHint(hint: string): void {
    if (this.disposed || !this.questHintEl) return;
    this.questHintEl.textContent = hint;
    // Auto-clear hint after 8 seconds
    if (this.hintTimeout !== null) clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => {
      if (this.questHintEl) this.questHintEl.textContent = '';
      this.hintTimeout = null;
    }, 8000);
  }

  /** Flash a completion glow on the quest panel. */
  showQuestComplete(title: string): void {
    if (this.disposed || !this.questPanelEl) return;
    if (this.questTitleEl) this.questTitleEl.textContent = title;
    if (this.questStepEl) this.questStepEl.textContent = 'Complete!';
    if (this.questProgressEl) this.questProgressEl.textContent = '';
    if (this.questHintEl) this.questHintEl.textContent = '';

    this.questPanelEl.classList.add('quest-visible', 'quest-complete-flash');
    if (this.completeTimeout !== null) clearTimeout(this.completeTimeout);
    this.completeTimeout = setTimeout(() => {
      this.hideQuestPanel();
      this.completeTimeout = null;
    }, 3000);
  }

  /** Show the quest indicator near quest-relevant objects. */
  showQuestIndicator(text: string): void {
    if (this.disposed || !this.questIndicatorEl) return;
    this.questIndicatorEl.textContent = text;
    this.questIndicatorEl.classList.add('visible');
  }

  /** Hide the quest indicator. */
  hideQuestIndicator(): void {
    this.questIndicatorEl?.classList.remove('visible');
  }

  get isDebug(): boolean { return this.debug; }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.promptTimeout !== null) { clearTimeout(this.promptTimeout); this.promptTimeout = null; }
    if (this.hintTimeout !== null) { clearTimeout(this.hintTimeout); this.hintTimeout = null; }
    if (this.completeTimeout !== null) { clearTimeout(this.completeTimeout); this.completeTimeout = null; }
    this._craftPanel?.dispose();
    this._craftPanel = null;
    this._mapPanel?.dispose();
    this._mapPanel = null;
    this.actionButtonEl?.removeEventListener('click', this.handleActionButton);
    this.promptEl = null;
    this.fpsEl = null;
    this.crosshairEl = null;
    this.actionButtonEl = null;
    this.dialogueEl = null;
    this.questPanelEl = null;
    this.questTitleEl = null;
    this.questStepEl = null;
    this.questProgressEl = null;
    this.questHintEl = null;
    this.questIndicatorEl = null;
    this.a11y = null;
  }

  private handleActionButton = (event: Event): void => {
    event.preventDefault();
    this.actionHandler?.();
  };

  private hasVisiblePrompt(): boolean {
    return this.promptEl?.classList.contains('visible') ?? false;
  }
}
