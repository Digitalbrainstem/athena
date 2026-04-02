// Versioned migration system

import type { DatabaseConnection } from './connection.js';
import { getSchemaVersion } from './schema.js';

export interface Migration {
  version: number;
  description: string;
  up(db: DatabaseConnection): void;
}

const migrations: Migration[] = [
  // Future migrations go here
  // {
  //   version: 2,
  //   description: 'Add some new table',
  //   up(db) { db.exec('ALTER TABLE ...'); }
  // },
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
