// Versioned migration system

import type { DatabaseConnection } from './connection.js';
import { getSchemaVersion } from './schema.js';

export interface Migration {
  version: number;
  description: string;
  up(db: DatabaseConnection): void;
}

const migrations: Migration[] = [
  {
    version: 2,
    description: 'Add accessibility_settings to profiles',
    up(db) {
      // Column may already exist in schema — check before adding
      const columns = db.query<{ name: string }>(
        "PRAGMA table_info('profiles')",
      );
      if (!columns.some((c) => c.name === 'accessibility_settings')) {
        db.exec('ALTER TABLE profiles ADD COLUMN accessibility_settings TEXT');
      }
    },
  },
  {
    version: 3,
    description: 'Add interest tracking tables',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS interest_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          signal_type TEXT NOT NULL,
          category TEXT NOT NULL,
          weight REAL NOT NULL,
          timestamp TEXT DEFAULT (datetime('now'))
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS interest_weights (
          profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          weight REAL DEFAULT 0.0,
          updated_at TEXT DEFAULT (datetime('now')),
          PRIMARY KEY (profile_id, category)
        )
      `);
      db.exec('CREATE INDEX IF NOT EXISTS idx_interest_signals_profile ON interest_signals(profile_id, timestamp)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_interest_weights_profile ON interest_weights(profile_id)');
    },
  },
];

export function runMigrations(db: DatabaseConnection): number {
  const currentVersion = getSchemaVersion(db);
  const pendingMigrations = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pendingMigrations) {
    db.transaction(() => {
      migration.up(db);
      db.run(
        'INSERT INTO schema_version (version, description) VALUES (?, ?)',
        [migration.version, migration.description],
      );
    });
  }

  return pendingMigrations.length;
}

export function getMigrations(): readonly Migration[] {
  return migrations;
}
