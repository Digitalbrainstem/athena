// MapPanel — World map showing discovered biomes as connected nodes
// M key opens/closes. Click biome → fast travel (if discovered).

import type { BiomeRoute, NexusCore } from '@nexus-academy/core';
import { BIOME_ROUTES } from '@nexus-academy/core';
import { BIOME_LOCATIONS } from '../world/overworld.js';
import type { BiomeLocation } from '../world/overworld.js';
import type { WorldManager } from '../world/world-manager.js';
import type { Disposable } from '../types.js';

export interface MapPanelOptions {
  core: NexusCore;
  profileId: string;
  worldManager: WorldManager;
  onCompanionSpeak: (text: string) => void;
  onTravelTo: (biomeId: string) => void;
}

// Biome node display colors matching the Style Guide palette
const BIOME_COLORS: Record<string, string> = {
  workshop: '#D4A574',       // Amber
  'living-forest': '#228B22', // Verdant
  'library-echoes': '#a78bfa', // Aurora
  observatory: '#0f172a',     // Deep Space
  'crystal-caverns': '#7B68EE',
  'trading-post': '#DAA520',
  gallery: '#DB7093',
  'ancient-ruins': '#8B7355',
  'storm-tower': '#4682B4',
  'healers-sanctuary': '#66CDAA',
  'music-hall': '#FF8C00',
  farm: '#8FBC8F',
  'code-forge': '#20B2AA',
  arena: '#CD5C5C',
  hospital: '#87CEEB',
  laboratory: '#9370DB',
  'alchemist-lab': '#B8860B',
  shipyard: '#1E90FF',
  'architects-domain': '#BC8F8F',
  'explorers-map': '#2E8B57',
  'dream-garden': '#DDA0DD',
  'lunar-base': '#C0C0C0',
  'nexus-core': '#22d3ee',
  'time-rift': '#8A2BE2',
};

const DEFAULT_BIOME_COLOR = '#94A3B8';

const FOUNDATION_TIER = 'foundation';

function routeIncludes(route: BiomeRoute, biomeId: string): boolean {
  return route.from === biomeId || route.to === biomeId;
}

function otherRouteEnd(route: BiomeRoute, biomeId: string): string {
  return route.from === biomeId ? route.to : route.from;
}

function humanizeRoutePart(value: string): string {
  return value.replace(/[-_]+/g, ' ');
}

export class MapPanel implements Disposable {
  private readonly core: NexusCore;
  private readonly onCompanionSpeak: (text: string) => void;
  private readonly onTravelTo: (biomeId: string) => void;

  private root: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private listEl: HTMLElement | null = null;
  private disposed = false;
  private _open = false;

  private discoveredBiomes: Set<string> = new Set();
  private currentBiome = 'workshop';

  private keyHandler = (e: KeyboardEvent) => this.handleKey(e);

  constructor(opts: MapPanelOptions) {
    this.core = opts.core;
    this.onCompanionSpeak = opts.onCompanionSpeak;
    this.onTravelTo = opts.onTravelTo;
  }

  get isOpen(): boolean { return this._open; }

