import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScreenReaderBridge } from '../../src/a11y/screen-reader.js';

function createMockDom(): void {
  document.body.innerHTML = `
    <div id="a11y-announcer-polite" aria-live="polite" aria-atomic="true" role="status"></div>
    <div id="a11y-announcer-assertive" aria-live="assertive" aria-atomic="true" role="alert"></div>
  `;
}

describe('ScreenReaderBridge', () => {
  let bridge: ScreenReaderBridge;

  beforeEach(() => {
    createMockDom();
    bridge = new ScreenReaderBridge();
    bridge.init();
  });

  afterEach(() => {
    bridge.dispose();
    document.body.innerHTML = '';
  });

  it('clears polite element before setting text', () => {
    const el = document.getElementById('a11y-announcer-polite')!;
    bridge.announce([{ text: 'Hello', priority: 'polite', category: 'navigation' }]);
    expect(el.textContent).toBe('');
  });

  it('sets polite text after microtask', async () => {
    const el = document.getElementById('a11y-announcer-polite')!;
    bridge.announce([{ text: 'Entered cave', priority: 'polite', category: 'navigation' }]);
    await new Promise((r) => setTimeout(r, 10));
    expect(el.textContent).toBe('Entered cave');
  });

  it('sets assertive text for assertive priority', async () => {
    const el = document.getElementById('a11y-announcer-assertive')!;
    bridge.announce([{ text: 'Quest complete', priority: 'assertive', category: 'quest' }]);
    await new Promise((r) => setTimeout(r, 10));
    expect(el.textContent).toBe('Quest complete');
  });

  it('handles multiple announcements', async () => {
    bridge.announce([
      { text: 'First', priority: 'polite', category: 'navigation' },
      { text: 'Critical', priority: 'assertive', category: 'error' },
    ]);
    await new Promise((r) => setTimeout(r, 10));
    expect(document.getElementById('a11y-announcer-polite')!.textContent).toBe('First');
    expect(document.getElementById('a11y-announcer-assertive')!.textContent).toBe('Critical');
  });

  it('announceImmediate uses assertive region', async () => {
    const el = document.getElementById('a11y-announcer-assertive')!;
    bridge.announceImmediate('Emergency!');
    await new Promise((r) => setTimeout(r, 10));
    expect(el.textContent).toBe('Emergency!');
  });

  it('does nothing after disposal', async () => {
    bridge.dispose();
    bridge.announce([{ text: 'Ignored', priority: 'polite', category: 'system' }]);
    await new Promise((r) => setTimeout(r, 10));
    expect(document.getElementById('a11y-announcer-polite')!.textContent).toBe('');
  });

  it('clears timers on dispose', () => {
    bridge.announce([{ text: 'Test', priority: 'polite', category: 'system' }]);
    // Dispose before timer fires
    bridge.dispose();
    expect(document.getElementById('a11y-announcer-polite')!.textContent).toBe('');
  });
});
