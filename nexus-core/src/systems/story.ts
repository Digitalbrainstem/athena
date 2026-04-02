// Story & Narrative System — Codex, Fragments, Mysteries
// Knowledge-gated progression inspired by Outer Wilds.
// Fragments are discovered through gameplay, never forced.
// Mysteries require cross-biome knowledge + specific skills.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { DatabaseConnection } from '../db/connection.js';
import type {
  Fragment, CodexState, MysteryProgress, CodexUpdate, StoryThread,
} from '../types/story.js';
import { ALL_FRAGMENTS, getFragment, fragmentsForThread } from '../data/fragments.js';
import { MYSTERIES } from '../data/mysteries.js';

// ─── Database row types ──────────────────────────────────────────────────────

interface FragmentRow {
  id: string;
  tier: string;
  biome: string;
  story_thread: string;
  title: string;
  content: string;
  spoken_content: string;
  screen_reader_text: string;
  discovery_condition: string | null;
}

interface ProgressRow {
  profile_id: string;
  fragment_id: string;
  discovered_at: string;
}

interface MysteryProgressRow {
  profile_id: string;
  mystery_id: string;
  solved_at: string | null;
}

interface MasteryRow {
  skill_id: string;
  level: number;
}

// ─── Schema SQL ──────────────────────────────────────────────────────────────

const CODEX_SCHEMA = `
CREATE TABLE IF NOT EXISTS codex_fragments (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    biome TEXT NOT NULL,
    story_thread TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    spoken_content TEXT NOT NULL,
    screen_reader_text TEXT NOT NULL,
    discovery_condition TEXT
);

CREATE TABLE IF NOT EXISTS codex_progress (
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    fragment_id TEXT NOT NULL REFERENCES codex_fragments(id),
    discovered_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (profile_id, fragment_id)
);

CREATE TABLE IF NOT EXISTS mysteries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    required_fragments TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    biomes TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mystery_progress (
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mystery_id TEXT NOT NULL REFERENCES mysteries(id),
    solved_at TEXT,
    PRIMARY KEY (profile_id, mystery_id)
);

CREATE INDEX IF NOT EXISTS idx_codex_progress_profile ON codex_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_mystery_progress_profile ON mystery_progress(profile_id);
`;

// ─── CodexSystem ─────────────────────────────────────────────────────────────

export class CodexSystem implements System {
  readonly name = 'codex';
  readonly priority = 60;

  private db: DatabaseConnection | null = null;
  private initialized = false;

  setDatabase(db: DatabaseConnection): void {
    this.db = db;
  }

  /** Create codex tables and seed fragment/mystery data */
  initialize(): void {
    if (!this.db || this.initialized) return;

    // Create tables
    const statements = CODEX_SCHEMA.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      this.db.exec(stmt + ';');
    }

    // Seed fragments (idempotent)
    for (const fragment of ALL_FRAGMENTS) {
      const existing = this.db.queryOne<{ id: string }>(
        'SELECT id FROM codex_fragments WHERE id = ?',
        [fragment.id],
      );
      if (!existing) {
        this.db.run(
          `INSERT INTO codex_fragments (id, tier, biome, story_thread, title, content, spoken_content, screen_reader_text, discovery_condition)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fragment.id, fragment.tier, fragment.biome, fragment.storyThread,
            fragment.title, fragment.content, fragment.spokenContent,
            fragment.screenReaderText, fragment.discoveryCondition ?? null,
          ],
        );
      }
    }

    // Seed mysteries (idempotent)
    for (const mystery of MYSTERIES) {
      const existing = this.db.queryOne<{ id: string }>(
        'SELECT id FROM mysteries WHERE id = ?',
        [mystery.id],
      );
      if (!existing) {
        this.db.run(
          `INSERT INTO mysteries (id, title, required_fragments, required_skills, biomes, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            mystery.id, mystery.title,
            JSON.stringify(mystery.requiredFragments),
            JSON.stringify(mystery.requiredSkills),
            JSON.stringify(mystery.biomes),
            mystery.description,
          ],
        );
      }
    }

