// Quest data barrel export
// Aggregates all hand-crafted quest content for seeding into the database

import type { CreateQuestInput } from '../../types/quest.js';
import { foundationWorkshopQuests } from './foundation-workshop.js';
import { foundationForestQuests } from './foundation-forest.js';
import { foundationCavernsQuests } from './foundation-caverns.js';

export { foundationWorkshopQuests } from './foundation-workshop.js';
export { foundationForestQuests } from './foundation-forest.js';
export { foundationCavernsQuests } from './foundation-caverns.js';

/** All hand-crafted Foundation tier quests across every biome */
export const allFoundationQuests: CreateQuestInput[] = [
  ...foundationWorkshopQuests,
  ...foundationForestQuests,
  ...foundationCavernsQuests,
];

/** Every hand-crafted quest in the game, all tiers */
export const allQuests: CreateQuestInput[] = [
  ...allFoundationQuests,
];
