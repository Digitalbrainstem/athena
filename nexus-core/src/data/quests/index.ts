// Quest data barrel export
// Aggregates all hand-crafted quest content for seeding into the database

import type { CreateQuestInput } from '../../types/quest.js';
import { foundationWorkshopQuests } from './foundation-workshop.js';
import { foundationForestQuests } from './foundation-forest.js';
import { foundationCavernsQuests } from './foundation-caverns.js';
import { foundationScienceQuests } from './foundation-science.js';
import { foundationSocialQuests } from './foundation-social.js';
import { foundationEngineeringQuests } from './foundation-engineering.js';
import { foundationHumanitiesQuests } from './foundation-humanities.js';

import { innovatorWorkshopQuests } from './innovator/innovator-workshop.js';
import { innovatorAlchemistLabQuests } from './innovator/innovator-alchemist-lab.js';
import { innovatorCrystalCavernsQuests } from './innovator/innovator-crystal-caverns.js';
import { innovatorLivingForestQuests } from './innovator/innovator-living-forest.js';
import { innovatorLibraryEchoesQuests } from './innovator/innovator-library-echoes.js';
import { innovatorAncientRuinsQuests } from './innovator/innovator-ancient-ruins.js';
import { innovatorTimeRiftQuests } from './innovator/innovator-time-rift.js';
import { innovatorExplorersMapQuests } from './innovator/innovator-explorers-map.js';
import { innovatorGalleryQuests } from './innovator/innovator-gallery.js';
import { innovatorNewsroomQuests } from './innovator/innovator-newsroom.js';
import { innovatorTheaterQuests } from './innovator/innovator-theater.js';
import { innovatorMarketplaceQuests } from './innovator/innovator-marketplace.js';
import { innovatorObservatoryQuests } from './innovator/innovator-observatory.js';
import { innovatorStormTowerQuests } from './innovator/innovator-storm-tower.js';
import { innovatorHealersSanctuaryQuests } from './innovator/innovator-healers-sanctuary.js';
import { innovatorHospitalQuests } from './innovator/innovator-hospital.js';
import { innovatorFarmQuests } from './innovator/innovator-farm.js';
import { innovatorLaboratoryQuests } from './innovator/innovator-laboratory.js';
import { innovatorArchitectsDomainQuests } from './innovator/innovator-architects-domain.js';
import { innovatorShipyardQuests } from './innovator/innovator-shipyard.js';
import { innovatorCodeForgeQuests } from './innovator/innovator-code-forge.js';
import { innovatorDigitalWorldQuests } from './innovator/innovator-digital-world.js';
import { innovatorSpaceStationQuests } from './innovator/innovator-space-station.js';
import { innovatorDebateHallQuests } from './innovator/innovator-debate-hall.js';
import { innovatorTradingPostQuests } from './innovator/innovator-trading-post.js';
import { innovatorArenaQuests } from './innovator/innovator-arena.js';
import { innovatorMusicHallQuests } from './innovator/innovator-music-hall.js';

import { creatorWorkshopQuests } from './creator/creator-workshop.js';
import { creatorAlchemistLabQuests } from './creator/creator-alchemist-lab.js';
import { creatorCrystalCavernsQuests } from './creator/creator-crystal-caverns.js';
import { creatorLivingForestQuests } from './creator/creator-living-forest.js';
import { creatorLibraryEchoesQuests } from './creator/creator-library-echoes.js';
import { creatorAncientRuinsQuests } from './creator/creator-ancient-ruins.js';
import { creatorTimeRiftQuests } from './creator/creator-time-rift.js';
import { creatorExplorersMapQuests } from './creator/creator-explorers-map.js';
import { creatorGalleryQuests } from './creator/creator-gallery.js';
import { creatorNewsroomQuests } from './creator/creator-newsroom.js';
import { creatorTheaterQuests } from './creator/creator-theater.js';
import { creatorMarketplaceQuests } from './creator/creator-marketplace.js';
import { creatorObservatoryQuests } from './creator/creator-observatory.js';
import { creatorStormTowerQuests } from './creator/creator-storm-tower.js';
import { creatorHealersSanctuaryQuests } from './creator/creator-healers-sanctuary.js';
import { creatorHospitalQuests } from './creator/creator-hospital.js';
import { creatorFarmQuests } from './creator/creator-farm.js';
import { creatorLaboratoryQuests } from './creator/creator-laboratory.js';
import { creatorArchitectsDomainQuests } from './creator/creator-architects-domain.js';
import { creatorShipyardQuests } from './creator/creator-shipyard.js';
import { creatorCodeForgeQuests } from './creator/creator-code-forge.js';
import { creatorDigitalWorldQuests } from './creator/creator-digital-world.js';
import { creatorSpaceStationQuests } from './creator/creator-space-station.js';
import { creatorDebateHallQuests } from './creator/creator-debate-hall.js';
import { creatorTradingPostQuests } from './creator/creator-trading-post.js';
import { creatorArenaQuests } from './creator/creator-arena.js';
import { creatorMusicHallQuests } from './creator/creator-music-hall.js';

