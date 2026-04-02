import type { GameAction, MovePayload, LookPayload, SelectPayload, ActionSource } from '@nexus-academy/core';
import type { InputProvider, ActionCallback } from '../types.js';

// ─── Controller Types ───────────────────────────────────────────────────────

export type ControllerType = 'xbox' | 'playstation' | 'switch' | 'generic';

export interface GamepadButtonMapping {
  interact: number;
  back: number;
  craft: number;
  inventory: number;
  companion: number;
  map: number;
  pause: number;
  questLog: number;
  sprint: number;
  useTool: number;
  dpadUp: number;
  dpadDown: number;
  dpadLeft: number;
  dpadRight: number;
}

export interface HapticPattern {
  duration: number;
  strongMagnitude: number;
  weakMagnitude: number;
}

export interface GamepadConfig {
  deadZone: number;
  lookSensitivity: number;
  buttonMapping: Partial<GamepadButtonMapping>;
  hapticEnabled: boolean;
  singleSwitchMode: boolean;
  scanIntervalMs: number;
}

// ─── Standard Button Indices (W3C Standard Gamepad) ─────────────────────────

const STANDARD_BUTTONS = {
  faceBottom: 0,   // Xbox A, PS ×, Switch B
  faceRight: 1,    // Xbox B, PS ○, Switch A
  faceLeft: 2,     // Xbox X, PS □, Switch Y
  faceTop: 3,      // Xbox Y, PS △, Switch X
  leftBumper: 4,   // LB / L1 / L
  rightBumper: 5,  // RB / R1 / R
  leftTrigger: 6,  // LT / L2 / ZL
  rightTrigger: 7, // RT / R2 / ZR
  select: 8,       // View / Share / -
  start: 9,        // Menu / Options / +
  leftStick: 10,
  rightStick: 11,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  home: 16,
} as const;

// Default mapping: standard gamepad → game actions
const DEFAULT_BUTTON_MAP: GamepadButtonMapping = {
  interact: STANDARD_BUTTONS.faceBottom,
  back: STANDARD_BUTTONS.faceRight,
  craft: STANDARD_BUTTONS.faceLeft,
  inventory: STANDARD_BUTTONS.faceTop,
  companion: STANDARD_BUTTONS.leftBumper,
  map: STANDARD_BUTTONS.rightBumper,
  pause: STANDARD_BUTTONS.start,
  questLog: STANDARD_BUTTONS.select,
  sprint: STANDARD_BUTTONS.leftTrigger,
  useTool: STANDARD_BUTTONS.rightTrigger,
  dpadUp: STANDARD_BUTTONS.dpadUp,
  dpadDown: STANDARD_BUTTONS.dpadDown,
  dpadLeft: STANDARD_BUTTONS.dpadLeft,
  dpadRight: STANDARD_BUTTONS.dpadRight,
};

// ─── Haptic Patterns ────────────────────────────────────────────────────────

export const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  confirm:     { duration: 100, strongMagnitude: 0.4, weakMagnitude: 0.2 },
  discovery:   { duration: 300, strongMagnitude: 0.6, weakMagnitude: 0.4 },
  impact:      { duration: 150, strongMagnitude: 1.0, weakMagnitude: 0.5 },
  companion:   { duration: 200, strongMagnitude: 0.2, weakMagnitude: 0.3 },
  navigate:    { duration: 50,  strongMagnitude: 0.1, weakMagnitude: 0.1 },
};

// ─── Controller Detection ───────────────────────────────────────────────────

export function detectControllerType(gamepad: Gamepad): ControllerType {
  const id = gamepad.id.toLowerCase();
  if (id.includes('xbox') || id.includes('xinput') || id.includes('microsoft')) return 'xbox';
  if (id.includes('playstation') || id.includes('dualshock') || id.includes('dualsense')
      || id.includes('054c') || id.includes('sony')) return 'playstation';
  if (id.includes('nintendo') || id.includes('switch') || id.includes('pro controller')) return 'switch';
  return 'generic';
}

