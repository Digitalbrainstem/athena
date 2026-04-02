import type { AudioCue } from '../types.js';
import type { HapticEvent, HapticPattern } from './types.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Haptic vibration patterns mapped to audio event types
// ---------------------------------------------------------------------------

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  'short-pulse': [80],
  'rising': [40, 30, 60, 30, 100],
  'gentle-rhythm': [30, 60, 30, 60, 30],
  'strong-pulse': [150],
  'heartbeat': [80, 100, 80, 400],
  'none': [],
};

// Map audio asset names to haptic patterns
const ASSET_HAPTIC_MAP: Record<string, HapticPattern> = {
  'feedback-correct-chime': 'short-pulse',
  'gentle-success': 'short-pulse',
  'discovery-sparkle': 'rising',
  'feedback-quest-complete': 'rising',
  'feedback-story-fragment': 'rising',
  'feedback-build-click': 'short-pulse',
  'feedback-craft-bubble-sparkle': 'short-pulse',
  'feedback-level-up-glow': 'gentle-rhythm',
  'quest-start-chime': 'short-pulse',
  'companion-greet': 'gentle-rhythm',
};

// ---------------------------------------------------------------------------
// HapticSync — triggers vibration patterns in response to audio events
// ---------------------------------------------------------------------------

export class HapticSync implements Disposable {
  private enabled = false;
  private disposed = false;

  /** Enable or disable haptic feedback. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Process audio cues and trigger haptic feedback for matching events. */
  processAudioCues(cues: ReadonlyArray<AudioCue>): void {
    if (this.disposed || !this.enabled) return;
    if (!this.supportsVibration()) return;

    for (const cue of cues) {
      if (cue.action !== 'play' && cue.action !== 'fade_in') continue;

      const event = this.mapCueToHaptic(cue);
      if (event.pattern !== 'none') {
        this.vibrate(event.vibration);
      }
    }
  }

  /** Map an AudioCue to a HapticEvent. */
  mapCueToHaptic(cue: AudioCue): HapticEvent {
    // Voice cues get a gentle rhythm
    if (cue.type === 'voice') {
      return { pattern: 'gentle-rhythm', vibration: HAPTIC_PATTERNS['gentle-rhythm'] };
    }

    // Check asset-specific mapping
    const pattern = ASSET_HAPTIC_MAP[cue.asset];
    if (pattern) {
      return { pattern, vibration: HAPTIC_PATTERNS[pattern] };
    }

    // SFX with positional data get a short pulse
    if (cue.type === 'sfx' && cue.position) {
      return { pattern: 'short-pulse', vibration: HAPTIC_PATTERNS['short-pulse'] };
    }

    return { pattern: 'none', vibration: [] };
  }

  /** Check if the Vibration API is available. */
  supportsVibration(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  private vibrate(pattern: number[]): void {
    if (pattern.length === 0) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration not available or denied — fail silently
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.enabled = false;
  }
}
