import { dab, stroke } from './brush';
import type { Agent } from './agents';
import { INK, KOI_SUMI, SEPIA, type ColorFactory, type KoiVariety } from './modes';

export function drawBird(
  ctx: CanvasRenderingContext2D,
  a: Agent,
  _t: number,
  morph: number,
  ink: ColorFactory = INK,
): void {
  const s = a.size * a.z;
  const ang = Math.atan2(a.vy, a.vx);
  const alpha = a.density * (0.55 + a.z * 0.35) * morph;
  const flap = Math.sin(a.phase);

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(ang);

  // far wing — drier ink
  ctx.fillStyle = ink(alpha * 0.5);
  stroke(
    ctx,
    0,
    0,
    -s * 0.55,
    s * (0.55 + flap * 0.55),
    -s * 1.45,
    s * (0.35 + flap * 0.95),
    s * 0.22,
  );

  // body
  ctx.fillStyle = ink(alpha);
  dab(ctx, 0, 0, s * 0.62, s * 0.26, 0);
  dab(ctx, s * 0.55, -s * 0.07, s * 0.2, s * 0.15, 0); // head
  stroke(
    ctx,
    -s * 0.4,
    0,
    -s * 0.95,
    s * 0.06,
    -s * 1.25,
    s * 0.14,
    s * 0.14,
  ); // tail

  // near wing — the signature stroke
  stroke(
    ctx,
    0,
    -s * 0.05,
    -s * 0.5,
    -s * (0.7 + flap * 0.6),
    -s * 1.6,
    -s * (0.5 + flap * 1.15),
    s * 0.3,
  );

  ctx.restore();
}

const KOI_PROFILE = [
  0.5, 0.82, 0.98, 1, 0.94, 0.85, 0.74, 0.62, 0.5, 0.38, 0.27, 0.17, 0.08,
];

export function drawKoi(
  ctx: CanvasRenderingContext2D,
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
    const p = h[i];
    const o = h[Math.max(i - 1, 0)];
    const q = h[Math.min(i + 1, n - 1)];
    let dx = o.x - q.x;
    let dy = o.y - q.y;
    const d = Math.hypot(dx, dy) || 1;
    const w = s * 0.3 * KOI_PROFILE[i] * grow;
    Lx.push(p.x - (dy / d) * w);
    Ly.push(p.y + (dx / d) * w);
    Rx.push(p.x + (dy / d) * w);
    Ry.push(p.y - (dx / d) * w);
  }

  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(Lx[0], Ly[0]);
    for (let i = 1; i < n; i++) ctx.lineTo(Lx[i], Ly[i]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(Rx[i], Ry[i]);
    ctx.closePath();
  };

  // body
  ctx.fillStyle = kind.body(alpha * 0.92);
  bodyPath();
  ctx.fill();

  // markings clipped to body
  ctx.save();
  bodyPath();
  ctx.clip();
  ctx.fillStyle = kind.patch(alpha * 0.9);
  for (const [idx, scale, jit] of [
    [1, 1.05, 0.1],
    [3, 0.95, -0.18],
    [5, 0.8, 0.22],
    [8, 0.55, -0.1],
  ] as const) {
    const p = h[Math.min(idx, n - 1)];
    if (!p) continue;
    if (((a.koiSpots + idx * 0.17) % 1) > 0.72) continue;
    dab(ctx, p.x, p.y, s * 0.34 * scale, s * 0.26 * scale, idx + jit);
  }

  if (kind.sumi) {
    ctx.fillStyle = KOI_SUMI(alpha * 0.55);
    for (const [idx, sc] of [
      [2, 0.18],
      [4, 0.15],
      [6, 0.13],
    ] as const) {
      const p = h[Math.min(idx, n - 1)];
      if (!p) continue;
      if (((a.koiSpots + idx * 0.31) % 1) > 0.55) continue;
      dab(ctx, p.x, p.y, s * sc, s * sc * 0.9, idx);
    }
  }
  ctx.restore();

  // contour
  ctx.strokeStyle = INK(alpha * 0.28);
  ctx.lineWidth = 1;
  bodyPath();
  ctx.stroke();

  // nose cap
  ctx.fillStyle = kind.body(alpha * 0.92);
  dab(ctx, h[0].x, h[0].y, s * 0.15 * grow, s * 0.15 * grow, 0);

  const head = h[0];
  const neck = h[2] || head;
  const tail = h[n - 1];
  const tail2 = h[n - 2] || tail;

  // tail fin
  const ta = Math.atan2(tail.y - tail2.y, tail.x - tail2.x);
  ctx.fillStyle = kind.body(alpha * 0.4);
  ctx.save();
  ctx.translate(tail.x, tail.y);
  ctx.rotate(ta);
  stroke(ctx, 0, 0, s * 0.45, -s * 0.3, s * 0.85, -s * 0.52, s * 0.12);
  stroke(ctx, 0, 0, s * 0.45, s * 0.3, s * 0.85, s * 0.52, s * 0.12);
  ctx.restore();

  // pectoral fins
  const na = Math.atan2(head.y - neck.y, head.x - neck.x);
  ctx.save();
  ctx.translate(neck.x, neck.y);
  ctx.rotate(na);
  stroke(ctx, 0, 0, -s * 0.25, -s * 0.42, -s * 0.5, -s * 0.6, s * 0.1);
  stroke(ctx, 0, 0, -s * 0.25, s * 0.42, -s * 0.5, s * 0.6, s * 0.1);
  ctx.restore();

  // crown patch
  if (a.hasRed) {
    ctx.fillStyle = kind.patch(alpha * 0.85);
    const p = h[1] || head;
    dab(ctx, p.x, p.y, s * 0.3, s * 0.22, na);
  }

  // eye-side head
  ctx.fillStyle = KOI_SUMI(alpha * 0.8);
  dab(ctx, head.x, head.y, s * 0.2, s * 0.16, na);
}

