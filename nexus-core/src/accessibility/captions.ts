// Caption generation from audio cues
// Converts AudioCue objects into readable Caption objects for deaf / HoH players.

import type { AudioCue } from '../types/scene.js';
import type { Caption, CaptionType } from '../types/accessibility.js';

// ---------------------------------------------------------------------------
// Sound-effect description map
// Reusable descriptions for common SFX assets used in the game.
// ---------------------------------------------------------------------------

const SFX_DESCRIPTIONS: Record<string, string> = {
  'crystal_chime': 'Crystal chime',
  'footsteps_stone': 'Footsteps on stone',
  'footsteps_grass': 'Footsteps on grass',
  'footsteps_wood': 'Footsteps on wood',
  'door_open': 'Door opens',
  'door_close': 'Door closes',
  'item_pickup': 'Item picked up',
  'item_drop': 'Item dropped',
  'craft_success': 'Crafting successful',
  'craft_fail': 'Crafting fizzle',
  'quest_complete': 'Quest complete fanfare',
  'quest_start': 'Quest accepted chime',
  'level_up': 'Level up fanfare',
  'companion_greet': 'Companion greeting',
  'water_splash': 'Water splash',
  'fire_crackle': 'Fire crackling',
  'wind_gust': 'Wind gust',
  'bird_song': 'Birds singing',
  'thunder': 'Thunder',
  'rain': 'Rain falling',
  'bubble': 'Bubbling liquid',
  'explosion': 'Explosion',
  'click': 'Click',
  'error_buzz': 'Error buzz',
  'success_ding': 'Success ding',
};

const AMBIENT_DESCRIPTIONS: Record<string, string> = {
  'workshop_ambient': 'Workshop ambience — gears and tinkering',
  'forest_ambient': 'Forest ambience — wind and birdsong',
  'cavern_ambient': 'Cavern ambience — dripping water and echoes',
  'lab_ambient': 'Laboratory ambience — bubbling and hissing',
  'library_ambient': 'Library ambience — quiet pages and whispers',
};

const MUSIC_DESCRIPTIONS: Record<string, string> = {
  'calm_exploration': 'Calm exploration',
  'puzzle_thinking': 'Puzzle thinking',
  'discovery_wonder': 'Discovery and wonder',
  'celebration': 'Celebration',
  'companion_theme': 'Companion theme',
  'title_theme': 'Title theme',
};

// ---------------------------------------------------------------------------
// Caption generator
// ---------------------------------------------------------------------------

/** Convert an AudioCue into a human-readable Caption. */
export function generateCaption(cue: AudioCue, sessionTimeMs?: number): Caption {
  const timestamp = sessionTimeMs ?? 0;
  const type: CaptionType = cue.type;

  switch (cue.type) {
    case 'sfx': {
      const desc = SFX_DESCRIPTIONS[cue.asset] ?? humanize(cue.asset);
      return { text: `[${desc}]`, type, timestamp };
    }
    case 'voice': {
      const speaker = extractSpeaker(cue.asset);
      return {
        text: speaker.dialogue,
        type,
        speaker: speaker.name,
        timestamp,
      };
    }
    case 'ambient': {
      const desc = AMBIENT_DESCRIPTIONS[cue.asset] ?? humanize(cue.asset);
      return { text: `[Ambient: ${desc}]`, type, timestamp };
    }
    case 'music': {
      const desc = MUSIC_DESCRIPTIONS[cue.asset] ?? humanize(cue.asset);
      if (cue.action === 'stop' || cue.action === 'fade_out') {
        return { text: `[Music fades]`, type, timestamp };
      }
      return { text: `[Music: ${desc}]`, type, timestamp };
    }
  }
}

/** Generate captions for an array of audio cues. */
export function generateCaptions(cues: AudioCue[], sessionTimeMs?: number): Caption[] {
  return cues.map((cue) => generateCaption(cue, sessionTimeMs));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function humanize(assetId: string): string {
  return assetId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract speaker name and dialogue from a voice asset id.
 * Convention: "speaker:dialogue text" or just the asset id.
 */
function extractSpeaker(asset: string): { name: string; dialogue: string } {
  const colonIdx = asset.indexOf(':');
  if (colonIdx > 0) {
    return {
      name: asset.slice(0, colonIdx).trim(),
      dialogue: asset.slice(colonIdx + 1).trim(),
    };
  }
  return { name: 'Narrator', dialogue: humanize(asset) };
}

export { SFX_DESCRIPTIONS, AMBIENT_DESCRIPTIONS, MUSIC_DESCRIPTIONS };
