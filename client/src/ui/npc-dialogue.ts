// NPC Dialogue — interaction panel for NPC conversations.
// Renders NPC speech, personality-driven lines, and branching response options.
// All dialogue is gender-neutral, accessible (spoken + text + screen reader),
// and never uses quiz/test language.

import type {
  NpcMerchant,
  Quest,
  QuestStep,
} from '@nexus-academy/core';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// NPC type definitions
// ---------------------------------------------------------------------------

export type NpcType = 'merchant' | 'quest_giver' | 'sage' | 'villager';

export interface NpcEntity {
  id: string;
  name: string;
  type: NpcType;
  biome: string;
  /** Position in the biome (world-space) */
  position: { x: number; y: number; z: number };
  /** Personality tag driving dialogue tone */
  personality: NpcPersonality;
  /** Merchant data if type === 'merchant' */
  merchant?: NpcMerchant;
  /** Quest IDs this NPC can offer */
  questIds?: string[];
  /** Subject expertise for sages */
  expertise?: string[];
}

export interface NpcConversationContext {
  biomeId: string;
  activeQuest?: Quest | null;
  activeStep?: QuestStep | null;
  availableQuest?: Quest | null;
}

export interface NpcDialogueShowOptions {
  context?: NpcConversationContext;
  onLine?: (speaker: string, text: string) => void;
}

export type NpcPersonality =
  | 'gruff_kind'     // Workshop merchant: gruff but kind, talks about materials
  | 'wise_metaphor'  // Library sage: wise, speaks in metaphors
  | 'nature_loving'  // Forest villager: nature-loving, tells stories about animals
  | 'cheerful'       // General friendly NPC
  | 'scholarly'      // Academic, loves facts
  | 'mysterious';    // Enigmatic, hints at secrets

// ---------------------------------------------------------------------------
// Per-biome NPC definitions
// ---------------------------------------------------------------------------

