// Multiplayer system — companion-mediated cooperative play
//
// This system manages shared quest state and companion mediation for
// LAN cooperative multiplayer. It ensures ALL player interaction is
// mediated through the companion — no direct communication ever.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  MultiplayerSessionState,
  SharedQuestState,
  SharedObjective,
  PlayerSessionState,
  CompanionAnnouncementPayload,
  MultiplayerMessage,
  MultiplayerMessageType,
  GameActionPayload,
  ObjectiveClaimPayload,
  ObjectiveCompletePayload,
  QuestStartPayload,
} from '../types/multiplayer.js';
import {
  MAX_PLAYERS_PER_SESSION,
} from '../types/multiplayer.js';

// ---------------------------------------------------------------------------
// Companion mediation templates
// ---------------------------------------------------------------------------

const PLAYER_ACTION_TEMPLATES = [
  '{name} just completed their part! Great progress.',
  '{name} finished building their section. The team is getting closer!',
  '{name} made a breakthrough — keep going, everyone!',
];

const COLLABORATION_TEMPLATES = [
  'This next part might go faster if someone helps with {task}.',
  "There's still work to be done on {task}. Who wants to tackle it?",
  '{task} needs attention — working together makes it easier!',
];

const CELEBRATION_TEMPLATES = [
  'Amazing teamwork! Everyone contributed to solving this.',
  'You all brought different skills together — that\'s real teamwork!',
  'Great job, team! Each of you played an important part.',
];

function pickTemplate(templates: readonly string[]): string {
  return templates[Math.floor(Math.random() * templates.length)] ?? templates[0]!;
}

// ---------------------------------------------------------------------------
// Companion mediation engine
// ---------------------------------------------------------------------------

export function announcePlayerAction(playerName: string, _action: string): CompanionAnnouncementPayload {
  const message = pickTemplate(PLAYER_ACTION_TEMPLATES).replace('{name}', playerName);
  return {
    kind: 'player_action',
    message,
    screenReaderText: message,
  };
}

export function suggestCollaboration(task: string): CompanionAnnouncementPayload {
  const message = pickTemplate(COLLABORATION_TEMPLATES).replace('{task}', task);
  return {
    kind: 'collaboration_suggestion',
    message,
    screenReaderText: message,
  };
}

export function celebrateTeamwork(_achievement: string): CompanionAnnouncementPayload {
  const message = pickTemplate(CELEBRATION_TEMPLATES);
  return {
    kind: 'teamwork_celebration',
    message,
    screenReaderText: message,
  };
}

export function announcePlayerJoined(playerName: string): CompanionAnnouncementPayload {
  const message = `${playerName} has joined the adventure! Welcome!`;
  return {
    kind: 'player_joined_narration',
    message,
    screenReaderText: `${playerName} joined the session`,
  };
}

export function announcePlayerLeft(playerName: string): CompanionAnnouncementPayload {
  const message = `${playerName} had to head out. We can keep going!`;
  return {
    kind: 'player_left_narration',
    message,
    screenReaderText: `${playerName} left the session`,
  };
}

export function announceObjectiveAssigned(playerName: string, objectiveDesc: string): CompanionAnnouncementPayload {
  const message = `${playerName}, how about you handle this: ${objectiveDesc}`;
  return {
    kind: 'objective_assigned',
    message,
    screenReaderText: `${playerName} assigned to: ${objectiveDesc}`,
  };
}

export function announceQuestProgress(completedCount: number, totalCount: number): CompanionAnnouncementPayload {
  const message = `The team has completed ${completedCount} of ${totalCount} objectives. Keep it up!`;
  return {
    kind: 'quest_progress',
    message,
    screenReaderText: `${completedCount} of ${totalCount} objectives completed`,
  };
}

// ---------------------------------------------------------------------------
// Session state management (pure, no I/O)
// ---------------------------------------------------------------------------

