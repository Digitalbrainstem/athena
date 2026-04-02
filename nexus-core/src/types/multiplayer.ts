// Multiplayer types — LAN cooperative play
//
// SAFETY INVARIANTS:
// - Same-LAN only. No internet connections. No cloud relay.
// - No direct communication between players. Companion mediates ALL interaction.
// - No voice chat. No text chat. No image sharing.
// - No leaderboards. No player comparison. No competitive ranking.

// ---------------------------------------------------------------------------
// Session discovery & lifecycle
// ---------------------------------------------------------------------------

export interface LANSession {
  id: string;
  hostName: string;
  hostProfileId: string;
  playerCount: number;
  maxPlayers: number;
  questId?: string;
  questTitle?: string;
  createdAt: string;
}

export type SessionStatus = 'waiting' | 'active' | 'completed';

export interface MultiplayerSessionState {
  id: string;
  status: SessionStatus;
  hostProfileId: string;
  players: PlayerSessionState[];
  sharedQuest: SharedQuestState | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerSessionState {
  profileId: string;
  displayName: string;
  joinedAt: string;
  connected: boolean;
}

// ---------------------------------------------------------------------------
// Shared quest state
// ---------------------------------------------------------------------------

export interface SharedQuestState {
  questId: string;
  questTitle: string;
  currentStep: number;
  totalSteps: number;
  objectives: SharedObjective[];
  contributions: Record<string, string[]>;
  completedAt?: string;
}

export interface SharedObjective {
  index: number;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'active' | 'completed';
  screenReaderText: string;
}

// ---------------------------------------------------------------------------
// Multiplayer actions (sent over WebSocket)
// ---------------------------------------------------------------------------

export type MultiplayerMessageType =
  | 'join_request'
  | 'join_accepted'
  | 'join_rejected'
  | 'player_joined'
  | 'player_left'
  | 'session_state'
  | 'game_action'
  | 'quest_start'
  | 'quest_update'
  | 'quest_complete'
  | 'objective_claim'
  | 'objective_complete'
  | 'companion_announcement';

export interface MultiplayerMessage {
  type: MultiplayerMessageType;
  sessionId: string;
  senderId: string;
  timestamp: string;
  payload: unknown;
}

// --- Specific payloads ---

export interface JoinRequestPayload {
  profileId: string;
  displayName: string;
}

export interface JoinAcceptedPayload {
  sessionState: MultiplayerSessionState;
}

export interface JoinRejectedPayload {
  reason: string;
}

export interface PlayerJoinedPayload {
  profileId: string;
  displayName: string;
}

export interface PlayerLeftPayload {
  profileId: string;
}

export interface GameActionPayload {
  profileId: string;
  actionType: string;
  data: Record<string, unknown>;
}

export interface QuestStartPayload {
  questId: string;
  questTitle: string;
  objectives: SharedObjective[];
}

export interface QuestUpdatePayload {
  questState: SharedQuestState;
}

export interface ObjectiveClaimPayload {
  objectiveIndex: number;
  profileId: string;
}

export interface ObjectiveCompletePayload {
  objectiveIndex: number;
  profileId: string;
}

// ---------------------------------------------------------------------------
// Companion mediation
// ---------------------------------------------------------------------------

export type CompanionAnnouncementKind =
  | 'player_action'
  | 'collaboration_suggestion'
  | 'teamwork_celebration'
  | 'objective_assigned'
  | 'player_joined_narration'
  | 'player_left_narration'
  | 'quest_progress';

export interface CompanionAnnouncementPayload {
  kind: CompanionAnnouncementKind;
  message: string;
  screenReaderText: string;
  targetProfileId?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_PLAYERS_PER_SESSION = 4;
export const SESSION_BEACON_PORT = 5201;
export const SESSION_BEACON_INTERVAL_MS = 2000;
export const SESSION_TIMEOUT_MS = 30_000;
export const STATE_SYNC_INTERVAL_MS = 100;