export const BIOME_NPCS: readonly NpcEntity[] = [
  // Workshop
  {
    id: 'npc-hilda-blacksmith',
    name: 'Hilda',
    type: 'merchant',
    biome: 'workshop',
    position: { x: -3, y: 0, z: -4 },
    personality: 'gruff_kind',
    merchant: {
      id: 'blacksmith-hilda',
      name: 'Hilda the Blacksmith',
      biome: 'workshop',
      specialty: ['raw_material', 'tool'],
      markupFactor: 1.15,
      inventory: [
        { itemId: 'iron_ore', quantity: 20 },
        { itemId: 'hammer', quantity: 5 },
        { itemId: 'iron_ingot', quantity: 10 },
      ],
      flexibility: 0.3,
    },
  },
  {
    id: 'npc-workshop-sage',
    name: 'Tinker',
    type: 'sage',
    biome: 'workshop',
    position: { x: 5, y: 0, z: -6 },
    personality: 'scholarly',
    expertise: ['engineering.basics', 'math.geometry', 'science.physics'],
  },
  {
    id: 'npc-workshop-villager',
    name: 'Cog',
    type: 'villager',
    biome: 'workshop',
    position: { x: 2, y: 0, z: 3 },
    personality: 'cheerful',
  },

  // Living Forest
  {
    id: 'npc-sage-herbalist',
    name: 'Sage',
    type: 'merchant',
    biome: 'living-forest',
    position: { x: -4, y: 0, z: 2 },
    personality: 'nature_loving',
    merchant: {
      id: 'herbalist-sage',
      name: 'Sage the Herbalist',
      biome: 'living-forest',
      specialty: ['raw_material', 'food'],
      markupFactor: 1.10,
      inventory: [
        { itemId: 'herbs', quantity: 30 },
        { itemId: 'bread', quantity: 15 },
        { itemId: 'wood', quantity: 25 },
      ],
      flexibility: 0.5,
    },
  },
  {
    id: 'npc-forest-storyteller',
    name: 'Fern',
    type: 'villager',
    biome: 'living-forest',
    position: { x: 3, y: 0, z: -3 },
    personality: 'nature_loving',
  },
  {
    id: 'npc-forest-quest',
    name: 'Moss',
    type: 'quest_giver',
    biome: 'living-forest',
    position: { x: -2, y: 0, z: -5 },
    personality: 'mysterious',
    questIds: ['forest-gathering', 'forest-ecology'],
  },

  // Crystal Caverns
  {
    id: 'npc-flint-gemdealer',
    name: 'Flint',
    type: 'merchant',
    biome: 'crystal-caverns',
    position: { x: 2, y: 0, z: -4 },
    personality: 'gruff_kind',
    merchant: {
      id: 'gem-dealer-flint',
      name: 'Flint the Gem Dealer',
      biome: 'crystal-caverns',
      specialty: ['raw_material', 'luxury'],
      markupFactor: 1.25,
      inventory: [
        { itemId: 'crystal', quantity: 15 },
        { itemId: 'stone', quantity: 40 },
        { itemId: 'iron_ore', quantity: 15 },
        { itemId: 'coal', quantity: 20 },
      ],
      flexibility: 0.2,
    },
  },
  {
    id: 'npc-cavern-sage',
    name: 'Echo',
    type: 'sage',
    biome: 'crystal-caverns',
    position: { x: -4, y: 0, z: -2 },
    personality: 'wise_metaphor',
    expertise: ['science.chemistry', 'math.geometry'],
  },

  // Library of Echoes
  {
    id: 'npc-library-sage',
    name: 'Whisper',
    type: 'sage',
    biome: 'library-echoes',
    position: { x: 0, y: 0, z: -5 },
    personality: 'wise_metaphor',
    expertise: ['language-arts', 'history', 'reading'],
  },
  {
    id: 'npc-library-quest',
    name: 'Page',
    type: 'quest_giver',
    biome: 'library-echoes',
    position: { x: 4, y: 0, z: 0 },
    personality: 'scholarly',
    questIds: ['library-research', 'library-scroll'],
  },

  // Trading Post
  {
    id: 'npc-compass-trader',
    name: 'Compass',
    type: 'merchant',
    biome: 'trading-post',
    position: { x: 0, y: 0, z: -3 },
    personality: 'cheerful',
    merchant: {
      id: 'trader-compass',
      name: 'Compass the Trader',
      biome: 'trading-post',
      specialty: ['crafted_good', 'tool', 'knowledge_artifact'],
      markupFactor: 1.20,
      inventory: [
        { itemId: 'compass', quantity: 3 },
        { itemId: 'cloth', quantity: 30 },
        { itemId: 'glass', quantity: 10 },
        { itemId: 'ancient_scroll', quantity: 2 },
      ],
      flexibility: 0.4,
    },
  },
  {
    id: 'npc-trading-villager',
    name: 'Barter',
    type: 'villager',
    biome: 'trading-post',
    position: { x: -3, y: 0, z: 2 },
    personality: 'cheerful',
  },
];

// ---------------------------------------------------------------------------
// Personality-driven NPC dialogue lines
// ---------------------------------------------------------------------------

