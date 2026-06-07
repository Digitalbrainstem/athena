import type { AudioCue, Vec3 } from '../types.js';
import type { Disposable } from '../types.js';
import { SoundSynthesizer } from './synthesizer.js';
import { hasSFX } from './sfx-library.js';
import { BiomeAmbientGenerator } from './biome-ambient-generator.js';
import { ProceduralMusic } from './procedural-music.js';
import { FootstepManager } from './footsteps.js';
import { generateImpulseResponse, getReverbForBiome, getReverbConfig } from './reverb-presets.js';
import type { ReverbPreset } from './reverb-presets.js';

const FADE_DURATION_MS = 1000;
const BIOME_MUSIC_FILES: Record<string, string> = {
  workshop: '/content/audio/music/priority1/music-workshop-ambient.wav',
  overworld: '/content/audio/music/priority1/music-overworld.wav',
  portal: '/content/audio/music/priority1/music-portal-ambient.wav',
};
const BIOME_MUSIC_ID = 'biome-music';

export class AudioManager implements Disposable {
  private ctx: AudioContext | null = null;
  private synthesizer: SoundSynthesizer | null = null;
  private readonly activeSources = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  private readonly audioCache = new Map<string, AudioBuffer>();
  private disposed = false;

  // --- Atmosphere subsystems ---
  private ambientGenerator: BiomeAmbientGenerator | null = null;
  private musicGen: ProceduralMusic | null = null;
  private footstepMgr: FootstepManager | null = null;

  // --- Audio routing ---
  private sfxBus: GainNode | null = null;
  private ambientDryGain: GainNode | null = null;
  private ambientWetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private ambientBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private footstepBus: GainNode | null = null;

  // --- State ---
  private currentBiomeId: string | null = null;
  private currentReverbPreset: ReverbPreset | null = null;
  private readonly irCache = new Map<ReverbPreset, AudioBuffer>();

  /**
   * Inject a pre-created AudioContext (created on user gesture).
   * This ensures the browser allows audio playback.
   */
  setContext(context: AudioContext): void {
    this.ctx = context;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.synthesizer = null;
    this.audioCache.clear();
    this.initAtmosphere(context);
    console.log(`[Audio] AudioContext set — state: ${this.ctx.state}, sampleRate: ${this.ctx.sampleRate}`);
  }

