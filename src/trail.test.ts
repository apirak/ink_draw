import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Agent } from './agents';
import { INK, KOI_ORANGE, MODES, type ModeConfig } from './modes';
import { paintTrail, stamps } from './trail';

function mockCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillStyle: '',
    beginPath: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    x: 100,
    y: 100,
    vx: 2,
    vy: 0,
    z: 1,
    size: 10,
    phase: 0,
    flapSpeed: 1,
    density: 0.8,
    hasRed: false,
    koiKind: { body: INK, patch: KOI_ORANGE, sumi: true },
    koiSpots: 0,
    face: 1,
    sepF: 1,
    spd: 1,
    rDrift: 0,
    rPhase: 0,
    orbitA: 0,
    orbitR: 0,
    orbitSpin: 0.01,
    laneY: 0,
    hist: [],
    ...overrides,
  };
}

describe('paintTrail', () => {
  beforeEach(() => {
    stamps.length = 0;
  });

  it('creates bird trail stamps every third frame', () => {
    const ctx = mockCtx();
    const M: ModeConfig = { ...MODES.birds, count: 3 };
    const agents = [makeAgent(), makeAgent(), makeAgent()];

    paintTrail(ctx, 800, 600, M, agents, 'birds');

    // Every (i + frame) % 3 === 0 agent emits one stamp
    expect(stamps.length).toBeGreaterThan(0);
    expect(stamps.length).toBeLessThanOrEqual(3);
    expect(stamps[0].life).toBe(20);
  });

  it('creates koi stamps tinted by the koi patch color', () => {
    const ctx = mockCtx();
    const M: ModeConfig = { ...MODES.koi, count: 1 };
    const agents = [makeAgent({ koiKind: { body: INK, patch: KOI_ORANGE, sumi: false } })];

    // frame advances; koi emits when (i + frame) % 3 === 0
    stamps.length = 0;
    for (let n = 0; n < 3; n++) paintTrail(ctx, 800, 600, M, agents, 'koi');

    expect(stamps.length).toBeGreaterThan(0);
    expect(stamps[0].tint).toBe(KOI_ORANGE);
    expect(stamps[0].life).toBe(100);
  });

  it('creates herd dust stamps only when moving fast', () => {
    const ctx = mockCtx();
    const M: ModeConfig = { ...MODES.herd, count: 2 };
    const slow = makeAgent({ vx: 0.1, vy: 0 });
    const fast = makeAgent({ vx: 3, vy: 0 });

    // advance frame until a fast agent's index aligns with the frame
    stamps.length = 0;
    for (let n = 0; n < 3; n++) paintTrail(ctx, 800, 600, M, [slow, fast], 'herd');

    expect(stamps.some((s) => s.sepia)).toBe(true);
  });

  it('ages and removes dead stamps', () => {
    const ctx = mockCtx();
    stamps.push({ x: 0, y: 0, rx: 1, ry: 1, rot: 0, a0: 1, age: 19, life: 20 });
    const M: ModeConfig = { ...MODES.birds, count: 0 };

    paintTrail(ctx, 800, 600, M, [], 'birds');

    expect(stamps).toHaveLength(0);
  });

  it('clears the trail canvas each frame', () => {
    const ctx = mockCtx();
    const M: ModeConfig = { ...MODES.birds, count: 0 };
    paintTrail(ctx, 800, 600, M, [], 'birds');
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });
});
