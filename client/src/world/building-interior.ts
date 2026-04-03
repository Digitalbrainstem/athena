import * as THREE from 'three';
import type { BiomeLocation } from './overworld.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Building interior generator — enclosed spaces with walls, floor, ceiling
// ---------------------------------------------------------------------------

export interface BuildingConfig {
  width: number;
  depth: number;
  height: number;
  wallColor: number;
  floorColor: number;
  ceilingColor: number;
  /** Which wall the door is on */
  doorWall: 'north' | 'south' | 'east' | 'west';
  lighting: 'warm' | 'cool' | 'bright' | 'dim';
  /** Interior detail description (for future props) */
  style: string;
}

const BUILDING_CONFIGS: Record<string, BuildingConfig> = {
  'workshop': {
    width: 14, depth: 12, height: 4,
    wallColor: 0x8b6914, floorColor: 0x6b4423, ceilingColor: 0x7a5a2e,
    doorWall: 'south', lighting: 'warm', style: 'workshop',
  },
  'library-echoes': {
    width: 16, depth: 14, height: 5,
    wallColor: 0xf5f5dc, floorColor: 0xf5deb3, ceilingColor: 0xe8d5c4,
    doorWall: 'south', lighting: 'warm', style: 'library',
  },
  'gallery': {
    width: 14, depth: 12, height: 4.5,
    wallColor: 0xf5f5dc, floorColor: 0xf5deb3, ceilingColor: 0xf0f0f0,
    doorWall: 'east', lighting: 'bright', style: 'gallery',
  },
  'observatory': {
    width: 10, depth: 10, height: 6,
    wallColor: 0x6b6b6b, floorColor: 0x505050, ceilingColor: 0x3a3a3a,
    doorWall: 'south', lighting: 'dim', style: 'observatory',
  },
  'storm-tower': {
    width: 10, depth: 10, height: 6,
    wallColor: 0x505050, floorColor: 0x3a3a3a, ceilingColor: 0x404040,
    doorWall: 'south', lighting: 'cool', style: 'storm-tower',
  },
  'code-forge': {
    width: 12, depth: 10, height: 4,
    wallColor: 0x3a3a3a, floorColor: 0x2a2a2e, ceilingColor: 0x333333,
    doorWall: 'west', lighting: 'cool', style: 'code-forge',
  },
  'alchemist-lab': {
    width: 12, depth: 10, height: 4,
    wallColor: 0x3d3d3d, floorColor: 0x2f2f2f, ceilingColor: 0x3a3a3a,
    doorWall: 'west', lighting: 'dim', style: 'alchemist',
  },
  'music-hall': {
    width: 14, depth: 12, height: 5,
    wallColor: 0x5c3317, floorColor: 0x4a2a10, ceilingColor: 0x5a3320,
    doorWall: 'east', lighting: 'warm', style: 'music-hall',
  },
  'arena': {
    width: 18, depth: 18, height: 5,
    wallColor: 0x8b7355, floorColor: 0x6b5535, ceilingColor: 0x7b6345,
    doorWall: 'south', lighting: 'bright', style: 'arena',
  },
  'hospital': {
    width: 14, depth: 12, height: 4,
    wallColor: 0xe8e8e8, floorColor: 0xd3d3d3, ceilingColor: 0xf0f0f0,
    doorWall: 'south', lighting: 'bright', style: 'hospital',
  },
  'laboratory': {
    width: 14, depth: 12, height: 4,
    wallColor: 0xd3d3d3, floorColor: 0xc0c0c0, ceilingColor: 0xe0e0e0,
    doorWall: 'south', lighting: 'bright', style: 'laboratory',
  },
  'debate-hall': {
    width: 14, depth: 12, height: 5,
    wallColor: 0xe8d5c4, floorColor: 0xd4b896, ceilingColor: 0xf0e6d4,
    doorWall: 'east', lighting: 'warm', style: 'debate-hall',
  },
  'newsroom': {
    width: 12, depth: 10, height: 4,
    wallColor: 0xd3d3d3, floorColor: 0xc0c0c0, ceilingColor: 0xe0e0e0,
    doorWall: 'west', lighting: 'bright', style: 'newsroom',
  },
  'theater': {
    width: 16, depth: 14, height: 6,
    wallColor: 0x3e2a1b, floorColor: 0x2e1a0b, ceilingColor: 0x4e3a2b,
    doorWall: 'east', lighting: 'dim', style: 'theater',
  },
  'architects-domain': {
    width: 14, depth: 12, height: 5,
    wallColor: 0xf5deb3, floorColor: 0xe8d5a0, ceilingColor: 0xf5ecd5,
    doorWall: 'west', lighting: 'bright', style: 'architects-domain',
  },
  'space-station': {
    width: 14, depth: 14, height: 4,
    wallColor: 0x4a4a4a, floorColor: 0x3a3a3a, ceilingColor: 0x505050,
    doorWall: 'south', lighting: 'cool', style: 'space-station',
  },
  'digital-world': {
    width: 12, depth: 12, height: 4,
    wallColor: 0x2a2a2e, floorColor: 0x1a1a22, ceilingColor: 0x2e2e35,
    doorWall: 'east', lighting: 'cool', style: 'digital-world',
  },
};

