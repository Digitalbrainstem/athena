import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/input/manager.js';
import type { GameAction, InputProvider, ActionCallback } from '../../src/types.js';

function fakeProvider(name: 'keyboard' | 'touch' = 'keyboard'): InputProvider & { _detach: ReturnType<typeof vi.fn> } {
  const _detach = vi.fn();
  return { name, attach: vi.fn(), detach: _detach, dispose: _detach, _detach };
}

describe('InputManager', () => {
  let manager: InputManager;
  beforeEach(() => { manager = new InputManager(); });
  afterEach(() => { manager.dispose(); });

  it('emits actions to registered listeners', () => {
    const received: GameAction[] = [];
    manager.onAction((a) => received.push(a));
    manager.emit({ type: 'interact', source: 'keyboard' });
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('interact');
  });

  it('supports multiple listeners', () => {
    const a: GameAction[] = [];
    const b: GameAction[] = [];
    manager.onAction((action) => a.push(action));
    manager.onAction((action) => b.push(action));
    manager.emit({ type: 'pause', source: 'keyboard' });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });

  it('unsubscribes a listener via returned function', () => {
    const received: GameAction[] = [];
    const unsub = manager.onAction((a) => received.push(a));
    manager.emit({ type: 'interact', source: 'keyboard' });
    unsub();
    manager.emit({ type: 'pause', source: 'keyboard' });
    expect(received).toHaveLength(1);
  });

  it('handles actions with payloads', () => {
    const received: GameAction[] = [];
    manager.onAction((a) => received.push(a));
    manager.emit({ type: 'move', source: 'keyboard', payload: { x: 1, z: 0 } });
    expect(received[0].payload).toEqual({ x: 1, z: 0 });
  });

  it('registers an input provider and receives its actions', () => {
    const received: GameAction[] = [];
    manager.onAction((a) => received.push(a));
    let providerEmit: ActionCallback | null = null;
    const provider = fakeProvider();
    provider.attach = vi.fn((emit: ActionCallback) => { providerEmit = emit; });
    manager.register(provider);
    providerEmit!({ type: 'map', source: 'keyboard' });
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('map');
  });

  it('detaches old provider when re-registering same name', () => {
    const a = fakeProvider();
    const b = fakeProvider();
    manager.register(a);
    manager.register(b);
    expect(a._detach).toHaveBeenCalled();
  });

  it('unregisters a provider by name', () => {
    const provider = fakeProvider('touch');
    manager.register(provider);
    expect(manager.hasProvider('touch')).toBe(true);
    manager.unregister('touch');
    expect(provider._detach).toHaveBeenCalled();
    expect(manager.hasProvider('touch')).toBe(false);
  });

  it('dispose clears all providers and listeners', () => {
    const provider = fakeProvider();
    manager.register(provider);
    const received: GameAction[] = [];
    manager.onAction((a) => received.push(a));
    manager.dispose();
    manager.emit({ type: 'interact', source: 'keyboard' });
    expect(provider._detach).toHaveBeenCalled();
    expect(received).toHaveLength(0);
  });

  it('throws when registering after dispose', () => {
    manager.dispose();
    expect(() => manager.register(fakeProvider())).toThrow('disposed');
  });

  it('throws when subscribing after dispose', () => {
    manager.dispose();
    expect(() => manager.onAction(() => {})).toThrow('disposed');
  });

  it('catches errors thrown by listeners without interrupting others', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const goodResults: GameAction[] = [];
    manager.onAction(() => { throw new Error('boom'); });
    manager.onAction((a) => goodResults.push(a));
    manager.emit({ type: 'interact', source: 'keyboard' });
    expect(goodResults).toHaveLength(1);
    expect(errSpy).toHaveBeenCalledOnce();
    errSpy.mockRestore();
  });
});
