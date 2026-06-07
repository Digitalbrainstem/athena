/**
 * Game Registry — Single source of truth for ALL game data.
 *
 * EVERY file that needs companion info, audio paths, model paths,
 * colors, or theme data MUST import from here. No hardcoded paths
 * or data anywhere else in the codebase.
 *
 * This file is shared between the web client and Godot port.
 * The Godot version reads the same data from res://data/registry.json.
 */

// ── Companions ──────────────────────────────────────────────────────────────

export interface CompanionDef {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  personality: string;
  modelPath: string;
  voiceRef: string;
  introVoicePath: string;
  color: number;
  accentColor: number;
  voiceExaggeration: number;
}

export const COMPANIONS: Record<string, CompanionDef> = {
  fox: {
    id: 'fox', name: 'Scout', emoji: '🦊', title: 'The Explorer',
    description: 'Playful, adventurous, always first to leap into the unknown. Scout never met a mystery they didn\'t want to solve.',
    personality: 'eager, curious, encouraging, slightly impulsive',
    modelPath: '/content/models/companions_text3d/scout_fox.glb',
    voiceRef: 'philippa.wav',
    introVoicePath: '/content/audio/voice/companions/scout-intro.wav',
    color: 0xff6b2b, accentColor: 0xffa040, voiceExaggeration: 0.8,
  },
  owl: {
    id: 'owl', name: 'Merlin', emoji: '🦉', title: 'The Thinker',
    description: 'Wise, thoughtful, calm. Merlin considers every angle and loves sharing ancient knowledge. Named after the greatest wizard.',
    personality: 'patient, knowledgeable, gentle humor, never condescending',
    modelPath: '/content/models/companions_text3d/merlin_owl.glb',
    voiceRef: 'peter_yearsley.wav',
    introVoicePath: '/content/audio/voice/companions/merlin-intro.wav',
    color: 0x8b6914, accentColor: 0xd4a574, voiceExaggeration: 0.4,
  },
  rabbit: {
    id: 'rabbit', name: 'Clover', emoji: '🐰', title: 'The Cheerleader',
    description: 'Boundless energy, never gives up. Clover believes in you even when you don\'t believe in yourself.',
    personality: 'enthusiastic, supportive, fast-talking, optimistic',
    modelPath: '/content/models/companions_text3d/clover_rabbit.glb',
    voiceRef: 'julie_vw.wav',
    introVoicePath: '/content/audio/voice/companions/clover-intro.wav',
    color: 0xf5f0e8, accentColor: 0xffc0cb, voiceExaggeration: 1.0,
  },
  bear: {
    id: 'bear', name: 'Rosie', emoji: '🐻', title: 'Mama Bear',
    description: 'Protective, nurturing, warm. Rosie gives the best hugs and always makes sure everyone is safe and happy.',
    personality: 'motherly, warm, steady, comforting, firm when needed',
    modelPath: '/content/models/companions_text3d/rosie_bear.glb',
    voiceRef: 'jodi_krangle-expressive.wav',
    introVoicePath: '/content/audio/voice/companions/rosie-intro.wav',
    color: 0x8b4513, accentColor: 0xd2691e, voiceExaggeration: 0.35,
  },
  cat: {
    id: 'cat', name: 'Starla', emoji: '🐱', title: 'The Star',
    description: 'Mischievous, dramatic, born for the spotlight. Starla turns every challenge into a performance and every victory into a show.',
    personality: 'theatrical, clever, sassy, secretly caring, attention-loving',
    modelPath: '/content/models/companions_text3d/starla_cat.glb',
    voiceRef: 'lizzie_driver.wav',
    introVoicePath: '/content/audio/voice/companions/starla-intro.wav',
    color: 0x9370db, accentColor: 0x22d3ee, voiceExaggeration: 0.9,
  },
  dragon: {
    id: 'dragon', name: 'Rune', emoji: '🐉', title: 'The Ancient Soul',
    description: 'Brave, wise beyond years, surprisingly deep. Rune carries the wisdom of ages with an Irish charm that warms the heart.',
    personality: 'ancient wisdom, Irish accent, loyal, philosophical, fiercely protective',
    modelPath: '/content/models/companions_text3d/rune_dragon.glb',
    voiceRef: 'padraig_ohiceadha-lyrical.wav',
    introVoicePath: '/content/audio/voice/companions/rune-intro.wav',
    color: 0x228b22, accentColor: 0xffd700, voiceExaggeration: 0.8,
  },
};

export const COMPANION_IDS = Object.keys(COMPANIONS);
export const COMPANION_LIST = Object.values(COMPANIONS);
export function getCompanion(id: string): CompanionDef {
  const c = COMPANIONS[id];
  if (!c) throw new Error(`Unknown companion: ${id}`);
  return c;
}

// ── Nexus Voice (Emily) ─────────────────────────────────────────────────────

export const NEXUS_VOICE = {
  ref: 'emily_cripps.wav', exaggeration: 0.7, engine: 'chatterbox',
} as const;

export const NEXUS_VOICE_LINES = {
  welcome:         '/content/audio/voice/nexus/nv-welcome-01.wav',
  welcome_back:    '/content/audio/voice/nexus/nv-welcome-back-01.wav',
  long_absence:    '/content/audio/voice/nexus/nv-welcome-back-02.wav',
  tier_transition: '/content/audio/voice/nexus/nv-tier-up-discovery.wav',
  discovery:       '/content/audio/voice/nexus/nv-first-steps-01.wav',
  nexus_core:      '/content/audio/voice/nexus/nv-nexus-core-01.wav',
} as const;

export type NexusVoiceLine = keyof typeof NEXUS_VOICE_LINES;

