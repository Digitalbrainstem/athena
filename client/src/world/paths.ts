import * as THREE from 'three';
import type { BiomeLocation, PathConnection } from './overworld.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Path / road mesh generation — dirt roads and trails between biomes
// ---------------------------------------------------------------------------

const PATH_Y_OFFSET = 0.08; // Slightly above terrain to prevent z-fighting
const MAIN_PATH_WIDTH = 2.5;
const TRAIL_WIDTH = 1.2;
const PATH_SEGMENTS = 12; // Segments per path for smooth curves

const COL_DIRT = new THREE.Color(0x8b7355);
const COL_TRAIL = new THREE.Color(0x9a8565);

export class PathNetwork implements Disposable {
  readonly group: THREE.Group;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor(
    biomes: BiomeLocation[],
    connections: PathConnection[],
    getHeightAt: (x: number, z: number) => number,
  ) {
    this.group = new THREE.Group();
    this.group.name = 'path-network';

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

      const width = conn.style === 'main' ? MAIN_PATH_WIDTH : TRAIL_WIDTH;
      const color = conn.style === 'main' ? COL_DIRT : COL_TRAIL;

      this.createPathMesh(x1, z1, x2, z2, width, color, getHeightAt);
    }
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }

  private createPathMesh(
    x1: number, z1: number,
    x2: number, z2: number,
    width: number,
    color: THREE.Color,
    getHeight: (x: number, z: number) => number,
  ): void {
    const segs = PATH_SEGMENTS;
    const halfW = width / 2;

    // Generate path points with slight curve (midpoint offset for organic feel)
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 5;
    const mz = (z1 + z2) / 2 + (Math.random() - 0.5) * 5;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const t = i / segs;

      // Quadratic bezier interpolation for gentle curve
      const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const pz = (1 - t) * (1 - t) * z1 + 2 * (1 - t) * t * mz + t * t * z2;

      // Direction for perpendicular width
      const dt = 0.01;
      const t2 = Math.min(1, t + dt);
      const nx = (1 - t2) * (1 - t2) * x1 + 2 * (1 - t2) * t2 * mx + t2 * t2 * x2 - px;
      const nz = (1 - t2) * (1 - t2) * z1 + 2 * (1 - t2) * t2 * mz + t2 * t2 * z2 - pz;
      const len = Math.sqrt(nx * nx + nz * nz) || 1;

      // Perpendicular vector
      const perpX = -nz / len;
      const perpZ = nx / len;

      const lx = px + perpX * halfW;
      const lz = pz + perpZ * halfW;
      const rx = px - perpX * halfW;
      const rz = pz - perpZ * halfW;

      const ly = getHeight(lx, lz) + PATH_Y_OFFSET;
      const ry = getHeight(rx, rz) + PATH_Y_OFFSET;

      vertices.push(lx, ly, lz);
      vertices.push(rx, ry, rz);

      // Slight color variation along path
      const variation = 0.9 + Math.random() * 0.2;
      colors.push(color.r * variation, color.g * variation, color.b * variation);
      colors.push(color.r * variation, color.g * variation, color.b * variation);

      if (i < segs) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    this.geometries.push(geometry);

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.materials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }
}