  /** Build the DOM (idempotent). */
  init(): void {
    if (this.root) return;

    this.root = document.createElement('div');
    this.root.id = 'map-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'World map');
    this.root.setAttribute('aria-modal', 'true');
    this.root.classList.add('panel-hidden');

    this.root.innerHTML = `
      <div class="map-header">
        <h3 class="map-title">The Nexus</h3>
        <button class="map-close" aria-label="Close map">&times;</button>
      </div>
      <div class="map-body">
        <canvas class="map-canvas" aria-hidden="true" width="500" height="400"></canvas>
        <div class="map-biomes" role="list" aria-label="Discovered biomes">
        </div>
      </div>
      <p class="map-hint">Discovered places allow fast travel. Named paths are walk-to-discover routes.</p>
    `;

    this.canvas = this.root.querySelector('.map-canvas');
    this.listEl = this.root.querySelector('.map-biomes');

    const closeBtn = this.root.querySelector('.map-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.close());

    const hud = document.getElementById('hud');
    if (hud) hud.appendChild(this.root);
  }

  /** Open the world map. */
  open(): void {
    if (this.disposed || this._open) return;
    this.init();
    if (!this.root) return;

    this._open = true;
    this.refreshState();
    this.renderBiomeList();
    this.drawMap();

    this.root.classList.remove('panel-hidden');
    document.addEventListener('keydown', this.keyHandler);

    // Focus first biome button for keyboard navigation
    const firstBiome = this.listEl?.querySelector<HTMLElement>('[tabindex]');
    firstBiome?.focus();
  }

  close(): void {
    if (!this._open || !this.root) return;
    this._open = false;
    this.root.classList.add('panel-hidden');
    document.removeEventListener('keydown', this.keyHandler);
  }

  toggle(): void {
    if (this._open) this.close();
    else this.open();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.close();
    this.root?.remove();
    this.root = null;
  }

  // ── State ────────────────────────────────────────────────────────────────

  private refreshState(): void {
    const state = this.core.worldSystem.getWorldState();
    this.discoveredBiomes = new Set(state?.discoveredBiomes ?? ['workshop']);
    this.currentBiome = state?.activeBiome ?? 'workshop';
  }

  // ── Render biome list (accessible) ───────────────────────────────────────

  private renderBiomeList(): void {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    // Show all known biome locations, mark discovered vs undiscovered
    for (const biome of BIOME_LOCATIONS) {
      const discovered = this.discoveredBiomes.has(biome.id);
      const isCurrent = biome.id === this.currentBiome;

      const btn = document.createElement('button');
      btn.className = 'map-biome-node';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('tabindex', '0');

      if (discovered) {
        btn.classList.add('map-discovered');
        if (isCurrent) btn.classList.add('map-current');
        btn.setAttribute('aria-label',
          isCurrent
            ? `${biome.name} — you are here`
            : `${biome.name} — click to travel`,
        );
        btn.innerHTML = `
          <span class="map-node-dot" style="background:${BIOME_COLORS[biome.id] ?? DEFAULT_BIOME_COLOR}"></span>
          <span class="map-node-name">${biome.name}</span>
          ${isCurrent ? '<span class="map-node-badge">You are here</span>' : ''}
        `;

        if (!isCurrent) {
          btn.addEventListener('click', () => this.travelTo(biome.id));
        }
      } else {
        const revealedRoute = this.getRevealedRouteTo(biome.id);
        if (revealedRoute) {
          const origin = otherRouteEnd(revealedRoute, biome.id);
          const originName = BIOME_LOCATIONS.find(b => b.id === origin)?.name ?? humanizeRoutePart(origin);
          btn.classList.add('map-reachable');
          btn.setAttribute('aria-label',
            `${biome.name} — walking path from ${originName}. Walk there once to unlock fast travel.`,
          );
          btn.innerHTML = `
            <span class="map-node-dot map-node-route" style="background:${BIOME_COLORS[biome.id] ?? DEFAULT_BIOME_COLOR}"></span>
            <span class="map-node-name">${biome.name}</span>
            <span class="map-node-badge">Walk there</span>
          `;
          btn.addEventListener('click', () => this.describeRouteTo(biome, revealedRoute));
          this.listEl.appendChild(btn);
          continue;
        }

        btn.classList.add('map-undiscovered');
        btn.setAttribute('aria-label', 'Undiscovered biome — explore to reveal');
        btn.disabled = true;
        btn.innerHTML = `
          <span class="map-node-dot map-node-unknown"></span>
          <span class="map-node-name">???</span>
        `;
      }

      this.listEl.appendChild(btn);
    }
  }

  // ── Canvas map visualization ─────────────────────────────────────────────

  private drawMap(): void {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, w, h);

    // Find bounding box of all biome locations to normalize
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const b of BIOME_LOCATIONS) {
      if (b.worldPosition.x < minX) minX = b.worldPosition.x;
      if (b.worldPosition.x > maxX) maxX = b.worldPosition.x;
      if (b.worldPosition.z < minZ) minZ = b.worldPosition.z;
      if (b.worldPosition.z > maxZ) maxZ = b.worldPosition.z;
    }

