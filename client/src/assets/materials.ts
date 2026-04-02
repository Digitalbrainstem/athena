import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function hex(color: number): THREE.Color {
  return new THREE.Color(color);
}

/** Adjust saturation for the given mastery tier (Foundation = vivid, Creator = muted). */
function tierSaturation(base: THREE.Color, tier: MasteryTier): THREE.Color {
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const mult = TIER_SATURATION_MULT[tier];
  hsl.s = Math.min(1, hsl.s * mult);
  return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
}

const TIER_SATURATION_MULT: Record<MasteryTier, number> = {
  foundation: 1.15,
  discovery: 1.0,
  builder: 0.9,
  innovator: 0.8,
  creator: 0.7,
};

// ---------------------------------------------------------------------------
// Accent colors (project-wide constants)
// ---------------------------------------------------------------------------

export const FROST = 0x22d3ee;
export const AURORA = 0xa78bfa;

// ---------------------------------------------------------------------------
// Material preset definitions
// ---------------------------------------------------------------------------

export interface MaterialDef {
  color: number;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
  emissive?: number;
  emissiveIntensity?: number;
  side?: THREE.Side;
}

const PRESET_DEFS: Record<string, MaterialDef> = {
  // --- Natural materials ---
  wood:        { color: 0x8b6914, roughness: 0.9, metalness: 0.0 },
  darkWood:    { color: 0x5c3a0a, roughness: 0.85, metalness: 0.0 },
  lightWood:   { color: 0xc9a95e, roughness: 0.9, metalness: 0.0 },
  bark:        { color: 0x6b4226, roughness: 1.0, metalness: 0.0 },
  stone:       { color: 0x808080, roughness: 0.8, metalness: 0.1 },
  darkStone:   { color: 0x4a4a4a, roughness: 0.85, metalness: 0.1 },
  sandstone:   { color: 0xd4a76a, roughness: 0.9, metalness: 0.0 },
  soil:        { color: 0x6b4423, roughness: 1.0, metalness: 0.0 },
  sand:        { color: 0xd2b48c, roughness: 0.95, metalness: 0.0 },
  leaf:        { color: 0x228b22, roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide },
  leafDark:    { color: 0x1a6b1a, roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide },
  leafAutumn:  { color: 0xd4842a, roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide },
  moss:        { color: 0x6b8e23, roughness: 1.0, metalness: 0.0 },
  grass:       { color: 0x3a7d44, roughness: 0.85, metalness: 0.0 },
  mushroom:    { color: 0xc7844e, roughness: 0.8, metalness: 0.0 },
  mushroomCap: { color: 0xd93636, roughness: 0.7, metalness: 0.0 },
  coral:       { color: 0xff7f50, roughness: 0.6, metalness: 0.0 },

  // --- Metals ---
  metal:       { color: 0xb0b0b0, roughness: 0.3, metalness: 0.8 },
  darkMetal:   { color: 0x555555, roughness: 0.35, metalness: 0.85 },
  copper:      { color: 0xb87333, roughness: 0.35, metalness: 0.7 },
  brass:       { color: 0xcd9b1d, roughness: 0.3, metalness: 0.75 },
  gold:        { color: 0xffd700, roughness: 0.25, metalness: 0.9 },
  steel:       { color: 0x708090, roughness: 0.3, metalness: 0.85 },
  iron:        { color: 0x696969, roughness: 0.5, metalness: 0.7 },

  // --- Glass & crystal ---
  crystal:     { color: FROST, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 },
  crystalPink: { color: 0xff69b4, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 },
  crystalGreen:{ color: 0x50c878, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 },
  crystalAmber:{ color: 0xffbf00, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 },
  glass:       { color: 0xffffff, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.3 },
  glassGreen:  { color: 0x228b22, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.35 },
  glassPurple: { color: 0x9932cc, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.35 },

  // --- Liquids ---
  water:       { color: 0x4169e1, roughness: 0.0, metalness: 0.2, transparent: true, opacity: 0.6 },
  lava:        { color: 0xff4500, roughness: 0.3, metalness: 0.1, emissive: 0xff4500, emissiveIntensity: 0.6 },
  potion:      { color: 0x8a2be2, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.65 },
  potionGreen: { color: 0x32cd32, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.65, emissive: 0x32cd32, emissiveIntensity: 0.2 },

  // --- Fabric & leather ---
  fabric:      { color: 0xd2691e, roughness: 1.0, metalness: 0.0 },
  leather:     { color: 0x8b4513, roughness: 0.85, metalness: 0.0 },
  canvas:      { color: 0xf5f5dc, roughness: 1.0, metalness: 0.0 },
  paper:       { color: 0xfaf0e6, roughness: 1.0, metalness: 0.0 },
  parchment:   { color: 0xefe0c9, roughness: 0.95, metalness: 0.0 },

  // --- Special ---
  glow:        { color: FROST, roughness: 0.3, metalness: 0.2, emissive: FROST, emissiveIntensity: 0.5 },
  glowAurora:  { color: AURORA, roughness: 0.3, metalness: 0.2, emissive: AURORA, emissiveIntensity: 0.5 },
  neon:        { color: 0x39ff14, roughness: 0.2, metalness: 0.1, emissive: 0x39ff14, emissiveIntensity: 0.7 },
  neonBlue:    { color: 0x00bfff, roughness: 0.2, metalness: 0.1, emissive: 0x00bfff, emissiveIntensity: 0.7 },
  hologram:    { color: FROST, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.4, emissive: FROST, emissiveIntensity: 0.8 },
  energy:      { color: 0x87ceeb, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.55, emissive: 0x87ceeb, emissiveIntensity: 0.6 },
  marble:      { color: 0xf0ead6, roughness: 0.3, metalness: 0.05 },
  ceramic:     { color: 0xffffff, roughness: 0.4, metalness: 0.05 },
  clay:        { color: 0xcd853f, roughness: 0.9, metalness: 0.0 },
  concrete:    { color: 0x999999, roughness: 0.95, metalness: 0.05 },
  plastic:     { color: 0xe0e0e0, roughness: 0.5, metalness: 0.0 },
  rubber:      { color: 0x333333, roughness: 1.0, metalness: 0.0 },
  chalk:       { color: 0xffffff, roughness: 1.0, metalness: 0.0 },
  wax:         { color: 0xfff8dc, roughness: 0.6, metalness: 0.0, transparent: true, opacity: 0.85 },
  bone:        { color: 0xf5f5dc, roughness: 0.7, metalness: 0.05 },
  circuit:     { color: 0x1a472a, roughness: 0.6, metalness: 0.3 },
  screen:      { color: 0x111111, roughness: 0.2, metalness: 0.0, emissive: 0x00ff41, emissiveIntensity: 0.4 },
  whiteboard:  { color: 0xf8f8f8, roughness: 0.3, metalness: 0.0 },
};