const NPC_GREETINGS: Record<NpcPersonality, readonly string[]> = {
  gruff_kind: [
    "Hmph. Welcome to my workshop supply shop! Need any materials?",
    "Ah, another visitor. Well, come in — don't just stand in the doorway.",
    "Back again? My tools don't forge themselves, you know... but I'm glad to see you.",
  ],
  wise_metaphor: [
    "Like a river finding its path, you've arrived right where you need to be.",
    "The crystals hum a different tune today... perhaps because of your presence.",
    "Knowledge is a lantern — the more you share, the brighter it glows. What brings you here?",
  ],
  nature_loving: [
    "Hello, friend! Did you hear the birds singing this morning? They always know when something good is coming.",
    "The forest welcomed you before I even saw you — the leaves rustled with excitement!",
    "Come sit by the mossy stone! I was just watching the fireflies dance.",
  ],
  cheerful: [
    "Hey there! Great to see you! What an amazing day to explore!",
    "Welcome, welcome! There's always something new happening around here!",
    "Oh, hi! I was just thinking someone interesting would come by!",
  ],
  scholarly: [
    "Fascinating! Another curious mind. What shall we investigate today?",
    "Ah, greetings! I was just reviewing some notes — your timing is impeccable.",
    "Every question leads to a discovery. What's on your mind?",
  ],
  mysterious: [
    "The wind told me you were coming... or maybe that was just the breeze. Who can say?",
    "Interesting. You found this place at exactly the right moment.",
    "Some paths lead to adventure, some to wisdom. Yours seems to lead... here.",
  ],
};

const NPC_MERCHANT_LINES: readonly string[] = [
  "Take a look at what I have — everything has a story behind it.",
  "My shelves are full today! See anything that catches your eye?",
  "I trade fair — what you give is what you get, plus a little wisdom.",
];

const NPC_SAGE_LINES: readonly string[] = [
  "I've been studying the patterns around here — would you like to hear what I've found?",
  "There's so much to understand about this world. Let me share something I've learned.",
  "Ask me anything — well, almost anything. Even I have mysteries left to solve!",
];

const NPC_QUEST_LINES: readonly string[] = [
  "I've been waiting for someone brave enough to help. Are you interested?",
  "There's something that needs doing, and I have a feeling you're the right person for it.",
  "I noticed something unusual recently. Want to help me figure it out?",
];

const NPC_VILLAGER_LINES: readonly string[] = [
  "It's a beautiful day in the Nexus, isn't it? I love watching the world go by.",
  "Did you know that the crystals here change color with the seasons? So cool!",
  "I've lived here for as long as I can remember. This place never stops surprising me.",
];

interface NpcGuidanceProfile {
  opening: string;
  chat: string;
  learn?: string;
  quest?: string;
  trade?: string;
}

const NPC_GUIDANCE: Record<string, NpcGuidanceProfile> = {
  'npc-hilda-blacksmith': {
    opening: 'The Workbench is the first useful stop: red plus blue makes purple, then the mural shows what changed. The Chest has extra wood and stone if you want to shape something at the Anvil.',
    chat: 'Tools belong where hands can reach them. Workbench for mixing, Anvil for shaping, Forge for heat once hotter recipes unlock.',
    trade: 'I can open the supply shelf, but your starter pack already has enough pigment for the first color challenge.',
  },
  'npc-workshop-sage': {
    opening: 'Every station teaches a rule. Pigments teach mixtures, the Anvil teaches stable shapes, and the Forge teaches how heat transforms matter.',
    chat: 'If a recipe works, the world should answer. Watch for murals, objects, and companion lines after you craft.',
    learn: 'A good experiment changes one thing at a time. Pick two pigments, combine them, then compare the new color to the ones you started with.',
  },
  'npc-workshop-villager': {
    opening: 'Cog here! If you are wondering what to do, start at the Workbench and make purple. The Workshop gets more interesting when the mural wakes up.',
    chat: 'I like watching the color jars. Red and blue feel like two ideas becoming one new idea.',
  },
  'npc-sage-herbalist': {
    opening: 'The forest is full of hungry helpers. Rabbit, bird, squirrel, and deer each ask for the food that fits their real diet.',
    chat: 'A forest is a web, not a pile of trees. Food, water, shelter, and sunlight all pull on each other.',
    trade: 'I can trade forest supplies, but the first lesson is right in the clearing: match each animal to what it naturally eats.',
  },
  'npc-forest-storyteller': {
    opening: 'Fern says: follow the sounds. Chirps point to birds, rustles point to small paws, and the quiet deer waits near the meadow edge.',
    chat: 'The animals are not decorations. They are clues about habitats, food, and how living things share a place.',
  },
  'npc-forest-quest': {
    opening: 'Moss watches the paths. If you want a forest challenge, help the animals first; the clearing is arranged like a living puzzle.',
    chat: 'The old trees remember every careful choice. Feed the right animal and the whole clearing feels calmer.',
    quest: 'I have a forest task ready. It starts with observation, not guessing.',
  },
  'npc-library-sage': {
    opening: 'Whisper says the Library is a room of clues. The rug marks the story space, the glowing book marks the next idea, and the catalog cards keep order.',
    chat: 'Stories are maps for memory. A good clue points you forward without feeling like a worksheet.',
    learn: 'Look for sequence: beginning, middle, end. The room is arranged to help you feel that order before anyone names it.',
  },
  'npc-library-quest': {
    opening: 'Page has a reading path ready. Start with the glowing book, then let the room tell you what belongs together.',
    chat: 'A library quest should feel like discovering a secret path between ideas.',
    quest: 'There is a story puzzle waiting in these shelves.',
  },
};