export { foundationWorkshopQuests } from './foundation-workshop.js';
export { foundationForestQuests } from './foundation-forest.js';
export { foundationCavernsQuests } from './foundation-caverns.js';
export { foundationScienceQuests } from './foundation-science.js';
export { foundationSocialQuests } from './foundation-social.js';
export { foundationEngineeringQuests } from './foundation-engineering.js';
export { foundationHumanitiesQuests } from './foundation-humanities.js';

export { innovatorWorkshopQuests } from './innovator/innovator-workshop.js';
export { innovatorAlchemistLabQuests } from './innovator/innovator-alchemist-lab.js';
export { innovatorCrystalCavernsQuests } from './innovator/innovator-crystal-caverns.js';
export { innovatorLivingForestQuests } from './innovator/innovator-living-forest.js';
export { innovatorLibraryEchoesQuests } from './innovator/innovator-library-echoes.js';
export { innovatorAncientRuinsQuests } from './innovator/innovator-ancient-ruins.js';
export { innovatorTimeRiftQuests } from './innovator/innovator-time-rift.js';
export { innovatorExplorersMapQuests } from './innovator/innovator-explorers-map.js';
export { innovatorGalleryQuests } from './innovator/innovator-gallery.js';
export { innovatorNewsroomQuests } from './innovator/innovator-newsroom.js';
export { innovatorTheaterQuests } from './innovator/innovator-theater.js';
export { innovatorMarketplaceQuests } from './innovator/innovator-marketplace.js';
export { innovatorObservatoryQuests } from './innovator/innovator-observatory.js';
export { innovatorStormTowerQuests } from './innovator/innovator-storm-tower.js';
export { innovatorHealersSanctuaryQuests } from './innovator/innovator-healers-sanctuary.js';
export { innovatorHospitalQuests } from './innovator/innovator-hospital.js';
export { innovatorFarmQuests } from './innovator/innovator-farm.js';
export { innovatorLaboratoryQuests } from './innovator/innovator-laboratory.js';
export { innovatorArchitectsDomainQuests } from './innovator/innovator-architects-domain.js';
export { innovatorShipyardQuests } from './innovator/innovator-shipyard.js';
export { innovatorCodeForgeQuests } from './innovator/innovator-code-forge.js';
export { innovatorDigitalWorldQuests } from './innovator/innovator-digital-world.js';
export { innovatorSpaceStationQuests } from './innovator/innovator-space-station.js';
export { innovatorDebateHallQuests } from './innovator/innovator-debate-hall.js';
export { innovatorTradingPostQuests } from './innovator/innovator-trading-post.js';
export { innovatorArenaQuests } from './innovator/innovator-arena.js';
export { innovatorMusicHallQuests } from './innovator/innovator-music-hall.js';

