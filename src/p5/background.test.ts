import { beforeEach, describe, expect, it, vi } from 'vitest';

// ponytail: stub p5.brush — WebGL lib inits only in real browser
vi.mock('p5.brush', () => ({
  instance: vi.fn(),
  load: vi.fn(),
  scaleBrushes: vi.fn(),
  set: vi.fn(),
  pick: vi.fn(),
  stroke: vi.fn(),
  strokeWeight: vi.fn(),
  noStroke: vi.fn(),
  fill: vi.fn(),
  noFill: vi.fn(),
  wash: vi.fn(),
  noWash: vi.fn(),
  fillBleed: vi.fn(),
  fillTexture: vi.fn(),
  hatch: vi.fn(),
  noHatch: vi.fn(),
  noField: vi.fn(),
  field: vi.fn(),
  wiggle: vi.fn(),
  line: vi.fn(),
  flowLine: vi.fn(),
  rect: vi.fn(),
  circle: vi.fn(),
  arc: vi.fn(),
  polygon: vi.fn(),
  spline: vi.fn(),
  beginShape: vi.fn(),
  vertex: vi.fn(),
  endShape: vi.fn(),
}));

import * as brush from 'p5.brush';
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
    arc: vi.fn(),
    PIE: 'pie',
    beginShape: vi.fn(() => (shape.length = 0)),
    endShape: vi.fn(),
    vertex: vi.fn((x: number, y: number) => shape.push({ x, y })),
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    applyMatrix: vi.fn(),
    CLOSE: 'close',
    WEBGL: 'webgl',
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('drawBackground', () => {
  it('clears the full canvas', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.clear).toHaveBeenCalledTimes(1);
  });

  it('paints the paper base for birds mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.background).toHaveBeenCalledWith('#f2ecdd');
    expect(p.translate).toHaveBeenCalledWith(-400, -300);
  });

  it('paints four mountain layers and a sun circle via p5.brush in birds mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(brush.polygon).toHaveBeenCalledTimes(4);
    expect(brush.fill).toHaveBeenCalledWith('#2b2723', expect.any(Number));
    expect(brush.fillTexture).toHaveBeenCalled();
    expect(brush.circle).toHaveBeenCalledTimes(1);
    expect(brush.circle).toHaveBeenCalledWith(800 * 0.78, 600 * 0.22, expect.any(Number));
  });

  it('does not call canvas gradients in birds mode', () => {
    const p = mockP();
    drawBackground(p, 800, 600, 'birds');
    expect(p.fill).not.toHaveBeenCalled();
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
