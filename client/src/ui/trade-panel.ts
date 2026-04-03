// Trade Panel — player ↔ NPC merchant trading interface.
// Prices driven by EconomySystem (real supply/demand curves).
// Knowledge-based discounts — understanding economics = better negotiation.
// No microtransactions. Knowledge IS currency.

import type {
  NpcMerchant,
  MarketPrice,
  TradeItem,
  TradeOffer,
  TradeResult,
  TradeableItem,
  PlayerEconomy,
  CurrencyHolding,
  MasteryTier,
} from '@nexus-academy/core';
import {
  getTradeableItem,
} from '@nexus-academy/core';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

export type TradeExecuteCallback = (offer: TradeOffer) => TradeResult;
export type TradePanelCloseCallback = () => void;

// ---------------------------------------------------------------------------
// Trade Panel
// ---------------------------------------------------------------------------

export class TradePanel implements Disposable {
  private overlay: HTMLElement | null = null;
  private disposed = false;
  private selectedBuyItems: Map<string, number> = new Map();
  private selectedSellItems: Map<string, number> = new Map();

  /**
   * Show the trading UI for a specific merchant.
   */
  show(
    merchant: NpcMerchant,
    marketPrices: MarketPrice[],
    playerEconomy: PlayerEconomy,
    playerInventory: TradeItem[],
    _playerTier: MasteryTier,
    onTrade: TradeExecuteCallback,
    onClose: TradePanelCloseCallback,
  ): void {
    if (this.disposed) return;
    this.hide();

    this.selectedBuyItems.clear();
    this.selectedSellItems.clear();

    const overlay = document.createElement('div');
    overlay.id = 'trade-panel-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 55;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem; pointer-events: auto;
      background: rgba(0, 0, 0, 0.5);
    `;

    const panel = document.createElement('div');
    panel.id = 'trade-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', `Trading with ${merchant.name}`);
    panel.setAttribute('aria-modal', 'true');
    panel.style.cssText = `
      max-width: 48rem; width: 100%; max-height: 85vh;
      background: rgba(26, 27, 46, 0.95);
      border: 1px solid #22d3ee; border-radius: 0.75rem;
      padding: 1.25rem 1.5rem; overflow-y: auto;
      color: #F5F0E8; font-family: 'Nunito', system-ui, sans-serif;
      box-shadow: 0 0 24px rgba(34, 211, 238, 0.15);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem; padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = merchant.name;
    title.style.cssText = `font-size: 1.25rem; font-weight: 700; color: #22d3ee; margin: 0;`;

    const currencyEl = document.createElement('span');
    currencyEl.style.cssText = `font-size: 0.875rem; color: #FBBF24;`;
    currencyEl.textContent = formatCurrency(playerEconomy.currency);
    currencyEl.setAttribute('aria-label', `Your funds: ${formatCurrency(playerEconomy.currency)}`);

    header.appendChild(title);
    header.appendChild(currencyEl);
    panel.appendChild(header);

    // Two-column layout: NPC inventory | Player inventory
    const columns = document.createElement('div');
    columns.style.cssText = `
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    `;

    // --- NPC's inventory (Buy section) ---
    const buyCol = document.createElement('div');
    buyCol.className = 'trade-items';

    const buyTitle = document.createElement('h4');
    buyTitle.textContent = 'Buy';
    buyTitle.style.cssText = `font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #a78bfa;`;
    buyCol.appendChild(buyTitle);

    for (const invItem of merchant.inventory) {
      const itemDef = getTradeableItem(invItem.itemId);
      if (!itemDef) continue;

      const price = marketPrices.find(p => p.itemId === invItem.itemId);
      const displayPrice = price
        ? Math.round(price.currentPrice * merchant.markupFactor)
        : itemDef.basePrice;

      const row = this.createItemRow(
        itemDef,
        invItem.quantity,
        displayPrice,
        'buy',
        price?.trend ?? 'stable',
      );
      buyCol.appendChild(row);
    }

    // --- Player's inventory (Sell section) ---
    const sellCol = document.createElement('div');
    sellCol.className = 'player-inventory';

    const sellTitle = document.createElement('h4');
    sellTitle.textContent = 'Sell';
    sellTitle.style.cssText = `font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #FBBF24;`;
    sellCol.appendChild(sellTitle);

    if (playerInventory.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'Your pack is empty.';
      emptyMsg.style.cssText = `font-size: 0.875rem; color: #94A3B8; font-style: italic;`;
      sellCol.appendChild(emptyMsg);
    } else {
      for (const invItem of playerInventory) {
        const itemDef = getTradeableItem(invItem.itemId);
        if (!itemDef) continue;

        const price = marketPrices.find(p => p.itemId === invItem.itemId);
        const sellPrice = price
          ? Math.round(price.currentPrice * 0.8) // Sell at 80% of market price
          : Math.round(itemDef.basePrice * 0.7);

        const row = this.createItemRow(
          itemDef,
          invItem.quantity,
          sellPrice,
          'sell',
          price?.trend ?? 'stable',
        );
        sellCol.appendChild(row);
      }
    }

    columns.appendChild(buyCol);
    columns.appendChild(sellCol);
    panel.appendChild(columns);

    // Status / Result area
    const statusEl = document.createElement('div');
    statusEl.id = 'trade-status';
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.style.cssText = `
      margin-top: 0.75rem; padding: 0.5rem 0.75rem;
      font-size: 0.875rem; color: #94A3B8;
      min-height: 1.5rem; text-align: center;
    `;
    panel.appendChild(statusEl);

    // Action buttons
    const actionBar = document.createElement('div');
    actionBar.style.cssText = `
      display: flex; justify-content: flex-end; gap: 0.5rem;
      margin-top: 0.75rem; padding-top: 0.75rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    `;

    const tradeBtn = document.createElement('button');
    tradeBtn.type = 'button';
    tradeBtn.textContent = 'Confirm Trade';
    tradeBtn.setAttribute('aria-label', 'Confirm the selected trade');
    tradeBtn.style.cssText = `
      padding: 0.5rem 1.25rem; font-size: 0.9375rem; font-weight: 600;
      font-family: 'Nunito', system-ui, sans-serif;
      color: #0f172a; background: linear-gradient(135deg, #22d3ee, #a78bfa);
      border: none; border-radius: 0.5rem; cursor: pointer;
      min-height: 2.75rem; transition: opacity 0.15s;
    `;
    tradeBtn.addEventListener('click', () => {
      const offer = this.buildTradeOffer(merchant.id);
      if (offer.give.length === 0 && offer.receive.length === 0) {
        statusEl.textContent = 'Select items to trade first.';
        statusEl.style.color = '#F97171';
        return;
      }
      const result = onTrade(offer);
      if (result.success) {
        statusEl.textContent = 'Trade complete!';
        statusEl.style.color = '#FBBF24';
        if (result.learningEvents.length > 0) {
          statusEl.textContent += ` You learned something about ${result.learningEvents[0]}.`;
        }
        // Auto-close after short delay
        setTimeout(() => { this.hide(); onClose(); }, 1200);
      } else {
        statusEl.textContent = result.reason ?? 'Trade failed.';
        statusEl.style.color = '#F97171';
      }
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.setAttribute('aria-label', 'Close the trading panel');
    closeBtn.style.cssText = `
      padding: 0.5rem 1.25rem; font-size: 0.9375rem; font-weight: 600;
      font-family: 'Nunito', system-ui, sans-serif;
      color: #94A3B8; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem;
      cursor: pointer; min-height: 2.75rem;
    `;
    closeBtn.addEventListener('click', () => { this.hide(); onClose(); });

    actionBar.appendChild(closeBtn);
    actionBar.appendChild(tradeBtn);
    panel.appendChild(actionBar);

    // Escape key
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this.hide(); onClose(); e.preventDefault(); }
    });

