// Caption–audio synchronization — ties active audio playback to the
// caption display so captions appear in sync with their sound cues.

import type { AudioCue, Caption, AccessibilitySettings } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import type { CaptionRenderer } from '../a11y/captions.js';

/**
 * CaptionSync bridges audio cues and caption rendering.
 * When an audio cue carries captionText, it generates a Caption object
 * and passes it to the CaptionRenderer for display.
 */
export class CaptionSync implements Disposable {
  private readonly captionRenderer: CaptionRenderer;
  private disposed = false;

  constructor(captionRenderer: CaptionRenderer) {
    this.captionRenderer = captionRenderer;
  }

  /**
   * Process audio cues and generate captions for any that have captionText.
   * Should be called each frame after AudioManager.process().
   */
  processAudioCues(
    cues: ReadonlyArray<AudioCue>,
    settings: Readonly<AccessibilitySettings>,
  ): void {
    if (this.disposed) return;

    const captions: Caption[] = [];
    const now = performance.now();

    for (const cue of cues) {
      if (cue.action !== 'play' && cue.action !== 'fade_in') continue;
      if (!cue.captionText) continue;

      captions.push({
        text: cue.captionText,
        type: cue.type === 'voice' ? 'voice'
            : cue.type === 'music' ? 'music'
            : cue.type === 'ambient' ? 'ambient'
            : 'sfx',
        timestamp: now,
      });
    }

    if (captions.length > 0) {
      this.captionRenderer.process(captions, settings);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
  }
}
