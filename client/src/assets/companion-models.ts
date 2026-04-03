import * as THREE from 'three';
import type { MasteryTier, Vec3 } from '@nexus-academy/core';
import type { Disposable } from '../types.js';
import { ProceduralModelGenerator } from './procedural-models.js';
import { MaterialLibrary } from './materials.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COMPANION_TYPES = [
  'fox', 'owl', 'rabbit', 'bear', 'cat', 'dragon',
] as const;

export type CompanionType = (typeof COMPANION_TYPES)[number];

// ---------------------------------------------------------------------------
// CompanionModel — returned by the generator, wraps a THREE.Group with
// animation methods that bring each character to life.
// ---------------------------------------------------------------------------

export interface CompanionModel extends Disposable {
  readonly type: string;
  readonly group: THREE.Group;
  idle(time: number): void;
  speak(time: number): void;
  point(direction: Vec3): void;
  emote(emotion: string): void;
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Geometry / material helpers
// ---------------------------------------------------------------------------

function seg(tier: MasteryTier): number {
  return tier === 'foundation' ? 8 : tier === 'discovery' ? 12 : 16;
}

function makeGroup(...children: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

function m(
  geom: THREE.BufferGeometry,
  mat: THREE.Material,
  pos?: [number, number, number],
  rot?: [number, number, number],
  scale?: [number, number, number],
): THREE.Mesh {
  const obj = new THREE.Mesh(geom, mat);
  if (pos) obj.position.set(...pos);
  if (rot) obj.rotation.set(...rot);
  if (scale) obj.scale.set(...scale);
  obj.castShadow = true;
  obj.receiveShadow = true;
  return obj;
}

/** Create a MeshStandardMaterial with tier-aware warmth. */
function mat(
  color: number,
  tier: MasteryTier,
  opts: {
    roughness?: number;
    metalness?: number;
    emissive?: number;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    side?: THREE.Side;
  } = {},
): THREE.MeshStandardMaterial {
  const foundationGlow = tier === 'foundation' ? 0.06 : 0;
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? color,
    emissiveIntensity: foundationGlow + (opts.emissiveIntensity ?? 0),
    ...(opts.transparent
      ? { transparent: true, opacity: opts.opacity ?? 0.8 }
      : {}),
    ...(opts.side ? { side: opts.side } : {}),
  });
}

/** Eye material with subtle emissive glow for life-like quality. */
function eyeWhite(tier: MasteryTier): THREE.MeshStandardMaterial {
  return mat(0xffffff, tier, {
    roughness: 0.3,
    emissive: 0xffffff,
    emissiveIntensity: 0.15,
  });
}

function eyePupil(color: number, tier: MasteryTier): THREE.MeshStandardMaterial {
  return mat(color, tier, {
    roughness: 0.4,
    emissive: color,
    emissiveIntensity: 0.1,
  });
}

// ---------------------------------------------------------------------------
// DefaultCompanionModel — common animation logic for all companion types
// ---------------------------------------------------------------------------

class DefaultCompanionModel implements CompanionModel {
  readonly type: string;
  readonly group: THREE.Group;

  private readonly head: THREE.Object3D | null;
  private readonly body: THREE.Object3D | null;
  private readonly tail: THREE.Object3D | null;
  private readonly earL: THREE.Object3D | null;
  private readonly earR: THREE.Object3D | null;
  private readonly wingL: THREE.Object3D | null;
  private readonly wingR: THREE.Object3D | null;
  private readonly materials: THREE.Material[];

  // Store base transforms so animation is additive
  private readonly headBaseY: number;
  private readonly headBaseRotX: number;
  private readonly tailBaseRotZ: number;

  private emoteState: string | null = null;
  private emoteStart = 0;

  constructor(
    type: string,
    group: THREE.Group,
    materials: THREE.Material[],
  ) {
    this.type = type;
    this.group = group;
    this.materials = materials;

    this.head = group.getObjectByName('head') ?? null;
    this.body = group.getObjectByName('body') ?? null;
    this.tail = group.getObjectByName('tail') ?? null;
    this.earL = group.getObjectByName('earL') ?? null;
    this.earR = group.getObjectByName('earR') ?? null;
    this.wingL = group.getObjectByName('wingL') ?? null;
    this.wingR = group.getObjectByName('wingR') ?? null;

    this.headBaseY = this.head?.position.y ?? 0;
    this.headBaseRotX = this.head?.rotation.x ?? 0;
    this.tailBaseRotZ = this.tail?.rotation.z ?? 0;
  }

  idle(time: number): void {
    const t = time;

    // Gentle whole-body bob
    this.group.position.y = Math.sin(t * 1.2) * 0.008;

    // Per-type idle flavour
    switch (this.type) {
      case 'fox':
        this.applyFoxIdle(t);
        break;
      case 'owl':
        this.applyOwlIdle(t);
        break;
      case 'rabbit':
        this.applyRabbitIdle(t);
        break;
      case 'bear':
        this.applyBearIdle(t);
        break;
      case 'cat':
        this.applyCatIdle(t);
        break;
      case 'dragon':
        this.applyDragonIdle(t);
        break;
    }

    // Emote overlay
    if (this.emoteState) {
      const elapsed = t - this.emoteStart;
      this.applyEmoteOverlay(this.emoteState, elapsed);
      if (elapsed > 1.5) this.emoteState = null;
    }
  }

