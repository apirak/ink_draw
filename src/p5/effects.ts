import * as brush from 'p5.brush';
import type { Agent, RandomFn } from '../agents';
import { INK, WATER_BLUE, type ColorFactory, type ModeName } from '../modes';

// ponytail: blot snapshot pipeline — see docs/adr/0001-birds-click-blot-brush-snapshot.md
// Runtime-tunable via #burst-panel (see burst-tuner wiring at bottom)
export const BURST = {
  hex: '#32240c', // blot color, paint-time (affects new clicks) — RGB(50,36,12) warm dark brown
  life: 300, // fade frames @ 60fps = 5s
};
const BLOT_ALPHA = 55; // 0-255, brush.fill opacity — keep light so fade reads smooth
const BLOT_R_MIN = 18;
const BLOT_R_JITTER = 6;
const BBOX = 120; // framebuffer edge; blot fits inside with margin for jitter + scatter
const MAX_BURSTS = 5; // framebuffer pool size

export interface Stamp {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  a0: number;
  age: number;
  life: number;
  sepia?: boolean;
  tint?: ColorFactory;
}

export interface Ripple {
  x: number;
  y: number;
  r: number;
  max: number;
  delay?: number;
  speed?: number;
  a?: number;
  lw?: number;
  wob?: number;
  tint?: ColorFactory;
}

export interface Burst {
  g: any;
  ox: number;
  oy: number;
  age: number;
  life: number;
}

export const bursts: Burst[] = [];

// ponytail: pre-warmed framebuffer pool — lives in the main WEBGL context
// (no per-click GL context creation, no createGraphics hitch)
const pool: any[] = [];
let poolIdx = 0;
let pInst: any = null; // captured at initBurstPool — fb.draw scope swaps p, so we call p.clear()

export function initBurstPool(p: any): void {
  if (pool.length > 0) return;
  pInst = p;
  for (let i = 0; i < MAX_BURSTS; i++) {
    pool.push(p.createFramebuffer({ width: BBOX, height: BBOX }));
  }
}

function pushBurst(x: number, y: number, rand: RandomFn): void {
  if (pool.length === 0 || !pInst) return; // pool not initialized (non-birds mode) — no-op

  const fb = pool[poolIdx];
  poolIdx = (poolIdx + 1) % pool.length;

  // recycle slot: drop any live burst pointing at the same framebuffer
  for (let i = bursts.length - 1; i >= 0; i--) {
    if (bursts[i].g === fb) bursts.splice(i, 1);
  }

  fb.draw(() => {
    // inside draw(): pInst's renderer is swapped to the framebuffer — clear via p, not fb
    pInst.clear();
    brush.load(fb);
    brush.scaleBrushes(2.5); // finer scale for the small blot framebuffer
    brush.set('pen', BURST.hex, 2.5);
    brush.noField();
    brush.noStroke();
    brush.fill(BURST.hex, BLOT_ALPHA);
    brush.fillTexture(0.55, 0.45, true); // scatter = true for bleeding paintbrush ink edge
    const r = BLOT_R_MIN + rand() * BLOT_R_JITTER;
    const numPoints = 16;
    const pts: [number, number][] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // jitter radius to simulate realistic paintbrush press and ink bleeding
      const pr = r * (0.85 + rand() * 0.3);
      pts.push([Math.cos(angle) * pr, Math.sin(angle) * pr]);
    }
    brush.polygon(pts);
    brush.scaleBrushes(6); // restore global scale for background mountains
    brush.load();
  });

  bursts.push({ g: fb, ox: x - BBOX / 2, oy: y - BBOX / 2, age: 0, life: BURST.life });
}

export function drawBursts(p: any): void {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.age++;
    const f = 1 - b.age / b.life;
    if (f <= 0) {
      bursts.splice(i, 1); // framebuffer returns to pool; do not remove()
      continue;
    }
    p.push();
    // explicit RGBA tint: white = identity multiplier, alpha fades neutrally
    p.tint(255, 255, 255, f * 255);
    p.image(b.g, b.ox, b.oy);
    p.pop();
  }
}

