// Announcement queue for screen readers
// Renderers drain this queue each frame and feed entries to aria-live regions.

import type { Announcement, AnnouncementPriority, AnnouncementCategory } from '../types/accessibility.js';

export class AnnouncementQueue {
  private queue: Announcement[] = [];

  /** Add an announcement to the queue. */
  push(announcement: Announcement): void {
    this.queue.push(announcement);
  }

  /** Convenience: push a polite announcement. */
  announce(text: string, category: AnnouncementCategory): void {
    this.queue.push({ text, priority: 'polite', category });
  }

  /** Convenience: push an assertive (high-priority) announcement. */
  assertive(text: string, category: AnnouncementCategory): void {
    this.queue.push({ text, priority: 'assertive', category });
  }

  /** Drain the queue and return all pending announcements. */
  flush(): Announcement[] {
    const items = this.queue.splice(0);
    return items;
  }

  /** Peek at the current queue without draining. */
  peek(): readonly Announcement[] {
    return this.queue;
  }

  /** Number of pending announcements. */
  get length(): number {
    return this.queue.length;
  }

  /** Remove all pending announcements. */
  clear(): void {
    this.queue.length = 0;
  }

  /** Filter pending announcements by priority. */
  filterByPriority(priority: AnnouncementPriority): Announcement[] {
    return this.queue.filter((a) => a.priority === priority);
  }

  /** Filter pending announcements by category. */
  filterByCategory(category: AnnouncementCategory): Announcement[] {
    return this.queue.filter((a) => a.category === category);
  }
}
