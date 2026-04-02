import { NexusCore } from '@nexus-academy/core';
import { SceneRenderer } from './renderer/scene-renderer.js';
import { GameLoop } from './game/loop.js';
import { InputManager } from './input/manager.js';
import { KeyboardInput } from './input/keyboard.js';
import { TouchInput } from './input/touch.js';
import { FirstPersonCamera } from './camera/first-person.js';
import { AudioManager } from './audio/audio-manager.js';
import { HUD } from './ui/hud.js';
import type { Disposable } from './types.js';

const DEBUG = import.meta.env.DEV;

const disposables: Disposable[] = [];

async function boot(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  const overlay = document.getElementById('click-to-play');
  if (!canvas) { console.error('[Nexus] Could not find #game-canvas element'); return; }

  const core = await NexusCore.create({ debug: DEBUG });
  disposables.push({ dispose: () => { void core.destroy(); } });

  const sceneRenderer = new SceneRenderer(canvas);
  disposables.push(sceneRenderer);

  const input = new InputManager();
  input.register(new KeyboardInput());
  if ('ontouchstart' in window) input.register(new TouchInput());
  disposables.push(input);

  const fpCam = new FirstPersonCamera();
  disposables.push(fpCam);

  const audioManager = new AudioManager();
  disposables.push(audioManager);

  const hud = new HUD();
  hud.init(DEBUG);
  disposables.push(hud);

  const loop = new GameLoop(core, input, fpCam, sceneRenderer, audioManager, hud);
  disposables.push(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) loop.stop();
    else if (!loop.isRunning && overlay?.classList.contains('hidden')) loop.start();
  });

  const startGame = (): void => {
    overlay?.classList.add('hidden');
    fpCam.requestPointerLock(canvas);
    loop.start();
  };

  overlay?.addEventListener('click', startGame);
  overlay?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') startGame();
  });

  canvas.addEventListener('click', () => {
    if (!fpCam.isPointerLocked && loop.isRunning) fpCam.requestPointerLock(canvas);
  });

  input.onAction((action) => {
    if (action.type === 'pause' && fpCam.isPointerLocked) fpCam.exitPointerLock();
  });
}

function init(): void {
  boot().catch((err) => {
    console.error('[Nexus] Failed to initialize:', err);
    const p = document.querySelector('#click-to-play p');
    if (p) p.textContent = 'Failed to start — check console for details.';
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