// ---------------------------------------------------------------------------
// Biome palette definitions — 5 colors per biome matching 16-ART_DIRECTION.md
// ---------------------------------------------------------------------------

export interface BiomePalette {
  dominant: number;
  accent1: number;
  accent2: number;
  shadow: number;
  highlight: number;
  ground: number;
  sky: number;
  skySecondary: number;
  fog: number;
}

export const BIOME_PALETTES: Record<string, BiomePalette> = {
  'workshop':          { dominant: 0x8b6914, accent1: 0xb87333, accent2: 0x708090, shadow: 0x3e2a04, highlight: 0xffd700, ground: 0x7a6240, sky: 0xf5deb3, skySecondary: 0xdeb887, fog: 0xdeb887 },
  'alchemist-lab':     { dominant: 0x4b0082, accent1: 0x228b22, accent2: 0xdc143c, shadow: 0x1a0033, highlight: 0xffd700, ground: 0x2d1b4e, sky: 0x2e003e, skySecondary: 0x4b0082, fog: 0x2e003e },
  'crystal-caverns':   { dominant: 0x9966cc, accent1: 0x22d3ee, accent2: 0xff69b4, shadow: 0x2d1b4e, highlight: 0xffffff, ground: 0x3d3050, sky: 0x1a0a2e, skySecondary: 0x2d1b4e, fog: 0x1a0a2e },
  'living-forest':     { dominant: 0x228b22, accent1: 0xbdb76b, accent2: 0x8b6914, shadow: 0x0b3d0b, highlight: 0xffd700, ground: 0x3a5a20, sky: 0x87ceeb, skySecondary: 0xb0e0e6, fog: 0x8fbc8f },
  'library-echoes':    { dominant: 0x8b4513, accent1: 0xdaa520, accent2: 0xfaf0e6, shadow: 0x3e1c03, highlight: 0xffd700, ground: 0x5c3a1e, sky: 0x2c1e10, skySecondary: 0x3e2a14, fog: 0x3e2a14 },
  'observatory':       { dominant: 0x191970, accent1: 0xc0c0c0, accent2: 0xdda0dd, shadow: 0x000033, highlight: 0xffffff, ground: 0x1a1a3e, sky: 0x000022, skySecondary: 0x0a0a40, fog: 0x0a0a30 },
  'ancient-ruins':     { dominant: 0xd4a76a, accent1: 0x808080, accent2: 0x556b2f, shadow: 0x6b4423, highlight: 0xfaf0e6, ground: 0xa08050, sky: 0xe0c89f, skySecondary: 0xd4a76a, fog: 0xd4a76a },
  'trading-post':      { dominant: 0xd2b48c, accent1: 0xcc3333, accent2: 0xe67e22, shadow: 0x5c3a1e, highlight: 0xffd700, ground: 0xb8945a, sky: 0xfce4b5, skySecondary: 0xf5deb3, fog: 0xf5deb3 },
  'storm-tower':       { dominant: 0x708090, accent1: 0x22d3ee, accent2: 0x9370db, shadow: 0x2f4f4f, highlight: 0xffffff, ground: 0x4a5568, sky: 0x374151, skySecondary: 0x1f2937, fog: 0x4b5563 },
  'code-forge':        { dominant: 0x00ff41, accent1: 0x22d3ee, accent2: 0xffbf00, shadow: 0x0a0a0a, highlight: 0xffffff, ground: 0x111111, sky: 0x0a0a1a, skySecondary: 0x111122, fog: 0x0a0a1a },
  'space-station':     { dominant: 0xb0b0b0, accent1: 0x22d3ee, accent2: 0xc0c0c0, shadow: 0x1a1a2e, highlight: 0xffffff, ground: 0x2a2a3a, sky: 0x000011, skySecondary: 0x0a0a22, fog: 0x0a0a1a },
  'arena':             { dominant: 0xcd853f, accent1: 0xff6347, accent2: 0xffd700, shadow: 0x3e1c03, highlight: 0xfff8dc, ground: 0xb8860b, sky: 0xd4763a, skySecondary: 0xb8540a, fog: 0xc4763a },
  'music-hall':        { dominant: 0xdaa520, accent1: 0xffd700, accent2: 0x8b0000, shadow: 0x3e2a04, highlight: 0xfffff0, ground: 0x5c3a1e, sky: 0x2c1e10, skySecondary: 0x3e2a14, fog: 0x3e2a14 },
  'hospital':          { dominant: 0xf0f0f0, accent1: 0x228b22, accent2: 0x22d3ee, shadow: 0xcccccc, highlight: 0xffffff, ground: 0xe8e8e8, sky: 0xf5f5ff, skySecondary: 0xe8f0ff, fog: 0xf0f0f5 },
  'farm':              { dominant: 0x8b6914, accent1: 0x228b22, accent2: 0xffd700, shadow: 0x3e2a04, highlight: 0xfffff0, ground: 0x6b4423, sky: 0x87ceeb, skySecondary: 0xb0e0e6, fog: 0xadd8e6 },
  'laboratory':        { dominant: 0xe0e0e0, accent1: 0x22d3ee, accent2: 0x32cd32, shadow: 0x808080, highlight: 0xffffff, ground: 0xd0d0d0, sky: 0xf0f0fa, skySecondary: 0xe0e0f0, fog: 0xeeeef5 },
  'explorers-map':     { dominant: 0xd4a76a, accent1: 0x228b22, accent2: 0x4169e1, shadow: 0x6b4423, highlight: 0xfff8dc, ground: 0x8b7355, sky: 0x87ceeb, skySecondary: 0xadd8e6, fog: 0xb0c4de },
  'time-rift':         { dominant: 0xa78bfa, accent1: 0x22d3ee, accent2: 0xffd700, shadow: 0x2d1b4e, highlight: 0xffffff, ground: 0x3a2960, sky: 0x1a0a3e, skySecondary: 0x2d1b5e, fog: 0x2a1a4e },
  'healers-sanctuary': { dominant: 0x228b22, accent1: 0xdaa520, accent2: 0xffffff, shadow: 0x0b3d0b, highlight: 0xf0fff0, ground: 0x3a5a20, sky: 0xf0fff0, skySecondary: 0xe0ffe0, fog: 0xe0ffe0 },
  'architects-domain': { dominant: 0xfaf0e6, accent1: 0x22d3ee, accent2: 0xdaa520, shadow: 0x808080, highlight: 0xffffff, ground: 0xb8b0a0, sky: 0xe0e8f0, skySecondary: 0xd0d8e8, fog: 0xd8dde5 },
  'shipyard':          { dominant: 0x8b6914, accent1: 0x4682b4, accent2: 0xb0b0b0, shadow: 0x3e2a04, highlight: 0xffffff, ground: 0x5c3a1e, sky: 0x87ceeb, skySecondary: 0x4682b4, fog: 0x87ceeb },
  'digital-world':     { dominant: 0x00ff41, accent1: 0x22d3ee, accent2: 0xa78bfa, shadow: 0x0a0a0a, highlight: 0xffffff, ground: 0x0a0a14, sky: 0x000011, skySecondary: 0x0a0a22, fog: 0x050510 },
  'debate-hall':       { dominant: 0xf5f5dc, accent1: 0x800020, accent2: 0x191970, shadow: 0x808080, highlight: 0xffffff, ground: 0x8b7355, sky: 0xe8e0d0, skySecondary: 0xd8d0c0, fog: 0xd8d0c0 },
  'gallery':           { dominant: 0xf5f5f5, accent1: 0xff6347, accent2: 0x4169e1, shadow: 0x808080, highlight: 0xffffff, ground: 0xd4d0c8, sky: 0xf0f0f0, skySecondary: 0xe8e8e8, fog: 0xf0f0f0 },
  'newsroom':          { dominant: 0x333333, accent1: 0xdc143c, accent2: 0xffffff, shadow: 0x1a1a1a, highlight: 0xffffff, ground: 0x555555, sky: 0x2a2a3a, skySecondary: 0x3a3a4a, fog: 0x333340 },
  'theater':           { dominant: 0x8b0000, accent1: 0xffd700, accent2: 0x2e0610, shadow: 0x1a0a0a, highlight: 0xfffff0, ground: 0x3e1c1c, sky: 0x1a0a0a, skySecondary: 0x2e0a0a, fog: 0x1a0a0a },
  'marketplace':       { dominant: 0xe67e22, accent1: 0x228b22, accent2: 0xffd700, shadow: 0x5c3a1e, highlight: 0xfffff0, ground: 0xb8945a, sky: 0xfce4b5, skySecondary: 0xf5deb3, fog: 0xf0deb5 },
};

