import { describe, expect, it, vi } from 'vitest';

function mountDom() {
  document.body.innerHTML = '<div id="p5-host"></div><div id="tuner"><span id="tnMode"></span><input id="sCount"><input id="sFov"><span id="vCount"></span><span id="vFov"></span><input id="sSep"><span id="vSep"></span><input id="sAli"><span id="vAli"></span><input id="sCoh"><span id="vCoh"></span><span id="tnReset"></span></div><div id="brush"></div>';
}

function gradient() {
  return { addColorStop: vi.fn() };
}

function mockP(width = 0, height = 0): any {
  return {
    width,
    height,
    clear: vi.fn(),
    background: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    strokeWeight: vi.fn(),
    noStroke: vi.fn(),
    noFill: vi.fn(),
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    applyMatrix: vi.fn(),
    beginShape: vi.fn(),
    endShape: vi.fn(),
    vertex: vi.fn(),
    quadraticVertex: vi.fn(),
    curveVertex: vi.fn(),
    ellipse: vi.fn(),
    circle: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    image: vi.fn(),
    frameRate: vi.fn(),
    pixelDensity: vi.fn(),
    resizeCanvas: vi.fn(),
    drawingContext: {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn(() => gradient()),
      createLinearGradient: vi.fn(() => gradient()),
    },
    CLOSE: 'close',
    noLoop: vi.fn(),
    loop: vi.fn(),
  };
}

describe('p5 main', () => {
  it('smoke: createCanvas called during setup', async () => {
    vi.resetModules();
    mountDom();

    const createCanvas = vi.fn(() => ({ parent: vi.fn() }));
    const mockP5 = vi.fn((sketch: (p: any) => void) => {
      const p = mockP();
      p.createCanvas = createCanvas;
      p.createGraphics = vi.fn((w: number, h: number) => mockP(w, h));
      sketch(p);
      if (p.setup) p.setup();
      return p;
    });

    vi.doMock('p5', () => ({ default: mockP5 }));
    await import('./main');

    expect(createCanvas).toHaveBeenCalled();
  });

  it('composes a full-size background layer before the trail layer each frame', async () => {
    vi.resetModules();
    mountDom();

    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });

    const graphics: any[] = [];
    let instance: any;
    const mockP5 = vi.fn((sketch: (p: any) => void) => {
      const p = mockP();
      p.createCanvas = vi.fn(() => ({ parent: vi.fn() }));
      p.createGraphics = vi.fn((w: number, h: number) => {
        const g = mockP(w, h);
        graphics.push(g);
        return g;
      });
      sketch(p);
      if (p.setup) p.setup();
      instance = p;
      return p;
    });

    vi.doMock('p5', () => ({ default: mockP5 }));
    await import('./main');

    instance.draw();

    const backgroundLayer = graphics.find((g) => g.width === 1024 && g.height === 768);
    expect(backgroundLayer).toBeTruthy();
    expect(instance.image.mock.calls[0]).toEqual([backgroundLayer, 0, 0, 1024, 768]);
    expect(instance.image.mock.calls[1][0].width).toBe(1024);
    expect(instance.image.mock.calls[1][0].height).toBe(768);
  });
});
