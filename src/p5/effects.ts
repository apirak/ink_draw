import type { Agent, RandomFn } from '../agents';
import { INK, WATER_BLUE, type ColorFactory, type ModeName } from '../modes';

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

  stamps.push({
    x,
    y,
    rx: 16 + rand() * 9,
    ry: 13 + rand() * 8,
    rot: rand() * 3,
    a0: 0.3,
    age: 0,
    life: 460,
    sepia: mode === 'herd',
  });

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
