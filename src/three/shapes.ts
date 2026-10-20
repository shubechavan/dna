import * as THREE from 'three';

/**
 * Every slide is the same 16k particles arranged into a different shape.
 * Each generator returns positions, colours and sizes for all COUNT particles,
 * and ParticleMorph flies the particles from one arrangement to the next.
 */
export const COUNT = 16000;

export type ShapeId =
  | 'helix'
  | 'fragments'
  | 'fingerprint'
  | 'extraction'
  | 'orbit'
  | 'pipeline'
  | 'chain'
  | 'shield'
  | 'network'
  | 'glitch'
  | 'galaxy'
  | 'helixGold';

export interface ShapeData {
  pos: Float32Array;
  col: Float32Array;
  size: Float32Array;
}

/** How the whole cloud moves while a shape is on screen. */
export const SHAPE_META: Record<ShapeId, { spin: number; sway: number; tilt: [number, number, number] }> = {
  helix: { spin: 0.28, sway: 0, tilt: [0, 0, 0.2] },
  fragments: { spin: 0.07, sway: 0, tilt: [0, 0, 0.12] },
  fingerprint: { spin: 0, sway: 0.26, tilt: [0.05, 0, 0] },
  extraction: { spin: 0, sway: 0.2, tilt: [0.12, 0, 0] },
  orbit: { spin: 0.14, sway: 0, tilt: [0.15, 0, 0] },
  pipeline: { spin: 0, sway: 0.3, tilt: [0, 0, 0] },
  chain: { spin: 0.16, sway: 0, tilt: [0, 0, 0.1] },
  shield: { spin: 0.2, sway: 0, tilt: [0.2, 0, 0] },
  network: { spin: 0.09, sway: 0, tilt: [0.1, 0, 0] },
  glitch: { spin: 0, sway: 0.35, tilt: [0, 0, 0.12] },
  galaxy: { spin: 0.1, sway: 0, tilt: [0.95, 0, 0.18] },
  helixGold: { spin: 0.28, sway: 0, tilt: [0, 0, 0.2] },
};

// Colours are converted to linear space by THREE.Color, which is what the shader expects.
const c = (h: string) => new THREE.Color(h);
const PAL = {
  teal: c('#2ff3c4'),
  cyan: c('#45c8ff'),
  gold: c('#ffb547'),
  violet: c('#8d7bff'),
  coral: c('#ff4f6d'),
  ice: c('#dfe9ff'),
};
const GAIN = 0.58;

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const e3 = (x: number, y: number, z: number) => new THREE.Euler(x, y, z);

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDir(rnd: () => number, out = new THREE.Vector3()) {
  const u = rnd() * 2 - 1;
  const th = rnd() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(th), u, s * Math.sin(th));
}

class Cloud {
  readonly pos = new Float32Array(COUNT * 3);
  readonly col = new Float32Array(COUNT * 3);
  readonly size = new Float32Array(COUNT);
  readonly rnd: () => number;
  n = 0;

  constructor(seed: number) {
    this.rnd = mulberry(seed);
  }

  gauss() {
    let u = 0;
    while (u === 0) u = this.rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.rnd());
  }

  add(x: number, y: number, z: number, col: THREE.Color, s = 1, bright = 1) {
    if (this.n >= COUNT) return;
    const i = this.n++;
    const j = (0.8 + this.rnd() * 0.4) * bright * GAIN;
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.col[i * 3] = col.r * j;
    this.col[i * 3 + 1] = col.g * j;
    this.col[i * 3 + 2] = col.b * j;
    this.size[i] = s;
  }

  get left() {
    return COUNT - this.n;
  }

  /** Faint ambient specks around the subject; also pads every shape to COUNT. */
  sparkles(count: number, rMin = 7, rMax = 17) {
    const d = new THREE.Vector3();
    for (let k = 0; k < count; k++) {
      randomDir(this.rnd, d).multiplyScalar(rMin + (rMax - rMin) * Math.pow(this.rnd(), 0.7));
      this.add(d.x, d.y * 0.7, d.z, this.rnd() < 0.7 ? PAL.ice : PAL.cyan, 0.35 + this.rnd() * 0.4, 0.28);
    }
  }

  finish(): ShapeData {
    this.sparkles(this.left);
    return { pos: this.pos, col: this.col, size: this.size };
  }
}

