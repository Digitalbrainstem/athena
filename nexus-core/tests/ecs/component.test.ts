import { describe, it, expect } from 'vitest';
import { ComponentStorage } from '../../src/ecs/component.js';

describe('ComponentStorage', () => {
  it('registers component types', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    expect(storage.isRegistered('position')).toBe(true);
    expect(storage.isRegistered('rotation')).toBe(false);
  });

  it('adds and retrieves components', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    storage.add(1, 'position', { x: 10, y: 20, z: 30 });
    const pos = storage.get(1, 'position');
    expect(pos).toEqual({ x: 10, y: 20, z: 30 });
  });

  it('throws when adding to unregistered type', () => {
    const storage = new ComponentStorage();
    expect(() => {
      storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    }).toThrow('Component type "position" not registered');
  });

  it('returns undefined for missing component', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    expect(storage.get(1, 'position')).toBeUndefined();
  });

  it('checks if entity has component', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    expect(storage.has(1, 'position')).toBe(false);
    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    expect(storage.has(1, 'position')).toBe(true);
  });

  it('removes components', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    expect(storage.has(1, 'position')).toBe(true);

    const result = storage.remove(1, 'position');
    expect(result).toBe(true);
    expect(storage.has(1, 'position')).toBe(false);
  });

  it('returns false when removing non-existent component', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    expect(storage.remove(1, 'position')).toBe(false);
  });

  it('returns false when removing from unregistered type', () => {
    const storage = new ComponentStorage();
    expect(storage.remove(1, 'position')).toBe(false);
  });

  it('lists entities with a component type', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    storage.add(3, 'position', { x: 1, y: 1, z: 1 });
    storage.add(5, 'position', { x: 2, y: 2, z: 2 });

    const entities = [...storage.entitiesWith('position')];
    expect(entities).toHaveLength(3);
    expect(entities).toContain(1);
    expect(entities).toContain(3);
    expect(entities).toContain(5);
  });

  it('removes all components for an entity', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    storage.register('rotation');
    storage.register('renderable');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    storage.add(1, 'rotation', { x: 0, y: 0, z: 0 });
    storage.add(1, 'renderable', {
      meshType: 'box',
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
    });

    storage.removeAll(1);

    expect(storage.has(1, 'position')).toBe(false);
    expect(storage.has(1, 'rotation')).toBe(false);
    expect(storage.has(1, 'renderable')).toBe(false);
  });

  it('clears all data', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    storage.register('rotation');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    storage.add(2, 'rotation', { x: 0, y: 0, z: 0 });

    storage.clear();

    expect(storage.has(1, 'position')).toBe(false);
    expect(storage.has(2, 'rotation')).toBe(false);
    // Types should still be registered
    expect(storage.isRegistered('position')).toBe(true);
  });

  it('overwrites existing component data', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    storage.add(1, 'position', { x: 10, y: 20, z: 30 });

    expect(storage.get(1, 'position')).toEqual({ x: 10, y: 20, z: 30 });
  });

  it('handles multiple component types independently', () => {
    const storage = new ComponentStorage();
    storage.register('position');
    storage.register('rotation');

    storage.add(1, 'position', { x: 1, y: 2, z: 3 });
    storage.add(1, 'rotation', { x: 0.1, y: 0.2, z: 0.3 });

    expect(storage.get(1, 'position')).toEqual({ x: 1, y: 2, z: 3 });
    expect(storage.get(1, 'rotation')).toEqual({ x: 0.1, y: 0.2, z: 0.3 });

    storage.remove(1, 'position');
    expect(storage.has(1, 'position')).toBe(false);
    expect(storage.has(1, 'rotation')).toBe(true);
  });

  it('getStore returns readonly map', () => {
    const storage = new ComponentStorage();
    storage.register('position');

    storage.add(1, 'position', { x: 0, y: 0, z: 0 });
    storage.add(2, 'position', { x: 1, y: 1, z: 1 });

    const store = storage.getStore('position');
    expect(store).toBeDefined();
    expect(store!.size).toBe(2);
  });

  it('getStore returns undefined for unregistered type', () => {
    const storage = new ComponentStorage();
    expect(storage.getStore('position')).toBeUndefined();
  });
});
