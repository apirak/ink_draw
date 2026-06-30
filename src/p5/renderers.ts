import { dab, stroke } from './brush';
import type { Agent } from '../agents';
import { INK, KOI_SUMI, SEPIA, type ColorFactory, type KoiVariety } from '../modes';

// ponytail: runtime-tunable koi visual params; mutated by koi-tuner panel
export const VIS = {
  bodyA: 0.92,
  patchA: 0.9,
  sumiA: 0.55,
  tailA: 0.9,
  crownA: 0.85,
  eyeA: 0.5,
  contourA: 0.1,
  contourW: 1,
  patchScale: 0.8,
  noseScale: 1,
  crownScale: 1,
  eyeScale: 0.5,
  bodyWidth: 1.2,
  dabStroke: false,
  patchSolid: false,
};

export function drawBird(
  p: any,
  a: Agent,
  _t: number,
  morph: number,
  ink: ColorFactory = INK,
): void {
  const s = a.size * a.z;
  const ang = Math.atan2(a.vy, a.vx);
  const alpha = a.density * (0.55 + a.z * 0.35) * morph;
  const flap = Math.sin(a.phase);

  p.push();
  p.translate(a.x, a.y);
  p.rotate(ang);

  p.fill(ink(alpha * 0.5));
  stroke(
    p,
    0,
    0,
    -s * 0.55,
    s * (0.55 + flap * 0.55),
    -s * 1.45,
    s * (0.35 + flap * 0.95),
    s * 0.22,
  );

  p.fill(ink(alpha));
  dab(p, 0, 0, s * 0.62, s * 0.26, 0);
  dab(p, s * 0.55, -s * 0.07, s * 0.2, s * 0.15, 0);
  stroke(
    p,
    -s * 0.4,
    0,
    -s * 0.95,
    s * 0.06,
    -s * 1.25,
    s * 0.14,
    s * 0.14,
  );

  stroke(
    p,
    0,
    -s * 0.05,
    -s * 0.5,
    -s * (0.7 + flap * 0.6),
    -s * 1.6,
    -s * (0.5 + flap * 1.15),
    s * 0.3,
  );

  p.pop();
}

const KOI_PROFILE = [
  0.5, 0.82, 0.98, 1, 0.94, 0.85, 0.74, 0.62, 0.5, 0.38, 0.27, 0.17, 0.08,
];

