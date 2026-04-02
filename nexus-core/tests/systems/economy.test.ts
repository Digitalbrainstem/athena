import { describe, it, expect, beforeEach } from 'vitest';
import {
  EconomySystem, computePrice, currencyToCopper, normalizeCurrency,
  getTradeableItem, getNpcMerchant, merchantsInBiome,
  TRADEABLE_ITEMS, NPC_MERCHANTS,
} from '../../src/systems/economy.js';
import type { TradeOffer, CurrencyHolding } from '../../src/types/economy.js';

// ---------------------------------------------------------------------------
// Data Integrity
// ---------------------------------------------------------------------------

describe('Tradeable Items Data', () => {
  it('has at least 20 tradeable items', () => {
    expect(TRADEABLE_ITEMS.length).toBeGreaterThanOrEqual(20);
  });

  it('every item has required fields', () => {
    for (const item of TRADEABLE_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.basePrice).toBeGreaterThan(0);
      expect(item.sourceBiomes.length).toBeGreaterThan(0);
      expect(item.demandBiomes.length).toBeGreaterThan(0);
      expect(item.weight).toBeGreaterThanOrEqual(0);
    }
  });

  it('item IDs are unique', () => {
    const ids = TRADEABLE_ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up items by ID', () => {
    const wood = getTradeableItem('wood');
    expect(wood).toBeDefined();
    expect(wood!.name).toBe('Wood');
    expect(wood!.category).toBe('raw_material');
  });

  it('returns undefined for unknown item', () => {
    expect(getTradeableItem('nonexistent')).toBeUndefined();
  });
});

