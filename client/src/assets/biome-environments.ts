import * as THREE from 'three';
import type { MasteryTier } from '@nexus-academy/core';
import { MaterialLibrary, BIOME_PALETTES } from './materials.js';
import { hasGenerator, ProceduralModelGenerator } from './procedural-models.js';
import { loadCachedWorldModel } from './world-models.js';

// ---------------------------------------------------------------------------
// BiomeEnvironmentGenerator — produces a full 3D environment for each biome
// ---------------------------------------------------------------------------

export interface BiomeEnvironmentConfig {
  /** Reduce decorations for lower-end devices */
  reducedDetail?: boolean;
  /** Skip animated decorations (accessibility: reduced motion) */
  reducedMotion?: boolean;
}

export interface PropPlacement {
  type: string;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
}

export class BiomeEnvironmentGenerator {
  private readonly lib: MaterialLibrary;
  private readonly models: ProceduralModelGenerator;

  constructor(lib: MaterialLibrary, models: ProceduralModelGenerator) {
    this.lib = lib;
    this.models = models;
  }

  generate(
    biomeId: string,
    tier: MasteryTier,
    config: BiomeEnvironmentConfig = {},
  ): THREE.Group {
    const palette = BIOME_PALETTES[biomeId];
    if (!palette) return new THREE.Group();

    const group = new THREE.Group();
    group.name = `biome:${biomeId}`;

    // Ground plane
    const ground = this.makeGround(palette, tier);
    group.add(ground);

    this.addStructuralEnvironment(group, biomeId, palette, tier);

    // Biome-specific ambient props
    const layout = BIOME_LAYOUTS[biomeId];
    if (layout) {
      const propCount = config.reducedDetail ? Math.ceil(layout.length / 2) : layout.length;
      for (let i = 0; i < propCount; i++) {
        const prop = layout[i]!;
        const model = createBiomePropModel(prop, tier, this.models);
        model.name = `${biomeId}:${prop.type}:${i}`;
        model.userData.biomePropIndex = i;
        group.add(model);
      }
    }

    return group;
  }

  /** Build the biome's ground plane with biome-appropriate color. */
  private makeGround(palette: { ground: number }, tier: MasteryTier): THREE.Mesh {
    const s = tier === 'foundation' ? 32 : 64;
    const size = tier === 'foundation' ? 34 : 46;
    const geom = new THREE.PlaneGeometry(size, size, s, s);
    const mat = this.lib.fromColor(palette.ground, 0.9, 0.0);
    const m = new THREE.Mesh(geom, mat);
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    m.name = 'biome-ground';
    return m;
  }

  private addStructuralEnvironment(
    group: THREE.Group,
    biomeId: string,
    palette: { dominant: number; accent1: number; accent2: number; shadow: number; ground: number },
    tier: MasteryTier,
  ): void {
    if (biomeId === 'crystal-caverns') this.addCrystalCavernShell(group, palette, tier);
    if (biomeId === 'living-forest') this.addLivingForestShell(group, palette, tier);
    if (biomeId === 'farm') this.addFarmStructure(group, palette);
  }