/* ───────────────────────── primitives ───────────────────────── */

interface Opts {
  s?: number;
  b?: number;
}

function sphere(cl: Cloud, n: number, at: THREE.Vector3, r: number, col: THREE.Color, o: Opts & { surface?: boolean } = {}) {
  const d = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    randomDir(cl.rnd, d);
    const rr = o.surface ? r * (1 + cl.gauss() * 0.025) : r * Math.cbrt(cl.rnd());
    cl.add(at.x + d.x * rr, at.y + d.y * rr, at.z + d.z * rr, col, o.s ?? 0.7, o.b ?? 1);
  }
}

function cube(cl: Cloud, n: number, at: THREE.Vector3, edge: number, col: THREE.Color, rot = e3(0, 0, 0), o: Opts & { face?: number } = {}) {
  const h = edge / 2;
  const p = new THREE.Vector3();
  const nFace = Math.floor(n * (o.face ?? 0));
  for (let k = 0; k < n; k++) {
    const axis = Math.floor(cl.rnd() * 3);
    if (k < nFace) {
      const a = (cl.rnd() * 2 - 1) * h;
      const b = (cl.rnd() * 2 - 1) * h;
      const f = cl.rnd() < 0.5 ? -h : h;
      if (axis === 0) p.set(f, a, b);
      else if (axis === 1) p.set(a, f, b);
      else p.set(a, b, f);
    } else {
      const a = (cl.rnd() * 2 - 1) * h;
      const s1 = cl.rnd() < 0.5 ? -h : h;
      const s2 = cl.rnd() < 0.5 ? -h : h;
      if (axis === 0) p.set(a, s1, s2);
      else if (axis === 1) p.set(s1, a, s2);
      else p.set(s1, s2, a);
    }
    p.applyEuler(rot).add(at);
    const isFace = k < nFace;
    cl.add(p.x + cl.gauss() * 0.02, p.y + cl.gauss() * 0.02, p.z + cl.gauss() * 0.02, col, (o.s ?? 0.65) * (isFace ? 0.7 : 1), (o.b ?? 1) * (isFace ? 0.45 : 1));
  }
}

function torus(cl: Cloud, n: number, at: THREE.Vector3, R: number, tube: number, col: THREE.Color, rot = e3(0, 0, 0), o: Opts = {}) {
  const p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const u = cl.rnd() * Math.PI * 2;
    const t = cl.gauss() * tube;
    const w = cl.gauss() * tube;
    p.set((R + t) * Math.cos(u), (R + t) * Math.sin(u), w).applyEuler(rot).add(at);
    cl.add(p.x, p.y, p.z, col, o.s ?? 0.6, o.b ?? 1);
  }
}

function coin(cl: Cloud, n: number, at: THREE.Vector3, r: number, th: number, col: THREE.Color, rot = e3(0, 0, 0), o: Opts = {}) {
  const p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const pick = cl.rnd();
    const a = cl.rnd() * Math.PI * 2;
    if (pick < 0.4) {
      // rim
      p.set(Math.cos(a) * r, Math.sin(a) * r, (cl.rnd() - 0.5) * th);
    } else if (pick < 0.6) {
      // engraved inner ring
      const rr = r * 0.66;
      p.set(Math.cos(a) * rr, Math.sin(a) * rr, (cl.rnd() < 0.5 ? -0.5 : 0.5) * th);
    } else {
      const rr = Math.sqrt(cl.rnd()) * r;
      p.set(Math.cos(a) * rr, Math.sin(a) * rr, (cl.rnd() < 0.5 ? -0.5 : 0.5) * th);
    }
    p.applyEuler(rot).add(at);
    cl.add(p.x, p.y, p.z, col, o.s ?? 0.65, (o.b ?? 1) * (pick < 0.6 ? 1.1 : 0.55));
  }
}

