import * as THREE from "three";

/**
 * Nirvash folded-paper airplane — real low-poly origami geometry.
 *
 * Coordinate system (model space):
 *   +Z = forward (the nose), +Y = up, +X = the pilot's left wing.
 *
 * Cross-section (looking down the nose): a raised central ridge, an inner wing
 * panel that drops away from it, and an outer wing panel folded back up —
 * plus a keel fin hanging below the spine. Every panel is its own set of
 * triangles at its own angle, so nothing lives in a single plane.
 */

export const NIRVASH = {
  white: "#FFFFFF",
  paper: "#F5F5F5",
  red: "#FF4336",
  ruby: "#B71C1C",
  dark: "#212121",
} as const;

type V3 = [number, number, number];

// Key points of the right-hand half (mirrored for the left).
const NOSE: V3 = [0, 0.05, 3.2];
const RIDGE_REAR: V3 = [0, 0.62, -2.4];
const MID_REAR: V3 = [1.05, -0.2, -2.3];
const TIP: V3 = [2.35, 0.12, -2.1];
const THICK = 0.04; // paper thickness on edges / underside offset

class TriSoup {
  readonly pos: number[] = [];
  readonly uv: number[] = [];

  private push(p: V3) {
    this.pos.push(p[0], p[1], p[2]);
    this.uv.push(p[0] * 0.18 + 0.5, p[2] * 0.18 + 0.5);
  }

  /** Add a triangle; for the mirrored side the winding is reversed so normals stay outward. */
  tri(s: 1 | -1, a: V3, b: V3, c: V3) {
    const m = (p: V3): V3 => [p[0] * s, p[1], p[2]];
    if (s === 1) {
      this.push(m(a));
      this.push(m(b));
      this.push(m(c));
    } else {
      this.push(m(a));
      this.push(m(c));
      this.push(m(b));
    }
  }

  quad(s: 1 | -1, a: V3, b: V3, c: V3, d: V3) {
    this.tri(s, a, b, c);
    this.tri(s, a, c, d);
  }

  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeVertexNormals(); // non-indexed → crisp flat facets, like folded paper
    g.computeBoundingSphere();
    return g;
  }
}

const down = (p: V3, d = THICK): V3 => [p[0], p[1] - d, p[2]];
const lift = (p: V3, d: number): V3 => [p[0], p[1] + d, p[2]];

