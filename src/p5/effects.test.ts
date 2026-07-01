import { describe, expect, it, vi } from 'vitest';
import { bursts, drawBursts, drawRipples } from './effects';

function mockP(): any {
  return {
    stroke: vi.fn(),
    strokeWeight: vi.fn(),
    noFill: vi.fn(),
    ellipse: vi.fn(),
    image: vi.fn(),
    tint: vi.fn(),
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

describe('drawBursts', () => {
  it('tint-blits a live burst and returns its slot to the pool when aged out', () => {
    const remove = vi.fn();
    bursts.length = 0;
    bursts.push({ g: { remove }, ox: 5, oy: 6, age: 458, life: 460 });

    const p = mockP();
    drawBursts(p);
    // live at f>0 last frame → blitted
    expect(p.image).toHaveBeenCalledWith(expect.objectContaining({ remove }), 5, 6);
    expect(bursts.length).toBe(1);

    drawBursts(p); // age crosses life → dropped, buffer NOT removed (pooled)
    expect(remove).not.toHaveBeenCalled();
    expect(bursts.length).toBe(0);
  });
});
