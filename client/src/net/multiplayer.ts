// Multiplayer manager — LAN cooperative play client
//
// SAFETY: Same-LAN only. No internet. No direct player communication.
// Companion mediates ALL interaction.

import type {
  LANSession,
  MultiplayerSessionState,
  MultiplayerMessage,
  MultiplayerMessageType,
  GameActionPayload,
  CompanionAnnouncementPayload,
  QuestUpdatePayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
} from '@nexus-academy/core';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface MultiplayerConfig {
  serverUrl: string;
  reconnectIntervalMs: number;
  heartbeatIntervalMs: number;
}

const DEFAULT_CONFIG: MultiplayerConfig = {
  serverUrl: 'http://localhost:5200',
  reconnectIntervalMs: 3000,
  heartbeatIntervalMs: 5000,
};

// ---------------------------------------------------------------------------
// Callback types
// ---------------------------------------------------------------------------

export type RemoteActionCallback = (playerId: string, action: GameActionPayload) => void;
export type QuestUpdateCallback = (update: QuestUpdatePayload) => void;
export type PlayerEventCallback = (payload: PlayerJoinedPayload | PlayerLeftPayload) => void;
export type SessionStateCallback = (state: MultiplayerSessionState) => void;
export type CompanionCallback = (announcement: CompanionAnnouncementPayload) => void;
export type ConnectionCallback = (connected: boolean) => void;

// ---------------------------------------------------------------------------
// MultiplayerManager
// ---------------------------------------------------------------------------

export class MultiplayerManager implements Disposable {
  private readonly config: MultiplayerConfig;
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private profileId: string | null = null;
  private disposed = false;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // Callbacks
  private onRemoteActionCb: RemoteActionCallback | null = null;
  private onQuestUpdateCb: QuestUpdateCallback | null = null;
  private onPlayerEventCb: PlayerEventCallback | null = null;
  private onSessionStateCb: SessionStateCallback | null = null;
  private onCompanionCb: CompanionCallback | null = null;
  private onConnectionCb: ConnectionCallback | null = null;

  constructor(config?: Partial<MultiplayerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.serverUrl = this.config.serverUrl.replace(/\/+$/, '');
  }

  // -- Discovery -----------------------------------------------------------

  async discoverSessions(signal?: AbortSignal): Promise<LANSession[]> {
    const res = await fetch(`${this.config.serverUrl}/api/multiplayer/sessions`, { signal });
    if (!res.ok) throw new Error(`Discovery failed: ${res.status}`);
    return res.json() as Promise<LANSession[]>;
  }

  // -- Session lifecycle ---------------------------------------------------

