// CraftPanel — Crafting interface for workbench, cauldron, forge interactions
// Select-then-place (no drag-and-drop) per accessibility rules

import { RECIPES, type NexusCore, type CraftRecipe, type RecipeInput, type CraftResult, type MasteryTier } from '@nexus-academy/core';
import type { Disposable } from '../types.js';

export interface CraftPanelOptions {
  core: NexusCore;
  profileId: string;
  onCompanionSpeak: (text: string) => void;
  onCraftComplete?: (recipe: CraftRecipe, result: CraftResult) => void;
}

interface InventorySlot {
  itemType: string;
  quantity: number;
}

interface CraftSlot {
  itemType: string;
  quantity: number;
}

interface StationProfile {
  label: string;
  actionLabel: string;
  purpose: string;
  slotHint: string;
  emptyRecipeText: string;
  unknownResult: string;
  matchesRecipe: (recipe: CraftRecipe) => boolean;
}

const STATION_PROFILES: Record<string, StationProfile> = {
  workbench: {
    label: 'Workbench',
    actionLabel: 'Combine',
    purpose: 'Mix pigments and assemble simple materials here. Start with Red Pigment + Blue Pigment to make Purple Pigment.',
    slotHint: 'Select materials from your pack. The recipe guide shows what this workbench can make.',
    emptyRecipeText: 'No workbench recipes are available here yet.',
    unknownResult: 'No known workbench result yet — try one of the guided combinations above.',
    matchesRecipe: recipe => textIncludesAny(recipeText(recipe), ['pigment', 'color', 'paint', 'wood', 'tower', 'brick', 'clay']),
  },
  forge: {
    label: 'Forge',
    actionLabel: 'Heat',
    purpose: 'Use heat to transform materials. Sand can become glass once you have enough of the right material.',
    slotHint: 'Add heat-ready materials such as sand, glass sand, or metal compounds.',
    emptyRecipeText: 'The forge has no heat recipe at this mastery tier yet. Look for sand or metal discoveries.',
    unknownResult: 'That does not react to heat at the forge yet.',
    matchesRecipe: recipe => textIncludesAny(recipeText(recipe), ['heat', 'heated', 'melting', 'glass', 'metal', 'forge', 'temperature', 'smelt', 'burn', 'ore']),
  },
  anvil: {
    label: 'Anvil',
    actionLabel: 'Shape',
    purpose: 'Shape strong materials and test structure ideas. Wide bases and stable stacks belong here.',
    slotHint: 'Add building materials such as pine wood, oak wood, or stone blocks.',
    emptyRecipeText: 'The anvil has no structure recipes available here yet.',
    unknownResult: 'That does not form a stable shape on the anvil yet.',
    matchesRecipe: recipe => recipe.output.type === 'structure'
      || textIncludesAny(recipeText(recipe), ['structure', 'stable', 'stability', 'tower', 'bridge', 'wall', 'load', 'building']),
  },
  cauldron: {
    label: 'Cauldron',
    actionLabel: 'Mix',
    purpose: 'Mix liquids and reactions. Count exact drops when a recipe asks for them.',
    slotHint: 'Add liquids, compounds, or pigments that belong in a mixture.',
    emptyRecipeText: 'No cauldron recipes are available in this biome yet.',
    unknownResult: 'That mixture does not react in the cauldron yet.',
    matchesRecipe: recipe => textIncludesAny(recipeText(recipe), ['potion', 'drop', 'liquid', 'water', 'compound', 'reaction', 'acid', 'base']),
  },
  'alchemist-table': {
    label: "Alchemist's Table",
    actionLabel: 'React',
    purpose: 'Run careful chemistry reactions with exact amounts.',
    slotHint: 'Add compounds in the amounts shown by the recipe guide.',
    emptyRecipeText: 'No alchemy recipes are available in this biome yet.',
    unknownResult: 'Those materials need a different reaction setup.',
    matchesRecipe: recipe => textIncludesAny(recipeText(recipe), ['compound', 'reaction', 'chemical', 'acid', 'base', 'stoichiometry', 'equation']),
  },
};

