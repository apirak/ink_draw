import { describe, expect, it, vi } from 'vitest';
import { drawBackground } from './background';

function mockCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient()),
    createLinearGradient: vi.fn(() => gradient()),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    stroke: vi.fn(),
    lineTo: vi.fn(),
    transform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
  } as unknown as CanvasRenderingContext2D;
}

function gradient() {
  return {
    addColorStop: vi.fn(),
  };
}

describe('drawBackground', () => {
  it('clears the full canvas', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'birds');
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('paints the paper base and mountains in birds mode', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'birds');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    // four mountain layers + paper base + sun
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(4);
  });

  it('draws a simple flat sun in birds mode', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'birds');

    expect(ctx.fillStyle).toBe('rgba(196,58,43,0.9)');
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('does not draw a soft radial glow in birds mode', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'birds');
    // No large glow arc (radius > sun radius) should be drawn
    const largeArc = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls.some(
      ([, , radius]) => radius > Math.min(800, 600) * 0.11,
    );
    expect(largeArc).toBe(false);
  });

  it('draws koi water ripples and pads in koi mode', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'koi');
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws the savannah pool, trees, and grass in herd mode', () => {
    const ctx = mockCtx();
    drawBackground(ctx, 800, 600, 'herd');
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
