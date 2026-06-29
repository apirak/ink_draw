import { describe, expect, it, vi } from 'vitest';
import { dab, stroke } from './brush';

function mockCtx(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    ellipse: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('stroke', () => {
  it('draws a tapered sliver with two quadratic curves', () => {
    const ctx = mockCtx();
    stroke(ctx, 0, 0, 5, 5, 10, 0, 2);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledOnce();
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(2);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it('uses unit fallback when endpoints coincide', () => {
    const ctx = mockCtx();
    stroke(ctx, 5, 5, 5, 5, 5, 5, 3);

    expect(ctx.moveTo).toHaveBeenCalledWith(5, 5);
  });
});

describe('dab', () => {
  it('draws an ellipse with default rotation', () => {
    const ctx = mockCtx();
    dab(ctx, 4, 5, 6, 3);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.ellipse).toHaveBeenCalledWith(4, 5, 6, 3, 0, 0, 7);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it('accepts an explicit rotation', () => {
    const ctx = mockCtx();
    dab(ctx, 1, 1, 2, 2, 0.5);

    expect(ctx.ellipse).toHaveBeenCalledWith(1, 1, 2, 2, 0.5, 0, 7);
  });
});
