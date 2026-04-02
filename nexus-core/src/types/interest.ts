// Interest tracking types — player behavior observation & world adaptation

// --- Interest categories ---

export const INTEREST_CATEGORIES = [
  'animals', 'nature', 'sparkly', 'machines', 'space',
  'art', 'building', 'social', 'stories', 'music',
  'medicine', 'coding', 'history', 'sports', 'cooking',
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

// --- Signal types ---

export type InterestSignalType =
  | 'biome_time' | 'object_interact' | 'choice_made' | 'item_kept'
  | 'quest_completed' | 'quest_abandoned' | 'companion_topic';

// --- Signal ---

export interface InterestSignal {
  type: InterestSignalType;
  category: InterestCategory;
  weight: number;       // signal strength 0–1
  timestamp: string;    // ISO 8601
}

// --- Weights ---

export type InterestWeights = Record<InterestCategory, number>;

// --- Theme weights for world adaptation ---

export interface ThemeWeights {
  primaryTheme: InterestCategory;
  secondaryTheme: InterestCategory;
  weights: Record<string, number>;
}

// --- Biome recommendation ---

export interface BiomeRecommendation {
  biomeId: string;
  score: number;
  reason: string;
}

// --- Signal type influence multipliers ---

export const SIGNAL_TYPE_MULTIPLIERS: Record<InterestSignalType, number> = {
  biome_time: 0.4,
  object_interact: 0.3,
  choice_made: 0.2,
  item_kept: 0.1,
  quest_completed: 0.25,
  quest_abandoned: -0.1,
  companion_topic: 0.15,
};

// --- Biome-to-category mapping ---

export const BIOME_INTEREST_MAP: Record<string, InterestCategory[]> = {
  'workshop': ['machines', 'building'],
  'alchemist-lab': ['cooking', 'nature'],
  'crystal-caverns': ['sparkly', 'nature'],
  'living-forest': ['animals', 'nature'],
  'library-echoes': ['stories', 'history'],
  'observatory': ['space', 'machines'],
  'ancient-ruins': ['history', 'stories'],
  'trading-post': ['social', 'building'],
  'architects-domain': ['building', 'art'],
  'code-forge': ['coding', 'machines'],
  'healers-sanctuary': ['medicine', 'animals'],
  'explorers-map': ['nature', 'history'],
  'time-rift': ['history', 'stories'],
  'storm-tower': ['machines', 'space'],
  'arena': ['sports', 'social'],
  'shipyard': ['building', 'machines'],
  'music-hall': ['music', 'art'],
  'gallery': ['art', 'stories'],
};

// --- Exponential decay constant (per day) ---

export const INTEREST_DECAY_RATE = 0.05;