function curve(cl: Cloud, n: number, a: THREE.Vector3, b: THREE.Vector3, ctrl: THREE.Vector3, ca: THREE.Color, cb: THREE.Color, spread: number, o: Opts = {}) {
  const tmp = new THREE.Color();
  for (let k = 0; k < n; k++) {
    const t = cl.rnd();
    const it = 1 - t;
    const x = it * it * a.x + 2 * it * t * ctrl.x + t * t * b.x;
    const y = it * it * a.y + 2 * it * t * ctrl.y + t * t * b.y;
    const z = it * it * a.z + 2 * it * t * ctrl.z + t * t * b.z;
    const sp = spread * (0.6 + 0.8 * Math.sin(Math.PI * t));
    tmp.copy(ca).lerp(cb, t);
    cl.add(x + cl.gauss() * sp, y + cl.gauss() * sp, z + cl.gauss() * sp, tmp, o.s ?? 0.55, o.b ?? 0.9);
  }
}

interface HelixOpts {
  H: number;
  R: number;
  turns: number;
  a: THREE.Color;
  b: THREE.Color;
  pairs: [THREE.Color, THREE.Color][];
  tube?: number;
}
interface HP {
  x: number;
  y: number;
  z: number;
  c: THREE.Color;
  s: number;
  rung: boolean;
}

/** Double helix: two backbones plus base-pair rungs coloured by pair type. */
function helixRaw(cl: Cloud, n: number, o: HelixOpts): HP[] {
  const out: HP[] = [];
  const rungs = Math.round(o.turns * 11);
  const per = Math.floor((n * 0.36) / rungs);
  const nStrand = n - per * rungs;
  const tube = o.tube ?? 0.15;
  for (let k = 0; k < nStrand; k++) {
    const strand = k & 1;
    const t = cl.rnd();
    const ang = t * o.turns * Math.PI * 2 + strand * Math.PI;
    out.push({
      x: Math.cos(ang) * o.R + cl.gauss() * tube,
      y: (t - 0.5) * o.H + cl.gauss() * tube,
      z: Math.sin(ang) * o.R + cl.gauss() * tube,
      c: strand ? o.b : o.a,
      s: 0.85 + cl.rnd() * 0.6,
      rung: false,
    });
  }
  for (let r = 0; r < rungs; r++) {
    const t = (r + 0.5) / rungs;
    const ang = t * o.turns * Math.PI * 2;
    const ax = Math.cos(ang) * o.R;
    const az = Math.sin(ang) * o.R;
    const y = (t - 0.5) * o.H;
    const pair = o.pairs[(r * 7 + 3) % o.pairs.length];
    for (let j = 0; j < per; j++) {
      const u = 0.06 + cl.rnd() * 0.88;
      out.push({
        x: ax * (1 - 2 * u) + cl.gauss() * 0.045,
        y: y + cl.gauss() * 0.045,
        z: az * (1 - 2 * u) + cl.gauss() * 0.045,
        c: u < 0.5 ? pair[0] : pair[1],
        s: 0.55 + cl.rnd() * 0.3,
        rung: true,
      });
    }
  }
  return out;
}

const BASE_HELIX: HelixOpts = {
  H: 13,
  R: 2.3,
  turns: 3.2,
  a: PAL.teal,
  b: PAL.cyan,
  pairs: [
    [PAL.teal, PAL.gold],
    [PAL.violet, PAL.coral],
    [PAL.gold, PAL.teal],
    [PAL.coral, PAL.violet],
  ],
};
const HELIX_N = 14600;
// helix, fragments and glitch share a seed so particle i is the same base pair in all three,
// which makes the helix visibly shatter and glitch instead of dissolving.
const HELIX_SEED = 7;

/* ───────────────────────── shapes ───────────────────────── */

function helix(): ShapeData {
  const cl = new Cloud(HELIX_SEED);
  for (const p of helixRaw(cl, HELIX_N, BASE_HELIX)) cl.add(p.x, p.y, p.z, p.c, p.s, p.rung ? 0.8 : 1);
  return cl.finish();
}

