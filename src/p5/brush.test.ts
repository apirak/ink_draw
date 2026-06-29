import { describe, expect, it, vi } from 'vitest';
import { dab, stroke } from './brush';

function mockCtx(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function mockP(ctx: CanvasRenderingContext2D): any {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    ellipse: vi.fn(),
    drawingContext: ctx,
  };
}

describe('stroke', () => {
  it('draws a filled quadratic sliver via raw context', () => {
    const ctx = mockCtx();
    const p = mockP(ctx);
    stroke(p, 0, 0, 5, 5, 10, 0, 2);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(2);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it('uses unit fallback when endpoints coincide', () => {
    const ctx = mockCtx();
    const p = mockP(ctx);
    stroke(p, 5, 5, 5, 5, 5, 5, 3);
    expect(ctx.moveTo).toHaveBeenCalledWith(5, 5);
  });
});

describe('dab', () => {
  it('draws a rotated ellipse with push/pop', () => {
    const ctx = mockCtx();
    const p = mockP(ctx);
    dab(p, 4, 5, 6, 3, 0.5);

    expect(p.push).toHaveBeenCalledTimes(1);
    expect(p.translate).toHaveBeenCalledWith(4, 5);
    expect(p.rotate).toHaveBeenCalledWith(0.5);
    expect(p.ellipse).toHaveBeenCalledWith(0, 0, 12, 6);
    expect(p.pop).toHaveBeenCalledTimes(1);
  });

  it('uses default zero rotation', () => {
    const ctx = mockCtx();
    const p = mockP(ctx);
    dab(p, 1, 1, 2, 2);
    expect(p.rotate).toHaveBeenCalledWith(0);
    expect(p.ellipse).toHaveBeenCalledWith(0, 0, 4, 4);
  });
});
