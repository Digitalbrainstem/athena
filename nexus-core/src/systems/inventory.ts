// Inventory management system

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';

export interface InventoryAction {
  type: 'add' | 'remove' | 'use';
  itemType: string;
  quantity: number;
  entityId?: number;
}

export class InventorySystem implements System {
  readonly name = 'inventory';
  readonly priority = 25;

  private pendingActions: InventoryAction[] = [];

  queueAction(action: InventoryAction): void {
    this.pendingActions.push(action);
  }

  update(world: World, _dt: number): void {
    const actions = this.pendingActions.splice(0);

    for (const action of actions) {
      this.processAction(world, action);
    }
  }

  private processAction(world: World, action: InventoryAction): void {
    switch (action.type) {
      case 'add':
        this.addToInventory(world, action);
        break;
      case 'remove':
        this.removeFromInventory(world, action);
        break;
      case 'use':
        this.useItem(world, action);
        break;
    }
  }

  private addToInventory(world: World, action: InventoryAction): void {
    // Find existing inventory entity for this item type
    const inventoryEntities = world.query(['inventoryItem']);
    for (const entity of inventoryEntities) {
      const item = world.getComponent(entity, 'inventoryItem');
      if (item && item.itemType === action.itemType) {
        item.quantity += action.quantity;
        return;
      }
    }

    // Create new inventory entity
    const entity = world.createEntity();
    world.addComponent(entity, 'inventoryItem', {
      itemType: action.itemType,
      quantity: action.quantity,
    });
  }

  private removeFromInventory(world: World, action: InventoryAction): void {
    const inventoryEntities = world.query(['inventoryItem']);
    for (const entity of inventoryEntities) {
      const item = world.getComponent(entity, 'inventoryItem');
      if (item && item.itemType === action.itemType) {
        item.quantity -= action.quantity;
        if (item.quantity <= 0) {
          world.destroyEntity(entity);
        }
        return;
      }
    }
  }

  private useItem(world: World, action: InventoryAction): void {
    const inventoryEntities = world.query(['inventoryItem']);
    for (const entity of inventoryEntities) {
      const item = world.getComponent(entity, 'inventoryItem');
      if (item && item.itemType === action.itemType && item.quantity >= action.quantity) {
        item.quantity -= action.quantity;
        if (item.quantity <= 0) {
          world.destroyEntity(entity);
        }
        world.emitEvent({
          type: 'item_used',
          data: { itemType: action.itemType, quantity: action.quantity },
        });
        return;
      }
    }
  }

  /** Get all items in the inventory */
  getItems(world: World): Array<{ itemType: string; quantity: number }> {
    const entities = world.query(['inventoryItem']);
    const items: Array<{ itemType: string; quantity: number }> = [];

    for (const entity of entities) {
      const item = world.getComponent(entity, 'inventoryItem');
      if (item && item.quantity > 0) {
        items.push({ itemType: item.itemType, quantity: item.quantity });
      }
    }

    return items;
  }

  /** Check if the inventory contains at least the specified quantity of an item */
  hasItem(world: World, itemType: string, quantity = 1): boolean {
    const entities = world.query(['inventoryItem']);
    for (const entity of entities) {
      const item = world.getComponent(entity, 'inventoryItem');
      if (item && item.itemType === itemType && item.quantity >= quantity) {
        return true;
      }
    }
    return false;
  }
}
