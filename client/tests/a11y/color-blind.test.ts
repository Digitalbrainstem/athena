import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ColorBlindFilter } from '../../src/a11y/color-blind.js';

describe('ColorBlindFilter', () => {
  let filter: ColorBlindFilter;

  beforeEach(() => {
    document.documentElement.className = '';
    filter = new ColorBlindFilter();
  });

  afterEach(() => {
    filter.dispose();
    document.documentElement.className = '';
  });

  it('starts with mode "none"', () => {
    expect(filter.getMode()).toBe('none');
  });

  it('applies deuteranopia class', () => {
    filter.apply('deuteranopia');
    expect(document.documentElement.classList.contains('colorblind-deuteranopia')).toBe(true);
    expect(document.documentElement.classList.contains('colorblind-active')).toBe(true);
    expect(filter.getMode()).toBe('deuteranopia');
  });

  it('applies protanopia class', () => {
    filter.apply('protanopia');
    expect(document.documentElement.classList.contains('colorblind-protanopia')).toBe(true);
  });

  it('applies tritanopia class', () => {
    filter.apply('tritanopia');
    expect(document.documentElement.classList.contains('colorblind-tritanopia')).toBe(true);
  });

  it('removes previous class when switching modes', () => {
    filter.apply('deuteranopia');
    filter.apply('protanopia');
    expect(document.documentElement.classList.contains('colorblind-deuteranopia')).toBe(false);
    expect(document.documentElement.classList.contains('colorblind-protanopia')).toBe(true);
  });

  it('removes all classes when set to none', () => {
    filter.apply('deuteranopia');
    filter.apply('none');
    expect(document.documentElement.classList.contains('colorblind-deuteranopia')).toBe(false);
    expect(document.documentElement.classList.contains('colorblind-active')).toBe(false);
    expect(filter.getMode()).toBe('none');
  });

  it('is idempotent for same mode', () => {
    filter.apply('tritanopia');
    const classList = document.documentElement.className;
    filter.apply('tritanopia');
    expect(document.documentElement.className).toBe(classList);
  });

  it('cleans up on dispose', () => {
    filter.apply('protanopia');
    filter.dispose();
    expect(document.documentElement.classList.contains('colorblind-protanopia')).toBe(false);
    expect(document.documentElement.classList.contains('colorblind-active')).toBe(false);
  });

  it('does nothing after dispose', () => {
    filter.dispose();
    filter.apply('deuteranopia');
    expect(document.documentElement.classList.contains('colorblind-deuteranopia')).toBe(false);
  });
});
