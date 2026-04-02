// Economy system types — real economics, not game-currency grinding
// Knowledge IS currency: understanding market dynamics = better prices

import type { MasteryTier } from './components.js';

// ---------------------------------------------------------------------------
// Market
// ---------------------------------------------------------------------------

export interface MarketPrice {
  itemId: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  trend: 'rising' | 'falling' | 'stable';
  elasticity: number;
}

export interface MarketState {
  biome: string;
  prices: MarketPrice[];
  lastUpdate: number;
  prosperityLevel: number;
  inflationRate: number;
}

// ---------------------------------------------------------------------------
// Trading
// ---------------------------------------------------------------------------

export interface TradeItem {
  itemId: string;
  quantity: number;
}

export interface TradeOffer {
  give: TradeItem[];
  receive: TradeItem[];
  npcId?: string;
}

export interface TradeResult {
  success: boolean;
  reason?: string;
  /** Actual items exchanged (may differ from offer due to negotiation) */
  finalGive: TradeItem[];
  finalReceive: TradeItem[];
  /** What the player learned from this trade */
  learningEvents: string[];
  /** How fair the trade was (1.0 = perfectly fair) */
  fairnessRatio: number;
}

// ---------------------------------------------------------------------------
// Player economy
// ---------------------------------------------------------------------------

export interface PlayerEconomy {
  profileId: string;
  currency: CurrencyHolding;
  tradeHistory: TradeRecord[];
  reputation: Record<string, number>;
  /** Higher negotiation skill = better prices (driven by knowledge) */
  negotiationSkill: number;
}

export interface CurrencyHolding {
  copper: number;
  silver: number;
  gold: number;
}

export interface TradeRecord {
  id: string;
  profileId: string;
  biome: string;
  gave: TradeItem[];
  received: TradeItem[];
  fairnessRatio: number;
  timestamp: string;
  npcId?: string;
}

// ---------------------------------------------------------------------------
// Supply/demand curve parameters
// ---------------------------------------------------------------------------

export interface SupplyDemandCurve {
  /** Base equilibrium quantity */
  equilibriumQuantity: number;
  /** Base equilibrium price */
  equilibriumPrice: number;
  /** How responsive supply is to price changes (0-1) */
  supplyElasticity: number;
  /** How responsive demand is to price changes (0-1) */
  demandElasticity: number;
  /** External shift factors (weather, events, player actions) */
  supplyShift: number;
  demandShift: number;
}

// ---------------------------------------------------------------------------
// Item definitions for tradeable goods
// ---------------------------------------------------------------------------

export interface TradeableItem {
  id: string;
  name: string;
  category: ItemCategory;
  basePrice: number;
  /** Which biomes naturally produce this item */
  sourceBiomes: string[];
  /** Which biomes have high demand */
  demandBiomes: string[];
  /** Minimum mastery tier to trade this item */
  minTier: MasteryTier;
  /** What understanding is needed to know its true value */
  valuationSkills: string[];
  /** Weight for transport calculations */
  weight: number;
  /** Does this item spoil over time? */
  perishable: boolean;
}

export type ItemCategory =
  | 'raw_material'
  | 'crafted_good'
  | 'food'
  | 'tool'
  | 'building_material'
  | 'chemical'
  | 'fuel'
  | 'luxury'
  | 'knowledge_artifact';

// ---------------------------------------------------------------------------
// NPC Merchant
// ---------------------------------------------------------------------------

export interface NpcMerchant {
  id: string;
  name: string;
  biome: string;
  specialty: ItemCategory[];
  /** How much they mark up prices (1.0 = no markup) */
  markupFactor: number;
  /** Inventory items and quantities */
  inventory: TradeItem[];
  /** How willing they are to negotiate (0-1) */
  flexibility: number;
}
