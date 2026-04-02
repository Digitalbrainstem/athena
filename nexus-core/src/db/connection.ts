// sql.js database manager — platform-agnostic SQLite via WASM

import type initSqlJs from 'sql.js';
import type { Database as SqlDatabase } from 'sql.js';

// Re-export types we use from sql.js
type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type Database = SqlDatabase;

export interface DatabaseConfig {
  /** URL or path to the sql.js WASM binary */
  wasmUrl?: string;
  /** Existing database data to load */
  data?: Uint8Array;
}

export class DatabaseConnection {
  private db: Database | null = null;
  private sqlJs: SqlJsStatic | null = null;

  get isOpen(): boolean {
    return this.db !== null;
  }

  /** Initialize sql.js and optionally load existing data */
  async open(config: DatabaseConfig = {}): Promise<void> {
    if (this.db) {
      throw new Error('Database already open');
    }

    // Dynamic import sql.js
    const sqlJsModule = await import('sql.js');
    const initFn = sqlJsModule.default;

    const initConfig: Record<string, unknown> = {};
    if (config.wasmUrl) {
      initConfig['locateFile'] = () => config.wasmUrl;
    }

    this.sqlJs = await initFn(initConfig);

    if (config.data) {
      this.db = new this.sqlJs.Database(config.data);
    } else {
      this.db = new this.sqlJs.Database();
    }

    // sql.js runs entirely in-memory — WAL mode is not applicable.
    // The journal_mode pragma is a no-op for in-memory databases.
    // We intentionally skip it to avoid misleading configuration.
    this.exec('PRAGMA foreign_keys = ON');
  }

  /** Execute SQL that returns no results */
  exec(sql: string): void {
    this.ensureOpen();
    this.db!.run(sql);
  }

  /** Run a parameterized query that returns no results */
  run(sql: string, params?: (string | number | null | Uint8Array)[]): void {
    this.ensureOpen();
    this.db!.run(sql, params);
  }

  /** Execute a query and return all result rows as objects */
  query<T>(
    sql: string,
    params?: (string | number | null | Uint8Array)[],
  ): T[] {
    this.ensureOpen();
    const stmt = this.db!.prepare(sql);
    if (params) {
      stmt.bind(params);
    }
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  /** Execute a query and return the first result row */
  queryOne<T>(
    sql: string,
    params?: (string | number | null | Uint8Array)[],
  ): T | undefined {
    const results = this.query<T>(sql, params);
    return results[0];
  }

  /** Execute multiple statements in a transaction */
  transaction(fn: () => void): void {
    this.ensureOpen();
    this.exec('BEGIN TRANSACTION');
    try {
      fn();
      this.exec('COMMIT');
    } catch (err) {
      this.exec('ROLLBACK');
      throw err;
    }
  }

  /** Export the database as a Uint8Array */
  export(): Uint8Array {
    this.ensureOpen();
    return this.db!.export();
  }

  /** Close the database and free resources */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.sqlJs = null;
  }

  /** Get the number of rows changed by the last operation */
  getRowsModified(): number {
    this.ensureOpen();
    return this.db!.getRowsModified();
  }

  private ensureOpen(): void {
    if (!this.db) {
      throw new Error('Database not open. Call open() first.');
    }
  }
}
