import { describe, expect, it, vi } from 'vitest';
import { dab, stroke } from './brush';

function mockP(): any {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    ellipse: vi.fn(),
    beginShape: vi.fn(),
    vertex: vi.fn(),
    endShape: vi.fn(),
    CLOSE: 'close',
  };
}

describe('stroke', () => {
  it('draws a closed tapered sliver with p5 shapes', () => {
    const p = mockP();
    stroke(p, 0, 0, 5, 5, 10, 0, 2);

    expect(p.beginShape).toHaveBeenCalledTimes(1);
    expect(p.vertex).toHaveBeenCalledTimes(13);
    expect(p.endShape).toHaveBeenCalledWith(p.CLOSE);
  });

  it('uses unit fallback when endpoints coincide', () => {
    const p = mockP();
    stroke(p, 5, 5, 5, 5, 5, 5, 3);
    expect(p.vertex).toHaveBeenCalledWith(5, 5);
  });
});

describe('dab', () => {
  it('draws a rotated ellipse with push/pop', () => {
    const p = mockP();
    dab(p, 4, 5, 6, 3, 0.5);

    expect(p.push).toHaveBeenCalledTimes(1);
    expect(p.translate).toHaveBeenCalledWith(4, 5);
    expect(p.rotate).toHaveBeenCalledWith(0.5);
    expect(p.ellipse).toHaveBeenCalledWith(0, 0, 12, 6);
    expect(p.pop).toHaveBeenCalledTimes(1);
  });

  it('uses default zero rotation', () => {
    const p = mockP();
    dab(p, 1, 1, 2, 2);
    expect(p.rotate).toHaveBeenCalledWith(0);
    expect(p.ellipse).toHaveBeenCalledWith(0, 0, 4, 4);
  });
});
