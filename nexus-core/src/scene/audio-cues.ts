// Audio cue system — what sounds to play

import type { AudioCue, Vec3 } from '../types/scene.js';

/** Create an SFX audio cue */
export function playSfx(
  asset: string,
  volume = 1.0,
  position?: Vec3,
): AudioCue {
  return {
    id: `sfx-${asset}-${Date.now()}`,
    type: 'sfx',
    action: 'play',
    asset,
    volume,
    loop: false,
    position,
  };
}

/** Create an ambient audio cue */
export function playAmbient(
  asset: string,
  volume = 0.5,
): AudioCue {
  return {
    id: `ambient-${asset}`,
    type: 'ambient',
    action: 'play',
    asset,
    volume,
    loop: true,
  };
}

/** Create a music audio cue */
export function playMusic(
  asset: string,
  volume = 0.7,
): AudioCue {
  return {
    id: `music-${asset}`,
    type: 'music',
    action: 'play',
    asset,
    volume,
    loop: true,
  };
}

/** Create a voice audio cue */
export function playVoice(
  asset: string,
  volume = 1.0,
): AudioCue {
  return {
    id: `voice-${asset}-${Date.now()}`,
    type: 'voice',
    action: 'play',
    asset,
    volume,
    loop: false,
  };
}

/** Create a stop cue for an audio source */
export function stopAudio(id: string): AudioCue {
  return {
    id,
    type: 'sfx',
    action: 'stop',
    asset: '',
    volume: 0,
    loop: false,
  };
}

/** Create a fade-out cue */
export function fadeOut(id: string): AudioCue {
  return {
    id,
    type: 'music',
    action: 'fade_out',
    asset: '',
    volume: 0,
    loop: false,
  };
}

/** Get biome ambient sounds */
export function getBiomeAmbience(biomeId: string): AudioCue[] {
  switch (biomeId) {
    case 'workshop':
      return [playAmbient('workshop_hum', 0.3), playAmbient('tools_clinking', 0.1)];
    case 'alchemist-lab':
      return [playAmbient('bubbling_cauldron', 0.3), playAmbient('mysterious_hum', 0.2)];
    case 'crystal-caverns':
      return [playAmbient('dripping_water', 0.3), playAmbient('crystal_resonance', 0.2)];
    case 'living-forest':
      return [playAmbient('forest_birds', 0.4), playAmbient('wind_leaves', 0.3)];
    case 'library-echoes':
      return [playAmbient('page_turning', 0.2), playAmbient('whispered_words', 0.1)];
    default:
      return [playAmbient('default_ambient', 0.3)];
  }
}
