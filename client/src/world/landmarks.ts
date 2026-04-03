import * as THREE from 'three';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Landmark meshes — distinctive 3D structures visible from distance.
// Each is a THREE.Group of simple primitives. Stylized 3D per art direction:
//   - Breath of the Wild meets Monument Valley meets Spiderverse.
//   - Soft, rounded, chamfered edges (Foundation tier).
// ---------------------------------------------------------------------------

// Art direction color palette
const C = {
  warmBrown:  0x8b6914,
  darkBrown:  0x5c3317,
  copper:     0xb87333,
  steel:      0x708090,
  stone:      0x999999,
  darkStone:  0x6b6b6b,
  marble:     0xf5f5dc,
  dirt:       0x8b7355,
  wood:       0x9e7e4e,
  roof:       0xa0522d,
  roofDark:   0x7a3c1e,
  leaf:       0x228b22,
  leafDark:   0x0b3d0b,
  crystal:    0x9966cc,
  frost:      0x22d3ee,
  aurora:     0xa78bfa,
  amber:      0xd4a574,
  sand:       0xd2b48c,
  metal:      0x505050,
  white:      0xf5f0e8,
  gold:       0xffd700,
  emerald:    0x2ecc71,
  ruby:       0xe74c6c,
  lightning:  0x00bfff,
  purple:     0x6a0dad,
  terminal:   0x00ff41,
  spaceGrey:  0x4a4a4a,
  tile:       0xe8e8e8,
  soil:       0x6b4423,
};

function mat(color: number, emissive = 0x000000, emissiveIntensity = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    roughness: 0.75,
    metalness: 0.1,
  });
}

function mesh(
  geom: THREE.BufferGeometry,
  material: THREE.MeshStandardMaterial,
  pos?: [number, number, number],
  rot?: [number, number, number],
  scale?: [number, number, number],
): THREE.Mesh {
  const m = new THREE.Mesh(geom, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// Individual landmark builders
// ---------------------------------------------------------------------------

function workshopLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Wooden A-frame building
  const body = mesh(new THREE.BoxGeometry(6, 4, 5), mat(C.warmBrown), [0, 2, 0]);
  g.add(body);
  // Triangular roof (use a cone with 4 sides for A-frame look)
  const roof = mesh(
    new THREE.ConeGeometry(5, 3, 4),
    mat(C.roofDark),
    [0, 5.5, 0],
    [0, Math.PI / 4, 0],
  );
  g.add(roof);
  // Chimney
  const chimney = mesh(new THREE.CylinderGeometry(0.4, 0.5, 3, 8), mat(C.darkStone), [2, 5, -1]);
  g.add(chimney);
  // Chimney glow (smoke indicator)
  const glow = mesh(
    new THREE.SphereGeometry(0.6, 8, 6),
    mat(C.amber, C.amber, 0.5),
    [2, 7, -1],
  );
  g.add(glow);
  // Door
  const door = mesh(new THREE.BoxGeometry(1.2, 2.5, 0.2), mat(C.darkBrown), [0, 1.25, 2.6]);
  g.add(door);
  return g;
}

function observatoryLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Stone tower
  const tower = mesh(new THREE.CylinderGeometry(3, 3.5, 12, 12), mat(C.darkStone), [0, 6, 0]);
  g.add(tower);
  // Dome on top
  const dome = mesh(new THREE.SphereGeometry(3.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.steel), [0, 12, 0]);
  g.add(dome);
  // Window lights
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const wx = Math.sin(angle) * 3.1;
    const wz = Math.cos(angle) * 3.1;
    const win = mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.1),
      mat(C.frost, C.frost, 0.4),
      [wx, 8, wz],
      [0, angle, 0],
    );
    g.add(win);
  }
  // Telescope dome slit
  const slit = mesh(
    new THREE.BoxGeometry(1, 0.3, 4),
    mat(C.metal),
    [0, 14, 0],
  );
  g.add(slit);
  return g;
}

function libraryLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Grand building
  const body = mesh(new THREE.BoxGeometry(8, 6, 7), mat(C.marble), [0, 3, 0]);
  g.add(body);
  // Peaked roof
  const roof = mesh(
    new THREE.ConeGeometry(6.5, 4, 4),
    mat(C.darkStone),
    [0, 8, 0],
    [0, Math.PI / 4, 0],
  );
  g.add(roof);
  // Arched entrance columns
  for (const xOff of [-2, 2]) {
    const col = mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 8), mat(C.marble), [xOff, 2.5, 3.6]);
    g.add(col);
  }
  // Door arch
  const arch = mesh(
    new THREE.TorusGeometry(1.2, 0.2, 8, 12, Math.PI),
    mat(C.marble),
    [0, 5, 3.6],
    [0, 0, 0],
  );
  g.add(arch);
  // Window glow
  const glow = mesh(
    new THREE.PlaneGeometry(5, 2),
    mat(C.amber, C.amber, 0.3),
    [0, 4, 3.55],
  );
  g.add(glow);
  return g;
}

function crystalCavernsLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Cave mouth — dark rock arch
  const rock1 = mesh(new THREE.BoxGeometry(4, 5, 3), mat(C.darkStone), [-3, 2.5, 0], [0, 0, 0.15]);
  const rock2 = mesh(new THREE.BoxGeometry(4, 5, 3), mat(C.darkStone), [3, 2.5, 0], [0, 0, -0.15]);
  g.add(rock1, rock2);
  // Arch top
  const archTop = mesh(new THREE.BoxGeometry(10, 2, 3), mat(C.darkStone), [0, 5.5, 0], [0, 0, 0]);
  g.add(archTop);
  // Crystal glow from inside
  const crystal1 = mesh(
    new THREE.ConeGeometry(0.5, 2, 6),
    mat(C.crystal, C.crystal, 0.8),
    [-1, 1, -1],
    [0, 0, 0.2],
  );
  const crystal2 = mesh(
    new THREE.ConeGeometry(0.4, 1.5, 6),
    mat(C.frost, C.frost, 0.8),
    [1.2, 0.75, -0.5],
    [0, 0, -0.3],
  );
  g.add(crystal1, crystal2);
  // Interior glow point light effect (sphere)
  const glow = mesh(
    new THREE.SphereGeometry(1.5, 8, 6),
    mat(C.aurora, C.aurora, 0.5),
    [0, 2, -3],
  );
  (glow.material as THREE.MeshStandardMaterial).transparent = true;
  (glow.material as THREE.MeshStandardMaterial).opacity = 0.3;
  g.add(glow);
  return g;
}

function livingForestLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Enormous ancient tree
  const trunk = mesh(new THREE.CylinderGeometry(1.5, 2.5, 10, 8), mat(C.darkBrown), [0, 5, 0]);
  g.add(trunk);
  // Canopy layers
  const canopy1 = mesh(new THREE.SphereGeometry(6, 10, 8), mat(C.leaf), [0, 12, 0]);
  const canopy2 = mesh(new THREE.SphereGeometry(4, 8, 6), mat(C.leafDark), [2, 14, 1]);
  const canopy3 = mesh(new THREE.SphereGeometry(3.5, 8, 6), mat(C.leaf), [-2, 13, -1]);
  g.add(canopy1, canopy2, canopy3);
  // Smaller trees around
  for (const [tx, tz] of [[-5, 3], [4, -4], [-3, -5], [6, 2]] as [number, number][]) {
    const st = mesh(new THREE.CylinderGeometry(0.3, 0.5, 4, 6), mat(C.darkBrown), [tx, 2, tz]);
    const sc = mesh(new THREE.SphereGeometry(2, 6, 5), mat(C.leaf), [tx, 5, tz]);
    g.add(st, sc);
  }
  return g;
}

function tradingPostLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Market stalls
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 4;
    const stall = mesh(new THREE.BoxGeometry(3, 2, 3), mat(C.wood), [x, 1, 0]);
    g.add(stall);
    // Tent top / awning
    const awningColors = [0xc0392b, 0xe67e22, 0x2ecc71];
    const awning = mesh(
      new THREE.ConeGeometry(2.5, 1.5, 4),
      mat(awningColors[i]!),
      [x, 3.5, 0],
      [0, Math.PI / 4, 0],
    );
    g.add(awning);
  }
  // Banner pole
  const pole = mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mat(C.wood), [0, 2.5, -3]);
  const banner = mesh(new THREE.PlaneGeometry(1.5, 2), mat(C.gold), [0.8, 4, -3]);
  g.add(pole, banner);
  return g;
}

function stormTowerLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Metal spire
  const spire = mesh(new THREE.CylinderGeometry(0.8, 2, 14, 8), mat(C.metal), [0, 7, 0]);
  g.add(spire);
  // Metal rings
  for (const h of [4, 8, 11]) {
    const ring = mesh(new THREE.TorusGeometry(2.5 - h * 0.1, 0.15, 8, 16), mat(C.steel), [0, h, 0], [Math.PI / 2, 0, 0]);
    g.add(ring);
  }
  // Lightning orb at top
  const orb = mesh(
    new THREE.SphereGeometry(1, 10, 8),
    mat(C.lightning, C.lightning, 0.8),
    [0, 15, 0],
  );
  g.add(orb);
  // Crackling bolts (simple lines as thin boxes)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const bolt = mesh(
      new THREE.BoxGeometry(0.08, 2, 0.08),
      mat(C.lightning, C.lightning, 0.6),
      [Math.sin(angle) * 1.5, 14, Math.cos(angle) * 1.5],
      [0, 0, (i - 1) * 0.3],
    );
    g.add(bolt);
  }
  return g;
}

function codeForgeLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Futuristic angular building
  const body = mesh(new THREE.BoxGeometry(6, 5, 5), mat(C.spaceGrey), [0, 2.5, 0]);
  g.add(body);
  // Angled top
  const top = mesh(
    new THREE.BoxGeometry(7, 0.5, 6),
    mat(C.metal),
    [0, 5.25, 0],
    [0.1, 0, 0],
  );
  g.add(top);
  // Terminal glow strips
  for (const z of [-2.6, 2.6]) {
    const strip = mesh(
      new THREE.BoxGeometry(4, 0.3, 0.1),
      mat(C.terminal, C.terminal, 0.6),
      [0, 3, z],
    );
    g.add(strip);
  }
  // Antenna
  const ant = mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), mat(C.metal), [2, 6.5, 0]);
  g.add(ant);
  // Green glow at top
  const glow = mesh(
    new THREE.SphereGeometry(0.3, 6, 6),
    mat(C.terminal, C.terminal, 1.0),
    [2, 8.2, 0],
  );
  g.add(glow);
  return g;
}

function alchemistLabLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Stone building
  const body = mesh(new THREE.BoxGeometry(5, 4, 5), mat(C.darkStone), [0, 2, 0]);
  g.add(body);
  const roof = mesh(new THREE.ConeGeometry(4.5, 3, 4), mat(C.roofDark), [0, 5.5, 0], [0, Math.PI / 4, 0]);
  g.add(roof);
  // Chimney with purple smoke
  const chimney = mesh(new THREE.CylinderGeometry(0.5, 0.6, 4, 8), mat(C.darkStone), [1.5, 5.5, 0]);
  g.add(chimney);
  const smoke = mesh(
    new THREE.SphereGeometry(1, 8, 6),
    mat(C.purple, C.purple, 0.4),
    [1.5, 8, 0],
  );
  (smoke.material as THREE.MeshStandardMaterial).transparent = true;
  (smoke.material as THREE.MeshStandardMaterial).opacity = 0.4;
  g.add(smoke);
  // Green glow at window
  const glow = mesh(
    new THREE.PlaneGeometry(1, 1.2),
    mat(C.emerald, C.emerald, 0.4),
    [0, 2.5, 2.55],
  );
  g.add(glow);
  return g;
}

function galleryLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Elegant marble building
  const body = mesh(new THREE.BoxGeometry(7, 4, 6), mat(C.marble), [0, 2, 0]);
  g.add(body);
  // Flat decorative roof with trim
  const roofTrim = mesh(new THREE.BoxGeometry(8, 0.5, 7), mat(C.stone), [0, 4.25, 0]);
  g.add(roofTrim);
  // Columns
  for (const x of [-2.5, -0.8, 0.8, 2.5]) {
    const col = mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 8), mat(C.marble), [x, 2, 3.1]);
    g.add(col);
  }
  // Colorful window panels
  const panelColors = [0xe74c6c, 0x22d3ee, 0xffd700, 0x2ecc71];
  for (let i = 0; i < 4; i++) {
    const panel = mesh(
      new THREE.PlaneGeometry(1, 1.5),
      mat(panelColors[i]!, panelColors[i]!, 0.2),
      [-2.5 + i * 1.8, 3, 3.05],
    );
    g.add(panel);
  }
  return g;
}

function ancientRuinsLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Broken columns of varying height
  const heights = [4, 2.5, 5, 1.5, 3.5, 2];
  const positions: [number, number][] = [[-3, -2], [-1, 3], [2, -1], [4, 2], [0, -3], [3, 4]];
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i]!;
    const [px, pz] = positions[i]!;
    const col = mesh(
      new THREE.CylinderGeometry(0.5, 0.6, h, 8),
      mat(C.sand),
      [px, h / 2, pz],
      [0, 0, (i % 2 === 0 ? 0.05 : -0.03)],
    );
    g.add(col);
  }
  // Crumbled wall segment
  const wall = mesh(
    new THREE.BoxGeometry(5, 2, 0.6),
    mat(C.sand),
    [0, 1, 0],
    [0, 0.3, 0],
  );
  g.add(wall);
  // Overgrown vine hints (green spots)
  const vine = mesh(
    new THREE.SphereGeometry(0.8, 6, 4),
    mat(C.leaf),
    [-1, 3.5, 3],
  );
  g.add(vine);
  return g;
}

function farmLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Barn
  const barn = mesh(new THREE.BoxGeometry(5, 3.5, 4), mat(C.roof), [0, 1.75, 0]);
  g.add(barn);
  const barnRoof = mesh(new THREE.ConeGeometry(4, 2, 4), mat(C.roofDark), [0, 4.5, 0], [0, Math.PI / 4, 0]);
  g.add(barnRoof);
  // Barn door
  const barnDoor = mesh(new THREE.BoxGeometry(2, 2.5, 0.1), mat(C.darkBrown), [0, 1.25, 2.05]);
  g.add(barnDoor);
  // Fence sections
  for (let x = -6; x <= 6; x += 2) {
    const post = mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), mat(C.wood), [x, 0.6, 5]);
    g.add(post);
    if (x < 6) {
      const rail = mesh(new THREE.BoxGeometry(2, 0.1, 0.1), mat(C.wood), [x + 1, 0.8, 5]);
      g.add(rail);
    }
  }
  // Crop rows (colored ground patches)
  for (let z = -4; z <= -2; z += 1) {
    const crop = mesh(new THREE.BoxGeometry(4, 0.3, 0.6), mat(C.emerald), [3, 0.15, z]);
    g.add(crop);
  }
  return g;
}

function musicHallLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Elegant dome building
  const body = mesh(new THREE.CylinderGeometry(4, 4, 4, 10), mat(C.darkBrown), [0, 2, 0]);
  g.add(body);
  const dome = mesh(
    new THREE.SphereGeometry(4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.copper),
    [0, 4, 0],
  );
  g.add(dome);
  // Musical note decorations (simplified)
  const note1 = mesh(new THREE.SphereGeometry(0.4, 6, 6), mat(C.gold, C.gold, 0.3), [0, 6.5, 0]);
  const stem = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 4), mat(C.gold), [0.3, 7.5, 0]);
  g.add(note1, stem);
  // Warm window glow
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const win = mesh(
      new THREE.BoxGeometry(1, 1.5, 0.1),
      mat(C.amber, C.amber, 0.3),
      [Math.sin(angle) * 4.05, 2.5, Math.cos(angle) * 4.05],
      [0, angle, 0],
    );
    g.add(win);
  }
  return g;
}

function arenaLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Circular colosseum walls
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const height = 3 + (i % 3) * 0.5; // Varied height for ruined look
    const wall = mesh(
      new THREE.BoxGeometry(2.5, height, 0.6),
      mat(C.sand),
      [Math.sin(angle) * 6, height / 2, Math.cos(angle) * 6],
      [0, angle, 0],
    );
    g.add(wall);
  }
  // Central pillar
  const pillar = mesh(new THREE.CylinderGeometry(0.6, 0.6, 4, 8), mat(C.stone), [0, 2, 0]);
  g.add(pillar);
  return g;
}

function hospitalLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Clean white building
  const body = mesh(new THREE.BoxGeometry(6, 5, 5), mat(C.tile), [0, 2.5, 0]);
  g.add(body);
  // Flat roof
  const roofTrim = mesh(new THREE.BoxGeometry(6.5, 0.3, 5.5), mat(C.stone), [0, 5.15, 0]);
  g.add(roofTrim);
  // Red cross on front
  const crossH = mesh(new THREE.BoxGeometry(2, 0.5, 0.1), mat(0xe74c6c, 0xe74c6c, 0.3), [0, 4, 2.55]);
  const crossV = mesh(new THREE.BoxGeometry(0.5, 2, 0.1), mat(0xe74c6c, 0xe74c6c, 0.3), [0, 4, 2.56]);
  g.add(crossH, crossV);
  return g;
}

function laboratoryLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Modern building
  const body = mesh(new THREE.BoxGeometry(6, 4, 5), mat(C.tile), [0, 2, 0]);
  g.add(body);
  // Flat roof with equipment
  const roofTrim = mesh(new THREE.BoxGeometry(6.5, 0.3, 5.5), mat(C.metal), [0, 4.15, 0]);
  g.add(roofTrim);
  // Vent/equipment on roof
  const vent = mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.5, 6), mat(C.steel), [2, 5, 0]);
  g.add(vent);
  // Blue glow windows
  for (const x of [-1.5, 0, 1.5]) {
    const win = mesh(
      new THREE.PlaneGeometry(0.8, 1.2),
      mat(C.frost, C.frost, 0.3),
      [x, 2.5, 2.55],
    );
    g.add(win);
  }
  return g;
}

function shipyardLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Large open dock structure
  const dock = mesh(new THREE.BoxGeometry(8, 0.5, 6), mat(C.wood), [0, 0.25, 0]);
  g.add(dock);
  // Crane tower
  const tower = mesh(new THREE.CylinderGeometry(0.4, 0.6, 8, 6), mat(C.metal), [3, 4, 0]);
  g.add(tower);
  // Crane arm
  const arm = mesh(new THREE.BoxGeometry(6, 0.3, 0.3), mat(C.steel), [0, 8, 0]);
  g.add(arm);
  // Ship hull (half cylinder)
  const hull = mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 5, 8, 1, false, 0, Math.PI),
    mat(C.darkBrown),
    [-2, 1.5, 0],
    [0, 0, Math.PI / 2],
  );
  g.add(hull);
  return g;
}

function debateHallLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Classical building with columns
  const body = mesh(new THREE.BoxGeometry(6, 4, 5), mat(C.marble), [0, 2, 0]);
  g.add(body);
  // Triangular pediment
  const pediment = mesh(new THREE.ConeGeometry(4.5, 2, 3), mat(C.marble), [0, 5.5, 0], [0, 0, 0]);
  g.add(pediment);
  // Front columns
  for (const x of [-2, -0.7, 0.7, 2]) {
    const col = mesh(new THREE.CylinderGeometry(0.3, 0.35, 4, 8), mat(C.marble), [x, 2, 2.6]);
    g.add(col);
  }
  return g;
}

function newsroomLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Modern office building
  const body = mesh(new THREE.BoxGeometry(5, 5, 4), mat(C.tile), [0, 2.5, 0]);
  g.add(body);
  // Flat roof
  const roofTrim = mesh(new THREE.BoxGeometry(5.5, 0.3, 4.5), mat(C.metal), [0, 5.15, 0]);
  g.add(roofTrim);
  // Antenna on top
  const antenna = mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 4), mat(C.steel), [1.5, 6.5, 0]);
  g.add(antenna);
  // Satellite dish
  const dish = mesh(
    new THREE.SphereGeometry(0.6, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3),
    mat(C.steel),
    [-1, 5.5, 0],
    [Math.PI / 4, 0, 0],
  );
  g.add(dish);
  // Blue glow "LIVE" indicator
  const live = mesh(
    new THREE.BoxGeometry(1, 0.3, 0.1),
    mat(0xe74c6c, 0xe74c6c, 0.6),
    [0, 4.5, 2.05],
  );
  g.add(live);
  return g;
}

function theaterLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Grand building with arched entrance
  const body = mesh(new THREE.BoxGeometry(7, 5, 6), mat(C.darkBrown), [0, 2.5, 0]);
  g.add(body);
  // Curved top (dome section)
  const dome = mesh(
    new THREE.SphereGeometry(4.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 3),
    mat(C.copper),
    [0, 5, 0],
  );
  g.add(dome);
  // Stage curtain hint (red panels at entrance)
  const curtainL = mesh(new THREE.PlaneGeometry(1.5, 3), mat(0xc0392b), [-1.2, 2.5, 3.05]);
  const curtainR = mesh(new THREE.PlaneGeometry(1.5, 3), mat(0xc0392b), [1.2, 2.5, 3.05]);
  g.add(curtainL, curtainR);
  // Warm glow above entrance
  const marquee = mesh(
    new THREE.BoxGeometry(4, 0.6, 0.2),
    mat(C.amber, C.amber, 0.4),
    [0, 4.5, 3.1],
  );
  g.add(marquee);
  return g;
}

function marketplaceLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Open market with colored canopies
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 === 0 ? -2 : 2) + (i < 2 ? 0 : 0.5);
    const z = i < 2 ? -2 : 2;
    const canopyColors = [0xc0392b, 0xe67e22, 0x2ecc71, 0x3498db];
    const stall = mesh(new THREE.BoxGeometry(3, 1.5, 3), mat(C.wood), [x, 0.75, z]);
    g.add(stall);
    const canopy = mesh(
      new THREE.BoxGeometry(3.5, 0.2, 3.5),
      mat(canopyColors[i]!),
      [x, 2.5, z],
    );
    g.add(canopy);
    const pole1 = mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 4), mat(C.wood), [x - 1.2, 1.25, z - 1.2]);
    const pole2 = mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 4), mat(C.wood), [x + 1.2, 1.25, z + 1.2]);
    g.add(pole1, pole2);
  }
  return g;
}

function architectsDomainLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Geometric masterpiece
  const base = mesh(new THREE.BoxGeometry(6, 3, 6), mat(C.marble), [0, 1.5, 0]);
  g.add(base);
  // Geometric tower on top
  const tower = mesh(new THREE.BoxGeometry(3, 5, 3), mat(C.sand), [0, 5.5, 0]);
  g.add(tower);
  // Decorative arch
  const arch = mesh(
    new THREE.TorusGeometry(2, 0.3, 8, 12, Math.PI),
    mat(C.gold),
    [0, 3, 3.1],
  );
  g.add(arch);
  // Blueprint lines (cyan strips on walls)
  for (const y of [2, 4, 6]) {
    const line = mesh(
      new THREE.BoxGeometry(6.1, 0.05, 0.05),
      mat(C.frost, C.frost, 0.3),
      [0, y, 3.05],
    );
    g.add(line);
  }
  return g;
}

function spaceStationLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Futuristic dome
  const dome = mesh(
    new THREE.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.spaceGrey),
    [0, 0, 0],
  );
  g.add(dome);
  // Base ring
  const ring = mesh(
    new THREE.TorusGeometry(5, 0.5, 8, 20),
    mat(C.metal),
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
  );
  g.add(ring);
  // Antenna array
  const ant1 = mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 4), mat(C.steel), [0, 6, 0]);
  const ant2 = mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 4), mat(C.steel), [0, 7, 0], [0, 0, 0.4]);
  g.add(ant1, ant2);
  // Blue glow viewport
  const viewport = mesh(
    new THREE.SphereGeometry(1.5, 8, 6),
    mat(C.frost, C.frost, 0.3),
    [0, 3, 4],
  );
  (viewport.material as THREE.MeshStandardMaterial).transparent = true;
  (viewport.material as THREE.MeshStandardMaterial).opacity = 0.4;
  g.add(viewport);
  return g;
}

function digitalWorldLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Dark monolithic server room
  const body = mesh(new THREE.BoxGeometry(5, 5, 5), mat(0x1a1a2e), [0, 2.5, 0]);
  g.add(body);
  // Green terminal strips
  for (let y = 1; y < 5; y += 1.2) {
    const strip = mesh(
      new THREE.BoxGeometry(5.1, 0.15, 0.1),
      mat(C.terminal, C.terminal, 0.5),
      [0, y, 2.55],
    );
    g.add(strip);
  }
  // Circuit traces on sides
  for (const x of [-2.55, 2.55]) {
    for (let y = 1; y < 4; y += 1.5) {
      const trace = mesh(
        new THREE.BoxGeometry(0.1, 0.1, 3),
        mat(C.frost, C.frost, 0.3),
        [x, y, 0],
      );
      g.add(trace);
    }
  }
  return g;
}

function explorersMapLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Compass rose platform
  const platform = mesh(new THREE.CylinderGeometry(3, 3, 0.5, 12), mat(C.sand), [0, 0.25, 0]);
  g.add(platform);
  // Central pedestal
  const pedestal = mesh(new THREE.CylinderGeometry(0.6, 0.8, 2, 8), mat(C.stone), [0, 1.5, 0]);
  g.add(pedestal);
  // Globe on top
  const globe = mesh(new THREE.SphereGeometry(1.2, 10, 8), mat(C.frost, C.frost, 0.2), [0, 3.5, 0]);
  g.add(globe);
  // Compass directions (small pillars)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const marker = mesh(
      new THREE.ConeGeometry(0.3, 1, 4),
      mat(C.gold),
      [Math.sin(angle) * 2.5, 0.8, Math.cos(angle) * 2.5],
    );
    g.add(marker);
  }
  // Telescope on tripod
  const telescope = mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 6), mat(C.copper), [2, 1.5, 2], [0, 0, 0.5]);
  g.add(telescope);
  return g;
}

function healersSanctuaryLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Stone garden arch
  const arch = mesh(
    new THREE.TorusGeometry(3, 0.4, 8, 16, Math.PI),
    mat(C.stone),
    [0, 3, 0],
  );
  g.add(arch);
  // Herb garden beds (green rectangles)
  for (const [x, z] of [[-2, 2], [2, 2], [-2, -2], [2, -2]] as [number, number][]) {
    const bed = mesh(new THREE.BoxGeometry(2, 0.4, 2), mat(C.soil), [x, 0.2, z]);
    const herbs = mesh(new THREE.SphereGeometry(0.8, 6, 4), mat(C.emerald), [x, 0.8, z]);
    g.add(bed, herbs);
  }
  // Central healing crystal
  const crystal = mesh(
    new THREE.ConeGeometry(0.5, 2, 6),
    mat(C.aurora, C.aurora, 0.4),
    [0, 1, 0],
  );
  g.add(crystal);
  // Soft glow
  const glow = mesh(
    new THREE.SphereGeometry(0.8, 6, 6),
    mat(C.aurora, C.aurora, 0.3),
    [0, 2, 0],
  );
  (glow.material as THREE.MeshStandardMaterial).transparent = true;
  (glow.material as THREE.MeshStandardMaterial).opacity = 0.25;
  g.add(glow);
  return g;
}

