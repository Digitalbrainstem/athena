import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GamepadInput, detectControllerType, getControllerLabel, HAPTIC_PATTERNS } from '../../src/input/gamepad.js';
import type { GameAction } from '../../src/types.js';

// ─── Mock Gamepad Factory ───────────────────────────────────────────────────

type MutableGamepad = Omit<Gamepad, 'buttons'> & { buttons: GamepadButton[] };

function createMockButton(pressed = false, value = 0): GamepadButton {
  return { pressed, touched: pressed, value };
}

function createMockGamepad(overrides: Partial<Gamepad> = {}): MutableGamepad {
  const buttons: GamepadButton[] = Array.from({ length: 17 }, () => createMockButton());
  const axes = [0, 0, 0, 0];
  const base = {
    id: 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)',
    index: 0,
    connected: true,
    mapping: 'standard' as GamepadMappingType,
    buttons,
    axes,
    timestamp: performance.now(),
    hapticActuators: [],
    vibrationActuator: null as unknown as GamepadHapticActuator,
  };
  return Object.assign(base, overrides) as MutableGamepad;
}

function mockNavigatorGetGamepads(pads: (Gamepad | null)[]): void {
  Object.defineProperty(navigator, 'getGamepads', {
    value: () => pads,
    writable: true,
    configurable: true,
  });
}

// ─── Controller Detection ───────────────────────────────────────────────────

describe('detectControllerType', () => {
  it('detects Xbox controller', () => {
    const pad = createMockGamepad({ id: 'Xbox 360 Controller (STANDARD GAMEPAD)' });
    expect(detectControllerType(pad)).toBe('xbox');
  });

  it('detects Xbox via xinput', () => {
    const pad = createMockGamepad({ id: 'xinput gamepad' });
    expect(detectControllerType(pad)).toBe('xbox');
  });

  it('detects PlayStation controller', () => {
    const pad = createMockGamepad({ id: 'DualSense Wireless Controller (054c:0ce6)' });
    expect(detectControllerType(pad)).toBe('playstation');
  });

  it('detects PlayStation via Sony', () => {
    const pad = createMockGamepad({ id: 'Sony DualShock 4' });
    expect(detectControllerType(pad)).toBe('playstation');
  });

  it('detects Nintendo Switch Pro Controller', () => {
    const pad = createMockGamepad({ id: 'Nintendo Switch Pro Controller' });
    expect(detectControllerType(pad)).toBe('switch');
  });

  it('returns generic for unknown controller', () => {
    const pad = createMockGamepad({ id: '8BitDo Pro 2' });
    expect(detectControllerType(pad)).toBe('generic');
  });
});

// ─── Controller Labels ──────────────────────────────────────────────────────

describe('getControllerLabel', () => {
  it('returns Xbox labels', () => {
    const labels = getControllerLabel('xbox');
    expect(labels.interact).toBe('A');
    expect(labels.back).toBe('B');
  });

  it('returns PlayStation labels', () => {
    const labels = getControllerLabel('playstation');
    expect(labels.interact).toBe('×');
    expect(labels.back).toBe('○');
  });

  it('returns Switch labels', () => {
    const labels = getControllerLabel('switch');
    expect(labels.interact).toBe('B');
    expect(labels.back).toBe('A');
  });

  it('returns generic labels', () => {
    const labels = getControllerLabel('generic');
    expect(labels.interact).toBe('1');
  });
});

// ─── Haptic Patterns ────────────────────────────────────────────────────────

describe('HAPTIC_PATTERNS', () => {
  it('includes confirm pattern', () => {
    expect(HAPTIC_PATTERNS['confirm']).toBeDefined();
    expect(HAPTIC_PATTERNS['confirm']!.duration).toBeGreaterThan(0);
  });

  it('includes discovery pattern', () => {
    expect(HAPTIC_PATTERNS['discovery']).toBeDefined();
    expect(HAPTIC_PATTERNS['discovery']!.strongMagnitude).toBeGreaterThan(0);
  });

  it('includes all standard patterns', () => {
    expect(Object.keys(HAPTIC_PATTERNS)).toEqual(
      expect.arrayContaining(['confirm', 'discovery', 'impact', 'companion', 'navigate']),
    );
  });
});

// ─── GamepadInput ───────────────────────────────────────────────────────────

