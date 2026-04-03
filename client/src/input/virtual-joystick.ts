import type { Disposable } from '../types.js';

const OUTER_SIZE = 120;
const KNOB_SIZE = 40;
const MAX_DISTANCE = 40;
const DEAD_ZONE = 0.15;

/**
 * On-screen virtual joystick for mobile movement.
 * Semi-transparent ring with an inner knob — Frost border, Aurora knob.
 * Appears dynamically where the player touches the left half of the screen.
 */
export class VirtualJoystick implements Disposable {
  private readonly container: HTMLDivElement;
  private readonly outer: HTMLDivElement;
  private readonly knob: HTMLDivElement;
  private touchId: number | null = null;
  private originX = 0;
  private originY = 0;
  private inputX = 0;
  private inputZ = 0;
  private inputMagnitude = 0;
  private disposed = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'virtual-joystick';
    this.container.setAttribute('aria-hidden', 'true');
    Object.assign(this.container.style, {
      position: 'fixed',
      bottom: '15%',
      left: '8%',
      width: `${OUTER_SIZE}px`,
      height: `${OUTER_SIZE}px`,
      zIndex: '15',
      pointerEvents: 'none',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.outer = document.createElement('div');
    Object.assign(this.outer.style, {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '2px solid rgba(34, 211, 238, 0.5)',
      background: 'rgba(15, 23, 42, 0.3)',
      position: 'relative',
    } satisfies Partial<CSSStyleDeclaration>);

    this.knob = document.createElement('div');
    Object.assign(this.knob.style, {
      width: `${KNOB_SIZE}px`,
      height: `${KNOB_SIZE}px`,
      borderRadius: '50%',
      background: 'rgba(167, 139, 250, 0.7)',
      border: '2px solid rgba(167, 139, 250, 0.9)',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    } satisfies Partial<CSSStyleDeclaration>);

    this.outer.appendChild(this.knob);
    this.container.appendChild(this.outer);
  }

  /** Mount the joystick element into the DOM. */
  mount(parent: HTMLElement = document.body): void {
    parent.appendChild(this.container);
  }

  show(): void { this.container.style.display = 'block'; }
  hide(): void { this.container.style.display = 'none'; }

  /** Try to claim a touch (left half of screen). Returns true if claimed. */
  claimTouch(touch: Touch): boolean {
    if (this.touchId !== null) return false;
    if (touch.clientX >= window.innerWidth / 2) return false;
    this.touchId = touch.identifier;
    this.originX = touch.clientX;
    this.originY = touch.clientY;

    // Reposition joystick to where the thumb landed
    this.container.style.left = `${touch.clientX - OUTER_SIZE / 2}px`;
    this.container.style.bottom = 'auto';
    this.container.style.top = `${touch.clientY - OUTER_SIZE / 2}px`;
    this.resetKnob();
    return true;
  }

  /** Handle a touch move. Returns true if this was our touch. */
  handleMove(touch: Touch): boolean {
    if (touch.identifier !== this.touchId) return false;

    const dx = touch.clientX - this.originX;
    const dy = touch.clientY - this.originY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, MAX_DISTANCE);
    const angle = Math.atan2(dy, dx);

    // Move the visual knob
    const knobX = Math.cos(angle) * clamped;
    const knobY = Math.sin(angle) * clamped;
    this.knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

    // Compute normalized input
    this.inputMagnitude = clamped / MAX_DISTANCE;
    if (this.inputMagnitude < DEAD_ZONE) {
      this.inputX = 0;
      this.inputZ = 0;
      this.inputMagnitude = 0;
    } else {
      this.inputX = Math.cos(angle) * this.inputMagnitude;
      this.inputZ = Math.sin(angle) * this.inputMagnitude;
    }
    return true;
  }

  /** Release the joystick touch. Returns true if it was ours. */
  releaseTouch(touchId: number): boolean {
    if (touchId !== this.touchId) return false;
    this.touchId = null;
    this.inputX = 0;
    this.inputZ = 0;
    this.inputMagnitude = 0;
    this.resetKnob();

    // Snap back to default position
    this.container.style.left = '8%';
    this.container.style.top = 'auto';
    this.container.style.bottom = '15%';
    return true;
  }

  get isActive(): boolean { return this.touchId !== null; }

  /** Get normalized direction (−1..1) and magnitude (0..1). */
  getInput(): { x: number; z: number; magnitude: number } {
    return { x: this.inputX, z: this.inputZ, magnitude: this.inputMagnitude };
  }

  private resetKnob(): void {
    this.knob.style.transform = 'translate(-50%, -50%)';
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.container.remove();
  }
}