export function getControllerLabel(type: ControllerType): Record<string, string> {
  switch (type) {
    case 'xbox':
      return { interact: 'A', back: 'B', craft: 'X', inventory: 'Y', companion: 'LB', map: 'RB' };
    case 'playstation':
      return { interact: '×', back: '○', craft: '□', inventory: '△', companion: 'L1', map: 'R1' };
    case 'switch':
      return { interact: 'B', back: 'A', craft: 'Y', inventory: 'X', companion: 'L', map: 'R' };
    default:
      return { interact: '1', back: '2', craft: '3', inventory: '4', companion: 'L', map: 'R' };
  }
}

// ─── GamepadInput ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: GamepadConfig = {
  deadZone: 0.15,
  lookSensitivity: 1.0,
  buttonMapping: {},
  hapticEnabled: true,
  singleSwitchMode: false,
  scanIntervalMs: 1500,
};

export class GamepadInput implements InputProvider {
  readonly name: ActionSource = 'gamepad';

  private emit: ActionCallback | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private abort: AbortController | null = null;
  private readonly config: GamepadConfig;
  private readonly buttonMap: GamepadButtonMapping;
  private prevButtonStates = new Map<number, boolean[]>();
  private connectedPads = new Map<number, ControllerType>();

  // Single-switch scanning state
  private scanIndex = 0;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private readonly scanTargets: string[] = [
    'interact', 'back', 'inventory', 'companion', 'map', 'pause',
    'dpadUp', 'dpadDown', 'dpadLeft', 'dpadRight',
  ];
  private onScanHighlight: ((action: string, index: number) => void) | null = null;

  constructor(config: Partial<GamepadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.buttonMap = { ...DEFAULT_BUTTON_MAP, ...this.config.buttonMapping };
  }