const DOOR_WIDTH = 2;
const DOOR_HEIGHT = 2.8;
const WALL_THICKNESS = 0.3;

const LIGHT_PRESETS: Record<string, { color: number; intensity: number }> = {
  'warm':   { color: 0xffd4a0, intensity: 1.2 },
  'cool':   { color: 0xa0d4ff, intensity: 0.9 },
  'bright': { color: 0xfff5e6, intensity: 1.5 },
  'dim':    { color: 0xffcc88, intensity: 0.6 },
};

export class BuildingInterior implements Disposable {
  /** The interior group positioned at the biome's world position */
  readonly group: THREE.Group;
  /** The world-space position of the door threshold (for exit detection) */
  readonly doorWorldPosition: { x: number; y: number; z: number };
  /** Collision boxes for interior walls */
  readonly wallBoxes: { cx: number; cz: number; hx: number; hz: number }[];

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor(biome: BiomeLocation) {
    const config = BUILDING_CONFIGS[biome.id] ?? BUILDING_CONFIGS['workshop']!;
    this.group = new THREE.Group();
    this.group.name = `interior-${biome.id}`;
    this.wallBoxes = [];

    const bx = biome.worldPosition.x;
    const bz = biome.worldPosition.z;
    const by = biome.baseHeight;

    this.group.position.set(bx, by, bz);

    const hw = config.width / 2;
    const hd = config.depth / 2;
    const h = config.height;

    // Floor
    this.addPlane(config.width, config.depth, config.floorColor, [0, 0.01, 0], [-Math.PI / 2, 0, 0]);

    // Ceiling
    this.addPlane(config.width, config.depth, config.ceilingColor, [0, h, 0], [Math.PI / 2, 0, 0]);

    // Walls — with door opening on the specified wall
    this.buildWalls(config, hw, hd, h, bx, bz);

    // Interior lighting
    this.addLighting(config, h);

    // Windows (light panels on non-door walls)
    this.addWindows(config, hw, hd, h);

    // Door world position (for exit detection)
    const dx = biome.entranceOffset.x;
    const dz = biome.entranceOffset.z;
    this.doorWorldPosition = { x: bx + dx, y: by, z: bz + dz };
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }

  // ---- Wall construction --------------------------------------------------

