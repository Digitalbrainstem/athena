// Accessibility settings — defaults and preset factories

import type { AccessibilitySettings, AccessibilityPreset } from '../types/accessibility.js';

/** The default settings for a brand-new profile (everything off / default). */
export const DEFAULT_ACCESSIBILITY_SETTINGS: Readonly<AccessibilitySettings> = {
  // Visual
  colorBlindMode: 'none',
  highContrast: false,
  reducedMotion: false,
  fontSize: 100,
  fontFamily: 'system',
  lineSpacing: 1.4,

  // Motor
  oneSwitchMode: false,
  scanSpeed: 2.0,
  inputDebounce: 200,
  holdDuration: 500,
  stickyKeys: false,

  // Cognitive
  simplifiedUI: false,
  maxChoices: 4,
  companionSpeechSpeed: 100,
  autoRepeat: false,
  extendedPacing: false,

  // Auditory
  subtitles: false,
  soundCaptions: false,
  visualSoundIndicators: false,
  hapticFeedback: false,

  // Presets
  preset: 'none',
};

// ---------------------------------------------------------------------------
// Clamp helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Sanitize / clamp all accessibility values to their valid ranges. */
export function sanitizeSettings(partial: Partial<AccessibilitySettings>): AccessibilitySettings {
  const base: AccessibilitySettings = { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...partial };
  return {
    ...base,
    fontSize: clamp(Math.round(base.fontSize), 50, 200),
    lineSpacing: clamp(Math.round(base.lineSpacing * 10) / 10, 1.0, 2.0),
    scanSpeed: clamp(Math.round(base.scanSpeed * 10) / 10, 0.5, 5.0),
    inputDebounce: clamp(Math.round(base.inputDebounce), 100, 1000),
    holdDuration: clamp(Math.round(base.holdDuration), 200, 3000),
    maxChoices: clamp(Math.round(base.maxChoices), 2, 4),
    companionSpeechSpeed: clamp(Math.round(base.companionSpeechSpeed), 50, 150),
  };
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const PRESET_OVERRIDES: Record<Exclude<AccessibilityPreset, 'none'>, Partial<AccessibilitySettings>> = {
  visual: {
    highContrast: true,
    fontSize: 150,
    fontFamily: 'high-legibility',
    lineSpacing: 1.8,
  },
  motor: {
    oneSwitchMode: true,
    scanSpeed: 2.0,
    inputDebounce: 400,
    holdDuration: 1000,
    stickyKeys: true,
  },
  cognitive: {
    simplifiedUI: true,
    maxChoices: 2,
    companionSpeechSpeed: 75,
    autoRepeat: true,
    extendedPacing: true,
    fontSize: 130,
    lineSpacing: 1.8,
  },
  auditory: {
    subtitles: true,
    soundCaptions: true,
    visualSoundIndicators: true,
    hapticFeedback: true,
  },
  'low-vision': {
    highContrast: true,
    fontSize: 200,
    fontFamily: 'high-legibility',
    lineSpacing: 2.0,
    reducedMotion: true,
    subtitles: true,
    soundCaptions: true,
  },
  full: {
    highContrast: true,
    reducedMotion: true,
    fontSize: 150,
    fontFamily: 'high-legibility',
    lineSpacing: 1.8,
    oneSwitchMode: true,
    scanSpeed: 2.5,
    inputDebounce: 400,
    holdDuration: 1000,
    stickyKeys: true,
    simplifiedUI: true,
    maxChoices: 2,
    companionSpeechSpeed: 75,
    autoRepeat: true,
    extendedPacing: true,
    subtitles: true,
    soundCaptions: true,
    visualSoundIndicators: true,
    hapticFeedback: true,
  },
};

/** Apply a named accessibility preset on top of the defaults. */
export function applyPreset(preset: AccessibilityPreset): AccessibilitySettings {
  if (preset === 'none') {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS, preset: 'none' };
  }
  const overrides = PRESET_OVERRIDES[preset];
  return sanitizeSettings({ ...overrides, preset });
}

/** Merge partial overrides into an existing settings object. */
export function mergeSettings(
  current: AccessibilitySettings,
  overrides: Partial<AccessibilitySettings>,
): AccessibilitySettings {
  return sanitizeSettings({ ...current, ...overrides });
}