export function createSessionState(
  sessionId: string,
  hostProfileId: string,
  hostDisplayName: string,
  now: string,
): MultiplayerSessionState {
  return {
    id: sessionId,
    status: 'waiting',
    hostProfileId,
    players: [
      {
        profileId: hostProfileId,
        displayName: hostDisplayName,
        joinedAt: now,
        connected: true,
      },
    ],
    sharedQuest: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function canJoinSession(session: MultiplayerSessionState): { allowed: boolean; reason?: string } {
  if (session.players.length >= MAX_PLAYERS_PER_SESSION) {
    return { allowed: false, reason: 'Session is full' };
  }
  if (session.status === 'completed') {
    return { allowed: false, reason: 'Session has ended' };
  }
  return { allowed: true };
}

export function addPlayerToSession(
  session: MultiplayerSessionState,
  profileId: string,
  displayName: string,
  now: string,
): MultiplayerSessionState {
  const check = canJoinSession(session);
  if (!check.allowed) return session;

  if (session.players.some((p) => p.profileId === profileId)) {
    // Already in session — mark reconnected
    return {
      ...session,
      players: session.players.map((p) =>
        p.profileId === profileId ? { ...p, connected: true } : p,
      ),
      updatedAt: now,
    };
  }

  return {
    ...session,
    players: [
      ...session.players,
      { profileId, displayName, joinedAt: now, connected: true },
    ],
    updatedAt: now,
  };
}

export function removePlayerFromSession(
  session: MultiplayerSessionState,
  profileId: string,
  now: string,
): MultiplayerSessionState {
  return {
    ...session,
    players: session.players.map((p) =>
      p.profileId === profileId ? { ...p, connected: false } : p,
    ),
    updatedAt: now,
  };
}

export function getConnectedPlayers(session: MultiplayerSessionState): PlayerSessionState[] {
  return session.players.filter((p) => p.connected);
}

export function isSessionEmpty(session: MultiplayerSessionState): boolean {
  return getConnectedPlayers(session).length === 0;
}

// ---------------------------------------------------------------------------
// Shared quest management (pure, no I/O)
// ---------------------------------------------------------------------------

export function startSharedQuest(
  session: MultiplayerSessionState,
  questId: string,
  questTitle: string,
  objectives: Array<{ description: string; screenReaderText: string }>,
  now: string,
): MultiplayerSessionState {
  const sharedObjectives: SharedObjective[] = objectives.map((obj, i) => ({
    index: i,
    description: obj.description,
    status: 'pending',
    screenReaderText: obj.screenReaderText,
  }));

  return {
    ...session,
    status: 'active',
    sharedQuest: {
      questId,
      questTitle,
      currentStep: 0,
      totalSteps: objectives.length,
      objectives: sharedObjectives,
      contributions: {},
    },
    updatedAt: now,
  };
}

export function claimObjective(
  quest: SharedQuestState,
  objectiveIndex: number,
  profileId: string,
): SharedQuestState {
  const objective = quest.objectives[objectiveIndex];
  if (!objective || objective.status !== 'pending') return quest;

  return {
    ...quest,
    objectives: quest.objectives.map((obj, i) =>
      i === objectiveIndex ? { ...obj, assignedTo: profileId, status: 'active' } : obj,
    ),
  };
}

export function completeObjective(
  quest: SharedQuestState,
  objectiveIndex: number,
  profileId: string,
): SharedQuestState {
  const objective = quest.objectives[objectiveIndex];
  if (!objective || objective.assignedTo !== profileId || objective.status !== 'active') {
    return quest;
  }

  const newContributions = { ...quest.contributions };
  const playerContribs = newContributions[profileId] ?? [];
  newContributions[profileId] = [...playerContribs, objective.description];

  const newObjectives = quest.objectives.map((obj, i) =>
    i === objectiveIndex ? { ...obj, status: 'completed' as const } : obj,
  );

  const completedCount = newObjectives.filter((o) => o.status === 'completed').length;

  return {
    ...quest,
    objectives: newObjectives,
    contributions: newContributions,
    currentStep: completedCount,
    completedAt: completedCount === quest.totalSteps ? new Date().toISOString() : undefined,
  };
}

export function isQuestComplete(quest: SharedQuestState): boolean {
  return quest.objectives.every((o) => o.status === 'completed');
}

export function getCompletedObjectiveCount(quest: SharedQuestState): number {
  return quest.objectives.filter((o) => o.status === 'completed').length;
}

export function getPendingObjectives(quest: SharedQuestState): SharedObjective[] {
  return quest.objectives.filter((o) => o.status === 'pending');
}

// ---------------------------------------------------------------------------
// Message construction helpers
// ---------------------------------------------------------------------------

export function createMessage(
  type: MultiplayerMessageType,
  sessionId: string,
  senderId: string,
  payload: unknown,
): MultiplayerMessage {
  return {
    type,
    sessionId,
    senderId,
    timestamp: new Date().toISOString(),
    payload,
  };
}

// ---------------------------------------------------------------------------
// Multiplayer ECS System
// ---------------------------------------------------------------------------

interface PendingMultiplayerAction {
  type: 'game_action' | 'objective_claim' | 'objective_complete' | 'quest_start';
  payload: GameActionPayload | ObjectiveClaimPayload | ObjectiveCompletePayload | QuestStartPayload;
}

export class MultiplayerSystem implements System {
  readonly name = 'multiplayer';
  readonly priority = 45;

  private session: MultiplayerSessionState | null = null;
  private pendingActions: PendingMultiplayerAction[] = [];
  private announcementQueue: CompanionAnnouncementPayload[] = [];

  getSession(): MultiplayerSessionState | null {
    return this.session;
  }

  setSession(session: MultiplayerSessionState | null): void {
    this.session = session;
  }

  queueAction(action: PendingMultiplayerAction): void {
    this.pendingActions.push(action);
  }

  drainAnnouncements(): CompanionAnnouncementPayload[] {
    return this.announcementQueue.splice(0);
  }

  update(_world: World, _dt: number): void {
    if (!this.session) return;

    const actions = this.pendingActions.splice(0);
    const now = new Date().toISOString();

    for (const action of actions) {
      this.processAction(action, now);
    }
  }

  private processAction(action: PendingMultiplayerAction, now: string): void {
    if (!this.session) return;

    switch (action.type) {
      case 'quest_start': {
        const payload = action.payload as QuestStartPayload;
        this.session = startSharedQuest(
          this.session,
          payload.questId,
          payload.questTitle,
          payload.objectives.map((o) => ({
            description: o.description,
            screenReaderText: o.screenReaderText,
          })),
          now,
        );
        break;
      }
      case 'objective_claim': {
        if (!this.session.sharedQuest) break;
        const payload = action.payload as ObjectiveClaimPayload;
        const objective = this.session.sharedQuest.objectives[payload.objectiveIndex];
        this.session = {
          ...this.session,
          sharedQuest: claimObjective(this.session.sharedQuest, payload.objectiveIndex, payload.profileId),
          updatedAt: now,
        };
        if (objective) {
          const player = this.session.players.find((p) => p.profileId === payload.profileId);
          if (player) {
            this.announcementQueue.push(
              announceObjectiveAssigned(player.displayName, objective.description),
            );
          }
        }
        break;
      }
      case 'objective_complete': {
        if (!this.session.sharedQuest) break;
        const payload = action.payload as ObjectiveCompletePayload;
        const player = this.session.players.find((p) => p.profileId === payload.profileId);
        this.session = {
          ...this.session,
          sharedQuest: completeObjective(this.session.sharedQuest, payload.objectiveIndex, payload.profileId),
          updatedAt: now,
        };
        if (player) {
          this.announcementQueue.push(announcePlayerAction(player.displayName, 'completed objective'));
        }
        if (this.session.sharedQuest && isQuestComplete(this.session.sharedQuest)) {
          this.session = { ...this.session, status: 'completed', updatedAt: now };
          this.announcementQueue.push(celebrateTeamwork('quest complete'));
        } else if (this.session.sharedQuest) {
          const count = getCompletedObjectiveCount(this.session.sharedQuest);
          this.announcementQueue.push(
            announceQuestProgress(count, this.session.sharedQuest.totalSteps),
          );
          const pending = getPendingObjectives(this.session.sharedQuest);
          if (pending.length > 0 && pending[0]) {
            this.announcementQueue.push(
              suggestCollaboration(pending[0].description),
            );
          }
        }
        break;
      }
      case 'game_action': {
        const payload = action.payload as GameActionPayload;
        const player = this.session.players.find((p) => p.profileId === payload.profileId);
        if (player) {
          this.announcementQueue.push(announcePlayerAction(player.displayName, payload.actionType));
        }
        break;
      }
    }
  }
}
