import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import { MaterialLibrary, FROST } from './materials.js';

// ---------------------------------------------------------------------------
// Geometry helpers — build stylized shapes from primitives
// ---------------------------------------------------------------------------

function rounded(r: number, s: number): number { return Math.max(1, Math.round(s * r)); }
function seg(tier: MasteryTier): number {
  return tier === 'foundation' ? 8 : tier === 'discovery' ? 12 : 16;
}

function makeGroup(...children: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

function mesh(
  geom: THREE.BufferGeometry,
  mat: THREE.Material,
  pos?: [number, number, number],
  rot?: [number, number, number],
  scale?: [number, number, number],
): THREE.Mesh {
  const m = new THREE.Mesh(geom, mat);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// ProceduralModelGenerator
// ---------------------------------------------------------------------------

export class ProceduralModelGenerator {
  private readonly lib: MaterialLibrary;
  private readonly geoCache = new Map<string, THREE.BufferGeometry>();

  constructor(lib: MaterialLibrary) {
    this.lib = lib;
  }

  // ---- public entry point ------------------------------------------------

  generate(objectType: string, tier: MasteryTier): THREE.Group {
    const fn = (GENERATORS as Record<string, GeneratorFn>)[objectType];
    if (fn) return fn(this.lib, tier, this);
    // Fallback — generic box with a color based on the object type hash
    return this.generateFallback(objectType, tier);
  }

  // ---- cached primitive geometries ---------------------------------------

  box(w: number, h: number, d: number, s = 1): THREE.BoxGeometry {
    const key = `box:${w}:${h}:${d}:${s}`;
    let g = this.geoCache.get(key) as THREE.BoxGeometry | undefined;
    if (!g) { g = new THREE.BoxGeometry(w, h, d, s, s, s); this.geoCache.set(key, g); }
    return g;
  }

  sphere(r: number, ws = 16, hs = 12): THREE.SphereGeometry {
    const key = `sphere:${r}:${ws}:${hs}`;
    let g = this.geoCache.get(key) as THREE.SphereGeometry | undefined;
    if (!g) { g = new THREE.SphereGeometry(r, ws, hs); this.geoCache.set(key, g); }
    return g;
  }

  cylinder(rT: number, rB: number, h: number, s = 16): THREE.CylinderGeometry {
    const key = `cyl:${rT}:${rB}:${h}:${s}`;
    let g = this.geoCache.get(key) as THREE.CylinderGeometry | undefined;
    if (!g) { g = new THREE.CylinderGeometry(rT, rB, h, s); this.geoCache.set(key, g); }
    return g;
  }

  cone(r: number, h: number, s = 16): THREE.ConeGeometry {
    const key = `cone:${r}:${h}:${s}`;
    let g = this.geoCache.get(key) as THREE.ConeGeometry | undefined;
    if (!g) { g = new THREE.ConeGeometry(r, h, s); this.geoCache.set(key, g); }
    return g;
  }

  torus(r: number, tube: number, rs = 12, ts = 16): THREE.TorusGeometry {
    const key = `torus:${r}:${tube}:${rs}:${ts}`;
    let g = this.geoCache.get(key) as THREE.TorusGeometry | undefined;
    if (!g) { g = new THREE.TorusGeometry(r, tube, rs, ts); this.geoCache.set(key, g); }
    return g;
  }

  // ---- fallback for unknown object types ---------------------------------

  private generateFallback(objectType: string, tier: MasteryTier): THREE.Group {
    let hash = 0;
    for (let i = 0; i < objectType.length; i++) hash = ((hash << 5) - hash + objectType.charCodeAt(i)) | 0;
    const hue = (Math.abs(hash) % 360) / 360;
    const color = new THREE.Color().setHSL(hue, 0.6, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05 });
    const s = seg(tier);
    const g = makeGroup(mesh(this.box(0.8, 0.8, 0.8, rounded(s, 1)), mat));
    g.userData.fallback = true;
    return g;
  }

  dispose(): void {
    for (const g of this.geoCache.values()) g.dispose();
    this.geoCache.clear();
  }
}

// ---------------------------------------------------------------------------
// Generator functions (one per object type)
// ---------------------------------------------------------------------------

type GeneratorFn = (lib: MaterialLibrary, tier: MasteryTier, gen: ProceduralModelGenerator) => THREE.Group;

const GENERATORS: Record<string, GeneratorFn> = {
  // -------------------------------------------------------------------
  // Workshop objects
  // -------------------------------------------------------------------
  workbench: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const darkWood = lib.get('darkWood', tier);
    const top = mesh(g.box(2.0, 0.15, 1.0, rounded(s, 1)), wood, [0, 0.85, 0]);
    const leg1 = mesh(g.box(0.12, 0.85, 0.12, 1), darkWood, [-0.85, 0.425, -0.38]);
    const leg2 = mesh(g.box(0.12, 0.85, 0.12, 1), darkWood, [0.85, 0.425, -0.38]);
    const leg3 = mesh(g.box(0.12, 0.85, 0.12, 1), darkWood, [-0.85, 0.425, 0.38]);
    const leg4 = mesh(g.box(0.12, 0.85, 0.12, 1), darkWood, [0.85, 0.425, 0.38]);
    const shelf = mesh(g.box(1.6, 0.08, 0.7, 1), wood, [0, 0.3, 0]);
    const group = makeGroup(top, leg1, leg2, leg3, leg4, shelf);
    if (tier !== 'foundation') {
      const vice = mesh(g.box(0.2, 0.15, 0.1, 1), lib.get('metal', tier), [0.7, 0.96, 0]);
      group.add(vice);
    }
    return group;
  },

  anvil: (lib, tier, g) => {
    const s = seg(tier);
    const iron = lib.get('iron', tier);
    const base = mesh(g.box(0.6, 0.3, 0.4, rounded(s, 1)), iron, [0, 0.15, 0]);
    const waist = mesh(g.cylinder(0.15, 0.25, 0.2, s), iron, [0, 0.4, 0]);
    const top = mesh(g.box(0.8, 0.15, 0.35, rounded(s, 1)), iron, [0, 0.55, 0]);
    const horn = mesh(g.cone(0.1, 0.3, s), iron, [0.5, 0.55, 0], [0, 0, -Math.PI / 2]);
    return makeGroup(base, waist, top, horn);
  },

  gear: (lib, tier, g) => {
    const brass = lib.get('brass', tier);
    const body = mesh(g.torus(0.3, 0.06, seg(tier), 24), brass);
    const hub = mesh(g.cylinder(0.08, 0.08, 0.06, seg(tier)), brass);
    return makeGroup(body, hub);
  },

  toolRack: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const mtl = lib.get('metal', tier);
    const board = mesh(g.box(1.5, 1.0, 0.08, 1), wood, [0, 1.0, 0]);
    const peg1 = mesh(g.cylinder(0.02, 0.02, 0.15, 8), mtl, [-0.4, 1.2, 0.1], [Math.PI / 2, 0, 0]);
    const peg2 = mesh(g.cylinder(0.02, 0.02, 0.15, 8), mtl, [0, 1.2, 0.1], [Math.PI / 2, 0, 0]);
    const peg3 = mesh(g.cylinder(0.02, 0.02, 0.15, 8), mtl, [0.4, 1.2, 0.1], [Math.PI / 2, 0, 0]);
    return makeGroup(board, peg1, peg2, peg3);
  },

  hammer: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const mtl = lib.get('metal', tier);
    const handle = mesh(g.cylinder(0.025, 0.025, 0.5, 8), wood, [0, 0.25, 0]);
    const head = mesh(g.box(0.18, 0.08, 0.08, 1), mtl, [0, 0.52, 0]);
    return makeGroup(handle, head);
  },

  // -------------------------------------------------------------------
  // Observatory objects
  // -------------------------------------------------------------------
  telescope: (lib, tier, g) => {
    const s = seg(tier);
    const brass = lib.get('brass', tier);
    const darkMetal = lib.get('darkMetal', tier);
    const tube = mesh(g.cylinder(0.08, 0.12, 1.0, s), brass, [0, 1.0, 0], [0.3, 0, 0]);
    const lens = mesh(g.sphere(0.12, s, s), lib.get('glass', tier), [0, 1.35, -0.3]);
    const tripodLeg1 = mesh(g.cylinder(0.02, 0.02, 0.8, 6), darkMetal, [-0.2, 0.35, -0.2], [0.15, 0, -0.15]);
    const tripodLeg2 = mesh(g.cylinder(0.02, 0.02, 0.8, 6), darkMetal, [0.2, 0.35, -0.2], [0.15, 0, 0.15]);
    const tripodLeg3 = mesh(g.cylinder(0.02, 0.02, 0.8, 6), darkMetal, [0, 0.35, 0.25], [-0.15, 0, 0]);
    return makeGroup(tube, lens, tripodLeg1, tripodLeg2, tripodLeg3);
  },

  orrery: (lib, tier, g) => {
    const s = seg(tier);
    const brass = lib.get('brass', tier);
    const gold = lib.get('gold', tier);
    const base = mesh(g.cylinder(0.3, 0.35, 0.1, s), brass, [0, 0.05, 0]);
    const arm = mesh(g.cylinder(0.01, 0.01, 0.5, 6), brass, [0, 0.2, 0], [0, 0, Math.PI / 6]);
    const sun = mesh(g.sphere(0.06, s, s), gold, [0, 0.35, 0]);
    const planet1 = mesh(g.sphere(0.03, s, s), lib.get('crystal', tier), [0.2, 0.35, 0]);
    const planet2 = mesh(g.sphere(0.025, s, s), lib.get('crystalPink', tier), [-0.15, 0.35, 0.12]);
    return makeGroup(base, arm, sun, planet1, planet2);
  },

  starMap: (lib, tier, g) => {
    const parchment = lib.get('parchment', tier);
    const frame = mesh(g.box(1.2, 0.02, 0.9, 1), lib.get('darkWood', tier), [0, 0.9, -0.01]);
    const chart = mesh(g.box(1.1, 0.005, 0.8, 1), parchment, [0, 0.91, 0]);
    return makeGroup(frame, chart);
  },

  // -------------------------------------------------------------------
  // Alchemist's Lab objects
  // -------------------------------------------------------------------
  cauldron: (lib, tier, g) => {
    const s = seg(tier);
    const iron = lib.get('iron', tier);
    const potion = lib.get('potionGreen', tier);
    const body = mesh(g.sphere(0.4, s, Math.floor(s / 2)), iron, [0, 0.3, 0]);
    const rim = mesh(g.torus(0.35, 0.04, 8, s), iron, [0, 0.55, 0]);
    const liquid = mesh(g.cylinder(0.32, 0.32, 0.05, s), potion, [0, 0.5, 0]);
    const leg1 = mesh(g.cylinder(0.04, 0.03, 0.15, 6), iron, [-0.2, 0.05, -0.15]);
    const leg2 = mesh(g.cylinder(0.04, 0.03, 0.15, 6), iron, [0.2, 0.05, -0.15]);
    const leg3 = mesh(g.cylinder(0.04, 0.03, 0.15, 6), iron, [0, 0.05, 0.2]);
    return makeGroup(body, rim, liquid, leg1, leg2, leg3);
  },

  potionBottle: (lib, tier, g) => {
    const s = seg(tier);
    const glass = lib.get('glassGreen', tier);
    const body = mesh(g.sphere(0.08, s, s), glass, [0, 0.08, 0]);
    const neck = mesh(g.cylinder(0.025, 0.03, 0.08, s), glass, [0, 0.18, 0]);
    const cork = mesh(g.cylinder(0.028, 0.028, 0.03, 8), lib.get('wood', tier), [0, 0.23, 0]);
    return makeGroup(body, neck, cork);
  },

  alchemyTable: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const top = mesh(g.box(1.8, 0.1, 0.9, 1), wood, [0, 0.8, 0]);
    const leg1 = mesh(g.box(0.1, 0.8, 0.1, 1), wood, [-0.75, 0.4, -0.3]);
    const leg2 = mesh(g.box(0.1, 0.8, 0.1, 1), wood, [0.75, 0.4, -0.3]);
    const leg3 = mesh(g.box(0.1, 0.8, 0.1, 1), wood, [-0.75, 0.4, 0.3]);
    const leg4 = mesh(g.box(0.1, 0.8, 0.1, 1), wood, [0.75, 0.4, 0.3]);
    return makeGroup(top, leg1, leg2, leg3, leg4);
  },

  // -------------------------------------------------------------------
  // Crystal Caverns objects
  // -------------------------------------------------------------------
  crystal: (lib, tier, g) => {
    const s = seg(tier);
    const variants: Array<[string, number]> = [['crystal', FROST], ['crystalPink', 0xff69b4], ['crystalGreen', 0x50c878]];
    const [preset] = variants[0]!;
    const mat = lib.get(preset, tier);
    const shard1 = mesh(g.cone(0.12, 0.8, Math.max(5, s)), mat, [0, 0.4, 0]);
    const shard2 = mesh(g.cone(0.08, 0.5, Math.max(5, s)), mat, [0.15, 0.25, 0.1], [0, 0, 0.2]);
    const shard3 = mesh(g.cone(0.06, 0.35, Math.max(5, s)), mat, [-0.12, 0.18, -0.05], [0, 0, -0.3]);
    return makeGroup(shard1, shard2, shard3);
  },

  crystalCluster: (lib, tier, g) => {
    const s = seg(tier);
    const colors: string[] = ['crystal', 'crystalPink', 'crystalGreen', 'crystalAmber'];
    const group = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const preset = colors[i % colors.length]!;
      const mat = lib.get(preset, tier);
      const h = 0.3 + Math.random() * 0.6;
      const r = 0.05 + Math.random() * 0.08;
      const shard = mesh(g.cone(r, h, Math.max(5, s)), mat,
        [(Math.random() - 0.5) * 0.4, h / 2, (Math.random() - 0.5) * 0.4],
        [0, 0, (Math.random() - 0.5) * 0.5]);
      group.add(shard);
    }
    const rockBase = mesh(g.box(0.5, 0.15, 0.5, 1), lib.get('darkStone', tier), [0, 0.075, 0]);
    group.add(rockBase);
    return group;
  },

  stalactite: (lib, tier, g) => {
    const s = seg(tier);
    const stone = lib.get('darkStone', tier);
    const main = mesh(g.cone(0.15, 1.0, s), stone, [0, -0.5, 0], [Math.PI, 0, 0]);
    const small = mesh(g.cone(0.08, 0.5, s), stone, [0.2, -0.25, 0.1], [Math.PI, 0, 0.1]);
    return makeGroup(main, small);
  },

  // -------------------------------------------------------------------
  // Living Forest objects
  // -------------------------------------------------------------------
  tree: (lib, tier, g) => {
    const s = seg(tier);
    const bark = lib.get('bark', tier);
    const leaf = lib.get('leaf', tier);
    const trunk = mesh(g.cylinder(0.12, 0.18, 1.5, s), bark, [0, 0.75, 0]);
    if (tier === 'foundation') {
      const canopy = mesh(g.sphere(0.7, s, s), leaf, [0, 1.9, 0]);
      return makeGroup(trunk, canopy);
    }
    const canopy1 = mesh(g.sphere(0.55, s, s), leaf, [0, 2.0, 0]);
    const canopy2 = mesh(g.sphere(0.4, s, s), lib.get('leafDark', tier), [-0.3, 1.7, 0.2]);
    const canopy3 = mesh(g.sphere(0.35, s, s), leaf, [0.25, 1.8, -0.15]);
    return makeGroup(trunk, canopy1, canopy2, canopy3);
  },

  treePine: (lib, tier, g) => {
    const s = seg(tier);
    const bark = lib.get('bark', tier);
    const leaf = lib.get('leafDark', tier);
    const trunk = mesh(g.cylinder(0.08, 0.12, 1.8, s), bark, [0, 0.9, 0]);
    const tier1 = mesh(g.cone(0.5, 0.7, s), leaf, [0, 1.4, 0]);
    const tier2 = mesh(g.cone(0.4, 0.6, s), leaf, [0, 1.9, 0]);
    const tier3 = mesh(g.cone(0.3, 0.5, s), leaf, [0, 2.3, 0]);
    return makeGroup(trunk, tier1, tier2, tier3);
  },

  mushroom: (lib, tier, g) => {
    const s = seg(tier);
    const stem = mesh(g.cylinder(0.06, 0.08, 0.3, s), lib.get('mushroom', tier), [0, 0.15, 0]);
    const cap = mesh(g.sphere(0.15, s, Math.floor(s / 2)), lib.get('mushroomCap', tier), [0, 0.32, 0]);
    return makeGroup(stem, cap);
  },

  rock: (lib, tier, g) => {
    const stone = lib.get('stone', tier);
    const r1 = mesh(g.box(0.5, 0.35, 0.4, 1), stone, [0, 0.175, 0]);
    const r2 = mesh(g.box(0.3, 0.2, 0.25, 1), stone, [0.15, 0.3, 0.05], [0, 0.3, 0.1]);
    return makeGroup(r1, r2);
  },

  bush: (lib, tier, g) => {
    const s = seg(tier);
    const leaf = lib.get('leaf', tier);
    const b1 = mesh(g.sphere(0.25, s, s), leaf, [0, 0.25, 0]);
    const b2 = mesh(g.sphere(0.2, s, s), leaf, [0.18, 0.2, 0.1]);
    const b3 = mesh(g.sphere(0.18, s, s), leaf, [-0.15, 0.22, -0.08]);
    return makeGroup(b1, b2, b3);
  },

  pond: (lib, tier, g) => {
    const s = seg(tier);
    const waterMat = lib.get('water', tier);
    const surface = mesh(g.cylinder(1.0, 1.0, 0.05, s * 2), waterMat, [0, 0.025, 0]);
    const rim = mesh(g.torus(1.0, 0.08, 8, s * 2), lib.get('stone', tier), [0, 0.05, 0], [Math.PI / 2, 0, 0]);
    return makeGroup(surface, rim);
  },

  flower: (lib, tier, g) => {
    const s = seg(tier);
    const stem = mesh(g.cylinder(0.01, 0.015, 0.3, 6), lib.get('leaf', tier), [0, 0.15, 0]);
    const petal = mesh(g.sphere(0.05, s, s), lib.fromColor(0xff69b4), [0, 0.32, 0]);
    const center = mesh(g.sphere(0.02, 8, 8), lib.fromColor(0xffd700), [0, 0.32, 0]);
    return makeGroup(stem, petal, center);
  },

  log: (lib, tier, g) => {
    const s = seg(tier);
    const bark = lib.get('bark', tier);
    const inner = lib.get('lightWood', tier);
    const body = mesh(g.cylinder(0.12, 0.12, 0.8, s), bark, [0, 0.12, 0], [0, 0, Math.PI / 2]);
    const end = mesh(g.cylinder(0.11, 0.11, 0.02, s), inner, [0.4, 0.12, 0], [0, 0, Math.PI / 2]);
    return makeGroup(body, end);
  },

  // -------------------------------------------------------------------
  // Library of Echoes objects
  // -------------------------------------------------------------------
  bookshelf: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const frame = new THREE.Group();
    frame.add(mesh(g.box(1.2, 2.0, 0.08, 1), wood, [0, 1.0, -0.16]));
    frame.add(mesh(g.box(0.08, 2.0, 0.35, 1), wood, [-0.56, 1.0, 0]));
    frame.add(mesh(g.box(0.08, 2.0, 0.35, 1), wood, [0.56, 1.0, 0]));
    for (let i = 0; i < 4; i++) {
      frame.add(mesh(g.box(1.04, 0.04, 0.3, 1), wood, [0, 0.05 + i * 0.5, 0]));
    }
    const bookColors = [0x8b0000, 0x006400, 0x00008b, 0x8b6914, 0x4b0082];
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let b = 0; b < 5; b++) {
        const c = bookColors[(shelf * 5 + b) % bookColors.length]!;
        const bw = 0.06 + Math.random() * 0.04;
        const bh = 0.3 + Math.random() * 0.12;
        frame.add(mesh(g.box(bw, bh, 0.2, 1), lib.fromColor(c, 0.8, 0.0),
          [-0.4 + b * 0.2, 0.08 + shelf * 0.5 + bh / 2, 0]));
      }
    }
    return frame;
  },

  candle: (lib, tier, g) => {
    const s = seg(tier);
    const wax = lib.get('wax', tier);
    const body = mesh(g.cylinder(0.025, 0.03, 0.2, s), wax, [0, 0.1, 0]);
    const flame = mesh(g.cone(0.015, 0.04, 6), lib.get('glow', tier), [0, 0.22, 0]);
    const holder = mesh(g.cylinder(0.04, 0.05, 0.02, s), lib.get('brass', tier), [0, 0.01, 0]);
    return makeGroup(body, flame, holder);
  },

  readingDesk: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const top = mesh(g.box(1.0, 0.06, 0.7, 1), wood, [0, 0.75, 0], [0.15, 0, 0]);
    const leg1 = mesh(g.box(0.06, 0.75, 0.06, 1), wood, [-0.4, 0.375, -0.25]);
    const leg2 = mesh(g.box(0.06, 0.75, 0.06, 1), wood, [0.4, 0.375, -0.25]);
    const leg3 = mesh(g.box(0.06, 0.6, 0.06, 1), wood, [-0.4, 0.3, 0.25]);
    const leg4 = mesh(g.box(0.06, 0.6, 0.06, 1), wood, [0.4, 0.3, 0.25]);
    return makeGroup(top, leg1, leg2, leg3, leg4);
  },

  scrollRack: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const parchment = lib.get('parchment', tier);
    const s = seg(tier);
    const frame = mesh(g.box(0.8, 1.2, 0.3, 1), wood, [0, 0.6, 0]);
    const group = makeGroup(frame);
    for (let i = 0; i < 4; i++) {
      group.add(mesh(g.cylinder(0.03, 0.03, 0.25, s), parchment,
        [-0.2 + i * 0.14, 0.3 + i * 0.2, 0.15], [Math.PI / 2, 0, 0]));
    }
    return group;
  },

  // -------------------------------------------------------------------
  // Storm Tower objects
  // -------------------------------------------------------------------
  teslaCoil: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const base = mesh(g.cylinder(0.2, 0.25, 0.3, s), mtl, [0, 0.15, 0]);
    const coil = mesh(g.cylinder(0.08, 0.08, 0.8, s), lib.get('copper', tier), [0, 0.65, 0]);
    const topSphere = mesh(g.sphere(0.15, s, s), lib.get('energy', tier), [0, 1.15, 0]);
    return makeGroup(base, coil, topSphere);
  },

  lightningRod: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const rod = mesh(g.cylinder(0.02, 0.02, 2.0, s), mtl, [0, 1.0, 0]);
    const tip = mesh(g.cone(0.04, 0.15, s), lib.get('gold', tier), [0, 2.1, 0]);
    const baseRing = mesh(g.torus(0.1, 0.015, 8, s), mtl, [0, 0.1, 0], [Math.PI / 2, 0, 0]);
    return makeGroup(rod, tip, baseRing);
  },

  windVane: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const pole = mesh(g.cylinder(0.015, 0.015, 1.0, s), mtl, [0, 0.5, 0]);
    const arrow = mesh(g.cone(0.06, 0.3, 4), mtl, [0, 1.05, 0], [0, 0, Math.PI / 2]);
    return makeGroup(pole, arrow);
  },

  // -------------------------------------------------------------------
  // Hospital objects
  // -------------------------------------------------------------------
  hospitalBed: (lib, tier, g) => {
    const white = lib.get('ceramic', tier);
    const mtl = lib.get('metal', tier);
    const base = mesh(g.box(0.9, 0.3, 1.8, 1), white, [0, 0.4, 0]);
    const headboard = mesh(g.box(0.9, 0.5, 0.05, 1), mtl, [0, 0.65, -0.9]);
    const footboard = mesh(g.box(0.9, 0.3, 0.05, 1), mtl, [0, 0.5, 0.9]);
    const leg1 = mesh(g.cylinder(0.02, 0.02, 0.25, 8), mtl, [-0.4, 0.125, -0.85]);
    const leg2 = mesh(g.cylinder(0.02, 0.02, 0.25, 8), mtl, [0.4, 0.125, -0.85]);
    const leg3 = mesh(g.cylinder(0.02, 0.02, 0.25, 8), mtl, [-0.4, 0.125, 0.85]);
    const leg4 = mesh(g.cylinder(0.02, 0.02, 0.25, 8), mtl, [0.4, 0.125, 0.85]);
    return makeGroup(base, headboard, footboard, leg1, leg2, leg3, leg4);
  },

  medicalCabinet: (lib, tier, g) => {
    const white = lib.get('ceramic', tier);
    const glass = lib.get('glass', tier);
    const body = mesh(g.box(0.6, 1.2, 0.35, 1), white, [0, 0.6, 0]);
    const door = mesh(g.box(0.55, 0.9, 0.02, 1), glass, [0, 0.65, 0.18]);
    return makeGroup(body, door);
  },

  microscope: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('darkMetal', tier);
    const base = mesh(g.box(0.2, 0.04, 0.15, 1), mtl, [0, 0.02, 0]);
    const arm = mesh(g.box(0.04, 0.35, 0.04, 1), mtl, [-0.06, 0.2, 0]);
    const tube = mesh(g.cylinder(0.025, 0.025, 0.2, s), mtl, [-0.06, 0.38, 0], [0.3, 0, 0]);
    const eyepiece = mesh(g.cylinder(0.03, 0.02, 0.06, s), mtl, [-0.06, 0.48, -0.06]);
    const stage = mesh(g.box(0.12, 0.02, 0.12, 1), mtl, [0, 0.12, 0]);
    return makeGroup(base, arm, tube, eyepiece, stage);
  },

  // -------------------------------------------------------------------
  // Farm objects
  // -------------------------------------------------------------------
  fence: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const post1 = mesh(g.box(0.08, 0.6, 0.08, 1), wood, [-0.5, 0.3, 0]);
    const post2 = mesh(g.box(0.08, 0.6, 0.08, 1), wood, [0.5, 0.3, 0]);
    const rail1 = mesh(g.box(1.0, 0.06, 0.04, 1), wood, [0, 0.45, 0]);
    const rail2 = mesh(g.box(1.0, 0.06, 0.04, 1), wood, [0, 0.25, 0]);
    return makeGroup(post1, post2, rail1, rail2);
  },

  cropRow: (lib, tier, g) => {
    const s = seg(tier);
    const soil = lib.get('soil', tier);
    const leaf = lib.get('leaf', tier);
    const bed = mesh(g.box(0.4, 0.12, 2.0, 1), soil, [0, 0.06, 0]);
    const group = makeGroup(bed);
    for (let i = 0; i < 6; i++) {
      const plant = mesh(g.cone(0.05, 0.2, s), leaf, [0, 0.22, -0.75 + i * 0.3]);
      group.add(plant);
    }
    return group;
  },

  barn: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const walls = mesh(g.box(2.0, 1.5, 1.5, 1), wood, [0, 0.75, 0]);
    const roof = mesh(g.cone(1.2, 0.8, 4), lib.fromColor(0x8b0000, 0.8, 0.05), [0, 1.9, 0], [0, Math.PI / 4, 0]);
    const door = mesh(g.box(0.5, 0.8, 0.05, 1), lib.get('darkWood', tier), [0, 0.4, 0.76]);
    const group = makeGroup(walls, roof, door);
    if (tier !== 'foundation') {
      const window1 = mesh(g.box(0.25, 0.25, 0.06, 1), lib.get('glass', tier), [0.5, 1.0, 0.76]);
      group.add(window1);
    }
    return group;
  },

  wheelbarrow: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const mtl = lib.get('metal', tier);
    const bin = mesh(g.box(0.4, 0.2, 0.6, 1), wood, [0, 0.35, 0], [0.15, 0, 0]);
    const wheel = mesh(g.torus(0.1, 0.025, 8, s), mtl, [0, 0.1, -0.4], [Math.PI / 2, 0, 0]);
    const handle1 = mesh(g.cylinder(0.015, 0.015, 0.5, 6), wood, [-0.18, 0.35, 0.4], [0.5, 0, 0]);
    const handle2 = mesh(g.cylinder(0.015, 0.015, 0.5, 6), wood, [0.18, 0.35, 0.4], [0.5, 0, 0]);
    return makeGroup(bin, wheel, handle1, handle2);
  },

  scarecrow: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const fabric = lib.get('fabric', tier);
    const post = mesh(g.cylinder(0.04, 0.04, 1.5, s), wood, [0, 0.75, 0]);
    const crossbar = mesh(g.cylinder(0.03, 0.03, 1.0, s), wood, [0, 1.2, 0], [0, 0, Math.PI / 2]);
    const head = mesh(g.sphere(0.15, s, s), fabric, [0, 1.55, 0]);
    const hat = mesh(g.cone(0.18, 0.25, s), lib.fromColor(0x5c3a0a), [0, 1.75, 0]);
    return makeGroup(post, crossbar, head, hat);
  },

  // -------------------------------------------------------------------
  // Code Forge objects
  // -------------------------------------------------------------------
  terminal: (lib, tier, g) => {
    const screen = lib.get('screen', tier);
    const mtl = lib.get('darkMetal', tier);
    const monitor = mesh(g.box(0.8, 0.5, 0.05, 1), screen, [0, 0.65, 0], [0.1, 0, 0]);
    const stand = mesh(g.cylinder(0.04, 0.06, 0.3, seg(tier)), mtl, [0, 0.2, 0.05]);
    const base = mesh(g.box(0.3, 0.02, 0.2, 1), mtl, [0, 0.05, 0.05]);
    const keyboard = mesh(g.box(0.5, 0.02, 0.15, 1), lib.get('darkMetal', tier), [0, 0.36, 0.2]);
    return makeGroup(monitor, stand, base, keyboard);
  },

  serverRack: (lib, tier, g) => {
    const mtl = lib.get('darkMetal', tier);
    const frame = mesh(g.box(0.6, 1.8, 0.5, 1), mtl, [0, 0.9, 0]);
    const group = makeGroup(frame);
    for (let i = 0; i < 6; i++) {
      group.add(mesh(g.box(0.5, 0.08, 0.45, 1), lib.get('metal', tier), [0, 0.2 + i * 0.25, 0.02]));
      group.add(mesh(g.sphere(0.015, 8, 8), lib.get('neonBlue', tier), [0.22, 0.22 + i * 0.25, 0.25]));
    }
    return group;
  },

  hologramDisplay: (lib, tier, g) => {
    const s = seg(tier);
    const base = mesh(g.cylinder(0.25, 0.3, 0.08, s), lib.get('darkMetal', tier), [0, 0.04, 0]);
    const projection = mesh(g.cone(0.2, 0.5, s), lib.get('hologram', tier), [0, 0.35, 0]);
    return makeGroup(base, projection);
  },

  // -------------------------------------------------------------------
  // Space Station objects
  // -------------------------------------------------------------------
  airlock: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const frame = mesh(g.torus(0.4, 0.05, 8, s), mtl, [0, 0.5, 0]);
    const door = mesh(g.cylinder(0.38, 0.38, 0.05, s), lib.get('darkMetal', tier), [0, 0.5, 0]);
    const handle = mesh(g.torus(0.08, 0.015, 6, s), mtl, [0, 0.5, 0.04]);
    return makeGroup(frame, door, handle);
  },

  viewport: (lib, tier, g) => {
    const s = seg(tier);
    const frame = mesh(g.torus(0.5, 0.06, 8, s), lib.get('metal', tier), [0, 1.2, 0]);
    const glass = mesh(g.cylinder(0.48, 0.48, 0.03, s), lib.get('glass', tier), [0, 1.2, 0]);
    return makeGroup(frame, glass);
  },

  consolePanel: (lib, tier, g) => {
    const mtl = lib.get('darkMetal', tier);
    const body = mesh(g.box(1.2, 0.5, 0.4, 1), mtl, [0, 0.75, 0], [0.3, 0, 0]);
    const screen = mesh(g.box(0.8, 0.3, 0.02, 1), lib.get('screen', tier), [0, 0.85, 0.18]);
    const group = makeGroup(body, screen);
    for (let i = 0; i < 4; i++) {
      group.add(mesh(g.cylinder(0.02, 0.02, 0.03, 8), lib.get('neonBlue', tier),
        [-0.3 + i * 0.2, 0.62, 0.2]));
    }
    return group;
  },

  // -------------------------------------------------------------------
  // Trading Post objects
  // -------------------------------------------------------------------
  marketStall: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const canvas = lib.get('canvas', tier);
    const counter = mesh(g.box(1.5, 0.08, 0.6, 1), wood, [0, 0.8, 0]);
    const leg1 = mesh(g.box(0.06, 0.8, 0.06, 1), wood, [-0.65, 0.4, -0.25]);
    const leg2 = mesh(g.box(0.06, 0.8, 0.06, 1), wood, [0.65, 0.4, -0.25]);
    const leg3 = mesh(g.box(0.06, 0.8, 0.06, 1), wood, [-0.65, 0.4, 0.25]);
    const leg4 = mesh(g.box(0.06, 0.8, 0.06, 1), wood, [0.65, 0.4, 0.25]);
    const backPole1 = mesh(g.box(0.05, 0.8, 0.05, 1), wood, [-0.65, 1.2, -0.25]);
    const backPole2 = mesh(g.box(0.05, 0.8, 0.05, 1), wood, [0.65, 1.2, -0.25]);
    const awning = mesh(g.box(1.6, 0.03, 0.8, 1), canvas, [0, 1.6, 0.05], [0.15, 0, 0]);
    return makeGroup(counter, leg1, leg2, leg3, leg4, backPole1, backPole2, awning);
  },

  crate: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const body = mesh(g.box(0.5, 0.5, 0.5, 1), wood, [0, 0.25, 0]);
    const lid = mesh(g.box(0.55, 0.04, 0.55, 1), lib.get('darkWood', tier), [0, 0.52, 0]);
    return makeGroup(body, lid);
  },

  barrel: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const mtl = lib.get('iron', tier);
    const body = mesh(g.cylinder(0.22, 0.2, 0.6, s), wood, [0, 0.3, 0]);
    const band1 = mesh(g.torus(0.22, 0.01, 6, s), mtl, [0, 0.1, 0], [Math.PI / 2, 0, 0]);
    const band2 = mesh(g.torus(0.22, 0.01, 6, s), mtl, [0, 0.5, 0], [Math.PI / 2, 0, 0]);
    return makeGroup(body, band1, band2);
  },

  scales: (lib, tier, g) => {
    const s = seg(tier);
    const brass = lib.get('brass', tier);
    const post = mesh(g.cylinder(0.02, 0.03, 0.4, s), brass, [0, 0.2, 0]);
    const beam = mesh(g.box(0.5, 0.02, 0.03, 1), brass, [0, 0.41, 0]);
    const pan1 = mesh(g.cylinder(0.08, 0.08, 0.01, s), brass, [-0.22, 0.35, 0]);
    const pan2 = mesh(g.cylinder(0.08, 0.08, 0.01, s), brass, [0.22, 0.35, 0]);
    const base = mesh(g.cylinder(0.08, 0.1, 0.03, s), brass, [0, 0.015, 0]);
    return makeGroup(post, beam, pan1, pan2, base);
  },

  // -------------------------------------------------------------------
  // Arena objects
  // -------------------------------------------------------------------
  gameBoard: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const board = mesh(g.box(0.8, 0.04, 0.8, 1), wood, [0, 0.82, 0]);
    const legs = mesh(g.box(0.6, 0.8, 0.6, 1), wood, [0, 0.4, 0]);
    return makeGroup(board, legs);
  },

  torch: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('darkWood', tier);
    const handle = mesh(g.cylinder(0.03, 0.035, 0.6, s), wood, [0, 0.3, 0]);
    const flame = mesh(g.cone(0.06, 0.15, s), lib.get('glow', tier), [0, 0.65, 0]);
    const cup = mesh(g.cylinder(0.04, 0.03, 0.08, s), lib.get('iron', tier), [0, 0.58, 0]);
    return makeGroup(handle, flame, cup);
  },

  banner: (lib, tier, g) => {
    const fabric = lib.get('fabric', tier);
    const pole = mesh(g.cylinder(0.02, 0.02, 1.5, 8), lib.get('wood', tier), [0, 0.75, 0]);
    const cloth = mesh(g.box(0.6, 0.8, 0.02, 1), fabric, [0.32, 1.0, 0]);
    return makeGroup(pole, cloth);
  },

  // -------------------------------------------------------------------
  // Music Hall objects
  // -------------------------------------------------------------------
  piano: (lib, tier, g) => {
    const darkWood = lib.get('darkWood', tier);
    const white = lib.get('ceramic', tier);
    const body = mesh(g.box(1.5, 0.9, 0.6, 1), darkWood, [0, 0.45, 0]);
    const lid = mesh(g.box(1.5, 0.04, 0.6, 1), darkWood, [0, 0.92, 0], [0, 0, 0.2]);
    const keys = mesh(g.box(1.2, 0.02, 0.12, 1), white, [0, 0.78, 0.28]);
    const bench = mesh(g.box(0.8, 0.4, 0.3, 1), darkWood, [0, 0.2, 0.6]);
    return makeGroup(body, lid, keys, bench);
  },

  drum: (lib, tier, g) => {
    const s = seg(tier);
    const body = mesh(g.cylinder(0.2, 0.2, 0.3, s), lib.get('wood', tier), [0, 0.15, 0]);
    const head = mesh(g.cylinder(0.2, 0.2, 0.01, s), lib.get('canvas', tier), [0, 0.31, 0]);
    return makeGroup(body, head);
  },

  musicStand: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const pole = mesh(g.cylinder(0.015, 0.015, 1.0, s), mtl, [0, 0.5, 0]);
    const tray = mesh(g.box(0.4, 0.3, 0.02, 1), mtl, [0, 1.05, 0.02], [0.1, 0, 0]);
    const base1 = mesh(g.cylinder(0.01, 0.01, 0.2, 6), mtl, [-0.08, 0.02, -0.08], [0, 0, 0.2]);
    const base2 = mesh(g.cylinder(0.01, 0.01, 0.2, 6), mtl, [0.08, 0.02, -0.08], [0, 0, -0.2]);
    const base3 = mesh(g.cylinder(0.01, 0.01, 0.2, 6), mtl, [0, 0.02, 0.1], [0.2, 0, 0]);
    return makeGroup(pole, tray, base1, base2, base3);
  },

  // -------------------------------------------------------------------
  // Architect's Domain objects
  // -------------------------------------------------------------------
  draftingTable: (lib, tier, g) => {
    const wood = lib.get('lightWood', tier);
    const top = mesh(g.box(1.2, 0.05, 0.8, 1), wood, [0, 0.85, 0], [0.2, 0, 0]);
    const leg1 = mesh(g.box(0.06, 0.85, 0.06, 1), wood, [-0.5, 0.425, -0.3]);
    const leg2 = mesh(g.box(0.06, 0.85, 0.06, 1), wood, [0.5, 0.425, -0.3]);
    const leg3 = mesh(g.box(0.06, 0.7, 0.06, 1), wood, [-0.5, 0.35, 0.3]);
    const leg4 = mesh(g.box(0.06, 0.7, 0.06, 1), wood, [0.5, 0.35, 0.3]);
    return makeGroup(top, leg1, leg2, leg3, leg4);
  },

  column: (lib, tier, g) => {
    const s = seg(tier);
    const marble = lib.get('marble', tier);
    const shaft = mesh(g.cylinder(0.15, 0.15, 2.0, s), marble, [0, 1.0, 0]);
    const capTop = mesh(g.box(0.4, 0.1, 0.4, 1), marble, [0, 2.05, 0]);
    const capBot = mesh(g.box(0.4, 0.1, 0.4, 1), marble, [0, -0.05, 0]);
    return makeGroup(shaft, capTop, capBot);
  },

  compassRose: (lib, tier, g) => {
    const s = seg(tier);
    const brass = lib.get('brass', tier);
    const disc = mesh(g.cylinder(0.3, 0.3, 0.02, s), brass, [0, 0.01, 0]);
    const needle = mesh(g.cone(0.03, 0.25, 4), lib.get('glow', tier), [0, 0.15, 0]);
    return makeGroup(disc, needle);
  },

  // -------------------------------------------------------------------
  // Ancient Ruins objects
  // -------------------------------------------------------------------
  ruinedWall: (lib, tier, g) => {
    const stone = lib.get('sandstone', tier);
    const moss = lib.get('moss', tier);
    const wall = mesh(g.box(2.0, 1.5, 0.3, 1), stone, [0, 0.75, 0]);
    const topChunk = mesh(g.box(0.8, 0.4, 0.3, 1), stone, [-0.4, 1.6, 0], [0, 0, 0.05]);
    const mossClump = mesh(g.sphere(0.15, seg(tier), seg(tier)), moss, [0.3, 0.8, 0.18]);
    return makeGroup(wall, topChunk, mossClump);
  },

  obelisk: (lib, tier, g) => {
    const stone = lib.get('sandstone', tier);
    const shaft = mesh(g.box(0.3, 2.0, 0.3, 1), stone, [0, 1.0, 0]);
    const tip = mesh(g.cone(0.2, 0.4, 4), stone, [0, 2.2, 0]);
    return makeGroup(shaft, tip);
  },

  brokenPillar: (lib, tier, g) => {
    const s = seg(tier);
    const stone = lib.get('sandstone', tier);
    const base = mesh(g.cylinder(0.2, 0.22, 1.0, s), stone, [0, 0.5, 0]);
    const top = mesh(g.cylinder(0.18, 0.2, 0.2, s), stone, [0, 1.1, 0], [0, 0, 0.1]);
    return makeGroup(base, top);
  },

  // -------------------------------------------------------------------
  // Healer's Sanctuary objects
  // -------------------------------------------------------------------
  herbGarden: (lib, tier, g) => {
    const s = seg(tier);
    const soil = lib.get('soil', tier);
    const leaf = lib.get('leaf', tier);
    const bed = mesh(g.box(1.0, 0.1, 1.0, 1), soil, [0, 0.05, 0]);
    const border = mesh(g.box(1.1, 0.15, 0.06, 1), lib.get('wood', tier), [0, 0.075, -0.5]);
    const group = makeGroup(bed, border);
    for (let i = 0; i < 4; i++) {
      group.add(mesh(g.sphere(0.08, s, s), leaf, [-0.3 + i * 0.2, 0.18, -0.2 + (i % 2) * 0.3]));
    }
    return group;
  },

  mortar: (lib, tier, g) => {
    const s = seg(tier);
    const stone = lib.get('stone', tier);
    const bowl = mesh(g.cylinder(0.1, 0.12, 0.1, s), stone, [0, 0.05, 0]);
    const pestle = mesh(g.cylinder(0.02, 0.015, 0.15, s), stone, [0.03, 0.12, 0], [0, 0, 0.3]);
    return makeGroup(bowl, pestle);
  },

  healingFountain: (lib, tier, g) => {
    const s = seg(tier);
    const stone = lib.get('marble', tier);
    const basin = mesh(g.cylinder(0.5, 0.55, 0.3, s), stone, [0, 0.15, 0]);
    const water = mesh(g.cylinder(0.45, 0.45, 0.02, s), lib.get('water', tier), [0, 0.28, 0]);
    const pillar = mesh(g.cylinder(0.08, 0.08, 0.6, s), stone, [0, 0.6, 0]);
    const topBowl = mesh(g.cylinder(0.15, 0.18, 0.08, s), stone, [0, 0.92, 0]);
    return makeGroup(basin, water, pillar, topBowl);
  },

  // -------------------------------------------------------------------
  // Laboratory objects
  // -------------------------------------------------------------------
  labBench: (lib, tier, g) => {
    const top = mesh(g.box(2.0, 0.08, 0.8, 1), lib.get('ceramic', tier), [0, 0.82, 0]);
    const cab = mesh(g.box(1.8, 0.78, 0.7, 1), lib.get('metal', tier), [0, 0.39, 0]);
    return makeGroup(top, cab);
  },

  beaker: (lib, tier, g) => {
    const s = seg(tier);
    const glass = lib.get('glass', tier);
    const body = mesh(g.cylinder(0.04, 0.035, 0.12, s), glass, [0, 0.06, 0]);
    const liquid = mesh(g.cylinder(0.035, 0.03, 0.06, s), lib.get('potionGreen', tier), [0, 0.03, 0]);
    return makeGroup(body, liquid);
  },

  bunsenBurner: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('metal', tier);
    const base = mesh(g.box(0.1, 0.02, 0.1, 1), mtl, [0, 0.01, 0]);
    const tube = mesh(g.cylinder(0.02, 0.02, 0.2, s), mtl, [0, 0.12, 0]);
    const flame = mesh(g.cone(0.025, 0.08, s), lib.get('glow', tier), [0, 0.25, 0]);
    return makeGroup(base, tube, flame);
  },

  // -------------------------------------------------------------------
  // Explorer's Map objects
  // -------------------------------------------------------------------
  compass: (lib, tier, g) => {
    const s = seg(tier);
    const brass = lib.get('brass', tier);
    const body = mesh(g.cylinder(0.06, 0.06, 0.015, s), brass, [0, 0.0075, 0]);
    const lid = mesh(g.cylinder(0.06, 0.06, 0.005, s), lib.get('glass', tier), [0, 0.017, 0]);
    const needle = mesh(g.cone(0.01, 0.05, 4), lib.fromColor(0xff0000), [0, 0.02, 0]);
    return makeGroup(body, lid, needle);
  },

  globe: (lib, tier, g) => {
    const s = seg(tier);
    const sphere = mesh(g.sphere(0.25, s, s), lib.fromColor(0x4682b4, 0.5, 0.1), [0, 0.55, 0]);
    const ring = mesh(g.torus(0.27, 0.01, 6, s), lib.get('brass', tier), [0, 0.55, 0], [0.3, 0, 0]);
    const stand = mesh(g.cylinder(0.03, 0.06, 0.3, s), lib.get('darkWood', tier), [0, 0.15, 0]);
    const base = mesh(g.cylinder(0.1, 0.1, 0.03, s), lib.get('darkWood', tier), [0, 0.015, 0]);
    return makeGroup(sphere, ring, stand, base);
  },

  signpost: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const post = mesh(g.cylinder(0.04, 0.04, 1.5, 8), wood, [0, 0.75, 0]);
    const sign1 = mesh(g.box(0.5, 0.12, 0.03, 1), wood, [0.2, 1.3, 0], [0, 0.2, 0]);
    const sign2 = mesh(g.box(0.45, 0.12, 0.03, 1), wood, [0.18, 1.1, 0], [0, -0.15, 0]);
    return makeGroup(post, sign1, sign2);
  },

  // -------------------------------------------------------------------
  // Time Rift objects
  // -------------------------------------------------------------------
  hourglass: (lib, tier, g) => {
    const s = seg(tier);
    const glass = lib.get('glass', tier);
    const brass = lib.get('brass', tier);
    const topBulb = mesh(g.sphere(0.12, s, s), glass, [0, 0.3, 0]);
    const botBulb = mesh(g.sphere(0.12, s, s), glass, [0, 0.08, 0]);
    const neck = mesh(g.cylinder(0.02, 0.02, 0.06, s), glass, [0, 0.19, 0]);
    const framTop = mesh(g.cylinder(0.14, 0.14, 0.02, s), brass, [0, 0.42, 0]);
    const framBot = mesh(g.cylinder(0.14, 0.14, 0.02, s), brass, [0, -0.04, 0]);
    const sand = mesh(g.cone(0.08, 0.08, s), lib.fromColor(0xd2b48c, 0.9, 0.0), [0, 0.05, 0]);
    return makeGroup(topBulb, botBulb, neck, framTop, framBot, sand);
  },

  timeCrystal: (lib, tier, g) => {
    const s = seg(tier);
    const mat = lib.get('glowAurora', tier);
    const main = mesh(g.cone(0.1, 0.6, Math.max(5, s)), mat, [0, 0.3, 0]);
    const shard1 = mesh(g.cone(0.05, 0.3, Math.max(5, s)), mat, [0.12, 0.15, 0.08], [0, 0, 0.4]);
    const shard2 = mesh(g.cone(0.04, 0.2, Math.max(5, s)), mat, [-0.1, 0.1, -0.06], [0, 0, -0.3]);
    return makeGroup(main, shard1, shard2);
  },

  ancientClock: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('darkWood', tier);
    const brass = lib.get('brass', tier);
    const body = mesh(g.box(0.4, 0.6, 0.12, 1), wood, [0, 0.9, 0]);
    const face = mesh(g.cylinder(0.15, 0.15, 0.02, s), lib.get('parchment', tier), [0, 1.0, 0.07]);
    const hand1 = mesh(g.box(0.008, 0.12, 0.005, 1), brass, [0, 1.04, 0.08]);
    const hand2 = mesh(g.box(0.006, 0.08, 0.005, 1), brass, [0.02, 1.0, 0.08], [0, 0, -Math.PI / 3]);
    const pendulum = mesh(g.sphere(0.04, s, s), brass, [0, 0.5, 0.07]);
    return makeGroup(body, face, hand1, hand2, pendulum);
  },

  // -------------------------------------------------------------------
  // Shipyard objects
  // -------------------------------------------------------------------
  anchor: (lib, tier, g) => {
    const s = seg(tier);
    const iron = lib.get('iron', tier);
    const shank = mesh(g.cylinder(0.04, 0.04, 0.8, s), iron, [0, 0.4, 0]);
    const arm1 = mesh(g.cylinder(0.03, 0.02, 0.3, s), iron, [-0.15, 0.05, 0], [0, 0, -Math.PI / 4]);
    const arm2 = mesh(g.cylinder(0.03, 0.02, 0.3, s), iron, [0.15, 0.05, 0], [0, 0, Math.PI / 4]);
    const ring = mesh(g.torus(0.06, 0.015, 6, s), iron, [0, 0.82, 0]);
    return makeGroup(shank, arm1, arm2, ring);
  },

  sailPost: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const mast = mesh(g.cylinder(0.06, 0.06, 3.0, s), wood, [0, 1.5, 0]);
    const boom = mesh(g.cylinder(0.03, 0.03, 1.5, s), wood, [0, 2.5, 0], [0, 0, Math.PI / 2]);
    const sail = mesh(g.box(1.2, 1.5, 0.02, 1), lib.get('canvas', tier), [0.6, 1.7, 0]);
    return makeGroup(mast, boom, sail);
  },

  // -------------------------------------------------------------------
  // Digital World objects
  // -------------------------------------------------------------------
  dataNode: (lib, tier, g) => {
    const s = seg(tier);
    const core = mesh(g.sphere(0.15, s, s), lib.get('neonBlue', tier), [0, 0.5, 0]);
    const ring1 = mesh(g.torus(0.25, 0.01, 6, s), lib.get('hologram', tier), [0, 0.5, 0], [0.5, 0, 0]);
    const ring2 = mesh(g.torus(0.25, 0.01, 6, s), lib.get('hologram', tier), [0, 0.5, 0], [-0.5, Math.PI / 3, 0]);
    return makeGroup(core, ring1, ring2);
  },

  networkHub: (lib, tier, g) => {
    const base = mesh(g.box(0.4, 0.08, 0.4, 1), lib.get('darkMetal', tier), [0, 0.04, 0]);
    const group = makeGroup(base);
    for (let i = 0; i < 4; i++) {
      group.add(mesh(g.sphere(0.02, 8, 8), lib.get('neon', tier), [-0.12 + i * 0.08, 0.1, 0.15]));
    }
    return group;
  },

  // -------------------------------------------------------------------
  // Debate Hall objects
  // -------------------------------------------------------------------
  podium: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const body = mesh(g.box(0.6, 1.0, 0.4, 1), wood, [0, 0.5, 0]);
    const top = mesh(g.box(0.7, 0.04, 0.45, 1), wood, [0, 1.02, 0]);
    return makeGroup(body, top);
  },

  lectern: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const post = mesh(g.box(0.08, 1.0, 0.08, 1), wood, [0, 0.5, 0]);
    const shelf = mesh(g.box(0.5, 0.03, 0.3, 1), wood, [0, 1.0, 0.1], [0.25, 0, 0]);
    const base = mesh(g.box(0.4, 0.04, 0.4, 1), wood, [0, 0.02, 0]);
    return makeGroup(post, shelf, base);
  },

  // -------------------------------------------------------------------
  // Gallery objects
  // -------------------------------------------------------------------
  easel: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const canvas = lib.get('canvas', tier);
    const leg1 = mesh(g.cylinder(0.015, 0.015, 1.2, 6), wood, [-0.15, 0.6, -0.1], [0.1, 0, 0]);
    const leg2 = mesh(g.cylinder(0.015, 0.015, 1.2, 6), wood, [0.15, 0.6, -0.1], [0.1, 0, 0]);
    const leg3 = mesh(g.cylinder(0.015, 0.015, 1.0, 6), wood, [0, 0.5, 0.2], [-0.2, 0, 0]);
    const shelf = mesh(g.box(0.4, 0.02, 0.06, 1), wood, [0, 0.55, -0.08]);
    const painting = mesh(g.box(0.5, 0.6, 0.02, 1), canvas, [0, 0.9, -0.1], [0.1, 0, 0]);
    return makeGroup(leg1, leg2, leg3, shelf, painting);
  },

  statue: (lib, tier, g) => {
    const s = seg(tier);
    const marble = lib.get('marble', tier);
    const base = mesh(g.box(0.4, 0.15, 0.4, 1), marble, [0, 0.075, 0]);
    const body = mesh(g.cylinder(0.12, 0.1, 0.8, s), marble, [0, 0.55, 0]);
    const head = mesh(g.sphere(0.1, s, s), marble, [0, 1.0, 0]);
    return makeGroup(base, body, head);
  },

  paintingFrame: (lib, tier, g) => {
    const gold = lib.get('gold', tier);
    const frame = mesh(g.box(0.8, 0.6, 0.04, 1), gold, [0, 1.0, 0]);
    const canvas = mesh(g.box(0.7, 0.5, 0.02, 1), lib.get('canvas', tier), [0, 1.0, 0.02]);
    return makeGroup(frame, canvas);
  },

  // -------------------------------------------------------------------
  // Newsroom objects
  // -------------------------------------------------------------------
  printingPress: (lib, tier, g) => {
    const mtl = lib.get('darkMetal', tier);
    const body = mesh(g.box(1.0, 0.8, 0.6, 1), mtl, [0, 0.4, 0]);
    const roller = mesh(g.cylinder(0.1, 0.1, 0.8, seg(tier)), mtl, [0, 0.85, 0], [0, 0, Math.PI / 2]);
    const paper = mesh(g.box(0.6, 0.01, 0.4, 1), lib.get('paper', tier), [0, 0.82, 0.2]);
    return makeGroup(body, roller, paper);
  },

  camera: (lib, tier, g) => {
    const s = seg(tier);
    const body = mesh(g.box(0.2, 0.14, 0.1, 1), lib.get('darkMetal', tier), [0, 0.07, 0]);
    const lens = mesh(g.cylinder(0.03, 0.04, 0.06, s), lib.get('metal', tier), [0, 0.07, 0.08]);
    const flash = mesh(g.box(0.06, 0.04, 0.02, 1), lib.get('ceramic', tier), [0.08, 0.14, 0]);
    return makeGroup(body, lens, flash);
  },

  // -------------------------------------------------------------------
  // Theater objects
  // -------------------------------------------------------------------
  curtain: (lib, tier, g) => {
    const fabric = lib.fromColor(0x8b0000, 0.9, 0.0);
    const rod = mesh(g.cylinder(0.02, 0.02, 3.0, 8), lib.get('brass', tier), [0, 2.8, 0], [0, 0, Math.PI / 2]);
    const left = mesh(g.box(1.2, 2.5, 0.05, 1), fabric, [-0.9, 1.4, 0]);
    const right = mesh(g.box(1.2, 2.5, 0.05, 1), fabric, [0.9, 1.4, 0]);
    return makeGroup(rod, left, right);
  },

  spotlight: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('darkMetal', tier);
    const housing = mesh(g.cylinder(0.08, 0.06, 0.15, s), mtl, [0, 0, 0], [Math.PI / 4, 0, 0]);
    const lens = mesh(g.cylinder(0.07, 0.07, 0.01, s), lib.get('glass', tier), [0, -0.06, -0.06]);
    return makeGroup(housing, lens);
  },

  stageFloor: (lib, tier, g) => {
    const wood = lib.get('darkWood', tier);
    const floor = mesh(g.box(4.0, 0.1, 3.0, 1), wood, [0, 0.05, 0]);
    return makeGroup(floor);
  },

  // -------------------------------------------------------------------
  // Marketplace objects
  // -------------------------------------------------------------------
  coinPile: (lib, tier, g) => {
    const s = seg(tier);
    const gold = lib.get('gold', tier);
    const group = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      group.add(mesh(g.cylinder(0.04, 0.04, 0.01, s), gold,
        [(Math.random() - 0.5) * 0.1, 0.005 + i * 0.01, (Math.random() - 0.5) * 0.1]));
    }
    return group;
  },

  wagon: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const body = mesh(g.box(1.0, 0.4, 0.6, 1), wood, [0, 0.5, 0]);
    const wheel1 = mesh(g.torus(0.15, 0.03, 6, s), lib.get('iron', tier), [-0.55, 0.2, 0.3], [Math.PI / 2, 0, 0]);
    const wheel2 = mesh(g.torus(0.15, 0.03, 6, s), lib.get('iron', tier), [-0.55, 0.2, -0.3], [Math.PI / 2, 0, 0]);
    const wheel3 = mesh(g.torus(0.15, 0.03, 6, s), lib.get('iron', tier), [0.55, 0.2, 0.3], [Math.PI / 2, 0, 0]);
    const wheel4 = mesh(g.torus(0.15, 0.03, 6, s), lib.get('iron', tier), [0.55, 0.2, -0.3], [Math.PI / 2, 0, 0]);
    return makeGroup(body, wheel1, wheel2, wheel3, wheel4);
  },

  // -------------------------------------------------------------------
  // Shared / generic utility objects
  // -------------------------------------------------------------------
  chest: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const mtl = lib.get('iron', tier);
    const body = mesh(g.box(0.6, 0.35, 0.4, 1), wood, [0, 0.175, 0]);
    const lid = mesh(g.box(0.6, 0.08, 0.4, 1), wood, [0, 0.39, 0]);
    const latch = mesh(g.box(0.06, 0.06, 0.04, 1), mtl, [0, 0.35, 0.21]);
    return makeGroup(body, lid, latch);
  },

  ladder: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const rail1 = mesh(g.box(0.04, 2.0, 0.04, 1), wood, [-0.2, 1.0, 0]);
    const rail2 = mesh(g.box(0.04, 2.0, 0.04, 1), wood, [0.2, 1.0, 0]);
    const group = makeGroup(rail1, rail2);
    for (let i = 0; i < 6; i++) {
      group.add(mesh(g.box(0.36, 0.03, 0.04, 1), wood, [0, 0.2 + i * 0.3, 0]));
    }
    return group;
  },

  lantern: (lib, tier, g) => {
    const s = seg(tier);
    const mtl = lib.get('iron', tier);
    const frame = mesh(g.box(0.1, 0.18, 0.1, 1), mtl, [0, 0.09, 0]);
    const glass = mesh(g.box(0.07, 0.12, 0.07, 1), lib.get('glass', tier), [0, 0.1, 0]);
    const flame = mesh(g.sphere(0.02, 6, 6), lib.get('glow', tier), [0, 0.1, 0]);
    const hook = mesh(g.torus(0.025, 0.005, 4, s), mtl, [0, 0.2, 0]);
    return makeGroup(frame, glass, flame, hook);
  },

  chair: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const seat = mesh(g.box(0.4, 0.04, 0.4, 1), wood, [0, 0.42, 0]);
    const back = mesh(g.box(0.4, 0.45, 0.04, 1), wood, [0, 0.67, -0.18]);
    const leg1 = mesh(g.box(0.04, 0.42, 0.04, 1), wood, [-0.16, 0.21, -0.16]);
    const leg2 = mesh(g.box(0.04, 0.42, 0.04, 1), wood, [0.16, 0.21, -0.16]);
    const leg3 = mesh(g.box(0.04, 0.42, 0.04, 1), wood, [-0.16, 0.21, 0.16]);
    const leg4 = mesh(g.box(0.04, 0.42, 0.04, 1), wood, [0.16, 0.21, 0.16]);
    return makeGroup(seat, back, leg1, leg2, leg3, leg4);
  },

  table: (lib, tier, g) => {
    const wood = lib.get('wood', tier);
    const top = mesh(g.box(1.0, 0.06, 0.6, 1), wood, [0, 0.72, 0]);
    const leg1 = mesh(g.box(0.06, 0.72, 0.06, 1), wood, [-0.42, 0.36, -0.22]);
    const leg2 = mesh(g.box(0.06, 0.72, 0.06, 1), wood, [0.42, 0.36, -0.22]);
    const leg3 = mesh(g.box(0.06, 0.72, 0.06, 1), wood, [-0.42, 0.36, 0.22]);
    const leg4 = mesh(g.box(0.06, 0.72, 0.06, 1), wood, [0.42, 0.36, 0.22]);
    return makeGroup(top, leg1, leg2, leg3, leg4);
  },

  wellBucket: (lib, tier, g) => {
    const s = seg(tier);
    const wood = lib.get('wood', tier);
    const bucket = mesh(g.cylinder(0.1, 0.08, 0.15, s), wood, [0, 0.075, 0]);
    const handle = mesh(g.torus(0.06, 0.008, 4, s), lib.get('iron', tier), [0, 0.16, 0]);
    return makeGroup(bucket, handle);
  },
};

// Public list of all known procedural object types
export const PROCEDURAL_OBJECT_TYPES: readonly string[] = Object.keys(GENERATORS);