const DEFAULT_STATION_PROFILE = STATION_PROFILES.workbench!;

export class CraftPanel implements Disposable {
  private readonly core: NexusCore;
  private readonly onCompanionSpeak: (text: string) => void;
  private readonly onCraftComplete?: (recipe: CraftRecipe, result: CraftResult) => void;

  private root: HTMLElement | null = null;
  private disposed = false;
  private _open = false;

  // State
  private inventory: InventorySlot[] = [];
  private selectedSlots: CraftSlot[] = [];
  private matchedRecipe: CraftRecipe | null = null;
  private availableRecipes: CraftRecipe[] = [];
  private lockedPreviewRecipes: CraftRecipe[] = [];
  private currentStationType = 'workbench';
  private currentStationProfile: StationProfile = DEFAULT_STATION_PROFILE;

  // DOM refs (cached for perf)
  private titleEl: HTMLElement | null = null;
  private stationPurposeEl: HTMLElement | null = null;
  private recipeGuideEl: HTMLElement | null = null;
  private ingredientsEl: HTMLElement | null = null;
  private slotsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private combineBtn: HTMLButtonElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;
  private formulaEl: HTMLElement | null = null;

  private keyHandler = (e: KeyboardEvent) => this.handleKey(e);

  constructor(opts: CraftPanelOptions) {
    this.core = opts.core;
    this.onCompanionSpeak = opts.onCompanionSpeak;
    this.onCraftComplete = opts.onCraftComplete;
  }

  get isOpen(): boolean { return this._open; }

  /** Build the DOM (idempotent). */
  init(): void {
    if (this.root) return;

    this.root = document.createElement('div');
    this.root.id = 'craft-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'Crafting');
    this.root.setAttribute('aria-modal', 'true');
    this.root.classList.add('panel-hidden');

    this.root.innerHTML = `
      <div class="craft-header">
        <h3 class="craft-title">Workbench</h3>
        <button class="craft-close" aria-label="Close crafting panel">&times;</button>
      </div>
      <div class="craft-body">
        <p class="craft-station-purpose"></p>
        <div class="craft-recipe-guide" aria-label="Station recipe guide"></div>
        <h4 class="craft-section-title">Materials in your pack</h4>
        <div class="craft-ingredients" role="listbox" aria-label="Available ingredients">
        </div>
        <h4 class="craft-section-title">Selected materials</h4>
        <div class="craft-slots" role="list" aria-label="Selected ingredients">
          <p class="craft-slots-hint">Select ingredients to combine</p>
        </div>
        <div class="craft-formula" aria-live="polite"></div>
        <div class="craft-result" role="status" aria-live="polite">
          <span class="craft-result-text"></span>
        </div>
      </div>
      <div class="craft-actions">
        <button class="craft-btn" disabled aria-label="Combine ingredients">Combine</button>
      </div>
    `;

    this.titleEl = this.root.querySelector('.craft-title');
    this.stationPurposeEl = this.root.querySelector('.craft-station-purpose');
    this.recipeGuideEl = this.root.querySelector('.craft-recipe-guide');
    this.ingredientsEl = this.root.querySelector('.craft-ingredients');
    this.slotsEl = this.root.querySelector('.craft-slots');
    this.resultEl = this.root.querySelector('.craft-result-text');
    this.combineBtn = this.root.querySelector('.craft-btn');
    this.closeBtn = this.root.querySelector('.craft-close');
    this.formulaEl = this.root.querySelector('.craft-formula');

    this.closeBtn?.addEventListener('click', () => this.close());
    this.combineBtn?.addEventListener('click', () => void this.combine());

    const hud = document.getElementById('hud');
    if (hud) hud.appendChild(this.root);
  }

