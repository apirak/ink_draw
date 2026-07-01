import { describe, expect, it, vi, beforeEach } from 'vitest';
import { makeAgent } from '../agents';
import { MODES } from '../modes';
import { paintTrail, stamps } from './trail';

function mockP(): any {
  return {
    noStroke: vi.fn(),
    fill: vi.fn(),
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    ellipse: vi.fn(),
  };
}

describe('paintTrail', () => {
  beforeEach(() => {
    stamps.length = 0;
  });

  it('calls noStroke on the main canvas', () => {
    const p = mockP();
    const agents: any[] = [];
    paintTrail(p, 800, 600, MODES.birds, agents, 'birds');

    expect(p.noStroke).toHaveBeenCalled();
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

  it('keeps live stamps and paints them directly on the main canvas', () => {
    const p = mockP();
    const a = makeAgent(0, 'birds', { w: 800, h: 600 });
    a.size = 10;
    a.z = 1;
    const agents = [a];
    paintTrail(p, 800, 600, MODES.birds, agents, 'birds');

    expect(stamps.length).toBeGreaterThan(0);
    expect(p.ellipse).toHaveBeenCalled();
  });
});