export function inkBurst(
  x: number,
  y: number,
  mode: ModeName,
  agents: Agent[],
  stamps: Stamp[],
  ripples: Ripple[],
  rand: RandomFn = Math.random,
): void {
  if (mode === 'koi') {
    waterRipple(x, y, agents, ripples, rand);
    return;
  }

  for (const a of agents) {
    const dx = a.x - x;
    const dy = a.y - y;
    const d = Math.hypot(dx, dy);
    if (d < 280 && d > 0.01) {
      const f = (1 - d / 280) * 9;
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
    }
  }

  if (mode === 'birds') {
    // blot: watercolor brush snapshot, fades via drawBursts tint-blit
    pushBurst(x, y, rand);
  } else {
    // herd: legacy ellipse big stamp
    stamps.push({
      x,
      y,
      rx: 16 + rand() * 9,
      ry: 13 + rand() * 8,
      rot: rand() * 3,
      a0: 0.3,
      age: 0,
      life: 460,
      sepia: true,
    });
  }

  for (let i = 0; i < 12; i++) {
    const ang = rand() * Math.PI * 2;
    const d = 22 + rand() * 75;
    stamps.push({
      x: x + Math.cos(ang) * d,
      y: y + Math.sin(ang) * d,
      rx: 0.8 + rand() * 3.2,
      ry: 0.8 + rand() * 3,
      rot: 0,
      a0: 0.1 + rand() * 0.2,
      age: 0,
      life: 380 + rand() * 160,
      sepia: mode === 'herd',
    });
  }

  ripples.push({ x, y, r: 6, max: 180, a: 0.3 });
}

export function waterRipple(
  x: number,
  y: number,
  agents: Agent[],
  ripples: Ripple[],
  rand: RandomFn = Math.random,
): void {
  const N = 4;
  for (let i = 0; i < N; i++) {
    ripples.push({
      x,
      y,
      r: 4,
      delay: i * 16,
      max: 130 + i * 60,
      speed: 0.9 - i * 0.07,
      a: 0.34 - i * 0.05,
      lw: 1.5 - i * 0.22,
      wob: 0.55 + rand() * 0.12,
      tint: WATER_BLUE,
    });
  }

  ripples.push({
    x,
    y,
    r: 2,
    delay: 0,
    max: 22,
    speed: 0.55,
    a: 0.4,
    lw: 2.4,
    wob: 0.62,
    tint: WATER_BLUE,
  });

  for (const a of agents) {
    const dx = a.x - x;
    const dy = a.y - y;
    const d = Math.hypot(dx, dy);
    if (d < 230 && d > 0.01) {
      const f = (1 - d / 230) * 3.4;
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
    }
  }
}

export function drawRipples(
  p: any,
  ripples: Ripple[],
  ink: ColorFactory = INK,
): void {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const R = ripples[i];
    if ((R.delay ?? 0) > 0) {
      R.delay!--;
      continue;
    }

    R.r += R.speed ?? 1.15;
    const fade = 1 - R.r / R.max;
    if (fade <= 0) {
      ripples.splice(i, 1);
      continue;
    }

    const crest = Math.min(R.r / 12, 1);
    p.stroke((R.tint ?? ink)((R.a ?? 0.3) * fade * crest));
    p.strokeWeight(R.lw ?? 1.1);
    p.noFill();
    p.ellipse(R.x, R.y, R.r * 2, R.r * 2 * (R.wob ?? 0.62));
  }
}

// ponytail: tuner wiring — DOM inputs in #burst-panel mutate BURST runtime state.
// Color applies to new clicks (paint-time). Life applies to existing bursts (blit-time).
export function initBurstTuner(): void {
  const panel = document.getElementById('burst-panel');
  if (!panel) return;

  const colorEl = document.getElementById('bColor') as HTMLInputElement | null;
  const lifeEl = document.getElementById('bLife') as HTMLInputElement | null;
  const lifeVal = document.getElementById('bLife-v');
  const resetEl = document.getElementById('bReset');

  const syncLife = () => {
    if (!lifeEl) return;
    BURST.life = +lifeEl.value;
    if (lifeVal) lifeVal.textContent = (BURST.life / 60).toFixed(1) + 's';
  };

  if (colorEl) {
    colorEl.value = BURST.hex;
    colorEl.addEventListener('input', () => { BURST.hex = colorEl.value; });
  }
  if (lifeEl) {
    lifeEl.value = String(BURST.life);
    lifeEl.addEventListener('input', syncLife);
    syncLife();
  }
  if (resetEl) {
    resetEl.addEventListener('click', () => {
      BURST.hex = '#32240c';
      BURST.life = 300;
      if (colorEl) colorEl.value = BURST.hex;
      if (lifeEl) lifeEl.value = String(BURST.life);
      syncLife();
    });
  }

  addEventListener('keydown', (e) => {
    if (e.key === 'b' || e.key === 'B') panel.classList.toggle('hidden');
  });
}
