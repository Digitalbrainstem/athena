import * as THREE from 'three';
import { Renderer } from './engine/renderer.js';
import { World } from './engine/world.js';
import { Physics, type PhysicsBody } from './engine/physics.js';
import { GameLoop } from './game/loop.js';
import { InputManager } from './input/manager.js';
import { KeyboardInput } from './input/keyboard.js';
import { TouchInput } from './input/touch.js';
import { FirstPersonCamera } from './camera/first-person.js';
import { HUD } from './ui/hud.js';
import type { GameAction, MovePayload, Disposable } from './types.js';

const DEBUG = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL as string | undefined;
void API_URL;

const disposables: Disposable[] = [];

function boot(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  const overlay = document.getElementById('click-to-play');
  if (!canvas) { console.error('[Nexus] Could not find #game-canvas element'); return; }

  const renderer = new Renderer(canvas);
  disposables.push(renderer);

  const world = new World();
  world.setup();
  disposables.push(world);

  const fpCam = new FirstPersonCamera(window.innerWidth / window.innerHeight);
  fpCam.setColliders(world.getObjects());
  renderer.bindCamera(fpCam.camera);
  disposables.push(fpCam);

  const physics = new Physics();
  physics.setColliders(world.getObjects());
  const playerBody: PhysicsBody = {
    position: fpCam.camera.position,
    velocity: new THREE.Vector3(),
    grounded: true,
    halfExtents: new THREE.Vector3(0.3, 0.8, 0.3),
  };
  physics.addBody(playerBody);
  disposables.push(physics);

  const input = new InputManager();
  input.register(new KeyboardInput());
  if ('ontouchstart' in window) input.register(new TouchInput());
  disposables.push(input);

  let currentMove: MovePayload | null = null;

  input.onAction((action: GameAction) => {
    if (action.type === 'move') { currentMove = action.payload as MovePayload; return; }
    if (action.type === 'interact') {
      const near = world.findNearestInteractable(fpCam.camera.position);
      if (near) hud.flashPrompt(`Interacting with ${near.id}…`);
    }
    if (action.type === 'pause' && fpCam.isPointerLocked) fpCam.exitPointerLock();
  });

  const hud = new HUD();
  hud.init(DEBUG);
  disposables.push(hud);

  const loop = new GameLoop(
    (fixedDt) => {
      fpCam.applyMovement(currentMove, fixedDt);
      currentMove = null;
      physics.update(fixedDt);
    },
    (_dt, _alpha) => {
      const near = world.findNearestInteractable(fpCam.camera.position);
      if (near) {
        const isTouchDevice = 'ontouchstart' in window;
        hud.showPrompt(isTouchDevice ? 'Tap to interact' : `Press E — ${near.id}`);
      } else { hud.hidePrompt(); }
      hud.updateFPS(loop.fps);
    },
    (_alpha) => { renderer.render(world.scene, fpCam.camera); },
  );
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
}

function init(): void {
  try { boot(); } catch (err) {
    console.error('[Nexus] Failed to initialize:', err);
    const p = document.querySelector('#click-to-play p');
    if (p) p.textContent = 'Failed to start — check console for details.';
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