export function drawKoi(
  p: any,
  a: Agent,
  _t: number,
  morph: number,
): void {
  const h = [{ x: a.x, y: a.y }, ...a.hist];
  if (h.length < 4) return;

  const s = a.size;
  const alpha = (0.6 + a.density * 0.4) * morph;
  const kind = a.koiKind as KoiVariety;
  const n = Math.min(h.length, 13);
  const grow = Math.min(n / 13, 1);

  const Lx: number[] = [];
  const Ly: number[] = [];
  const Rx: number[] = [];
  const Ry: number[] = [];

  for (let i = 0; i < n; i++) {
    const p_ = h[i];
    const o = h[Math.max(i - 1, 0)];
    const q = h[Math.min(i + 1, n - 1)];
    let dx = o.x - q.x;
    let dy = o.y - q.y;
    const d = Math.hypot(dx, dy) || 1;
    const w = s * 0.3 * KOI_PROFILE[i] * grow * VIS.bodyWidth;
    Lx.push(p_.x - (dy / d) * w);
    Ly.push(p_.y + (dx / d) * w);
    Rx.push(p_.x + (dy / d) * w);
    Ry.push(p_.y - (dx / d) * w);
  }

  const bodyPath = () => {
    p.beginShape();
    p.vertex(Lx[0], Ly[0]);
    for (let i = 1; i < n; i++) p.vertex(Lx[i], Ly[i]);
    for (let i = n - 1; i >= 0; i--) p.vertex(Rx[i], Ry[i]);
    p.endShape(p.CLOSE);
  };

  p.fill(kind.body(alpha * VIS.bodyA));
  bodyPath();

  const dc = p.drawingContext;
  dc.save();
  dc.beginPath();
  dc.moveTo(Lx[0], Ly[0]);
  for (let i = 1; i < n; i++) dc.lineTo(Lx[i], Ly[i]);
  for (let i = n - 1; i >= 0; i--) dc.lineTo(Rx[i], Ry[i]);
  dc.closePath();
  dc.clip();

  if (!VIS.dabStroke) p.noStroke();
  p.fill(kind.patch(VIS.patchSolid ? VIS.patchA : alpha * VIS.patchA));
  for (const [idx, scale, jit] of [
    [1, 1.05, 0.1],
    [3, 0.95, -0.18],
    [5, 0.8, 0.22],
    [8, 0.55, -0.1],
  ] as const) {
    const p_ = h[Math.min(idx, n - 1)];
    if (!p_) continue;
    if (((a.koiSpots + idx * 0.17) % 1) > 0.72) continue;
    dab(p, p_.x, p_.y, s * 0.34 * scale * VIS.patchScale, s * 0.26 * scale * VIS.patchScale, idx + jit);
  }

  if (kind.sumi) {
    p.fill(KOI_SUMI(alpha * VIS.sumiA));
    for (const [idx, sc] of [
      [2, 0.18],
      [4, 0.15],
      [6, 0.13],
    ] as const) {
      const p_ = h[Math.min(idx, n - 1)];
      if (!p_) continue;
      if (((a.koiSpots + idx * 0.31) % 1) > 0.55) continue;
      dab(p, p_.x, p_.y, s * sc * VIS.patchScale, s * sc * 0.9 * VIS.patchScale, idx);
    }
  }
  dc.restore();

  p.stroke(INK(alpha * VIS.contourA));
  p.strokeWeight(VIS.contourW);
  p.noFill();
  bodyPath();

  p.noStroke();
  p.fill(kind.body(alpha * VIS.bodyA));
  dab(p, h[0].x, h[0].y, s * 0.15 * grow * VIS.noseScale, s * 0.15 * grow * VIS.noseScale, 0);

  const head = h[0];
  const neck = h[2] || head;
  const tail = h[n - 1];
  const tail2 = h[n - 2] || tail;

  const ta = Math.atan2(tail.y - tail2.y, tail.x - tail2.x);
  p.fill(kind.body(alpha * VIS.tailA));
  p.push();
  p.translate(tail.x, tail.y);
  p.rotate(ta);
  stroke(p, 0, 0, s * 0.45, -s * 0.3, s * 0.85, -s * 0.52, s * 0.12);
  stroke(p, 0, 0, s * 0.45, s * 0.3, s * 0.85, s * 0.52, s * 0.12);
  p.pop();

  const na = Math.atan2(head.y - neck.y, head.x - neck.x);
  p.push();
  p.translate(neck.x, neck.y);
  p.rotate(na);
  stroke(p, 0, 0, -s * 0.25, -s * 0.42, -s * 0.5, -s * 0.6, s * 0.1);
  stroke(p, 0, 0, -s * 0.25, s * 0.42, -s * 0.5, s * 0.6, s * 0.1);
  p.pop();

  if (a.hasRed) {
    p.fill(kind.patch(alpha * VIS.crownA));
    const p_ = h[1] || head;
    dab(p, p_.x, p_.y, s * 0.3 * VIS.crownScale, s * 0.22 * VIS.crownScale, na);
  }

  p.fill(KOI_SUMI(alpha * VIS.eyeA));
  const eyeRx = s * 0.08 * VIS.eyeScale;
  const eyeRy = s * 0.07 * VIS.eyeScale;
  const perpX = Math.cos(na + Math.PI / 2);
  const perpY = Math.sin(na + Math.PI / 2);
  const eyeOff = s * 0.12;
  dab(p, head.x + perpX * eyeOff, head.y + perpY * eyeOff, eyeRx, eyeRy, na);
  dab(p, head.x - perpX * eyeOff, head.y - perpY * eyeOff, eyeRx, eyeRy, na);
}

export const SHD = { x: -0.38, y: -0.925 };
export const SHP = { x: 0.925, y: -0.38 };
export const SHK = 1.15;

