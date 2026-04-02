// World state persistence repository

import type { DatabaseConnection } from '../connection.js';
import type { WorldState, BuiltStructure, InventoryEntry } from '../../types/world.js';

interface WorldStateRow {
  profile_id: string;
  active_biome: string;
  discovered_biomes: string;
  built_structures: string;
  inventory: string;
  travel_capability: string;
  world_seed: string | null;
}

function rowToWorldState(row: WorldStateRow): WorldState {
  return {
    profileId: row.profile_id,
    activeBiome: row.active_biome,
    discoveredBiomes: JSON.parse(row.discovered_biomes) as string[],
    builtStructures: JSON.parse(row.built_structures) as BuiltStructure[],
    inventory: JSON.parse(row.inventory) as InventoryEntry[],
    travelCapability: JSON.parse(row.travel_capability) as string[],
    worldSeed: row.world_seed ?? undefined,
  };
}

export class WorldStateRepository {
  constructor(private db: DatabaseConnection) {}

  get(profileId: string): WorldState | undefined {
    const row = this.db.queryOne<WorldStateRow>(
      'SELECT * FROM world_state WHERE profile_id = ?',
      [profileId],
    );
    return row ? rowToWorldState(row) : undefined;
  }

  update(profileId: string, updates: Partial<Omit<WorldState, 'profileId'>>): WorldState | undefined {
    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (updates.activeBiome !== undefined) {
      setClauses.push('active_biome = ?');
      values.push(updates.activeBiome);
    }
    if (updates.discoveredBiomes !== undefined) {
      setClauses.push('discovered_biomes = ?');
      values.push(JSON.stringify(updates.discoveredBiomes));
    }
    if (updates.builtStructures !== undefined) {
      setClauses.push('built_structures = ?');
      values.push(JSON.stringify(updates.builtStructures));
    }
    if (updates.inventory !== undefined) {
      setClauses.push('inventory = ?');
      values.push(JSON.stringify(updates.inventory));
    }
    if (updates.travelCapability !== undefined) {
      setClauses.push('travel_capability = ?');
      values.push(JSON.stringify(updates.travelCapability));
    }
    if (updates.worldSeed !== undefined) {
      setClauses.push('world_seed = ?');
      values.push(updates.worldSeed ?? null);
    }

    if (setClauses.length === 0) return this.get(profileId);

    values.push(profileId);
    this.db.run(
      `UPDATE world_state SET ${setClauses.join(', ')} WHERE profile_id = ?`,
      values,
    );

    return this.get(profileId);
  }

  addDiscoveredBiome(profileId: string, biomeId: string): WorldState | undefined {
    const current = this.get(profileId);
    if (!current) return undefined;

    if (!current.discoveredBiomes.includes(biomeId)) {
      const updated = [...current.discoveredBiomes, biomeId];
      return this.update(profileId, { discoveredBiomes: updated });
    }
    return current;
  }

  updateInventory(profileId: string, itemType: string, quantityDelta: number): WorldState | undefined {
    const current = this.get(profileId);
    if (!current) return undefined;

    const inventory = [...current.inventory];
    const existing = inventory.find((i) => i.itemType === itemType);

    if (existing) {
      existing.quantity += quantityDelta;
      if (existing.quantity <= 0) {
        const idx = inventory.indexOf(existing);
        inventory.splice(idx, 1);
      }
    } else if (quantityDelta > 0) {
      inventory.push({ itemType, quantity: quantityDelta });
    }

    return this.update(profileId, { inventory });
  }

  addStructure(profileId: string, structure: BuiltStructure): WorldState | undefined {
    const current = this.get(profileId);
    if (!current) return undefined;

    const structures = [...current.builtStructures, structure];
    return this.update(profileId, { builtStructures: structures });
  }
}
