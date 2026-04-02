// Companion types

export type PersonalityStage = 'guide' | 'partner' | 'ally' | 'peer';

export interface CompanionState {
  profileId: string;
  name: string;
  appearance?: string;
  personalityStage: PersonalityStage;
  trustLevel: number;
  traits: string[];
  memory: CompanionMemory[];
}

export interface CompanionMemory {
  timestamp: string;
  type: 'interaction' | 'achievement' | 'struggle' | 'preference';
  content: string;
  importance: number;
}

export interface CompanionConfig {
  stageThresholds: Record<PersonalityStage, { minAge: number; minTrust: number }>;
  traitOptions: string[];
}

export const DEFAULT_COMPANION_CONFIG: CompanionConfig = {
  stageThresholds: {
    guide: { minAge: 0, minTrust: 0 },
    partner: { minAge: 6, minTrust: 0.3 },
    ally: { minAge: 11, minTrust: 0.5 },
    peer: { minAge: 15, minTrust: 0.7 },
  },
  traitOptions: [
    'curious',
    'encouraging',
    'playful',
    'patient',
    'adventurous',
    'analytical',
    'creative',
    'empathetic',
  ],
};
