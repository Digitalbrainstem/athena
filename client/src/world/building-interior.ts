import * as THREE from 'three';
import type { BiomeLocation } from './overworld.js';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Building interior generator — enclosed spaces with walls, floor, ceiling,
// furniture, lighting fixtures, dust particles, and atmosphere.
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
    width: 15, depth: 20, height: 4,
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

const DUST_PARTICLE_COUNT = 200;

export class BuildingInterior implements Disposable {
  /** The interior group positioned at the biome's world position */
  readonly group: THREE.Group;
  /** The world-space position of the door threshold (for exit detection) */
  readonly doorWorldPosition: { x: number; y: number; z: number };
  /** Collision boxes for interior walls */
  readonly wallBoxes: { cx: number; cz: number; hx: number; hz: number }[];

  /** Dust particle system for animated motes */
  private dustParticles: THREE.Points | null = null;
  private dustVelocities: Float32Array | null = null;

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

    // Floor — with subtle plank pattern for workshop
    this.addFloor(config, hw, hd);

    // Ceiling
    this.addPlane(config.width, config.depth, config.ceilingColor, [0, h, 0], [Math.PI / 2, 0, 0]);

    // Ceiling beams
    this.addCeilingBeams(config, hw, hd, h);

    // Walls — with door opening on the specified wall
    this.buildWalls(config, hw, hd, h, bx, bz);

    // Door frame
    this.addDoorFrame(config, hw, hd, h);

    // Interior lighting (point lights + ambient)
    this.addLighting(config, h);

    // Hanging lanterns
    this.addLanterns(config, hw, hd, h);

    // Windows with light beams
    this.addWindows(config, hw, hd, h);

    // Furniture (style-specific)
    this.addFurniture(config, hw, hd, h);

    // Dust motes floating in light beams
    this.addDustParticles(config, hw, hd, h);