    const padding = 40;
    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const scaleX = (w - padding * 2) / rangeX;
    const scaleZ = (h - padding * 2) / rangeZ;
    const scale = Math.min(scaleX, scaleZ);

    const toScreen = (wx: number, wz: number): [number, number] => {
      const sx = padding + (wx - minX) * scale;
      const sy = padding + (wz - minZ) * scale;
      return [sx, sy];
    };

    // Draw route connections
    for (const route of BIOME_ROUTES) {
      const fromBiome = BIOME_LOCATIONS.find(b => b.id === route.from);
      const toBiome = BIOME_LOCATIONS.find(b => b.id === route.to);
      if (!fromBiome || !toBiome) continue;

      const bothDiscovered = this.discoveredBiomes.has(route.from) && this.discoveredBiomes.has(route.to);
      const oneDiscovered = this.discoveredBiomes.has(route.from) || this.discoveredBiomes.has(route.to);

      if (!oneDiscovered) continue;

      const [x1, y1] = toScreen(fromBiome.worldPosition.x, fromBiome.worldPosition.z);
      const [x2, y2] = toScreen(toBiome.worldPosition.x, toBiome.worldPosition.z);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = bothDiscovered ? 'rgba(34, 211, 238, 0.4)' : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = bothDiscovered ? 2 : 1;
      if (!bothDiscovered) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw biome nodes
    for (const biome of BIOME_LOCATIONS) {
      const discovered = this.discoveredBiomes.has(biome.id);
      const isCurrent = biome.id === this.currentBiome;
      const [sx, sy] = toScreen(biome.worldPosition.x, biome.worldPosition.z);

      if (discovered) {
        // Glow ring for current biome
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(sx, sy, 12, 0, Math.PI * 2);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Filled node
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.fillStyle = BIOME_COLORS[biome.id] ?? DEFAULT_BIOME_COLOR;
        ctx.fill();
        ctx.strokeStyle = '#F5F0E8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#F5F0E8';
        ctx.font = '10px Nunito, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(biome.name, sx, sy + 18);
      } else {
        const revealedRoute = this.getRevealedRouteTo(biome.id);
        if (revealedRoute) {
          ctx.beginPath();
          ctx.arc(sx, sy, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 211, 238, 0.28)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = 'rgba(245, 240, 232, 0.78)';
          ctx.font = '10px Nunito, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(biome.name, sx, sy + 18);
          continue;
        }

        // Undiscovered — faint "?" node
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fill();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '10px Nunito, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', sx, sy + 4);
      }
    }
  }

  // ── Travel ───────────────────────────────────────────────────────────────

  private travelTo(biomeId: string): void {
    if (!this.discoveredBiomes.has(biomeId)) {
      this.onCompanionSpeak("We haven't been there yet. Let's explore!");
      return;
    }

    if (biomeId === this.currentBiome) {
      this.onCompanionSpeak("We're already here!");
      return;
    }

    const biome = BIOME_LOCATIONS.find(b => b.id === biomeId);
    const name = biome?.name ?? biomeId;

    this.onCompanionSpeak(`Let's head to ${name}!`);
    this.close();
    this.onTravelTo(biomeId);
  }

  private describeRouteTo(biome: BiomeLocation, route: BiomeRoute): void {
    const originId = otherRouteEnd(route, biome.id);
    const originName = BIOME_LOCATIONS.find(b => b.id === originId)?.name ?? humanizeRoutePart(originId);
    const landmarks = route.landmarks.map(humanizeRoutePart).join(', ');
    const routeHint = landmarks
      ? ` Follow ${landmarks}.`
      : '';
    this.onCompanionSpeak(
      `${biome.name} is a walking path from ${originName}, not fast travel yet.${routeHint} Walk there once and the map will remember it.`,
    );
  }

  private getRevealedRouteTo(biomeId: string): BiomeRoute | null {
    if (this.discoveredBiomes.has(biomeId)) return null;
    return BIOME_ROUTES.find(route => {
      if (route.minTier !== FOUNDATION_TIER || !routeIncludes(route, biomeId)) return false;
      return this.discoveredBiomes.has(otherRouteEnd(route, biomeId));
    }) ?? null;
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      this.close();
    }
  }
}
