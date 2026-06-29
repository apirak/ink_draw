import { dab, stroke } from './brush';
import { INK, RED, SEPIA, type ModeName } from './modes';
import { SHD, SHP, SHK } from './renderers';

function washShape(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  mode: ModeName,
): void {
  ctx.clearRect(0, 0, W, H);

  if (mode === 'birds') {
    washShape(
      ctx,
      [
        [-0.1 * W, H],
        [0.1 * W, 0.72 * H],
        [0.3 * W, 0.86 * H],
        [0.5 * W, 0.7 * H],
        [0.72 * W, 0.88 * H],
        [1.1 * W, 0.8 * H],
        [1.1 * W, H * 1.2],
        [-0.1 * W, H * 1.2],
      ],
      INK(0.06),
    );
    washShape(
      ctx,
      [
        [-0.1 * W, H],
        [0.18 * W, 0.82 * H],
        [0.42 * W, 0.92 * H],
        [0.78 * W, 0.84 * H],
        [1.1 * W, 0.94 * H],
        [1.1 * W, H * 1.2],
        [-0.1 * W, H * 1.2],
      ],
      INK(0.05),
    );
    ctx.fillStyle = RED(0.78);
    ctx.beginPath();
    ctx.arc(W * 0.82, H * 0.2, Math.min(W, H) * 0.05, 0, 7);
    ctx.fill();
  }

  if (mode === 'koi') {
    ctx.strokeStyle = INK(0.07);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x = W * (0.15 + Math.sin(i * 4.7) * 0.07 + i * 0.17);
      const y = H * (0.2 + (i % 3) * 0.28);
      for (let r = 24; r < 90; r += 22) {
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.55, 0, 0, 7);
        ctx.stroke();
      }
    }
    ctx.fillStyle = INK(0.13);
    for (const [x, y, r] of [
      [0.1, 0.12, 0.055],
      [0.17, 0.19, 0.04],
      [0.07, 0.24, 0.032],
    ] as const) {
      ctx.beginPath();
      ctx.ellipse(
        W * x,
        H * y,
        W * r,
        W * r * 0.62,
        0.3,
        0.45,
        6.1,
      );
      ctx.lineTo(W * x, H * y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = RED(0.5);
    ctx.beginPath();
    ctx.ellipse(W * 0.88, H * 0.76, 7, 4.5, 0.8, 0, 7);
    ctx.fill();
  }

  if (mode === 'herd') {
    let seed = 7;
    const rnd = () =>
      (seed = (seed * 16807) % 2147483647) / 2147483647;

    const wx = W * 0.2;
    const wy = H * 0.7;
    const wr = Math.min(W, H) * 0.085;
    const pool: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI * 2;
      const r = wr * (0.7 + rnd() * 0.5);
      pool.push([
        wx + Math.cos(ang) * r * 1.25,
        wy + Math.sin(ang) * r * 0.8,
      ]);
    }
    washShape(ctx, pool, INK(0.11));
    ctx.strokeStyle = INK(0.06);
    ctx.lineWidth = 1.2;
    for (const k of [1.25, 1.45]) {
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr * 1.25 * k, wr * 0.8 * k, 0, 0, 7);
      ctx.stroke();
    }

    const sideTree = (ts: number) => {
      ctx.fillStyle = SEPIA(0.22);
      stroke(
        ctx,
        0,
        0,
        ts * 0.06,
        -ts * 0.5,
        -ts * 0.12,
        -ts * 0.82,
        ts * 0.035,
      );
      dab(ctx, -ts * 0.05, -ts * 0.92, ts * 0.52, ts * 0.13, -0.04);
      dab(ctx, ts * 0.28, -ts * 0.84, ts * 0.3, ts * 0.09, 0.05);
    };

    const trees = [
      [0.72 * W, 0.28 * H, Math.min(W, H) * 0.14],
      [0.42 * W, 0.82 * H, Math.min(W, H) * 0.1],
    ] as const;
    for (const [tx, ty, ts] of trees) {
      ctx.save();
      ctx.transform(SHP.x, SHP.y, -SHD.x * SHK, -SHD.y * SHK, tx, ty);
      sideTree(ts);
      ctx.restore();
      ctx.fillStyle = SEPIA(0.5);
      dab(ctx, tx - ts * 0.08, ty - ts * 0.03, ts * 0.3, ts * 0.22, 0.3);
      dab(ctx, tx + ts * 0.1, ty + ts * 0.05, ts * 0.24, ts * 0.18, -0.2);
      dab(ctx, tx + ts * 0.02, ty - ts * 0.1, ts * 0.2, ts * 0.15, 0.1);
      ctx.fillStyle = SEPIA(0.75);
      dab(ctx, tx, ty, ts * 0.045, ts * 0.045, 0);
    }

    for (let i = 0; i < 70; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const l = 4 + rnd() * 8;
      ctx.fillStyle = SEPIA(0.13 + rnd() * 0.1);
      stroke(ctx, x, y, x - 2, y - l * 0.6, x - 3 - rnd() * 3, y - l, 1.1);
      stroke(
        ctx,
        x,
        y,
        x + 1,
        y - l * 0.5,
        x + 2 + rnd() * 3,
        y - l * 0.85,
        1,
      );
      stroke(
        ctx,
        x,
        y,
        x - 0.5,
        y - l * 0.4,
        x + (rnd() - 0.5) * 2,
        y - l * 1.15,
        0.9,
      );
    }
  }
}