export { creatorWorkshopQuests } from './creator/creator-workshop.js';
export { creatorAlchemistLabQuests } from './creator/creator-alchemist-lab.js';
export { creatorCrystalCavernsQuests } from './creator/creator-crystal-caverns.js';
export { creatorLivingForestQuests } from './creator/creator-living-forest.js';
export { creatorLibraryEchoesQuests } from './creator/creator-library-echoes.js';
export { creatorAncientRuinsQuests } from './creator/creator-ancient-ruins.js';
export { creatorTimeRiftQuests } from './creator/creator-time-rift.js';
export { creatorExplorersMapQuests } from './creator/creator-explorers-map.js';
export { creatorGalleryQuests } from './creator/creator-gallery.js';
export { creatorNewsroomQuests } from './creator/creator-newsroom.js';
export { creatorTheaterQuests } from './creator/creator-theater.js';
export { creatorMarketplaceQuests } from './creator/creator-marketplace.js';
export { creatorObservatoryQuests } from './creator/creator-observatory.js';
export { creatorStormTowerQuests } from './creator/creator-storm-tower.js';
export { creatorHealersSanctuaryQuests } from './creator/creator-healers-sanctuary.js';
export { creatorHospitalQuests } from './creator/creator-hospital.js';
export { creatorFarmQuests } from './creator/creator-farm.js';
export { creatorLaboratoryQuests } from './creator/creator-laboratory.js';
export { creatorArchitectsDomainQuests } from './creator/creator-architects-domain.js';
export { creatorShipyardQuests } from './creator/creator-shipyard.js';
export { creatorCodeForgeQuests } from './creator/creator-code-forge.js';
export { creatorDigitalWorldQuests } from './creator/creator-digital-world.js';
export { creatorSpaceStationQuests } from './creator/creator-space-station.js';
export { creatorDebateHallQuests } from './creator/creator-debate-hall.js';
export { creatorTradingPostQuests } from './creator/creator-trading-post.js';
export { creatorArenaQuests } from './creator/creator-arena.js';
export { creatorMusicHallQuests } from './creator/creator-music-hall.js';

/** All hand-crafted Foundation tier quests across every biome */
export const allFoundationQuests: CreateQuestInput[] = [
  ...foundationWorkshopQuests,
  ...foundationForestQuests,
  ...foundationCavernsQuests,
  ...foundationScienceQuests,
  ...foundationSocialQuests,
  ...foundationEngineeringQuests,
  ...foundationHumanitiesQuests,
];

/** All hand-crafted Innovator tier quests across every biome */
export const allInnovatorQuests: CreateQuestInput[] = [
  ...innovatorWorkshopQuests,
  ...innovatorAlchemistLabQuests,
  ...innovatorCrystalCavernsQuests,
  ...innovatorLivingForestQuests,
  ...innovatorLibraryEchoesQuests,
  ...innovatorAncientRuinsQuests,
  ...innovatorTimeRiftQuests,
  ...innovatorExplorersMapQuests,
  ...innovatorGalleryQuests,
  ...innovatorNewsroomQuests,
  ...innovatorTheaterQuests,
  ...innovatorMarketplaceQuests,
  ...innovatorObservatoryQuests,
  ...innovatorStormTowerQuests,
  ...innovatorHealersSanctuaryQuests,
  ...innovatorHospitalQuests,
  ...innovatorFarmQuests,
  ...innovatorLaboratoryQuests,
  ...innovatorArchitectsDomainQuests,
  ...innovatorShipyardQuests,
  ...innovatorCodeForgeQuests,
  ...innovatorDigitalWorldQuests,
  ...innovatorSpaceStationQuests,
  ...innovatorDebateHallQuests,
  ...innovatorTradingPostQuests,
  ...innovatorArenaQuests,
  ...innovatorMusicHallQuests,
];

/** All hand-crafted Creator tier quests across every biome */
export const allCreatorQuests: CreateQuestInput[] = [
  ...creatorWorkshopQuests,
  ...creatorAlchemistLabQuests,
  ...creatorCrystalCavernsQuests,
  ...creatorLivingForestQuests,
  ...creatorLibraryEchoesQuests,
  ...creatorAncientRuinsQuests,
  ...creatorTimeRiftQuests,
  ...creatorExplorersMapQuests,
  ...creatorGalleryQuests,
  ...creatorNewsroomQuests,
  ...creatorTheaterQuests,
  ...creatorMarketplaceQuests,
  ...creatorObservatoryQuests,
  ...creatorStormTowerQuests,
  ...creatorHealersSanctuaryQuests,
  ...creatorHospitalQuests,
  ...creatorFarmQuests,
  ...creatorLaboratoryQuests,
  ...creatorArchitectsDomainQuests,
  ...creatorShipyardQuests,
  ...creatorCodeForgeQuests,
  ...creatorDigitalWorldQuests,
  ...creatorSpaceStationQuests,
  ...creatorDebateHallQuests,
  ...creatorTradingPostQuests,
  ...creatorArenaQuests,
  ...creatorMusicHallQuests,
];

/** Every hand-crafted quest in the game, all tiers */
export const allQuests: CreateQuestInput[] = [
  ...allFoundationQuests,
  ...allInnovatorQuests,
  ...allCreatorQuests,
];