  /** Get the AudioContext (may be null if not yet initialized). */
  getContext(): AudioContext | null {
    return this.ctx;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      console.log(`[Audio] AudioContext created lazily — state: ${this.ctx.state}`);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private ensureSynthesizer(): SoundSynthesizer {
    if (!this.synthesizer) {
      this.synthesizer = new SoundSynthesizer(this.ensureContext());
    }
    return this.synthesizer;
  }

  /** Get the underlying SoundSynthesizer (lazy-initialized). */
  getSynthesizer(): SoundSynthesizer {
    return this.ensureSynthesizer();
  }

  // -----------------------------------------------------------------------
  // Atmosphere initialization
  // -----------------------------------------------------------------------

  private initAtmosphere(ctx: AudioContext): void {
    // --- SFX bus (direct to destination) ---
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.8;
    this.sfxBus.connect(ctx.destination);

    // --- Ambient bus with reverb ---
    this.ambientBus = ctx.createGain();
    this.ambientBus.gain.value = 0.05;

    this.ambientDryGain = ctx.createGain();
    this.ambientDryGain.gain.value = 0.7;

    this.ambientWetGain = ctx.createGain();
    this.ambientWetGain.gain.value = 0.3;

    this.convolver = ctx.createConvolver();

    this.ambientBus.connect(this.ambientDryGain);
    this.ambientBus.connect(this.convolver);
    this.convolver.connect(this.ambientWetGain);
    this.ambientDryGain.connect(ctx.destination);
    this.ambientWetGain.connect(ctx.destination);

    // Initialize convolver with outdoor IR
    this.setReverbPreset('outdoor');

    // --- Music bus (direct to destination, no reverb) ---
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.35;
    this.musicBus.connect(ctx.destination);

    // --- Footstep bus (through shared reverb) ---
    this.footstepBus = ctx.createGain();
    this.footstepBus.gain.value = 0.6;
    this.footstepBus.connect(ctx.destination);
    this.footstepBus.connect(this.convolver);

    // --- Create subsystems ---
    this.ambientGenerator = new BiomeAmbientGenerator(ctx, this.ambientBus);
    this.musicGen = new ProceduralMusic(ctx, this.musicBus);
    this.footstepMgr = new FootstepManager(ctx, this.footstepBus, this.ensureSynthesizer());

    console.log('[Audio] Atmosphere subsystems initialized');
  }

  // -----------------------------------------------------------------------
  // Public atmosphere API
  // -----------------------------------------------------------------------

  /**
   * Start the full atmosphere for a biome (ambient + music + reverb).
   * Called from main.ts on first load and from intercepted audio cues.
   */
  startAtmosphere(biomeId: string): void {
    if (this.disposed || biomeId === this.currentBiomeId) return;
    this.currentBiomeId = biomeId;

    console.log(`[Audio] Starting atmosphere for biome: ${biomeId}`);

    // Switch ambient soundscape
    this.ambientGenerator?.startBiome(biomeId);

    // The oscillator-based procedural layer reads as a constant tone in playtests.
    // Keep generated ambience/SFX, but use pre-rendered music files only.
    this.musicGen?.stop(250);
    this.switchBiomeMusicFile(biomeId);

    // Update reverb
    const preset = getReverbForBiome(biomeId);
    this.setReverbPreset(preset);
  }

  /**
   * Tick footstep system — call from game loop each frame.
   * @param dt Frame delta in seconds
   * @param speed Player speed in units/s
   * @param groundType Ground type string (e.g. 'wood', 'grass', 'stone')
   */
  tickMovement(dt: number, speed: number, groundType: string): void {
    this.footstepMgr?.tick(dt, speed, groundType);
  }

  /** Get the current biome ID the atmosphere is playing for. */
  getCurrentBiome(): string | null {
    return this.currentBiomeId;
  }

  private switchBiomeMusicFile(biomeId: string): void {
    const file = BIOME_MUSIC_FILES[biomeId];
    if (!file) {
      this.stop(BIOME_MUSIC_ID);
      return;
    }

    void this.playMusicFile(file, BIOME_MUSIC_ID, 0.12, true);
  }

  // -----------------------------------------------------------------------
  // Reverb management
  // -----------------------------------------------------------------------

  private setReverbPreset(preset: ReverbPreset): void {
    if (!this.ctx || !this.convolver || preset === this.currentReverbPreset) return;

    let ir = this.irCache.get(preset);
    if (!ir) {
      ir = generateImpulseResponse(this.ctx, preset);
      this.irCache.set(preset, ir);
    }

    this.convolver.buffer = ir;
    this.currentReverbPreset = preset;

    // Adjust wet/dry balance from preset config
    const cfg = getReverbConfig(preset);
    if (this.ambientDryGain && this.ambientWetGain) {
      const t = this.ctx.currentTime + 0.5;
      this.ambientDryGain.gain.linearRampToValueAtTime(1 - cfg.mix, t);
      this.ambientWetGain.gain.linearRampToValueAtTime(cfg.mix, t);
    }
  }

  // -----------------------------------------------------------------------
  // Audio cue processing
  // -----------------------------------------------------------------------

  process(cues: AudioCue[]): void {
    if (this.disposed || cues.length === 0) return;

    for (const cue of cues) {
      // Intercept ambient cues → route to BiomeAmbientGenerator
      if (cue.type === 'ambient') {
        this.handleAmbientCue(cue);
        continue;
      }

      switch (cue.action) {
        case 'play': this.play(cue); break;
        case 'stop': this.stop(cue.id); break;
        case 'fade_in': this.fadeIn(cue); break;
        case 'fade_out': this.fadeOut(cue.id); break;
      }
    }
  }

  private handleAmbientCue(cue: AudioCue): void {
    if (cue.action === 'fade_in' && cue.asset.endsWith('-ambient')) {
      const biomeId = cue.asset.replace('-ambient', '');
      this.startAtmosphere(biomeId);
    }
    // fade_out is handled by the crossfade in startAtmosphere
  }

  private play(cue: AudioCue): void {
    this.stop(cue.id);

    const ctx = this.ensureContext();
    let buffer = this.audioCache.get(cue.asset);

    if (!buffer) {
      buffer = this.synthesizeAsset(cue.asset);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = cue.loop;

    const gain = ctx.createGain();
    gain.gain.value = cue.volume;

    source.connect(gain);

    if (cue.position) {
      this.connectSpatial(ctx, gain, cue.position);
    } else {
      // Route SFX through the SFX bus (or direct to destination if not ready)
      const dest = this.sfxBus ?? ctx.destination;
      gain.connect(dest);
    }

    source.start(0);
    this.activeSources.set(cue.id, { source, gain });

    source.onended = () => {
      this.activeSources.delete(cue.id);
    };
  }

  private stop(id: string): void {
    const entry = this.activeSources.get(id);
    if (entry) {
      try { entry.source.stop(); } catch { /* already stopped */ }
      this.activeSources.delete(id);
    }
  }

  private fadeIn(cue: AudioCue): void {
    this.stop(cue.id);

    const ctx = this.ensureContext();
    let buffer = this.audioCache.get(cue.asset);
    if (!buffer) {
      buffer = this.synthesizeAsset(cue.asset);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = cue.loop;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(cue.volume, ctx.currentTime + FADE_DURATION_MS / 1000);

    source.connect(gain);
    const dest = this.sfxBus ?? ctx.destination;
    gain.connect(dest);
    source.start(0);

    this.activeSources.set(cue.id, { source, gain });
    source.onended = () => { this.activeSources.delete(cue.id); };
  }

  private fadeOut(id: string): void {
    const entry = this.activeSources.get(id);
    if (!entry || !this.ctx) return;

    entry.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + FADE_DURATION_MS / 1000);
    setTimeout(() => this.stop(id), FADE_DURATION_MS);
  }

  private connectSpatial(ctx: AudioContext, gain: GainNode, position: Vec3): void {
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    gain.connect(panner);
    panner.connect(ctx.destination);
  }

  /**
   * Synthesize an audio asset procedurally using the SFX library.
   * Falls back to a silent buffer if the asset is unknown.
   */
  private synthesizeAsset(asset: string): AudioBuffer {
    const cached = this.audioCache.get(asset);
    if (cached) return cached;

    const synth = this.ensureSynthesizer();
    let buffer: AudioBuffer;

    if (hasSFX(asset)) {
      buffer = synth.generateSFX(asset);
    } else if (asset.startsWith('music-')) {
      // Parse music asset IDs: "music-{biomeId}-{layer}"
      const parts = asset.replace('music-', '').split('-');
      const layer = parts.pop() as 'ambient' | 'activity' | 'intensity';
      const biomeId = parts.join('-');
      buffer = synth.generateMusicLayer(biomeId, layer);
    } else if (asset.endsWith('-ambient')) {
      // Biome ambient asset
      const biomeId = asset.replace('-ambient', '');
      buffer = synth.generateAmbient(biomeId);
    } else {
      // Unknown asset — generate silence
      const ctx = this.ensureContext();
      buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.01), ctx.sampleRate);
    }

    this.audioCache.set(asset, buffer);
    return buffer;
  }

