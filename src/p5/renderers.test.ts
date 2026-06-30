import { describe, expect, it, vi } from 'vitest';
import { makeAgent } from '../agents';
import { drawBird, drawKoi, drawHerd } from './renderers';

function mockP(): any {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    applyMatrix: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    strokeWeight: vi.fn(),
    noStroke: vi.fn(),
    noFill: vi.fn(),
    beginShape: vi.fn(),
    endShape: vi.fn(),
    vertex: vi.fn(),
    bezierVertex: vi.fn(),
    ellipse: vi.fn(),
    line: vi.fn(),
    CLOSE: 'close',
    drawingContext: {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    },
  };
}

describe('drawBird', () => {
  it('draws body, head, tail and two wings', () => {
    const p = mockP();
    const a = makeAgent(0, 'birds', { w: 800, h: 600 });
    a.x = 400;
    a.y = 300;
    drawBird(p, a, 0, 1);

    expect(p.push).toHaveBeenCalled();
    expect(p.pop).toHaveBeenCalled();
    expect(p.ellipse).toHaveBeenCalled();
  });
});

describe('drawKoi', () => {
  it('draws a body polygon with spots and fins', () => {
    const p = mockP();
    const a = makeAgent(0, 'koi', { w: 800, h: 600 });
    a.x = 400;
    a.y = 300;
    a.hist.push({ x: 390, y: 300 }, { x: 380, y: 300 }, { x: 370, y: 300 });
    drawKoi(p, a, 0, 1);

    expect(p.beginShape).toHaveBeenCalled();
    expect(p.vertex).toHaveBeenCalled();
    expect(p.ellipse).toHaveBeenCalled();
  });
});

describe('drawHerd', () => {
  it('draws shadow and body from above', () => {
    const p = mockP();
    const a = makeAgent(0, 'herd', { w: 800, h: 600 });
    a.x = 400;
    a.y = 300;
    drawHerd(p, a, 0, 1);

    expect(p.push).toHaveBeenCalled();
    expect(p.ellipse).toHaveBeenCalled();
  });
});
