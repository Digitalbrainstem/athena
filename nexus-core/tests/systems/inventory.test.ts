import { describe, it, expect } from 'vitest';
import { InventorySystem } from '../../src/systems/inventory.js';
import { World } from '../../src/ecs/world.js';

function createWorld(): World {
  const w = new World();
  w.registerComponent('inventoryItem');
  w.registerComponent('position');
  return w;
}

describe('InventorySystem', () => {
  it('starts with empty inventory', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    expect(inv.getItems(world)).toEqual([]);
  });

  it('adds items to inventory', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 5 });
    inv.update(world, 0);
    const items = inv.getItems(world);
    expect(items).toHaveLength(1);
    expect(items[0]!.itemType).toBe('wood');
    expect(items[0]!.quantity).toBe(5);
  });

  it('stacks same item type', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 3 });
    inv.update(world, 0);
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 2 });
    inv.update(world, 0);
    const items = inv.getItems(world);
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(5);
  });

  it('adds different item types separately', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 1 });
    inv.queueAction({ type: 'add', itemType: 'stone', quantity: 2 });
    inv.update(world, 0);
    expect(inv.getItems(world)).toHaveLength(2);
  });

  it('removes items from inventory', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 5 });
    inv.update(world, 0);
    inv.queueAction({ type: 'remove', itemType: 'wood', quantity: 3 });
    inv.update(world, 0);
    const items = inv.getItems(world);
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(2);
  });

  it('removes item entity when quantity reaches 0', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'wood', quantity: 2 });
    inv.update(world, 0);
    inv.queueAction({ type: 'remove', itemType: 'wood', quantity: 2 });
    inv.update(world, 0);
    expect(inv.getItems(world)).toHaveLength(0);
  });

  it('hasItem checks quantity', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'iron', quantity: 3 });
    inv.update(world, 0);
    expect(inv.hasItem(world, 'iron', 3)).toBe(true);
    expect(inv.hasItem(world, 'iron', 4)).toBe(false);
    expect(inv.hasItem(world, 'gold')).toBe(false);
  });

  it('hasItem defaults to quantity 1', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'gem', quantity: 1 });
    inv.update(world, 0);
    expect(inv.hasItem(world, 'gem')).toBe(true);
  });

  it('use item reduces quantity and emits event', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'potion', quantity: 3 });
    inv.update(world, 0);
    inv.queueAction({ type: 'use', itemType: 'potion', quantity: 1 });
    inv.update(world, 0);
    expect(inv.getItems(world)[0]!.quantity).toBe(2);
    const events = world.getEvents();
    expect(events.some(e => e.type === 'item_used')).toBe(true);
  });

  it('use item does nothing if not enough quantity', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'potion', quantity: 1 });
    inv.update(world, 0);
    inv.queueAction({ type: 'use', itemType: 'potion', quantity: 5 });
    inv.update(world, 0);
    expect(inv.getItems(world)[0]!.quantity).toBe(1); // unchanged
  });

  it('processes multiple actions in one update', () => {
    const world = createWorld();
    const inv = new InventorySystem();
    inv.queueAction({ type: 'add', itemType: 'a', quantity: 1 });
    inv.queueAction({ type: 'add', itemType: 'b', quantity: 2 });
    inv.queueAction({ type: 'add', itemType: 'c', quantity: 3 });
    inv.update(world, 0);
    expect(inv.getItems(world)).toHaveLength(3);
  });

  it('has correct priority', () => {
    const inv = new InventorySystem();
    expect(inv.priority).toBe(25);
    expect(inv.name).toBe('inventory');
  });
});
