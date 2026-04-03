import type { LookPayload } from '@nexus-academy/core';

const DEFAULT_SENSITIVITY = 0.003;

/**
 * Handles camera rotation via touch drag on the right half of the screen.
 * Tracks a single active touch so multi-touch with the joystick works.
 */
export class TouchCameraController {
  private activeTouchId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private readonly sensitivity: number;

  constructor(sensitivity = DEFAULT_SENSITIVITY) {
    this.sensitivity = sensitivity;
  }

  /** Claim a touch for the camera. Returns true if accepted (right half, no active drag). */
  claimTouch(touch: Touch): boolean {
    if (this.activeTouchId !== null) return false;
    if (touch.clientX < window.innerWidth / 2) return false;
    this.activeTouchId = touch.identifier;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    return true;
  }

  /** Process a touch move. Returns a LookPayload if this is the active camera touch. */
  handleMove(touch: Touch): LookPayload | null {
    if (touch.identifier !== this.activeTouchId) return null;
    const deltaX = (touch.clientX - this.lastX) * this.sensitivity;
    const deltaY = (touch.clientY - this.lastY) * this.sensitivity;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    // Invert to match mouse look convention (drag right → look right → negative yaw)
    return { deltaX: -deltaX, deltaY: -deltaY };
  }

  /** Release a touch. Returns true if it was the active camera touch. */
  releaseTouch(touchId: number): boolean {
    if (touchId !== this.activeTouchId) return false;
    this.activeTouchId = null;
    return true;
  }

  get isActive(): boolean {
    return this.activeTouchId !== null;
  }
}