    // Door world position (for exit detection)
    const dx = biome.entranceOffset.x;
    const dz = biome.entranceOffset.z;
    this.doorWorldPosition = { x: bx + dx, y: by, z: bz + dz };
  }

  /** Call each frame to animate dust motes */
  updateDust(_dt: number): void {
    if (!this.dustParticles || !this.dustVelocities) return;

    const posAttr = this.dustParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const vels = this.dustVelocities;
    const count = posAttr.count;
    const bounds = this.dustParticles.userData as { hw: number; hd: number; h: number };

    for (let i = 0; i < count; i++) {
      let x = posAttr.getX(i) + vels[i * 3]!;
      let y = posAttr.getY(i) + vels[i * 3 + 1]!;
      let z = posAttr.getZ(i) + vels[i * 3 + 2]!;

      // Wrap around bounds
      if (y > bounds.h - 0.3) { y = 0.3; x = (Math.random() - 0.5) * bounds.hw * 1.6; }
      if (y < 0.3) y = bounds.h - 0.3;
      if (x > bounds.hw * 0.8) x = -bounds.hw * 0.8;
      if (x < -bounds.hw * 0.8) x = bounds.hw * 0.8;
      if (z > bounds.hd * 0.8) z = -bounds.hd * 0.8;
      if (z < -bounds.hd * 0.8) z = bounds.hd * 0.8;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }

  // ---- Floor with plank pattern ------------------------------------------

  private addFloor(config: BuildingConfig, _hw: number, _hd: number): void {
    const geo = new THREE.PlaneGeometry(config.width, config.depth, config.width, config.depth);
    const mat = this.makeMat(config.floorColor);
    this.geometries.push(geo);

    // Subtle vertex color variation to simulate planks
    const colors = new Float32Array(geo.attributes.position!.count * 3);
    const base = new THREE.Color(config.floorColor);
    for (let i = 0; i < colors.length; i += 3) {
      const variation = 0.92 + Math.random() * 0.16;
      colors[i]     = base.r * variation;
      colors[i + 1] = base.g * variation;
      colors[i + 2] = base.b * variation;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    mat.vertexColors = true;

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.01, 0);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  // ---- Ceiling beams -----------------------------------------------------

  private addCeilingBeams(config: BuildingConfig, hw: number, hd: number, h: number): void {
    const beamColor = config.style === 'workshop' ? 0x5a3a1a :
                      config.style === 'library'  ? 0x6b4423 :
                      config.ceilingColor;
    const beamMat = this.makeMat(beamColor);
    const beamCount = Math.max(2, Math.floor(config.depth / 4));

    for (let i = 0; i < beamCount; i++) {
      const z = -hd + (config.depth / (beamCount + 1)) * (i + 1);
      const beamGeo = new THREE.BoxGeometry(config.width - 0.4, 0.25, 0.2);
      this.geometries.push(beamGeo);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, h - 0.13, z);
      this.group.add(beam);
    }

    // Cross beams (perpendicular)
    if (config.width > 10) {
      const crossCount = Math.max(1, Math.floor(config.width / 6));
      for (let i = 0; i < crossCount; i++) {
        const x = -hw + (config.width / (crossCount + 1)) * (i + 1);
        const crossGeo = new THREE.BoxGeometry(0.18, 0.2, config.depth - 0.4);
        this.geometries.push(crossGeo);
        const cross = new THREE.Mesh(crossGeo, beamMat);
        cross.position.set(x, h - 0.3, 0);
        this.group.add(cross);
      }
    }
  }

  // ---- Door frame --------------------------------------------------------

  private addDoorFrame(config: BuildingConfig, hw: number, hd: number, _h: number): void {
    const frameMat = this.makeMat(0x3a2210);
    const doorHalf = DOOR_WIDTH / 2;
    const frameThickness = 0.12;

    let dx = 0, dz = 0;

    switch (config.doorWall) {
      case 'south': dz = hd; break;
      case 'north': dz = -hd; break;
      case 'east':  dx = hw; break;
      case 'west':  dx = -hw; break;
    }

    // Left jamb
    const jambGeo = new THREE.BoxGeometry(frameThickness, DOOR_HEIGHT, frameThickness);
    this.geometries.push(jambGeo);
    const leftJamb = new THREE.Mesh(jambGeo, frameMat);
    const rightJamb = new THREE.Mesh(jambGeo, frameMat);

    // Lintel
    const lintelGeo = new THREE.BoxGeometry(DOOR_WIDTH + frameThickness * 2, frameThickness, frameThickness);
    this.geometries.push(lintelGeo);
    const lintel = new THREE.Mesh(lintelGeo, frameMat);

    if (config.doorWall === 'south' || config.doorWall === 'north') {
      leftJamb.position.set(dx - doorHalf - frameThickness / 2, DOOR_HEIGHT / 2, dz);
      rightJamb.position.set(dx + doorHalf + frameThickness / 2, DOOR_HEIGHT / 2, dz);
      lintel.position.set(dx, DOOR_HEIGHT + frameThickness / 2, dz);
    } else {
      leftJamb.position.set(dx, DOOR_HEIGHT / 2, -doorHalf - frameThickness / 2);
      rightJamb.position.set(dx, DOOR_HEIGHT / 2, doorHalf + frameThickness / 2);
      lintel.position.set(dx, DOOR_HEIGHT + frameThickness / 2, 0);
      lintel.rotation.y = Math.PI / 2;
    }

    this.group.add(leftJamb);
    this.group.add(rightJamb);
    this.group.add(lintel);
  }

  // ---- Hanging lanterns --------------------------------------------------

  private addLanterns(config: BuildingConfig, _hw: number, _hd: number, h: number): void {
    const preset = LIGHT_PRESETS[config.lighting] ?? LIGHT_PRESETS['warm']!;
    const lanternCount = config.style === 'workshop' ? 4 : 2;
    const spacing = Math.min(config.width, config.depth) * 0.3;

    const positions: [number, number, number][] = lanternCount >= 4
      ? [[-spacing, h - 0.1, -spacing], [spacing, h - 0.1, -spacing],
         [-spacing, h - 0.1, spacing], [spacing, h - 0.1, spacing]]
      : [[-spacing, h - 0.1, 0], [spacing, h - 0.1, 0]];

    for (const [lx, ly, lz] of positions) {
      // Chain (thin cylinder)
      const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
      this.geometries.push(chainGeo);
      const chainMat = this.makeMat(0x555555);
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.position.set(lx, ly - 0.25, lz);
      this.group.add(chain);

      // Lantern body
      const lanternGeo = new THREE.SphereGeometry(0.18, 8, 6);
      this.geometries.push(lanternGeo);
      const lanternMat = this.makeMat(preset.color, preset.color, 0.8);
      lanternMat.transparent = true;
      lanternMat.opacity = 0.85;
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(lx, ly - 0.6, lz);
      this.group.add(lantern);

      // Point light from each lantern
      const lanternLight = new THREE.PointLight(preset.color, preset.intensity * 0.35, config.width * 0.6);
      lanternLight.position.set(lx, ly - 0.6, lz);
      this.group.add(lanternLight);
    }
  }

  // ---- Furniture ---------------------------------------------------------

  private addFurniture(config: BuildingConfig, hw: number, hd: number, _h: number): void {
    if (config.style === 'workshop') {
      this.addWorkshopFurniture(hw, hd);
    } else if (config.style === 'library') {
      this.addLibraryFurniture(hw, hd);
    }
    // Other biomes keep their existing scene-graph objects from the core
  }

  private addWorkshopFurniture(hw: number, hd: number): void {
    const woodMat = this.makeMat(0x5a3a1a);
    const darkWoodMat = this.makeMat(0x3a2210);
    const metalMat = this.makeMat(0x555555, 0x000000, 0);
    metalMat.metalness = 0.6;
    metalMat.roughness = 0.3;

    // --- Workbenches against walls ---

    // North wall workbench (long)
    this.addWorkbench(-hw + 2, -hd + 1.2, hw * 2 - 4, woodMat, darkWoodMat);

    // East wall workbench
    this.addWallBench(hw - 1.2, -hd + 3, 4, woodMat, darkWoodMat, Math.PI / 2);

    // West wall workbench
    this.addWallBench(-hw + 1.2, -hd + 3, 4, woodMat, darkWoodMat, -Math.PI / 2);

    // --- Central anvil ---
    const anvilBaseGeo = new THREE.BoxGeometry(0.6, 0.5, 0.4);
    this.geometries.push(anvilBaseGeo);
    const anvilBase = new THREE.Mesh(anvilBaseGeo, metalMat);
    anvilBase.position.set(0, 0.25, 0);
    this.group.add(anvilBase);

    const anvilTopGeo = new THREE.BoxGeometry(0.8, 0.15, 0.5);
    this.geometries.push(anvilTopGeo);
    const anvilTop = new THREE.Mesh(anvilTopGeo, metalMat);
    anvilTop.position.set(0, 0.58, 0);
    this.group.add(anvilTop);

    // Horn
    const hornGeo = new THREE.ConeGeometry(0.12, 0.4, 6);
    this.geometries.push(hornGeo);
    const horn = new THREE.Mesh(hornGeo, metalMat);
    horn.position.set(0.5, 0.55, 0);
    horn.rotation.z = -Math.PI / 2;
    this.group.add(horn);

    // --- Tool rack on north wall ---
    this.addToolRack(-2, 1.8, -hd + 0.3, metalMat);
    this.addToolRack(2, 1.8, -hd + 0.3, metalMat);

    // --- Small objects on workbenches ---
    // Gear on east bench
    const gearGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 8);
    this.geometries.push(gearGeo);
    const gear = new THREE.Mesh(gearGeo, metalMat);
    gear.position.set(hw - 1.2, 0.88, -hd + 3.5);
    gear.rotation.x = Math.PI / 2;
    this.group.add(gear);

    // Small box on west bench
    const boxGeo = new THREE.BoxGeometry(0.3, 0.2, 0.25);
    this.geometries.push(boxGeo);
    const box = new THREE.Mesh(boxGeo, woodMat);
    box.position.set(-hw + 1.2, 0.95, -hd + 4);
    this.group.add(box);
  }

  private addWorkbench(x: number, z: number, width: number, topMat: THREE.MeshStandardMaterial, legMat: THREE.MeshStandardMaterial): void {
    const benchW = Math.min(width, 6);
    // Tabletop
    const topGeo = new THREE.BoxGeometry(benchW, 0.1, 1.0);
    this.geometries.push(topGeo);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x + benchW / 2, 0.85, z);
    this.group.add(top);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    this.geometries.push(legGeo);
    for (const [lx, lz] of [[x + 0.2, z - 0.4], [x + 0.2, z + 0.4],
                              [x + benchW - 0.2, z - 0.4], [x + benchW - 0.2, z + 0.4]]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.4, lz);
      this.group.add(leg);
    }

    // Shelf underneath
    const shelfGeo = new THREE.BoxGeometry(benchW - 0.4, 0.05, 0.7);
    this.geometries.push(shelfGeo);
    const shelf = new THREE.Mesh(shelfGeo, topMat);
    shelf.position.set(x + benchW / 2, 0.3, z);
    this.group.add(shelf);
  }

  private addWallBench(x: number, z: number, depth: number, topMat: THREE.MeshStandardMaterial, legMat: THREE.MeshStandardMaterial, _rotY: number): void {
    // Table top
    const topGeo = new THREE.BoxGeometry(1.0, 0.1, depth);
    this.geometries.push(topGeo);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x, 0.85, z + depth / 2);
    this.group.add(top);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    this.geometries.push(legGeo);
    for (const [lx, lz] of [[x - 0.4, z + 0.2], [x + 0.4, z + 0.2],
                              [x - 0.4, z + depth - 0.2], [x + 0.4, z + depth - 0.2]]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.4, lz);
      this.group.add(leg);
    }
  }

  private addToolRack(x: number, y: number, z: number, metalMat: THREE.MeshStandardMaterial): void {
    // Horizontal bar
    const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6);
    this.geometries.push(barGeo);
    const bar = new THREE.Mesh(barGeo, metalMat);
    bar.position.set(x, y, z);
    bar.rotation.z = Math.PI / 2;
    this.group.add(bar);

    // Hooks / tool shapes hanging from bar
    for (let i = 0; i < 3; i++) {
      const hookGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4);
      this.geometries.push(hookGeo);
      const hook = new THREE.Mesh(hookGeo, metalMat);
      hook.position.set(x - 0.5 + i * 0.5, y - 0.2, z + 0.05);
      this.group.add(hook);
    }
  }

  private addLibraryFurniture(hw: number, hd: number): void {
    const woodMat = this.makeMat(0x6b4423);

    // Bookshelves against east and west walls
    for (const side of [-1, 1]) {
      const x = side * (hw - 0.6);
      for (let row = 0; row < 3; row++) {
        const z = -hd + 2 + row * 3;
        const shelfGeo = new THREE.BoxGeometry(0.8, 2.5, 1.8);
        this.geometries.push(shelfGeo);
        const shelf = new THREE.Mesh(shelfGeo, woodMat);
        shelf.position.set(x, 1.25, z);
        this.group.add(shelf);
      }
    }
  }

  // ---- Dust motes --------------------------------------------------------

  private addDustParticles(config: BuildingConfig, hw: number, hd: number, h: number): void {
    const positions = new Float32Array(DUST_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(DUST_PARTICLE_COUNT * 3);

    for (let i = 0; i < DUST_PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * hw * 1.6;
      positions[i * 3 + 1] = 0.3 + Math.random() * (h - 0.6);
      positions[i * 3 + 2] = (Math.random() - 0.5) * hd * 1.6;

      velocities[i * 3]     = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = 0.001 + Math.random() * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometries.push(geo);

    const preset = LIGHT_PRESETS[config.lighting] ?? LIGHT_PRESETS['warm']!;
    const mat = new THREE.PointsMaterial({
      size: 0.03,
      color: preset.color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.materials.push(mat);

    this.dustParticles = new THREE.Points(geo, mat);
    this.dustParticles.userData = { hw, hd, h };
    this.dustVelocities = velocities;
    this.group.add(this.dustParticles);
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
    const windowMat = this.makeMat(0xadd8e6, 0xfff5e6, 0.4);
    windowMat.transparent = true;
    windowMat.opacity = 0.35;

    const doorWall = config.doorWall;
    const windowH = Math.min(1.5, height * 0.3);
    const windowY = height * 0.65;

    // Add windows to non-door walls
    const walls: { pos: [number, number, number]; rot: [number, number, number]; show: boolean; lightDir: [number, number, number] }[] = [
      { pos: [0, windowY, -hd + 0.01], rot: [0, 0, 0], show: doorWall !== 'north', lightDir: [0, -0.5, 1] },
      { pos: [0, windowY, hd - 0.01], rot: [0, Math.PI, 0], show: doorWall !== 'south', lightDir: [0, -0.5, -1] },
      { pos: [-hw + 0.01, windowY, 0], rot: [0, Math.PI / 2, 0], show: doorWall !== 'west', lightDir: [1, -0.5, 0] },
      { pos: [hw - 0.01, windowY, 0], rot: [0, -Math.PI / 2, 0], show: doorWall !== 'east', lightDir: [-1, -0.5, 0] },
    ];

    let windowCount = 0;
    for (const w of walls) {
      if (!w.show || windowCount >= 3) continue;
      windowCount++;

      const geo = new THREE.PlaneGeometry(2, windowH);
      this.geometries.push(geo);
      const win = new THREE.Mesh(geo, windowMat);
      win.position.set(...w.pos);
      win.rotation.set(...w.rot);
      this.group.add(win);

      // Volumetric light beam from each window (subtle cone)
      const beamLen = Math.min(config.width, config.depth) * 0.4;
      const beamGeo = new THREE.ConeGeometry(1.2, beamLen, 8, 1, true);
      this.geometries.push(beamGeo);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfff5e6,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      this.materials.push(beamMat);
      const beam = new THREE.Mesh(beamGeo, beamMat);

      // Position beam extending from window into the room
      const bx = w.pos[0] + w.lightDir[0] * beamLen * 0.4;
      const by = w.pos[1] + w.lightDir[1] * beamLen * 0.4;
      const bz = w.pos[2] + w.lightDir[2] * beamLen * 0.4;
      beam.position.set(bx, by, bz);

      // Rotate beam to point from window into room
      beam.lookAt(bx + w.lightDir[0], by + w.lightDir[1], bz + w.lightDir[2]);
      beam.rotateX(Math.PI / 2);

      this.group.add(beam);
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