function fragments(): ShapeData {
  const cl = new Cloud(HELIX_SEED);
  const pts = helixRaw(cl, HELIX_N, BASE_HELIX);
  const r2 = mulberry(99);
  const SEG = 7;
  const segs = Array.from({ length: SEG }, (_, i) => {
    const cy = ((i + 0.5) / SEG - 0.5) * BASE_HELIX.H;
    return {
      center: v3(0, cy, 0),
      offset: v3((r2() - 0.5) * 6.5, cy * 0.3 + (r2() - 0.5) * 1.2, (r2() - 0.5) * 5),
      axis: randomDir(r2).normalize(),
      angle: (r2() - 0.5) * 1.6,
    };
  });
  const p = new THREE.Vector3();
  for (const h of pts) {
    if (r2() < 0.16) {
      // leaked: data streaming away from the body of the helix
      const g = () => (r2() + r2() + r2() - 1.5) * 2;
      cl.add(h.x + 4 + r2() * 10, h.y * 0.8 + g() * 1.6, h.z + g() * 1.5, PAL.coral, 0.6, 0.85);
      continue;
    }
    const si = Math.min(SEG - 1, Math.max(0, Math.floor(((h.y / BASE_HELIX.H) + 0.5) * SEG)));
    const s = segs[si];
    p.set(h.x, h.y, h.z).sub(s.center).applyAxisAngle(s.axis, s.angle).add(s.center).add(s.offset);
    cl.add(p.x, p.y, p.z, h.c, h.s, h.rung ? 0.7 : 0.9);
  }
  return cl.finish();
}

function fingerprint(): ShapeData {
  const cl = new Cloud(21);
  const TURNS = 21;
  const thetaMax = TURNS * Math.PI * 2;
  const gaps = Array.from({ length: 14 }, () => ({ th: cl.rnd() * thetaMax, w: 0.12 + cl.rnd() * 0.25 }));
  const tmp = new THREE.Color();
  let placed = 0;
  let guard = 0;
  while (placed < 13600 && guard++ < 200000) {
    const th = thetaMax * Math.sqrt(cl.rnd());
    if (gaps.some((g) => Math.abs(th - g.th) < g.w)) continue;
    const r = 0.18 + (0.235 * th) / (Math.PI * 2);
    let x = r * Math.cos(th) * 0.86;
    let y = r * Math.sin(th) * 1.1;
    x += 0.14 * Math.sin(y * 1.7);
    y += 0.1 * Math.sin(x * 2.1) - 0.25;
    if ((x / 4.3) ** 2 + ((y + 0.2) / 5.5) ** 2 > 1) continue;
    const z = -0.04 * (x * x + y * y) + cl.gauss() * 0.04;
    const k = Math.min(1, r / 5.2);
    if (k < 0.5) tmp.copy(PAL.teal).lerp(PAL.cyan, k * 2);
    else tmp.copy(PAL.cyan).lerp(PAL.violet, (k - 0.5) * 2);
    const scan = y > 0.55 && y < 1.05;
    cl.add(x + cl.gauss() * 0.03, y + cl.gauss() * 0.03, z, scan ? PAL.gold : tmp, scan ? 0.95 : 0.85, scan ? 1.8 : 1.35);
    placed++;
  }
  // scanner line sweeping across the print
  for (let k = 0; k < 500; k++) cl.add((cl.rnd() - 0.5) * 10, 0.8 + cl.gauss() * 0.02, 0.4, PAL.gold, 0.5, 0.8);
  return cl.finish();
}

