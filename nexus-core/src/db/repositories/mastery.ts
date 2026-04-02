// Mastery record CRUD repository

import type { DatabaseConnection } from '../connection.js';
import type { MasteryRecord } from '../../types/profile.js';

interface MasteryRow {
  id: number;
  profile_id: string;
  skill_id: string;
  level: number;
  retention_score: number;
  transfer_score: number;
  depth_score: number;
  attempts: number;
  successes: number;
  last_attempt: string | null;
  next_review: string | null;
  ease_factor: number;
  streak: number;
  interval_days: number;
}

function rowToMastery(row: MasteryRow): MasteryRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    skillId: row.skill_id,
    level: row.level,
    retentionScore: row.retention_score,
    transferScore: row.transfer_score,
    depthScore: row.depth_score,
    attempts: row.attempts,
    successes: row.successes,
    lastAttempt: row.last_attempt ?? undefined,
    nextReview: row.next_review ?? undefined,
    easeFactor: row.ease_factor,
    streak: row.streak,
    intervalDays: row.interval_days,
  };
}

export class MasteryRepository {
  constructor(private db: DatabaseConnection) {}

  getForProfile(profileId: string): MasteryRecord[] {
    const rows = this.db.query<MasteryRow>(
      'SELECT * FROM mastery WHERE profile_id = ? ORDER BY skill_id',
      [profileId],
    );
    return rows.map(rowToMastery);
  }

  getForSkill(profileId: string, skillId: string): MasteryRecord | undefined {
    const row = this.db.queryOne<MasteryRow>(
      'SELECT * FROM mastery WHERE profile_id = ? AND skill_id = ?',
      [profileId, skillId],
    );
    return row ? rowToMastery(row) : undefined;
  }

  /** Insert or update a mastery record */
  upsert(profileId: string, skillId: string, data: Partial<MasteryRecord>): MasteryRecord {
    const existing = this.getForSkill(profileId, skillId);

    if (existing) {
      const setClauses: string[] = [];
      const values: (string | number | null)[] = [];

      if (data.level !== undefined) { setClauses.push('level = ?'); values.push(data.level); }
      if (data.retentionScore !== undefined) { setClauses.push('retention_score = ?'); values.push(data.retentionScore); }
      if (data.transferScore !== undefined) { setClauses.push('transfer_score = ?'); values.push(data.transferScore); }
      if (data.depthScore !== undefined) { setClauses.push('depth_score = ?'); values.push(data.depthScore); }
      if (data.attempts !== undefined) { setClauses.push('attempts = ?'); values.push(data.attempts); }
      if (data.successes !== undefined) { setClauses.push('successes = ?'); values.push(data.successes); }
      if (data.lastAttempt !== undefined) { setClauses.push('last_attempt = ?'); values.push(data.lastAttempt ?? null); }
      if (data.nextReview !== undefined) { setClauses.push('next_review = ?'); values.push(data.nextReview ?? null); }
      if (data.easeFactor !== undefined) { setClauses.push('ease_factor = ?'); values.push(data.easeFactor); }
      if (data.streak !== undefined) { setClauses.push('streak = ?'); values.push(data.streak); }
      if (data.intervalDays !== undefined) { setClauses.push('interval_days = ?'); values.push(data.intervalDays); }

      if (setClauses.length > 0) {
        values.push(existing.id);
        this.db.run(
          `UPDATE mastery SET ${setClauses.join(', ')} WHERE id = ?`,
          values,
        );
      }
    } else {
      this.db.run(
        `INSERT INTO mastery (profile_id, skill_id, level, retention_score, transfer_score,
         depth_score, attempts, successes, last_attempt, next_review, ease_factor, streak, interval_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId,
          skillId,
          data.level ?? 0,
          data.retentionScore ?? 0,
          data.transferScore ?? 0,
          data.depthScore ?? 0,
          data.attempts ?? 0,
          data.successes ?? 0,
          data.lastAttempt ?? null,
          data.nextReview ?? null,
          data.easeFactor ?? 2.5,
          data.streak ?? 0,
          data.intervalDays ?? 0,
        ],
      );
    }

    return this.getForSkill(profileId, skillId)!;
  }

  /** Get all mastery records due for review */
  getDueForReview(profileId: string, asOfDate?: string): MasteryRecord[] {
    const date = asOfDate ?? new Date().toISOString().replace('T', ' ').slice(0, 19);
    const rows = this.db.query<MasteryRow>(
      `SELECT * FROM mastery
       WHERE profile_id = ? AND next_review IS NOT NULL AND next_review <= ?
       ORDER BY next_review ASC`,
      [profileId, date],
    );
    return rows.map(rowToMastery);
  }

  /** Get skills below a mastery threshold */
  getWeakSkills(profileId: string, threshold = 0.5): MasteryRecord[] {
    const rows = this.db.query<MasteryRow>(
      `SELECT * FROM mastery
       WHERE profile_id = ?
       AND (retention_score < ? OR transfer_score < ? OR depth_score < ?)
       ORDER BY level ASC`,
      [profileId, threshold, threshold, threshold],
    );
    return rows.map(rowToMastery);
  }

  delete(profileId: string, skillId: string): boolean {
    this.db.run(
      'DELETE FROM mastery WHERE profile_id = ? AND skill_id = ?',
      [profileId, skillId],
    );
    return this.db.getRowsModified() > 0;
  }
}
