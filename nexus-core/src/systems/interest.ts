// InterestTracker — implicit interest detection from player behavior
// Interests are ONLY detected by behavior. NEVER from demographics.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { DatabaseConnection } from '../db/connection.js';
import type {
  InterestSignal,
  InterestWeights,
  ThemeWeights,
  BiomeRecommendation,
  InterestCategory,
} from '../types/interest.js';
import {
  INTEREST_CATEGORIES,
  SIGNAL_TYPE_MULTIPLIERS,
  BIOME_INTEREST_MAP,
  INTEREST_DECAY_RATE,
} from '../types/interest.js';

// --- Create empty weights record ---

function emptyWeights(): InterestWeights {
  const w: Record<string, number> = {};
  for (const cat of INTEREST_CATEGORIES) {
    w[cat] = 0;
  }
  return w as InterestWeights;
}

// --- InterestRepository — lightweight DB access ---

export class InterestRepository {
  constructor(private db: DatabaseConnection) {}

  /** Record a new interest signal */
  recordSignal(profileId: string, signal: InterestSignal): void {
    this.db.run(
      `INSERT INTO interest_signals (profile_id, signal_type, category, weight, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [profileId, signal.type, signal.category, signal.weight, signal.timestamp],
    );
  }

  /** Get all signals for a profile */
  getSignals(profileId: string): InterestSignal[] {
    return this.db.query<{
      signal_type: string;
      category: string;
      weight: number;
      timestamp: string;
    }>(
      'SELECT signal_type, category, weight, timestamp FROM interest_signals WHERE profile_id = ? ORDER BY timestamp DESC',
      [profileId],
    ).map((row) => ({
      type: row.signal_type as InterestSignal['type'],
      category: row.category as InterestCategory,
      weight: row.weight,
      timestamp: row.timestamp,
    }));
  }

  /** Get stored interest weights */
  getWeights(profileId: string): InterestWeights {
    const rows = this.db.query<{ category: string; weight: number }>(
      'SELECT category, weight FROM interest_weights WHERE profile_id = ?',
      [profileId],
    );

    const weights = emptyWeights();
    for (const row of rows) {
      if (row.category in weights) {
        (weights as Record<string, number>)[row.category] = row.weight;
      }
    }
    return weights;
  }

  /** Upsert interest weights */
  saveWeights(profileId: string, weights: InterestWeights): void {
    for (const cat of INTEREST_CATEGORIES) {
      this.db.run(
        `INSERT INTO interest_weights (profile_id, category, weight, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT (profile_id, category)
         DO UPDATE SET weight = excluded.weight, updated_at = excluded.updated_at`,
        [profileId, cat, weights[cat]],
      );
    }
  }

  /** Get count of signals for a profile */
  getSignalCount(profileId: string): number {
    const row = this.db.queryOne<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM interest_signals WHERE profile_id = ?',
      [profileId],
    );
    return row?.cnt ?? 0;
  }
}

// --- InterestTracker system ---

export class InterestTracker implements System {
  readonly name = 'interest';
  readonly priority = 25;

  private repo: InterestRepository | null = null;
  private pendingSignals: { profileId: string; signal: InterestSignal }[] = [];

  setRepository(repo: InterestRepository): void {
    this.repo = repo;
  }

  /** Queue a behavior signal for processing */
  recordSignal(profileId: string, signal: InterestSignal): void {
    this.pendingSignals.push({ profileId, signal });
  }

  update(_world: World, _dt: number): void {
    if (!this.repo) return;

    const signals = this.pendingSignals.splice(0);
    for (const { profileId, signal } of signals) {
      this.processSignal(profileId, signal);
    }
  }

  /** Get current interest weights with exponential decay applied */
  getWeights(profileId: string): InterestWeights {
    if (!this.repo) return emptyWeights();

    const signals = this.repo.getSignals(profileId);
    if (signals.length === 0) {
      return this.repo.getWeights(profileId);
    }

    return this.computeWeights(signals);
  }

  /** Get biome recommendations based on current interests */
  recommendBiomes(profileId: string): BiomeRecommendation[] {
    const weights = this.getWeights(profileId);
    const recommendations: BiomeRecommendation[] = [];

    for (const [biomeId, categories] of Object.entries(BIOME_INTEREST_MAP)) {
      let score = 0;
      const matchedCategories: string[] = [];

      for (const cat of categories) {
        const w = weights[cat] ?? 0;
        score += w;
        if (w > 0.1) {
          matchedCategories.push(cat);
        }
      }

      if (score > 0) {
        // Average score across biome categories
        score /= categories.length;

        const reason = matchedCategories.length > 0
          ? `Matches interests: ${matchedCategories.join(', ')}`
          : 'General exploration';

        recommendations.push({ biomeId, score, reason });
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations;
  }

  /** Get theme weights for world adaptation */
  getThemeWeights(profileId: string): ThemeWeights {
    const weights = this.getWeights(profileId);

    // Find primary and secondary themes
    const sorted = INTEREST_CATEGORIES
      .map((cat) => ({ cat, weight: weights[cat] }))
      .sort((a, b) => b.weight - a.weight);

    const primary = sorted[0]!;
    const secondary = sorted[1]!;

    const weightRecord: Record<string, number> = {};
    for (const entry of sorted) {
      if (entry.weight > 0) {
        weightRecord[entry.cat] = entry.weight;
      }
    }

    return {
      primaryTheme: primary.cat,
      secondaryTheme: secondary.cat,
      weights: weightRecord,
    };
  }

  /** Compute weights from raw signals with exponential time decay */
  computeWeights(signals: InterestSignal[]): InterestWeights {
    const weights = emptyWeights();
    const now = Date.now();

    for (const signal of signals) {
      const ageMs = now - new Date(signal.timestamp).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      // Exponential decay: recent signals matter more
      const decay = Math.exp(-INTEREST_DECAY_RATE * ageDays);

      // Signal type multiplier (biome_time = 0.4, object_interact = 0.3, etc.)
      const typeMultiplier = SIGNAL_TYPE_MULTIPLIERS[signal.type] ?? 0.1;

      // Negative multiplier for abandoned quests
      const effectiveWeight = typeMultiplier < 0
        ? -signal.weight * Math.abs(typeMultiplier) * decay
        : signal.weight * typeMultiplier * decay;

      (weights as Record<string, number>)[signal.category] =
        ((weights as Record<string, number>)[signal.category] ?? 0) + effectiveWeight;
    }

    // Normalize: clamp to [0, 1]
    for (const cat of INTEREST_CATEGORIES) {
      (weights as Record<string, number>)[cat] = Math.max(
        0,
        Math.min(1, weights[cat]),
      );
    }

    return weights;
  }

  private processSignal(profileId: string, signal: InterestSignal): void {
    if (!this.repo) return;

    // Store the raw signal
    this.repo.recordSignal(profileId, signal);

    // Recompute and save weights
    const signals = this.repo.getSignals(profileId);
    const weights = this.computeWeights(signals);
    this.repo.saveWeights(profileId, weights);
  }
}
