import * as THREE from 'three';
import { fbm, ridgedNoise } from './noise.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Biome location data — positions of all 27 biomes in the overworld
// ---------------------------------------------------------------------------

export type BiomeType = 'building' | 'natural' | 'underground';

export interface BiomeLocation {
  id: string;
  name: string;
  worldPosition: { x: number; z: number };
  type: BiomeType;
  /** Offset from center where the entrance/door is */
  entranceOffset: { x: number; z: number };
  radius: number;
  /** Terrain height at this biome's center */
  baseHeight: number;
  /** Radius within which terrain is flattened */
  flatRadius: number;
}

/**
 * All 27 biomes positioned in a continuous overworld.
 * Layout forms concentric rings around the town square (0,0).
 */
export const BIOME_LOCATIONS: BiomeLocation[] = [
  // === Inner Ring (~40-55 units from center) ===
  {
    id: 'workshop',
    name: 'The Workshop',
    worldPosition: { x: -40, z: 30 },
    type: 'building',
    entranceOffset: { x: 0, z: 8 },
    radius: 12,
    baseHeight: 0.5,
    flatRadius: 14,
  },
  {
    id: 'library-echoes',
    name: 'Library of Echoes',
    worldPosition: { x: 40, z: 30 },
    type: 'building',
    entranceOffset: { x: 0, z: 8 },
    radius: 14,
    baseHeight: 1.0,
    flatRadius: 16,
  },
  {
    id: 'living-forest',
    name: 'Living Forest',
    worldPosition: { x: 0, z: 55 },
    type: 'natural',
    entranceOffset: { x: 0, z: -8 },
    radius: 18,
    baseHeight: 0.3,
    flatRadius: 12,
  },
  {
    id: 'gallery',
    name: 'The Gallery',
    worldPosition: { x: -55, z: -5 },
    type: 'building',
    entranceOffset: { x: 6, z: 0 },
    radius: 11,
    baseHeight: 0.8,
    flatRadius: 13,
  },
  {
    id: 'ancient-ruins',
    name: 'Ancient Ruins',
    worldPosition: { x: 55, z: -5 },
    type: 'natural',
    entranceOffset: { x: -6, z: 0 },
    radius: 14,
    baseHeight: 1.5,
    flatRadius: 14,
  },
  {
    id: 'observatory',
    name: 'The Observatory',
    worldPosition: { x: 0, z: -55 },
    type: 'building',
    entranceOffset: { x: 0, z: 8 },
    radius: 10,
    baseHeight: 8.0,
    flatRadius: 12,
  },

  // === Middle Ring (~65-85 units from center) ===
  {
    id: 'trading-post',
    name: 'Trading Post',
    worldPosition: { x: 65, z: 25 },
    type: 'natural',
    entranceOffset: { x: -6, z: 0 },
    radius: 12,
    baseHeight: 0.4,
    flatRadius: 12,
  },
  {
    id: 'crystal-caverns',
    name: 'Crystal Caverns',
    worldPosition: { x: 0, z: 80 },
    type: 'underground',
    entranceOffset: { x: 0, z: -8 },
    radius: 14,
    baseHeight: -1.0,
    flatRadius: 12,
  },
  {
    id: 'storm-tower',
    name: 'Storm Tower',
    worldPosition: { x: -55, z: -50 },
    type: 'building',
    entranceOffset: { x: 4, z: 4 },
    radius: 10,
    baseHeight: 3.0,
    flatRadius: 11,
  },
  {
    id: 'healers-sanctuary',
    name: "Healer's Sanctuary",
    worldPosition: { x: 55, z: -50 },
    type: 'natural',
    entranceOffset: { x: -4, z: 4 },
    radius: 13,
    baseHeight: 1.0,
    flatRadius: 13,
  },
  {
    id: 'music-hall',
    name: 'Music Hall',
    worldPosition: { x: -70, z: 25 },
    type: 'building',
    entranceOffset: { x: 6, z: 0 },
    radius: 11,
    baseHeight: 0.6,
    flatRadius: 12,
  },
  {
    id: 'farm',
    name: 'The Farm',
    worldPosition: { x: -35, z: 65 },
    type: 'natural',
    entranceOffset: { x: 4, z: -6 },
    radius: 16,
    baseHeight: 0.2,
    flatRadius: 15,
  },
  {
    id: 'code-forge',
    name: 'Code Forge',
    worldPosition: { x: 75, z: -25 },
    type: 'building',
    entranceOffset: { x: -6, z: 0 },
    radius: 11,
    baseHeight: 0.5,
    flatRadius: 12,
  },
  {
    id: 'arena',
    name: 'The Arena',
    worldPosition: { x: 0, z: -80 },
    type: 'building',
    entranceOffset: { x: 0, z: 8 },
    radius: 14,
    baseHeight: 2.0,
    flatRadius: 15,
  },

  // === Outer Ring (~85-110 units from center) ===
  {
    id: 'hospital',
    name: 'The Hospital',
    worldPosition: { x: -45, z: -75 },
    type: 'building',
    entranceOffset: { x: 0, z: 6 },
    radius: 12,
    baseHeight: 1.5,
    flatRadius: 13,
  },
  {
    id: 'laboratory',
    name: 'The Laboratory',
    worldPosition: { x: 45, z: -75 },
    type: 'building',
    entranceOffset: { x: 0, z: 6 },
    radius: 12,
    baseHeight: 1.2,
    flatRadius: 13,
  },
  {
    id: 'alchemist-lab',
    name: "Alchemist's Lab",
    worldPosition: { x: 90, z: 0 },
    type: 'building',
    entranceOffset: { x: -7, z: 0 },
    radius: 11,
    baseHeight: 0.8,
    flatRadius: 12,
  },
  {
    id: 'shipyard',
    name: 'The Shipyard',
    worldPosition: { x: -90, z: 35 },
    type: 'natural',
    entranceOffset: { x: 6, z: -4 },
    radius: 14,
    baseHeight: 0.0,
    flatRadius: 14,
  },
  {
    id: 'debate-hall',
    name: 'Debate Hall',
    worldPosition: { x: -80, z: -30 },
    type: 'building',
    entranceOffset: { x: 6, z: 0 },
    radius: 11,
    baseHeight: 1.0,
    flatRadius: 12,
  },
  {
    id: 'newsroom',
    name: 'The Newsroom',
    worldPosition: { x: 80, z: -45 },
    type: 'building',
    entranceOffset: { x: -6, z: 0 },
    radius: 11,
    baseHeight: 0.8,
    flatRadius: 12,
  },
  {
    id: 'theater',
    name: 'The Theater',
    worldPosition: { x: -95, z: -5 },
    type: 'building',
    entranceOffset: { x: 6, z: 0 },
    radius: 12,
    baseHeight: 0.6,
    flatRadius: 13,
  },
  {
    id: 'marketplace',
    name: 'The Marketplace',
    worldPosition: { x: 55, z: 70 },
    type: 'natural',
    entranceOffset: { x: -6, z: -4 },
    radius: 13,
    baseHeight: 0.3,
    flatRadius: 13,
  },
  {
    id: 'architects-domain',
    name: "Architect's Domain",
    worldPosition: { x: 95, z: 20 },
    type: 'building',
    entranceOffset: { x: -7, z: 0 },
    radius: 12,
    baseHeight: 1.2,
    flatRadius: 13,
  },

  // === Frontier (~100-130 units from center) ===
  {
    id: 'space-station',
    name: 'Space Station',
    worldPosition: { x: 0, z: -110 },
    type: 'building',
    entranceOffset: { x: 0, z: 8 },
    radius: 13,
    baseHeight: 2.5,
    flatRadius: 14,
  },
  {
    id: 'digital-world',
    name: 'Digital World',
    worldPosition: { x: -85, z: -65 },
    type: 'building',
    entranceOffset: { x: 6, z: 4 },
    radius: 12,
    baseHeight: 1.0,
    flatRadius: 12,
  },
  {
    id: 'explorers-map',
    name: "Explorer's Map",
    worldPosition: { x: -50, z: 95 },
    type: 'natural',
    entranceOffset: { x: 4, z: -6 },
    radius: 14,
    baseHeight: 0.5,
    flatRadius: 13,
  },
  {
    id: 'time-rift',
    name: 'Time Rift',
    worldPosition: { x: 100, z: -60 },
    type: 'natural',
    entranceOffset: { x: -6, z: 4 },
    radius: 12,
    baseHeight: 1.5,
    flatRadius: 11,
  },
];

