// Entity manager — numeric IDs with generation tracking for stale reference detection

const ENTITY_INDEX_BITS = 22;
const ENTITY_INDEX_MASK = (1 << ENTITY_INDEX_BITS) - 1;
const GENERATION_SHIFT = ENTITY_INDEX_BITS;

/** Pack index + generation into a single uint32 entity ID */
function packEntity(index: number, generation: number): number {
  return ((generation & 0x3FF) << GENERATION_SHIFT) | (index & ENTITY_INDEX_MASK);
}

/** Extract the index from a packed entity ID */
function unpackIndex(entity: number): number {
  return entity & ENTITY_INDEX_MASK;
}

/** Extract the generation from a packed entity ID */
function unpackGeneration(entity: number): number {
  return (entity >>> GENERATION_SHIFT) & 0x3FF;
}

export class EntityManager {
  private generations: Uint16Array;
  private alive: Uint8Array;
  private freeIndices: number[] = [];
  private nextIndex = 0;
  private entityCount = 0;
  private capacity: number;

  constructor(initialCapacity = 1024) {
    this.capacity = initialCapacity;
    this.generations = new Uint16Array(initialCapacity);
    this.alive = new Uint8Array(initialCapacity);
  }

  /** Create a new entity, returns packed entity ID */
  create(): number {
    let index: number;
    if (this.freeIndices.length > 0) {
      index = this.freeIndices.pop()!;
    } else {
      index = this.nextIndex++;
      if (index >= this.capacity) {
        this.grow();
      }
    }
    this.alive[index] = 1;
    this.entityCount++;
    return packEntity(index, this.generations[index]!);
  }

  /** Destroy an entity, bumping its generation */
  destroy(entity: number): boolean {
    const index = unpackIndex(entity);
    const generation = unpackGeneration(entity);
    if (index >= this.nextIndex || this.alive[index] !== 1 || this.generations[index] !== generation) {
      return false;
    }
    this.alive[index] = 0;
    this.generations[index] = (this.generations[index]! + 1) & 0x3FF;
    this.freeIndices.push(index);
    this.entityCount--;
    return true;
  }

  /** Check if an entity is still alive (not destroyed, correct generation) */
  isAlive(entity: number): boolean {
    const index = unpackIndex(entity);
    const generation = unpackGeneration(entity);
    return index < this.nextIndex &&
      this.alive[index] === 1 &&
      this.generations[index] === generation;
  }

  /** Get current live entity count */
  get count(): number {
    return this.entityCount;
  }

  /** Iterate all alive entities */
  *[Symbol.iterator](): IterableIterator<number> {
    for (let i = 0; i < this.nextIndex; i++) {
      if (this.alive[i] === 1) {
        yield packEntity(i, this.generations[i]!);
      }
    }
  }

  /** Reset the manager, clearing all entities */
  clear(): void {
    this.generations = new Uint16Array(this.capacity);
    this.alive = new Uint8Array(this.capacity);
    this.freeIndices = [];
    this.nextIndex = 0;
    this.entityCount = 0;
  }

  private grow(): void {
    const newCapacity = this.capacity * 2;
    const newGenerations = new Uint16Array(newCapacity);
    const newAlive = new Uint8Array(newCapacity);
    newGenerations.set(this.generations);
    newAlive.set(this.alive);
    this.generations = newGenerations;
    this.alive = newAlive;
    this.capacity = newCapacity;
  }
}

export { packEntity, unpackIndex, unpackGeneration };
