// Companion state repository

import type { DatabaseConnection } from '../connection.js';
import type { CompanionState, CompanionMemory, PersonalityStage } from '../../types/companion.js';

interface CompanionRow {
  profile_id: string;
  name: string;
  appearance: string | null;
  personality_stage: string;
  trust_level: number;
  traits: string | null;
  memory: string | null;
}

function rowToCompanion(row: CompanionRow): CompanionState {
  return {
    profileId: row.profile_id,
    name: row.name,
    appearance: row.appearance ?? undefined,
    personalityStage: row.personality_stage as PersonalityStage,
    trustLevel: row.trust_level,
    traits: row.traits ? JSON.parse(row.traits) as string[] : [],
    memory: row.memory ? JSON.parse(row.memory) as CompanionMemory[] : [],
  };
}

export class CompanionRepository {
  constructor(private db: DatabaseConnection) {}

  get(profileId: string): CompanionState | undefined {
    const row = this.db.queryOne<CompanionRow>(
      'SELECT * FROM companions WHERE profile_id = ?',
      [profileId],
    );
    return row ? rowToCompanion(row) : undefined;
  }

  update(profileId: string, updates: Partial<Omit<CompanionState, 'profileId'>>): CompanionState | undefined {
    const setClauses: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.appearance !== undefined) {
      setClauses.push('appearance = ?');
      values.push(updates.appearance ?? null);
    }
    if (updates.personalityStage !== undefined) {
      setClauses.push('personality_stage = ?');
      values.push(updates.personalityStage);
    }
    if (updates.trustLevel !== undefined) {
      setClauses.push('trust_level = ?');
      values.push(updates.trustLevel);
    }
    if (updates.traits !== undefined) {
      setClauses.push('traits = ?');
      values.push(JSON.stringify(updates.traits));
    }
    if (updates.memory !== undefined) {
      setClauses.push('memory = ?');
      values.push(JSON.stringify(updates.memory));
    }

    if (setClauses.length === 0) return this.get(profileId);

    values.push(profileId);
    this.db.run(
      `UPDATE companions SET ${setClauses.join(', ')} WHERE profile_id = ?`,
      values,
    );

    return this.get(profileId);
  }

  addMemory(profileId: string, memory: CompanionMemory): CompanionState | undefined {
    const current = this.get(profileId);
    if (!current) return undefined;

    const memories = [...current.memory, memory];
    // Keep only the most recent 100 memories
    const trimmed = memories.length > 100 ? memories.slice(-100) : memories;

    return this.update(profileId, { memory: trimmed });
  }

  adjustTrust(profileId: string, delta: number): CompanionState | undefined {
    const current = this.get(profileId);
    if (!current) return undefined;

    const newTrust = Math.max(0, Math.min(1, current.trustLevel + delta));
    return this.update(profileId, { trustLevel: newTrust });
  }
}
