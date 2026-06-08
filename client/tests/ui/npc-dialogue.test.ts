import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Quest, QuestStep } from '@nexus-academy/core';
import {
  NpcDialoguePanel,
  buildNpcOpeningLine,
  buildNpcOptionResponse,
  getNpc,
} from '../../src/ui/npc-dialogue.js';

const activeStep: QuestStep = {
  index: 0,
  instruction: 'Use the Workbench to mix red and blue pigment.',
  spokenInstruction: 'Use the Workbench and mix red with blue.',
  companionRepeat: 'Red plus blue makes purple.',
  objectiveType: 'craft',
  targetId: 'mix-purple-paint',
  targetValue: 'purple-pigment',
  hints: [],
  successResponse: 'Purple!',
  failureResponse: 'Try red with blue.',
};

const activeQuest: Quest = {
  id: 'f-workshop-colorful-workbench',
  title: 'The Colorful Workbench',
  biome: 'workshop',
  masteryTier: 'foundation',
  skillsRequired: [],
  skillsTaught: ['science.color-mixing'],
  content: {
    description: 'Mix colors.',
    steps: [activeStep],
  },
  generatedBy: 'test',
  validated: true,
  createdAt: new Date(0).toISOString(),
};

describe('NpcDialoguePanel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('uses named opening guidance for Workshop NPCs', () => {
    const hilda = getNpc('npc-hilda-blacksmith')!;

    expect(buildNpcOpeningLine(hilda, { biomeId: 'workshop' })).toContain('red plus blue makes purple');
  });

  it('uses active quest context when a local quest is underway', () => {
    const tinker = getNpc('npc-workshop-sage')!;

    expect(buildNpcOpeningLine(tinker, {
      biomeId: 'workshop',
      activeQuest,
      activeStep,
    })).toContain('Red plus blue makes purple');
    expect(buildNpcOptionResponse(tinker, 'learn', {
      biomeId: 'workshop',
      activeQuest,
      activeStep,
    })).toContain('The Colorful Workbench');
  });

  it('notifies the speech path when shown and when text changes', () => {
    const panel = new NpcDialoguePanel();
    const hilda = getNpc('npc-hilda-blacksmith')!;
    const onLine = vi.fn();

    panel.show(hilda, vi.fn(), {
      context: { biomeId: 'workshop' },
      onLine,
    });

    expect(document.getElementById('npc-dialogue-overlay')).not.toBeNull();
    expect(onLine).toHaveBeenCalledWith('Hilda', expect.stringContaining('red plus blue makes purple'));

    panel.updateText('The Anvil shapes stable structures.');
    expect(onLine).toHaveBeenLastCalledWith('Hilda', 'The Anvil shapes stable structures.');

    panel.dispose();
  });
});
