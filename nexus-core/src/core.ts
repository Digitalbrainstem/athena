// NexusCore — the main public API for the game engine

import { World } from './ecs/world.js';
import { DatabaseConnection } from './db/connection.js';
import { createSchema } from './db/schema.js';
import { runMigrations } from './db/migrations.js';
import { ProfileRepository } from './db/repositories/profile.js';
import { MasteryRepository } from './db/repositories/mastery.js';
import { QuestRepository } from './db/repositories/quest.js';
import { LearningEventRepository } from './db/repositories/learning-event.js';
import { WorldStateRepository } from './db/repositories/world-state.js';
import { CompanionRepository } from './db/repositories/companion.js';
import { MasterySystem } from './systems/mastery.js';
import { QuestSystem } from './systems/quest.js';
import { WorldSystem } from './systems/world.js';
import { CompanionSystem } from './systems/companion.js';
import { InventorySystem } from './systems/inventory.js';
import { CraftSystem } from './systems/craft.js';
import { FlowEngine } from './systems/flow.js';
import { CalibrationSystem } from './systems/calibration.js';
import { DialogueGenerator } from './systems/dialogue.js';
import { InterestTracker, InterestRepository } from './systems/interest.js';
import { TravelSystem } from './systems/travel.js';
import { EconomySystem } from './systems/economy.js';
import { ClassroomSystem } from './systems/classroom.js';
import { CodeForgeSystem } from './systems/code-forge.js';
import { SiblingPlaySystem } from './systems/sibling.js';
import { ScreenTimeSystem } from './systems/screen-time.js';
import { FocusModeSystem } from './systems/focus.js';
import { MultiplayerSystem } from './systems/multiplayer.js';
import { ProceduralQuestGenerator } from './systems/procedural.js';
import { CodexSystem } from './systems/story.js';
import { WorldSimulation } from './systems/world-sim.js';
import { createEmptySceneGraph } from './scene/graph.js';
import type { GameAction } from './types/actions.js';
import type { SceneGraph } from './types/scene.js';
import type { Profile, CreateProfileInput, MasteryRecord } from './types/profile.js';
import type { QuestProgress } from './types/quest.js';
import type { CompanionState } from './types/companion.js';
import { allQuests } from './data/quests/index.js';

export interface NexusCoreConfig {
  /** URL to sql.js WASM file */
  sqliteWasmUrl?: string;
  /** Pre-generated content path */
  contentDir?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Existing database to load */
  existingData?: Uint8Array;
}

export class NexusCore {
  private world: World;
  private db: DatabaseConnection;
  private sceneGraph: SceneGraph;
  private activeProfileId: string | null = null;
  private _debug: boolean;

  // Repositories
  readonly profiles: ProfileRepository;
  readonly mastery: MasteryRepository;
  readonly quests: QuestRepository;
  readonly learningEvents: LearningEventRepository;
  readonly worldState: WorldStateRepository;
  readonly companions: CompanionRepository;
  readonly interests: InterestRepository;

  // Systems (public for advanced usage)
  readonly masterySystem: MasterySystem;
  readonly questSystem: QuestSystem;
  readonly worldSystem: WorldSystem;
  readonly companionSystem: CompanionSystem;
  readonly inventorySystem: InventorySystem;
  readonly craftSystem: CraftSystem;
  readonly dialogueGenerator: DialogueGenerator;
  readonly interestTracker: InterestTracker;
  readonly flowEngine: FlowEngine;
  readonly calibrationSystem: CalibrationSystem;

  // Orphaned systems — now registered
  readonly travelSystem: TravelSystem;
  readonly economySystem: EconomySystem;
  readonly classroomSystem: ClassroomSystem;
  readonly codeForgeSystem: CodeForgeSystem;
  readonly siblingPlaySystem: SiblingPlaySystem;
  readonly screenTimeSystem: ScreenTimeSystem;
  readonly focusModeSystem: FocusModeSystem;
  readonly multiplayerSystem: MultiplayerSystem;
  readonly proceduralQuestGenerator: ProceduralQuestGenerator;
  readonly codexSystem: CodexSystem;
  readonly worldSimulation: WorldSimulation;

