/**
 * Onboarding Flow — guided first-time experience.
 *
 * Emily (Nexus Voice) walks the player through:
 *   1. Name entry — "What may we call you?"
 *   2. Age range — "How old are you?" (sets mastery tier)
 *   3. Companion picker — "Every explorer needs a companion"
 *
 * Each screen is simple, voice-guided, and works for ages 2+.
 * Screens are full-screen overlays that resolve promises.
 */

import { ONBOARDING_VOICE, AGE_TIERS, COMPANION_LIST, MUSIC } from '../core/registry.js';
import type { Disposable } from '../types.js';

export interface OnboardingResult {
  playerName: string;
  ageTier: string;
  companionId: string;
}

export class OnboardingFlow implements Disposable {
  private disposed = false;
  private overlay: HTMLElement | null = null;
  private audioCtx: AudioContext | null = null;
  private currentAudio: AudioBufferSourceNode | null = null;
  private musicElement: HTMLAudioElement | null = null;

  async run(): Promise<OnboardingResult> {
    // Ensure AudioContext from prior gesture
    this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') {
      try { await this.audioCtx.resume(); } catch { /* */ }
    }

    // Start soft music if not already playing
    this.startMusic();

    // Step 1: Name
    const playerName = await this.showNameScreen();
    if (this.disposed) return { playerName: '', ageTier: 'foundation', companionId: 'fox' };

    // Step 2: Age
    const ageTier = await this.showAgeScreen(playerName);
    if (this.disposed) return { playerName, ageTier: 'foundation', companionId: 'fox' };

    // Step 3: Companion intro (Emily explains)
    await this.showCompanionIntro(playerName);
    if (this.disposed) return { playerName, ageTier, companionId: 'fox' };

    // Step 4: Companion carousel (swipe, each introduces themselves)
    const companionId = await this.showCompanionCarousel();
    if (this.disposed) return { playerName, ageTier, companionId: 'fox' };

    // Confirmation
    await this.playVoice(ONBOARDING_VOICE.companion_chosen);

    this.stopMusic();
    this.cleanup();

