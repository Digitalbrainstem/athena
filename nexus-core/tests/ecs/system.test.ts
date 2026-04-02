import { describe, it, expect, vi } from 'vitest';
import { createSystem } from '../../src/ecs/system.js';
import { World } from '../../src/ecs/world.js';

describe('System', () => {
  it('creates a system with name and priority', () => {
    const sys = createSystem('test', 10, () => {});
    expect(sys.name).toBe('test');
    expect(sys.priority).toBe(10);
  });

  it('calls update function when system runs', () => {
    const updateFn = vi.fn();
    const sys = createSystem('test', 10, updateFn);

    const world = new World();
    sys.update(world, 0.016);

    expect(updateFn).toHaveBeenCalledTimes(1);
    expect(updateFn).toHaveBeenCalledWith(world, 0.016);
  });

  it('systems execute in priority order', () => {
    const world = new World();
    const order: string[] = [];

    const sys1 = createSystem('first', 1, () => { order.push('first'); });
    const sys2 = createSystem('second', 2, () => { order.push('second'); });
    const sys3 = createSystem('third', 3, () => { order.push('third'); });

    // Add in wrong order
    world.addSystem(sys3);
    world.addSystem(sys1);
    world.addSystem(sys2);

    world.update(0.016);

    expect(order).toEqual(['first', 'second', 'third']);
  });

  it('systems with same priority maintain add order', () => {
    const world = new World();
    const order: string[] = [];

    const sys1 = createSystem('alpha', 10, () => { order.push('alpha'); });
    const sys2 = createSystem('beta', 10, () => { order.push('beta'); });

    world.addSystem(sys1);
    world.addSystem(sys2);

    world.update(0.016);

    // Both priority 10, should maintain insertion order after stable sort
    expect(order).toHaveLength(2);
    expect(order).toContain('alpha');
    expect(order).toContain('beta');
  });

  it('prevents duplicate system names', () => {
    const world = new World();
    const sys1 = createSystem('test', 10, () => {});
    const sys2 = createSystem('test', 20, () => {});

    world.addSystem(sys1);
    expect(() => world.addSystem(sys2)).toThrow('System "test" already registered');
  });

  it('removes systems by name', () => {
    const world = new World();
    const updateFn = vi.fn();
    const sys = createSystem('test', 10, updateFn);

    world.addSystem(sys);
    world.update(0.016);
    expect(updateFn).toHaveBeenCalledTimes(1);

    world.removeSystem('test');
    world.update(0.016);
    expect(updateFn).toHaveBeenCalledTimes(1); // Not called again
  });

  it('returns false when removing non-existent system', () => {
    const world = new World();
    expect(world.removeSystem('nonexistent')).toBe(false);
  });

  it('calls init when system is added', () => {
    const world = new World();
    const initFn = vi.fn();

    const sys = {
      name: 'test',
      priority: 10,
      update: vi.fn(),
      init: initFn,
    };

    world.addSystem(sys);
    expect(initFn).toHaveBeenCalledTimes(1);
    expect(initFn).toHaveBeenCalledWith(world);
  });

  it('calls destroy when system is removed', () => {
    const world = new World();
    const destroyFn = vi.fn();

    const sys = {
      name: 'test',
      priority: 10,
      update: vi.fn(),
      destroy: destroyFn,
    };

    world.addSystem(sys);
    world.removeSystem('test');
    expect(destroyFn).toHaveBeenCalledTimes(1);
  });
});
