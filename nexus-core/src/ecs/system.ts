// System interface — priority-ordered game systems

import type { World } from './world.js';

/** A system processes entities with specific component sets each frame */
export interface System {
  /** Unique name for this system */
  readonly name: string;
  /** Priority: lower values run first */
  readonly priority: number;
  /** Called every frame with the world and delta time in seconds */
  update(world: World, dt: number): void;
  /** Optional: called once when the system is added to the world */
  init?(world: World): void;
  /** Optional: called when the system is removed from the world */
  destroy?(world: World): void;
}

/** Create a simple system from a function */
export function createSystem(
  name: string,
  priority: number,
  updateFn: (world: World, dt: number) => void,
): System {
  return { name, priority, update: updateFn };
}
