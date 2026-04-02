// World container — entities, components, and systems

import { EntityManager } from './entity.js';
import { ComponentStorage } from './component.js';
import type { System } from './system.js';
import type { ComponentType, ComponentTypeMap } from '../types/components.js';
import type { GameAction } from '../types/actions.js';

export class World {
  readonly entities: EntityManager;
  readonly components: ComponentStorage;
  private systems: System[] = [];
  private systemsByName = new Map<string, System>();
  private actionQueue: GameAction[] = [];
  private eventQueue: WorldEvent[] = [];

  constructor() {
    this.entities = new EntityManager();
    this.components = new ComponentStorage();
  }

  // --- Entity operations ---

  createEntity(): number {
    return this.entities.create();
  }

  destroyEntity(entity: number): boolean {
    if (!this.entities.isAlive(entity)) return false;
    this.components.removeAll(entity);
    return this.entities.destroy(entity);
  }

  isAlive(entity: number): boolean {
    return this.entities.isAlive(entity);
  }

  // --- Component operations ---

  registerComponent<T extends ComponentType>(componentType: T): void {
    this.components.register(componentType);
  }

  addComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
    data: ComponentTypeMap[T],
  ): void {
    if (!this.entities.isAlive(entity)) {
      throw new Error(`Cannot add component to dead entity ${entity}`);
    }
    this.components.add(entity, componentType, data);
  }

  removeComponent<T extends ComponentType>(entity: number, componentType: T): boolean {
    return this.components.remove(entity, componentType);
  }

  getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentTypeMap[T] | undefined {
    return this.components.get(entity, componentType);
  }

  hasComponent<T extends ComponentType>(entity: number, componentType: T): boolean {
    return this.components.has(entity, componentType);
  }

  // --- Queries ---

  /** Query for all entities that have ALL of the specified component types */
  query(componentTypes: ComponentType[]): number[] {
    if (componentTypes.length === 0) return [];

    const firstType = componentTypes[0]!;
    const candidates = [...this.components.entitiesWith(firstType)];

    return candidates.filter((entity) => {
      if (!this.entities.isAlive(entity)) return false;
      return componentTypes.every((ct) => this.components.has(entity, ct));
    });
  }

  /** Query returning entities with their component data */
  queryWith<T extends ComponentType>(
    componentTypes: T[],
  ): Array<{ entity: number; components: Partial<Pick<ComponentTypeMap, T>> }> {
    const entities = this.query(componentTypes);
    return entities.map((entity) => {
      const comps: Partial<ComponentTypeMap> = {};
      for (const ct of componentTypes) {
        (comps as Record<string, unknown>)[ct] = this.components.get(entity, ct);
      }
      return { entity, components: comps as Partial<Pick<ComponentTypeMap, T>> };
    });
  }

  // --- System management ---

  addSystem(system: System): void {
    if (this.systemsByName.has(system.name)) {
      throw new Error(`System "${system.name}" already registered`);
    }
    this.systems.push(system);
    this.systemsByName.set(system.name, system);
    this.systems.sort((a, b) => a.priority - b.priority);
    system.init?.(this);
  }

  removeSystem(name: string): boolean {
    const system = this.systemsByName.get(name);
    if (!system) return false;
    system.destroy?.(this);
    this.systemsByName.delete(name);
    this.systems = this.systems.filter((s) => s.name !== name);
    return true;
  }

  getSystem(name: string): System | undefined {
    return this.systemsByName.get(name);
  }

  getSystems(): readonly System[] {
    return this.systems;
  }

  // --- Update ---

  /** Run all systems in priority order */
  update(dt: number): void {
    for (const system of this.systems) {
      system.update(this, dt);
    }
    this.eventQueue = [];
  }

  // --- Actions (input from renderers) ---

  pushAction(action: GameAction): void {
    this.actionQueue.push(action);
  }

  pushActions(actions: GameAction[]): void {
    this.actionQueue.push(...actions);
  }

  consumeActions(): GameAction[] {
    const actions = this.actionQueue;
    this.actionQueue = [];
    return actions;
  }

  peekActions(): readonly GameAction[] {
    return this.actionQueue;
  }

  // --- Events (inter-system communication) ---

  emitEvent(event: WorldEvent): void {
    this.eventQueue.push(event);
  }

  getEvents(type?: string): readonly WorldEvent[] {
    if (type) return this.eventQueue.filter((e) => e.type === type);
    return this.eventQueue;
  }

  // --- Lifecycle ---

  clear(): void {
    for (const system of this.systems) {
      system.destroy?.(this);
    }
    this.systems = [];
    this.systemsByName.clear();
    this.components.clear();
    this.entities.clear();
    this.actionQueue = [];
    this.eventQueue = [];
  }
}

export interface WorldEvent {
  type: string;
  data: Record<string, unknown>;
}