  speak(time: number): void {
    // Head bobs rhythmically as if talking
    if (this.head) {
      this.head.rotation.x =
        this.headBaseRotX + Math.sin(time * 8) * 0.06;
      this.head.position.y =
        this.headBaseY + Math.abs(Math.sin(time * 8)) * 0.005;
    }
    // Slight body lean forward
    this.group.rotation.x = Math.sin(time * 6) * 0.015;
  }

  point(direction: Vec3): void {
    const angle = Math.atan2(direction.x, direction.z);
    this.group.rotation.y = angle;
    // Tilt slightly toward the direction
    if (this.head) {
      this.head.rotation.y = 0;
      this.head.rotation.x = this.headBaseRotX - 0.15;
    }
  }

  emote(emotion: string): void {
    this.emoteState = emotion;
    this.emoteStart = performance.now() / 1000;
  }

  dispose(): void {
    this.group.removeFromParent();
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    for (const mtl of this.materials) mtl.dispose();
  }

  // --- Per-type idle animations -------------------------------------------

  private applyFoxIdle(t: number): void {
    // Head tilt
    if (this.head) {
      this.head.rotation.z = Math.sin(t * 0.8) * 0.1;
    }
    // Ears perk up alternating
    if (this.earL) this.earL.rotation.x = Math.sin(t * 1.5) * 0.08;
    if (this.earR) this.earR.rotation.x = Math.sin(t * 1.5 + 1.0) * 0.08;
    // Tail swish
    if (this.tail) {
      this.tail.rotation.z = this.tailBaseRotZ + Math.sin(t * 2.0) * 0.25;
    }
    // Gentle body sway
    this.group.rotation.z = Math.sin(t * 0.6) * 0.02;
  }

