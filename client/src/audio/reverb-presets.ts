// ---------------------------------------------------------------------------
// Reverb Presets — procedural impulse responses for different environments
// Generates AudioBuffers usable with ConvolverNode. No external files.
// ---------------------------------------------------------------------------

export type ReverbPreset = 'outdoor' | 'room' | 'cave' | 'metallic' | 'space';

export interface ReverbConfig {
  /** Impulse response duration in seconds */
  duration: number;
  /** Decay exponent — higher = faster decay */
  decay: number;
  /** Wet/dry mix (0 = fully dry, 1 = fully wet) */
  mix: number;
  /** Post-filter cutoff Hz for warmth */
  highCut: number;
}

const PRESETS: Record<ReverbPreset, ReverbConfig> = {
  outdoor:  { duration: 0.4,  decay: 6,   mix: 0.08, highCut: 4000 },
  room:     { duration: 0.9,  decay: 3.5, mix: 0.25, highCut: 6000 },
  cave:     { duration: 3.0,  decay: 1.4, mix: 0.55, highCut: 3000 },
  metallic: { duration: 1.8,  decay: 2.2, mix: 0.35, highCut: 8000 },
  space:    { duration: 0.15, decay: 15,  mix: 0.05, highCut: 2000 },
};

/**
 * Generate a stereo impulse response AudioBuffer for a reverb preset.
 * Uses exponentially decaying filtered noise.
 */
export function generateImpulseResponse(
  ctx: AudioContext,
  preset: ReverbPreset,
): AudioBuffer {
  const cfg = PRESETS[preset];
  const length = Math.ceil(ctx.sampleRate * cfg.duration);
  const buffer = ctx.createBuffer(2, Math.max(1, length), ctx.sampleRate);
  const rc = 1 / (2 * Math.PI * cfg.highCut);
  const dt = 1 / ctx.sampleRate;
  const alpha = dt / (rc + dt);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let prev = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const envelope = Math.pow(1 - t, cfg.decay);
      const sample = (Math.random() * 2 - 1) * envelope;
      // Simple one-pole lowpass for warmth
      prev = prev + alpha * (sample - prev);
      data[i] = prev;
    }
  }

  return buffer;
}

const BIOME_REVERB_MAP: Record<string, ReverbPreset> = {
  'workshop':             'room',
  'alchemist-lab':        'room',
  'crystal-caverns':      'cave',
  'observatory':          'room',
  'laboratory':           'room',
  'storm-tower':          'metallic',
  'space-station':        'space',
  'living-forest':        'outdoor',
  'farm':                 'outdoor',
  'healers-sanctuary':    'room',
  'hospital':             'room',
  'explorers-map':        'outdoor',
  'code-forge':           'room',
  'architects-domain':    'room',
  'shipyard':             'outdoor',
  'digital-world':        'metallic',
  'arena':                'metallic',
  'library-echoes':       'room',
  'ancient-ruins':        'cave',
  'time-rift':            'cave',
  'gallery':              'room',
  'theater':              'room',
  'trading-post':         'outdoor',
  'marketplace':          'outdoor',
  'debate-hall':          'room',
  'newsroom':             'room',
  'music-hall':           'room',
};

/** Get the reverb preset for a given biome. */
export function getReverbForBiome(biomeId: string): ReverbPreset {
  return BIOME_REVERB_MAP[biomeId] ?? 'outdoor';
}

/** Get config for a preset. */
export function getReverbConfig(preset: ReverbPreset): ReverbConfig {
  return PRESETS[preset];
}