  private constructor(db: DatabaseConnection, debug: boolean) {
    this.db = db;
    this._debug = debug;
    this.world = new World();
    this.sceneGraph = createEmptySceneGraph();

    // Register all component types
    this.world.registerComponent('position');
    this.world.registerComponent('rotation');
    this.world.registerComponent('renderable');
    this.world.registerComponent('interactable');
    this.world.registerComponent('character');
    this.world.registerComponent('questMarker');
    this.world.registerComponent('physicsBody');
    this.world.registerComponent('light');
    this.world.registerComponent('player');
    this.world.registerComponent('inventoryItem');

    // Initialize repositories
    this.profiles = new ProfileRepository(db);
    this.mastery = new MasteryRepository(db);
    this.quests = new QuestRepository(db);
    this.learningEvents = new LearningEventRepository(db);
    this.worldState = new WorldStateRepository(db);
    this.companions = new CompanionRepository(db);
    this.interests = new InterestRepository(db);
    this.masterySystem = new MasterySystem();
    this.masterySystem.setRepositories(this.mastery, this.learningEvents);

    this.questSystem = new QuestSystem();
    this.questSystem.setRepositories(this.quests, this.mastery);
    this.questSystem.setMasterySystem(this.masterySystem);

    this.worldSystem = new WorldSystem();
    this.worldSystem.setRepository(this.worldState);

    this.companionSystem = new CompanionSystem();
    this.companionSystem.setRepository(this.companions);

    this.inventorySystem = new InventorySystem();

    this.craftSystem = new CraftSystem();

    this.flowEngine = new FlowEngine();

    this.calibrationSystem = new CalibrationSystem();

    this.dialogueGenerator = new DialogueGenerator();

    this.interestTracker = new InterestTracker();
    this.interestTracker.setRepository(this.interests);

    this.travelSystem = new TravelSystem();

    this.economySystem = new EconomySystem();

    this.classroomSystem = new ClassroomSystem();

    this.codeForgeSystem = new CodeForgeSystem();

    this.siblingPlaySystem = new SiblingPlaySystem();

    this.screenTimeSystem = new ScreenTimeSystem();

    this.focusModeSystem = new FocusModeSystem();

    this.multiplayerSystem = new MultiplayerSystem();

    this.proceduralQuestGenerator = new ProceduralQuestGenerator();

    this.codexSystem = new CodexSystem();
    this.codexSystem.setDatabase(db);

    this.worldSimulation = new WorldSimulation();

    // Add systems to world
    this.world.addSystem(this.worldSystem);
    this.world.addSystem(this.worldSimulation);
    this.world.addSystem(this.travelSystem);
    this.world.addSystem(this.masterySystem);
    this.world.addSystem(this.questSystem);
    this.world.addSystem(this.proceduralQuestGenerator);
    this.world.addSystem(this.codexSystem);
    this.world.addSystem(this.inventorySystem);
    this.world.addSystem(this.economySystem);
    this.world.addSystem(this.companionSystem);
    this.world.addSystem(this.craftSystem);
    this.world.addSystem(this.flowEngine);
    this.world.addSystem(this.calibrationSystem);
    this.world.addSystem(this.interestTracker);
    this.world.addSystem(this.multiplayerSystem);
    this.world.addSystem(this.siblingPlaySystem);
    this.world.addSystem(this.classroomSystem);
  }

  /** Create a new NexusCore instance */
  static async create(config: NexusCoreConfig = {}): Promise<NexusCore> {
    const db = new DatabaseConnection();
    await db.open({
      wasmUrl: config.sqliteWasmUrl,
      data: config.existingData,
    });

    // Create schema
    createSchema(db);
    runMigrations(db);

    const core = new NexusCore(db, config.debug ?? false);
    core.seedQuests();
    return core;
  }

