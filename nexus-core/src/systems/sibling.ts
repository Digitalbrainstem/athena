// Sibling play mode — shared household world with per-player difficulty

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { MasteryTier } from '../types/components.js';
import type { PersonalityStage } from '../types/companion.js';
import type {
  SharedWorld,
  SharedStructure,
  Discovery,
  PlayerView,
  SiblingProfile,
  SiblingCompanionMessage,
  SiblingMessageType,
  TeachingMoment,
  CollaborationTask,
  CollaborationParticipant,
  ChallengeDifficulty,
} from '../types/sibling.js';

// --- Companion message generation per age tier ---

const DISCOVERY_TEMPLATES: Record<string, (finderName: string, desc: string) => string> = {
  guide: (name, desc) => `Look! ${name} found something amazing — ${desc}! Let's go see!`,
  partner: (name, desc) => `${name} just discovered ${desc}! That counts for us too.`,
  ally: (name, desc) => `${name} made a discovery: ${desc}. Nice teamwork across the household.`,
  peer: (name, desc) => `FYI — ${name} found ${desc}. Added to the shared codex.`,
};

const STRUCTURE_TEMPLATES: Record<string, (builderName: string, type: string) => string> = {
  guide: (name, type) => `Wow! ${name} built a ${type}! We can use it too!`,
  partner: (name, type) => `${name} added a new ${type} to our world. Want to check it out?`,
  ally: (name, type) => `${name} built a ${type}. It's available for everyone now.`,
  peer: (name, type) => `New structure from ${name}: ${type}. Available in the shared world.`,
};

function generateCompanionMessage(
  targetProfileId: string,
  targetStage: PersonalityStage,
  messageType: SiblingMessageType,
  context: { name: string; detail: string },
): SiblingCompanionMessage {
  let text: string;
  const templates =
    messageType === 'discovery_shared' ? DISCOVERY_TEMPLATES : STRUCTURE_TEMPLATES;
  const templateFn = templates[targetStage];
  if (templateFn) {
    text = templateFn(context.name, context.detail);
  } else {
    text = `${context.name} shared something: ${context.detail}`;
  }

  return {
    targetProfileId,
    messageType,
    text,
    spokenText: text,
    screenReaderText: text,
  };
}

// --- Teaching moment generation ---

const TEACHING_PROMPTS_OLDER: Record<string, (youngerName: string, skill: string) => string> = {
  partner: (name, skill) =>
    `${name} is working on ${skill}. You're great at it — want to help? Teaching is the best way to make sure YOU really understand it too.`,
  ally: (name, skill) =>
    `${name} could use a hand with ${skill}. Want to show them how it works? It'll sharpen your own understanding.`,
  peer: (name, skill) =>
    `${name} is tackling ${skill}. Fancy a quick mentoring session? The Feynman technique works both ways.`,
};

const TEACHING_PROMPTS_YOUNGER: Record<string, (olderName: string, _skill: string) => string> = {
  guide: (name, _skill) =>
    `Your ${getRelation()} ${name} is here to help! Let's work on this together!`,
  partner: (name, _skill) =>
    `${name} knows a lot about this. They're going to help us figure it out!`,
};

function getRelation(): string {
  // Gender-neutral — we don't know the sibling's gender
  return 'sibling';
}

