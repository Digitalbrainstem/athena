import { describe, it, expect } from 'vitest';
import { AnnouncementQueue } from '../../src/accessibility/announce.js';
import type { Announcement } from '../../src/types/accessibility.js';

describe('AnnouncementQueue', () => {
  it('starts empty', () => {
    const q = new AnnouncementQueue();
    expect(q.length).toBe(0);
    expect(q.flush()).toEqual([]);
  });

  it('pushes announcements', () => {
    const q = new AnnouncementQueue();
    const ann: Announcement = { text: 'Hello', priority: 'polite', category: 'companion' };
    q.push(ann);
    expect(q.length).toBe(1);
  });

  it('flush drains all announcements', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'A', priority: 'polite', category: 'quest' });
    q.push({ text: 'B', priority: 'assertive', category: 'error' });
    const items = q.flush();
    expect(items).toHaveLength(2);
    expect(items[0]!.text).toBe('A');
    expect(items[1]!.text).toBe('B');
    expect(q.length).toBe(0);
  });

  it('flush returns empty after draining', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'X', priority: 'polite', category: 'navigation' });
    q.flush();
    expect(q.flush()).toEqual([]);
  });

  it('announce() creates polite announcements', () => {
    const q = new AnnouncementQueue();
    q.announce('New quest available', 'quest');
    const items = q.flush();
    expect(items).toHaveLength(1);
    expect(items[0]!.priority).toBe('polite');
    expect(items[0]!.category).toBe('quest');
    expect(items[0]!.text).toBe('New quest available');
  });

  it('assertive() creates assertive announcements', () => {
    const q = new AnnouncementQueue();
    q.assertive('Error occurred', 'error');
    const items = q.flush();
    expect(items).toHaveLength(1);
    expect(items[0]!.priority).toBe('assertive');
    expect(items[0]!.category).toBe('error');
  });

  it('peek() returns items without draining', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'A', priority: 'polite', category: 'navigation' });
    const peeked = q.peek();
    expect(peeked).toHaveLength(1);
    expect(q.length).toBe(1); // still in queue
  });

  it('clear() removes all items', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'A', priority: 'polite', category: 'quest' });
    q.push({ text: 'B', priority: 'assertive', category: 'error' });
    q.clear();
    expect(q.length).toBe(0);
    expect(q.flush()).toEqual([]);
  });

  it('filterByPriority returns matching items', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'A', priority: 'polite', category: 'quest' });
    q.push({ text: 'B', priority: 'assertive', category: 'error' });
    q.push({ text: 'C', priority: 'polite', category: 'navigation' });
    expect(q.filterByPriority('polite')).toHaveLength(2);
    expect(q.filterByPriority('assertive')).toHaveLength(1);
  });

  it('filterByCategory returns matching items', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'A', priority: 'polite', category: 'quest' });
    q.push({ text: 'B', priority: 'assertive', category: 'quest' });
    q.push({ text: 'C', priority: 'polite', category: 'error' });
    expect(q.filterByCategory('quest')).toHaveLength(2);
    expect(q.filterByCategory('error')).toHaveLength(1);
    expect(q.filterByCategory('navigation')).toHaveLength(0);
  });

  it('handles many announcements', () => {
    const q = new AnnouncementQueue();
    for (let i = 0; i < 100; i++) {
      q.push({ text: `Item ${i}`, priority: 'polite', category: 'quest' });
    }
    expect(q.length).toBe(100);
    const items = q.flush();
    expect(items).toHaveLength(100);
    expect(q.length).toBe(0);
  });

  it('maintains insertion order', () => {
    const q = new AnnouncementQueue();
    q.push({ text: 'First', priority: 'polite', category: 'navigation' });
    q.push({ text: 'Second', priority: 'assertive', category: 'error' });
    q.push({ text: 'Third', priority: 'polite', category: 'quest' });
    const items = q.flush();
    expect(items.map(i => i.text)).toEqual(['First', 'Second', 'Third']);
  });
});