  async createSession(profileId: string, displayName: string, signal?: AbortSignal): Promise<MultiplayerSessionState> {
    const res = await fetch(`${this.config.serverUrl}/api/multiplayer/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, display_name: displayName }),
      signal,
    });
    if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
    const state = await res.json() as MultiplayerSessionState;
    this.sessionId = state.id;
    this.profileId = profileId;
    return state;
  }

  async joinSession(sessionId: string, profileId: string, displayName: string, signal?: AbortSignal): Promise<MultiplayerSessionState> {
    const res = await fetch(`${this.config.serverUrl}/api/multiplayer/sessions/${encodeURIComponent(sessionId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, display_name: displayName }),
      signal,
    });
    if (!res.ok) throw new Error(`Join session failed: ${res.status}`);
    const state = await res.json() as MultiplayerSessionState;
    this.sessionId = sessionId;
    this.profileId = profileId;
    return state;
  }

  async leaveSession(): Promise<void> {
    if (!this.sessionId || !this.profileId) return;
    this.disconnectWebSocket();
    try {
      await fetch(
        `${this.config.serverUrl}/api/multiplayer/sessions/${encodeURIComponent(this.sessionId)}/leave`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: this.profileId, display_name: '' }),
        },
      );
    } catch {
      // Best effort — we're leaving anyway
    }
    this.sessionId = null;
    this.profileId = null;
  }

  // -- WebSocket connection ------------------------------------------------

  connectWebSocket(): void {
    if (!this.sessionId || !this.profileId) return;
    const wsUrl = this.config.serverUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/api/multiplayer/ws/${encodeURIComponent(this.sessionId)}/${encodeURIComponent(this.profileId)}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.onConnectionCb?.(true);
      this.startHeartbeat();
    };

    this.ws.onclose = () => {
      this.onConnectionCb?.(false);
      this.stopHeartbeat();
    };

    this.ws.onerror = () => {
      this.onConnectionCb?.(false);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as MultiplayerMessage;
        this.handleMessage(msg);
      } catch {
        // Malformed message — ignore silently
      }
    };
  }

  private disconnectWebSocket(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // -- Sending actions -----------------------------------------------------

  sendAction(action: GameActionPayload): void {
    this.sendWsMessage('game_action', action);
  }

  async startSharedQuest(
    questId: string,
    questTitle: string,
    objectives: Array<{ description: string; screenReaderText: string }>,
    signal?: AbortSignal,
  ): Promise<MultiplayerSessionState | null> {
    if (!this.sessionId) return null;
    const res = await fetch(
      `${this.config.serverUrl}/api/multiplayer/sessions/${encodeURIComponent(this.sessionId)}/quest`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quest_id: questId,
          quest_title: questTitle,
          objectives,
        }),
        signal,
      },
    );
    if (!res.ok) return null;
    return res.json() as Promise<MultiplayerSessionState>;
  }

  async claimObjective(objectiveIndex: number, signal?: AbortSignal): Promise<boolean> {
    if (!this.sessionId || !this.profileId) return false;
    const res = await fetch(
      `${this.config.serverUrl}/api/multiplayer/sessions/${encodeURIComponent(this.sessionId)}/objectives/claim`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective_index: objectiveIndex, profile_id: this.profileId }),
        signal,
      },
    );
    return res.ok;
  }

  async completeObjective(objectiveIndex: number, signal?: AbortSignal): Promise<boolean> {
    if (!this.sessionId || !this.profileId) return false;
    const res = await fetch(
      `${this.config.serverUrl}/api/multiplayer/sessions/${encodeURIComponent(this.sessionId)}/objectives/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective_index: objectiveIndex, profile_id: this.profileId }),
        signal,
      },
    );
    return res.ok;
  }

  // -- Callbacks -----------------------------------------------------------

  onRemoteAction(cb: RemoteActionCallback): void { this.onRemoteActionCb = cb; }
  onQuestUpdate(cb: QuestUpdateCallback): void { this.onQuestUpdateCb = cb; }
  onPlayerEvent(cb: PlayerEventCallback): void { this.onPlayerEventCb = cb; }
  onSessionState(cb: SessionStateCallback): void { this.onSessionStateCb = cb; }
  onCompanionAnnouncement(cb: CompanionCallback): void { this.onCompanionCb = cb; }
  onConnection(cb: ConnectionCallback): void { this.onConnectionCb = cb; }

  // -- Getters -------------------------------------------------------------

  get currentSessionId(): string | null { return this.sessionId; }
  get currentProfileId(): string | null { return this.profileId; }
  get isConnected(): boolean { return this.ws?.readyState === WebSocket.OPEN; }

  // -- Disposal ------------------------------------------------------------

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.disconnectWebSocket();
    this.sessionId = null;
    this.profileId = null;
  }

  // -- Internal ------------------------------------------------------------

  private sendWsMessage(type: MultiplayerMessageType, payload: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN || !this.sessionId || !this.profileId) return;
    this.ws.send(JSON.stringify({
      type,
      sessionId: this.sessionId,
      senderId: this.profileId,
      timestamp: new Date().toISOString(),
      payload,
    }));
  }

  private handleMessage(msg: MultiplayerMessage): void {
    switch (msg.type) {
      case 'session_state':
        this.onSessionStateCb?.(msg.payload as MultiplayerSessionState);
        break;
      case 'game_action': {
        const action = msg.payload as GameActionPayload;
        this.onRemoteActionCb?.(msg.senderId, action);
        break;
      }
      case 'quest_start':
      case 'quest_update':
        this.onQuestUpdateCb?.(msg.payload as QuestUpdatePayload);
        break;
      case 'quest_complete':
        this.onQuestUpdateCb?.(msg.payload as QuestUpdatePayload);
        break;
      case 'player_joined':
        this.onPlayerEventCb?.(msg.payload as PlayerJoinedPayload);
        break;
      case 'player_left':
        this.onPlayerEventCb?.(msg.payload as PlayerLeftPayload);
        break;
      case 'companion_announcement':
        this.onCompanionCb?.(msg.payload as CompanionAnnouncementPayload);
        break;
      case 'objective_claim':
      case 'objective_complete':
        // These trigger quest_update which is handled above
        break;
      default:
        break;
    }
  }
}
