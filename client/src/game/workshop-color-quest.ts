import type { CraftRecipe, Quest, QuestStep } from '@nexus-academy/core';

export const WORKSHOP_COLOR_QUEST_ID = 'f-workshop-colorful-workbench';

export const WORKSHOP_COLOR_RECIPE_IDS = new Set([
  'mix-purple-paint',
  'mix-green-paint',
  'mix-orange-paint',
]);

export interface WorkshopColorCraftResolution {
  relevant: boolean;
  craftedStep: QuestStep | null;
  nextIncompleteStep: QuestStep | null;
  nextStepsCompleted: number;
  advanced: boolean;
  completedQuest: boolean;
  outOfOrder: boolean;
}

export function resolveWorkshopColorCraft(
  quest: Quest | undefined,
  currentStepsCompleted: number,
  recipe: CraftRecipe,
  completedItemIds: ReadonlySet<string>,
): WorkshopColorCraftResolution {
  if (!quest || quest.id !== WORKSHOP_COLOR_QUEST_ID || !WORKSHOP_COLOR_RECIPE_IDS.has(recipe.id)) {
    return emptyResolution(currentStepsCompleted);
  }

  const steps = quest.content.steps;
  const craftedStepIndex = steps.findIndex(step => step.targetId === recipe.id);
  if (craftedStepIndex < 0) return emptyResolution(currentStepsCompleted);

  const completedByIndex = steps.map((step) => {
    if (step.targetId === recipe.id) return true;
    return typeof step.targetValue === 'string' && completedItemIds.has(step.targetValue);
  });

  let contiguousCompleted = 0;
  while (completedByIndex[contiguousCompleted]) contiguousCompleted++;

  const nextStepsCompleted = Math.max(currentStepsCompleted, contiguousCompleted);
  return {
    relevant: true,
    craftedStep: steps[craftedStepIndex] ?? null,
    nextIncompleteStep: steps.find((_step, index) => !completedByIndex[index]) ?? null,
    nextStepsCompleted,
    advanced: nextStepsCompleted > currentStepsCompleted,
    completedQuest: nextStepsCompleted >= steps.length,
    outOfOrder: craftedStepIndex > currentStepsCompleted,
  };
}

function emptyResolution(currentStepsCompleted: number): WorkshopColorCraftResolution {
  return {
    relevant: false,
    craftedStep: null,
    nextIncompleteStep: null,
    nextStepsCompleted: currentStepsCompleted,
    advanced: false,
    completedQuest: false,
    outOfOrder: false,
  };
}