export const CINEMATIC_LINES = [
  '/content/audio/voice/cinematic/intro-01.wav',
  '/content/audio/voice/cinematic/intro-02.wav',
  '/content/audio/voice/cinematic/intro-03.wav',
  '/content/audio/voice/cinematic/intro-04.wav',
  '/content/audio/voice/cinematic/intro-05.wav',
  '/content/audio/voice/cinematic/intro-06.wav',
] as const;

// ── Onboarding Voice Lines (Emily guides the player through setup) ──────────

export const ONBOARDING_VOICE = {
  name_ask:         '/content/audio/voice/onboarding/name-ask.wav',
  name_confirm:     '/content/audio/voice/onboarding/name-confirm.wav',
  age_intro:        '/content/audio/voice/onboarding/age-intro.wav',
  age_confirm:      '/content/audio/voice/onboarding/age-confirm.wav',
  companion_intro:  '/content/audio/voice/onboarding/companion-intro.wav',
  companion_choose: '/content/audio/voice/onboarding/companion-choose.wav',
  companion_chosen: '/content/audio/voice/onboarding/companion-chosen.wav',
  welcome_world:    '/content/audio/voice/onboarding/welcome-world.wav',
} as const;

// ── Age Tiers ───────────────────────────────────────────────────────────────

export interface AgeTier {
  id: string;
  label: string;
  ageRange: string;
  emoji: string;
  description: string;
}

export const AGE_TIERS: AgeTier[] = [
  { id: 'foundation', label: 'Little Explorer', ageRange: '2–5', emoji: '🌱', description: 'Just starting out. Everything is new and wonderful.' },
  { id: 'discovery', label: 'Curious Mind', ageRange: '6–8', emoji: '🔍', description: 'Asking why about everything. Ready for bigger adventures.' },
  { id: 'builder', label: 'Builder', ageRange: '9–11', emoji: '🔧', description: 'Making things work. Solving real problems.' },
  { id: 'creator', label: 'Creator', ageRange: '12–14', emoji: '✨', description: 'Inventing new things. Pushing boundaries.' },
  { id: 'innovator', label: 'Innovator', ageRange: '15+', emoji: '🚀', description: 'Changing the world. No limits.' },
];

// ── Audio ───────────────────────────────────────────────────────────────────

export const MUSIC = {
  portal_ambient: '/content/audio/music/priority1/music-portal-ambient.wav',
  workshop:       '/content/audio/music/priority1/music-workshop-ambient.wav',
  overworld:      '/content/audio/music/priority1/music-overworld-theme.wav',
  main_theme:     '/content/audio/music/priority1/music-main-theme.wav',
} as const;

export const SFX = {
  footstep_grass:  '/content/audio/sfx/footstep-grass.wav',
  footstep_stone:  '/content/audio/sfx/footstep-stone.wav',
  footstep_wood:   '/content/audio/sfx/footstep-wood.wav',
  door_open:       '/content/audio/sfx/door-open.wav',
  door_close:      '/content/audio/sfx/door-close.wav',
  pickup:          '/content/audio/sfx/pickup.wav',
  craft_success:   '/content/audio/sfx/craft-success.wav',
  ui_click:        '/content/audio/sfx/ui-click.wav',
  ui_hover:        '/content/audio/sfx/ui-hover.wav',
  achievement:     '/content/audio/sfx/achievement-chime.wav',
  companion_chirp: '/content/audio/sfx/companion-chirp.wav',
  portal_whoosh:   '/content/audio/sfx/portal-whoosh.wav',
  water_splash:    '/content/audio/sfx/water-splash.wav',
} as const;

// ── Theme ───────────────────────────────────────────────────────────────────

export const THEME = {
  frost: '#22d3ee', aurora: '#a78bfa', sunrise: '#FFDAB9',
  amber: '#D4A574', deepSpace: '#0f172a',
  textOnDark: '#F5F0E8', textMuted: '#94A3B8',
  error: '#F97171', success: '#FBBF24',
  frostHex: 0x22d3ee, auroraHex: 0xa78bfa, deepSpaceHex: 0x0f172a,
} as const;

// ── Models ──────────────────────────────────────────────────────────────────

const M = '/content/models';

export const MODELS = {
  forge: `${M}/workshop/workshop_forge.glb`,
  workbench: `${M}/workshop/workshop_workbench.glb`,
  anvil: `${M}/workshop/workshop_anvil.glb`,
  toolrack: `${M}/workshop/workshop_toolrack.glb`,
  crate: `${M}/workshop/workshop_crate.glb`,
  barrel: `${M}/workshop/workshop_barrel.glb`,
  cottage: `${M}/buildings/cottage_small.glb`,
  marketStall: `${M}/buildings/market_stall.glb`,
  fence: `${M}/structures/wooden_fence.glb`,
  well: `${M}/structures/well_stone.glb`,
  bridge: `${M}/structures/wooden_bridge.glb`,
  stonePath: `${M}/structures/stone_path.glb`,
  signpost: `${M}/structures/signpost_wooden.glb`,
  lantern: `${M}/structures/lantern_post.glb`,
  treeOak: `${M}/nature/tree_oak.glb`,
  treePine: `${M}/nature/tree_pine.glb`,
  rockLarge: `${M}/nature/rock_large.glb`,
  rockCluster: `${M}/nature/rock_cluster.glb`,
  bush: `${M}/nature/bush_flowering.glb`,
  grass: `${M}/nature/grass_patch.glb`,
  treasureChest: `${M}/items/treasure_chest.glb`,
  portalArch: `${M}/portal/nexus_gateway_arch.glb`,
  portalRing: `${M}/portal/nexus_portal.glb`,
  portalTitle: `${M}/portal/nexus_title_emblem.glb`,
} as const;
