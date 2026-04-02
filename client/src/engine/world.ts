import * as THREE from 'three';
import type { WorldObject, BiomeChunk, AABB, Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Color palette (Foundation tier — bright, saturated, safe)
// ---------------------------------------------------------------------------
const FROST = 0x22d3ee;
const AURORA = 0xa78bfa;
const GRASS = 0x4ade80;
const WOOD = 0xc2956b;
const STONE = 0x94a3b8;
const SKY_TOP = 0x7dd3fc;
const SKY_BOTTOM = 0xfbcfe8;

// ---------------------------------------------------------------------------
// Material cache — share materials across identical objects to save GPU memory
// ---------------------------------------------------------------------------
class MaterialCache {
  private readonly cache = new Map<string, THREE.MeshStandardMaterial>();

  get(color: number, roughness: number, metalness: number): THREE.MeshStandardMaterial {
    const key = `${color}:${roughness}:${metalness}`;
    let mat = this.cache.get(key);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      this.cache.set(key, mat);
    }
    return mat;
  }

  dispose(): void {
    for (const mat of this.cache.values()) mat.dispose();
    this.cache.clear();
  }
}

// ---------------------------------------------------------------------------
// Geometry cache — share geometries across identically-sized objects
// ---------------------------------------------------------------------------
class GeometryCache {
  private readonly cache = new Map<string, THREE.BufferGeometry>();

  box(w: number, h: number, d: number, segs = 1): THREE.BoxGeometry {
    const key = `box:${w}:${h}:${d}:${segs}`;
    let geom = this.cache.get(key);
    if (!geom) {
      geom = new THREE.BoxGeometry(w, h, d, segs, segs, segs);
      this.cache.set(key, geom);
    }
    return geom as THREE.BoxGeometry;
  }

  sphere(radius: number, segs = 16): THREE.SphereGeometry {
    const key = `sphere:${radius}:${segs}`;
    let geom = this.cache.get(key);
    if (!geom) {
      geom = new THREE.SphereGeometry(radius, segs, segs);
      this.cache.set(key, geom);
    }
    return geom as THREE.SphereGeometry;
  }

  cylinder(rTop: number, rBot: number, h: number, segs = 12): THREE.CylinderGeometry {
    const key = `cyl:${rTop}:${rBot}:${h}:${segs}`;
    let geom = this.cache.get(key);
    if (!geom) {
      geom = new THREE.CylinderGeometry(rTop, rBot, h, segs);
      this.cache.set(key, geom);
    }
    return geom as THREE.CylinderGeometry;
  }

  plane(w: number, h: number, segs = 1): THREE.PlaneGeometry {
    const key = `plane:${w}:${h}:${segs}`;
    let geom = this.cache.get(key);
    if (!geom) {
      geom = new THREE.PlaneGeometry(w, h, segs, segs);
      this.cache.set(key, geom);
    }
    return geom as THREE.PlaneGeometry;
  }

  dispose(): void {
    for (const geom of this.cache.values()) geom.dispose();
    this.cache.clear();
  }
}

// ---------------------------------------------------------------------------
// Collision helpers
// ---------------------------------------------------------------------------

function computeAABB(mesh: THREE.Mesh): AABB {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox!;
  const min = box.min.clone().add(mesh.position);
  const max = box.max.clone().add(mesh.position);
  return { min, max };
}

// ---------------------------------------------------------------------------
// World Engine
// ---------------------------------------------------------------------------

export class World implements Disposable {
  readonly scene: THREE.Scene;
  private readonly objects: WorldObject[] = [];
  private readonly chunks: BiomeChunk[] = [];
  private readonly materials = new MaterialCache();
  private readonly geometries = new GeometryCache();
  private disposed = false;

  constructor(scene?: THREE.Scene) {
    this.scene = scene ?? new THREE.Scene();
  }

  setup(): void {
    this.setupSky();
    this.setupGround();
    this.setupLighting();
    this.setupWorkshop();
  }

  getObjects(): ReadonlyArray<WorldObject> {
    return this.objects;
  }

  getChunks(): ReadonlyArray<BiomeChunk> {
    return this.chunks;
  }