    // Click backdrop to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { this.hide(); onClose(); }
    });

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Focus the panel for screen reader
    panel.setAttribute('tabindex', '-1');
    panel.focus();
  }

  /** Whether the trade panel is visible */
  get isOpen(): boolean {
    return this.overlay !== null;
  }

  /** Hide and clean up */
  hide(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.selectedBuyItems.clear();
    this.selectedSellItems.clear();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.hide();
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private createItemRow(
    itemDef: TradeableItem,
    quantity: number,
    price: number,
    direction: 'buy' | 'sell',
    trend: 'rising' | 'falling' | 'stable',
  ): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.375rem 0.5rem; margin-bottom: 0.25rem;
      border-radius: 0.375rem; background: rgba(255, 255, 255, 0.03);
      transition: background 0.1s;
    `;
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(255, 255, 255, 0.08)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.background = 'rgba(255, 255, 255, 0.03)';
    });

    const info = document.createElement('div');
    info.style.cssText = `display: flex; flex-direction: column;`;

    const nameEl = document.createElement('span');
    nameEl.textContent = itemDef.name;
    nameEl.style.cssText = `font-size: 0.875rem; font-weight: 600;`;

    const detailEl = document.createElement('span');
    const trendIcon = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '—';
    const trendColor = trend === 'rising' ? '#F97171' : trend === 'falling' ? '#4ade80' : '#94A3B8';
    detailEl.innerHTML = `<span style="color: #FBBF24">${price}c</span> <span style="color: ${trendColor}; font-size: 0.75rem">${trendIcon}</span> <span style="color: #94A3B8; font-size: 0.75rem">×${quantity}</span>`;
    detailEl.style.cssText = `font-size: 0.8125rem;`;

    info.appendChild(nameEl);
    info.appendChild(detailEl);

    const controls = document.createElement('div');
    controls.style.cssText = `display: flex; align-items: center; gap: 0.375rem;`;

    const countEl = document.createElement('span');
    countEl.textContent = '0';
    countEl.style.cssText = `
      font-size: 0.875rem; font-weight: 600; min-width: 1.5rem; text-align: center;
    `;

    const minusBtn = this.createCountButton('−', () => {
      const map = direction === 'buy' ? this.selectedBuyItems : this.selectedSellItems;
      const current = map.get(itemDef.id) ?? 0;
      if (current > 0) {
        map.set(itemDef.id, current - 1);
        countEl.textContent = String(current - 1);
      }
    });

    const plusBtn = this.createCountButton('+', () => {
      const map = direction === 'buy' ? this.selectedBuyItems : this.selectedSellItems;
      const current = map.get(itemDef.id) ?? 0;
      if (current < quantity) {
        map.set(itemDef.id, current + 1);
        countEl.textContent = String(current + 1);
      }
    });

    controls.appendChild(minusBtn);
    controls.appendChild(countEl);
    controls.appendChild(plusBtn);

    row.appendChild(info);
    row.appendChild(controls);

    row.setAttribute('aria-label',
      `${itemDef.name}: ${price} copper each, ${quantity} available. ${direction === 'buy' ? 'Buy' : 'Sell'}.`,
    );

    return row;
  }

  private createCountButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-label', label === '+' ? 'Add one' : 'Remove one');
    btn.style.cssText = `
      width: 1.75rem; height: 1.75rem;
      font-size: 1rem; font-weight: 700;
      font-family: 'Nunito', system-ui, sans-serif;
      color: #22d3ee; background: rgba(34, 211, 238, 0.1);
      border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 0.25rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private buildTradeOffer(npcId: string): TradeOffer {
    const give: TradeItem[] = [];
    const receive: TradeItem[] = [];

    for (const [itemId, qty] of this.selectedSellItems) {
      if (qty > 0) give.push({ itemId, quantity: qty });
    }

    for (const [itemId, qty] of this.selectedBuyItems) {
      if (qty > 0) receive.push({ itemId, quantity: qty });
    }

    return { give, receive, npcId };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(c: CurrencyHolding): string {
  const parts: string[] = [];
  if (c.gold > 0) parts.push(`${c.gold}g`);
  if (c.silver > 0) parts.push(`${c.silver}s`);
  parts.push(`${c.copper}c`);
  return parts.join(' ');
}
