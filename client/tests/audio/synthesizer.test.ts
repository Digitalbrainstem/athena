import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundSynthesizer } from '../../src/audio/synthesizer.js';
import { SFX_REGISTRY, SFX_COUNT, getAllSFXTypes, getSFXCaption, hasSFX } from '../../src/audio/sfx-library.js';
import { BIOME_SOUNDSCAPES, BIOME_COUNT, getAllBiomeIds, getBiomeSoundscape,
  getBiomeAmbientCaption, getBiomeMusicCaption } from '../../src/audio/biome-soundscapes.js';

// ---------------------------------------------------------------------------
// Mock AudioContext for jsdom (matches existing test pattern)
// ---------------------------------------------------------------------------

class MockAudioBuffer {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  private readonly data: Float32Array[];

  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.data = [];
    for (let i = 0; i < channels; i++) {
      this.data.push(new Float32Array(length));
    }
  }

  getChannelData(channel: number): Float32Array {
    return this.data[channel];
  }
}

class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => {
    return new MockAudioBuffer(channels, length, sampleRate);
  });
  createBufferSource = vi.fn(() => ({
    buffer: null,
    loop: false,
    onended: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: { value: 0, linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }));
}

vi.stubGlobal('AudioContext', MockAudioContext);

describe('SoundSynthesizer', () => {
  let ctx: MockAudioContext;
  let synth: SoundSynthesizer;

  beforeEach(() => {
    ctx = new MockAudioContext();
    synth = new SoundSynthesizer(ctx as unknown as AudioContext);
  });

  // -----------------------------------------------------------------------
  // SFX Library
  // -----------------------------------------------------------------------

  describe('SFX Library', () => {
    it('has 200+ SFX defined', () => {
      expect(SFX_COUNT).toBeGreaterThanOrEqual(200);
    });

    it('every SFX has a caption', () => {
      for (const [type, recipe] of Object.entries(SFX_REGISTRY)) {
        expect(recipe.caption).toBeTruthy();
        expect(recipe.caption.startsWith('[')).toBe(true);
        expect(recipe.caption.endsWith(']')).toBe(true);
      }
    });

    it('every SFX has a positive duration', () => {
      for (const [type, recipe] of Object.entries(SFX_REGISTRY)) {
        expect(recipe.duration).toBeGreaterThan(0);
      }
    });

    it('no SFX contains negative/failure sounds', () => {
      const forbiddenWords = ['fail', 'error', 'wrong', 'bad', 'negative', 'buzzer', 'sad', 'angry', 'punishment'];
      for (const [type, recipe] of Object.entries(SFX_REGISTRY)) {
        const lower = `${type} ${recipe.caption}`.toLowerCase();
        for (const word of forbiddenWords) {
          expect(lower).not.toContain(word);
        }
      }
    });

    it('getAllSFXTypes returns all types', () => {
      const types = getAllSFXTypes();
      expect(types.length).toBe(SFX_COUNT);
    });

    it('hasSFX works for known and unknown types', () => {
      expect(hasSFX('gentle-success')).toBe(true);
      expect(hasSFX('nonexistent-sfx')).toBe(false);
    });

    it('getSFXCaption returns caption for known types', () => {
      expect(getSFXCaption('gentle-success')).toBe('[Gentle success chime]');
    });

    it('getSFXCaption returns fallback for unknown types', () => {
      expect(getSFXCaption('unknown')).toBe('[unknown]');
    });

    it('includes all required UI sounds', () => {
      const uiSounds = [
        'gentle-success', 'discovery-sparkle', 'quest-start-chime',
        'menu-select', 'menu-back', 'ui-menu-open', 'ui-menu-close',
        'ui-menu-navigate', 'ui-inventory-open', 'ui-inventory-close',
        'ui-save-game', 'ui-map-open',
      ];
      for (const sfx of uiSounds) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all footstep variations', () => {
      const footsteps = [
        'footstep-stone', 'footstep-wood', 'footstep-grass',
        'footstep-metal', 'footstep-sand', 'footstep-water',
      ];
      for (const sfx of footsteps) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all water sounds', () => {
      const water = ['water-splash', 'water-flowing', 'water-drip'];
      for (const sfx of water) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all fire sounds', () => {
      expect(hasSFX('fire-crackle')).toBe(true);
      expect(hasSFX('fire-whoosh')).toBe(true);
    });

    it('includes all wind sounds', () => {
      expect(hasSFX('wind-gentle')).toBe(true);
      expect(hasSFX('wind-strong')).toBe(true);
    });

    it('includes all crystal sounds', () => {
      expect(hasSFX('crystal-chime')).toBe(true);
      expect(hasSFX('crystal-hum')).toBe(true);
    });

    it('includes all mechanical sounds', () => {
      const mech = ['gear-turn', 'gear-click', 'hammer-tap', 'anvil-ring'];
      for (const sfx of mech) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all crafting sounds', () => {
      expect(hasSFX('potion-bubble')).toBe(true);
      expect(hasSFX('potion-pour')).toBe(true);
    });

    it('includes all door sounds', () => {
      expect(hasSFX('door-open')).toBe(true);
      expect(hasSFX('door-close')).toBe(true);
    });

    it('includes all book sounds', () => {
      expect(hasSFX('book-open')).toBe(true);
      expect(hasSFX('page-turn')).toBe(true);
    });

    it('includes all nature sounds', () => {
      const nature = [
        'bird-chirp', 'bird-song', 'insect-buzz', 'leaves-rustle',
        'rain-light', 'rain-heavy', 'thunder', 'frog-croak', 'owl-hoot',
      ];
      for (const sfx of nature) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all science sounds', () => {
      const science = [
        'electric-zap', 'electric-hum', 'chemical-fizz', 'chemical-bubble',
        'telescope-focus', 'heartbeat-monitor', 'typing-keyboard',
      ];
      for (const sfx of science) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all feedback sounds', () => {
      const feedback = [
        'feedback-correct-chime', 'feedback-try-again-soft', 'feedback-build-click',
        'feedback-build-crumble-playful', 'feedback-craft-bubble-sparkle',
        'feedback-craft-poof', 'feedback-quest-complete', 'feedback-story-fragment',
        'feedback-level-up-glow',
      ];
      for (const sfx of feedback) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('includes all companion tones', () => {
      const companion = [
        'companion-greet', 'companion-excited', 'companion-thinking',
        'companion-celebrating', 'companion-curious', 'companion-impressed',
        'companion-gentle-redirect',
      ];
      for (const sfx of companion) {
        expect(hasSFX(sfx)).toBe(true);
      }
    });

    it('every oscillator step has valid frequency range', () => {
      for (const [_type, recipe] of Object.entries(SFX_REGISTRY)) {
        for (const osc of recipe.oscillators) {
          expect(osc.frequency).toBeGreaterThan(0);
          expect(osc.frequency).toBeLessThan(22000);
          if (osc.frequencyEnd !== undefined) {
            expect(osc.frequencyEnd).toBeGreaterThan(0);
            expect(osc.frequencyEnd).toBeLessThan(22000);
          }
        }
      }
    });

    it('every noise step has valid color', () => {
      for (const [_type, recipe] of Object.entries(SFX_REGISTRY)) {
        for (const noise of recipe.noises) {
          expect(['white', 'pink', 'brown']).toContain(noise.color);
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // Biome Soundscapes
  // -----------------------------------------------------------------------

  describe('Biome Soundscapes', () => {
    it('has exactly 27 biomes defined', () => {
      expect(BIOME_COUNT).toBe(27);
    });

    it('every biome has an ambient caption', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.ambientCaption).toBeTruthy();
        expect(scape.ambientCaption.startsWith('[')).toBe(true);
        expect(scape.ambientCaption.endsWith(']')).toBe(true);
      }
    });

    it('every biome has music captions for all 3 layers', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.musicCaptions.ambient).toBeTruthy();
        expect(scape.musicCaptions.activity).toBeTruthy();
        expect(scape.musicCaptions.intensity).toBeTruthy();
      }
    });

    it('every biome has a valid musical key', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.keyRoot).toBeGreaterThan(0);
        expect(scape.keyRoot).toBeLessThan(2000);
      }
    });

    it('every biome has pentatonic scale ratios', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.scaleRatios.length).toBe(5);
        expect(scape.scaleRatios[0]).toBe(1);
      }
    });

    it('every biome has a reasonable tempo', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.tempoBase).toBeGreaterThanOrEqual(40);
        expect(scape.tempoBase).toBeLessThanOrEqual(120);
      }
    });

    it('every biome has a reverb mix between 0 and 1', () => {
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        expect(scape.reverbMix).toBeGreaterThanOrEqual(0);
        expect(scape.reverbMix).toBeLessThanOrEqual(1);
      }
    });

    it('getBiomeSoundscape returns correct biome', () => {
      const scape = getBiomeSoundscape('workshop');
      expect(scape).toBeDefined();
      expect(scape!.biomeId).toBe('workshop');
    });

    it('getBiomeSoundscape returns undefined for unknown biome', () => {
      expect(getBiomeSoundscape('nonexistent')).toBeUndefined();
    });

    it('getAllBiomeIds returns all biome IDs', () => {
      const ids = getAllBiomeIds();
      expect(ids.length).toBe(27);
      expect(ids).toContain('workshop');
      expect(ids).toContain('living-forest');
      expect(ids).toContain('crystal-caverns');
    });

    it('getBiomeAmbientCaption works for known and unknown biomes', () => {
      expect(getBiomeAmbientCaption('workshop')).toContain('Workshop');
      expect(getBiomeAmbientCaption('unknown')).toBe('[unknown ambient sounds]');
    });

    it('getBiomeMusicCaption works for all layers', () => {
      expect(getBiomeMusicCaption('workshop', 'ambient')).toContain('workshop');
      expect(getBiomeMusicCaption('workshop', 'activity')).toContain('workshop');
      expect(getBiomeMusicCaption('workshop', 'intensity')).toContain('workshop');
    });

    it('includes all 27 required biomes', () => {
      const required = [
        'workshop', 'alchemist-lab', 'crystal-caverns', 'living-forest',
        'library-echoes', 'observatory', 'ancient-ruins', 'trading-post',
        'architects-domain', 'code-forge', 'healers-sanctuary', 'hospital',
        'farm', 'laboratory', 'explorers-map', 'time-rift', 'storm-tower',
        'arena', 'shipyard', 'music-hall', 'digital-world', 'space-station',
        'debate-hall', 'gallery', 'newsroom', 'theater', 'marketplace',
      ];
      for (const biomeId of required) {
        expect(BIOME_SOUNDSCAPES[biomeId]).toBeDefined();
      }
    });

    it('no biome has negative/failure sounds in captions', () => {
      const forbiddenWords = ['fail', 'error', 'wrong', 'bad', 'negative', 'punishment'];
      for (const [id, scape] of Object.entries(BIOME_SOUNDSCAPES)) {
        const all = [
          scape.ambientCaption,
          scape.musicCaptions.ambient,
          scape.musicCaptions.activity,
          scape.musicCaptions.intensity,
        ].join(' ').toLowerCase();
        for (const word of forbiddenWords) {
          expect(all).not.toContain(word);
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // SoundSynthesizer
  // -----------------------------------------------------------------------

  describe('SFX generation', () => {
    it('generates a buffer for a known SFX type', () => {
      const buffer = synth.generateSFX('gentle-success');
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('returns a silent buffer for unknown SFX type', () => {
      const buffer = synth.generateSFX('nonexistent-sfx');
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('caches generated SFX buffers', () => {
      const buffer1 = synth.generateSFX('menu-select');
      const buffer2 = synth.generateSFX('menu-select');
      expect(buffer1).toBe(buffer2);
    });

    it('generates different buffers for different types', () => {
      const buffer1 = synth.generateSFX('gentle-success');
      const buffer2 = synth.generateSFX('menu-select');
      expect(buffer1).not.toBe(buffer2);
    });

    it('generates all SFX types without error', () => {
      for (const type of getAllSFXTypes()) {
        expect(() => synth.generateSFX(type)).not.toThrow();
      }
    });

    it('generated SFX has correct channel count', () => {
      const buffer = synth.generateSFX('gentle-success');
      expect(buffer.numberOfChannels).toBe(1);
    });

    it('generated SFX has non-zero samples for oscillator-based sounds', () => {
      const buffer = synth.generateSFX('gentle-success');
      const data = buffer.getChannelData(0);
      const hasNonZero = data.some(v => v !== 0);
      expect(hasNonZero).toBe(true);
    });
  });

  describe('Ambient generation', () => {
    it('generates an ambient buffer for a known biome', () => {
      const buffer = synth.generateAmbient('workshop');
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('returns a silent buffer for unknown biome', () => {
      const buffer = synth.generateAmbient('nonexistent');
      expect(buffer).toBeDefined();
    });

    it('caches ambient buffers', () => {
      const buffer1 = synth.generateAmbient('workshop');
      const buffer2 = synth.generateAmbient('workshop');
      expect(buffer1).toBe(buffer2);
    });

    it('generates ambient for all 27 biomes', () => {
      for (const biomeId of getAllBiomeIds()) {
        expect(() => synth.generateAmbient(biomeId)).not.toThrow();
      }
    });
  });

  describe('Music layer generation', () => {
    it('generates a music layer for a known biome', () => {
      const buffer = synth.generateMusicLayer('workshop', 'ambient');
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates all 3 layers', () => {
      for (const layer of ['ambient', 'activity', 'intensity'] as const) {
        const buffer = synth.generateMusicLayer('workshop', layer);
        expect(buffer).toBeDefined();
        expect(buffer.length).toBeGreaterThan(0);
      }
    });

    it('returns silence for unknown biome', () => {
      const buffer = synth.generateMusicLayer('nonexistent', 'ambient');
      expect(buffer).toBeDefined();
    });

    it('caches music layer buffers', () => {
      const buffer1 = synth.generateMusicLayer('workshop', 'ambient');
      const buffer2 = synth.generateMusicLayer('workshop', 'ambient');
      expect(buffer1).toBe(buffer2);
    });

    it('generates music for all biomes without error', () => {
      for (const biomeId of getAllBiomeIds()) {
        for (const layer of ['ambient', 'activity', 'intensity'] as const) {
          expect(() => synth.generateMusicLayer(biomeId, layer)).not.toThrow();
        }
      }
    });
  });

  describe('Companion tones', () => {
    it('generates tones for known emotions', () => {
      const emotions = ['greet', 'excited', 'thinking', 'celebrating', 'curious', 'impressed', 'gentle-redirect'];
      for (const emotion of emotions) {
        const buffer = synth.generateCompanionTone(emotion);
        expect(buffer).toBeDefined();
        expect(buffer.length).toBeGreaterThan(0);
      }
    });

    it('falls back to greet for unknown emotions', () => {
      const buffer = synth.generateCompanionTone('unknown-emotion');
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('Caption retrieval', () => {
    it('getCaptionForSFX returns caption for known types', () => {
      expect(synth.getCaptionForSFX('gentle-success')).toBe('[Gentle success chime]');
    });

    it('getCaptionForAmbient returns caption for known biomes', () => {
      expect(synth.getCaptionForAmbient('workshop')).toContain('Workshop');
    });

    it('getCaptionForMusic returns caption for known biome layers', () => {
      expect(synth.getCaptionForMusic('workshop', 'ambient')).toContain('workshop');
    });

    it('all SFX have caption text registered', () => {
      for (const type of getAllSFXTypes()) {
        const caption = synth.getCaptionForSFX(type);
        expect(caption).toBeTruthy();
        expect(caption.startsWith('[')).toBe(true);
      }
    });

    it('all biome ambients have caption text', () => {
      for (const biomeId of getAllBiomeIds()) {
        const caption = synth.getCaptionForAmbient(biomeId);
        expect(caption).toBeTruthy();
        expect(caption.startsWith('[')).toBe(true);
      }
    });

    it('all biome music layers have caption text', () => {
      for (const biomeId of getAllBiomeIds()) {
        for (const layer of ['ambient', 'activity', 'intensity'] as const) {
          const caption = synth.getCaptionForMusic(biomeId, layer);
          expect(caption).toBeTruthy();
          expect(caption.startsWith('[')).toBe(true);
        }
      }
    });
  });

  describe('Cache management', () => {
    it('starts with empty cache', () => {
      expect(synth.cacheSize).toBe(0);
    });

    it('cacheSize increases after generation', () => {
      synth.generateSFX('gentle-success');
      expect(synth.cacheSize).toBe(1);
    });

    it('clearCache empties the cache', () => {
      synth.generateSFX('gentle-success');
      synth.generateSFX('menu-select');
      expect(synth.cacheSize).toBe(2);
      synth.clearCache();
      expect(synth.cacheSize).toBe(0);
    });

    it('regenerates after cache clear', () => {
      const buffer1 = synth.generateSFX('gentle-success');
      synth.clearCache();
      const buffer2 = synth.generateSFX('gentle-success');
      expect(buffer2).toBeDefined();
      // After cache clear, should be a new buffer (not the same instance)
      expect(buffer1).not.toBe(buffer2);
    });
  });
});
