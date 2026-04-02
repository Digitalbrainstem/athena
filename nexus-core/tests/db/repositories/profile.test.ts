import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../../src/db/connection.js';
import { createSchema } from '../../../src/db/schema.js';
import { ProfileRepository } from '../../../src/db/repositories/profile.js';

describe('ProfileRepository', () => {
  let db: DatabaseConnection;
  let repo: ProfileRepository;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
    createSchema(db);
    repo = new ProfileRepository(db);
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('creates a profile', () => {
    const profile = repo.create({ name: 'Alice' });
    expect(profile.name).toBe('Alice');
    expect(profile.id).toBeTruthy();
    expect(profile.masteryTier).toBe('foundation');
    expect(profile.createdAt).toBeTruthy();
  });

  it('creates a profile with custom ID', () => {
    const profile = repo.create({ id: 'custom-id', name: 'Bob' });
    expect(profile.id).toBe('custom-id');
  });

  it('creates companion and world state alongside profile', () => {
    const profile = repo.create({ name: 'Charlie' });

    const companion = db.queryOne<{ profile_id: string }>(
      'SELECT * FROM companions WHERE profile_id = ?',
      [profile.id],
    );
    expect(companion).toBeDefined();

    const worldState = db.queryOne<{ profile_id: string }>(
      'SELECT * FROM world_state WHERE profile_id = ?',
      [profile.id],
    );
    expect(worldState).toBeDefined();
  });

  it('gets a profile by ID', () => {
    const created = repo.create({ name: 'Dana' });
    const fetched = repo.getById(created.id);

    expect(fetched).toBeDefined();
    expect(fetched!.name).toBe('Dana');
    expect(fetched!.id).toBe(created.id);
  });

  it('returns undefined for non-existent profile', () => {
    expect(repo.getById('nonexistent')).toBeUndefined();
  });

  it('updates a profile', () => {
    const profile = repo.create({ name: 'Eve' });
    const updated = repo.update(profile.id, { name: 'Eve Updated', masteryTier: 'discovery' });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe('Eve Updated');
    expect(updated!.masteryTier).toBe('discovery');
  });

  it('update with empty changes returns current profile', () => {
    const profile = repo.create({ name: 'Test' });
    const result = repo.update(profile.id, {});
    expect(result!.name).toBe('Test');
  });

  it('lists profiles', () => {
    repo.create({ name: 'A' });
    repo.create({ name: 'B' });
    repo.create({ name: 'C' });

    const list = repo.list();
    expect(list).toHaveLength(3);
  });

  it('lists with pagination', () => {
    for (let i = 0; i < 10; i++) {
      repo.create({ name: `User ${i}` });
    }

    const page1 = repo.list(3, 0);
    expect(page1).toHaveLength(3);

    const page2 = repo.list(3, 3);
    expect(page2).toHaveLength(3);
  });

  it('deletes a profile', () => {
    const profile = repo.create({ name: 'ToDelete' });
    expect(repo.delete(profile.id)).toBe(true);
    expect(repo.getById(profile.id)).toBeUndefined();
  });

  it('returns false when deleting non-existent profile', () => {
    expect(repo.delete('nonexistent')).toBe(false);
  });

  it('updates last active timestamp', () => {
    const profile = repo.create({ name: 'Active' });
    repo.updateLastActive(profile.id);

    const updated = repo.getById(profile.id);
    expect(updated!.lastActive).toBeTruthy();
  });

  it('counts profiles', () => {
    expect(repo.count()).toBe(0);
    repo.create({ name: 'One' });
    repo.create({ name: 'Two' });
    expect(repo.count()).toBe(2);
  });

  it('handles settings JSON', () => {
    const profile = repo.create({
      name: 'Settings User',
      settings: { theme: 'dark', volume: 0.8 },
    });

    const fetched = repo.getById(profile.id);
    expect(fetched!.settings).toEqual({ theme: 'dark', volume: 0.8 });
  });

  it('handles optional fields', () => {
    const profile = repo.create({
      name: 'Minimal',
      birthDate: '2020-01-15',
      avatarData: 'avatar:robot',
    });

    const fetched = repo.getById(profile.id);
    expect(fetched!.birthDate).toBe('2020-01-15');
    expect(fetched!.avatarData).toBe('avatar:robot');
  });
});