/** Look up a biome location by id */
export function getBiomeLocation(biomeId: string): BiomeLocation | undefined {
  return BIOME_LOCATIONS.find((b) => b.id === biomeId);
}

// ---------------------------------------------------------------------------
// Path connections — which biomes are linked by walkable paths
// ---------------------------------------------------------------------------

export interface PathConnection {
  from: string;
  to: string;
  /** 'main' = wide dirt road, 'trail' = narrow path */
  style: 'main' | 'trail';
}

export const PATH_CONNECTIONS: PathConnection[] = [
  // Spokes from town square to inner ring
  { from: 'town-square', to: 'workshop', style: 'main' },
  { from: 'town-square', to: 'library-echoes', style: 'main' },
  { from: 'town-square', to: 'living-forest', style: 'main' },
  { from: 'town-square', to: 'gallery', style: 'main' },
  { from: 'town-square', to: 'ancient-ruins', style: 'main' },
  { from: 'town-square', to: 'observatory', style: 'main' },
  // Inner ring connections
  { from: 'workshop', to: 'gallery', style: 'trail' },
  { from: 'workshop', to: 'living-forest', style: 'trail' },
  { from: 'library-echoes', to: 'ancient-ruins', style: 'trail' },
  { from: 'library-echoes', to: 'living-forest', style: 'trail' },
  { from: 'gallery', to: 'observatory', style: 'trail' },
  { from: 'ancient-ruins', to: 'observatory', style: 'trail' },
  // Inner → middle ring
  { from: 'workshop', to: 'farm', style: 'main' },
  { from: 'workshop', to: 'music-hall', style: 'trail' },
  { from: 'library-echoes', to: 'trading-post', style: 'main' },
  { from: 'living-forest', to: 'crystal-caverns', style: 'main' },
  { from: 'living-forest', to: 'farm', style: 'trail' },
  { from: 'gallery', to: 'music-hall', style: 'main' },
  { from: 'ancient-ruins', to: 'code-forge', style: 'main' },
  { from: 'observatory', to: 'storm-tower', style: 'main' },
  { from: 'observatory', to: 'healers-sanctuary', style: 'main' },
  { from: 'observatory', to: 'arena', style: 'trail' },
  // Middle ring connections
  { from: 'trading-post', to: 'marketplace', style: 'trail' },
  { from: 'storm-tower', to: 'hospital', style: 'trail' },
  { from: 'healers-sanctuary', to: 'laboratory', style: 'trail' },
  { from: 'arena', to: 'hospital', style: 'trail' },
  { from: 'arena', to: 'laboratory', style: 'trail' },
  // Middle → outer ring
  { from: 'code-forge', to: 'alchemist-lab', style: 'main' },
  { from: 'code-forge', to: 'newsroom', style: 'trail' },
  { from: 'storm-tower', to: 'debate-hall', style: 'main' },
  { from: 'music-hall', to: 'theater', style: 'main' },
  { from: 'music-hall', to: 'shipyard', style: 'trail' },
  { from: 'trading-post', to: 'architects-domain', style: 'trail' },
  { from: 'crystal-caverns', to: 'explorers-map', style: 'main' },
  { from: 'marketplace', to: 'architects-domain', style: 'trail' },
  // Outer ring
  { from: 'debate-hall', to: 'digital-world', style: 'trail' },
  { from: 'hospital', to: 'digital-world', style: 'trail' },
  { from: 'arena', to: 'space-station', style: 'main' },
  { from: 'alchemist-lab', to: 'time-rift', style: 'trail' },
  { from: 'newsroom', to: 'time-rift', style: 'trail' },
  { from: 'laboratory', to: 'space-station', style: 'trail' },
  { from: 'theater', to: 'shipyard', style: 'trail' },
];