function createTeachingMoment(
  older: SiblingProfile,
  younger: SiblingProfile,
  skill: string,
  biome: string,
): TeachingMoment {
  const olderPromptFn = TEACHING_PROMPTS_OLDER[older.companionStage] ??
    TEACHING_PROMPTS_OLDER['partner']!;
  const youngerPromptFn = TEACHING_PROMPTS_YOUNGER[younger.companionStage] ??
    TEACHING_PROMPTS_YOUNGER['guide']!;

  const olderText = olderPromptFn(younger.name, skill);
  const youngerText = youngerPromptFn(older.name, skill);

  return {
    id: `teach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    olderProfileId: older.profileId,
    youngerProfileId: younger.profileId,
    skill,
    biome,
    olderTask: `Help ${younger.name} understand ${skill}`,
    youngerTask: `Work with ${older.name} on ${skill}`,
    companionPromptOlder: {
      targetProfileId: older.profileId,
      messageType: 'teaching_moment',
      text: olderText,
      spokenText: olderText,
      screenReaderText: olderText,
    },
    companionPromptYounger: {
      targetProfileId: younger.profileId,
      messageType: 'teaching_moment',
      text: youngerText,
      spokenText: youngerText,
      screenReaderText: youngerText,
    },
    createdAt: new Date().toISOString(),
  };
}

// --- Tier ordering for difficulty comparison ---

const TIER_ORDER: MasteryTier[] = ['foundation', 'discovery', 'builder', 'innovator', 'creator'];

function tierIndex(tier: MasteryTier): number {
  return TIER_ORDER.indexOf(tier);
}

function tierToDifficulty(tier: MasteryTier): ChallengeDifficulty {
  return tier as ChallengeDifficulty;
}

// --- Collaboration generation ---

function createCollaborationTask(
  participants: SiblingProfile[],
  biome: string,
  description: string,
): CollaborationTask {
  const mapped: CollaborationParticipant[] = participants.map((p) => ({
    profileId: p.profileId,
    name: p.name,
    role: tierIndex(p.masteryTier) >= 2 ? 'designer' : 'supplier',
    taskDescription:
      tierIndex(p.masteryTier) >= 2
        ? `Design and plan the ${description}`
        : `Gather materials for the ${description}`,
    difficulty: tierToDifficulty(p.masteryTier),
  }));

  return {
    id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    biome,
    description,
    participants: mapped,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

// --- SiblingPlaySystem ---

export class SiblingPlaySystem implements System {
  readonly name = 'sibling-play';
  readonly priority = 90;

  private sharedWorlds: Map<string, SharedWorld> = new Map();
  private siblingProfiles: Map<string, SiblingProfile> = new Map();
  private pendingMessages: SiblingCompanionMessage[] = [];
  private teachingMoments: TeachingMoment[] = [];
  private collaborationTasks: CollaborationTask[] = [];

  update(_world: World, _dt: number): void {
    // Process pending messages — in a real implementation these would be
    // dispatched to each player's companion system.
  }

  // --- Shared world lifecycle ---

  createSharedWorld(profiles: SiblingProfile[]): SharedWorld {
    if (profiles.length < 1) {
      throw new Error('At least one profile is required to create a shared world');
    }
    if (profiles.length > 6) {
      throw new Error('Maximum 6 siblings per shared world');
    }

    const worldSeed = `sibling-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const playerViews = new Map<string, PlayerView>();

    for (const profile of profiles) {
      this.siblingProfiles.set(profile.profileId, profile);
      playerViews.set(profile.profileId, {
        profileId: profile.profileId,
        profileName: profile.name,
        masteryTier: profile.masteryTier,
        companionStage: profile.companionStage,
        activeBiome: 'workshop',
        challengeDifficulty: tierToDifficulty(profile.masteryTier),
      });
    }

    const now = new Date().toISOString();
    const world: SharedWorld = {
      worldSeed,
      sharedStructures: [],
      sharedDiscoveries: [],
      playerViews,
      createdAt: now,
      lastActivity: now,
    };

    this.sharedWorlds.set(worldSeed, world);
    return world;
  }

  getSharedWorld(worldSeed: string): SharedWorld | undefined {
    return this.sharedWorlds.get(worldSeed);
  }

  // --- Player views ---

  getPlayerView(worldSeed: string, profileId: string): PlayerView | undefined {
    const world = this.sharedWorlds.get(worldSeed);
    return world?.playerViews.get(profileId);
  }

  getAllPlayerViews(worldSeed: string): PlayerView[] {
    const world = this.sharedWorlds.get(worldSeed);
    if (!world) return [];
    return Array.from(world.playerViews.values());
  }

  // --- Shared structures ---

  addSharedStructure(worldSeed: string, structure: SharedStructure): void {
    const world = this.sharedWorlds.get(worldSeed);
    if (!world) throw new Error('Shared world not found');

    world.sharedStructures.push(structure);
    world.lastActivity = new Date().toISOString();

    // Notify all OTHER siblings via companion
    for (const [pid, view] of world.playerViews) {
      if (pid === structure.builtByProfileId) continue;
      const msg = generateCompanionMessage(
        pid,
        view.companionStage,
        'structure_built',
        { name: structure.builtByName, detail: structure.type },
      );
      this.pendingMessages.push(msg);
    }
  }

  getSharedStructures(worldSeed: string): SharedStructure[] {
    return this.sharedWorlds.get(worldSeed)?.sharedStructures ?? [];
  }

  // --- Discovery sharing ---

  shareDiscovery(worldSeed: string, discovery: Discovery): void {
    const world = this.sharedWorlds.get(worldSeed);
    if (!world) throw new Error('Shared world not found');

    // Deduplicate by id
    if (world.sharedDiscoveries.some((d) => d.id === discovery.id)) return;

    world.sharedDiscoveries.push(discovery);
    world.lastActivity = new Date().toISOString();

    // Notify all OTHER siblings via companion
    for (const [pid, view] of world.playerViews) {
      if (pid === discovery.foundByProfileId) continue;
      const msg = generateCompanionMessage(
        pid,
        view.companionStage,
        'discovery_shared',
        { name: discovery.foundByName, detail: discovery.description },
      );
      this.pendingMessages.push(msg);
    }
  }

  getSharedDiscoveries(worldSeed: string): Discovery[] {
    return this.sharedWorlds.get(worldSeed)?.sharedDiscoveries ?? [];
  }

  // --- Teaching moments ---

  suggestTeachingMoment(
    worldSeed: string,
    olderProfileId: string,
    youngerProfileId: string,
    skill: string,
  ): TeachingMoment | null {
    const world = this.sharedWorlds.get(worldSeed);
    if (!world) return null;

    const older = this.siblingProfiles.get(olderProfileId);
    const younger = this.siblingProfiles.get(youngerProfileId);
    if (!older || !younger) return null;

    // The "older" must have a higher tier
    if (tierIndex(older.masteryTier) <= tierIndex(younger.masteryTier)) return null;

    const olderView = world.playerViews.get(olderProfileId);
    const biome = olderView?.activeBiome ?? 'workshop';

    const moment = createTeachingMoment(older, younger, skill, biome);
    this.teachingMoments.push(moment);
    this.pendingMessages.push(moment.companionPromptOlder);
    this.pendingMessages.push(moment.companionPromptYounger);

    return moment;
  }

  getTeachingMoments(): TeachingMoment[] {
    return [...this.teachingMoments];
  }

  // --- Collaboration tasks ---

  createCollaboration(
    worldSeed: string,
    participantIds: string[],
    description: string,
  ): CollaborationTask | null {
    const world = this.sharedWorlds.get(worldSeed);
    if (!world) return null;

    const participants: SiblingProfile[] = [];
    for (const id of participantIds) {
      const profile = this.siblingProfiles.get(id);
      if (!profile) return null;
      participants.push(profile);
    }

    const firstView = world.playerViews.get(participantIds[0]!);
    const biome = firstView?.activeBiome ?? 'workshop';

    const task = createCollaborationTask(participants, biome, description);
    this.collaborationTasks.push(task);
    return task;
  }

  getCollaborationTasks(): CollaborationTask[] {
    return [...this.collaborationTasks];
  }

  // --- Pending messages ---

  drainMessages(): SiblingCompanionMessage[] {
    return this.pendingMessages.splice(0);
  }

  // --- Cleanup ---

  destroySharedWorld(worldSeed: string): boolean {
    return this.sharedWorlds.delete(worldSeed);
  }

  reset(): void {
    this.sharedWorlds.clear();
    this.siblingProfiles.clear();
    this.pendingMessages.length = 0;
    this.teachingMoments.length = 0;
    this.collaborationTasks.length = 0;
  }
}