  private buildWalls(
    config: BuildingConfig,
    hw: number,
    hd: number,
    h: number,
    worldX: number,
    worldZ: number,
  ): void {
    const wallMat = this.makeMat(config.wallColor);
    const doorWall = config.doorWall;

    // North wall (Z = -hd)
    if (doorWall === 'north') {
      this.addWallWithDoor('z', -hd, hw, h, wallMat, worldX, worldZ);
    } else {
      this.addSolidWall('z', -hd, hw, h, wallMat, worldX, worldZ);
    }

    // South wall (Z = +hd)
    if (doorWall === 'south') {
      this.addWallWithDoor('z', hd, hw, h, wallMat, worldX, worldZ);
    } else {
      this.addSolidWall('z', hd, hw, h, wallMat, worldX, worldZ);
    }

    // West wall (X = -hw)
    if (doorWall === 'west') {
      this.addWallWithDoor('x', -hw, hd, h, wallMat, worldX, worldZ);
    } else {
      this.addSolidWall('x', -hw, hd, h, wallMat, worldX, worldZ);
    }

    // East wall (X = +hw)
    if (doorWall === 'east') {
      this.addWallWithDoor('x', hw, hd, h, wallMat, worldX, worldZ);
    } else {
      this.addSolidWall('x', hw, hd, h, wallMat, worldX, worldZ);
    }
  }

  private addSolidWall(
    axis: 'x' | 'z',
    offset: number,
    halfWidth: number,
    height: number,
    material: THREE.MeshStandardMaterial,
    _worldX: number,
    _worldZ: number,
  ): void {
    if (axis === 'z') {
      const geo = new THREE.BoxGeometry(halfWidth * 2, height, WALL_THICKNESS);
      this.geometries.push(geo);
      const wall = new THREE.Mesh(geo, material);
      wall.position.set(0, height / 2, offset);
      this.group.add(wall);
      this.wallBoxes.push({
        cx: _worldX,
        cz: _worldZ + offset,
        hx: halfWidth,
        hz: WALL_THICKNESS / 2,
      });
    } else {
      const geo = new THREE.BoxGeometry(WALL_THICKNESS, height, halfWidth * 2);
      this.geometries.push(geo);
      const wall = new THREE.Mesh(geo, material);
      wall.position.set(offset, height / 2, 0);
      this.group.add(wall);
      this.wallBoxes.push({
        cx: _worldX + offset,
        cz: _worldZ,
        hx: WALL_THICKNESS / 2,
        hz: halfWidth,
      });
    }
  }

  private addWallWithDoor(
    axis: 'x' | 'z',
    offset: number,
    halfWidth: number,
    height: number,
    material: THREE.MeshStandardMaterial,
    worldX: number,
    worldZ: number,
  ): void {
    const doorHalf = DOOR_WIDTH / 2;

    if (axis === 'z') {
      // Left section
      const leftW = halfWidth - doorHalf;
      if (leftW > 0.1) {
        const geo = new THREE.BoxGeometry(leftW, height, WALL_THICKNESS);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(-halfWidth + leftW / 2, height / 2, offset);
        this.group.add(wall);
        this.wallBoxes.push({
          cx: worldX - halfWidth + leftW / 2,
          cz: worldZ + offset,
          hx: leftW / 2,
          hz: WALL_THICKNESS / 2,
        });
      }
      // Right section
      if (leftW > 0.1) {
        const geo = new THREE.BoxGeometry(leftW, height, WALL_THICKNESS);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(halfWidth - leftW / 2, height / 2, offset);
        this.group.add(wall);
        this.wallBoxes.push({
          cx: worldX + halfWidth - leftW / 2,
          cz: worldZ + offset,
          hx: leftW / 2,
          hz: WALL_THICKNESS / 2,
        });
      }
      // Above door
      const aboveH = height - DOOR_HEIGHT;
      if (aboveH > 0.1) {
        const geo = new THREE.BoxGeometry(DOOR_WIDTH + 0.4, aboveH, WALL_THICKNESS);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(0, DOOR_HEIGHT + aboveH / 2, offset);
        this.group.add(wall);
      }
    } else {
      // X-axis walls with door
      const halfD = halfWidth; // halfWidth is actually halfDepth for x-axis
      const leftW = halfD - doorHalf;
      if (leftW > 0.1) {
        const geo = new THREE.BoxGeometry(WALL_THICKNESS, height, leftW);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(offset, height / 2, -halfD + leftW / 2);
        this.group.add(wall);
        this.wallBoxes.push({
          cx: worldX + offset,
          cz: worldZ - halfD + leftW / 2,
          hx: WALL_THICKNESS / 2,
          hz: leftW / 2,
        });
      }
      if (leftW > 0.1) {
        const geo = new THREE.BoxGeometry(WALL_THICKNESS, height, leftW);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(offset, height / 2, halfD - leftW / 2);
        this.group.add(wall);
        this.wallBoxes.push({
          cx: worldX + offset,
          cz: worldZ + halfD - leftW / 2,
          hx: WALL_THICKNESS / 2,
          hz: leftW / 2,
        });
      }
      const aboveH = height - DOOR_HEIGHT;
      if (aboveH > 0.1) {
        const geo = new THREE.BoxGeometry(WALL_THICKNESS, aboveH, DOOR_WIDTH + 0.4);
        this.geometries.push(geo);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(offset, DOOR_HEIGHT + aboveH / 2, 0);
        this.group.add(wall);
      }
    }
  }