// ---------------------------------------------------------------------------
// Terrain color palette
// ---------------------------------------------------------------------------

const COL_GRASS = new THREE.Color(0x5a8f3c);
const COL_GRASS_DARK = new THREE.Color(0x3d6b2e);
const COL_DIRT = new THREE.Color(0x8b7355);
const COL_STONE = new THREE.Color(0x808080);
const COL_SAND = new THREE.Color(0xd2b48c);
const COL_ROCK = new THREE.Color(0x6b6b6b);

// ---------------------------------------------------------------------------
// OverworldTerrain — the living ground of the Nexus
// ---------------------------------------------------------------------------

const TERRAIN_SIZE = 400;
const TERRAIN_SEGMENTS = 200;

export class OverworldTerrain implements Disposable {
  readonly mesh: THREE.Mesh;
  private readonly heights: Float32Array;
  private readonly size: number;
  private readonly segments: number;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshStandardMaterial;

  constructor(biomes: BiomeLocation[], pathConnections: PathConnection[]) {
    this.size = TERRAIN_SIZE;
    this.segments = TERRAIN_SEGMENTS;
    const stride = this.segments + 1;
    this.heights = new Float32Array(stride * stride);

    this.geometry = new THREE.PlaneGeometry(
      this.size, this.size,
      this.segments, this.segments,
    );
    this.geometry.rotateX(-Math.PI / 2);

    this.generateHeights(biomes);
    this.paintVertexColors(biomes, pathConnections);

    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.0,
      flatShading: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'overworld-terrain';
  }

