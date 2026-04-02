import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CaptionOverlay } from '../../src/ui/caption-overlay.js';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '@nexus-academy/core';

function createMockDom(): void {
  document.body.innerHTML = '<div id="caption-container"></div>';
}

describe('CaptionOverlay', () => {
  let overlay: CaptionOverlay;

  beforeEach(() => {
    createMockDom();
    overlay = new CaptionOverlay();
    overlay.init();
  });

  afterEach(() => {
    overlay.dispose();
    document.body.innerHTML = '';
  });

  it('defaults to bottom position', () => {
    expect(overlay.getPosition()).toBe('bottom');
    const container = document.getElementById('caption-container')!;
    expect(container.classList.contains('caption-bottom')).toBe(true);
  });

  it('changes position to top', () => {
    overlay.setPosition('top');
    expect(overlay.getPosition()).toBe('top');
    const container = document.getElementById('caption-container')!;
    expect(container.classList.contains('caption-top')).toBe(true);
    expect(container.classList.contains('caption-bottom')).toBe(false);
  });

  it('changes position to floating', () => {
    overlay.setPosition('floating');
    expect(overlay.getPosition()).toBe('floating');
    const container = document.getElementById('caption-container')!;
    expect(container.classList.contains('caption-floating')).toBe(true);
  });

  it('sets background class', () => {
    overlay.setBackground('opaque');
    expect(overlay.getBackground()).toBe('opaque');
    const container = document.getElementById('caption-container')!;
    expect(container.classList.contains('caption-bg-opaque')).toBe(true);
  });

  it('removes previous background class when switching', () => {
    overlay.setBackground('opaque');
    overlay.setBackground('none');
    const container = document.getElementById('caption-container')!;
    expect(container.classList.contains('caption-bg-opaque')).toBe(false);
    expect(container.classList.contains('caption-bg-none')).toBe(true);
  });

  it('applies font size from settings', () => {
    overlay.applySettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS, fontSize: 150 });
    const container = document.getElementById('caption-container')!;
    expect(container.style.getPropertyValue('--caption-font-size')).toBe('1.5rem');
  });

  it('cleans up on dispose', () => {
    overlay.applySettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS, fontSize: 200 });
    overlay.dispose();
    const container = document.getElementById('caption-container')!;
    expect(container.style.getPropertyValue('--caption-font-size')).toBe('');
  });
});