function timeRiftLandmark(): THREE.Group {
  const g = new THREE.Group();
  // Shattered stone portal frame
  const left = mesh(new THREE.BoxGeometry(1, 5, 1), mat(C.darkStone), [-2, 2.5, 0], [0, 0, 0.08]);
  const right = mesh(new THREE.BoxGeometry(1, 5, 1), mat(C.darkStone), [2, 2.5, 0], [0, 0, -0.08]);
  const top = mesh(new THREE.BoxGeometry(5, 1, 1), mat(C.darkStone), [0, 5.2, 0]);
  g.add(left, right, top);
  // Swirling rift energy
  const rift = mesh(
    new THREE.TorusGeometry(1.5, 0.4, 8, 20),
    mat(C.aurora, C.aurora, 0.6),
    [0, 3, 0],
  );
  (rift.material as THREE.MeshStandardMaterial).transparent = true;
  (rift.material as THREE.MeshStandardMaterial).opacity = 0.5;
  g.add(rift);
  // Floating rock shards
  for (const [px, py, pz] of [[1.5, 4.5, 0.5], [-1, 5.5, -0.3], [0.5, 6, 0]] as [number, number, number][]) {
    const shard = mesh(
      new THREE.BoxGeometry(0.4, 0.6, 0.4),
      mat(C.stone),
      [px, py, pz],
      [0.3, 0.5, 0.1],
    );
    g.add(shard);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Landmark registry
// ---------------------------------------------------------------------------

const LANDMARK_BUILDERS: Record<string, () => THREE.Group> = {
  'workshop': workshopLandmark,
  'observatory': observatoryLandmark,
  'library-echoes': libraryLandmark,
  'crystal-caverns': crystalCavernsLandmark,
  'living-forest': livingForestLandmark,
  'trading-post': tradingPostLandmark,
  'storm-tower': stormTowerLandmark,
  'code-forge': codeForgeLandmark,
  'alchemist-lab': alchemistLabLandmark,
  'gallery': galleryLandmark,
  'ancient-ruins': ancientRuinsLandmark,
  'farm': farmLandmark,
  'music-hall': musicHallLandmark,
  'arena': arenaLandmark,
  'hospital': hospitalLandmark,
  'laboratory': laboratoryLandmark,
  'shipyard': shipyardLandmark,
  'debate-hall': debateHallLandmark,
  'newsroom': newsroomLandmark,
  'theater': theaterLandmark,
  'marketplace': marketplaceLandmark,
  'architects-domain': architectsDomainLandmark,
  'space-station': spaceStationLandmark,
  'digital-world': digitalWorldLandmark,
  'explorers-map': explorersMapLandmark,
  'healers-sanctuary': healersSanctuaryLandmark,
  'time-rift': timeRiftLandmark,
};

/** Create a landmark mesh for the given biome. Falls back to a generic marker. */
export function createLandmark(biomeId: string): THREE.Group {
  const builder = LANDMARK_BUILDERS[biomeId];
  if (builder) return builder();

  // Generic fallback: stone pillar with Frost glow
  const g = new THREE.Group();
  const pillar = mesh(new THREE.CylinderGeometry(1, 1.2, 4, 8), mat(C.stone), [0, 2, 0]);
  const orb = mesh(new THREE.SphereGeometry(0.5, 8, 6), mat(C.frost, C.frost, 0.5), [0, 4.5, 0]);
  g.add(pillar, orb);
  return g;
}

// ---------------------------------------------------------------------------
// LandmarkManager — creates and positions all landmarks in the scene
// ---------------------------------------------------------------------------

export class LandmarkManager implements Disposable {
  readonly group: THREE.Group;
  private readonly landmarks = new Map<string, THREE.Group>();

  constructor(biomes: { id: string; worldPosition: { x: number; z: number }; baseHeight: number }[]) {
    this.group = new THREE.Group();
    this.group.name = 'landmarks';

    for (const biome of biomes) {
      const landmark = createLandmark(biome.id);
      landmark.position.set(
        biome.worldPosition.x,
        biome.baseHeight,
        biome.worldPosition.z,
      );
      landmark.name = `landmark-${biome.id}`;
      this.landmarks.set(biome.id, landmark);
      this.group.add(landmark);
    }
  }

  getLandmark(biomeId: string): THREE.Group | undefined {
    return this.landmarks.get(biomeId);
  }

  dispose(): void {
    for (const landmark of this.landmarks.values()) {
      landmark.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    }
    this.landmarks.clear();
  }
}
