import { describe, expect, it, vi } from 'vitest';
import type { Agent } from './agents';
import { drawRipples, inkBurst, waterRipple, type Ripple, type Stamp } from './effects';
import { INK, WATER_BLUE } from './modes';

function agentAt(x: number, y: number): Agent {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    z: 1,
    size: 10,
    phase: 0,
    flapSpeed: 1,
    density: 0.5,
    hasRed: false,
    koiKind: { body: INK, patch: INK, sumi: true },
    koiSpots: 0,
    face: 1,
    sepF: 1,
    spd: 1,
    rDrift: 0,
    rPhase: 0,
    orbitA: 0,
    orbitR: 0,
    orbitSpin: 0.01,
    laneY: 0,
    hist: [],
  };
}

function seqRand(seq: number[]) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

function mockCtx(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    ellipse: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('inkBurst', () => {
  it('scatters nearby agents away from the click', () => {
    const a = agentAt(100, 0);
    inkBurst(0, 0, 'birds', [a], [], []);
    expect(a.vx).toBeGreaterThan(0);
    expect(Math.abs(a.vy)).toBeLessThan(1e-6);
  });

  it('does not move agents that are too far away', () => {
    const a = agentAt(500, 0);
    inkBurst(0, 0, 'birds', [a], [], []);
    expect(a.vx).toBe(0);
  });

  it('creates one stamp and twelve droplets', () => {
    const stamps: Stamp[] = [];
    const ripples: Ripple[] = [];
    inkBurst(50, 50, 'birds', [], stamps, ripples, () => 0.5);

    expect(stamps).toHaveLength(13);
    expect(stamps[0].sepia).toBe(false);
    expect(ripples).toHaveLength(1);
    expect(ripples[0]).toEqual({ x: 50, y: 50, r: 6, max: 180, a: 0.3 });
  });

  it('marks herd stamps as sepia', () => {
    const stamps: Stamp[] = [];
    inkBurst(0, 0, 'herd', [], stamps, [], () => 0);
    expect(stamps[0].sepia).toBe(true);
  });

  it('delegates to waterRipple in koi mode', () => {
    const stamps: Stamp[] = [];
    const ripples: Ripple[] = [];
    inkBurst(10, 10, 'koi', [], stamps, ripples, () => 0);

    expect(stamps).toHaveLength(0);
    expect(ripples).toHaveLength(5);
    expect(ripples[0].tint).toBe(WATER_BLUE);
  });

  it('uses pluggable randomness', () => {
    const stamps: Stamp[] = [];
    inkBurst(0, 0, 'birds', [], stamps, [], seqRand([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    expect(stamps[0].rx).toBe(16);
    expect(stamps[0].ry).toBe(13);
  });
});

describe('waterRipple', () => {
  it('spawns four concentric rings plus a dimple', () => {
    const ripples: Ripple[] = [];
    waterRipple(0, 0, [], ripples, () => 0);

    expect(ripples).toHaveLength(5);
    expect(ripples[0]).toMatchObject({ r: 4, delay: 0, max: 130, speed: 0.9, a: 0.34, lw: 1.5 });
    expect(ripples[3]).toMatchObject({ delay: 48, max: 130 + 3 * 60 });
    expect(ripples[4]).toMatchObject({ r: 2, max: 22, speed: 0.55, lw: 2.4 });
  });

  it('gently pushes nearby koi along the wavefront', () => {
    const a = agentAt(100, 0);
    waterRipple(0, 0, [a], [], () => 0);
    expect(a.vx).toBeGreaterThan(0);
  });

  it('ignores distant agents', () => {
    const a = agentAt(500, 0);
    waterRipple(0, 0, [a], [], () => 0);
    expect(a.vx).toBe(0);
  });
});

describe('drawRipples', () => {
  it('advances radius and draws an ellipse', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 10, max: 100 }];

    drawRipples(ctx, ripples);

    expect(ripples[0].r).toBeGreaterThan(10);
    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.ellipse).toHaveBeenCalledOnce();
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('removes ripples that have faded out', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 100, max: 100 }];

    drawRipples(ctx, ripples);

    expect(ripples).toHaveLength(0);
    expect(ctx.ellipse).not.toHaveBeenCalled();
  });

  it('delays birth while decrementing the delay counter', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 4, max: 100, delay: 2 }];

    drawRipples(ctx, ripples);

    expect(ripples[0].delay).toBe(1);
    expect(ripples[0].r).toBe(4);
    expect(ctx.ellipse).not.toHaveBeenCalled();
  });

  it('uses the ripple tint when provided', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 10, max: 100, tint: WATER_BLUE, a: 0.5 }];

    drawRipples(ctx, ripples);

    expect(ctx.strokeStyle).toBe(WATER_BLUE(0.5 * (1 - ripples[0].r / 100) * Math.min(ripples[0].r / 12, 1)));
  });

  it('falls back to the ink factory when no tint is set', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 10, max: 100, a: 0.3 }];

    drawRipples(ctx, ripples);

    expect(ctx.strokeStyle).toBe(INK(0.3 * (1 - ripples[0].r / 100) * Math.min(ripples[0].r / 12, 1)));
  });

  it('applies default speed, width, and wobble', () => {
    const ctx = mockCtx();
    const ripples: Ripple[] = [{ x: 0, y: 0, r: 10, max: 100 }];

    drawRipples(ctx, ripples);

    expect(ripples[0].r).toBe(10 + 1.15);
    expect(ctx.lineWidth).toBe(1.1);
    expect(ctx.ellipse).toHaveBeenCalledWith(0, 0, 11.15, 11.15 * 0.62, 0, 0, 7);
  });
});
