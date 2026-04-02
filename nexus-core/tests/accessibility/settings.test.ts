import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  sanitizeSettings,
  applyPreset,
  mergeSettings,
} from '../../src/accessibility/settings.js';

describe('AccessibilitySettings', () => {
  describe('DEFAULT_ACCESSIBILITY_SETTINGS', () => {
    it('has all expected fields', () => {
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.colorBlindMode).toBe('none');
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.highContrast).toBe(false);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion).toBe(false);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.fontSize).toBe(100);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.fontFamily).toBe('system');
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.lineSpacing).toBe(1.4);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.oneSwitchMode).toBe(false);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.subtitles).toBe(false);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.soundCaptions).toBe(false);
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.preset).toBe('none');
    });

    it('has maxChoices defaulting to 4', () => {
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.maxChoices).toBe(4);
    });

    it('has companionSpeechSpeed at 100', () => {
      expect(DEFAULT_ACCESSIBILITY_SETTINGS.companionSpeechSpeed).toBe(100);
    });
  });

  describe('sanitizeSettings', () => {
    it('returns defaults for empty partial', () => {
      const result = sanitizeSettings({});
      expect(result).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
    });

    it('clamps fontSize to 50-200', () => {
      expect(sanitizeSettings({ fontSize: 10 }).fontSize).toBe(50);
      expect(sanitizeSettings({ fontSize: 300 }).fontSize).toBe(200);
      expect(sanitizeSettings({ fontSize: 120 }).fontSize).toBe(120);
    });

    it('clamps lineSpacing to 1.0-2.0', () => {
      expect(sanitizeSettings({ lineSpacing: 0.5 }).lineSpacing).toBe(1.0);
      expect(sanitizeSettings({ lineSpacing: 3.0 }).lineSpacing).toBe(2.0);
      expect(sanitizeSettings({ lineSpacing: 1.5 }).lineSpacing).toBe(1.5);
    });

    it('clamps scanSpeed to 0.5-5.0', () => {
      expect(sanitizeSettings({ scanSpeed: 0.1 }).scanSpeed).toBe(0.5);
      expect(sanitizeSettings({ scanSpeed: 10 }).scanSpeed).toBe(5.0);
    });

    it('clamps inputDebounce to 100-1000', () => {
      expect(sanitizeSettings({ inputDebounce: 50 }).inputDebounce).toBe(100);
      expect(sanitizeSettings({ inputDebounce: 2000 }).inputDebounce).toBe(1000);
    });

    it('clamps holdDuration to 200-3000', () => {
      expect(sanitizeSettings({ holdDuration: 50 }).holdDuration).toBe(200);
      expect(sanitizeSettings({ holdDuration: 5000 }).holdDuration).toBe(3000);
    });

    it('clamps maxChoices to 2-4', () => {
      expect(sanitizeSettings({ maxChoices: 1 }).maxChoices).toBe(2);
      expect(sanitizeSettings({ maxChoices: 10 }).maxChoices).toBe(4);
      expect(sanitizeSettings({ maxChoices: 3 }).maxChoices).toBe(3);
    });

    it('clamps companionSpeechSpeed to 50-150', () => {
      expect(sanitizeSettings({ companionSpeechSpeed: 10 }).companionSpeechSpeed).toBe(50);
      expect(sanitizeSettings({ companionSpeechSpeed: 200 }).companionSpeechSpeed).toBe(150);
    });

    it('preserves non-numeric fields', () => {
      const result = sanitizeSettings({
        colorBlindMode: 'deuteranopia',
        highContrast: true,
        fontFamily: 'opendyslexic',
      });
      expect(result.colorBlindMode).toBe('deuteranopia');
      expect(result.highContrast).toBe(true);
      expect(result.fontFamily).toBe('opendyslexic');
    });

    it('rounds numeric values appropriately', () => {
      const result = sanitizeSettings({ fontSize: 99.7, maxChoices: 2.9 });
      expect(result.fontSize).toBe(100);
      expect(result.maxChoices).toBe(3);
    });
  });

  describe('applyPreset', () => {
    it('returns defaults for "none" preset', () => {
      const result = applyPreset('none');
      expect(result.highContrast).toBe(false);
      expect(result.preset).toBe('none');
    });

    it('applies visual preset', () => {
      const result = applyPreset('visual');
      expect(result.highContrast).toBe(true);
      expect(result.fontSize).toBe(150);
      expect(result.fontFamily).toBe('high-legibility');
      expect(result.preset).toBe('visual');
    });

    it('applies motor preset', () => {
      const result = applyPreset('motor');
      expect(result.oneSwitchMode).toBe(true);
      expect(result.stickyKeys).toBe(true);
      expect(result.inputDebounce).toBe(400);
      expect(result.preset).toBe('motor');
    });

    it('applies cognitive preset', () => {
      const result = applyPreset('cognitive');
      expect(result.simplifiedUI).toBe(true);
      expect(result.maxChoices).toBe(2);
      expect(result.autoRepeat).toBe(true);
      expect(result.extendedPacing).toBe(true);
      expect(result.preset).toBe('cognitive');
    });

    it('applies auditory preset', () => {
      const result = applyPreset('auditory');
      expect(result.subtitles).toBe(true);
      expect(result.soundCaptions).toBe(true);
      expect(result.visualSoundIndicators).toBe(true);
      expect(result.hapticFeedback).toBe(true);
      expect(result.preset).toBe('auditory');
    });

    it('applies low-vision preset', () => {
      const result = applyPreset('low-vision');
      expect(result.highContrast).toBe(true);
      expect(result.fontSize).toBe(200);
      expect(result.reducedMotion).toBe(true);
      expect(result.subtitles).toBe(true);
      expect(result.preset).toBe('low-vision');
    });

    it('applies full preset with all accommodations', () => {
      const result = applyPreset('full');
      expect(result.highContrast).toBe(true);
      expect(result.oneSwitchMode).toBe(true);
      expect(result.simplifiedUI).toBe(true);
      expect(result.subtitles).toBe(true);
      expect(result.soundCaptions).toBe(true);
      expect(result.hapticFeedback).toBe(true);
      expect(result.preset).toBe('full');
    });

    it('presets produce valid settings (all values in range)', () => {
      const presets = ['visual', 'motor', 'cognitive', 'auditory', 'low-vision', 'full'] as const;
      for (const p of presets) {
        const result = applyPreset(p);
        expect(result.fontSize).toBeGreaterThanOrEqual(50);
        expect(result.fontSize).toBeLessThanOrEqual(200);
        expect(result.maxChoices).toBeGreaterThanOrEqual(2);
        expect(result.maxChoices).toBeLessThanOrEqual(4);
        expect(result.companionSpeechSpeed).toBeGreaterThanOrEqual(50);
        expect(result.companionSpeechSpeed).toBeLessThanOrEqual(150);
      }
    });
  });

  describe('mergeSettings', () => {
    it('overrides specific fields', () => {
      const base = applyPreset('none');
      const result = mergeSettings(base, { fontSize: 180, highContrast: true });
      expect(result.fontSize).toBe(180);
      expect(result.highContrast).toBe(true);
      expect(result.colorBlindMode).toBe('none'); // unchanged
    });

    it('clamps overridden values', () => {
      const base = applyPreset('none');
      const result = mergeSettings(base, { fontSize: 999 });
      expect(result.fontSize).toBe(200);
    });

    it('merges preset over existing settings', () => {
      const base = applyPreset('visual');
      const result = mergeSettings(base, { subtitles: true });
      expect(result.highContrast).toBe(true); // from visual preset
      expect(result.subtitles).toBe(true); // new override
    });
  });
});
