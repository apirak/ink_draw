import type { Agent } from './agents';
import { makeAgent, reseed } from './agents';
import { dab, stroke } from './brush';
import { drawRipples, inkBurst } from './effects';
import {
  INK,
  KOI_BODY,
  KOI_GOLD,
  KOI_KINDS,
  KOI_ORANGE,
  KOI_SUMI,
  MODES,
  RED,
  SEPIA,
  WATER_BLUE,
  type ModeConfig,
  type ModeName,
} from './modes';
import { update } from './physics';
import { drawBird, drawKoi, drawHerd } from './renderers';
import { drawBackground } from './background';
import { paintTrail, stamps } from './trail';
import { initTuner } from './tuner';
import type { PointerState } from './target';

/* ───────────────────────── canvas setup ───────────────────────── */

const bgC = document.getElementById('bg') as HTMLCanvasElement;
const trailC = document.getElementById('trail') as HTMLCanvasElement;
const mainC = document.getElementById('main') as HTMLCanvasElement;
export const bg = bgC.getContext('2d')!;
export const tr = trailC.getContext('2d')!;
export const cx = mainC.getContext('2d')!;
export const brushEl = document.getElementById('brush')!;

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TR_SCALE = 0.5;
export let W = 0;
export let H = 0;

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function resize() {
  W = innerWidth;
  H = innerHeight;
  for (const [c, ctx, s] of [
    [mainC, cx, DPR],
    [bgC, bg, DPR],
    [trailC, tr, DPR * TR_SCALE],
  ] as const) {
    c.width = W * s;
    c.height = H * s;
    ctx.setTransform(s, 0, 0, s, 0, 0);
  }
  bounds.w = W;
  bounds.h = H;
  (globalThis as any).W = W;
  (globalThis as any).H = H;
  drawBackground(bg, W, H, mode);
}
addEventListener('resize', resize);

/* ───────────────────────── mode & state ───────────────────────── */

export const mode: ModeName = (document.body.dataset.mode as ModeName) ?? 'birds';
export const M: ModeConfig = MODES[mode];
export let morph = 1;
export const MAX = MODES.birds.count;
export const agents: Agent[] = [];
export const ripples: { x: number; y: number; r: number; max: number; a?: number; tint?: (a: number) => string }[] = [];
export const bounds = { w: W, h: H };
export const ptr: PointerState = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  lastMove: 0,
  down: false,
};

/* ───────────────────────── expose globals for legacy scripts ───────────────────────── */

Object.assign(globalThis as any, {
  // color factories & helpers
  INK,
  SEPIA,
  RED,
  KOI_ORANGE,
  KOI_GOLD,
  KOI_BODY,
  KOI_SUMI,
  WATER_BLUE,
  KOI_KINDS,
  MODES,
  stroke,
  dab,
  // runtime state
  mode,
  M,
  morph,
  MAX,
  agents,
  ripples,
  ptr,
  bounds,
  bg,
  tr,
  cx,
  brushEl,
  reduced,
  W,
  H,
});

/* ───────────────────────── pointer ───────────────────────── */

let lastRippleAt = 0;

addEventListener(
  'pointermove',
  (e) => {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.lastMove = performance.now();
    brushEl.style.left = e.clientX + 'px';
    brushEl.style.top = e.clientY + 'px';
    if (mode === 'koi' && performance.now() - lastRippleAt > 300) {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 4,
        max: 70 + Math.random() * 50,
        a: 0.22,
        tint: WATER_BLUE,
      });
      lastRippleAt = performance.now();
    }
  },
  { passive: true },
);

addEventListener('pointerdown', (e) => {
  ptr.down = true;
  brushEl.classList.add('down');
  inkBurst(e.clientX, e.clientY, mode, agents, stamps, ripples);
});

addEventListener('pointerup', () => {
  ptr.down = false;
  brushEl.classList.remove('down');
});

/* ───────────────────────── main loop ───────────────────────── */

let last = performance.now();

function loop(t: number) {
  requestAnimationFrame(loop);
  let dt = (t - last) / 16.667;
  last = t;
  if (dt > 3) dt = 3;

  morph = Math.min(morph + 0.022 * dt, 1);

  update(t, dt, mode, M, agents, bounds, ptr, performance.now());
  paintTrail(tr, W, H, M, agents, mode, INK, SEPIA);

  cx.clearRect(0, 0, W, H);
  drawRipples(cx, ripples);

  const order = agents.slice(0, M.count);
  if (mode === 'birds') {
    order.sort((a, b) => a.z - b.z);
    for (const a of order) drawBird(cx, a, t, morph);
  } else if (mode === 'herd') {
    order.sort((a, b) => a.y - b.y);
    for (const a of order) drawHerd(cx, a, t, morph);
  } else {
    order.sort((a, b) => a.size - b.size);
    for (const a of order) drawKoi(cx, a, t, morph);
  }
}

/* ───────────────────────── init ───────────────────────── */

function init() {
  resize();
  for (let i = 0; i < MAX; i++) agents.push(makeAgent(i, mode, bounds));
  reseed(agents, mode, M);
  ptr.lastMove = -1e5;
  initTuner(mode, M);
  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
