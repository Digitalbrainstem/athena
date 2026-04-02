// Accessibility settings and metadata types

// AccessibilityMeta is defined in craft.ts and re-exported here for convenience.
export type { AccessibilityMeta } from './craft.js';

// ---------------------------------------------------------------------------
// Per-profile accessibility settings
// ---------------------------------------------------------------------------

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type FontFamily = 'system' | 'opendyslexic' | 'high-legibility';
export type AccessibilityPreset =
  | 'none'
  | 'visual'
  | 'motor'
  | 'cognitive'
  | 'auditory'
  | 'low-vision'
  | 'full';

export interface AccessibilitySettings {
  // Visual
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  reducedMotion: boolean;
  /** Font size percentage (50–200) */
  fontSize: number;
  fontFamily: FontFamily;
  /** Line spacing multiplier (1.0–2.0) */
  lineSpacing: number;

  // Motor
  oneSwitchMode: boolean;
  /** Scan speed in seconds (0.5–5.0) */
  scanSpeed: number;
  /** Input debounce in milliseconds (100–1000) */
  inputDebounce: number;
  /** Hold duration in milliseconds (200–3000) */
  holdDuration: number;
  stickyKeys: boolean;

  // Cognitive
  simplifiedUI: boolean;
  /** Maximum choices shown per interaction (2–4) */
  maxChoices: number;
  /** Companion speech speed percentage (50–150) */
  companionSpeechSpeed: number;
  autoRepeat: boolean;
  extendedPacing: boolean;

  // Auditory
  subtitles: boolean;
  /** Show sound effect captions like "[Crystal chime]" */
  soundCaptions: boolean;
  visualSoundIndicators: boolean;
  hapticFeedback: boolean;

  // Presets
  preset: AccessibilityPreset;
}

// ---------------------------------------------------------------------------
// Accessibility metadata on content
// ---------------------------------------------------------------------------

/** Every element, compound, material, etc. carries this metadata. */
// AccessibilityMeta is now defined in craft.ts and re-exported above

// ---------------------------------------------------------------------------
// Screen-reader announcements
// ---------------------------------------------------------------------------

export type AnnouncementPriority = 'polite' | 'assertive';
export type AnnouncementCategory =
  | 'navigation'
  | 'quest'
  | 'companion'
  | 'discovery'
  | 'error';

export interface Announcement {
  text: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
}

// ---------------------------------------------------------------------------
// Captions for deaf / hard-of-hearing players
// ---------------------------------------------------------------------------

export type CaptionType = 'sfx' | 'voice' | 'ambient' | 'music';

export interface Caption {
  text: string;
  type: CaptionType;
  speaker?: string;
  /** Timestamp (ms since session start) when caption was generated */
  timestamp: number;
}