  // ---- Helpers ------------------------------------------------------------

  private addPlane(
    w: number,
    d: number,
    color: number,
    pos: [number, number, number],
    rot: [number, number, number],
  ): void {
    const geo = new THREE.PlaneGeometry(w, d);
    const material = this.makeMat(color);
    this.geometries.push(geo);
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.receiveShadow = true;
    this.group.add(m);
  }

  private addLighting(config: BuildingConfig, height: number): void {
    const preset = LIGHT_PRESETS[config.lighting] ?? LIGHT_PRESETS['warm']!;

    // Central overhead light
    const light = new THREE.PointLight(preset.color, preset.intensity, config.width * 1.5);
    light.position.set(0, height - 0.5, 0);
    this.group.add(light);

    // Secondary fill light
    const fill = new THREE.PointLight(preset.color, preset.intensity * 0.4, config.width);
    fill.position.set(config.width * 0.25, height * 0.6, config.depth * 0.25);
    this.group.add(fill);

    // Ambient to prevent pure-black corners
    const ambient = new THREE.AmbientLight(preset.color, 0.15);
    this.group.add(ambient);
  }

  private addWindows(
    config: BuildingConfig,
    hw: number,
    hd: number,
    height: number,
  ): void {
    const windowMat = this.makeMat(0xadd8e6, 0xadd8e6, 0.2);
    windowMat.transparent = true;
    windowMat.opacity = 0.3;

    const doorWall = config.doorWall;
    const windowH = Math.min(1.5, height * 0.3);
    const windowY = height * 0.65;

    // Add windows to non-door walls
    const walls: { pos: [number, number, number]; rot: [number, number, number]; show: boolean }[] = [
      { pos: [0, windowY, -hd + 0.01], rot: [0, 0, 0], show: doorWall !== 'north' },
      { pos: [0, windowY, hd - 0.01], rot: [0, Math.PI, 0], show: doorWall !== 'south' },
      { pos: [-hw + 0.01, windowY, 0], rot: [0, Math.PI / 2, 0], show: doorWall !== 'west' },
      { pos: [hw - 0.01, windowY, 0], rot: [0, -Math.PI / 2, 0], show: doorWall !== 'east' },
    ];

    for (const w of walls) {
      if (!w.show) continue;
      const geo = new THREE.PlaneGeometry(2, windowH);
      this.geometries.push(geo);
      const win = new THREE.Mesh(geo, windowMat);
      win.position.set(...w.pos);
      win.rotation.set(...w.rot);
      this.group.add(win);
    }
  }

  private makeMat(color: number, emissive = 0x000000, emissiveI = 0): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: emissiveI,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.materials.push(m);
    return m;
  }
}

/** Check if a biome has a building interior configuration */
export function hasBuildingInterior(biomeId: string): boolean {
  return biomeId in BUILDING_CONFIGS;
}