// ---------------------------------------------------------------------------
// Dialogue response options per NPC type
// ---------------------------------------------------------------------------

export interface NpcDialogueOption {
  id: string;
  text: string;
  /** Screen reader description */
  ariaLabel: string;
}

function getDialogueOptions(npc: NpcEntity): NpcDialogueOption[] {
  const options: NpcDialogueOption[] = [];

  if (npc.type === 'merchant') {
    options.push(
      { id: 'browse', text: 'Browse Items', ariaLabel: `Browse ${npc.name}'s items for sale` },
      { id: 'sell', text: 'Sell Items', ariaLabel: `Sell your items to ${npc.name}` },
    );
  }

  if (npc.type === 'quest_giver') {
    options.push(
      { id: 'quest', text: 'What needs doing?', ariaLabel: `Ask ${npc.name} about available quests` },
    );
  }

  if (npc.type === 'sage') {
    options.push(
      { id: 'learn', text: 'Tell me more!', ariaLabel: `Ask ${npc.name} to explain a concept` },
    );
  }

  options.push(
    { id: 'chat', text: 'Just Chatting', ariaLabel: `Have a casual conversation with ${npc.name}` },
  );

  options.push(
    { id: 'leave', text: 'Goodbye', ariaLabel: `End conversation with ${npc.name}` },
  );

  return options;
}

// ---------------------------------------------------------------------------
// NpcDialoguePanel — the DOM-based dialogue overlay
// ---------------------------------------------------------------------------

export type NpcDialogueCallback = (npc: NpcEntity, optionId: string) => void;

export class NpcDialoguePanel implements Disposable {
  private overlay: HTMLElement | null = null;
  private disposed = false;
  private activeNpc: NpcEntity | null = null;
  private onSelect: NpcDialogueCallback | null = null;
  private onLine: ((speaker: string, text: string) => void) | null = null;
  private dialogueSeed = 0;

