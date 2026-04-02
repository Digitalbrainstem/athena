import type { Vec3 } from '../types.js';

// ---------------------------------------------------------------------------
// Volume categories
// ---------------------------------------------------------------------------

export type VolumeCategory = 'music' | 'sfx' | 'voice' | 'ambient';

// ---------------------------------------------------------------------------
// AudioManager configuration
// ---------------------------------------------------------------------------

export interface AudioManagerOptions {
  /** Crossfade duration in ms (default 2500) */
  crossfadeMs?: number;
  /** Initial volume for music 0–1 (default 0.7) */
  musicVolume?: number;
  /** Initial volume for SFX 0–1 (default 0.8) */
  sfxVolume?: number;
  /** Initial volume for voice 0–1 (default 1.0) */
  voiceVolume?: number;
  /** Initial volume for ambient 0–1 (default 0.6) */
  ambientVolume?: number;
}

// ---------------------------------------------------------------------------
// Active source tracking
// ---------------------------------------------------------------------------

export interface ActiveSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: PannerNode | null;
  category: VolumeCategory;
}

// ---------------------------------------------------------------------------
// Listener (camera) state for spatial audio
// ---------------------------------------------------------------------------

export interface ListenerState {
  position: Vec3;
  forward: Vec3;
  up: Vec3;
}

// ---------------------------------------------------------------------------
// Adaptive music
// ---------------------------------------------------------------------------

export interface BiomeMusic {
  biomeId: string;
  /** Always playing, low volume atmospheric layer */
  ambientLayer: string;
  /** Fades in during active gameplay (quests, crafting, building) */
  activityLayer: string;
  /** Fades in during key moments (challenges, discoveries) */
  intensityLayer: string;
}

// ---------------------------------------------------------------------------
// TTS
// ---------------------------------------------------------------------------

export interface TTSOptions {
  /** Audio format ('mp3' | 'wav' | 'opus') */
  format?: string;
  /** Speech speed multiplier (0.5–1.5) */
  speed?: number;
  /** Emotional expression tag (e.g. 'excited', 'calm') */
  emotion?: string;
  /** Latency preference ('normal' | 'balanced') */
  latency?: string;
}

export interface Voice {
  id: string;
  name: string;
  /** Voice profile category */
  profile: 'warm' | 'energetic' | 'calm' | 'playful' | 'scholarly';
  language: string;
}

export interface TTSProvider {
  speak(text: string, voice: string, options?: TTSOptions): Promise<AudioBuffer>;
  getVoices(): Promise<Voice[]>;
}

// ---------------------------------------------------------------------------
// Caption display configuration
// ---------------------------------------------------------------------------

export type CaptionPosition = 'top' | 'bottom';

export interface CaptionDisplaySettings {
  enabled: boolean;
  position: CaptionPosition;
  /** Font size percentage (50–200) */
  fontSize: number;
  /** Background opacity (0–1) */
  backgroundOpacity: number;
  /** Show music mood captions */
  showMusicMood: boolean;
  /** Show directional indicators for spatial sounds */
  showDirectional: boolean;
  /** Per-speaker colors keyed by speaker name */
  speakerColors: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Haptic patterns
// ---------------------------------------------------------------------------

export type HapticPattern = 'short-pulse' | 'rising' | 'gentle-rhythm' | 'strong-pulse' | 'heartbeat' | 'none';

export interface HapticEvent {
  pattern: HapticPattern;
  /** Vibration durations in ms (Vibration API format) */
  vibration: number[];
}