  /** Open the crafting panel for a specific station type. */
  open(stationType = 'workbench'): void {
    if (this.disposed || this._open) return;
    this.init();
    if (!this.root) return;

    this._open = true;
    this.currentStationType = normalizeStationType(stationType);
    this.currentStationProfile = getStationProfile(this.currentStationType);
    this.root.setAttribute('aria-label', `${this.currentStationProfile.label} crafting`);

    // Update title
    if (this.titleEl) {
      this.titleEl.textContent = this.currentStationProfile.label;
    }
    if (this.combineBtn) {
      this.combineBtn.textContent = this.currentStationProfile.actionLabel;
      this.combineBtn.setAttribute('aria-label', `${this.currentStationProfile.actionLabel} selected materials`);
    }

    // Refresh state from core
    this.refreshInventory();
    this.refreshRecipes();
    this.selectedSlots = [];
    this.matchedRecipe = null;

    this.renderStationGuide();
    this.renderIngredients();
    this.renderSlots();
    this.renderResult();

    this.root.classList.remove('panel-hidden');
    document.addEventListener('keydown', this.keyHandler);

    // Focus first ingredient or close button for keyboard navigation
    const firstFocusable = this.ingredientsEl?.querySelector<HTMLElement>('[tabindex]')
      ?? this.closeBtn;
    firstFocusable?.focus();
  }

  close(): void {
    if (!this._open || !this.root) return;
    this._open = false;
    this.root.classList.add('panel-hidden');
    document.removeEventListener('keydown', this.keyHandler);
    this.selectedSlots = [];
    this.matchedRecipe = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.close();
    this.root?.remove();
    this.root = null;
  }

  // ── Data helpers ─────────────────────────────────────────────────────────

  private refreshInventory(): void {
    const state = this.core.worldSystem.getWorldState();
    this.inventory = (state?.inventory ?? []).map(i => ({
      itemType: i.itemType,
      quantity: i.quantity,
    }));
  }

