import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../../src/game/loop.js';
import type { NexusCore, SceneGraph } from '@nexus-academy/core';
import type { InputManager } from '../../src/input/manager.js';
import type { FirstPersonCamera } from '../../src/camera/first-person.js';
import type { SceneRenderer } from '../../src/renderer/scene-renderer.js';
import type { AudioManager } from '../../src/audio/audio-manager.js';
import type { HUD } from '../../src/ui/hud.js';

function emptySceneGraph(): SceneGraph {
  return {
    camera: { position: { x: 0, y: 5, z: 10 }, rotation: { x: 0, y: 0, z: 0 }, fov: 60, near: 0.1, far: 1000 },
    lights: [],
    objects: [],
    sky: { type: 'color', primaryColor: '#87CEEB' },
    ground: { type: 'grass', color: '#228B22', size: { width: 100, depth: 100 } },
    ui: { elements: [], dialogueActive: false, inventoryOpen: false, mapOpen: false, paused: false },
    audio: [],
    announcements: [],
    captions: [],
  };
}

function mockCore(): NexusCore {
  const sg = emptySceneGraph();
  return {
    update: vi.fn(),
    getSceneGraph: vi.fn(() => sg),
    destroy: vi.fn(),
  } as unknown as NexusCore;
}

function mockInputManager(): InputManager {
  return {
    flush: vi.fn(() => []),
    emit: vi.fn(),
    onAction: vi.fn(() => () => {}),
    register: vi.fn(),
    unregister: vi.fn(),
    hasProvider: vi.fn(),
    dispose: vi.fn(),
  } as unknown as InputManager;
}

function mockFpCam(): FirstPersonCamera {
  return {
    flushLookActions: vi.fn(() => []),
    getPredictiveRotation: vi.fn(() => ({ yaw: 0, pitch: 0 })),
    requestPointerLock: vi.fn(),
    exitPointerLock: vi.fn(),
    isPointerLocked: false,
    dispose: vi.fn(),
  } as unknown as FirstPersonCamera;
}

function mockSceneRenderer(): SceneRenderer {
  return {
    render: vi.fn(),
    applyPredictiveLook: vi.fn(),
    dispose: vi.fn(),
  } as unknown as SceneRenderer;
}

function mockAudioManager(): AudioManager {
  return {
    process: vi.fn(),
    dispose: vi.fn(),
  } as unknown as AudioManager;
}

function mockHud(): HUD {
  return {
    init: vi.fn(),
    update: vi.fn(),
    updateFPS: vi.fn(),
    showPrompt: vi.fn(),
    hidePrompt: vi.fn(),
    flashPrompt: vi.fn(),
    setCrosshairVisible: vi.fn(),
    dispose: vi.fn(),
  } as unknown as HUD;
}

describe('GameLoop', () => {
  let core: ReturnType<typeof mockCore>;
  let input: ReturnType<typeof mockInputManager>;
  let fpCam: ReturnType<typeof mockFpCam>;
  let renderer: ReturnType<typeof mockSceneRenderer>;
  let audio: ReturnType<typeof mockAudioManager>;
  let hud: ReturnType<typeof mockHud>;
  let loop: GameLoop;
  let rafCallbacks: Array<(time: number) => void>;
  let rafId: number;

  beforeEach(() => {
    core = mockCore();
    input = mockInputManager();
    fpCam = mockFpCam();
    renderer = mockSceneRenderer();
    audio = mockAudioManager();
    hud = mockHud();
    loop = new GameLoop(core, input, fpCam, renderer, audio, hud);
    rafCallbacks = [];
    rafId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => { rafCallbacks.push(cb); return ++rafId; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => { loop.dispose(); vi.unstubAllGlobals(); });

  function runFrame(timeMs: number): void { rafCallbacks[rafCallbacks.length - 1](timeMs); }

  it('starts and calls core.update after two ticks', () => {
    loop.start();
    runFrame(0);
    expect(core.update).not.toHaveBeenCalled();
    runFrame(16.67);
    expect(core.update).toHaveBeenCalled();
    expect(renderer.render).toHaveBeenCalled();
    expect(hud.update).toHaveBeenCalled();
    expect(audio.process).toHaveBeenCalled();
  });

  it('exposes fixedTimestep', () => {
    const custom = new GameLoop(core, input, fpCam, renderer, audio, hud, 1 / 30);
    expect(custom.fixedTimestep).toBeCloseTo(1 / 30);
    custom.dispose();
  });

  it('runs multiple fixed steps for long frames', () => {
    loop = new GameLoop(core, input, fpCam, renderer, audio, hud, 1 / 60);
    loop.start();
    runFrame(0);
    runFrame(50);
    expect((core.update as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('clamps frame time to prevent spiral-of-death', () => {
    loop.start();
    runFrame(0);
    runFrame(5000);
    expect((core.update as ReturnType<typeof vi.fn>).mock.calls.length).toBeLessThanOrEqual(15);
  });

  it('flushes input and look actions into core.update', () => {
    const moveAction = { type: 'move' as const, source: 'keyboard' as const, payload: { direction: { x: 1, z: 0 }, running: false } };
    const lookAction = { type: 'look' as const, source: 'mouse' as const, payload: { deltaX: 0.1, deltaY: 0 } };
    (input.flush as ReturnType<typeof vi.fn>).mockReturnValueOnce([moveAction]);
    (fpCam.flushLookActions as ReturnType<typeof vi.fn>).mockReturnValueOnce([lookAction]);

    loop.start();
    runFrame(0);
    runFrame(16.67);

    const updateCall = (core.update as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(updateCall[1]).toEqual(expect.arrayContaining([moveAction, lookAction]));
  });

  it('stop prevents further frames', () => {
    loop.start();
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });

  it('does not start twice', () => {
    loop.start();
    loop.start();
    expect(rafCallbacks.length).toBe(1);
  });

  it('dispose permanently stops the loop', () => {
    loop.start();
    loop.dispose();
    expect(loop.isRunning).toBe(false);
    loop.start();
    expect(loop.isRunning).toBe(false);
  });

  it('reports FPS after one second', () => {
    loop.start();
    runFrame(0);
    let time = 0;
    for (let i = 0; i < 65; i++) { time += 16.67; runFrame(time); }
    expect(loop.fps).toBeGreaterThan(0);
  });

  it('isRunning reflects loop state', () => {
    expect(loop.isRunning).toBe(false);
    loop.start();
    expect(loop.isRunning).toBe(true);
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });
});
