export { AudioManager } from './audio-manager.js';
export { CaptionSync } from './caption-sync.js';
export { SoundSynthesizer } from './synthesizer.js';
export { MusicGenerator } from './music-generator.js';
export type { MusicCaptionCallback } from './music-generator.js';
export { CompanionVoiceManager } from './companion-voice.js';
export type { Emotion } from './companion-voice.js';
export { NexusVoice } from './nexus-voice.js';
export type { NexusVoiceLine } from './nexus-voice.js';
export { SFX_REGISTRY, SFX_COUNT, getSFXCaption, hasSFX, getAllSFXTypes } from './sfx-library.js';
export type { SFXRecipe, SFXType, OscType } from './sfx-library.js';
export { BIOME_SOUNDSCAPES, BIOME_COUNT, getBiomeSoundscape, getAllBiomeIds,
  getBiomeAmbientCaption, getBiomeMusicCaption } from './biome-soundscapes.js';
export type { BiomeSoundscape, MusicLayer } from './biome-soundscapes.js';