  private refreshRecipes(): void {
    const state = this.core.worldSystem.getWorldState();
    let masteryTier: MasteryTier = 'foundation';
    try {
      const world = this.core.getWorld();
      const playerEntities = world.query(['player']);
      if (playerEntities.length > 0) {
        const player = world.getComponent(playerEntities[0]!, 'player');
        if (player?.masteryTier) masteryTier = player.masteryTier;
      }
    } catch {
      // fallback to foundation
    }

    const activeBiome = state?.activeBiome ?? 'workshop';
    const recipes = this.core.craftSystem.getAvailableRecipes(
      masteryTier,
      activeBiome,
    );
    this.availableRecipes = recipes.filter(recipe => this.currentStationProfile.matchesRecipe(recipe));
    const unlockedIds = new Set(recipes.map(recipe => recipe.id));
    this.lockedPreviewRecipes = RECIPES
      .filter(recipe => (recipe.biome === activeBiome || recipe.biome === 'any') && !unlockedIds.has(recipe.id))
      .filter(recipe => this.currentStationProfile.matchesRecipe(recipe))
      .sort((a, b) => tierRank(a.tier) - tierRank(b.tier));
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  private renderStationGuide(): void {
    if (this.stationPurposeEl) {
      this.stationPurposeEl.textContent = this.currentStationProfile.purpose;
    }
    if (!this.recipeGuideEl) return;

    this.recipeGuideEl.innerHTML = '';

    const heading = document.createElement('h4');
    heading.className = 'craft-section-title';
    heading.textContent = `${this.currentStationProfile.label} recipes`;
    this.recipeGuideEl.appendChild(heading);

    const visibleUnlocked = this.availableRecipes.slice(0, 4);
    const visibleLocked = this.lockedPreviewRecipes.slice(0, Math.max(0, 4 - visibleUnlocked.length));
    const visibleRecipes = [
      ...visibleUnlocked.map(recipe => ({ recipe, locked: false })),
      ...visibleLocked.map(recipe => ({ recipe, locked: true })),
    ];

    if (visibleRecipes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'craft-empty';
      empty.textContent = this.currentStationProfile.emptyRecipeText;
      this.recipeGuideEl.appendChild(empty);
      return;
    }

    for (const { recipe, locked } of visibleRecipes) {
      const card = document.createElement('div');
      const isReady = this.canCraftRecipe(recipe);
      card.className = `craft-recipe-card ${locked ? 'craft-recipe-locked' : isReady ? 'craft-recipe-ready' : 'craft-recipe-missing'}`;

      const name = document.createElement('span');
      name.className = 'craft-recipe-name';
      name.textContent = recipe.name;
      card.appendChild(name);

      const formula = document.createElement('span');
      formula.className = 'craft-recipe-formula';
      formula.textContent = this.buildFormulaDisplay(recipe);
      card.appendChild(formula);

      const status = document.createElement('span');
      status.className = 'craft-recipe-status';
      status.textContent = locked ? `Unlocks in ${formatTierName(recipe.tier)}` : isReady ? 'Ready' : this.describeMissingInputs(recipe);
      card.appendChild(status);

      this.recipeGuideEl.appendChild(card);
    }
  }

  private renderIngredients(): void {
    if (!this.ingredientsEl) return;
    this.ingredientsEl.innerHTML = '';

    if (this.inventory.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'craft-empty';
      empty.textContent = 'Your inventory is empty. Explore the world to find ingredients!';
      this.ingredientsEl.appendChild(empty);
      return;
    }

    for (const item of this.inventory) {
      const btn = document.createElement('button');
      btn.className = 'craft-ingredient';
      btn.setAttribute('role', 'option');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('aria-label', `${formatItemName(item.itemType)}, quantity: ${item.quantity}`);
      btn.dataset.item = item.itemType;

      btn.innerHTML = `
        <span class="craft-ingredient-name">${formatItemName(item.itemType)}</span>
        <span class="craft-ingredient-qty">&times;${item.quantity}</span>
      `;

      btn.addEventListener('click', () => this.selectIngredient(item.itemType));
      this.ingredientsEl.appendChild(btn);
    }
  }

  private renderSlots(): void {
    if (!this.slotsEl) return;
    this.slotsEl.innerHTML = '';

    if (this.selectedSlots.length === 0) {
      const hint = document.createElement('p');
      hint.className = 'craft-slots-hint';
      hint.textContent = this.currentStationProfile.slotHint;
      this.slotsEl.appendChild(hint);
      return;
    }

    for (let i = 0; i < this.selectedSlots.length; i++) {
      const slot = this.selectedSlots[i]!;
      const el = document.createElement('div');
      el.className = 'craft-slot';
      el.setAttribute('role', 'listitem');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `Slot ${i + 1}: ${formatItemName(slot.itemType)} times ${slot.quantity}. Press Enter to remove.`);

      el.innerHTML = `
        <span class="craft-slot-name">${formatItemName(slot.itemType)}</span>
        <span class="craft-slot-qty">&times;${slot.quantity}</span>
        <button class="craft-slot-remove" aria-label="Remove ${formatItemName(slot.itemType)}" tabindex="0">&times;</button>
      `;

      const removeBtn = el.querySelector('.craft-slot-remove') as HTMLButtonElement;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSlot(i);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace') {
          this.removeSlot(i);
        }
      });

      this.slotsEl.appendChild(el);
    }
  }

  private renderResult(): void {
    if (!this.resultEl || !this.combineBtn || !this.formulaEl) return;

    this.matchedRecipe = this.findMatchingRecipe();

    if (this.selectedSlots.length === 0) {
      this.resultEl.textContent = '';
      this.formulaEl.textContent = '';
      this.combineBtn.disabled = true;
      return;
    }

    if (this.matchedRecipe) {
      this.resultEl.textContent = `→ ${formatItemName(this.matchedRecipe.output.id)}`;
      this.formulaEl.textContent = this.buildFormulaDisplay(this.matchedRecipe);
      this.combineBtn.disabled = false;
    } else {
      this.resultEl.textContent = this.currentStationProfile.unknownResult;
      this.formulaEl.textContent = '';
      // Allow experimental crafting even without a known recipe match
      this.combineBtn.disabled = false;
    }
  }

  private buildFormulaDisplay(recipe: CraftRecipe): string {
    // Build a readable formula: "2 H₂ + 1 O → H₂O"
    const inputParts = recipe.inputs.map(inp => {
      const name = inp.type === 'element' || inp.type === 'compound'
        ? subscriptFormula(inp.id)
        : formatItemName(inp.id);
      return inp.quantity > 1 ? `${inp.quantity} ${name}` : name;
    });

    const outputName = recipe.output.type === 'element' || recipe.output.type === 'compound'
      ? subscriptFormula(recipe.output.id)
      : formatItemName(recipe.output.id);
    const outputPart = recipe.output.quantity > 1
      ? `${recipe.output.quantity} ${outputName}`
      : outputName;

    return `${inputParts.join(' + ')} → ${outputPart}`;
  }

  private canCraftRecipe(recipe: CraftRecipe): boolean {
    return recipe.inputs.every(input => {
      const inventoryItem = this.inventory.find(item => item.itemType === input.id);
      return (inventoryItem?.quantity ?? 0) >= input.quantity;
    });
  }

  private describeMissingInputs(recipe: CraftRecipe): string {
    const missing = recipe.inputs.flatMap(input => {
      const inventoryItem = this.inventory.find(item => item.itemType === input.id);
      const needed = input.quantity - (inventoryItem?.quantity ?? 0);
      if (needed <= 0) return [];
      return formatRecipeInput({ ...input, quantity: needed });
    });
    return missing.length > 0 ? `Need ${missing.join(', ')}` : 'Ready';
  }

  // ── Interaction ──────────────────────────────────────────────────────────

  private selectIngredient(itemType: string): void {
    // Check available quantity in inventory minus already selected
    const invItem = this.inventory.find(i => i.itemType === itemType);
    if (!invItem) return;

    const alreadySelected = this.selectedSlots
      .filter(s => s.itemType === itemType)
      .reduce((sum, s) => sum + s.quantity, 0);

    if (alreadySelected >= invItem.quantity) {
      this.onCompanionSpeak("You don't have any more of those!");
      return;
    }

    // Add to existing slot or create new one
    const existing = this.selectedSlots.find(s => s.itemType === itemType);
    if (existing) {
      existing.quantity++;
    } else {
      this.selectedSlots.push({ itemType, quantity: 1 });
    }

    this.renderSlots();
    this.renderResult();
  }

  private removeSlot(index: number): void {
    this.selectedSlots.splice(index, 1);
    this.renderSlots();
    this.renderResult();
  }

  private findMatchingRecipe(): CraftRecipe | null {
    for (const recipe of this.availableRecipes) {
      const matches = recipe.inputs.every(required => {
        const selected = this.selectedSlots.find(s => s.itemType === required.id);
        return selected && selected.quantity >= required.quantity;
      });

      if (matches && recipe.inputs.length === this.selectedSlots.length) {
        // Also check all selected items are in the recipe
        const allAccountedFor = this.selectedSlots.every(s =>
          recipe.inputs.some(r => r.id === s.itemType && r.quantity <= s.quantity),
        );
        if (allAccountedFor) return recipe;
      }
    }
    return null;
  }

  private async combine(): Promise<void> {
    if (!this.combineBtn) return;
    this.combineBtn.disabled = true;

    if (this.matchedRecipe) {
      const recipe = this.matchedRecipe;
      // Build inputs from selected slots
      const inputs: RecipeInput[] = this.selectedSlots.map(s => ({
        type: this.getInputType(s.itemType),
        id: s.itemType,
        quantity: s.quantity,
      }));

      const result: CraftResult = this.core.craftSystem.attemptCraft(
        recipe,
        inputs,
      );

      if (result.success && result.output) {
        // Remove consumed ingredients from world state
        for (const inp of recipe.inputs) {
          this.core.worldSystem.removeInventoryItem(inp.id, inp.quantity);
        }
        // Add crafted item
        this.core.worldSystem.addInventoryItem(result.output.id, result.output.quantity);

        const learnedSkills = [...new Set(
          result.learningEvents.length > 0 ? result.learningEvents : recipe.skillsTaught,
        )];
        this.core.recordLearningEvents(learnedSkills.map(skillId => ({
          skillId,
          eventType: 'craft_success',
          quality: 4,
          context: `${this.currentStationType}:${recipe.id}`,
        })));
        this.onCraftComplete?.(recipe, result);

        // Companion speaks the science explanation
        const explanation = recipe.scienceExplanation;
        this.onCompanionSpeak(explanation || `Nice! You made ${formatItemName(result.output.id)}!`);

        // Show success
        if (this.resultEl) {
          this.resultEl.textContent = `✓ Created ${formatItemName(result.output.id)}!`;
          this.resultEl.classList.add('craft-success');
          setTimeout(() => this.resultEl?.classList.remove('craft-success'), 2000);
        }

        // Reset slots and refresh
        this.selectedSlots = [];
        this.refreshInventory();
        this.renderStationGuide();
        this.renderIngredients();
        this.renderSlots();
        setTimeout(() => this.renderResult(), 2000);
      } else {
        // Failure — gentle response
        this.onCompanionSpeak(
          result.failureReason ?? 'The mixture fizzled. Maybe different amounts?',
        );
        if (this.resultEl) {
          this.resultEl.textContent = 'The mixture fizzled. Maybe different amounts?';
          this.resultEl.classList.add('craft-failure');
          setTimeout(() => this.resultEl?.classList.remove('craft-failure'), 2000);
        }
        this.combineBtn.disabled = false;
      }
    } else {
      // No known recipe — gentle failure
      this.onCompanionSpeak("Hmm, that combination doesn't seem to work. Try something different!");
      if (this.resultEl) {
        this.resultEl.textContent = "That combination doesn't seem to work.";
        this.resultEl.classList.add('craft-failure');
        setTimeout(() => this.resultEl?.classList.remove('craft-failure'), 2000);
      }
      this.combineBtn.disabled = false;
    }
  }

  private getInputType(itemType: string): RecipeInput['type'] {
    // Check if this recipe uses a specific type for this item
    if (this.matchedRecipe) {
      const recipeInput = this.matchedRecipe.inputs.find(i => i.id === itemType);
      if (recipeInput) return recipeInput.type;
    }
    return 'item';
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────

/** Convert "red-pigment" → "Red Pigment" */
function formatItemName(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Convert formula strings like "H2O" → "H₂O" for display */
function subscriptFormula(formula: string): string {
  return formula.replace(/(\d+)/g, (_, d: string) => {
    const subscripts = '₀₁₂₃₄₅₆₇₈₉';
    return d.split('').map((ch: string) => subscripts[parseInt(ch, 10)] ?? ch).join('');
  });
}

function normalizeStationType(stationType: string): string {
  const normalized = stationType.toLowerCase();
  return Object.keys(STATION_PROFILES).find(key => normalized.includes(key)) ?? 'workbench';
}

function getStationProfile(stationType: string): StationProfile {
  return STATION_PROFILES[stationType] ?? DEFAULT_STATION_PROFILE;
}

function recipeText(recipe: CraftRecipe): string {
  return [
    recipe.id,
    recipe.name,
    recipe.description,
    recipe.output.id,
    recipe.output.type,
    ...recipe.skillsTaught,
  ].join(' ').toLowerCase();
}

function formatRecipeInput(input: RecipeInput): string {
  const name = input.type === 'element' || input.type === 'compound'
    ? subscriptFormula(input.id)
    : formatItemName(input.id);
  return input.quantity > 1 ? `${input.quantity} ${name}` : name;
}

function textIncludesAny(text: string, needles: readonly string[]): boolean {
  return needles.some(needle => text.includes(needle));
}

function tierRank(tier: MasteryTier): number {
  const order: Record<MasteryTier, number> = {
    foundation: 0,
    discovery: 1,
    builder: 2,
    innovator: 3,
    creator: 4,
  };
  return order[tier];
}

function formatTierName(tier: MasteryTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
