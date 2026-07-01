import p5 from 'p5';
import * as brush from 'p5.brush';
import type { Agent } from '../agents';
import { makeAgent, reseed } from '../agents';
import { drawBackground } from './background';
import { drawBursts, drawRipples, initBurstPool, initBurstTuner, inkBurst } from './effects';
import { MODES, type ModeConfig, type ModeName } from '../modes';
import { update } from '../physics';
import { drawBird, drawHerd, drawKoi } from './renderers';
import { paintTrail, stamps } from './trail';
import { initTuner } from '../tuner';
import { initKoiTuner } from './koi-tuner';
import type { PointerState } from '../target';

const DPR = Math.min(window.devicePixelRatio || 1, 2);

new p5((p: any) => {
  let W = 0;
  let H = 0;
  let bgLayer: any = null;
  const mode: ModeName = (document.body.dataset.mode as ModeName) ?? 'birds';
  const M: ModeConfig = MODES[mode];
  let morph = 1;
  const MAX = 110;
  const agents: Agent[] = [];
  const ripples: { x: number; y: number; r: number; max: number; a?: number; tint?: (a: number) => string }[] = [];
  const bounds = { w: W, h: H };
  const ptr: PointerState = {
    x: innerWidth / 2,
    y: innerHeight / 2,
    lastMove: 0,
    down: false,
  };

  const brushEl = document.getElementById('brush')!;

  function redrawBackground() {
    if (mode === 'birds') {
      // ponytail: WEBGL p5.Graphics so p5.brush addon inits; main canvas stays 2D for koi clip path
      bgLayer = p.createGraphics(W, H, p.WEBGL);
      bgLayer.pixelDensity?.(DPR);
      brush.load(bgLayer);
      brush.scaleBrushes(6);
      drawBackground(bgLayer, W, H, mode);
      brush.load();
    } else {
      bgLayer = p.createGraphics(W, H);
      bgLayer.pixelDensity?.(DPR);
      drawBackground(bgLayer, W, H, mode);
    }
  }

  function resize() {
    W = innerWidth;
    H = innerHeight;
    bounds.w = W;
    bounds.h = H;
    p.resizeCanvas(W, H);
    redrawBackground();
  }

  p.setup = () => {
    W = innerWidth;
    H = innerHeight;
    // ponytail: p5.brush needs the main p5 instance on a WEBGL canvas;
    // birds uses WEBGL, koi/herd stay 2D for drawingContext.clip paths
    const isWebgl = mode === 'birds';
    if (isWebgl) brush.instance(p);
    p.createCanvas(W, H, isWebgl ? p.WEBGL : p.P2D).parent('p5-host');
    p.pixelDensity(DPR);
    bounds.w = W;
    bounds.h = H;
    redrawBackground();
    // ponytail: pre-warm WEBGL burst buffers — otherwise per-click createGraphics hitches the main thread
    if (mode === 'birds') {
      initBurstPool(p);
      initBurstTuner();
    }

    for (let i = 0; i < MAX; i++) agents.push(makeAgent(i, mode, bounds));
    reseed(agents, mode, M);
    ptr.lastMove = -1e5;
    initTuner(mode, M, agents.length);
    if (mode === 'koi') initKoiTuner();

    addEventListener('resize', resize);
  };

  let lastRippleAt = 0;
  addEventListener(
    'pointermove',
    (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.lastMove = performance.now();
      brushEl.style.left = e.clientX + 'px';
      brushEl.style.top = e.clientY + 'px';
      if (mode === 'koi' && performance.now() - lastRippleAt > 300) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          r: 4,
          max: 70 + Math.random() * 50,
          a: 0.22,
          tint: (a: number) => `rgba(108,166,196,${a})`,
        });
        lastRippleAt = performance.now();
      }
    },
    { passive: true },
  );

  addEventListener('pointerdown', (e) => {
    ptr.down = true;
    brushEl.classList.add('down');
    inkBurst(e.clientX, e.clientY, mode, agents, stamps, ripples);
  });

  addEventListener('pointerup', () => {
    ptr.down = false;
    brushEl.classList.remove('down');
  });

  let last = performance.now();
  const koiPanel = document.getElementById('koi-panel');
  const frozen: PointerState = { x: 0, y: 0, lastMove: -1e5, down: false };

  p.draw = () => {
    const t = performance.now();
    let dt = (t - last) / 16.667;
    last = t;
    if (dt > 3) dt = 3;

    // WEBGL main: origin center → shift to top-left so all existing coords apply
    if (mode === 'birds') p.translate(-W / 2, -H / 2);

    morph = Math.min(morph + 0.022 * dt, 1);

    const activePtr = koiPanel && !koiPanel.classList.contains('hidden') ? frozen : ptr;
    update(t, dt, mode, M, agents, bounds, activePtr, performance.now());

    p.clear();
    if (bgLayer) p.image(bgLayer, 0, 0, W, H);
    paintTrail(p, W, H, M, agents, mode);
    drawBursts(p);
    drawRipples(p, ripples);

    const order = agents.slice(0, M.count);
    if (mode === 'birds') {
      order.sort((a, b) => a.z - b.z);
      for (const a of order) drawBird(p, a, t, morph);
    } else if (mode === 'herd') {
      order.sort((a, b) => a.y - b.y);
      for (const a of order) drawHerd(p, a, t, morph);
    } else {
      order.sort((a, b) => a.size - b.size);
      for (const a of order) drawKoi(p, a, t, morph);
    }
  };
});