function extraction(): ShapeData {
  const cl = new Cloud(33);
  const core = v3(-3.2, -0.2, 0);
  sphere(cl, 3200, core, 1.7, PAL.teal, { s: 0.75 });
  sphere(cl, 800, core, 1.85, PAL.cyan, { surface: true, s: 0.6, b: 0.8 });
  const sinks = [v3(3.8, 3.6, -1.2), v3(4.6, -0.2, 1.0), v3(3.6, -3.9, -0.4)];
  const ctrls = [v3(0.2, 3.8, 0.8), v3(0.8, 1.2, 2.2), v3(0.2, -3.6, 1.4)];
  sinks.forEach((s, i) => {
    cube(cl, 1400, s, 1.5, PAL.gold, e3(cl.rnd() * 3, cl.rnd() * 3, cl.rnd() * 3), { face: 0.25, s: 0.7, b: 1.1 });
    const from = s.clone().sub(core).normalize().multiplyScalar(1.7).add(core);
    curve(cl, 2000, from, s, ctrls[i], PAL.teal, PAL.gold, 0.11, { s: 0.55 });
  });
  return cl.finish();
}

function orbit(): ShapeData {
  const cl = new Cloud(44);
  const O = v3(0, 0, 0);
  for (let k = 0; k < 2600; k++) {
    const d = randomDir(cl.rnd).multiplyScalar(1.3 * Math.cbrt(cl.rnd()));
    cl.add(d.x, d.y, d.z, cl.rnd() < 0.5 ? PAL.teal : PAL.gold, 0.8, 1);
  }
  sphere(cl, 400, O, 1.42, PAL.ice, { surface: true, s: 0.5, b: 0.6 });
  const rings: [number, THREE.Euler, THREE.Color][] = [
    [2.6, e3(1.25, 0, 0.25), PAL.teal],
    [3.5, e3(1.05, 0.6, -0.35), PAL.violet],
    [4.4, e3(1.45, -0.4, 0.5), PAL.gold],
    [5.3, e3(0.9, 0.2, -0.6), PAL.coral],
  ];
  rings.forEach(([R, rot, col], i) => {
    torus(cl, 2300, O, R, 0.05, col, rot, { s: 0.55, b: 0.85 });
    const a = i * 1.7 + 0.6;
    const planet = v3(Math.cos(a) * R, Math.sin(a) * R, 0).applyEuler(rot);
    sphere(cl, 260, planet, 0.28, col, { s: 0.8, b: 1.5 });
  });
  return cl.finish();
}

function pipeline(): ShapeData {
  const cl = new Cloud(55);
  const S = [v3(-2.4, 4.7, 0), v3(1.9, 2.4, -0.6), v3(-1.6, 0, 0.6), v3(2.2, -2.4, -0.4), v3(-1.2, -4.7, 0.4)];
  const cols = [PAL.teal, PAL.cyan, PAL.violet, PAL.ice, PAL.gold];
  // 1 · DNA sample: mini helix
  const mini = helixRaw(cl, 1800, { ...BASE_HELIX, H: 2.4, R: 0.55, turns: 1.4, tube: 0.06 });
  for (const p of mini) cl.add(p.x + S[0].x, p.y + S[0].y, p.z + S[0].z, p.c, p.s * 0.8, 1);
  // 2 · encrypted vault: cube with a glowing core
  cube(cl, 1300, S[1], 1.7, PAL.cyan, e3(0.4, 0.6, 0), { face: 0.2, s: 0.65 });
  sphere(cl, 500, S[1], 0.45, PAL.teal, { s: 0.7, b: 1.3 });
  // 3 · smart contract: block with hashed faces
  cube(cl, 1800, S[2], 1.5, PAL.violet, e3(0.3, -0.5, 0.2), { face: 0.35, s: 0.65 });
  // 4 · researcher: lens
  torus(cl, 1000, S[3], 0.85, 0.05, PAL.ice, e3(0.2, 0.5, 0), { s: 0.6 });
  sphere(cl, 500, S[3], 0.42, PAL.cyan, { surface: true, s: 0.6 });
  // 5 · payment: coin
  coin(cl, 1600, S[4], 0.95, 0.18, PAL.gold, e3(0.35, 0.45, 0), { s: 0.65 });
  for (let i = 0; i < 4; i++) {
    const a = S[i];
    const b = S[i + 1];
    const mid = a.clone().add(b).multiplyScalar(0.5).add(v3(0, 0, 1.6));
    curve(cl, 1100, a, b, mid, cols[i], cols[i + 1], 0.06, { s: 0.5, b: 0.8 });
  }
  return cl.finish();
}

