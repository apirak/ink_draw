import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('main', () => {
  let rafSpy: any;

  beforeEach(() => {
    vi.resetModules();

    // DOM mocks
    document.body.innerHTML = '';
    document.body.dataset.mode = 'birds';

    const makeCanvas = () => {
      const c = document.createElement('canvas');
      const ctx = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        lineTo: vi.fn(),
        transform: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        setTransform: vi.fn(),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      } as unknown as CanvasRenderingContext2D;
      c.getContext = (() => ctx) as unknown as typeof c.getContext;
      return c;
    };

    const bg = makeCanvas();
    const trail = makeCanvas();
    const main = makeCanvas();
    bg.id = 'bg';
    trail.id = 'trail';
    main.id = 'main';

    const brush = document.createElement('div');
    brush.id = 'brush';

    const tuner = document.createElement('aside');
    tuner.id = 'tuner';

    const ids = ['tnMode', 'sCount', 'vCount', 'sFov', 'vFov', 'sSep', 'vSep', 'sAli', 'vAli', 'sCoh', 'vCoh', 'tnReset'];
    for (const id of ids) {
      const el = id.startsWith('s') ? document.createElement('input') : document.createElement('span');
      el.id = id;
      document.body.appendChild(el);
    }

    document.body.append(bg, trail, main, brush, tuner);

    // Window / media mocks
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });

    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    window.addEventListener = vi.fn(window.addEventListener);

    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes canvas sizes and draws the background', async () => {
    const mod = await import('./main');

    expect(mod.W).toBe(1024);
    expect(mod.H).toBe(768);

    const bg = document.getElementById('bg') as HTMLCanvasElement;
    expect(bg.width).toBe(1024);
    expect(bg.height).toBe(768);

    const ctx = bg.getContext('2d')!;
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 1024, 768);
  });

  it('exposes runtime globals', async () => {
    const mod = await import('./main');

    expect((globalThis as any).W).toBe(mod.W);
    expect((globalThis as any).H).toBe(mod.H);
    expect((globalThis as any).mode).toBe('birds');
    expect(Array.isArray((globalThis as any).agents)).toBe(true);
  });

  it('registers a resize listener', async () => {
    await import('./main');
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('starts the animation loop', async () => {
    await import('./main');
    expect(rafSpy).toHaveBeenCalled();
  });
});
