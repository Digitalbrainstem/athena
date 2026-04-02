// Learning event recording repository

import type { DatabaseConnection } from '../connection.js';
import type { LearningEvent } from '../../types/profile.js';

interface LearningEventRow {
  id: number;
  profile_id: string;
  skill_id: string;
  quest_id: string | null;
  event_type: string;
  quality: number;
  context: string | null;
  response_time_ms: number | null;
  timestamp: string;
}

function rowToEvent(row: LearningEventRow): LearningEvent {
  return {
    id: row.id,
    profileId: row.profile_id,
    skillId: row.skill_id,
    questId: row.quest_id ?? undefined,
    eventType: row.event_type,
    quality: row.quality,
    context: row.context ?? undefined,
    responseTimeMs: row.response_time_ms ?? undefined,
    timestamp: row.timestamp,
  };
}

export class LearningEventRepository {
  constructor(private db: DatabaseConnection) {}

  record(event: Omit<LearningEvent, 'id' | 'timestamp'>): LearningEvent {
    this.db.run(
      `INSERT INTO learning_events (profile_id, skill_id, quest_id, event_type, quality, context, response_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        event.profileId,
        event.skillId,
        event.questId ?? null,
        event.eventType,
        event.quality,
        event.context ?? null,
        event.responseTimeMs ?? null,
      ],
    );

    // Get the last inserted row
    const row = this.db.queryOne<LearningEventRow>(
      'SELECT * FROM learning_events WHERE rowid = last_insert_rowid()',
    );
    if (!row) throw new Error('Failed to record learning event');
    return rowToEvent(row);
  }

  getForProfile(profileId: string, limit = 100): LearningEvent[] {
    const rows = this.db.query<LearningEventRow>(
      'SELECT * FROM learning_events WHERE profile_id = ? ORDER BY timestamp DESC LIMIT ?',
      [profileId, limit],
    );
    return rows.map(rowToEvent);
  }

  getForSkill(profileId: string, skillId: string, limit = 50): LearningEvent[] {
    const rows = this.db.query<LearningEventRow>(
      'SELECT * FROM learning_events WHERE profile_id = ? AND skill_id = ? ORDER BY timestamp DESC LIMIT ?',
      [profileId, skillId, limit],
    );
    return rows.map(rowToEvent);
  }

  getRecent(profileId: string, sinceTimestamp: string): LearningEvent[] {
    const rows = this.db.query<LearningEventRow>(
      'SELECT * FROM learning_events WHERE profile_id = ? AND timestamp >= ? ORDER BY timestamp ASC',
      [profileId, sinceTimestamp],
    );
    return rows.map(rowToEvent);
  }

  getForQuest(profileId: string, questId: string): LearningEvent[] {
    const rows = this.db.query<LearningEventRow>(
      'SELECT * FROM learning_events WHERE profile_id = ? AND quest_id = ? ORDER BY timestamp ASC',
      [profileId, questId],
    );
    return rows.map(rowToEvent);
  }

  count(profileId: string): number {
    const row = this.db.queryOne<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM learning_events WHERE profile_id = ?',
      [profileId],
    );
    return row?.cnt ?? 0;
  }
}
