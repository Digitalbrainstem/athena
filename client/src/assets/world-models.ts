import * as THREE from 'three';
import { loadGLB, loadGLBCached, type ModelCategory } from '../world/glb-loader.js';

export interface WorldModelSpec {
  path: string;
  category?: ModelCategory;
  scale?: number;
}

const M = '/content/models';
const K = `${M}/kenney`;

const WORLD_MODEL_CATALOG: Record<string, WorldModelSpec> = {
  // Workshop
  forge: { path: `${K}/furniture/kitchenStove.glb`, category: 'metal', scale: 2.2 },
  workbench: { path: `${K}/furniture/tableCross.glb`, category: 'wood', scale: 1 },
  anvil: { path: `${K}/nature/stone_largeA.glb`, category: 'stone', scale: 1.3 },
  toolrack: { path: `${K}/furniture/coatRackStanding.glb`, category: 'wood', scale: 1.35 },
  crate: { path: `${K}/medieval/detail-crate.glb`, category: 'wood', scale: 0.75 },
  barrel: { path: `${K}/medieval/barrels.glb`, category: 'wood', scale: 0.45 },

  // Structures / buildings
  cottage: { path: `${K}/medieval/tower-base.glb`, category: 'wood', scale: 2.4 },
  barn: { path: `${K}/medieval/tower-base.glb`, category: 'wood', scale: 2.8 },
  marketstall: { path: `${K}/furniture/table.glb`, category: 'wood', scale: 2 },
  fence: { path: `${K}/nature/fence_simple.glb`, category: 'wood', scale: 1.35 },
  well: { path: `${K}/nature/pot_large.glb`, category: 'stone', scale: 1.4 },
  bridge: { path: `${K}/nature/bridge_wood.glb`, category: 'wood', scale: 1.4 },
  waterchannel: { path: `${K}/medieval/water.glb`, category: 'default', scale: 1.6 },
  stonepath: { path: `${K}/nature/path_stone.glb`, category: 'stone', scale: 1.3 },
  signpost: { path: `${K}/nature/sign.glb`, category: 'wood', scale: 1.5 },
  lantern: { path: `${K}/furniture/lampSquareTable.glb`, category: 'lantern', scale: 2 },
  chest: { path: `${K}/furniture/cardboardBoxOpen.glb`, category: 'chest', scale: 1.2 },
  ladder: { path: `${K}/medieval/ladder.glb`, category: 'wood', scale: 1.5 },

  // Nature
  treeoak: { path: `${K}/nature/tree_oak.glb`, category: 'tree', scale: 2.8 },
  treepine: { path: `${K}/nature/tree_pineTallA.glb`, category: 'tree', scale: 2.8 },
  rocklarge: { path: `${K}/nature/rock_largeA.glb`, category: 'stone', scale: 1.8 },
  rockcluster: { path: `${K}/nature/stone_largeA.glb`, category: 'stone', scale: 1.5 },
  bush: { path: `${K}/nature/plant_bushLarge.glb`, category: 'bush', scale: 1.4 },
  grass: { path: `${K}/nature/grass_large.glb`, category: 'grass', scale: 1.3 },
  flower: { path: `${K}/nature/flower_yellowA.glb`, category: 'bush', scale: 1.5 },
  mushroom: { path: `${K}/nature/mushroom_red.glb`, category: 'bush', scale: 1.5 },
  log: { path: `${K}/nature/log_large.glb`, category: 'wood', scale: 1.3 },

  // Farm
  cropdirt: { path: `${K}/nature/crops_dirtRow.glb`, category: 'grass', scale: 1.6 },
  croprow: { path: `${K}/nature/crops_wheatStageB.glb`, category: 'grass', scale: 2 },
  cornrow: { path: `${K}/nature/crops_cornStageC.glb`, category: 'grass', scale: 2 },
  carrot: { path: `${K}/nature/crop_carrot.glb`, category: 'grass', scale: 1.8 },
  wheelbarrow: { path: `${K}/medieval/pulley-crate.glb`, category: 'wood', scale: 0.8 },
  scarecrow: { path: `${K}/nature/sign.glb`, category: 'wood', scale: 1.7 },
  fencegate: { path: `${K}/nature/fence_gate.glb`, category: 'wood', scale: 1.35 },

  // Interior / reusable furniture
  bench: { path: `${K}/furniture/bench.glb`, category: 'wood', scale: 1.5 },
  desk: { path: `${K}/furniture/desk.glb`, category: 'wood', scale: 1.8 },
  table: { path: `${K}/furniture/table.glb`, category: 'wood', scale: 1.5 },
  chair: { path: `${K}/furniture/chair.glb`, category: 'wood', scale: 1.4 },
  bookshelf: { path: `${K}/furniture/bookcaseOpen.glb`, category: 'wood', scale: 1.6 },
  cabinet: { path: `${K}/furniture/kitchenCabinet.glb`, category: 'wood', scale: 1.5 },
  rug: { path: `${K}/furniture/rugRectangle.glb`, category: 'default', scale: 1.5 },
  pottedplant: { path: `${K}/furniture/pottedPlant.glb`, category: 'bush', scale: 1.4 },
  sidetable: { path: `${K}/furniture/sideTable.glb`, category: 'wood', scale: 1.3 },
  stool: { path: `${K}/furniture/stoolBar.glb`, category: 'wood', scale: 1.2 },
};

