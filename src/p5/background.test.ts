import { describe, expect, it, vi } from 'vitest';
import { drawBackground } from './background';

function mockP(): any {
  const shape: any[] = [];
  return {
    width: 800,
    height: 600,
    clear: vi.fn(),
    background: vi.fn(),
    noStroke: vi.fn(),
    stroke: vi.fn(),
    strokeWeight: vi.fn(),
    noFill: vi.fn(),
    fill: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    circle: vi.fn(),
    ellipse: vi.fn(),
    beginShape: vi.fn(() => (shape.length = 0)),
    endShape: vi.fn(),
    vertex: vi.fn((x: number, y: number) => shape.push({ x, y })),
    curveVertex: vi.fn((x: number, y: number) => shape.push({ x, y })),
    quadraticVertex: vi.fn(),
    bezierVertex: vi.fn(),
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    applyMatrix: vi.fn(),
    CLOSE: 'close',
    color: vi.fn((r: number, g?: number, b?: number, a?: number) => ({ r, g, b, a })),
    lerpColor: vi.fn((a: any, b: any, t: number) => ({ a, b, t })),
    createGraphics: vi.fn(() => mockP()),
    drawingContext: {
      createRadialGradient: vi.fn(() => gradient()),
      createLinearGradient: vi.fn(() => gradient()),
    },
  };
}

function gradient() {
  return { addColorStop: vi.fn() };
}

describe('drawBackground', () => {
  it('clears the full canvas', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.clear).toHaveBeenCalledTimes(1);
  });

  it('paints the paper base and mountains in birds mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.background).toHaveBeenCalled();
    expect(p.rect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(p.line).toHaveBeenCalled();
    expect(p.beginShape).toHaveBeenCalled();
  });

  it('draws a simple flat sun in birds mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.circle).toHaveBeenCalled();
  });

  it('draws koi water ripples and pads in koi mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'koi');
    expect(p.stroke).toHaveBeenCalled();
    expect(p.ellipse).toHaveBeenCalled();
  });

  it('draws the savannah pool, trees, and grass in herd mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'herd');
    expect(p.fill).toHaveBeenCalled();
    expect(p.stroke).toHaveBeenCalled();
  });
});
