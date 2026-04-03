/**
 * Debug Bridge — pipes browser console logs to a local WebSocket server
 * so the developer can read them from the terminal in real-time.
 * 
 * Only active in dev mode (?debug=true or import.meta.env.DEV).
 * Zero overhead in production — the entire module is tree-shaken out.
 */

const BRIDGE_PORT = 9222;
const BRIDGE_HOST = location.hostname; // Use same host as the game server
const BRIDGE_URL = `ws://${BRIDGE_HOST}:${BRIDGE_PORT}`;

let socket: WebSocket | null = null;
let queue: string[] = [];
let connected = false;

function send(msg: string): void {
  if (connected && socket?.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    queue.push(msg);
  }
}

export function initDebugBridge(): void {
  if (!import.meta.env.DEV) return;
  
  try {
    socket = new WebSocket(BRIDGE_URL);
    
    socket.onopen = () => {
      connected = true;
      // Flush queued messages
      for (const msg of queue) socket!.send(msg);
      queue = [];
      send(JSON.stringify({ type: 'connected', userAgent: navigator.userAgent, url: location.href }));
    };
    
    socket.onclose = () => { connected = false; };
    socket.onerror = () => { connected = false; };
    
    // Intercept console methods
    const origLog = console.log.bind(console);
    const origWarn = console.warn.bind(console);
    const origError = console.error.bind(console);
    
    console.log = (...args: unknown[]) => {
      origLog(...args);
      send(JSON.stringify({ type: 'log', args: args.map(stringify) }));
    };
    
    console.warn = (...args: unknown[]) => {
      origWarn(...args);
      send(JSON.stringify({ type: 'warn', args: args.map(stringify) }));
    };
    
    console.error = (...args: unknown[]) => {
      origError(...args);
      send(JSON.stringify({ type: 'error', args: args.map(stringify) }));
    };
    
    // Capture unhandled errors
    window.addEventListener('error', (e) => {
      send(JSON.stringify({ type: 'error', args: [`Uncaught: ${e.message} at ${e.filename}:${e.lineno}`] }));
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      send(JSON.stringify({ type: 'error', args: [`Unhandled rejection: ${e.reason}`] }));
    });
    
  } catch {
    // Bridge not available — silent fail, no impact on game
  }
}

function stringify(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try { return JSON.stringify(val, null, 0); } catch { return String(val); }
}