function makePaperTexture(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 200 + Math.random() * 55;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // faint paper fibres
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#888";
  for (let i = 0; i < size / 2; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

export interface PaperPlane {
  group: THREE.Group;
  /** Length of the model along its forward axis, in model units. */
  length: number;
  dispose: () => void;
}

export function createPaperPlane(opts: { simple?: boolean } = {}): PaperPlane {
  const top = new TriSoup(); // upper wing surfaces
  const under = new TriSoup(); // undersides + keel
  const edge = new TriSoup(); // paper thickness strips
  const red = new TriSoup(); // primary-red crease accent (spine)
  const ruby = new TriSoup(); // deep-ruby crease accents

  for (const s of [1, -1] as const) {
    // ── upper surfaces: inner panel + outer panel, folded at different angles
    top.tri(s, NOSE, MID_REAR, RIDGE_REAR);
    top.tri(s, NOSE, TIP, MID_REAR);

    // ── undersides (offset down, reversed so they face downward)
    under.tri(s, down(NOSE), down(RIDGE_REAR), down(MID_REAR));
    under.tri(s, down(NOSE), down(MID_REAR), down(TIP));

    // ── paper thickness: leading edge, rear edge of both panels
    edge.quad(s, NOSE, down(NOSE), down(TIP), TIP);
    edge.quad(s, TIP, down(TIP), down(MID_REAR), MID_REAR);
    edge.quad(s, MID_REAR, down(MID_REAR), down(RIDGE_REAR), RIDGE_REAR);

    // ── fold accent along the inner/outer crease (thin deep-ruby ribbon)
    const w = 0.016;
    ruby.quad(
      s,
      lift([NOSE[0] + 0.02, NOSE[1], NOSE[2] - 0.15], 0.006),
      lift([MID_REAR[0] - 0.01, MID_REAR[1], MID_REAR[2] + 0.02], 0.006),
      lift([MID_REAR[0] + w, MID_REAR[1], MID_REAR[2] + 0.02], 0.006),
      lift([NOSE[0] + 0.02 + w, NOSE[1], NOSE[2] - 0.15], 0.006),
    );
    // ── leading-edge accent (deep ruby) — thin line where wing meets the air
    ruby.quad(
      s,
      lift([NOSE[0] + 0.03, NOSE[1], NOSE[2] - 0.3], 0.008),
      lift([TIP[0] - 0.01, TIP[1], TIP[2] + 0.04], 0.008),
      lift([TIP[0] - 0.02, TIP[1], TIP[2] + 0.07], 0.008),
      lift([NOSE[0] + 0.045, NOSE[1], NOSE[2] - 0.32], 0.008),
    );
  }

  // ── keel fin hanging beneath the spine (two faces, slightly apart = thickness)
  const keelA: V3 = [0, 0.19, 1.4];
  const keelB: V3 = down(RIDGE_REAR);
  const keelC: V3 = [0, -0.55, -2.3];
  const kx = 0.028;
  const k = (p: V3, x: number): V3 => [x, p[1], p[2]];
  under.tri(1, k(keelA, kx), k(keelC, kx), k(keelB, kx));
  // left face (x<0): use s=1 with negative x and normal winding reversed by construction
  under.tri(1, k(keelA, -kx), k(keelB, -kx), k(keelC, -kx));
  edge.quad(1, k(keelC, kx), k(keelB, kx), k(keelB, -kx), k(keelC, -kx));

  // ── raised central spine: crest ribbon (primary red) just above the ridge line
  {
    const hw = 0.018;
    const a: V3 = [0, NOSE[1] + 0.012, NOSE[2] - 0.45];
    const b: V3 = [0, RIDGE_REAR[1] + 0.012, RIDGE_REAR[2] + 0.04];
    red.quad(
      1,
      [-hw, a[1] - 0.004, a[2]],
      [-hw, b[1] - 0.004, b[2]],
      [hw, b[1] - 0.004, b[2]],
      [hw, a[1] - 0.004, a[2]],
    );
  }

  const bump = makePaperTexture(opts.simple ? 64 : 128);

  const mTop = new THREE.MeshStandardMaterial({
    color: NIRVASH.white,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: true,
    bumpMap: bump,
    bumpScale: 0.35,
  });
  const mUnder = new THREE.MeshStandardMaterial({
    color: "#E6E6E6",
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: true,
    bumpMap: bump,
    bumpScale: 0.3,
  });
  const mEdge = new THREE.MeshStandardMaterial({
    color: NIRVASH.paper,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const mRed = new THREE.MeshStandardMaterial({
    color: NIRVASH.red,
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const mRuby = new THREE.MeshStandardMaterial({
    color: NIRVASH.ruby,
    roughness: 0.75,
    metalness: 0,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const parts: Array<[TriSoup, THREE.Material]> = [
    [top, mTop],
    [under, mUnder],
    [edge, mEdge],
    [red, mRed],
    [ruby, mRuby],
  ];

  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  for (const [soup, mat] of parts) {
    const g = soup.geometry();
    geometries.push(g);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  // centre the model so it rotates about its middle, not its nose
  group.children.forEach((c) => c.position.set(0, -0.05, -0.4));

  return {
    group,
    length: NOSE[2] - RIDGE_REAR[2],
    dispose() {
      geometries.forEach((g) => g.dispose());
      [mTop, mUnder, mEdge, mRed, mRuby].forEach((m) => m.dispose());
      bump.dispose();
    },
  };
}
