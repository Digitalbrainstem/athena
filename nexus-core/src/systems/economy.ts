// EconomySystem — Real economics: supply/demand curves, price elasticity, knowledge-based negotiation
// No microtransactions, no pay-to-win. Knowledge IS currency.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type {
  MarketPrice, MarketState, TradeOffer, TradeResult, TradeItem,
  PlayerEconomy, CurrencyHolding, TradeRecord, TradeableItem,
  NpcMerchant, SupplyDemandCurve,
} from '../types/economy.js';
import type { MasteryTier } from '../types/components.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIER_ORDER: Record<string, number> = {
  foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
};

const COPPER_PER_SILVER = 100;
const SILVER_PER_GOLD = 100;

/** Price stability factor — how quickly prices move toward equilibrium */
const PRICE_SMOOTHING = 0.05;

/** Base negotiation discount per skill level (5% per level) */
const NEGOTIATION_DISCOUNT_RATE = 0.05;

/** Maximum negotiation discount (30%) */
const MAX_NEGOTIATION_DISCOUNT = 0.30;

// ---------------------------------------------------------------------------
// Tradeable item catalog
// ---------------------------------------------------------------------------

export const TRADEABLE_ITEMS: readonly TradeableItem[] = [
  // Raw materials
  { id: 'wood', name: 'Wood', category: 'raw_material', basePrice: 5, sourceBiomes: ['living-forest'], demandBiomes: ['workshop', 'shipyard'], minTier: 'foundation', valuationSkills: [], weight: 2, perishable: false },
  { id: 'stone', name: 'Stone', category: 'raw_material', basePrice: 3, sourceBiomes: ['crystal-caverns'], demandBiomes: ['architects-domain', 'workshop'], minTier: 'foundation', valuationSkills: [], weight: 5, perishable: false },
  { id: 'iron_ore', name: 'Iron Ore', category: 'raw_material', basePrice: 12, sourceBiomes: ['crystal-caverns'], demandBiomes: ['workshop'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 4, perishable: false },
  { id: 'copper', name: 'Copper', category: 'raw_material', basePrice: 15, sourceBiomes: ['crystal-caverns'], demandBiomes: ['workshop', 'code-forge'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 3, perishable: false },
  { id: 'clay', name: 'Clay', category: 'raw_material', basePrice: 2, sourceBiomes: ['living-forest'], demandBiomes: ['workshop', 'architects-domain'], minTier: 'foundation', valuationSkills: [], weight: 3, perishable: false },
  { id: 'sand', name: 'Sand', category: 'raw_material', basePrice: 1, sourceBiomes: ['ancient-ruins'], demandBiomes: ['workshop', 'architects-domain'], minTier: 'foundation', valuationSkills: [], weight: 4, perishable: false },
  { id: 'coal', name: 'Coal', category: 'fuel', basePrice: 8, sourceBiomes: ['crystal-caverns'], demandBiomes: ['workshop', 'shipyard'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 2, perishable: false },
  { id: 'herbs', name: 'Herbs', category: 'raw_material', basePrice: 10, sourceBiomes: ['living-forest', 'healers-sanctuary'], demandBiomes: ['alchemist-lab', 'healers-sanctuary'], minTier: 'foundation', valuationSkills: ['science.biology.basics'], weight: 0.5, perishable: true },
  { id: 'crystal', name: 'Crystal', category: 'raw_material', basePrice: 25, sourceBiomes: ['crystal-caverns'], demandBiomes: ['observatory', 'code-forge'], minTier: 'discovery', valuationSkills: ['science.chemistry', 'math.geometry'], weight: 1, perishable: false },
  { id: 'cloth', name: 'Cloth', category: 'raw_material', basePrice: 8, sourceBiomes: ['trading-post'], demandBiomes: ['workshop', 'shipyard'], minTier: 'foundation', valuationSkills: [], weight: 1, perishable: false },

  // Crafted goods
  { id: 'iron_ingot', name: 'Iron Ingot', category: 'crafted_good', basePrice: 25, sourceBiomes: ['workshop'], demandBiomes: ['architects-domain', 'shipyard'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 3, perishable: false },
  { id: 'glass', name: 'Glass', category: 'crafted_good', basePrice: 20, sourceBiomes: ['workshop'], demandBiomes: ['architects-domain', 'observatory'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 2, perishable: false },
  { id: 'potion', name: 'Potion', category: 'crafted_good', basePrice: 30, sourceBiomes: ['alchemist-lab'], demandBiomes: ['healers-sanctuary', 'living-forest'], minTier: 'builder', valuationSkills: ['science.chemistry'], weight: 0.5, perishable: true },
  { id: 'bread', name: 'Bread', category: 'food', basePrice: 4, sourceBiomes: ['living-forest', 'trading-post'], demandBiomes: ['workshop', 'crystal-caverns'], minTier: 'foundation', valuationSkills: [], weight: 0.5, perishable: true },
  { id: 'steel', name: 'Steel', category: 'crafted_good', basePrice: 50, sourceBiomes: ['workshop'], demandBiomes: ['shipyard', 'architects-domain'], minTier: 'builder', valuationSkills: ['science.chemistry', 'engineering.basics'], weight: 4, perishable: false },
  { id: 'bronze', name: 'Bronze', category: 'crafted_good', basePrice: 35, sourceBiomes: ['workshop'], demandBiomes: ['architects-domain'], minTier: 'discovery', valuationSkills: ['science.chemistry'], weight: 3, perishable: false },

  // Tools
  { id: 'hammer', name: 'Hammer', category: 'tool', basePrice: 15, sourceBiomes: ['workshop'], demandBiomes: ['architects-domain', 'crystal-caverns'], minTier: 'foundation', valuationSkills: ['engineering.basics'], weight: 1.5, perishable: false },
  { id: 'compass', name: 'Compass', category: 'tool', basePrice: 40, sourceBiomes: ['workshop', 'observatory'], demandBiomes: ['explorers-map', 'shipyard'], minTier: 'discovery', valuationSkills: ['science.physics', 'geography.navigation'], weight: 0.3, perishable: false },
  { id: 'telescope', name: 'Telescope', category: 'tool', basePrice: 80, sourceBiomes: ['observatory'], demandBiomes: ['shipyard', 'explorers-map'], minTier: 'builder', valuationSkills: ['science.physics', 'math.geometry'], weight: 2, perishable: false },

  // Knowledge artifacts
  { id: 'ancient_scroll', name: 'Ancient Scroll', category: 'knowledge_artifact', basePrice: 100, sourceBiomes: ['ancient-ruins', 'library-echoes'], demandBiomes: ['library-echoes', 'observatory'], minTier: 'discovery', valuationSkills: ['language-arts', 'history'], weight: 0.2, perishable: false },
  { id: 'star_chart', name: 'Star Chart', category: 'knowledge_artifact', basePrice: 120, sourceBiomes: ['observatory'], demandBiomes: ['shipyard', 'explorers-map'], minTier: 'builder', valuationSkills: ['science.physics', 'math.calculus'], weight: 0.3, perishable: false },
] as const;

// ---------------------------------------------------------------------------
// NPC merchant definitions
// ---------------------------------------------------------------------------

export const NPC_MERCHANTS: readonly NpcMerchant[] = [
  {
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
  {
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
  {
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
  {
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
] as const;

// ---------------------------------------------------------------------------
// EconomySystem
// ---------------------------------------------------------------------------

export class EconomySystem implements System {
  readonly name = 'economy';
  readonly priority = 55;

  private markets: Map<string, MarketState> = new Map();
  private playerEconomies: Map<string, PlayerEconomy> = new Map();
  private supplyDemandCurves: Map<string, Map<string, SupplyDemandCurve>> = new Map();
  private _tradeIdCounter = 0;

  // ── ECS lifecycle ────────────────────────────────────────────────────────

  update(_world: World, dt: number): void {
    for (const [biome] of this.markets) {
      this.updateMarket(biome, dt);
    }
  }

  // ── Market Management ───────────────────────────────────────────────────

  /** Initialize a market for a biome if not already present */
  initializeMarket(biome: string): MarketState {
    const existing = this.markets.get(biome);
    if (existing) return existing;

    const prices: MarketPrice[] = TRADEABLE_ITEMS.map(item => {
      const isSource = item.sourceBiomes.includes(biome);
      const isDemand = item.demandBiomes.includes(biome);

      const supply = isSource ? 100 : isDemand ? 30 : 50;
      const demand = isDemand ? 80 : isSource ? 20 : 40;
      const supplyDemandRatio = supply / Math.max(demand, 1);
      const currentPrice = Math.max(1, Math.round(item.basePrice / supplyDemandRatio));

      return {
        itemId: item.id,
        basePrice: item.basePrice,
        currentPrice,
        supply,
        demand,
        trend: 'stable' as const,
        elasticity: this.calculateElasticity(item),
      };
    });

    // Initialize supply/demand curves
    const curves = new Map<string, SupplyDemandCurve>();
    for (const price of prices) {
      curves.set(price.itemId, {
        equilibriumQuantity: price.supply,
        equilibriumPrice: price.basePrice,
        supplyElasticity: price.elasticity,
        demandElasticity: price.elasticity * 0.8,
        supplyShift: 0,
        demandShift: 0,
      });
    }
    this.supplyDemandCurves.set(biome, curves);

    const market: MarketState = {
      biome,
      prices,
      lastUpdate: 0,
      prosperityLevel: 0.5,
      inflationRate: 0,
    };
    this.markets.set(biome, market);
    return market;
  }

  /** Get current market prices for a biome */
  getMarketPrices(biome: string): MarketPrice[] {
    const market = this.markets.get(biome);
    if (!market) {
      return this.initializeMarket(biome).prices;
    }
    return market.prices;
  }

  /** Get full market state */
  getMarketState(biome: string): MarketState | undefined {
    return this.markets.get(biome);
  }

  /** Update market based on supply/demand dynamics */
  updateMarket(biome: string, dt: number): void {
    const market = this.markets.get(biome);
    if (!market) return;

    const curves = this.supplyDemandCurves.get(biome);
    if (!curves) return;

    market.lastUpdate += dt;

    for (const price of market.prices) {
      const curve = curves.get(price.itemId);
      if (!curve) continue;

      // Natural supply regeneration (source biomes produce more)
      const itemDef = getTradeableItem(price.itemId);
      if (itemDef && itemDef.sourceBiomes.includes(biome)) {
        price.supply += dt * 0.01 * (curve.equilibriumQuantity - price.supply);
      }

      // Natural demand fluctuation
      price.demand += dt * 0.005 * (curve.equilibriumQuantity * 0.8 - price.demand);

      // Apply shifts from world events
      price.supply = Math.max(0, price.supply + curve.supplyShift * dt);
      price.demand = Math.max(0, price.demand + curve.demandShift * dt);

      // Price moves toward equilibrium based on supply/demand ratio
      const targetPrice = computePrice(
        price.basePrice,
        price.supply,
        price.demand,
        price.elasticity,
      );

      const oldPrice = price.currentPrice;
      price.currentPrice = Math.max(
        1,
        Math.round(price.currentPrice + (targetPrice - price.currentPrice) * PRICE_SMOOTHING * dt),
      );

      // Determine trend
      const delta = price.currentPrice - oldPrice;
      if (delta > 0) price.trend = 'rising';
      else if (delta < 0) price.trend = 'falling';
      else price.trend = 'stable';

      // Decay shifts back toward zero
      curve.supplyShift *= Math.max(0, 1 - 0.01 * dt);
      curve.demandShift *= Math.max(0, 1 - 0.01 * dt);
    }

    // Update prosperity and inflation
    const avgPriceRatio = market.prices.reduce(
      (sum, p) => sum + p.currentPrice / Math.max(p.basePrice, 1), 0,
    ) / Math.max(market.prices.length, 1);
    market.inflationRate = (avgPriceRatio - 1) * 100;
  }

  /** Apply an external shock to supply or demand */
  applyMarketShock(biome: string, itemId: string, supplyDelta: number, demandDelta: number): void {
    const curves = this.supplyDemandCurves.get(biome);
    if (!curves) return;

    const curve = curves.get(itemId);
    if (!curve) return;

    curve.supplyShift += supplyDelta;
    curve.demandShift += demandDelta;
  }

  // ── Trading ─────────────────────────────────────────────────────────────

  /** Execute a trade between the player and the market/NPC */
  executeTrade(
    profileId: string,
    biome: string,
    trade: TradeOffer,
    playerTier: MasteryTier,
  ): TradeResult {
    const economy = this.getOrCreatePlayerEconomy(profileId);
    const market = this.markets.get(biome);

    if (!market) {
      return {
        success: false,
        reason: 'No market exists in this biome',
        finalGive: [],
        finalReceive: [],
        learningEvents: [],
        fairnessRatio: 0,
      };
    }

    // Validate: player has items to give
    // (Inventory check would be done by the caller — we trust the system)

    // Calculate trade values
    const giveValue = this.calculateTradeValue(trade.give, market, 'sell');
    const receiveValue = this.calculateTradeValue(trade.receive, market, 'buy');

    if (receiveValue === 0) {
      return {
        success: false,
        reason: 'Cannot determine value of requested items',
        finalGive: [],
        finalReceive: [],
        learningEvents: [],
        fairnessRatio: 0,
      };
    }

    // Apply negotiation skill (knowledge-based discount)
    const negotiationBonus = Math.min(
      economy.negotiationSkill * NEGOTIATION_DISCOUNT_RATE,
      MAX_NEGOTIATION_DISCOUNT,
    );

    // Apply NPC markup if trading with an NPC
    let npcMarkup = 1.0;
    let npcFlexibility = 0;
    if (trade.npcId) {
      const npc = NPC_MERCHANTS.find(m => m.id === trade.npcId);
      if (npc) {
        npcMarkup = npc.markupFactor;
        npcFlexibility = npc.flexibility;
      }
    }

    // Final price adjustment: NPC markup minus negotiation discount
    const adjustedReceiveValue = receiveValue * npcMarkup * (1 - negotiationBonus * npcFlexibility);
    const fairnessRatio = giveValue / Math.max(adjustedReceiveValue, 1);

    // Check if trade is possible
    const tierLevel = TIER_ORDER[playerTier] ?? 0;
    for (const item of [...trade.give, ...trade.receive]) {
      const def = getTradeableItem(item.itemId);
      if (def && (TIER_ORDER[def.minTier] ?? 0) > tierLevel) {
        return {
          success: false,
          reason: `You haven't learned enough yet to trade ${def.name}`,
          finalGive: [],
          finalReceive: [],
          learningEvents: [],
          fairnessRatio,
        };
      }
    }

    // Trade succeeds if giving enough value (fairness ≥ 0.8)
    if (fairnessRatio < 0.8) {
      return {
        success: false,
        reason: 'The offer is not enough for what you want',
        finalGive: [],
        finalReceive: [],
        learningEvents: [],
        fairnessRatio,
      };
    }

    // Update market supply/demand
    for (const item of trade.give) {
      const price = market.prices.find(p => p.itemId === item.itemId);
      if (price) {
        price.supply += item.quantity;
        price.demand = Math.max(0, price.demand - item.quantity * 0.5);
      }
    }

    for (const item of trade.receive) {
      const price = market.prices.find(p => p.itemId === item.itemId);
      if (price) {
        price.supply = Math.max(0, price.supply - item.quantity);
        price.demand += item.quantity * 0.5;
      }
    }

    // Record trade
    const record: TradeRecord = {
      id: `trade-${++this._tradeIdCounter}`,
      profileId,
      biome,
      gave: trade.give,
      received: trade.receive,
      fairnessRatio,
      timestamp: new Date().toISOString(),
      npcId: trade.npcId,
    };
    economy.tradeHistory.push(record);

    // Determine learning events
    const learningEvents = this.determineLearningEvents(trade, fairnessRatio, playerTier);

    return {
      success: true,
      finalGive: trade.give,
      finalReceive: trade.receive,
      learningEvents,
      fairnessRatio,
    };
  }

  // ── Player Economy ──────────────────────────────────────────────────────

  /** Get player's economic state */
  getPlayerEconomy(profileId: string): PlayerEconomy {
    return this.getOrCreatePlayerEconomy(profileId);
  }

  /** Add currency to player */
  addCurrency(profileId: string, copper: number, silver: number = 0, gold: number = 0): void {
    const economy = this.getOrCreatePlayerEconomy(profileId);
    economy.currency.copper += copper;
    economy.currency.silver += silver;
    economy.currency.gold += gold;
    normalizeCurrency(economy.currency);
  }

  /** Convert all currency to copper for comparison */
  getTotalCopperValue(profileId: string): number {
    const economy = this.getOrCreatePlayerEconomy(profileId);
    return currencyToCopper(economy.currency);
  }

  /** Update negotiation skill based on demonstrated knowledge */
  updateNegotiationSkill(profileId: string, skillLevel: number): void {
    const economy = this.getOrCreatePlayerEconomy(profileId);
    economy.negotiationSkill = Math.max(economy.negotiationSkill, skillLevel);
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private getOrCreatePlayerEconomy(profileId: string): PlayerEconomy {
    const existing = this.playerEconomies.get(profileId);
    if (existing) return existing;

    const economy: PlayerEconomy = {
      profileId,
      currency: { copper: 50, silver: 0, gold: 0 },
      tradeHistory: [],
      reputation: {},
      negotiationSkill: 0,
    };
    this.playerEconomies.set(profileId, economy);
    return economy;
  }

  private calculateTradeValue(
    items: TradeItem[],
    market: MarketState,
    _direction: 'buy' | 'sell',
  ): number {
    let total = 0;
    for (const item of items) {
      const price = market.prices.find(p => p.itemId === item.itemId);
      if (price) {
        total += price.currentPrice * item.quantity;
      }
    }
    return total;
  }

  private calculateElasticity(item: TradeableItem): number {
    // Perishable goods are more elastic (price-sensitive)
    // Luxury goods are less elastic
    // Knowledge artifacts are very inelastic (unique value)
    switch (item.category) {
      case 'food': return 0.8;
      case 'raw_material': return 0.6;
      case 'fuel': return 0.5;
      case 'crafted_good': return 0.4;
      case 'tool': return 0.3;
      case 'building_material': return 0.5;
      case 'chemical': return 0.4;
      case 'luxury': return 0.2;
      case 'knowledge_artifact': return 0.1;
    }
  }

  private determineLearningEvents(
    trade: TradeOffer,
    fairnessRatio: number,
    _playerTier: MasteryTier,
  ): string[] {
    const events: string[] = [];

    // Trading itself teaches economics
    events.push('economics.trading');

    // Multi-item trades teach arithmetic
    if (trade.give.length > 1 || trade.receive.length > 1) {
      events.push('math.arithmetic');
    }

    // Good deals teach negotiation
    if (fairnessRatio >= 0.95 && fairnessRatio <= 1.05) {
      events.push('economics.fair-trade');
    }

    // Understanding item value requires domain knowledge
    for (const item of [...trade.give, ...trade.receive]) {
      const def = getTradeableItem(item.itemId);
      if (def) {
        for (const skill of def.valuationSkills) {
          if (!events.includes(skill)) {
            events.push(skill);
          }
        }
      }
    }

    return events;
  }
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/** Compute price from supply/demand using elasticity */
export function computePrice(
  basePrice: number,
  supply: number,
  demand: number,
  elasticity: number,
): number {
  if (supply <= 0) return basePrice * 3; // Scarcity premium
  const ratio = demand / supply;
  // Price adjusts by (ratio - 1) scaled by inverse elasticity
  // High elasticity = price moves a lot; low elasticity = price is sticky
  const adjustment = 1 + (ratio - 1) * (1 / Math.max(elasticity, 0.01));
  return Math.max(1, Math.round(basePrice * adjustment));
}

/** Convert currency holding to total copper */
export function currencyToCopper(c: CurrencyHolding): number {
  return c.copper + c.silver * COPPER_PER_SILVER + c.gold * SILVER_PER_GOLD * COPPER_PER_SILVER;
}

/** Normalize currency (carry over copper→silver→gold) */
export function normalizeCurrency(c: CurrencyHolding): void {
  const total = currencyToCopper(c);
  c.gold = Math.floor(total / (SILVER_PER_GOLD * COPPER_PER_SILVER));
  const remainder = total - c.gold * SILVER_PER_GOLD * COPPER_PER_SILVER;
  c.silver = Math.floor(remainder / COPPER_PER_SILVER);
  c.copper = remainder - c.silver * COPPER_PER_SILVER;
}

/** Look up a tradeable item definition */
export function getTradeableItem(id: string): TradeableItem | undefined {
  return TRADEABLE_ITEMS.find(i => i.id === id);
}

/** Get NPC merchant by ID */
export function getNpcMerchant(id: string): NpcMerchant | undefined {
  return NPC_MERCHANTS.find(m => m.id === id);
}

/** Get merchants in a specific biome */
export function merchantsInBiome(biome: string): NpcMerchant[] {
  return NPC_MERCHANTS.filter(m => m.biome === biome);
}
