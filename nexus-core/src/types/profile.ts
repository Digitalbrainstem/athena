// Profile, auth, and mastery types

import type { MasteryTier } from './components.js';
import type { AccessibilitySettings } from './accessibility.js';

export interface Profile {
  id: string;
  name: string;
  avatarData?: string;
  masteryTier: MasteryTier;
  birthDate?: string;
  createdAt: string;
  lastActive?: string;
  settings?: Record<string, unknown>;
  accessibilitySettings?: AccessibilitySettings;
}

export interface CreateProfileInput {
  id?: string;
  name: string;
  avatarData?: string;
  birthDate?: string;
  settings?: Record<string, unknown>;
  accessibilitySettings?: AccessibilitySettings;
}

export interface Auth {
  profileId: string;
  authType: 'none' | 'pin' | 'password' | 'parent';
  authHash?: string;
  parentProfileId?: string;
}

export interface MasteryRecord {
  id: number;
  profileId: string;
  skillId: string;
  level: number;
  retentionScore: number;
  transferScore: number;
  depthScore: number;
  attempts: number;
  successes: number;
  lastAttempt?: string;
  nextReview?: string;
  easeFactor: number;
  streak: number;
  intervalDays: number;
}

export interface LearningEvent {
  id?: number;
  profileId: string;
  skillId: string;
  questId?: string;
  eventType: string;
  quality: number;
  context?: string;
  responseTimeMs?: number;
  timestamp?: string;
}

export interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  streak: number;
  nextReview: string;
}
