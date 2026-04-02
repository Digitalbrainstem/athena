// Quest storage + progress repository

import type { DatabaseConnection } from '../connection.js';
import type { Quest, QuestContent, QuestProgress, QuestStatus, CreateQuestInput } from '../../types/quest.js';

interface QuestRow {
  id: string;
  title: string;
  biome: string;
  mastery_tier: string;
  skills_required: string | null;
  skills_taught: string | null;
  content: string;
  generated_by: string;
  validated: number;
  created_at: string;
}

interface QuestProgressRow {
  id: number;
  profile_id: string;
  quest_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  steps_completed: number;
}

function rowToQuest(row: QuestRow): Quest {
  return {
    id: row.id,
    title: row.title,
    biome: row.biome,
    masteryTier: row.mastery_tier,
    skillsRequired: row.skills_required ? JSON.parse(row.skills_required) as string[] : [],
    skillsTaught: row.skills_taught ? JSON.parse(row.skills_taught) as string[] : [],
    content: JSON.parse(row.content) as QuestContent,
    generatedBy: row.generated_by,
    validated: row.validated === 1,
    createdAt: row.created_at,
  };
}

function rowToProgress(row: QuestProgressRow): QuestProgress {
  return {
    id: row.id,
    profileId: row.profile_id,
    questId: row.quest_id,
    status: row.status as QuestStatus,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    stepsCompleted: row.steps_completed,
  };
}

export class QuestRepository {
  constructor(private db: DatabaseConnection) {}

  create(input: CreateQuestInput): Quest {
    this.db.run(
      `INSERT INTO quests (id, title, biome, mastery_tier, skills_required, skills_taught, content, generated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.title,
        input.biome,
        input.masteryTier,
        input.skillsRequired ? JSON.stringify(input.skillsRequired) : null,
        input.skillsTaught ? JSON.stringify(input.skillsTaught) : null,
        JSON.stringify(input.content),
        input.generatedBy ?? 'handcrafted',
      ],
    );

    return this.getById(input.id)!;
  }

  getById(id: string): Quest | undefined {
    const row = this.db.queryOne<QuestRow>(
      'SELECT * FROM quests WHERE id = ?',
      [id],
    );
    return row ? rowToQuest(row) : undefined;
  }

  getForBiomeAndTier(biome: string, masteryTier: string): Quest[] {
    const rows = this.db.query<QuestRow>(
      'SELECT * FROM quests WHERE biome = ? AND mastery_tier = ?',
      [biome, masteryTier],
    );
    return rows.map(rowToQuest);
  }

  list(limit = 50, offset = 0): Quest[] {
    const rows = this.db.query<QuestRow>(
      'SELECT * FROM quests ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
    );
    return rows.map(rowToQuest);
  }

  delete(id: string): boolean {
    this.db.run('DELETE FROM quests WHERE id = ?', [id]);
    return this.db.getRowsModified() > 0;
  }

  // --- Progress tracking ---

  startQuest(profileId: string, questId: string): QuestProgress {
    const existing = this.getProgress(profileId, questId);
    if (existing) {
      this.db.run(
        `UPDATE quest_progress SET status = 'active', started_at = datetime('now'), steps_completed = 0
         WHERE profile_id = ? AND quest_id = ?`,
        [profileId, questId],
      );
    } else {
      this.db.run(
        `INSERT INTO quest_progress (profile_id, quest_id, status, started_at)
         VALUES (?, ?, 'active', datetime('now'))`,
        [profileId, questId],
      );
    }
    return this.getProgress(profileId, questId)!;
  }

  updateProgress(profileId: string, questId: string, stepsCompleted: number): QuestProgress | undefined {
    this.db.run(
      `UPDATE quest_progress SET steps_completed = ? WHERE profile_id = ? AND quest_id = ?`,
      [stepsCompleted, profileId, questId],
    );
    return this.getProgress(profileId, questId);
  }

  completeQuest(profileId: string, questId: string): QuestProgress | undefined {
    this.db.run(
      `UPDATE quest_progress SET status = 'completed', completed_at = datetime('now')
       WHERE profile_id = ? AND quest_id = ?`,
      [profileId, questId],
    );
    return this.getProgress(profileId, questId);
  }

  abandonQuest(profileId: string, questId: string): QuestProgress | undefined {
    this.db.run(
      `UPDATE quest_progress SET status = 'abandoned'
       WHERE profile_id = ? AND quest_id = ?`,
      [profileId, questId],
    );
    return this.getProgress(profileId, questId);
  }

  getProgress(profileId: string, questId: string): QuestProgress | undefined {
    const row = this.db.queryOne<QuestProgressRow>(
      'SELECT * FROM quest_progress WHERE profile_id = ? AND quest_id = ?',
      [profileId, questId],
    );
    return row ? rowToProgress(row) : undefined;
  }

  getActiveForProfile(profileId: string): QuestProgress[] {
    const rows = this.db.query<QuestProgressRow>(
      `SELECT * FROM quest_progress WHERE profile_id = ? AND status = 'active'`,
      [profileId],
    );
    return rows.map(rowToProgress);
  }

  getCompletedForProfile(profileId: string): QuestProgress[] {
    const rows = this.db.query<QuestProgressRow>(
      `SELECT * FROM quest_progress WHERE profile_id = ? AND status = 'completed'`,
      [profileId],
    );
    return rows.map(rowToProgress);
  }
}
