import { describe, it, expect, vi, afterEach } from 'vitest';
import { MultiplayerManager } from '../../src/net/multiplayer.js';

// ---------------------------------------------------------------------------
// Mock fetch helper
// ---------------------------------------------------------------------------

function mockFetch(status: number, body: unknown = null): ReturnType<typeof vi.fn> {
  const headers = new Map<string, string>();
  if (body === null) headers.set('content-length', '0');
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    headers: { get: (k: string) => headers.get(k) ?? null },
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  sent: string[] = [];

  constructor(public url: string) {
    // Simulate connection opening on next tick
    setTimeout(() => { this.onopen?.(new Event('open')); }, 0);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MultiplayerManager', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function createManager(): MultiplayerManager {
    return new MultiplayerManager({
      serverUrl: 'http://test:5200',
      reconnectIntervalMs: 100,
      heartbeatIntervalMs: 60000,
    });
  }

  // -- Discovery -----------------------------------------------------------

  describe('discoverSessions', () => {
    it('fetches sessions from the server', async () => {
      const sessions = [
        { id: 's1', hostName: 'Alex', playerCount: 1, maxPlayers: 4 },
      ];
      const f = mockFetch(200, sessions);
      const mgr = createManager();
      const result = await mgr.discoverSessions();
      expect(f).toHaveBeenCalledWith(
        'http://test:5200/api/multiplayer/sessions',
        expect.objectContaining({}),
      );
      expect(result).toEqual(sessions);
      mgr.dispose();
    });

    it('throws on server error', async () => {
      mockFetch(500);
      const mgr = createManager();
      await expect(mgr.discoverSessions()).rejects.toThrow('Discovery failed');
      mgr.dispose();
    });
  });

  // -- Session lifecycle ---------------------------------------------------

  describe('createSession', () => {
    it('creates a session and stores IDs', async () => {
      const state = {
        id: 'sess-1',
        status: 'waiting',
        hostProfileId: 'host-1',
        players: [{ profileId: 'host-1', displayName: 'Alex', joinedAt: '', connected: true }],
        sharedQuest: null,
      };
      mockFetch(201, state);
      const mgr = createManager();
      const result = await mgr.createSession('host-1', 'Alex');
      expect(result.id).toBe('sess-1');
      expect(mgr.currentSessionId).toBe('sess-1');
      expect(mgr.currentProfileId).toBe('host-1');
      mgr.dispose();
    });
  });

  describe('joinSession', () => {
    it('joins an existing session', async () => {
      const state = {
        id: 'sess-1',
        status: 'waiting',
        hostProfileId: 'host-1',
        players: [
          { profileId: 'host-1', displayName: 'Alex', joinedAt: '', connected: true },
          { profileId: 'p2', displayName: 'Maya', joinedAt: '', connected: true },
        ],
        sharedQuest: null,
      };
      mockFetch(200, state);
      const mgr = createManager();
      const result = await mgr.joinSession('sess-1', 'p2', 'Maya');
      expect(result.players).toHaveLength(2);
      expect(mgr.currentSessionId).toBe('sess-1');
      expect(mgr.currentProfileId).toBe('p2');
      mgr.dispose();
    });
  });

  describe('leaveSession', () => {
    it('leaves the session and clears state', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'host-1', players: [], sharedQuest: null };
      const f = mockFetch(200, state);
      const mgr = createManager();

      // First set up the session
      await mgr.createSession('host-1', 'Alex');
      f.mockResolvedValue({
        ok: true, status: 200, statusText: 'OK',
        json: () => Promise.resolve({ status: 'ok' }),
        headers: { get: () => null },
      });

      await mgr.leaveSession();
      expect(mgr.currentSessionId).toBeNull();
      expect(mgr.currentProfileId).toBeNull();
      mgr.dispose();
    });

    it('is safe to call without a session', async () => {
      const mgr = createManager();
      await mgr.leaveSession(); // Should not throw
      mgr.dispose();
    });
  });

  // -- Shared quest --------------------------------------------------------

  describe('startSharedQuest', () => {
    it('starts a quest via REST', async () => {
      const sessionState = { id: 'sess-1', status: 'waiting', hostProfileId: 'host-1', players: [], sharedQuest: null };
      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true, status: 201, json: () => Promise.resolve(sessionState),
            headers: { get: () => null },
          });
        }
        return Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({ ...sessionState, status: 'active', sharedQuest: { questId: 'q1' } }),
          headers: { get: () => null },
        });
      }));

      const mgr = createManager();
      await mgr.createSession('host-1', 'Alex');
      const result = await mgr.startSharedQuest('q1', 'Bridge', [
        { description: 'Build arch', screenReaderText: 'Build arch' },
      ]);
      expect(result).not.toBeNull();
      mgr.dispose();
    });

    it('returns null without an active session', async () => {
      const mgr = createManager();
      const result = await mgr.startSharedQuest('q1', 'Test', []);
      expect(result).toBeNull();
      mgr.dispose();
    });
  });

  // -- Objectives ----------------------------------------------------------

  describe('claimObjective', () => {
    it('returns false without a session', async () => {
      const mgr = createManager();
      const result = await mgr.claimObjective(0);
      expect(result).toBe(false);
      mgr.dispose();
    });
  });

  describe('completeObjective', () => {
    it('returns false without a session', async () => {
      const mgr = createManager();
      const result = await mgr.completeObjective(0);
      expect(result).toBe(false);
      mgr.dispose();
    });
  });

  // -- WebSocket -----------------------------------------------------------

  describe('WebSocket connection', () => {
    it('constructs correct WebSocket URL', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      let capturedUrl = '';
      vi.stubGlobal('WebSocket', class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          capturedUrl = url;
        }
      });

      const mgr = createManager();
      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      expect(capturedUrl).toBe('ws://test:5200/api/multiplayer/ws/sess-1/h');
      mgr.dispose();
    });

    it('does nothing without a session', () => {
      const mgr = createManager();
      mgr.connectWebSocket(); // Should not throw
      expect(mgr.isConnected).toBe(false);
      mgr.dispose();
    });
  });

  // -- Callbacks -----------------------------------------------------------

  describe('callbacks', () => {
    it('invokes onRemoteAction for game_action messages', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      let wsInstance: MockWebSocket | null = null;
      vi.stubGlobal('WebSocket', class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          wsInstance = this;
        }
      });

      const mgr = createManager();
      const actions: Array<{ pid: string; action: unknown }> = [];
      mgr.onRemoteAction((pid, action) => actions.push({ pid, action }));

      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();

      await new Promise((r) => setTimeout(r, 10));

      wsInstance!.simulateMessage({
        type: 'game_action',
        sessionId: 'sess-1',
        senderId: 'p2',
        timestamp: '',
        payload: { profileId: 'p2', actionType: 'build', data: {} },
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.pid).toBe('p2');
      mgr.dispose();
    });

    it('invokes onPlayerEvent for player_joined messages', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      let wsInstance: MockWebSocket | null = null;
      vi.stubGlobal('WebSocket', class extends MockWebSocket {
        constructor(url: string) { super(url); wsInstance = this; }
      });

      const events: unknown[] = [];
      const mgr = createManager();
      mgr.onPlayerEvent((payload) => events.push(payload));

      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      await new Promise((r) => setTimeout(r, 10));

      wsInstance!.simulateMessage({
        type: 'player_joined',
        sessionId: 'sess-1',
        senderId: 'server',
        timestamp: '',
        payload: { profileId: 'p2', displayName: 'Maya' },
      });

      expect(events).toHaveLength(1);
      mgr.dispose();
    });

    it('invokes onQuestUpdate for quest messages', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      let wsInstance: MockWebSocket | null = null;
      vi.stubGlobal('WebSocket', class extends MockWebSocket {
        constructor(url: string) { super(url); wsInstance = this; }
      });

      const updates: unknown[] = [];
      const mgr = createManager();
      mgr.onQuestUpdate((update) => updates.push(update));

      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      await new Promise((r) => setTimeout(r, 10));

      wsInstance!.simulateMessage({
        type: 'quest_update',
        sessionId: 'sess-1',
        senderId: 'server',
        timestamp: '',
        payload: { questState: { questId: 'q1' } },
      });

      expect(updates).toHaveLength(1);
      mgr.dispose();
    });

    it('invokes onConnection callback', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      vi.stubGlobal('WebSocket', MockWebSocket);

      const statuses: boolean[] = [];
      const mgr = createManager();
      mgr.onConnection((connected) => statuses.push(connected));

      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      await new Promise((r) => setTimeout(r, 10));

      expect(statuses).toContain(true);
      mgr.dispose();
    });
  });

  // -- sendAction ----------------------------------------------------------

  describe('sendAction', () => {
    it('sends game_action over WebSocket', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);

      let wsInstance: MockWebSocket | null = null;
      vi.stubGlobal('WebSocket', class extends MockWebSocket {
        constructor(url: string) { super(url); wsInstance = this; }
      });

      const mgr = createManager();
      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      await new Promise((r) => setTimeout(r, 10));

      mgr.sendAction({ profileId: 'h', actionType: 'build', data: { x: 1, y: 2 } });
      expect(wsInstance!.sent).toHaveLength(1);
      const parsed = JSON.parse(wsInstance!.sent[0]!);
      expect(parsed.type).toBe('game_action');
      expect(parsed.payload.actionType).toBe('build');
      mgr.dispose();
    });

    it('does nothing when not connected', () => {
      const mgr = createManager();
      mgr.sendAction({ profileId: 'h', actionType: 'build', data: {} });
      // Should not throw
      mgr.dispose();
    });
  });

  // -- Disposal ------------------------------------------------------------

  describe('dispose', () => {
    it('cleans up resources', async () => {
      const state = { id: 'sess-1', status: 'waiting', hostProfileId: 'h', players: [], sharedQuest: null };
      mockFetch(201, state);
      vi.stubGlobal('WebSocket', MockWebSocket);

      const mgr = createManager();
      await mgr.createSession('h', 'A');
      mgr.connectWebSocket();
      mgr.dispose();
      expect(mgr.currentSessionId).toBeNull();
      expect(mgr.isConnected).toBe(false);
    });

    it('is safe to call twice', () => {
      const mgr = createManager();
      mgr.dispose();
      mgr.dispose(); // Should not throw
    });
  });

  // -- Safety invariants ---------------------------------------------------

  describe('Safety Invariants', () => {
    it('no direct messaging methods exist', () => {
      const mgr = createManager();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(mgr));
      for (const m of methods) {
        expect(m.toLowerCase()).not.toContain('chat');
        expect(m.toLowerCase()).not.toContain('sendtext');
        expect(m.toLowerCase()).not.toContain('sendvoice');
        expect(m.toLowerCase()).not.toContain('sendimage');
      }
      mgr.dispose();
    });
  });
});