function chain(): ShapeData {
  const cl = new Cloud(66);
  const B = 8;
  const R = 3.0;
  const pts = Array.from({ length: B }, (_, i) => {
    const a = i * 0.85;
    return { a, p: v3(Math.cos(a) * R, (i - 3.5) * 1.55, Math.sin(a) * R) };
  });
  pts.forEach(({ a, p }, i) => {
    const gold = i === 5;
    cube(cl, 1150, p, 1.15, gold ? PAL.gold : PAL.violet, e3(0, -a, 0), { face: 0.22, s: 0.7, b: gold ? 1.5 : 1 });
  });
  // links between blocks
  for (let i = 0; i < B - 1; i++) {
    const a = pts[i].p;
    const b = pts[i + 1].p;
    for (let k = 0; k < 360; k++) {
      const t = cl.rnd();
      const side = k & 1 ? 0.12 : -0.12;
      cl.add(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t + side, a.z + (b.z - a.z) * t, PAL.cyan, 0.5, 0.9);
    }
  }
  // the opposite strand: the chain is literally one side of a DNA helix
  for (let k = 0; k < 1800; k++) {
    const t = cl.rnd() * (B - 1);
    const a = t * 0.85 + Math.PI;
    cl.add(Math.cos(a) * R + cl.gauss() * 0.06, (t - 3.5) * 1.55 + cl.gauss() * 0.06, Math.sin(a) * R + cl.gauss() * 0.06, PAL.teal, 0.5, 0.55);
  }
  pts.forEach(({ a, p }) => {
    const q = v3(Math.cos(a + Math.PI) * R, p.y, Math.sin(a + Math.PI) * R);
    for (let k = 0; k < 120; k++) {
      const t = 0.2 + cl.rnd() * 0.8;
      cl.add(p.x + (q.x - p.x) * t, p.y, p.z + (q.z - p.z) * t, t > 0.6 ? PAL.teal : PAL.gold, 0.45, 0.55);
    }
  });
  return cl.finish();
}

function shield(): ShapeData {
  const cl = new Cloud(77);
  const R = 4.4;
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const edges = new Map<string, [THREE.Vector3, THREE.Vector3]>();
  const verts = new Map<string, THREE.Vector3>();
  const key = (v: THREE.Vector3) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
  for (let i = 0; i < pos.count; i += 3) {
    const tri = [0, 1, 2].map((j) => v3(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j)));
    tri.forEach((v) => verts.set(key(v), v));
    for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
      const ka = key(tri[a]);
      const kb = key(tri[b]);
      edges.set(ka < kb ? ka + kb : kb + ka, [tri[a], tri[b]]);
    }
  }
  geo.dispose();
  const list = [...edges.values()];
  const p = new THREE.Vector3();
  for (let k = 0; k < 5600; k++) {
    const [a, b] = list[Math.floor(cl.rnd() * list.length)];
    p.copy(a).lerp(b, cl.rnd()).normalize().multiplyScalar(R);
    cl.add(p.x, p.y, p.z, PAL.violet, 0.62, 1.25);
  }
  for (const v of verts.values()) sphere(cl, 16, v.clone().multiplyScalar(R), 0.09, PAL.ice, { s: 0.7, b: 1.4 });
  torus(cl, 1700, v3(0, 0, 0), 3.0, 0.07, PAL.cyan, e3(Math.PI / 2 - 0.25, 0.3, 0), { s: 0.55 });
  const inner = helixRaw(cl, 3600, { ...BASE_HELIX, H: 4.4, R: 0.85, turns: 2, a: PAL.teal, b: PAL.gold, tube: 0.07 });
  for (const q of inner) cl.add(q.x, q.y, q.z, q.c, q.s * 0.85, 1.1);
  sphere(cl, 400, v3(0, 0, 0), 0.5, PAL.gold, { s: 0.6, b: 0.8 });
  return cl.finish();
}

