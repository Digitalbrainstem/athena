import { describe, it, expect } from 'vitest';
import { EntityManager, unpackIndex, unpackGeneration } from '../../src/ecs/entity.js';

describe('EntityManager', () => {
  it('creates entities with unique IDs', () => {
    const em = new EntityManager();
    const e1 = em.create();
    const e2 = em.create();
    const e3 = em.create();

    expect(e1).not.toBe(e2);
    expect(e2).not.toBe(e3);
    expect(e1).not.toBe(e3);
  });

  it('tracks entity count correctly', () => {
    const em = new EntityManager();
    expect(em.count).toBe(0);

    em.create();
    em.create();
    expect(em.count).toBe(2);

    em.create();
    expect(em.count).toBe(3);
  });

  it('reports entities as alive after creation', () => {
    const em = new EntityManager();
    const e1 = em.create();
    expect(em.isAlive(e1)).toBe(true);
  });

  it('destroys entities', () => {
    const em = new EntityManager();
    const e1 = em.create();
    expect(em.isAlive(e1)).toBe(true);
    expect(em.count).toBe(1);

    const result = em.destroy(e1);
    expect(result).toBe(true);
    expect(em.isAlive(e1)).toBe(false);
    expect(em.count).toBe(0);
  });

  it('returns false when destroying already-dead entity', () => {
    const em = new EntityManager();
    const e1 = em.create();
    em.destroy(e1);
    expect(em.destroy(e1)).toBe(false);
  });

  it('returns false when destroying invalid entity ID', () => {
    const em = new EntityManager();
    expect(em.destroy(99999)).toBe(false);
  });

  it('detects stale entity references via generation tracking', () => {
    const em = new EntityManager();
    const e1 = em.create();
    em.destroy(e1);

    // Create a new entity that might reuse the same index
    const e2 = em.create();

    // The old reference should be stale
    expect(em.isAlive(e1)).toBe(false);
    expect(em.isAlive(e2)).toBe(true);

    // The new entity should have a bumped generation
    expect(unpackIndex(e1)).toBe(unpackIndex(e2));
    expect(unpackGeneration(e2)).toBe(unpackGeneration(e1) + 1);
  });

  it('recycles IDs', () => {
    const em = new EntityManager();
    const e1 = em.create();
    const idx1 = unpackIndex(e1);
    em.destroy(e1);

    const e2 = em.create();
    const idx2 = unpackIndex(e2);

    // Same index reused
    expect(idx1).toBe(idx2);
    // Different entity ID (due to generation bump)
    expect(e1).not.toBe(e2);
  });

  it('iterates alive entities', () => {
    const em = new EntityManager();
    const e1 = em.create();
    const e2 = em.create();
    const e3 = em.create();
    em.destroy(e2);

    const alive = [...em];
    expect(alive).toHaveLength(2);
    expect(alive).toContain(e1);
    expect(alive).toContain(e3);
    expect(alive).not.toContain(e2);
  });

  it('clears all entities', () => {
    const em = new EntityManager();
    em.create();
    em.create();
    em.create();
    expect(em.count).toBe(3);

    em.clear();
    expect(em.count).toBe(0);
    expect([...em]).toHaveLength(0);
  });

  it('grows capacity automatically', () => {
    const em = new EntityManager(4);
    const entities: number[] = [];
    for (let i = 0; i < 10; i++) {
      entities.push(em.create());
    }
    expect(em.count).toBe(10);
    for (const e of entities) {
      expect(em.isAlive(e)).toBe(true);
    }
  });

  it('handles mass create and destroy', () => {
    const em = new EntityManager();
    const entities: number[] = [];

    for (let i = 0; i < 100; i++) {
      entities.push(em.create());
    }
    expect(em.count).toBe(100);

    for (const e of entities) {
      em.destroy(e);
    }
    expect(em.count).toBe(0);
  });

  it('handles interleaved create and destroy', () => {
    const em = new EntityManager();
    const e1 = em.create();
    const e2 = em.create();
    em.destroy(e1);
    const e3 = em.create();
    em.destroy(e2);
    const e4 = em.create();

    expect(em.count).toBe(2);
    expect(em.isAlive(e3)).toBe(true);
    expect(em.isAlive(e4)).toBe(true);
    expect(em.isAlive(e1)).toBe(false);
    expect(em.isAlive(e2)).toBe(false);
  });
});