  private addCrystalCavernShell(
    group: THREE.Group,
    palette: { accent1: number; accent2: number; shadow: number },
    tier: MasteryTier,
  ): void {
    const shell = new THREE.Group();
    shell.name = 'crystal-caverns:constructed-shell';

    const wallMat = this.lib.fromColor(palette.shadow, 0.95, 0.05).clone();
    wallMat.side = THREE.DoubleSide;
    const backWall = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 13, 5.2, tier === 'foundation' ? 24 : 36, 1, true, Math.PI / 2, Math.PI),
      wallMat,
    );
    backWall.name = 'crystal-caverns:curved-cave-wall';
    backWall.position.set(0, 2.6, -0.5);
    backWall.receiveShadow = true;
    shell.add(backWall);

    const ceilingMat = this.lib.fromColor(0x211533, 0.92, 0.05);
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 13, 1, 1, 1), ceilingMat);
    ceiling.name = 'crystal-caverns:low-stone-ceiling';
    ceiling.position.set(0, 4.75, -3.2);
    ceiling.rotation.x = -0.08;
    ceiling.receiveShadow = true;
    shell.add(ceiling);

    const ridgeMat = this.lib.fromColor(0x2c223a, 0.9, 0.04);
    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.55 + (i % 3) * 0.16, 1.3 + (i % 4) * 0.25, 7), ridgeMat);
      ridge.name = 'crystal-caverns:wall-ridge';
      ridge.position.set(side * (7.4 + (i % 3) * 1.1), 0.65, -5.9 + i * 0.65);
      ridge.rotation.z = side * 0.2;
      ridge.castShadow = true;
      ridge.receiveShadow = true;
      shell.add(ridge);
    }

    const glowMat = this.lib.fromColor(palette.accent1, 0.2, 0.2).clone();
    glowMat.emissive = new THREE.Color(palette.accent1);
    glowMat.emissiveIntensity = 0.45;
    const veinGeom = new THREE.BoxGeometry(0.05, 0.035, 3.8);
    for (let i = 0; i < 6; i++) {
      const vein = new THREE.Mesh(veinGeom, glowMat);
      vein.name = 'crystal-caverns:glowing-wall-vein';
      vein.position.set(-5.8 + i * 2.25, 2.2 + (i % 2) * 0.7, -10.9);
      vein.rotation.z = -0.65 + i * 0.18;
      shell.add(vein);
    }

    const poolMat = this.lib.fromColor(palette.accent2, 0.1, 0.05).clone();
    poolMat.transparent = true;
    poolMat.opacity = 0.5;
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.1, tier === 'foundation' ? 18 : 30), poolMat);
    pool.name = 'crystal-caverns:glowing-reflection-pool';
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(-2.6, 0.025, 1.5);
    shell.add(pool);

    const pathMat = this.lib.fromColor(0x39264f, 0.88, 0.06);
    for (let i = 0; i < 6; i++) {
      const steppingStone = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.08, tier === 'foundation' ? 8 : 14), pathMat);
      steppingStone.name = 'crystal-caverns:center-stepping-stone';
      steppingStone.position.set((i % 2 === 0 ? -0.35 : 0.35), 0.05, 2.2 - i * 1.35);
      steppingStone.scale.set(1.2, 1, 0.62);
      steppingStone.castShadow = true;
      steppingStone.receiveShadow = true;
      shell.add(steppingStone);
    }

    const clusterColors = [palette.accent1, palette.accent2, 0xffbf00];
    for (let i = 0; i < 9; i++) {
      const color = clusterColors[i % clusterColors.length]!;
      const mat = this.lib.fromColor(color, 0.12, 0.25).clone();
      mat.emissive = new THREE.Color(color);
      mat.emissiveIntensity = 0.35;
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.16 + (i % 3) * 0.04, 0.75 + (i % 4) * 0.18, tier === 'foundation' ? 6 : 10),
        mat,
      );
      shard.name = 'crystal-caverns:center-crystal-garden';
      shard.position.set(-2.6 + (i % 5) * 1.3, 0.38 + (i % 4) * 0.09, -2.2 - Math.floor(i / 5) * 1.6);
      shard.rotation.z = -0.22 + i * 0.06;
      shard.castShadow = true;
      shard.receiveShadow = true;
      shell.add(shard);
    }

    const glow = new THREE.PointLight(palette.accent1, 1.2, 12);
    glow.name = 'crystal-caverns:center-crystal-light';
    glow.position.set(0, 1.25, -2.6);
    shell.add(glow);

    group.add(shell);
  }

  private addLivingForestShell(
    group: THREE.Group,
    palette: { dominant: number; accent1: number; shadow: number; ground: number },
    tier: MasteryTier,
  ): void {
    const shell = new THREE.Group();
    shell.name = 'living-forest:constructed-shell';

    const trunkMat = this.lib.fromColor(0x5b351e, 0.88, 0.0);
    const leafMat = this.lib.fromColor(palette.dominant, 0.72, 0.0);
    const darkLeafMat = this.lib.fromColor(palette.shadow, 0.78, 0.0);
    const segments = tier === 'foundation' ? 8 : 12;
    const perimeter: Array<[number, number, number]> = [
      [-8.4, -7.8, 1.2],
      [-5.8, -8.9, 1.4],
      [-2.6, -9.5, 1.15],
      [2.6, -9.4, 1.3],
      [5.7, -8.8, 1.2],
      [8.4, -7.6, 1.35],
      [-9.4, -3.4, 1.05],
      [9.3, -3.2, 1.1],
      [-8.8, 2.4, 0.95],
      [8.8, 2.3, 1.0],
    ];

    perimeter.forEach(([x, z, scale], index) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 2.8 * scale, segments), trunkMat);
      trunk.name = 'living-forest:perimeter-trunk';
      trunk.position.set(x, 1.4 * scale, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      shell.add(trunk);

      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.05 * scale, segments, segments), index % 2 === 0 ? leafMat : darkLeafMat);
      crown.name = 'living-forest:overhead-canopy';
      crown.position.set(x, 3.0 * scale, z);
      crown.scale.set(1.35, 0.72, 1.05);
      crown.castShadow = true;
      crown.receiveShadow = true;
      shell.add(crown);
    });

    const pathMat = this.lib.fromColor(0xb58b55, 0.95, 0.0);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 10, 8, 8), pathMat);
    path.name = 'living-forest:leafy-path';
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.03, -1.4);
    shell.add(path);

    const mossMat = this.lib.fromColor(palette.ground, 0.98, 0.0);
    for (let i = 0; i < 8; i++) {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.65 + (i % 3) * 0.16, segments, segments), mossMat);
      mound.name = 'living-forest:mossy-terrain-mound';
      mound.position.set(-6.4 + i * 1.8, 0.08, i % 2 === 0 ? -5.5 : 4.8);
      mound.scale.set(1.6, 0.18, 0.9);
      mound.receiveShadow = true;
      shell.add(mound);
    }

    const backdropTrunkMat = this.lib.fromColor(0x3d2415, 0.95, 0.0);
    const backdropLeafMat = this.lib.fromColor(0x064f16, 0.78, 0.0);
    for (let i = 0; i < 13; i++) {
      const x = -9 + i * 1.5;
      const z = -10.2 - (i % 2) * 0.35;
      const height = 2.6 + (i % 4) * 0.22;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, height, segments), backdropTrunkMat);
      trunk.name = 'living-forest:backdrop-tree-trunk';
      trunk.position.set(x, height / 2, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      shell.add(trunk);

      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.78 + (i % 3) * 0.1, segments, segments), backdropLeafMat);
      crown.name = 'living-forest:backdrop-tree-crown';
      crown.position.set(x, height + 0.35, z);
      crown.scale.set(1.15, 0.85, 1.0);
      crown.castShadow = true;
      crown.receiveShadow = true;
      shell.add(crown);
    }

    const hedge = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.45), this.lib.fromColor(0x052e12, 0.9, 0.0));
    hedge.name = 'living-forest:distant-hedge-line';
    hedge.position.set(0, 0.62, -9.7);
    hedge.castShadow = true;
    hedge.receiveShadow = true;
    shell.add(hedge);

    group.add(shell);
  }

  private addFarmStructure(
    group: THREE.Group,
    palette: { accent1: number; ground: number },
  ): void {
    const shell = new THREE.Group();
    shell.name = 'farm:constructed-shell';

    const soilMat = this.lib.fromColor(0x5a341f, 0.98, 0.0);
    const cropMat = this.lib.fromColor(palette.accent1, 0.84, 0.0);
    const waterMat = this.lib.fromColor(0x4169e1, 0.08, 0.05).clone();
    waterMat.transparent = true;
    waterMat.opacity = 0.55;

    for (let row = 0; row < 5; row++) {
      const x = -4.8 + row * 1.15;
      const furrow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 6.4), soilMat);
      furrow.name = 'farm:planted-furrow';
      furrow.position.set(x, 0.045, 1.6);
      furrow.receiveShadow = true;
      shell.add(furrow);

      const crops = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 5.7), cropMat);
      crops.name = 'farm:continuous-crop-row';
      crops.position.set(x, 0.21, 1.6);
      crops.castShadow = true;
      crops.receiveShadow = true;
      shell.add(crops);
    }

    const irrigation = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 7.1), waterMat);
    irrigation.name = 'farm:irrigation-channel';
    irrigation.position.set(1.0, 0.06, 1.5);
    shell.add(irrigation);

    const fenceMat = this.lib.fromColor(0x8b5a2b, 0.88, 0.0);
    const rails: Array<[number, number, number, number, number, number]> = [
      [0, 0.65, -7.0, 12.5, 0.12, 0.12],
      [-7.0, 0.65, -1.0, 0.12, 0.12, 11.5],
      [7.0, 0.65, -1.0, 0.12, 0.12, 11.5],
    ];
    rails.forEach(([x, y, z, sx, sy, sz]) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), fenceMat);
      rail.name = 'farm:perimeter-fence-rail';
      rail.position.set(x, y, z);
      rail.castShadow = true;
      rail.receiveShadow = true;
      shell.add(rail);
    });

    const yardMat = this.lib.fromColor(palette.ground, 0.95, 0.0);
    const yard = new THREE.Mesh(new THREE.CircleGeometry(3.6, 28), yardMat);
    yard.name = 'farm:barnyard-packed-earth';
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(0, 0.035, -5.2);
    shell.add(yard);

    const barnMat = this.lib.fromColor(0x8f1f1f, 0.72, 0.02);
    const trimMat = this.lib.fromColor(0xf5deb3, 0.78, 0.0);
    const roofMat = this.lib.fromColor(0x4a1e16, 0.85, 0.0);
    const barn = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 0.32), barnMat);
    barn.name = 'farm:backdrop-barn-wall';
    barn.position.set(0, 1.2, -8.2);
    barn.castShadow = true;
    barn.receiveShadow = true;
    shell.add(barn);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.75, 1.05, 4), roofMat);
    roof.name = 'farm:backdrop-barn-roof';
    roof.position.set(0, 2.75, -8.2);
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.32;
    roof.castShadow = true;
    roof.receiveShadow = true;
    shell.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.35, 0.05), trimMat);
    door.name = 'farm:backdrop-barn-door';
    door.position.set(0, 0.78, -8.0);
    shell.add(door);
    for (const x of [-1.4, 1.4]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), trimMat);
      window.name = 'farm:backdrop-barn-window';
      window.position.set(x, 1.55, -7.98);
      shell.add(window);
    }

    group.add(shell);
  }
}