  /** Shut down the engine and release resources */
  async destroy(): Promise<void> {
    this.world.clear();
    this.db.close();
    this.activeProfileId = null;
  }

  // --- Game Loop ---

  /** Called by renderer every frame. Processes actions and updates all systems. */
  update(dt: number, actions: GameAction[]): void {
    // Push actions into the world
    this.world.pushActions(actions);

    // Update all systems
    this.world.update(dt);

    // Drain companion dialogue into the world system for scene graph
    const dialogueLines = this.companionSystem.drainDialogue();
    if (dialogueLines.length > 0) {
      const line = dialogueLines[0]!;
      this.worldSystem.queueDialogue(line.speaker, line.text);
    }

    // Rebuild scene graph
    this.sceneGraph = this.worldSystem.buildSceneGraph(this.world);
  }

  /** Get the current scene graph for rendering */
  getSceneGraph(): SceneGraph {
    return this.sceneGraph;
  }

  /** Write the client-authoritative player position back into the ECS.
   *  Called by the game loop after the FirstPersonCamera updates. */
  setPlayerPosition(x: number, z: number): void {
    this.worldSystem.setPlayerPosition(this.world, x, z);
  }

  /** Read the current ECS player position (for the client to seed the camera). */
  getPlayerPosition(): { x: number; z: number } {
    const players = this.world.query(['player', 'position']);
    if (players[0] !== undefined) {
      const pos = this.world.getComponent(players[0], 'position');
      if (pos) return { x: pos.x, z: pos.z };
    }
    return { x: 0, z: 0 };
  }

  // --- Profile Management ---

  async createProfile(data: CreateProfileInput): Promise<Profile> {
    return this.profiles.create(data);
  }

  async loadProfile(profileId: string): Promise<void> {
    const profile = this.profiles.getById(profileId);
    if (!profile) {
      throw new Error(`Profile "${profileId}" not found`);
    }

    this.activeProfileId = profileId;
    this.profiles.updateLastActive(profileId);

    // Load profile into systems
    this.worldSystem.loadProfile(profileId);
    this.companionSystem.loadProfile(profileId);

    // Create player entity
    const playerEntity = this.world.createEntity();
    this.world.addComponent(playerEntity, 'player', {
      profileId,
      masteryTier: profile.masteryTier,
      activeBiome: 'workshop',
    });
    this.world.addComponent(playerEntity, 'position', { x: 0, y: 0, z: 0 });
    this.world.addComponent(playerEntity, 'rotation', { x: 0, y: 0, z: 0 });

    if (this._debug) {
      // eslint-disable-next-line no-console
      console.log(`[NexusCore] Profile loaded: ${profile.name} (${profileId})`);
    }
  }

  async listProfiles(): Promise<Profile[]> {
    return this.profiles.list();
  }

  // --- State Queries ---

  getActiveProfileId(): string | null {
    return this.activeProfileId;
  }

  getMasteryForProfile(profileId: string): MasteryRecord[] {
    return this.mastery.getForProfile(profileId);
  }

  getActiveQuests(): QuestProgress[] {
    if (!this.activeProfileId) return [];
    return this.questSystem.getActiveQuests(this.activeProfileId);
  }

  getCompanionState(): CompanionState | undefined {
    return this.companionSystem.getState();
  }

  // --- World Access ---

  getWorld(): World {
    return this.world;
  }

  // --- Data Export/Import ---

  async exportData(): Promise<Uint8Array> {
    return this.db.export();
  }

  async importData(data: Uint8Array): Promise<void> {
    // Close current connection and reopen with imported data
    this.db.close();
    await this.db.open({ data });
    this.activeProfileId = null;
  }

  /** Seed hand-crafted quests into the DB if not already present */
  private seedQuests(): void {
    for (const quest of allQuests) {
      const existing = this.quests.getById(quest.id);
      if (!existing) {
        this.quests.create(quest);
      }
    }
  }

  get isDebug(): boolean {
    return this._debug;
  }
}