// low afternoon sun: every shadow falls the same way
export const SHD = { x: -0.38, y: -0.925 };
export const SHP = { x: 0.925, y: -0.38 };
export const SHK = 1.15;

function gazelleSide(
  ctx2: CanvasRenderingContext2D,
  s: number,
  g: number,
  lift: number,
  color: string,
) {
  ctx2.fillStyle = color;
  for (const [oxN, ph] of [
    [-0.62, 0],
    [-0.5, 2.2],
    [0.42, Math.PI],
    [0.55, Math.PI + 2.2],
  ] as const) {
    const ox = oxN * s;
    const sw = Math.sin(g + ph) * 0.55 * lift;
    stroke(
      ctx2,
      ox,
      s * 0.1,
      ox + sw * s * 0.4,
      s * 0.45,
      ox + sw * s * 0.75,
      s * 0.8,
      s * 0.085,
    );
  }
  dab(ctx2, 0, 0, s * 0.95, s * 0.38, -0.06);
  stroke(ctx2, s * 0.7, -s * 0.1, s * 1.05, -s * 0.55, s * 1.18, -s * 0.72, s * 0.2);
  dab(ctx2, s * 1.28, -s * 0.78, s * 0.26, s * 0.14, 0.35);
  stroke(
    ctx2,
    s * 1.3,
    -s * 0.88,
    s * 1.18,
    -s * 1.12,
    s * 1.08,
    -s * 1.28,
    s * 0.045,
  );
  stroke(
    ctx2,
    s * 1.4,
    -s * 0.88,
    s * 1.35,
    -s * 1.14,
    s * 1.3,
    -s * 1.3,
    s * 0.045,
  );
  stroke(
    ctx2,
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
  ctx: CanvasRenderingContext2D,
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

  // cast shadow
  ctx.save();
  ctx.transform(
    SHP.x * a.face * fore,
    SHP.y * a.face * fore,
    -SHD.x * SHK,
    -SHD.y * SHK,
    a.x + SHD.x * SHK * s * 0.8,
    a.y + SHD.y * SHK * s * 0.8,
  );
  gazelleSide(ctx, s, g, lift, SEPIA(alpha * 0.3));
  ctx.restore();

  // animal from above
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(Math.atan2(a.vy, a.vx));
  const str = 1 + Math.sin(g) * 0.08 * lift;
  ctx.fillStyle = SEPIA(alpha);
  dab(ctx, -s * 0.15, 0, s * 0.48 * str, s * 0.24, 0);
  dab(ctx, s * 0.28, 0, s * 0.34, s * 0.2, 0);
  dab(ctx, s * 0.62, 0, s * 0.17, s * 0.11, 0);
  dab(ctx, s * 0.85, 0, s * 0.13, s * 0.1, 0);

  // horns
  ctx.fillStyle = SEPIA(alpha * 0.85);
  stroke(ctx, s * 0.88, -s * 0.04, s * 0.76, -s * 0.13, s * 0.6, -s * 0.2, s * 0.03);
  stroke(ctx, s * 0.88, s * 0.04, s * 0.76, s * 0.13, s * 0.6, s * 0.2, s * 0.03);

  // legs
  const ext = Math.sin(g) * 0.5 + 0.5;
  ctx.fillStyle = SEPIA(alpha * 0.9);
  dab(ctx, s * (0.42 + ext * 0.25), -s * 0.14, s * 0.14, s * 0.05, -0.25);
  dab(ctx, s * (0.42 + ext * 0.25), s * 0.14, s * 0.14, s * 0.05, 0.25);
  dab(ctx, -s * (0.5 + (1 - ext) * 0.25), -s * 0.14, s * 0.15, s * 0.05, 0.25);
  dab(ctx, -s * (0.5 + (1 - ext) * 0.25), s * 0.14, s * 0.15, s * 0.05, -0.25);

  // tail
  ctx.fillStyle = SEPIA(alpha * 0.8);
  stroke(
    ctx,
    -s * 0.6,
    0,
    -s * 0.78,
    Math.sin(g * 0.7) * s * 0.08,
    -s * 0.9,
    Math.sin(g * 0.7) * s * 0.14,
    s * 0.04,
  );
  ctx.restore();
}
