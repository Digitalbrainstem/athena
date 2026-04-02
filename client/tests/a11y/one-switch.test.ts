import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OneSwitchScanner } from '../../src/a11y/one-switch.js';
import type { ScanTarget } from '../../src/a11y/one-switch.js';
import type { GameAction } from '@nexus-academy/core';

function makeTarget(entityId: number, label: string): ScanTarget {
  return {
    entityId,
    label,
    action: { type: 'interact', source: 'keyboard' },
  };
}

describe('OneSwitchScanner', () => {
  let scanner: OneSwitchScanner;

  beforeEach(() => {
    vi.useFakeTimers();
    scanner = new OneSwitchScanner({ scanSpeed: 1.0 });
  });

  afterEach(() => {
    scanner.dispose();
    vi.useRealTimers();
  });

  it('starts inactive', () => {
    expect(scanner.isActive).toBe(false);
    expect(scanner.highlightedTarget).toBeNull();
  });

  it('can start and stop', () => {
    scanner.setTargets([makeTarget(1, 'Box')]);
    scanner.start();
    expect(scanner.isActive).toBe(true);
    scanner.stop();
    expect(scanner.isActive).toBe(false);
  });

  it('auto-advances through targets at scan speed', () => {
    const targets = [makeTarget(1, 'A'), makeTarget(2, 'B'), makeTarget(3, 'C')];
    scanner.setTargets(targets);
    scanner.start();

    // First advance happens immediately on start
    expect(scanner.highlightedIndex).toBe(0);

    vi.advanceTimersByTime(1000);
    expect(scanner.highlightedIndex).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(scanner.highlightedIndex).toBe(2);

    // Wraps around
    vi.advanceTimersByTime(1000);
    expect(scanner.highlightedIndex).toBe(0);
  });

  it('calls onHighlightChange when advancing', () => {
    const highlights: (number | null)[] = [];
    scanner.onHighlightChange((id) => highlights.push(id));
    scanner.setTargets([makeTarget(10, 'X'), makeTarget(20, 'Y')]);
    scanner.start();

    expect(highlights).toEqual([10]);

    vi.advanceTimersByTime(1000);
    expect(highlights).toEqual([10, 20]);
  });

  it('emits null highlight when stopped', () => {
    const highlights: (number | null)[] = [];
    scanner.onHighlightChange((id) => highlights.push(id));
    scanner.setTargets([makeTarget(1, 'A')]);
    scanner.start();
    scanner.stop();
    expect(highlights[highlights.length - 1]).toBeNull();
  });

  it('fires onAction on key press (select)', () => {
    const actions: GameAction[] = [];
    scanner.onAction((a) => actions.push(a));
    scanner.setTargets([makeTarget(1, 'Box')]);
    scanner.start();

    // Simulate press and release (quick tap)
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('interact');
  });

  it('updateSettings changes scan speed', () => {
    scanner.setTargets([makeTarget(1, 'A'), makeTarget(2, 'B'), makeTarget(3, 'C')]);
    scanner.start();
    // Initial advance: index = 0
    expect(scanner.highlightedIndex).toBe(0);

    // Change to 0.5s scan speed — restarts timer, immediate advance to 1
    scanner.updateSettings({ scanSpeed: 0.5 });
    expect(scanner.highlightedIndex).toBe(1);

    // After 500ms at new speed, should advance to 2
    vi.advanceTimersByTime(500);
    expect(scanner.highlightedIndex).toBe(2);
  });

  it('handles empty targets gracefully', () => {
    scanner.setTargets([]);
    scanner.start();
    expect(scanner.highlightedTarget).toBeNull();

    // Pressing should not throw
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  });

  it('resets index when targets change to shorter list', () => {
    scanner.setTargets([makeTarget(1, 'A'), makeTarget(2, 'B'), makeTarget(3, 'C')]);
    scanner.start();
    vi.advanceTimersByTime(2000); // index = 2

    scanner.setTargets([makeTarget(10, 'X')]);
    expect(scanner.highlightedIndex).toBe(0);
  });

  it('does nothing after disposal', () => {
    const actions: GameAction[] = [];
    scanner.onAction((a) => actions.push(a));
    scanner.setTargets([makeTarget(1, 'A')]);
    scanner.start();
    scanner.dispose();
    
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    expect(actions.length).toBe(0);
  });
});