    return { playerName, ageTier, companionId };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopMusic();
    try { this.currentAudio?.stop(); } catch { /* */ }
    void this.audioCtx?.close();
    this.cleanup();
  }

  // ── Name Screen ───────────────────────────────────────────────────────────

  private async showNameScreen(): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const el = this.createOverlay();

      const container = document.createElement('div');
      container.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100%; padding: 2rem;
        gap: 1.5rem;
      `;

      const prompt = document.createElement('p');
      prompt.textContent = 'What may we call you?';
      prompt.style.cssText = `
        font-size: 1.5rem; color: #F5F0E8; text-align: center;
        font-weight: 300; letter-spacing: 0.05em;
        opacity: 0; transition: opacity 1s ease;
      `;
      container.appendChild(prompt);

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Your name';
      input.maxLength = 20;
      input.autocomplete = 'off';
      input.style.cssText = `
        font-size: 1.5rem; padding: 0.75rem 1.5rem;
        background: rgba(255,255,255,0.1); border: 2px solid #22d3ee;
        border-radius: 2rem; color: #F5F0E8; text-align: center;
        font-family: 'Nunito', sans-serif; outline: none;
        width: min(80%, 20rem);
        opacity: 0; transition: opacity 0.8s ease 0.5s;
      `;
      container.appendChild(input);

      const btn = document.createElement('button');
      btn.textContent = 'That\'s me! ✨';
      btn.disabled = true;
      btn.style.cssText = `
        font-size: 1.1rem; padding: 0.75rem 2rem;
        background: linear-gradient(135deg, #22d3ee, #a78bfa);
        border: none; border-radius: 2rem; color: #0f172a;
        font-family: 'Nunito', sans-serif; font-weight: 700;
        cursor: pointer; opacity: 0; transition: opacity 0.8s ease 1s;
      `;
      container.appendChild(btn);

      el.appendChild(container);
      document.body.appendChild(el);
      this.overlay = el;

      // Fade in
      requestAnimationFrame(() => {
        prompt.style.opacity = '1';
        input.style.opacity = '1';
        btn.style.opacity = '1';
      });

      // Play Emily's voice
      await this.playVoice(ONBOARDING_VOICE.name_ask);
      input.focus();

      // Enable button when name has content
      input.addEventListener('input', () => {
        btn.disabled = input.value.trim().length === 0;
        btn.style.opacity = input.value.trim().length > 0 ? '1' : '0.5';
      });

      const submit = async () => {
        const name = input.value.trim();
        if (!name) return;
        btn.disabled = true;
        prompt.textContent = `${name}... ✨`;
        await this.playVoice(ONBOARDING_VOICE.name_confirm);
        await this.wait(500);
        el.remove();
        this.overlay = null;
        resolve(name);
      };

      btn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) submit();
      });
    });
  }

  // ── Age Screen ────────────────────────────────────────────────────────────

  private async showAgeScreen(playerName: string): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const el = this.createOverlay();

      const container = document.createElement('div');
      container.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100%; padding: 1.5rem;
        gap: 1rem;
      `;

      const title = document.createElement('p');
      title.textContent = `Welcome, ${playerName}`;
      title.style.cssText = `
        font-size: 1.3rem; color: #22d3ee; text-align: center;
        font-weight: 300; opacity: 0; transition: opacity 1s ease;
      `;
      container.appendChild(title);

      const subtitle = document.createElement('p');
      subtitle.textContent = 'How old are you?';
      subtitle.style.cssText = `
        font-size: 1.1rem; color: #F5F0E8; text-align: center;
        opacity: 0; transition: opacity 0.8s ease 0.3s;
      `;
      container.appendChild(subtitle);

      const grid = document.createElement('div');
      grid.style.cssText = `
        display: flex; flex-wrap: wrap; gap: 0.75rem;
        justify-content: center; max-width: 32rem;
        opacity: 0; transition: opacity 0.8s ease 0.6s;
      `;

      for (const tier of AGE_TIERS) {
        const card = document.createElement('button');
        card.style.cssText = `
          background: rgba(255,255,255,0.08); border: 2px solid transparent;
          border-radius: 1rem; padding: 1rem 1.25rem; cursor: pointer;
          color: #F5F0E8; font-family: 'Nunito', sans-serif;
          text-align: center; min-width: 8rem; transition: all 0.3s ease;
        `;
        card.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">${tier.emoji}</div>
          <div style="font-size: 0.95rem; font-weight: 700;">${tier.ageRange}</div>
          <div style="font-size: 0.75rem; color: #94A3B8;">${tier.label}</div>
        `;

        card.addEventListener('click', async () => {
          // Highlight selected
          grid.querySelectorAll('button').forEach(b => {
            (b as HTMLElement).style.borderColor = 'transparent';
          });
          card.style.borderColor = '#22d3ee';
          card.style.background = 'rgba(34,211,238,0.15)';

          subtitle.textContent = `${tier.emoji} ${tier.label}`;
          await this.playVoice(ONBOARDING_VOICE.age_confirm);
          await this.wait(500);
          el.remove();
          this.overlay = null;
          resolve(tier.id);
        });

        grid.appendChild(card);
      }

      container.appendChild(grid);
      el.appendChild(container);
      document.body.appendChild(el);
      this.overlay = el;

      requestAnimationFrame(() => {
        title.style.opacity = '1';
        subtitle.style.opacity = '1';
        grid.style.opacity = '1';
      });

      await this.playVoice(ONBOARDING_VOICE.age_intro);
    });
  }

  // ── Companion Intro (Emily explains what companions are) ────────────────

  private async showCompanionIntro(_playerName: string): Promise<void> {
    const el = this.createOverlay();

    const container = document.createElement('div');
    container.style.cssText = `
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; padding: 2rem; gap: 1.5rem;
    `;

    const text = document.createElement('p');
    text.textContent = 'Every explorer needs a companion...';
    text.style.cssText = `
      font-size: 1.3rem; color: #F5F0E8; text-align: center;
      font-weight: 300; letter-spacing: 0.05em; max-width: 24rem;
      line-height: 1.6; opacity: 0; transition: opacity 1.5s ease;
    `;
    container.appendChild(text);

    el.appendChild(container);
    document.body.appendChild(el);
    this.overlay = el;

    requestAnimationFrame(() => { text.style.opacity = '1'; });

    await this.playVoice(ONBOARDING_VOICE.companion_intro);
    if (this.disposed) { el.remove(); return; }

    text.textContent = 'Choose the one that feels right. There is no wrong answer.';
    await this.playVoice(ONBOARDING_VOICE.companion_choose);
    if (this.disposed) { el.remove(); return; }

    await this.wait(800);
    // Fade out
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    await this.wait(600);
    el.remove();
    this.overlay = null;
  }

  // ── Companion Carousel (swipe through one at a time) ──────────────────────

  private async showCompanionCarousel(): Promise<string> {
    return new Promise<string>((resolve) => {
      const el = this.createOverlay();
      let currentIndex = 0;
      let isPlaying = false;

      const container = document.createElement('div');
      container.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100%; padding: 1rem;
        user-select: none; -webkit-user-select: none;
      `;

      // Companion display area
      const companionArea = document.createElement('div');
      companionArea.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        gap: 0.75rem; transition: opacity 0.4s ease;
      `;

      const emoji = document.createElement('div');
      emoji.style.cssText = 'font-size: 5rem; line-height: 1;';

      const name = document.createElement('div');
      name.style.cssText = `
        font-size: 1.8rem; font-weight: 700;
        transition: color 0.3s;
      `;

      const title = document.createElement('div');
      title.style.cssText = 'font-size: 1rem; color: #22d3ee;';

      const desc = document.createElement('div');
      desc.style.cssText = `
        font-size: 0.85rem; color: #94A3B8; text-align: center;
        max-width: 22rem; line-height: 1.5;
      `;

      companionArea.appendChild(emoji);
      companionArea.appendChild(name);
      companionArea.appendChild(title);
      companionArea.appendChild(desc);

      // Navigation arrows
      const nav = document.createElement('div');
      nav.style.cssText = `
        display: flex; align-items: center; gap: 2rem;
        margin-top: 1.5rem;
      `;

      const leftBtn = document.createElement('button');
      leftBtn.textContent = '◀';
      leftBtn.style.cssText = `
        font-size: 2rem; background: none; border: none;
        color: rgba(255,255,255,0.5); cursor: pointer; padding: 0.5rem;
      `;

      // Dots indicator
      const dots = document.createElement('div');
      dots.style.cssText = 'display: flex; gap: 0.5rem;';
      for (let i = 0; i < COMPANION_LIST.length; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.3); transition: all 0.3s;
        `;
        dot.dataset.idx = String(i);
        dots.appendChild(dot);
      }

      const rightBtn = document.createElement('button');
      rightBtn.textContent = '▶';
      rightBtn.style.cssText = leftBtn.style.cssText;

      nav.appendChild(leftBtn);
      nav.appendChild(dots);
      nav.appendChild(rightBtn);

      // Choose button
      const chooseBtn = document.createElement('button');
      chooseBtn.style.cssText = `
        font-size: 1.1rem; padding: 0.75rem 2.5rem;
        background: linear-gradient(135deg, #22d3ee, #a78bfa);
        border: none; border-radius: 2rem; color: #0f172a;
        font-family: 'Nunito', sans-serif; font-weight: 700;
        cursor: pointer; margin-top: 1.25rem;
        opacity: 0; transition: opacity 0.5s ease;
      `;

      container.appendChild(companionArea);
      container.appendChild(nav);
      container.appendChild(chooseBtn);
      el.appendChild(container);
      document.body.appendChild(el);
      this.overlay = el;

      // Update display for current companion
      const showCompanion = async (index: number, playVoice = true) => {
        const c = COMPANION_LIST[index];
        const colorHex = '#' + c.color.toString(16).padStart(6, '0');

        // Fade out
        companionArea.style.opacity = '0';
        chooseBtn.style.opacity = '0';
        await this.wait(200);

        emoji.textContent = c.emoji;
        name.textContent = c.name;
        name.style.color = colorHex;
        title.textContent = c.title;
        desc.textContent = c.description;
        chooseBtn.textContent = `Choose ${c.name}`;

        // Update dots
        dots.querySelectorAll('div').forEach((d, i) => {
          (d as HTMLElement).style.background = i === index
            ? colorHex : 'rgba(255,255,255,0.3)';
          (d as HTMLElement).style.transform = i === index
            ? 'scale(1.5)' : 'scale(1)';
        });

        // Fade in
        companionArea.style.opacity = '1';
        await this.wait(300);
        chooseBtn.style.opacity = '1';

        // Play their intro voice
        if (playVoice && !isPlaying) {
          isPlaying = true;
          await this.playVoiceFromUrl(c.introVoicePath);
          isPlaying = false;
        }
      };

      const go = (dir: number) => {
        currentIndex = (currentIndex + dir + COMPANION_LIST.length) % COMPANION_LIST.length;
        void showCompanion(currentIndex);
      };

      leftBtn.addEventListener('click', () => go(-1));
      rightBtn.addEventListener('click', () => go(1));
      chooseBtn.addEventListener('click', () => {
        el.remove();
        this.overlay = null;
        resolve(COMPANION_LIST[currentIndex].id);
      });

      // Swipe support
      let touchStartX = 0;
      el.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
      el.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });

      // Keyboard
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'Enter') {
          el.remove(); this.overlay = null;
          resolve(COMPANION_LIST[currentIndex].id);
        }
      });
      el.tabIndex = 0;
      el.focus();

      // Show first companion
      void showCompanion(0);
    });
  }

  // ── Audio ─────────────────────────────────────────────────────────────────

  private async playVoice(url: string): Promise<void> {
    return this.playVoiceFromUrl(url);
  }

  private async playVoiceFromUrl(url: string): Promise<void> {
    if (!this.audioCtx || this.disposed) return;
    try {
      const response = await fetch(url);
      if (!response.ok) { await this.wait(2000); return; }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      await new Promise<void>((resolve) => {
        if (this.disposed || !this.audioCtx) { resolve(); return; }
        try { this.currentAudio?.stop(); } catch { /* */ }
        const source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);
        this.currentAudio = source;
        source.onended = () => { this.currentAudio = null; resolve(); };
        source.start();
      });
    } catch (e) {
      console.warn('[Onboarding] Voice failed:', url, e);
      await this.wait(2000);
    }
  }

  private startMusic(): void {
    try {
      this.musicElement = new Audio(MUSIC.portal_ambient);
      this.musicElement.loop = true;
      this.musicElement.volume = 0.15;
      void this.musicElement.play().catch(() => {});
    } catch { /* */ }
  }

  private stopMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.src = '';
      this.musicElement = null;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private createOverlay(): HTMLElement {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; inset: 0; z-index: 50;
      background: linear-gradient(135deg, #0a0a2e, #1a1a3e);
      font-family: 'Nunito', sans-serif;
    `;
    return el;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private cleanup(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
