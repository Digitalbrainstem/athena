// Profile CRUD repository

import type { DatabaseConnection } from '../connection.js';
import type { Profile, CreateProfileInput } from '../../types/profile.js';
import type { MasteryTier } from '../../types/components.js';

interface ProfileRow {
  id: string;
  name: string;
  avatar_data: string | null;
  mastery_tier: string;
  birth_date: string | null;
  created_at: string;
  last_active: string | null;
  settings: string | null;
  accessibility_settings: string | null;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    avatarData: row.avatar_data ?? undefined,
    masteryTier: row.mastery_tier as MasteryTier,
    birthDate: row.birth_date ?? undefined,
    createdAt: row.created_at,
    lastActive: row.last_active ?? undefined,
    settings: row.settings ? JSON.parse(row.settings) as Record<string, unknown> : undefined,
    accessibilitySettings: row.accessibility_settings
      ? JSON.parse(row.accessibility_settings) as import('../../types/accessibility.js').AccessibilitySettings
      : undefined,
  };
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export class ProfileRepository {
  constructor(private db: DatabaseConnection) {}

  create(input: CreateProfileInput): Profile {
    const id = input.id ?? generateId();
    const settings = input.settings ? JSON.stringify(input.settings) : null;
    const a11ySettings = input.accessibilitySettings ? JSON.stringify(input.accessibilitySettings) : null;

    this.db.run(
      `INSERT INTO profiles (id, name, avatar_data, birth_date, settings, accessibility_settings, last_active)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, input.name, input.avatarData ?? null, input.birthDate ?? null, settings, a11ySettings],
    );

    // Create default companion
    this.db.run(
      `INSERT INTO companions (profile_id) VALUES (?)`,
      [id],
    );

    // Create default world state
    this.db.run(
      `INSERT INTO world_state (profile_id) VALUES (?)`,
      [id],
    );

    const row = this.db.queryOne<ProfileRow>(
      'SELECT * FROM profiles WHERE id = ?',
      [id],
    );
    if (!row) throw new Error('Failed to create profile');
    return rowToProfile(row);
  }

  getById(id: string): Profile | undefined {
    const row = this.db.queryOne<ProfileRow>(
      'SELECT * FROM profiles WHERE id = ?',
      [id],
    );
    return row ? rowToProfile(row) : undefined;
  }

  update(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | undefined {
    const setClauses: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.avatarData !== undefined) {
      setClauses.push('avatar_data = ?');
      values.push(updates.avatarData ?? null);
    }
    if (updates.masteryTier !== undefined) {
      setClauses.push('mastery_tier = ?');
      values.push(updates.masteryTier);
    }
    if (updates.birthDate !== undefined) {
      setClauses.push('birth_date = ?');
      values.push(updates.birthDate ?? null);
    }
    if (updates.lastActive !== undefined) {
      setClauses.push('last_active = ?');
      values.push(updates.lastActive ?? null);
    }
    if (updates.settings !== undefined) {
      setClauses.push('settings = ?');
      values.push(updates.settings ? JSON.stringify(updates.settings) : null);
    }
    if (updates.accessibilitySettings !== undefined) {
      setClauses.push('accessibility_settings = ?');
      values.push(updates.accessibilitySettings ? JSON.stringify(updates.accessibilitySettings) : null);
    }

    if (setClauses.length === 0) return this.getById(id);

    values.push(id);
    this.db.run(
      `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = ?`,
      values,
    );

    return this.getById(id);
  }

  list(limit = 50, offset = 0): Profile[] {
    const rows = this.db.query<ProfileRow>(
      'SELECT * FROM profiles ORDER BY last_active DESC LIMIT ? OFFSET ?',
      [limit, offset],
    );
    return rows.map(rowToProfile);
  }

  delete(id: string): boolean {
    this.db.run('DELETE FROM profiles WHERE id = ?', [id]);
    return this.db.getRowsModified() > 0;
  }

  updateLastActive(id: string): void {
    this.db.run(
      `UPDATE profiles SET last_active = datetime('now') WHERE id = ?`,
      [id],
    );
  }

  count(): number {
    const row = this.db.queryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM profiles');
    return row?.cnt ?? 0;
  }
}