    this.initialized = true;
  }

  update(_world: World, _dt: number): void {
    // Codex is event-driven, not tick-driven
  }

  // ─── Core API ────────────────────────────────────────────────────────────

  /** Discover a fragment for a player. Returns codex update details. */
  discoverFragment(profileId: string, fragmentId: string): CodexUpdate {
    this.ensureReady();

    const fragment = this.getFragmentData(fragmentId);
    if (!fragment) {
      throw new Error(`Fragment not found: ${fragmentId}`);
    }

    // Check if already discovered
    const existing = this.db!.queryOne<ProgressRow>(
      'SELECT * FROM codex_progress WHERE profile_id = ? AND fragment_id = ?',
      [profileId, fragmentId],
    );

    const newDiscovery = !existing;
    if (newDiscovery) {
      this.db!.run(
        'INSERT INTO codex_progress (profile_id, fragment_id) VALUES (?, ?)',
        [profileId, fragmentId],
      );
    }

    // Get thread progress
    const threadFragments = ALL_FRAGMENTS.filter(f => f.storyThread === fragment.storyThread);
    const discoveredInThread = this.db!.query<ProgressRow>(
      `SELECT cp.* FROM codex_progress cp
       JOIN codex_fragments cf ON cp.fragment_id = cf.id
       WHERE cp.profile_id = ? AND cf.story_thread = ?`,
      [profileId, fragment.storyThread],
    );

    const threadProgress = {
      found: discoveredInThread.length,
      total: threadFragments.length,
    };

    // Check mystery advancement
    const mysteriesAdvanced: string[] = [];
    const mysteriesSolved: string[] = [];

    for (const mystery of MYSTERIES) {
      if (mystery.requiredFragments.includes(fragmentId)) {
        const progress = this.checkMysteryProgress(profileId, mystery.id);
        if (progress.solvable && !progress.solved) {
          mysteriesAdvanced.push(mystery.id);
        }
      }
    }

    // Auto-solve mysteries that become solvable
    for (const mysteryId of mysteriesAdvanced) {
      const progress = this.checkMysteryProgress(profileId, mysteryId);
      if (progress.solvable) {
        this.solveMystery(profileId, mysteryId);
        mysteriesSolved.push(mysteryId);
      }
    }

    return {
      fragment: { ...fragment, discoveredAt: new Date().toISOString() },
      newDiscovery,
      threadProgress,
      mysteriesAdvanced,
      mysteriesSolved,
    };
  }

  /** Get all fragments discovered by a player */
  getDiscoveredFragments(profileId: string): Fragment[] {
    this.ensureReady();

    const rows = this.db!.query<ProgressRow & FragmentRow>(
      `SELECT cf.*, cp.discovered_at FROM codex_progress cp
       JOIN codex_fragments cf ON cp.fragment_id = cf.id
       WHERE cp.profile_id = ?
       ORDER BY cp.discovered_at ASC`,
      [profileId],
    );

    return rows.map(row => this.rowToFragment(row, row.discovered_at));
  }

  /** Get the complete codex state for a player */
  getCodexState(profileId: string): CodexState {
    this.ensureReady();

    const discovered = this.db!.query<ProgressRow>(
      'SELECT * FROM codex_progress WHERE profile_id = ?',
      [profileId],
    );
    const discoveredIds = new Set(discovered.map(d => d.fragment_id));

    // Thread progress
    const threads: StoryThread[] = ['star_trail', 'journal', 'machines', 'equations', 'truth'];
    const threadProgress: Record<string, { found: number; total: number }> = {};

    for (const thread of threads) {
      const total = fragmentsForThread(thread).length;
      const found = ALL_FRAGMENTS.filter(
        f => f.storyThread === thread && discoveredIds.has(f.id),
      ).length;
      threadProgress[thread] = { found, total };
    }

    // Mystery progress
    const mysteries = MYSTERIES.map(m => this.checkMysteryProgress(profileId, m.id));

    // Generate hints for undiscovered fragments in partially-explored threads
    const hints = this.generateHints(profileId, discoveredIds);

    return {
      totalFragments: ALL_FRAGMENTS.length,
      discoveredCount: discovered.length,
      threadProgress,
      mysteries,
      hints,
    };
  }

  /** Check progress toward solving a specific mystery */
  checkMysteryProgress(profileId: string, mysteryId: string): MysteryProgress {
    this.ensureReady();

    const mystery = MYSTERIES.find(m => m.id === mysteryId);
    if (!mystery) {
      throw new Error(`Mystery not found: ${mysteryId}`);
    }

    // Check which required fragments are found
    const discovered = this.db!.query<ProgressRow>(
      'SELECT * FROM codex_progress WHERE profile_id = ?',
      [profileId],
    );
    const discoveredIds = new Set(discovered.map(d => d.fragment_id));
    const foundFragments = mystery.requiredFragments.filter(id => discoveredIds.has(id));

    // Check which required skills are met
    const masteryRows = this.db!.query<MasteryRow>(
      'SELECT skill_id, level FROM mastery WHERE profile_id = ?',
      [profileId],
    );
    const skillLevels = new Map(masteryRows.map(r => [r.skill_id, r.level]));
    const metSkills = mystery.requiredSkills.filter(
      skill => (skillLevels.get(skill) ?? 0) > 0,
    );

    // Check if solved
    const solvedRow = this.db!.queryOne<MysteryProgressRow>(
      'SELECT * FROM mystery_progress WHERE profile_id = ? AND mystery_id = ? AND solved_at IS NOT NULL',
      [profileId, mysteryId],
    );

    const allFragmentsFound = foundFragments.length === mystery.requiredFragments.length;
    const allSkillsMet = metSkills.length === mystery.requiredSkills.length;

    return {
      mysteryId: mystery.id,
      title: mystery.title,
      description: mystery.description,
      requiredFragments: mystery.requiredFragments,
      foundFragments,
      requiredSkills: mystery.requiredSkills,
      metSkills,
      biomes: mystery.biomes,
      solvable: allFragmentsFound && allSkillsMet,
      solved: !!solvedRow,
    };
  }

  /** Mark a mystery as solved */
  solveMystery(profileId: string, mysteryId: string): void {
    this.ensureReady();

    const existing = this.db!.queryOne<MysteryProgressRow>(
      'SELECT * FROM mystery_progress WHERE profile_id = ? AND mystery_id = ?',
      [profileId, mysteryId],
    );

    if (existing) {
      this.db!.run(
        `UPDATE mystery_progress SET solved_at = datetime('now')
         WHERE profile_id = ? AND mystery_id = ?`,
        [profileId, mysteryId],
      );
    } else {
      this.db!.run(
        `INSERT INTO mystery_progress (profile_id, mystery_id, solved_at)
         VALUES (?, ?, datetime('now'))`,
        [profileId, mysteryId],
      );
    }
  }

  /** Get total fragment count */
  getTotalFragmentCount(): number {
    return ALL_FRAGMENTS.length;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private getFragmentData(fragmentId: string): Fragment | undefined {
    return getFragment(fragmentId);
  }

  private rowToFragment(row: FragmentRow, discoveredAt?: string): Fragment {
    return {
      id: row.id,
      tier: row.tier as Fragment['tier'],
      biome: row.biome,
      storyThread: row.story_thread as StoryThread,
      title: row.title,
      content: row.content,
      spokenContent: row.spoken_content,
      screenReaderText: row.screen_reader_text,
      discoveredAt,
      discoveryCondition: row.discovery_condition ?? undefined,
    };
  }

  private generateHints(_profileId: string, discoveredIds: Set<string>): string[] {
    const hints: string[] = [];
    const threads: StoryThread[] = ['star_trail', 'journal', 'machines', 'equations', 'truth'];

    for (const thread of threads) {
      const threadFragments = fragmentsForThread(thread);
      const found = threadFragments.filter(f => discoveredIds.has(f.id));
      const missing = threadFragments.filter(f => !discoveredIds.has(f.id));

      // Only hint if player has found at least one in this thread
      if (found.length > 0 && missing.length > 0) {
        // Hint about biomes with undiscovered fragments
        const missingBiomes = [...new Set(missing.map(f => f.biome))];
        const biome = missingBiomes[0];
        if (biome) {
          switch (thread) {
            case 'star_trail':
              hints.push(`There might be more stars hidden in the ${biome.replace(/-/g, ' ')}.`);
              break;
            case 'journal':
              hints.push(`More journal pages may be scattered in the ${biome.replace(/-/g, ' ')}.`);
              break;
            case 'machines':
              hints.push(`There could be broken machines waiting for repair in the ${biome.replace(/-/g, ' ')}.`);
              break;
            case 'equations':
              hints.push(`Ancient inscriptions may be hidden in the ${biome.replace(/-/g, ' ')}.`);
              break;
            case 'truth':
              hints.push(`The deepest truths are still waiting to be understood.`);
              break;
          }
        }
      }
    }

    return hints;
  }

  private ensureReady(): void {
    if (!this.db) {
      throw new Error('CodexSystem: database not set. Call setDatabase() first.');
    }
    if (!this.initialized) {
      this.initialize();
    }
  }
}
