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
    getPlayerPosition: vi.fn(() => ({ x: 0, z: 0 })),
    setPlayerPosition: vi.fn(),
    destroy: vi.fn(),
    getActiveQuests: vi.fn(() => []),
    getQuestById: vi.fn(() => undefined),
    getCurrentBiome: vi.fn(() => 'workshop'),
    selectAvailableQuests: vi.fn(() => []),
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
    flushMoveActions: vi.fn(() => []),
    setMoveInput: vi.fn(),
    clearMoveInput: vi.fn(),
    setHeightProvider: vi.fn(),
    updateMovement: vi.fn(),
    updateCollisionBoxes: vi.fn(),
    addExtraCollisionBoxes: vi.fn(),
    getPredictiveRotation: vi.fn(() => ({ yaw: 0, pitch: 0 })),
    getEyePosition: vi.fn(() => ({ x: 0, y: 1.6, z: 0 })),
    seedPosition: vi.fn(),
    posX: 0,
    posZ: 0,
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
    tickMovement: vi.fn(),
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
    processAnnouncements: vi.fn(),
    processCaptions: vi.fn(),
    showQuestPanel: vi.fn(),
    hideQuestPanel: vi.fn(),
    showGuidance: vi.fn(),
    showQuestHint: vi.fn(),
    showQuestComplete: vi.fn(),
    showQuestIndicator: vi.fn(),
    hideQuestIndicator: vi.fn(),
    dispose: vi.fn(),
    hasOpenPanel: false,
    isDialogueVisible: false,
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

  it('substeps camera physics for long frames but updates core once', () => {
    loop = new GameLoop(core, input, fpCam, renderer, audio, hud, 1 / 60);
    loop.start();
    runFrame(0);
    runFrame(50);
    expect(fpCam.updateMovement).toHaveBeenCalledTimes(3);
    expect(core.update).toHaveBeenCalledTimes(1);
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

    // Movement is fed to fpCam.setMoveInput then smoothed via updateMovement
    expect(fpCam.setMoveInput).toHaveBeenCalledWith(1, 0, false);
    expect(fpCam.updateMovement).toHaveBeenCalled();
    // Look actions are still passed through directly
    const updateCall = (core.update as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(updateCall[1]).toEqual(expect.arrayContaining([lookAction]));
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

  it('does not release mouse-look for passive dialogue', () => {
    (fpCam as unknown as { isPointerLocked: boolean }).isPointerLocked = true;
    (hud as unknown as { hasOpenPanel: boolean; isDialogueVisible: boolean }).hasOpenPanel = false;
    (hud as unknown as { hasOpenPanel: boolean; isDialogueVisible: boolean }).isDialogueVisible = true;

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(fpCam.exitPointerLock).not.toHaveBeenCalled();
  });

  it('releases mouse-look when a panel opens', () => {
    (fpCam as unknown as { isPointerLocked: boolean }).isPointerLocked = true;
    (hud as unknown as { hasOpenPanel: boolean }).hasOpenPanel = true;

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(fpCam.exitPointerLock).toHaveBeenCalled();
  });

  it('hides prompts and quest guidance while a panel is open', () => {
    const graph = emptySceneGraph();
    graph.objects.push({
      entityId: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: {
        meshType: 'model',
        modelId: 'workbench',
        color: '#D4A574',
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      },
      interactable: {
        interactionType: 'craft',
        radius: 3,
        prompt: 'Interact with Workbench',
      },
      highlight: false,
    });
    (core.getSceneGraph as ReturnType<typeof vi.fn>).mockReturnValue(graph);
    (hud as unknown as { hasOpenPanel: boolean }).hasOpenPanel = true;

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(hud.hidePrompt).toHaveBeenCalled();
    expect(hud.hideQuestPanel).toHaveBeenCalled();
    expect(hud.showPrompt).not.toHaveBeenCalled();
    expect(hud.showGuidance).not.toHaveBeenCalled();
  });

  it('keeps object prompts ahead of biome entrance prompts', () => {
    const graph = emptySceneGraph();
    graph.objects.push({
      entityId: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: {
        meshType: 'model',
        modelId: 'workbench',
        color: '#D4A574',
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      },
      interactable: {
        interactionType: 'craft',
        radius: 2,
        prompt: 'Interact with Workbench',
      },
      highlight: true,
    });
    const worldObject = graph.objects[0]!;
    (core.getSceneGraph as ReturnType<typeof vi.fn>).mockReturnValue({
      ...graph,
      objects: [],
    });
    loop.setWorldManager({
      getHeightAt: vi.fn(() => 0),
      isOverworld: vi.fn(() => true),
      isInside: vi.fn(() => false),
      update: vi.fn(),
      getOverworldSky: vi.fn(() => graph.sky),
      mergeGameplayObjects: vi.fn((g: SceneGraph) => ({
        ...g,
        objects: [...g.objects, worldObject],
      })),
      getOverworldCollisionBoxes: vi.fn(() => []),
      nearbyBiome: {
        biome: { name: 'The Workshop' },
        entranceDistance: 1,
      },
    } as unknown as Parameters<GameLoop['setWorldManager']>[0]);

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(hud.showPrompt).toHaveBeenCalledWith('Press E to use the Workbench');
    expect(hud.showPrompt).not.toHaveBeenCalledWith('Press E to enter The Workshop');
  });

  it('shows getting-started guidance when no quest is active', () => {
    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(hud.showGuidance).toHaveBeenCalledWith(
      'First Workshop Challenge',
      'Press E at the Workbench, then select Red Pigment and Blue Pigment to mix purple paint.',
      'WASD moves, mouse looks, Shift runs, E uses objects, and M opens the map.',
    );
  });

  it('uses gamepad prompt labels after gamepad input', () => {
    const graph = emptySceneGraph();
    graph.objects.push({
      entityId: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: {
        meshType: 'model',
        modelId: 'workbench',
        color: '#D4A574',
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      },
      interactable: {
        interactionType: 'craft',
        radius: 3,
        prompt: 'Interact with Workbench',
      },
      highlight: false,
    });
    (core.getSceneGraph as ReturnType<typeof vi.fn>).mockReturnValue(graph);
    (input.flush as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      { type: 'move', source: 'gamepad', payload: { direction: { x: 0, z: -1 }, running: false } },
    ]);

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(hud.showPrompt).toHaveBeenCalledWith('Press A to use the Workbench');
  });

  it('highlights inside-biome objects after applying the biome world offset', () => {
    const graph = emptySceneGraph();
    graph.objects.push({
      entityId: 1,
      position: { x: 0, y: 0, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: {
        meshType: 'model',
        modelId: 'workbench',
        color: '#D4A574',
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      },
      interactable: {
        interactionType: 'craft',
        radius: 3,
        prompt: 'Interact with Workbench',
      },
      highlight: false,
    });
    (core.getSceneGraph as ReturnType<typeof vi.fn>).mockReturnValue(graph);
    (fpCam.getEyePosition as ReturnType<typeof vi.fn>).mockReturnValue({ x: -40, y: 2.1, z: 27.2 });
    fpCam.posX = -40;
    fpCam.posZ = 27.2;
    loop.setWorldManager({
      getHeightAt: vi.fn(() => 0.5),
      getBiomeOffset: vi.fn(() => ({ x: -40, y: 0.5, z: 30 })),
      isOverworld: vi.fn(() => false),
      isInside: vi.fn(() => true),
      update: vi.fn(),
      mergeGameplayObjects: vi.fn((g: SceneGraph) => g),
      getExtraCollisionBoxes: vi.fn(() => []),
      isNearDoor: true,
    } as unknown as Parameters<GameLoop['setWorldManager']>[0]);

    loop.start();
    runFrame(0);
    runFrame(16.67);

    expect(hud.showPrompt).toHaveBeenCalledWith('Press E to use the Workbench');
    expect(hud.showPrompt).not.toHaveBeenCalledWith('Press E to exit');
  });
});
