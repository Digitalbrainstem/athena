import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProfileScreen } from '../../src/ui/profile-screen.js';
import type { NexusCore, Profile } from '@nexus-academy/core';

/** Flush microtask queue so the async show() renders its DOM */
function tick(): Promise<void> {
  return new Promise((r) => { setTimeout(r, 0); });
}

function mockCore(profiles: Profile[] = []): NexusCore {
  let nextId = 1;
  return {
    listProfiles: vi.fn(async () => profiles),
    createProfile: vi.fn(async (input: { name: string; avatarData?: string }) => ({
      id: `profile-${nextId++}`,
      name: input.name,
      avatarData: input.avatarData,
      masteryTier: 'foundation' as const,
      createdAt: new Date().toISOString(),
    })),
    loadProfile: vi.fn(async () => {}),
  } as unknown as NexusCore;
}

function makeProfile(name: string, id = 'test-id'): Profile {
  return {
    id,
    name,
    masteryTier: 'foundation',
    createdAt: new Date().toISOString(),
    avatarData: 'fox',
  };
}

describe('ProfileScreen', () => {
  let screen: ProfileScreen;

  beforeEach(() => {
    screen = new ProfileScreen();
  });

  afterEach(() => {
    screen.dispose();
    document.getElementById('profile-screen')?.remove();
  });

  it('renders the overlay with title and create form', async () => {
    const core = mockCore();
    const promise = screen.show(core);
    await tick();

    const overlay = document.getElementById('profile-screen');
    expect(overlay).not.toBeNull();

    const h1 = overlay!.querySelector('h1');
    expect(h1?.textContent).toBe('Nexus Academy');

    const nameInput = overlay!.querySelector<HTMLInputElement>('#profile-name');
    expect(nameInput).not.toBeNull();

    const avatars = overlay!.querySelectorAll('.avatar-option');
    expect(avatars.length).toBeGreaterThan(0);

    const createBtn = overlay!.querySelector<HTMLButtonElement>('.create-btn');
    expect(createBtn).not.toBeNull();
    expect(createBtn!.textContent).toBe('Enter the Nexus');

    nameInput!.value = 'Tester';
    createBtn!.click();

    const result = await promise;
    expect(result.profileId).toBeTruthy();
  });

  it('shows existing profile cards when profiles exist', async () => {
    const profiles = [
      makeProfile('Emma', 'profile-emma'),
      makeProfile('Noah', 'profile-noah'),
    ];
    const core = mockCore(profiles);
    const promise = screen.show(core);
    await tick();

    const overlay = document.getElementById('profile-screen');
    expect(overlay).not.toBeNull();

    const cards = overlay!.querySelectorAll('.profile-card');
    expect(cards.length).toBe(2);

    const firstCard = cards[0] as HTMLButtonElement;
    expect(firstCard.getAttribute('aria-label')).toContain('Emma');
    expect(firstCard.dataset.profileId).toBe('profile-emma');

    firstCard.click();
    const result = await promise;
    expect(result.profileId).toBe('profile-emma');
  });

  it('has correct ARIA attributes for accessibility', async () => {
    const core = mockCore();
    const promise = screen.show(core);
    await tick();

    const overlay = document.getElementById('profile-screen')!;
    expect(overlay.getAttribute('role')).toBe('main');
    expect(overlay.getAttribute('aria-label')).toBe('Profile selection');

    const srOnly = overlay.querySelector('.sr-only');
    expect(srOnly?.textContent).toContain('Welcome to Nexus Academy');

    const radioGroup = overlay.querySelector('[role="radiogroup"]');
    expect(radioGroup).not.toBeNull();
    expect(radioGroup!.getAttribute('aria-labelledby')).toBe('avatar-label');

    const checked = overlay.querySelector('[aria-checked="true"]');
    expect(checked).not.toBeNull();

    const createBtn = overlay.querySelector<HTMLButtonElement>('.create-btn');
    expect(createBtn!.getAttribute('aria-label')).toBe('Create new player');

    const nameInput = overlay.querySelector<HTMLInputElement>('#profile-name')!;
    nameInput.value = 'A11yTest';
    createBtn!.click();
    await promise;
  });

  it('shows error when creating without a name', async () => {
    const core = mockCore();
    const promise = screen.show(core);
    await tick();

    const overlay = document.getElementById('profile-screen')!;
    const createBtn = overlay.querySelector<HTMLButtonElement>('.create-btn')!;

    createBtn.click();

    const errorEl = overlay.querySelector<HTMLElement>('.form-error');
    expect(errorEl?.textContent).toContain('Please enter a name');

    const nameInput = overlay.querySelector<HTMLInputElement>('#profile-name')!;
    nameInput.value = 'Late';
    createBtn.click();
    await promise;
  });

  it('avatar selection updates aria-checked', async () => {
    const core = mockCore();
    const promise = screen.show(core);
    await tick();

    const overlay = document.getElementById('profile-screen')!;
    const avatars = overlay.querySelectorAll<HTMLButtonElement>('.avatar-option');

    expect(avatars[0]!.getAttribute('aria-checked')).toBe('true');
    expect(avatars[1]!.getAttribute('aria-checked')).toBe('false');

    avatars[1]!.click();
    expect(avatars[0]!.getAttribute('aria-checked')).toBe('false');
    expect(avatars[1]!.getAttribute('aria-checked')).toBe('true');

    const nameInput = overlay.querySelector<HTMLInputElement>('#profile-name')!;
    nameInput.value = 'AvatarTest';
    overlay.querySelector<HTMLButtonElement>('.create-btn')!.click();
    await promise;
  });

  it('keyboard Enter selects a profile card', async () => {
    const profiles = [makeProfile('Aria', 'profile-aria')];
    const core = mockCore(profiles);
    const promise = screen.show(core);
    await tick();

    const card = document.querySelector<HTMLButtonElement>('.profile-card')!;
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    const result = await promise;
    expect(result.profileId).toBe('profile-aria');
  });

  it('dispose cleans up the overlay', async () => {
    const core = mockCore();
    screen.show(core);
    await tick();

    expect(document.getElementById('profile-screen')).not.toBeNull();
    screen.dispose();
    expect(document.getElementById('profile-screen')).toBeNull();
  });
});
