import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Transition overlay — crossfade between overworld and interiors
// ---------------------------------------------------------------------------

const TRANSITION_DURATION = 0.6; // seconds for fade-out + fade-in

export class TransitionOverlay implements Disposable {
  private overlay: HTMLDivElement;
  private animating = false;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'world-transition-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: '#0f172a', // Deep Space from art direction
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '100',
      transition: `opacity ${TRANSITION_DURATION / 2}s ease-in-out`,
    });
    document.body.appendChild(this.overlay);
  }

  get isAnimating(): boolean {
    return this.animating;
  }

  /**
   * Execute a crossfade transition:
   * 1. Fade to black
   * 2. Call the provided callback (swap scene content)
   * 3. Fade back in
   */
  async crossfade(onMidpoint: () => void): Promise<void> {
    if (this.animating) return;
    this.animating = true;

    // Fade out (screen goes dark)
    this.overlay.style.opacity = '1';
    await this.waitTransition();

    // At midpoint: swap scene content
    onMidpoint();

    // Small delay to let scene update
    await this.sleep(50);

    // Fade in (screen clears)
    this.overlay.style.opacity = '0';
    await this.waitTransition();

    this.animating = false;
  }

  dispose(): void {
    this.overlay.remove();
  }

  private waitTransition(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (): void => {
        this.overlay.removeEventListener('transitionend', handler);
        resolve();
      };
      this.overlay.addEventListener('transitionend', handler);
      // Safety timeout in case transitionend doesn't fire
      setTimeout(resolve, (TRANSITION_DURATION / 2) * 1000 + 100);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
