// Type declarations for sql.js

declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: DatabaseConstructor;
  }

  export interface DatabaseConstructor {
    new (): Database;
    new (data: ArrayLike<number> | Buffer | null): Database;
  }

  export interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
  }

  export interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    get(): unknown[];
    free(): boolean;
    reset(): void;
  }

  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  interface InitSqlJsOptions {
    locateFile?: (file: string) => string;
    [key: string]: unknown;
  }

  export default function initSqlJs(options?: InitSqlJsOptions): Promise<SqlJsStatic>;
}