  private applyOwlIdle(t: number): void {
    // Slow blink: scale eyes Y toward 0 briefly every ~4s
    const blinkPhase = (t % 4.0) / 4.0;
    const blinkScale = blinkPhase < 0.05 ? 0.1 : 1.0;
    const eyeL = this.group.getObjectByName('eyeL');
    const eyeR = this.group.getObjectByName('eyeR');
    if (eyeL) eyeL.scale.y = blinkScale;
    if (eyeR) eyeR.scale.y = blinkScale;
    // Head rotate slowly side to side
    if (this.head) {
      this.head.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
    // Slight wing ruffle
    if (this.wingL) this.wingL.rotation.z = Math.sin(t * 1.2) * 0.04;
    if (this.wingR) this.wingR.rotation.z = -Math.sin(t * 1.2) * 0.04;
  }

  private applyRabbitIdle(t: number): void {
    // Ear flops: gentle wave
    if (this.earL) this.earL.rotation.z = Math.sin(t * 1.0) * 0.08;
    if (this.earR) this.earR.rotation.z = -Math.sin(t * 1.0 + 0.5) * 0.08;
    // Nose twitch: tiny head bob
    if (this.head) {
      this.head.position.y =
        this.headBaseY + Math.abs(Math.sin(t * 3.0)) * 0.003;
      this.head.rotation.x = this.headBaseRotX + Math.sin(t * 3.0) * 0.02;
    }
    // Gentle hop: slight vertical bounce every ~3s
    const hopPhase = (t % 3.0) / 3.0;
    if (hopPhase < 0.1) {
      this.group.position.y = Math.sin(hopPhase * Math.PI / 0.1) * 0.015;
    }
  }

  private applyBearIdle(t: number): void {
    // Slow nods
    if (this.head) {
      this.head.rotation.x =
        this.headBaseRotX + Math.sin(t * 0.6) * 0.05;
    }
    // Gentle sway — steady, solid presence
    this.group.rotation.z = Math.sin(t * 0.4) * 0.015;
    // Slow breathing: body scale pulse
    if (this.body) {
      const breath = 1.0 + Math.sin(t * 0.8) * 0.01;
      this.body.scale.set(breath, breath, breath);
    }
  }

  private applyCatIdle(t: number): void {
    // Tail flick: sharp sine wave
    if (this.tail) {
      this.tail.rotation.z =
        this.tailBaseRotZ + Math.sin(t * 2.5) * 0.3;
      this.tail.rotation.x = Math.sin(t * 1.8) * 0.1;
    }
    // Slow blink every ~5s
    const blinkPhase = (t % 5.0) / 5.0;
    const blinkScale = blinkPhase < 0.06 ? 0.15 : 1.0;
    const eyeL = this.group.getObjectByName('eyeL');
    const eyeR = this.group.getObjectByName('eyeR');
    if (eyeL) eyeL.scale.y = blinkScale;
    if (eyeR) eyeR.scale.y = blinkScale;
    // Head tilt
    if (this.head) {
      this.head.rotation.z = Math.sin(t * 0.7) * 0.06;
    }
  }

  private applyDragonIdle(t: number): void {
    // Wing flutters
    if (this.wingL) {
      this.wingL.rotation.z = Math.sin(t * 3.0) * 0.15;
    }
    if (this.wingR) {
      this.wingR.rotation.z = -Math.sin(t * 3.0) * 0.15;
    }
    // Excited bounces — quicker bob
    this.group.position.y = Math.abs(Math.sin(t * 2.0)) * 0.012;
    // Tail sway
    if (this.tail) {
      this.tail.rotation.z = this.tailBaseRotZ + Math.sin(t * 1.5) * 0.2;
    }
    // Flame puff: tiny sphere fades in/out every ~6s
    const flame = this.group.getObjectByName('flame');
    if (flame) {
      const phase = (t % 6.0) / 6.0;
      const visible = phase > 0.8 && phase < 0.95;
      flame.visible = visible;
      if (visible) {
        const flameT = (phase - 0.8) / 0.15;
        flame.scale.setScalar(0.5 + flameT * 0.5);
        const flameMat = (flame as THREE.Mesh).material;
        if (flameMat instanceof THREE.MeshStandardMaterial) {
          flameMat.opacity = 1.0 - flameT * 0.8;
        }
      }
    }
  }

  // --- Emote overlay (blended on top of idle) ------------------------------

  private applyEmoteOverlay(emotion: string, elapsed: number): void {
    const t = Math.min(elapsed / 1.5, 1.0); // 0→1 over 1.5s
    switch (emotion) {
      case 'excited': {
        // Quick bounce
        const bounce = Math.sin(elapsed * 12) * 0.025 * (1.0 - t);
        this.group.position.y += bounce;
        break;
      }
      case 'curious': {
        // Head tilt to side
        if (this.head) {
          this.head.rotation.z += 0.2 * (1.0 - t);
        }
        break;
      }
      case 'encouraging': {
        // Happy bob with slight lean forward
        this.group.position.y += Math.sin(elapsed * 6) * 0.015 * (1.0 - t);
        this.group.rotation.x += 0.05 * (1.0 - t);
        break;
      }
      case 'thoughtful': {
        // Slow head tilt down
        if (this.head) {
          this.head.rotation.x += -0.15 * (1.0 - t);
        }
        this.group.rotation.z += Math.sin(elapsed * 0.5) * 0.02;
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// CompanionModelGenerator
// ---------------------------------------------------------------------------

type BuildFn = (
  geo: ProceduralModelGenerator,
  tier: MasteryTier,
) => { group: THREE.Group; materials: THREE.Material[] };

export class CompanionModelGenerator implements Disposable {
  private readonly geo: ProceduralModelGenerator;

  constructor(lib: MaterialLibrary, geo: ProceduralModelGenerator) {
    // lib kept for future preset use; geo provides cached geometries
    void lib;
    this.geo = geo;
  }

  generate(type: string, tier: MasteryTier): CompanionModel {
    const fn = BUILDERS[type as CompanionType];
    if (!fn) {
      throw new Error(`Unknown companion type: "${type}"`);
    }
    const { group, materials } = fn(this.geo, tier);
    group.userData.companionType = type;
    group.userData.tier = tier;
    return new DefaultCompanionModel(type, group, materials);
  }

  dispose(): void {
    // Geometries owned by the ProceduralModelGenerator; nothing extra here.
  }
}

// ---------------------------------------------------------------------------
// Builder functions — one per companion type
// ---------------------------------------------------------------------------

const BUILDERS: Record<CompanionType, BuildFn> = {

  // =======================================================================
  // FOX — Curious Explorer
  // =======================================================================
  fox: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const orange = push(mat(0xe8751a, tier, { roughness: 0.75 }));
    const lightOrange = push(mat(0xf5a623, tier, { roughness: 0.8 }));
    const white = push(mat(0xffffff, tier, { roughness: 0.8 }));
    const eyeW = push(eyeWhite(tier));
    const pupil = push(eyePupil(0x111111, tier));

    // Body — elongated sphere
    const body = m(g.sphere(0.07, s, s), orange, [0, 0.12, 0], undefined, [1.0, 0.85, 0.9]);
    body.name = 'body';

    // Head
    const head = m(g.sphere(0.06, s, s), orange, [0, 0.26, 0.02]);
    head.name = 'head';

    // Eyes — BIG (defining trait of Foundation tier)
    const eyeSize = tier === 'foundation' ? 0.022 : 0.018;
    const eyeLW = m(g.sphere(eyeSize, s, s), eyeW, [0.025, 0.28, 0.055]);
    eyeLW.name = 'eyeL';
    const eyeRW = m(g.sphere(eyeSize, s, s), eyeW, [-0.025, 0.28, 0.055]);
    eyeRW.name = 'eyeR';
    const pupilL = m(g.sphere(eyeSize * 0.5, 6, 6), pupil, [0.025, 0.28, 0.055 + eyeSize * 0.6]);
    const pupilR = m(g.sphere(eyeSize * 0.5, 6, 6), pupil, [-0.025, 0.28, 0.055 + eyeSize * 0.6]);

    // Snout
    const snout = m(g.cone(0.018, 0.035, s), lightOrange, [0, 0.245, 0.065], [Math.PI * 0.35, 0, 0]);
    // Nose tip
    const nose = m(g.sphere(0.007, 6, 6), pupil, [0, 0.25, 0.082]);

    // Ears — pointed cones
    const earL = m(g.cone(0.018, 0.045, s), orange, [0.03, 0.33, 0.0], [0, 0, -0.1]);
    earL.name = 'earL';
    const earR = m(g.cone(0.018, 0.045, s), orange, [-0.03, 0.33, 0.0], [0, 0, 0.1]);
    earR.name = 'earR';

    // Inner ears
    const earInnerL = m(g.cone(0.01, 0.03, s), lightOrange, [0.03, 0.33, 0.005], [0, 0, -0.1]);
    const earInnerR = m(g.cone(0.01, 0.03, s), lightOrange, [-0.03, 0.33, 0.005], [0, 0, 0.1]);

    // Tail — bushy, tapered, white-tipped
    const tail = m(g.cylinder(0.008, 0.03, 0.12, s), orange, [0, 0.13, -0.1], [0.6, 0, 0]);
    tail.name = 'tail';
    const tailTip = m(g.sphere(0.018, s, s), white, [0, 0.18, -0.16]);

    // Legs — four small cylinders
    const legMat = push(mat(0xd06010, tier, { roughness: 0.8 }));
    const legFL = m(g.cylinder(0.012, 0.012, 0.07, 6), legMat, [0.03, 0.035, 0.04]);
    const legFR = m(g.cylinder(0.012, 0.012, 0.07, 6), legMat, [-0.03, 0.035, 0.04]);
    const legBL = m(g.cylinder(0.012, 0.012, 0.07, 6), legMat, [0.03, 0.035, -0.04]);
    const legBR = m(g.cylinder(0.012, 0.012, 0.07, 6), legMat, [-0.03, 0.035, -0.04]);

    // Belly highlight
    const belly = m(g.sphere(0.045, s, s), white, [0, 0.11, 0.03], undefined, [0.7, 0.7, 0.5]);

    const group = makeGroup(
      body, belly, head, eyeLW, eyeRW, pupilL, pupilR,
      snout, nose, earL, earR, earInnerL, earInnerR,
      tail, tailTip, legFL, legFR, legBL, legBR,
    );

    // Builder+ detail: tiny eyebrow marks
    if (tier !== 'foundation' && tier !== 'discovery') {
      const brow = push(mat(0x8b4513, tier, { roughness: 0.9 }));
      const browL = m(g.box(0.012, 0.003, 0.003, 1), brow, [0.025, 0.295, 0.06]);
      const browR = m(g.box(0.012, 0.003, 0.003, 1), brow, [-0.025, 0.295, 0.06]);
      group.add(browL, browR);
    }

    return { group, materials: mats };
  },

  // =======================================================================
  // OWL — Wise Observer
  // =======================================================================
  owl: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const brown = push(mat(0x8b7355, tier, { roughness: 0.8 }));
    const lightBrown = push(mat(0xc4a87c, tier, { roughness: 0.85 }));
    const eyeW = push(eyeWhite(tier));
    const amber = push(eyePupil(0xe89020, tier));
    const pupilMat = push(eyePupil(0x111111, tier));
    const gold = push(mat(0xdaa520, tier, { roughness: 0.6 }));

    // Body — round
    const body = m(g.sphere(0.085, s, s), brown, [0, 0.1, 0]);
    body.name = 'body';

    // Belly circle — lighter front
    const belly = m(g.sphere(0.06, s, s), lightBrown, [0, 0.09, 0.035], undefined, [0.8, 0.9, 0.5]);

    // Head — larger ratio (big-head = cute)
    const head = m(g.sphere(0.075, s, s), brown, [0, 0.25, 0]);
    head.name = 'head';

    // Facial disc — lighter ring around eyes
    const disc = m(g.sphere(0.065, s, s), lightBrown, [0, 0.255, 0.02], undefined, [0.9, 0.85, 0.4]);

    // Eyes — HUGE (the defining feature)
    const eyeSize = tier === 'foundation' ? 0.03 : 0.025;
    const irisSize = eyeSize * 0.7;
    const pupilSize = eyeSize * 0.35;

    const eyeLW = m(g.sphere(eyeSize, s, s), eyeW, [0.035, 0.265, 0.055]);
    eyeLW.name = 'eyeL';
    const eyeRW = m(g.sphere(eyeSize, s, s), eyeW, [-0.035, 0.265, 0.055]);
    eyeRW.name = 'eyeR';
    const irisL = m(g.sphere(irisSize, s, s), amber, [0.035, 0.265, 0.055 + eyeSize * 0.45]);
    const irisR = m(g.sphere(irisSize, s, s), amber, [-0.035, 0.265, 0.055 + eyeSize * 0.45]);
    const pupilL = m(g.sphere(pupilSize, 6, 6), pupilMat, [0.035, 0.265, 0.055 + eyeSize * 0.7]);
    const pupilR = m(g.sphere(pupilSize, 6, 6), pupilMat, [-0.035, 0.265, 0.055 + eyeSize * 0.7]);

    // Beak — small downward triangle / cone
    const beak = m(g.cone(0.012, 0.02, s), gold, [0, 0.24, 0.07], [Math.PI * 0.6, 0, 0]);

    // Wings — flattened ellipsoids tucked at sides
    const wingL = m(g.sphere(0.06, s, s), brown, [0.09, 0.12, -0.01], [0, 0, 0.15], [0.4, 0.9, 0.7]);
    wingL.name = 'wingL';
    const wingR = m(g.sphere(0.06, s, s), brown, [-0.09, 0.12, -0.01], [0, 0, -0.15], [0.4, 0.9, 0.7]);
    wingR.name = 'wingR';

    // Ear tufts
    const tuftL = m(g.cone(0.012, 0.035, s), brown, [0.04, 0.33, -0.01], [0, 0, -0.2]);
    tuftL.name = 'earL';
    const tuftR = m(g.cone(0.012, 0.035, s), brown, [-0.04, 0.33, -0.01], [0, 0, 0.2]);
    tuftR.name = 'earR';

    // Feet — small ovals
    const feetMat = push(mat(0xb8860b, tier, { roughness: 0.8 }));
    const footL = m(g.sphere(0.015, 6, 6), feetMat, [0.03, 0.01, 0.02], undefined, [1.2, 0.5, 1.5]);
    const footR = m(g.sphere(0.015, 6, 6), feetMat, [-0.03, 0.01, 0.02], undefined, [1.2, 0.5, 1.5]);

    const group = makeGroup(
      body, belly, head, disc, eyeLW, eyeRW, irisL, irisR, pupilL, pupilR,
      beak, wingL, wingR, tuftL, tuftR, footL, footR,
    );

    // Builder+: feather line details
    if (tier !== 'foundation' && tier !== 'discovery') {
      const featherMat = push(mat(0x6b5a3e, tier, { roughness: 0.9 }));
      for (let i = 0; i < 3; i++) {
        const y = 0.06 + i * 0.03;
        group.add(m(g.box(0.1, 0.002, 0.003, 1), featherMat, [0, y, 0.08]));
      }
    }

    return { group, materials: mats };
  },

  // =======================================================================
  // RABBIT — Gentle Friend
  // =======================================================================
  rabbit: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const cream = push(mat(0xf5f0e8, tier, { roughness: 0.85 }));
    const pink = push(mat(0xffb6c1, tier, { roughness: 0.75 }));
    const darkEye = push(eyePupil(0x332211, tier));
    const pureWhite = push(mat(0xffffff, tier, { roughness: 0.8 }));

    // Body — oval sphere
    const body = m(g.sphere(0.07, s, s), cream, [0, 0.1, 0], undefined, [0.9, 1.0, 0.85]);
    body.name = 'body';

    // Head
    const head = m(g.sphere(0.055, s, s), cream, [0, 0.22, 0.01]);
    head.name = 'head';

    // Cheeks — subtle roundness
    const cheekL = m(g.sphere(0.025, s, s), cream, [0.03, 0.21, 0.04]);
    const cheekR = m(g.sphere(0.025, s, s), cream, [-0.03, 0.21, 0.04]);

    // Eyes — round, dark, gentle
    const eyeSize = tier === 'foundation' ? 0.016 : 0.013;
    const eyeL = m(g.sphere(eyeSize, s, s), darkEye, [0.022, 0.235, 0.045]);
    eyeL.name = 'eyeL';
    const eyeR = m(g.sphere(eyeSize, s, s), darkEye, [-0.022, 0.235, 0.045]);
    eyeR.name = 'eyeR';
    // Eye highlights — tiny white dot for life
    const hlSize = eyeSize * 0.35;
    const hlL = m(g.sphere(hlSize, 4, 4), push(eyeWhite(tier)), [0.02, 0.238, 0.045 + eyeSize * 0.7]);
    const hlR = m(g.sphere(hlSize, 4, 4), push(eyeWhite(tier)), [-0.024, 0.238, 0.045 + eyeSize * 0.7]);

    // Nose — tiny pink sphere
    const nose = m(g.sphere(0.007, 6, 6), pink, [0, 0.225, 0.06]);

    // Ears — tall elongated ellipsoids
    const earL = m(g.sphere(0.02, s, s), cream, [0.022, 0.32, -0.005], [0.15, 0, -0.08], [0.6, 1.8, 0.5]);
    earL.name = 'earL';
    const earR = m(g.sphere(0.02, s, s), cream, [-0.022, 0.32, -0.005], [0.15, 0, 0.08], [0.6, 1.8, 0.5]);
    earR.name = 'earR';
    // Inner ear pink
    const earInnerL = m(g.sphere(0.012, s, s), pink, [0.022, 0.32, 0.0], [0.15, 0, -0.08], [0.4, 1.6, 0.3]);
    const earInnerR = m(g.sphere(0.012, s, s), pink, [-0.022, 0.32, 0.0], [0.15, 0, 0.08], [0.4, 1.6, 0.3]);

    // Tail — cotton-ball
    const tail = m(g.sphere(0.022, s, s), pureWhite, [0, 0.09, -0.075]);
    tail.name = 'tail';

    // Feet — two rounded blocks
    const footL = m(g.sphere(0.018, s, s), cream, [0.025, 0.012, 0.03], undefined, [0.9, 0.5, 1.3]);
    const footR = m(g.sphere(0.018, s, s), cream, [-0.025, 0.012, 0.03], undefined, [0.9, 0.5, 1.3]);

    const group = makeGroup(
      body, head, cheekL, cheekR, eyeL, eyeR, hlL, hlR,
      nose, earL, earR, earInnerL, earInnerR,
      tail, footL, footR,
    );

    // Builder+: whisker marks
    if (tier !== 'foundation' && tier !== 'discovery') {
      const whiskerMat = push(mat(0xdddddd, tier, { roughness: 0.5 }));
      group.add(m(g.cylinder(0.001, 0.001, 0.025, 3), whiskerMat, [0.035, 0.22, 0.05], [0, 0, 0.2]));
      group.add(m(g.cylinder(0.001, 0.001, 0.025, 3), whiskerMat, [0.038, 0.215, 0.048], [0, 0, 0.35]));
      group.add(m(g.cylinder(0.001, 0.001, 0.025, 3), whiskerMat, [-0.035, 0.22, 0.05], [0, 0, -0.2]));
      group.add(m(g.cylinder(0.001, 0.001, 0.025, 3), whiskerMat, [-0.038, 0.215, 0.048], [0, 0, -0.35]));
    }

    return { group, materials: mats };
  },

  // =======================================================================
  // BEAR — Steady Protector
  // =======================================================================
  bear: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const warmBrown = push(mat(0x8b6914, tier, { roughness: 0.85 }));
    const lightBrown = push(mat(0xc4a060, tier, { roughness: 0.9 }));
    const eyeW = push(eyeWhite(tier));
    const pupilMat = push(eyePupil(0x221100, tier));

    // Body — sturdy sphere
    const body = m(g.sphere(0.095, s, s), warmBrown, [0, 0.11, 0], undefined, [1.0, 0.9, 0.9]);
    body.name = 'body';

    // Belly
    const belly = m(g.sphere(0.065, s, s), lightBrown, [0, 0.1, 0.04], undefined, [0.8, 0.8, 0.5]);

    // Head
    const head = m(g.sphere(0.065, s, s), warmBrown, [0, 0.25, 0.01]);
    head.name = 'head';

    // Ears — small round on top
    const earL = m(g.sphere(0.018, s, s), warmBrown, [0.045, 0.31, 0]);
    earL.name = 'earL';
    const earR = m(g.sphere(0.018, s, s), warmBrown, [-0.045, 0.31, 0]);
    earR.name = 'earR';
    // Inner ears
    const earInnerL = m(g.sphere(0.01, 6, 6), lightBrown, [0.045, 0.312, 0.008]);
    const earInnerR = m(g.sphere(0.01, 6, 6), lightBrown, [-0.045, 0.312, 0.008]);

    // Eyes — small, warm, friendly
    const eyeSize = tier === 'foundation' ? 0.014 : 0.011;
    const eyeL = m(g.sphere(eyeSize, s, s), eyeW, [0.025, 0.265, 0.05]);
    eyeL.name = 'eyeL';
    const eyeR = m(g.sphere(eyeSize, s, s), eyeW, [-0.025, 0.265, 0.05]);
    eyeR.name = 'eyeR';
    const pupilL = m(g.sphere(eyeSize * 0.55, 6, 6), pupilMat, [0.025, 0.265, 0.05 + eyeSize * 0.55]);
    const pupilR = m(g.sphere(eyeSize * 0.55, 6, 6), pupilMat, [-0.025, 0.265, 0.05 + eyeSize * 0.55]);

    // Snout — lighter oval
    const snout = m(g.sphere(0.025, s, s), lightBrown, [0, 0.245, 0.055], undefined, [1.0, 0.7, 0.8]);
    const nose = m(g.sphere(0.008, 6, 6), pupilMat, [0, 0.25, 0.075]);

    // Arms — rounded cylinders at sides
    const armMat = push(mat(0x7a5a10, tier, { roughness: 0.85 }));
    const armL = m(g.cylinder(0.025, 0.022, 0.1, s), armMat, [0.1, 0.12, 0], [0, 0, -0.3]);
    armL.name = 'armL';
    const armR = m(g.cylinder(0.025, 0.022, 0.1, s), armMat, [-0.1, 0.12, 0], [0, 0, 0.3]);
    armR.name = 'armR';

    // Feet
    const footL = m(g.sphere(0.022, s, s), warmBrown, [0.035, 0.01, 0.02], undefined, [1.0, 0.5, 1.3]);
    const footR = m(g.sphere(0.022, s, s), warmBrown, [-0.035, 0.01, 0.02], undefined, [1.0, 0.5, 1.3]);

    const group = makeGroup(
      body, belly, head, earL, earR, earInnerL, earInnerR,
      eyeL, eyeR, pupilL, pupilR, snout, nose,
      armL, armR, footL, footR,
    );

    // Builder+: paw pad details
    if (tier !== 'foundation' && tier !== 'discovery') {
      const padMat = push(mat(0x5a4a1a, tier, { roughness: 1.0 }));
      group.add(m(g.sphere(0.008, 4, 4), padMat, [0.035, 0.005, 0.035]));
      group.add(m(g.sphere(0.008, 4, 4), padMat, [-0.035, 0.005, 0.035]));
    }

    return { group, materials: mats };
  },

  // =======================================================================
  // CAT — Playful Trickster
  // =======================================================================
  cat: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const grey = push(mat(0xa0a0a0, tier, { roughness: 0.7 }));
    const lightGrey = push(mat(0xd0d0d0, tier, { roughness: 0.8 }));
    const green = push(eyePupil(0x34d399, tier));
    const pupilMat = push(eyePupil(0x111111, tier));
    const pinkNose = push(mat(0xffa0b0, tier, { roughness: 0.6 }));

    // Body — sleek elongated
    const body = m(g.sphere(0.065, s, s), grey, [0, 0.1, 0], undefined, [0.85, 0.9, 1.1]);
    body.name = 'body';

    // Chest
    const chest = m(g.sphere(0.04, s, s), lightGrey, [0, 0.11, 0.03], undefined, [0.7, 0.75, 0.5]);

    // Head — slightly angular
    const head = m(g.sphere(0.05, s, s), grey, [0, 0.23, 0.02], undefined, [1.05, 0.95, 1.0]);
    head.name = 'head';

    // Ears — pointed triangles
    const earL = m(g.cone(0.016, 0.035, s), grey, [0.03, 0.29, 0.01], [0, 0, -0.15]);
    earL.name = 'earL';
    const earR = m(g.cone(0.016, 0.035, s), grey, [-0.03, 0.29, 0.01], [0, 0, 0.15]);
    earR.name = 'earR';
    const earInnerL = m(g.cone(0.009, 0.025, s), pinkNose, [0.03, 0.29, 0.015], [0, 0, -0.15]);
    const earInnerR = m(g.cone(0.009, 0.025, s), pinkNose, [-0.03, 0.29, 0.015], [0, 0, 0.15]);

    // Eyes — almond-shaped, green with vertical slit pupils
    const eyeSize = tier === 'foundation' ? 0.018 : 0.015;
    const eyeL = m(g.sphere(eyeSize, s, s), green, [0.022, 0.245, 0.05], undefined, [1.3, 0.85, 0.8]);
    eyeL.name = 'eyeL';
    const eyeR = m(g.sphere(eyeSize, s, s), green, [-0.022, 0.245, 0.05], undefined, [1.3, 0.85, 0.8]);
    eyeR.name = 'eyeR';

    // Vertical slit pupils
    const slitW = eyeSize * 0.2;
    const slitH = eyeSize * 0.8;
    const slitL = m(g.sphere(slitW, 4, 6), pupilMat, [0.022, 0.245, 0.05 + eyeSize * 0.5], undefined, [0.3, 1.0, 0.5]);
    const slitR = m(g.sphere(slitW, 4, 6), pupilMat, [-0.022, 0.245, 0.05 + eyeSize * 0.5], undefined, [0.3, 1.0, 0.5]);
    void slitH; // used conceptually in scale above

    // Nose
    const nose = m(g.sphere(0.006, 6, 6), pinkNose, [0, 0.232, 0.065]);

    // Mouth line — subtle
    const mouthMat = push(mat(0x666666, tier, { roughness: 0.5 }));
    const mouth = m(g.box(0.015, 0.002, 0.002, 1), mouthMat, [0, 0.224, 0.063]);

    // Tail — long curved cylinder
    const tail = m(g.cylinder(0.008, 0.005, 0.15, s), grey, [0, 0.14, -0.12], [0.8, 0, 0]);
    tail.name = 'tail';
    const tailTip = m(g.sphere(0.01, 6, 6), grey, [0, 0.21, -0.19]);

    // Legs
    const legMat = push(mat(0x909090, tier, { roughness: 0.75 }));
    const legFL = m(g.cylinder(0.01, 0.01, 0.065, 6), legMat, [0.025, 0.033, 0.04]);
    const legFR = m(g.cylinder(0.01, 0.01, 0.065, 6), legMat, [-0.025, 0.033, 0.04]);
    const legBL = m(g.cylinder(0.01, 0.01, 0.065, 6), legMat, [0.025, 0.033, -0.04]);
    const legBR = m(g.cylinder(0.01, 0.01, 0.065, 6), legMat, [-0.025, 0.033, -0.04]);

    const group = makeGroup(
      body, chest, head, earL, earR, earInnerL, earInnerR,
      eyeL, eyeR, slitL, slitR, nose, mouth,
      tail, tailTip, legFL, legFR, legBL, legBR,
    );

    // Whiskers — thin lines from cheeks (Builder+)
    if (tier !== 'foundation' && tier !== 'discovery') {
      const whiskerMat = push(
        new THREE.LineBasicMaterial({ color: 0xcccccc }),
      );
      const whiskerData: Array<[number, number, number, number, number, number]> = [
        // left side
        [0.03, 0.232, 0.06, 0.07, 0.235, 0.065],
        [0.03, 0.228, 0.06, 0.07, 0.228, 0.063],
        [0.03, 0.224, 0.06, 0.07, 0.221, 0.065],
        // right side
        [-0.03, 0.232, 0.06, -0.07, 0.235, 0.065],
        [-0.03, 0.228, 0.06, -0.07, 0.228, 0.063],
        [-0.03, 0.224, 0.06, -0.07, 0.221, 0.065],
      ];
      for (const [x1, y1, z1, x2, y2, z2] of whiskerData) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3(x2, y2, z2),
        ]);
        const line = new THREE.LineSegments(geo, whiskerMat);
        group.add(line);
      }
    }

    return { group, materials: mats };
  },

  // =======================================================================
  // DRAGON — Bold Adventurer
  // =======================================================================
  dragon: (g, tier) => {
    const s = seg(tier);
    const mats: THREE.Material[] = [];
    const push = <T extends THREE.Material>(mtl: T): T => {
      mats.push(mtl);
      return mtl;
    };

    const blue = push(mat(0x4a90d9, tier, { roughness: 0.6 }));
    const lightBlue = push(mat(0x7ab8f0, tier, { roughness: 0.7 }));
    const goldEye = push(eyePupil(0xfbbf24, tier));
    const pupilMat = push(eyePupil(0x111111, tier));
    const hornMat = push(mat(0xd4a76a, tier, { roughness: 0.5, metalness: 0.15 }));

    // Body — rounded but slightly angular
    const body = m(g.sphere(0.08, s, s), blue, [0, 0.11, 0], undefined, [1.0, 0.9, 0.85]);
    body.name = 'body';

    // Belly — lighter plane
    const belly = m(g.sphere(0.055, s, s), lightBlue, [0, 0.1, 0.035], undefined, [0.7, 0.8, 0.45]);

    // Head — rounded snout
    const head = m(g.sphere(0.055, s, s), blue, [0, 0.24, 0.02]);
    head.name = 'head';

    // Snout — elongated front
    const snout = m(g.sphere(0.025, s, s), blue, [0, 0.23, 0.065], undefined, [0.9, 0.7, 1.1]);
    // Nostrils
    const nostrilMat = push(mat(0x2a5a9a, tier, { roughness: 0.8 }));
    const nostrilL = m(g.sphere(0.004, 4, 4), nostrilMat, [0.008, 0.235, 0.088]);
    const nostrilR = m(g.sphere(0.004, 4, 4), nostrilMat, [-0.008, 0.235, 0.088]);

    // Horns — two small cones
    const hornL = m(g.cone(0.008, 0.04, s), hornMat, [0.025, 0.3, -0.01], [0.2, 0, -0.2]);
    const hornR = m(g.cone(0.008, 0.04, s), hornMat, [-0.025, 0.3, -0.01], [0.2, 0, 0.2]);

    // Eyes — bright golden
    const eyeSize = tier === 'foundation' ? 0.018 : 0.015;
    const eyeL = m(g.sphere(eyeSize, s, s), goldEye, [0.025, 0.255, 0.055]);
    eyeL.name = 'eyeL';
    const eyeR = m(g.sphere(eyeSize, s, s), goldEye, [-0.025, 0.255, 0.055]);
    eyeR.name = 'eyeR';
    const pupilL = m(g.sphere(eyeSize * 0.45, 6, 6), pupilMat, [0.025, 0.255, 0.055 + eyeSize * 0.6]);
    const pupilR = m(g.sphere(eyeSize * 0.45, 6, 6), pupilMat, [-0.025, 0.255, 0.055 + eyeSize * 0.6]);

    // Wings — small triangular planes, semi-transparent
    const wingMat = push(
      mat(0x6aade8, tier, {
        roughness: 0.4,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    // Wing shape: a flattened cone creates a nice triangular silhouette
    const wingL = m(g.cone(0.06, 0.09, 3), wingMat, [0.1, 0.16, -0.02], [0, 0, -0.5], [0.15, 1.0, 1.0]);
    wingL.name = 'wingL';
    const wingR = m(g.cone(0.06, 0.09, 3), wingMat, [-0.1, 0.16, -0.02], [0, 0, 0.5], [0.15, 1.0, 1.0]);
    wingR.name = 'wingR';

    // Tail — long tapered cylinder with small fin
    const tail = m(g.cylinder(0.006, 0.02, 0.14, s), blue, [0, 0.1, -0.12], [0.7, 0, 0]);
    tail.name = 'tail';
    // Tail fin
    const finMat = push(mat(0x3a70b0, tier, { roughness: 0.5, side: THREE.DoubleSide }));
    const tailFin = m(g.cone(0.015, 0.025, 3), finMat, [0, 0.16, -0.2], [0.9, 0, 0], [0.2, 1.0, 1.0]);

    // Legs — small sturdy
    const legMat = push(mat(0x3a78b0, tier, { roughness: 0.7 }));
    const legFL = m(g.cylinder(0.013, 0.013, 0.06, 6), legMat, [0.03, 0.03, 0.03]);
    const legFR = m(g.cylinder(0.013, 0.013, 0.06, 6), legMat, [-0.03, 0.03, 0.03]);
    const legBL = m(g.cylinder(0.013, 0.013, 0.06, 6), legMat, [0.03, 0.03, -0.04]);
    const legBR = m(g.cylinder(0.013, 0.013, 0.06, 6), legMat, [-0.03, 0.03, -0.04]);

    // Flame puff — orange sphere, initially hidden
    const flameMat = push(
      mat(0xff6b2b, tier, {
        roughness: 0.2,
        emissive: 0xff6b2b,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
      }),
    );
    const flame = m(g.sphere(0.012, 6, 6), flameMat, [0, 0.24, 0.1]);
    flame.name = 'flame';
    flame.visible = false;

    const group = makeGroup(
      body, belly, head, snout, nostrilL, nostrilR,
      hornL, hornR, eyeL, eyeR, pupilL, pupilR,
      wingL, wingR, tail, tailFin,
      legFL, legFR, legBL, legBR, flame,
    );

    // Builder+: scale texture details along body
    if (tier !== 'foundation' && tier !== 'discovery') {
      const scaleMat = push(mat(0x3a6ab0, tier, { roughness: 0.5 }));
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 0.6 - 0.3;
        const y = 0.08 + Math.sin(angle) * 0.04;
        const z = -0.02 + Math.cos(angle) * 0.03;
        group.add(m(g.sphere(0.005, 4, 4), scaleMat, [0, y, z]));
      }
    }

    return { group, materials: mats };
  },
};