function network(): ShapeData {
  const cl = new Cloud(88);
  const majors = [v3(-2.6, 3.2, 1), v3(2.9, 2.3, -1.5), v3(0.3, -0.4, 2.3), v3(-3.0, -2.9, -0.8), v3(2.7, -3.4, 0.9)];
  const majorCols = [PAL.teal, PAL.violet, PAL.coral, PAL.gold, PAL.cyan];
  const nodes = [...majors];
  let guard = 0;
  while (nodes.length < 36 && guard++ < 5000) {
    const p = v3((cl.rnd() * 2 - 1) * 5.6, (cl.rnd() * 2 - 1) * 5.4, (cl.rnd() * 2 - 1) * 4);
    if ((p.x / 5.6) ** 2 + (p.y / 5.4) ** 2 + (p.z / 4) ** 2 > 1) continue;
    if (nodes.some((q) => q.distanceTo(p) < 1.25)) continue;
    nodes.push(p);
  }
  majors.forEach((m, i) => {
    sphere(cl, 380, m, 0.5, majorCols[i], { s: 0.85, b: 1.3 });
    torus(cl, 140, m, 0.85, 0.02, majorCols[i], e3(cl.rnd() * 3, cl.rnd() * 3, 0), { s: 0.45, b: 0.8 });
  });
  for (let i = majors.length; i < nodes.length; i++) sphere(cl, 100, nodes[i], 0.2, cl.rnd() < 0.5 ? PAL.ice : PAL.cyan, { s: 0.6, b: 1 });
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  nodes.forEach((p, i) => {
    const k = i < majors.length ? 4 : 2;
    nodes
      .map((q, j) => ({ j, d: q.distanceTo(p) }))
      .filter((o) => o.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, k)
      .forEach(({ j }) => {
        const id = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edgeSet.has(id)) {
          edgeSet.add(id);
          edges.push([i, j]);
        }
      });
  });
  const lens = edges.map(([a, b]) => nodes[a].distanceTo(nodes[b]));
  const total = lens.reduce((x, y) => x + y, 0);
  const budget = cl.left - 1800;
  const tmp = new THREE.Color();
  const colOf = (i: number) => (i < majors.length ? majorCols[i] : PAL.ice);
  edges.forEach(([a, b], e) => {
    const n = Math.floor((lens[e] / total) * budget);
    for (let k = 0; k < n; k++) {
      const t = cl.rnd();
      tmp.copy(colOf(a)).lerp(colOf(b), t);
      const p = nodes[a].clone().lerp(nodes[b], t);
      cl.add(p.x + cl.gauss() * 0.02, p.y + cl.gauss() * 0.02, p.z + cl.gauss() * 0.02, tmp, 0.42, 0.55);
    }
  });
  return cl.finish();
}

function glitch(): ShapeData {
  const cl = new Cloud(HELIX_SEED);
  const pts = helixRaw(cl, HELIX_N, BASE_HELIX);
  const r2 = mulberry(5);
  const BAND = 0.55;
  const bands = Array.from({ length: 40 }, () => (r2() < 0.42 ? { dx: (r2() - 0.5) * 3.4, dz: (r2() - 0.5) * 1.2 } : null));
  const ice = new THREE.Color();
  for (const h of pts) {
    if (h.rung && r2() < 0.35) {
      // broken base pairs falling away
      cl.add(h.x + (r2() - 0.5) * 1.6, h.y - 0.6 - r2() * 3.2, h.z + (r2() - 0.5) * 1.6, PAL.coral, 0.5, 0.6);
      continue;
    }
    const bi = Math.floor((h.y + BASE_HELIX.H / 2) / BAND);
    const g = bands[bi % bands.length];
    if (g) {
      cl.add(h.x + g.dx, h.y, h.z + g.dz, PAL.coral, h.s, 1.15);
    } else {
      ice.copy(h.c).lerp(PAL.ice, 0.35);
      cl.add(h.x, h.y, h.z, ice, h.s, 0.8);
    }
  }
  return cl.finish();
}