  /** Get interpolated terrain height at any world position */
  getHeightAt(worldX: number, worldZ: number): number {
    const half = this.size / 2;
    const col = ((worldX + half) / this.size) * this.segments;
    const row = ((worldZ + half) / this.size) * this.segments;

    const c0 = Math.max(0, Math.min(this.segments - 1, Math.floor(col)));
    const r0 = Math.max(0, Math.min(this.segments - 1, Math.floor(row)));
    const c1 = Math.min(this.segments, c0 + 1);
    const r1 = Math.min(this.segments, r0 + 1);
    const fx = col - c0;
    const fz = row - r0;

    const stride = this.segments + 1;
    const h00 = this.heights[r0 * stride + c0]!;
    const h10 = this.heights[r0 * stride + c1]!;
    const h01 = this.heights[r1 * stride + c0]!;
    const h11 = this.heights[r1 * stride + c1]!;

    const h0 = h00 + (h10 - h00) * fx;
    const h1 = h01 + (h11 - h01) * fx;
    return h0 + (h1 - h0) * fz;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  // -- Height generation ----------------------------------------------------

  private generateHeights(biomes: BiomeLocation[]): void {
    const positions = this.geometry.attributes.position!;
    const stride = this.segments + 1;

    for (let i = 0; i < positions.count; i++) {
      const wx = positions.getX(i);
      const wz = positions.getZ(i);

      // Base terrain from layered noise
      let h = fbm(wx * 0.008, wz * 0.008, 5) * 10 - 2;

      // Gentle rolling hills
      h += fbm(wx * 0.025 + 100, wz * 0.025 + 100, 3) * 3;

      // Mountain ridges at edges (decorative boundary)
      const edgeDist = Math.max(
        Math.abs(wx) / (this.size * 0.5),
        Math.abs(wz) / (this.size * 0.5),
      );
      if (edgeDist > 0.7) {
        const edgeFactor = (edgeDist - 0.7) / 0.3;
        h += ridgedNoise(wx * 0.02, wz * 0.02, 3) * 20 * edgeFactor * edgeFactor;
      }

      // Flatten near each biome and blend smoothly
      for (const biome of biomes) {
        const dx = wx - biome.worldPosition.x;
        const dz = wz - biome.worldPosition.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const blendOuter = biome.flatRadius + 12;

        if (dist < biome.flatRadius) {
          h = biome.baseHeight;
        } else if (dist < blendOuter) {
          const t = (dist - biome.flatRadius) / 12;
          const s = t * t * (3 - 2 * t); // smoothstep
          h = biome.baseHeight + (h - biome.baseHeight) * s;
        }
      }

      // Flatten the town square area
      const townDist = Math.sqrt(wx * wx + wz * wz);
      if (townDist < 18) {
        h = 0;
      } else if (townDist < 28) {
        const t = (townDist - 18) / 10;
        h *= t * t * (3 - 2 * t);
      }

      // Clamp so player can't fall below base
      h = Math.max(-2, h);

      positions.setY(i, h);

      const row = Math.floor(i / stride);
      const col = i % stride;
      this.heights[row * stride + col] = h;
    }

    positions.needsUpdate = true;
  }

  // -- Vertex coloring ------------------------------------------------------

  private paintVertexColors(
    biomes: BiomeLocation[],
    pathConnections: PathConnection[],
  ): void {
    const positions = this.geometry.attributes.position!;
    const colors = new Float32Array(positions.count * 3);

    // Precompute path segments for proximity checks
    const paths = this.buildPathSegments(biomes, pathConnections);

    for (let i = 0; i < positions.count; i++) {
      const wx = positions.getX(i);
      const wz = positions.getZ(i);
      const wy = positions.getY(i);

      // Base color: grass with noise variation
      const grassT = fbm(wx * 0.05, wz * 0.05, 2);
      const base = new THREE.Color().lerpColors(COL_GRASS, COL_GRASS_DARK, grassT);

      // Height-based blending: rock on steep/high areas
      if (wy > 6) {
        const rockT = Math.min(1, (wy - 6) / 8);
        base.lerp(COL_ROCK, rockT);
      }

      // Sandy areas near certain biomes
      const tradingDist = this.distToPoint(wx, wz, 65, 25);
      const marketDist = this.distToPoint(wx, wz, 55, 70);
      const explorerDist = this.distToPoint(wx, wz, -50, 95);
      const minSandDist = Math.min(tradingDist, marketDist, explorerDist);
      if (minSandDist < 20) {
        const sandT = 1 - minSandDist / 20;
        base.lerp(COL_SAND, sandT * 0.6);
      }

      // Stone near building entrances
      for (const biome of biomes) {
        if (biome.type !== 'building') continue;
        const bd = this.distToPoint(wx, wz, biome.worldPosition.x, biome.worldPosition.z);
        if (bd < biome.flatRadius) {
          const stoneT = 1 - bd / biome.flatRadius;
          base.lerp(COL_STONE, stoneT * 0.4);
        }
      }

      // Dirt along paths
      let minPathDist = Infinity;
      for (const seg of paths) {
        const d = this.distToSegment(wx, wz, seg.x1, seg.z1, seg.x2, seg.z2);
        if (d < minPathDist) minPathDist = d;
      }
      const pathWidth = 2.5;
      if (minPathDist < pathWidth) {
        base.lerp(COL_DIRT, 0.8);
      } else if (minPathDist < pathWidth + 2) {
        const t = 1 - (minPathDist - pathWidth) / 2;
        base.lerp(COL_DIRT, t * 0.5);
      }

      // Town square cobblestone
      const townDist = Math.sqrt(wx * wx + wz * wz);
      if (townDist < 16) {
        const cobbleT = 1 - townDist / 16;
        base.lerp(COL_STONE, cobbleT * 0.7);
      }

      colors[i * 3] = base.r;
      colors[i * 3 + 1] = base.g;
      colors[i * 3 + 2] = base.b;
    }

    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  private buildPathSegments(
    biomes: BiomeLocation[],
    connections: PathConnection[],
  ): { x1: number; z1: number; x2: number; z2: number }[] {
    const segments: { x1: number; z1: number; x2: number; z2: number }[] = [];
    const biomeMap = new Map(biomes.map((b) => [b.id, b]));

    for (const conn of connections) {
      let x1: number, z1: number, x2: number, z2: number;

      if (conn.from === 'town-square') {
        x1 = 0; z1 = 0;
      } else {
        const b = biomeMap.get(conn.from);
        if (!b) continue;
        x1 = b.worldPosition.x;
        z1 = b.worldPosition.z;
      }

      if (conn.to === 'town-square') {
        x2 = 0; z2 = 0;
      } else {
        const b = biomeMap.get(conn.to);
        if (!b) continue;
        x2 = b.worldPosition.x;
        z2 = b.worldPosition.z;
      }

      segments.push({ x1, z1, x2, z2 });
    }

    return segments;
  }

  private distToPoint(x: number, z: number, px: number, pz: number): number {
    const dx = x - px;
    const dz = z - pz;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private distToSegment(
    px: number, pz: number,
    x1: number, z1: number,
    x2: number, z2: number,
  ): number {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lenSq = dx * dx + dz * dz;
    if (lenSq === 0) return this.distToPoint(px, pz, x1, z1);
    let t = ((px - x1) * dx + (pz - z1) * dz) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return this.distToPoint(px, pz, x1 + t * dx, z1 + t * dz);
  }
}
