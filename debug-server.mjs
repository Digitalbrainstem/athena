/**
 * Debug Bridge Server — receives browser console logs via WebSocket.
 * Run: node debug-server.mjs
 * Listens on port 9222.
 */

import { WebSocketServer } from 'ws';

const PORT = 9222;
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

const COLORS = {
  log:   '\x1b[37m',   // white
  warn:  '\x1b[33m',   // yellow
  error: '\x1b[31m',   // red
  connected: '\x1b[32m', // green
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

console.log(`\x1b[36m[debug-bridge]\x1b[0m Listening on ws://localhost:${PORT}`);
console.log(`\x1b[36m[debug-bridge]\x1b[0m Waiting for browser to connect...\n`);

wss.on('connection', (ws) => {
  console.log(`\x1b[32m[debug-bridge] Browser connected!\x1b[0m\n`);
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const color = COLORS[msg.type] ?? COLORS.log;
      const time = new Date().toLocaleTimeString();
      
      if (msg.type === 'connected') {
        console.log(`${COLORS.connected}[CONNECTED]${RESET} ${msg.url}`);
        console.log(`${DIM}${msg.userAgent}${RESET}\n`);
        return;
      }
      
      const text = (msg.args || []).join(' ');
      // Strip CSS color formatting from debug.ts output
      const clean = text.replace(/%c/g, '').replace(/color:.*?;.*?bold/g, '').trim();
      
      console.log(`${DIM}${time}${RESET} ${color}[${msg.type}]${RESET} ${clean}`);
    } catch {
      console.log(`[raw] ${data.toString()}`);
    }
  });
  
  ws.on('close', () => {
    console.log(`\n\x1b[33m[debug-bridge] Browser disconnected\x1b[0m`);
  });
});
