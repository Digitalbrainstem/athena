// Environment configuration — all external settings come through here.
// Values are read from Vite environment variables at build time.

export interface ClientConfig {
  /** Base URL for the game API server */
  apiUrl: string;
  /** WebSocket URL for real-time events (optional) */
  wsUrl: string | undefined;
  /** Enable debug overlays and verbose logging */
  debug: boolean;
  /** Path to sql.js WASM binary */
  sqliteWasmUrl: string | undefined;
}

export const CONFIG: Readonly<ClientConfig> = Object.freeze({
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5200',
  wsUrl: import.meta.env.VITE_WS_URL as string | undefined,
  debug: import.meta.env.DEV === true,
  sqliteWasmUrl: import.meta.env.VITE_SQLITE_WASM_URL as string | undefined,
});