  /** Show dialogue panel for an NPC */
  show(npc: NpcEntity, callback: NpcDialogueCallback, options: NpcDialogueShowOptions = {}): void {
    if (this.disposed) return;
    this.hide(); // close any existing panel

    this.activeNpc = npc;
    this.onSelect = callback;
    this.onLine = options.onLine ?? null;
    this.dialogueSeed++;

    const greeting = buildNpcOpeningLine(npc, options.context)
      ?? this.pickLine(NPC_GREETINGS[npc.personality]);
    let flavorLine = '';
    switch (npc.type) {
      case 'merchant': flavorLine = this.pickLine(NPC_MERCHANT_LINES); break;
      case 'sage': flavorLine = this.pickLine(NPC_SAGE_LINES); break;
      case 'quest_giver': flavorLine = this.pickLine(NPC_QUEST_LINES); break;
      case 'villager': flavorLine = this.pickLine(NPC_VILLAGER_LINES); break;
    }

    const dialogueOptions = getDialogueOptions(npc);

    // Build DOM
    const overlay = document.createElement('div');
    overlay.id = 'npc-dialogue-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', `Conversation with ${npc.name}`);
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: flex-end; justify-content: center;
      padding: 1rem; pointer-events: auto;
      background: rgba(0, 0, 0, 0.4);
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      max-width: 36rem; width: 100%;
      background: rgba(26, 27, 46, 0.92);
      border: 1px solid #a78bfa; border-radius: 0.75rem;
      padding: 1.25rem 1.5rem; margin-bottom: 2rem;
      color: #F5F0E8; font-family: 'Nunito', system-ui, sans-serif;
      box-shadow: 0 0 24px rgba(167, 139, 250, 0.2);
    `;

    // NPC name
    const nameEl = document.createElement('h3');
    nameEl.textContent = npc.name;
    nameEl.style.cssText = `
      font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;
      color: #a78bfa;
    `;
    panel.appendChild(nameEl);

    // Greeting text
    const greetEl = document.createElement('p');
    greetEl.textContent = greeting;
    greetEl.setAttribute('aria-live', 'polite');
    greetEl.style.cssText = `
      font-size: 1.0625rem; line-height: 1.5; margin-bottom: 0.375rem;
    `;
    panel.appendChild(greetEl);

    // Flavor text
    if (flavorLine) {
      const flavorEl = document.createElement('p');
      flavorEl.textContent = flavorLine;
      flavorEl.style.cssText = `
        font-size: 0.9375rem; line-height: 1.4; margin-bottom: 0.75rem;
        color: #94A3B8; font-style: italic;
      `;
      panel.appendChild(flavorEl);
    }

    this.onLine?.(npc.name, flavorLine ? `${greeting} ${flavorLine}` : greeting);

    // Response options
    const optionsContainer = document.createElement('div');
    optionsContainer.setAttribute('role', 'group');
    optionsContainer.setAttribute('aria-label', 'Response options');
    optionsContainer.style.cssText = `
      display: flex; flex-wrap: wrap; gap: 0.5rem;
    `;

    for (const opt of dialogueOptions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt.text;
      btn.setAttribute('aria-label', opt.ariaLabel);
      btn.style.cssText = `
        padding: 0.5rem 1rem;
        font-size: 0.9375rem; font-weight: 600;
        font-family: 'Nunito', system-ui, sans-serif;
        color: #22d3ee; background: rgba(34, 211, 238, 0.1);
        border: 1px solid rgba(34, 211, 238, 0.4); border-radius: 0.5rem;
        cursor: pointer; transition: background 0.15s, border-color 0.15s;
        min-height: 2.75rem;
      `;
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(34, 211, 238, 0.2)';
        btn.style.borderColor = '#22d3ee';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(34, 211, 238, 0.1)';
        btn.style.borderColor = 'rgba(34, 211, 238, 0.4)';
      });
      btn.addEventListener('click', () => {
        const selectedNpc = this.activeNpc;
        const cb = this.onSelect;
        if (opt.id === 'leave') {
          this.hide();
        } else if (selectedNpc && cb) {
          cb(selectedNpc, opt.id);
        }
      });
      optionsContainer.appendChild(btn);
    }

    panel.appendChild(optionsContainer);
    overlay.appendChild(panel);

    // Close on Escape
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        e.preventDefault();
      }
    };
    overlay.addEventListener('keydown', onKeydown);

    // Close on clicking backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Focus first option for keyboard access
    const firstBtn = optionsContainer.querySelector('button');
    firstBtn?.focus();
  }

  /** Whether the dialogue panel is currently open */
  get isOpen(): boolean {
    return this.overlay !== null;
  }

  /** Get the active NPC (if panel is open) */
  get currentNpc(): NpcEntity | null {
    return this.activeNpc;
  }

  /** Update dialogue text (for follow-up lines without closing the panel) */
  updateText(text: string): void {
    if (!this.overlay) return;
    const greetEl = this.overlay.querySelector('p[aria-live]');
    if (greetEl) greetEl.textContent = text;
    if (this.activeNpc) this.onLine?.(this.activeNpc.name, text);
  }

  /** Hide and clean up the dialogue panel */
  hide(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.activeNpc = null;
    this.onSelect = null;
    this.onLine = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.hide();
  }

  private pickLine(lines: readonly string[]): string {
    if (lines.length === 0) return '';
    return lines[this.dialogueSeed % lines.length]!;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all NPCs defined for a specific biome */
export function npcsInBiome(biomeId: string): NpcEntity[] {
  return BIOME_NPCS.filter(npc => npc.biome === biomeId);
}

/** Find an NPC by ID */
export function getNpc(id: string): NpcEntity | undefined {
  return BIOME_NPCS.find(npc => npc.id === id);
}

/** Find the nearest NPC within interaction range */
export function findNearestNpc(
  biomeId: string,
  playerX: number,
  playerZ: number,
  maxDistance = 4,
): NpcEntity | null {
  const npcs = npcsInBiome(biomeId);
  let nearest: NpcEntity | null = null;
  let nearestDist = maxDistance;

  for (const npc of npcs) {
    const dx = npc.position.x - playerX;
    const dz = npc.position.z - playerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < nearestDist) {
      nearest = npc;
      nearestDist = dist;
    }
  }

  return nearest;
}

export function buildNpcOpeningLine(
  npc: NpcEntity,
  context?: NpcConversationContext,
): string | null {
  if (context?.activeQuest?.biome === npc.biome && context.activeStep) {
    const stepLine = context.activeStep.companionRepeat
      ?? context.activeStep.spokenInstruction
      ?? context.activeStep.instruction;
    if (npc.type === 'sage') {
      return `You are working on "${context.activeQuest.title}." The useful clue is: ${stepLine}`;
    }
    if (npc.type === 'quest_giver') {
      return `That active path is "${context.activeQuest.title}." I would follow the next clue: ${stepLine}`;
    }
    return `I see your current challenge: ${stepLine}`;
  }

  if (npc.type === 'quest_giver' && context?.availableQuest) {
    const profile = NPC_GUIDANCE[npc.id];
    return `${profile?.quest ?? 'I have a challenge ready.'} It is called "${context.availableQuest.title}."`;
  }

  return NPC_GUIDANCE[npc.id]?.opening ?? null;
}

export function buildNpcOptionResponse(
  npc: NpcEntity,
  optionId: string,
  context?: NpcConversationContext,
): string {
  const profile = NPC_GUIDANCE[npc.id];

  if (optionId === 'chat') {
    return profile?.chat ?? NPC_VILLAGER_LINES[0]!;
  }

  if (optionId === 'learn') {
    if (context?.activeQuest?.biome === npc.biome && context.activeStep) {
      const stepLine = context.activeStep.companionRepeat
        ?? context.activeStep.spokenInstruction
        ?? context.activeStep.instruction;
      return `For "${context.activeQuest.title}", focus on this next: ${stepLine}`;
    }
    return profile?.learn
      ?? `Let me tell you what I know about ${npc.expertise?.[0] ?? 'this place'}: look for what changes when you interact with the world.`;
  }

  if (optionId === 'quest') {
    if (context?.availableQuest) {
      return profile?.quest
        ? `${profile.quest} "${context.availableQuest.title}" is ready.`
        : `"${context.availableQuest.title}" is ready.`;
    }
    return "I don't have a new task right now. Check the objects nearby; the world still has clues.";
  }

  if (optionId === 'browse' || optionId === 'sell') {
    return profile?.trade ?? 'Let me open my trade shelf. Take only what helps the world make sense.';
  }

  return profile?.opening ?? NPC_GREETINGS[npc.personality][0] ?? '';
}
