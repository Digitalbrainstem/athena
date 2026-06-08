import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { CraftRecipe, NexusCore } from '@nexus-academy/core';
import { CraftPanel } from '../../src/ui/craft-panel.js';

const purpleRecipe: CraftRecipe = {
  id: 'mix-purple-paint',
  name: 'Mix Purple Paint',
  description: 'Combine red and blue pigments to create purple paint.',
  tier: 'foundation',
  biome: 'workshop',
  inputs: [
    { type: 'item', id: 'red-pigment', quantity: 1 },
    { type: 'item', id: 'blue-pigment', quantity: 1 },
  ],
  output: { type: 'item', id: 'purple-pigment', quantity: 1 },
  skillsTaught: ['color-theory-subtractive-mixing'],
  scienceExplanation: 'Red and blue make purple.',
  accessibility: {
    spokenName: 'mix purple paint',
    spokenFormula: 'red pigment plus blue pigment makes purple pigment',
    description: 'Select red pigment and blue pigment.',
    iconShape: 'triangle',
  },
};

const glassRecipe: CraftRecipe = {
  id: 'glass-pane',
  name: 'Make Glass from Sand',
  description: 'Heat sand to make glass.',
  tier: 'discovery',
  biome: 'workshop',
  inputs: [
    { type: 'compound', id: 'SiO2', quantity: 3 },
  ],
  output: { type: 'item', id: 'glass-pane', quantity: 1 },
  skillsTaught: ['melting-point'],
  scienceExplanation: 'Glass forms when sand is heated.',
  accessibility: {
    spokenName: 'make glass from sand',
    spokenFormula: 'three silicon dioxide makes one glass pane',
    description: 'Select silicon dioxide.',
    iconShape: 'triangle',
  },
};

const towerRecipe: CraftRecipe = {
  id: 'stack-block-tower',
  name: 'Build a Block Tower',
  description: 'Stack wooden blocks to build a stable tower.',
  tier: 'foundation',
  biome: 'workshop',
  inputs: [
    { type: 'material', id: 'pine-wood', quantity: 5 },
  ],
  output: { type: 'structure', id: 'block-tower', quantity: 1 },
  skillsTaught: ['basic-stability'],
  scienceExplanation: 'A tower is stable when its center of gravity is over its base.',
  accessibility: {
    spokenName: 'build a block tower',
    spokenFormula: 'five pine wood makes a block tower',
    description: 'Select five pine wood.',
    iconShape: 'square',
  },
};

function makeCore(
  inventory: Array<{ itemType: string; quantity: number }>,
  recipes: CraftRecipe[],
): NexusCore {
  const world = {
    query: vi.fn(() => ['player']),
    getComponent: vi.fn(() => ({ masteryTier: 'discovery' })),
    emitEvent: vi.fn(),
  };

  return {
    worldSystem: {
      getWorldState: vi.fn(() => ({ inventory, activeBiome: 'workshop' })),
      removeInventoryItem: vi.fn(),
      addInventoryItem: vi.fn(),
    },
    getWorld: vi.fn(() => world),
    craftSystem: {
      getAvailableRecipes: vi.fn(() => recipes),
      attemptCraft: vi.fn((recipe: CraftRecipe) => ({
        success: true,
        output: recipe.output,
        learningEvents: recipe.skillsTaught,
      })),
    },
  } as unknown as NexusCore;
}

describe('CraftPanel station UX', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="hud"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows Workbench-specific guidance and ready pigment recipes', () => {
    const panel = new CraftPanel({
      core: makeCore([
        { itemType: 'red-pigment', quantity: 1 },
        { itemType: 'blue-pigment', quantity: 1 },
      ], [purpleRecipe, glassRecipe]),
      profileId: 'tester',
      onCompanionSpeak: vi.fn(),
    });

    panel.open('workbench');

    expect(document.body.textContent).toContain('Start with Red Pigment + Blue Pigment');
    expect(document.body.textContent).toContain('Mix Purple Paint');
    expect(document.body.textContent).toContain('Ready');
    expect(document.body.textContent).not.toContain('Make Glass from Sand');

    panel.dispose();
  });

  it('filters Forge to heat recipes and explains missing sand', () => {
    const panel = new CraftPanel({
      core: makeCore([
        { itemType: 'red-pigment', quantity: 1 },
        { itemType: 'blue-pigment', quantity: 1 },
      ], [purpleRecipe, glassRecipe]),
      profileId: 'tester',
      onCompanionSpeak: vi.fn(),
    });

    panel.open('forge');

    expect(document.querySelector('.craft-title')?.textContent).toBe('Forge');
    expect(document.querySelector('.craft-btn')?.textContent).toBe('Heat');
    expect(document.body.textContent).toContain('Make Glass from Sand');
    expect(document.body.textContent).toContain('Need 3 SiO₂');
    expect(document.body.textContent).not.toContain('Mix Purple Paint');

    panel.dispose();
  });

  it('previews locked Forge heat recipes when the player has not unlocked Discovery yet', () => {
    const panel = new CraftPanel({
      core: makeCore([
        { itemType: 'SiO2', quantity: 3 },
      ], [purpleRecipe]),
      profileId: 'tester',
      onCompanionSpeak: vi.fn(),
    });

    panel.open('forge');

    expect(document.body.textContent).toContain('Make Glass from Sand');
    expect(document.body.textContent).toContain('Unlocks in Discovery');
    expect(document.body.textContent).not.toContain('Ready');
    expect(document.body.textContent).not.toContain('Build a Stone Wall');

    panel.dispose();
  });

  it('lets the Anvil shape starter pine wood into a structure recipe', async () => {
    const onCraftComplete = vi.fn();
    const core = makeCore([
      { itemType: 'pine-wood', quantity: 5 },
    ], [purpleRecipe, towerRecipe]);
    const panel = new CraftPanel({
      core,
      profileId: 'tester',
      onCompanionSpeak: vi.fn(),
      onCraftComplete,
    });

    panel.open('anvil');

    const pineWood = document.querySelector<HTMLButtonElement>('[data-item="pine-wood"]');
    expect(pineWood).not.toBeNull();
    for (let i = 0; i < 5; i++) pineWood!.click();

    expect(document.querySelector('.craft-result-text')?.textContent).toBe('→ Block Tower');
    document.querySelector<HTMLButtonElement>('.craft-btn')?.click();
    await Promise.resolve();

    expect(core.craftSystem.attemptCraft).toHaveBeenCalledWith(
      towerRecipe,
      [{ type: 'material', id: 'pine-wood', quantity: 5 }],
    );
    expect(onCraftComplete).toHaveBeenCalledWith(
      towerRecipe,
      expect.objectContaining({ success: true, output: towerRecipe.output }),
    );

    panel.dispose();
  });
});
