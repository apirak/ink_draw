import { describe, expect, it, vi } from 'vitest';

describe('p5 main', () => {
  it('smoke: createCanvas called during setup', async () => {
    document.body.innerHTML = '<div id="tuner"><span id="tnMode"></span><input id="sCount"><input id="sFov"><span id="vCount"></span><span id="vFov"></span><input id="sSep"><span id="vSep"></span><input id="sAli"><span id="vAli"></span><input id="sCoh"><span id="vCoh"></span><span id="tnReset"></span></div><div id="brush"></div>';

    const createCanvas = vi.fn(() => ({ parent: vi.fn() }));
    const mockP5 = vi.fn((sketch: (p: any) => void) => {
      const p: any = {
        createCanvas,
        createGraphics: vi.fn(() => ({ clear: vi.fn(), fill: vi.fn(), ellipse: vi.fn(), push: vi.fn(), pop: vi.fn(), translate: vi.fn(), rotate: vi.fn() })),
        background: vi.fn(),
        clear: vi.fn(),
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
          createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
          createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        },
        CLOSE: 'close',
        noLoop: vi.fn(),
        loop: vi.fn(),
      };
      sketch(p);
      if (p.setup) p.setup();
      return p;
    });

    vi.doMock('p5', () => ({ default: mockP5 }));
    await import('./main');

    expect(createCanvas).toHaveBeenCalled();
  });
});