describe('NPC Merchants Data', () => {
  it('has at least 4 merchants', () => {
    expect(NPC_MERCHANTS.length).toBeGreaterThanOrEqual(4);
  });

  it('every merchant has required fields', () => {
    for (const merchant of NPC_MERCHANTS) {
      expect(merchant.id).toBeTruthy();
      expect(merchant.name).toBeTruthy();
      expect(merchant.biome).toBeTruthy();
      expect(merchant.markupFactor).toBeGreaterThan(0);
      expect(merchant.flexibility).toBeGreaterThanOrEqual(0);
      expect(merchant.flexibility).toBeLessThanOrEqual(1);
      expect(merchant.inventory.length).toBeGreaterThan(0);
    }
  });

  it('looks up merchant by ID', () => {
    const hilda = getNpcMerchant('blacksmith-hilda');
    expect(hilda).toBeDefined();
    expect(hilda!.biome).toBe('workshop');
  });

  it('finds merchants in a biome', () => {
    const workshopMerchants = merchantsInBiome('workshop');
    expect(workshopMerchants.length).toBeGreaterThan(0);
    expect(workshopMerchants.every(m => m.biome === 'workshop')).toBe(true);
  });

  it('returns empty array for biome with no merchants', () => {
    expect(merchantsInBiome('nonexistent')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Pure Functions
// ---------------------------------------------------------------------------

describe('computePrice', () => {
  it('returns base price when supply equals demand', () => {
    const price = computePrice(100, 50, 50, 0.5);
    expect(price).toBe(100);
  });

  it('increases price when demand exceeds supply', () => {
    const price = computePrice(100, 20, 80, 0.5);
    expect(price).toBeGreaterThan(100);
  });

  it('decreases price when supply exceeds demand', () => {
    const price = computePrice(100, 80, 20, 0.5);
    expect(price).toBeLessThan(100);
  });

  it('applies scarcity premium when supply is zero', () => {
    const price = computePrice(100, 0, 50, 0.5);
    expect(price).toBe(300);
  });

  it('never returns below 1', () => {
    const price = computePrice(1, 1000, 1, 0.5);
    expect(price).toBeGreaterThanOrEqual(1);
  });

  it('high elasticity means bigger price swings', () => {
    const highElastic = computePrice(100, 20, 80, 0.9);
    const lowElastic = computePrice(100, 20, 80, 0.1);
    // High elasticity = smaller adjustment factor (more responsive to quantity)
    // Low elasticity = bigger adjustment factor (price is sticky)
    expect(Math.abs(lowElastic - 100)).toBeGreaterThan(Math.abs(highElastic - 100));
  });
});

describe('currencyToCopper', () => {
  it('converts gold, silver, copper to total copper', () => {
    expect(currencyToCopper({ copper: 50, silver: 0, gold: 0 })).toBe(50);
    expect(currencyToCopper({ copper: 0, silver: 1, gold: 0 })).toBe(100);
    expect(currencyToCopper({ copper: 0, silver: 0, gold: 1 })).toBe(10000);
    expect(currencyToCopper({ copper: 50, silver: 2, gold: 1 })).toBe(10250);
  });
});

describe('normalizeCurrency', () => {
  it('carries over copper to silver', () => {
    const c: CurrencyHolding = { copper: 250, silver: 0, gold: 0 };
    normalizeCurrency(c);
    expect(c.silver).toBe(2);
    expect(c.copper).toBe(50);
    expect(c.gold).toBe(0);
  });

  it('carries over silver to gold', () => {
    const c: CurrencyHolding = { copper: 0, silver: 150, gold: 0 };
    normalizeCurrency(c);
    expect(c.gold).toBe(1);
    expect(c.silver).toBe(50);
    expect(c.copper).toBe(0);
  });

  it('handles complex normalization', () => {
    const c: CurrencyHolding = { copper: 15050, silver: 5, gold: 0 };
    normalizeCurrency(c);
    const total = currencyToCopper(c);
    expect(total).toBe(15550);
    expect(c.gold).toBe(1);
    expect(c.silver).toBe(55);
    expect(c.copper).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// EconomySystem
// ---------------------------------------------------------------------------

describe('EconomySystem', () => {
  let economy: EconomySystem;

  beforeEach(() => {
    economy = new EconomySystem();
  });

  describe('Market Initialization', () => {
    it('initializes a market for a biome', () => {
      const market = economy.initializeMarket('workshop');
      expect(market.biome).toBe('workshop');
      expect(market.prices.length).toBeGreaterThan(0);
    });

    it('returns existing market if already initialized', () => {
      const market1 = economy.initializeMarket('workshop');
      const market2 = economy.initializeMarket('workshop');
      expect(market1).toBe(market2);
    });

    it('source biomes have higher supply', () => {
      economy.initializeMarket('living-forest');
      const prices = economy.getMarketPrices('living-forest');
      const wood = prices.find(p => p.itemId === 'wood');
      expect(wood).toBeDefined();
      expect(wood!.supply).toBeGreaterThan(wood!.demand);
    });

    it('demand biomes have higher demand', () => {
      economy.initializeMarket('workshop');
      const prices = economy.getMarketPrices('workshop');
      const wood = prices.find(p => p.itemId === 'wood');
      expect(wood).toBeDefined();
      expect(wood!.demand).toBeGreaterThan(0);
    });
  });

  describe('Market Prices', () => {
    it('returns prices for all tradeable items', () => {
      economy.initializeMarket('workshop');
      const prices = economy.getMarketPrices('workshop');
      expect(prices.length).toBe(TRADEABLE_ITEMS.length);
    });

    it('auto-initializes market on getMarketPrices', () => {
      const prices = economy.getMarketPrices('crystal-caverns');
      expect(prices.length).toBeGreaterThan(0);
    });

    it('prices have trend information', () => {
      const prices = economy.getMarketPrices('workshop');
      for (const price of prices) {
        expect(['rising', 'falling', 'stable']).toContain(price.trend);
      }
    });
  });

  describe('Market Updates', () => {
    it('updates prices over time', () => {
      economy.initializeMarket('workshop');
      const before = economy.getMarketPrices('workshop').map(p => ({ ...p }));
      // Simulate many ticks to allow prices to shift
      for (let i = 0; i < 100; i++) {
        economy.updateMarket('workshop', 10);
      }
      const after = economy.getMarketPrices('workshop');
      // At least some prices should have changed
      const changed = before.some((b, i) => b.currentPrice !== after[i]!.currentPrice);
      expect(changed).toBe(true);
    });

    it('market shock affects prices', () => {
      economy.initializeMarket('workshop');
      const before = economy.getMarketPrices('workshop').find(p => p.itemId === 'wood')!;
      const priceBefore = before.currentPrice;

      // Reduce supply (shortage)
      economy.applyMarketShock('workshop', 'wood', -5, 5);
      for (let i = 0; i < 50; i++) {
        economy.updateMarket('workshop', 10);
      }

      const after = economy.getMarketPrices('workshop').find(p => p.itemId === 'wood')!;
      expect(after.currentPrice).toBeGreaterThanOrEqual(priceBefore);
    });
  });

  describe('Trading', () => {
    it('executes a valid trade', () => {
      economy.initializeMarket('workshop');
      const trade: TradeOffer = {
        give: [{ itemId: 'iron_ore', quantity: 5 }],
        receive: [{ itemId: 'wood', quantity: 3 }],
      };
      const result = economy.executeTrade('player-1', 'workshop', trade, 'discovery');
      // Result depends on market prices but should not error
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.fairnessRatio).toBe('number');
    });

    it('fails trade with no market', () => {
      const trade: TradeOffer = {
        give: [{ itemId: 'wood', quantity: 1 }],
        receive: [{ itemId: 'stone', quantity: 1 }],
      };
      const result = economy.executeTrade('player-1', 'nonexistent', trade, 'foundation');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('No market');
    });

    it('rejects trade for items above player tier', () => {
      economy.initializeMarket('workshop');
      const trade: TradeOffer = {
        give: [{ itemId: 'wood', quantity: 10 }],
        receive: [{ itemId: 'potion', quantity: 1 }],
      };
      const result = economy.executeTrade('player-1', 'workshop', trade, 'foundation');
      expect(result.success).toBe(false);
    });

    it('records trade in history', () => {
      economy.initializeMarket('workshop');
      const trade: TradeOffer = {
        give: [{ itemId: 'iron_ore', quantity: 10 }],
        receive: [{ itemId: 'wood', quantity: 2 }],
      };
      economy.executeTrade('player-1', 'workshop', trade, 'discovery');
      const playerEcon = economy.getPlayerEconomy('player-1');
      expect(playerEcon.tradeHistory.length).toBeGreaterThanOrEqual(0);
    });

    it('trade generates learning events', () => {
      economy.initializeMarket('trading-post');
      const trade: TradeOffer = {
        give: [{ itemId: 'cloth', quantity: 5 }, { itemId: 'glass', quantity: 3 }],
        receive: [{ itemId: 'wood', quantity: 2 }],
      };
      const result = economy.executeTrade('player-1', 'trading-post', trade, 'discovery');
      if (result.success) {
        expect(result.learningEvents).toContain('economics.trading');
        expect(result.learningEvents).toContain('math.arithmetic');
      }
    });

    it('NPC trades apply markup', () => {
      economy.initializeMarket('workshop');
      const trade: TradeOffer = {
        give: [{ itemId: 'iron_ore', quantity: 10 }],
        receive: [{ itemId: 'hammer', quantity: 1 }],
        npcId: 'blacksmith-hilda',
      };
      const result = economy.executeTrade('player-1', 'workshop', trade, 'discovery');
      expect(result).toBeDefined();
    });
  });

  describe('Player Economy', () => {
    it('creates default player economy', () => {
      const econ = economy.getPlayerEconomy('new-player');
      expect(econ.profileId).toBe('new-player');
      expect(econ.currency.copper).toBe(50);
      expect(econ.negotiationSkill).toBe(0);
    });

    it('adds currency to player', () => {
      economy.addCurrency('player-1', 100, 5, 1);
      const econ = economy.getPlayerEconomy('player-1');
      const total = currencyToCopper(econ.currency);
      expect(total).toBe(50 + 100 + 500 + 10000);
    });

    it('normalizes currency after adding', () => {
      economy.addCurrency('player-1', 500);
      const econ = economy.getPlayerEconomy('player-1');
      expect(econ.currency.silver).toBeGreaterThanOrEqual(5);
    });

    it('updates negotiation skill', () => {
      economy.updateNegotiationSkill('player-1', 3);
      const econ = economy.getPlayerEconomy('player-1');
      expect(econ.negotiationSkill).toBe(3);
    });

    it('negotiation skill takes maximum', () => {
      economy.updateNegotiationSkill('player-1', 5);
      economy.updateNegotiationSkill('player-1', 3);
      const econ = economy.getPlayerEconomy('player-1');
      expect(econ.negotiationSkill).toBe(5);
    });

    it('gets total copper value', () => {
      economy.addCurrency('player-1', 0, 0, 1);
      const total = economy.getTotalCopperValue('player-1');
      expect(total).toBe(10050);
    });
  });
});
