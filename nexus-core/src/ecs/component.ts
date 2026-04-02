// Component storage — typed Maps keyed by component name

import type { ComponentType, ComponentTypeMap } from '../types/components.js';

export class ComponentStorage<K extends ComponentType = ComponentType> {
  private stores = new Map<K, Map<number, ComponentTypeMap[K]>>();

  /** Register a component type for storage */
  register<T extends K>(componentType: T): void {
    if (!this.stores.has(componentType as K)) {
      this.stores.set(componentType as K, new Map());
    }
  }

  /** Add a component to an entity */
  add<T extends K>(entity: number, componentType: T, data: ComponentTypeMap[T]): void {
    const store = this.stores.get(componentType as K);
    if (!store) {
      throw new Error(`Component type "${componentType}" not registered. Call register() first.`);
    }
    store.set(entity, data as ComponentTypeMap[K]);
  }

  /** Remove a component from an entity */
  remove<T extends K>(entity: number, componentType: T): boolean {
    const store = this.stores.get(componentType as K);
    if (!store) return false;
    return store.delete(entity);
  }

  /** Get a component for an entity */
  get<T extends K>(entity: number, componentType: T): ComponentTypeMap[T] | undefined {
    const store = this.stores.get(componentType as K);
    if (!store) return undefined;
    return store.get(entity) as ComponentTypeMap[T] | undefined;
  }

  /** Check if an entity has a component */
  has<T extends K>(entity: number, componentType: T): boolean {
    const store = this.stores.get(componentType as K);
    if (!store) return false;
    return store.has(entity);
  }

  /** Get all entities that have a specific component type */
  entitiesWith<T extends K>(componentType: T): IterableIterator<number> {
    const store = this.stores.get(componentType as K);
    if (!store) return [][Symbol.iterator]();
    return store.keys();
  }

  /** Get the map of all entities to their data for a component type */
  getStore<T extends K>(componentType: T): ReadonlyMap<number, ComponentTypeMap[T]> | undefined {
    return this.stores.get(componentType as K) as ReadonlyMap<number, ComponentTypeMap[T]> | undefined;
  }

  /** Remove all components for an entity across all stores */
  removeAll(entity: number): void {
    for (const store of this.stores.values()) {
      store.delete(entity);
    }
  }

  /** Check if a component type is registered */
  isRegistered<T extends K>(componentType: T): boolean {
    return this.stores.has(componentType as K);
  }

  /** Clear all component data */
  clear(): void {
    for (const store of this.stores.values()) {
      store.clear();
    }
  }
}
