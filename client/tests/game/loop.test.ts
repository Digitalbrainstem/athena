import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../../src/game/loop.js';

describe('GameLoop', () => {
  let onFixed: ReturnType<typeof vi.fn>;
  let onFrame: ReturnType<typeof vi.fn>;
  let onRender: ReturnType<typeof vi.fn>;
  let loop: GameLoop;
  let rafCallbacks: Array<(time: number) => void>;
  let rafId: number;

  beforeEach(() => {
    onFixed = vi.fn();
    onFrame = vi.fn();
    onRender = vi.fn();
    loop = new GameLoop(onFixed, onFrame, onRender);
    rafCallbacks = [];
    rafId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => { rafCallbacks.push(cb); return ++rafId; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => { loop.dispose(); vi.unstubAllGlobals(); });

  function runFrame(timeMs: number): void { rafCallbacks[rafCallbacks.length - 1](timeMs); }

  it('starts and calls fixed/frame/render after two ticks', () => {
    loop.start();
    runFrame(0);
    expect(onFixed).not.toHaveBeenCalled();
    runFrame(16.67);
    expect(onFixed).toHaveBeenCalled();
    expect(onFrame).toHaveBeenCalled();
    expect(onRender).toHaveBeenCalled();
  });

  it('exposes fixedTimestep', () => {
    const custom = new GameLoop(onFixed, onFrame, onRender, 1 / 30);
    expect(custom.fixedTimestep).toBeCloseTo(1 / 30);
    custom.dispose();
  });

  it('runs multiple fixed steps for long frames', () => {
    loop = new GameLoop(onFixed, onFrame, onRender, 1 / 60);
    loop.start();
    runFrame(0);
    runFrame(50);
    expect(onFixed.mock.calls.length).toBeGreaterThanOrEqual(2);
    for (const call of onFixed.mock.calls) expect(call[0]).toBeCloseTo(1 / 60, 4);
  });

  it('clamps frame time to prevent spiral-of-death', () => {
    loop.start();
    runFrame(0);
    runFrame(5000);
    expect(onFixed.mock.calls.length).toBeLessThanOrEqual(15);
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it('passes interpolation alpha to frameUpdate and render', () => {
    loop.start();
    runFrame(0);
    runFrame(20);
    expect(onFrame).toHaveBeenCalled();
    const [, alpha] = onFrame.mock.calls[0];
    expect(typeof alpha).toBe('number');
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThanOrEqual(1);
    const [renderAlpha] = onRender.mock.calls[0];
    expect(typeof renderAlpha).toBe('number');
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
