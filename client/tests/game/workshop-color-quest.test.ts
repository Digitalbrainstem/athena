import { describe, expect, it } from 'vitest';
import { RECIPES, foundationWorkshopQuests } from '@nexus-academy/core';
import type { CraftRecipe, Quest } from '@nexus-academy/core';
import { resolveWorkshopColorCraft } from '../../src/game/workshop-color-quest.js';

const colorQuest = {
  ...foundationWorkshopQuests[0],
  skillsRequired: foundationWorkshopQuests[0].skillsRequired ?? [],
  skillsTaught: foundationWorkshopQuests[0].skillsTaught ?? [],
  generatedBy: 'test',
  validated: true,
  createdAt: '2026-01-01T00:00:00.000Z',
} satisfies Quest;

function recipe(id: string): CraftRecipe {
  const found = RECIPES.find(candidate => candidate.id === id);
  if (!found) throw new Error(`Missing recipe fixture: ${id}`);
  return found;
}

describe('resolveWorkshopColorCraft', () => {
  it('recognizes orange crafted before green without skipping the missing green step', () => {
    const resolution = resolveWorkshopColorCraft(
      colorQuest,
      1,
      recipe('mix-orange-paint'),
      new Set(['purple-pigment', 'orange-pigment']),
    );

    expect(resolution.relevant).toBe(true);
    expect(resolution.craftedStep?.targetId).toBe('mix-orange-paint');
    expect(resolution.outOfOrder).toBe(true);
    expect(resolution.nextIncompleteStep?.targetId).toBe('mix-green-paint');
    expect(resolution.nextStepsCompleted).toBe(1);
    expect(resolution.completedQuest).toBe(false);
  });

  it('catches progress up when the missing middle color is crafted later', () => {
    const resolution = resolveWorkshopColorCraft(
      colorQuest,
      1,
      recipe('mix-green-paint'),
      new Set(['purple-pigment', 'orange-pigment', 'green-pigment']),
    );

    expect(resolution.relevant).toBe(true);
    expect(resolution.craftedStep?.targetId).toBe('mix-green-paint');
    expect(resolution.nextIncompleteStep).toBeNull();
    expect(resolution.nextStepsCompleted).toBe(3);
    expect(resolution.advanced).toBe(true);
    expect(resolution.completedQuest).toBe(true);
  });

  it('keeps the normal ordered purple to green to orange path progressing one step at a time', () => {
    const green = resolveWorkshopColorCraft(
      colorQuest,
      1,
      recipe('mix-green-paint'),
      new Set(['purple-pigment', 'green-pigment']),
    );
    const orange = resolveWorkshopColorCraft(
      colorQuest,
      2,
      recipe('mix-orange-paint'),
      new Set(['purple-pigment', 'green-pigment', 'orange-pigment']),
    );

    expect(green.outOfOrder).toBe(false);
    expect(green.nextStepsCompleted).toBe(2);
    expect(orange.outOfOrder).toBe(false);
    expect(orange.nextStepsCompleted).toBe(3);
    expect(orange.completedQuest).toBe(true);
  });
});