const WORLD_MODEL_ALIASES: Record<string, string> = {
  toolRack: 'toolrack',
  draftingTable: 'workbench',
  alchemyTable: 'workbench',
  labBench: 'desk',
  marketStall: 'marketstall',
  market_stall: 'marketstall',
  market_stand: 'marketstall',
  marketStand: 'marketstall',
  marketstand: 'marketstall',
  stonePath: 'stonepath',
  tree: 'treeoak',
  treeOak: 'treeoak',
  treePine: 'treepine',
  rock: 'rocklarge',
  rockLarge: 'rocklarge',
  rockCluster: 'rockcluster',
  ruinedWall: 'rockcluster',
  brokenPillar: 'rocklarge',
  barn: 'barn',
  wellBucket: 'well',
  treasureChest: 'chest',
  cropRow: 'croprow',
  crop_field: 'croprow',
  cropField: 'croprow',
  crops: 'croprow',
  corn: 'cornrow',
  compost_station: 'barrel',
  compostStation: 'barrel',
  seed_vault: 'cabinet',
  seedVault: 'cabinet',
  animal_feeding_station: 'table',
  animalFeedingStation: 'table',
  seed_planting_box: 'cropdirt',
  seedPlantingBox: 'cropdirt',
  seed_box: 'cropdirt',
  seedBox: 'cropdirt',
  sign: 'signpost',
  fenceGate: 'fencegate',
  fence_gate: 'fencegate',
  wheelBarrow: 'wheelbarrow',
  tool_rack: 'toolrack',
  cropDirt: 'cropdirt',
  pottedPlant: 'pottedplant',
  sideTable: 'sidetable',
  scrollRack: 'bookshelf',
  readingDesk: 'desk',
  easel: 'signpost',
  paintingFrame: 'rug',
  statue: 'rocklarge',
  globe: 'pottedplant',
};

const STARTER_MODEL_IDS = [
  'forge',
  'workbench',
  'anvil',
  'toolrack',
  'crate',
  'barrel',
  'cottage',
  'marketstall',
  'fence',
  'well',
  'bridge',
  'waterchannel',
  'stonepath',
  'signpost',
  'lantern',
  'chest',
  'ladder',
  'treeoak',
  'treepine',
  'rocklarge',
  'rockcluster',
  'bush',
  'grass',
  'flower',
  'mushroom',
  'log',
  'croprow',
  'cornrow',
  'cropdirt',
  'wheelbarrow',
  'scarecrow',
  'fencegate',
  'bench',
  'desk',
  'table',
  'chair',
  'bookshelf',
  'cabinet',
  'rug',
  'pottedplant',
  'sidetable',
  'stool',
] as const;

function normalizeModelId(modelId: string): string {
  return WORLD_MODEL_ALIASES[modelId] ?? WORLD_MODEL_ALIASES[modelId.toLowerCase()] ?? modelId.toLowerCase();
}

export function getStarterWorldModelIds(): string[] {
  return [...STARTER_MODEL_IDS];
}

export function getWorldModelSpec(modelId: string): WorldModelSpec | undefined {
  return WORLD_MODEL_CATALOG[normalizeModelId(modelId)];
}

export function hasWorldModel(modelId: string): boolean {
  return getWorldModelSpec(modelId) !== undefined;
}

export async function preloadWorldModels(modelIds = getStarterWorldModelIds()): Promise<void> {
  const unique = new Map<string, WorldModelSpec>();
  for (const id of modelIds) {
    const spec = getWorldModelSpec(id);
    if (spec) unique.set(`${spec.path}:${spec.category ?? ''}:${spec.scale ?? 1}`, spec);
  }
  await Promise.all(Array.from(unique.values()).map(spec => loadGLB(spec.path, spec.category, spec.scale)));
}

export function loadCachedWorldModel(modelId: string): THREE.Group | null {
  const spec = getWorldModelSpec(modelId);
  if (!spec) return null;
  const group = loadGLBCached(spec.path, spec.category, spec.scale);
  return group ? prepareWorldModelInstance(group, modelId) : null;
}

function prepareWorldModelInstance(group: THREE.Group, modelId: string): THREE.Group {
  group.name = `world-model:${modelId}`;
  group.userData.authoredWorldModel = true;
  group.userData.baseScale = group.scale.clone();
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (Array.isArray(child.material)) {
      child.material = child.material.map(mat => mat.clone());
    } else {
      child.material = child.material.clone();
    }
  });
  return group;
}
