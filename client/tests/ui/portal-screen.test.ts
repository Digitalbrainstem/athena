import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PortalScreen } from '../../src/ui/portal-screen.js';

function tick(ms = 0): Promise<void> {
  return new Promise((r) => { setTimeout(r, ms); });
}

describe('PortalScreen', () => {
  let screen: PortalScreen;

  beforeEach(() => {
    screen = new PortalScreen();
  });

  afterEach(() => {
    screen.dispose();
    document.getElementById('portal-screen')?.remove();
  });

  it('renders the portal overlay with title and prompt', async () => {
    // show() returns a promise that resolves when "Step Inside" is clicked
    const promise = screen.show();
    await tick(10);

    const overlay = document.getElementById('portal-screen');
    expect(overlay).not.toBeNull();
    expect(overlay!.getAttribute('role')).toBe('main');

    const title = overlay!.querySelector('.portal-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Nexus Academy');

    const prompt = overlay!.querySelector('.portal-prompt');
    expect(prompt).not.toBeNull();
    expect(prompt!.textContent).toBe('Step Inside');

    // Has screen-reader announcement
    const sr = overlay!.querySelector('.sr-only');
    expect(sr?.textContent).toContain('Welcome to Nexus Academy');

    // Click Step Inside to resolve
    (prompt as HTMLButtonElement).click();
    await tick(1500);
    await promise;
  });

  it('creates a canvas for the Three.js scene', async () => {
    const promise = screen.show();
    await tick(10);

    const canvas = document.getElementById('portal-canvas');
    expect(canvas).not.toBeNull();
    expect(canvas!.tagName.toLowerCase()).toBe('canvas');

    // Cleanup
    const prompt = document.querySelector('.portal-prompt') as HTMLButtonElement;
    prompt.click();
    await tick(1500);
    await promise;
  });

  it('prompt becomes visible after delay', async () => {
    const promise = screen.show();
    await tick(10);

    const prompt = document.querySelector('.portal-prompt') as HTMLElement;
    expect(prompt).not.toBeNull();

    // Initially not visible (no .visible class yet)
    // After 2s it should appear
    await tick(2100);
    expect(prompt.classList.contains('visible')).toBe(true);

    prompt.click();
    await tick(1500);
    await promise;
  });

  it('dissolving class is added on click', async () => {
    const promise = screen.show();
    await tick(10);

    const overlay = document.getElementById('portal-screen')!;
    const prompt = overlay.querySelector('.portal-prompt') as HTMLButtonElement;

    prompt.click();
    await tick(50);

    expect(overlay.classList.contains('dissolving')).toBe(true);

    await tick(1500);
    await promise;
  });

  it('dispose cleans up the overlay', async () => {
    screen.show();
    await tick(10);

    expect(document.getElementById('portal-screen')).not.toBeNull();
    screen.dispose();
    expect(document.getElementById('portal-screen')).toBeNull();
  });

  it('keyboard Enter triggers Step Inside', async () => {
    const promise = screen.show();
    await tick(2200);

    const prompt = document.querySelector('.portal-prompt') as HTMLButtonElement;
    prompt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    await tick(1500);
    await promise;
    // If we get here, the promise resolved = keyboard worked
    expect(true).toBe(true);
  });
});
