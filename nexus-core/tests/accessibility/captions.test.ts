import { describe, it, expect } from 'vitest';
import { generateCaption, generateCaptions, SFX_DESCRIPTIONS, AMBIENT_DESCRIPTIONS } from '../../src/accessibility/captions.js';
import type { AudioCue } from '../../src/types/scene.js';

function makeCue(overrides: Partial<AudioCue>): AudioCue {
  return {
    id: 'test',
    type: 'sfx',
    action: 'play',
    asset: 'click',
    volume: 1,
    loop: false,
    ...overrides,
  };
}

describe('Caption System', () => {
  describe('generateCaption — SFX', () => {
    it('generates caption for known SFX', () => {
      const cap = generateCaption(makeCue({ type: 'sfx', asset: 'crystal_chime' }));
      expect(cap.text).toBe('[Crystal chime]');
      expect(cap.type).toBe('sfx');
    });

    it('humanizes unknown SFX asset names', () => {
      const cap = generateCaption(makeCue({ type: 'sfx', asset: 'magic_sparkle' }));
      expect(cap.text).toBe('[Magic Sparkle]');
    });

    it('includes timestamp', () => {
      const cap = generateCaption(makeCue({ type: 'sfx', asset: 'click' }), 5000);
      expect(cap.timestamp).toBe(5000);
    });

    it('uses 0 as default timestamp', () => {
      const cap = generateCaption(makeCue({ type: 'sfx', asset: 'click' }));
      expect(cap.timestamp).toBe(0);
    });
  });

  describe('generateCaption — Voice', () => {
    it('extracts speaker from "speaker:dialogue" format', () => {
      const cap = generateCaption(makeCue({ type: 'voice', asset: 'Buddy:Hello there friend!' }));
      expect(cap.type).toBe('voice');
      expect(cap.speaker).toBe('Buddy');
      expect(cap.text).toBe('Hello there friend!');
    });

    it('defaults speaker to Narrator for plain assets', () => {
      const cap = generateCaption(makeCue({ type: 'voice', asset: 'welcome_message' }));
      expect(cap.speaker).toBe('Narrator');
      expect(cap.text).toBe('Welcome Message');
    });
  });

  describe('generateCaption — Ambient', () => {
    it('generates caption for known ambient sounds', () => {
      const cap = generateCaption(makeCue({ type: 'ambient', asset: 'forest_ambient' }));
      expect(cap.text).toContain('[Ambient:');
      expect(cap.text).toContain('birdsong');
      expect(cap.type).toBe('ambient');
    });

    it('humanizes unknown ambient names', () => {
      const cap = generateCaption(makeCue({ type: 'ambient', asset: 'underwater_deep' }));
      expect(cap.text).toBe('[Ambient: Underwater Deep]');
    });
  });

  describe('generateCaption — Music', () => {
    it('generates caption for known music', () => {
      const cap = generateCaption(makeCue({ type: 'music', asset: 'calm_exploration' }));
      expect(cap.text).toBe('[Music: Calm exploration]');
      expect(cap.type).toBe('music');
    });

    it('shows "[Music fades]" for stop actions', () => {
      const cap = generateCaption(makeCue({ type: 'music', asset: 'calm_exploration', action: 'stop' }));
      expect(cap.text).toBe('[Music fades]');
    });

    it('shows "[Music fades]" for fade_out actions', () => {
      const cap = generateCaption(makeCue({ type: 'music', asset: 'calm_exploration', action: 'fade_out' }));
      expect(cap.text).toBe('[Music fades]');
    });
  });

  describe('generateCaptions', () => {
    it('generates captions for an array of cues', () => {
      const cues: AudioCue[] = [
        makeCue({ type: 'sfx', asset: 'crystal_chime' }),
        makeCue({ type: 'voice', asset: 'Buddy:Great job!' }),
        makeCue({ type: 'music', asset: 'celebration' }),
      ];
      const captions = generateCaptions(cues, 1000);
      expect(captions).toHaveLength(3);
      expect(captions[0]!.text).toBe('[Crystal chime]');
      expect(captions[1]!.speaker).toBe('Buddy');
      expect(captions[2]!.text).toBe('[Music: Celebration]');
      captions.forEach(c => expect(c.timestamp).toBe(1000));
    });

    it('returns empty array for no cues', () => {
      expect(generateCaptions([])).toEqual([]);
    });
  });

  describe('SFX_DESCRIPTIONS', () => {
    it('has descriptions for common sounds', () => {
      expect(SFX_DESCRIPTIONS['crystal_chime']).toBeDefined();
      expect(SFX_DESCRIPTIONS['footsteps_stone']).toBeDefined();
      expect(SFX_DESCRIPTIONS['item_pickup']).toBeDefined();
      expect(SFX_DESCRIPTIONS['quest_complete']).toBeDefined();
    });

    it('all descriptions are non-empty strings', () => {
      for (const [key, desc] of Object.entries(SFX_DESCRIPTIONS)) {
        expect(desc, `SFX "${key}" should have description`).toBeTruthy();
        expect(typeof desc).toBe('string');
      }
    });
  });

  describe('AMBIENT_DESCRIPTIONS', () => {
    it('has descriptions for all biome ambients', () => {
      expect(AMBIENT_DESCRIPTIONS['workshop_ambient']).toBeDefined();
      expect(AMBIENT_DESCRIPTIONS['forest_ambient']).toBeDefined();
      expect(AMBIENT_DESCRIPTIONS['cavern_ambient']).toBeDefined();
    });
  });
});
