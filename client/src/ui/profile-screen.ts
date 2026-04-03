// Profile screen — accessible HTML overlay for creating/selecting profiles.
// Shown before the 3D scene when no profile is active.
// Foundation tier: big avatar icons, no typing required per spec.

import type { NexusCore, Profile, MasteryTier } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

const AVATAR_OPTIONS: { id: string; emoji: string; label: string }[] = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
];

const AGE_RANGES: { value: string; label: string; tier: MasteryTier }[] = [
  { value: '2-5', label: '2–5 years', tier: 'foundation' },
  { value: '6-10', label: '6–10 years', tier: 'discovery' },
  { value: '11-14', label: '11–14 years', tier: 'builder' },
  { value: '15-18', label: '15–18 years', tier: 'innovator' },
  { value: '18+', label: '18+ years', tier: 'creator' },
  { value: 'none', label: "I'd rather not say", tier: 'foundation' },
];

export type ProfileScreenResult = { profileId: string };

export class ProfileScreen implements Disposable {
  private overlay: HTMLElement | null = null;
  private disposed = false;
  private resolveSelection: ((result: ProfileScreenResult) => void) | null = null;

  /**
   * Show the profile screen overlay and wait for the user to select or create a profile.
   * Returns the selected profile id.
   */
  async show(core: NexusCore): Promise<ProfileScreenResult> {
    if (this.disposed) throw new Error('ProfileScreen has been disposed');

    const profiles = await core.listProfiles();

    return new Promise<ProfileScreenResult>((resolve) => {
      this.resolveSelection = resolve;
      this.overlay = this.buildOverlay(profiles, core);
      document.body.appendChild(this.overlay);

      // Focus the first interactive element for keyboard users
      const firstFocusable = this.overlay.querySelector<HTMLElement>(
        'button, input, [tabindex="0"]',
      );
      firstFocusable?.focus();
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.overlay?.remove();
    this.overlay = null;
    this.resolveSelection = null;
  }

  // ---------------------------------------------------------------------------
  // DOM builders
  // ---------------------------------------------------------------------------

  private buildOverlay(profiles: Profile[], core: NexusCore): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'profile-screen';
    overlay.setAttribute('role', 'main');
    overlay.setAttribute('aria-label', 'Profile selection');

    // Screen-reader welcome
    const srAnnounce = document.createElement('div');
    srAnnounce.className = 'sr-only';
    srAnnounce.setAttribute('role', 'status');
    srAnnounce.setAttribute('aria-live', 'polite');
    srAnnounce.textContent = 'Welcome to Nexus Academy. Create a new player or select an existing one.';
    overlay.appendChild(srAnnounce);

    const title = document.createElement('h1');
    title.textContent = 'Nexus Academy';
    title.id = 'profile-screen-title';
    overlay.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'profile-subtitle';
    subtitle.textContent = 'Choose your explorer';
    overlay.appendChild(subtitle);

    if (profiles.length > 0) {
      overlay.appendChild(this.buildProfileList(profiles));
    }

    overlay.appendChild(this.buildCreateForm(core));

    return overlay;
  }

  private buildProfileList(profiles: Profile[]): HTMLElement {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'existing-profiles-heading');

    const heading = document.createElement('h2');
    heading.id = 'existing-profiles-heading';
    heading.textContent = 'Your Explorers';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'profile-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Select an existing player');