// ---------------------------------------------------------------------------
// Material cache — shared across the whole client (singleton)
// ---------------------------------------------------------------------------

export class MaterialLibrary {
  private readonly cache = new Map<string, THREE.MeshStandardMaterial>();

  /** Get a material preset, optionally tinted for a mastery tier. */
  get(preset: string, tier?: MasteryTier): THREE.MeshStandardMaterial {
    const key = tier ? `${preset}:${tier}` : preset;
    let mat = this.cache.get(key);
    if (mat) return mat;

    const def = PRESET_DEFS[preset];
    if (!def) {
      // fallback neutral material
      mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.05 });
      this.cache.set(key, mat);
      return mat;
    }

    let color = hex(def.color);
    if (tier) color = tierSaturation(color, tier);

    mat = new THREE.MeshStandardMaterial({
      color,
      roughness: def.roughness,
      metalness: def.metalness,
    });

    if (def.transparent) {
      mat.transparent = true;
      mat.opacity = def.opacity ?? 0.5;
    }
    if (def.emissive !== undefined) {
      mat.emissive = hex(def.emissive);
      mat.emissiveIntensity = def.emissiveIntensity ?? 0.5;
    }
    if (def.side !== undefined) {
      mat.side = def.side;
    }

    this.cache.set(key, mat);
    return mat;
  }

  /** Get a material from a raw color hex integer. */
  fromColor(color: number, roughness = 0.7, metalness = 0.05): THREE.MeshStandardMaterial {
    const key = `raw:${color}:${roughness}:${metalness}`;
    let mat = this.cache.get(key);
    if (mat) return mat;
    mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    this.cache.set(key, mat);
    return mat;
  }

  /** Get the biome palette for a biome ID. */
  getBiomePalette(biomeId: string): BiomePalette | undefined {
    return BIOME_PALETTES[biomeId];
  }

  /** Get all preset names. */
  getPresetNames(): string[] {
    return Object.keys(PRESET_DEFS);
  }

  dispose(): void {
    for (const mat of this.cache.values()) mat.dispose();
    this.cache.clear();
  }
}
