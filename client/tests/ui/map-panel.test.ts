import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NexusCore } from '@nexus-academy/core';
import { MapPanel } from '../../src/ui/map-panel.js';

function makeCanvasContext(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function makeCore(discoveredBiomes: string[], activeBiome = 'workshop'): NexusCore {
  return {
    worldSystem: {
      getWorldState: vi.fn(() => ({
        activeBiome,
        discoveredBiomes,
      })),
    },
  } as unknown as NexusCore;
}

function findMapButton(text: string): HTMLButtonElement {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.map-biome-node')];
  const match = buttons.find(button => button.textContent?.includes(text));
  if (!match) throw new Error(`Could not find map button containing "${text}"`);
  return match;
}

describe('MapPanel route guidance', () => {
  let restoreGetContext: () => void;

  beforeEach(() => {
    document.body.innerHTML = '<div id="hud"></div>';
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(contextId: string) {
      return contextId === '2d' ? makeCanvasContext() : null;
    } as HTMLCanvasElement['getContext'];
    restoreGetContext = () => { HTMLCanvasElement.prototype.getContext = originalGetContext; };
  });

  afterEach(() => {
    restoreGetContext();
    document.body.innerHTML = '';
  });

  it('shows adjacent Foundation routes as named walk-to-discover paths', () => {
    const onCompanionSpeak = vi.fn();
    const panel = new MapPanel({
      core: makeCore(['workshop']),
      profileId: 'tester',
      worldManager: {} as never,
      onCompanionSpeak,
      onTravelTo: vi.fn(),
    });

    panel.open();

    const forest = findMapButton('Living Forest');
    expect(forest.classList.contains('map-reachable')).toBe(true);
    expect(forest.disabled).toBe(false);
    expect(forest.textContent).toContain('Walk there');

    forest.click();
    expect(onCompanionSpeak).toHaveBeenCalledWith(expect.stringContaining('stone bridge'));
    expect(onCompanionSpeak).toHaveBeenCalledWith(expect.stringContaining('Walk there once'));

    panel.dispose();
  });

  it('keeps fast travel limited to discovered biomes', () => {
    const onTravelTo = vi.fn();
    const onCompanionSpeak = vi.fn();
    const panel = new MapPanel({
      core: makeCore(['workshop', 'living-forest']),
      profileId: 'tester',
      worldManager: {} as never,
      onCompanionSpeak,
      onTravelTo,
    });

    panel.open();

    findMapButton('Living Forest').click();
    expect(onTravelTo).toHaveBeenCalledWith('living-forest');

    const library = findMapButton('Library of Echoes');
    expect(library.classList.contains('map-reachable')).toBe(true);
    library.click();
    expect(onTravelTo).not.toHaveBeenCalledWith('library-echoes');
    expect(onCompanionSpeak).toHaveBeenCalledWith(expect.stringContaining('reading clearing'));

    panel.dispose();
  });
});