  /**
   * Load and play a WAV/audio file from a URL.
   * Ideal for pre-composed music tracks.
   */
  async playMusicFile(url: string, id: string, volume = 0.25, loop = true): Promise<void> {
    if (this.disposed) return;
    this.stop(id);

    const ctx = this.ensureContext();
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[Audio] Failed to fetch ${url}: ${response.status}`);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      if (this.disposed) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = loop;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      // Fade in over 2 seconds
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);

      source.connect(gain);
      const dest = this.musicBus ?? ctx.destination;
      gain.connect(dest);
      source.start(0);

      this.activeSources.set(id, { source, gain });
      source.onended = () => { this.activeSources.delete(id); };

      console.log(`[Audio] Playing music file: ${url}`);
    } catch (err) {
      console.warn(`[Audio] Error playing music file ${url}:`, err);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Stop atmosphere subsystems
    this.ambientGenerator?.dispose();
    this.ambientGenerator = null;
    this.musicGen?.dispose();
    this.musicGen = null;
    this.footstepMgr?.dispose();
    this.footstepMgr = null;

    for (const entry of this.activeSources.values()) {
      try { entry.source.stop(); } catch { /* already stopped */ }
    }
    this.activeSources.clear();
    this.audioCache.clear();
    this.irCache.clear();

    if (this.synthesizer) {
      this.synthesizer.clearCache();
      this.synthesizer = null;
    }

    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
