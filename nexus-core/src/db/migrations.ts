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
