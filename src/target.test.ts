import { describe, expect, it } from 'vitest';
import { targetPoint, type Bounds, type PointerState } from './target';

function ptr(x = 100, y = 100, lastMove = 0): PointerState {
  return { x, y, lastMove, down: false };
}

const bounds: Bounds = { w: 1000, h: 800 };

describe('targetPoint', () => {
  it('returns pointer position when recently moved', () => {
    const p = ptr(200, 300, 1000);
    const [tx, ty] = targetPoint(p, bounds, 1000, 2000);
    expect(tx).toBeCloseTo(200, 0);
    expect(ty).toBeCloseTo(300, 0);
  });

  it('blends toward wander target when idle', () => {
    const p = ptr(200, 300, 0);
    const [tx, ty] = targetPoint(p, bounds, 10_000, 10_000);
    expect(tx).not.toBeCloseTo(200, 0);
    expect(ty).not.toBeCloseTo(300, 0);
  });

  it('is fully wandering after long idle', () => {
    const p = ptr(0, 0, 0);
    const [tx, ty] = targetPoint(p, bounds, 0, 100_000);
    expect(tx).toBeCloseTo(bounds.w * (0.5 + 0.32 * Math.sin(1.3)), 0);
    expect(ty).toBeCloseTo(bounds.h * 0.45, 0);
  });

  it('stays within bounds', () => {
    const p = ptr(500, 400, 0);
    for (let t = 0; t < 10_000; t += 200) {
      const [tx, ty] = targetPoint(p, bounds, t, 100_000);
      expect(tx).toBeGreaterThanOrEqual(0);
      expect(tx).toBeLessThanOrEqual(bounds.w);
      expect(ty).toBeGreaterThanOrEqual(0);
      expect(ty).toBeLessThanOrEqual(bounds.h);
    }
  });

  it('is deterministic for same inputs', () => {
    const p = ptr(123, 456, 100);
    const a = targetPoint(p, bounds, 5000, 6000);
    const b = targetPoint(p, bounds, 5000, 6000);
    expect(a).toEqual(b);
  });
});
