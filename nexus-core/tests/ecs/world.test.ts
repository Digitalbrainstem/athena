import { describe, it, expect } from 'vitest';
import { World } from '../../src/ecs/world.js';

describe('World', () => {
  it('creates and tracks entities', () => {
    const world = new World();
    world.registerComponent('position');

    const e1 = world.createEntity();
    const e2 = world.createEntity();

    expect(world.isAlive(e1)).toBe(true);
    expect(world.isAlive(e2)).toBe(true);
  });

  it('destroys entities and removes their components', () => {
    const world = new World();
    world.registerComponent('position');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 0, y: 0, z: 0 });

    expect(world.hasComponent(e1, 'position')).toBe(true);

    world.destroyEntity(e1);
    expect(world.isAlive(e1)).toBe(false);
  });

  it('returns false when destroying dead entity', () => {
    const world = new World();
    const e1 = world.createEntity();
    world.destroyEntity(e1);
    expect(world.destroyEntity(e1)).toBe(false);
  });

  it('throws when adding component to dead entity', () => {
    const world = new World();
    world.registerComponent('position');
    const e1 = world.createEntity();
    world.destroyEntity(e1);

    expect(() => {
      world.addComponent(e1, 'position', { x: 0, y: 0, z: 0 });
    }).toThrow('Cannot add component to dead entity');
  });

  it('adds and retrieves components', () => {
    const world = new World();
    world.registerComponent('position');
    world.registerComponent('rotation');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 10, y: 20, z: 30 });
    world.addComponent(e1, 'rotation', { x: 0.1, y: 0.2, z: 0.3 });

    expect(world.getComponent(e1, 'position')).toEqual({ x: 10, y: 20, z: 30 });
    expect(world.getComponent(e1, 'rotation')).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
  });

  it('removes individual components', () => {
    const world = new World();
    world.registerComponent('position');
    world.registerComponent('rotation');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 0, y: 0, z: 0 });
    world.addComponent(e1, 'rotation', { x: 0, y: 0, z: 0 });

    world.removeComponent(e1, 'position');
    expect(world.hasComponent(e1, 'position')).toBe(false);
    expect(world.hasComponent(e1, 'rotation')).toBe(true);
  });

  // --- Queries ---

  it('queries entities by component types', () => {
    const world = new World();
    world.registerComponent('position');
    world.registerComponent('renderable');
    world.registerComponent('light');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 0, y: 0, z: 0 });
    world.addComponent(e1, 'renderable', {
      meshType: 'box',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    });

    const e2 = world.createEntity();
    world.addComponent(e2, 'position', { x: 1, y: 1, z: 1 });

    const e3 = world.createEntity();
    world.addComponent(e3, 'position', { x: 2, y: 2, z: 2 });
    world.addComponent(e3, 'renderable', {
      meshType: 'sphere',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    });

    const result = world.query(['position', 'renderable']);
    expect(result).toHaveLength(2);
    expect(result).toContain(e1);
    expect(result).toContain(e3);
    expect(result).not.toContain(e2);
  });

  it('query returns empty array for no components', () => {
    const world = new World();
    expect(world.query([])).toEqual([]);
  });

  it('query excludes destroyed entities', () => {
    const world = new World();
    world.registerComponent('position');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 0, y: 0, z: 0 });
    const e2 = world.createEntity();
    world.addComponent(e2, 'position', { x: 1, y: 1, z: 1 });

    world.destroyEntity(e1);

    const result = world.query(['position']);
    expect(result).toHaveLength(1);
    expect(result).toContain(e2);
  });

  it('queryWith returns entities with component data', () => {
    const world = new World();
    world.registerComponent('position');
    world.registerComponent('renderable');

    const e1 = world.createEntity();
    world.addComponent(e1, 'position', { x: 5, y: 10, z: 15 });
    world.addComponent(e1, 'renderable', {
      meshType: 'box',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    });

    const results = world.queryWith(['position', 'renderable']);
    expect(results).toHaveLength(1);
    expect(results[0]!.entity).toBe(e1);
    expect(results[0]!.components.position).toEqual({ x: 5, y: 10, z: 15 });
  });

  // --- Actions ---

  it('manages action queue', () => {
    const world = new World();

    world.pushAction({ type: 'move', source: 'keyboard', payload: { direction: { x: 1, z: 0 }, running: false } });
    world.pushAction({ type: 'interact', source: 'keyboard' });

    const peeked = world.peekActions();
    expect(peeked).toHaveLength(2);

    const consumed = world.consumeActions();
    expect(consumed).toHaveLength(2);
    expect(world.peekActions()).toHaveLength(0);
  });

  it('pushActions adds multiple at once', () => {
    const world = new World();

    world.pushActions([
      { type: 'move', source: 'keyboard' },
      { type: 'look', source: 'mouse' },
    ]);

    expect(world.peekActions()).toHaveLength(2);
  });

  // --- Events ---

  it('emits and retrieves events', () => {
    const world = new World();

    world.emitEvent({ type: 'collision', data: { a: 1, b: 2 } });
    world.emitEvent({ type: 'pickup', data: { item: 'gem' } });

    const all = world.getEvents();
    expect(all).toHaveLength(2);

    const collisions = world.getEvents('collision');
    expect(collisions).toHaveLength(1);

    const pickups = world.getEvents('pickup');
    expect(pickups).toHaveLength(1);
  });

  it('clears events after update', () => {
    const world = new World();
    world.emitEvent({ type: 'test', data: {} });
    expect(world.getEvents()).toHaveLength(1);

    world.update(0.016);
    expect(world.getEvents()).toHaveLength(0);
  });

  // --- Lifecycle ---

  it('clears everything', () => {
    const world = new World();
    world.registerComponent('position');

    const e = world.createEntity();
    world.addComponent(e, 'position', { x: 0, y: 0, z: 0 });

    world.clear();
    expect(world.isAlive(e)).toBe(false);
    expect(world.getSystems()).toHaveLength(0);
  });

  it('getSystems returns registered systems', () => {
    const world = new World();
    expect(world.getSystems()).toHaveLength(0);

    world.addSystem({ name: 'test', priority: 10, update: () => {} });
    expect(world.getSystems()).toHaveLength(1);
  });

  it('getSystem returns a specific system', () => {
    const world = new World();
    const sys = { name: 'test', priority: 10, update: () => {} };
    world.addSystem(sys);

    expect(world.getSystem('test')).toBe(sys);
    expect(world.getSystem('nonexistent')).toBeUndefined();
  });
});
