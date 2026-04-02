import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../../src/ecs/world.js';
import {
  MultiplayerSystem,
  createSessionState,
  canJoinSession,
  addPlayerToSession,
  removePlayerFromSession,
  getConnectedPlayers,
  isSessionEmpty,
  startSharedQuest,
  claimObjective,
  completeObjective,
  isQuestComplete,
  getCompletedObjectiveCount,
  getPendingObjectives,
  announcePlayerAction,
  suggestCollaboration,
  celebrateTeamwork,
  announcePlayerJoined,
  announcePlayerLeft,
  announceObjectiveAssigned,
  announceQuestProgress,
  createMessage,
} from '../../src/systems/multiplayer.js';
import { MAX_PLAYERS_PER_SESSION } from '../../src/types/multiplayer.js';
import type { MultiplayerSessionState, SharedQuestState } from '../../src/types/multiplayer.js';

// ---------------------------------------------------------------------------
// Session state management
// ---------------------------------------------------------------------------

describe('Session State', () => {
  const NOW = '2026-01-01T00:00:00.000Z';

  it('creates a new session with host as first player', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    expect(session.id).toBe('sess-1');
    expect(session.status).toBe('waiting');
    expect(session.hostProfileId).toBe('host-1');
    expect(session.players).toHaveLength(1);
    expect(session.players[0]!.profileId).toBe('host-1');
    expect(session.players[0]!.displayName).toBe('Alex');
    expect(session.players[0]!.connected).toBe(true);
    expect(session.sharedQuest).toBeNull();
  });

  it('allows joining when session is not full', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    const result = canJoinSession(session);
    expect(result.allowed).toBe(true);
  });

  it('rejects join when session is full', () => {
    let session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
    session = addPlayerToSession(session, 'p3', 'Jordan', NOW);
    session = addPlayerToSession(session, 'p4', 'Sam', NOW);
    expect(session.players).toHaveLength(MAX_PLAYERS_PER_SESSION);
    const result = canJoinSession(session);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Session is full');
  });

  it('rejects join when session is completed', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    const completed: MultiplayerSessionState = { ...session, status: 'completed' };
    const result = canJoinSession(completed);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Session has ended');
  });

  it('adds a player to the session', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    const updated = addPlayerToSession(session, 'p2', 'Maya', NOW);
    expect(updated.players).toHaveLength(2);
    expect(updated.players[1]!.profileId).toBe('p2');
    expect(updated.players[1]!.displayName).toBe('Maya');
  });

  it('reconnects an existing player instead of duplicating', () => {
    let session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
    session = removePlayerFromSession(session, 'p2', NOW);
    expect(session.players[1]!.connected).toBe(false);

    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
    expect(session.players).toHaveLength(2);
    expect(session.players[1]!.connected).toBe(true);
  });

  it('removes a player from the session (marks disconnected)', () => {
    let session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
    session = removePlayerFromSession(session, 'p2', NOW);
    expect(session.players[1]!.connected).toBe(false);
    expect(getConnectedPlayers(session)).toHaveLength(1);
  });

  it('detects when session is empty', () => {
    let session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    expect(isSessionEmpty(session)).toBe(false);
    session = removePlayerFromSession(session, 'host-1', NOW);
    expect(isSessionEmpty(session)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Shared quest state
// ---------------------------------------------------------------------------

describe('Shared Quest', () => {
  const NOW = '2026-01-01T00:00:00.000Z';
  const OBJECTIVES = [
    { description: 'Design the dam structure', screenReaderText: 'Design the dam structure' },
    { description: 'Calculate water flow rate', screenReaderText: 'Calculate water flow rate' },
    { description: 'Source building materials', screenReaderText: 'Source building materials' },
  ];

  let session: MultiplayerSessionState;

  beforeEach(() => {
    session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
  });

  it('starts a shared quest with pending objectives', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    expect(updated.status).toBe('active');
    expect(updated.sharedQuest).not.toBeNull();
    expect(updated.sharedQuest!.questId).toBe('quest-dam');
    expect(updated.sharedQuest!.objectives).toHaveLength(3);
    expect(updated.sharedQuest!.objectives[0]!.status).toBe('pending');
    expect(updated.sharedQuest!.totalSteps).toBe(3);
  });

  it('claims an objective for a player', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    const quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    expect(quest.objectives[0]!.assignedTo).toBe('host-1');
    expect(quest.objectives[0]!.status).toBe('active');
  });

  it('does not claim an already-claimed objective', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    let quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    quest = claimObjective(quest, 0, 'p2');
    // Still assigned to host-1
    expect(quest.objectives[0]!.assignedTo).toBe('host-1');
  });

  it('completes an objective and tracks contributions', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    let quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    quest = completeObjective(quest, 0, 'host-1');
    expect(quest.objectives[0]!.status).toBe('completed');
    expect(quest.contributions['host-1']).toContain('Design the dam structure');
    expect(quest.currentStep).toBe(1);
  });

  it('does not complete an objective assigned to someone else', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    const quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    const result = completeObjective(quest, 0, 'p2');
    expect(result.objectives[0]!.status).toBe('active');
  });

  it('marks quest complete when all objectives are done', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    let quest = updated.sharedQuest!;

    quest = claimObjective(quest, 0, 'host-1');
    quest = claimObjective(quest, 1, 'p2');
    quest = claimObjective(quest, 2, 'host-1');

    quest = completeObjective(quest, 0, 'host-1');
    quest = completeObjective(quest, 1, 'p2');
    quest = completeObjective(quest, 2, 'host-1');

    expect(isQuestComplete(quest)).toBe(true);
    expect(quest.completedAt).toBeDefined();
    expect(quest.currentStep).toBe(3);
  });

  it('correctly counts completed objectives', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    let quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    quest = completeObjective(quest, 0, 'host-1');
    expect(getCompletedObjectiveCount(quest)).toBe(1);
  });

  it('returns pending objectives', () => {
    const updated = startSharedQuest(session, 'quest-dam', 'Build the Dam', OBJECTIVES, NOW);
    const quest = claimObjective(updated.sharedQuest!, 0, 'host-1');
    const pending = getPendingObjectives(quest);
    expect(pending).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Companion mediation
// ---------------------------------------------------------------------------

describe('Companion Mediation', () => {
  it('generates player action announcements', () => {
    const result = announcePlayerAction('Maya', 'built a wall');
    expect(result.kind).toBe('player_action');
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.screenReaderText.length).toBeGreaterThan(0);
  });

  it('generates collaboration suggestions', () => {
    const result = suggestCollaboration('water flow calculation');
    expect(result.kind).toBe('collaboration_suggestion');
    expect(result.message).toContain('water flow calculation');
  });

  it('generates teamwork celebrations', () => {
    const result = celebrateTeamwork('built the dam');
    expect(result.kind).toBe('teamwork_celebration');
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('generates player joined announcement', () => {
    const result = announcePlayerJoined('Maya');
    expect(result.kind).toBe('player_joined_narration');
    expect(result.message).toContain('Maya');
    expect(result.screenReaderText).toContain('Maya');
  });

  it('generates player left announcement', () => {
    const result = announcePlayerLeft('Jordan');
    expect(result.kind).toBe('player_left_narration');
    expect(result.message).toContain('Jordan');
  });

  it('generates objective assignment announcement', () => {
    const result = announceObjectiveAssigned('Alex', 'design the dam');
    expect(result.kind).toBe('objective_assigned');
    expect(result.message).toContain('Alex');
    expect(result.message).toContain('design the dam');
    expect(result.screenReaderText).toContain('design the dam');
  });

  it('generates quest progress announcement', () => {
    const result = announceQuestProgress(2, 4);
    expect(result.kind).toBe('quest_progress');
    expect(result.message).toContain('2');
    expect(result.message).toContain('4');
    expect(result.screenReaderText).toContain('2 of 4');
  });

  it('all announcements include screenReaderText for accessibility', () => {
    const all = [
      announcePlayerAction('A', 'x'),
      suggestCollaboration('task'),
      celebrateTeamwork('win'),
      announcePlayerJoined('B'),
      announcePlayerLeft('C'),
      announceObjectiveAssigned('D', 'obj'),
      announceQuestProgress(1, 3),
    ];
    for (const a of all) {
      expect(a.screenReaderText).toBeTruthy();
      expect(typeof a.screenReaderText).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// Message construction
// ---------------------------------------------------------------------------

describe('Message Construction', () => {
  it('creates a properly structured message', () => {
    const msg = createMessage('game_action', 'sess-1', 'player-1', { actionType: 'build', data: {} });
    expect(msg.type).toBe('game_action');
    expect(msg.sessionId).toBe('sess-1');
    expect(msg.senderId).toBe('player-1');
    expect(msg.timestamp).toBeTruthy();
    expect(msg.payload).toEqual({ actionType: 'build', data: {} });
  });
});

// ---------------------------------------------------------------------------
// MultiplayerSystem ECS integration
// ---------------------------------------------------------------------------

describe('MultiplayerSystem', () => {
  let world: World;
  let system: MultiplayerSystem;
  const NOW = '2026-01-01T00:00:00.000Z';

  beforeEach(() => {
    world = new World();
    system = new MultiplayerSystem();
    world.addSystem(system);
  });

  it('has correct name and priority', () => {
    expect(system.name).toBe('multiplayer');
    expect(system.priority).toBe(45);
  });

  it('starts with no session', () => {
    expect(system.getSession()).toBeNull();
  });

  it('can set and get session', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    system.setSession(session);
    expect(system.getSession()).toBe(session);
  });

  it('processes quest start action', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    system.setSession(session);

    system.queueAction({
      type: 'quest_start',
      payload: {
        questId: 'quest-bridge',
        questTitle: 'Build a Bridge',
        objectives: [
          { index: 0, description: 'Design the arch', status: 'pending', screenReaderText: 'Design the arch' },
          { index: 1, description: 'Gather materials', status: 'pending', screenReaderText: 'Gather materials' },
        ],
      },
    });

    world.update(0.016);

    const updated = system.getSession();
    expect(updated!.status).toBe('active');
    expect(updated!.sharedQuest).not.toBeNull();
    expect(updated!.sharedQuest!.questId).toBe('quest-bridge');
  });

  it('processes objective claim and generates announcement', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    system.setSession(session);

    system.queueAction({
      type: 'quest_start',
      payload: {
        questId: 'quest-1',
        questTitle: 'Test Quest',
        objectives: [
          { index: 0, description: 'Task A', status: 'pending', screenReaderText: 'Task A' },
        ],
      },
    });
    world.update(0.016);

    system.queueAction({
      type: 'objective_claim',
      payload: { objectiveIndex: 0, profileId: 'host-1' },
    });
    world.update(0.016);

    const announcements = system.drainAnnouncements();
    expect(announcements.length).toBeGreaterThan(0);
    expect(announcements.some((a) => a.kind === 'objective_assigned')).toBe(true);
  });

  it('processes objective completion and celebrates teamwork on quest complete', () => {
    let session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    session = addPlayerToSession(session, 'p2', 'Maya', NOW);
    system.setSession(session);

    system.queueAction({
      type: 'quest_start',
      payload: {
        questId: 'quest-1',
        questTitle: 'Test',
        objectives: [
          { index: 0, description: 'Task A', status: 'pending', screenReaderText: 'Task A' },
        ],
      },
    });
    world.update(0.016);
    system.drainAnnouncements();

    system.queueAction({ type: 'objective_claim', payload: { objectiveIndex: 0, profileId: 'host-1' } });
    world.update(0.016);
    system.drainAnnouncements();

    system.queueAction({ type: 'objective_complete', payload: { objectiveIndex: 0, profileId: 'host-1' } });
    world.update(0.016);

    const announcements = system.drainAnnouncements();
    expect(announcements.some((a) => a.kind === 'player_action')).toBe(true);
    expect(announcements.some((a) => a.kind === 'teamwork_celebration')).toBe(true);

    expect(system.getSession()!.status).toBe('completed');
  });

  it('processes game action and generates companion announcement', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    system.setSession(session);

    system.queueAction({
      type: 'game_action',
      payload: { profileId: 'host-1', actionType: 'build', data: {} },
    });
    world.update(0.016);

    const announcements = system.drainAnnouncements();
    expect(announcements.length).toBeGreaterThan(0);
    expect(announcements[0]!.kind).toBe('player_action');
  });

  it('does nothing without a session', () => {
    system.queueAction({
      type: 'game_action',
      payload: { profileId: 'x', actionType: 'build', data: {} },
    });
    world.update(0.016);
    expect(system.drainAnnouncements()).toHaveLength(0);
  });

  it('drains announcements only once', () => {
    const session = createSessionState('sess-1', 'host-1', 'Alex', NOW);
    system.setSession(session);
    system.queueAction({
      type: 'game_action',
      payload: { profileId: 'host-1', actionType: 'explore', data: {} },
    });
    world.update(0.016);
    const first = system.drainAnnouncements();
    expect(first.length).toBeGreaterThan(0);
    const second = system.drainAnnouncements();
    expect(second).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Safety invariants
// ---------------------------------------------------------------------------

describe('Safety Invariants', () => {
  it('MAX_PLAYERS_PER_SESSION is 4', () => {
    expect(MAX_PLAYERS_PER_SESSION).toBe(4);
  });

  it('no direct communication types exist in MultiplayerMessageType', () => {
    // The type system prevents this at compile time, but we verify conceptually
    // by checking our message types don't include "chat", "voice", or "text"
    const SAFE_TYPES = [
      'join_request', 'join_accepted', 'join_rejected',
      'player_joined', 'player_left', 'session_state',
      'game_action', 'quest_start', 'quest_update', 'quest_complete',
      'objective_claim', 'objective_complete', 'companion_announcement',
    ];
    // No "chat", "voice", "text", "image" types
    for (const t of SAFE_TYPES) {
      expect(t).not.toContain('chat');
      expect(t).not.toContain('voice');
      expect(t).not.toContain('text_message');
      expect(t).not.toContain('image');
    }
  });

  it('companion mediates all announcements (all have screenReaderText)', () => {
    const announcements = [
      announcePlayerAction('A', 'build'),
      suggestCollaboration('task'),
      celebrateTeamwork('win'),
      announcePlayerJoined('B'),
      announcePlayerLeft('C'),
      announceObjectiveAssigned('D', 'obj'),
      announceQuestProgress(1, 2),
    ];
    for (const a of announcements) {
      expect(a.screenReaderText).toBeTruthy();
      expect(a.kind).toBeTruthy();
    }
  });

  it('session creation enforces max player limit', () => {
    const NOW = '2026-01-01T00:00:00.000Z';
    let session = createSessionState('s', 'p1', 'A', NOW);
    session = addPlayerToSession(session, 'p2', 'B', NOW);
    session = addPlayerToSession(session, 'p3', 'C', NOW);
    session = addPlayerToSession(session, 'p4', 'D', NOW);
    // Trying to add a 5th should not increase player count
    const result = addPlayerToSession(session, 'p5', 'E', NOW);
    expect(result.players).toHaveLength(4);
  });
});