  attach(emit: ActionCallback): void {
    this.detach();
    this.emit = emit;
    this.abort = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.abort.signal };

    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.onConnect, opts);
      window.addEventListener('gamepaddisconnected', this.onDisconnect, opts);
    }

    // Poll at ~60 fps for responsive input
    this.pollInterval = setInterval(this.poll, 16);

    if (this.config.singleSwitchMode) {
      this.startScanning();
    }

    // Detect already-connected gamepads
    this.detectExistingPads();
  }

  detach(): void {
    this.abort?.abort();
    this.abort = null;
    if (this.pollInterval !== null) { clearInterval(this.pollInterval); this.pollInterval = null; }
    this.stopScanning();
    this.emit = null;
    this.prevButtonStates.clear();
    this.connectedPads.clear();
  }

  dispose(): void { this.detach(); }

  // ─── Public API ─────────────────────────────────────────────────────────

  getConnectedControllers(): ReadonlyMap<number, ControllerType> {
    return this.connectedPads;
  }

  setConfig(partial: Partial<GamepadConfig>): void {
    Object.assign(this.config, partial);
    this.buttonMap.interact = this.config.buttonMapping.interact ?? DEFAULT_BUTTON_MAP.interact;
    this.buttonMap.back = this.config.buttonMapping.back ?? DEFAULT_BUTTON_MAP.back;
    this.buttonMap.craft = this.config.buttonMapping.craft ?? DEFAULT_BUTTON_MAP.craft;
    this.buttonMap.inventory = this.config.buttonMapping.inventory ?? DEFAULT_BUTTON_MAP.inventory;
    this.buttonMap.companion = this.config.buttonMapping.companion ?? DEFAULT_BUTTON_MAP.companion;
    this.buttonMap.map = this.config.buttonMapping.map ?? DEFAULT_BUTTON_MAP.map;
    this.buttonMap.pause = this.config.buttonMapping.pause ?? DEFAULT_BUTTON_MAP.pause;
    this.buttonMap.questLog = this.config.buttonMapping.questLog ?? DEFAULT_BUTTON_MAP.questLog;

    if (this.config.singleSwitchMode && !this.scanTimer) {
      this.startScanning();
    } else if (!this.config.singleSwitchMode && this.scanTimer) {
      this.stopScanning();
    }
  }

  remapButton(action: keyof GamepadButtonMapping, buttonIndex: number): void {
    this.buttonMap[action] = buttonIndex;
    this.config.buttonMapping[action] = buttonIndex;
  }

  onScanHighlightChange(cb: (action: string, index: number) => void): void {
    this.onScanHighlight = cb;
  }

  async triggerHaptic(pattern: string | HapticPattern, gamepadIndex = 0): Promise<void> {
    if (!this.config.hapticEnabled) return;
    const p = typeof pattern === 'string' ? HAPTIC_PATTERNS[pattern] : pattern;
    if (!p) return;

    const pads = typeof navigator !== 'undefined' ? navigator.getGamepads() : null;
    if (!pads) return;
    const pad = pads[gamepadIndex];
    if (!pad) return;

    // Standard Gamepad hapticActuators API
    const actuators = (pad as GamepadWithHaptics).vibrationActuator;
    if (actuators && typeof actuators.playEffect === 'function') {
      try {
        await actuators.playEffect('dual-rumble', {
          startDelay: 0,
          duration: p.duration,
          strongMagnitude: p.strongMagnitude,
          weakMagnitude: p.weakMagnitude,
        });
      } catch {
        // Haptics not available — graceful fallback
      }
    }
  }

  // ─── Connection Handlers ────────────────────────────────────────────────

  private detectExistingPads(): void {
    if (typeof navigator === 'undefined') return;
    const pads = navigator.getGamepads();
    if (!pads) return;
    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      if (pad) {
        this.connectedPads.set(pad.index, detectControllerType(pad));
      }
    }
  }

  private onConnect = (e: GamepadEvent): void => {
    const type = detectControllerType(e.gamepad);
    this.connectedPads.set(e.gamepad.index, type);
  };

  private onDisconnect = (e: GamepadEvent): void => {
    this.connectedPads.delete(e.gamepad.index);
    this.prevButtonStates.delete(e.gamepad.index);
  };

  // ─── Polling ────────────────────────────────────────────────────────────

  private poll = (): void => {
    if (!this.emit) return;
    if (typeof navigator === 'undefined') return;

    const pads = navigator.getGamepads();
    if (!pads) return;

    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      if (!pad) continue;

      // Ensure controller type is tracked
      if (!this.connectedPads.has(pad.index)) {
        this.connectedPads.set(pad.index, detectControllerType(pad));
      }

      this.processAxes(pad);

      if (!this.config.singleSwitchMode) {
        this.processButtons(pad);
      } else {
        this.processSingleSwitch(pad);
      }
    }
  };

  // ─── Axes (Sticks) ─────────────────────────────────────────────────────

  private processAxes(pad: Gamepad): void {
    // Left stick → movement
    const lx = this.applyDeadZone(pad.axes[0] ?? 0);
    const ly = this.applyDeadZone(pad.axes[1] ?? 0);
    if (lx !== 0 || ly !== 0) {
      const running = this.isButtonDown(pad, this.buttonMap.sprint);
      const payload: MovePayload = { direction: { x: lx, z: ly }, running };
      this.emit!({ type: 'move', source: 'gamepad', payload });
    }

    // Right stick → camera look
    const rx = this.applyDeadZone(pad.axes[2] ?? 0);
    const ry = this.applyDeadZone(pad.axes[3] ?? 0);
    if (rx !== 0 || ry !== 0) {
      const s = this.config.lookSensitivity;
      const payload: LookPayload = { deltaX: rx * s, deltaY: ry * s };
      this.emit!({ type: 'look', source: 'gamepad', payload });
    }
  }

  private applyDeadZone(value: number): number {
    const dz = this.config.deadZone;
    if (Math.abs(value) < dz) return 0;
    // Normalize so output ranges from 0 to 1 beyond dead zone
    const sign = value > 0 ? 1 : -1;
    return sign * ((Math.abs(value) - dz) / (1 - dz));
  }

  // ─── Buttons (Standard Mode) ──────────────────────────────────────────

  private processButtons(pad: Gamepad): void {
    const prev = this.prevButtonStates.get(pad.index) ?? [];
    const curr: boolean[] = [];

    for (let b = 0; b < pad.buttons.length; b++) {
      const pressed = this.isButtonDown(pad, b);
      curr[b] = pressed;
      const wasPressed = prev[b] ?? false;

      // Only trigger on press (not hold)
      if (pressed && !wasPressed) {
        const action = this.mapButton(b);
        if (action) this.emit!(action);
      }
    }

    this.prevButtonStates.set(pad.index, curr);
  }

  private isButtonDown(pad: Gamepad, index: number): boolean {
    const btn = pad.buttons[index];
    if (!btn) return false;
    return btn.pressed || btn.value > 0.5;
  }

  private mapButton(index: number): GameAction | null {
    const m = this.buttonMap;

    if (index === m.interact) return { type: 'interact', source: 'gamepad' };
    if (index === m.back) return { type: 'back', source: 'gamepad' };
    if (index === m.craft) return { type: 'craft', source: 'gamepad' };
    if (index === m.inventory) return { type: 'inventory', source: 'gamepad' };
    if (index === m.companion) return { type: 'companion', source: 'gamepad' };
    if (index === m.map) return { type: 'map', source: 'gamepad' };
    if (index === m.pause) return { type: 'pause', source: 'gamepad' };

    // D-pad → select actions for menu navigation
    if (index === m.dpadUp) return { type: 'select', source: 'gamepad', payload: { entityId: -1 } as SelectPayload };
    if (index === m.dpadDown) return { type: 'select', source: 'gamepad', payload: { entityId: -2 } as SelectPayload };
    if (index === m.dpadLeft) return { type: 'select', source: 'gamepad', payload: { entityId: -3 } as SelectPayload };
    if (index === m.dpadRight) return { type: 'select', source: 'gamepad', payload: { entityId: -4 } as SelectPayload };

    return null;
  }

  // ─── Single-Switch / Adaptive Controller ──────────────────────────────

  private startScanning(): void {
    this.stopScanning();
    this.scanIndex = 0;
    this.emitScanHighlight();
    this.scanTimer = setInterval(() => {
      this.scanIndex = (this.scanIndex + 1) % this.scanTargets.length;
      this.emitScanHighlight();
    }, this.config.scanIntervalMs);
  }

  private stopScanning(): void {
    if (this.scanTimer !== null) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  private emitScanHighlight(): void {
    const target = this.scanTargets[this.scanIndex];
    if (target && this.onScanHighlight) {
      this.onScanHighlight(target, this.scanIndex);
    }
  }

  private processSingleSwitch(pad: Gamepad): void {
    // In single-switch mode, ANY button press selects the currently highlighted action
    const prev = this.prevButtonStates.get(pad.index) ?? [];
    const curr: boolean[] = [];
    let anyNewPress = false;

    for (let b = 0; b < pad.buttons.length; b++) {
      const pressed = this.isButtonDown(pad, b);
      curr[b] = pressed;
      if (pressed && !(prev[b] ?? false)) anyNewPress = true;
    }

    this.prevButtonStates.set(pad.index, curr);

    if (anyNewPress) {
      const target = this.scanTargets[this.scanIndex];
      if (target) {
        const action = this.scanActionToGameAction(target);
        if (action) this.emit!(action);
      }
    }
  }

  private scanActionToGameAction(target: string): GameAction | null {
    switch (target) {
      case 'interact': return { type: 'interact', source: 'gamepad' };
      case 'back': return { type: 'back', source: 'gamepad' };
      case 'inventory': return { type: 'inventory', source: 'gamepad' };
      case 'companion': return { type: 'companion', source: 'gamepad' };
      case 'map': return { type: 'map', source: 'gamepad' };
      case 'pause': return { type: 'pause', source: 'gamepad' };
      case 'dpadUp': return { type: 'select', source: 'gamepad', payload: { entityId: -1 } as SelectPayload };
      case 'dpadDown': return { type: 'select', source: 'gamepad', payload: { entityId: -2 } as SelectPayload };
      case 'dpadLeft': return { type: 'select', source: 'gamepad', payload: { entityId: -3 } as SelectPayload };
      case 'dpadRight': return { type: 'select', source: 'gamepad', payload: { entityId: -4 } as SelectPayload };
      default: return null;
    }
  }
}

// ─── Gamepad Haptic Actuator Type Extension ─────────────────────────────────

interface GamepadWithHaptics extends Gamepad {
  vibrationActuator?: {
    playEffect(type: string, params: {
      startDelay: number;
      duration: number;
      strongMagnitude: number;
      weakMagnitude: number;
    }): Promise<string>;
  };
}