describe('GamepadInput', () => {
  let input: GamepadInput;
  let received: GameAction[];

  beforeEach(() => {
    vi.useFakeTimers();
    received = [];
    input = new GamepadInput();
    mockNavigatorGetGamepads([]);
  });

  afterEach(() => {
    input.dispose();
    vi.useRealTimers();
  });

  it('implements InputProvider interface', () => {
    expect(input.name).toBe('gamepad');
    expect(typeof input.attach).toBe('function');
    expect(typeof input.detach).toBe('function');
    expect(typeof input.dispose).toBe('function');
  });

  it('attach starts polling interval', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);
    // Advancing time triggers poll
    const pad = createMockGamepad();
    pad.buttons[0] = createMockButton(true, 1.0); // A button
    mockNavigatorGetGamepads([pad]);

    vi.advanceTimersByTime(16);
    expect(received.length).toBeGreaterThanOrEqual(1);
    expect(received[0]!.type).toBe('interact');
    expect(received[0]!.source).toBe('gamepad');
  });

  it('detach stops polling', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);
    input.detach();

    const pad = createMockGamepad();
    pad.buttons[0] = createMockButton(true, 1.0);
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    expect(received).toHaveLength(0);
  });

  it('maps standard buttons correctly', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    const pad = createMockGamepad();

    // Test each button mapping
    const mappings: Array<[number, string]> = [
      [0, 'interact'],   // A
      [1, 'back'],       // B
      [2, 'craft'],      // X
      [3, 'inventory'],  // Y
      [4, 'companion'],  // LB
      [5, 'map'],        // RB
      [9, 'pause'],      // Start
    ];

    for (const [btnIdx, expectedType] of mappings) {
      received.length = 0;
      // Reset all buttons
      for (let b = 0; b < pad.buttons.length; b++) {
        pad.buttons[b] = createMockButton(false, 0);
      }
      mockNavigatorGetGamepads([pad]);
      vi.advanceTimersByTime(16); // Clear previous state

      // Press the button
      pad.buttons[btnIdx!] = createMockButton(true, 1.0);
      mockNavigatorGetGamepads([pad]);
      vi.advanceTimersByTime(16);

      const action = received.find(a => a.type === expectedType);
      expect(action, `Button ${btnIdx} should map to ${expectedType}`).toBeDefined();
      expect(action!.source).toBe('gamepad');
    }
  });

  it('applies dead zone to axes', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    // Value within dead zone — no movement
    const pad = createMockGamepad({ axes: [0.1, 0.1, 0, 0] });
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    const moveActions = received.filter(a => a.type === 'move');
    expect(moveActions).toHaveLength(0);
  });

  it('emits movement for axes beyond dead zone', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    const pad = createMockGamepad({ axes: [0.8, 0, 0, 0] });
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    const moveActions = received.filter(a => a.type === 'move');
    expect(moveActions.length).toBeGreaterThan(0);
  });

  it('emits look action for right stick', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    const pad = createMockGamepad({ axes: [0, 0, 0.9, 0.5] });
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    const lookActions = received.filter(a => a.type === 'look');
    expect(lookActions.length).toBeGreaterThan(0);
  });

  it('configurable dead zone', () => {
    input.dispose();
    input = new GamepadInput({ deadZone: 0.5 });
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    // 0.4 is within the 0.5 dead zone
    const pad = createMockGamepad({ axes: [0.4, 0, 0, 0] });
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    expect(received.filter(a => a.type === 'move')).toHaveLength(0);
  });

  it('only fires on button press, not hold', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    const pad = createMockGamepad();
    pad.buttons[0] = createMockButton(true, 1.0);
    mockNavigatorGetGamepads([pad]);

    vi.advanceTimersByTime(16); // first press
    const count1 = received.filter(a => a.type === 'interact').length;

    vi.advanceTimersByTime(16); // still held — should NOT fire again
    const count2 = received.filter(a => a.type === 'interact').length;

    expect(count2).toBe(count1);
  });

  it('remaps buttons', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);
    input.remapButton('interact', 3); // Remap interact to Y button

    const pad = createMockGamepad();
    pad.buttons[3] = createMockButton(true, 1.0);
    mockNavigatorGetGamepads([pad]);

    vi.advanceTimersByTime(16);
    // Button 3 now fires interact (remapped), AND inventory (original mapping)
    // The last-set mapping for button 3 matters
    expect(received.some(a => a.type === 'interact')).toBe(true);
  });

  it('tracks connected controllers', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    const pad = createMockGamepad();
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    const controllers = input.getConnectedControllers();
    expect(controllers.size).toBe(1);
    expect(controllers.get(0)).toBe('xbox');
  });
});

// ─── Single-Switch Mode ─────────────────────────────────────────────────────

describe('GamepadInput single-switch mode', () => {
  let input: GamepadInput;
  let received: GameAction[];

  beforeEach(() => {
    vi.useFakeTimers();
    received = [];
    input = new GamepadInput({ singleSwitchMode: true, scanIntervalMs: 1000 });
    mockNavigatorGetGamepads([]);
  });

  afterEach(() => {
    input.dispose();
    vi.useRealTimers();
  });

  it('starts scanning on attach', () => {
    const highlights: string[] = [];
    input.onScanHighlightChange((action) => highlights.push(action));

    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    // Initial highlight on attach
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights[0]).toBe('interact');
  });

  it('advances scan on interval', () => {
    const highlights: string[] = [];
    input.onScanHighlightChange((action) => highlights.push(action));

    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    vi.advanceTimersByTime(1000);
    expect(highlights.length).toBeGreaterThanOrEqual(2);
    expect(highlights[1]).toBe('back');
  });

  it('selects current scan target on any button press', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    // First target is 'interact'
    const pad = createMockGamepad();
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16); // register pad state

    pad.buttons[0] = createMockButton(true, 1.0);
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    expect(received.some(a => a.type === 'interact')).toBe(true);
  });

  it('advances to different actions over time', () => {
    const emit = (a: GameAction) => received.push(a);
    input.attach(emit);

    // Advance to second target (back)
    vi.advanceTimersByTime(1000);

    const pad = createMockGamepad();
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16); // register state

    pad.buttons[0] = createMockButton(true, 1.0);
    mockNavigatorGetGamepads([pad]);
    vi.advanceTimersByTime(16);

    expect(received.some(a => a.type === 'back')).toBe(true);
  });
});

// ─── Haptic Trigger ─────────────────────────────────────────────────────────

describe('GamepadInput haptics', () => {
  it('triggerHaptic does not throw when no gamepads', async () => {
    const input = new GamepadInput();
    input.attach(() => {});
    mockNavigatorGetGamepads([]);
    await expect(input.triggerHaptic('confirm')).resolves.toBeUndefined();
    input.dispose();
  });

  it('triggerHaptic does not throw when haptic disabled', async () => {
    const input = new GamepadInput({ hapticEnabled: false });
    input.attach(() => {});
    await expect(input.triggerHaptic('confirm')).resolves.toBeUndefined();
    input.dispose();
  });
});
