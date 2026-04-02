import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';
import { createSchema, getSchemaVersion, CURRENT_SCHEMA_VERSION } from '../../src/db/schema.js';

describe('Schema', () => {
  let db: DatabaseConnection;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('creates all tables', () => {
    createSchema(db);

    const tables = db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain('profiles');
    expect(tableNames).toContain('auth');
    expect(tableNames).toContain('mastery');
    expect(tableNames).toContain('learning_events');
    expect(tableNames).toContain('quests');
    expect(tableNames).toContain('quest_progress');
    expect(tableNames).toContain('companions');
    expect(tableNames).toContain('world_state');
    expect(tableNames).toContain('screen_time');
    expect(tableNames).toContain('devices');
    expect(tableNames).toContain('schema_version');
  });

  it('creates indexes', () => {
    createSchema(db);

    const indexes = db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'",
    );

    const indexNames = indexes.map((i) => i.name);
    expect(indexNames).toContain('idx_mastery_profile');
    expect(indexNames).toContain('idx_mastery_skill');
    expect(indexNames).toContain('idx_mastery_review');
    expect(indexNames).toContain('idx_events_profile_time');
    expect(indexNames).toContain('idx_events_skill');
    expect(indexNames).toContain('idx_quests_biome_tier');
    expect(indexNames).toContain('idx_quest_progress_profile');
  });

  it('records schema version', () => {
    createSchema(db);
    const version = getSchemaVersion(db);
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('is idempotent — running twice does not error', () => {
    createSchema(db);
    expect(() => createSchema(db)).not.toThrow();
  });

  it('returns 0 for schema version before creation', () => {
    const version = getSchemaVersion(db);
    expect(version).toBe(0);
  });

  it('enables foreign keys', () => {
    createSchema(db);

    // Inserting quest_progress without a valid quest should fail
    db.run("INSERT INTO profiles (id, name) VALUES ('p1', 'Test')");

    expect(() => {
      db.run(
        "INSERT INTO quest_progress (profile_id, quest_id) VALUES ('p1', 'nonexistent')",
      );
    }).toThrow();
  });
});
