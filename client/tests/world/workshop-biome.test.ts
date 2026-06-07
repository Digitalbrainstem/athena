import { describe, expect, it } from 'vitest';
import { getWorkshopCollisionBoxes, getWorkshopGameplayObjects } from '../../src/world/workshop-biome.js';

describe('WorkshopBiome gameplay metadata', () => {
  it('provides collision boxes for solid opening-scene models', () => {
    const boxes = getWorkshopCollisionBoxes(-40, 30);

    expect(boxes.length).toBeGreaterThan(20);
    expect(boxes).toContainEqual(expect.objectContaining({
      cx: -40,
      cz: 27.5,
    }));
  });

  it('exposes the opening craft stations and chest as gameplay objects', () => {
    const objects = getWorkshopGameplayObjects(-40, 0.5, 30);
    const modelIds = objects.map(obj => obj.renderable.modelId);

    expect(modelIds).toEqual(expect.arrayContaining(['forge', 'workbench', 'anvil', 'chest']));

    const workbench = objects.find(obj => obj.renderable.modelId === 'workbench');
    expect(workbench?.position).toEqual(expect.objectContaining({ x: -40, z: 35 }));
    expect(workbench?.interactable).toEqual(expect.objectContaining({
      interactionType: 'craft',
      prompt: 'Interact with workbench',
    }));
  });
});
