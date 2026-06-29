import { describe, expect, it, vi, beforeEach } from 'vitest';
import { makeAgent } from '../agents';
import { MODES } from '../modes';
import { paintTrail, stamps } from './trail';

function mockP(): any {
  const g = {
    clear: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    noStroke: vi.fn(),
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  };
  return {
    createGraphics: vi.fn(() => g),
    image: vi.fn(),
    g,
  };
}

describe('paintTrail', () => {
  beforeEach(() => {
    stamps.length = 0;
  });

  it('creates a full-size graphics buffer and clears it each frame', () => {
    const p = mockP();
    const agents: any[] = [];
    paintTrail(p, 800, 600, MODES.birds, agents, 'birds');

    expect(p.createGraphics).toHaveBeenCalledWith(800, 600);
    expect(p.g.clear).toHaveBeenCalled();
    expect(p.image).toHaveBeenCalled();
  });

  it('ages out dead stamps', () => {
    const p = mockP();
    stamps.push({
      x: 0,
      y: 0,
      rx: 1,
      ry: 1,
      rot: 0,
      a0: 1,
      age: 10,
      life: 10,
    });
    paintTrail(p, 800, 600, MODES.birds, [], 'birds');
    expect(stamps.length).toBe(0);
  });

  it('keeps live stamps and paints them', () => {
    const p = mockP();
    const a = makeAgent(0, 'birds', { w: 800, h: 600 });
    a.size = 10;
    a.z = 1;
    const agents = [a];
    paintTrail(p, 800, 600, MODES.birds, agents, 'birds');

    expect(stamps.length).toBeGreaterThan(0);
    expect(p.g.ellipse).toHaveBeenCalled();
  });
});