function gazelleSide(p: any, s: number, g: number, lift: number, color: any) {
  p.fill(color);
  p.noStroke();
  for (const [oxN, ph] of [
    [-0.62, 0],
    [-0.5, 2.2],
    [0.42, Math.PI],
    [0.55, Math.PI + 2.2],
  ] as const) {
    const ox = oxN * s;
    const sw = Math.sin(g + ph) * 0.55 * lift;
    stroke(
      p,
      ox,
      s * 0.1,
      ox + sw * s * 0.4,
      s * 0.45,
      ox + sw * s * 0.75,
      s * 0.8,
      s * 0.085,
    );
  }
  dab(p, 0, 0, s * 0.95, s * 0.38, -0.06);
  stroke(p, s * 0.7, -s * 0.1, s * 1.05, -s * 0.55, s * 1.18, -s * 0.72, s * 0.2);
  dab(p, s * 1.28, -s * 0.78, s * 0.26, s * 0.14, 0.35);
  stroke(
    p,
    s * 1.3,
    -s * 0.88,
    s * 1.18,
    -s * 1.12,
    s * 1.08,
    -s * 1.28,
    s * 0.045,
  );
  stroke(
    p,
    s * 1.4,
    -s * 0.88,
    s * 1.35,
    -s * 1.14,
    s * 1.3,
    -s * 1.3,
    s * 0.045,
  );
  stroke(
    p,
    -s * 0.9,
    -s * 0.12,
    -s * 1.15,
    s * 0.05 + Math.sin(g * 0.7) * s * 0.12,
    -s * 1.3,
    s * 0.18,
    s * 0.06,
  );
}

export function drawHerd(
  p: any,
  a: Agent,
  _t: number,
  morph: number,
): void {
  const s = a.size;
  const alpha = a.density * 0.9 * morph;
  const g = a.phase;
  const speed = Math.hypot(a.vx, a.vy);
  const lift = Math.min(speed / 2.5, 1);

  const lat =
    speed > 1e-3
      ? (a.vx * SHP.x + a.vy * SHP.y) / speed
      : a.face;
  if (lat > 0.15) a.face = 1;
  else if (lat < -0.15) a.face = -1;
  const fore = Math.max(Math.abs(lat), 0.35);

  p.push();
  p.applyMatrix(
    SHP.x * a.face * fore,
    SHP.y * a.face * fore,
    -SHD.x * SHK,
    -SHD.y * SHK,
    a.x + SHD.x * SHK * s * 0.8,
    a.y + SHD.y * SHK * s * 0.8,
  );
  gazelleSide(p, s, g, lift, SEPIA(alpha * 0.3));
  p.pop();

  p.push();
  p.translate(a.x, a.y);
  p.rotate(Math.atan2(a.vy, a.vx));
  const str = 1 + Math.sin(g) * 0.08 * lift;
  p.fill(SEPIA(alpha));
  dab(p, -s * 0.15, 0, s * 0.48 * str, s * 0.24, 0);
  dab(p, s * 0.28, 0, s * 0.34, s * 0.2, 0);
  dab(p, s * 0.62, 0, s * 0.17, s * 0.11, 0);
  dab(p, s * 0.85, 0, s * 0.13, s * 0.1, 0);

  p.fill(SEPIA(alpha * 0.85));
  stroke(p, s * 0.88, -s * 0.04, s * 0.76, -s * 0.13, s * 0.6, -s * 0.2, s * 0.03);
  stroke(p, s * 0.88, s * 0.04, s * 0.76, s * 0.13, s * 0.6, s * 0.2, s * 0.03);

  const ext = Math.sin(g) * 0.5 + 0.5;
  p.fill(SEPIA(alpha * 0.9));
  dab(p, s * (0.42 + ext * 0.25), -s * 0.14, s * 0.14, s * 0.05, -0.25);
  dab(p, s * (0.42 + ext * 0.25), s * 0.14, s * 0.14, s * 0.05, 0.25);
  dab(p, -s * (0.5 + (1 - ext) * 0.25), -s * 0.14, s * 0.15, s * 0.05, 0.25);
  dab(p, -s * (0.5 + (1 - ext) * 0.25), s * 0.14, s * 0.15, s * 0.05, -0.25);

  p.fill(SEPIA(alpha * 0.8));
  stroke(
    p,
    -s * 0.6,
    0,
    -s * 0.78,
    Math.sin(g * 0.7) * s * 0.08,
    -s * 0.9,
    Math.sin(g * 0.7) * s * 0.14,
    s * 0.04,
  );
  p.pop();
}