  findNearestInteractable(position: THREE.Vector3): WorldObject | null {
    let best: WorldObject | null = null;
    let bestDist = Infinity;
    for (const obj of this.objects) {
      const dist = position.distanceTo(obj.position);
      if (dist <= obj.interactionRadius && dist < bestDist) {
        best = obj;
        bestDist = dist;
      }
    }
    return best;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else if (mat) {
          mat.dispose();
        }
      }
    });
    this.geometries.dispose();
    this.materials.dispose();
    this.objects.length = 0;
    this.chunks.length = 0;
  }

  private setupSky(): void {
    this.scene.background = new THREE.Color(SKY_TOP);
    this.scene.fog = new THREE.FogExp2(SKY_TOP, 0.012);
  }

  private setupGround(): void {
    const geom = this.geometries.plane(200, 200, 32);
    const mat = this.materials.get(GRASS, 0.9, 0.0);
    const ground = new THREE.Mesh(geom, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);

    const grid = new THREE.GridHelper(200, 40, 0x38bdf8, 0x38bdf8);
    const gridMat = grid.material as THREE.Material;
    gridMat.opacity = 0.08;
    gridMat.transparent = true;
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xfff4e6, 0.6);
    this.scene.add(ambient);
    const hemi = new THREE.HemisphereLight(SKY_TOP, SKY_BOTTOM, 0.5);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.0);
    sun.position.set(30, 50, 20);
    sun.castShadow = false;
    this.scene.add(sun);
  }

  private setupWorkshop(): void {
    const chunk: BiomeChunk = { id: 'workshop-01', biomeType: 'workshop', objects: [] };

    const bench = this.makeMesh(this.geometries.box(2.4, 0.9, 1.2, 4), this.materials.get(WOOD, 0.7, 0.05));
    bench.position.set(0, 0.45, -4);
    this.addWorldObject(bench, { id: 'workbench', type: 'structure', interactionRadius: 2.5, teaches: ['crafting-basics'] }, chunk);

    const toolColors = [FROST, AURORA];
    const toolIds = ['tool-hammer', 'tool-wrench'];
    const toolGeom = this.geometries.cylinder(0.06, 0.06, 0.6, 12);
    for (let i = 0; i < 2; i++) {
      const tool = this.makeMesh(toolGeom, this.materials.get(toolColors[i], 0.3, 0.4));
      tool.position.set(-0.4 + i * 0.8, 0.95 + 0.3, -4);
      tool.rotation.z = (Math.PI / 6) * (i === 0 ? 1 : -1);
      this.addWorldObject(tool, { id: toolIds[i], type: 'item', interactionRadius: 1.5, teaches: ['tool-use'] }, chunk);
    }

    const sphereColors = [0xef4444, 0xfbbf24, FROST];
    const sphereIds = ['material-red', 'material-gold', 'material-frost'];
    const sphereGeom = this.geometries.sphere(0.25, 16);
    for (let i = 0; i < 3; i++) {
      const sphere = this.makeMesh(sphereGeom, this.materials.get(sphereColors[i], 0.4, 0.1));
      sphere.position.set(-2 + i * 1.2, 0.25, -2);
      this.addWorldObject(sphere, { id: sphereIds[i], type: 'item', interactionRadius: 1.2, teaches: ['material-properties'] }, chunk);
    }

    const houseWalls = this.makeMesh(this.geometries.box(3, 2.4, 3, 4), this.materials.get(STONE, 0.8, 0.05));
    houseWalls.position.set(6, 1.2, -6);
    this.addWorldObject(houseWalls, { id: 'house', type: 'structure', interactionRadius: 4, teaches: ['geometry-basics'] }, chunk);

    const roof = this.makeMesh(this.geometries.box(3.6, 0.4, 3.6, 4), this.materials.get(0xef4444, 0.6, 0.05));
    roof.position.set(6, 2.6, -6);
    this.scene.add(roof);

    const pillarGeom = this.geometries.box(0.5, 3, 0.5, 4);
    const pillarMat = this.materials.get(AURORA, 0.6, 0.08);
    const pillarL = this.makeMesh(pillarGeom, pillarMat);
    pillarL.position.set(-5, 1.5, -5);
    this.scene.add(pillarL);
    const pillarR = this.makeMesh(pillarGeom, pillarMat);
    pillarR.position.set(-3, 1.5, -5);
    this.scene.add(pillarR);

    const lintel = this.makeMesh(this.geometries.box(3, 0.5, 0.5, 4), this.materials.get(FROST, 0.5, 0.1));
    lintel.position.set(-4, 3.25, -5);
    this.addWorldObject(lintel, { id: 'archway', type: 'portal', interactionRadius: 3, requiredKnowledge: ['geometry-basics'] }, chunk);

    const cubeColors = [FROST, AURORA];
    const cubeIds = ['cube-frost', 'cube-aurora'];
    const cubeGeom = this.geometries.box(0.6, 0.6, 0.6, 4);
    for (let i = 0; i < 2; i++) {
      const cube = this.makeMesh(cubeGeom, this.materials.get(cubeColors[i], 0.5, 0.1));
      cube.position.set(3 + i * 1.5, 0.3, -1);
      this.addWorldObject(cube, { id: cubeIds[i], type: 'item', interactionRadius: 1.2 }, chunk);
    }

    this.chunks.push(chunk);
  }

  private makeMesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(geometry, material);
  }

  private addWorldObject(
    mesh: THREE.Mesh,
    opts: Omit<WorldObject, 'position' | 'mesh' | 'aabb'>,
    chunk: BiomeChunk,
  ): void {
    this.scene.add(mesh);
    const wo: WorldObject = { ...opts, position: mesh.position.clone(), mesh, aabb: computeAABB(mesh) };
    this.objects.push(wo);
    chunk.objects.push(wo);
  }
}
