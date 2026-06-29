import { describe, expect, it, vi } from 'vitest';
import { drawRipples } from './effects';

function mockP(): any {
  return {
    stroke: vi.fn(),
    strokeWeight: vi.fn(),
    noFill: vi.fn(),
    ellipse: vi.fn(),
    push: vi.fn(),
    pop: vi.fn(),
  };
}

describe('drawRipples', () => {
  it('advances and removes dead ripples', () => {
    const p = mockP();
    const ripples = [{ x: 10, y: 10, r: 99, max: 100, a: 0.5 }];
    drawRipples(p, ripples);
    expect(ripples.length).toBe(0);
  });

  it('draws live ripples', () => {
    const p = mockP();
    const ripples = [{ x: 10, y: 10, r: 5, max: 100, a: 0.5 }];
    drawRipples(p, ripples);
    expect(p.ellipse).toHaveBeenCalled();
    expect(ripples.length).toBe(1);
  });
});
