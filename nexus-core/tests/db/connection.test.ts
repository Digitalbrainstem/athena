import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../../src/db/connection.js';

describe('DatabaseConnection', () => {
  let db: DatabaseConnection;

  beforeEach(async () => {
    db = new DatabaseConnection();
    await db.open();
  });

  afterEach(() => {
    if (db.isOpen) db.close();
  });

  it('opens and reports isOpen', () => {
    expect(db.isOpen).toBe(true);
  });

  it('throws when opening already-open database', async () => {
    await expect(db.open()).rejects.toThrow('Database already open');
  });

  it('throws when querying closed database', () => {
    db.close();
    expect(() => db.exec('SELECT 1')).toThrow('Database not open');
  });

  it('executes SQL statements', () => {
    db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');
    db.run('INSERT INTO test (value) VALUES (?)', ['hello']);

    const rows = db.query<{ id: number; value: string }>('SELECT * FROM test');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.value).toBe('hello');
  });

  it('runs parameterized queries', () => {
    db.exec('CREATE TABLE items (name TEXT, count INTEGER)');
    db.run('INSERT INTO items VALUES (?, ?)', ['apple', 5]);
    db.run('INSERT INTO items VALUES (?, ?)', ['banana', 3]);

    const rows = db.query<{ name: string; count: number }>(
      'SELECT * FROM items WHERE count > ?',
      [4],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.name).toBe('apple');
  });

  it('queryOne returns first result', () => {
    db.exec('CREATE TABLE nums (n INTEGER)');
    db.run('INSERT INTO nums VALUES (?)', [1]);
    db.run('INSERT INTO nums VALUES (?)', [2]);

    const result = db.queryOne<{ n: number }>('SELECT * FROM nums ORDER BY n');
    expect(result).toBeDefined();
    expect(result!.n).toBe(1);
  });

  it('queryOne returns undefined for no results', () => {
    db.exec('CREATE TABLE empty_table (id INTEGER)');
    const result = db.queryOne<{ id: number }>('SELECT * FROM empty_table');
    expect(result).toBeUndefined();
  });

  it('handles transactions', () => {
    db.exec('CREATE TABLE tx_test (id INTEGER PRIMARY KEY, val TEXT)');

    db.transaction(() => {
      db.run('INSERT INTO tx_test VALUES (1, ?)', ['a']);
      db.run('INSERT INTO tx_test VALUES (2, ?)', ['b']);
    });

    const rows = db.query('SELECT * FROM tx_test');
    expect(rows).toHaveLength(2);
  });

  it('rolls back failed transactions', () => {
    db.exec('CREATE TABLE tx_test2 (id INTEGER PRIMARY KEY, val TEXT)');
    db.run('INSERT INTO tx_test2 VALUES (1, ?)', ['existing']);

    expect(() => {
      db.transaction(() => {
        db.run('INSERT INTO tx_test2 VALUES (2, ?)', ['new']);
        // This should fail — duplicate primary key
        db.run('INSERT INTO tx_test2 VALUES (1, ?)', ['duplicate']);
      });
    }).toThrow();

    // Only the original row should exist
    const rows = db.query('SELECT * FROM tx_test2');
    expect(rows).toHaveLength(1);
  });

  it('exports and imports database', async () => {
    db.exec('CREATE TABLE export_test (msg TEXT)');
    db.run('INSERT INTO export_test VALUES (?)', ['hello world']);

    const exported = db.export();
    expect(exported).toBeInstanceOf(Uint8Array);
    expect(exported.length).toBeGreaterThan(0);

    db.close();

    // Open with exported data
    const db2 = new DatabaseConnection();
    await db2.open({ data: exported });

    const rows = db2.query<{ msg: string }>('SELECT * FROM export_test');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.msg).toBe('hello world');

    db2.close();

    // Reopen the original
    await db.open();
  });

  it('tracks rows modified', () => {
    db.exec('CREATE TABLE mod_test (id INTEGER PRIMARY KEY, val TEXT)');
    db.run('INSERT INTO mod_test VALUES (1, ?)', ['a']);
    db.run('INSERT INTO mod_test VALUES (2, ?)', ['b']);
    db.run('INSERT INTO mod_test VALUES (3, ?)', ['c']);

    db.run('DELETE FROM mod_test WHERE id > ?', [1]);
    expect(db.getRowsModified()).toBe(2);
  });

  it('closes and cleans up', () => {
    expect(db.isOpen).toBe(true);
    db.close();
    expect(db.isOpen).toBe(false);
  });

  it('handles null parameters', () => {
    db.exec('CREATE TABLE nullable (id INTEGER, val TEXT)');
    db.run('INSERT INTO nullable VALUES (?, ?)', [1, null]);

    const row = db.queryOne<{ id: number; val: string | null }>('SELECT * FROM nullable');
    expect(row!.val).toBeNull();
  });
});