export function getBiomeLayout(biomeId: string): readonly PropPlacement[] {
  return BIOME_LAYOUTS[biomeId] ?? [];
}

export function createBiomePropModel(
  prop: PropPlacement,
  tier: MasteryTier,
  models: ProceduralModelGenerator,
): THREE.Group {
  const model = hasGenerator(prop.type)
    ? models.generate(prop.type, tier)
    : loadCachedWorldModel(prop.type) ?? models.generate(prop.type, tier);
  model.userData.biomePropType = prop.type;
  model.position.set(...prop.pos);
  if (prop.rot) model.rotation.set(...prop.rot);
  if (prop.scale) model.scale.multiply(new THREE.Vector3(...prop.scale));
  return model;
}

// ---------------------------------------------------------------------------
// Per-biome prop layouts — gives every biome a distinct visual identity
// ---------------------------------------------------------------------------

const BIOME_LAYOUTS: Record<string, PropPlacement[]> = {
  'workshop': [
    { type: 'workbench', pos: [0, 0, -3] },
    { type: 'anvil', pos: [3, 0, -2] },
    { type: 'toolRack', pos: [-3, 0, -4], rot: [0, Math.PI / 2, 0] },
    { type: 'barrel', pos: [4, 0, 1] },
    { type: 'chest', pos: [-4, 0, 0] },
    { type: 'gear', pos: [-2, 1.5, -4.5], rot: [0, 0, 0], scale: [2, 2, 2] },
    { type: 'gear', pos: [2, 1.8, -4.5], rot: [0, 0, 0.3], scale: [1.5, 1.5, 1.5] },
    { type: 'lantern', pos: [-1, 1.2, -3] },
    { type: 'hammer', pos: [1, 0.93, -3], rot: [0, 0, Math.PI / 4] },
    { type: 'ladder', pos: [5, 0, -3], rot: [0, 0, 0.15] },
    { type: 'crate', pos: [-5, 0, 2] },
    { type: 'crate', pos: [-4.5, 0, 2.5] },
  ],

  'observatory': [
    { type: 'telescope', pos: [0, 0, -2] },
    { type: 'orrery', pos: [3, 0.8, -1], scale: [1.5, 1.5, 1.5] },
    { type: 'starMap', pos: [-3, 0, -4], rot: [0, 0, 0] },
    { type: 'bookshelf', pos: [-5, 0, -3] },
    { type: 'candle', pos: [-2, 0.75, -3], scale: [2, 2, 2] },
    { type: 'readingDesk', pos: [4, 0, -3] },
    { type: 'globe', pos: [4, 0.75, -2.8] },
    { type: 'chair', pos: [4, 0, -2] },
  ],

  'alchemist-lab': [
    { type: 'cauldron', pos: [0, 0, -2], scale: [1.5, 1.5, 1.5] },
    { type: 'alchemyTable', pos: [-3, 0, -3] },
    { type: 'potionBottle', pos: [-2.8, 0.9, -3] },
    { type: 'potionBottle', pos: [-2.5, 0.9, -3.1] },
    { type: 'potionBottle', pos: [-3.2, 0.9, -2.8] },
    { type: 'bookshelf', pos: [4, 0, -4] },
    { type: 'candle', pos: [-1, 0.9, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'candle', pos: [1, 0.9, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'mortar', pos: [-3.5, 0.9, -3] },
    { type: 'chest', pos: [3, 0, 0] },
  ],

  'crystal-caverns': [
    { type: 'crystal', pos: [2, 0, -3] },
    { type: 'crystal', pos: [-3, 0, -2], scale: [1.5, 1.5, 1.5] },
    { type: 'crystalCluster', pos: [0, 0, -4] },
    { type: 'crystalCluster', pos: [-5, 0, -1] },
    { type: 'crystalCluster', pos: [5, 0, 0] },
    { type: 'stalactite', pos: [-1, 4, -3] },
    { type: 'stalactite', pos: [3, 3.5, -2] },
    { type: 'stalactite', pos: [-4, 4.2, 1] },
    { type: 'rock', pos: [4, 0, -4] },
    { type: 'rock', pos: [-2, 0, 2] },
  ],

  'living-forest': [
    { type: 'tree', pos: [-5.8, 0, -6.4], scale: [1.25, 1.25, 1.25] },
    { type: 'tree', pos: [4.8, 0, -6.2], scale: [1.15, 1.15, 1.15] },
    { type: 'treePine', pos: [-7.2, 0, -2.6], scale: [1.05, 1.05, 1.05] },
    { type: 'treePine', pos: [7.0, 0, -3.8], scale: [1.1, 1.1, 1.1] },
    { type: 'ancientTree', pos: [-4.6, 0, -4.6], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [-3.2, 0, -1.6], scale: [1.2, 1.2, 1.2] },
    { type: 'bush', pos: [2.6, 0, -1.4], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [-5.8, 0, 1.2] },
    { type: 'bush', pos: [5.7, 0, 1.0] },
    { type: 'mushroomRing', pos: [1.1, 0, -3.3], scale: [0.9, 0.9, 0.9] },
    { type: 'mushroom', pos: [-0.8, 0, -4.0], scale: [1.3, 1.3, 1.3] },
    { type: 'log', pos: [-0.8, 0, 0.9], rot: [0, 0.5, 0], scale: [1.4, 1.4, 1.4] },
    { type: 'rock', pos: [-3.5, 0, 1.2] },
    { type: 'rock', pos: [4.8, 0, 3.8], scale: [0.8, 0.8, 0.8] },
    { type: 'pond', pos: [3.3, 0, 2.2], scale: [1.35, 1, 1.15] },

    { type: 'food-basket', pos: [-2.4, 0, -0.4], rot: [0, -0.25, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'carrot', pos: [-2.0, 0, -0.15], rot: [0, 0.4, 0], scale: [0.75, 0.75, 0.75] },
    { type: 'sunflower-seeds', pos: [-2.55, 0, -0.1], rot: [0, -0.2, 0] },
    { type: 'acorn', pos: [-2.85, 0, -0.2], scale: [1.2, 1.2, 1.2] },
    { type: 'fresh-leaves', pos: [-2.25, 0, -0.75], scale: [1.1, 1.1, 1.1] },
    { type: 'rabbit', pos: [-4.25, 0, -0.85], rot: [0, -0.2, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'bird', pos: [-1.0, 1.55, -4.6], rot: [0, 0.4, 0], scale: [1.25, 1.25, 1.25] },
    { type: 'squirrel', pos: [-5.0, 0.55, -4.2], rot: [0, 0.6, 0], scale: [1.15, 1.15, 1.15] },
    { type: 'deer', pos: [5.4, 0, 1.6], rot: [0, -0.45, 0], scale: [1.15, 1.15, 1.15] },
    { type: 'fresh-leaves', pos: [5.0, 0.5, 1.0], rot: [0, -0.4, 0], scale: [1.25, 1.25, 1.25] },

    { type: 'garden-plot', pos: [-1.5, 0, 3.7], rot: [0, 0.15, 0], scale: [1.35, 1.2, 1.35] },
    { type: 'watering-can', pos: [-3.0, 0, 3.25], rot: [0, -0.5, 0], scale: [1.8, 1.8, 1.8] },
    { type: 'roots', pos: [-1.85, 0.06, 3.7], scale: [1.3, 1.3, 1.3] },
    { type: 'plant-stem', pos: [-1.45, 0.06, 3.65], scale: [1.2, 1.2, 1.2] },
    { type: 'fresh-leaves', pos: [-1.2, 0.45, 3.65], rot: [0, 0.3, 0], scale: [1.1, 1.1, 1.1] },
    { type: 'flower', pos: [-0.95, 0.08, 3.6], scale: [1.8, 1.8, 1.8] },

    { type: 'flower', pos: [-5.6, 0, 3.0], scale: [1.7, 1.7, 1.7] },
    { type: 'flower', pos: [-5.0, 0, 3.5], scale: [1.4, 1.4, 1.4] },
    { type: 'flower', pos: [-4.4, 0, 2.8], scale: [1.5, 1.5, 1.5] },
    { type: 'red-butterfly', pos: [-5.4, 0.55, 3.0], rot: [0, 0.3, 0], scale: [1.6, 1.6, 1.6] },
    { type: 'red-butterfly', pos: [-4.85, 0.75, 3.45], rot: [0, -0.2, 0], scale: [1.35, 1.35, 1.35] },
    { type: 'red-butterfly', pos: [-4.3, 0.6, 2.75], rot: [0, 0.5, 0], scale: [1.45, 1.45, 1.45] },
    { type: 'flower', pos: [4.7, 0, 4.7], scale: [1.5, 1.5, 1.5] },
    { type: 'flower', pos: [5.4, 0, 4.1], scale: [1.6, 1.6, 1.6] },
    { type: 'flower', pos: [6.0, 0, 4.9], scale: [1.4, 1.4, 1.4] },
    { type: 'blue-butterfly', pos: [4.65, 0.75, 4.65], rot: [0, -0.2, 0], scale: [1.45, 1.45, 1.45] },
    { type: 'blue-butterfly', pos: [5.35, 0.55, 4.0], rot: [0, 0.35, 0], scale: [1.55, 1.55, 1.55] },
    { type: 'blue-butterfly', pos: [6.05, 0.7, 4.9], rot: [0, -0.45, 0], scale: [1.35, 1.35, 1.35] },
    { type: 'blue-butterfly', pos: [5.65, 0.95, 4.55], rot: [0, 0.15, 0], scale: [1.25, 1.25, 1.25] },
  ],

  'library-echoes': [
    { type: 'bookshelf', pos: [-4, 0, -4] },
    { type: 'bookshelf', pos: [-2, 0, -4] },
    { type: 'bookshelf', pos: [0, 0, -4] },
    { type: 'bookshelf', pos: [2, 0, -4] },
    { type: 'bookshelf', pos: [4, 0, -4] },
    { type: 'readingDesk', pos: [0, 0, -1] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'candle', pos: [0, 0.75, -1], scale: [1.5, 1.5, 1.5] },
    { type: 'candle', pos: [-3, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [3, 0, -2], scale: [2, 2, 2] },
    { type: 'scrollRack', pos: [5, 0, -2] },
    { type: 'ladder', pos: [-5, 0, -3.5] },
  ],

  'ancient-ruins': [
    { type: 'ruinedWall', pos: [-3, 0, -4] },
    { type: 'ruinedWall', pos: [3, 0, -5], rot: [0, 0.4, 0] },
    { type: 'obelisk', pos: [0, 0, -3] },
    { type: 'brokenPillar', pos: [-5, 0, -2] },
    { type: 'brokenPillar', pos: [5, 0, -1] },
    { type: 'brokenPillar', pos: [-2, 0, 0] },
    { type: 'rock', pos: [2, 0, -1] },
    { type: 'rock', pos: [-4, 0, 1] },
    { type: 'bush', pos: [4, 0, 0] },
  ],

  'trading-post': [
    { type: 'marketStall', pos: [-3, 0, -3] },
    { type: 'marketStall', pos: [3, 0, -3] },
    { type: 'barrel', pos: [-5, 0, -1] },
    { type: 'barrel', pos: [-4.5, 0, -0.5] },
    { type: 'crate', pos: [5, 0, -1] },
    { type: 'crate', pos: [5.5, 0, 0] },
    { type: 'scales', pos: [0, 0.8, -3] },
    { type: 'lantern', pos: [-3, 1.8, -3] },
    { type: 'lantern', pos: [3, 1.8, -3] },
    { type: 'wagon', pos: [6, 0, 3] },
    { type: 'signpost', pos: [0, 0, 1] },
  ],

  'storm-tower': [
    { type: 'teslaCoil', pos: [0, 0, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'teslaCoil', pos: [-3, 0, -1] },
    { type: 'lightningRod', pos: [3, 0, -4] },
    { type: 'windVane', pos: [-4, 0, -3] },
    { type: 'consolePanel', pos: [2, 0, -2] },
    { type: 'terminal', pos: [-2, 0, -1] },
    { type: 'barrel', pos: [5, 0, 0] },
  ],

  'code-forge': [
    { type: 'terminal', pos: [0, 0, -2] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'terminal', pos: [3, 0, -2] },
    { type: 'serverRack', pos: [-5, 0, -4] },
    { type: 'serverRack', pos: [5, 0, -4] },
    { type: 'hologramDisplay', pos: [0, 0, -4] },
    { type: 'dataNode', pos: [-2, 0, 0], scale: [0.8, 0.8, 0.8] },
    { type: 'dataNode', pos: [2, 0, 0], scale: [0.8, 0.8, 0.8] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'chair', pos: [-3, 0, -1] },
    { type: 'chair', pos: [3, 0, -1] },
  ],

  'space-station': [
    { type: 'consolePanel', pos: [0, 0, -3] },
    { type: 'viewport', pos: [0, 0, -5] },
    { type: 'airlock', pos: [-5, 0, 0], rot: [0, Math.PI / 2, 0] },
    { type: 'serverRack', pos: [4, 0, -4] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'chair', pos: [0, 0, -2] },
    { type: 'hologramDisplay', pos: [3, 0, -1] },
  ],

  'arena': [
    { type: 'gameBoard', pos: [0, 0, -2] },
    { type: 'torch', pos: [-4, 0, -3] },
    { type: 'torch', pos: [4, 0, -3] },
    { type: 'torch', pos: [-4, 0, 2] },
    { type: 'torch', pos: [4, 0, 2] },
    { type: 'banner', pos: [-6, 0, -4] },
    { type: 'banner', pos: [6, 0, -4] },
    { type: 'chair', pos: [-1, 0, -1] },
    { type: 'chair', pos: [1, 0, -1] },
    { type: 'rock', pos: [-6, 0, 0], scale: [2, 2, 2] },
    { type: 'rock', pos: [6, 0, 0], scale: [2, 2, 2] },
  ],

  'music-hall': [
    { type: 'piano', pos: [0, 0, -3] },
    { type: 'drum', pos: [3, 0, -2] },
    { type: 'drum', pos: [3.5, 0, -2.5], scale: [0.8, 0.8, 0.8] },
    { type: 'musicStand', pos: [-2, 0, -2] },
    { type: 'musicStand', pos: [-3, 0, -1] },
    { type: 'chair', pos: [-2, 0, -1] },
    { type: 'chair', pos: [-3, 0, 0] },
    { type: 'lantern', pos: [-4, 1.5, -3] },
    { type: 'lantern', pos: [4, 1.5, -3] },
    { type: 'banner', pos: [-5, 0, -4] },
    { type: 'banner', pos: [5, 0, -4] },
  ],

  'hospital': [
    { type: 'hospitalBed', pos: [-3, 0, -2] },
    { type: 'hospitalBed', pos: [3, 0, -2] },
    { type: 'medicalCabinet', pos: [0, 0, -4] },
    { type: 'microscope', pos: [0, 0.82, -3.8] },
    { type: 'table', pos: [0, 0, -1] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'medicalCabinet', pos: [-5, 0, -3] },
  ],

  'farm': [
    { type: 'barn', pos: [0, 0, -8], scale: [1.45, 1.25, 1.35] },
    { type: 'stonePath', pos: [0, 0.02, -2.5], scale: [1.4, 1, 1.4] },
    { type: 'stonePath', pos: [0, 0.02, -4.5], scale: [1.4, 1, 1.4] },
    { type: 'fenceGate', pos: [0, 0, -1.8] },
    { type: 'fence', pos: [-4.5, 0, -2], rot: [0, 0.1, 0] },
    { type: 'fence', pos: [-3.2, 0, -2] },
    { type: 'fence', pos: [-1.8, 0, -2] },
    { type: 'fence', pos: [1.8, 0, -2] },
    { type: 'fence', pos: [3.2, 0, -2] },
    { type: 'fence', pos: [4.5, 0, -2], rot: [0, -0.1, 0] },
    { type: 'cropDirt', pos: [2, 0, 0] },
    { type: 'cropDirt', pos: [3.4, 0, 0] },
    { type: 'cropDirt', pos: [4.8, 0, 0] },
    { type: 'cropRow', pos: [2, 0, 0.45] },
    { type: 'cropRow', pos: [3.4, 0, 0.45] },
    { type: 'cropRow', pos: [4.8, 0, 0.45] },
    { type: 'corn', pos: [2.1, 0, 2.0] },
    { type: 'corn', pos: [3.5, 0, 2.0] },
    { type: 'corn', pos: [4.9, 0, 2.0] },
    { type: 'carrot', pos: [2.3, 0, 3.4] },
    { type: 'carrot', pos: [3.6, 0, 3.4] },
    { type: 'carrot', pos: [4.9, 0, 3.4] },
    { type: 'wheelbarrow', pos: [-4.5, 0, 0], rot: [0, 0.35, 0] },
    { type: 'scarecrow', pos: [4.7, 0, -3.8], scale: [1.3, 1.3, 1.3] },
    { type: 'wellBucket', pos: [-5.2, 0, -3.7] },
    { type: 'barrel', pos: [-3.2, 0, -4.1] },
    { type: 'crate', pos: [-4.2, 0, -4.3], rot: [0, -0.3, 0] },
    { type: 'tree', pos: [7.0, 0, -5.2], scale: [1.25, 1.25, 1.25] },
    { type: 'treePine', pos: [-7.0, 0, -4.7], scale: [1.1, 1.1, 1.1] },
    { type: 'bush', pos: [6.5, 0, -1.2] },
    { type: 'grass', pos: [-6.2, 0, 1.2] },
    { type: 'flower', pos: [-5.7, 0, 2.1] },
  ],

  'laboratory': [
    { type: 'labBench', pos: [0, 0, -3] },
    { type: 'labBench', pos: [-4, 0, -3] },
    { type: 'beaker', pos: [0, 0.9, -3] },
    { type: 'beaker', pos: [0.3, 0.9, -3.1] },
    { type: 'bunsenBurner', pos: [-0.5, 0.9, -3] },
    { type: 'microscope', pos: [-4, 0.9, -3] },
    { type: 'medicalCabinet', pos: [4, 0, -4] },
    { type: 'chair', pos: [0, 0, -2] },
    { type: 'chair', pos: [-4, 0, -2] },
    { type: 'whiteboard', pos: [0, 0, -4.5], rot: [0, 0, 0] },
  ],

  'explorers-map': [
    { type: 'globe', pos: [0, 0, -2], scale: [2, 2, 2] },
    { type: 'compass', pos: [0, 0.75, -2], scale: [3, 3, 3] },
    { type: 'signpost', pos: [3, 0, 0] },
    { type: 'signpost', pos: [-3, 0, 0] },
    { type: 'chest', pos: [5, 0, -3] },
    { type: 'barrel', pos: [-5, 0, -2] },
    { type: 'readingDesk', pos: [-2, 0, -3] },
    { type: 'candle', pos: [-2, 0.75, -3] },
    { type: 'tree', pos: [6, 0, -5] },
    { type: 'rock', pos: [-6, 0, 2] },
  ],

  'time-rift': [
    { type: 'hourglass', pos: [0, 0, -2], scale: [3, 3, 3] },
    { type: 'timeCrystal', pos: [-3, 0, -3] },
    { type: 'timeCrystal', pos: [3, 0, -3] },
    { type: 'timeCrystal', pos: [-1, 0, -5] },
    { type: 'timeCrystal', pos: [1, 0, -5] },
    { type: 'ancientClock', pos: [-4, 0, -1] },
    { type: 'ancientClock', pos: [4, 0, -1] },
    { type: 'brokenPillar', pos: [-5, 0, 1] },
    { type: 'brokenPillar', pos: [5, 0, 1] },
  ],

  'healers-sanctuary': [
    { type: 'healingFountain', pos: [0, 0, -3], scale: [1.5, 1.5, 1.5] },
    { type: 'herbGarden', pos: [-3, 0, -1] },
    { type: 'herbGarden', pos: [3, 0, -1] },
    { type: 'mortar', pos: [-2, 0.75, -3] },
    { type: 'potionBottle', pos: [2, 0.9, -3] },
    { type: 'bookshelf', pos: [-5, 0, -4] },
    { type: 'candle', pos: [-1, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [1, 0, -2], scale: [2, 2, 2] },
    { type: 'bush', pos: [5, 0, 0] },
    { type: 'flower', pos: [-4, 0, 0] },
    { type: 'flower', pos: [-3.5, 0, 0.3] },
  ],

  'architects-domain': [
    { type: 'draftingTable', pos: [0, 0, -2] },
    { type: 'column', pos: [-4, 0, -4] },
    { type: 'column', pos: [4, 0, -4] },
    { type: 'column', pos: [-4, 0, 2] },
    { type: 'column', pos: [4, 0, 2] },
    { type: 'compassRose', pos: [0, 0.85, -2] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'bookshelf', pos: [-5, 0, -2] },
    { type: 'statue', pos: [5, 0, -2] },
  ],

  'shipyard': [
    { type: 'anchor', pos: [3, 0, -1] },
    { type: 'sailPost', pos: [0, 0, -4] },
    { type: 'barrel', pos: [-3, 0, -2] },
    { type: 'barrel', pos: [-3.5, 0, -1.5] },
    { type: 'crate', pos: [-4, 0, -3] },
    { type: 'crate', pos: [5, 0, 0] },
    { type: 'chest', pos: [4, 0, -3] },
    { type: 'lantern', pos: [-2, 1.5, -4] },
    { type: 'ladder', pos: [0, 0, -2] },
  ],

  'digital-world': [
    { type: 'dataNode', pos: [0, 0, -3] },
    { type: 'dataNode', pos: [-3, 0, -2] },
    { type: 'dataNode', pos: [3, 0, -2] },
    { type: 'networkHub', pos: [0, 0, -1] },
    { type: 'terminal', pos: [-5, 0, -4] },
    { type: 'terminal', pos: [5, 0, -4] },
    { type: 'serverRack', pos: [-2, 0, -5] },
    { type: 'serverRack', pos: [2, 0, -5] },
    { type: 'hologramDisplay', pos: [0, 0, -5] },
  ],

  'debate-hall': [
    { type: 'podium', pos: [0, 0, -4] },
    { type: 'lectern', pos: [-3, 0, -3] },
    { type: 'lectern', pos: [3, 0, -3] },
    { type: 'chair', pos: [-2, 0, -1] },
    { type: 'chair', pos: [-1, 0, -1] },
    { type: 'chair', pos: [0, 0, -1] },
    { type: 'chair', pos: [1, 0, -1] },
    { type: 'chair', pos: [2, 0, -1] },
    { type: 'banner', pos: [-5, 0, -4] },
    { type: 'banner', pos: [5, 0, -4] },
    { type: 'candle', pos: [-4, 0, -2], scale: [2, 2, 2] },
    { type: 'candle', pos: [4, 0, -2], scale: [2, 2, 2] },
  ],

  'gallery': [
    { type: 'easel', pos: [-3, 0, -2] },
    { type: 'easel', pos: [3, 0, -2] },
    { type: 'statue', pos: [0, 0, -4] },
    { type: 'paintingFrame', pos: [-5, 0, -4.5] },
    { type: 'paintingFrame', pos: [-3, 0, -4.5] },
    { type: 'paintingFrame', pos: [3, 0, -4.5] },
    { type: 'paintingFrame', pos: [5, 0, -4.5] },
    { type: 'bench', pos: [0, 0, -1] },
    { type: 'lantern', pos: [-4, 1.5, -3] },
    { type: 'lantern', pos: [4, 1.5, -3] },
  ],

  'newsroom': [
    { type: 'printingPress', pos: [0, 0, -4] },
    { type: 'terminal', pos: [-3, 0, -2] },
    { type: 'terminal', pos: [3, 0, -2] },
    { type: 'chair', pos: [-3, 0, -1] },
    { type: 'chair', pos: [3, 0, -1] },
    { type: 'camera', pos: [0, 1.2, -1] },
    { type: 'table', pos: [0, 0, -2] },
    { type: 'bookshelf', pos: [-5, 0, -4] },
  ],

  'theater': [
    { type: 'curtain', pos: [0, 0, -5] },
    { type: 'stageFloor', pos: [0, 0, -3] },
    { type: 'spotlight', pos: [-2, 3, -3] },
    { type: 'spotlight', pos: [2, 3, -3] },
    { type: 'chair', pos: [-2, 0, 0] },
    { type: 'chair', pos: [-1, 0, 0] },
    { type: 'chair', pos: [0, 0, 0] },
    { type: 'chair', pos: [1, 0, 0] },
    { type: 'chair', pos: [2, 0, 0] },
    { type: 'chair', pos: [-2, 0, 1] },
    { type: 'chair', pos: [-1, 0, 1] },
    { type: 'chair', pos: [0, 0, 1] },
    { type: 'chair', pos: [1, 0, 1] },
    { type: 'chair', pos: [2, 0, 1] },
    { type: 'lantern', pos: [-5, 1.5, -3] },
    { type: 'lantern', pos: [5, 1.5, -3] },
  ],

  'marketplace': [
    { type: 'marketStall', pos: [-4, 0, -3] },
    { type: 'marketStall', pos: [0, 0, -3] },
    { type: 'marketStall', pos: [4, 0, -3] },
    { type: 'coinPile', pos: [0, 0.88, -3] },
    { type: 'wagon', pos: [-6, 0, 1] },
    { type: 'barrel', pos: [6, 0, 0] },
    { type: 'barrel', pos: [5.5, 0, 0.5] },
    { type: 'crate', pos: [-5, 0, -1] },
    { type: 'lantern', pos: [-4, 1.8, -3] },
    { type: 'lantern', pos: [0, 1.8, -3] },
    { type: 'lantern', pos: [4, 1.8, -3] },
    { type: 'signpost', pos: [0, 0, 2] },
  ],
};