function galaxy(): ShapeData {
  const cl = new Cloud(99);
  const RMAX = 6.4;
  const ARMS = 3;
  const tmp = new THREE.Color();
  for (let k = 0; k < 1400; k++) {
    cl.add(cl.gauss() * 0.5, cl.gauss() * 0.25, cl.gauss() * 0.5, cl.rnd() < 0.5 ? PAL.gold : PAL.ice, 0.85, 1.3);
  }
  for (let k = 0; k < 13200; k++) {
    const r = RMAX * Math.pow(cl.rnd(), 1.15) + 0.35;
    const arm = k % ARMS;
    const a = (arm / ARMS) * Math.PI * 2 + r * 1.05;
    // most stars hug the arm; a minority scatter between arms
    const loose = cl.rnd() < 0.18;
    const spread = loose ? 0.55 + 0.1 * r : 0.1 + 0.035 * r;
    const x = Math.cos(a) * r + cl.gauss() * spread;
    const z = Math.sin(a) * r + cl.gauss() * spread;
    const y = cl.gauss() * 0.12 * (1.2 - r / RMAX);
    const t = Math.min(1, r / RMAX);
    tmp.copy(PAL.gold).lerp(PAL.teal, Math.min(1, t * 1.5));
    if (t > 0.5 && cl.rnd() < 0.3) tmp.copy(PAL.violet);
    cl.add(x, y, z, tmp, 0.55 + cl.rnd() * 0.5, (loose ? 0.6 : 1.15) * (1 - t * 0.3));
  }
  return cl.finish();
}

function helixGold(): ShapeData {
  const cl = new Cloud(HELIX_SEED);
  const pts = helixRaw(cl, 12800, {
    ...BASE_HELIX,
    a: PAL.teal,
    b: PAL.gold,
    pairs: [
      [PAL.violet, PAL.gold],
      [PAL.gold, PAL.violet],
      [PAL.teal, PAL.gold],
    ],
  });
  for (const p of pts) cl.add(p.x, p.y, p.z, p.c, p.s, p.rung ? 0.85 : 1.05);
  // a ring of ledger blocks guarding the restored helix
  const ringRot = e3(0.35, 0, -0.15);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = v3(Math.cos(a) * 4.4, 0, Math.sin(a) * 4.4).applyEuler(ringRot);
    cube(cl, 200, p, 0.62, PAL.violet, e3(0, -a, 0), { s: 0.6, b: 1.1 });
  }
  torus(cl, 600, v3(0, 0, 0), 4.4, 0.02, PAL.violet, e3(Math.PI / 2 + 0.35, 0, -0.15), { s: 0.4, b: 0.5 });
  return cl.finish();
}

const BUILDERS: Record<ShapeId, () => ShapeData> = {
  helix,
  fragments,
  fingerprint,
  extraction,
  orbit,
  pipeline,
  chain,
  shield,
  network,
  glitch,
  galaxy,
  helixGold,
};

/**
 * All shapes share one random permutation, so related shapes (helix → fragments → glitch)
 * keep particle correspondence while unrelated ones get a rich, swirling reshuffle.
 */
const PERM = (() => {
  const r = mulberry(1234);
  const p = Array.from({ length: COUNT }, (_, i) => i);
  for (let i = COUNT - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
})();

function permute(d: ShapeData): ShapeData {
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const j = PERM[i];
    pos[i * 3] = d.pos[j * 3];
    pos[i * 3 + 1] = d.pos[j * 3 + 1];
    pos[i * 3 + 2] = d.pos[j * 3 + 2];
    col[i * 3] = d.col[j * 3];
    col[i * 3 + 1] = d.col[j * 3 + 1];
    col[i * 3 + 2] = d.col[j * 3 + 2];
    size[i] = d.size[j];
  }
  return { pos, col, size };
}

const cache = new Map<ShapeId, ShapeData>();

export function getShape(id: ShapeId): ShapeData {
  let d = cache.get(id);
  if (!d) {
    d = permute(BUILDERS[id]());
    cache.set(id, d);
  }
  return d;
}
