import { INK, RED, SEPIA, type ModeName } from "../modes";
import { SHD, SHP, SHK } from "../renderers";
import { dab, stroke } from "./brush";

function vertexQuadratic(
  p: any,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  steps = 5,
) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    p.vertex(
      mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    );
  }
}

function washShape(p: any, pts: [number, number][], color: string) {
  p.fill(color);
  p.noStroke();
  p.beginShape();
  p.vertex(pts[0][0], pts[0][1]);
  let [x0, y0] = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    vertexQuadratic(p, x0, y0, pts[i][0], pts[i][1], xc, yc);
    x0 = xc;
    y0 = yc;
  }
  p.endShape(p.CLOSE);
}

function paperBase(p: any, W: number, H: number) {
  p.background("#f2ecdd");
  p.noStroke();
  p.fill("rgba(160, 138, 112, 0.08)");
  p.rect(0, 0, W, H);
}

function paperFiber(p: any, W: number, H: number) {
  let seed = 17;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  for (let i = 0; i < 3500; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const len = 2 + rnd() * 7;
    const ang = rnd() * Math.PI * 2;
    const alpha = 0.025 + rnd() * 0.045;
    const warm = 118 + Math.floor(rnd() * 34);
    p.stroke(`rgba(${warm}, ${warm - 10}, ${warm - 22}, ${alpha})`);
    p.strokeWeight(0.4 + rnd() * 0.6);
    p.line(
      x,
      y,
      x + Math.cos(ang) * len,
      y + Math.sin(ang) * len,
    );
  }
}

function mountainLayer(
  p: any,
  W: number,
  H: number,
  baseY: number,
  amp: number,
  alpha: number,
  seed: number,
) {
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const waves: { freq: number; phase: number; amp: number }[] = [];
  let f = 0.0018 + rnd() * 0.0024;
  let a = amp;
  for (let i = 0; i < 4; i++) {
    waves.push({ freq: f, phase: rnd() * Math.PI * 2, amp: a });
    f *= 2.3;
    a *= 0.5;
  }
  const ridge = (x: number) =>
    waves.reduce((sum, w) => sum + Math.sin(x * w.freq + w.phase) * w.amp, 0);

  const pts: [number, number][] = [
    [-0.1 * W, H],
    [-0.05 * W, baseY + ridge(-0.05 * W) * 0.65],
  ];

  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    pts.push([x, baseY + ridge(x)]);
  }

  pts.push([1.05 * W, baseY + ridge(1.05 * W) * 0.65]);
  pts.push([1.1 * W, H * 1.2]);
  pts.push([-0.1 * W, H * 1.2]);

  washShape(p, pts, INK(alpha));
}

function drawSun(p: any, W: number, H: number) {
  const x = W * 0.78;
  const y = H * 0.22;
  const r = Math.min(W, H) * 0.08;
  p.noStroke();
  p.fill(RED(0.9));
  p.circle(x, y, r * 2);
}

export function drawBackground(
  p: any,
  W: number,
  H: number,
  mode: ModeName,
): void {
  p.clear();

  if (mode === "birds") {
    paperBase(p, W, H);
    paperFiber(p, W, H);
    mountainLayer(p, W, H, H * 0.68, H * 0.055, 0.045, 3);
    mountainLayer(p, W, H, H * 0.74, H * 0.06, 0.06, 5);
    mountainLayer(p, W, H, H * 0.82, H * 0.065, 0.085, 7);
    mountainLayer(p, W, H, H * 0.9, H * 0.07, 0.11, 11);
    drawSun(p, W, H);
  }

  if (mode === "koi") {
    p.background("#f2ecdd");
    p.stroke(INK(0.07));
    p.strokeWeight(1.2);
    p.noFill();
    for (let i = 0; i < 5; i++) {
      const x = W * (0.15 + Math.sin(i * 4.7) * 0.07 + i * 0.17);
      const y = H * (0.2 + (i % 3) * 0.28);
      for (let r = 24; r < 90; r += 22) {
        p.ellipse(x, y, r * 2, r * 2 * 0.55);
      }
    }
    p.noStroke();
    p.fill(INK(0.13));
    for (const [x, y, r] of [
      [0.1, 0.12, 0.055],
      [0.17, 0.19, 0.04],
      [0.07, 0.24, 0.032],
    ] as const) {
      p.push();
      p.translate(W * x, H * y);
      p.rotate(0.3);
      p.beginShape();
      p.ellipse(0, 0, W * r * 2, W * r * 2 * 0.62);
      p.vertex(0, 0);
      p.endShape(p.CLOSE);
      p.pop();
    }
    p.fill(RED(0.5));
    p.push();
    p.translate(W * 0.88, H * 0.76);
    p.rotate(0.8);
    p.ellipse(0, 0, 14, 9);
    p.pop();
  }

  if (mode === "herd") {
    p.background("#f2ecdd");
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const wx = W * 0.2;
    const wy = H * 0.7;
    const wr = Math.min(W, H) * 0.085;
    const pool: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI * 2;
      const r = wr * (0.7 + rnd() * 0.5);
      pool.push([wx + Math.cos(ang) * r * 1.25, wy + Math.sin(ang) * r * 0.8]);
    }
    washShape(p, pool, INK(0.11));
    p.stroke(INK(0.06));
    p.strokeWeight(1.2);
    p.noFill();
    for (const k of [1.25, 1.45]) {
      p.ellipse(wx, wy, wr * 1.25 * k * 2, wr * 0.8 * k * 2);
    }

    const sideTree = (ts: number) => {
      p.fill(SEPIA(0.22));
      p.noStroke();
      stroke(
        p,
        0,
        0,
        ts * 0.06,
        -ts * 0.5,
        -ts * 0.12,
        -ts * 0.82,
        ts * 0.035,
      );
      dab(p, -ts * 0.05, -ts * 0.92, ts * 0.52, ts * 0.13, -0.04);
      dab(p, ts * 0.28, -ts * 0.84, ts * 0.3, ts * 0.09, 0.05);
    };

    const trees = [
      [0.72 * W, 0.28 * H, Math.min(W, H) * 0.14],
      [0.42 * W, 0.82 * H, Math.min(W, H) * 0.1],
    ] as const;
    for (const [tx, ty, ts] of trees) {
      p.push();
      p.applyMatrix(SHP.x, SHP.y, -SHD.x * SHK, -SHD.y * SHK, tx, ty);
      sideTree(ts);
      p.pop();
      p.fill(SEPIA(0.5));
      dab(p, tx - ts * 0.08, ty - ts * 0.03, ts * 0.3, ts * 0.22, 0.3);
      dab(p, tx + ts * 0.1, ty + ts * 0.05, ts * 0.24, ts * 0.18, -0.2);
      dab(p, tx + ts * 0.02, ty - ts * 0.1, ts * 0.2, ts * 0.15, 0.1);
      p.fill(SEPIA(0.75));
      dab(p, tx, ty, ts * 0.045, ts * 0.045, 0);
    }

    for (let i = 0; i < 70; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const l = 4 + rnd() * 8;
      p.fill(SEPIA(0.13 + rnd() * 0.1));
      stroke(p, x, y, x - 2, y - l * 0.6, x - 3 - rnd() * 3, y - l, 1.1);
      stroke(p, x, y, x + 1, y - l * 0.5, x + 2 + rnd() * 3, y - l * 0.85, 1);
      stroke(
        p,
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
