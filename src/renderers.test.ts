import { describe, expect, it, vi } from 'vitest';
import { drawBird, drawHerd, drawKoi } from './renderers';
import type { Agent } from './agents';

function mockCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    transform: vi.fn(),
    clip: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

function baseAgent(): Agent {
  return {
    x: 100,
    y: 100,
    vx: 1,
    vy: 0.5,
    z: 0.8,
    size: 10,
    phase: 0,
    flapSpeed: 1,
    density: 0.6,
    hasRed: true,
    koiKind: {
      body: (a: number) => `body-${a}`,
      patch: (a: number) => `patch-${a}`,
      sumi: true,
    },
    koiSpots: 0.2,
    face: 1,
    sepF: 1,
    spd: 1,
    rDrift: 0.0001,
    rPhase: 0,
    orbitA: 0,
    orbitR: 20,
    orbitSpin: 0.01,
    laneY: 0,
    hist: [],
  };
}

describe('drawBird', () => {
  it('draws a bird without throwing', () => {
    const ctx = mockCtx();
    const a = baseAgent();
    expect(() => drawBird(ctx, a, 0, 1)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('drawKoi', () => {
  it('draws a koi without throwing', () => {
    const ctx = mockCtx();
    const a = baseAgent();
    a.hist = [
      { x: 95, y: 100 },
      { x: 90, y: 100 },
      { x: 85, y: 100 },
      { x: 80, y: 100 },
    ];
    expect(() => drawKoi(ctx, a, 0, 1)).not.toThrow();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('skips drawing when spine is too short', () => {
    const ctx = mockCtx();
    const a = baseAgent();
    a.hist = [{ x: 95, y: 100 }];
    drawKoi(ctx, a, 0, 1);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});

describe('drawHerd', () => {
  it('draws a herd member without throwing', () => {
    const ctx = mockCtx();
    const a = baseAgent();
    expect(() => drawHerd(ctx, a, 0, 1)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