    for (const profile of profiles) {
      const card = document.createElement('button');
      card.className = 'profile-card';
      card.setAttribute('role', 'option');
      card.setAttribute(
        'aria-label',
        `Play as ${profile.name}, ${profile.masteryTier} tier`,
      );
      card.dataset.profileId = profile.id;

      const avatar = document.createElement('span');
      avatar.className = 'profile-card-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      const match = AVATAR_OPTIONS.find((a) => a.id === profile.avatarData);
      avatar.textContent = match?.emoji ?? '🌟';
      card.appendChild(avatar);

      const name = document.createElement('span');
      name.className = 'profile-card-name';
      name.textContent = profile.name;
      card.appendChild(name);

      card.addEventListener('click', () => {
        this.selectProfile(profile.id);
      });

      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectProfile(profile.id);
        }
      });

      list.appendChild(card);
    }

    section.appendChild(list);
    return section;
  }

  private buildCreateForm(core: NexusCore): HTMLElement {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'create-profile-heading');
    section.className = 'create-section';

    const heading = document.createElement('h2');
    heading.id = 'create-profile-heading';
    heading.textContent = 'New Explorer';
    section.appendChild(heading);

    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'profile-name');
    nameLabel.textContent = 'Name';
    nameGroup.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'profile-name';
    nameInput.placeholder = 'Your name';
    nameInput.maxLength = 30;
    nameInput.autocomplete = 'given-name';
    nameInput.setAttribute('aria-describedby', 'name-help');
    nameGroup.appendChild(nameInput);

    const nameHelp = document.createElement('small');
    nameHelp.id = 'name-help';
    nameHelp.className = 'form-help';
    nameHelp.textContent = 'What should the companion call you?';
    nameGroup.appendChild(nameHelp);

    section.appendChild(nameGroup);

    // Age range selector
    const ageGroup = document.createElement('div');
    ageGroup.className = 'form-group';

    const ageLabel = document.createElement('label');
    ageLabel.setAttribute('for', 'profile-age');
    ageLabel.textContent = 'Age range';
    ageGroup.appendChild(ageLabel);

    const ageSelect = document.createElement('select');
    ageSelect.id = 'profile-age';
    ageSelect.setAttribute('aria-describedby', 'age-help');
    for (const opt of AGE_RANGES) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      ageSelect.appendChild(option);
    }
    ageGroup.appendChild(ageSelect);

    const ageHelp = document.createElement('small');
    ageHelp.id = 'age-help';
    ageHelp.className = 'form-help';
    ageHelp.textContent = 'Helps calibrate your starting experience';
    ageGroup.appendChild(ageHelp);

    section.appendChild(ageGroup);

    // Avatar picker (Foundation-friendly: big tap targets, no typing)
    const avatarGroup = document.createElement('div');
    avatarGroup.className = 'form-group';

    const avatarLabel = document.createElement('span');
    avatarLabel.id = 'avatar-label';
    avatarLabel.textContent = 'Pick a companion';
    avatarLabel.setAttribute('role', 'presentation');
    avatarGroup.appendChild(avatarLabel);

    const avatarGrid = document.createElement('div');
    avatarGrid.className = 'avatar-grid';
    avatarGrid.setAttribute('role', 'radiogroup');
    avatarGrid.setAttribute('aria-labelledby', 'avatar-label');

    let selectedAvatar = AVATAR_OPTIONS[0]!.id;

    for (const opt of AVATAR_OPTIONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', opt.id === selectedAvatar ? 'true' : 'false');
      btn.setAttribute('aria-label', opt.label);
      btn.dataset.avatarId = opt.id;

      const emoji = document.createElement('span');
      emoji.className = 'avatar-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = opt.emoji;
      btn.appendChild(emoji);

      if (opt.id === selectedAvatar) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        selectedAvatar = opt.id;
        for (const sibling of avatarGrid.querySelectorAll<HTMLElement>('.avatar-option')) {
          sibling.classList.remove('selected');
          sibling.setAttribute('aria-checked', 'false');
        }
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      });

      avatarGrid.appendChild(btn);
    }

    avatarGroup.appendChild(avatarGrid);
    section.appendChild(avatarGroup);

    // Error display
    const errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'assertive');
    section.appendChild(errorEl);

    // Create button
    const createBtn = document.createElement('button');
    createBtn.type = 'button';
    createBtn.className = 'create-btn';
    createBtn.setAttribute('aria-label', 'Create new player');
    createBtn.textContent = 'Start Adventure!';

    createBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        errorEl.textContent = 'Please enter a name to get started.';
        nameInput.focus();
        return;
      }
      errorEl.textContent = '';
      createBtn.disabled = true;
      createBtn.textContent = 'Creating…';

      const selectedAge = AGE_RANGES.find(a => a.value === ageSelect.value);
      const tier = selectedAge?.tier ?? 'foundation';
      this.createAndSelect(core, name, selectedAvatar as string, tier);
    });

    section.appendChild(createBtn);
    return section;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  private selectProfile(profileId: string): void {
    this.overlay?.remove();
    this.overlay = null;
    this.resolveSelection?.({ profileId });
    this.resolveSelection = null;
  }

  private createAndSelect(
    core: NexusCore,
    name: string,
    avatarData: string,
    _masteryTier: MasteryTier,
  ): void {
    core
      .createProfile({ name, avatarData })
      .then((profile) => {
        this.selectProfile(profile.id);
      })
      .catch((err: unknown) => {
        console.error('[ProfileScreen] Failed to create profile:', err);
        const errorEl = this.overlay?.querySelector<HTMLElement>('.form-error');
        if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
        const btn = this.overlay?.querySelector<HTMLButtonElement>('.create-btn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Start Adventure!';
        }
      });
  }
}
